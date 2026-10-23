'use strict';

const STORAGE_KEY = 'aether-visual-novel-v1';
// Истории регистрируются в stories/*.js до загрузки этого файла.
const ART = {moon:'assets/Aether-promo.png', katabasis:'assets/promo-katabasis.png'};
const AETHER_BACKGROUNDS = {space:'assets/background1.png', hall:'assets/background2.png'};
const AETHER_SPRITES = {original:'assets/Aether-original.png', surprising:'assets/Aether-surprising.png'};
const HERO_SPRITES = {original:'assets/her-original.png', crying:'assets/her-crying.png'};
const MUSIC_URL = 'assets/music-background.mp3';
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
const PORTRAITS = ['assets/figure-f.svg','assets/Aether-avatar.webp','assets/figure-f.svg','assets/figure.svg','assets/figure-f.svg','assets/figure.svg','assets/figure-f.svg','assets/figure.svg'];
const CAST = [
 {id:'aether',name:'Аэтер',avatar:1,story:'moon'},
 {id:'hero',name:'Героиня',avatar:0,story:'moon',portrait:'assets/her-original.png'}
];
const STORIES = {
 moon:window.AETHER_STORIES?.moon,
 katabasis:window.AETHER_STORIES?.katabasis
};
for(const [id,story] of Object.entries(STORIES)){
 if(!story) throw new Error(`Не найден stories/${id}.js. Проверь папку stories и подключение index.html.`);
}
const STORY_COUNT = Object.keys(STORIES).length;
const DEFAULT = {prefs:{name:'Странница',avatar:0,favoriteStory:'moon',favoriteCharacters:[]}, progress:{}};
function loadData(){try{const result=JSON.parse(localStorage.getItem(STORAGE_KEY));if(result&&result.prefs&&result.progress)return result;}catch(err){}return structuredClone(DEFAULT);}
let data=loadData();
// Старые демо-истории больше не отображаются; прогресс по ним остаётся
// в localStorage на случай, если понадобится его восстановить.
if(!STORIES[data.prefs.favoriteStory])data.prefs.favoriteStory='moon';
data.prefs.favoriteCharacters=(data.prefs.favoriteCharacters||[]).filter(id=>CAST.some(c=>c.id===id));
// Сбрасываем только старый демо-пролог первой истории, остальные сохранения оставляем.
if(data.progress.moon && !data.progress.moon.isAetherV2){delete data.progress.moon;try{localStorage.setItem(STORAGE_KEY,JSON.stringify(data));}catch(err){}}
// Пролог Катабасиса полностью заменён: старую демо-позицию сбрасываем один раз.
if(data.progress.katabasis && !data.progress.katabasis.isKatabasisV13){delete data.progress.katabasis;try{localStorage.setItem(STORAGE_KEY,JSON.stringify(data));}catch(err){}}
let screen='loading', activeStory='moon', profileDraft=null, modal=null, note='', musicOn=false;
let soundtrack=null;
const app=document.getElementById('app');
const htmlEsc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const artStyle=k=>!ART[k]
 ? `style="--art:radial-gradient(ellipse at 70% 18%,rgba(157,100,105,.31),transparent 42%),radial-gradient(ellipse at 25% 65%,rgba(78,88,112,.36),transparent 58%),linear-gradient(150deg,#29212c,#111621 52%,#070b12)"`
 : `style="--art:url('${ART[k]}')"`;
