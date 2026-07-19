const fs = require('fs');
const path = require('path');

const TARGET_URL = 'http://178.128.88'; 
const filePath = path.join(__dirname, '..', 'result', 'sgp.js');

async function grabberSGP() {
  try {
    const response = await fetch(TARGET_URL);
    const htmlContent = await response.text();
    
    const regexAngka = htmlContent.match(/Result Singapore 4D.*?(\d{4})/i) || htmlContent.match(/(\d{4})/);
    let angkaKeluar = regexAngka ? regexAngka[1] : "0000";
    
    const tanggalSekarang = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }) + " WIB";
    
    const isiFileBaru = `const DATA_PAITO_SGP = "${angkaKeluar}";
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { latestResult: DATA_PAITO_SGP, updatedAt: "${tanggalSekarang}" };
}`;

    fs.writeFileSync(filePath, isiFileBaru, 'utf-8');
    console.log(`✅ Sukses memulung nomor SGP! Hasil: ${angkaKeluar}`);
  } catch (error) {
    console.error(`❌ Gagal menarik nomor SGP: ${error.message}`);
  }
}
grabberSGP();
