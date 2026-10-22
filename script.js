'use strict';

const STORAGE_KEY = 'aether-visual-novel-v1';
const ART = { moon:'assets/Aether-promo.png', velvet:'assets/velvet.svg', ashes:'assets/ashes.svg' };
const AETHER_BACKGROUNDS = {space:'assets/background1.png',hall:'assets/background2.png'};
const AETHER_SPRITES = {original:'assets/Aether-original.png',surprising:'assets/Aether-surprising.png'};
const HERO_SPRITES = {original:'assets/her-original.png',crying:'assets/her-crying.png'};
const MUSIC_URL = 'assets/music-background.mp3'; // Только настоящий MP3, иначе тишина
const PORTRAITS = ['assets/figure-f.svg','assets/Aether-avatar.webp','assets/figure-f.svg','assets/figure.svg','assets/figure-f.svg','assets/figure.svg','assets/figure-f.svg','assets/figure.svg'];
const CAST = [
 {id:'aether',name:'Аэтер',avatar:1,story:'moon'},
 {id:'hero',name:'Героиня',avatar:0,story:'moon',portrait:'assets/her-original.png'},
 {id:'noah',name:'Ноа',avatar:3,story:'velvet'},
 {id:'vivien',name:'Вивьен',avatar:4,story:'velvet'},
 {id:'kael',name:'Каэль',avatar:5,story:'ashes'},
 {id:'iris',name:'Ирис',avatar:6,story:'ashes'},
];
const STORIES = {
 moon:window.AETHER_STORIES?.moon,
  velvet:{title:'Бархатное затмение',eyebrow:'История II · Мистика',subtitle:'Тайна под маской',genres:['Мистика','Драма','Романтика'],description:'На балу, который проходит раз в сто лет, все гости скрывают лица. Тебе досталось приглашение с чужим именем — и право задать ровно три вопроса.',characters:['noah','vivien'],chapters:'1 / 5',opening:'Пролог · Последний танец',nodes:{
  start:{speaker:'Рассказчик',text:'Зал освещают сотни свечей. Ни одна из них не отбрасывает тени.',figures:'none',next:'hall'},
  hall:{speaker:'Вивьен',text:'«Улыбайся. Здесь слишком хорошо запоминают испуганные лица», — шепчет девушка в жемчужной маске.',figures:'female',next:'stranger'},
  stranger:{speaker:'Ноа',text:'«Танец?» Мужчина в чёрном протягивает ладонь, будто ответ уже известен.',figures:'both',active:'male',next:'choice'},
  choice:{speaker:'Рассказчик',text:'На его перчатке вышито имя, которое написано на твоём приглашении.',figures:'both',choices:[
    {text:'Принять приглашение на танец',next:'dance',effects:{noah:2},flag:'dance'},
    {text:'Спросить, откуда он знает твоё имя',next:'name',effects:{bravery:1},flag:'asked'},
    {text:'Уйти вслед за Вивьен',next:'follow',effects:{vivien:2},flag:'follow'}]},
  dance:{speaker:'Ноа',text:'«Ты действительно вернулась». От этих слов музыка на секунду обрывается.',figures:'both',next:'secret'},
  name:{speaker:'Ноа',text:'«Это не твоё имя. Но до окончания бала ты обязана его носить».',figures:'both',next:'secret'},
  follow:{speaker:'Вивьен',text:'«Хороший выбор. Он рассказывает лишь ту часть правды, которую ты хочешь услышать».',figures:'female',next:'secret'},
  secret:{speaker:'Рассказчик',text:'На стене появляется трещина. За ней не камень, а ночное небо, полное неподвижных звёзд.',figures:'both',next:'choice2'},
  choice2:{speaker:'Рассказчик',text:'Из трещины звучит голос: «Назови того, кому отдашь своё доверие».',figures:'both',choices:[
   {text:'«Ноа»',next:'noahEnd',effects:{noah:2},flag:'noahChosen'},
   {text:'«Вивьен»',next:'vivienEnd',effects:{vivien:2},flag:'vivienChosen'}]},
  noahEnd:{speaker:'Ноа',text:'«Тогда я покажу тебе двери, которые раньше были закрыты». За его маской вспыхивает серебряный свет.',figures:'both',next:'ending'},
  vivienEnd:{speaker:'Вивьен',text:'«Ты узнаешь, что здесь случилось. Но не уверена, что захочешь помнить». Она берёт тебя под руку.',figures:'female',next:'ending'},
  ending:{end:true,title:'За гранью масок',endingText:s=>s.flags.noahChosen?'Ты связала свою судьбу с Ноа. Впереди — опасная сделка.':'Ты доверилась Вивьен. Затмение теперь хранит вашу общую тайну.'}
 }},
 ashes:{title:'Пепел рассвета',eyebrow:'История III · Приключение',subtitle:'Когда конец — только начало',genres:['Приключение','Драма','Выбор'],description:'После падения небесных башен остатки мира держатся на хрупких союзах. Ты — единственная, кто слышит голос города, исчезнувшего много лет назад.',characters:['kael','iris'],chapters:'1 / 7',opening:'Пролог · Письмо из руин',nodes:{
  start:{speaker:'Рассказчик',text:'Рассвет не наступал уже тринадцать дней. Пепел медленно падал с бесцветного неба.',figures:'none',next:'letter'},
  letter:{speaker:'Ирис',text:'«Я нашла это под дверью». Девушка кладёт перед тобой конверт, запечатанный знаком погибшей столицы.',figures:'female',next:'visitor'},
  visitor:{speaker:'Каэль',text:'«Не открывай его». В дверях появляется странник с мечом. «По крайней мере, не при ней».',figures:'both',active:'male',next:'choice'},
  choice:{speaker:'Рассказчик',text:'Ирис бледнеет. На конверте проявляются буквы, которых секунду назад не было.',figures:'both',choices:[
    {text:'Защитить Ирис',next:'protect',effects:{iris:2,bravery:1},flag:'protect'},
    {text:'Выслушать Каэля',next:'listen',effects:{kael:2},flag:'listen'},
    {text:'Вскрыть письмо немедленно',next:'open',effects:{bravery:2},flag:'open'}]},
  protect:{speaker:'Ирис',text:'«Спасибо. Даже если мир снова рухнет — теперь я знаю, на чьей ты стороне».',figures:'female',next:'map'},
  listen:{speaker:'Каэль',text:'«В этом письме не послание. Это карта того, что ещё не произошло».',figures:'both',next:'map'},
  open:{speaker:'Рассказчик',text:'Бумага рассыпается в руках, оставляя на коже серебряную схему башен.',figures:'female',next:'map'},
  map:{speaker:'Рассказчик',text:'На горизонте загорается одинокий огонь. Старый город зовёт — но дорога к нему разделяется надвое.',figures:'both',next:'choice2'},
  choice2:{speaker:'Каэль',text:'«Северный путь безопаснее. Через мост доберёмся быстрее, но мост охраняют».',figures:'both',choices:[
    {text:'Пойти по опасному мосту',next:'bridge',effects:{bravery:2,kael:1},flag:'bridge'},
    {text:'Выбрать северную дорогу',next:'north',effects:{iris:1},flag:'north'}]},
  bridge:{speaker:'Рассказчик',text:'Ты ступаешь на хрупкий мост. Под ногами вспыхивают древние знаки: город узнал тебя.',figures:'both',next:'ending'},
  north:{speaker:'Рассказчик',text:'Вы уходите в туман. Через несколько шагов ты замечаешь, что следы позади вас исчезают.',figures:'both',next:'ending'},
  ending:{end:true,title:'Первый луч',endingText:s=>s.flags.bridge?'Ты выбрала риск и нашла след древней магии.':'Ты выбрала осторожность. Но северная дорога хранит собственные секреты.'}
 }}
};
if (!STORIES.moon) throw new Error('Не найден stories/moon.js — проверьте папку stories и порядок подключения скриптов.');

