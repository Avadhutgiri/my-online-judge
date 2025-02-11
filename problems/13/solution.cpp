    #include <iostream>
    using namespace std;

    // Helper function to calculate the digital root
    int digitalRoot(int n) {
        while (n >= 10) {
            int sum = 0;
            while (n > 0) {
                sum += n % 10;
                n /= 10;
            }
            n = sum;
        }
        return n;
    }

    // Function to check if the number is a magic number
    bool isMagicNumber(int n) {
        return digitalRoot(n) == 1;
    }

    // Test the function with sample inputs
    int main() {
        int t;
        cin >> t;
        while (t--) {
            int n;
            cin >> n;
            cout << (isMagicNumber(n) ? "YES" : "NO") << endl;
        }
        
        
        return 0;
    }
