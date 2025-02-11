#include <iostream>
using namespace std;

int modifiedFibonacci(int n, int k) {
    if (n == 1 || n == 2) {
        return 1;
    }

    int a1 = 1, a2 = 1, nextTerm;

                for (int i = 3; i <= n; ++i) {
        nextTerm = k * a2 + a1;  // Modified formula
        a1 = a2;
        a2 = nextTerm;
    }

    return a2;
}

int main() {
    int t;
    cin >> t;
    while(t--){

    int n, k;

    // Input: n (position) and k (modification factor)
    cout << "Enter n and k: ";
    cin >> n >> k;

    // Output: nth element of the modified Fibonacci sequence
    int result = modifiedFibonacci(n, k);
    cout << "The " << n << "th element of the modified Fibonacci sequence is: " << result << endl;

    }
    return 0;
}
