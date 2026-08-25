import urllib.request
import json
import traceback

req = urllib.request.Request(
    'http://127.0.0.1:8000/api/ai/chat',
    data=json.dumps({"message": "Explain my case in simple language"}).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)

try:
    with urllib.request.urlopen(req) as response:
        print(response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print(f"HTTPError: {e.code}")
    print(e.read().decode('utf-8'))
except Exception as e:
    print("Exception:", e)
    traceback.print_exc()
