import base64

code = """
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int n = scanner.nextInt();
        System.out.println(n * n * n);
        scanner.close();
    }
}
"""

code= base64.b64encode(code.encode('utf-8')).decode('utf-8')
print(code)