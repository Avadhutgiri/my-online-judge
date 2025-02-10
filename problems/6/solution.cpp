#include <bits/stdc++.h>
using namespace std;

int main()
{
    int t;
    cin >> t;
    while (t--)
    {
        int n;
        cin >> n;
        vector<int> vec(n);

        int temp;
        for (int i = 0; i < n; i++)
        {
            cin >> vec[i];
        }

        int result = 0;
        for (int it : vec)
        {
            if (it < 0 && (it % 2 != 0))
            {
                result += it;
            }
            if (it > 0 && (it % 2 == 0))
            {
                result += it;
            }
        }
        cout << result << endl;
    }
}