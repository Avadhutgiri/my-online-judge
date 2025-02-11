import os
import logging
from workers.execute_code import submit, run

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

# Test parameters
submission_id = "2805"
problem_id = "2"
language = "cpp"
event_name = "Clash"
inputData="1 \n 100"

user_code = ""

print("\n--- Running the 'submit' function directly ---")

try:
    # Call the submit function
    # result = run(submission_id,  user_code, language,problem_id,event_name=event_name, inputData=inputData)
    # 
    result = submit(submission_id, user_code, language, problem_id,input_path="problems/2" )

    # Print the entire result, whether it's an error or success
    # print("\n--- Submit Function Result ---")
    print(result)

except Exception as e:
    logging.error(f"An unexpected error occurred during testing: {e}")

