'use strict';

// ПРИГОВОР ЗВЁЗДАМ — отдельный сценарий.
// Здесь можно самостоятельно редактировать описание истории, сцены и выборы.
// Не изменяй script.js, когда просто пишешь сюжет.
//
// figures: 'none' (только фон), 'aether' (Аэтер слева),
//          'hero' (героиня справа). Два персонажа вместе не показываются.
// При speaker: 'Рассказчик' движок всегда скрывает всех персонажей.
// При реплике Аэтера или Героини появляется только говорящий персонаж.
// expression: 'original' или 'surprising' — эмоция Аэтера.
// heroExpression: 'original' или 'crying' — эмоция героини.
// bg: 'space' (background1.png) или 'hall' (background2.png).
// next: имя следующего кадра; choices: варианты ответа.
// КАТ-СЦЕНЫ — как добавить свою иллюстрацию:
//   cutscene: 'assets/cutscene-aether-01.png', // изображение вместо фона/персонажей
//   cutsceneStart: true,                    // только на ПЕРВОЙ реплике кат-сцены
// Продолжай реплики с тем же cutscene-путём — картинка останется.
// Убери cutscene из следующего кадра — иллюстрация плавно исчезнет.
// Файл положи в папку assets/ рядом с background1.png.
//
// Пример нового кадра:
// myScene: {speaker:'Героиня',text:'Я останусь здесь.',figures:'hero',
//           expression:'original',heroExpression:'crying',bg:'hall',next:'meeting'},

window.AETHER_STORIES = window.AETHER_STORIES || {};
window.AETHER_STORIES.moon = {title:'Приговор звёздам',eyebrow:'История I · Космическая драма',subtitle:'Одна подпись — миллиарды судеб',genres:['Научная фантастика','Драма','Выбор'],description:'На орбитальной станции, откуда управляют судьбами целых миров, тебя вызывают на встречу с генералом Аэтером. Приказ уже подписан. Но именно тебе предстоит решить, станет ли он окончательным. Демонстрационный сюжет — заменим на твой.',characters:['aether','hero'],chapters:'1 / 6',opening:'Демо-пролог · Последний приказ',nodes:{
  start:{speaker:'Рассказчик',text:'За панорамным стеклом медленно вращалась планета. Её огни казались мирными — слишком мирными для последней ночи.',figures:'none',bg:'space',next:'arrival'},
  arrival:{speaker:'Рассказчик',text:'Тебя вызвали в главную галерею станции. Тишина здесь звучала громче любого сигнала тревоги.',figures:'none',heroExpression:'original',bg:'hall',next:'meeting'},
  meeting:{speaker:'Аэтер',text:'«Ты опоздала на три минуты. Но, полагаю, у тебя была веская причина».',figures:'aether',heroExpression:'original',bg:'hall',expression:'original',next:'heroReply'},
  heroReply:{speaker:'Героиня',text:'«У меня была причина. Но вы ведь позвали меня не из-за опоздания?»',figures:'hero',expression:'original',heroExpression:'original',bg:'hall',next:'briefing'},
  briefing:{speaker:'Рассказчик',text:'Генерал не повысил голоса. Ему и не требовалось: перед ним лежал приказ об уничтожении целого мира.',figures:'none',heroExpression:'original',bg:'hall',next:'question'},
  question:{speaker:'Аэтер',text:'«Ты уже знаешь, зачем я тебя позвал?»',figures:'aether',heroExpression:'original',bg:'hall',choices:[
   {text:'«Я видела ваш приказ»',next:'direct',effects:{aether:1,bravery:2},flag:'direct'},
   {text:'«Я хочу услышать правду от вас»',next:'trust',effects:{aether:2},flag:'trust'},
   {text:'Промолчать и посмотреть на него',next:'silent',effects:{bravery:1},flag:'silent'}]},
  direct:{speaker:'Аэтер',text:'Его взгляд на мгновение меняется. «Значит, уровень секретности больше не имеет значения».',figures:'aether',heroExpression:'original',expression:'surprising',bg:'hall',next:'reveal'},
  trust:{speaker:'Аэтер',text:'«Это разумно». Он выдерживает паузу. «Приказ уже отправлен. Но ещё не исполнен».',figures:'aether',heroExpression:'original',expression:'original',bg:'hall',next:'reveal'},
  silent:{speaker:'Аэтер',text:'«Молчание тоже ответ». Он отводит взгляд к огромному окну. «И сегодня оно стоит слишком дорого».',figures:'aether',heroExpression:'original',expression:'original',bg:'hall',next:'reveal'},
  reveal:{speaker:'Рассказчик',text:'На голографической карте загорелась красная точка — колония, где сейчас живут миллионы людей. Обратный отсчёт уже начался.',figures:'none',heroExpression:'crying',bg:'space',next:'cinematic1'},

  // КАТ-СЦЕНА №1. Картинка лежит в assets/cutscene-aether-01.png.
  // На первом кадре добавь cutsceneStart:true — появление сверху вниз и отдаление.
  // На остальных кадрах повтори cutscene: путь — иллюстрация останется фоном.
  // Пока cutscene активна, модели персонажей автоматически скрываются.
  cinematic1:{speaker:'Рассказчик',text:'Аэтер шагнул ближе. На мгновение шум станции отступил, оставив только тихий стук сердца.',bg:'hall',cutscene:'assets/cutscene-aether-01.png',cutsceneStart:true,next:'cinematic2'},
  cinematic2:{speaker:'Аэтер',text:'«Не смотри на этот приказ. Посмотри на меня».',bg:'hall',cutscene:'assets/cutscene-aether-01.png',next:'cinematic3'},
  cinematic3:{speaker:'Героиня',text:'«Тогда скажите, что у нас ещё есть выбор».',bg:'hall',cutscene:'assets/cutscene-aether-01.png',next:'cinematic4'},
  cinematic4:{speaker:'Аэтер',text:'«Есть. И я не позволю тебе делать его в одиночку».',bg:'hall',cutscene:'assets/cutscene-aether-01.png',next:'finalChoice'},
  finalChoice:{speaker:'Аэтер',text:'«У нас есть одна возможность изменить исход. Но тогда ответственность будет на нас обоих».',figures:'aether',heroExpression:'crying',bg:'space',expression:'original',choices:[
   {text:'«Я помогу вам остановить приказ»',next:'stop',effects:{aether:2,bravery:1},flag:'stop'},
   {text:'«Я обнародую всё, что узнала»',next:'expose',effects:{aether:-1,bravery:2},flag:'expose'}]},
  stop:{speaker:'Аэтер',text:'Он смотрит на тебя дольше обычного. «Тогда нам придётся нарушить закон, который я поклялся защищать».',figures:'aether',heroExpression:'crying',expression:'surprising',bg:'hall',next:'ending'},
  expose:{speaker:'Рассказчик',text:'Ты отправляешь запись на общую частоту. По станции разносится тревога. Теперь пути назад нет.',figures:'none',heroExpression:'crying',bg:'space',next:'ending'},
  ending:{end:true,title:'На грани решения',endingText:s=>s.flags.stop?'Ты решила действовать вместе с Аэтером. И этот выбор изменил ваши отношения.':'Ты раскрыла приказ всем мирам. Генерал не забудет твоего решения.'}
 }};