const DEFAULT = {prefs:{name:'Странница',avatar:0,favoriteStory:'moon',favoriteCharacters:[]}, progress:{}};
function loadData(){try{const result=JSON.parse(localStorage.getItem(STORAGE_KEY));if(result&&result.prefs&&result.progress)return result;}catch(err){}return structuredClone(DEFAULT);}
let data=loadData();
// Сбрасываем только старый демо-пролог первой истории, остальные сохранения оставляем.
if(data.progress.moon && !data.progress.moon.isAetherV2){delete data.progress.moon;try{localStorage.setItem(STORAGE_KEY,JSON.stringify(data));}catch(err){}}
let screen='loading', activeStory='moon', profileDraft=null, modal=null, note='', musicOn=false;
let soundtrack=null;
const app=document.getElementById('app');
const htmlEsc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const artStyle=k=>`style="--art:url('${ART[k]}')"`;
const portrait=(index,extraClass='',customImage=null)=>`<span class="avatar a${(index%8)+1} ${extraClass}"><img src="${customImage||PORTRAITS[index%8]}" alt="" /></span>`;
function persist(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(data));}catch(err){}}
function btnIcon(symbol,action,extra=''){return `<button class="icon-button" data-action="${action}" ${extra}>${symbol}</button>`;}
function screenHeader(title,back='home'){return `<div class="page-top">${btnIcon('‹','go',`data-target="${back}" aria-label="Назад"`)}<h1>${title}</h1><div class="heading-side"></div></div>`;}
function nav(active){return `<nav class="nav" aria-label="Основная навигация"><button data-action="go" data-target="home" class="${active==='home'?'active':''}"><span class="nav-icon">⌂</span>Истории</button><button data-action="go" data-target="library" class="${active==='library'?'active':''}"><span class="nav-icon">◇</span>Библиотека</button><button data-action="go" data-target="profile" class="${active==='profile'?'active':''}"><span class="nav-icon">♙</span>Профиль</button></nav>`;}
function renderLoading(){app.innerHTML=`<main class="screen loading"><div class="starfield"></div><div class="emblem"><span class="emblem-glyph">✧</span></div><div class="loading-brand"><div class="overline">визуальные истории</div><h1>AETHER</h1><p>Истории за гранью</p></div><div class="loader-bottom"><div class="loader-track"><div class="loader-fill" id="loader-fill"></div></div><p class="loading-tip" id="loading-percent">Пробуждаем звёзды · 0%</p><button data-action="finish-loading" class="loading-skip">Пропустить заставку</button></div></main>`;}
function beginLoading(){renderLoading();let n=0;const interval=setInterval(()=>{if(screen!=='loading'){clearInterval(interval);return;}n=Math.min(100,n+5);const p=document.getElementById('loader-fill'),t=document.getElementById('loading-percent');if(p)p.style.width=n+'%';if(t)t.textContent=`Пробуждаем звёзды · ${n}%`;if(n>=100){clearInterval(interval);setTimeout(()=>{if(screen==='loading')go('home');},250);}},65);}
function renderHome(){const short=data.prefs.name?.trim()||'Странница';app.innerHTML=`<main class="screen main-screen"><div class="starfield"></div><div class="scroll-pane"><div class="content"><div class="top-row"><div class="brand-mini">AETHER<span>✦</span></div><div class="top-actions">${btnIcon('♫','toggle-music',`aria-label="Музыка" title="${musicOn?'Выключить':'Включить'} фоновый звук"`)}<button class="icon-button" data-action="go" data-target="profile" aria-label="Профиль">${portrait(data.prefs.avatar,'avatar-tiny')}</button></div></div><div class="salutation">С возвращением,<br/><strong>${htmlEsc(short)}.</strong></div><p class="subtext">Звёзды уже знают твою историю.<br/>Осталось решить, какой она станет.</p><div class="section-line"><h2>Выбери свою судьбу</h2><span>01 — 03</span></div>${Object.entries(STORIES).map(([id,s],i)=>`<article class="story-card" ${artStyle(id)}><div class="card-copy"><div class="card-number">ИСТОРИЯ 0${i+1} ✧</div><h3>${s.title}</h3><p>${s.subtitle}</p><button class="mini-button" data-action="story" data-id="${id}">${data.progress[id]?.started?'Продолжить':'Подробнее'} ↗</button></div>${id==='moon'?'':`<img class="card-figure" src="${i===1?'assets/figure-f.svg':'assets/figure.svg'}" alt="" />`}</article>`).join('')}<div class="wide-message"><span class="glyph">✧</span><div><h4>Твой выбор имеет значение</h4><p>Каждое решение меняет отношения, открывает реплики и приводит к разным финалам.</p></div></div></div></div>${nav('home')}</main>`;}
function renderProfile(){if(!profileDraft)profileDraft=structuredClone(data.prefs);const p=profileDraft;app.innerHTML=`<main class="screen main-screen"><div class="starfield"></div><div class="scroll-pane"><div class="content">${screenHeader('Мой профиль')}<div class="profile-ring">${portrait(p.avatar)}</div><p class="center profile-caption">Твоя история начинается с тебя ✧</p><div class="profile-heading">Выбери аватар</div><div class="avatar-grid">${Array.from({length:8},(_,i)=>`<button class="avatar-choose ${p.avatar===i?'selected':''}" data-action="avatar" data-id="${i}" aria-label="Аватар ${i+1}">${portrait(i)}</button>`).join('')}</div><label class="field-label" for="nickname">Имя игрока</label><input class="input-text" id="nickname" maxlength="24" placeholder="Как к тебе обращаться?" value="${htmlEsc(p.name)}" /><label class="field-label">Любимая история</label><div class="favorites-story">${Object.entries(STORIES).map(([k,s])=>`<button class="favorite-tile ${p.favoriteStory===k?'selected':''}" data-action="favorite-story" data-id="${k}"><div class="thumb" ${artStyle(k)}></div><div class="tile-label">${s.title}</div></button>`).join('')}</div><label class="field-label">Любимые персонажи · до 3</label><div class="characters-grid">${CAST.map(c=>`<button class="character-tile ${p.favoriteCharacters.includes(c.id)?'selected':''}" data-action="favorite-character" data-id="${c.id}">${portrait(c.avatar,c.portrait?'story-hero-avatar':'',c.portrait)}<span>${c.name}</span><small>${p.favoriteCharacters.includes(c.id)?'✦ Выбрано':STORIES[c.story].title}</small></button>`).join('')}</div><button class="primary-btn" style="margin-top:28px" data-action="save-profile">Сохранить профиль ✧</button><p class="form-note">Демо-версия: профиль хранится только в этом браузере. Регистрация и синхронизация между устройствами пока не подключены.</p></div></div>${nav('profile')}</main>`;}
function renderDetail(){const s=STORIES[activeStory],progress=data.progress[activeStory],fav=data.prefs.favoriteStory===activeStory;app.innerHTML=`<main class="screen story-screen"><div class="detail-art ${activeStory==='moon'?'aether-detail':''}" ${artStyle(activeStory)}><div class="detail-orbit"></div>${activeStory==='moon'?'':`<img src="${activeStory==='velvet'?'assets/figure-f.svg':'assets/figure.svg'}" class="detail-figure" alt="" />`}<div class="top-row">${btnIcon('‹','go','data-target="home" aria-label="Назад"')}<div class="top-actions">${btnIcon(fav?'♥':'♡','quick-favorite',`title="${fav?'Уже в избранном':'В избранное'}" aria-label="В избранное"`)}${btnIcon('⋯','settings','aria-label="Настройки"')}</div></div></div><div class="detail-pane"><div class="detail-kicker">${s.eyebrow}</div><h1>${s.title}</h1><p class="detail-subtitle">${s.subtitle}</p><div class="tag-row">${s.genres.map(t=>`<span class="tag">${t}</span>`).join('')}</div><p class="detail-description">${s.description}</p><div class="stats-panel"><div class="stat"><big>${s.chapters}</big><span>Главы</span></div><div class="stat"><big>2</big><span>Варианта финала</span></div><div class="stat"><big>${s.characters.length}</big><span>Персонажи</span></div></div><h3 class="detail-section-title">Главные герои</h3><div class="cast-row">${s.characters.map(id=>{const c=CAST.find(x=>x.id===id);return `<div class="cast-item">${portrait(c.avatar,c.portrait?'story-hero-avatar':'',c.portrait)}<small>${c.name}</small></div>`}).join('')}</div><h3 class="chapters-title">Главы и эпизоды</h3><div class="chapter-row"><span class="chapter-mark">00</span><div class="chapter-data"><h4>${s.opening}</h4><p>${progress?.completed?'Пройдено · можно переиграть':progress?.started?'В процессе':'Доступно сейчас'}</p></div><span class="lock">✧</span></div><div class="chapter-row"><span class="chapter-mark">01</span><div class="chapter-data"><h4>Глава I · Продолжение следует</h4><p>Пока в разработке</p></div><span class="lock">♢</span></div><div class="cta-sticky"><button class="primary-btn" data-action="play">${progress?.completed?'Переиграть пролог':progress?.started?'Продолжить историю':'Начать историю'} ✧</button></div></div></main>`;}
function renderLibrary(){app.innerHTML=`<main class="screen main-screen"><div class="starfield"></div><div class="scroll-pane"><div class="content">${screenHeader('Моя библиотека')}<div class="overline">сохранённые путешествия</div><div class="salutation" style="margin-top:15px">Каждая история<br/>оставляет след.</div><p class="subtext">Твой прогресс сохраняется автоматически на этом устройстве.</p><div class="section-line"><h2>Истории</h2><span>03</span></div>${Object.entries(STORIES).map(([k,s])=>{const p=data.progress[k];return `<div class="library-item"><div class="library-thumb" ${artStyle(k)}></div><div><h3>${s.title}</h3><p>${!p?.started?'Ещё не начата':p.completed?'Пролог завершён':`Играешь · ${p.choices.length} решений`}</p><button data-action="story" data-id="${k}">${p?.started?'Открыть':'Посмотреть'} ↗</button></div></div>`;}).join('')}</div></div>${nav('library')}</main>`;}
function gameState(){if(!data.progress[activeStory])data.progress[activeStory]={started:true,node:'start',flags:{},relations:{},stats:{bravery:0},choices:[],history:[],completed:false,isAetherV2:activeStory==='moon'};return data.progress[activeStory];}
function renderGame(){
 const story=STORIES[activeStory];
 const p=gameState();
 const node=story.nodes[p.node]||story.nodes.start;
 if(node.end){p.completed=true;persist();renderEnd(story,p,node);return;}

 // В сцене может быть только один персонаж. Если говорит Рассказчик,
 // на экране остаётся только фон. Для реплик показываем говорящего:
 // Аэтер слева, главная героиня справа. Значение figures: 'both'
 // из старых глав теперь никогда не показывает двух персонажей.
 const speaker=(node.speaker||'').trim();
 const narrator=speaker==='Рассказчик' || speaker==='';
 let figureHtml='';
 if(!narrator && node.figures!=='none'){
  if(activeStory==='moon'){
   if(speaker==='Аэтер'){
    const expression=node.expression==='surprising'?'surprising':'original';
    figureHtml=`<div class="character-slot character-slot--left"><img class="scene-figure aether-sprite" src="${AETHER_SPRITES[expression]}" alt="Аэтер" /></div>`;
   }else if(speaker==='Героиня'){
    const heroExpression=node.heroExpression==='crying'?'crying':'original';
    const image=node.heroImage||HERO_SPRITES[heroExpression];
    figureHtml=`<div class="character-slot character-slot--right"><img class="scene-figure heroine-sprite" src="${htmlEsc(image)}" alt="Главная героиня" /></div>`;
   }
  }else{
   // Универсальная логика для двух остальных историй: фигура говорящего.
   // Если в старом сценарии было figures: 'both', второй спрайт не показываем.
   const femaleNames=['Вивьен','Ирис'];
   const maleNames=['Ноа','Каэль'];
   const gender=femaleNames.includes(speaker)?'female':maleNames.includes(speaker)?'male':
    (node.figures==='female'||node.figures==='male'?node.figures:node.active||'male');
   const isFemale=gender==='female';
   figureHtml=`<div class="character-slot character-slot--${isFemale?'right':'left'}"><img class="scene-figure" src="assets/${isFemale?'figure-f':'figure'}.svg" alt="${htmlEsc(speaker)}" /></div>`;
  }
 }
 const sceneStyle=activeStory==='moon'
  ? `style="--scene-image:url('${AETHER_BACKGROUNDS[node.bg]||AETHER_BACKGROUNDS.hall}')"`
  : artStyle(activeStory);
 const isChoice=Boolean(node.choices?.length);
 // Диалоговое окно теперь одно и то же и для реплик, и для выбора.
 // Если в кадре есть choices — варианты ответа показываются карточками
 // сразу под окном, рядом с персонажем, а не отдельным экраном.
 const boxClass=narrator?'dialogue-box is-narrator':'dialogue-box';
 const nameHtml=speaker?`<div class="speaker-name"><span class="speaker-mark" aria-hidden="true">✧</span>${node.speaker}</div>`:'';
 const choicesHtml=isChoice?`<div class="choice-stack" role="group" aria-label="Варианты ответа">${node.choices.map((c,i)=>`<button class="choice-card" style="--i:${i}" data-action="choice" data-id="${i}"><span class="choice-num">0${i+1}</span><span class="choice-text">${c.text}</span></button>`).join('')}</div><div class="tap-hint">Выбор повлияет на развитие истории</div>`:'';
 const dialogueHtml=`<div class="dialogue-area">
   ${note?`<div class="choice-feedback">${htmlEsc(note)}</div>`:''}
   <div class="${boxClass}">
    ${nameHtml}
    <p class="dialogue-line">${node.text}</p>
    ${isChoice?'':'<span class="continue-indicator" aria-hidden="true">⌄</span>'}
   </div>
   ${isChoice?choicesHtml:'<div class="tap-hint">Нажми в любом месте, чтобы продолжить</div>'}
  </div>`;
 app.innerHTML=`<main class="screen game game-layout ${isChoice?'is-decision':''}" data-story="${activeStory}" data-node="${p.node}" data-expression="${node.expression||'original'}">
  <div class="scene-art ${activeStory==='moon'?'aether-scene':''}" ${sceneStyle}></div>
  <div class="game-stars"></div>
  <div class="scene-figures">${figureHtml}</div>
  <div class="game-vignette"></div>
  <div class="game-top">${btnIcon('‹','game-back','aria-label="Назад к истории"')}
   <span class="chapter-label">Пролог · ${story.title}</span>
   <div class="game-top-right">${btnIcon(musicOn?'♫':'♪','toggle-music','title="Музыка" aria-label="Звук"')}${btnIcon('☰','history','title="Журнал" aria-label="Журнал"')}${btnIcon('⚙','settings','title="Настройки" aria-label="Настройки"')}</div>
  </div>
  ${dialogueHtml}
 </main>`;
}
function renderEnd(story,p,node){const mainHero=CAST.find(c=>c.id===story.characters[0]);const heroRel=p.relations[mainHero.id]||0;app.innerHTML=`<main class="screen game"><div class="game-end" ${artStyle(activeStory)}><div class="overline">пролог завершён</div><div class="end-sigil">✧</div><h2>${node.title}</h2><p>${node.endingText(p)}</p><div class="end-stat"><div>Принятые решения: <strong>${p.choices.length}</strong></div><div>Смелость: <strong>${p.stats.bravery||0}</strong></div><div>Отношения · ${mainHero.name}: <strong>${heroRel>0?'+'+heroRel:heroRel}</strong></div></div><div class="end-actions"><button class="primary-btn" data-action="game-back">Вернуться к истории</button><button class="outlined-btn" data-action="restart">Пройти заново ↻</button></div></div></main>`;}
function renderModal(){if(!modal)return;const div=document.createElement('div');div.className='overlay';div.id='modal';if(modal==='settings')div.innerHTML=`<section class="modal" role="dialog" aria-modal="true" aria-label="Настройки"><div class="top-row"><h2>Настройки</h2>${btnIcon('×','close-modal','aria-label="Закрыть"')}</div><p>Это демонстрационная версия. Все выборы сохраняются автоматически в твоём браузере.</p><div class="modal-row"><span>Фоновая музыка</span><button class="outlined-btn" style="margin:0" data-action="toggle-music">${musicOn?'Включён ✓':'Выключен'}</button></div><div class="modal-row"><span>Текущий прогресс</span><span>${Object.values(data.progress).filter(x=>x.started).length} / 3 истории</span></div><button class="outlined-btn" data-action="reset-data" style="width:100%">Удалить все локальные данные</button></section>`;
 if(modal==='history'){const history=gameState().history;const node=STORIES[activeStory].nodes[gameState().node];div.innerHTML=`<section class="modal" role="dialog" aria-modal="true" aria-label="Журнал"><div class="top-row"><h2>Журнал</h2>${btnIcon('×','close-modal','aria-label="Закрыть"')}</div><div style="max-height:390px;overflow:auto">${history.length?history.slice(-12).map(h=>`<div class="history-text"><b>${htmlEsc(h.speaker)}</b>${htmlEsc(h.text)}</div>`).join(''):'<p>Здесь появятся прочитанные реплики.</p>'}<div class="history-text"><b>${node.speaker}</b>${node.text}</div></div></section>`;}
 div.addEventListener('click',e=>{if(e.target===div){modal=null;render();}});app.append(div);}
