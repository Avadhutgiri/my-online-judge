import time
import base64
from tasks import submit
import csv

# Dummy C++ code — replace with actual test code if needed
cpp_code = """
#include <iostream>
using namespace std;
int main() {
    int n;
    cin >> n;
    cout << n * n *n << endl;
    return 0;
}
"""

# Encode it for the system (base64)
encoded_code = base64.b64encode(cpp_code.encode()).decode()

# Benchmark params
SUBMISSIONS = 100
PROBLEM_ID = "2"
LANGUAGE = "cpp"
csv_file = "redis_benchmark_results.csv"


# Method to benchmark Redis-based submission
def benchmark_disk():
    times = []
    total_time = 0
    with open("disk_benchmark_results.csv", mode='w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(["Submission ID", "Time (sec)", "Status"])

        for i in range(SUBMISSIONS):
            submission_id = 3000 + i
            print(f"🔁 Disk Benchmark: Submission {submission_id}")
            start = time.time()
            result = submit(
                submission_id=submission_id,
                code=encoded_code,
                language=LANGUAGE,
                problem_id=PROBLEM_ID,
                input_path="problems/2/",  # Disk path
                flag=False  # Disk mode
            )
            elapsed = time.time() - start
            times.append(elapsed)
            writer.writerow([submission_id, f"{elapsed:.4f}", result["status"]])
            print(f"⏱️ Took {elapsed:.4f} sec — Result: {result['status']}")
            total_time += elapsed

    avg_time = sum(times) / len(times)
    print(f"Total time: {total_time:.4f} sec")
    print(f"\n📊 Average Disk Time: {avg_time:.4f} sec")
    return avg_time

def benchmark_redis():
    times = []
    total_time = 0
    with open(csv_file, mode='w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(["Submission ID", "Time (sec)", "Status"])

        for i in range(SUBMISSIONS):
            submission_id = 2000 + i
            print(f"🔁 Redis Benchmark: Submission {submission_id}")
            start = time.time()
            result = submit(
                submission_id=submission_id,
                code=encoded_code,
                language=LANGUAGE,
                problem_id=PROBLEM_ID,
                input_path=None,  # Redis mode
                flag = True
            )
            elapsed = time.time() - start
            times.append(elapsed)
            writer.writerow([submission_id, f"{elapsed:.4f}", result["status"]])
            print(f"⏱️ Took {elapsed:.4f} sec — Result: {result['status']}")
            total_time += elapsed
    avg_time = sum(times) / len(times)
    print(f"Total time: {total_time:.4f} sec")
    print(f"\n📊 Average Redis Time: {avg_time:.4f} sec")
    return avg_time

if __name__ == "__main__":
    print("📌 Starting Redis Benchmark...")
    avg_redis = benchmark_redis()

    print("\n📌 Starting Disk Benchmark...")
    avg_disk = benchmark_disk()

    print("\n✅ Comparison Summary:")
    print(f"➡️ Redis Avg Time: {avg_redis:.4f} sec")
    print(f"➡️ Disk  Avg Time: {avg_disk:.4f} sec")
