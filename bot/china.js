const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const URL = 'https://nagasaon4d6.com/data-chinapools/';
const FILE = path.join(__dirname, '..', 'result', 'china.html');

(async () => {
    try {
        const { data } = await axios.get(URL, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const $ = cheerio.load(data);
        let rows = '';

        $('table').first().find('tbody tr').each((_, el) => {
            const tds = $(el).find('td');
            if (tds.length >= 7) {
                rows += `                    <tr>\n` + 
                        Array.from({length: 7}, (_, i) => `                        <td>${$(tds[i]).text().trim()}</td>\n`).join('') + 
                        `                    </tr>\n`;
            }
        });

        if (!rows) return console.log("Gagal ekstrak tabel China.");
        
        let html = fs.readFileSync(FILE, 'utf8');
        html = html.replace(/<tbody>[\s\S]*?<\/tbody>/, `<tbody>\n${rows}                    </tbody>`);
        fs.writeFileSync(FILE, html, 'utf8');
        console.log("Sukses update China!");
    } catch (err) {
        console.error("Error China:", err.message);
    }
})();
