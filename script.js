'use strict';

const STORAGE_KEY = 'aether-visual-novel-v1';
// Метаданные: stories/katabasis/index.js, эпизоды: episode-XX.js.
const ART = {katabasis:'assets/promo-katabasis.png'};
const MUSIC_URL = 'assets/music-background.mp3';
// Коллекция. Карточки хранятся в браузере; позже источниками наград
// могут стать задания, ежедневные входы и новые сцены.
const COLLECTION_CARDS = Object.freeze([
 {id:'knife-memory', title:'Ночь без памяти', story:'Катабасис',
  description:'Фрагмент ночи, с которой всё началось.', image:'assets/cut-scene1.png', rarity:'story'},
 {id:'aether-memory', title:'За гранью звёзд', story:'Архив AETHER',
  description:'Редкая памятная иллюстрация из первых историй AETHER.', image:'assets/cutscene-aether-01.png', rarity:'rare'}
]);
const STARTER_CARDS = Object.freeze(['aether-memory']);
function getCollected(){
 data.collection ||= {};
 for(const id of STARTER_CARDS) data.collection[id] ||= {receivedAt:'starter'};
 return data.collection;
}
function earnCard(id){
 if(!COLLECTION_CARDS.some(card=>card.id===id))return false;
 const collection=getCollected();
 if(collection[id])return false;
 collection[id]={receivedAt:new Date().toISOString()};
 return true;
}

// Выбор внешности для «Катабасиса». Сохраняется отдельно в прогрессе истории.
const KATABASIS_LOOKS = Object.freeze({
 black: {label:'Брюнетка', image:'assets/mc-default-black.png'},
 red:   {label:'Рыжая', image:'assets/mc-default-red.png'},
 blond: {label:'Блондинка', image:'assets/mc-default-blond.png'}
});
const KATABASIS_WARDROBE = 'assets/гардероб.png';
function currentKatabasisLook(progress){
 const id=progress?.appearance;
 return Object.hasOwn(KATABASIS_LOOKS,id)?id:'black';
}
// Одна точка выбора спрайта: новые обычные реплики ГГ автоматически
// показывают вариант внешности, выбранный игроком.
function resolveKatabasisSprite(node,progress){
 if((node.speaker||'').trim()!=='Героиня')return node.sprite||'';
 const choice=currentKatabasisLook(progress);
 const normal=KATABASIS_LOOKS[choice].image;
 if(!node.sprite || /^assets\/mc-default(?:-(?:black|red|blond))?\.png$/.test(node.sprite))return normal;
 // Для раненой героини пока подготовлена только брюнетка.
 // Для других вариантов сохраняем выбранный цвет волос, показывая
 // обычный спрайт до появления альтернативных раненых моделей.
 if(node.sprite==='assets/mc-pain.png')return choice==='black'?node.sprite:normal;
 return node.sprite;
}
const KATABASIS_BACKGROUNDS = {
 street: 'assets/street.png',
 hospitalNight: 'assets/hospital-night.png',
 hospitalDay: 'assets/hospital-day.png'
};
// Нота с диагональной чертой означает выключенный звук во всех экранах.
function musicGlyph(){
 return `<svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V6l11-2v12"/><ellipse cx="6.3" cy="18.2" rx="2.7" ry="1.9"/><ellipse cx="17.3" cy="16.2" rx="2.7" ry="1.9"/>${musicOn?'':'<path d="M3 3l18 18" stroke-width="2.2"/>'}</svg>`;
}
function musicButton(){
 const label=musicOn?'Музыка включена — выключить':'Музыка выключена — включить';
 return btnIcon(musicGlyph(),'toggle-music',`aria-label="${label}" title="${label}" aria-pressed="${musicOn}"`);
}
function syncMusicButtons(){
 document.querySelectorAll('.icon-button[data-action="toggle-music"]').forEach(button=>{
  const label=musicOn?'Музыка включена — выключить':'Музыка выключена — включить';
  button.innerHTML=musicGlyph(); button.title=label;
  button.setAttribute('aria-label',label); button.setAttribute('aria-pressed',String(musicOn));
 });
 const settingsButton=document.querySelector('.modal-row [data-action="toggle-music"]');
 if(settingsButton)settingsButton.textContent=musicOn?'Включена ✓':'Выключена';
}
const PORTRAITS = ['assets/figure-f.svg','assets/figure.svg','assets/figure-f.svg','assets/figure.svg','assets/figure-f.svg','assets/figure.svg','assets/figure-f.svg','assets/figure.svg'];
const CAST = []; // Персонажи Катабасиса будут добавлены по мере написания истории.
const STORIES = {katabasis:window.AETHER_STORIES?.katabasis};
const EPISODES = window.AETHER_EPISODES || {};
const DEFAULT_EPISODE = 'episode-01';
function episodeDefinition(id=DEFAULT_EPISODE){return EPISODES[activeStory]?.[id] || null;}
function currentEpisode(){return episodeDefinition(data.progress[activeStory]?.episodeId || DEFAULT_EPISODE);}
function currentNodes(){return currentEpisode()?.nodes || {};}
for(const [id,story] of Object.entries(STORIES)){
 if(!story) throw new Error(`Не найдены настройки истории ${id} — проверь stories/${id}/index.js.`);
}
const STORY_COUNT = Object.keys(STORIES).length;
if(!EPISODES.katabasis?.[DEFAULT_EPISODE])throw new Error('Не найден stories/katabasis/episode-01.js. Проверь подключение в index.html.');
const DEFAULT = {prefs:{name:'Странница',avatar:0,favoriteStory:'katabasis',favoriteCharacters:[],voiceEnabled:true}, progress:{},collection:{'aether-memory':{receivedAt:'starter'}}};
function loadData(){try{const result=JSON.parse(localStorage.getItem(STORAGE_KEY));if(result&&result.prefs&&result.progress)return result;}catch(err){}return structuredClone(DEFAULT);}
let data=loadData();
getCollected(); // безопасная миграция существующих сохранений v18
// Старые демо-истории больше не отображаются; прогресс по ним остаётся
// в localStorage на случай, если понадобится его восстановить.
if(!STORIES[data.prefs.favoriteStory])data.prefs.favoriteStory='katabasis';
data.prefs.favoriteCharacters=(data.prefs.favoriteCharacters||[]).filter(id=>CAST.some(c=>c.id===id));
// Пролог Катабасиса полностью заменён: старую демо-позицию сбрасываем один раз.
if(data.progress.katabasis && !data.progress.katabasis.isKatabasisV13){delete data.progress.katabasis;try{localStorage.setItem(STORAGE_KEY,JSON.stringify(data));}catch(err){}}

