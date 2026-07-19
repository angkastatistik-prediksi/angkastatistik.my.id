const fs = require('fs');
const path = require('path');

const TARGET_URL = 'http://178.128.88'; 
// Jalur file mundur satu folder lalu masuk ke result/cambodia.js
const filePath = path.join(__dirname, '..', 'result', 'cambodia.js');

async function grabberCambodia() {
  try {
    const response = await fetch(TARGET_URL);
    const htmlContent = await response.text();
    
    // Mencari angka result Cambodia dari teks HTML situs target
    const regexAngka = htmlContent.match(/Result Cambodia 4D.*?(\d{4})/i) || htmlContent.match(/(\d{4})/);
    let angkaKeluar = regexAngka ? regexAngka[1] : "0000";
    
    const tanggalSekarang = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }) + " WIB";
    
    const isiFileBaru = `const DATA_PAITO_CAMBODIA = ${JSON.stringify(angkaKeluar)};
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { latestResult: DATA_PAITO_CAMBODIA, updatedAt: "${tanggalSekarang}" };
}`;

    fs.writeFileSync(filePath, isiFileBaru, 'utf-8');
    console.log(`✅ Sukses memulung nomor Cambodia! Hasil: ${angkaKeluar}`);
  } catch (error) {
    console.error(`❌ Gagal menarik nomor Cambodia: ${error.message}`);
  }
}
grabberCambodia();

