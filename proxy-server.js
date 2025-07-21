// proxy-server.js
const express = require('express');
const fetch = require('node-fetch'); // node-fetch をインストールする必要がある場合
const app = express();
const cors = require('cors'); // CORSを許可するため

// CORS設定: 本番環境では、許可するオリジンを具体的に指定することを強く推奨します。
// 例: app.use(cors({ origin: 'https://your-ninja-homepage-url.com' }));
app.use(cors());

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY; // 環境変数からAPIキーを取得
const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

app.get('/api/youtube', async (req, res) => {
    // APIキーが設定されていない場合はエラーを返す
    if (!YOUTUBE_API_KEY) {
        return res.status(500).json({ error: 'Server API Key not configured.' });
    }

    const { endpoint, ...params } = req.query; // フロントエンドから渡されるパラメータ
    let url = `${YOUTUBE_API_BASE_URL}/${endpoint}?`;

    // パラメータをURLに追加
    for (const key in params) {
        url += `${key}=${encodeURIComponent(params[key])}&`;
    }
    url += `key=${YOUTUBE_API_KEY}`; // ここでAPIキーを追加

    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json();
            // YouTube APIからのエラーメッセージをクライアントに転送
            return res.status(response.status).json(errorData);
        }
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ error: 'Failed to fetch data from YouTube API' });
    }
});

const PORT = process.env.PORT || 10000; // Renderは通常、PORT環境変数を自動的に設定します
app.listen(PORT, () => {
    console.log(`Proxy server listening on port ${PORT}`);
});
