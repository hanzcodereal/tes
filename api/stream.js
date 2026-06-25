const https = require('https');
const http = require('http');
const url = require('url');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'GET') {
        res.status(405).json({ status: false, message: 'Method not allowed' });
        return;
    }

    const videoId = (req.query.id || '').trim();
    if (!videoId) {
        res.status(400).json({ status: false, message: 'Parameter id wajib diisi' });
        return;
    }

    try {
        const audioUrl = await getAudioUrl(videoId);
        
        if (!audioUrl) {
            res.status(503).json({ 
                status: false, 
                message: 'Gagal mendapatkan URL audio' 
            });
            return;
        }

        const parsedUrl = new URL(audioUrl);
        const client = parsedUrl.protocol === 'https:' ? https : http;

        const requestOptions = {
            hostname: parsedUrl.hostname,
            path: parsedUrl.pathname + parsedUrl.search,
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/149.0.0.0 Safari/537.36',
                'Range': req.headers.range || '',
                'Referer': 'https://music.youtube.com/',
                'Origin': 'https://music.youtube.com'
            }
        };

        const proxyReq = client.request(requestOptions, (proxyRes) => {
            res.writeHead(proxyRes.statusCode, {
                'Content-Type': proxyRes.headers['content-type'] || 'audio/mpeg',
                'Content-Length': proxyRes.headers['content-length'],
                'Accept-Ranges': 'bytes',
                'Content-Range': proxyRes.headers['content-range']
            });
            proxyRes.pipe(res);
        });

        proxyReq.on('error', (err) => {
            res.status(500).json({ status: false, message: 'Stream error: ' + err.message });
        });

        proxyReq.on('timeout', () => {
            proxyReq.destroy();
            res.status(504).json({ status: false, message: 'Timeout' });
        });

        proxyReq.setTimeout(30000);
        proxyReq.end();

    } catch (error) {
        res.status(500).json({ status: false, message: 'Error: ' + error.message });
    }
};

async function getAudioUrl(videoId) {
    const videoUrl = 'https://youtube.com/watch?v=' + videoId;
    
    const methods = [
        getDownloadSavetube,
        getCobaltAudio,
        getLexcodeAudio
    ];

    for (const method of methods) {
        try {
            const result = await method(videoUrl);
            if (result) return result;
        } catch (e) {
            continue;
        }
    }
    return null;
}

function getDownloadSavetube(urlStr) {
    return new Promise((resolve, reject) => {
        const parsedUrl = new URL(urlStr);
        const videoId = extractVideoId(urlStr);
        if (!videoId) { reject(new Error('Invalid video ID')); return; }

        const options = {
            hostname: 'media.savetube.vip',
            path: '/api/random-cdn',
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 Chrome/120.0.0.0',
                'Accept': 'application/json'
            },
            rejectUnauthorized: false,
            timeout: 10000
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    let cdns = [];
                    if (json && Array.isArray(json.cdns)) cdns = json.cdns;
                    else if (json && json.cdn) cdns = [json.cdn];
                    if (cdns.length === 0) cdns = ['cdn305.savetube.vip', 'cdn105.savetube.vip'];

                    const baseHeaders = { 'origin': 'https://yt.savetube.me' };
                    
                    (async function tryCdns() {
                        for (const cdn of cdns) {
                            try {
                                const infoRes = await requestJSON('https://' + cdn + '/v2/info', 'POST', { url: urlStr }, baseHeaders, 12000);
                                const encData = infoRes && infoRes.data;
                                if (!encData) continue;

                                const crypto = require('crypto');
                                const encrypted = Buffer.from(encData, 'base64');
                                const decipher = crypto.createDecipheriv(
                                    'aes-128-cbc',
                                    Buffer.from('C5D58EF67A7584E4A29F6C35BBC4EB12', 'hex'),
                                    encrypted.slice(0, 16)
                                );
                                const decryptedBuf = Buffer.concat([decipher.update(encrypted.slice(16)), decipher.final()]);
                                const decrypted = JSON.parse(decryptedBuf.toString());
                                if (!decrypted.key) continue;

                                const dlRes = await requestJSON('https://' + cdn + '/download', 'POST', {
                                    id: videoId, downloadType: 'audio', quality: '128', key: decrypted.key
                                }, baseHeaders, 12000);

                                const downloadUrl = dlRes && ((dlRes.data && dlRes.data.downloadUrl) || dlRes.downloadUrl);
                                if (downloadUrl) {
                                    resolve(downloadUrl);
                                    return;
                                }
                            } catch (e) { continue; }
                        }
                        reject(new Error('All CDNs failed'));
                    })();
                } catch (e) { reject(e); }
            });
        });
        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
        req.end();
    });
}

