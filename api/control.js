import axios from 'axios';
import crypto from 'crypto-js';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') return res.status(200).end();

    const accessId = req.body?.accessId || req.query?.accessId;
    const accessSecret = req.body?.accessSecret || req.query?.accessSecret;
    const { action, deviceId, code, value } = req.body || req.query;

    if (!accessId || !accessSecret) return res.status(400).json({ success: false, error: "Missing keys" });

    const t = Date.now().toString();
    const baseUrl = "https://openapi.tuyaeu.com";

    // Fonction de signature ultra-précise conforme à Tuya v2.0
    const calcSign = (method, path, body = '', token = '') => {
        const contentHash = crypto.SHA256(body).toString();
        const stringToSign = [method, contentHash, "", path].join("\n");
        const signStr = accessId + token + t + stringToSign;
        return crypto.HmacSHA256(signStr, accessSecret).toString().toUpperCase();
    };

    try {
        // 1. Demande du Token
        const tokenPath = "/v1.0/token?grant_type=1";
        const tokenSign = calcSign("GET", tokenPath);
        
        const tokenRes = await axios.get(baseUrl + tokenPath, {
            headers: { 'client_id': accessId, 'sign': tokenSign, 't': t, 'sign_method': 'HMAC-SHA256' }
        });

        if (!tokenRes.data.success) return res.json(tokenRes.data);

        const token = tokenRes.data.result.access_token;

        // 2. Exécution de l'action
        const path = (action === 'listDevices') 
            ? "/v1.0/iot-01/associated-users/devices?size=50" 
            : `/v1.0/devices/${deviceId}/commands`;
        
        const method = (action === 'listDevices') ? "GET" : "POST";
        const bodyStr = (action === 'listDevices') ? "" : JSON.stringify({ commands: [{ code, value }] });

        const sign = calcSign(method, path, bodyStr, token);
        
        const result = await axios({
            method,
            url: baseUrl + path,
            headers: {
                'client_id': accessId, 'access_token': token,
                'sign': sign, 't': t, 'sign_method': 'HMAC-SHA256', 'Content-Type': 'application/json'
            },
            data: bodyStr
        });

        return res.json(result.data);
    } catch (e) {
        return res.status(500).json({ success: false, error: e.message });
    }
}