const portrait=(index,extraClass='',customImage=null)=>`<span class="avatar a${(index%8)+1} ${extraClass}"><img src="${customImage||PORTRAITS[index%8]}" alt="" /></span>`;
function persist(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(data));}catch(err){}}
function btnIcon(symbol,action,extra=''){return `<button class="icon-button" data-action="${action}" ${extra}>${symbol}</button>`;}
function screenHeader(title,back='home'){return `<div class="page-top">${btnIcon('‹','go',`data-target="${back}" aria-label="Назад"`)}<h1>${title}</h1><div class="heading-side"></div></div>`;}
function nav(active){return `<nav class="nav" aria-label="Основная навигация"><button data-action="go" data-target="home" class="${active==='home'?'active':''}"><span class="nav-icon">⌂</span>Истории</button><button data-action="go" data-target="library" class="${active==='library'?'active':''}"><span class="nav-icon">◇</span>Библиотека</button><button data-action="go" data-target="profile" class="${active==='profile'?'active':''}"><span class="nav-icon">♙</span>Профиль</button></nav>`;}
function renderLoading(){app.innerHTML=`<main class="screen loading"><div class="starfield"></div><div class="emblem"><span class="emblem-glyph">✧</span></div><div class="loading-brand"><div class="overline">визуальные истории</div><h1>AETHER</h1><p>Истории за гранью</p></div><div class="loader-bottom"><div class="loader-track"><div class="loader-fill" id="loader-fill"></div></div><p class="loading-tip" id="loading-percent">Пробуждаем звёзды · 0%</p><button data-action="finish-loading" class="loading-skip">Пропустить заставку</button></div></main>`;}
function beginLoading(){renderLoading();let n=0;const interval=setInterval(()=>{if(screen!=='loading'){clearInterval(interval);return;}n=Math.min(100,n+5);const p=document.getElementById('loader-fill'),t=document.getElementById('loading-percent');if(p)p.style.width=n+'%';if(t)t.textContent=`Пробуждаем звёзды · ${n}%`;if(n>=100){clearInterval(interval);setTimeout(()=>{if(screen==='loading')go('home');},250);}},65);}
function renderHome(){const short=data.prefs.name?.trim()||'Странница';app.innerHTML=`<main class="screen main-screen"><div class="starfield"></div><div class="scroll-pane"><div class="content"><div class="top-row"><div class="brand-mini">AETHER<span>✦</span></div><div class="top-actions">${musicButton()}<button class="icon-button" data-action="go" data-target="profile" aria-label="Профиль">${portrait(data.prefs.avatar,'avatar-tiny')}</button></div></div><div class="salutation">С возвращением,<br/><strong>${htmlEsc(short)}.</strong></div><p class="subtext">Звёзды уже знают твою историю.<br/>Осталось решить, какой она станет.</p><div class="section-line"><h2>Выбери свою судьбу</h2><span>01 — 0${STORY_COUNT}</span></div>${Object.entries(STORIES).map(([id,s],i)=>`<article class="story-card ${id==='katabasis'?'story-card--katabasis':''}" ${artStyle(id)}><div class="card-copy"><div class="card-number">ИСТОРИЯ 0${i+1} ✧</div><h3>${s.title}</h3><p>${s.subtitle}</p><button class="mini-button" data-action="story" data-id="${id}">${data.progress[id]?.started?'Продолжить':'Подробнее'} ↗</button></div></article>`).join('')}<div class="wide-message"><span class="glyph">✧</span><div><h4>Твой выбор имеет значение</h4><p>Каждое решение меняет отношения, открывает реплики и приводит к разным финалам.</p></div></div></div></div>${nav('home')}</main>`;}
function renderProfile(){if(!profileDraft)profileDraft=structuredClone(data.prefs);const p=profileDraft;app.innerHTML=`<main class="screen main-screen"><div class="starfield"></div><div class="scroll-pane"><div class="content">${screenHeader('Мой профиль')}<div class="profile-ring">${portrait(p.avatar)}</div><p class="center profile-caption">Твоя история начинается с тебя ✧</p><div class="profile-heading">Выбери аватар</div><div class="avatar-grid">${Array.from({length:8},(_,i)=>`<button class="avatar-choose ${p.avatar===i?'selected':''}" data-action="avatar" data-id="${i}" aria-label="Аватар ${i+1}">${portrait(i)}</button>`).join('')}</div><label class="field-label" for="nickname">Имя игрока</label><input class="input-text" id="nickname" maxlength="24" placeholder="Как к тебе обращаться?" value="${htmlEsc(p.name)}" /><label class="field-label">Любимая история</label><div class="favorites-story">${Object.entries(STORIES).map(([k,s])=>`<button class="favorite-tile ${p.favoriteStory===k?'selected':''}" data-action="favorite-story" data-id="${k}"><div class="thumb" ${artStyle(k)}></div><div class="tile-label">${s.title}</div></button>`).join('')}</div><label class="field-label">Любимые персонажи · до 3</label><div class="characters-grid">${CAST.map(c=>`<button class="character-tile ${p.favoriteCharacters.includes(c.id)?'selected':''}" data-action="favorite-character" data-id="${c.id}">${portrait(c.avatar,c.portrait?'story-hero-avatar':'',c.portrait)}<span>${c.name}</span><small>${p.favoriteCharacters.includes(c.id)?'✦ Выбрано':STORIES[c.story].title}</small></button>`).join('')}</div><button class="primary-btn" style="margin-top:28px" data-action="save-profile">Сохранить профиль ✧</button><p class="form-note">Демо-версия: профиль хранится только в этом браузере. Регистрация и синхронизация между устройствами пока не подключены.</p></div></div>${nav('profile')}</main>`;}
function renderDetail(){const s=STORIES[activeStory],progress=data.progress[activeStory],fav=data.prefs.favoriteStory===activeStory;app.innerHTML=`<main class="screen story-screen"><div class="detail-art ${activeStory==='moon'?'aether-detail':'katabasis-detail'}" ${artStyle(activeStory)}><div class="detail-orbit"></div><div class="top-row">${btnIcon('‹','go','data-target="home" aria-label="Назад"')}<div class="top-actions">${btnIcon(fav?'♥':'♡','quick-favorite',`title="${fav?'Уже в избранном':'В избранное'}" aria-label="В избранное"`)}${btnIcon('⋯','settings','aria-label="Настройки"')}</div></div></div><div class="detail-pane"><div class="detail-kicker">${s.eyebrow}</div><h1>${s.title}</h1><p class="detail-subtitle">${s.subtitle}</p><div class="tag-row">${s.genres.map(t=>`<span class="tag">${t}</span>`).join('')}</div><p class="detail-description">${s.description}</p><div class="stats-panel"><div class="stat"><big>${s.chapters}</big><span>Главы</span></div><div class="stat"><big>${activeStory==='katabasis'?'3':'2'}</big><span>${activeStory==='katabasis'?'Основные ветки · план':'Финала демо'}</span></div><div class="stat"><big>${activeStory==='katabasis'?'2':s.characters.length}</big><span>${activeStory==='katabasis'?'Мини-интрижки · план':'Персонажи'}</span></div></div>
 ${s.features?.length?`<h3 class="detail-section-title">Особенности истории</h3><div class="story-features">${s.features.map(f=>`<span class="feature-pill">✧ ${htmlEsc(f)}</span>`).join('')}</div>`:''}
 <h3 class="detail-section-title">Главные герои</h3><div class="cast-row">${s.characters.length?s.characters.map(id=>{const c=CAST.find(x=>x.id===id);return c?`<div class="cast-item">${portrait(c.avatar,c.portrait?'story-hero-avatar':'',c.portrait)}<small>${c.name}</small></div>`:''}).join(''):'<p class="cast-placeholder">Персонажей добавим после утверждения романтических веток.</p>'}</div><h3 class="chapters-title">Главы и эпизоды</h3><div class="chapter-row"><span class="chapter-mark">00</span><div class="chapter-data"><h4>${s.opening}</h4><p>${progress?.completed?'Пройдено · можно переиграть':progress?.started?'В процессе':'Доступно сейчас'}</p></div><span class="lock">✧</span></div><div class="chapter-row"><span class="chapter-mark">01</span><div class="chapter-data"><h4>Глава I · Продолжение следует</h4><p>Пока в разработке</p></div><span class="lock">♢</span></div><div class="cta-sticky"><button class="primary-btn" data-action="play">${progress?.completed?'Переиграть пролог':progress?.started?'Продолжить историю':'Начать историю'} ✧</button></div></div></main>`;}
