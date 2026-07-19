const fs = require('fs');
const path = require('path');

// KEMBALI KE 5 LINK ANDALAN ASAL ANDA
const DAFTAR_SITUS = [
  'https://livecmd.live/',
  'https://masterlive.net/',
  'https://live-drawcambodia.shop/',
  'https://livecambodia.cyou/',
  'https://masterlive.net/'
];

// Jalur mundur dari folder grabber/ menuju folder result/cambodia.js
const filePath = path.join(__dirname, '..', 'result', 'cambodia.js');

// Fungsi diperbaiki total agar mengembalikan string 4 digit angka sah, bukan objek array rusak
function ekstrakNomorSah(htmlContent) {
  // 1. Bersihkan skrip iklan dan kode tag HTML agar menyisakan teks bersih murni
  const teksBersih = htmlContent.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>/gi, " ");
  
  // 2. Radar melacak teks "1st Prize" lalu mengambil 4 digit angka di sebelah kanannya
  const cocokPrize = teksBersih.match(/1st\s*Prize[\s\S]*?(\d{4})/i);
  if (cocokPrize && cocokPrize[1]) {
    return cocokPrize[1]; // Mengambil grup indeks pertama (4 digit angka murni)
  }
  
  // Cadangan jika format situs menulis angka duluan baru teks 1st Prize
  const cocokTerbalik = teksBersih.match(/(\d{4})[\s\S]*?1st\s*Prize/i);
  if (cocokTerbalik && cocokTerbalik[1]) {
    return cocokTerbalik[1]; // Mengambil grup indeks pertama (4 digit angka murni)
  }
  
  return null;
}

async function grabberCambodia() {
  let angkaKeluar = null;

  // Sistem estafet asli milik Anda
  for (let i = 0; i < DAFTAR_SITUS.length; i++) {
    try {
      console.log(`📡 Robot meluncur ke Sumber ke-${i + 1}: ${DAFTAR_SITUS[i]}`);
      
      const response = await fetch(DAFTAR_SITUS[i], { 
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9'
        },
        signal: AbortSignal.timeout(7000) 
      });
      const htmlContent = await response.text();
      
      angkaKeluar = ekstrakNomorSah(htmlContent);
      
      if (angkaKeluar && angkaKeluar !== "0000" && angkaKeluar.length === 4) {
        console.log(`🎯 TARGET KETEMU di Sumber ke-${i + 1} -> Angka Sah: ${angkaKeluar}`);
        break; 
      } else {
        console.log(`⚠️ Sumber ke-${i + 1} aktif, tapi angka 1st Prize belum tayang.`);
      }
    } catch (err) {
      console.log(`❌ Sumber ke-${i + 1} gagal diakses: ${err.message}`);
    }
  }

  if (!angkaKeluar) {
    console.error("🚨 Gagal Total: Kelima situs target sedang gangguan atau belum update!");
    return;
  }

  // PROSES MANIPULASI FILE DATABASE CAMBODIA.JS PERSIS SEPERTI STRUKTUR ASLI ANDA
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    // Potong bagian array DATA_PAITO_CAMBODIA
    const matchArray = fileContent.match(/const\s+DATA_PAITO_CAMBODIA\s*=\s*(\[[\s\S]*?\]);/);
    if (!matchArray) {
      throw new Error("Struktur DATA_PAITO_CAMBODIA tidak ditemukan!");
    }

    // Evaluasi string menjadi objek array nyata tanpa JSON.parse yang rawan sensitif kutipan
    let dataPaito = eval(matchArray[1]);
    
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
    
    // Tulis kembali file dengan struktur standar awal yang ramah Regex sisi HTML
    const isiFileBaru = `const DATA_PAITO_CAMBODIA = ${JSON.stringify(dataPaito, null, 2)};\n\nif (typeof module !== 'undefined' && module.exports) {\n    module.exports = { latestResult: "${angkaKeluar}", updatedAt: "${tanggalUpdate}" };\n}`;

    fs.writeFileSync(filePath, isiFileBaru, 'utf-8');
    console.log(`✅ DISIMPAN! Angka ${angkaKeluar} resmi masuk ke file result/cambodia.js`);
  } catch (error) {
    console.error(`❌ Gagal memperbarui file berkas: ${error.message}`);
  }
}

grabberCambodia();
