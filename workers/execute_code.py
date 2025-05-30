import os
import shutil
import subprocess
import logging
import re
import base64
import time

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)


def decode(encoded_str):
    return base64.b64decode(encoded_str).decode('utf-8')


# base_dir = "/home/thefallenone/online-judge-backend/"
base_dir = os.getenv('BASE_DIR', '/home/phoenix-heart/Online-judge/online-judge-backend')
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
        "image": "openjdk:17-jdk-slim",
        "compile_cmd": "javac {filename}",
        "run_command": "java {classname}",
        "timeout": 5,
        "memory_limit": 256,  # MB
    }
}


# Helper functions
def prepare_submission_directory(submission_id):
    work_dir = os.path.join(os.getcwd(), "submissions", f"submission_{submission_id}")
    os.makedirs(work_dir, exist_ok=True)
    os.makedirs(os.path.join(work_dir, "inputs"), exist_ok=True)
    os.makedirs(os.path.join(work_dir, "outputs"), exist_ok=True)
    os.makedirs(os.path.join(work_dir, "expected_outputs"), exist_ok=True)
    return work_dir


def cleanup_submission_directory(submission_id):
    work_dir = os.path.join(os.getcwd(), "submissions", f"submission_{submission_id}")
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

    # Java Compilation Fix: Don't use exec_name in compile_cmd
    if language == "java":
        compile_cmd = config["compile_cmd"].format(filename=filename)
    else:
        compile_cmd = config["compile_cmd"].format(exec_name=exec_name, filename=filename)

    try:
        logging.info(f"Compiling {language} file: {filename} in {work_dir}")

        subprocess.run(compile_cmd, shell=True, check=True, cwd=work_dir,
                      stdout=subprocess.PIPE, stderr=subprocess.PIPE,)
        return {"status": "success"}
    except subprocess.CalledProcessError as e:
        logging.error(f"Compilation failed for {language}: {e.stderr.decode()}")
        return {"status": "compilation_error", "message": e.stderr.decode()}


