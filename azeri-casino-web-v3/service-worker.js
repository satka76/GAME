self.addEventListener('install', (e)=>{
  e.waitUntil(caches.open('ac-v3').then(c=>c.addAll(['./','index.html','styles.css','app.js','manifest.json','assets/bg.png','assets/flag-az.png','assets/flag-ru.png','assets/bgm.wav'])));
});
self.addEventListener('fetch', (e)=>{
  e.respondWith(caches.match(e.request).then(r=>r || fetch(e.request)));
});
