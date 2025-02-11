import os
import shutil
import subprocess
import logging
import re

# from ../models.Submission import Submission
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)

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


def prepare_submission_directory(submission_id):
    """Creates a directory for storing submission files."""
    work_dir = os.path.join(os.getcwd(), "submissions",
                            f"submission_{submission_id}")
    os.makedirs(work_dir, exist_ok=True)
    os.makedirs(os.path.join(work_dir, "inputs"), exist_ok=True)
    os.makedirs(os.path.join(work_dir, "outputs"), exist_ok=True)
    os.makedirs(os.path.join(work_dir, "expected_outputs"), exist_ok=True)
    return work_dir


def cleanup_submission_directory(submission_id):
    """Deletes the submission directory after execution."""
    work_dir = os.path.join(os.getcwd(), "submissions",
                            f"submission_{submission_id}")
    if os.path.exists(work_dir):
        shutil.rmtree(work_dir)


def extract_java_classname(code):
    """Extracts the public class name from Java code."""
    match = re.search(r"public\s+class\s+(\w+)", code)
    if match:
        return match.group(1)
    else:
        raise ValueError("No public class found in Java code.")


def run(submission_id, event_name, code, language, inputData, problem_id):
    """Runs user-submitted code inside Docker, handling Reverse Coding and Clash events."""
    try:
        # Validate the language
        if language not in LANGUAGE_CONFIG:
            return {"status": "failed", "message": "Unsupported Programming Language"}

        print(language)
        # Get language-specific configurations
        config = LANGUAGE_CONFIG[language]
        extension = config["extension"]
        image = config["image"]
        timeout = config["timeout"]
        memory_limit = config["memory_limit"]

        # Set up directories
        work_dir = prepare_submission_directory(submission_id)
        filename = f"submission_{submission_id}{extension}"
        exec_name = f"submission_{submission_id}_exec"

        # Save user's code
        code_file_path = os.path.join(work_dir, filename)
        with open(code_file_path, "w") as f:
            f.write(code)

        # Compile code if required
        if language == "cpp":
            compile_cmd = config["compile_cmd"].format(
                exec_name=exec_name, filename=filename
            )
            logging.info(f"Compiling user code: {compile_cmd}")
            try:
                subprocess.run(
                    compile_cmd,
                    shell=True,
                    check=True,
                    cwd=work_dir,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                )
            except subprocess.CalledProcessError as e:
                return {"status": "compilation_error", "message": e.stderr.decode()}

        # Save custom input data

        input_file = os.path.join(work_dir, "inputs", "custom_input.txt")
        with open(input_file, "w") as f:
            f.write(inputData)

        output_file = os.path.join(work_dir, "outputs", "custom_output.txt")
        run_cmd = config["run_command"]
        if language == "cpp":
            run_cmd = run_cmd.format(exec_name=exec_name)
        else:
            run_cmd = run_cmd.format(filename=filename)

        print("heeeeeeeeeee")
        docker_cmd = [
            "docker",
            "run",
            "--rm",
            f"--memory={memory_limit}m",
            "--cpus=1",
            "-v",
            f"{work_dir}:/app:z",
            "-w",
            "/app",
            image,
            "sh",
            "-c",
            f"timeout {timeout}s {
                run_cmd} < inputs/custom_input.txt > outputs/custom_output.txt",
        ]
        logging.info(f"Executing Docker command: {' '.join(docker_cmd)}")

        try:
            result = subprocess.run(
                docker_cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                timeout=timeout,
                shell=False,
            )

            stdout = result.stdout.decode().strip()
            stderr = result.stderr.decode().strip()

            # Handle potential errors
            if result.returncode == 137:
                return {
                    "status": "memory_limit_exceeded",
                    "message": "Memory Limit Exceeded",
                }
            if stderr:
                return {"status": "runtime_error", "message": stderr}

        except subprocess.TimeoutExpired:
            return {"status": "time_limit_exceeded", "message": "Time Limit Exceeded"}

        # Read the user's output from file
        with open(output_file, "r") as f_out:
            user_output = f_out.read().strip()

        # Handle the Reverse Coding event by executing the reference solution
        if event_name == "Reverse Coding":
            ref_solution_path = os.path.join(
                "problems", problem_id, "solution.cpp")
            if not os.path.exists(ref_solution_path):
                return {"status": "failed", "message": "Reference solution not found."}
            # Copy and compile the reference solution
            ref_solution_dest = os.path.join(work_dir, "solution.cpp")
            shutil.copy(ref_solution_path, ref_solution_dest)

            # Execute the reference solution to get expected output
            expected_output = execute_reference_solution(
                ref_solution_dest, work_dir, input_file
            )
            if expected_output is None:
                return {
                    "status": "reference_error",
                    "message": "Failed to execute reference solution",
                }

            # Compare outputs

            return {"user_output": user_output, "expected_output": expected_output}

        # For Clash, return the user's output
        return {"status": "accepted", "output": user_output}

    except Exception as e:
        logging.error(f"An error occurred during execution: {e}")
        return {"status": "failed", "message": str(e)}

    # finally:
    #     cleanup_submission_directory(submission_id)


