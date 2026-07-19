const fs = require('fs');
const path = require('path');

// MENGGUNAKAN API ALTERNATIF YANG JAUH LEBIH RINGAN DAN BEBAS BLOKIR RESMI
const LINK_API_CADANGAN = 'https://allorigins.win' + encodeURIComponent('https://cambodiapools.com');

const filePath = path.join(__dirname, '..', 'result', 'cambodia.js');

async function grabberOtomatisCambodia() {
  let angkaKeluar = null;

  try {
    console.log(`📡 Robot meluncur menembus API Cadangan Resmi...`);
    const response = await fetch(LINK_API_CADANGAN, { signal: AbortSignal.timeout(10000) });
    const jsonRes = await response.json();
    const htmlContent = jsonRes.contents;

    // Sistem radar melacak 4 digit angka di baris pemenang utama
    const bersihHTML = htmlContent.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>/gi, " ");
    const cocok = bersihHTML.match(/1st\s*Prize[\s\S]*?(\d{4})/i) || bersihHTML.match(/(\d{4})[\s\S]*?1st\s*Prize/i);
    
    if (cocok && cocok[1]) {
      angkaKeluar = cocok[1];
    }
  } catch (err) {
    console.log(`❌ Gagal membaca API: ${err.message}`);
  }

  // JIKA API CADANGAN DI ATAS DI BLOKIR, INI BACKUP DARURAT OTOMATIS KE SITUS DATA PAITO LAIN
  if (!angkaKeluar) {
    try {
      console.log(`📡 Mencoba rute darurat ke Paito-Hub...`);
      const resBackup = await fetch('https://allorigins.win' + encodeURIComponent('https://livedrawcambodia.co'));
      const jsonBackup = await resBackup.json();
      const cocokBackup = jsonBackup.contents.match(/1st\s*Prize[\s\S]*?(\d{4})/i);
      if (cococBackup && cocokBackup[1]) angkaKeluar = cocokBackup[1];
    } catch (e) {
      console.log(`❌ Rute darurat juga gagal.`);
    }
  }

  if (!angkaKeluar || angkaKeluar === "0000") {
    console.error("🚨 Gagal Total: Data angka hari ini belum dirilis atau server asal offline.");
    return;
  }

  console.log(`🎯 TARGET SUKSES DITEMBUS! Angka Sah: ${angkaKeluar}`);

  // PROSES INJECT OTOMATIS KE DATABASE TABEL ANDA
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const matchArray = fileContent.match(/const\s+DATA_PAITO_CAMBODIA\s*=\s*(\[[\s\S]*?\]);/);
    if (!matchArray) throw new Error("Struktur file database cambodia.js rusak!");

    let dataPaito = eval(matchArray[0]);
    let barisTerakhir = dataPaito[dataPaito.length - 1];
    let slotKosongKetemu = false;
    
    for (let i = 1; i < barisTerakhir.length; i++) {
      if (barisTerakhir[i] === "-") {
        barisTerakhir[i] = angkaKeluar;
        slotKosongKetemu = true;
        break;
      }
    }
    
    if (!slotKosongKetemu) {
      const nomorMingguBaru = String(dataPaito.length + 1).padStart(2, '0');
      dataPaito.push([nomorMingguBaru, angkaKeluar, "-", "-", "-", "-", "-", "-"]);
    }
    
    const tanggalUpdate = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }) + " WIB";
    const isiFileBaru = `const DATA_PAITO_CAMBODIA = ${JSON.stringify(dataPaito, null, 2)};\n\nif (typeof module !== 'undefined' && module.exports) {\n    module.exports = { latestResult: "${angkaKeluar}", updatedAt: "${tanggalUpdate}" };\n}`;
    
    fs.writeFileSync(filePath, isiFileBaru, 'utf-8');
    console.log(`✅ DATA LIVE DRAW BERHASIL DIPERBARUI SECARA OTOMATIS!`);
  } catch (error) {
    console.error(`❌ Gagal Menyimpan: ${error.message}`);
  }
}

grabberOtomatisCambodia();