function renderLibrary(){app.innerHTML=`<main class="screen main-screen"><div class="starfield"></div><div class="scroll-pane"><div class="content">${screenHeader('Моя библиотека')}<div class="overline">сохранённые путешествия</div><div class="salutation" style="margin-top:15px">Каждая история<br/>оставляет след.</div><p class="subtext">Твой прогресс сохраняется автоматически на этом устройстве.</p><div class="section-line"><h2>Истории</h2><span>0${STORY_COUNT}</span></div>${Object.entries(STORIES).map(([k,s])=>{const p=data.progress[k];return `<div class="library-item"><div class="library-thumb" ${artStyle(k)}></div><div><h3>${s.title}</h3><p>${!p?.started?'Ещё не начата':p.completed?'Пролог завершён':`Играешь · ${p.choices.length} решений`}</p><button data-action="story" data-id="${k}">${p?.started?'Открыть':'Посмотреть'} ↗</button></div></div>`;}).join('')}</div></div>${nav('library')}</main>`;}
function gameState(){if(data.progress[activeStory]&&!data.progress[activeStory].clues)data.progress[activeStory].clues=[];if(!data.progress[activeStory])data.progress[activeStory]={started:true,node:'start',flags:{},relations:{},stats:{...(STORIES[activeStory].initialStats||{bravery:0})},clues:[],choices:[],history:[],completed:false,isAetherV2:activeStory==='moon',isKatabasisV13:activeStory==='katabasis'};return data.progress[activeStory];}
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
 const node=story.nodes[p.node]||story.nodes.start;
 const sceneKey=`${activeStory}:${p.node}`;
 if(sceneView.key!==sceneKey){sceneView.key=sceneKey;sceneView.startedAt=performance.now();}
 if(node.end){p.completed=true;persist();renderEnd(story,p,node);return;}
 // Загружаем тяжёлую иллюстрацию заранее, за одну реплику до появления.
 const nextCutscene=story.nodes[node.next]?.cutscene;
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
  if(activeStory==='moon'){
   if(speaker==='Аэтер'){
    const expression=node.expression==='surprising'?'surprising':'original';
    figureHtml=`<div class="character-slot character-slot--left"><img class="scene-figure aether-sprite" src="${AETHER_SPRITES[expression]}" alt="Аэтер" /></div>`;
   }else if(speaker==='Героиня'){
    const heroExpression=node.heroExpression==='crying'?'crying':'original';
    const image=node.heroImage||HERO_SPRITES[heroExpression];
    figureHtml=`<div class="character-slot character-slot--right"><img class="scene-figure heroine-sprite" src="${htmlEsc(image)}" alt="Главная героиня" /></div>`;
   }
  }else if(node.sprite){
   // Для будущих персонажей Катабасиса: указать sprite и side в сцене.
   const side=node.side==='right'?'right':'left';
   figureHtml=`<div class="character-slot character-slot--${side}"><img class="scene-figure katabasis-sprite" src="${htmlEsc(node.sprite)}" alt="${htmlEsc(speaker)}" /></div>`;

  }
 }
 const sceneImage=activeStory==='moon'
  ? `url('${AETHER_BACKGROUNDS[node.bg]||AETHER_BACKGROUNDS.hall}')`
  : KATABASIS_BACKGROUNDS[node.bg]
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
  <div class="scene-art ${activeStory==='moon'?'aether-scene':'katabasis-scene'}" ${sceneStyle}></div>
  ${cutsceneHtml}
  <div class="game-stars"></div>
  <div class="scene-figures">${figureHtml}</div>
  <div class="game-vignette"></div>
  <div class="game-top">${btnIcon('‹','game-back','aria-label="Назад к истории"')}
   <span class="chapter-label">Пролог · ${story.title}</span>
   <div class="game-top-right">${musicButton()}${activeStory==='katabasis'?btnIcon('◇','casebook','title="Дело и характеристики" aria-label="Дело"'):''}${btnIcon('☰','history','title="Журнал" aria-label="Журнал"')}${btnIcon('⚙','settings','title="Настройки" aria-label="Настройки"')}</div>
  </div>
  ${dialogueHtml}
  ${cinematicHint}
 </main>`;
 scheduleAutoAdvance(node.autoNext, p.node);
}
function renderEnd(story,p,node){
 const mainHero=CAST.find(c=>c.id===story.characters[0]);
 const heroRel=mainHero?(p.relations[mainHero.id]||0):0;
 const scoreRows=Object.entries(story.statLabels||{bravery:'Смелость'}).map(([key,label])=>
  `<div>${htmlEsc(label)}: <strong>${p.stats?.[key]||0}</strong></div>`).join('');
 const relRow=mainHero?`<div>Отношения · ${mainHero.name}: <strong>${heroRel>0?'+'+heroRel:heroRel}</strong></div>`:'';
 const cluesRow=activeStory==='katabasis'?`<div>Улики: <strong>${p.clues?.length||0}</strong></div>`:'';
 app.innerHTML=`<main class="screen game"><div class="game-end" ${artStyle(activeStory)}><div class="overline">тестовый пролог завершён</div><div class="end-sigil">✧</div><h2>${htmlEsc(node.title)}</h2><p>${htmlEsc(node.endingText(p))}</p><div class="end-stat"><div>Принятые решения: <strong>${p.choices.length}</strong></div>${scoreRows}${relRow}${cluesRow}</div><div class="end-actions"><button class="primary-btn" data-action="game-back">Вернуться к истории</button><button class="outlined-btn" data-action="restart">Пройти заново ↻</button></div></div></main>`;
}
function renderModal(){if(!modal)return;const div=document.createElement('div');div.className='overlay';div.id='modal';if(modal==='settings')div.innerHTML=`<section class="modal" role="dialog" aria-modal="true" aria-label="Настройки"><div class="top-row"><h2>Настройки</h2>${btnIcon('×','close-modal','aria-label="Закрыть"')}</div><p>Это демонстрационная версия. Все выборы сохраняются автоматически в твоём браузере.</p><div class="modal-row"><span>Фоновая музыка</span><button class="outlined-btn" style="margin:0" data-action="toggle-music">${musicOn?'Включён ✓':'Выключен'}</button></div><div class="modal-row"><span>Текущий прогресс</span><span>${Object.keys(STORIES).filter(id=>data.progress[id]?.started).length} / ${STORY_COUNT} истории</span></div><button class="outlined-btn" data-action="reset-data" style="width:100%">Удалить все локальные данные</button></section>`;
 if(modal==='casebook'){
  const p=gameState(),s=STORIES[activeStory];
  const stats=Object.entries(s.statLabels||{}).map(([id,label])=>`<div class="modal-row"><span>${htmlEsc(label)}</span><strong>${p.stats?.[id]||0}</strong></div>`).join('');
  const clues=(p.clues||[]).map(clue=>`<div class="casebook-clue">✧ ${htmlEsc(clue)}</div>`).join('')||'<p>Пока улик нет.</p>';
  const relations=Object.entries(p.relations||{}).map(([id,value])=>`<div class="modal-row"><span>${htmlEsc(s.relationLabels?.[id]||id)}</span><strong>${value>0?'+':''}${value}</strong></div>`).join('');
  div.innerHTML=`<section class="modal casebook" role="dialog" aria-modal="true" aria-label="Дело"><div class="top-row"><h2>Моё дело</h2>${btnIcon('×','close-modal','aria-label="Закрыть"')}</div><div class="casebook-scroll"><h3>Характеристики</h3>${stats}<h3>Собранные улики</h3>${clues}<h3>Отношения</h3>${relations||'<p>Персонажи и романтические ветки ещё не добавлены.</p>'}</div></section>`;
 }
 if(modal==='history'){const history=gameState().history;const node=STORIES[activeStory].nodes[gameState().node];div.innerHTML=`<section class="modal" role="dialog" aria-modal="true" aria-label="Журнал"><div class="top-row"><h2>Журнал</h2>${btnIcon('×','close-modal','aria-label="Закрыть"')}</div><div style="max-height:390px;overflow:auto">${history.length?history.slice(-12).map(h=>`<div class="history-text"><b>${htmlEsc(h.speaker)}</b>${htmlEsc(h.text)}</div>`).join(''):'<p>Здесь появятся прочитанные реплики.</p>'}<div class="history-text"><b>${node.speaker}</b>${node.text}</div></div></section>`;}
 div.addEventListener('click',e=>{if(e.target===div){modal=null;render();}});app.append(div);}
function render(){switch(screen){case'loading':renderLoading();break;case'home':renderHome();break;case'profile':renderProfile();break;case'story':renderDetail();break;case'library':renderLibrary();break;case'game':renderGame();break;}renderModal();}
function go(to){clearTimeout(autoAdvanceTimer);clearTimeout(frameTransitionTimer);frameTransitionBusy=false;app.querySelectorAll('.game-frame-out').forEach(el=>el.remove());if(to==='profile'&&screen!=='profile')profileDraft=structuredClone(data.prefs);if(to==='game'&&!data.progress[activeStory])gameState();screen=to;note='';modal=null;render();}
// Подгружаем ключевые кадры во время чёрной заставки,
// чтобы при открытии переулка не ждать скачивания PNG.
let katabasisIntroImages=[];
function preloadKatabasisIntro(){
 katabasisIntroImages=['assets/street.png','assets/mc-pain.png'].map((src,i)=>{
  const img=new Image();
  if(i===0 && 'fetchPriority' in img) img.fetchPriority='high';
  img.src=src;
  return img;
 });
}
function startStory(){
 if(activeStory==='katabasis')preloadKatabasisIntro();
 const p=data.progress[activeStory];
 if(p?.completed){data.progress[activeStory]=null;delete data.progress[activeStory];}
 gameState();persist();
 // Вызов в обработчике нажатия «Начать историю»: браузер разрешает запуск звука.
 // Если пользователь ранее выключил звук, настройка сохраняется.
 if(activeStory==='katabasis' && data.prefs.musicEnabled!==false)void playStoryMusic();
 go('game');
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
 const p=gameState(),node=STORIES[activeStory].nodes[p.node];
 if(!node||node.end||node.choices||frameTransitionBusy)return;
 // Не даём быстро пролистать полноэкранную кат-сцену двойным тапом.
 if(node.minViewMs && (performance.now()-sceneView.startedAt)<node.minViewMs)return;
 transitionGameFrame(()=>{
  p.history.push({speaker:node.speaker,text:node.text});
  p.node=node.next||'ending';
  note='';
  persist();
 });
}
function choose(index){
 const p=gameState(),node=STORIES[activeStory].nodes[p.node];
 const choice=node?.choices?.[index];
 if(!choice||frameTransitionBusy)return;
 if(choice.requires?.money && (p.stats.money||0)<choice.requires.money){toast('Недостаточно денег');return;}
 transitionGameFrame(()=>{
  p.history.push({speaker:node.speaker,text:node.text});
  p.history.push({speaker:'Твой выбор',text:choice.text});
  p.choices.push({node:p.node,text:choice.text});
  if(choice.flag)p.flags[choice.flag]=true;
  const statKeys=new Set(Object.keys(STORIES[activeStory].statLabels||{bravery:'Смелость'}));
  for(const [k,v] of Object.entries(choice.effects||{})){
   if(statKeys.has(k))p.stats[k]=(p.stats[k]||0)+v;
   else p.relations[k]=(p.relations[k]||0)+v;
  }
  for(const clue of (choice.clues||[]))if(!p.clues.includes(clue))p.clues.push(clue);
  p.node=choice.next;
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
function confirmReset(){if(!window.confirm('Удалить профиль и весь игровой прогресс из этого браузера?'))return;data=structuredClone(DEFAULT);persist();profileDraft=null;go('home');toast('Локальные данные удалены');}
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
case'game-back':go('story');break;
case'play':startStory();break;
case'advance':advance();break;
case'choice':choose(Number(id));break;
case'restart':delete data.progress[activeStory];persist();startStory();break;
case'avatar':profileDraft.avatar=Number(id);render();break;
case'favorite-story':profileDraft.favoriteStory=id;render();break;
case'favorite-character':{const list=profileDraft.favoriteCharacters;const pos=list.indexOf(id);if(pos>=0)list.splice(pos,1);else if(list.length<3)list.push(id);else{toast('Можно выбрать только трёх персонажей');return;}render();break;}
case'save-profile':data.prefs=structuredClone(profileDraft);data.prefs.name=(data.prefs.name||'').trim().slice(0,24)||'Странница';persist();render();toast('Профиль сохранён ✧');break;
case'quick-favorite':data.prefs.favoriteStory=activeStory;persist();render();toast('История добавлена в любимые');break;
case'toggle-music':toggleMusic();break;
case'settings':modal='settings';render();break;
case'history':modal='history';render();break;
case'casebook':modal='casebook';render();break;
case'close-modal':modal=null;render();break;
case'reset-data':confirmReset();break;
}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal){modal=null;render();}else if(e.key==='Escape'&&screen==='game')go('story');});
beginLoading();