function getCobaltAudio(urlStr) {
    return new Promise((resolve, reject) => {
        const instances = [
            'https://api.cobalt.tools/api/json',
            'https://co.wuk.sh/api/json'
        ];

        (async function tryInstances() {
            for (const instance of instances) {
                try {
                    const result = await requestJSON(instance, 'POST', {
                        url: urlStr, downloadMode: 'audio', audioFormat: 'mp3', audioBitrate: '128'
                    }, { 'Accept': 'application/json' }, 10000);
                    if (result && result.url) {
                        resolve(result.url);
                        return;
                    }
                } catch (e) { continue; }
            }
            reject(new Error('All cobalt instances failed'));
        })();
    });
}

function getLexcodeAudio(urlStr) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.lexcode.biz.id',
            path: '/api/dwn/ytplay?q=' + encodeURIComponent(urlStr),
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 Chrome/120.0.0.0',
                'Accept': 'application/json'
            },
            rejectUnauthorized: false,
            timeout: 20000
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (!json) { reject(new Error('No data')); return; }
                    
                    function findAudioUrl(obj, depth) {
                        depth = depth || 0;
                        if (depth > 10 || !obj || typeof obj !== 'object') return '';
                        if (Array.isArray(obj)) {
                            for (const item of obj) {
                                const found = findAudioUrl(item, depth + 1);
                                if (found) return found;
                            }
                            return '';
                        }
                        for (const key of Object.keys(obj)) {
                            const val = obj[key];
                            if (typeof val === 'string' && /^https?:\/\//.test(val) && 
                                (val.includes('.mp3') || val.includes('audio') || val.includes('stream'))) {
                                return val;
                            }
                            if (typeof val === 'object') {
                                const found = findAudioUrl(val, depth + 1);
                                if (found) return found;
                            }
                        }
                        return '';
                    }
                    
                    const found = findAudioUrl(json);
                    if (found) {
                        resolve(found);
                    } else {
                        reject(new Error('Audio URL not found'));
                    }
                } catch (e) { reject(e); }
            });
        });
        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
        req.end();
    });
}

function extractVideoId(urlStr) {
    const patterns = [
        /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
        /youtu\.be\/([a-zA-Z0-9_-]{11})/
    ];
    for (const pattern of patterns) {
        const match = urlStr.match(pattern);
        if (match) return match[1];
    }
    return null;
}

function requestJSON(urlStr, method, body, extraHeaders, timeoutMs) {
    return new Promise((resolve, reject) => {
        const parsedUrl = new URL(urlStr);
        const payload = body ? JSON.stringify(body) : null;
        const headers = Object.assign({
            'User-Agent': 'Mozilla/5.0 Chrome/120.0.0.0',
            'Accept': 'application/json'
        }, extraHeaders || {});
        if (payload) {
            headers['Content-Type'] = 'application/json';
            headers['Content-Length'] = Buffer.byteLength(payload);
        }
        const options = {
            hostname: parsedUrl.hostname,
            path: parsedUrl.pathname + (parsedUrl.search || ''),
            method: method,
            headers: headers,
            rejectUnauthorized: false,
            timeout: timeoutMs || 15000
        };
        const client = parsedUrl.protocol === 'https:' ? https : http;
        const req = client.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    resolve(null);
                }
            });
        });
        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
        if (payload) req.write(payload);
        req.end();
    });
}