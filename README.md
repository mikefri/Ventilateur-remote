# 🌀 Ventilo Remote Premium

Une application web moderne (**PWA**) pour contrôler vos ventilateurs de plafond compatibles **Tuya Smart / Smart Life**. L'interface est conçue pour être fluide, élégante et installable sur mobile comme une application native.

---

## ✨ Fonctionnalités

* **Contrôle Complet** : Allumer/Éteindre, réglage de la vitesse (1 à 6), direction (Été/Hiver) et minuteur.
* **Gestion de la Lumière** : Contrôle du ON/OFF, de la luminosité et de la température de couleur (Froid/Chaud).
* **Statut Intelligent** : Indicateur visuel en temps réel (**Connecté**, **Synchronisation**, **Déconnecté**) avec animation des pales synchronisée sur la vitesse réelle.
* **PWA (Progressive Web App)** : Interface "Full Screen" sans barre de navigation, icône personnalisée sur l'écran d'accueil et support hors-ligne via Service Worker.
* **Multi-Appareils** : Détection automatique de tous les ventilateurs liés à votre compte Tuya Cloud.

## 📁 Structure du Projet

```text
├── api/                # Logique backend (Cloud Tuya)
├── icon.png            # Icône de l'application (PWA)
├── index.html          # Interface utilisateur (Frontend)
├── manifest.json       # Configuration de l'installation PWA
├── sw.js               # Gestion du cache et mode hors-ligne
└── package.json        # Dépendances et scripts
🚀 Installation rapide
Hébergement : Déposez les fichiers sur votre serveur Web (Vercel, GitHub Pages, ou un serveur local).

Configuration Tuya :

Rendez-vous sur le Tuya IoT Platform.

Créez un projet "Cloud" et récupérez votre Access ID et Access Secret.

Premier lancement :

Ouvrez l'URL de votre application.

Cliquez sur l'icône ⚙️ (engrenage) pour entrer vos identifiants.

📱 Utilisation sur Mobile
Pour une expérience optimale, installez l'application sur votre téléphone :

Sur iOS (Safari) : Appuyez sur Partager (icône carré avec flèche) -> "Sur l'écran d'accueil".

Sur Android (Chrome) : Cliquez sur les trois points en haut à droite -> "Installer l'application".

🛠️ Technologies
Frontend : HTML5, CSS3 (Bootstrap 5, FontAwesome 6), JavaScript (ES6+).

Backend : Tuya IoT Core SDK.

Mobile : PWA (Web Manifest & Service Workers).
