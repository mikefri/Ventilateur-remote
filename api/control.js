import { TuyaContext } from '@tuya/tuya-connector-nodejs';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ msg: 'Méthode non autorisée' });

  const { accessId, accessSecret, deviceId, action, code, value } = req.body;

  // Initialisation du contexte Tuya
  const tuya = new TuyaContext({
    baseUrl: 'https://openapi.tuyaeu.com', // Correspond au "Central Europe Data Center" de votre image
    accessKey: accessId,
    secretKey: accessSecret,
  });

  try {
    let response;

    if (action === 'getStatus') {
      // Appel GET vers le statut (Référence à votre capture d'écran)
      response = await tuya.request({
        path: `/v1.0/devices/${deviceId}/status`,
        method: 'GET'
      });
    } 
    else if (action === 'sendCommand') {
      // Appel POST pour envoyer une commande
      response = await tuya.request({
        path: `/v1.0/devices/${deviceId}/commands`,
        method: 'POST',
        body: {
          "commands": [{ "code": code, "value": value }]
        }
      });
    } else {
      return res.status(400).json({ success: false, msg: 'Action inconnue' });
    }

    // Tuya renvoie souvent les données dans .result, on s'assure de renvoyer un objet propre
    return res.status(200).json({
      success: response.success,
      result: response.result,
      tid: response.tid
    });

  } catch (error) {
    console.error("Tuya API Error:", error);
    res.status(500).json({ 
      success: false, 
      msg: error.message,
      details: "Vérifiez vos identifiants Cloud Tuya et l'ID de l'appareil."
    });
  }
}
