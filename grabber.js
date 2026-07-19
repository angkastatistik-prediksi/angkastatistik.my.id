const fs = require('fs');
const path = require('path');

const DATA_URL = 'https://angkastatistik.my.id'; 
const filePath = path.join(__dirname, 'result', 'cambodia.js');

async function grabberCambodia() {
    try {
        // Menggunakan fetch bawaan Node.js modern
        const response = await fetch(DATA_URL);
        const data = await response.text();
        const regexArray = data.match(/DATA_PAITO_CAMBODIA\s*=\s*(\[[\s\S]*?\]);/);
        
        if (!regexArray) throw new Error("Gagal menemukan data paito.");
        
        const dataPaito = JSON.parse(regexArray[1]);
        const barisTerakhir = dataPaito[dataPaito.length - 1];
        
        let angkaKeluar = "0000";
        for (let i = barisTerakhir.length - 1; i > 0; i--) {
            if (barisTerakhir[i] && barisTerakhir[i] !== "-") {
                angkaKeluar = barisTerakhir[i];
                break;
            }
        }
        
        const tanggalSekarang = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }) + " WIB";
        
        const isiFileBaru = `// Data Pengeluaran Resmi Cambodia - Otomatis Updated
module.exports = {
    latestResult: "${angkaKeluar}",
    updatedAt: "${tanggalSekarang}"
};`;

        fs.writeFileSync(filePath, isiFileBaru, 'utf-8');
        console.log(`✅ Sukses! Hasil ditulis ke result/cambodia.js -> ${angkaKeluar}`);

    } catch (error) {
        console.error('❌ Gagal ambil data:', error.message);
        process.exit(1);
    }
}

grabberCambodia();
