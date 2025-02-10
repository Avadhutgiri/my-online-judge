#include <bits/stdc++.h>
using namespace std;

typedef long long ll;
typedef vector<ll> vi;
typedef long double ld;
#define ff first
#define ss second
#define all(a) a.begin(), a.end()
#define rall(a) a.rbegin(), a.rend()
#define pb push_back
#define mp make_pair
#define bits(x) __builtin_popcountll(x)
#define endl "\n"
const ll M = 1e9 + 7;

int main()
{
    ios::sync_with_stdio(false);
    cin.tie(0);

    ll test;
    cin >> test;
    while (test--)
    {
        ll n, x;
        cin >> n >> x;
        vi arr(n);
        unordered_set<ll> elements;
        for (ll i = 0; i < n; i++)
        {
            cin >> arr[i];
            elements.insert(arr[i]);
        }
        ll mex = 1;
        ll count = 1;
        while (elements.find(mex) != elements.end() || count != x)
        {
            if (elements.find(mex) == elements.end())
            {
                count++;
            }
            mex++;
        }
        cout << mex << endl;
    }
}
