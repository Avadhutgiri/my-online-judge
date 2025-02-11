import os
import shutil
import subprocess
import logging
import re
import base64

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)


def decode(encoded_str):
    return base64.b64decode(encoded_str).decode('utf-8')


# Language configuration
LANGUAGE_CONFIG = {
    "python": {
        "extension": ".py",
        "image": "python:3.9-alpine",
        "run_command": "python {filename}",
        "timeout": 5,
        "memory_limit": 256,  # MB
    },
    "cpp": {
        "extension": ".cpp",
        "image": "gcc:latest",
        "compile_cmd": "g++ -o {exec_name} {filename}",
        "run_command": "./{exec_name}",
        "timeout": 3,
        "memory_limit": 256,  # MB
    },
    "java": {
        "extension": ".java",
        "image": "openjdk:11-jdk",
        "compile_cmd": "javac {filename}",
        "run_command": "java {classname}",
        "timeout": 5,
        "memory_limit": 256,  # MB
    },
}


# Helper functions
def prepare_submission_directory(submission_id):
    work_dir = os.path.join(os.getcwd(), "submissions",
                            f"submission_{submission_id}")
    os.makedirs(work_dir, exist_ok=True)
    os.makedirs(os.path.join(work_dir, "inputs"), exist_ok=True)
    os.makedirs(os.path.join(work_dir, "outputs"), exist_ok=True)
    os.makedirs(os.path.join(work_dir, "expected_outputs"), exist_ok=True)
    return work_dir


def cleanup_submission_directory(submission_id):
    work_dir = os.path.join(os.getcwd(), "submissions",
                            f"submission_{submission_id}")
    if os.path.exists(work_dir):
        shutil.rmtree(work_dir)


def validate_and_configure(language):
    if language not in LANGUAGE_CONFIG:
        return None, {"status": "failed", "message": "Unsupported Programming Language"}
    return LANGUAGE_CONFIG[language], None


def extract_java_classname(code):
    """Extracts the public class name from Java code."""
    match = re.search(r"public\s+class\s+(\w+)", code)
    if match:
        return match.group(1)
    else:
        raise ValueError("No public class found in Java code.")


def compile_code(work_dir, filename, exec_name, language):
    if language not in ["cpp", "java"]:
        return {"status": "success"}

    config = LANGUAGE_CONFIG[language]
    compile_cmd = config["compile_cmd"].format(
        exec_name=exec_name, filename=filename)
    try:
        subprocess.run(
            compile_cmd, shell=True, check=True,
            cwd=work_dir, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
        )
        return {"status": "success"}
    except subprocess.CalledProcessError as e:
        return {"status": "compilation_error", "message": e.stderr.decode()}


def execute_code_in_docker(
    work_dir, run_cmd, input_file, output_file, image, timeout, memory_limit
):
    input_file_rel = os.path.relpath(input_file, work_dir)
    output_file_rel = os.path.relpath(output_file, work_dir)
    # print(input_file_rel, output_file_rel)
    docker_cmd = [
        "docker", "run", "--rm", "-v", f"--memory={memory_limit}m", "--cpus=1",
        "-v", f"{work_dir}:/app:z", "-w", "/app", image, "sh", "-ec",
        f"timeout {timeout}s {run_cmd} < {input_file_rel} > {output_file_rel} 2>&1",
    ]

    logging.info(f"Executing Docker command: {' '.join(docker_cmd)}")
    try:
        result = subprocess.run(docker_cmd, stdout=subprocess.PIPE,
                                stderr=subprocess.PIPE, timeout=timeout, shell=False)

        if result.returncode == 137:
            return {
                "status": "memory_limit_exceeded",
                "message": "Memory Limit Exceeded",
            }
        if result.stderr.decode().strip():
            return {
                "status": "Runtime Error",
                "message": result.stderr.decode().strip(),
            }
        return {"status": "success"}
    except subprocess.TimeoutExpired:
        return {"status": "Time Limit Exceeded", "message": "Time Limit Exceeded"}


def prepare_inputs_and_outputs(input_path, work_dir):
    for file in os.listdir(input_path):
        if file.startswith("input") and file.endswith(".txt"):
            shutil.copy(
                os.path.join(input_path, file), os.path.join(
                    work_dir, "inputs")
            )
        if file.startswith("output") and file.endswith(".txt"):
            shutil.copy(
                os.path.join(input_path, file),
                os.path.join(work_dir, "expected_outputs"),
            )

    test_case_paths = [
        os.path.join(work_dir, "inputs", file)
        for file in sorted(os.listdir(os.path.join(work_dir, "inputs")))
    ]
    expected_output_paths = [
        os.path.join(work_dir, "expected_outputs", file)
        for file in sorted(os.listdir(os.path.join(work_dir, "expected_outputs")))
    ]

    if len(test_case_paths) != len(expected_output_paths):
        return None, {
            "status": "failed",
            "message": "Test case and output file count mismatch",
        }

    return (test_case_paths, expected_output_paths), None


