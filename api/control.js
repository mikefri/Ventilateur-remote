import axios from 'axios';
import crypto from 'crypto-js';

export default async function handler(req, res) {
    // Configuration des headers CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { action, accessId, accessSecret, deviceId, code, value } = req.body;
    const t = Date.now().toString();
    const baseUrl = "https://openapi.tuyaeu.com";

    // Fonction de signature Tuya
    const signRequest = (method, path, body = '', token = '') => {
        const contentHash = crypto.SHA256(body).toString();
        const stringToSign = [method, contentHash, "", path].join("\n");
        const signStr = accessId + token + t + stringToSign;
        return crypto.HmacSHA256(signStr, accessSecret).toString().toUpperCase();
    };

    try {
        // 1. OBTENTION DU TOKEN
        const tokenPath = "/v1.0/token?grant_type=1";
        const tokenSign = signRequest("GET", tokenPath);
        
        const tokenResponse = await axios.get(`${baseUrl}${tokenPath}`, {
            headers: {
                'client_id': accessId,
                'sign': tokenSign,
                't': t,
                'sign_method': 'HMAC-SHA256'
            }
        });

        if (!tokenResponse.data.success) {
            return res.status(401).json({ success: false, msg: "Tuya Auth Failed", detail: tokenResponse.data.msg });
        }

        const accessToken = tokenResponse.data.result.access_token;

        // 2. GESTION DES ACTIONS
        switch (action) {
            case 'listDevices':
                const listPath = "/v1.0/iot-01/associated-users/devices?size=50";
                const listSign = signRequest("GET", listPath, "", accessToken);
                const listRes = await axios.get(`${baseUrl}${listPath}`, {
                    headers: {
                        'client_id': accessId,
                        'access_token': accessToken,
                        'sign': listSign,
                        't': t,
                        'sign_method': 'HMAC-SHA256'
                    }
                });
                // Filtre : Catégorie 'fs' = Fans
                const fans = listRes.data.result.devices.filter(d => d.category === 'fs');
                return res.json({ success: true, result: fans });

            case 'getStatus':
                const statusPath = `/v1.0/devices/${deviceId}/status`;
                const statusSign = signRequest("GET", statusPath, "", accessToken);
                const statusRes = await axios.get(`${baseUrl}${statusPath}`, {
                    headers: {
                        'client_id': accessId,
                        'access_token': accessToken,
                        'sign': statusSign,
                        't': t,
                        'sign_method': 'HMAC-SHA256'
                    }
                });
                return res.json(statusRes.data);

            case 'sendCommand':
                const commandPath = `/v1.0/devices/${deviceId}/commands`;
                const commandBody = JSON.stringify({ commands: [{ code, value }] });
                const commandSign = signRequest("POST", commandPath, commandBody, accessToken);
                const commandRes = await axios.post(`${baseUrl}${commandPath}`, commandBody, {
                    headers: {
                        'client_id': accessId,
                        'access_token': accessToken,
                        'sign': commandSign,
                        't': t,
                        'sign_method': 'HMAC-SHA256',
                        'Content-Type': 'application/json'
                    }
                });
                return res.json(commandRes.data);

            default:
                return res.status(400).json({ success: false, msg: "Action inconnue" });
        }

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}
