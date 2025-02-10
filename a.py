import base64

code = """
    #include <bits/stdc++.h>
    using namespace std;

    int main() {
        int t;
        cin>>t;
        while(t--){

        string s;
        cin >> s;

        vector<char> vec = {'A', 'E', 'I', 'O', 'U'};
        vector<char>::iterator it;

        int count = 0;
        for(char i: s) {
            it = find(vec.begin(), vec.end(), i);
            if(it != vec.end()) {
                count++;
            }
        }
        cout << count << endl;
        };
    }
"""

code= base64.b64encode(code.encode('utf-8')).decode('utf-8')
print(code)