def execute_reference_solution(ref_solution_path, work_dir, input_file):
    """Compiles and executes the reference solution inside Docker."""

    # Copy the reference solution to the working directory
    solution_file = os.path.join(work_dir, "solution.cpp")
    shutil.copy(ref_solution_path, solution_file)

    # Compile the reference solution inside the working directory
    compile_cmd = "g++ -o solution_exec solution.cpp"
    logging.info(f"Compiling reference solution with command: {compile_cmd}")

    compile_result = subprocess.run(
        compile_cmd,
        shell=True,
        cwd=work_dir,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )

    if compile_result.returncode != 0:
        logging.error(f"Compilation failed. Error: {compile_result.stderr.decode()}")
        return compile_result.stderr.decode().strip()

    logging.info("Compilation successful.")

    # Use relative paths inside Docker
    input_file_relative = os.path.relpath(input_file, work_dir)

    # Run the compiled executable inside Docker
    docker_cmd = [
        "docker",
        "run",
        "--rm",
        "-v",
        f"{work_dir}:/app:z",
        "-w",
        "/app",
        "gcc:latest",
        "sh",
        "-c",
        f"./solution_exec < {input_file_relative}",
    ]

    logging.info(f"Executing reference solution with Docker: {' '.join(docker_cmd)}")

    result = subprocess.run(
        docker_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    if result.returncode != 0:
        logging.error(
            f"Reference solution execution failed. Error: {result.stderr.decode()}"
        )
        return result.stderr.decode().strip()

    # Return the solution's output
    return result.stdout.decode().strip()


# Main run function
def run(submission_id, code, language, problem_id, event_name, inputData=None):
    try:
        print(problem_id)
        code = decode(code)
        if not isinstance(problem_id, str):
            problem_id = str(problem_id)

        logging.info(f"Starting Run for Submission ID: {submission_id}, Event: {event_name}")

        # Prepare the submission directory
        work_dir = prepare_submission_directory(submission_id)
        classname = None

        input_file = os.path.join(work_dir, "inputs", "custom_input.txt")
        if inputData is None:
            sample_input_path = os.path.join(
                "problems", problem_id, "sample.txt")
            if not os.path.exists(sample_input_path):
                return {"status": "failed", "user_output": "Sample input file not found."}

            logging.info(f"Reading sample input from {sample_input_path}")
            with open(sample_input_path, "r") as sample_file:
                inputData = sample_file.read()

        # Save input data to file
        logging.info("Saving custom input data")
        with open(input_file, "w") as f:
            f.write(inputData)

        # Check for Reverse Coding with empty code
        if event_name == "Reverse Coding" and not code.strip():
            logging.info(
                "User code is empty; returning only expected output for Reverse Coding.")
            ref_path = os.path.join("problems", problem_id, "solution.cpp")
            logging.info(f"Executing reference solution: {ref_path}")
            expected_output = execute_reference_solution(
                ref_path, work_dir, input_file)
            return {
                "expected_output": expected_output
            }

        config, error = validate_and_configure(language)
        if error:
            return {"status": "Failed", "user_output": "Unsupported programming language."}

        # Save and compile user code
        if language == "java":
            classname = extract_java_classname(code)
            if not classname:
                return {"status": "Compilation Error", "user_output": "No public class found in Java code."}

            filename = f"{classname}{config['extension']}"
            exec_name = classname  # For Java, the exec name is the classname
        else:
            filename = f"submission_{submission_id}{config['extension']}"
        exec_name = f"submission_{submission_id}_exec"

        code_file_path = os.path.join(work_dir, filename)
        with open(code_file_path, "w") as f:
            f.write(code)

        logging.info("Compiling user code if necessary")
        compile_result = compile_code(work_dir, filename, exec_name, language)
        if compile_result["status"] != "success":
            logging.warning("User code compilation failed.")
            expected_output = None
            if event_name == "Reverse Coding":
                ref_path = os.path.join("problems", problem_id, "solution.cpp")
                logging.info(f"Executing reference solution: {ref_path}")
                print(ref_path, work_dir, input_file)
                expected_output = execute_reference_solution(
                    ref_path, work_dir, input_file)
            return {
                "status": "Compilation Error",
                "user_output": compile_result.get("message", "Compilation failed."),
                "expected_output": expected_output
            }

        # Execute user's code
        output_file = os.path.join(work_dir, "outputs", "custom_output.txt")
        run_cmd = config["run_command"]
        if language == "java":
            run_cmd = config["run_command"].format(classname=classname)
        elif language == "cpp":
            run_cmd = config["run_command"].format(exec_name=exec_name)
        else:
            run_cmd = config["run_command"].format(filename=filename)

        logging.info(f"Formatted Run Command: {run_cmd}")
        exec_result = execute_code_in_docker(
            work_dir,
            run_cmd,
            input_file,
            output_file,
            config["image"],
            config["timeout"],
            config["memory_limit"],
        )

        # Handle execution errors
        if exec_result["status"] != "success":
            logging.warning(f"User code execution failed with status: {exec_result['status']}")
            expected_output = None
            if event_name == "Reverse Coding":
                expected_output = execute_reference_solution(os.path.join(
                    "problems", problem_id, "solution.cpp"), work_dir, input_file)
            return {
                "status": exec_result["status"],
                "user_output": exec_result.get("message", "An error occurred during execution."),
                "expected_output": expected_output
            }

        # Read and return the user's output
        logging.info("Reading user output")
        with open(output_file, "r") as f_out:
            user_output = f_out.read().strip()

        # Return results based on the event type
        if event_name == "Reverse Coding":
            expected_output = execute_reference_solution(os.path.join(
                "problems", problem_id, "solution.cpp"), work_dir, input_file)
            return {
                "status": "executed_successfully",
                "user_output": user_output,
                "expected_output": expected_output
            }

        # For Clash event, return just the user's output
        return {"status": "executed_successfully", "user_output": user_output}

    except Exception as e:
        logging.error(f"An error occurred during execution: {e}")
        return {"status": "failed", "user_output": str(e)}

    finally:
        logging.info("Cleaning up submission directory")
        cleanup_submission_directory(submission_id)


# Submit function
def submit(submission_id, code, language, problem_id, input_path, java_classname=None):
    try:
        result = {
            "status": "Accepted",
            "message": None,
            "failed_test_case": None
        }
        code = decode(code)

        if not isinstance(problem_id, str):
            problem_id = str(problem_id)

        config, error = validate_and_configure(language)
        if error:
            result.update(
                {"status": "failed", "message": "Unsupported Programming Language"})
            return result

        work_dir = prepare_submission_directory(submission_id)
        if language == "java":
            classname = java_classname or extract_java_classname(code)

            if not classname:
                result.update(
                    {"status": "failed", "message": "No public class found in Java code."})
            filename = f"{classname}.java"
        else:
            filename = f"submission_{submission_id}{config['extension']}"

        exec_name = f"submission_{submission_id}_exec"
        with open(os.path.join(work_dir, filename), "w") as f:
            f.write(code)

        compile_result = compile_code(work_dir, filename, exec_name, language)
        if compile_result["status"] != "success":
            result.update({"status": "compilation_error", "message": compile_result.get("message", "Compilation failed.")})

        (test_case_paths, expected_output_paths), error = prepare_inputs_and_outputs(
            input_path, work_dir
        )
        if error:
            result.update({"status": "failed", "message": error["message"]})

            return result

        for i, (test_case, expected_output) in enumerate(
            zip(test_case_paths, expected_output_paths)
        ):
            output_file = os.path.join(work_dir, "outputs", f"output{i}.txt")
            if language == "java":
                run_cmd = config["run_command"].format(classname=classname)
            elif language == "cpp":
                run_cmd = config["run_command"].format(exec_name=exec_name)
            else:
                run_cmd = config["run_command"].format(filename=filename)

            exec_result = execute_code_in_docker(
                work_dir,
                run_cmd,
                test_case,
                output_file,
                config["image"],
                config["timeout"],
                config["memory_limit"],
            )

            if exec_result["status"] != "success":
                result.update({
                    "status": "failed",
                    "test_case": f"Test Case {i + 1}",
                    "message": f"Execution failed: {exec_result['message']}",
                })
                return result

            with open(output_file, "r") as f_out, open(expected_output, "r") as f_exp:
                user_output = f_out.read().strip()
                expected = f_exp.read().strip()
                if user_output != expected:
                    result.update({
                        "test_case": f"Test Case {i + 1}",
                        "status": "Wrong Answer",
                    })
                    return result

        return result

    except Exception as e:
        logging.error(f"An error occurred during submission: {e}")
        result.update({"status": "failed", "message": str(e)})
        return result

    finally:
        cleanup_submission_directory(submission_id)
