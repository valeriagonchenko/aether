AETHER v15 — ОБЛОЖКА И ПАУЗА НА КАТ-СЦЕНЕ

Что обновить на GitHub:
1. В корне репозитория замените index.html, script.js, style.css.
2. В папке stories замените только katabasis.js.
3. Убедитесь, что assets/promo-katabasis.png уже загружен — он не включён в этот архив.
4. Не трогайте stories/moon.js и другие изображения.

Проверка:
- В меню и на странице истории Катабасиса появился новый постер.
- Во время «Как я тут оказалась?..» видна иллюстрация.
- По нажатию после этой реплики открывается кат-сцена БЕЗ текста.
- В первые 3 секунды следующая сцена не переключается. Потом игрок нажимает, чтобы продолжить.
- После паузы срабатывает моргание и больница.

Как писать свои такие моменты:
  cutsceneDialog: {speaker:'Героиня',text:'...',cutscene:'assets/name.png',cutsceneStart:true,next:'cutsceneView'},
  cutsceneView: {hideDialogue:true,cinematicPause:true,minViewMs:3000,cutscene:'assets/name.png',next:'nextScene'},

Длительность минимального просмотра меняется через minViewMs (миллисекунды).
