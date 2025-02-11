import base64

code = """
#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    cout << n * n * n << endl;

    return 0;
}
"""

code= base64.b64encode(code.encode('utf-8')).decode('utf-8')
print(code)