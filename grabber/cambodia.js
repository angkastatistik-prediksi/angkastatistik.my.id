const fs = require('fs');
const path = require('path');

const TARGET_URL = 'http://178.128.88'; 
const filePath = path.join(__dirname, '..', 'result', 'cambodia.js');

async function grabberCambodia() {
  try {
    // 1. Ambil angka terbaru dari situs target orang lain
    const response = await fetch(TARGET_URL);
    const htmlContent = await response.text();
    const htmlClean = htmlContent.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, "");
    
    // Deteksi tanggal hari ini (Format Indonesia: DD-MM-YYYY)
    const opsiWaktu = { timeZone: "Asia/Jakarta", day: "2-digit", month: "2-digit", year: "numeric" };
    const tanggalHariIni = new Date().toLocaleDateString("id-ID", opsiWaktu).replace(/\//g, "-");
    
    // Kunci pencarian angka sah berdasarkan kata kunci "CAMBODIA" + Tanggal Hari Ini
    const polaKetat = new RegExp(`CAMBODIA[\\s\\S]*?${tanggalHariIni}[\\s\\S]*?(\\d{4})`, "i");
    const cocokCambodia = htmlClean.match(polaKetat);
    
    let angkaKeluar = "";
    if (cocokCambodia && cocokCambodia[1]) {
      angkaKeluar = cocokCambodia[1];
    } else {
      // Cadangan jika situs target tidak menulis tanggal dengan rapi
      const cocokCadangan = htmlClean.match(/CAMBODIA[\s\S]*?(\d{4})/i);
      if (cocokCadangan && cocokCadangan[1]) angkaKeluar = cocokCadangan[1];
    }

    if (!angkaKeluar || angkaKeluar === "0000") {
      throw new Error("Situs target belum update angka atau format berubah.");
    }

    // 2. Baca isi file result/cambodia.js lama Anda agar riwayatnya tidak hilang
    if (!fs.existsSync(filePath)) throw new Error("File result/cambodia.js tidak ditemukan.");
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    // Ambil array DATA_PAITO_CAMBODIA dari dalam file lama
    const regexArray = fileContent.match(/const\s+DATA_PAITO_CAMBODIA\s*=\s*(\[[\s\S]*?\]);/);
    if (!regexArray) throw new Error("Gagal membaca struktur array lama.");
    
    let dataPaito = JSON.parse(regexArray[1]);
    
    // 3. LOGIKA OTOMATISASI BARIS DAN KOLOM TABLE PAITO
    let barisTerakhir = dataPaito[dataPaito.length - 1];
    let slotKosongKetemu = false;
    
    // Cari apakah ada slot "-" di baris terakhir (Senin s/d Minggu)
    for (let i = 1; i < barisTerakhir.length; i++) {
      if (barisTerakhir[i] === "-") {
        barisTerakhir[i] = angkaKeluar; // Isi angka baru ke dalam slot strip
        slotKosongKetemu = true;
        break;
      }
    }
    
    // Jika hari Senin tiba dan semua slot minggu lalu sudah penuh, buat baris baru otomatis
    if (!slotKosongKetemu) {
      const nomorMingguBaru = String(dataPaito.length + 1).padStart(2, '0');
      // Buat baris baru: Kolom 0 = Nomor Minggu, Kolom 1 = Angka Senin, Kolom 2-7 = "-"
      dataPaito.push([nomorMingguBaru, angkaKeluar, "-", "-", "-", "-", "-", "-"]);
    }
    
    // 4. Tulis kembali semua data ke file result/cambodia.js
    const tanggalUpdate = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }) + " WIB";
    
    const isiFileBaru = `const DATA_PAITO_CAMBODIA = ${JSON.stringify(dataPaito, null, 2)};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { latestResult: "${angkaKeluar}", updatedAt: "${tanggalUpdate}" };
}`;

    fs.writeFileSync(filePath, isiFileBaru, 'utf-8');
    console.log(`✅ BERHASIL SEUMUR HIDUP! Angka ${angkaKeluar} masuk ke tabel Cambodia.`);
    
  } catch (error) {
    console.error(`❌ Gagal: ${error.message}`);
  }
}
grabberCambodia();
