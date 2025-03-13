const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// 静的ファイルの提供 (index.html, error.html, style.css)
app.use(express.static('public'));

// CSVデータを格納するオブジェクト
let redirectMap = {};

// CSVを読み込んでオブジェクトに格納
function loadRedirects() {
    fs.createReadStream('redirects.csv')
        .pipe(csv())
        .on('data', (row) => {
            redirectMap[row.old_url] = row.new_url;
        })
        .on('end', () => {
            console.log('CSV data loaded.');
        });
}

// サーバー起動時にCSVをロード
loadRedirects();

// URLリダイレクト処理
app.get('/redirect', (req, res) => {
    const oldUrl = req.query.url;

    if (!oldUrl) {
        res.redirect('/');
        return;
    }

    const newUrl = redirectMap[oldUrl];

    if (newUrl) {
        res.redirect(301, newUrl);
    } else {
        // **エラーログを記録**
        const errorMessage = `[${new Date().toISOString()}] ERROR: URL not found - ${oldUrl}\n`;
        fs.appendFile('ERROR.txt', errorMessage, (err) => {
            if (err) console.error('エラーログの書き込みに失敗:', err);
        });

        // **エラーページを表示**
        res.status(404).sendFile(path.join(__dirname, 'public', 'error.html'));
    }
});

// サーバー起動
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
