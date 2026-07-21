fetch('../result_macau.json')
    .then(response => response.json())
    .then(data => {
        // 1. LIVE DRAW SINGKAT (4D Terakhir)
        const liveBox = document.getElementById('live-4d-box');
        if (liveBox && data.live_4d) {
            liveBox.innerText = data.live_4d;
        }

        // 2. OTOMATISASI TABEL PAITO 6 KOLOM
        const tabelBody = document.getElementById('paito-tbody-data'); 
        if (tabelBody && data.paito_rows) {
            tabelBody.innerHTML = ""; 

            data.paito_rows.forEach(row => {
                let kolomAngka = ["-", "-", "-", "-", "-", "-"];
                for (let i = 0; i < 6; i++) {
                    if (row.angka[i]) {
                        kolomAngka[i] = row.angka[i];
                    }
                }

                let barisHtml = `
                    <tr>
                        <td style="font-weight: bold; text-align: center; background-color: #f7f9fa;">${row.tanggal}</td>
                        <td style="text-align: center;">${kolomAngka[0]}</td>
                        <td style="text-align: center;">${kolomAngka[1]}</td>
                        <td style="text-align: center;">${kolomAngka[2]}</td>
                        <td style="text-align: center;">${kolomAngka[3]}</td>
                        <td style="text-align: center;">${kolomAngka[4]}</td>
                        <td style="text-align: center; font-weight: bold; color: #d9534f;">${kolomAngka[5]}</td>
                    </tr>
                `;
                tabelBody.innerHTML += barisHtml;
            });
        }
    })
    .catch(error => console.error("Gagal memuat data paito otomatis:", error));