function render(){switch(screen){case'loading':renderLoading();break;case'home':renderHome();break;case'profile':renderProfile();break;case'story':renderDetail();break;case'library':renderLibrary();break;case'game':renderGame();break;}renderModal();}
function go(to){clearTimeout(frameTransitionTimer);frameTransitionBusy=false;app.querySelectorAll('.game-frame-out').forEach(el=>el.remove());if(to==='profile'&&screen!=='profile')profileDraft=structuredClone(data.prefs);if(to==='game'&&!data.progress[activeStory])gameState();screen=to;note='';modal=null;render();}
function startStory(){const p=data.progress[activeStory];if(p?.completed){data.progress[activeStory]=null;delete data.progress[activeStory];}gameState();persist();go('game');}
// Плавная смена кадров. Старый кадр остаётся поверх нового на 480 мс
// и растворяется вместе со старой эмоцией персонажа.
const FRAME_TRANSITION_MS=490;
let frameTransitionBusy=false;
let frameTransitionTimer=null;
function transitionGameFrame(updateState){
 if(frameTransitionBusy||screen!=='game'||modal)return;
 frameTransitionBusy=true;
 const oldGame=app.querySelector('.game-layout');
 const outgoing=oldGame?oldGame.cloneNode(true):null;
 updateState();
 render();
 const incoming=app.querySelector('.screen.game');
 if(!incoming){frameTransitionBusy=false;return;}
 incoming.classList.add('game-frame-in');
 if(outgoing){
  outgoing.classList.add('game-frame-out');
  outgoing.setAttribute('aria-hidden','true');
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
 transitionGameFrame(()=>{
  p.history.push({speaker:node.speaker,text:node.text});
  p.history.push({speaker:'Твой выбор',text:choice.text});
  p.choices.push({node:p.node,text:choice.text});
  if(choice.flag)p.flags[choice.flag]=true;
  for(const [k,v] of Object.entries(choice.effects||{})){
   if(k==='bravery')p.stats.bravery=(p.stats.bravery||0)+v;
   else p.relations[k]=(p.relations[k]||0)+v;
  }
  p.node=choice.next;
  note='✧ Выбор сохранён';
  persist();
 });
 setTimeout(()=>{if(note){note='';document.querySelector('.choice-feedback')?.remove();}},1700);
}
function toast(text){const el=document.createElement('div');el.className='success-toast';el.textContent=text;app.append(el);setTimeout(()=>el.remove(),2200);}
// Музыка воспроизводится только из настоящего MP3; никаких синтезированных шумов.
let musicBusy=false;
async function toggleMusic(){
 if(musicBusy)return;
 if(musicOn){
  if(soundtrack){soundtrack.pause();}
  musicOn=false;
  render();
  return;
 }
 musicBusy=true;
 try{
  if(!soundtrack){
   soundtrack=new Audio(MUSIC_URL);
   soundtrack.loop=true;
   soundtrack.volume=0.4;
   soundtrack.preload='none';
  }
  await soundtrack.play();
  musicOn=true;
  render();
 }catch(error){
  musicOn=false;
  render();
  toast('Музыка не найдена. Загрузите настоящий MP3 в папку assets.');
 }finally{
  musicBusy=false;
 }
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
case'close-modal':modal=null;render();break;
case'reset-data':confirmReset();break;
}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal){modal=null;render();}else if(e.key==='Escape'&&screen==='game')go('story');});
beginLoading();
