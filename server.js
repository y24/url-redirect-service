const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const app = express();
const PORT = 3000;

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
            console.log('CSVデータの読み込み完了');
        });
}

// サーバー起動時にCSVをロード
loadRedirects();

// URLリダイレクト処理
app.get('/', (req, res) => {
    const oldUrl = req.query.url;

    if (!oldUrl) {
        // URL入力フォームを表示
        res.send(`
            <html>
                <head>
                    <title>URLリダイレクトサービス</title>
                    <style>
                        body {
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            height: 100vh;
                            margin: 0;
                            background-color: #f5f5f5;
                            font-family: Arial, sans-serif;
                        }
                        .container {
                            text-align: center;
                            background: white;
                            padding: 30px;
                            border-radius: 10px;
                            box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
                        }
                        h2 {
                            margin-bottom: 20px;
                            color: #333;
                        }
                        input {
                            width: 300px;
                            height: 40px;
                            font-size: 18px;
                            padding: 5px 10px;
                            border: 2px solid #ddd;
                            border-radius: 5px;
                            outline: none;
                            transition: 0.3s;
                        }
                        input:focus {
                            border-color: #007BFF;
                        }
                        button {
                            height: 45px;
                            padding: 0 20px;
                            margin-left: 10px;
                            font-size: 18px;
                            color: white;
                            background-color: #007BFF;
                            border: none;
                            border-radius: 5px;
                            cursor: pointer;
                            transition: 0.3s;
                        }
                        button:hover {
                            background-color: #0056b3;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h2>URLリダイレクトサービス</h2>
                        <form action="/" method="GET">
                            <input type="text" name="url" placeholder="移転元URLを入力" required>
                            <button type="submit">送信</button>
                        </form>
                    </div>
                </body>
            </html>
        `);
        return;
    }

    // URLマップに登録されている場合はリダイレクト
    const newUrl = redirectMap[oldUrl];
    if (newUrl) {
        res.redirect(301, newUrl);
    } else {
        res.status(404).send(`<p>指定されたURLの移転先は見つかりませんでした。</p>`);
    }
});

// サーバー起動
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