// Миграция сохранений v17: текущий кадр и принятые решения остаются в эпизоде 1.
if(data.progress.katabasis?.isKatabasisV13){
 const p=data.progress.katabasis;
 p.episodeId=p.episodeId||DEFAULT_EPISODE;
 if(!p.episodes)p.episodes={[DEFAULT_EPISODE]:{started:!!p.started,node:p.node||'start',completed:!!p.completed}};
 p.episodes[DEFAULT_EPISODE] ||= {started:!!p.started,node:p.node||'start',completed:!!p.completed};
 try{localStorage.setItem(STORAGE_KEY,JSON.stringify(data));}catch(err){}
}

// Выдать сюжетную карточку игрокам, уже посмотревшим эту сцену до v19.
if((data.progress.katabasis?.history||[]).some(h=>h.text==='Как я тут оказалась?..')){
 if(earnCard('knife-memory'))try{localStorage.setItem(STORAGE_KEY,JSON.stringify(data));}catch(err){}
}

let screen='loading', activeStory='katabasis', profileDraft=null, appearanceDraft='black', pendingEpisode='episode-01', modal=null, selectedCardId=null, note='', musicOn=false;
let soundtrack=null;
// Отдельный звуковой канал для реплик: MP3 подгружается только по необходимости.
let voiceOn=data.prefs.voiceEnabled!==false;
let voiceAudio=null, voiceSceneKey=null;
function voiceGlyph(){
 return `<svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4Z"/>${voiceOn?'<path d="M16 9a4 4 0 0 1 0 6M19 6a8 8 0 0 1 0 12"/>':'<path d="M3 3l18 18" stroke-width="2.2"/>'}</svg>`;
}
function voiceButton(){
 const label=voiceOn?'Озвучка включена — выключить':'Озвучка выключена — включить';
 return btnIcon(voiceGlyph(),'toggle-voice',`aria-label="${label}" title="${label}" aria-pressed="${voiceOn}"`);
}
function syncVoiceButtons(){
 document.querySelectorAll('[data-action="toggle-voice"]').forEach(button=>{
  if(button.classList.contains('icon-button'))button.innerHTML=voiceGlyph();
  else button.textContent=voiceOn?'Включена ✓':'Выключена';
  const label=voiceOn?'Озвучка включена — выключить':'Озвучка выключена — включить';
  button.title=label;button.setAttribute('aria-label',label);
  button.setAttribute('aria-pressed',String(voiceOn));
 });
}
function stopVoice(){
 if(voiceAudio){ voiceAudio.pause();voiceAudio.removeAttribute('src');voiceAudio.load();voiceAudio=null; }
 voiceSceneKey=null;
}
function syncVoiceForScene(node,sceneKey){
 if(!voiceOn || !node?.voice || node.hideDialogue || node.blackout){
  if(voiceSceneKey!==sceneKey || !voiceOn)stopVoice();
  return;
 }
 const key=`${sceneKey}:${node.voice}`;
 if(voiceSceneKey===key)return; // настройки/журнал не должны повторять фразу
 stopVoice();voiceSceneKey=key;
 try{
  const audio=new Audio(node.voice);
  audio.preload='none';audio.volume=.9;
  voiceAudio=audio;
  audio.play().catch(()=>{}); // отсутствующий файл или запрет браузера = тишина
 }catch(error){stopVoice();}
}
function toggleVoice(){
 voiceOn=!voiceOn;
 data.prefs.voiceEnabled=voiceOn;
 persist();
 stopVoice();
 if(voiceOn&&screen==='game'){
  const p=gameState();const node=currentNodes()[p.node];
  if(node&&!node.end)syncVoiceForScene(node,`${activeStory}:${p.episodeId}:${p.node}`);
 }
 syncVoiceButtons();
}

const app=document.getElementById('app');
const htmlEsc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const artStyle=k=>!ART[k]
 ? `style="--art:radial-gradient(ellipse at 70% 18%,rgba(157,100,105,.31),transparent 42%),radial-gradient(ellipse at 25% 65%,rgba(78,88,112,.36),transparent 58%),linear-gradient(150deg,#29212c,#111621 52%,#070b12)"`
 : `style="--art:url('${ART[k]}')"`;
