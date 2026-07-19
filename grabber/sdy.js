const fs = require('fs');
const path = require('path');

const TARGET_URL = 'http://178.128.88'; 
// Jalur file mundur satu folder lalu masuk ke result/sdy.js
const filePath = path.join(__dirname, '..', 'result', 'sdy.js');

async function grabberSDY() {
  try {
    const response = await fetch(TARGET_URL);
    const htmlContent = await response.text();
    
    // Mencari angka result Sydney dari teks HTML situs target
    const regexAngka = htmlContent.match(/Result Sydney 4D.*?(\d{4})/i) || htmlContent.match(/(\d{4})/);
    let angkaKeluar = regexAngka ? regexAngka[1] : "0000";
    
    const tanggalSekarang = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }) + " WIB";
    
    const isiFileBaru = `const DATA_PAITO_SDY = ${JSON.stringify(angkaKeluar)};
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { latestResult: DATA_PAITO_SDY, updatedAt: "${tanggalSekarang}" };
}`;

    fs.writeFileSync(filePath, isiFileBaru, 'utf-8');
    console.log(`✅ Sukses memulung nomor SDY! Hasil: ${angkaKeluar}`);
  } catch (error) {
    console.error(`❌ Gagal menarik nomor SDY: ${error.message}`);
  }
}
grabberSDY();
