self.addEventListener('fetch', function(event) {
  // Ce script permet à l'app de fonctionner même avec une connexion instable
  event.respondWith(fetch(event.request));
});