const portrait=(index,extraClass='',customImage=null)=>`<span class="avatar a${(index%8)+1} ${extraClass}"><img src="${customImage||PORTRAITS[index%8]}" alt="" /></span>`;
function persist(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(data));}catch(err){}}
function btnIcon(symbol,action,extra=''){return `<button class="icon-button" data-action="${action}" ${extra}>${symbol}</button>`;}
function screenHeader(title,back='home'){return `<div class="page-top">${btnIcon('‹','go',`data-target="${back}" aria-label="Назад"`)}<h1>${title}</h1><div class="heading-side"></div></div>`;}
function nav(active){return `<nav class="nav" aria-label="Основная навигация"><button data-action="go" data-target="home" class="${active==='home'?'active':''}"><span class="nav-icon">⌂</span>Истории</button><button data-action="go" data-target="library" class="${active==='library'?'active':''}"><span class="nav-icon">◇</span>Библиотека</button><button data-action="go" data-target="collection" class="${active==='collection'?'active':''}"><span class="nav-icon">✧</span>Карточки</button><button data-action="go" data-target="profile" class="${active==='profile'?'active':''}"><span class="nav-icon">♙</span>Профиль</button></nav>`;}
function renderLoading(){app.innerHTML=`<main class="screen loading"><div class="starfield"></div><div class="emblem"><span class="emblem-glyph">✧</span></div><div class="loading-brand"><div class="overline">визуальные истории</div><h1>AETHER</h1><p>Истории за гранью</p></div><div class="loader-bottom"><div class="loader-track"><div class="loader-fill" id="loader-fill"></div></div><p class="loading-tip" id="loading-percent">Пробуждаем звёзды · 0%</p><button data-action="finish-loading" class="loading-skip">Пропустить заставку</button></div></main>`;}
function beginLoading(){renderLoading();let n=0;const interval=setInterval(()=>{if(screen!=='loading'){clearInterval(interval);return;}n=Math.min(100,n+5);const p=document.getElementById('loader-fill'),t=document.getElementById('loading-percent');if(p)p.style.width=n+'%';if(t)t.textContent=`Пробуждаем звёзды · ${n}%`;if(n>=100){clearInterval(interval);setTimeout(()=>{if(screen==='loading')go('home');},250);}},65);}
function renderHome(){const short=data.prefs.name?.trim()||'Странница';app.innerHTML=`<main class="screen main-screen"><div class="starfield"></div><div class="scroll-pane"><div class="content"><div class="top-row"><div class="brand-mini">AETHER<span>✦</span></div><div class="top-actions">${musicButton()}<button class="icon-button" data-action="go" data-target="profile" aria-label="Профиль">${portrait(data.prefs.avatar,'avatar-tiny')}</button></div></div><div class="salutation">С возвращением,<br/><strong>${htmlEsc(short)}.</strong></div><p class="subtext">Звёзды уже знают твою историю.<br/>Осталось решить, какой она станет.</p><div class="section-line"><h2>Выбери свою судьбу</h2><span>01 — 0${STORY_COUNT}</span></div>${Object.entries(STORIES).map(([id,s],i)=>`<article class="story-card ${id==='katabasis'?'story-card--katabasis':''}" ${artStyle(id)}><div class="card-copy"><div class="card-number">ИСТОРИЯ 0${i+1} ✧</div><h3>${s.title}</h3><p>${s.subtitle}</p><button class="mini-button" data-action="story" data-id="${id}">${data.progress[id]?.started?'Вернуться':'Подробнее'} ↗</button></div></article>`).join('')}<div class="wide-message"><span class="glyph">✧</span><div><h4>Твой выбор имеет значение</h4><p>Каждое решение меняет отношения, открывает реплики и приводит к разным финалам.</p></div></div></div></div>${nav('home')}</main>`;}
function renderProfile(){if(!profileDraft)profileDraft=structuredClone(data.prefs);const p=profileDraft;app.innerHTML=`<main class="screen main-screen"><div class="starfield"></div><div class="scroll-pane"><div class="content">${screenHeader('Мой профиль')}<div class="profile-ring">${portrait(p.avatar)}</div><p class="center profile-caption">Твоя история начинается с тебя ✧</p><div class="profile-heading">Выбери аватар</div><div class="avatar-grid">${Array.from({length:8},(_,i)=>`<button class="avatar-choose ${p.avatar===i?'selected':''}" data-action="avatar" data-id="${i}" aria-label="Аватар ${i+1}">${portrait(i)}</button>`).join('')}</div><label class="field-label" for="nickname">Имя игрока</label><input class="input-text" id="nickname" maxlength="24" placeholder="Как к тебе обращаться?" value="${htmlEsc(p.name)}" /><label class="field-label">Любимая история</label><div class="favorites-story">${Object.entries(STORIES).map(([k,s])=>`<button class="favorite-tile ${p.favoriteStory===k?'selected':''}" data-action="favorite-story" data-id="${k}"><div class="thumb" ${artStyle(k)}></div><div class="tile-label">${s.title}</div></button>`).join('')}</div><label class="field-label">Любимые персонажи · до 3</label><div class="characters-grid">${CAST.length?CAST.map(c=>`<button class="character-tile ${p.favoriteCharacters.includes(c.id)?'selected':''}" data-action="favorite-character" data-id="${c.id}">${portrait(c.avatar,c.portrait?'story-hero-avatar':'',c.portrait)}<span>${c.name}</span><small>${p.favoriteCharacters.includes(c.id)?'✦ Выбрано':STORIES[c.story].title}</small></button>`).join(''):'<p class="cast-placeholder">Появятся после знакомства с персонажами.</p>'}</div><button class="primary-btn" style="margin-top:28px" data-action="save-profile">Сохранить профиль ✧</button><p class="form-note">Демо-версия: профиль хранится только в этом браузере. Регистрация и синхронизация между устройствами пока не подключены.</p></div></div>${nav('profile')}</main>`;}
function episodeStatus(id){
 const p=data.progress.katabasis;
 const e=p?.episodes?.[id];
 return e?.completed?'Пройдено':e?.started?'В процессе':'Не начато';
}
function episodeCards(){
 return STORIES.katabasis.episodes.map(ep=>{
  const state=episodeStatus(ep.id);
  const isAvailable=ep.available && !!episodeDefinition(ep.id);
  const e=data.progress.katabasis?.episodes?.[ep.id];
  return `<article class="episode-card ${isAvailable?'episode-card--open':'episode-card--locked'}">
    <div class="episode-number">${String(ep.number).padStart(2,'0')}</div>
    <div class="episode-info"><span class="episode-status">${isAvailable?state:'Скоро'}</span>
      <h3>Эпизод ${ep.number} · ${htmlEsc(ep.title)}</h3><p>${htmlEsc(ep.subtitle||'')}</p>
      ${isAvailable?`<button class="episode-launch" data-action="open-episode" data-id="${ep.id}">${e?.completed?'Переиграть':e?.started?'Продолжить':'Начать эпизод'} ↗</button>`:'<span class="episode-coming">В разработке ♢</span>'}
    </div>
  </article>`;
 }).join('');
}
function renderDetail(){
 const s=STORIES[activeStory],fav=data.prefs.favoriteStory===activeStory;
 app.innerHTML=`<main class="screen story-screen"><div class="detail-art katabasis-detail" ${artStyle(activeStory)}><div class="detail-orbit"></div><div class="top-row">${btnIcon('‹','go','data-target="home" aria-label="Назад"')}<div class="top-actions">${btnIcon(fav?'♥':'♡','quick-favorite',`title="${fav?'Уже в избранном':'В избранное'}" aria-label="В избранное"`)}${btnIcon('⋯','settings','aria-label="Настройки"')}</div></div></div>
 <div class="detail-pane"><div class="detail-kicker">${s.eyebrow}</div><h1>${s.title}</h1><p class="detail-subtitle">${s.subtitle}</p><div class="tag-row">${s.genres.map(t=>`<span class="tag">${t}</span>`).join('')}</div><p class="detail-description">${s.description}</p>
 <div class="stats-panel"><div class="stat"><big>${s.episodes.filter(e=>e.available && episodeDefinition(e.id)).length}</big><span>Эпизодов доступно</span></div><div class="stat"><big>3</big><span>Романтические ветки · план</span></div><div class="stat"><big>2</big><span>Мини-интрижки · план</span></div></div>
 ${s.features?.length?`<h3 class="detail-section-title">Особенности истории</h3><div class="story-features">${s.features.map(f=>`<span class="feature-pill">✧ ${htmlEsc(f)}</span>`).join('')}</div>`:''}
 <h3 class="detail-section-title">Главные герои</h3><div class="cast-row"><p class="cast-placeholder">Персонажи появятся по мере развития истории.</p></div>
 <h3 class="chapters-title">Эпизоды</h3><div class="detail-episode-list">${episodeCards()}</div>
 <div class="cta-sticky"><button class="primary-btn" data-action="go" data-target="episodes">Открыть эпизоды ✧</button></div></div></main>`;
}
function renderEpisodes(){
 const s=STORIES[activeStory];
 app.innerHTML=`<main class="screen main-screen episodes-screen"><div class="starfield"></div><div class="scroll-pane"><div class="content">
 ${screenHeader('Эпизоды','story')}
 <div class="episode-hero" ${artStyle(activeStory)}><div class="episode-hero-copy"><span>КАТАБАСИС</span><h2>Каждое воспоминание имеет цену</h2></div></div>
 <p class="episode-intro">Каждое решение оставляет след. Прогресс и принятые решения сохраняются в браузере.</p>
 ${episodeCards()}
 <p class="episodes-note">Следующие эпизоды появятся здесь по мере написания сценария.</p>
 </div></div></main>`;
}
// Отдельная комната перед самым первым запуском и каждым новым прохождением.
function renderCustomizer(){
 const selected=KATABASIS_LOOKS[appearanceDraft]||KATABASIS_LOOKS.black;
 app.innerHTML=`<main class="screen appearance-screen">
  <div class="appearance-backdrop" style="background-image:linear-gradient(180deg,rgba(5,7,13,.55),rgba(7,8,14,.08) 36%,rgba(7,8,15,.28) 67%,rgba(7,8,15,.91)),url('${KATABASIS_WARDROBE}')"></div>
  <div class="appearance-head">
    ${btnIcon('‹','go','data-target="episodes" aria-label="Вернуться к эпизодам"')}
    <span>КАТАБАСИС · ЭПИЗОД 1</span><span class="appearance-spark">✧</span>
  </div>
  <div class="appearance-intro"><div class="overline">Твоя история начинается здесь</div>
    <h1>Выбери внешность</h1>
    <p>Каким будет твоё отражение?</p>
  </div>
  <div class="appearance-character" aria-live="polite">
    <img src="${selected.image}" alt="Героиня: ${selected.label}" draggable="false" />
  </div>
  <div class="appearance-bottom">
    <div class="appearance-current">${selected.label}</div>
    <div class="appearance-choices" role="group" aria-label="Выбор внешности главной героини">
      ${Object.entries(KATABASIS_LOOKS).map(([id,look])=>`<button type="button" class="appearance-choice ${id===appearanceDraft?'selected':''}" data-action="select-appearance" data-id="${id}" aria-pressed="${id===appearanceDraft}">
        <span class="appearance-portrait"><img src="${look.image}" alt="" draggable="false" /></span>
        <span class="appearance-choice-name">${look.label}</span>
      </button>`).join('')}
    </div>
    <button class="primary-btn appearance-confirm" data-action="confirm-appearance">Начать историю <span aria-hidden="true">✦</span></button>
    <p class="appearance-footnote">Выбор сохранится для этого прохождения</p>
  </div>
 </main>`;
}
function renderLibrary(){app.innerHTML=`<main class="screen main-screen"><div class="starfield"></div><div class="scroll-pane"><div class="content">${screenHeader('Моя библиотека')}<div class="overline">сохранённые путешествия</div><div class="salutation" style="margin-top:15px">Каждая история<br/>оставляет след.</div><p class="subtext">Твой прогресс сохраняется автоматически на этом устройстве.</p><div class="section-line"><h2>Истории</h2><span>0${STORY_COUNT}</span></div>${Object.entries(STORIES).map(([k,s])=>{const p=data.progress[k];return `<div class="library-item"><div class="library-thumb" ${artStyle(k)}></div><div><h3>${s.title}</h3><p>${!p?.started?'Ещё не начата':p.episodes?.[DEFAULT_EPISODE]?.completed?'Эпизод 1 пройден':`В процессе · ${(p.choices||[]).length} решений`}</p><button data-action="story" data-id="${k}">${p?.started?'Открыть':'Посмотреть'} ↗</button></div></div>`;}).join('')}</div></div>${nav('library')}</main>`;}
// Общая коллекция; изображения берём из assets только при открытии вкладки.
function renderCollection(){
 const collection=getCollected();
 const count=COLLECTION_CARDS.filter(card=>collection[card.id]).length;
 app.innerHTML=`<main class="screen main-screen collection-screen"><div class="starfield"></div>
  <div class="scroll-pane"><div class="content">
   <div class="page-top">${btnIcon('‹','go','data-target="home" aria-label="Назад"')}<h1>Коллекция</h1><div class="heading-side"></div></div>
   <div class="overline">Личные сокровища</div>
   <p class="collection-lead">Моменты, которые останутся с тобой.</p>
   <div class="collection-progress"><span>Получено карточек</span><strong>${count} / ${COLLECTION_CARDS.length}</strong></div>
   <div class="collection-grid">${COLLECTION_CARDS.map(card=>{
    const unlocked=Boolean(collection[card.id]);
    return `<button class="collectible-card ${card.rarity==='rare'?'is-rare':''} ${unlocked?'':'is-locked'}"
     data-action="view-card" data-id="${card.id}" aria-label="${unlocked?'Открыть карточку':'Закрытая карточка'}: ${htmlEsc(card.title)}">
     <div class="collectible-image"><img src="${htmlEsc(card.image)}" alt="" loading="lazy" />
      ${unlocked?'':`<div class="collection-lock">♢<small>Не открыто</small></div>`}</div>
     <span class="collectible-footer"><span class="collectible-title">${htmlEsc(card.title)}</span>
      <span class="collectible-rarity ${card.rarity==='rare'?'rarity-gold':''}">${card.rarity==='rare'?'✦ Редкая':'✧ Сюжетная'}</span></span>
    </button>`;}).join('')}</div>
   <p class="collection-note">Сюжетные карточки открываются по мере прохождения. Редкая карточка Аэтера — стартовый подарок коллекции.</p>
  </div></div>${nav('collection')}</main>`;
}
function gameState(){
 if(!data.progress[activeStory]){
  data.progress[activeStory]={started:true,node:'start',episodeId:DEFAULT_EPISODE,
    episodes:{[DEFAULT_EPISODE]:{started:true,node:'start',completed:false}},
    flags:{},relations:{},stats:{...(STORIES[activeStory].initialStats||{})},clues:[],
    choices:[],history:[],completed:false,isKatabasisV13:true};
 }
 const p=data.progress[activeStory];
 p.episodeId ||= DEFAULT_EPISODE;
 p.episodes ||= {};
 p.episodes[p.episodeId] ||= {started:true,node:p.node||'start',completed:!!p.completed};
 p.clues ||= [];p.choices ||= [];p.history ||= [];p.stats ||= {};p.flags ||= {};p.relations ||= {};
 return p;
}
function syncEpisodeProgress(p){
 p.episodes[p.episodeId] ||= {started:true,node:p.node,completed:false};
 p.episodes[p.episodeId].node=p.node;
 p.episodes[p.episodeId].started=true;
}
// Держим одну анимацию кат-сцены на нескольких репликах.
// Даже если игрок быстро нажимает, камера не прыгает к финальному кадру.
const cutsceneTimeline={image:null,startedAt:0};
// Время открытия текущего кадра — для обязательной паузы на иллюстрации.
const sceneView={key:null,startedAt:0};
let autoAdvanceTimer=null;
function scheduleAutoAdvance(ms, expectedNode){
 clearTimeout(autoAdvanceTimer);
 if(!ms)return;
 autoAdvanceTimer=setTimeout(()=>{
  if(screen==='game'&&!modal&&activeStory==='katabasis'&&gameState().node===expectedNode){
   if(frameTransitionBusy){scheduleAutoAdvance(650, expectedNode);return;}
   advance();
  }
 },ms);
}
function renderGame(){
 const story=STORIES[activeStory];
 const p=gameState();
 const episode=currentEpisode();
 const nodes=episode?.nodes || {};
 const node=nodes[p.node]||nodes[episode?.start||'start'];
 const sceneKey=`${activeStory}:${p.node}`;
 if(sceneView.key!==sceneKey){sceneView.key=sceneKey;sceneView.startedAt=performance.now();}
 if(node.end){stopVoice();p.completed=true;p.episodes[p.episodeId].completed=true;syncEpisodeProgress(p);persist();renderEnd(story,p,node);return;}
 // Загружаем тяжёлую иллюстрацию заранее, за одну реплику до появления.
 const nextCutscene=nodes[node.next]?.cutscene;
 if(typeof nextCutscene==='string' && !node.cutscene){
  const preload=new Image();
  preload.src=nextCutscene;
 }

 // В сцене может быть только один персонаж. Если говорит Рассказчик,
 // на экране остаётся только фон. Для реплик показываем говорящего:
 // Аэтер слева, главная героиня справа. Значение figures: 'both'
 // из старых глав теперь никогда не показывает двух персонажей.
 const speaker=(node.speaker||'').trim();
 const narrator=speaker==='Рассказчик' || speaker==='';
 // cutscene — изображение вместо обычного фона и спрайтов.
 // Даже при репликах Аэтера / героини их модели не перекрывают иллюстрацию.
 const cutsceneImage=typeof node.cutscene==='string' ? node.cutscene : '';
 const isBlackout=activeStory==='katabasis' && Boolean(node.blackout);
 let cutsceneAnimating=false;
 let cutsceneElapsed=0;
 if(cutsceneImage){
  if(cutsceneTimeline.image!==cutsceneImage){
   cutsceneTimeline.image=cutsceneImage;
   cutsceneTimeline.startedAt=node.cutsceneStart ? performance.now() : -Infinity;
  }
  cutsceneElapsed=Math.max(0,performance.now()-cutsceneTimeline.startedAt);
  cutsceneAnimating=cutsceneElapsed<3400;
 }else{
  cutsceneTimeline.image=null;
 }
 const cutsceneHtml=cutsceneImage
  ? `<div class="cutscene-art ${cutsceneAnimating?'is-entering':''}" style="--cutscene-elapsed:-${Math.floor(cutsceneElapsed)}ms"><img src="${htmlEsc(cutsceneImage)}" alt="Иллюстрация кат-сцены" draggable="false" /></div>`
  : '';
 let figureHtml='';
 if(!isBlackout && !cutsceneImage && !narrator && node.figures!=='none'){
  {
   // Любая реплика героини берёт внешность из сохранения;
   // NPC используют свои изображения из сценария без изменений.
   const image=resolveKatabasisSprite(node,p);
   if(image){
    const side=node.side==='right'?'right':'left';
    figureHtml=`<div class="character-slot character-slot--${side}"><img class="scene-figure katabasis-sprite" src="${htmlEsc(image)}" alt="${htmlEsc(speaker)}" /></div>`;
   }
  }
 }
 const sceneImage=KATABASIS_BACKGROUNDS[node.bg]
     ? `url('${KATABASIS_BACKGROUNDS[node.bg]}')`
     : 'linear-gradient(160deg,#101827,#1a2432 45%,#060810)';
 const sceneStyle=`style="--scene-image:${isBlackout?'none':sceneImage}"`;
 const isChoice=Boolean(node.choices?.length);
 // Диалоговое окно теперь одно и то же и для реплик, и для выбора.
 // Если в кадре есть choices — варианты ответа показываются карточками
 // сразу под окном, рядом с персонажем, а не отдельным экраном.
 const boxClass=narrator?'dialogue-box is-narrator':'dialogue-box';
 const nameHtml=speaker?`<div class="speaker-name"><span class="speaker-mark" aria-hidden="true">✧</span>${node.speaker}</div>`:'';
 const choicesHtml=isChoice?`<div class="choice-stack" role="group" aria-label="Варианты ответа">${node.choices.map((c,i)=>`<button class="choice-card" style="--i:${i}" data-action="choice" data-id="${i}" ${c.requires?.money && (p.stats.money||0)<c.requires.money?'disabled title="Недостаточно денег"':''}><span class="choice-num">0${i+1}</span><span class="choice-text">${c.text}</span></button>`).join('')}</div><div class="tap-hint">Выбор повлияет на развитие истории</div>`:'';
 const cinematicHint=node.cinematicPause?'<div class="cinematic-continue" aria-hidden="true">Коснись экрана, чтобы продолжить <span>⌄</span></div>':'';
 const dialogueHtml=node.hideDialogue?'':`<div class="dialogue-area">
   ${note?`<div class="choice-feedback">${htmlEsc(note)}</div>`:''}
   <div class="${boxClass}">
    ${nameHtml}
    <p class="dialogue-line">${node.text}</p>
    ${isChoice?'':'<span class="continue-indicator" aria-hidden="true">⌄</span>'}
   </div>
   ${isChoice?choicesHtml:'<div class="tap-hint">Нажми в любом месте, чтобы продолжить</div>'}
  </div>`;
 app.innerHTML=`<main class="screen game game-layout ${isChoice?'is-decision':''} ${isBlackout?'is-blackout':''} ${node.blink?'is-blink':''} ${node.cinematicPause?'is-cutscene-pause':''} ${node.pan==='left-to-right'?'has-pan-left-right':''}" data-story="${activeStory}" data-node="${p.node}" data-expression="${node.expression||'original'}">
  <div class="scene-art katabasis-scene" ${sceneStyle}></div>
  ${cutsceneHtml}
  <div class="game-stars"></div>
  <div class="scene-figures">${figureHtml}</div>
  <div class="game-vignette"></div>
  <div class="game-top">${btnIcon('‹','game-back','aria-label="Назад к истории"')}
   <span class="chapter-label">Эпизод ${STORIES.katabasis.episodes.find(e=>e.id===p.episodeId)?.number||1} · ${story.title}</span>
   <div class="game-top-right">${musicButton()}${voiceButton()}${activeStory==='katabasis'?btnIcon('◇','casebook','title="Дело и характеристики" aria-label="Дело"'):''}${btnIcon('☰','history','title="Журнал" aria-label="Журнал"')}${btnIcon('⚙','settings','title="Настройки" aria-label="Настройки"')}</div>
  </div>
  ${dialogueHtml}
  ${cinematicHint}
 </main>`;
 syncVoiceForScene(node,`${activeStory}:${p.episodeId}:${p.node}`);
 scheduleAutoAdvance(node.autoNext, p.node);
}
function renderEnd(story,p,node){
 const mainHero=CAST.find(c=>c.id===story.characters[0]);
 const heroRel=mainHero?(p.relations[mainHero.id]||0):0;
 const scoreRows=Object.entries(story.statLabels||{bravery:'Смелость'}).map(([key,label])=>
  `<div>${htmlEsc(label)}: <strong>${p.stats?.[key]||0}</strong></div>`).join('');
 const relRow=mainHero?`<div>Отношения · ${mainHero.name}: <strong>${heroRel>0?'+'+heroRel:heroRel}</strong></div>`:'';
 const cluesRow=activeStory==='katabasis'?`<div>Улики: <strong>${p.clues?.length||0}</strong></div>`:'';
 app.innerHTML=`<main class="screen game"><div class="game-end" ${artStyle(activeStory)}><div class="overline">эпизод завершён</div><div class="end-sigil">✧</div><h2>${htmlEsc(node.title)}</h2><p>${htmlEsc(node.endingText(p))}</p><div class="end-stat"><div>Принятые решения: <strong>${p.choices.length}</strong></div>${scoreRows}${relRow}${cluesRow}</div><div class="end-actions"><button class="primary-btn" data-action="go" data-target="episodes">К эпизодам</button><button class="outlined-btn" data-action="restart">Переиграть эпизод ↻</button></div></div></main>`;
}
function renderModal(){if(!modal)return;const div=document.createElement('div');div.className='overlay';div.id='modal';if(modal==='settings')div.innerHTML=`<section class="modal" role="dialog" aria-modal="true" aria-label="Настройки"><div class="top-row"><h2>Настройки</h2>${btnIcon('×','close-modal','aria-label="Закрыть"')}</div><p>Это демонстрационная версия. Все выборы сохраняются автоматически в твоём браузере.</p><div class="modal-row"><span>Фоновая музыка</span><button class="outlined-btn" style="margin:0" data-action="toggle-music">${musicOn?'Включена ✓':'Выключена'}</button></div><div class="modal-row"><span>Озвучка персонажей</span><button class="outlined-btn" style="margin:0" data-action="toggle-voice" aria-pressed="${voiceOn}">${voiceOn?'Включена ✓':'Выключена'}</button></div><div class="modal-row"><span>Текущий прогресс</span><span>${Object.keys(STORIES).filter(id=>data.progress[id]?.started).length} / ${STORY_COUNT} истории</span></div><button class="outlined-btn" data-action="reset-data" style="width:100%">Удалить все локальные данные</button></section>`;
 if(modal==='casebook'){
  const p=gameState(),s=STORIES[activeStory];
  const stats=Object.entries(s.statLabels||{}).map(([id,label])=>`<div class="modal-row"><span>${htmlEsc(label)}</span><strong>${p.stats?.[id]||0}</strong></div>`).join('');
  const clues=(p.clues||[]).map(clue=>`<div class="casebook-clue">✧ ${htmlEsc(clue)}</div>`).join('')||'<p>Пока улик нет.</p>';
  const relations=Object.entries(p.relations||{}).map(([id,value])=>`<div class="modal-row"><span>${htmlEsc(s.relationLabels?.[id]||id)}</span><strong>${value>0?'+':''}${value}</strong></div>`).join('');
  div.innerHTML=`<section class="modal casebook" role="dialog" aria-modal="true" aria-label="Дело"><div class="top-row"><h2>Моё дело</h2>${btnIcon('×','close-modal','aria-label="Закрыть"')}</div><div class="casebook-scroll"><h3>Характеристики</h3>${stats}<h3>Собранные улики</h3>${clues}<h3>Отношения</h3>${relations||'<p>Персонажи и романтические ветки ещё не добавлены.</p>'}</div></section>`;
 }
 if(modal==='card' && selectedCardId){
  const card=COLLECTION_CARDS.find(c=>c.id===selectedCardId);
  if(card && getCollected()[card.id]){
   div.innerHTML=`<section class="collection-viewer ${card.rarity==='rare'?'is-rare':''}" role="dialog" aria-modal="true" aria-label="${htmlEsc(card.title)}">
    <button class="collection-viewer-close" data-action="close-modal" aria-label="Закрыть">×</button>
    <img src="${htmlEsc(card.image)}" alt="${htmlEsc(card.title)}" />
    <div class="collection-viewer-caption"><div class="overline">${card.rarity==='rare'?'✦ РЕДКАЯ КАРТОЧКА':'✧ СЮЖЕТНАЯ КАРТОЧКА'}</div><h2>${htmlEsc(card.title)}</h2><p>${htmlEsc(card.description)}</p></div>
   </section>`;
  }
 }
 if(modal==='history'){const history=gameState().history;const node=currentNodes()[gameState().node];div.innerHTML=`<section class="modal" role="dialog" aria-modal="true" aria-label="Журнал"><div class="top-row"><h2>Журнал</h2>${btnIcon('×','close-modal','aria-label="Закрыть"')}</div><div style="max-height:390px;overflow:auto">${history.length?history.slice(-12).map(h=>`<div class="history-text"><b>${htmlEsc(h.speaker)}</b>${htmlEsc(h.text)}</div>`).join(''):'<p>Здесь появятся прочитанные реплики.</p>'}<div class="history-text"><b>${node.speaker}</b>${node.text}</div></div></section>`;}
 div.addEventListener('click',e=>{if(e.target===div){modal=null;render();}});app.append(div);}
