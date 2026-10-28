'use strict';
// ЭПИЗОД 1 «КАТАБАСИСА».
// Пролог — первые кадры этого эпизода: start → streetPain → knifeMemory → ...
// Каждый узел node — отдельный кадр. Следующий кадр задаётся в next.
// Добавляй новые эпизоды как episode-02.js, episode-03.js и подключай их в index.html.
window.AETHER_EPISODES = window.AETHER_EPISODES || {};
window.AETHER_EPISODES.katabasis = window.AETHER_EPISODES.katabasis || {};
window.AETHER_EPISODES.katabasis['episode-01'] = {
  id: 'episode-01',
  start: 'start',
  nodes: {
    // 01: чёрный экран. Музыка стартует при нажатии «Начать историю».
    start: {
      blackout:true, hideDialogue:true, autoNext:2200,
      next:'streetPain'
    },
    // 02: широкий фон панорамируется слева направо; героиня слева.
    streetPain: {
      speaker:'Героиня',
      text:'Как же больно...',
      bg:'street', pan:'left-to-right',
      sprite:'assets/mc-pain.png', side:'left',
      next:'knifeMemory'
    },
    // 03: иллюстрация вместо фона и модели. Реплика остаётся поверх неё.
    knifeMemory: {
      speaker:'Героиня',
      text:'Как я тут оказалась?..',
      cutscene:'assets/cut-scene1.png', cutsceneStart:true,
      voice: 'audio/katabasis/episode-01/mc-001.mp3'
      cardReward:'knife-memory', // получите после просмотра этой кат-сцены
      next:'knifeHold'
    },
    // Полноэкранный кадр без диалога: изображение можно рассмотреть.
    // minViewMs запрещает переходить дальше первые три секунды,
    // после этого игрок сам нажимает на экран.
    knifeHold: {
      hideDialogue:true, cinematicPause:true, minViewMs:3000,
      cutscene:'assets/cut-scene1.png',
      next:'blink'
    },
    // 04: короткое моргание / провал в темноту.
    blink: {
      blackout:true, blink:true, hideDialogue:true, autoNext:1550,
      next:'nurseNight'
    },
    // 05: медсестра появляется на фоне ночной больницы.
    nurseNight: {
      speaker:'Медсестра',
      text:'С вами всё будет хорошо. Мы о вас позаботимся.',
      bg:'hospitalNight', sprite:'assets/nurse.png', side:'right',
        voice: 'audio/katabasis/episode-01/nune-001.mp3'
      next:'firstChoice'
    },
    firstChoice: {
      speaker:'Рассказчик',
      text:'Ты не помнишь ни собственного имени, ни того, как оказалась здесь. Что спросить первым?',
      bg:'hospitalNight', choices:[
        {text:'Спросить, не пострадал ли кто-то ещё', next:'care', effects:{empathy:1}, flag:'askedAboutOthers'},
        {text:'Попросить рассказать всё по порядку', next:'facts', effects:{insight:1}, flag:'askedForFacts'}
      ]
    },
    care: {
      speaker:'Врач', text:'«Сейчас главное — ваше состояние. О других обстоятельствах с вами поговорит полиция».',
        voice: 'audio/katabasis/episode-01/doctor-001.mp3'
      bg:'hospitalNight', next:'hospitalMorning'
    },
    facts: {
      speaker:'Врач', text:'«Понимаю, что у вас много вопросов. Скоро сюда придёт сотрудник полиции».',
      bg:'hospitalNight', next:'hospitalMorning'
    },

    // Новая сцена: дневная больница. Рассказчик — значит, на экране только фон.
    hospitalMorning: {
      speaker:'Рассказчик',
      text:'К утру дождь стих. Ты так и не смогла вспомнить ни одного события прошлой ночи.',
      bg:'hospitalDay',
      next:'detectiveArrival'
    },
    detectiveArrival: {
      speaker:'Рассказчик',
      text:'В дверь негромко постучали. В палату вошёл мужчина в тёмном пальто.',
      bg:'hospitalDay',
      next:'detectiveIntroduction'
    },
    // Новый персонаж: его имя и реплики потом можно свободно изменить.
    detectiveIntroduction: {
      speaker:'Детектив',
      text:'Доброе утро. Я веду расследование того, что произошло с вами. Можно задать несколько вопросов?',
      bg:'hospitalDay',
      sprite:'assets/detective.png', side:'left',
      // voice:'audio/episode-01/detective-001.mp3', // добавь MP3 и убери //
      next:'police'
    },
    police: {
      speaker:'Детектив',
      text:'По нашим данным, вы пережили нападение серийного убийцы. Вам невероятно повезло остаться в живых.',
      bg:'hospitalDay',
      sprite:'assets/detective.png', side:'left',
      next:'witness'
    },
    witness: {
      speaker:'Рассказчик',
      text:'Единственный свидетель той ночи находится в коме. Его показания получить невозможно. Всё, что тебе известно о случившемся, — чужие слова.',
      bg:'hospitalDay', next:'secondChoice'
    },
    secondChoice: {
      speaker:'Рассказчик', text:'Какую мысль ты запомнишь прежде всего?',
      bg:'hospitalDay', choices:[
        {text:'Нужно выяснить, кто напал на меня', next:'search', effects:{insight:1}, clues:['Полиция связывает нападение с серийным убийцей'], flag:'startInvestigation'},
        {text:'Нужно узнать, что произошло со свидетелем', next:'witnessPath', effects:{empathy:1}, clues:['Единственный свидетель находится в коме'], flag:'rememberWitness'}
      ]
    },
    search: {
      speaker:'Рассказчик', text:'Ты ничего не помнишь, но уже знаешь: чужие версии событий не заменят твоих собственных ответов.',
      bg:'hospitalDay', next:'ending'
    },
    witnessPath: {
      speaker:'Рассказчик', text:'Где-то в этой же реальности существует человек, который, возможно, помнит ту ночь. Но сейчас он не может рассказать тебе ничего.',
      bg:'hospitalDay', next:'ending'
    },
    ending: {
      end:true, title:'Точка отсчёта',
      endingText: state => state.flags.startInvestigation
        ? 'Ты решила искать ответы. Это только тестовый пролог — дальше мы напишем настоящий сюжет.'
        : 'Ты решила начать со свидетеля. Это только тестовый пролог — дальше мы напишем настоящий сюжет.'
    }
  }
};
