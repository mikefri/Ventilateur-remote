import axios from 'axios';
import crypto from 'crypto-js';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') return res.status(200).end();

    const accessId = req.body?.accessId || req.query?.accessId;
    const accessSecret = req.body?.accessSecret || req.query?.accessSecret;
    const { action, deviceId, code, value } = req.body || req.query;

    if (!accessId || !accessSecret) return res.status(400).json({ success: false, error: "Cles manquantes" });

    const t = Date.now().toString();
    const baseUrl = "https://openapi.tuyaeu.com";

    try {
        // --- 1. OBTENTION DU TOKEN ---
        const tokenPath = "/v1.0/token?grant_type=1";
        // Pour le token, le corps est vide, donc le hash est fixe
        const tokenContentHash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
        const tokenStringToSign = ["GET", tokenContentHash, "", tokenPath].join("\n");
        const tokenSign = crypto.HmacSHA256(accessId + t + tokenStringToSign, accessSecret).toString().toUpperCase();

        const tokenRes = await axios.get(baseUrl + tokenPath, {
            headers: { 'client_id': accessId, 'sign': tokenSign, 't': t, 'sign_method': 'HMAC-SHA256' }
        });

        if (!tokenRes.data.success) return res.json(tokenRes.data);
        const accessToken = tokenRes.data.result.access_token;

        // --- 2. EXECUTION DE L'ACTION ---
        const path = (action === 'listDevices') 
            ? "/v1.0/iot-01/associated-users/devices?size=50" 
            : `/v1.0/devices/${deviceId}/commands`;
        
        const method = (action === 'listDevices') ? "GET" : "POST";
        const bodyStr = (action === 'listDevices') ? "" : JSON.stringify({ commands: [{ code, value }] });
        
        const contentHash = crypto.SHA256(bodyStr).toString();
        const stringToSign = [method, contentHash, "", path].join("\n");
        const sign = crypto.HmacSHA256(accessId + accessToken + t + stringToSign, accessSecret).toString().toUpperCase();

        const result = await axios({
            method,
            url: baseUrl + path,
            headers: {
                'client_id': accessId, 'access_token': accessToken,
                'sign': sign, 't': t, 'sign_method': 'HMAC-SHA256', 'Content-Type': 'application/json'
            },
            data: bodyStr
        });

        return res.json(result.data);
    } catch (e) {
        return res.status(500).json({ success: false, error: e.message });
    }
}
