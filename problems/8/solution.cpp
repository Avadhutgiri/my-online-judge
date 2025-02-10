#include <bits/stdc++.h>
using namespace std;

// Function to generate modified Fibonacci indices up to n-1
vector<int> modifiedFibonacciIndices(int n) {
    vector<int> fib = {0, 1, 2};  // Start with the modified sequence

    while (true) {
        int next_fib = fib[fib.size() - 1] + fib[fib.size() - 2];
        if (next_fib >= n) {
            break;
        }
        fib.push_back(next_fib);
    }

    return fib;
}

// Function to shift a character forward by a given shift amount
char shiftChar(char c, int shift) {
    if (!isalpha(c)) {
        return c;  // Ignore non-alphabet characters
    }

    char base = isupper(c) ? 'A' : 'a';
    return (c - base + shift) % 26 + base;  // Wrap around the alphabet
}

// Function to modify the string using the modified Fibonacci logic
string modifyStringWithFibonacci(const string& s) {
    int n = s.size();
    vector<int> fib_indices = modifiedFibonacciIndices(n);  // Get Fibonacci indices
    string result = s;

    for (int i = 0; i < n; ++i) {
        if (find(fib_indices.begin(), fib_indices.end(), i) != fib_indices.end()) {
            // Shift the character at index i by the same index value
            result[i] = shiftChar(s[i], i);
        }
    }

    return result;
}

// Example usage
int main() {

    string s;
    cin >> s;
    string modifiedString = modifyStringWithFibonacci(s);
    cout <<modifiedString << endl;

    return 0;
}
