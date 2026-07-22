try:
    # 2. Buka Situs Target
    url = "https://livecmd.live/"
    driver.get(url)
    
    # 3. Tunggu 15 detik agar semua angka selesai berputar/loading di layar
    import time
    time.sleep(15)
    
    # 4. Ambil SELURUH TEKS yang terlihat di layar browser HP/komputer saat itu
    seluruh_teks_layar = driver.find_element(By.TAG_NAME, "body").text
    
    # 5. Cari baris yang mengandung tulisan hasil undian (contoh: "Cambodia" atau angka 4 digit)
    # Kita pecah teks layar per baris
    baris_teks = seluruh_teks_layar.split("\n")
    
    angka_keluar = "Belum Update"
    for i, baris in enumerate(baris_teks):
        if "Cambodia" in baris or "Result" in baris:
            # Mengambil baris di bawah tulisan "Cambodia" yang biasanya berisi angka keluaran
            if i + 1 < len(baris_teks):
                angka_keluar = baris_teks[i + 1]
                break
                
    # Jika trik di atas meleset, cetak semua teks untuk bahan analisa Anda nanti
    print("--- TEKS YANG TERDETEKSI DI WEB ---")
    print(seluruh_teks_layar)
    print("-----------------------------------")
    
    # 6. Struktur data baru
    data_baru = {
        "tanggal": datetime.now().strftime("%Y-%m-%d"),
        "waktu_log": datetime.now().strftime("%H:%M:%S"),
        "pasaran": "Cambodia",
        "hasil": angka_keluar
    }
