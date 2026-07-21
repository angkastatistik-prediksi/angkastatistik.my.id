import json
import os
import re
from datetime import datetime
import requests

SITUS_UTAMA = "https://prediksijitu.io"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}

nama_file = "result_macau.json"
paito_history = []

if os.path.exists(nama_file):
    try:
        with open(nama_file, "r") as f:
            data_lama = json.load(f)
            paito_history = data_lama.get("paito_rows", [])
    except:
        paito_history = []

try:
    response = requests.get(SITUS_UTAMA, headers=headers, timeout=15)
    all_numbers = re.findall(r"\b\d{4}\b", response.text)

    if len(all_numbers) > 0:
        angka_hari_ini = all_numbers[:6]
        live_terakhir = angka_hari_ini[-1] 

        bulan_list = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"]
        now = datetime.now()
        tgl_label = f"{now.day:02d} {bulan_list[now.month - 1]}"

        posisi_ada = -1
        for idx, row in enumerate(paito_history):
            if row["tanggal"] == tgl_label:
                posisi_ada = idx
                break

        if posisi_ada != -1:
            paito_history[posisi_ada]["angka"] = angka_hari_ini
        else:
            paito_history.insert(0, {"tanggal": tgl_label, "angka": angka_hari_ini})

        data_akhir = {
            "live_4d": live_terakhir,
            "updated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "paito_rows": paito_history
        }

        with open(nama_file, "w") as f:
            json.dump(data_akhir, f, indent=4)
        print("Data Paito Macau Berhasil Diperbarui!")

except Exception as e:
    print(f"Error scraping paito: {e}")
