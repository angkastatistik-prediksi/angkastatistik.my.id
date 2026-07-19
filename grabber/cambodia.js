const fs = require('fs');
const path = require('path');

// 5 LINK ANDALAN ANDA (SUDAH DIURUTKAN DENGAN BENAR)
const DAFTAR_SITUS = [
  'https://livecmd.live',
  'https://masterlive.net',
  'https://live-drawcambodia.shop',
  'https://livecambodia.cyou',
  'https://masterlive.net'
];

const filePath = path.join(__dirname, '..', 'result', 'cambodia.js');

// Robot menggunakan teknologi pemotong teks presisi (Anti-Iklan)
function ekstrakNomorSah(htmlContent) {
  // 1. Bersihkan semua skrip iklan dan kode CSS agar teks menjadi bersih
  const teksBersih = htmlContent.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>/gi, " ");
  
  // 2. Radar mengunci teks "1st Prize" lalu mengambil 4 digit angka di sebelah kanannya
  const cocokPrize = teksBersih.match(/1st\s*Prize[\s\S]*?(\d{4})/i);
  if (cocokPrize && cocokPrize[1]) {
    return cocokPrize[1];
  }
  
  // Cadangan jika angka ditulis duluan baru teks 1st Prize
  const cocokTerbalik = teksBersih.match(/(\d{4})[\s\S]*?1st\s*Prize/i);
  if (cocokTerbalik && cocokTerbalik[1]) {
    return cocokTerbalik[1];
  }
  
  return null;
}

async function grabberCambodia() {
  let angkaKeluar = null;

  // Sistem estafet: Jika situs ke-1 error, otomatis pindah ke situs berikutnya dalam 7 detik
  for (let i = 0; i < DAFTAR_SITUS.length; i++) {
    try {
      console.log(`📡 Robot meluncur ke Sumber ke-${i + 1}: ${DAFTAR_SITUS[i]}`);
      
      const response = await fetch(DAFTAR_SITUS[i], { signal: AbortSignal.timeout(7000) });
      const htmlContent = await response.text();
      
      angkaKeluar = ekstrakNomorSah(htmlContent);
      
      if (angkaKeluar && angkaKeluar !== "0000") {
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

  // PROSES EDIT & INSERT KE FILE RESULT TANPA MENGHAPUS DATA LAMA
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const regexArray = fileContent.match(/const\s+DATA_PAITO_CAMBODIA\s*=\s*(\[[\s\S]*?\]);/);
    let dataPaito = JSON.parse(regexArray[1]);
    
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
    console.log(`✅ DISIMPAN! Angka ${angkaKeluar} resmi masuk ke file result/cambodia.js`);
  } catch (error) {
    console.error(`❌ Gagal memperbarui file berkas: ${error.message}`);
  }
}

grabberCambodia();
