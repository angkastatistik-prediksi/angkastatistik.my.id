import json
import re
from datetime import datetime
import requests

# DAFTAR SITUS (Bisa Anda tambah jika punya link cadangan lain)
SITUS_UTAMA = "https://prediksijitu.io"
SITUS_CADANGAN = "https://kesehatan.dinkeslahat.com/"  # Contoh web alternatif pemuat data macau

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}


def ambil_data(url):
    """Fungsi mendownload dan mencari 4 angka undian"""
    response = requests.get(url, headers=headers, timeout=15)
    html_content = response.text
    # Mencari semua pola 4 angka di dalam dokumen HTML
    results = re.findall(r"(\d{4})", html_content)
    return results


# --- PROSES UTAMA ---
data_angka = []
situs_terpakai = ""

# Cobaan Pertama: Lari ke situs utama
try:
    print(f"Robot mencoba mengambil data dari situs utama: {SITUS_UTAMA}")
    data_angka = ambil_data(SITUS_UTAMA)
    situs_terpakai = "Situs Utama"

# JIKA SUTUS UTAMA GANGGUAN / BLOKIR, OTOMATIS LARI KE SINI:
except Exception as error_utama:
    print(
        f"Situs utama gangguan ({error_utama}). Robot otomatis lari ke situs cadangan!"
    )

    try:
        print(f"Mencoba situs cadangan: {SITUS_CADANGAN}")
        data_angka = ambil_data(SITUS_CADANGAN)
        situs_terpakai = "Situs Cadangan (Failover)"

    except Exception as error_cadangan:
        print(f"Semua situs gangguan: {error_cadangan}")
        data_angka = []

# --- MENYIMPAN HASIL AKHIR ---
if len(data_angka) > 0:
    data_siap_simpan = {
        "updated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "latest_result": data_angka,
        "sumber_data": situs_terpakai,
    }
else:
    data_siap_simpan = {
        "updated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "latest_result": "Sedang Update / Gangguan Masal",
        "sumber_data": "Gagal Semua",
    }

with open("result_macau.json", "w") as f:
    json.dump(data_siap_simpan, f, indent=4)

print("Proses selesai dengan aman!")

