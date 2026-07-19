const fs = require('fs');
const path = require('path');

const TARGET_URL = 'http://178.128.88'; 
const filePath = path.join(__dirname, '..', 'result', 'taiwan.js');

async function grabberTaiwan() {
  try {
    const response = await fetch(TARGET_URL);
    const htmlContent = await response.text();
    
    const regexAngka = htmlContent.match(/Result Taiwan 4D.*?(\d{4})/i) || htmlContent.match(/(\d{4})/);
    let angkaKeluar = regexAngka ? regexAngka[1] : "0000";
    
    const tanggalSekarang = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }) + " WIB";
    
    const isiFileBaru = `const DATA_PAITO_TAIWAN = "${angkaKeluar}";
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { latestResult: DATA_PAITO_TAIWAN, updatedAt: "${tanggalSekarang}" };
}`;

    fs.writeFileSync(filePath, isiFileBaru, 'utf-8');
    console.log(`✅ Sukses memulung nomor Taiwan! Hasil: ${angkaKeluar}`);
  } catch (error) {
    console.error(`❌ Gagal menarik nomor Taiwan: ${error.message}`);
  }
}
grabberTaiwan();

