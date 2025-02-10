import base64

code = """
#include <iostream>
#include <cmath>
using namespace std;

long long convertToTernary(long long N)
{
    if (N == 0)
        return 0;

    long long quotient = N / 3;
    long long remainder = abs(N % 3);
    long long result = convertToTernary(quotient);

    return result * 10 + remainder;
}

long long convert(long long Decimal)
{
    if (Decimal != 0) {
        return convertToTernary(Decimal);
    }
    else {
        return 0;
    }
}

int main() {
    long t;
    cin >> t;
    while(t--) {
        long n;
        long r = 0;
        cin >> n;

        long t = convert(n);

        while (t != 0) {
            r += (t % 10);
            t /= 10

        cout << r << endl;
    }
    return 0;
}
"""

code= base64.b64encode(code.encode('utf-8')).decode('utf-8')
print(code)