function render(){switch(screen){case'loading':renderLoading();break;case'home':renderHome();break;case'profile':renderProfile();break;case'customize':renderCustomizer();break;case'story':renderDetail();break;case'episodes':renderEpisodes();break;case'library':renderLibrary();break;case'collection':renderCollection();break;case'game':renderGame();break;}renderModal();}
function go(to){if(to!=='game')stopVoice();clearTimeout(autoAdvanceTimer);clearTimeout(frameTransitionTimer);frameTransitionBusy=false;app.querySelectorAll('.game-frame-out').forEach(el=>el.remove());if(to==='profile'&&screen!=='profile')profileDraft=structuredClone(data.prefs);if(to==='game'&&!data.progress[activeStory])gameState();screen=to;note='';modal=null;render();}
// Подгружаем ключевые кадры во время чёрной заставки,
// чтобы при открытии переулка не ждать скачивания PNG.
let katabasisIntroImages=[];
function preloadKatabasisIntro(){
 katabasisIntroImages=['assets/street.png','assets/mc-pain.png',KATABASIS_LOOKS[currentKatabasisLook(data.progress.katabasis)].image].map((src,i)=>{
  const img=new Image();
  if(i===0 && 'fetchPriority' in img) img.fetchPriority='high';
  img.src=src;
  return img;
 });
}
// Открытие эпизода происходит только из каталога. Эпизод 1 включает пролог.
function openEpisode(id){
 const e=STORIES.katabasis.episodes.find(x=>x.id===id);
 if(!e?.available || !episodeDefinition(id)){toast('Эпизод ещё в разработке');return;}
 pendingEpisode=id;
 const p=data.progress.katabasis;
 const state=p?.episodes?.[id];
 if(id===DEFAULT_EPISODE && (!p?.started || state?.completed || !p.appearance)){
  appearanceDraft=currentKatabasisLook(p);
  go('customize');return;
 }
 if(state?.completed){replayEpisode(id);return;}
 beginStoryPlayback(id);
}
function replayEpisode(id){
 // Эпизод 1 сбрасывает всю историю и возвращает в гардероб.
 if(id===DEFAULT_EPISODE){
  appearanceDraft=currentKatabasisLook(data.progress.katabasis);
  pendingEpisode=id;
  go('customize');return;
 }
 const p=gameState();
 p.episodes[id]={started:true,node:episodeDefinition(id).start||'start',completed:false};
 p.episodeId=id;p.node=p.episodes[id].node;p.completed=false;
 persist();beginStoryPlayback(id);
}
function startStory(){go('episodes');}
function beginStoryPlayback(id=pendingEpisode){
 if(activeStory==='katabasis')preloadKatabasisIntro();
 const p=gameState();
 const e=episodeDefinition(id);
 if(!e){toast('Эпизод не найден');return;}
 p.episodeId=id;
 p.episodes[id] ||= {started:true,node:e.start||'start',completed:false};
 p.node=p.episodes[id].node;
 p.completed=!!p.episodes[id].completed;
 syncEpisodeProgress(p);persist();
 if(data.prefs.musicEnabled!==false)void playStoryMusic();
 go('game');
}
function confirmAppearance(){
 if(activeStory!=='katabasis')return;
 // Новое прохождение первого эпизода: сброс сюжета, но новый выбранный облик.
 delete data.progress.katabasis;
 const p=gameState();
 p.appearance=Object.hasOwn(KATABASIS_LOOKS,appearanceDraft)?appearanceDraft:'black';
 p.episodeId=DEFAULT_EPISODE;
 p.node=episodeDefinition(DEFAULT_EPISODE).start||'start';
 syncEpisodeProgress(p);persist();
 beginStoryPlayback(DEFAULT_EPISODE);
}
// Плавная смена кадров. Старый кадр остаётся поверх нового на 480 мс
// и растворяется вместе со старой эмоцией персонажа.
const FRAME_TRANSITION_MS=490;
let frameTransitionBusy=false;
let frameTransitionTimer=null;
function transitionGameFrame(updateState){
 if(frameTransitionBusy||screen!=='game'||modal)return;
 frameTransitionBusy=true;
 clearTimeout(autoAdvanceTimer);
 const oldGame=app.querySelector('.game-layout');
 const outgoing=oldGame?oldGame.cloneNode(true):null;
 updateState();
 render();
 const incoming=app.querySelector('.screen.game');
 if(!incoming){frameTransitionBusy=false;return;}
 incoming.classList.add('game-frame-in');
 if(outgoing){
  outgoing.classList.add('game-frame-out');
   if(incoming.classList.contains('is-blink'))outgoing.classList.add('blink-outgoing');
  outgoing.setAttribute('aria-hidden','true');
  // Синхронизируем старый и новый слой иллюстрации при быстрой смене реплик.
  // Отрицательная задержка позволяет продолжить движение камеры, а не перезапускать.
  const outgoingCutscene=outgoing.querySelector('.cutscene-art.is-entering');
  if(outgoingCutscene && cutsceneTimeline.image){
   outgoingCutscene.style.setProperty('--cutscene-elapsed',`-${Math.min(3400,Math.floor(performance.now()-cutsceneTimeline.startedAt))}ms`);
  }
  outgoing.querySelectorAll('[data-action]').forEach(el=>el.removeAttribute('data-action'));
  app.appendChild(outgoing);
  // При смене говорящего сначала скрываем старого персонажа,
  // и лишь затем проявляем следующего. Они не стоят рядом даже в анимации.
  const prevSlot=oldGame?.querySelector('.scene-figures .character-slot');
  const nextSlot=incoming.querySelector('.scene-figures .character-slot');
  if(prevSlot && nextSlot &&
    prevSlot.classList.contains('character-slot--left') !== nextSlot.classList.contains('character-slot--left')){
   outgoing.classList.add('character-swap-out');
   incoming.classList.add('character-swap-in');
  }
 }
 clearTimeout(frameTransitionTimer);
 frameTransitionTimer=setTimeout(()=>{
  outgoing?.remove();
  incoming.classList.remove('game-frame-in');
  frameTransitionBusy=false;
 },FRAME_TRANSITION_MS);
}
function advance(){
 const p=gameState(),node=currentNodes()[p.node];
 if(!node||node.end||node.choices||frameTransitionBusy)return;
 // Не даём быстро пролистать полноэкранную кат-сцену двойным тапом.
 if(node.minViewMs && (performance.now()-sceneView.startedAt)<node.minViewMs)return;
 transitionGameFrame(()=>{
  p.history.push({episode:p.episodeId,speaker:node.speaker,text:node.text});
  if(node.cardReward && earnCard(node.cardReward)){
   const card=COLLECTION_CARDS.find(c=>c.id===node.cardReward);
   setTimeout(()=>toast(`Новая карточка: ${card?.title||'Награда'} ✧`),550);
  }
  p.node=node.next||'ending';
  syncEpisodeProgress(p);
  note='';
  persist();
 });
}
function choose(index){
 const p=gameState(),node=currentNodes()[p.node];
 const choice=node?.choices?.[index];
 if(!choice||frameTransitionBusy)return;
 if(choice.requires?.money && (p.stats.money||0)<choice.requires.money){toast('Недостаточно денег');return;}
 transitionGameFrame(()=>{
  p.history.push({episode:p.episodeId,speaker:node.speaker,text:node.text});
  p.history.push({episode:p.episodeId,speaker:'Твой выбор',text:choice.text});
  p.choices.push({episode:p.episodeId,node:p.node,text:choice.text});
  if(choice.flag)p.flags[choice.flag]=true;
  const statKeys=new Set(Object.keys(STORIES[activeStory].statLabels||{bravery:'Смелость'}));
  for(const [k,v] of Object.entries(choice.effects||{})){
   if(statKeys.has(k))p.stats[k]=(p.stats[k]||0)+v;
   else p.relations[k]=(p.relations[k]||0)+v;
  }
  for(const clue of (choice.clues||[]))if(!p.clues.includes(clue))p.clues.push(clue);
  if(choice.cardReward && earnCard(choice.cardReward)){
   const card=COLLECTION_CARDS.find(c=>c.id===choice.cardReward);
   setTimeout(()=>toast(`Новая карточка: ${card?.title||'Награда'} ✧`),550);
  }
  p.node=choice.next;
  syncEpisodeProgress(p);
  note='✧ Выбор сохранён';
  persist();
 });
 setTimeout(()=>{if(note){note='';document.querySelector('.choice-feedback')?.remove();}},1700);
}
function toast(text){const el=document.createElement('div');el.className='success-toast';el.textContent=text;app.append(el);setTimeout(()=>el.remove(),2200);}
// Музыка воспроизводится только из настоящего MP3; никаких синтезированных шумов.
let musicBusy=false;
let currentMusicPath='';
function requestedMusicPath(){return STORIES[activeStory]?.music||MUSIC_URL;}
async function playStoryMusic(){
 if(musicBusy)return;
 musicBusy=true;
 try{
  const path=requestedMusicPath();
  if(!soundtrack||currentMusicPath!==path){
   soundtrack?.pause();
   soundtrack=new Audio(path); currentMusicPath=path;
   soundtrack.loop=true; soundtrack.volume=0.42;
  }
  // HTMLAudioElement.play() вызываем до любого await для мобильных браузеров.
  await soundtrack.play();
  musicOn=true;
 }catch(error){
  musicOn=false;
  toast('Не удалось включить музыку: проверь файл MP3 в assets.');
 }finally{
  musicBusy=false;
  syncMusicButtons();
 }
}
function toggleMusic(){
 if(musicOn){
  soundtrack?.pause(); musicOn=false;
  data.prefs.musicEnabled=false; persist(); syncMusicButtons();
  return;
 }
 data.prefs.musicEnabled=true;persist();
 void playStoryMusic();
}
function confirmReset(){if(!window.confirm('Удалить профиль и весь игровой прогресс из этого браузера?'))return;stopVoice();data=structuredClone(DEFAULT);voiceOn=true;persist();profileDraft=null;go('home');toast('Локальные данные удалены');}
app.addEventListener('input',e=>{if(e.target.id==='nickname'&&profileDraft)profileDraft.name=e.target.value;});
app.addEventListener('click',e=>{
 const target=e.target.closest('[data-action]');
 if(!target){
  // Кликабельна вся игровая сцена, кроме меню/плашек с вариантами.
  // Один click на мобильном и десктопе: без двойной обработки touch.
  if(screen==='game'&&!modal&&!frameTransitionBusy&&e.target.closest('.game-layout'))advance();
  return;
 }
 const action=target.dataset.action,id=target.dataset.id;
switch(action){
case'finish-loading':go('home');break;
case'go':go(target.dataset.target);break;
case'story':activeStory=id;go('story');break;
case'game-back':go('episodes');break;
case'play':startStory();break;
case'open-episode':openEpisode(id);break;
case'select-appearance':if(Object.hasOwn(KATABASIS_LOOKS,id)){appearanceDraft=id;render();}break;
case'confirm-appearance':confirmAppearance();break;
case'advance':advance();break;
case'choice':choose(Number(id));break;
case'restart':replayEpisode(gameState().episodeId);break;
case'avatar':profileDraft.avatar=Number(id);render();break;
case'favorite-story':profileDraft.favoriteStory=id;render();break;
case'favorite-character':{const list=profileDraft.favoriteCharacters;const pos=list.indexOf(id);if(pos>=0)list.splice(pos,1);else if(list.length<3)list.push(id);else{toast('Можно выбрать только трёх персонажей');return;}render();break;}
case'save-profile':data.prefs=structuredClone(profileDraft);data.prefs.name=(data.prefs.name||'').trim().slice(0,24)||'Странница';persist();render();toast('Профиль сохранён ✧');break;
case'quick-favorite':data.prefs.favoriteStory=activeStory;persist();render();toast('История добавлена в любимые');break;
case'toggle-music':toggleMusic();break;
case'toggle-voice':toggleVoice();break;
case'view-card':{const card=COLLECTION_CARDS.find(c=>c.id===id);if(!card)return;if(!getCollected()[id]){toast('Открой эту карточку в истории');return;}selectedCardId=id;modal='card';render();break;}
case'settings':modal='settings';render();break;
case'history':modal='history';render();break;
case'casebook':modal='casebook';render();break;
case'close-modal':modal=null;selectedCardId=null;render();break;
case'reset-data':confirmReset();break;
}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal){modal=null;render();}else if(e.key==='Escape'&&screen==='game')go('episodes');});
beginLoading();
