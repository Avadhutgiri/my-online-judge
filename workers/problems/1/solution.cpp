#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    if(n < 0 || n > 1000){
        cout<<"Please follow constraints"<<endl;
        return 0;
    }
    cout << n * n * n << endl;

    return 0;
}