def execute_code_in_docker(submission_id, work_dir, run_cmd, input_file, output_file, image, timeout, memory_limit):
    input_file_rel = os.path.relpath(input_file, work_dir)
    output_file_rel = os.path.relpath(output_file, work_dir)
    work_dir = os.path.join(base_dir, "submissions", f"submission_{submission_id}")
    container_name = f"submission_{submission_id}_runner"

    docker_cmd = [
        "docker", "run",
        "--rm",
        f"--memory={memory_limit}m", "--cpus=1",
        "--name", container_name,  # Assign a name to the container
        "-v", f"{work_dir}:/app", "-w", "/app", image, "sh", "-c",
        f"timeout {timeout}s {run_cmd} < {input_file_rel} > {output_file_rel} 2>&1;"
    ]

    logging.info(f"Executing Docker command: {' '.join(docker_cmd)}")

    try:
        process = subprocess.Popen(docker_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

        # Wait for process to finish or timeout
        start_time = time.time()
        while process.poll() is None:
            if time.time() - start_time > timeout:
                logging.error(f"Process timeout, force stopping container: {container_name}")
                subprocess.run(["docker", "kill", container_name], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
                return {"status": "Time Limit Exceeded", "message": "Time Limit Exceeded"}
            time.sleep(0.1)

        stdout, stderr = process.communicate()

        # Check for Memory Limit Exceeded (Docker exit code 137 or 'Killed' in stderr)
        stderr_text = stderr.decode().strip()
        if process.returncode == 137 or "Killed" in stderr_text or "Out of memory" in stderr_text:
            return {
                "status": "memory_limit_exceeded",
                "message": "Memory Limit Exceeded",
            }

        if stderr_text:
            return {
                "status": "Runtime Error",
                "message": stderr_text,
            }

        return {"status": "success"}

    except subprocess.TimeoutExpired:
        logging.error(f"Timeout expired, force stopping container: {container_name}")
        subprocess.run(["docker", "kill", container_name], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
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


def execute_reference_solution(problemid, submission_id, work_dir, input_file):
    """Compiles and executes the reference solution inside Docker."""
    try:
        if not isinstance(problemid, str):
            problemid = str(problemid)

        input_file_relative = os.path.relpath(input_file, work_dir)
        work_dir = f"/app/submissions/submission_{submission_id}"
        ref_solution_path = os.path.join(
            "/app/problems", problemid, "solution.cpp")

        if not os.path.exists(ref_solution_path):
            logging.error(
                f"Reference solution file not found: {ref_solution_path}")
            return "[Error] Reference solution not found"

        solution_file = os.path.join(work_dir, "solution.cpp")
        shutil.copy(ref_solution_path, solution_file)

        # Compile the reference solution inside the working directory
        compile_cmd = "g++ -o solution_exec solution.cpp"
        logging.info(
            f"Compiling reference solution with command: {compile_cmd}")

        compile_result = subprocess.run(
            compile_cmd,
            shell=True,
            cwd=work_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )

        if compile_result.returncode != 0:
            logging.error(
                f"Compilation failed. Error: {compile_result.stderr.decode()}")
            return f"[Compilation Error] {compile_result.stderr.decode().strip()}"
        # work_dir = "/home/thefallenone/online-judge-backend/submissions/submission_" + str(submission_id)
        work_dir = os.path.join(base_dir, "submissions",
                               f"submission_{submission_id}")
        logging.info("Compilation successful.")
        logging.info(f"Input file relative path: {input_file_relative}")
        # Run the compiled executable inside Docker
        docker_cmd = [
            "docker", "run", "--rm", "-v",
            f"{work_dir}:/app",
            "-w",
            "/app",
            "gcc:latest",
            "sh",
            "-c",
            f"./solution_exec < {input_file_relative}",
        ]

        logging.info(
            f"Executing reference solution with Docker: {' '.join(docker_cmd)}")

        result = subprocess.run(
            docker_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE
        )

        if result.returncode != 0:
            logging.error(
                f"Reference solution execution failed. Error: {result.stderr.decode()}")
            return f"[Runtime Error] {result.stderr.decode().strip()}"

        # Return the solution's output
        logging.info(
            f"Reference solution executed successfully. Output: {result.stdout.decode().strip()}")
        return result.stdout.decode().strip()

    except Exception as e:
        logging.error(
            f"Unexpected error in execute_reference_solution: {str(e)}")
        return f"[Unexpected Error] {str(e)}"


# Main run function
def run(submission_id, code, language, problem_id, inputData=None):
    try:
        code = decode(code)
        if not isinstance(problem_id, str):
            problem_id = str(problem_id)

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

        logging.info("Saving custom input data")
        with open(input_file, "w") as f:
            f.write(inputData)

        config, error = validate_and_configure(language)
        if error:
            return {"status": "Failed", "user_output": "Unsupported programming language."}

        if language == "java":
            classname = extract_java_classname(code)
            if not classname:
                return {"status": "Compilation Error", "user_output": "No public class found in Java code."}

            filename = f"{classname}{config['extension']}"
            exec_name = classname
        else:
            filename = f"submission_{submission_id}{config['extension']}"
        exec_name = f"submission_{submission_id}_exec"

        code_file_path = os.path.join(work_dir, filename)
        with open(code_file_path, "w") as f:
            f.write(code)

        logging.info("Compiling user code if necessary")
        compile_result = compile_code(work_dir, filename, exec_name, language)
        if compile_result["status"] != "success":
            return {"status": "Compilation Error", "user_output": compile_result.get("message", "Compilation failed.")}
        logging.info("Compilation Successfull")

        output_file = os.path.join(work_dir, "outputs", "custom_output.txt")
        run_cmd = config["run_command"]
        if language == "java":
            run_cmd = config["run_command"].format(classname=classname)
        elif language == "cpp":
            run_cmd = config["run_command"].format(exec_name=exec_name)
        else:
            run_cmd = config["run_command"].format(filename=filename)

        logging.info("We are before execute_code_in_docker")
        logging.info(f"Formatted Run Command: {run_cmd}")
        exec_result = execute_code_in_docker(
            submission_id,
            work_dir,
            run_cmd,
            input_file,
            output_file,
            config["image"],
            config["timeout"],
            config["memory_limit"],
        )
        logging.info("We are after execute_code_in_docker %s",
                     exec_result["status"])
        if exec_result["status"] != "success":
            logging.warning(f"User code execution failed with status")
            return {"status": exec_result["status"],
                    "user_output": exec_result.get("message", "An error occurred during execution.")
                    }

        output_file = os.path.join(
            work_dir, "outputs", "custom_output.txt")

        if not os.path.exists(output_file):
            logging.error(f"Output file missing at {output_file}")
            return {"status": "failed", "user_output": "Output file not found."}

        logging.info("Reading user output")
        with open(output_file, "r") as f_out:
            user_output = f_out.read().strip()
        logging.info(f"User output read successfully {user_output}")

        return {"status": "executed_successfully", "user_output": user_output}

    except Exception as e:
        logging.error(f"An error occurred during execution: {e}")
        return {"status": "failed", "user_output": str(e)}

    finally:
        logging.info("Cleaning up submission directory")
        cleanup_submission_directory(submission_id)


def runSystemcode(submission_id, problem_id, inputData=None):
    try:
        if not isinstance(problem_id, str):
            problem_id = str(problem_id)

        work_dir = prepare_submission_directory(submission_id)

        input_file = os.path.join(work_dir, "inputs", "custom_input.txt")
        if inputData is None:
            sample_input_path = os.path.join(
                "problems", problem_id, "sample.txt")
            if not os.path.exists(sample_input_path):
                return {"status": "failed", "user_output": "Sample input file not found."}

            logging.info(f"Reading sample input from {sample_input_path}")
            with open(sample_input_path, "r") as sample_file:
                inputData = sample_file.read()

        logging.info("Saving custom input data")
        with open(input_file, "w") as f:
            f.write(inputData)

        expected_output = execute_reference_solution(
            problem_id, submission_id, work_dir, input_file)
        return {"status": "executed_successfully", "expected_output": expected_output}

    except Exception as e:
        logging.error(f"An error occurred during execution: {e}")
        return {"status": "failed", "expected_output": str(e)}

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
                return result

            filename = f"{classname}.java"
            exec_name = classname
        else:
            filename = f"submission_{submission_id}{config['extension']}"
            exec_name = f"submission_{submission_id}_exec"
        with open(os.path.join(work_dir, filename), "w") as f:
            f.write(code)

        compile_result = compile_code(work_dir, filename, exec_name, language)
        if compile_result["status"] != "success":
            result.update({"status": "compilation_error", "message": compile_result.get(
                "message", "Compilation failed.")})
            return result

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

            logging.info(f"Executing Test Case {i + 1}...")

            # Run code inside Docker
            exec_result = execute_code_in_docker(
                submission_id,
                work_dir,
                run_cmd,
                test_case,
                output_file,
                config["image"],
                config["timeout"],
                config["memory_limit"],
            )

            # If execution failed, return the error message early
            if exec_result["status"] == "Time Limit Exceeded":
                result.update({
                    "status": "Time Limit Exceeded",
                    "test_case": f"Test Case {i + 1}",
                    "message": f"Time Limit Exceeded on Test Case {i+1}",
                })
                return result  # ⬅️ Stop execution immediately

            if exec_result["status"] == "memory_limit_exceeded":
                result.update({
                    "status": "Memory Limit Exceeded",
                    "test_case": f"Test Case {i + 1}",
                    "message": f"Memory Limit Exceeded on Test Case {i+1}",
                })
                return result
            if exec_result["status"] != "success":
                result.update({
                    "status": "failed",
                    "test_case": f"Test Case {i + 1}",
                    "message": f"Execution failed on Test Case {i+1}: {exec_result['message']}",
                })
                return result  # ⬅️ Stop execution immediately

            # ✅ Ensure the output file was created before comparing outputs
            if not os.path.exists(output_file):
                result.update({
                    "status": "failed",
                    "test_case": f"Test Case {i + 1}",
                    "message": "Output file missing. Possibly TLE or Runtime Error.",
                })
                return result

            # ✅ Compare actual user output to expected output
            with open(output_file, "r") as f_out, open(expected_output, "r") as f_exp:
                user_output = f_out.read().strip()
                expected = f_exp.read().strip()
                if user_output != expected:
                    result.update({
                        "test_case": f"Test Case {i + 1}",
                        "status": f"Wrong Answer on Test Case {i+1}",
                    })
                    return result  # ⬅️ Stop execution immediately if wrong answer

        # If all test cases pass
        return result

    except Exception as e:
        logging.error(f"An error occurred during submission: {e}")
        result.update({"status": "failed", "message": str(e)})
        return result

    finally:
        cleanup_submission_directory(submission_id)