'use strict';

// КАТАБАСИС — отдельный сценарий. Можно свободно редактировать nodes.
// Существующие названия сцен (start, choice...) используются в next —
// при переименовании узла обновляй ссылки на него.
// В этой версии тестовый пролог нужен для проверки движка; основной сюжет
// и любовные ветки пока НЕ написаны.
//
// Поля сцены:
// speaker, text, next, choices, bg, sprite, side, cutscene, cutsceneStart
// bg: 'street' | 'hospitalNight' | 'hospitalDay' — изображения в assets/.
// sprite: 'assets/имя-персонажа.png'; для героини и медсестры уже работает.
// side: 'left' | 'right'; pan:'left-to-right' (движение фона).
// blackout:true, hideDialogue:true, autoNext:2000 — пауза на чёрном экране.
//
// Вариант выбора:
// {text:'...', next:'...', flag:'...', effects:{empathy:1, insight:1, money:-10}, clues:['Название улики']}
// Для отношений: effects:{id_персонажа: 1} (после регистрации id в characters).
// Эмоции / отдельные файлы персонажей можно задавать прямо через sprite.

window.AETHER_STORIES = window.AETHER_STORIES || {};
window.AETHER_STORIES.katabasis = {
  title: 'Катабасис',
  eyebrow: 'История II · Психологический триллер',
  subtitle: 'Иногда лучше не вспоминать',
  genres: ['Психологический триллер', 'Детектив', 'Романтика', 'Драма'],
  description: 'Ты просыпаешься в больнице без единого воспоминания о прошлом. Полиция утверждает, что ты чудом выжила после нападения серийного убийцы. Единственный свидетель той ночи лежит в коме. Пытаясь вернуться к обычной жизни, ты начинаешь собственное расследование. Странные воспоминания, подозрительные незнакомцы и чужие секреты постепенно складываются в пугающую картину. Но жизнь не ограничивается поисками правды. Впереди новые знакомства, дружба, любовь и возможность впервые почувствовать себя по-настоящему счастливой. Сможешь ли ты раскрыть тайну своего прошлого? И действительно ли хочешь узнать, кем была раньше?',
  features: ['3 основные романтические ветки', '2 мини-интрижки', 'Эмпатия и Проницательность', 'Деньги', 'Расследования и улики', 'Несколько финалов'],
  chapters: 'Пролог',
  opening: 'Пролог · Ночь без памяти',
  music: 'assets/Midnight Unease.mp3',
  characters: [], // Имена/модели будущих персонажей добавим после утверждения.
  statLabels: {empathy:'Эмпатия', insight:'Проницательность', money:'Деньги'},
  initialStats: {empathy:0, insight:0, money:0},
  relationLabels: {}, // Например: {doctor:'Имя героя'} после утверждения.
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
      bg:'hospitalNight', next:'police'
    },
    facts: {
      speaker:'Врач', text:'«Понимаю, что у вас много вопросов. Скоро сюда придёт сотрудник полиции».',
      bg:'hospitalNight', next:'police'
    },
    police: {
      speaker:'Сотрудник полиции',
      text:'«По нашим данным, вы пережили нападение серийного убийцы. Вам невероятно повезло остаться в живых».',
      bg:'hospitalNight', next:'witness'
    },
    witness: {
      speaker:'Рассказчик',
      text:'Единственный свидетель той ночи находится в коме. Его показания получить невозможно. Всё, что тебе известно о случившемся, — чужие слова.',
      bg:'hospitalNight', next:'secondChoice'
    },
    secondChoice: {
      speaker:'Рассказчик', text:'Какую мысль ты запомнишь прежде всего?',
      bg:'hospitalNight', choices:[
        {text:'Нужно выяснить, кто напал на меня', next:'search', effects:{insight:1}, clues:['Полиция связывает нападение с серийным убийцей'], flag:'startInvestigation'},
        {text:'Нужно узнать, что произошло со свидетелем', next:'witnessPath', effects:{empathy:1}, clues:['Единственный свидетель находится в коме'], flag:'rememberWitness'}
      ]
    },
    search: {
      speaker:'Рассказчик', text:'Ты ничего не помнишь, но уже знаешь: чужие версии событий не заменят твоих собственных ответов.',
      bg:'hospitalNight', next:'ending'
    },
    witnessPath: {
      speaker:'Рассказчик', text:'Где-то в этой же реальности существует человек, который, возможно, помнит ту ночь. Но сейчас он не может рассказать тебе ничего.',
      bg:'hospitalNight', next:'ending'
    },
    ending: {
      end:true, title:'Точка отсчёта',
      endingText: state => state.flags.startInvestigation
        ? 'Ты решила искать ответы. Это только тестовый пролог — дальше мы напишем настоящий сюжет.'
        : 'Ты решила начать со свидетеля. Это только тестовый пролог — дальше мы напишем настоящий сюжет.'
    }
  }
};