def execute_reference_solution(ref_solution_path, work_dir, input_file):
    """Compiles and runs the reference solution inside Docker."""
    try:
        # Compile the reference solution
        compile_cmd = "g++ -o solution_exec solution.cpp"
        # logging.info(f"Compiling reference solution: {compile_cmd}")

        compile_result = subprocess.run(
            compile_cmd,
            shell=True,
            cwd=work_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )

        if compile_result.returncode != 0:
            logging.error(
                f"Compilation failed. Error: {compile_result.stderr.decode()}"
            )
            return None

        logging.info("Reference solution compiled successfully.")

        # Run the reference solution inside Docker
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
            "./solution_exec < inputs/custom_input.txt",
        ]

        logging.info(
            f"Executing reference solution with Docker: {' '.join(docker_cmd)}"
        )

        result = subprocess.run(
            docker_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE
        )

        if result.returncode != 0:
            logging.error(
                f"Reference solution execution failed. Error: {
                    result.stderr.decode()}"
            )
            return None

        return result.stdout.decode().strip()

    except Exception as e:
        logging.error(f"Failed to execute reference solution: {e}")
        return None


def submit(submission_id, code, language, input_path, java_classname=None):
    """Runs user-submitted code inside Docker and compares output with expected output."""
    results = []
    try:
        print(os.listdir(input_path))
        print(f"Received language: '{language}'")
        print(f"Available languages: {list(LANGUAGE_CONFIG.keys())}")

        # Validate language
        if language not in LANGUAGE_CONFIG:
            return {"status": "failed", "message": "Unsupported Programming Language"}

        config = LANGUAGE_CONFIG[language]
        extension = config["extension"]
        image = config["image"]
        timeout = config["timeout"]
        memory_limit = config["memory_limit"]

        work_dir = prepare_submission_directory(submission_id)
        filename = f"submission_{submission_id}{extension}"
        exec_name = f"submission_{submission_id}_exec"

        for file in os.listdir(input_path):
            if file.startswith("input") and file.endswith(".txt"):
                shutil.copy(
                    os.path.join(input_path, file), os.path.join(
                        work_dir, "inputs")
                )

        for file in os.listdir(input_path):
            if file.startswith("output") and file.endswith(".txt"):
                shutil.copy(
                    os.path.join(input_path, file),
                    os.path.join(work_dir, "expected_outputs"),
                )

        test_case_paths = [
            os.path.join(work_dir, "inputs", file)
            for file in os.listdir(os.path.join(work_dir, "inputs"))
        ]
        expected_output_paths = [
            os.path.join(work_dir, "expected_outputs", file)
            for file in os.listdir(os.path.join(work_dir, "expected_outputs"))
        ]

        test_case_paths.sort()
        expected_output_paths.sort()

        print("1", test_case_paths)
        print("2", expected_output_paths)

        # Validate inputs
        if len(test_case_paths) != len(expected_output_paths):
            return {
                "status": "failed",
                "message": "Test case and output file count mismatch",
            }

        for test_case, expected_output in zip(test_case_paths, expected_output_paths):
            if not os.path.exists(test_case):
                return {
                    "status": "failed",
                    "message": f"Test case file not found: {test_case}",
                }
            if not os.path.exists(expected_output):
                return {
                    "status": "failed",
                    "message": f"Expected output file not found: {expected_output}",
                }

        # Create submission directory

        # Handle language-specific setup
        if language == "java":
            if java_classname:
                classname = java_classname
            else:
                try:
                    classname = extract_java_classname(code)
                except ValueError as e:
                    return {"status": "compilation_error", "message": str(e)}

            filename = f"{classname}.java"

        code_file_path = os.path.join(work_dir, filename)

        # Save user-submitted code
        with open(code_file_path, "w") as f:
            f.write(code)

        # Compile code for compiled languages
        if language in ["cpp", "java"]:
            compile_cmd = config["compile_cmd"].format(
                exec_name=exec_name, filename=filename
            )
            logging.info(f"Compile command: {compile_cmd}")

            try:
                result = subprocess.run(
                    compile_cmd,
                    shell=True,
                    check=True,
                    cwd=work_dir,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                )
                logging.info(f"Compilation stdout: {result.stdout.decode()}")
            except subprocess.CalledProcessError as e:
                error_message = e.stderr.decode()
                logging.error(f"Compilation failed: {error_message}")
                return {"status": "compilation_error", "message": error_message}

            # Verify the executable or class file exists
            if language == "cpp":
                exec_path = os.path.join(work_dir, exec_name)
                if not os.path.exists(exec_path):
                    logging.error(f"Executable not found: {exec_path}")
                    return {
                        "status": "compilation_error",
                        "message": "Executable not created",
                    }
            elif language == "java":
                class_file = os.path.join(work_dir, f"{classname}.class")
                if not os.path.exists(class_file):
                    logging.error(f"Class file not found: {class_file}")
                    return {
                        "status": "compilation_error",
                        "message": "Class file not created",
                    }

        # Prepare run command
        run_cmd = config["run_command"]
        if language == "cpp":
            run_cmd = run_cmd.format(exec_name=exec_name)
        elif language == "python":
            run_cmd = run_cmd.format(filename=filename)
        elif language == "java":
            run_cmd = run_cmd.format(classname=classname)

        # Run each test case one by one
        for i, test_case in enumerate(test_case_paths):
            output_file = os.path.join(work_dir, "outputs", f"output{i}.txt")

            docker_cmd = [
                "docker",
                "run",
                "--rm",
                f"--memory={memory_limit}m",
                "--cpus=1",
                "-v",
                f"{work_dir}:/app:z",
                "-w",
                "/app",
                image,
                "sh",
                "-c",
                f"timeout {timeout}s {run_cmd} < inputs/input{i+1}.txt",
            ]

            # logging.info(f"Executing Docker command: {' '.join(docker_cmd)}")

            try:
                result = subprocess.run(
                    docker_cmd,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    timeout=timeout,
                    shell=False,
                )

                # Capture both stdout and stderr
                stdout = result.stdout.decode().strip()
                stderr = result.stderr.decode().strip()

                # Check for Docker's return code (137 indicates forced container stop)
                if result.returncode == 137:
                    logging.error(
                        f"Memory limit exceeded for test case {i + 1}")
                    results.append(
                        {
                            "test_case": f"Test Case {i + 1}",
                            "status": "memory_limit_exceeded",
                            "message": "Memory Limit Exceeded",
                        }
                    )
                    continue

                if stderr:
                    logging.error(f"Execution error for test case {
                                  i + 1}: {stderr}")
                    results.append(
                        {
                            "test_case": f"Test Case {i + 1}",
                            "status": "runtime_error",
                            "message": stderr,
                        }
                    )
                    continue

                # Save stdout to output file for comparison
                with open(output_file, "w") as f_out:
                    f_out.write(stdout)

            except subprocess.TimeoutExpired:
                logging.error(f"Execution timed out for test case {i + 1}")
                results.append(
                    {
                        "test_case": f"Test Case {i + 1}",
                        "status": "time_limit_exceeded",
                        "message": "Time Limit Exceeded",
                    }
                )
                continue

            # Compare output with expected output
            with open(output_file, "r") as f_out, open(
                expected_output_paths[i], "r"
            ) as f_exp:
                user_output = f_out.read().strip()
                expected_output = f_exp.read().strip()

                if user_output != expected_output:
                    logging.info(f"Test case {i + 1} failed.")
                    return {
                        "test_case": f"Test Case {i + 1}",
                        "status": "wrong_answer",
                        "message": f" Got: {user_output}",
                    }
                else:
                    results.append(
                        {
                            "test_case": f"Test Case {i + 1}",
                            "status": "accepted",
                            "message": "Output matches expected result",
                        }
                    )

        # Determine overall status
        if all(result["status"] == "accepted" for result in results):
            return {"status": "accepted", "results": results}
        else:
            return {"status": "failed", "results": results}

    except Exception as e:
        logging.error(f"An error occurred during submission: {e}")
        return {"status": "failed", "message": str(e)}

    finally:
        cleanup_submission_directory(submission_id)
