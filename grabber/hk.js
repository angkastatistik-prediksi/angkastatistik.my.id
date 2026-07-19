const fs = require('fs');
const path = require('path');

const TARGET_URL = 'http://178.128.88'; 
const filePath = path.join(__dirname, '..', 'result', 'hk.js');

async function grabberHK() {
  try {
    const response = await fetch(TARGET_URL);
    const htmlContent = await response.text();
    
    const regexAngka = htmlContent.match(/Result Hongkong 4D.*?(\d{4})/i) || htmlContent.match(/(\d{4})/);
    let angkaKeluar = regexAngka ? regexAngka[1] : "0000";
    
    const tanggalSekarang = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }) + " WIB";
    
    const isiFileBaru = `const DATA_PAITO_HK = "${angkaKeluar}";
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { latestResult: DATA_PAITO_HK, updatedAt: "${tanggalSekarang}" };
}`;

    fs.writeFileSync(filePath, isiFileBaru, 'utf-8');
    console.log(`✅ Sukses memulung nomor HK! Hasil: ${angkaKeluar}`);
  } catch (error) {
    console.error(`❌ Gagal menarik nomor HK: ${error.message}`);
  }
}
grabberHK();
