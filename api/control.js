import { TuyaContext } from '@tuya/tuya-connector-nodejs';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { action, accessId, accessSecret, deviceId, code, value } = req.body || {};

    if (!accessId || !accessSecret) {
        return res.status(400).json({ success: false, msg: "Clés manquantes" });
    }

    const tuya = new TuyaContext({
        baseUrl: 'https://openapi.tuyaeu.com',
        accessKey: accessId,
        secretKey: accessSecret,
    });

    try {
        let response;
        if (action === 'listDevices') {
            const rawResponse = await tuya.request({
                path: '/v1.0/iot-01/associated-users/devices?size=50',
                method: 'GET'
            });

            if (rawResponse.success) {
                // On filtre pour ne garder que la catégorie 'fs' (Fan System) 
                // OU les appareils dont le nom contient "ventilo"
                const devices = rawResponse.result.devices || rawResponse.result;
                const filtered = devices.filter(d => 
                    d.category === 'fsd' || 
                    d.name.toLowerCase().includes('ventilo') 
                );

                // On reconstruit la réponse avec uniquement les ventilateurs
                response = {
                    ...rawResponse,
                    result: rawResponse.result.devices ? { ...rawResponse.result, devices: filtered } : filtered
                };
            } else {
                response = rawResponse;
            }
        } else {
            response = await tuya.request({
                path: `/v1.0/devices/${deviceId}/commands`,
                method: 'POST',
                body: { "commands": [{ "code": code, "value": value }] }
            });
        }
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({ success: false, msg: error.message });
    }
}
