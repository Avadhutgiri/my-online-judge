import os
import redis

r = redis.StrictRedis(host='redis', port=6379, decode_responses=True)

def preload_problem(problem_id, base_path="problems"):
    problem_path = os.path.join(base_path, str(problem_id))
    i = 0
    while True:
        input_file = os.path.join(problem_path, f"input{i}.txt")
        output_file = os.path.join(problem_path, f"output{i}.txt")

        if not os.path.exists(input_file) or not os.path.exists(output_file):
            print(f"⛔ input{i}.txt or output{i}.txt not found for problem {problem_id}")
            break

        with open(input_file, "r") as f_in:
            input_data = f_in.read().strip()
            print(f"✅ [READ] input{i}.txt = \"{input_data}\"")
            r.set(f"problem:{problem_id}:input:{i}", input_data)

        with open(output_file, "r") as f_out:
            output_data = f_out.read().strip()
            print(f"✅ [READ] output{i}.txt = \"{output_data}\"")
            r.set(f"problem:{problem_id}:output:{i}", output_data)

        i += 1

    r.set(f"problem:{problem_id}:count", i)
    print(f"✅ Done: Cached {i} test cases for problem {problem_id}")

def preload_all():
    for pid in os.listdir("problems"):
        if os.path.isdir(os.path.join("problems", pid)):
            preload_problem(pid)

if __name__ == "__main__":
    preload_all()
