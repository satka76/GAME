// i18n
const I18N = {
  az: {
    app_title: 'Mini Oyunlar • Azeri Casino Stili',
    pick_game: 'Oyun seçin',
    back: 'Geri',
    coins_label: 'Sikkələr',
    responsible_short: 'Məsuliyyətlə oynayın • 18+',
    cost_per_play: 'Oyun dəyəri: 5',
    slots: 'Slot maşını', dice: 'Zər atma', cards: 'Kart aç',
    spin: 'Fırlat', roll: 'At', choose_higher: 'Yuxarı gələcək', choose_lower: 'Aşağı gələcək',
    bet_place: 'Bahis qoy: 5', you_won: 'Uduş!', you_lost: 'Uduzdu',
    no_coins: 'Sikkələr kifayət deyil', rolled: 'Zər nəticəsi', pick_a_card: 'Kart seçin',
    card_prize: 'Mükafat',
    ad_title_big: 'Təbrik edirik!',
    ad_copy_center: 'Sizi burada gözləyirik — Dicebet.',
    ad_go_center: 'Buraya keç',
    ad_close: 'Bağla'
  },
  ru: {
    app_title: 'Мини‑игры • Азербайджанский стиль',
    pick_game: 'Выберите игру',
    back: 'Назад',
    coins_label: 'Монеты',
    responsible_short: 'Играйте ответственно • 18+',
    cost_per_play: 'Цена игры: 5',
    slots: 'Слот‑машина', dice: 'Кости', cards: 'Выбор карты',
    spin: 'Крутить', roll: 'Бросить', choose_higher: 'Выпадет выше', choose_lower: 'Выпадет ниже',
    bet_place: 'Ставка: 5', you_won: 'Выигрыш!', you_lost: 'Проигрыш',
    no_coins: 'Недостаточно монет', rolled: 'Результат броска', pick_a_card: 'Выберите карту',
    card_prize: 'Приз',
    ad_title_big: 'Поздравляем!',
    ad_copy_center: 'Ждём вас здесь — Dicebet.',
    ad_go_center: 'Перейти',
    ad_close: 'Закрыть'
  }
};

const ICONS = ['\u{1F352}', '\u2615\uFE0F', '\u{1F33F}', '\u{1F369}', '\u{1F3F5}\uFE0F']; // nar, çay, leaf, paxlava, bayraq
let state = {
  lang: 'az',
  coins: 100,
  screen: 'menu',
  plays: 0,          // total plays across games
  adShown: false,
  muted: false
};

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

function t(key){ return I18N[state.lang][key] || key; }
function fmt(){
  $$('#app [data-i18n]').forEach(n => n.textContent = t(n.dataset.i18n));
  $('#appTitle').textContent = t('app_title');
  $('#coins').textContent = state.coins;
  $('#backBtn').hidden = (state.screen === 'menu');
  document.documentElement.lang = state.lang;
  $('#muteBtn').textContent = state.muted ? '🔈' : '🔊';
}
function goto(screen){
  state.screen = screen;
  $$('.screen').forEach(s => s.classList.add('hidden'));
  $('#screen' + cap(screen)).classList.remove('hidden');
  fmt();
}
function cap(s){ return s.charAt(0).toUpperCase() + s.slice(1); }

function onPlayed(){
  state.plays += 1;
  if (!state.adShown && state.plays >= 3) {
    state.adShown = true;
    $('#adModal').classList.remove('hidden');
  }
}

function addCoins(n){ state.coins += n; fmt(); }
function spendCoins(n){
  if (state.coins < n) { alert(t('no_coins')); return false; }
  state.coins -= n; fmt(); return true;
}

// Language
$('#langAZ').onclick = ()=>{ state.lang='az'; fmt(); };
$('#langRU').onclick = ()=>{ state.lang='ru'; fmt(); };

// Music
const bgm = $('#bgm');
$('#muteBtn').onclick = ()=>{
  state.muted = !state.muted;
  bgm.muted = state.muted;
  if (!state.muted && bgm.paused) bgm.play().catch(()=>{});
  fmt();
};
// try autoplay low volume after user interaction
window.addEventListener('click', () => { if (!state.muted) bgm.play().catch(()=>{}); }, { once: true });

// Navigation
$('#backBtn').onclick = ()=> goto('menu');
$$('.card.clickable').forEach(el => el.onclick = () => goto(el.dataset.next));

// Slots
$('#spinBtn').onclick = async () => {
  if (!spendCoins(5)) return;
  const roll = () => ICONS[Math.floor(Math.random()*ICONS.length)];
  for (let i=0;i<12;i++){ await wait(60);
    $('#reel1').textContent = roll(); $('#reel2').textContent = roll(); $('#reel3').textContent = roll();
  }
  await wait(100);
  const a = roll(), b = roll(), c = roll();
  $('#reel1').textContent=a; $('#reel2').textContent=b; $('#reel3').textContent=c;
  let won = 0;
  if (a===b && b===c) won = 20; else if (a===b || b===c || a===c) won = 10;
  $('#slotsMsg').textContent = won ? t('you_won') : t('you_lost');
  if (won) addCoins(won);
  onPlayed();
};

// Dice
let dicePick = 'higher';
$('#pickHigher').onclick = ()=>{ dicePick='higher'; $('#pickHigher').dataset.selected=true; $('#pickLower').dataset.selected=false; };
$('#pickLower').onclick = ()=>{ dicePick='lower'; $('#pickLower').dataset.selected=true; $('#pickHigher').dataset.selected=false; };
$('#rollBtn').onclick = () => {
  if (!spendCoins(5)) return;
  const r = 1 + Math.floor(Math.random()*6);
  const success = (dicePick==='higher' && r>=4) || (dicePick==='lower' && r<=3);
  $('#diceResult').textContent = `${t('rolled')}: ${r} • ${success?t('you_won'):t('you_lost')}`;
  if (success) addCoins(10);
  onPlayed();
};

// Cards
let prizes = shuffle([0,0,10]);
let chosen = false;
$$('.cardx').forEach(btn => btn.onclick = () => {
  if (chosen) return;
  if (!spendCoins(5)) return;
  const idx = Number(btn.dataset.idx);
  const prize = prizes[idx];
  chosen = true;
  btn.textContent = prize>0 ? `🏆 +${prize}` : '—';
  $('#cardsMsg').textContent = prize>0 ? `${t('card_prize')}: +${prize}` : t('you_lost');
  if (prize>0){ addCoins(prize); }
  setTimeout(()=>{ prizes = shuffle([0,0,10]); chosen=false; $$('.cardx').forEach(b=>b.textContent='🂠'); $('#cardsMsg').textContent=''; }, 1200);
  onPlayed();
});

// Modal

// --- close modal helpers
function hideAd(){ $('#adModal').classList.add('hidden'); }
$('#closeAd').onclick = hideAd;
const backdrop = $('#adBackdrop'); if (backdrop) backdrop.onclick = hideAd;
window.addEventListener('keydown', (e)=>{ if(e.key==='Escape'){ hideAd(); } });


// Helpers
function wait(ms){ return new Promise(res=>setTimeout(res, ms)); }
function shuffle(a){ a=[...a]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]];} return a; }

// Init
fmt();
goto('menu');
