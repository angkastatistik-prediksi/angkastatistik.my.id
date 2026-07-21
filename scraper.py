import json
import re
from datetime import datetime
import requests

url = "https://taiwanpools.today"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}

try:
    response = requests.get(url, headers=headers, timeout=15)
    html_content = response.text

    special = re.search(r"Special Prize\s*([\d\s]+)", html_content)
    grand = re.search(r"Grand Prize\s*([\d\s]+)", html_content)
    regular = re.search(r"Regular Prize\s*([\d\s]+)", html_content)

    data = {
        "updated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "special_prize": (
            special.group(1).strip() if special else "Sedang Update"
        ),
        "grand_prize": grand.group(1).strip() if grand else "Sedang Update",
        "regular_prize": (
            regular.group(1).strip() if regular else "Sedang Update"
        ),
    }

    with open("result.json", "w") as f:
        json.dump(data, f, indent=4)
    print("Data berhasil diperbarui!")

except Exception as e:
    print(f"Error: {e}")
