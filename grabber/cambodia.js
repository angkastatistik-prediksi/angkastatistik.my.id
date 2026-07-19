const fs = require('fs');
const path = require('path');

const DAFTAR_SITUS = [
  'https://livecmd.live',
  'https://masterlive.net',
  'https://live-drawcambodia.shop',
  'https://livecambodia.cyou'
];

// Jalur khusus untuk masuk ke folder result dari dalam folder grabber
const filePath = path.join(__dirname, '..', 'result', 'cambodia.js');

function ekstrakNomorSah(htmlContent) {
  const teksBersih = htmlContent.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>/gi, " ");
  const cocokPrize = teksBersih.match(/1st\s*Prize[\s\S]*?(\d{4})/i);
  if (cocokPrize && cocokPrize[1]) return cocokPrize[1];
  const cocokTerbalik = teksBersih.match(/(\d{4})[\s\S]*?1st\s*Prize/i);
  if (cocokTerbalik && cocokTerbalik[1]) return cocokTerbalik[1];
  return null;
}

async function grabberCambodia() {
  let angkaKeluar = null;
  for (let i = 0; i < DAFTAR_SITUS.length; i++) {
    try {
      console.log(`📡 Memeriksa: ${DAFTAR_SITUS[i]}`);
      const response = await fetch(DAFTAR_SITUS[i], { 
        method: 'GET',
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        signal: AbortSignal.timeout(7000) 
      });
      const htmlContent = await response.text();
      angkaKeluar = ekstrakNomorSah(htmlContent);
      if (angkaKeluar && angkaKeluar !== "0000" && angkaKeluar.length === 4) {
        console.log(`🎯 ANGKA KETEMU -> ${angkaKeluar}`);
        break; 
      }
    } catch (err) {
      console.log(`❌ Gagal: ${err.message}`);
    }
  }

  if (!angkaKeluar) {
    console.error("🚨 Semua situs gagal.");
    return;
  }

  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const matchArray = fileContent.match(/const\s+DATA_PAITO_CAMBODIA\s*=\s*(\[[\s\S]*?\]);/);
    if (!matchArray) throw new Error("Struktur rusak!");

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
    const isiFileBaru = `const DATA_PAITO_CAMBODIA = ${JSON.stringify(dataPaito, null, 2)};\n\nif (typeof module !== 'undefined' && module.exports) {\n    module.exports = { latestResult: "${angkaKeluar}", updatedAt: "${tanggalUpdate}" };\n}`;
    fs.writeFileSync(filePath, isiFileBaru, 'utf-8');
    console.log(`✅ BERHASIL UPDATE KE FILE RESULT!`);
  } catch (error) {
    console.error(`❌ Gagal: ${error.message}`);
  }
}

grabberCambodia();
