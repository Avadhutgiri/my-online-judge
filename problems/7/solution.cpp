#include <iostream>
#include <algorithm>

using namespace std;

void printCoprimes(int n)
{
    if (n == 1)
    {
        cout << 1 << endl;
    }
    else
    {
        for (int i = 1; i < n; i++)
        {
            if (__gcd(i, n) == 1)
            {
                cout << i << " ";
            }
        }
        cout << endl;
    }
}

int main()
{
    int t;
    cin >> t;
    while (t--)
    {
        int n;
        cin >> n;
        printCoprimes(n);
    }
    return 0;
}