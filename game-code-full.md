# Game Code Full Dump

## index.html
```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Jumping Girl - Food Escape</title>
  <link href="https://fonts.googleapis.com/css2?family=Nanum+Myeongjo:wght@400;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <div class="game-wrapper">
    <div id="canvasContainer" style="position: relative; display: inline-block;">
      <canvas id="gameCanvas" width="360" height="640">
        ??釉뚮씪?곗???Canvas瑜?吏?먰븯吏 ?딆뒿?덈떎.
      </canvas>
      <!-- GIF ?좊땲硫붿씠?섏슜 img ?쒓렇 (Canvas ?꾩뿉 ?ㅻ쾭?덉씠) -->
      <img id="girlGif" src="" style="position: absolute; pointer-events: none; display: none; z-index: 10;" alt="">
      <img id="slideGif" src="" style="position: absolute; pointer-events: none; display: none; z-index: 10;" alt="">
      <img id="shootGif" src="" style="position: absolute; pointer-events: none; display: none; z-index: 10;" alt="">
      <img id="bombGif" src="" style="position: absolute; pointer-events: none; display: none; z-index: 10;" alt="">
    </div>
  </div>
  <script src="js/config.js"></script>
  <script src="js/ui.js"></script>
  <script src="js/game.js"></script>
</body>
</html>

```

## css\style.css
```css
/* Reset & Base */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #1a1a2e;
  font-family: 'Segoe UI', system-ui, sans-serif;
  overflow: hidden;
}

/* Game Wrapper - 以묒븰 ?뺣젹, 諛섏쓳??*/
.game-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-height: 100vh;
  padding: 8px;
}

/* Canvas - 怨좎젙 鍮꾩쑉(9:16), 理쒕? ?ш린 ?쒗븳, 諛섏쓳??*/
#gameCanvas {
  display: block;
  width: 100%;
  max-width: min(360px, 100vw);
  height: auto;
  max-height: min(640px, 100vh);
  aspect-ratio: 9 / 16;
  background: #16213e;
  border-radius: 8px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
}

/* ?곗튂/?대┃ ???띿뒪???좏깮 諛⑹? */
#gameCanvas {
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  user-select: none;
  -webkit-user-select: none;
}

/* GIF ?좊땲硫붿씠??img ?쒓렇 ?ㅽ???*/
#girlGif, #slideGif {
  position: absolute;
  pointer-events: none;
  z-index: 10;
  image-rendering: auto;
  -ms-interpolation-mode: bicubic;
}

```

## js\config.js
```js
/**
 * Game Configuration & Constants
 */
const GW = 360, GH = 640;
const GROUND_Y = GH - 100;
const GRAVITY = 0.55;
const JUMP_POWER = -13; // 1???먰봽
const AIR_JUMP_POWER = -11; // 2???먰봽
const GIRL_W = 96, GIRL_H = 180;
const GIRL_OFFSET_Y = 0; // ?뚮?媛 吏硫댁뿉???좎엳??媛꾧꺽 ?꾨떂, 醫뚰몴 蹂댁젙
const GIRL_X = 10;
const MAX_FALL_SPEED = 14;

// ?고듃
const FONT_HANGUL = '"Nanum Myeongjo", serif';

// UI Constants
const BTN = { x: (GW - 130) / 2, y: 400, w: 130, h: 56 }; // 寃뚯엫 ?쒖옉 踰꾪듉 (?덈퉬 諛섏쑝濡?以꾩엫 260 -> 130, 以묒븰 ?뺣젹)
const RETRY_BTN = { x: 50, y: 320, w: 260, h: 56 }; // ?ㅼ떆 ?섍린 踰꾪듉
const TITLE_BTN = { x: 50, y: 400, w: 260, h: 56 }; // ??댄?濡??뚯븘媛湲?踰꾪듉
const MAX_HIGH_SCORES = 20; // 理쒕? ??궧 ?????
const ATTENDANCE_BTN = { x: GW - 80, y: GH - 160, w: 60, h: 60 }; // 異쒖꽍泥댄겕 踰꾪듉 (?듭뀡 踰꾪듉 ?꾨줈 諛곗튂)
const COLLECTION_BTN = { x: 20, y: GH - 80, w: 60, h: 60 }; // ?꾧컧 踰꾪듉 (醫뚰븯??
const OPTIONS_BTN = { x: GW - 80, y: GH - 80, w: 60, h: 60 }; // ?듭뀡 踰꾪듉 (?고븯??
const OPT_RESET_BTN = { x: 50, y: GH - 110, w: GW - 100, h: 45 }; // ?듭뀡 珥덇린??踰꾪듉

const FOOD_SPEED = 5.0; // ?뚯떇 ?대룞 ?띾룄
const FOOD_SIZE = 56;
const RELOAD_COOLDOWN_DURATION = 14; // 珥앹븣 ?ъ옣??荑⑦???(?꾨젅??
const BULLET_SPEED = 12;
const BULLET_W = 20, BULLET_H = 10;
const BOMB_W = 32, BOMB_H = 32;
const BOMB_VX = 2.75, BOMB_VY = -12.0; // ??깂 ?섏????띾룄 (鍮꾧굅由?5.5 -> 2.75濡?議곗젙)

// Collection Data
const COLLECTION_ITEMS = [
    // 1??
    { type: 'food', emoji: '?뜑' }, { type: 'food', emoji: '?뜒' }, { type: 'food', emoji: '?뙪' }, { type: 'food', emoji: '?뜔' },
    // 2??
    { type: 'food', emoji: '?뜜' }, { type: 'food', emoji: '?뜦' }, { type: 'food', emoji: '?뜲' }, { type: 'food', emoji: '?뜣' },
    // 3??
    { type: 'food', emoji: '?뜧' }, { type: 'food', emoji: '?뜪' }, { type: 'food', emoji: '?뜫' }, { type: 'placeholder' },
    // 4??
    { type: 'placeholder' }, { type: 'placeholder' }, { type: 'placeholder' }, { type: 'placeholder' }
];

const FOOD_COLLECTION_DATA = {
    '?뜑': { name: '?꾨쾭嫄?, nameEn: 'Hamburger', description: '?≪쬂 媛?앺븳 ?⑦떚? ?좎꽑???쇱콈??議고솕. ????踰좎뼱 臾쇰㈃ ?됰났???쇱쭛?덈떎.' },
    '?뜒': { name: '?쇱옄', nameEn: 'Pizza', description: '移섏쫰媛 彛??섏뼱?섎뒗 ?댄깉由ъ븘??留? ?좏븨???곕씪 ?ㅼ뼇??留ㅻ젰??媛吏묐땲??' },
    '?뙪': { name: '?ル룄洹?, nameEn: 'Hotdog', description: '媛꾪렪?섍쾶 利먭린???뚯떆吏? 鍮? 耳泥⑷낵 癒몄뒪??쒕? 肉뚮젮 ?쒖꽭??' },
    '?뜔': { name: '移섑궓', nameEn: 'Chicken', description: '諛붿궘???源????珥됱큺???띿궡. 援?? 媛꾩떇 移섑궓?낅땲??' },
    '?뜜': { name: '媛먯옄?源', nameEn: 'French Fries', description: '吏?ℓ?섍퀬 怨좎냼??媛먯옄??留? ?꾨쾭嫄곗? 理쒓퀬??吏앷퓤?낅땲??' },
    '?뜦': { name: '?꾨꽋', nameEn: 'Donut', description: '?ъ숴???ㅽ깢 肄뷀똿怨?遺?쒕윭??鍮? 而ㅽ뵾? ?④퍡 利먭린硫??붿슧 醫뗭뒿?덈떎.' },
    '?뜲': { name: '耳?댄겕', nameEn: 'Cake', description: '?밸퀎???좎쓣 異뺥븯?섎뒗 遺?쒕윭???붿??? ?ъ숴???щ┝???낆븞?먯꽌 ?뱀뒿?덈떎.' },
    '?뜣': { name: '?꾩씠?ㅽ겕由?, nameEn: 'Ice Cream', description: '?쒖썝?섍퀬 ?ъ숴???щ쫫??留? ?ㅼ뼇??留쏆쓣 怨⑤씪 癒밸뒗 ?щ?媛 ?덉뒿?덈떎.' },
    '?뜧': { name: '荑좏궎', nameEn: 'Cookie', description: '諛붿궘諛붿궘???앷컧怨??ъ숴??珥덉퐳由?移? ?곗쑀? ?④퍡 癒뱀쑝硫?轅留쏆엯?덈떎.' },
    '?뜪': { name: '珥덉퐳由?, nameEn: 'Chocolate', description: '吏꾪븳 移댁뭅?ㅼ쓽 ?띾?. ?ㅽ듃?덉뒪瑜??좊젮踰꾨━???ъ숴?⑥엯?덈떎.' },
    '?뜫': { name: '?ы깢', nameEn: 'Candy', description: '?뚮줉?щ줉???됯퉼怨??ㅼ뼇??怨쇱씪 留? ?낆븞 媛???쇱????ъ숴?⑥쓣 利먭꺼蹂댁꽭??' }
};

// Global State Variables (Shared across modules)
window.GameState = {
    state: 'start', // start, playing, gameover, collection, options, input_ranking, ranking_board, stage1clear
    score: 0,
    highScores: [],
    options: {
        bgmEnabled: false,
        bgmVolume: 0.5,
        sfxEnabled: true,
        sfxVolume: 0.5,
        clearDistance: 450, // 450m (湲곕낯媛?
        graphicsQuality: 'medium', // low, medium, high
        fullscreen: false
    },
    // ?듭뀡 ??ぉ ?뺤쓽 (GameState ?대???吏곸젒 ?ы븿)
    OPTION_ITEMS: [
        { label: 'BGM', key: 'bgmEnabled', type: 'toggle' },
        { label: 'BGM 蹂쇰ⅷ', key: 'bgmVolume', type: 'slider', min: 0, max: 100, isPercent: true },
        { label: '?④낵??, key: 'sfxEnabled', type: 'toggle' },
        { label: '?④낵??蹂쇰ⅷ', key: 'sfxVolume', type: 'slider', min: 0, max: 100, isPercent: true },
        { label: '?대━??嫄곕━', key: 'clearDistance', type: 'slider', min: 100, max: 1000, suffix: 'm' },
        { label: '洹몃옒???덉쭏', key: 'graphicsQuality', type: 'select', options: ['low', 'medium', 'high'] },
        { label: '?꾩껜?붾㈃', key: 'fullscreen', type: 'toggle' }
    ],
    collectionData: {},
    isPaused: false,

    // Player State
    girlY: GROUND_Y - GIRL_H,
    vy: 0,
    hp: 3,
    airJumpUsed: false,

    // Game Props
    foods: [],
    bullets: [],
    bombs: [],
    explosions: [],
    clearFireworks: [],

    // Timers & Counters
    frameCount: 0,
    scrollOffset: 0,
    reloadCooldown: 0,
    shootActive: false,
    shootFrameCount: 0,
    bombActive: false,
    bombFrameCount: 0,
    slideActive: false,
    slideFrames: 0,
    foodShakeFrame: 0,
    pauseFramesLeft: 0,
    deathFallFrames: 0,
    stage1ClearFrames: 0,

    // Ranking Input
    inputName: '',
    newHighScoreIndex: -1,

    // Collection UI
    selectedFoodIndex: 0,
    collectionScrollOffset: 0,

    // Canvas Context
    canvas: null,
    ctx: null
};

// Load Saved Data
const savedOptions = localStorage.getItem('jg_options');
if (savedOptions) {
    try {
        const parsed = JSON.parse(savedOptions);
        window.GameState.options = { ...window.GameState.options, ...parsed };
    } catch (e) {
        console.error('Failed to load options', e);
    }
}

const savedCollection = localStorage.getItem('jg_collection');
if (savedCollection) {
    try {
        window.GameState.collectionData = JSON.parse(savedCollection);
    } catch (e) {
        console.error('Failed to load collection', e);
    }
}

const savedHighScores = localStorage.getItem('jg_highscores');
if (savedHighScores) {
    try {
        window.GameState.highScores = JSON.parse(savedHighScores);
    } catch (e) {
        console.error('Failed to load highscores', e);
    }
}

// Global aliases for convenience
const G = window.GameState;
const options = G.options;
const OPTION_ITEMS = G.OPTION_ITEMS;

```

## js\config_GOLDEN_MASTER.js
```js
/**
 * Game Configuration & Constants
 */
const GW = 360, GH = 640;
const GROUND_Y = GH - 100;
const GRAVITY = 0.55;
const JUMP_POWER = -13; // 1???먰봽
const AIR_JUMP_POWER = -11; // 2???먰봽
const GIRL_W = 96, GIRL_H = 180;
const GIRL_OFFSET_Y = 0; // ?뚮?媛 吏硫댁뿉???좎엳??媛꾧꺽 ?꾨떂, 醫뚰몴 蹂댁젙
const GIRL_X = 10;
const MAX_FALL_SPEED = 14;

// ?고듃
const FONT_HANGUL = '"Nanum Myeongjo", serif';

// UI Constants
const BTN = { x: (GW - 130) / 2, y: 400, w: 130, h: 56 }; // 寃뚯엫 ?쒖옉 踰꾪듉 (?덈퉬 諛섏쑝濡?以꾩엫 260 -> 130, 以묒븰 ?뺣젹)
const RETRY_BTN = { x: 50, y: 320, w: 260, h: 56 }; // ?ㅼ떆 ?섍린 踰꾪듉
const TITLE_BTN = { x: 50, y: 400, w: 260, h: 56 }; // ??댄?濡??뚯븘媛湲?踰꾪듉
const MAX_HIGH_SCORES = 20; // 理쒕? ??궧 ?????
const ATTENDANCE_BTN = { x: GW - 80, y: GH - 160, w: 60, h: 60 }; // 異쒖꽍泥댄겕 踰꾪듉 (?듭뀡 踰꾪듉 ?꾨줈 諛곗튂)
const COLLECTION_BTN = { x: 20, y: GH - 80, w: 60, h: 60 }; // ?꾧컧 踰꾪듉 (醫뚰븯??
const OPTIONS_BTN = { x: GW - 80, y: GH - 80, w: 60, h: 60 }; // ?듭뀡 踰꾪듉 (?고븯??
const OPT_RESET_BTN = { x: 50, y: GH - 110, w: GW - 100, h: 45 }; // ?듭뀡 珥덇린??踰꾪듉

const FOOD_SPEED = 5.0; // ?뚯떇 ?대룞 ?띾룄
const FOOD_SIZE = 56;
const RELOAD_COOLDOWN_DURATION = 14; // 珥앹븣 ?ъ옣??荑⑦???(?꾨젅??
const BULLET_SPEED = 12;
const BULLET_W = 20, BULLET_H = 10;
const BOMB_W = 32, BOMB_H = 32;
const BOMB_VX = 2.75, BOMB_VY = -12.0; // ??깂 ?섏????띾룄 (鍮꾧굅由?5.5 -> 2.75濡?議곗젙)

// Collection Data
const COLLECTION_ITEMS = [
    // 1??
    { type: 'food', emoji: '?뜑' }, { type: 'food', emoji: '?뜒' }, { type: 'food', emoji: '?뙪' }, { type: 'food', emoji: '?뜔' },
    // 2??
    { type: 'food', emoji: '?뜜' }, { type: 'food', emoji: '?뜦' }, { type: 'food', emoji: '?뜲' }, { type: 'food', emoji: '?뜣' },
    // 3??
    { type: 'food', emoji: '?뜧' }, { type: 'food', emoji: '?뜪' }, { type: 'food', emoji: '?뜫' }, { type: 'placeholder' },
    // 4??
    { type: 'placeholder' }, { type: 'placeholder' }, { type: 'placeholder' }, { type: 'placeholder' }
];

const FOOD_COLLECTION_DATA = {
    '?뜑': { name: '?꾨쾭嫄?, nameEn: 'Hamburger', description: '?≪쬂 媛?앺븳 ?⑦떚? ?좎꽑???쇱콈??議고솕. ????踰좎뼱 臾쇰㈃ ?됰났???쇱쭛?덈떎.' },
    '?뜒': { name: '?쇱옄', nameEn: 'Pizza', description: '移섏쫰媛 彛??섏뼱?섎뒗 ?댄깉由ъ븘??留? ?좏븨???곕씪 ?ㅼ뼇??留ㅻ젰??媛吏묐땲??' },
    '?뙪': { name: '?ル룄洹?, nameEn: 'Hotdog', description: '媛꾪렪?섍쾶 利먭린???뚯떆吏? 鍮? 耳泥⑷낵 癒몄뒪??쒕? 肉뚮젮 ?쒖꽭??' },
    '?뜔': { name: '移섑궓', nameEn: 'Chicken', description: '諛붿궘???源????珥됱큺???띿궡. 援?? 媛꾩떇 移섑궓?낅땲??' },
    '?뜜': { name: '媛먯옄?源', nameEn: 'French Fries', description: '吏?ℓ?섍퀬 怨좎냼??媛먯옄??留? ?꾨쾭嫄곗? 理쒓퀬??吏앷퓤?낅땲??' },
    '?뜦': { name: '?꾨꽋', nameEn: 'Donut', description: '?ъ숴???ㅽ깢 肄뷀똿怨?遺?쒕윭??鍮? 而ㅽ뵾? ?④퍡 利먭린硫??붿슧 醫뗭뒿?덈떎.' },
    '?뜲': { name: '耳?댄겕', nameEn: 'Cake', description: '?밸퀎???좎쓣 異뺥븯?섎뒗 遺?쒕윭???붿??? ?ъ숴???щ┝???낆븞?먯꽌 ?뱀뒿?덈떎.' },
    '?뜣': { name: '?꾩씠?ㅽ겕由?, nameEn: 'Ice Cream', description: '?쒖썝?섍퀬 ?ъ숴???щ쫫??留? ?ㅼ뼇??留쏆쓣 怨⑤씪 癒밸뒗 ?щ?媛 ?덉뒿?덈떎.' },
    '?뜧': { name: '荑좏궎', nameEn: 'Cookie', description: '諛붿궘諛붿궘???앷컧怨??ъ숴??珥덉퐳由?移? ?곗쑀? ?④퍡 癒뱀쑝硫?轅留쏆엯?덈떎.' },
    '?뜪': { name: '珥덉퐳由?, nameEn: 'Chocolate', description: '吏꾪븳 移댁뭅?ㅼ쓽 ?띾?. ?ㅽ듃?덉뒪瑜??좊젮踰꾨━???ъ숴?⑥엯?덈떎.' },
    '?뜫': { name: '?ы깢', nameEn: 'Candy', description: '?뚮줉?щ줉???됯퉼怨??ㅼ뼇??怨쇱씪 留? ?낆븞 媛???쇱????ъ숴?⑥쓣 利먭꺼蹂댁꽭??' }
};

// Global State Variables (Shared across modules)
window.GameState = {
    state: 'start', // start, playing, gameover, collection, options, input_ranking, ranking_board, stage1clear
    score: 0,
    highScores: [],
    options: {
        bgmEnabled: false,
        bgmVolume: 0.5,
        sfxEnabled: true,
        sfxVolume: 0.5,
        clearDistance: 450, // 450m (湲곕낯媛?
        graphicsQuality: 'medium', // low, medium, high
        fullscreen: false
    },
    // ?듭뀡 ??ぉ ?뺤쓽 (GameState ?대???吏곸젒 ?ы븿)
    OPTION_ITEMS: [
        { label: 'BGM', key: 'bgmEnabled', type: 'toggle' },
        { label: 'BGM 蹂쇰ⅷ', key: 'bgmVolume', type: 'slider', min: 0, max: 100, isPercent: true },
        { label: '?④낵??, key: 'sfxEnabled', type: 'toggle' },
        { label: '?④낵??蹂쇰ⅷ', key: 'sfxVolume', type: 'slider', min: 0, max: 100, isPercent: true },
        { label: '?대━??嫄곕━', key: 'clearDistance', type: 'slider', min: 100, max: 1000, suffix: 'm' },
        { label: '洹몃옒???덉쭏', key: 'graphicsQuality', type: 'select', options: ['low', 'medium', 'high'] },
        { label: '?꾩껜?붾㈃', key: 'fullscreen', type: 'toggle' }
    ],
    collectionData: {},
    isPaused: false,

    // Player State
    girlY: GROUND_Y - GIRL_H,
    vy: 0,
    hp: 3,
    airJumpUsed: false,

    // Game Props
    foods: [],
    bullets: [],
    bombs: [],
    explosions: [],
    clearFireworks: [],

    // Timers & Counters
    frameCount: 0,
    scrollOffset: 0,
    reloadCooldown: 0,
    shootActive: false,
    shootFrameCount: 0,
    bombActive: false,
    bombFrameCount: 0,
    slideActive: false,
    slideFrames: 0,
    foodShakeFrame: 0,
    pauseFramesLeft: 0,
    deathFallFrames: 0,
    stage1ClearFrames: 0,

    // Ranking Input
    inputName: '',
    newHighScoreIndex: -1,

    // Collection UI
    selectedFoodIndex: 0,
    collectionScrollOffset: 0,

    // Canvas Context
    canvas: null,
    ctx: null
};

// Load Saved Data
const savedOptions = localStorage.getItem('jg_options');
if (savedOptions) {
    try {
        const parsed = JSON.parse(savedOptions);
        window.GameState.options = { ...window.GameState.options, ...parsed };
    } catch (e) {
        console.error('Failed to load options', e);
    }
}

const savedCollection = localStorage.getItem('jg_collection');
if (savedCollection) {
    try {
        window.GameState.collectionData = JSON.parse(savedCollection);
    } catch (e) {
        console.error('Failed to load collection', e);
    }
}

const savedHighScores = localStorage.getItem('jg_highscores');
if (savedHighScores) {
    try {
        window.GameState.highScores = JSON.parse(savedHighScores);
    } catch (e) {
        console.error('Failed to load highscores', e);
    }
}

```

## js\config_stable_backup.js
```js
/**
 * Game Configuration & Constants
 */
const GW = 360, GH = 640;
const GROUND_Y = GH - 100;
const GRAVITY = 0.55;
const JUMP_POWER = -13; // 1???먰봽
const AIR_JUMP_POWER = -11; // 2???먰봽
const GIRL_W = 96, GIRL_H = 180;
const GIRL_OFFSET_Y = 0; // ?뚮?媛 吏硫댁뿉???좎엳??媛꾧꺽 ?꾨떂, 醫뚰몴 蹂댁젙
const GIRL_X = 50;
const MAX_FALL_SPEED = 14;

// ?고듃
const FONT_HANGUL = '"Nanum Myeongjo", serif';

// UI Constants
const BTN = { x: 50, y: 400, w: 260, h: 56 }; // 寃뚯엫 ?쒖옉 踰꾪듉
const RETRY_BTN = { x: 50, y: 320, w: 260, h: 56 }; // ?ㅼ떆 ?섍린 踰꾪듉
const TITLE_BTN = { x: 50, y: 400, w: 260, h: 56 }; // ??댄?濡??뚯븘媛湲?踰꾪듉
const MAX_HIGH_SCORES = 20; // 理쒕? ??궧 ?????
const ATTENDANCE_BTN = { x: 50, y: 480, w: 260, h: 56 }; // 異쒖꽍泥댄겕 踰꾪듉
const COLLECTION_BTN = { x: 20, y: GH - 80, w: 60, h: 60 }; // ?꾧컧 踰꾪듉 (醫뚰븯??
const OPTIONS_BTN = { x: GW - 80, y: GH - 80, w: 60, h: 60 }; // ?듭뀡 踰꾪듉 (?고븯??

const FOOD_SPEED = 5.0; // ?뚯떇 ?대룞 ?띾룄
const FOOD_SIZE = 56;
const RELOAD_COOLDOWN_DURATION = 14; // 珥앹븣 ?ъ옣??荑⑦???(?꾨젅??
const BULLET_SPEED = 12;
const BULLET_W = 20, BULLET_H = 10;
const BOMB_W = 32, BOMB_H = 32;
const BOMB_VX = 5.5, BOMB_VY = -6.0; // ??깂 ?섏????띾룄

// Collection Data
const COLLECTION_ITEMS = [
    // 1??
    { type: 'food', emoji: '?뜑' }, { type: 'food', emoji: '?뜒' }, { type: 'food', emoji: '?뙪' }, { type: 'food', emoji: '?뜔' },
    // 2??
    { type: 'food', emoji: '?뜜' }, { type: 'food', emoji: '?뜦' }, { type: 'food', emoji: '?뜲' }, { type: 'food', emoji: '?뜣' },
    // 3??
    { type: 'food', emoji: '?뜧' }, { type: 'food', emoji: '?뜪' }, { type: 'food', emoji: '?뜫' }, { type: 'placeholder' },
    // 4??
    { type: 'placeholder' }, { type: 'placeholder' }, { type: 'placeholder' }, { type: 'placeholder' }
];

const FOOD_COLLECTION_DATA = {
    '?뜑': { name: '?꾨쾭嫄?, nameEn: 'Hamburger', description: '?≪쬂 媛?앺븳 ?⑦떚? ?좎꽑???쇱콈??議고솕. ????踰좎뼱 臾쇰㈃ ?됰났???쇱쭛?덈떎.' },
    '?뜒': { name: '?쇱옄', nameEn: 'Pizza', description: '移섏쫰媛 彛??섏뼱?섎뒗 ?댄깉由ъ븘??留? ?좏븨???곕씪 ?ㅼ뼇??留ㅻ젰??媛吏묐땲??' },
    '?뙪': { name: '?ル룄洹?, nameEn: 'Hotdog', description: '媛꾪렪?섍쾶 利먭린???뚯떆吏? 鍮? 耳泥⑷낵 癒몄뒪??쒕? 肉뚮젮 ?쒖꽭??' },
    '?뜔': { name: '移섑궓', nameEn: 'Chicken', description: '諛붿궘???源????珥됱큺???띿궡. 援?? 媛꾩떇 移섑궓?낅땲??' },
    '?뜜': { name: '媛먯옄?源', nameEn: 'French Fries', description: '吏?ℓ?섍퀬 怨좎냼??媛먯옄??留? ?꾨쾭嫄곗? 理쒓퀬??吏앷퓤?낅땲??' },
    '?뜦': { name: '?꾨꽋', nameEn: 'Donut', description: '?ъ숴???ㅽ깢 肄뷀똿怨?遺?쒕윭??鍮? 而ㅽ뵾? ?④퍡 利먭린硫??붿슧 醫뗭뒿?덈떎.' },
    '?뜲': { name: '耳?댄겕', nameEn: 'Cake', description: '?밸퀎???좎쓣 異뺥븯?섎뒗 遺?쒕윭???붿??? ?ъ숴???щ┝???낆븞?먯꽌 ?뱀뒿?덈떎.' },
    '?뜣': { name: '?꾩씠?ㅽ겕由?, nameEn: 'Ice Cream', description: '?쒖썝?섍퀬 ?ъ숴???щ쫫??留? ?ㅼ뼇??留쏆쓣 怨⑤씪 癒밸뒗 ?щ?媛 ?덉뒿?덈떎.' },
    '?뜧': { name: '荑좏궎', nameEn: 'Cookie', description: '諛붿궘諛붿궘???앷컧怨??ъ숴??珥덉퐳由?移? ?곗쑀? ?④퍡 癒뱀쑝硫?轅留쏆엯?덈떎.' },
    '?뜪': { name: '珥덉퐳由?, nameEn: 'Chocolate', description: '吏꾪븳 移댁뭅?ㅼ쓽 ?띾?. ?ㅽ듃?덉뒪瑜??좊젮踰꾨━???ъ숴?⑥엯?덈떎.' },
    '?뜫': { name: '?ы깢', nameEn: 'Candy', description: '?뚮줉?щ줉???됯퉼怨??ㅼ뼇??怨쇱씪 留? ?낆븞 媛???쇱????ъ숴?⑥쓣 利먭꺼蹂댁꽭??' }
};

// Global State Variables (Shared across modules)
window.GameState = {
    state: 'start', // start, playing, gameover, collection, options, input_ranking, ranking_board, stage1clear
    score: 0,
    highScores: [],
    options: {
        bgmEnabled: false,
        bgmVolume: 0.5,
        sfxEnabled: true,
        sfxVolume: 0.5,
        clearDistance: 450, // 450m (湲곕낯媛?
        graphicsQuality: 'medium', // low, medium, high
        fullscreen: false
    },
    collectionData: {},
    isPaused: false,

    // Player State
    girlY: GROUND_Y - GIRL_H,
    vy: 0,
    hp: 3,
    airJumpUsed: false,

    // Game Props
    foods: [],
    bullets: [],
    bombs: [],
    explosions: [],
    clearFireworks: [],

    // Timers & Counters
    frameCount: 0,
    scrollOffset: 0,
    reloadCooldown: 0,
    shootActive: false,
    shootFrameCount: 0,
    bombActive: false,
    bombFrameCount: 0,
    slideActive: false,
    slideFrames: 0,
    foodShakeFrame: 0,
    pauseFramesLeft: 0,
    deathFallFrames: 0,
    stage1ClearFrames: 0,

    // Ranking Input
    inputName: '',
    newHighScoreIndex: -1,

    // Collection UI
    selectedFoodIndex: 0,
    collectionScrollOffset: 0,

    // Canvas Context
    canvas: null,
    ctx: null
};

// Load Saved Data
const savedOptions = localStorage.getItem('jg_options');
if (savedOptions) {
    try {
        const parsed = JSON.parse(savedOptions);
        window.GameState.options = { ...window.GameState.options, ...parsed };
    } catch (e) {
        console.error('Failed to load options', e);
    }
}

const savedCollection = localStorage.getItem('jg_collection');
if (savedCollection) {
    try {
        window.GameState.collectionData = JSON.parse(savedCollection);
    } catch (e) {
        console.error('Failed to load collection', e);
    }
}

const savedHighScores = localStorage.getItem('jg_highscores');
if (savedHighScores) {
    try {
        window.GameState.highScores = JSON.parse(savedHighScores);
    } catch (e) {
        console.error('Failed to load highscores', e);
    }
}


```

## js\game.js
```js
/**
 * Jumping Girl - Food Escape
 * ?몃씪蹂??뚮?媛 ?щ━硫? ?ㅻⅨ履쎌뿉???ㅺ??ㅻ뒗 ?뚯떇???ㅽ럹?댁뒪(?먰봽)濡??쇳븯??寃뚯엫
 * @see docs/implementation-baseline.md   (援ы쁽 湲곗?쨌?꾩껜 ?ㅽ럺)
 * @see docs/instruction-002-game-design-basic.md
 * @see docs/instruction-003-bg-aspect-and-bullet.md
 * @see docs/instruction-004-bg-cover-and-ghosting-fix.md
 * @see docs/instruction-005-food-spawn-hp-pause.md
 * @see docs/instruction-006-hp-left-and-explosion.md
 * @see docs/instruction-007-explosion-led-digital-style.md
 * @see docs/instruction-008-explosion-big-star-fragments.md
 * @see docs/instruction-009-bg-offset-road.md
 * @see docs/instruction-010-bullet-visibility-and-girl-gif.md
 */

// Global State Aliases (Now provided by config.js)
// const G = window.GameState;
// const options = G.options;
// const OPTION_ITEMS = G.OPTION_ITEMS;

// Main Game Logic

// Initialize Global State Link
// const G = window.GameState; // Moved to ui.js / global scope

// Local aliases for convenience (optional)
// Note: Draw logic in ui.js uses G directly.
// Physics/Game logic here uses G properties.

// DOM Elements (GIFs)
const girlGifImg = document.getElementById('girlGif');
const slideGifImg = document.getElementById('slideGif');
const shootGifImg = document.getElementById('shootGif');
const bombGifImg = document.getElementById('bombGif');

let canvas, ctx;
let state = 'start'; // start, playing, gameover, collection, options, input_ranking, ranking_board, stage1clear
let currentStage = 1;
let highScores = JSON.parse(localStorage.getItem('jg_highscores')) || [];
if (highScores.length === 0) {
  for (let i = 0; i < 5; i++) {
    highScores.push({ name: 'AAA', score: (5 - i) * 1000 });
  }
}
let inputName = '';
let newHighScoreIndex = -1;
let selectedOptionIndex = 0; // ?듭뀡 硫붾돱 而ㅼ꽌
let selectedFoodIndex = 0;   // ?꾧컧 ?좏깮 而ㅼ꽌
let isDraggingSlider = false; // ?듭뀡 ?щ씪?대뜑 ?쒕옒洹?以??щ?

window.addEventListener('load', () => {
  canvas = document.getElementById('gameCanvas');
  if (!canvas) return;
  ctx = canvas.getContext('2d');

  // Update Global Context
  if (window.GameState) {
    window.GameState.canvas = canvas;
    window.GameState.ctx = ctx;
  }

  // Resize canvas initially
  resize();

  // Input Listeners via document to capture overall interaction
  // (Logic moved to consolidated listeners at the bottom)

  // Start Game Loop
  requestAnimationFrame(loop);
});

// Main Loop Function (Hoisted)
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}
// Image Loading & Game Logic below...
// Background setup
const STAGE1_BG = 'graphic_resource/background.png';
const STAGE2_BG = 'graphic_resource/background_02.png';
const bgImage = new Image();
let bgReady = false;
bgImage.onload = function () { bgReady = true; };
bgImage.src = STAGE1_BG;

// 1?ㅽ뀒?댁? ?대━???대?吏
const stage1ClearImage = new Image();
stage1ClearImage.src = 'graphic_resource/stage_clear/1stage_clear.png';
let stage1ClearReady = false;
stage1ClearImage.onload = function () { stage1ClearReady = true; };

// 寃뚯엫 ?쒖옉 ?붾㈃: graphic_resource/screen_title.png (源붿뼱?볤린). 誘몃줈?????⑥깋+?띿뒪???대갚
const titleImage = new Image();
titleImage.src = 'graphic_resource/screen_title.png';
let titleReady = false;
titleImage.onload = function () { titleReady = true; };

// 二쇱씤怨? run.gif (?щ━湲? ?щ챸 諛곌꼍 GIF ?좊땲硫붿씠??
// Canvas?먯꽌??GIF ?좊땲硫붿씠?섏씠 ?ъ깮?섏? ?딆쑝誘濡?img ?쒓렇瑜??ъ슜
const girlImage = new Image();
girlImage.crossOrigin = 'anonymous';
let girlReady = false;
const girlGifPath = 'graphic_resource/character/anim/run.gif';

// img ?쒓렇??GIF ?ㅼ젙
if (girlGifImg) {
  girlGifImg.src = girlGifPath;
  girlGifImg.onload = function () {
    girlReady = true;
    console.log('???щ━湲?GIF 濡쒕뱶 ?꾨즺 (img ?쒓렇):', girlGifImg.naturalWidth, 'x', girlGifImg.naturalHeight);
  };
  girlGifImg.onerror = function (e) {
    girlReady = false;
    console.error('???щ━湲?GIF 濡쒕뱶 ?ㅽ뙣:', girlGifPath);
  };
}

// Image 媛앹껜??濡쒕뱶 (?대갚??
girlImage.onload = function () {
  if (!girlReady) girlReady = true;
  console.log('???щ━湲?GIF 濡쒕뱶 ?꾨즺 (Image 媛앹껜):', girlImage.naturalWidth, 'x', girlImage.naturalHeight);
};
girlImage.onerror = function (e) {
  console.error('???щ━湲?GIF 濡쒕뱶 ?ㅽ뙣 (Image 媛앹껜):', girlImage.src);
};
const girlChromaKeyRef = { chromaKey: null, isGif: true };
(async function loadGirlImage() {
  const path = girlGifPath;
  console.log('?봽 ?щ━湲?GIF 濡쒕뱶 ?쒖옉:', path);
  if (location.protocol === 'file:') {
    girlImage.removeAttribute('crossorigin');
    girlImage.src = path;
    return;
  }
  try {
    const r = await fetch(path);
    if (r.ok) {
      const blob = await r.blob();
      girlImage.src = URL.createObjectURL(blob);
      return;
    }
  } catch (e) { }
  girlImage.removeAttribute('crossorigin');
  girlImage.src = path;
})();

// ?꾪솚 諛쒖궗 ?? shoot.gif (?щ챸 諛곌꼍 GIF ?좊땲硫붿씠??
// Canvas?먯꽌??GIF ?좊땲硫붿씠?섏씠 ?ъ깮?섏? ?딆쑝誘濡?img ?쒓렇瑜??ъ슜
const shootImage = new Image();
shootImage.crossOrigin = 'anonymous';
let shootReady = false;
let shootActive = false; // true????drawGirl? shootGifImg瑜?洹몃┝
let shootFrameCount = 0; // 諛쒖궗 ?좊땲硫붿씠???꾨젅??移댁슫??const SHOOT_DURATION = 24; // 諛쒖궗 ?좊땲硫붿씠??吏???쒓컙 (?꾨젅?? - 30??80%
let reloadCooldown = 0; // ?ъ옣??荑⑦???(?꾨젅?? - 2珥?= 120?꾨젅??// Reload cooldown moved to config.js
// const RELOAD_COOLDOWN_DURATION = 120;
const shootGifPath = 'graphic_resource/character/anim/shoot.gif';

// ??깂 ?섏?湲??좊땲硫붿씠??let bombActive = false; // true????drawGirl? bombGifImg瑜?洹몃┝
let bombFrameCount = 0; // ??깂 ?섏?湲??좊땲硫붿씠???꾨젅??移댁슫??const BOMB_DURATION = 15; // ??깂 ?섏?湲??좊땲硫붿씠??吏???쒓컙 (?꾨젅?? - 2諛?鍮좊Ⅴ寃?const bombGifPath = 'graphic_resource/character/anim/bomb.gif';
let bombReady = false;

// img ?쒓렇??GIF ?ㅼ젙
if (shootGifImg) {
  shootGifImg.src = shootGifPath;
  shootGifImg.onload = function () {
    shootReady = true;
    console.log('??諛쒖궗 GIF 濡쒕뱶 ?꾨즺 (img ?쒓렇):', shootGifImg.naturalWidth, 'x', shootGifImg.naturalHeight);
  };
  shootGifImg.onerror = function (e) {
    shootReady = false;
    console.error('??諛쒖궗 GIF 濡쒕뱶 ?ㅽ뙣:', shootGifPath);
  };
}

// Image 媛앹껜??濡쒕뱶 (?대갚??
shootImage.onload = function () {
  if (!shootReady) shootReady = true;
  console.log('??諛쒖궗 GIF 濡쒕뱶 ?꾨즺 (Image 媛앹껜):', shootImage.naturalWidth, 'x', shootImage.naturalHeight);
};
shootImage.onerror = function (e) {
  console.error('??諛쒖궗 GIF 濡쒕뱶 ?ㅽ뙣 (Image 媛앹껜):', shootImage.src);
};

// ??깂 ?섏?湲?GIF 濡쒕뱶
if (bombGifImg) {
  bombGifImg.src = bombGifPath;
  bombGifImg.onload = function () {
    bombReady = true;
    console.log('????깂 ?섏?湲?GIF 濡쒕뱶 ?꾨즺 (img ?쒓렇):', bombGifImg.naturalWidth, 'x', bombGifImg.naturalHeight);
  };
  bombGifImg.onerror = function (e) {
    bombReady = false;
    console.error('????깂 ?섏?湲?GIF 濡쒕뱶 ?ㅽ뙣:', bombGifPath);
  };
}
const shootChromaKeyRef = { chromaKey: null, isGif: true };
(async function loadShootImage() {
  const path = shootGifPath;
  console.log('?봽 諛쒖궗 GIF 濡쒕뱶 ?쒖옉:', path);
  if (location.protocol === 'file:') {
    shootImage.removeAttribute('crossorigin');
    shootImage.src = path;
    return;
  }
  try {
    const r = await fetch(path);
    if (r.ok) {
      const blob = await r.blob();
      shootImage.src = URL.createObjectURL(blob);
      return;
    }
  } catch (e) { }
  shootImage.removeAttribute('crossorigin');
  shootImage.src = path;
})();

// ?щ씪?대뵫: sliding.gif (?щ챸 諛곌꼍 GIF ?좊땲硫붿씠??
// Canvas?먯꽌??GIF ?좊땲硫붿씠?섏씠 ?ъ깮?섏? ?딆쑝誘濡?img ?쒓렇瑜??ъ슜
const slideImage = new Image();
slideImage.crossOrigin = 'anonymous';
let slideReady = false;
let slideActive = false; // true????drawGirl? slideImage瑜?洹몃┝
let slideFrameCount = 0; // ?щ씪?대뵫 ?좊땲硫붿씠???꾨젅??移댁슫??let slideStartFrame = 0; // ?щ씪?대뵫 ?쒖옉 ?꾨젅??let slideLoopCompleted = false; // ?щ씪?대뵫 猷⑦봽 1???꾨즺 ?щ?
const slideGifPath = 'graphic_resource/character/anim/sliding.gif';

// img ?쒓렇??GIF ?ㅼ젙
if (slideGifImg) {
  slideGifImg.src = slideGifPath;
  slideGifImg.onload = function () {
    slideReady = true;
    console.log('???щ씪?대뵫 GIF 濡쒕뱶 ?꾨즺 (img ?쒓렇):', slideGifImg.naturalWidth, 'x', slideGifImg.naturalHeight);
  };
  slideGifImg.onerror = function (e) {
    slideReady = false;
    console.error('???щ씪?대뵫 GIF 濡쒕뱶 ?ㅽ뙣:', slideGifPath);
  };
}

// Image 媛앹껜??濡쒕뱶 (?대갚??
slideImage.onload = function () {
  if (!slideReady) slideReady = true;
  console.log('???щ씪?대뵫 GIF 濡쒕뱶 ?꾨즺 (Image 媛앹껜):', slideImage.naturalWidth, 'x', slideImage.naturalHeight);
};
slideImage.onerror = function (e) {
  console.error('???щ씪?대뵫 GIF 濡쒕뱶 ?ㅽ뙣 (Image 媛앹껜):', slideImage.src);
};
const slideChromaKeyRef = { chromaKey: null, isGif: true };
(async function loadSlideImage() {
  const path = slideGifPath;
  console.log('?봽 ?щ씪?대뵫 GIF 濡쒕뱶 ?쒖옉:', path);
  if (location.protocol === 'file:') {
    slideImage.removeAttribute('crossorigin');
    slideImage.src = path;
    return;
  }
  try {
    const r = await fetch(path);
    if (r.ok) {
      const blob = await r.blob();
      slideImage.src = URL.createObjectURL(blob);
      return;
    }
  } catch (e) { }
  slideImage.removeAttribute('crossorigin');
  slideImage.src = path;
})();

// Stage 1 Clear: 0m ?꾨떖 5珥????띿뒪???쒖떆 (MP4 ?쒓굅, GIF留??ъ슜)

// ?덊듃 ?? hurt.png (1쨌2踰덉㎏), 泥대젰 0 ?쒓컙(3踰덉㎏): down.png. 諛곌꼍 ?щ챸 PNG
const hurtImage = new Image();
hurtImage.crossOrigin = 'anonymous';
let hurtReady = false;
hurtImage.onload = function () {
  hurtReady = true;
  console.log('???덊듃 PNG 濡쒕뱶 ?꾨즺:', hurtImage.naturalWidth, 'x', hurtImage.naturalHeight);
};
hurtImage.onerror = function (e) {
  hurtReady = false;
  console.error('???덊듃 PNG 濡쒕뱶 ?ㅽ뙣:', hurtImage.src);
};
const hurtChromaKeyRef = { chromaKey: null };
(async function loadHurtImage() {
  const path = 'graphic_resource/character/hurt.png';
  console.log('?봽 ?덊듃 PNG 濡쒕뱶 ?쒖옉:', path);
  if (location.protocol === 'file:') {
    hurtImage.removeAttribute('crossorigin');
    hurtImage.src = path;
    return;
  }
  try {
    const r = await fetch(path);
    if (r.ok) {
      const blob = await r.blob();
      hurtImage.src = URL.createObjectURL(blob);
      return;
    }
  } catch (e) { }
  hurtImage.removeAttribute('crossorigin');
  hurtImage.src = path;
})();

const downImage = new Image();
downImage.crossOrigin = 'anonymous';
let downReady = false;
downImage.onload = function () {
  downReady = true;
  console.log('???ㅼ슫 PNG 濡쒕뱶 ?꾨즺:', downImage.naturalWidth, 'x', downImage.naturalHeight);
};
downImage.onerror = function (e) {
  downReady = false;
  console.error('???ㅼ슫 PNG 濡쒕뱶 ?ㅽ뙣:', downImage.src);
};
const downChromaKeyRef = { chromaKey: null };
(async function loadDownImage() {
  const path = 'graphic_resource/character/down.png';
  console.log('?봽 ?ㅼ슫 PNG 濡쒕뱶 ?쒖옉:', path);
  if (location.protocol === 'file:') {
    downImage.removeAttribute('crossorigin');
    downImage.src = path;
    return;
  }
  try {
    const r = await fetch(path);
    if (r.ok) {
      const blob = await r.blob();
      downImage.src = URL.createObjectURL(blob);
      return;
    }
  } catch (e) { }
  downImage.removeAttribute('crossorigin');
  downImage.src = path;
})();

// ?듭뀡 濡쒕뱶
function loadOptions() {
  try {
    const saved = localStorage.getItem('jg_options');
    if (saved) {
      const parsed = JSON.parse(saved);
      // window.GameState.options 媛앹껜 ?낅뜲?댄듃
      Object.assign(G.options, parsed);
    }
  } catch (e) {
    console.error('?듭뀡 濡쒕뱶 ?ㅽ뙣:', e);
  }
  applyOptions();
}

function saveOptions() {
  try {
    localStorage.setItem('jg_options', JSON.stringify(G.options));
  } catch (e) {
    console.error('?듭뀡 ????ㅽ뙣:', e);
  }
  applyOptions();
}

// BGM: ??댄? everybody.mp3, ?ㅽ뀒?댁? stage1.mp3
const bgmTitle = new Audio('bgm/everybody.mp3');
bgmTitle.loop = true;
const bgmStage = new Audio('bgm/stage1.mp3');
bgmStage.loop = true;
let titleBgmTried = false;

const sfxGunshot = new Audio('effect_sound/gunshot.mp3');
const sfxBombFlying = new Audio('effect_sound/bomb_flying.mp3');
const sfxBombExplosion = new Audio('effect_sound/bomb_explosion.mp3');
const sfxGirlHurt = new Audio('effect_sound/girl_hurt.mp3');
const sfxGirlDown = new Audio('effect_sound/girl_down.mp3');
const sfxGirlHop = new Audio('effect_sound/girl_hop.mp3');
const sfxReload = new Audio('effect_sound/reload.mp3'); // ?ъ옣???뚮━
function playSfx(a) {
  if (a && options.sfxEnabled) {
    a.currentTime = 0;
    a.play().catch(function () { });
  }
}

// ?듭뀡 ?곸슜
function applyOptions() {
  const bgmVol = options.bgmEnabled ? options.bgmVolume : 0;
  const sfxVol = options.sfxEnabled ? options.sfxVolume : 0;

  if (bgmTitle) bgmTitle.volume = bgmVol;
  if (bgmStage) bgmStage.volume = bgmVol;
  if (sfxGunshot) sfxGunshot.volume = sfxVol;
  if (sfxBombFlying) sfxBombFlying.volume = sfxVol;
  if (sfxBombExplosion) sfxBombExplosion.volume = sfxVol;
  if (sfxGirlHurt) sfxGirlHurt.volume = sfxVol;
  if (sfxGirlDown) sfxGirlDown.volume = sfxVol;
  if (sfxGirlHop) sfxGirlHop.volume = sfxVol;
  if (sfxReload) sfxReload.volume = sfxVol;

  // BGM 利됱떆 諛섏쓳
  if (!options.bgmEnabled) {
    // BGM??爰쇱졇?덉쑝硫??뺤?
    if (bgmTitle) bgmTitle.pause();
    if (bgmStage) bgmStage.pause();
  } else {
    // BGM??耳쒖졇?덉쑝硫??꾩옱 ?곹깭??留욌뒗 BGM ?ъ깮
    if (state === 'playing' || state === 'stage1clear') {
      // ?뚮젅??以묒씠硫??ㅽ뀒?댁? BGM
      if (bgmTitle) bgmTitle.pause();
      if (bgmStage) {
        bgmStage.currentTime = 0;
        bgmStage.play().catch(function () { });
      }
    } else {
      // ??댄?/?꾧컧/?듭뀡/寃뚯엫?ㅻ쾭 ?붾㈃?대㈃ ??댄? BGM
      if (bgmStage) bgmStage.pause();
      if (bgmTitle) {
        bgmTitle.currentTime = 0;
        bgmTitle.play().catch(function () { });
      }
    }
  }
}

// 珥덇린 ?듭뀡 濡쒕뱶 (?ㅻ뵒??媛앹껜 ?앹꽦 ??
loadOptions();

// FONT_HANGUL moved to config.js
// const FONT_HANGUL = '"Nanum Myeongjo", serif';

let girlOffscreen = null;
let girlOffCtx = null;
let girlChromaOffscreen = null; // ?щ줈留덊궎 泥섎━??寃곌낵瑜???ν븷 蹂꾨룄 罹붾쾭??let girlChromaOffCtx = null;
let scaleOffscreen = null; // hurt 1.35諛? down 2諛???scale ??let scaleOffCtx = null;
let chromaKey = null; // ?곸긽 ?ш컖 諛곌꼍 ?щ챸??(?뚮몢由??섑뵆)
let deathFallFrames = 0;  // 3踰덉㎏ ?덊듃 ???⑥뼱吏???곗텧 移댁슫?? 0???꾨땲硫?fall 援ш컙
let deathFallOffsetY = 0; // ?⑥뼱吏???y 媛??let chromaUnavailable = false; // getImageData tainted ???덉쇅 ???щ줈留덊궎 嫄대꼫?
let screenShotDirHandle = null; // CapsLock ?ㅽ겕由곗꺑: 泥?CapsLock ???대뜑 ?좏깮?먯꽌 F:\cursor_project\screen_shot 怨좊Ⅴ硫??대떦 寃쎈줈?????(???몄뀡 ?숈븞 ?좎?)
const CHROMA_DIST = 100; // ?좏겢由щ뱶 嫄곕━ ?쒓퀎 (怨쇰룄???쒓굅쨌?쇨뎬 ?먯긽 諛⑹?)
// 洹몃┛?ㅽ겕由??쇱엫) 蹂댁“: G>R, G>B???뚮쭔 ?곸슜???쇰?/?쇨뎬? ?쒓굅 ??곸뿉???쒖쇅
const CHROMA_GREEN = [0, 255, 0]; // 湲곗? ?뱀깋
const CHROMA_DIST_GREEN = 120;    // ?뱀깋鍮??쇰?쨌洹몃┝??蹂댁〈
// ?쇱엫???щ줈留덊궎: #BFFF00 (191, 255, 0), #ADFF2F (173, 255, 47) ??const CHROMA_LIME = [191, 255, 0]; // ?쇱엫??湲곗?
const CHROMA_DIST_LIME = 100;      // ?쇱엫??嫄곕━ ?꾧퀎媛?
// 二쇱씤怨? ?몃씪蹂??뚮?, ?쇱そ 怨좎젙 (?ш린 2諛? 48횞90 ??96횞180). ?쇰큸: 醫뚯륫?쇰줈 遺숈엫, ?꾨줈 20
// GIRL constants moved to config.js
// const GIRL_X = 2;
// const GIRL_OFFSET_Y = -20; 
// const GIRL_W = 96;
// const GIRL_H = 180;
// const GROUND_Y = 580; 
let girlY = GROUND_Y - GIRL_H;
let vy = 0;
// const GRAVITY = 0.55; // moved to config.js
const JUMP_FORCE = -13.5; // ??먰봽, ?믪씠 ?덈컲 (|vy|/??)
const AIR_JUMP_VY = JUMP_FORCE / Math.sqrt(3); // 怨듭쨷 1???뚯젏?? ?먮옒 ?믪씠??1/3
let airJumpUsed = false;
let runFrame = 0;
let frameCount = 0;
let slideFrames = 0; // ?щ씪?대뵫 吏???꾨젅??移댁슫??const SLIDE_DURATION = 36; // ?щ씪?대뵫 吏???쒓컙 (??0.6珥?@ 60fps)

// 諛곌꼍 ?ㅽ겕濡? 200m: 12珥?60fps)쨌BG_SPEED=4 ??scrollOffset 2880????0m
// 諛곌꼍 ?ㅽ겕濡? 200m: 12珥?60fps)쨌BG_SPEED=4 ??scrollOffset 2880????0m
// let scrollOffset = 0; // Removed duplicate
let scrollOffset = 0;
const BG_SPEED = 4;
const SCROLL_FOR_200M = 200 * (3 * 60 * 4) / 50; // 2880 (200m)
const PIXELS_PER_METER = 14.4; // 2880 / 200 = 14.4

// ?뚯떇 ?μ븷臾?const FOODS = ['?뜋', '?뜑', '?뜒', '?뜜', '?뙪'];
const FOOD_W = 40, FOOD_H = 40;

// 媛??뚯떇蹂??먯젙 諛뺤뒪 (?뚯떇 紐⑥뼇??留욊쾶 議곗젙, ?ш린瑜?2/3濡?異뺤냼)
// ?뚯떇蹂??먯젙 諛뺤뒪 (2/3 -> 1/2濡?異뺤냼?섏뿬 ?먯젙????愿??섍쾶 ?섏젙)
const FOOD_HITBOXES = {
  '?뜋': { x: 10, y: 10, w: 14, h: 14 },   // ?ш낵: 28*1/2 = 14
  '?뜑': { x: 8, y: 12, w: 16, h: 12 },    // ?꾨쾭嫄? 32*1/2=16, 24*1/2=12
  '?뜒': { x: 10, y: 10, w: 14, h: 14 },   // ?쇱옄: 28*1/2 = 14
  '?뜜': { x: 9, y: 11, w: 15, h: 13 },    // 媛먯옄?源: 30*1/2=15, 26*1/2=13
  '?뙪': { x: 8, y: 13, w: 17, h: 11 }     // ?ル룄洹? 34*1/2=17, 22*1/2=11
};

// ?뚯떇???ㅼ젣 ?먯젙 諛뺤뒪 媛?몄삤湲?
function getFoodHitbox(food) {
  const hitbox = FOOD_HITBOXES[food.emoji] || { x: 12, y: 12, w: 12, h: 12 }; // 湲곕낯媛?異뺤냼
  return {
    x: food.x + hitbox.x,
    y: food.y + hitbox.y,
    w: hitbox.w,
    h: hitbox.h
  };
}

// ?뚯떇 ?꾧컧 ?곗씠??// FOOD_COLLECTION_DATA moved to config.js
// const FOOD_COLLECTION_DATA = { ... };

// ?꾧컧 ?곗씠??濡쒕뱶
let collectionData = {};
function loadCollectionData() {
  try {
    const saved = localStorage.getItem('jg_collection');
    if (saved) {
      collectionData = JSON.parse(saved);
    }
  } catch (e) {
    console.error('?꾧컧 ?곗씠??濡쒕뱶 ?ㅽ뙣:', e);
    collectionData = {};
  }
  // 媛??뚯떇 珥덇린??(?놁쑝硫??앹꽦)
  FOODS.forEach(emoji => {
    if (!collectionData[emoji]) {
      collectionData[emoji] = {
        count: 0,
        firstFound: null,
        lastFound: null,
        discovered: false
      };
    }
  });
}

// ?꾧컧 ?곗씠?????
function saveCollectionData() {
  try {
    localStorage.setItem('jg_collection', JSON.stringify(collectionData));
  } catch (e) {
    console.error('?꾧컧 ?곗씠??????ㅽ뙣:', e);
  }
}

// ?뚯떇 遺?섍린 ???꾧컧 ?낅뜲?댄듃
function updateCollection(emoji) {
  if (!collectionData[emoji]) {
    collectionData[emoji] = {
      count: 0,
      firstFound: null,
      lastFound: null,
      discovered: false
    };
  }

  const now = new Date().toISOString();
  collectionData[emoji].count++;
  collectionData[emoji].lastFound = now;

  if (!collectionData[emoji].discovered) {
    collectionData[emoji].discovered = true;
    collectionData[emoji].firstFound = now;
  }

  saveCollectionData();
}

// 珥덇린 濡쒕뱶
loadCollectionData();
// ?ㅽ룿 y 5?ъ씤??(?섃넂?? f.y=?뚯떇 ?곷떒): [0]諛??곸뿭, [1節?]?꾪솚 ?곸뿭, [4]怨듭쨷 ?곸뿭
const FOOD_SPAWN_YS = [500, 430, 360, 290, 220]; // 吏硫?540)怨?罹먮┃??360-540) ?믪씠??留욎떠 ?뺣? 議곗젙
let foods = [];
let nextSpawn = 60;
// FOOD_SPEED moved to config.js
// const FOOD_SPEED = 5.5;

// 珥앹븣 (留덉슦???쇱そ ?대┃ / ?곗튂): ?꾧킅?쇱엫 ?뱀깋, ?덉뿉 ?꾧쾶
// BULLET & BOMB constants moved to config.js
// const BULLET_W = 14, BULLET_H = 7;
// const BULLET_SPEED = 14;
const BULLET_FILL = '#39ff14';   // ?꾧킅?쇱엫 ?뱀깋
const BULLET_STROKE = '#000';    // 寃? ?뚮몢由?(?鍮?
let bullets = [];

// ??깂 (留덉슦???고겢由?: ?щЪ?????붾㈃ ?덉뿉???낆뿉 ?⑥뼱??李⑹?쨌??컻
// const BOMB_W = 32, BOMB_H = 32;
// const BOMB_VX = 4, BOMB_VY = -10; 
let bombs = [];

// ?꾪솚?볦쓬???덊듃: ???곗?硫댁꽌 蹂꾩“媛?(?ш퀬 遺꾨챸?섍쾶)
let explosions = [];
const EXPLOSION_FRAMES = 28;

// ?먯닔 (?ㅽ겕濡?嫄곕━)
let score = 0;

// 泥대젰 (理쒕? 3), ?덊듃 ??0.5珥??뺤?
let hp = 3;
let pauseFramesLeft = 0;
const HIT_PAUSE_FRAMES = 30;
let isPaused = false; // P???쇱떆?뺤?

// Stage 1 Clear: 0m ?꾨떖 ???띿뒪????＝ 5珥?????댄? 蹂듦? (MP4 ?쒓굅)
let stage1ClearFrames = 0;
let clearFireworks = []; // 洹밸챸??諛앹? ??＝ ?꾩슜 (drawExplosion ?ы솢??????

function resize() {
  if (!canvas) return; // Prevent error if canvas is not initialized

  // Set internal resolution matches game logic
  canvas.width = GW;
  canvas.height = GH;

  const w = window.innerWidth, h = window.innerHeight;
  const ratio = 9 / 16;
  let cw = Math.min(360, w), ch = cw / ratio;
  if (ch > h) { ch = h; cw = ch * ratio; }
  canvas.style.width = cw + 'px';
  canvas.style.height = ch + 'px';
  // GIF img ?쒓렇 ?ш린???낅뜲?댄듃
  updateGifPositions();
}
window.addEventListener('resize', resize);
// resize(); // moved to window.onload to ensure canvas is ready

// GIF img ?쒓렇 ?꾩튂 ?낅뜲?댄듃 ?⑥닔
function updateGifPositions() {
  if (!canvas) return;
  if (!girlGifImg || !slideGifImg || !shootGifImg || !bombGifImg) return;

  // Determine visibility flags based on game state
  const shouldShowSlideGif = slideActive;
  const shouldShowShootGif = shootActive;
  const shouldShowBombGif = bombActive;
  // Girl is shown if not doing special actions and alive
  const shouldShowGirlGif = !slideActive && !shootActive && !bombActive && hp > 0 && deathFallFrames === 0 && pauseFramesLeft === 0;

  // Canvas???ㅼ젣 ?붾㈃ ?ш린 (CSS濡??ㅼ??쇰맂 ?ш린)
  const canvasRect = canvas.getBoundingClientRect();
  const screenWidth = canvasRect.width;
  const screenHeight = canvasRect.height;

  // 寃뚯엫 ?대? 醫뚰몴(360x640)瑜??붾㈃ 醫뚰몴濡?蹂?섑븯???ㅼ???  const scaleX = screenWidth / GW;  // ?? 360px / 360 = 1.0
  const scaleY = screenHeight / GH;  // ?? 640px / 640 = 1.0

  // ?щ━湲?GIF ?꾩튂 (寃뚯엫 ?뚮젅??以묒씠怨??쒖떆?댁빞 ????
  if (state === 'playing' && girlReady && shouldShowGirlGif) {
    // 寃뚯엫 ?대? 醫뚰몴瑜??붾㈃ 醫뚰몴濡?蹂??    // GIRL_X = 2, girlY + GIRL_OFFSET_Y??寃뚯엫 ?대? 醫뚰몴
    const gx = GIRL_X * scaleX;
    const gy = (girlY + GIRL_OFFSET_Y) * scaleY;
    const gw = GIRL_W * scaleX;
    const gh = GIRL_H * scaleY;

    // img ?쒓렇??Canvas 而⑦뀒?대꼫 湲곗??쇰줈 ?꾩튂 ?ㅼ젙 (position: absolute?대?濡?
    // Canvas???쇱そ ??紐⑥꽌由ш? (0, 0)???섎룄濡?    // Canvas container is relative, images are absolute children.
    // So coordinates are relative to the container (canvas top-left).

    girlGifImg.style.left = gx + 'px';
    girlGifImg.style.top = gy + 'px';
    girlGifImg.style.width = gw + 'px';
    girlGifImg.style.height = gh + 'px';
    girlGifImg.style.display = 'block';
  } else {
    girlGifImg.style.display = 'none';
  }

  // ?щ씪?대뵫 GIF ?꾩튂 (?ш린 90%濡?議곗젅)
  if (state === 'playing' && slideReady && shouldShowSlideGif) {
    const slideScale = 0.9; // ?щ씪?대뵫 GIF ?ш린 90% (80%?먯꽌 10% 利앷?)
    const slideW = GIRL_W * slideScale;
    const slideH = GIRL_H * slideScale;
    const gx = GIRL_X * scaleX;
    const gy = (girlY + GIRL_OFFSET_Y) * scaleY;
    const gw = slideW * scaleX;
    const gh = slideH * scaleY;
    // 以묒븰 ?뺣젹???꾪빐 ?ㅽ봽??異붽?
    const offsetX = (GIRL_W - slideW) * scaleX * 0.5;
    const offsetY = (GIRL_H - slideH) * scaleY * 0.5;

    slideGifImg.style.left = (gx + offsetX) + 'px';
    slideGifImg.style.top = (gy + offsetY) + 'px';
    slideGifImg.style.width = gw + 'px';
    slideGifImg.style.height = gh + 'px';
    slideGifImg.style.display = 'block';
  } else {
    slideGifImg.style.display = 'none';
  }

  // 諛쒖궗 GIF ?꾩튂
  if (state === 'playing' && shootReady && shouldShowShootGif) {
    const gx = GIRL_X * scaleX;
    const gy = (girlY + GIRL_OFFSET_Y) * scaleY;
    const gw = GIRL_W * scaleX;
    const gh = GIRL_H * scaleY;

    shootGifImg.style.left = gx + 'px';
    shootGifImg.style.top = gy + 'px';
    shootGifImg.style.width = gw + 'px';
    shootGifImg.style.height = gh + 'px';
    shootGifImg.style.display = 'block';
  } else {
    shootGifImg.style.display = 'none';
  }

  // ??깂 ?섏?湲?GIF ?꾩튂
  if (state === 'playing' && bombReady && shouldShowBombGif) {
    const gx = GIRL_X * scaleX;
    const gy = (girlY + GIRL_OFFSET_Y) * scaleY;
    const gw = GIRL_W * scaleX;
    const gh = GIRL_H * scaleY;

    bombGifImg.style.left = gx + 'px';
    bombGifImg.style.top = gy + 'px';
    bombGifImg.style.width = gw + 'px';
    bombGifImg.style.height = gh + 'px';
    bombGifImg.style.display = 'block';
  } else {
    bombGifImg.style.display = 'none';
  }
}

// 총알 그리기
function drawBullet(b) {
  ctx.save();
  ctx.translate(b.x + b.w / 2, b.y + b.h / 2);
  ctx.rotate(Math.PI / 4); // 45도
  ctx.font = '24px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('??', 0, 0);
  ctx.restore();
}

// ??깂 洹몃━湲? ?뮗 ?대え吏
function drawBomb(b) {
  ctx.font = '28px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('?뮗', b.x + BOMB_W / 2, b.y + BOMB_H / 2);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}

// 鍮꾨뵒?ㅻ? gx,gy??洹몃━湲? scale ?앸왂/1?대㈃ 96횞180, 1.5硫?1.5諛?以묒떖 ?뺣젹). ?щ줈留덊궎 ?곸슜.
// drawVideoChroma ?⑥닔 ??젣 (MP4 鍮꾨뵒???ъ슜 ????

// GIF 투명 처리
function drawImageChroma(img, gx, gy, chromaKeyRef, scale) {
  const nw = img.naturalWidth || 0, nh = img.naturalHeight || 0;
  if (nw <= 0 || nh <= 0) return;
  const sc = (scale == null || scale === 1) ? 1 : scale;
  // ?먮낯 ?대?吏 鍮꾩쑉 ?좎?
  const aspectRatio = nw / nh;
  let dw, dh;
  if (sc === 1) {
    dw = GIRL_W;
    dh = GIRL_H;
  } else {
    // ?덈퉬 湲곗??쇰줈 怨꾩궛?섍퀬 ?믪씠???먮낯 鍮꾩쑉 ?좎?
    const baseWidth = GIRL_W * sc;
    dw = Math.round(baseWidth);
    dh = Math.round(baseWidth / aspectRatio);
  }

  // GIF ?뚯씪?몄? ?뺤씤 (?대?吏 ?뚯뒪 寃쎈줈 ?먮뒗 chromaKeyRef??isGif ?뚮옒洹몃줈 ?뺤씤)
  const imgSrc = img.src || '';
  const isGif = chromaKeyRef.isGif === true ||
    imgSrc.toLowerCase().includes('.gif') ||
    imgSrc.toLowerCase().includes('run.gif') ||
    imgSrc.toLowerCase().includes('sliding.gif') ||
    imgSrc.toLowerCase().includes('anim/');

  // GIF ?뚯씪??寃쎌슦 紐⑤뱺 泥섎━瑜?嫄대꼫?곌퀬 諛붾줈 ?먮낯 ?대?吏瑜?吏곸젒 洹몃━湲?  // ?닿쾬??GIF ?좊땲硫붿씠?섏쓣 ?ъ깮?섎뒗 ?좎씪???뺤떎??諛⑸쾿
  // ?ㅽ봽?ㅽ겕由?罹붾쾭?ㅻ? 嫄곗튂嫄곕굹 getImageData瑜??몄텧?섎㈃ ?뺤쟻 ?대?吏媛 ?섏뼱 ?좊땲硫붿씠?섏씠 硫덉땄
  if (isGif) {
    // 留??꾨젅?꾨쭏???먮낯 ?대?吏瑜?吏곸젒 洹몃━硫?釉뚮씪?곗?媛 GIF???꾩옱 ?꾨젅?꾩쓣 ?먮룞?쇰줈 ?낅뜲?댄듃??    ctx.drawImage(img, 0, 0, nw, nh, gx, gy, dw, dh);
    return;
  }

  // GIF媛 ?꾨땶 寃쎌슦?먮쭔 ?щ챸??泥댄겕 諛??щ줈留덊궎 泥섎━
  if (chromaKeyRef.chromaKey === null) {
    // 泥?濡쒕뱶 ???щ챸??泥댄겕 (??踰덈쭔)
    try {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = dw;
      tempCanvas.height = dh;
      const tempCtx = tempCanvas.getContext('2d');
      tempCtx.drawImage(img, 0, 0, nw, nh, 0, 0, dw, dh);
      const d = tempCtx.getImageData(0, 0, dw, dh);
      const data = d.data;
      let asum = 0, cnt = 0;
      const step = 6;
      // ?뚮몢由??섑뵆留곸쑝濡??щ챸???뺤씤
      for (var x = 0; x < dw; x += step) {
        var iT = (0 * dw + x) * 4;
        asum += data[iT + 3]; cnt++;
        var iB = ((dh - 1) * dw + x) * 4;
        asum += data[iB + 3]; cnt++;
      }
      for (var y = 0; y < dh; y += step) {
        var iL = (y * dw + 0) * 4;
        asum += data[iL + 3]; cnt++;
        var iR = (y * dw + (dw - 1)) * 4;
        asum += data[iR + 3]; cnt++;
      }
      const avgAlpha = asum / cnt;

      // ?щ챸???대?吏??寃쎌슦 (?됯퇏 ?뚰뙆媛믪씠 ??쓬)
      if (avgAlpha < 20) {
        chromaKeyRef.chromaKey = 'transparent';
      } else {
        // 遺덊닾紐낇븳 諛곌꼍???덈뒗 寃쎌슦 ?щ줈留덊궎 泥섎━ ?꾩슂
        chromaKeyRef.chromaKey = 'opaque';
      }
    } catch (e) {
      // getImageData ?ㅽ뙣 ???щ챸?쇰줈 媛꾩＜
      chromaKeyRef.chromaKey = 'transparent';
    }
  }

  // ?щ챸 PNG??留??꾨젅?꾨쭏???먮낯 ?대?吏瑜?吏곸젒 洹몃━湲?  if (chromaKeyRef.chromaKey === 'transparent') {
    ctx.drawImage(img, 0, 0, nw, nh, gx, gy, dw, dh);
    return;
  }

  // 遺덊닾紐?諛곌꼍???덈뒗 寃쎌슦 ?щ줈留덊궎 泥섎━ (PNG ??
  // ??寃쎌슦???щ줈留덊궎 泥섎━媛 ?꾩슂?섏?留? GIF媛 ?꾨땺 媛?μ꽦???믪쓬
  try {
    var off, offCtx;
    if (sc === 1) {
      if (!girlOffscreen) {
        girlOffscreen = document.createElement('canvas');
        girlOffscreen.width = GIRL_W;
        girlOffscreen.height = GIRL_H;
        girlOffCtx = girlOffscreen.getContext('2d');
      }
      off = girlOffscreen; offCtx = girlOffCtx;
    } else {
      if (!scaleOffscreen || scaleOffscreen.width !== dw || scaleOffscreen.height !== dh) {
        scaleOffscreen = document.createElement('canvas');
        scaleOffscreen.width = dw;
        scaleOffscreen.height = dh;
        scaleOffCtx = scaleOffscreen.getContext('2d');
      }
      off = scaleOffscreen; offCtx = scaleOffCtx;
    }

    offCtx.clearRect(0, 0, dw, dh);
    offCtx.drawImage(img, 0, 0, nw, nh, 0, 0, dw, dh);
    const d = offCtx.getImageData(0, 0, dw, dh);
    const data = d.data;

    // ?щ줈留덊궎 ?됱긽 媛먯? (泥??꾨젅?꾩뿉?쒕쭔)
    if (!chromaKeyRef.chromaKeyRgb) {
      let rsum = 0, gsum = 0, bsum = 0, cnt = 0;
      const step = 6;
      for (var x = 0; x < dw; x += step) {
        var iT = (0 * dw + x) * 4;
        rsum += data[iT]; gsum += data[iT + 1]; bsum += data[iT + 2]; cnt++;
        var iB = ((dh - 1) * dw + x) * 4;
        rsum += data[iB]; gsum += data[iB + 1]; bsum += data[iB + 2]; cnt++;
      }
      for (var y = 0; y < dh; y += step) {
        var iL = (y * dw + 0) * 4;
        rsum += data[iL]; gsum += data[iL + 1]; bsum += data[iL + 2]; cnt++;
        var iR = (y * dw + (dw - 1)) * 4;
        rsum += data[iR]; gsum += data[iR + 1]; bsum += data[iR + 2]; cnt++;
      }
      chromaKeyRef.chromaKeyRgb = [rsum / cnt, gsum / cnt, bsum / cnt];
    }

    const r0 = chromaKeyRef.chromaKeyRgb[0], g0 = chromaKeyRef.chromaKeyRgb[1], b0 = chromaKeyRef.chromaKeyRgb[2];
    const distSq = CHROMA_DIST * CHROMA_DIST;
    const gR = CHROMA_GREEN[0], gG = CHROMA_GREEN[1], gB = CHROMA_GREEN[2];
    const greenDistSq = CHROMA_DIST_GREEN * CHROMA_DIST_GREEN;
    const lR = CHROMA_LIME[0], lG = CHROMA_LIME[1], lB = CHROMA_LIME[2];
    const limeDistSq = CHROMA_DIST_LIME * CHROMA_DIST_LIME;

    // ???됱긽 蹂댄샇???됱긽
    const NAVY_R = 30, NAVY_G = 58, NAVY_B = 95;
    const WHITE_THRESHOLD = 200;
    const SKIN_R = 255, SKIN_G = 219, SKIN_B = 172;
    const HAIR_R = 44, HAIR_G = 24, HAIR_B = 16;
    const CLOTHES_PROTECT_DIST = 80;

    for (var i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const dNavy = Math.sqrt((r - NAVY_R) * (r - NAVY_R) + (g - NAVY_G) * (g - NAVY_G) + (b - NAVY_B) * (b - NAVY_B));
      const dSkin = Math.sqrt((r - SKIN_R) * (r - SKIN_R) + (g - SKIN_G) * (g - SKIN_G) + (b - SKIN_B) * (b - SKIN_B));
      const dHair = Math.sqrt((r - HAIR_R) * (r - HAIR_R) + (g - HAIR_G) * (g - HAIR_G) + (b - HAIR_B) * (b - HAIR_B));
      const isWhite = r >= WHITE_THRESHOLD && g >= WHITE_THRESHOLD && b >= WHITE_THRESHOLD;
      const isClothes = dNavy < CLOTHES_PROTECT_DIST || isWhite || dSkin < CLOTHES_PROTECT_DIST || dHair < CLOTHES_PROTECT_DIST;
      if (isClothes) continue;

      const dr = r - r0, dg = g - g0, db = b - b0;
      const dGr = r - gR, dGg = g - gG, dGb = b - gB;
      const dLr = r - lR, dLg = g - lG, dLb = b - lB;
      const nearBorder = dr * dr + dg * dg + db * db <= distSq;
      const nearGreen = (g > r && g > b) && (dGr * dGr + dGg * dGg + dGb * dGb <= greenDistSq);
      const nearLime = (g > r && g > b && b < 50) && (dLr * dLr + dLg * dLg + dLb * dLb <= limeDistSq);
      if (nearBorder || nearGreen || nearLime) data[i + 3] = 0;
    }

    // ?щ줈留덊궎 泥섎━???대?吏 洹몃━湲?    if (sc === 1) {
      if (!girlChromaOffscreen) {
        girlChromaOffscreen = document.createElement('canvas');
        girlChromaOffscreen.width = GIRL_W;
        girlChromaOffscreen.height = GIRL_H;
        girlChromaOffCtx = girlChromaOffscreen.getContext('2d');
      }
      girlChromaOffCtx.putImageData(d, 0, 0);
      ctx.drawImage(girlChromaOffscreen, 0, 0, dw, dh, gx, gy, dw, dh);
    } else {
      if (!scaleOffscreen || scaleOffscreen.width !== dw || scaleOffscreen.height !== dh) {
        scaleOffscreen = document.createElement('canvas');
        scaleOffscreen.width = dw;
        scaleOffscreen.height = dh;
        scaleOffCtx = scaleOffscreen.getContext('2d');
      }
      scaleOffCtx.putImageData(d, 0, 0);
      ctx.drawImage(scaleOffscreen, 0, 0, dw, dh, gx, gy, dw, dh);
    }
  } catch (e) {
    chromaUnavailable = true;
    ctx.drawImage(img, 0, 0, nw, nh, gx, gy, dw, dh);
  }
}

// GIF ?쒖떆 ?곹깭 (?꾩뿭 蹂?섎줈 留뚮뱾?댁꽌 updateGifPositions?먯꽌 ?묎렐 媛?ν븯寃?
let shouldShowGirlGif = true;
let shouldShowSlideGif = false;
let shouldShowShootGif = false;
let shouldShowBombGif = false;

// 二쇱씤怨?洹몃━湲? ?덊듃 ??hurt/down, 諛쒖궗 以?shoot, ?꾨땲硫?run. ?щ챸 PNG ?ъ슜. 誘몃줈????罹붾쾭???대갚
function drawGirl() {
  const gx = GIRL_X, gy = girlY + GIRL_OFFSET_Y;

  // ?ㅻⅨ ?숈옉 以묒씪 ?뚮뒗 湲곕낯 ?대?吏 ?④린湲?  let showGif = true;
  shouldShowGirlGif = false;
  shouldShowSlideGif = false;
  shouldShowShootGif = false;
  shouldShowBombGif = false;

  if (pauseFramesLeft > 0) {
    // ?덊듃 ?? GIF ?④린怨?hurt/down ?대?吏 ?쒖떆
    showGif = false;
    shouldShowGirlGif = false;
    if (hp <= 0 && pauseFramesLeft <= 12 && downImage && downImage.naturalWidth > 0) {
      // ?щ━湲?洹몃┝怨?媛숈? 鍮꾩쑉濡?異뺤냼 ????諛곕줈 ?뺣? ??10% 異뺤냼 (?먮낯 鍮꾩쑉 ?좎?)
      const runOriginalWidth = 560;
      const scaleRatio = GIRL_W / runOriginalWidth; // ?щ━湲?洹몃┝??異뺤냼 鍮꾩쑉
      // 二쎈뒗 洹몃┝???먮낯 ?ш린瑜?湲곗??쇰줈 媛숈? 鍮꾩쑉 ?곸슜 ????諛? 10% 異뺤냼
      const scaledWidth = downImage.naturalWidth * scaleRatio * 2 * 0.9;
      const scaledHeight = downImage.naturalHeight * scaleRatio * 2 * 0.9;
      // ?щ━湲?二쇱씤怨듦낵 媛숈? ?꾩튂 (以묒븰 ?뺣젹)
      const dx = gx + GIRL_W / 2 - scaledWidth / 2;
      const dy = gy + GIRL_H / 2 - scaledHeight / 2;
      ctx.drawImage(downImage, 0, 0, downImage.naturalWidth, downImage.naturalHeight, dx, dy, scaledWidth, scaledHeight);
      return;
    }
    if (hurtImage && hurtImage.naturalWidth > 0) {
      // ?щ━湲?二쇱씤怨듦낵 ?뺥솗??媛숈? ?꾩튂? ?ш린
      const hx = gx;
      const hy = gy;
      ctx.drawImage(hurtImage, 0, 0, hurtImage.naturalWidth, hurtImage.naturalHeight, hx, hy, GIRL_W, GIRL_H);
      return;
    }
  }
  if (slideActive) {
    // ?щ씪?대뵫 以? img ?쒓렇濡?GIF ?좊땲硫붿씠???쒖떆 (updateGifPositions?먯꽌 泥섎━)
    showGif = false;
    shouldShowGirlGif = false;
    shouldShowSlideGif = true;
    return;
  }
  if (shootActive && shootReady) {
    // 諛쒖궗 以? img ?쒓렇濡?GIF ?좊땲硫붿씠???쒖떆 (updateGifPositions?먯꽌 泥섎━)
    showGif = false;
    shouldShowGirlGif = false;
    shouldShowShootGif = true;
    return;
  }
  if (bombActive && bombReady) {
    // ??깂 ?섏?湲?以? img ?쒓렇濡?GIF ?좊땲硫붿씠???쒖떆 (updateGifPositions?먯꽌 泥섎━)
    showGif = false;
    shouldShowGirlGif = false;
    shouldShowBombGif = true;
    return;
  }

  // 湲곕낯 ?щ━湲??곹깭 ?먮뒗 ?먰봽 以묒씪 ??GIF ?쒖떆 (?ㅻⅨ ?숈옉???놁쓣 ??
  // Canvas?먯꽌??GIF ?좊땲硫붿씠?섏씠 ?ъ깮?섏? ?딆쑝誘濡?img ?쒓렇瑜??ъ슜
  if (showGif) {
    // img ?쒓렇濡?GIF ?좊땲硫붿씠???쒖떆 (updateGifPositions?먯꽌 泥섎━)
    shouldShowGirlGif = true;
    shouldShowSlideGif = false;
    return;
  }
  // ?대갚: 罹붾쾭?ㅻ줈 洹몃┛ ?몃씪蹂??뚮? (2諛??ㅼ???
  ctx.save();
  ctx.translate(GIRL_X, girlY + GIRL_OFFSET_Y);
  ctx.scale(2, 2);
  const x = 0;
  const y = 0;
  runFrame = Math.floor(frameCount / 8) % 2;

  // 癒몃━ (?대갚: 48횞90 湲곗?, scale 2濡?96횞180)
  ctx.fillStyle = '#ffdbac';
  ctx.beginPath();
  ctx.arc(x + 24, y + 18, 16, 0, Math.PI * 2);
  ctx.fill();
  // 癒몃━移대씫 (ellipse 誘몄???釉뚮씪?곗?: arc濡?諛섏썝 ?泥?
  ctx.fillStyle = '#2c1810';
  ctx.beginPath();
  try {
    ctx.ellipse(x + 24, y + 20, 16, 14, 0, 0, Math.PI);
  } catch (e) {
    ctx.arc(x + 24, y + 20, 14, 0, Math.PI);
  }
  ctx.fill();

  // 紐? ?몃씪蹂?(???붿툩 + ?ㅼ씠鍮?移쇰씪)
  ctx.fillStyle = '#fff';
  ctx.fillRect(x + 6, y + 32, 36, 28);
  ctx.fillStyle = '#1e3a5f';
  ctx.fillRect(x + 10, y + 34, 28, 8);
  ctx.fillStyle = '#fff';
  ctx.fillRect(x + 14, y + 36, 6, 6);
  ctx.fillRect(x + 26, y + 36, 6, 6);

  // 移섎쭏 (?ㅼ씠鍮?
  ctx.fillStyle = '#1e3a5f';
  ctx.beginPath();
  ctx.moveTo(x + 8, y + 58);
  ctx.lineTo(x + 40, y + 58);
  ctx.lineTo(x + 36, y + 78);
  ctx.lineTo(x + 12, y + 78);
  ctx.closePath();
  ctx.fill();

  // ?ㅻ━ (?щ━湲??꾨젅??
  ctx.strokeStyle = '#2c1810';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  if (runFrame === 0) {
    ctx.beginPath();
    ctx.moveTo(x + 18, y + 78);
    ctx.lineTo(x + 14, y + 98);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + 32, y + 78);
    ctx.lineTo(x + 36, y + 92);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(x + 18, y + 78);
    ctx.lineTo(x + 22, y + 92);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + 32, y + 78);
    ctx.lineTo(x + 28, y + 98);
    ctx.stroke();
  }
  ctx.restore();
}

// ?뚯떇 洹몃━湲? ?대え吏 + ?먮㈇?섎뒗 ?꾧킅???뚮몢由?(?ш컖???쒓굅, ?먯껜 諛쒓킅 ?④낵)
function drawFood(f) {
  // ?쇨꺽???뚯떇? 源쒕묀???④낵
  let alpha = 1.0;
  if (f.hitFrames && f.hitFrames > 0) {
    // 源쒕묀???④낵: 鍮좊Ⅴ寃?源쒕묀?대떎媛 ?щ씪吏?    const blinkSpeed = 0.5;
    const progress = f.hitFrames / HIT_PAUSE_FRAMES;
    alpha = Math.sin(progress * Math.PI * 8) * 0.5 + 0.5; // 0.0 ~ 1.0 ?ъ씠 源쒕묀??    if (progress > 0.7) {
      // 留덉?留?30% 援ш컙?먯꽌???먯젏 ?щ씪吏?      alpha *= (1 - (progress - 0.7) / 0.3);
    }
  }

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = '32px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // ?먮㈇ ?꾧킅 誘쇳듃??(Bright Mint) ?뚮몢由??④낵
  const blink = 0.4 + 0.6 * Math.sin(frameCount * 0.15); // 泥쒖쿇???먮㈇

  // 諛앹? 誘쇳듃??洹몃┝?먮줈 ?뚮몢由??④낵, alpha媛믪쑝濡??먮㈇
  ctx.shadowColor = `rgba(0, 255, 170, ${1.0})`;
  ctx.shadowBlur = 10 * blink + 5; // 釉붾윭 ?ш린媛 而ㅼ죱???묒븘議뚮떎 ??(5~15)

  ctx.fillText(f.emoji, f.x + FOOD_W / 2, f.y + FOOD_H / 2);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.restore();
}

// 배경 그리기
function drawBackground() {
  if (bgReady && bgImage.naturalWidth) {
    const iw = bgImage.naturalWidth, ih = bgImage.naturalHeight;
    const scale = Math.max(GW / iw, GH / ih);
    const dw = iw * scale, dh = ih * scale;
    const dy = GROUND_Y - dh; // ?ㅼ??쇰맂 諛곌꼍 ?섎떒 = GROUND_Y(諛쒕컩)
    const period = Math.max(dw, 1);
    const s = scrollOffset % period;
    ctx.drawImage(bgImage, 0, 0, iw, ih, -s, dy, dw, dh);
    ctx.drawImage(bgImage, 0, 0, iw, ih, period - s, dy, dw, dh);
  } else {
    ctx.fillStyle = '#16213e';
    ctx.fillRect(0, 0, GW, GH);
  }
}

const TOP_UI_Y = 26;

// 泥대젰 UI: 醫뚯긽??媛먯옄?源 ?뜜 3媛? ?섎굹??媛먯냼. ?곷떒 UI? ?쒕줈 媛?대뜲?뺣젹
function drawHp() {
  ctx.font = '24px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  for (let i = 0; i < hp; i++) {
    ctx.fillText('?뜜', 12 + i * 26, TOP_UI_Y);
  }
  ctx.textBaseline = 'alphabetic';
}

// 寃곗듅源뚯? 嫄곕━: 200m??m. ?곷떒 以묒븰, ?몃옉+寃? 援듭? ?뚮몢由? ?섎닎紐낆“. ?쒓? 1.5諛? ?곷떒 UI? ?쒕줈 媛?대뜲?뺣젹
function drawDistance() {
  const d = Math.max(0, Math.floor(options.clearDistance - scrollOffset / PIXELS_PER_METER));
  const text = d + ' m';
  ctx.font = 'bold 36px ' + FONT_HANGUL;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 4;
  ctx.strokeText(text, GW / 2, TOP_UI_Y);
  ctx.fillStyle = '#ffeb00';
  ctx.fillText(text, GW / 2, TOP_UI_Y);
}

// ?꾪솚/??깂 ?덊듃: ???곗?硫댁꽌 蹂꾩“媛? ex.scale ?덉쑝硫??ш쾶 (??깂=2)
function drawExplosion(ex) {
  const s = ex.scale || 1;
  const t = ex.frame / ex.maxFrames;
  const aBase = 1 - t;
  const twinkle = 0.55 + 0.45 * Math.sin(ex.frame * 0.8);

  // 0) ?? 珥덈컲 2?꾨젅??媛뺥븳 ?곗깋 ?뚮옒??(?곗????쒓컙)
  if (ex.frame < 2) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.98)';
    ctx.fillRect(ex.x - 8 * s, ex.y - 8 * s, 16 * s, 16 * s);
  }

  // 1) LED 肄붿뼱: ???ш쾶 (9x9, 5x5)
  const coreA = aBase * twinkle;
  ctx.fillStyle = 'rgba(255, 255, 255, ' + coreA + ')';
  ctx.fillRect(ex.x - 4 * s, ex.y - 4 * s, 9 * s, 9 * s);
  ctx.fillStyle = 'rgba(255, 200, 220, ' + (coreA * 0.8) + ')';
  ctx.fillRect(ex.x - 2 * s, ex.y - 2 * s, 5 * s, 5 * s);

  // 2) 蹂꾩“媛? 4諛⑺뼢 蹂?紐⑥뼇 ?뚰렪, 吏꾪솉/?뱀깋, 留롮씠쨌硫由?肉뚮━湲?  const N = 24;
  const seed = (ex.x * 0.02 + ex.y * 0.02) % 1;
  const R = 5 * s, r = 2.5 * s;
  const c = 0.707;
  for (let i = 0; i < N; i++) {
    const angle = (i / N) * Math.PI * 2 + seed * 6.28;
    const dist = (ex.frame * 5 + (i % 5) * 2.5) * s;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist;
    const dotTwinkle = 0.85 + 0.15 * Math.sin(ex.frame * 0.6 + i * 0.5);
    const dotA = aBase * dotTwinkle;
    const isCrimson = (i % 2 === 0);

    ctx.save();
    ctx.translate(ex.x + dx, ex.y + dy);
    ctx.rotate(angle);
    ctx.fillStyle = isCrimson
      ? 'rgba(220, 40, 70, ' + dotA + ')'
      : 'rgba(50, 230, 100, ' + dotA + ')';
    ctx.beginPath();
    ctx.moveTo(0, -R);
    ctx.lineTo(r * c, -r * c);
    ctx.lineTo(R, 0);
    ctx.lineTo(r * c, r * c);
    ctx.lineTo(0, R);
    ctx.lineTo(-r * c, r * c);
    ctx.lineTo(-R, 0);
    ctx.lineTo(-r * c, -r * c);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

// ?ㅽ뀒?댁??대━???꾩슜 ??＝: 洹밸챸??諛앹? burst (drawExplosion ?ы솢??????
function drawClearFirework(fw) {
  const t = fw.frame / fw.maxFrames;
  const a = 1 - t;
  if (fw.frame < 2) {
    ctx.fillStyle = 'rgba(255,255,255,0.98)';
    ctx.beginPath();
    ctx.arc(fw.x, fw.y, 14, 0, Math.PI * 2);
    ctx.fill();
  }
  const R = 6 + fw.frame * 2.2;
  const N = 16;
  const colors = ['rgba(255,255,255,', 'rgba(255,255,255,', 'rgba(255,255,240,', 'rgba(255,240,255,'];
  for (let i = 0; i < N; i++) {
    const angle = (i / N) * Math.PI * 2 + fw.seed;
    const dx = Math.cos(angle) * R;
    const dy = Math.sin(angle) * R;
    const c = colors[i % 4];
    ctx.fillStyle = c + (a * 0.98).toFixed(2) + ')';
    ctx.fillRect(fw.x + dx - 2, fw.y + dy - 2, 4, 4);
  }
  ctx.fillStyle = 'rgba(255,255,255,' + (a * 0.95).toFixed(2) + ')';
  ctx.beginPath();
  ctx.arc(fw.x, fw.y, 4, 0, Math.PI * 2);
  ctx.fill();
}

// ?뚯떇 ??뙆쨌??깂 ?곗쭚: ??諛섏쭩?닿쾶 蹂?뺥븳 ??＝ (ex: {x,y,frame,maxFrames,scale,emoji})
function drawSparklyFirework(ex) {
  // ??컻 ?대え吏媛 ?덉쑝硫??대え吏濡??쒖떆
  if (ex.emoji) {
    const t = ex.frame / ex.maxFrames;
    const scale = 1 + (1 - t) * 0.5; // ?먯젏 而ㅼ??ㅺ? ?щ씪吏?    const alpha = 1 - t;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = (32 * scale) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(ex.emoji, ex.x, ex.y);
    ctx.restore();
    return;
  }

  const s = ex.scale || 1;
  const t = ex.frame / ex.maxFrames;
  const a = 1 - t;
  const seed = ((ex.x * 0.02 + ex.y * 0.02) % 1) * 6.28;
  if (ex.frame < 2) {
    ctx.fillStyle = 'rgba(255,255,255,0.98)';
    ctx.beginPath();
    ctx.arc(ex.x, ex.y, 12 * s, 0, Math.PI * 2);
    ctx.fill();
  }
  const R = (5 + ex.frame * 2) * s;
  const N = 20;
  const colors = ['rgba(255,255,255,', 'rgba(255,255,240,', 'rgba(255,240,255,', 'rgba(240,255,255,'];
  for (let i = 0; i < N; i++) {
    const tw = 0.88 + 0.24 * Math.sin(ex.frame * 1.3 + i * 0.6);
    const angle = (i / N) * Math.PI * 2 + seed;
    const dx = Math.cos(angle) * R;
    const dy = Math.sin(angle) * R;
    const c = colors[i % 4];
    ctx.fillStyle = c + (Math.min(1, a * tw * 0.98)).toFixed(2) + ')';
    const sz = Math.max(2, 3 * s);
    ctx.fillRect(ex.x + dx - sz / 2, ex.y + dy - sz / 2, sz, sz);
  }
  const coreTw = 0.9 + 0.2 * Math.sin(ex.frame * 1.1);
  ctx.fillStyle = 'rgba(255,255,255,' + (Math.min(1, a * coreTw * 0.95)).toFixed(2) + ')';
  ctx.beginPath();
  ctx.arc(ex.x, ex.y, 4 * s, 0, Math.PI * 2);
  ctx.fill();
}

// Stage 1 Clear: "Stage 1 Clear" ?띿뒪???붾㈃ ?? + 洹밸챸??諛앹? ??＝. 5珥?????댄? 蹂듦? (MP4 ?쒓굅)
function drawStage1Clear() {
  ctx.clearRect(0, 0, GW, GH);
  stage1ClearFrames++;
  drawBackground();
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(0, 0, GW, GH);
  if (stage1ClearFrames % 2 === 0) {
    clearFireworks.push({
      x: GW / 2 + (Math.random() - 0.5) * 220,
      y: GH / 2 + (Math.random() - 0.5) * 180,
      frame: 0,
      maxFrames: 32,
      seed: Math.random() * 6.28
    });
  }
  for (let i = clearFireworks.length - 1; i >= 0; i--) {
    clearFireworks[i].frame++;
    if (clearFireworks[i].frame >= clearFireworks[i].maxFrames) clearFireworks.splice(i, 1);
  }
  clearFireworks.forEach(drawClearFirework);
  // ?고듃: ?붾㈃ ?덉뿉 紐⑤몢 ?쒖떆 (measureText濡?fit)
  const str = 'Stage 1 Clear';
  let fs = 52;
  for (; fs >= 24; fs -= 2) {
    ctx.font = 'bold ' + fs + 'px sans-serif';
    if (ctx.measureText(str).width <= GW - 32) break;
  }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = Math.max(2, Math.floor(fs / 12));
  ctx.strokeText(str, GW / 2, GH / 2);
  ctx.fillStyle = '#ffeb00';
  ctx.fillText(str, GW / 2, GH / 2);

  // 1스테이지 클리어 이미지 그리기
  if (stage1ClearReady) {
    const iw = stage1ClearImage.naturalWidth;
    const ih = stage1ClearImage.naturalHeight;
    // ?붾㈃ ?덈퉬??留욎땄 (鍮꾩쑉 ?좎?)
    const scale = GW / iw;
    const dh = ih * scale;
    const dy = GH / 2 - dh / 2 - 50; // 以묒븰蹂대떎 ?쎄컙 ??    ctx.drawImage(stage1ClearImage, 0, 0, iw, ih, 0, dy, GW, dh);
  }

  // ?띿뒪?? "Let's go to next stage!!"
  ctx.font = 'bold 24px "Courier New", monospace';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 3;

  // 源쒕묀???④낵
  if (Math.floor(Date.now() / 500) % 2 === 0) {
    ctx.strokeText("Let's go to next stage!!", GW / 2, GH - 100);
    ctx.fillText("Let's go to next stage!!", GW / 2, GH - 100);
  }

  ctx.font = '16px "Courier New", monospace';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.strokeText("Press Enter or Click", GW / 2, GH - 60);
  ctx.fillText("Press Enter or Click", GW / 2, GH - 60);

  // ?먮룞 ??댄? 蹂듦? ?쒓굅 (?ъ슜???낅젰 ?湲?
}

// ?꾧컧 ?붾㈃ 洹몃━湲?// let selectedFoodIndex = 0; // Moved to top
let collectionScrollOffset = 0; // ?뚯떇 洹몃━???ㅽ겕濡??ㅽ봽??let isDraggingCollection = false; // ?쒕옒洹?以??щ?
let dragStartX = 0; // ?쒕옒洹??쒖옉 x 醫뚰몴
let dragStartScrollOffset = 0; // ?쒕옒洹??쒖옉 ???ㅽ겕濡??ㅽ봽??let foodShakeFrame = 0; // ?뚯떇 洹몃┝ ?붾뱾由??꾨젅??移댁슫??let foodShakeOffset = 0; // ?뚯떇 洹몃┝ ?붾뱾由??ㅽ봽??(x 醫뚰몴)
const FOOD_SHAKE_DURATION = 20; // ?붾뱾由?吏???쒓컙 (?꾨젅??
const FOOD_SHAKE_INTENSITY = 8; // ?붾뱾由?媛뺣룄 (?쎌?)

// ?꾧컧 ?붾㈃ 珥덇린?????ㅽ겕濡?由ъ뀑
function resetCollectionScroll() {
  collectionScrollOffset = 0;
  selectedFoodIndex = 0;
  foodShakeFrame = 0;
  foodShakeOffset = 0;
}

// ?꾧컧 ??ぉ (?꾩옱 5媛?+ 援ы쁽 ?덉젙 5媛?
// COLLECTION_ITEMS moved to config.js
// const COLLECTION_ITEMS = [ ... ];

function drawCollection() {
  ctx.clearRect(0, 0, GW, GH);

  // 諛곌꼍
  ctx.fillStyle = '#16213e';
  ctx.fillRect(0, 0, GW, GH);

  // ?곷떒 ?ㅻ뜑
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 36px ' + FONT_HANGUL;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 4;
  ctx.strokeText('?꾧컧', GW / 2, 40);
  ctx.fillText('?꾧컧', GW / 2, 40);

  // ?ㅻ줈 媛湲?踰꾪듉
  ctx.fillStyle = '#e94560';
  if (typeof ctx.roundRect === 'function') {
    ctx.beginPath();
    ctx.roundRect(20, 20, 60, 40, 8);
    ctx.fill();
  } else {
    ctx.fillRect(20, 20, 60, 40);
  }
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 20px ' + FONT_HANGUL;
  ctx.textAlign = 'center';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.strokeText('??, 50, 40);
  ctx.fillText('??, 50, 40);

  // ?뚯떇 洹몃━??(10媛? ?ㅽ겕濡?媛??
  const cardSize = 60;
  const cardSpacing = 15;
  const startX = 30;
  const gridY = 100;
  const gridHeight = cardSize + 20; // 洹몃━???곸뿭 ?믪씠
  const totalWidth = COLLECTION_ITEMS.length * (cardSize + cardSpacing) - cardSpacing;
  const visibleWidth = GW - startX * 2;

  // ?ㅽ겕濡?踰붿쐞 ?쒗븳
  const maxScroll = Math.max(0, totalWidth - visibleWidth);
  collectionScrollOffset = Math.max(0, Math.min(maxScroll, collectionScrollOffset));

  // ?좏깮????ぉ???붾㈃??蹂댁씠?꾨줉 ?ㅽ겕濡?議곗젙
  const selectedCardX = selectedFoodIndex * (cardSize + cardSpacing);
  const selectedCardRight = selectedCardX + cardSize;
  const visibleLeft = collectionScrollOffset;
  const visibleRight = collectionScrollOffset + visibleWidth;

  if (selectedCardX < visibleLeft) {
    collectionScrollOffset = selectedCardX;
  } else if (selectedCardRight > visibleRight) {
    collectionScrollOffset = selectedCardRight - visibleWidth;
  }

  // 洹몃━???곸뿭 ?대━??  ctx.save();
  ctx.beginPath();
  ctx.rect(startX, gridY - 10, visibleWidth, gridHeight);
  ctx.clip();

  COLLECTION_ITEMS.forEach((item, index) => {
    const cardX = startX + index * (cardSize + cardSpacing) - collectionScrollOffset;
    const isSelected = index === selectedFoodIndex;

    // ?붾㈃ 諛뽰씠硫?洹몃━吏 ?딆쓬
    if (cardX + cardSize < startX || cardX > startX + visibleWidth) return;

    let isDiscovered = false;
    if (item.type === 'food') {
      const foodData = collectionData[item.emoji];
      isDiscovered = foodData && foodData.discovered;
    } else {
      // ?뚮젅?댁뒪??붾뒗 ??긽 誘몃컻寃??곹깭
      isDiscovered = false;
    }

    // 移대뱶 諛곌꼍
    if (isDiscovered) {
      ctx.fillStyle = isSelected ? 'rgba(57, 255, 20, 0.3)' : 'rgba(255, 255, 255, 0.1)';
    } else {
      ctx.fillStyle = 'rgba(100, 100, 100, 0.2)';
    }
    if (typeof ctx.roundRect === 'function') {
      ctx.beginPath();
      ctx.roundRect(cardX, gridY, cardSize, cardSize, 8);
      ctx.fill();
    } else {
      ctx.fillRect(cardX, gridY, cardSize, cardSize);
    }

    // 移대뱶 ?뚮몢由?    ctx.strokeStyle = isDiscovered
      ? (isSelected ? '#39ff14' : 'rgba(255, 255, 255, 0.5)')
      : '#666666';
    ctx.lineWidth = isSelected ? 3 : 2;
    if (typeof ctx.roundRect === 'function') {
      ctx.beginPath();
      ctx.roundRect(cardX, gridY, cardSize, cardSize, 8);
      ctx.stroke();
    } else {
      ctx.strokeRect(cardX, gridY, cardSize, cardSize);
    }

    // ?뚯떇 ?대え吏 ?먮뒗 臾쇱쓬??    ctx.font = '40px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (item.type === 'food' && isDiscovered) {
      ctx.fillStyle = '#fff';
      ctx.fillText(item.emoji, cardX + cardSize / 2, gridY + cardSize / 2);
    } else {
      // ?뚮젅?댁뒪????먮뒗 誘몃컻寃??뚯떇
      ctx.font = 'bold 40px sans-serif';
      ctx.fillStyle = '#999999';
      ctx.fillText('?', cardX + cardSize / 2, gridY + cardSize / 2);
    }
  });

  ctx.restore();

  // ?좏깮???뚯떇 ?곸꽭 ?뺣낫 ?⑤꼸
  const selectedItem = COLLECTION_ITEMS[selectedFoodIndex];
  let selectedEmoji = null;
  let foodInfo = null;
  let foodData = null;
  let isDiscovered = false;

  if (selectedItem.type === 'food') {
    selectedEmoji = selectedItem.emoji;
    foodInfo = FOOD_COLLECTION_DATA[selectedEmoji];
    foodData = collectionData[selectedEmoji];
    isDiscovered = foodData && foodData.discovered;
  }

  const panelY = 200;
  const panelH = GH - panelY - 20;

  // ?⑤꼸 諛곌꼍
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(20, panelY, GW - 40, panelH);

  if (selectedItem.type === 'food' && isDiscovered && foodInfo) {
    // ?뚯떇 ?대え吏 (???ш린) - ?붾뱾由??④낵 ?곸슜
    ctx.font = '64px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    ctx.fillText(selectedEmoji, GW / 2 + foodShakeOffset, panelY + 50);

    // ?대쫫
    ctx.font = 'bold 28px ' + FONT_HANGUL;
    ctx.fillText(foodInfo.name, GW / 2, panelY + 120);
    ctx.font = '20px sans-serif';
    ctx.fillStyle = '#cccccc';
    ctx.fillText(foodInfo.nameEn, GW / 2, panelY + 150);

    // 遺???잛닔
    ctx.font = 'bold 32px ' + FONT_HANGUL;
    ctx.fillStyle = '#39ff14';
    ctx.fillText('遺???잛닔: ' + (foodData.count || 0) + '??, GW / 2, panelY + 200);

    // 泥섏쓬 諛쒓껄
    if (foodData.firstFound) {
      const firstDate = new Date(foodData.firstFound);
      const dateStr = firstDate.toLocaleDateString('ko-KR') + ' ' +
        firstDate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
      ctx.font = '18px ' + FONT_HANGUL;
      ctx.fillStyle = '#cccccc';
      ctx.fillText('泥섏쓬 諛쒓껄: ' + dateStr, GW / 2, panelY + 240);
    }

    // 留덉?留?諛쒓껄
    if (foodData.lastFound) {
      const lastDate = new Date(foodData.lastFound);
      const dateStr = lastDate.toLocaleDateString('ko-KR') + ' ' +
        lastDate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
      ctx.font = '18px ' + FONT_HANGUL;
      ctx.fillStyle = '#cccccc';
      ctx.fillText('留덉?留?諛쒓껄: ' + dateStr, GW / 2, panelY + 270);
    }

    // ?ㅻ챸
    ctx.font = '18px ' + FONT_HANGUL;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    const descY = panelY + 310;
    const descLines = wrapText(ctx, foodInfo.description, GW - 80, 18);
    descLines.forEach((line, i) => {
      ctx.fillText(line, 40, descY + i * 25);
    });
  } else if (selectedItem.type === 'food') {
    // 誘몃컻寃??뚯떇 ?곹깭
    ctx.font = 'bold 24px ' + FONT_HANGUL;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#999999';
    ctx.fillText('?꾩쭅 諛쒓껄?섏? 紐삵븳 ?뚯떇?낅땲??', GW / 2, panelY + panelH / 2);
    ctx.font = '18px ' + FONT_HANGUL;
    ctx.fillText('寃뚯엫???뚮젅?댄븯???뚯떇??諛쒓껄?섏꽭??', GW / 2, panelY + panelH / 2 + 40);
  } else {
    // ?뚮젅?댁뒪???(援ы쁽 ?덉젙)
    ctx.font = 'bold 24px ' + FONT_HANGUL;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#999999';
    ctx.fillText('援ы쁽 ?덉젙', GW / 2, panelY + panelH / 2);
    ctx.font = '18px ' + FONT_HANGUL;
    ctx.fillText('怨?異붽????덉젙?낅땲??', GW / 2, panelY + panelH / 2 + 40);
  }

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}

// ??궧 ?낅젰 ?붾㈃ 洹몃━湲?(80?꾨? ?ㅻ씫???ㅽ???
// ??궧 ?낅젰 ?붾㈃ 洹몃━湲?(80?꾨? ?ㅻ씫???ㅽ???
// UI Functions are now in ui.js
// drawInputRanking, drawOptions, drawRankingBoard, wrapText, drawCollectionButton, drawOptionsButton
function drawReloadUI() {
  if (reloadCooldown <= 0) return; // ?ъ옣??以묒씠 ?꾨땲硫??쒖떆?섏? ?딆쓬

  const reloadX = GIRL_X + GIRL_W / 2; // 罹먮┃??以묒븰
  const reloadY = girlY + GIRL_OFFSET_Y - 15; // 癒몃━ 諛붾줈 ??  const reloadSize = 20; // ?묒? ?ш린

  // ?ъ옣??吏꾪뻾??(0.0 ~ 1.0)
  const progress = 1 - (reloadCooldown / RELOAD_COOLDOWN_DURATION);

  // ?먰삎 諛곌꼍
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.beginPath();
  ctx.arc(reloadX, reloadY, reloadSize / 2, 0, Math.PI * 2);
  ctx.fill();

  // ?ъ옣??吏꾪뻾 ?먰샇 (?쒓퀎諛⑺뼢?쇰줈 梨꾩썙吏?
  ctx.strokeStyle = '#39ff14'; // ?꾧킅?쇱엫 ?뱀깋
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  // ?쒓퀎諛⑺뼢: -90?????먯꽌 ?쒖옉?섏뿬 ?쒓퀎諛⑺뼢?쇰줈 吏꾪뻾
  ctx.arc(reloadX, reloadY, reloadSize / 2 - 2, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
  ctx.stroke();

  // 以묒븰 ?묒? ??  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(reloadX, reloadY, 3, 0, Math.PI * 2);
  ctx.fill();
}

// AABB 異⑸룎
function collides(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function setStage(stageNum) {
  currentStage = stageNum === 2 ? 2 : 1;
  bgReady = false;
  bgImage.src = currentStage === 2 ? STAGE2_BG : STAGE1_BG;
}

function startPlay(stageNum = currentStage) {
  setStage(stageNum);
  state = 'playing';
  if (bgmTitle) { bgmTitle.pause(); bgmTitle.currentTime = 0; }
  if (bgmStage && options.bgmEnabled) { bgmStage.currentTime = 0; bgmStage.play().catch(function () { }); }
  girlY = GROUND_Y - GIRL_H;
  vy = 0;
  shootActive = false;
  shootFrameCount = 0;
  reloadCooldown = 0;
  bombActive = false;
  bombFrameCount = 0;
  slideActive = false;
  slideFrames = 0;
  slideFrameCount = 0;
  slideStartFrame = 0;
  slideLoopCompleted = false;
  foods = [];
  bullets = [];
  bombs = [];
  explosions = [];
  scrollOffset = 0;
  score = 0;
  nextSpawn = 60;
  frameCount = 0;
  hp = 3;
  pauseFramesLeft = 0;
  deathFallFrames = 0;
  deathFallOffsetY = 0;
  isPaused = false;
  airJumpUsed = false;
}

// ??깂 ?섏?湲?(留덉슦???고겢由?: ?щЪ?? ?뮗. ?곗?湲??꾧퉴吏 ?ㅼ쓬 ??깂 遺덇?
function addBomb() {
  if (state !== 'playing' || pauseFramesLeft > 0 || isPaused || deathFallFrames > 0) return;
  if (bombs.length > 0) return; // ?섏쭊 ??깂???곗쭏 ?뚭퉴吏 ?湲?  if (bombActive) return; // ?좊땲硫붿씠??吏꾪뻾 以묒씠硫??湲?  // ?щ씪?대뵫 以묒씠硫??щ씪?대뵫 痍⑥냼
  if (slideActive) {
    slideActive = false;
    slideFrames = 0;
    slideFrameCount = 0;
    slideLoopCompleted = false;
  }
  playSfx(sfxBombFlying);
  // ??깂 ?섏?湲??좊땲硫붿씠???쒖옉 諛?利됱떆 ??깂 ?앹꽦
  bombActive = true;
  bombFrameCount = 0;
  // 利됱떆 ??깂 ?앹꽦 (吏???놁쓬)
  bombs.push({
    x: GIRL_X + GIRL_W,
    y: girlY + GIRL_OFFSET_Y + GIRL_H / 2 - BOMB_H / 2,
    vx: BOMB_VX,
    vy: BOMB_VY,
    w: BOMB_W,
    h: BOMB_H
  });
}

// 珥앹븣 諛쒖궗 (shoot.mp4 ?곗텧)
function addBullet() {
  if (state !== 'playing' || pauseFramesLeft > 0 || isPaused || deathFallFrames > 0) return;
  if (shootActive) return; // ?대? 諛쒖궗 ?곗텧 以묒씠硫??곗텧留?異붽??섏? ?딆쓬
  if (reloadCooldown > 0) return; // ?ъ옣??荑⑦???以묒씠硫?諛쒖궗 遺덇?
  // ?щ씪?대뵫 以묒씠硫??щ씪?대뵫 痍⑥냼
  if (slideActive) {
    slideActive = false;
    slideFrames = 0;
    slideFrameCount = 0;
    slideLoopCompleted = false;
  }
  playSfx(sfxGunshot);
  bullets.push({
    x: GIRL_X + GIRL_W,
    y: girlY + GIRL_OFFSET_Y + GIRL_H / 2 - BULLET_H / 2,
    w: BULLET_W,
    h: BULLET_H
  });
  if (!shootActive) {
    shootActive = true;
    shootFrameCount = 0;
  }
  reloadCooldown = RELOAD_COOLDOWN_DURATION;
}

// 異쒖꽍蹂댁긽 踰꾪듉 洹몃━湲?(?쒕쪟 紐⑥뼇 ?꾩씠肄?
function drawAttendanceButton() {
  // 諛곌꼍 ?먰삎 踰꾪듉
  ctx.fillStyle = 'rgba(255, 152, 0, 0.8)'; // 二쇳솴??  ctx.beginPath();
  ctx.arc(ATTENDANCE_BTN.x + ATTENDANCE_BTN.w / 2, ATTENDANCE_BTN.y + ATTENDANCE_BTN.h / 2, ATTENDANCE_BTN.w / 2, 0, Math.PI * 2);
  ctx.fill();

  // ?뚮몢由?  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.stroke();

  // ?쒕쪟 ?꾩씠肄?  ctx.font = '32px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fff';
  ctx.fillText('?뱞', ATTENDANCE_BTN.x + ATTENDANCE_BTN.w / 2, ATTENDANCE_BTN.y + ATTENDANCE_BTN.h / 2);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}

function draw() {
  if (state === 'start') {
    if (!titleBgmTried) {
      titleBgmTried = true;
      if (bgmTitle && options.bgmEnabled) bgmTitle.play().catch(function () { });
    }
    if (titleReady && titleImage.naturalWidth > 0) {
      const iw = titleImage.naturalWidth, ih = titleImage.naturalHeight;
      const scale = Math.max(GW / iw, GH / ih);
      const dw = iw * scale, dh = ih * scale;
      const dx = (GW - dw) / 2, dy = (GH - dh) / 2;
      ctx.drawImage(titleImage, 0, 0, iw, ih, dx, dy, dw, dh);
    } else {
      ctx.fillStyle = '#16213e';
      ctx.fillRect(0, 0, GW, GH);
      ctx.fillStyle = '#f1f1f1';
      ctx.font = 'bold 26px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Jumping Girl', GW / 2, 180);
      ctx.font = '14px sans-serif';
      ctx.fillStyle = '#a0a0a0';
      ctx.fillText('Food Escape', GW / 2, 212);
    }
    // 寃뚯엫 ?쒖옉 踰꾪듉
    ctx.fillStyle = '#5FD9B0'; // 誘쇳듃?뱀깋
    if (typeof ctx.roundRect === 'function') {
      ctx.beginPath();
      ctx.roundRect(BTN.x, BTN.y, BTN.w, BTN.h, 12);
      ctx.fill();
    } else {
      ctx.fillRect(BTN.x, BTN.y, BTN.w, BTN.h);
    }
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px ' + FONT_HANGUL; // 踰꾪듉 ?ш린??留욎떠 ?고듃 異뺤냼 (30 -> 20)
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.strokeText('寃뚯엫 ?쒖옉', BTN.x + BTN.w / 2, BTN.y + BTN.h / 2);
    ctx.fillText('寃뚯엫 ?쒖옉', BTN.x + BTN.w / 2, BTN.y + BTN.h / 2);
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';

    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';

    // 異쒖꽍蹂댁긽 踰꾪듉 (?꾩씠肄?
    drawAttendanceButton();

    // ?꾧컧 踰꾪듉 (醫뚰븯??
    drawCollectionButton();
    // ?듭뀡 踰꾪듉 (?고븯??
    drawOptionsButton();
    return;
  }

  if (state === 'collection') {
    // ?뚯떇 洹몃┝ ?붾뱾由??좊땲硫붿씠???낅뜲?댄듃
    if (foodShakeFrame > 0) {
      foodShakeFrame--;
      // 醫뚯슦 ?붾뱾由??④낵 (?ъ씤???ъ슜)
      const shakeProgress = foodShakeFrame / FOOD_SHAKE_DURATION;
      foodShakeOffset = Math.sin(foodShakeFrame * 0.8) * FOOD_SHAKE_INTENSITY * shakeProgress;
      if (foodShakeFrame === 0) {
        foodShakeOffset = 0;
      }
    }
    drawCollection();
    return;
  }

  if (state === 'options') {
    drawOptions();
    return;
  }

  if (state === 'input_ranking') {
    drawBackground(); // 諛곌꼍??癒쇱? 洹몃젮??寃????꾩쟻 諛⑹?
    drawRankingInput();
    return;
  }

  if (state === 'ranking_board') {
    drawRankingBoard();
    return;
  }

  if (state === 'gameover') {
    drawBackground();
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, GW, GH);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 42px ' + FONT_HANGUL;
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.strokeText('寃뚯엫 ?ㅻ쾭', GW / 2, 220);
    ctx.fillText('寃뚯엫 ?ㅻ쾭', GW / 2, 220);
    ctx.font = 'bold 24px ' + FONT_HANGUL;
    ctx.strokeText('?먯닔: ' + Math.floor(score), GW / 2, 270);
    ctx.fillStyle = '#39ff14';
    ctx.fillText('?먯닔: ' + Math.floor(score), GW / 2, 270);
    // ?ㅼ떆 ?섍린 踰꾪듉
    ctx.fillStyle = '#e94560';
    if (typeof ctx.roundRect === 'function') {
      ctx.beginPath();
      ctx.roundRect(RETRY_BTN.x, RETRY_BTN.y, RETRY_BTN.w, RETRY_BTN.h, 12);
      ctx.fill();
    } else {
      ctx.fillRect(RETRY_BTN.x, RETRY_BTN.y, RETRY_BTN.w, RETRY_BTN.h);
    }
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 27px ' + FONT_HANGUL;
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.strokeText('怨꾩냽?섍린', GW / 2, RETRY_BTN.y + RETRY_BTN.h / 2);
    ctx.fillText('怨꾩냽?섍린', GW / 2, RETRY_BTN.y + RETRY_BTN.h / 2);

    // ??댄?濡??뚯븘媛湲?踰꾪듉
    ctx.fillStyle = '#5FD9B0'; // 誘쇳듃?뱀깋
    if (typeof ctx.roundRect === 'function') {
      ctx.beginPath();
      ctx.roundRect(TITLE_BTN.x, TITLE_BTN.y, TITLE_BTN.w, TITLE_BTN.h, 12);
      ctx.fill();
    } else {
      ctx.fillRect(TITLE_BTN.x, TITLE_BTN.y, TITLE_BTN.w, TITLE_BTN.h);
    }
    ctx.fillStyle = '#fff';
    ctx.strokeText('??댄?濡??뚯븘媛湲?, GW / 2, TITLE_BTN.y + TITLE_BTN.h / 2);
    ctx.fillText('??댄?濡??뚯븘媛湲?, GW / 2, TITLE_BTN.y + TITLE_BTN.h / 2);
    ctx.textBaseline = 'alphabetic';

    // ?꾧컧 踰꾪듉 (醫뚰븯??
    drawCollectionButton();
    // ?듭뀡 踰꾪듉 (?고븯??
    drawOptionsButton();
    return;
  }

  if (state === 'stage1clear') {
    drawStage1Clear();
    return;
  }

  // --- playing ---

  // 3踰덉㎏ ?덊듃 ?? down 2諛곕줈 遺?ㅻ????붾뱾由????꾨줈 ?댁쭩 ?뺢? ?????⑥뼱吏??寃뚯엫?ㅻ쾭 ?곗텧
  if (deathFallFrames > 0) {
    ctx.clearRect(0, 0, GW, GH);
    drawBackground();
    drawDistance();
    if (downImage && downImage.naturalWidth > 0) {
      var gx = GIRL_X, gy = girlY + GIRL_OFFSET_Y;
      // ?щ━湲?洹몃┝怨?媛숈? 鍮꾩쑉濡?異뺤냼 ????諛곕줈 ?뺣? ??10% 異뺤냼 (?먮낯 鍮꾩쑉 ?좎?)
      const runOriginalWidth = 560;
      const scaleRatio = GIRL_W / runOriginalWidth; // ?щ━湲?洹몃┝??異뺤냼 鍮꾩쑉
      // 二쎈뒗 洹몃┝???먮낯 ?ш린瑜?湲곗??쇰줈 媛숈? 鍮꾩쑉 ?곸슜 ????諛? 10% 異뺤냼
      const scaledWidth = downImage.naturalWidth * scaleRatio * 2 * 0.9;
      const scaledHeight = downImage.naturalHeight * scaleRatio * 2 * 0.9;
      // ?щ━湲?二쇱씤怨듦낵 媛숈? ?꾩튂 (以묒븰 ?뺣젹)
      var dx = gx + GIRL_W / 2 - scaledWidth / 2;
      var dyBase = gy + GIRL_H / 2 - scaledHeight / 2;
      var elapsed = 72 - deathFallFrames;
      if (elapsed < 18) {
        var shakeX = (Math.random() - 0.5) * 10, shakeY = (Math.random() - 0.5) * 10;
        ctx.drawImage(downImage, 0, 0, downImage.naturalWidth, downImage.naturalHeight, dx + shakeX, dyBase + shakeY, scaledWidth, scaledHeight);
      } else if (elapsed < 27) {
        deathFallOffsetY = -4 * (elapsed - 18);
        ctx.drawImage(downImage, 0, 0, downImage.naturalWidth, downImage.naturalHeight, dx, dyBase + deathFallOffsetY, scaledWidth, scaledHeight);
      } else {
        deathFallOffsetY = -32 + 10 * (elapsed - 27);
        ctx.drawImage(downImage, 0, 0, downImage.naturalWidth, downImage.naturalHeight, dx, dyBase + deathFallOffsetY, scaledWidth, scaledHeight);
      }
    }
    deathFallFrames--;
    if (deathFallFrames === 0) {
      if (bgmStage) { bgmStage.pause(); bgmStage.currentTime = 0; }

      // ?먯닔 ?뚮줈??泥섎━
      const finalScore = Math.floor(score);

      // 寃뚯엫 ??-> 臾댁“嫄???궧 ?낅젰 ?붾㈃(寃뚯엫?ㅻ쾭 吏곹썑 ?곗텧)?쇰줈 ?대룞
      // ?? ?먯닔 湲곕줉 ?먯껜??湲곗〈 濡쒖쭅???쒖슜?섎릺, ?낅젰? 紐⑤뱺 ?좎??먭쾶 諛쏆쓬(?щ? ?붿냼)
      // ?먮뒗 "?좉린濡??ъ꽦 ?쒖뿉留? ?낅젰 諛쏅뒗寃??꾨땲??"寃뚯엫?ㅻ쾭 ?섎㈃ 利됱떆 ?대땲??3湲?먮? ?덇린???붾㈃???섏삩?????붿껌 泥섎━

      // ?ш린?쒕뒗 "?좉린濡??щ?? ?곴??놁씠" ?대땲???낅젰 ?붾㈃???꾩?
      state = 'input_ranking';
      inputName = '';
      newHighScoreIndex = -1; // ?꾩쭅 ??궧 ?깅줉 ??    }
    return;
  }

  // ?덊듃 ??0.5珥??뺤?: ?낅뜲?댄듃 ?놁씠 洹몃━湲곕쭔
  if (pauseFramesLeft > 0) {
    ctx.clearRect(0, 0, GW, GH);
    drawBackground();
    foods.forEach(drawFood);
    drawGirl();
    bullets.forEach(drawBullet);
    bombs.forEach(drawBomb);
    explosions.forEach(drawSparklyFirework);
    drawDistance();
    ctx.font = 'bold 24px ' + FONT_HANGUL;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.strokeText('?먯닔: ' + Math.floor(score), GW - 12, TOP_UI_Y);
    ctx.fillStyle = '#39ff14';
    ctx.fillText('?먯닔: ' + Math.floor(score), GW - 12, TOP_UI_Y);
    ctx.fillStyle = '#fff';
    drawHp();
    ctx.fillStyle = 'rgba(200,0,0,0.2)';
    ctx.fillRect(0, 0, GW, GH);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Hit!', GW / 2, GH / 2);
    ctx.textAlign = 'left';

    // ?쇨꺽???뚯떇??hitFrames ?낅뜲?댄듃 諛??쒓굅
    for (let i = foods.length - 1; i >= 0; i--) {
      if (foods[i].hitFrames && foods[i].hitFrames > 0) {
        foods[i].hitFrames--;
        if (foods[i].hitFrames <= 0) {
          foods.splice(i, 1);
        }
      }
    }

    pauseFramesLeft--;
    if (pauseFramesLeft === 0 && hp <= 0) {
      shootActive = false;
      shootFrameCount = 0;
      deathFallFrames = 72;
      deathFallOffsetY = 0;
    }
    return;
  }

  // P???쇱떆?뺤?: ?낅뜲?댄듃 ?놁씠 洹몃━湲곕쭔, ?곷떒??Pause
  if (isPaused) {
    ctx.clearRect(0, 0, GW, GH);
    drawBackground();
    foods.forEach(drawFood);
    drawGirl();
    bullets.forEach(drawBullet);
    bombs.forEach(drawBomb);
    explosions.forEach(drawSparklyFirework);
    drawDistance();
    ctx.font = 'bold 24px ' + FONT_HANGUL;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.strokeText('?먯닔: ' + Math.floor(score), GW - 12, TOP_UI_Y);
    ctx.fillStyle = '#39ff14';
    ctx.fillText('?먯닔: ' + Math.floor(score), GW - 12, TOP_UI_Y);
    ctx.fillStyle = '#fff';
    drawHp();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Pause', GW / 2, 36);
    ctx.textAlign = 'left';
    return;
  }

  frameCount++;

  // ?щ씪?대뵫 ?꾨젅??移댁슫???낅뜲?댄듃 諛?諛???怨듦꺽 ?먯젙 泥섎━
  if (slideActive) {
    slideFrames++;
    slideFrameCount++;

    // ?щ씪?대뵫 以?諛???怨듦꺽 ?먯젙?쇰줈 ?뚯떇 ?뚭눼
    // 諛????꾩튂: 罹먮┃???ㅻⅨ履??? 諛??믪씠 (GIRL_H ?섎떒)
    const attackBox = {
      x: GIRL_X + GIRL_W - 15,  // 諛????꾩튂 (?ㅻⅨ履??앹뿉??15px ?덉そ, ?쇱そ?쇰줈 10px ?대룞)
      y: girlY + GIRL_OFFSET_Y + GIRL_H - 20,  // 諛??믪씠
      w: 30,  // 怨듦꺽 ?먯젙 ?덈퉬 (諛????곸뿭)
      h: 20   // 怨듦꺽 ?먯젙 ?믪씠
    };

    // 諛???怨듦꺽 ?먯젙??留욎? ?뚯떇 ?뚭눼 (?섏쨷??紐명넻 異⑸룎 泥댄겕?먯꽌 ?쒖쇅?섍린 ?꾪빐 湲곕줉)
    const destroyedFoodIndices = [];
    for (let fi = foods.length - 1; fi >= 0; fi--) {
      const food = foods[fi];
      const foodHitbox = getFoodHitbox(food);
      if (collides(attackBox, foodHitbox)) {
        // ?꾧컧 ?낅뜲?댄듃
        updateCollection(food.emoji);
        // ?щ씪?대뵫 諛??앹뿉 留욎? ?뚯떇? ??컻 ?대え吏濡??쒖떆
        explosions.push({
          x: food.x + FOOD_W / 2 - 15,  // ?쇱そ?쇰줈 15px ?대룞
          y: food.y + FOOD_H / 2,
          frame: 0,
          maxFrames: EXPLOSION_FRAMES,
          emoji: '?뮙' // ??컻 ?대え吏
        });
        playSfx(sfxBombExplosion);
        destroyedFoodIndices.push(fi);
        foods.splice(fi, 1);
      }
    }

    // ?щ씪?대뵫 ?좊땲硫붿씠??1珥??좎? (60?꾨젅??@ 60fps)
    if (slideFrameCount >= 60) {
      slideActive = false;
      slideFrames = 0;
      slideFrameCount = 0;
      slideLoopCompleted = false;
    }
  }

  // 諛쒖궗 ?꾨젅??移댁슫???낅뜲?댄듃
  if (shootActive) {
    shootFrameCount++;
    if (shootFrameCount >= SHOOT_DURATION) {
      shootActive = false;
      shootFrameCount = 0;
    }
  }

  // ??깂 ?섏?湲??꾨젅??移댁슫???낅뜲?댄듃
  if (bombActive) {
    bombFrameCount++;
    if (bombFrameCount >= BOMB_DURATION) {
      bombActive = false;
      bombFrameCount = 0;
    }
  }

  // ?ъ옣??荑⑦????낅뜲?댄듃
  if (reloadCooldown > 0) {
    const wasReloading = reloadCooldown > 0;
    reloadCooldown--;
    // ?ъ옣???꾨즺 ???뚮━ ?ъ깮 (荑⑦??꾩씠 0???섎뒗 ?쒓컙)
    if (wasReloading && reloadCooldown === 0) {
      playSfx(sfxReload);
    }
  }

  // ?붿긽 諛⑹?: 留??꾨젅??罹붾쾭???꾩껜 ?대━?????ш렇由ш린
  ctx.clearRect(0, 0, GW, GH);

  // 諛곌꼍 ?ㅽ겕濡?  scrollOffset += BG_SPEED;
  score = scrollOffset;
  const d = Math.max(0, Math.floor(options.clearDistance - scrollOffset / PIXELS_PER_METER));
  if (d <= 0) {
    scrollOffset = options.clearDistance * PIXELS_PER_METER;
    if (currentStage === 1) {
      state = 'stage1clear';
      stage1ClearFrames = 0;
      clearFireworks = [];
      return;
    } else {
      state = 'start';
      return;
    }
  }
  drawBackground();

  // 以묐젰쨌?먰봽 (?щ씪?대뵫 以묒뿉??以묐젰 ?곸슜 ????
  if (!slideActive) {
    vy += GRAVITY;
    girlY += vy;
    if (girlY >= GROUND_Y - GIRL_H) {
      girlY = GROUND_Y - GIRL_H;
      vy = 0;
      airJumpUsed = false;
    }
  }

  // ?뚯떇 ?ㅽ룿: ?ㅻⅨ履??앹뿉??  nextSpawn--;
  if (nextSpawn <= 0) {
    foods.push({
      x: GW,
      y: FOOD_SPAWN_YS[Math.floor(Math.random() * FOOD_SPAWN_YS.length)],
      w: FOOD_W,
      h: FOOD_H,
      emoji: FOODS[Math.floor(Math.random() * FOODS.length)]
    });
    nextSpawn = 50 + Math.floor(Math.random() * 60);
  }

  // ?뚯떇 ?대룞 (?쇱そ?쇰줈)
  for (let i = foods.length - 1; i >= 0; i--) {
    foods[i].x -= FOOD_SPEED;
    if (foods[i].x + foods[i].w < 0) foods.splice(i, 1);
  }

  // 珥앹븣?볦쓬??異⑸룎: 蹂???＝ ?앹꽦, 留욎? ?뚯떇쨌珥앹븣 ?쒓굅 (遺?쒖쭚)
  for (let bi = bullets.length - 1; bi >= 0; bi--) {
    for (let fi = foods.length - 1; fi >= 0; fi--) {
      const foodHitbox = getFoodHitbox(foods[fi]);
      if (collides(bullets[bi], foodHitbox)) {
        // ?꾧컧 ?낅뜲?댄듃
        updateCollection(foods[fi].emoji);
        explosions.push({
          x: foods[fi].x + FOOD_W / 2,
          y: foods[fi].y + FOOD_H / 2,
          frame: 0,
          maxFrames: EXPLOSION_FRAMES
        });
        bullets.splice(bi, 1);
        foods.splice(fi, 1);
        break;
      }
    }
  }

  // 珥앹븣 ?대룞 (?곗륫?쇰줈) 諛??붾㈃ 諛??쒓굅
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].x += BULLET_SPEED;
    if (bullets[i].x > GW) bullets.splice(i, 1);
  }

  // ??깂: ?щЪ??臾쇰━ ???뚯떇 異⑸룎(?ш쾶 ??컻) / ??GROUND_Y) 異⑸룎(?ш쾶 ??컻) / ?붾㈃ 諛??쒓굅
  for (let i = bombs.length - 1; i >= 0; i--) {
    const b = bombs[i];
    b.vy += GRAVITY;
    b.y += b.vy;
    b.x += b.vx;
  }
  for (let bi = bombs.length - 1; bi >= 0; bi--) {
    const b = bombs[bi];
    for (let fi = foods.length - 1; fi >= 0; fi--) {
      const foodHitbox = getFoodHitbox(foods[fi]);
      if (collides(b, foodHitbox)) {
        // ?꾧컧 ?낅뜲?댄듃
        updateCollection(foods[fi].emoji);
        explosions.push({ x: foods[fi].x + FOOD_W / 2, y: foods[fi].y + FOOD_H / 2, frame: 0, maxFrames: EXPLOSION_FRAMES, scale: 2 });
        playSfx(sfxBombExplosion);
        bombs.splice(bi, 1);
        foods.splice(fi, 1);
        break;
      }
    }
  }
  for (let i = bombs.length - 1; i >= 0; i--) {
    const b = bombs[i];
    if (b.y + b.h >= GROUND_Y) {
      explosions.push({ x: b.x + b.w / 2, y: GROUND_Y - BOMB_H / 2, frame: 0, maxFrames: EXPLOSION_FRAMES, scale: 2 });
      playSfx(sfxBombExplosion);
      bombs.splice(i, 1);
    } else if (b.x > GW || b.x + b.w < 0) {
      bombs.splice(i, 1);
    }
  }

  // ??＝ ?꾨젅??吏꾪뻾 諛?留뚮즺 ?쒓굅
  for (let i = explosions.length - 1; i >= 0; i--) {
    explosions[i].frame++;
    if (explosions[i].frame >= explosions[i].maxFrames) explosions.splice(i, 1);
  }

  // 洹몃━湲? ?뚯떇 -> ?뚮? -> 珥앹븣 -> ??깂 -> ??＝
  foods.forEach(drawFood);
  drawGirl();
  drawReloadUI(); // ?ъ옣??UI
  bullets.forEach(drawBullet);
  bombs.forEach(drawBomb);
  explosions.forEach(drawSparklyFirework);

  // 寃곗듅源뚯? 嫄곕━ (?곷떒 以묒븰) + ?먯닔(?꾧킅?뱀깋+寃?뺥뀒?먮━) + 泥대젰. ???붿냼 ?쒕줈 媛?대뜲?뺣젹
  drawDistance();
  ctx.font = 'bold 24px ' + FONT_HANGUL;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 4;
  ctx.strokeText('?먯닔: ' + Math.floor(score), GW - 12, TOP_UI_Y);
  ctx.fillStyle = '#39ff14';
  ctx.fillText('?먯닔: ' + Math.floor(score), GW - 12, TOP_UI_Y);
  ctx.fillStyle = '#fff';
  drawHp();

  // 異쒖꽍蹂댁긽, ?꾧컧, ?듭뀡 踰꾪듉? ??댄? ?붾㈃(start)?먯꽌留??쒖떆??
  // 二쇱씤怨듈볦쓬??異⑸룎: ?뚯떇 ?쒓굅, 泥대젰 -1, 0.5珥??뺤?. 泥대젰 0?대㈃ ?뺤? ??寃뚯엫?ㅻ쾭
  // ?щ씪?대뵫 以묒뿉??紐명넻? ?쇨꺽諛쏆?留? 諛???怨듦꺽 ?먯젙 ?곸뿭? ?쒖쇅
  if (slideActive) {
    // ?щ씪?대뵫 以? 癒몃━ 異⑸룎 諛뺤뒪 + 紐명넻 異⑸룎 諛뺤뒪 (諛???怨듦꺽 ?먯젙 ?곸뿭 ?쒖쇅)
    const attackBox = {
      x: GIRL_X + GIRL_W - 15,  // 諛????꾩튂 (?ㅻⅨ履??앹뿉??15px ?덉そ, ?쇱そ?쇰줈 10px ?대룞)
      y: girlY + GIRL_OFFSET_Y + GIRL_H - 20,
      w: 30,
      h: 20
    };
    // 癒몃━ 異⑸룎 諛뺤뒪 (?곷떒 30%)
    const headBoxH = GIRL_H * 0.3;
    const headBox = { x: GIRL_X, y: girlY + GIRL_OFFSET_Y, w: GIRL_W, h: headBoxH };
    // 紐명넻 異⑸룎 諛뺤뒪 (以묎컙 50%)
    const girlBoxH = GIRL_H * 0.5;
    const girlBoxY = girlY + GIRL_OFFSET_Y + GIRL_H * 0.5;
    const girlBox = { x: GIRL_X, y: girlBoxY, w: GIRL_W, h: girlBoxH };

    for (let i = 0; i < foods.length; i++) {
      const food = foods[i];
      const foodHitbox = getFoodHitbox(food);
      // 癒몃━ 遺遺?異⑸룎 泥댄겕 (諛???怨듦꺽 ?먯젙 ?곸뿭 ?쒖쇅)
      if (collides(headBox, foodHitbox) && !collides(attackBox, foodHitbox)) {
        // ?뚯떇??利됱떆 ?쒓굅?섏? ?딄퀬 ?쇨꺽 ?쒖떆
        foods[i].hitFrames = HIT_PAUSE_FRAMES;
        hp--;
        if (hp <= 0) playSfx(sfxGirlDown); else playSfx(sfxGirlHurt);
        pauseFramesLeft = HIT_PAUSE_FRAMES;
        // ?쇨꺽 ???좊땲硫붿씠??罹붿뒳 (以묒꺽 諛⑹?)
        shootActive = false;
        bombActive = false;
        slideActive = false;
        break; // for food loops
      }
      // 紐명넻 異⑸룎 泥댄겕 (諛???怨듦꺽 ?먯젙 ?곸뿭 ?쒖쇅)
      if (collides(girlBox, foodHitbox) && !collides(attackBox, foodHitbox)) {
        // ?뚯떇??利됱떆 ?쒓굅?섏? ?딄퀬 ?쇨꺽 ?쒖떆
        foods[i].hitFrames = HIT_PAUSE_FRAMES;
        hp--;
        if (hp <= 0) playSfx(sfxGirlDown); else playSfx(sfxGirlHurt);
        pauseFramesLeft = HIT_PAUSE_FRAMES;
        // ?쇨꺽 ???좊땲硫붿씠??罹붿뒳 (以묒꺽 諛⑹?)
        shootActive = false;
        bombActive = false;
        slideActive = false;
        break; // for food loops
      }
    }
  } else {
    // ?쇰컲 ?곹깭: ?꾩껜 紐명넻 異⑸룎 泥댄겕 (?먯젙 諛뺤뒪瑜??덈퉬 60%, ?믪씠 90%濡??섏젙)
    const shrinkW = 0.6; // ?덈퉬 60%
    const shrinkH = 0.9; // ?믪씠 90% (癒몃━履??먯젙 ?뺣낫)
    const w = GIRL_W * shrinkW;
    const h = GIRL_H * shrinkH;
    const offsetX = (GIRL_W - w) / 2;
    const offsetY = (GIRL_H - h) / 2; // 以묒븰 ?뺣젹 (癒몃━? 諛?紐⑤몢 ?대뒓 ?뺣룄 而ㅻ쾭??

    const girlBox = {
      x: GIRL_X + offsetX,
      y: girlY + GIRL_OFFSET_Y + offsetY,
      w: w,
      h: h
    };

    for (let i = 0; i < foods.length; i++) {
      const foodHitbox = getFoodHitbox(foods[i]);
      if (collides(girlBox, foodHitbox)) {
        // ?뚯떇??利됱떆 ?쒓굅?섏? ?딄퀬 ?쇨꺽 ?쒖떆
        foods[i].hitFrames = HIT_PAUSE_FRAMES;
        hp--;
        if (hp <= 0) playSfx(sfxGirlDown); else playSfx(sfxGirlHurt);
        pauseFramesLeft = HIT_PAUSE_FRAMES;
        // ?쇨꺽 ???좊땲硫붿씠??罹붿뒳 (以묒꺽 諛⑹?)
        shootActive = false;
        bombActive = false;
        slideActive = false;
        break; // for food loops
      }
    }
  }
}

function getCanvasCoords(e) {
  if (!canvas) return { x: 0, y: 0 };
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width, scaleY = canvas.height / rect.height;
  let cx, cy;
  if (e.touches && e.touches.length > 0) {
    cx = e.touches[0].clientX;
    cy = e.touches[0].clientY;
  } else {
    cx = e.clientX;
    cy = e.clientY;
  }
  return { x: (cx - rect.left) * scaleX, y: (cy - rect.top) * scaleY };
}

function isInBtn(p, btn) {
  return p.x >= btn.x && p.x <= btn.x + btn.w && p.y >= btn.y && p.y <= btn.y + btn.h;
}

function handleTap(e) {
  const pos = getCanvasCoords(e);

  // 1. 怨듯넻 踰꾪듉 (??댄? ?붾㈃?먯꽌留??좏슚)
  if (state === 'start') {
    if (isInBtn(pos, COLLECTION_BTN)) {
      state = 'collection';
      resetCollectionScroll();
      return;
    }
    if (isInBtn(pos, OPTIONS_BTN)) {
      state = 'options';
      selectedOptionIndex = 0;
      return;
    }
    if (isInBtn(pos, ATTENDANCE_BTN)) {
      window.location.href = 'attendance.html';
      return;
    }
  }

  // 2. ?곹깭蹂??몃? 泥섎━
  if (state === 'start') {
    if (isInBtn(pos, BTN)) { startPlay(); return; }
  }

  if (state === 'playing') {
    // ?뚮젅??以??쇰컲 ???대┃ -> 珥앹븣 諛쒖궗 (?고겢由?? mousedown?먯꽌 ??깂 泥섎━)
    addBullet();
    return;
  }

  if (state === 'options') {
    // ?ㅻ줈 媛湲?踰꾪듉 (醫뚯긽???곸뿭)
    if (pos.x >= 20 && pos.x <= 80 && pos.y >= 20 && pos.y <= 60) {
      if (isPaused) { isPaused = false; state = 'playing'; }
      else state = 'start';
      return;
    }
    // ?듭뀡 由ъ뒪????ぉ ?대┃
    const startY = 100, itemHeight = 60;
    for (let i = 0; i < OPTION_ITEMS.length; i++) {
      const y = startY + i * itemHeight;
      if (pos.y >= y - itemHeight / 2 && pos.y <= y + itemHeight / 2) {
        selectedOptionIndex = i;
        const item = OPTION_ITEMS[i];
        if (item.type === 'toggle') {
          if (pos.x > GW - 120) { options[item.key] = !options[item.key]; saveOptions(); }
        } else if (item.type === 'slider') {
          // ui.js??洹몃━湲?以묒떖怨??쇱튂?쒗궎湲? controlX = GW - 25, 諛??쒖옉 = controlX - 100
          const sliderX = GW - 125;
          const sliderW = 100;
          // 醫뚯슦 20px???곗튂 ?ъ쑀 怨듦컙 遺??          if (pos.x >= sliderX - 20 && pos.x <= sliderX + sliderW + 20) {
            isDraggingSlider = true; // ?쒕옒洹??쒖옉
            const relX = pos.x - sliderX;
            const pct = Math.max(0, Math.min(1, relX / sliderW));
            const val = (item.min || 0) + ((item.max || 100) - (item.min || 0)) * pct;

            if (item.key === 'bgmVolume') options.bgmVolume = val / 100;
            else if (item.key === 'sfxVolume') {
              options.sfxVolume = val / 100;
              playSfx(sfxGunshot);
            }
            else if (item.key === 'clearDistance') options.clearDistance = Math.round(val / 50) * 50;

            saveOptions();
          }
        } else if (item.type === 'select' && pos.x > 140) {
          const idx = item.options.indexOf(options[item.key]);
          options[item.key] = item.options[(idx + 1) % item.options.length];
          saveOptions();
        }
        return;
      }
    }
  }

  if (state === 'collection') {
    // ?ㅻ줈 媛湲?踰꾪듉
    if (pos.x >= 20 && pos.x <= 80 && pos.y >= 20 && pos.y <= 60) {
      if (isPaused) { isPaused = false; state = 'playing'; }
      else state = 'start';
      return;
    }
    // 移대뱶 ?대┃ ?ㅻ퉬寃뚯씠??    const cardSize = 60, cardSpacing = 15, startX = 30, gridY = 100;
    for (let i = 0; i < COLLECTION_ITEMS.length; i++) {
      const cardX = startX + i * (cardSize + cardSpacing) - collectionScrollOffset;
      if (pos.x >= cardX && pos.x <= cardX + cardSize && pos.y >= gridY && pos.y <= gridY + cardSize) {
        selectedFoodIndex = i;
        return;
      }
    }
  }

  if (state === 'gameover') {
    if (isInBtn(pos, RETRY_BTN)) { startPlay(); return; }
    if (isInBtn(pos, TITLE_BTN)) {
      if (bgmStage) { bgmStage.pause(); bgmStage.currentTime = 0; }
      if (bgmTitle && options.bgmEnabled) { bgmTitle.currentTime = 0; bgmTitle.play().catch(function () { }); }
      state = 'start';
      return;
    }
  }

  if (state === 'stage1clear') {
    state = 'start';
    if (bgmStage) bgmStage.pause();
    if (bgmTitle && options.bgmEnabled) { bgmTitle.currentTime = 0; bgmTitle.play().catch(function () { }); }
  }
}

// ?듯빀 ?낅젰 由ъ뒪??(留덉슦???곗튂 ???
document.addEventListener('contextmenu', e => { if (state === 'playing') e.preventDefault(); });

document.addEventListener('mousedown', e => {
  const pos = getCanvasCoords(e);
  // 罹붾쾭??諛??대┃ 臾댁떆 (?좏깮?ы빆?대굹 ?ш린?쒕뒗 醫뚰몴 蹂댁젙 ??泥섎━)
  if (state === 'collection' && pos.y >= 90 && pos.y <= 200) {
    isDraggingCollection = true;
    dragStartX = pos.x;
    dragStartScrollOffset = collectionScrollOffset;
  }
  // ?뚮젅??以??고겢由??꾩슜 湲곕뒫
  if (state === 'playing' && e.button === 2) { addBomb(); return; }

  // ?섎㉧吏 紐⑤뱺 ??濡쒖쭅 ?꾩엫
  handleTap(e);
});

document.addEventListener('mousemove', e => {
  const pos = getCanvasCoords(e);
  if (state === 'collection' && isDraggingCollection) {
    collectionScrollOffset = dragStartScrollOffset + (dragStartX - pos.x);
  }
  if (state === 'options' && isDraggingSlider) {
    const listStartY = 110, itemHeight = 60;
    const i = Math.floor((pos.y - listStartY + itemHeight / 2) / itemHeight);
    const item = OPTION_ITEMS[i];
    if (item && item.type === 'slider') {
      const sliderX = GW - 125, sliderW = 100;
      const pct = Math.max(0, Math.min(1, (pos.x - sliderX) / sliderW));
      const val = (item.min || 0) + ((item.max || 100) - (item.min || 0)) * pct;
      if (item.key === 'bgmVolume') options.bgmVolume = val / 100;
      else if (item.key === 'sfxVolume') options.sfxVolume = val / 100;
      else if (item.key === 'clearDistance') options.clearDistance = Math.round(val / 50) * 50;
      saveOptions();
    }
  }
});

document.addEventListener('mouseup', () => {
  isDraggingCollection = false;
  isDraggingSlider = false;
});
document.addEventListener('mouseleave', () => { isDraggingCollection = false; });

document.addEventListener('touchstart', e => {
  const pos = getCanvasCoords(e);
  // 怨듯넻 踰꾪듉 理쒖슦??泥댄겕 (?대깽???꾪뙆 諛⑹? ?꾪빐)
  if (isInBtn(pos, COLLECTION_BTN) || isInBtn(pos, OPTIONS_BTN) || isInBtn(pos, ATTENDANCE_BTN)) {
    handleTap(e);
    e.preventDefault();
    return;
  }

  // ?꾧컧 ?쒕옒洹??곸뿭
  if (state === 'collection' && pos.y >= 90 && pos.y <= 200) {
    isDraggingCollection = true;
    dragStartX = pos.x;
    dragStartScrollOffset = collectionScrollOffset;
    // ?뚯떇 ?곗튂 ?붾뱾由?    const selectedItem = COLLECTION_ITEMS[selectedFoodIndex];
    if (selectedItem && selectedItem.type === 'food') {
      const fd = collectionData[selectedItem.emoji];
      if (fd && fd.discovered) {
        const dx = pos.x - (GW / 2), dy = pos.y - 250;
        if (Math.sqrt(dx * dx + dy * dy) < 45) foodShakeFrame = FOOD_SHAKE_DURATION;
      }
    }
    e.preventDefault();
    return;
  }

  // ?뚮젅??以묒뿏 珥앹븣 諛쒖궗
  if (state === 'playing') {
    addBullet();
    e.preventDefault();
    return;
  }

  // 湲고? ??泥섎━ (?꾧컧 ?좏깮 ??
  handleTap(e);
  e.preventDefault();
}, { passive: false });

document.addEventListener('touchmove', e => {
  if (e.touches.length === 0) return;
  const pos = getCanvasCoords(e);
  if (state === 'collection' && isDraggingCollection) {
    collectionScrollOffset = dragStartScrollOffset + (dragStartX - pos.x);
    e.preventDefault();
  }
  if (state === 'options' && isDraggingSlider) {
    const listStartY = 110, itemHeight = 60;
    const i = Math.floor((pos.y - listStartY + itemHeight / 2) / itemHeight);
    const item = OPTION_ITEMS[i];
    if (item && item.type === 'slider') {
      const sliderX = GW - 125, sliderW = 100;
      const pct = Math.max(0, Math.min(1, (pos.x - sliderX) / sliderW));
      const val = (item.min || 0) + ((item.max || 100) - (item.min || 0)) * pct;
      if (item.key === 'bgmVolume') options.bgmVolume = val / 100;
      else if (item.key === 'sfxVolume') options.sfxVolume = val / 100;
      else if (item.key === 'clearDistance') options.clearDistance = Math.round(val / 50) * 50;
      saveOptions();
    }
    e.preventDefault();
  }
}, { passive: false });

document.addEventListener('touchend', () => {
  isDraggingCollection = false;
  isDraggingSlider = false;
});
document.addEventListener('touchcancel', () => {
  isDraggingCollection = false;
  isDraggingSlider = false;
});

document.addEventListener('keydown', function (e) {
  if (e.code === 'Escape') {
    e.preventDefault();
    if (state === 'collection') {
      if (isPaused) {
        // ?뚮젅??以??쇱떆?뺤? ?곹깭??ㅻ㈃ ?쇱떆?뺤? ?댁젣
        isPaused = false;
        state = 'playing';
      } else {
        state = 'start';
      }
      return;
    }
    if (bgmStage) { bgmStage.pause(); bgmStage.currentTime = 0; }
    if (bgmTitle && options.bgmEnabled) { bgmTitle.currentTime = 0; bgmTitle.play().catch(function () { }); }
    state = 'start';
    return;
  }
  // ?꾧컧 ?붾㈃ ?ㅻ낫???ㅻ퉬寃뚯씠??  if (state === 'collection') {
    if (e.code === 'ArrowLeft') {
      e.preventDefault();
      selectedFoodIndex = Math.max(0, selectedFoodIndex - 1);
      return;
    }
    if (e.code === 'ArrowRight') {
      e.preventDefault();
      selectedFoodIndex = Math.min(COLLECTION_ITEMS.length - 1, selectedFoodIndex + 1);
      return;
    }
    if (e.code === 'Escape') {
      e.preventDefault();
      if (isPaused) {
        // ?뚮젅??以??쇱떆?뺤? ?곹깭??ㅻ㈃ ?쇱떆?뺤? ?댁젣
        isPaused = false;
        state = 'playing';
      } else {
        state = 'start';
      }
      return;
    }
    return;
  }

  // ??궧 ?낅젰 ?붾㈃ ?ㅻ낫??泥섎━
  if (state === 'input_ranking') {
    if (e.code === 'Enter' || e.code === 'Space') {
      if (inputName.length === 3) {
        // ??궧 ?깅줉
        const finalScore = Math.floor(score);
        const newEntry = { name: inputName, score: finalScore };

        // ?꾩옱 ?먯닔 異붽?, ?뺣젹, ?먮Ⅴ湲?        highScores.push(newEntry);
        highScores.sort((a, b) => b.score - a.score);
        if (highScores.length > MAX_HIGH_SCORES) highScores.pop();

        // ???쒖쐞 李얘린 (?섏씠?쇱씠?몄슜)
        newHighScoreIndex = highScores.findIndex(x => x.name === newEntry.name && x.score === newEntry.score);

        localStorage.setItem('jg_highscores', JSON.stringify(highScores));
        state = 'ranking_board';
        return; // ?낅젰 泥섎━ ??諛붾줈 由ы꽩?섏뿬 遺덊븘?뷀븳 ???낅젰 諛⑹?
      }
    } else if (e.code === 'Backspace') {
      inputName = inputName.slice(0, -1);
    } else if (e.key.length === 1 && inputName.length < 3) {
      // ?곷Ц ?臾몄옄留??낅젰 媛?ν븯寃??꾪꽣留?      const char = e.key.toUpperCase();
      if (/[A-Z]/.test(char)) {
        inputName += char;
      }
    }
    return;
  }

  // ??궧 蹂대뱶 ?붾㈃ ?ㅻ낫??泥섎━
  if (state === 'ranking_board') {
    if (e.code === 'Space' || e.code === 'Enter' || e.code === 'Escape') {
      state = 'gameover';
      newHighScoreIndex = -1;
    }
    return;
  }

  // 1?ㅽ뀒?댁? ?대━???붾㈃ ?ㅻ낫??泥섎━
  if (state === 'stage1clear') {
    if (e.code === 'Enter' || e.code === 'Space' || e.code === 'Escape') {
      startPlay(2);
    }
    return;
  }

  // ?듭뀡 ?붾㈃ ?ㅻ낫???ㅻ퉬寃뚯씠??  if (state === 'options') {
    if (e.code === 'ArrowUp') {
      e.preventDefault();
      selectedOptionIndex = Math.max(0, selectedOptionIndex - 1);
      return;
    }
    if (e.code === 'ArrowDown') {
      e.preventDefault();
      selectedOptionIndex = Math.min(OPTION_ITEMS.length - 1, selectedOptionIndex + 1);
      return;
    }
    if (e.code === 'ArrowLeft') {
      e.preventDefault();
      const item = OPTION_ITEMS[selectedOptionIndex];
      if (item.type === 'slider') {
        const currentValue = item.value();
        const newValue = Math.max(item.min, currentValue - 5);
        if (item.key === 'bgmVolume') {
          options.bgmVolume = newValue / 100;
        } else if (item.key === 'sfxVolume') {
          options.sfxVolume = newValue / 100;
          // ?④낵??蹂쇰ⅷ 議곗젙 ??珥앺깂 諛쒖궗 ?뚮━濡??덉떆 ?ъ깮
          playSfx(sfxGunshot);
        }
        saveOptions();
      } else if (item.type === 'select') {
        const currentIndex = item.options.indexOf(options[item.key]);
        const prevIndex = (currentIndex - 1 + item.options.length) % item.options.length;
        options[item.key] = item.options[prevIndex];
        saveOptions();
      } else if (item.type === 'toggle') {
        options[item.key] = false;
        saveOptions();
      }
      return;
    }
    if (e.code === 'ArrowRight') {
      e.preventDefault();
      const item = OPTION_ITEMS[selectedOptionIndex];
      if (item.type === 'slider') {
        const currentValue = item.value();
        const newValue = Math.min(item.max, currentValue + 5);
        if (item.key === 'bgmVolume') {
          options.bgmVolume = newValue / 100;
        } else if (item.key === 'sfxVolume') {
          options.sfxVolume = newValue / 100;
          // ?④낵??蹂쇰ⅷ 議곗젙 ??珥앺깂 諛쒖궗 ?뚮━濡??덉떆 ?ъ깮
          playSfx(sfxGunshot);
        }
        saveOptions();
      } else if (item.type === 'select') {
        const currentIndex = item.options.indexOf(options[item.key]);
        const nextIndex = (currentIndex + 1) % item.options.length;
        options[item.key] = item.options[nextIndex];
        saveOptions();
      } else if (item.type === 'toggle') {
        options[item.key] = true;
        saveOptions();
      }
      return;
    }
    if (e.code === 'Escape') {
      e.preventDefault();
      if (isPaused) {
        isPaused = false;
        state = 'playing';
      } else {
        state = 'start';
      }
      return;
    }
    return;
  }

  // 1?ㅽ뀒?댁? ?대━???붾㈃ ?ㅻ낫??泥섎━
  if (state === 'stage1clear') {
    if (e.code === 'Space' || e.code === 'Enter') {
      state = 'start'; // ?ㅼ쓬 ?ㅽ뀒?댁? ????꾩떆濡???댄?濡??대룞
      if (bgmStage) bgmStage.pause();
      if (bgmTitle && options.bgmEnabled) { bgmTitle.currentTime = 0; bgmTitle.play().catch(function () { }); }
    }
    return;
  }

  if (e.code === 'KeyP') {
    e.preventDefault();
    if (state === 'playing') isPaused = !isPaused;
    return;
  }
  if (e.code === 'Tab') {
    e.preventDefault();
    if (state === 'playing') isPaused = !isPaused;
    return;
  }
  if (e.code === 'CapsLock') {
    e.preventDefault();
    (async function doScreenShot() {
      const ts = new Date().toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '_');
      const name = 'jumping_girl_screen_shot_' + ts + '.png';
      let blob;
      try {
        blob = await new Promise(function (res, rej) {
          canvas.toBlob(function (b) { if (b) res(b); else rej(new Error('toBlob')); }, 'image/png');
        });
      } catch (err) { return; }
      try {
        if (typeof window.showDirectoryPicker === 'function') {
          if (!screenShotDirHandle) screenShotDirHandle = await window.showDirectoryPicker();
          const fh = await screenShotDirHandle.getFileHandle(name, { create: true });
          const w = await fh.createWritable();
          await w.write(blob);
          await w.close();
          return;
        }
      } catch (err) { /* ?대뜑 ?좏깮 痍⑥냼쨌API 誘몄????????ㅼ슫濡쒕뱶 ?대갚 */ }
      const a = document.createElement('a');
      a.download = name;
      a.href = URL.createObjectURL(blob);
      a.click();
      URL.revokeObjectURL(a.href);
    })();
    return;
  }
  if (e.code === 'Space') {
    e.preventDefault();
    if (state !== 'playing' || pauseFramesLeft > 0 || isPaused) return;
    // ?щ씪?대뵫 以묒뿉???먰봽 媛??(?щ씪?대뵫 痍⑥냼)
    if (slideActive) {
      slideActive = false;
      slideFrames = 0;
      slideFrameCount = 0;
    }
    if (girlY >= GROUND_Y - GIRL_H - 2) {
      vy = JUMP_FORCE;
      playSfx(sfxGirlHop);
    } else if (!airJumpUsed) {
      vy = AIR_JUMP_VY;
      airJumpUsed = true;
      playSfx(sfxGirlHop);
    }
  }
  if (e.code === 'KeyA') {
    e.preventDefault();
    if (state !== 'playing' || pauseFramesLeft > 0 || isPaused || slideActive) return;
    // ?먰봽 以묒뿉???щ씪?대뵫 遺덇?
    if (girlY < GROUND_Y - GIRL_H - 2) return; // ?먰봽 以?(?낆뿉 ?우? ?딆쓬)
    slideActive = true;
    slideFrames = 0;
    slideFrameCount = 0;
    slideStartFrame = frameCount;
    slideLoopCompleted = false;
  }
});

// Update function required by loop()
function update() {
  // Logic updates
  updateGifPositions();

  // Sync GameState needed for UI
  if (window.GameState) {
    window.GameState.state = state;
    window.GameState.score = score;
    window.GameState.highScores = highScores;
    window.GameState.options = options;
    window.GameState.inputName = inputName;
    window.GameState.newHighScoreIndex = newHighScoreIndex;
    window.GameState.scrollOffset = scrollOffset;
    window.GameState.selectedOptionIndex = selectedOptionIndex;
    window.GameState.selectedFoodIndex = selectedFoodIndex;
    window.GameState.collectionData = collectionData;
  }
}






```

## js\game_core.js
```js
(function () {
  'use strict';

  let canvas, ctx;
  let state = 'start';
  let stageIndex = 0;
  let stage = null;
  let bgImage = null;
  let bgReady = false;
  let runnerImg = new Image();
  let runnerReady = false;

  const fallbackStages = [
    {
      id: 'stage1',
      name: 'Stage 1',
      title: 'Stage 1 clear',
      bgImage: 'graphic_resource/background.png',
      clearDistance: 450,
      foods: ['🍎','🍔','🍕','🍟','🌭'],
      foodSpawnYs: [500, 430, 360, 290, 220],
      spawnMinFrames: 50,
      spawnMaxFrames: 60,
      initialSpawnFrames: 60
    },
    {
      id: 'stage2',
      name: 'Stage 1',
      title: 'Stage 1 clear',
      bgImage: 'graphic_resource/background_02.png',
      clearDistance: 450,
      foods: ['🍎','🍔','🍕','🍟','🌭'],
      foodSpawnYs: [500, 430, 360, 290, 220],
      spawnMinFrames: 50,
      spawnMaxFrames: 60,
      initialSpawnFrames: 60
    }
  ];

  let foods = [];
  let nextSpawn = 60;
  let scrollOffset = 0;
  let clearFrames = 0;
  let waitingAdvance = false;

  function getStages() {
    if (Array.isArray(window.STAGES) && window.STAGES.length > 0) return window.STAGES;
    if (Array.isArray(window.STAGE_DEFS) && window.STAGE_DEFS.length > 0) {
      return window.STAGE_DEFS.slice().sort((a, b) => (a.order || 0) - (b.order || 0));
    }
    return fallbackStages;
  }

  function setStage(index) {
    const stages = getStages();
    stageIndex = Math.max(0, Math.min(index, stages.length - 1));
    stage = stages[stageIndex];

    bgReady = false;
    bgImage = new Image();
    bgImage.onload = function () { bgReady = true; };
    bgImage.src = stage.bgImage;

    foods = [];
    nextSpawn = stage.initialSpawnFrames || 60;
    scrollOffset = 0;
    clearFrames = 0;
    waitingAdvance = false;
  }

  function startGameFlow() {
    setStage(0);
    state = 'playing';
  }

  function advanceStage() {
    setStage(stageIndex + 1);
    state = 'playing';
  }

  function update() {
    if (state === 'playing') {
      scrollOffset += BG_SPEED;

      nextSpawn--;
      if (nextSpawn <= 0) {
        const ys = stage.foodSpawnYs || [300];
        const list = stage.foods || ['🍎'];
        foods.push({
          x: GW + 10,
          y: ys[Math.floor(Math.random() * ys.length)],
          emoji: list[Math.floor(Math.random() * list.length)]
        });
        nextSpawn = (stage.spawnMinFrames || 50) + Math.floor(Math.random() * ((stage.spawnMaxFrames || 60) - (stage.spawnMinFrames || 50) + 1));
      }

      for (let i = foods.length - 1; i >= 0; i--) {
        foods[i].x -= FOOD_SPEED;
        if (foods[i].x < -40) foods.splice(i, 1);
      }

      const remaining = (stage.clearDistance || 450) * PIXELS_PER_METER - scrollOffset;
      if (remaining <= 0) {
        state = 'stageclear';
        clearFrames = 0;
        waitingAdvance = false;
      }
    } else if (state === 'stageclear') {
      clearFrames++;
      if (clearFrames > 60) waitingAdvance = true;
    }
  }

  function drawTitle() {
    if (bgReady && bgImage.naturalWidth) {
      const iw = bgImage.naturalWidth, ih = bgImage.naturalHeight;
      const scale = Math.max(GW / iw, GH / ih);
      const dw = iw * scale, dh = ih * scale;
      const dx = (GW - dw) / 2, dy = (GH - dh) / 2;
      ctx.drawImage(bgImage, 0, 0, iw, ih, dx, dy, dw, dh);
    } else {
      ctx.fillStyle = '#16213e';
      ctx.fillRect(0, 0, GW, GH);
    }

    ctx.fillStyle = '#5FD9B0';
    if (typeof ctx.roundRect === 'function') {
      ctx.beginPath();
      ctx.roundRect(BTN.x, BTN.y, BTN.w, BTN.h, 12);
      ctx.fill();
    } else {
      ctx.fillRect(BTN.x, BTN.y, BTN.w, BTN.h);
    }
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px ' + FONT_HANGUL;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.strokeText('게임 시작', BTN.x + BTN.w / 2, BTN.y + BTN.h / 2);
    ctx.fillText('게임 시작', BTN.x + BTN.w / 2, BTN.y + BTN.h / 2);

    // buttons placeholders
    drawCircleButton(COLLECTION_BTN, '📖');
    drawCircleButton(OPTIONS_BTN, '⚙');
    drawCircleButton(ATTENDANCE_BTN, '🧾');
  }

  function drawCircleButton(btn, label) {
    ctx.fillStyle = '#5FD9B0';
    ctx.beginPath();
    ctx.arc(btn.x + btn.w / 2, btn.y + btn.h / 2, btn.w / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '24px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, btn.x + btn.w / 2, btn.y + btn.h / 2);
  }

  function drawPlaying() {
    if (bgReady && bgImage.naturalWidth) {
      const iw = bgImage.naturalWidth, ih = bgImage.naturalHeight;
      const scale = Math.max(GW / iw, GH / ih);
      const dw = iw * scale, dh = ih * scale;
      const dy = (GH - dh) / 2;
      const period = dw;
      const s = scrollOffset % period;
      ctx.drawImage(bgImage, 0, 0, iw, ih, -s, dy, dw, dh);
      ctx.drawImage(bgImage, 0, 0, iw, ih, period - s, dy, dw, dh);
    } else {
      ctx.fillStyle = '#16213e';
      ctx.fillRect(0, 0, GW, GH);
    }

    // draw runner
    if (runnerReady && runnerImg.naturalWidth) {
      ctx.drawImage(runnerImg, 0, 0, runnerImg.naturalWidth, runnerImg.naturalHeight, GIRL_X, GROUND_Y - GIRL_H + GIRL_OFFSET_Y, GIRL_W, GIRL_H);
    } else {
      ctx.fillStyle = '#fff';
      ctx.fillRect(GIRL_X, GROUND_Y - GIRL_H + GIRL_OFFSET_Y, GIRL_W, GIRL_H);
    }

    // foods
    ctx.font = '32px sans-serif';
    for (const f of foods) {
      ctx.fillText(f.emoji, f.x, f.y);
    }

    // distance
    const remaining = Math.max(0, Math.floor((stage.clearDistance || 450) - scrollOffset / PIXELS_PER_METER));
    ctx.font = 'bold 24px ' + FONT_HANGUL;
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'right';
    ctx.fillText('거리: ' + remaining + ' m', GW - 10, 30);
  }

  function drawStageClear() {
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, GW, GH);
    ctx.fillStyle = '#ffeb00';
    ctx.font = 'bold 40px ' + FONT_HANGUL;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(stage.title || 'Stage clear', GW / 2, GH / 2 - 20);
    ctx.font = '16px ' + FONT_HANGUL;
    ctx.fillStyle = '#fff';
    ctx.fillText('클릭하면 다음 스테이지', GW / 2, GH / 2 + 20);
  }

  function draw() {
    ctx.clearRect(0, 0, GW, GH);
    if (state === 'start') return drawTitle();
    if (state === 'playing') return drawPlaying();
    if (state === 'stageclear') return drawStageClear();
  }

  function isInBtn(p, btn) {
    return p.x >= btn.x && p.x <= btn.x + btn.w && p.y >= btn.y && p.y <= btn.y + btn.h;
  }

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width, scaleY = canvas.height / rect.height;
    const cx = e.touches && e.touches.length ? e.touches[0].clientX : e.clientX;
    const cy = e.touches && e.touches.length ? e.touches[0].clientY : e.clientY;
    return { x: (cx - rect.left) * scaleX, y: (cy - rect.top) * scaleY };
  }

  function onTap(e) {
    const p = getPos(e);
    if (state === 'start') {
      if (isInBtn(p, BTN)) startGameFlow();
      return;
    }
    if (state === 'stageclear' && waitingAdvance) {
      advanceStage();
      return;
    }
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  function init() {
    canvas = document.getElementById('gameCanvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    canvas.width = GW;
    canvas.height = GH;

    runnerImg.onload = function () { runnerReady = true; };
    runnerImg.src = 'graphic_resource/character/anim/run.gif';

    setStage(0);

    canvas.addEventListener('pointerdown', onTap, { passive: true });
    requestAnimationFrame(loop);
  }

  window.addEventListener('load', init);
})();

```

## js\game_GOLDEN_MASTER.js
```js
/**
 * Jumping Girl - Food Escape
 * ?몃씪蹂??뚮?媛 ?щ━硫? ?ㅻⅨ履쎌뿉???ㅺ??ㅻ뒗 ?뚯떇???ㅽ럹?댁뒪(?먰봽)濡??쇳븯??寃뚯엫
 * @see docs/implementation-baseline.md   (援ы쁽 湲곗?쨌?꾩껜 ?ㅽ럺)
 * @see docs/instruction-002-game-design-basic.md
 * @see docs/instruction-003-bg-aspect-and-bullet.md
 * @see docs/instruction-004-bg-cover-and-ghosting-fix.md
 * @see docs/instruction-005-food-spawn-hp-pause.md
 * @see docs/instruction-006-hp-left-and-explosion.md
 * @see docs/instruction-007-explosion-led-digital-style.md
 * @see docs/instruction-008-explosion-big-star-fragments.md
 * @see docs/instruction-009-bg-offset-road.md
 * @see docs/instruction-010-bullet-visibility-and-girl-gif.md
 */

// Main Game Logic

// Initialize Global State Link
// const G = window.GameState; // Moved to ui.js / global scope

// Local aliases for convenience (optional)
// Note: Draw logic in ui.js uses G directly.
// Physics/Game logic here uses G properties.

// DOM Elements (GIFs)
const girlGifImg = document.getElementById('girlGif');
const slideGifImg = document.getElementById('slideGif');
const shootGifImg = document.getElementById('shootGif');
const bombGifImg = document.getElementById('bombGif');

let canvas, ctx;
let state = 'start'; // start, playing, gameover, collection, options, input_ranking, ranking_board, stage1clear
let highScores = JSON.parse(localStorage.getItem('jg_highscores')) || [];
if (highScores.length === 0) {
  for (let i = 0; i < 5; i++) {
    highScores.push({ name: 'AAA', score: (5 - i) * 1000 });
  }
}
let inputName = '';
let newHighScoreIndex = -1;
let selectedOptionIndex = 0; // ?듭뀡 硫붾돱 而ㅼ꽌
let selectedFoodIndex = 0;   // ?꾧컧 ?좏깮 而ㅼ꽌

window.addEventListener('load', () => {
  canvas = document.getElementById('gameCanvas');
  if (!canvas) return;
  ctx = canvas.getContext('2d');

  // Update Global Context
  if (window.GameState) {
    window.GameState.canvas = canvas;
    window.GameState.ctx = ctx;
  }

  // Resize canvas initially
  resize();

  // Input Listeners
  if (canvas) {
    canvas.addEventListener('click', handleTap);
  }

  // Start Game Loop
  requestAnimationFrame(loop);
});

// Main Loop Function (Hoisted)
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}
// Image Loading & Game Logic below...
// Background setup
const bgImage = new Image();
bgImage.src = 'graphic_resource/background.png';
let bgReady = false;
bgImage.onload = function () { bgReady = true; };

// 1?ㅽ뀒?댁? ?대━???대?吏
const stage1ClearImage = new Image();
stage1ClearImage.src = 'graphic_resource/stage_clear/1stage_clear.png';
let stage1ClearReady = false;
stage1ClearImage.onload = function () { stage1ClearReady = true; };

// 寃뚯엫 ?쒖옉 ?붾㈃: graphic_resource/screen_title.png (源붿뼱?볤린). 誘몃줈?????⑥깋+?띿뒪???대갚
const titleImage = new Image();
titleImage.src = 'graphic_resource/screen_title.png';
let titleReady = false;
titleImage.onload = function () { titleReady = true; };

// 二쇱씤怨? run.gif (?щ━湲? ?щ챸 諛곌꼍 GIF ?좊땲硫붿씠??
// Canvas?먯꽌??GIF ?좊땲硫붿씠?섏씠 ?ъ깮?섏? ?딆쑝誘濡?img ?쒓렇瑜??ъ슜
const girlImage = new Image();
girlImage.crossOrigin = 'anonymous';
let girlReady = false;
const girlGifPath = 'graphic_resource/character/anim/run.gif';

// img ?쒓렇??GIF ?ㅼ젙
if (girlGifImg) {
  girlGifImg.src = girlGifPath;
  girlGifImg.onload = function () {
    girlReady = true;
    console.log('???щ━湲?GIF 濡쒕뱶 ?꾨즺 (img ?쒓렇):', girlGifImg.naturalWidth, 'x', girlGifImg.naturalHeight);
  };
  girlGifImg.onerror = function (e) {
    girlReady = false;
    console.error('???щ━湲?GIF 濡쒕뱶 ?ㅽ뙣:', girlGifPath);
  };
}

// Image 媛앹껜??濡쒕뱶 (?대갚??
girlImage.onload = function () {
  if (!girlReady) girlReady = true;
  console.log('???щ━湲?GIF 濡쒕뱶 ?꾨즺 (Image 媛앹껜):', girlImage.naturalWidth, 'x', girlImage.naturalHeight);
};
girlImage.onerror = function (e) {
  console.error('???щ━湲?GIF 濡쒕뱶 ?ㅽ뙣 (Image 媛앹껜):', girlImage.src);
};
const girlChromaKeyRef = { chromaKey: null, isGif: true };
(async function loadGirlImage() {
  const path = girlGifPath;
  console.log('?봽 ?щ━湲?GIF 濡쒕뱶 ?쒖옉:', path);
  if (location.protocol === 'file:') {
    girlImage.removeAttribute('crossorigin');
    girlImage.src = path;
    return;
  }
  try {
    const r = await fetch(path);
    if (r.ok) {
      const blob = await r.blob();
      girlImage.src = URL.createObjectURL(blob);
      return;
    }
  } catch (e) { }
  girlImage.removeAttribute('crossorigin');
  girlImage.src = path;
})();

// ?꾪솚 諛쒖궗 ?? shoot.gif (?щ챸 諛곌꼍 GIF ?좊땲硫붿씠??
// Canvas?먯꽌??GIF ?좊땲硫붿씠?섏씠 ?ъ깮?섏? ?딆쑝誘濡?img ?쒓렇瑜??ъ슜
const shootImage = new Image();
shootImage.crossOrigin = 'anonymous';
let shootReady = false;
let shootActive = false; // true????drawGirl? shootGifImg瑜?洹몃┝
let shootFrameCount = 0; // 諛쒖궗 ?좊땲硫붿씠???꾨젅??移댁슫??const SHOOT_DURATION = 24; // 諛쒖궗 ?좊땲硫붿씠??吏???쒓컙 (?꾨젅?? - 30??80%
let reloadCooldown = 0; // ?ъ옣??荑⑦???(?꾨젅?? - 2珥?= 120?꾨젅??// Reload cooldown moved to config.js
// const RELOAD_COOLDOWN_DURATION = 120;
const shootGifPath = 'graphic_resource/character/anim/shoot.gif';

// ??깂 ?섏?湲??좊땲硫붿씠??let bombActive = false; // true????drawGirl? bombGifImg瑜?洹몃┝
let bombFrameCount = 0; // ??깂 ?섏?湲??좊땲硫붿씠???꾨젅??移댁슫??const BOMB_DURATION = 15; // ??깂 ?섏?湲??좊땲硫붿씠??吏???쒓컙 (?꾨젅?? - 2諛?鍮좊Ⅴ寃?const bombGifPath = 'graphic_resource/character/anim/bomb.gif';
let bombReady = false;

// img ?쒓렇??GIF ?ㅼ젙
if (shootGifImg) {
  shootGifImg.src = shootGifPath;
  shootGifImg.onload = function () {
    shootReady = true;
    console.log('??諛쒖궗 GIF 濡쒕뱶 ?꾨즺 (img ?쒓렇):', shootGifImg.naturalWidth, 'x', shootGifImg.naturalHeight);
  };
  shootGifImg.onerror = function (e) {
    shootReady = false;
    console.error('??諛쒖궗 GIF 濡쒕뱶 ?ㅽ뙣:', shootGifPath);
  };
}

// Image 媛앹껜??濡쒕뱶 (?대갚??
shootImage.onload = function () {
  if (!shootReady) shootReady = true;
  console.log('??諛쒖궗 GIF 濡쒕뱶 ?꾨즺 (Image 媛앹껜):', shootImage.naturalWidth, 'x', shootImage.naturalHeight);
};
shootImage.onerror = function (e) {
  console.error('??諛쒖궗 GIF 濡쒕뱶 ?ㅽ뙣 (Image 媛앹껜):', shootImage.src);
};

// ??깂 ?섏?湲?GIF 濡쒕뱶
if (bombGifImg) {
  bombGifImg.src = bombGifPath;
  bombGifImg.onload = function () {
    bombReady = true;
    console.log('????깂 ?섏?湲?GIF 濡쒕뱶 ?꾨즺 (img ?쒓렇):', bombGifImg.naturalWidth, 'x', bombGifImg.naturalHeight);
  };
  bombGifImg.onerror = function (e) {
    bombReady = false;
    console.error('????깂 ?섏?湲?GIF 濡쒕뱶 ?ㅽ뙣:', bombGifPath);
  };
}
const shootChromaKeyRef = { chromaKey: null, isGif: true };
(async function loadShootImage() {
  const path = shootGifPath;
  console.log('?봽 諛쒖궗 GIF 濡쒕뱶 ?쒖옉:', path);
  if (location.protocol === 'file:') {
    shootImage.removeAttribute('crossorigin');
    shootImage.src = path;
    return;
  }
  try {
    const r = await fetch(path);
    if (r.ok) {
      const blob = await r.blob();
      shootImage.src = URL.createObjectURL(blob);
      return;
    }
  } catch (e) { }
  shootImage.removeAttribute('crossorigin');
  shootImage.src = path;
})();

// ?щ씪?대뵫: sliding.gif (?щ챸 諛곌꼍 GIF ?좊땲硫붿씠??
// Canvas?먯꽌??GIF ?좊땲硫붿씠?섏씠 ?ъ깮?섏? ?딆쑝誘濡?img ?쒓렇瑜??ъ슜
const slideImage = new Image();
slideImage.crossOrigin = 'anonymous';
let slideReady = false;
let slideActive = false; // true????drawGirl? slideImage瑜?洹몃┝
let slideFrameCount = 0; // ?щ씪?대뵫 ?좊땲硫붿씠???꾨젅??移댁슫??let slideStartFrame = 0; // ?щ씪?대뵫 ?쒖옉 ?꾨젅??let slideLoopCompleted = false; // ?щ씪?대뵫 猷⑦봽 1???꾨즺 ?щ?
const slideGifPath = 'graphic_resource/character/anim/sliding.gif';

// img ?쒓렇??GIF ?ㅼ젙
if (slideGifImg) {
  slideGifImg.src = slideGifPath;
  slideGifImg.onload = function () {
    slideReady = true;
    console.log('???щ씪?대뵫 GIF 濡쒕뱶 ?꾨즺 (img ?쒓렇):', slideGifImg.naturalWidth, 'x', slideGifImg.naturalHeight);
  };
  slideGifImg.onerror = function (e) {
    slideReady = false;
    console.error('???щ씪?대뵫 GIF 濡쒕뱶 ?ㅽ뙣:', slideGifPath);
  };
}

// Image 媛앹껜??濡쒕뱶 (?대갚??
slideImage.onload = function () {
  if (!slideReady) slideReady = true;
  console.log('???щ씪?대뵫 GIF 濡쒕뱶 ?꾨즺 (Image 媛앹껜):', slideImage.naturalWidth, 'x', slideImage.naturalHeight);
};
slideImage.onerror = function (e) {
  console.error('???щ씪?대뵫 GIF 濡쒕뱶 ?ㅽ뙣 (Image 媛앹껜):', slideImage.src);
};
const slideChromaKeyRef = { chromaKey: null, isGif: true };
(async function loadSlideImage() {
  const path = slideGifPath;
  console.log('?봽 ?щ씪?대뵫 GIF 濡쒕뱶 ?쒖옉:', path);
  if (location.protocol === 'file:') {
    slideImage.removeAttribute('crossorigin');
    slideImage.src = path;
    return;
  }
  try {
    const r = await fetch(path);
    if (r.ok) {
      const blob = await r.blob();
      slideImage.src = URL.createObjectURL(blob);
      return;
    }
  } catch (e) { }
  slideImage.removeAttribute('crossorigin');
  slideImage.src = path;
})();

// Stage 1 Clear: 0m ?꾨떖 5珥????띿뒪???쒖떆 (MP4 ?쒓굅, GIF留??ъ슜)

// ?덊듃 ?? hurt.png (1쨌2踰덉㎏), 泥대젰 0 ?쒓컙(3踰덉㎏): down.png. 諛곌꼍 ?щ챸 PNG
const hurtImage = new Image();
hurtImage.crossOrigin = 'anonymous';
let hurtReady = false;
hurtImage.onload = function () {
  hurtReady = true;
  console.log('???덊듃 PNG 濡쒕뱶 ?꾨즺:', hurtImage.naturalWidth, 'x', hurtImage.naturalHeight);
};
hurtImage.onerror = function (e) {
  hurtReady = false;
  console.error('???덊듃 PNG 濡쒕뱶 ?ㅽ뙣:', hurtImage.src);
};
const hurtChromaKeyRef = { chromaKey: null };
(async function loadHurtImage() {
  const path = 'graphic_resource/character/hurt.png';
  console.log('?봽 ?덊듃 PNG 濡쒕뱶 ?쒖옉:', path);
  if (location.protocol === 'file:') {
    hurtImage.removeAttribute('crossorigin');
    hurtImage.src = path;
    return;
  }
  try {
    const r = await fetch(path);
    if (r.ok) {
      const blob = await r.blob();
      hurtImage.src = URL.createObjectURL(blob);
      return;
    }
  } catch (e) { }
  hurtImage.removeAttribute('crossorigin');
  hurtImage.src = path;
})();

const downImage = new Image();
downImage.crossOrigin = 'anonymous';
let downReady = false;
downImage.onload = function () {
  downReady = true;
  console.log('???ㅼ슫 PNG 濡쒕뱶 ?꾨즺:', downImage.naturalWidth, 'x', downImage.naturalHeight);
};
downImage.onerror = function (e) {
  downReady = false;
  console.error('???ㅼ슫 PNG 濡쒕뱶 ?ㅽ뙣:', downImage.src);
};
const downChromaKeyRef = { chromaKey: null };
(async function loadDownImage() {
  const path = 'graphic_resource/character/down.png';
  console.log('?봽 ?ㅼ슫 PNG 濡쒕뱶 ?쒖옉:', path);
  if (location.protocol === 'file:') {
    downImage.removeAttribute('crossorigin');
    downImage.src = path;
    return;
  }
  try {
    const r = await fetch(path);
    if (r.ok) {
      const blob = await r.blob();
      downImage.src = URL.createObjectURL(blob);
      return;
    }
  } catch (e) { }
  downImage.removeAttribute('crossorigin');
  downImage.src = path;
})();

// ?듭뀡 ?ㅼ젙
let options = {
  bgmVolume: 0.7,      // BGM 蹂쇰ⅷ (0.0 ~ 1.0)
  sfxVolume: 0.8,      // ?④낵??蹂쇰ⅷ (0.0 ~ 1.0)
  bgmEnabled: true,   // BGM ???ㅽ봽
  sfxEnabled: true,    // ?④낵?????ㅽ봽
  fullscreen: false,   // ?꾩껜?붾㈃ 紐⑤뱶
  graphicsQuality: 'high', // 洹몃옒???덉쭏: 'low', 'medium', 'high'
  clearDistance: 200   // ?대━??嫄곕━ ?ㅼ젙 (湲곕낯媛?200m)
};

// ?듭뀡 濡쒕뱶
function loadOptions() {
  try {
    const saved = localStorage.getItem('jg_options'); // Consistency with config.js
    if (saved) {
      const parsed = JSON.parse(saved);
      options = { ...options, ...parsed };
    }
  } catch (e) {
    console.error('?듭뀡 濡쒕뱶 ?ㅽ뙣:', e);
  }
  applyOptions();
}

// ?듭뀡 ???function saveOptions() {
  try {
    localStorage.setItem('jg_options', JSON.stringify(options));
  } catch (e) {
    console.error('?듭뀡 ????ㅽ뙣:', e);
  }
  applyOptions();
}

// BGM: ??댄? everybody.mp3, ?ㅽ뀒?댁? stage1.mp3
const bgmTitle = new Audio('bgm/everybody.mp3');
bgmTitle.loop = true;
const bgmStage = new Audio('bgm/stage1.mp3');
bgmStage.loop = true;
let titleBgmTried = false;

// ?④낵??const sfxGunshot = new Audio('effect_sound/gunshot.mp3');
const sfxBombFlying = new Audio('effect_sound/bomb_flying.mp3');
const sfxBombExplosion = new Audio('effect_sound/bomb_explosion.mp3');
const sfxGirlHurt = new Audio('effect_sound/girl_hurt.mp3');
const sfxGirlDown = new Audio('effect_sound/girl_down.mp3');
const sfxGirlHop = new Audio('effect_sound/girl_hop.mp3');
const sfxReload = new Audio('effect_sound/reload.mp3'); // ?ъ옣???뚮━
function playSfx(a) {
  if (a && options.sfxEnabled) {
    a.currentTime = 0;
    a.play().catch(function () { });
  }
}

// ?듭뀡 ?곸슜
function applyOptions() {
  const bgmVol = options.bgmEnabled ? options.bgmVolume : 0;
  const sfxVol = options.sfxEnabled ? options.sfxVolume : 0;

  if (bgmTitle) bgmTitle.volume = bgmVol;
  if (bgmStage) bgmStage.volume = bgmVol;
  if (sfxGunshot) sfxGunshot.volume = sfxVol;
  if (sfxBombFlying) sfxBombFlying.volume = sfxVol;
  if (sfxBombExplosion) sfxBombExplosion.volume = sfxVol;
  if (sfxGirlHurt) sfxGirlHurt.volume = sfxVol;
  if (sfxGirlDown) sfxGirlDown.volume = sfxVol;
  if (sfxGirlHop) sfxGirlHop.volume = sfxVol;
  if (sfxReload) sfxReload.volume = sfxVol;

  // BGM 利됱떆 諛섏쓳
  if (!options.bgmEnabled) {
    // BGM??爰쇱졇?덉쑝硫??뺤?
    if (bgmTitle) bgmTitle.pause();
    if (bgmStage) bgmStage.pause();
  } else {
    // BGM??耳쒖졇?덉쑝硫??꾩옱 ?곹깭??留욌뒗 BGM ?ъ깮
    if (state === 'playing' || state === 'stage1clear') {
      // ?뚮젅??以묒씠硫??ㅽ뀒?댁? BGM
      if (bgmTitle) bgmTitle.pause();
      if (bgmStage) {
        bgmStage.currentTime = 0;
        bgmStage.play().catch(function () { });
      }
    } else {
      // ??댄?/?꾧컧/?듭뀡/寃뚯엫?ㅻ쾭 ?붾㈃?대㈃ ??댄? BGM
      if (bgmStage) bgmStage.pause();
      if (bgmTitle) {
        bgmTitle.currentTime = 0;
        bgmTitle.play().catch(function () { });
      }
    }
  }
}

// 珥덇린 ?듭뀡 濡쒕뱶 (?ㅻ뵒??媛앹껜 ?앹꽦 ??
loadOptions();

// FONT_HANGUL moved to config.js
// const FONT_HANGUL = '"Nanum Myeongjo", serif';

let girlOffscreen = null;
let girlOffCtx = null;
let girlChromaOffscreen = null; // ?щ줈留덊궎 泥섎━??寃곌낵瑜???ν븷 蹂꾨룄 罹붾쾭??let girlChromaOffCtx = null;
let scaleOffscreen = null; // hurt 1.35諛? down 2諛???scale ??let scaleOffCtx = null;
let chromaKey = null; // ?곸긽 ?ш컖 諛곌꼍 ?щ챸??(?뚮몢由??섑뵆)
let deathFallFrames = 0;  // 3踰덉㎏ ?덊듃 ???⑥뼱吏???곗텧 移댁슫?? 0???꾨땲硫?fall 援ш컙
let deathFallOffsetY = 0; // ?⑥뼱吏???y 媛??let chromaUnavailable = false; // getImageData tainted ???덉쇅 ???щ줈留덊궎 嫄대꼫?
let screenShotDirHandle = null; // CapsLock ?ㅽ겕由곗꺑: 泥?CapsLock ???대뜑 ?좏깮?먯꽌 F:\cursor_project\screen_shot 怨좊Ⅴ硫??대떦 寃쎈줈?????(???몄뀡 ?숈븞 ?좎?)
const CHROMA_DIST = 100; // ?좏겢由щ뱶 嫄곕━ ?쒓퀎 (怨쇰룄???쒓굅쨌?쇨뎬 ?먯긽 諛⑹?)
// 洹몃┛?ㅽ겕由??쇱엫) 蹂댁“: G>R, G>B???뚮쭔 ?곸슜???쇰?/?쇨뎬? ?쒓굅 ??곸뿉???쒖쇅
const CHROMA_GREEN = [0, 255, 0]; // 湲곗? ?뱀깋
const CHROMA_DIST_GREEN = 120;    // ?뱀깋鍮??쇰?쨌洹몃┝??蹂댁〈
// ?쇱엫???щ줈留덊궎: #BFFF00 (191, 255, 0), #ADFF2F (173, 255, 47) ??const CHROMA_LIME = [191, 255, 0]; // ?쇱엫??湲곗?
const CHROMA_DIST_LIME = 100;      // ?쇱엫??嫄곕━ ?꾧퀎媛?
// 二쇱씤怨? ?몃씪蹂??뚮?, ?쇱そ 怨좎젙 (?ш린 2諛? 48횞90 ??96횞180). ?쇰큸: 醫뚯륫?쇰줈 遺숈엫, ?꾨줈 20
// GIRL constants moved to config.js
// const GIRL_X = 2;
// const GIRL_OFFSET_Y = -20; 
// const GIRL_W = 96;
// const GIRL_H = 180;
// const GROUND_Y = 580; 
let girlY = GROUND_Y - GIRL_H;
let vy = 0;
// const GRAVITY = 0.55; // moved to config.js
const JUMP_FORCE = -13.5; // ??먰봽, ?믪씠 ?덈컲 (|vy|/??)
const AIR_JUMP_VY = JUMP_FORCE / Math.sqrt(3); // 怨듭쨷 1???뚯젏?? ?먮옒 ?믪씠??1/3
let airJumpUsed = false;
let runFrame = 0;
let frameCount = 0;
let slideFrames = 0; // ?щ씪?대뵫 吏???꾨젅??移댁슫??const SLIDE_DURATION = 36; // ?щ씪?대뵫 吏???쒓컙 (??0.6珥?@ 60fps)

// 諛곌꼍 ?ㅽ겕濡? 200m: 12珥?60fps)쨌BG_SPEED=4 ??scrollOffset 2880????0m
// 諛곌꼍 ?ㅽ겕濡? 200m: 12珥?60fps)쨌BG_SPEED=4 ??scrollOffset 2880????0m
// let scrollOffset = 0; // Removed duplicate
let scrollOffset = 0;
const BG_SPEED = 4;
const SCROLL_FOR_200M = 200 * (3 * 60 * 4) / 50; // 2880 (200m)
const PIXELS_PER_METER = 14.4; // 2880 / 200 = 14.4

// ?뚯떇 ?μ븷臾?const FOODS = ['?뜋', '?뜑', '?뜒', '?뜜', '?뙪'];
const FOOD_W = 40, FOOD_H = 40;

// 媛??뚯떇蹂??먯젙 諛뺤뒪 (?뚯떇 紐⑥뼇??留욊쾶 議곗젙, ?ш린瑜?2/3濡?異뺤냼)
// ?뚯떇蹂??먯젙 諛뺤뒪 (2/3 -> 1/2濡?異뺤냼?섏뿬 ?먯젙????愿??섍쾶 ?섏젙)
const FOOD_HITBOXES = {
  '?뜋': { x: 10, y: 10, w: 14, h: 14 },   // ?ш낵: 28*1/2 = 14
  '?뜑': { x: 8, y: 12, w: 16, h: 12 },    // ?꾨쾭嫄? 32*1/2=16, 24*1/2=12
  '?뜒': { x: 10, y: 10, w: 14, h: 14 },   // ?쇱옄: 28*1/2 = 14
  '?뜜': { x: 9, y: 11, w: 15, h: 13 },    // 媛먯옄?源: 30*1/2=15, 26*1/2=13
  '?뙪': { x: 8, y: 13, w: 17, h: 11 }     // ?ル룄洹? 34*1/2=17, 22*1/2=11
};

// ?뚯떇???ㅼ젣 ?먯젙 諛뺤뒪 媛?몄삤湲?function getFoodHitbox(food) {
  const hitbox = FOOD_HITBOXES[food.emoji] || { x: 12, y: 12, w: 12, h: 12 }; // 湲곕낯媛?異뺤냼
  return {
    x: food.x + hitbox.x,
    y: food.y + hitbox.y,
    w: hitbox.w,
    h: hitbox.h
  };
}

// ?뚯떇 ?꾧컧 ?곗씠??// FOOD_COLLECTION_DATA moved to config.js
// const FOOD_COLLECTION_DATA = { ... };

// ?꾧컧 ?곗씠??濡쒕뱶
let collectionData = {};
function loadCollectionData() {
  try {
    const saved = localStorage.getItem('jg_collection');
    if (saved) {
      collectionData = JSON.parse(saved);
    }
  } catch (e) {
    console.error('?꾧컧 ?곗씠??濡쒕뱶 ?ㅽ뙣:', e);
    collectionData = {};
  }
  // 媛??뚯떇 珥덇린??(?놁쑝硫??앹꽦)
  FOODS.forEach(emoji => {
    if (!collectionData[emoji]) {
      collectionData[emoji] = {
        count: 0,
        firstFound: null,
        lastFound: null,
        discovered: false
      };
    }
  });
}

// ?꾧컧 ?곗씠?????function saveCollectionData() {
  try {
    localStorage.setItem('jg_collection', JSON.stringify(collectionData));
  } catch (e) {
    console.error('?꾧컧 ?곗씠??????ㅽ뙣:', e);
  }
}

// ?뚯떇 遺?섍린 ???꾧컧 ?낅뜲?댄듃
function updateCollection(emoji) {
  if (!collectionData[emoji]) {
    collectionData[emoji] = {
      count: 0,
      firstFound: null,
      lastFound: null,
      discovered: false
    };
  }

  const now = new Date().toISOString();
  collectionData[emoji].count++;
  collectionData[emoji].lastFound = now;

  if (!collectionData[emoji].discovered) {
    collectionData[emoji].discovered = true;
    collectionData[emoji].firstFound = now;
  }

  saveCollectionData();
}

// 珥덇린 濡쒕뱶
loadCollectionData();
// ?ㅽ룿 y 5?ъ씤??(?섃넂?? f.y=?뚯떇 ?곷떒): [0]諛??곸뿭, [1節?]?꾪솚 ?곸뿭, [4]怨듭쨷 ?곸뿭
const FOOD_SPAWN_YS = [500, 430, 360, 290, 220]; // 吏硫?540)怨?罹먮┃??360-540) ?믪씠??留욎떠 ?뺣? 議곗젙
let foods = [];
let nextSpawn = 60;
// FOOD_SPEED moved to config.js
// const FOOD_SPEED = 5.5;

// 珥앹븣 (留덉슦???쇱そ ?대┃ / ?곗튂): ?꾧킅?쇱엫 ?뱀깋, ?덉뿉 ?꾧쾶
// BULLET & BOMB constants moved to config.js
// const BULLET_W = 14, BULLET_H = 7;
// const BULLET_SPEED = 14;
const BULLET_FILL = '#39ff14';   // ?꾧킅?쇱엫 ?뱀깋
const BULLET_STROKE = '#000';    // 寃? ?뚮몢由?(?鍮?
let bullets = [];

// ??깂 (留덉슦???고겢由?: ?щЪ?????붾㈃ ?덉뿉???낆뿉 ?⑥뼱??李⑹?쨌??컻
// const BOMB_W = 32, BOMB_H = 32;
// const BOMB_VX = 4, BOMB_VY = -10; 
let bombs = [];

// ?꾪솚?볦쓬???덊듃: ???곗?硫댁꽌 蹂꾩“媛?(?ш퀬 遺꾨챸?섍쾶)
let explosions = [];
const EXPLOSION_FRAMES = 28;

// ?먯닔 (?ㅽ겕濡?嫄곕━)
let score = 0;

// 泥대젰 (理쒕? 3), ?덊듃 ??0.5珥??뺤?
let hp = 3;
let pauseFramesLeft = 0;
const HIT_PAUSE_FRAMES = 30;
let isPaused = false; // P???쇱떆?뺤?

// Stage 1 Clear: 0m ?꾨떖 ???띿뒪????＝ 5珥?????댄? 蹂듦? (MP4 ?쒓굅)
let stage1ClearFrames = 0;
let clearFireworks = []; // 洹밸챸??諛앹? ??＝ ?꾩슜 (drawExplosion ?ы솢??????

// 諛섏쓳??// 諛섏쓳??function resize() {
  if (!canvas) return; // Prevent error if canvas is not initialized

  // Set internal resolution matches game logic
  canvas.width = GW;
  canvas.height = GH;

  const w = window.innerWidth, h = window.innerHeight;
  const ratio = 9 / 16;
  let cw = Math.min(360, w), ch = cw / ratio;
  if (ch > h) { ch = h; cw = ch * ratio; }
  canvas.style.width = cw + 'px';
  canvas.style.height = ch + 'px';
  // GIF img ?쒓렇 ?ш린???낅뜲?댄듃
  updateGifPositions();
}
window.addEventListener('resize', resize);
// resize(); // moved to window.onload to ensure canvas is ready

// GIF img ?쒓렇 ?꾩튂 ?낅뜲?댄듃 ?⑥닔
function updateGifPositions() {
  if (!girlGifImg || !slideGifImg || !shootGifImg || !bombGifImg) return;

  // Determine visibility flags based on game state
  const shouldShowSlideGif = slideActive;
  const shouldShowShootGif = shootActive;
  const shouldShowBombGif = bombActive;
  // Girl is shown if not doing special actions and alive
  const shouldShowGirlGif = !slideActive && !shootActive && !bombActive && hp > 0 && deathFallFrames === 0 && pauseFramesLeft === 0;

  // Canvas???ㅼ젣 ?붾㈃ ?ш린 (CSS濡??ㅼ??쇰맂 ?ш린)
  const canvasRect = canvas.getBoundingClientRect();
  const screenWidth = canvasRect.width;
  const screenHeight = canvasRect.height;

  // 寃뚯엫 ?대? 醫뚰몴(360x640)瑜??붾㈃ 醫뚰몴濡?蹂?섑븯???ㅼ???  const scaleX = screenWidth / GW;  // ?? 360px / 360 = 1.0
  const scaleY = screenHeight / GH;  // ?? 640px / 640 = 1.0

  // ?щ━湲?GIF ?꾩튂 (寃뚯엫 ?뚮젅??以묒씠怨??쒖떆?댁빞 ????
  if (state === 'playing' && girlReady && shouldShowGirlGif) {
    // 寃뚯엫 ?대? 醫뚰몴瑜??붾㈃ 醫뚰몴濡?蹂??    // GIRL_X = 2, girlY + GIRL_OFFSET_Y??寃뚯엫 ?대? 醫뚰몴
    const gx = GIRL_X * scaleX;
    const gy = (girlY + GIRL_OFFSET_Y) * scaleY;
    const gw = GIRL_W * scaleX;
    const gh = GIRL_H * scaleY;

    // img ?쒓렇??Canvas 而⑦뀒?대꼫 湲곗??쇰줈 ?꾩튂 ?ㅼ젙 (position: absolute?대?濡?
    // Canvas???쇱そ ??紐⑥꽌由ш? (0, 0)???섎룄濡?    // Canvas container is relative, images are absolute children.
    // So coordinates are relative to the container (canvas top-left).

    girlGifImg.style.left = gx + 'px';
    girlGifImg.style.top = gy + 'px';
    girlGifImg.style.width = gw + 'px';
    girlGifImg.style.height = gh + 'px';
    girlGifImg.style.display = 'block';
  } else {
    girlGifImg.style.display = 'none';
  }

  // ?щ씪?대뵫 GIF ?꾩튂 (?ш린 90%濡?議곗젅)
  if (state === 'playing' && slideReady && shouldShowSlideGif) {
    const slideScale = 0.9; // ?щ씪?대뵫 GIF ?ш린 90% (80%?먯꽌 10% 利앷?)
    const slideW = GIRL_W * slideScale;
    const slideH = GIRL_H * slideScale;
    const gx = GIRL_X * scaleX;
    const gy = (girlY + GIRL_OFFSET_Y) * scaleY;
    const gw = slideW * scaleX;
    const gh = slideH * scaleY;
    // 以묒븰 ?뺣젹???꾪빐 ?ㅽ봽??異붽?
    const offsetX = (GIRL_W - slideW) * scaleX * 0.5;
    const offsetY = (GIRL_H - slideH) * scaleY * 0.5;

    slideGifImg.style.left = (gx + offsetX) + 'px';
    slideGifImg.style.top = (gy + offsetY) + 'px';
    slideGifImg.style.width = gw + 'px';
    slideGifImg.style.height = gh + 'px';
    slideGifImg.style.display = 'block';
  } else {
    slideGifImg.style.display = 'none';
  }

  // 諛쒖궗 GIF ?꾩튂
  if (state === 'playing' && shootReady && shouldShowShootGif) {
    const gx = GIRL_X * scaleX;
    const gy = (girlY + GIRL_OFFSET_Y) * scaleY;
    const gw = GIRL_W * scaleX;
    const gh = GIRL_H * scaleY;

    shootGifImg.style.left = gx + 'px';
    shootGifImg.style.top = gy + 'px';
    shootGifImg.style.width = gw + 'px';
    shootGifImg.style.height = gh + 'px';
    shootGifImg.style.display = 'block';
  } else {
    shootGifImg.style.display = 'none';
  }

  // ??깂 ?섏?湲?GIF ?꾩튂
  if (state === 'playing' && bombReady && shouldShowBombGif) {
    const gx = GIRL_X * scaleX;
    const gy = (girlY + GIRL_OFFSET_Y) * scaleY;
    const gw = GIRL_W * scaleX;
    const gh = GIRL_H * scaleY;

    bombGifImg.style.left = gx + 'px';
    bombGifImg.style.top = gy + 'px';
    bombGifImg.style.width = gw + 'px';
    bombGifImg.style.height = gh + 'px';
    bombGifImg.style.display = 'block';
  } else {
    bombGifImg.style.display = 'none';
  }
}

// 珥앹븣 洹몃━湲? ?? ?대え吏 + ?ㅻⅨ履?45??湲곗슱湲?function drawBullet(b) {
  ctx.save();
  ctx.translate(b.x + b.w / 2, b.y + b.h / 2);
  ctx.rotate(Math.PI / 4); // 45??湲곗슱??  ctx.font = '24px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('??', 0, 0);
  ctx.restore();
}

// ??깂 洹몃━湲? ?뮗 ?대え吏
function drawBomb(b) {
  ctx.font = '28px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('?뮗', b.x + BOMB_W / 2, b.y + BOMB_H / 2);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}

// 鍮꾨뵒?ㅻ? gx,gy??洹몃━湲? scale ?앸왂/1?대㈃ 96횞180, 1.5硫?1.5諛?以묒떖 ?뺣젹). ?щ줈留덊궎 ?곸슜.
// drawVideoChroma ?⑥닔 ??젣 (MP4 鍮꾨뵒???ъ슜 ????

// ?대?吏瑜?gx,gy??洹몃━湲? GIF ?좊땲硫붿씠?섏? 留??꾨젅?꾨쭏???먮낯 ?대?吏瑜?吏곸젒 洹몃젮???ъ깮??function drawImageChroma(img, gx, gy, chromaKeyRef, scale) {
  const nw = img.naturalWidth || 0, nh = img.naturalHeight || 0;
  if (nw <= 0 || nh <= 0) return;
  const sc = (scale == null || scale === 1) ? 1 : scale;
  // ?먮낯 ?대?吏 鍮꾩쑉 ?좎?
  const aspectRatio = nw / nh;
  let dw, dh;
  if (sc === 1) {
    dw = GIRL_W;
    dh = GIRL_H;
  } else {
    // ?덈퉬 湲곗??쇰줈 怨꾩궛?섍퀬 ?믪씠???먮낯 鍮꾩쑉 ?좎?
    const baseWidth = GIRL_W * sc;
    dw = Math.round(baseWidth);
    dh = Math.round(baseWidth / aspectRatio);
  }

  // GIF ?뚯씪?몄? ?뺤씤 (?대?吏 ?뚯뒪 寃쎈줈 ?먮뒗 chromaKeyRef??isGif ?뚮옒洹몃줈 ?뺤씤)
  const imgSrc = img.src || '';
  const isGif = chromaKeyRef.isGif === true ||
    imgSrc.toLowerCase().includes('.gif') ||
    imgSrc.toLowerCase().includes('run.gif') ||
    imgSrc.toLowerCase().includes('sliding.gif') ||
    imgSrc.toLowerCase().includes('anim/');

  // GIF ?뚯씪??寃쎌슦 紐⑤뱺 泥섎━瑜?嫄대꼫?곌퀬 諛붾줈 ?먮낯 ?대?吏瑜?吏곸젒 洹몃━湲?  // ?닿쾬??GIF ?좊땲硫붿씠?섏쓣 ?ъ깮?섎뒗 ?좎씪???뺤떎??諛⑸쾿
  // ?ㅽ봽?ㅽ겕由?罹붾쾭?ㅻ? 嫄곗튂嫄곕굹 getImageData瑜??몄텧?섎㈃ ?뺤쟻 ?대?吏媛 ?섏뼱 ?좊땲硫붿씠?섏씠 硫덉땄
  if (isGif) {
    // 留??꾨젅?꾨쭏???먮낯 ?대?吏瑜?吏곸젒 洹몃━硫?釉뚮씪?곗?媛 GIF???꾩옱 ?꾨젅?꾩쓣 ?먮룞?쇰줈 ?낅뜲?댄듃??    ctx.drawImage(img, 0, 0, nw, nh, gx, gy, dw, dh);
    return;
  }

  // GIF媛 ?꾨땶 寃쎌슦?먮쭔 ?щ챸??泥댄겕 諛??щ줈留덊궎 泥섎━
  if (chromaKeyRef.chromaKey === null) {
    // 泥?濡쒕뱶 ???щ챸??泥댄겕 (??踰덈쭔)
    try {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = dw;
      tempCanvas.height = dh;
      const tempCtx = tempCanvas.getContext('2d');
      tempCtx.drawImage(img, 0, 0, nw, nh, 0, 0, dw, dh);
      const d = tempCtx.getImageData(0, 0, dw, dh);
      const data = d.data;
      let asum = 0, cnt = 0;
      const step = 6;
      // ?뚮몢由??섑뵆留곸쑝濡??щ챸???뺤씤
      for (var x = 0; x < dw; x += step) {
        var iT = (0 * dw + x) * 4;
        asum += data[iT + 3]; cnt++;
        var iB = ((dh - 1) * dw + x) * 4;
        asum += data[iB + 3]; cnt++;
      }
      for (var y = 0; y < dh; y += step) {
        var iL = (y * dw + 0) * 4;
        asum += data[iL + 3]; cnt++;
        var iR = (y * dw + (dw - 1)) * 4;
        asum += data[iR + 3]; cnt++;
      }
      const avgAlpha = asum / cnt;

      // ?щ챸???대?吏??寃쎌슦 (?됯퇏 ?뚰뙆媛믪씠 ??쓬)
      if (avgAlpha < 20) {
        chromaKeyRef.chromaKey = 'transparent';
      } else {
        // 遺덊닾紐낇븳 諛곌꼍???덈뒗 寃쎌슦 ?щ줈留덊궎 泥섎━ ?꾩슂
        chromaKeyRef.chromaKey = 'opaque';
      }
    } catch (e) {
      // getImageData ?ㅽ뙣 ???щ챸?쇰줈 媛꾩＜
      chromaKeyRef.chromaKey = 'transparent';
    }
  }

  // ?щ챸 PNG??留??꾨젅?꾨쭏???먮낯 ?대?吏瑜?吏곸젒 洹몃━湲?  if (chromaKeyRef.chromaKey === 'transparent') {
    ctx.drawImage(img, 0, 0, nw, nh, gx, gy, dw, dh);
    return;
  }

  // 遺덊닾紐?諛곌꼍???덈뒗 寃쎌슦 ?щ줈留덊궎 泥섎━ (PNG ??
  // ??寃쎌슦???щ줈留덊궎 泥섎━媛 ?꾩슂?섏?留? GIF媛 ?꾨땺 媛?μ꽦???믪쓬
  try {
    var off, offCtx;
    if (sc === 1) {
      if (!girlOffscreen) {
        girlOffscreen = document.createElement('canvas');
        girlOffscreen.width = GIRL_W;
        girlOffscreen.height = GIRL_H;
        girlOffCtx = girlOffscreen.getContext('2d');
      }
      off = girlOffscreen; offCtx = girlOffCtx;
    } else {
      if (!scaleOffscreen || scaleOffscreen.width !== dw || scaleOffscreen.height !== dh) {
        scaleOffscreen = document.createElement('canvas');
        scaleOffscreen.width = dw;
        scaleOffscreen.height = dh;
        scaleOffCtx = scaleOffscreen.getContext('2d');
      }
      off = scaleOffscreen; offCtx = scaleOffCtx;
    }

    offCtx.clearRect(0, 0, dw, dh);
    offCtx.drawImage(img, 0, 0, nw, nh, 0, 0, dw, dh);
    const d = offCtx.getImageData(0, 0, dw, dh);
    const data = d.data;

    // ?щ줈留덊궎 ?됱긽 媛먯? (泥??꾨젅?꾩뿉?쒕쭔)
    if (!chromaKeyRef.chromaKeyRgb) {
      let rsum = 0, gsum = 0, bsum = 0, cnt = 0;
      const step = 6;
      for (var x = 0; x < dw; x += step) {
        var iT = (0 * dw + x) * 4;
        rsum += data[iT]; gsum += data[iT + 1]; bsum += data[iT + 2]; cnt++;
        var iB = ((dh - 1) * dw + x) * 4;
        rsum += data[iB]; gsum += data[iB + 1]; bsum += data[iB + 2]; cnt++;
      }
      for (var y = 0; y < dh; y += step) {
        var iL = (y * dw + 0) * 4;
        rsum += data[iL]; gsum += data[iL + 1]; bsum += data[iL + 2]; cnt++;
        var iR = (y * dw + (dw - 1)) * 4;
        rsum += data[iR]; gsum += data[iR + 1]; bsum += data[iR + 2]; cnt++;
      }
      chromaKeyRef.chromaKeyRgb = [rsum / cnt, gsum / cnt, bsum / cnt];
    }

    const r0 = chromaKeyRef.chromaKeyRgb[0], g0 = chromaKeyRef.chromaKeyRgb[1], b0 = chromaKeyRef.chromaKeyRgb[2];
    const distSq = CHROMA_DIST * CHROMA_DIST;
    const gR = CHROMA_GREEN[0], gG = CHROMA_GREEN[1], gB = CHROMA_GREEN[2];
    const greenDistSq = CHROMA_DIST_GREEN * CHROMA_DIST_GREEN;
    const lR = CHROMA_LIME[0], lG = CHROMA_LIME[1], lB = CHROMA_LIME[2];
    const limeDistSq = CHROMA_DIST_LIME * CHROMA_DIST_LIME;

    // ???됱긽 蹂댄샇???됱긽
    const NAVY_R = 30, NAVY_G = 58, NAVY_B = 95;
    const WHITE_THRESHOLD = 200;
    const SKIN_R = 255, SKIN_G = 219, SKIN_B = 172;
    const HAIR_R = 44, HAIR_G = 24, HAIR_B = 16;
    const CLOTHES_PROTECT_DIST = 80;

    for (var i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const dNavy = Math.sqrt((r - NAVY_R) * (r - NAVY_R) + (g - NAVY_G) * (g - NAVY_G) + (b - NAVY_B) * (b - NAVY_B));
      const dSkin = Math.sqrt((r - SKIN_R) * (r - SKIN_R) + (g - SKIN_G) * (g - SKIN_G) + (b - SKIN_B) * (b - SKIN_B));
      const dHair = Math.sqrt((r - HAIR_R) * (r - HAIR_R) + (g - HAIR_G) * (g - HAIR_G) + (b - HAIR_B) * (b - HAIR_B));
      const isWhite = r >= WHITE_THRESHOLD && g >= WHITE_THRESHOLD && b >= WHITE_THRESHOLD;
      const isClothes = dNavy < CLOTHES_PROTECT_DIST || isWhite || dSkin < CLOTHES_PROTECT_DIST || dHair < CLOTHES_PROTECT_DIST;
      if (isClothes) continue;

      const dr = r - r0, dg = g - g0, db = b - b0;
      const dGr = r - gR, dGg = g - gG, dGb = b - gB;
      const dLr = r - lR, dLg = g - lG, dLb = b - lB;
      const nearBorder = dr * dr + dg * dg + db * db <= distSq;
      const nearGreen = (g > r && g > b) && (dGr * dGr + dGg * dGg + dGb * dGb <= greenDistSq);
      const nearLime = (g > r && g > b && b < 50) && (dLr * dLr + dLg * dLg + dLb * dLb <= limeDistSq);
      if (nearBorder || nearGreen || nearLime) data[i + 3] = 0;
    }

    // ?щ줈留덊궎 泥섎━???대?吏 洹몃━湲?    if (sc === 1) {
      if (!girlChromaOffscreen) {
        girlChromaOffscreen = document.createElement('canvas');
        girlChromaOffscreen.width = GIRL_W;
        girlChromaOffscreen.height = GIRL_H;
        girlChromaOffCtx = girlChromaOffscreen.getContext('2d');
      }
      girlChromaOffCtx.putImageData(d, 0, 0);
      ctx.drawImage(girlChromaOffscreen, 0, 0, dw, dh, gx, gy, dw, dh);
    } else {
      if (!scaleOffscreen || scaleOffscreen.width !== dw || scaleOffscreen.height !== dh) {
        scaleOffscreen = document.createElement('canvas');
        scaleOffscreen.width = dw;
        scaleOffscreen.height = dh;
        scaleOffCtx = scaleOffscreen.getContext('2d');
      }
      scaleOffCtx.putImageData(d, 0, 0);
      ctx.drawImage(scaleOffscreen, 0, 0, dw, dh, gx, gy, dw, dh);
    }
  } catch (e) {
    chromaUnavailable = true;
    ctx.drawImage(img, 0, 0, nw, nh, gx, gy, dw, dh);
  }
}

// GIF ?쒖떆 ?곹깭 (?꾩뿭 蹂?섎줈 留뚮뱾?댁꽌 updateGifPositions?먯꽌 ?묎렐 媛?ν븯寃?
let shouldShowGirlGif = true;
let shouldShowSlideGif = false;
let shouldShowShootGif = false;
let shouldShowBombGif = false;

// 二쇱씤怨?洹몃━湲? ?덊듃 ??hurt/down, 諛쒖궗 以?shoot, ?꾨땲硫?run. ?щ챸 PNG ?ъ슜. 誘몃줈????罹붾쾭???대갚
function drawGirl() {
  const gx = GIRL_X, gy = girlY + GIRL_OFFSET_Y;

  // ?ㅻⅨ ?숈옉 以묒씪 ?뚮뒗 湲곕낯 ?대?吏 ?④린湲?  let showGif = true;
  shouldShowGirlGif = false;
  shouldShowSlideGif = false;
  shouldShowShootGif = false;
  shouldShowBombGif = false;

  if (pauseFramesLeft > 0) {
    // ?덊듃 ?? GIF ?④린怨?hurt/down ?대?吏 ?쒖떆
    showGif = false;
    shouldShowGirlGif = false;
    if (hp <= 0 && pauseFramesLeft <= 12 && downImage && downImage.naturalWidth > 0) {
      // ?щ━湲?洹몃┝怨?媛숈? 鍮꾩쑉濡?異뺤냼 ????諛곕줈 ?뺣? ??10% 異뺤냼 (?먮낯 鍮꾩쑉 ?좎?)
      const runOriginalWidth = 560;
      const scaleRatio = GIRL_W / runOriginalWidth; // ?щ━湲?洹몃┝??異뺤냼 鍮꾩쑉
      // 二쎈뒗 洹몃┝???먮낯 ?ш린瑜?湲곗??쇰줈 媛숈? 鍮꾩쑉 ?곸슜 ????諛? 10% 異뺤냼
      const scaledWidth = downImage.naturalWidth * scaleRatio * 2 * 0.9;
      const scaledHeight = downImage.naturalHeight * scaleRatio * 2 * 0.9;
      // ?щ━湲?二쇱씤怨듦낵 媛숈? ?꾩튂 (以묒븰 ?뺣젹)
      const dx = gx + GIRL_W / 2 - scaledWidth / 2;
      const dy = gy + GIRL_H / 2 - scaledHeight / 2;
      ctx.drawImage(downImage, 0, 0, downImage.naturalWidth, downImage.naturalHeight, dx, dy, scaledWidth, scaledHeight);
      return;
    }
    if (hurtImage && hurtImage.naturalWidth > 0) {
      // ?щ━湲?二쇱씤怨듦낵 ?뺥솗??媛숈? ?꾩튂? ?ш린
      const hx = gx;
      const hy = gy;
      ctx.drawImage(hurtImage, 0, 0, hurtImage.naturalWidth, hurtImage.naturalHeight, hx, hy, GIRL_W, GIRL_H);
      return;
    }
  }
  if (slideActive) {
    // ?щ씪?대뵫 以? img ?쒓렇濡?GIF ?좊땲硫붿씠???쒖떆 (updateGifPositions?먯꽌 泥섎━)
    showGif = false;
    shouldShowGirlGif = false;
    shouldShowSlideGif = true;
    return;
  }
  if (shootActive && shootReady) {
    // 諛쒖궗 以? img ?쒓렇濡?GIF ?좊땲硫붿씠???쒖떆 (updateGifPositions?먯꽌 泥섎━)
    showGif = false;
    shouldShowGirlGif = false;
    shouldShowShootGif = true;
    return;
  }
  if (bombActive && bombReady) {
    // ??깂 ?섏?湲?以? img ?쒓렇濡?GIF ?좊땲硫붿씠???쒖떆 (updateGifPositions?먯꽌 泥섎━)
    showGif = false;
    shouldShowGirlGif = false;
    shouldShowBombGif = true;
    return;
  }

  // 湲곕낯 ?щ━湲??곹깭 ?먮뒗 ?먰봽 以묒씪 ??GIF ?쒖떆 (?ㅻⅨ ?숈옉???놁쓣 ??
  // Canvas?먯꽌??GIF ?좊땲硫붿씠?섏씠 ?ъ깮?섏? ?딆쑝誘濡?img ?쒓렇瑜??ъ슜
  if (showGif) {
    // img ?쒓렇濡?GIF ?좊땲硫붿씠???쒖떆 (updateGifPositions?먯꽌 泥섎━)
    shouldShowGirlGif = true;
    shouldShowSlideGif = false;
    return;
  }
  // ?대갚: 罹붾쾭?ㅻ줈 洹몃┛ ?몃씪蹂??뚮? (2諛??ㅼ???
  ctx.save();
  ctx.translate(GIRL_X, girlY + GIRL_OFFSET_Y);
  ctx.scale(2, 2);
  const x = 0;
  const y = 0;
  runFrame = Math.floor(frameCount / 8) % 2;

  // 癒몃━ (?대갚: 48횞90 湲곗?, scale 2濡?96횞180)
  ctx.fillStyle = '#ffdbac';
  ctx.beginPath();
  ctx.arc(x + 24, y + 18, 16, 0, Math.PI * 2);
  ctx.fill();
  // 癒몃━移대씫 (ellipse 誘몄???釉뚮씪?곗?: arc濡?諛섏썝 ?泥?
  ctx.fillStyle = '#2c1810';
  ctx.beginPath();
  try {
    ctx.ellipse(x + 24, y + 20, 16, 14, 0, 0, Math.PI);
  } catch (e) {
    ctx.arc(x + 24, y + 20, 14, 0, Math.PI);
  }
  ctx.fill();

  // 紐? ?몃씪蹂?(???붿툩 + ?ㅼ씠鍮?移쇰씪)
  ctx.fillStyle = '#fff';
  ctx.fillRect(x + 6, y + 32, 36, 28);
  ctx.fillStyle = '#1e3a5f';
  ctx.fillRect(x + 10, y + 34, 28, 8);
  ctx.fillStyle = '#fff';
  ctx.fillRect(x + 14, y + 36, 6, 6);
  ctx.fillRect(x + 26, y + 36, 6, 6);

  // 移섎쭏 (?ㅼ씠鍮?
  ctx.fillStyle = '#1e3a5f';
  ctx.beginPath();
  ctx.moveTo(x + 8, y + 58);
  ctx.lineTo(x + 40, y + 58);
  ctx.lineTo(x + 36, y + 78);
  ctx.lineTo(x + 12, y + 78);
  ctx.closePath();
  ctx.fill();

  // ?ㅻ━ (?щ━湲??꾨젅??
  ctx.strokeStyle = '#2c1810';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  if (runFrame === 0) {
    ctx.beginPath();
    ctx.moveTo(x + 18, y + 78);
    ctx.lineTo(x + 14, y + 98);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + 32, y + 78);
    ctx.lineTo(x + 36, y + 92);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(x + 18, y + 78);
    ctx.lineTo(x + 22, y + 92);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + 32, y + 78);
    ctx.lineTo(x + 28, y + 98);
    ctx.stroke();
  }
  ctx.restore();
}

// ?뚯떇 洹몃━湲? ?대え吏 + ?먮㈇?섎뒗 ?꾧킅???뚮몢由?(?ш컖???쒓굅, ?먯껜 諛쒓킅 ?④낵)
function drawFood(f) {
  // ?쇨꺽???뚯떇? 源쒕묀???④낵
  let alpha = 1.0;
  if (f.hitFrames && f.hitFrames > 0) {
    // 源쒕묀???④낵: 鍮좊Ⅴ寃?源쒕묀?대떎媛 ?щ씪吏?    const blinkSpeed = 0.5;
    const progress = f.hitFrames / HIT_PAUSE_FRAMES;
    alpha = Math.sin(progress * Math.PI * 8) * 0.5 + 0.5; // 0.0 ~ 1.0 ?ъ씠 源쒕묀??    if (progress > 0.7) {
      // 留덉?留?30% 援ш컙?먯꽌???먯젏 ?щ씪吏?      alpha *= (1 - (progress - 0.7) / 0.3);
    }
  }

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = '32px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // ?먮㈇ ?꾧킅 誘쇳듃??(Bright Mint) ?뚮몢由??④낵
  const blink = 0.4 + 0.6 * Math.sin(frameCount * 0.15); // 泥쒖쿇???먮㈇

  // 諛앹? 誘쇳듃??洹몃┝?먮줈 ?뚮몢由??④낵, alpha媛믪쑝濡??먮㈇
  ctx.shadowColor = `rgba(0, 255, 170, ${1.0})`;
  ctx.shadowBlur = 10 * blink + 5; // 釉붾윭 ?ш린媛 而ㅼ죱???묒븘議뚮떎 ??(5~15)

  ctx.fillText(f.emoji, f.x + FOOD_W / 2, f.y + FOOD_H / 2);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.restore();
}

// 諛곌꼍 ?ㅽ겕濡? cover 鍮꾩쑉 ?좎?, 蹂댁씠??理쒗븯???꾨줈)??罹먮┃??諛쒕컩(GROUND_Y)???ㅻ룄濡?function drawBackground() {
  if (bgReady && bgImage.naturalWidth) {
    const iw = bgImage.naturalWidth, ih = bgImage.naturalHeight;
    const scale = Math.max(GW / iw, GH / ih);
    const dw = iw * scale, dh = ih * scale;
    const dy = GROUND_Y - dh; // ?ㅼ??쇰맂 諛곌꼍 ?섎떒 = GROUND_Y(諛쒕컩)
    const period = Math.max(dw, 1);
    const s = scrollOffset % period;
    ctx.drawImage(bgImage, 0, 0, iw, ih, -s, dy, dw, dh);
    ctx.drawImage(bgImage, 0, 0, iw, ih, period - s, dy, dw, dh);
  } else {
    ctx.fillStyle = '#16213e';
    ctx.fillRect(0, 0, GW, GH);
  }
}

const TOP_UI_Y = 26;

// 泥대젰 UI: 醫뚯긽??媛먯옄?源 ?뜜 3媛? ?섎굹??媛먯냼. ?곷떒 UI? ?쒕줈 媛?대뜲?뺣젹
function drawHp() {
  ctx.font = '24px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  for (let i = 0; i < hp; i++) {
    ctx.fillText('?뜜', 12 + i * 26, TOP_UI_Y);
  }
  ctx.textBaseline = 'alphabetic';
}

// 寃곗듅源뚯? 嫄곕━: 200m??m. ?곷떒 以묒븰, ?몃옉+寃? 援듭? ?뚮몢由? ?섎닎紐낆“. ?쒓? 1.5諛? ?곷떒 UI? ?쒕줈 媛?대뜲?뺣젹
function drawDistance() {
  const d = Math.max(0, Math.floor(options.clearDistance - scrollOffset / PIXELS_PER_METER));
  const text = d + ' m';
  ctx.font = 'bold 36px ' + FONT_HANGUL;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 4;
  ctx.strokeText(text, GW / 2, TOP_UI_Y);
  ctx.fillStyle = '#ffeb00';
  ctx.fillText(text, GW / 2, TOP_UI_Y);
}

// ?꾪솚/??깂 ?덊듃: ???곗?硫댁꽌 蹂꾩“媛? ex.scale ?덉쑝硫??ш쾶 (??깂=2)
function drawExplosion(ex) {
  const s = ex.scale || 1;
  const t = ex.frame / ex.maxFrames;
  const aBase = 1 - t;
  const twinkle = 0.55 + 0.45 * Math.sin(ex.frame * 0.8);

  // 0) ?? 珥덈컲 2?꾨젅??媛뺥븳 ?곗깋 ?뚮옒??(?곗????쒓컙)
  if (ex.frame < 2) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.98)';
    ctx.fillRect(ex.x - 8 * s, ex.y - 8 * s, 16 * s, 16 * s);
  }

  // 1) LED 肄붿뼱: ???ш쾶 (9x9, 5x5)
  const coreA = aBase * twinkle;
  ctx.fillStyle = 'rgba(255, 255, 255, ' + coreA + ')';
  ctx.fillRect(ex.x - 4 * s, ex.y - 4 * s, 9 * s, 9 * s);
  ctx.fillStyle = 'rgba(255, 200, 220, ' + (coreA * 0.8) + ')';
  ctx.fillRect(ex.x - 2 * s, ex.y - 2 * s, 5 * s, 5 * s);

  // 2) 蹂꾩“媛? 4諛⑺뼢 蹂?紐⑥뼇 ?뚰렪, 吏꾪솉/?뱀깋, 留롮씠쨌硫由?肉뚮━湲?  const N = 24;
  const seed = (ex.x * 0.02 + ex.y * 0.02) % 1;
  const R = 5 * s, r = 2.5 * s;
  const c = 0.707;
  for (let i = 0; i < N; i++) {
    const angle = (i / N) * Math.PI * 2 + seed * 6.28;
    const dist = (ex.frame * 5 + (i % 5) * 2.5) * s;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist;
    const dotTwinkle = 0.85 + 0.15 * Math.sin(ex.frame * 0.6 + i * 0.5);
    const dotA = aBase * dotTwinkle;
    const isCrimson = (i % 2 === 0);

    ctx.save();
    ctx.translate(ex.x + dx, ex.y + dy);
    ctx.rotate(angle);
    ctx.fillStyle = isCrimson
      ? 'rgba(220, 40, 70, ' + dotA + ')'
      : 'rgba(50, 230, 100, ' + dotA + ')';
    ctx.beginPath();
    ctx.moveTo(0, -R);
    ctx.lineTo(r * c, -r * c);
    ctx.lineTo(R, 0);
    ctx.lineTo(r * c, r * c);
    ctx.lineTo(0, R);
    ctx.lineTo(-r * c, r * c);
    ctx.lineTo(-R, 0);
    ctx.lineTo(-r * c, -r * c);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

// ?ㅽ뀒?댁??대━???꾩슜 ??＝: 洹밸챸??諛앹? burst (drawExplosion ?ы솢??????
function drawClearFirework(fw) {
  const t = fw.frame / fw.maxFrames;
  const a = 1 - t;
  if (fw.frame < 2) {
    ctx.fillStyle = 'rgba(255,255,255,0.98)';
    ctx.beginPath();
    ctx.arc(fw.x, fw.y, 14, 0, Math.PI * 2);
    ctx.fill();
  }
  const R = 6 + fw.frame * 2.2;
  const N = 16;
  const colors = ['rgba(255,255,255,', 'rgba(255,255,255,', 'rgba(255,255,240,', 'rgba(255,240,255,'];
  for (let i = 0; i < N; i++) {
    const angle = (i / N) * Math.PI * 2 + fw.seed;
    const dx = Math.cos(angle) * R;
    const dy = Math.sin(angle) * R;
    const c = colors[i % 4];
    ctx.fillStyle = c + (a * 0.98).toFixed(2) + ')';
    ctx.fillRect(fw.x + dx - 2, fw.y + dy - 2, 4, 4);
  }
  ctx.fillStyle = 'rgba(255,255,255,' + (a * 0.95).toFixed(2) + ')';
  ctx.beginPath();
  ctx.arc(fw.x, fw.y, 4, 0, Math.PI * 2);
  ctx.fill();
}

// ?뚯떇 ??뙆쨌??깂 ?곗쭚: ??諛섏쭩?닿쾶 蹂?뺥븳 ??＝ (ex: {x,y,frame,maxFrames,scale,emoji})
function drawSparklyFirework(ex) {
  // ??컻 ?대え吏媛 ?덉쑝硫??대え吏濡??쒖떆
  if (ex.emoji) {
    const t = ex.frame / ex.maxFrames;
    const scale = 1 + (1 - t) * 0.5; // ?먯젏 而ㅼ??ㅺ? ?щ씪吏?    const alpha = 1 - t;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = (32 * scale) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(ex.emoji, ex.x, ex.y);
    ctx.restore();
    return;
  }

  const s = ex.scale || 1;
  const t = ex.frame / ex.maxFrames;
  const a = 1 - t;
  const seed = ((ex.x * 0.02 + ex.y * 0.02) % 1) * 6.28;
  if (ex.frame < 2) {
    ctx.fillStyle = 'rgba(255,255,255,0.98)';
    ctx.beginPath();
    ctx.arc(ex.x, ex.y, 12 * s, 0, Math.PI * 2);
    ctx.fill();
  }
  const R = (5 + ex.frame * 2) * s;
  const N = 20;
  const colors = ['rgba(255,255,255,', 'rgba(255,255,240,', 'rgba(255,240,255,', 'rgba(240,255,255,'];
  for (let i = 0; i < N; i++) {
    const tw = 0.88 + 0.24 * Math.sin(ex.frame * 1.3 + i * 0.6);
    const angle = (i / N) * Math.PI * 2 + seed;
    const dx = Math.cos(angle) * R;
    const dy = Math.sin(angle) * R;
    const c = colors[i % 4];
    ctx.fillStyle = c + (Math.min(1, a * tw * 0.98)).toFixed(2) + ')';
    const sz = Math.max(2, 3 * s);
    ctx.fillRect(ex.x + dx - sz / 2, ex.y + dy - sz / 2, sz, sz);
  }
  const coreTw = 0.9 + 0.2 * Math.sin(ex.frame * 1.1);
  ctx.fillStyle = 'rgba(255,255,255,' + (Math.min(1, a * coreTw * 0.95)).toFixed(2) + ')';
  ctx.beginPath();
  ctx.arc(ex.x, ex.y, 4 * s, 0, Math.PI * 2);
  ctx.fill();
}

// Stage 1 Clear: "Stage 1 Clear" ?띿뒪???붾㈃ ?? + 洹밸챸??諛앹? ??＝. 5珥?????댄? 蹂듦? (MP4 ?쒓굅)
function drawStage1Clear() {
  ctx.clearRect(0, 0, GW, GH);
  stage1ClearFrames++;
  drawBackground();
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(0, 0, GW, GH);
  if (stage1ClearFrames % 2 === 0) {
    clearFireworks.push({
      x: GW / 2 + (Math.random() - 0.5) * 220,
      y: GH / 2 + (Math.random() - 0.5) * 180,
      frame: 0,
      maxFrames: 32,
      seed: Math.random() * 6.28
    });
  }
  for (let i = clearFireworks.length - 1; i >= 0; i--) {
    clearFireworks[i].frame++;
    if (clearFireworks[i].frame >= clearFireworks[i].maxFrames) clearFireworks.splice(i, 1);
  }
  clearFireworks.forEach(drawClearFirework);
  // ?고듃: ?붾㈃ ?덉뿉 紐⑤몢 ?쒖떆 (measureText濡?fit)
  const str = 'Stage 1 Clear';
  let fs = 52;
  for (; fs >= 24; fs -= 2) {
    ctx.font = 'bold ' + fs + 'px sans-serif';
    if (ctx.measureText(str).width <= GW - 32) break;
  }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = Math.max(2, Math.floor(fs / 12));
  ctx.strokeText(str, GW / 2, GH / 2);
  ctx.fillStyle = '#ffeb00';
  ctx.fillText(str, GW / 2, GH / 2);

  // 1?ㅽ뀒?댁? ?대━???대?吏 洹몃━湲?  if (stage1ClearReady) {
    const iw = stage1ClearImage.naturalWidth;
    const ih = stage1ClearImage.naturalHeight;
    // ?붾㈃ ?덈퉬??留욎땄 (鍮꾩쑉 ?좎?)
    const scale = GW / iw;
    const dh = ih * scale;
    const dy = GH / 2 - dh / 2 - 50; // 以묒븰蹂대떎 ?쎄컙 ??    ctx.drawImage(stage1ClearImage, 0, 0, iw, ih, 0, dy, GW, dh);
  }

  // ?띿뒪?? "Let's go to next stage!!"
  ctx.font = 'bold 24px "Courier New", monospace';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 3;

  // 源쒕묀???④낵
  if (Math.floor(Date.now() / 500) % 2 === 0) {
    ctx.strokeText("Let's go to next stage!!", GW / 2, GH - 100);
    ctx.fillText("Let's go to next stage!!", GW / 2, GH - 100);
  }

  ctx.font = '16px "Courier New", monospace';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.strokeText("Press Enter or Click", GW / 2, GH - 60);
  ctx.fillText("Press Enter or Click", GW / 2, GH - 60);

  // ?먮룞 ??댄? 蹂듦? ?쒓굅 (?ъ슜???낅젰 ?湲?
}

// ?꾧컧 ?붾㈃ 洹몃━湲?// let selectedFoodIndex = 0; // Moved to top
let collectionScrollOffset = 0; // ?뚯떇 洹몃━???ㅽ겕濡??ㅽ봽??let isDraggingCollection = false; // ?쒕옒洹?以??щ?
let dragStartX = 0; // ?쒕옒洹??쒖옉 x 醫뚰몴
let dragStartScrollOffset = 0; // ?쒕옒洹??쒖옉 ???ㅽ겕濡??ㅽ봽??let foodShakeFrame = 0; // ?뚯떇 洹몃┝ ?붾뱾由??꾨젅??移댁슫??let foodShakeOffset = 0; // ?뚯떇 洹몃┝ ?붾뱾由??ㅽ봽??(x 醫뚰몴)
const FOOD_SHAKE_DURATION = 20; // ?붾뱾由?吏???쒓컙 (?꾨젅??
const FOOD_SHAKE_INTENSITY = 8; // ?붾뱾由?媛뺣룄 (?쎌?)

// ?꾧컧 ?붾㈃ 珥덇린?????ㅽ겕濡?由ъ뀑
function resetCollectionScroll() {
  collectionScrollOffset = 0;
  selectedFoodIndex = 0;
  foodShakeFrame = 0;
  foodShakeOffset = 0;
}

// ?꾧컧 ??ぉ (?꾩옱 5媛?+ 援ы쁽 ?덉젙 5媛?
// COLLECTION_ITEMS moved to config.js
// const COLLECTION_ITEMS = [ ... ];

function drawCollection() {
  ctx.clearRect(0, 0, GW, GH);

  // 諛곌꼍
  ctx.fillStyle = '#16213e';
  ctx.fillRect(0, 0, GW, GH);

  // ?곷떒 ?ㅻ뜑
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 36px ' + FONT_HANGUL;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 4;
  ctx.strokeText('?꾧컧', GW / 2, 40);
  ctx.fillText('?꾧컧', GW / 2, 40);

  // ?ㅻ줈 媛湲?踰꾪듉
  ctx.fillStyle = '#e94560';
  if (typeof ctx.roundRect === 'function') {
    ctx.beginPath();
    ctx.roundRect(20, 20, 60, 40, 8);
    ctx.fill();
  } else {
    ctx.fillRect(20, 20, 60, 40);
  }
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 20px ' + FONT_HANGUL;
  ctx.textAlign = 'center';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.strokeText('??, 50, 40);
  ctx.fillText('??, 50, 40);

  // ?뚯떇 洹몃━??(10媛? ?ㅽ겕濡?媛??
  const cardSize = 60;
  const cardSpacing = 15;
  const startX = 30;
  const gridY = 100;
  const gridHeight = cardSize + 20; // 洹몃━???곸뿭 ?믪씠
  const totalWidth = COLLECTION_ITEMS.length * (cardSize + cardSpacing) - cardSpacing;
  const visibleWidth = GW - startX * 2;

  // ?ㅽ겕濡?踰붿쐞 ?쒗븳
  const maxScroll = Math.max(0, totalWidth - visibleWidth);
  collectionScrollOffset = Math.max(0, Math.min(maxScroll, collectionScrollOffset));

  // ?좏깮????ぉ???붾㈃??蹂댁씠?꾨줉 ?ㅽ겕濡?議곗젙
  const selectedCardX = selectedFoodIndex * (cardSize + cardSpacing);
  const selectedCardRight = selectedCardX + cardSize;
  const visibleLeft = collectionScrollOffset;
  const visibleRight = collectionScrollOffset + visibleWidth;

  if (selectedCardX < visibleLeft) {
    collectionScrollOffset = selectedCardX;
  } else if (selectedCardRight > visibleRight) {
    collectionScrollOffset = selectedCardRight - visibleWidth;
  }

  // 洹몃━???곸뿭 ?대━??  ctx.save();
  ctx.beginPath();
  ctx.rect(startX, gridY - 10, visibleWidth, gridHeight);
  ctx.clip();

  COLLECTION_ITEMS.forEach((item, index) => {
    const cardX = startX + index * (cardSize + cardSpacing) - collectionScrollOffset;
    const isSelected = index === selectedFoodIndex;

    // ?붾㈃ 諛뽰씠硫?洹몃━吏 ?딆쓬
    if (cardX + cardSize < startX || cardX > startX + visibleWidth) return;

    let isDiscovered = false;
    if (item.type === 'food') {
      const foodData = collectionData[item.emoji];
      isDiscovered = foodData && foodData.discovered;
    } else {
      // ?뚮젅?댁뒪??붾뒗 ??긽 誘몃컻寃??곹깭
      isDiscovered = false;
    }

    // 移대뱶 諛곌꼍
    if (isDiscovered) {
      ctx.fillStyle = isSelected ? 'rgba(57, 255, 20, 0.3)' : 'rgba(255, 255, 255, 0.1)';
    } else {
      ctx.fillStyle = 'rgba(100, 100, 100, 0.2)';
    }
    if (typeof ctx.roundRect === 'function') {
      ctx.beginPath();
      ctx.roundRect(cardX, gridY, cardSize, cardSize, 8);
      ctx.fill();
    } else {
      ctx.fillRect(cardX, gridY, cardSize, cardSize);
    }

    // 移대뱶 ?뚮몢由?    ctx.strokeStyle = isDiscovered
      ? (isSelected ? '#39ff14' : 'rgba(255, 255, 255, 0.5)')
      : '#666666';
    ctx.lineWidth = isSelected ? 3 : 2;
    if (typeof ctx.roundRect === 'function') {
      ctx.beginPath();
      ctx.roundRect(cardX, gridY, cardSize, cardSize, 8);
      ctx.stroke();
    } else {
      ctx.strokeRect(cardX, gridY, cardSize, cardSize);
    }

    // ?뚯떇 ?대え吏 ?먮뒗 臾쇱쓬??    ctx.font = '40px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (item.type === 'food' && isDiscovered) {
      ctx.fillStyle = '#fff';
      ctx.fillText(item.emoji, cardX + cardSize / 2, gridY + cardSize / 2);
    } else {
      // ?뚮젅?댁뒪????먮뒗 誘몃컻寃??뚯떇
      ctx.font = 'bold 40px sans-serif';
      ctx.fillStyle = '#999999';
      ctx.fillText('?', cardX + cardSize / 2, gridY + cardSize / 2);
    }
  });

  ctx.restore();

  // ?좏깮???뚯떇 ?곸꽭 ?뺣낫 ?⑤꼸
  const selectedItem = COLLECTION_ITEMS[selectedFoodIndex];
  let selectedEmoji = null;
  let foodInfo = null;
  let foodData = null;
  let isDiscovered = false;

  if (selectedItem.type === 'food') {
    selectedEmoji = selectedItem.emoji;
    foodInfo = FOOD_COLLECTION_DATA[selectedEmoji];
    foodData = collectionData[selectedEmoji];
    isDiscovered = foodData && foodData.discovered;
  }

  const panelY = 200;
  const panelH = GH - panelY - 20;

  // ?⑤꼸 諛곌꼍
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(20, panelY, GW - 40, panelH);

  if (selectedItem.type === 'food' && isDiscovered && foodInfo) {
    // ?뚯떇 ?대え吏 (???ш린) - ?붾뱾由??④낵 ?곸슜
    ctx.font = '64px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    ctx.fillText(selectedEmoji, GW / 2 + foodShakeOffset, panelY + 50);

    // ?대쫫
    ctx.font = 'bold 28px ' + FONT_HANGUL;
    ctx.fillText(foodInfo.name, GW / 2, panelY + 120);
    ctx.font = '20px sans-serif';
    ctx.fillStyle = '#cccccc';
    ctx.fillText(foodInfo.nameEn, GW / 2, panelY + 150);

    // 遺???잛닔
    ctx.font = 'bold 32px ' + FONT_HANGUL;
    ctx.fillStyle = '#39ff14';
    ctx.fillText('遺???잛닔: ' + (foodData.count || 0) + '??, GW / 2, panelY + 200);

    // 泥섏쓬 諛쒓껄
    if (foodData.firstFound) {
      const firstDate = new Date(foodData.firstFound);
      const dateStr = firstDate.toLocaleDateString('ko-KR') + ' ' +
        firstDate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
      ctx.font = '18px ' + FONT_HANGUL;
      ctx.fillStyle = '#cccccc';
      ctx.fillText('泥섏쓬 諛쒓껄: ' + dateStr, GW / 2, panelY + 240);
    }

    // 留덉?留?諛쒓껄
    if (foodData.lastFound) {
      const lastDate = new Date(foodData.lastFound);
      const dateStr = lastDate.toLocaleDateString('ko-KR') + ' ' +
        lastDate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
      ctx.font = '18px ' + FONT_HANGUL;
      ctx.fillStyle = '#cccccc';
      ctx.fillText('留덉?留?諛쒓껄: ' + dateStr, GW / 2, panelY + 270);
    }

    // ?ㅻ챸
    ctx.font = '18px ' + FONT_HANGUL;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    const descY = panelY + 310;
    const descLines = wrapText(ctx, foodInfo.description, GW - 80, 18);
    descLines.forEach((line, i) => {
      ctx.fillText(line, 40, descY + i * 25);
    });
  } else if (selectedItem.type === 'food') {
    // 誘몃컻寃??뚯떇 ?곹깭
    ctx.font = 'bold 24px ' + FONT_HANGUL;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#999999';
    ctx.fillText('?꾩쭅 諛쒓껄?섏? 紐삵븳 ?뚯떇?낅땲??', GW / 2, panelY + panelH / 2);
    ctx.font = '18px ' + FONT_HANGUL;
    ctx.fillText('寃뚯엫???뚮젅?댄븯???뚯떇??諛쒓껄?섏꽭??', GW / 2, panelY + panelH / 2 + 40);
  } else {
    // ?뚮젅?댁뒪???(援ы쁽 ?덉젙)
    ctx.font = 'bold 24px ' + FONT_HANGUL;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#999999';
    ctx.fillText('援ы쁽 ?덉젙', GW / 2, panelY + panelH / 2);
    ctx.font = '18px ' + FONT_HANGUL;
    ctx.fillText('怨?異붽????덉젙?낅땲??', GW / 2, panelY + panelH / 2 + 40);
  }

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}

// ??궧 ?낅젰 ?붾㈃ 洹몃━湲?(80?꾨? ?ㅻ씫???ㅽ???
// ??궧 ?낅젰 ?붾㈃ 洹몃━湲?(80?꾨? ?ㅻ씫???ㅽ???
// UI Functions are now in ui.js
// drawInputRanking, drawOptions, drawRankingBoard, wrapText, drawCollectionButton, drawOptionsButton
function drawReloadUI() {
  if (reloadCooldown <= 0) return; // ?ъ옣??以묒씠 ?꾨땲硫??쒖떆?섏? ?딆쓬

  const reloadX = GIRL_X + GIRL_W / 2; // 罹먮┃??以묒븰
  const reloadY = girlY + GIRL_OFFSET_Y - 15; // 癒몃━ 諛붾줈 ??  const reloadSize = 20; // ?묒? ?ш린

  // ?ъ옣??吏꾪뻾??(0.0 ~ 1.0)
  const progress = 1 - (reloadCooldown / RELOAD_COOLDOWN_DURATION);

  // ?먰삎 諛곌꼍
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.beginPath();
  ctx.arc(reloadX, reloadY, reloadSize / 2, 0, Math.PI * 2);
  ctx.fill();

  // ?ъ옣??吏꾪뻾 ?먰샇 (?쒓퀎諛⑺뼢?쇰줈 梨꾩썙吏?
  ctx.strokeStyle = '#39ff14'; // ?꾧킅?쇱엫 ?뱀깋
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  // ?쒓퀎諛⑺뼢: -90?????먯꽌 ?쒖옉?섏뿬 ?쒓퀎諛⑺뼢?쇰줈 吏꾪뻾
  ctx.arc(reloadX, reloadY, reloadSize / 2 - 2, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
  ctx.stroke();

  // 以묒븰 ?묒? ??  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(reloadX, reloadY, 3, 0, Math.PI * 2);
  ctx.fill();
}

// AABB 異⑸룎
function collides(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function startPlay() {
  state = 'playing';
  if (bgmTitle) { bgmTitle.pause(); bgmTitle.currentTime = 0; }
  if (bgmStage && options.bgmEnabled) { bgmStage.currentTime = 0; bgmStage.play().catch(function () { }); }
  girlY = GROUND_Y - GIRL_H;
  vy = 0;
  shootActive = false;
  shootFrameCount = 0;
  reloadCooldown = 0;
  bombActive = false;
  bombFrameCount = 0;
  slideActive = false;
  slideFrames = 0;
  slideFrameCount = 0;
  slideStartFrame = 0;
  slideLoopCompleted = false;
  foods = [];
  bullets = [];
  bombs = [];
  explosions = [];
  scrollOffset = 0;
  score = 0;
  nextSpawn = 60;
  frameCount = 0;
  hp = 3;
  pauseFramesLeft = 0;
  deathFallFrames = 0;
  deathFallOffsetY = 0;
  isPaused = false;
  airJumpUsed = false;
}

// ??깂 ?섏?湲?(留덉슦???고겢由?: ?щЪ?? ?뮗. ?곗?湲??꾧퉴吏 ?ㅼ쓬 ??깂 遺덇?
function addBomb() {
  if (state !== 'playing' || pauseFramesLeft > 0 || isPaused || deathFallFrames > 0) return;
  if (bombs.length > 0) return; // ?섏쭊 ??깂???곗쭏 ?뚭퉴吏 ?湲?  if (bombActive) return; // ?좊땲硫붿씠??吏꾪뻾 以묒씠硫??湲?  // ?щ씪?대뵫 以묒씠硫??щ씪?대뵫 痍⑥냼
  if (slideActive) {
    slideActive = false;
    slideFrames = 0;
    slideFrameCount = 0;
    slideLoopCompleted = false;
  }
  playSfx(sfxBombFlying);
  // ??깂 ?섏?湲??좊땲硫붿씠???쒖옉 諛?利됱떆 ??깂 ?앹꽦
  bombActive = true;
  bombFrameCount = 0;
  // 利됱떆 ??깂 ?앹꽦 (吏???놁쓬)
  bombs.push({
    x: GIRL_X + GIRL_W,
    y: girlY + GIRL_OFFSET_Y + GIRL_H / 2 - BOMB_H / 2,
    vx: BOMB_VX,
    vy: BOMB_VY,
    w: BOMB_W,
    h: BOMB_H
  });
}

// 珥앹븣 諛쒖궗 (shoot.mp4 ?곗텧)
function addBullet() {
  if (state !== 'playing' || pauseFramesLeft > 0 || isPaused || deathFallFrames > 0) return;
  if (shootActive) return; // ?대? 諛쒖궗 ?곗텧 以묒씠硫??곗텧留?異붽??섏? ?딆쓬
  if (reloadCooldown > 0) return; // ?ъ옣??荑⑦???以묒씠硫?諛쒖궗 遺덇?
  // ?щ씪?대뵫 以묒씠硫??щ씪?대뵫 痍⑥냼
  if (slideActive) {
    slideActive = false;
    slideFrames = 0;
    slideFrameCount = 0;
    slideLoopCompleted = false;
  }
  playSfx(sfxGunshot);
  bullets.push({
    x: GIRL_X + GIRL_W,
    y: girlY + GIRL_OFFSET_Y + GIRL_H / 2 - BULLET_H / 2,
    w: BULLET_W,
    h: BULLET_H
  });
  if (!shootActive) {
    shootActive = true;
    shootFrameCount = 0;
  }
  ctx.arc(reloadX, reloadY, 3, 0, Math.PI * 2);
  ctx.fill();
}

// 異쒖꽍蹂댁긽 踰꾪듉 洹몃━湲?(?쒕쪟 紐⑥뼇 ?꾩씠肄?
function drawAttendanceButton() {
  // 諛곌꼍 ?먰삎 踰꾪듉
  ctx.fillStyle = 'rgba(255, 152, 0, 0.8)'; // 二쇳솴??  ctx.beginPath();
  ctx.arc(ATTENDANCE_BTN.x + ATTENDANCE_BTN.w / 2, ATTENDANCE_BTN.y + ATTENDANCE_BTN.h / 2, ATTENDANCE_BTN.w / 2, 0, Math.PI * 2);
  ctx.fill();

  // ?뚮몢由?  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.stroke();

  // ?쒕쪟 ?꾩씠肄?  ctx.font = '32px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fff';
  ctx.fillText('?뱞', ATTENDANCE_BTN.x + ATTENDANCE_BTN.w / 2, ATTENDANCE_BTN.y + ATTENDANCE_BTN.h / 2);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}

function draw() {
  if (state === 'start') {
    if (!titleBgmTried) {
      titleBgmTried = true;
      if (bgmTitle && options.bgmEnabled) bgmTitle.play().catch(function () { });
    }
    if (titleReady && titleImage.naturalWidth > 0) {
      const iw = titleImage.naturalWidth, ih = titleImage.naturalHeight;
      const scale = Math.max(GW / iw, GH / ih);
      const dw = iw * scale, dh = ih * scale;
      const dx = (GW - dw) / 2, dy = (GH - dh) / 2;
      ctx.drawImage(titleImage, 0, 0, iw, ih, dx, dy, dw, dh);
    } else {
      ctx.fillStyle = '#16213e';
      ctx.fillRect(0, 0, GW, GH);
      ctx.fillStyle = '#f1f1f1';
      ctx.font = 'bold 26px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Jumping Girl', GW / 2, 180);
      ctx.font = '14px sans-serif';
      ctx.fillStyle = '#a0a0a0';
      ctx.fillText('Food Escape', GW / 2, 212);
    }
    // 寃뚯엫 ?쒖옉 踰꾪듉
    ctx.fillStyle = '#5FD9B0'; // 誘쇳듃?뱀깋
    if (typeof ctx.roundRect === 'function') {
      ctx.beginPath();
      ctx.roundRect(BTN.x, BTN.y, BTN.w, BTN.h, 12);
      ctx.fill();
    } else {
      ctx.fillRect(BTN.x, BTN.y, BTN.w, BTN.h);
    }
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px ' + FONT_HANGUL; // 踰꾪듉 ?ш린??留욎떠 ?고듃 異뺤냼 (30 -> 20)
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.strokeText('寃뚯엫 ?쒖옉', BTN.x + BTN.w / 2, BTN.y + BTN.h / 2);
    ctx.fillText('寃뚯엫 ?쒖옉', BTN.x + BTN.w / 2, BTN.y + BTN.h / 2);
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';

    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';

    // 異쒖꽍蹂댁긽 踰꾪듉 (?꾩씠肄?
    drawAttendanceButton();

    // ?꾧컧 踰꾪듉 (醫뚰븯??
    drawCollectionButton();
    // ?듭뀡 踰꾪듉 (?고븯??
    drawOptionsButton();
    return;
  }

  if (state === 'collection') {
    // ?뚯떇 洹몃┝ ?붾뱾由??좊땲硫붿씠???낅뜲?댄듃
    if (foodShakeFrame > 0) {
      foodShakeFrame--;
      // 醫뚯슦 ?붾뱾由??④낵 (?ъ씤???ъ슜)
      const shakeProgress = foodShakeFrame / FOOD_SHAKE_DURATION;
      foodShakeOffset = Math.sin(foodShakeFrame * 0.8) * FOOD_SHAKE_INTENSITY * shakeProgress;
      if (foodShakeFrame === 0) {
        foodShakeOffset = 0;
      }
    }
    drawCollection();
    return;
  }

  if (state === 'options') {
    drawOptions();
    return;
  }

  if (state === 'input_ranking') {
    drawBackground(); // 諛곌꼍??癒쇱? 洹몃젮??寃????꾩쟻 諛⑹?
    drawRankingInput();
    return;
  }

  if (state === 'ranking_board') {
    drawRankingBoard();
    return;
  }

  if (state === 'gameover') {
    drawBackground();
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, GW, GH);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 42px ' + FONT_HANGUL;
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.strokeText('寃뚯엫 ?ㅻ쾭', GW / 2, 220);
    ctx.fillText('寃뚯엫 ?ㅻ쾭', GW / 2, 220);
    ctx.font = 'bold 24px ' + FONT_HANGUL;
    ctx.strokeText('?먯닔: ' + Math.floor(score), GW / 2, 270);
    ctx.fillStyle = '#39ff14';
    ctx.fillText('?먯닔: ' + Math.floor(score), GW / 2, 270);
    // ?ㅼ떆 ?섍린 踰꾪듉
    ctx.fillStyle = '#e94560';
    if (typeof ctx.roundRect === 'function') {
      ctx.beginPath();
      ctx.roundRect(RETRY_BTN.x, RETRY_BTN.y, RETRY_BTN.w, RETRY_BTN.h, 12);
      ctx.fill();
    } else {
      ctx.fillRect(RETRY_BTN.x, RETRY_BTN.y, RETRY_BTN.w, RETRY_BTN.h);
    }
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 27px ' + FONT_HANGUL;
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.strokeText('怨꾩냽?섍린', GW / 2, RETRY_BTN.y + RETRY_BTN.h / 2);
    ctx.fillText('怨꾩냽?섍린', GW / 2, RETRY_BTN.y + RETRY_BTN.h / 2);

    // ??댄?濡??뚯븘媛湲?踰꾪듉
    ctx.fillStyle = '#5FD9B0'; // 誘쇳듃?뱀깋
    if (typeof ctx.roundRect === 'function') {
      ctx.beginPath();
      ctx.roundRect(TITLE_BTN.x, TITLE_BTN.y, TITLE_BTN.w, TITLE_BTN.h, 12);
      ctx.fill();
    } else {
      ctx.fillRect(TITLE_BTN.x, TITLE_BTN.y, TITLE_BTN.w, TITLE_BTN.h);
    }
    ctx.fillStyle = '#fff';
    ctx.strokeText('??댄?濡??뚯븘媛湲?, GW / 2, TITLE_BTN.y + TITLE_BTN.h / 2);
    ctx.fillText('??댄?濡??뚯븘媛湲?, GW / 2, TITLE_BTN.y + TITLE_BTN.h / 2);
    ctx.textBaseline = 'alphabetic';

    // ?꾧컧 踰꾪듉 (醫뚰븯??
    drawCollectionButton();
    // ?듭뀡 踰꾪듉 (?고븯??
    drawOptionsButton();
    return;
  }

  if (state === 'stage1clear') {
    drawStage1Clear();
    return;
  }

  // --- playing ---

  // 3踰덉㎏ ?덊듃 ?? down 2諛곕줈 遺?ㅻ????붾뱾由????꾨줈 ?댁쭩 ?뺢? ?????⑥뼱吏??寃뚯엫?ㅻ쾭 ?곗텧
  if (deathFallFrames > 0) {
    ctx.clearRect(0, 0, GW, GH);
    drawBackground();
    drawDistance();
    if (downImage && downImage.naturalWidth > 0) {
      var gx = GIRL_X, gy = girlY + GIRL_OFFSET_Y;
      // ?щ━湲?洹몃┝怨?媛숈? 鍮꾩쑉濡?異뺤냼 ????諛곕줈 ?뺣? ??10% 異뺤냼 (?먮낯 鍮꾩쑉 ?좎?)
      const runOriginalWidth = 560;
      const scaleRatio = GIRL_W / runOriginalWidth; // ?щ━湲?洹몃┝??異뺤냼 鍮꾩쑉
      // 二쎈뒗 洹몃┝???먮낯 ?ш린瑜?湲곗??쇰줈 媛숈? 鍮꾩쑉 ?곸슜 ????諛? 10% 異뺤냼
      const scaledWidth = downImage.naturalWidth * scaleRatio * 2 * 0.9;
      const scaledHeight = downImage.naturalHeight * scaleRatio * 2 * 0.9;
      // ?щ━湲?二쇱씤怨듦낵 媛숈? ?꾩튂 (以묒븰 ?뺣젹)
      var dx = gx + GIRL_W / 2 - scaledWidth / 2;
      var dyBase = gy + GIRL_H / 2 - scaledHeight / 2;
      var elapsed = 72 - deathFallFrames;
      if (elapsed < 18) {
        var shakeX = (Math.random() - 0.5) * 10, shakeY = (Math.random() - 0.5) * 10;
        ctx.drawImage(downImage, 0, 0, downImage.naturalWidth, downImage.naturalHeight, dx + shakeX, dyBase + shakeY, scaledWidth, scaledHeight);
      } else if (elapsed < 27) {
        deathFallOffsetY = -4 * (elapsed - 18);
        ctx.drawImage(downImage, 0, 0, downImage.naturalWidth, downImage.naturalHeight, dx, dyBase + deathFallOffsetY, scaledWidth, scaledHeight);
      } else {
        deathFallOffsetY = -32 + 10 * (elapsed - 27);
        ctx.drawImage(downImage, 0, 0, downImage.naturalWidth, downImage.naturalHeight, dx, dyBase + deathFallOffsetY, scaledWidth, scaledHeight);
      }
    }
    deathFallFrames--;
    if (deathFallFrames === 0) {
      if (bgmStage) { bgmStage.pause(); bgmStage.currentTime = 0; }

      // ?먯닔 ?뚮줈??泥섎━
      const finalScore = Math.floor(score);

      // 寃뚯엫 ??-> 臾댁“嫄???궧 ?낅젰 ?붾㈃(寃뚯엫?ㅻ쾭 吏곹썑 ?곗텧)?쇰줈 ?대룞
      // ?? ?먯닔 湲곕줉 ?먯껜??湲곗〈 濡쒖쭅???쒖슜?섎릺, ?낅젰? 紐⑤뱺 ?좎??먭쾶 諛쏆쓬(?щ? ?붿냼)
      // ?먮뒗 "?좉린濡??ъ꽦 ?쒖뿉留? ?낅젰 諛쏅뒗寃??꾨땲??"寃뚯엫?ㅻ쾭 ?섎㈃ 利됱떆 ?대땲??3湲?먮? ?덇린???붾㈃???섏삩?????붿껌 泥섎━

      // ?ш린?쒕뒗 "?좉린濡??щ?? ?곴??놁씠" ?대땲???낅젰 ?붾㈃???꾩?
      state = 'input_ranking';
      inputName = '';
      newHighScoreIndex = -1; // ?꾩쭅 ??궧 ?깅줉 ??    }
    return;
  }

  // ?덊듃 ??0.5珥??뺤?: ?낅뜲?댄듃 ?놁씠 洹몃━湲곕쭔
  if (pauseFramesLeft > 0) {
    ctx.clearRect(0, 0, GW, GH);
    drawBackground();
    foods.forEach(drawFood);
    drawGirl();
    bullets.forEach(drawBullet);
    bombs.forEach(drawBomb);
    explosions.forEach(drawSparklyFirework);
    drawDistance();
    ctx.font = 'bold 24px ' + FONT_HANGUL;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.strokeText('?먯닔: ' + Math.floor(score), GW - 12, TOP_UI_Y);
    ctx.fillStyle = '#39ff14';
    ctx.fillText('?먯닔: ' + Math.floor(score), GW - 12, TOP_UI_Y);
    ctx.fillStyle = '#fff';
    drawHp();
    ctx.fillStyle = 'rgba(200,0,0,0.2)';
    ctx.fillRect(0, 0, GW, GH);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Hit!', GW / 2, GH / 2);
    ctx.textAlign = 'left';

    // ?쇨꺽???뚯떇??hitFrames ?낅뜲?댄듃 諛??쒓굅
    for (let i = foods.length - 1; i >= 0; i--) {
      if (foods[i].hitFrames && foods[i].hitFrames > 0) {
        foods[i].hitFrames--;
        if (foods[i].hitFrames <= 0) {
          foods.splice(i, 1);
        }
      }
    }

    pauseFramesLeft--;
    if (pauseFramesLeft === 0 && hp <= 0) {
      shootActive = false;
      shootFrameCount = 0;
      deathFallFrames = 72;
      deathFallOffsetY = 0;
    }
    return;
  }

  // P???쇱떆?뺤?: ?낅뜲?댄듃 ?놁씠 洹몃━湲곕쭔, ?곷떒??Pause
  if (isPaused) {
    ctx.clearRect(0, 0, GW, GH);
    drawBackground();
    foods.forEach(drawFood);
    drawGirl();
    bullets.forEach(drawBullet);
    bombs.forEach(drawBomb);
    explosions.forEach(drawSparklyFirework);
    drawDistance();
    ctx.font = 'bold 24px ' + FONT_HANGUL;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.strokeText('?먯닔: ' + Math.floor(score), GW - 12, TOP_UI_Y);
    ctx.fillStyle = '#39ff14';
    ctx.fillText('?먯닔: ' + Math.floor(score), GW - 12, TOP_UI_Y);
    ctx.fillStyle = '#fff';
    drawHp();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Pause', GW / 2, 36);
    ctx.textAlign = 'left';
    return;
  }

  frameCount++;

  // ?щ씪?대뵫 ?꾨젅??移댁슫???낅뜲?댄듃 諛?諛???怨듦꺽 ?먯젙 泥섎━
  if (slideActive) {
    slideFrames++;
    slideFrameCount++;

    // ?щ씪?대뵫 以?諛???怨듦꺽 ?먯젙?쇰줈 ?뚯떇 ?뚭눼
    // 諛????꾩튂: 罹먮┃???ㅻⅨ履??? 諛??믪씠 (GIRL_H ?섎떒)
    const attackBox = {
      x: GIRL_X + GIRL_W - 15,  // 諛????꾩튂 (?ㅻⅨ履??앹뿉??15px ?덉そ, ?쇱そ?쇰줈 10px ?대룞)
      y: girlY + GIRL_OFFSET_Y + GIRL_H - 20,  // 諛??믪씠
      w: 30,  // 怨듦꺽 ?먯젙 ?덈퉬 (諛????곸뿭)
      h: 20   // 怨듦꺽 ?먯젙 ?믪씠
    };

    // 諛???怨듦꺽 ?먯젙??留욎? ?뚯떇 ?뚭눼 (?섏쨷??紐명넻 異⑸룎 泥댄겕?먯꽌 ?쒖쇅?섍린 ?꾪빐 湲곕줉)
    const destroyedFoodIndices = [];
    for (let fi = foods.length - 1; fi >= 0; fi--) {
      const food = foods[fi];
      const foodHitbox = getFoodHitbox(food);
      if (collides(attackBox, foodHitbox)) {
        // ?꾧컧 ?낅뜲?댄듃
        updateCollection(food.emoji);
        // ?щ씪?대뵫 諛??앹뿉 留욎? ?뚯떇? ??컻 ?대え吏濡??쒖떆
        explosions.push({
          x: food.x + FOOD_W / 2 - 15,  // ?쇱そ?쇰줈 15px ?대룞
          y: food.y + FOOD_H / 2,
          frame: 0,
          maxFrames: EXPLOSION_FRAMES,
          emoji: '?뮙' // ??컻 ?대え吏
        });
        playSfx(sfxBombExplosion);
        destroyedFoodIndices.push(fi);
        foods.splice(fi, 1);
      }
    }

    // ?щ씪?대뵫 ?좊땲硫붿씠??1珥??좎? (60?꾨젅??@ 60fps)
    if (slideFrameCount >= 60) {
      slideActive = false;
      slideFrames = 0;
      slideFrameCount = 0;
      slideLoopCompleted = false;
    }
  }

  // 諛쒖궗 ?꾨젅??移댁슫???낅뜲?댄듃
  if (shootActive) {
    shootFrameCount++;
    if (shootFrameCount >= SHOOT_DURATION) {
      shootActive = false;
      shootFrameCount = 0;
    }
  }

  // ??깂 ?섏?湲??꾨젅??移댁슫???낅뜲?댄듃
  if (bombActive) {
    bombFrameCount++;
    if (bombFrameCount >= BOMB_DURATION) {
      bombActive = false;
      bombFrameCount = 0;
    }
  }

  // ?ъ옣??荑⑦????낅뜲?댄듃
  if (reloadCooldown > 0) {
    const wasReloading = reloadCooldown > 0;
    reloadCooldown--;
    // ?ъ옣???꾨즺 ???뚮━ ?ъ깮 (荑⑦??꾩씠 0???섎뒗 ?쒓컙)
    if (wasReloading && reloadCooldown === 0) {
      playSfx(sfxReload);
    }
  }

  // ?붿긽 諛⑹?: 留??꾨젅??罹붾쾭???꾩껜 ?대━?????ш렇由ш린
  ctx.clearRect(0, 0, GW, GH);

  // 諛곌꼍 ?ㅽ겕濡?  scrollOffset += BG_SPEED;
  score = scrollOffset;
  const d = Math.max(0, Math.floor(options.clearDistance - scrollOffset / PIXELS_PER_METER));
  if (d <= 0) {
    scrollOffset = options.clearDistance * PIXELS_PER_METER;
    state = 'stage1clear';
    stage1ClearFrames = 0;
    clearFireworks = [];
    return;
  }
  drawBackground();

  // 以묐젰쨌?먰봽 (?щ씪?대뵫 以묒뿉??以묐젰 ?곸슜 ????
  if (!slideActive) {
    vy += GRAVITY;
    girlY += vy;
    if (girlY >= GROUND_Y - GIRL_H) {
      girlY = GROUND_Y - GIRL_H;
      vy = 0;
      airJumpUsed = false;
    }
  }

  // ?뚯떇 ?ㅽ룿: ?ㅻⅨ履??앹뿉??  nextSpawn--;
  if (nextSpawn <= 0) {
    foods.push({
      x: GW,
      y: FOOD_SPAWN_YS[Math.floor(Math.random() * FOOD_SPAWN_YS.length)],
      w: FOOD_W,
      h: FOOD_H,
      emoji: FOODS[Math.floor(Math.random() * FOODS.length)]
    });
    nextSpawn = 50 + Math.floor(Math.random() * 60);
  }

  // ?뚯떇 ?대룞 (?쇱そ?쇰줈)
  for (let i = foods.length - 1; i >= 0; i--) {
    foods[i].x -= FOOD_SPEED;
    if (foods[i].x + foods[i].w < 0) foods.splice(i, 1);
  }

  // 珥앹븣?볦쓬??異⑸룎: 蹂???＝ ?앹꽦, 留욎? ?뚯떇쨌珥앹븣 ?쒓굅 (遺?쒖쭚)
  for (let bi = bullets.length - 1; bi >= 0; bi--) {
    for (let fi = foods.length - 1; fi >= 0; fi--) {
      const foodHitbox = getFoodHitbox(foods[fi]);
      if (collides(bullets[bi], foodHitbox)) {
        // ?꾧컧 ?낅뜲?댄듃
        updateCollection(foods[fi].emoji);
        explosions.push({
          x: foods[fi].x + FOOD_W / 2,
          y: foods[fi].y + FOOD_H / 2,
          frame: 0,
          maxFrames: EXPLOSION_FRAMES
        });
        bullets.splice(bi, 1);
        foods.splice(fi, 1);
        break;
      }
    }
  }

  // 珥앹븣 ?대룞 (?곗륫?쇰줈) 諛??붾㈃ 諛??쒓굅
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].x += BULLET_SPEED;
    if (bullets[i].x > GW) bullets.splice(i, 1);
  }

  // ??깂: ?щЪ??臾쇰━ ???뚯떇 異⑸룎(?ш쾶 ??컻) / ??GROUND_Y) 異⑸룎(?ш쾶 ??컻) / ?붾㈃ 諛??쒓굅
  for (let i = bombs.length - 1; i >= 0; i--) {
    const b = bombs[i];
    b.vy += GRAVITY;
    b.y += b.vy;
    b.x += b.vx;
  }
  for (let bi = bombs.length - 1; bi >= 0; bi--) {
    const b = bombs[bi];
    for (let fi = foods.length - 1; fi >= 0; fi--) {
      const foodHitbox = getFoodHitbox(foods[fi]);
      if (collides(b, foodHitbox)) {
        // ?꾧컧 ?낅뜲?댄듃
        updateCollection(foods[fi].emoji);
        explosions.push({ x: foods[fi].x + FOOD_W / 2, y: foods[fi].y + FOOD_H / 2, frame: 0, maxFrames: EXPLOSION_FRAMES, scale: 2 });
        playSfx(sfxBombExplosion);
        bombs.splice(bi, 1);
        foods.splice(fi, 1);
        break;
      }
    }
  }
  for (let i = bombs.length - 1; i >= 0; i--) {
    const b = bombs[i];
    if (b.y + b.h >= GROUND_Y) {
      explosions.push({ x: b.x + b.w / 2, y: GROUND_Y - BOMB_H / 2, frame: 0, maxFrames: EXPLOSION_FRAMES, scale: 2 });
      playSfx(sfxBombExplosion);
      bombs.splice(i, 1);
    } else if (b.x > GW || b.x + b.w < 0) {
      bombs.splice(i, 1);
    }
  }

  // ??＝ ?꾨젅??吏꾪뻾 諛?留뚮즺 ?쒓굅
  for (let i = explosions.length - 1; i >= 0; i--) {
    explosions[i].frame++;
    if (explosions[i].frame >= explosions[i].maxFrames) explosions.splice(i, 1);
  }

  // 洹몃━湲? ?뚯떇 -> ?뚮? -> 珥앹븣 -> ??깂 -> ??＝
  foods.forEach(drawFood);
  drawGirl();
  drawReloadUI(); // ?ъ옣??UI
  bullets.forEach(drawBullet);
  bombs.forEach(drawBomb);
  explosions.forEach(drawSparklyFirework);

  // 寃곗듅源뚯? 嫄곕━ (?곷떒 以묒븰) + ?먯닔(?꾧킅?뱀깋+寃?뺥뀒?먮━) + 泥대젰. ???붿냼 ?쒕줈 媛?대뜲?뺣젹
  drawDistance();
  ctx.font = 'bold 24px ' + FONT_HANGUL;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 4;
  ctx.strokeText('?먯닔: ' + Math.floor(score), GW - 12, TOP_UI_Y);
  ctx.fillStyle = '#39ff14';
  ctx.fillText('?먯닔: ' + Math.floor(score), GW - 12, TOP_UI_Y);
  ctx.fillStyle = '#fff';
  drawHp();

  // 異쒖꽍蹂댁긽 踰꾪듉 (?곗륫 ?곷떒 ?꾩씠肄?
  drawAttendanceButton();
  // ?꾧컧 踰꾪듉 (醫뚰븯?? - ?뚮젅??以묒뿉???묎렐 媛??  drawCollectionButton();
  // ?듭뀡 踰꾪듉 (?고븯?? - ?뚮젅??以묒뿉???묎렐 媛??  drawOptionsButton();

  // 二쇱씤怨듈볦쓬??異⑸룎: ?뚯떇 ?쒓굅, 泥대젰 -1, 0.5珥??뺤?. 泥대젰 0?대㈃ ?뺤? ??寃뚯엫?ㅻ쾭
  // ?щ씪?대뵫 以묒뿉??紐명넻? ?쇨꺽諛쏆?留? 諛???怨듦꺽 ?먯젙 ?곸뿭? ?쒖쇅
  if (slideActive) {
    // ?щ씪?대뵫 以? 癒몃━ 異⑸룎 諛뺤뒪 + 紐명넻 異⑸룎 諛뺤뒪 (諛???怨듦꺽 ?먯젙 ?곸뿭 ?쒖쇅)
    const attackBox = {
      x: GIRL_X + GIRL_W - 15,  // 諛????꾩튂 (?ㅻⅨ履??앹뿉??15px ?덉そ, ?쇱そ?쇰줈 10px ?대룞)
      y: girlY + GIRL_OFFSET_Y + GIRL_H - 20,
      w: 30,
      h: 20
    };
    // 癒몃━ 異⑸룎 諛뺤뒪 (?곷떒 30%)
    const headBoxH = GIRL_H * 0.3;
    const headBox = { x: GIRL_X, y: girlY + GIRL_OFFSET_Y, w: GIRL_W, h: headBoxH };
    // 紐명넻 異⑸룎 諛뺤뒪 (以묎컙 50%)
    const girlBoxH = GIRL_H * 0.5;
    const girlBoxY = girlY + GIRL_OFFSET_Y + GIRL_H * 0.5;
    const girlBox = { x: GIRL_X, y: girlBoxY, w: GIRL_W, h: girlBoxH };

    for (let i = 0; i < foods.length; i++) {
      const food = foods[i];
      const foodHitbox = getFoodHitbox(food);
      // 癒몃━ 遺遺?異⑸룎 泥댄겕 (諛???怨듦꺽 ?먯젙 ?곸뿭 ?쒖쇅)
      if (collides(headBox, foodHitbox) && !collides(attackBox, foodHitbox)) {
        // ?뚯떇??利됱떆 ?쒓굅?섏? ?딄퀬 ?쇨꺽 ?쒖떆
        foods[i].hitFrames = HIT_PAUSE_FRAMES;
        hp--;
        if (hp <= 0) playSfx(sfxGirlDown); else playSfx(sfxGirlHurt);
        pauseFramesLeft = HIT_PAUSE_FRAMES;
        // ?쇨꺽 ???좊땲硫붿씠??罹붿뒳 (以묒꺽 諛⑹?)
        shootActive = false;
        bombActive = false;
        slideActive = false;
        break; // for food loops
      }
      // 紐명넻 異⑸룎 泥댄겕 (諛???怨듦꺽 ?먯젙 ?곸뿭 ?쒖쇅)
      if (collides(girlBox, foodHitbox) && !collides(attackBox, foodHitbox)) {
        // ?뚯떇??利됱떆 ?쒓굅?섏? ?딄퀬 ?쇨꺽 ?쒖떆
        foods[i].hitFrames = HIT_PAUSE_FRAMES;
        hp--;
        if (hp <= 0) playSfx(sfxGirlDown); else playSfx(sfxGirlHurt);
        pauseFramesLeft = HIT_PAUSE_FRAMES;
        // ?쇨꺽 ???좊땲硫붿씠??罹붿뒳 (以묒꺽 諛⑹?)
        shootActive = false;
        bombActive = false;
        slideActive = false;
        break; // for food loops
      }
    }
  } else {
    // ?쇰컲 ?곹깭: ?꾩껜 紐명넻 異⑸룎 泥댄겕 (?먯젙 諛뺤뒪瑜??덈퉬 60%, ?믪씠 90%濡??섏젙)
    const shrinkW = 0.6; // ?덈퉬 60%
    const shrinkH = 0.9; // ?믪씠 90% (癒몃━履??먯젙 ?뺣낫)
    const w = GIRL_W * shrinkW;
    const h = GIRL_H * shrinkH;
    const offsetX = (GIRL_W - w) / 2;
    const offsetY = (GIRL_H - h) / 2; // 以묒븰 ?뺣젹 (癒몃━? 諛?紐⑤몢 ?대뒓 ?뺣룄 而ㅻ쾭??

    const girlBox = {
      x: GIRL_X + offsetX,
      y: girlY + GIRL_OFFSET_Y + offsetY,
      w: w,
      h: h
    };

    for (let i = 0; i < foods.length; i++) {
      const foodHitbox = getFoodHitbox(foods[i]);
      if (collides(girlBox, foodHitbox)) {
        // ?뚯떇??利됱떆 ?쒓굅?섏? ?딄퀬 ?쇨꺽 ?쒖떆
        foods[i].hitFrames = HIT_PAUSE_FRAMES;
        hp--;
        if (hp <= 0) playSfx(sfxGirlDown); else playSfx(sfxGirlHurt);
        pauseFramesLeft = HIT_PAUSE_FRAMES;
        // ?쇨꺽 ???좊땲硫붿씠??罹붿뒳 (以묒꺽 諛⑹?)
        shootActive = false;
        bombActive = false;
        slideActive = false;
        break; // for food loops
      }
    }
  }
}

function getCanvasCoords(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width, scaleY = canvas.height / rect.height;
  let cx, cy;
  if (e.touches && e.touches.length > 0) {
    cx = e.touches[0].clientX;
    cy = e.touches[0].clientY;
  } else {
    cx = e.clientX;
    cy = e.clientY;
  }
  return { x: (cx - rect.left) * scaleX, y: (cy - rect.top) * scaleY };
}

function isInBtn(p, btn) {
  return p.x >= btn.x && p.x <= btn.x + btn.w && p.y >= btn.y && p.y <= btn.y + btn.h;
}

function handleTap(e) {
  const pos = getCanvasCoords(e);

  // ?꾧컧 踰꾪듉 ?대┃ 泥섎━ (紐⑤뱺 ?붾㈃?먯꽌 ?숈씪)
  if (isInBtn(pos, COLLECTION_BTN)) {
    if (state === 'playing') {
      isPaused = true;
    }
    state = 'collection';
    resetCollectionScroll();
    return;
  }

  // ?듭뀡 踰꾪듉 ?대┃ 泥섎━
  if (isInBtn(pos, OPTIONS_BTN)) {
    if (state === 'playing') {
      isPaused = true;
    }
    state = 'options';
    selectedOptionIndex = 0;
    return;
  }

  // 異쒖꽍蹂댁긽 踰꾪듉 ?대┃ 泥섎━
  if (isInBtn(pos, ATTENDANCE_BTN)) {
    window.location.href = 'attendance.html';
    return;
  }

  if (state === 'playing') return;

  if (state === 'start') {
    if (isInBtn(pos, BTN)) {
      startPlay();
      return;
    }
  }

  if (state === 'options') {
    // ?ㅻ줈 媛湲?踰꾪듉
    if (pos.x >= 20 && pos.x <= 80 && pos.y >= 20 && pos.y <= 60) {
      if (isPaused) {
        isPaused = false;
        state = 'playing';
      } else {
        state = 'start';
      }
      return;
    }
    // ?듭뀡 ??ぉ ?대┃
    const startY = 100;
    const itemHeight = 60;
    for (let i = 0; i < OPTION_ITEMS.length; i++) {
      const y = startY + i * itemHeight;
      if (pos.y >= y - itemHeight / 2 && pos.y <= y + itemHeight / 2) {
        selectedOptionIndex = i;
        const item = OPTION_ITEMS[i];
        if (item.type === 'toggle') {
          if (pos.x > GW - 120) {
            options[item.key] = !options[item.key];
            saveOptions();
          }
        } else if (item.type === 'slider') {
          const sliderX = 140;
          const sliderW = GW - 140 - 50 - 40;
          if (pos.x >= sliderX - 10 && pos.x <= sliderX + sliderW + 10) {
            const relativeX = pos.x - sliderX;
            const percentage = Math.max(0, Math.min(1, relativeX / sliderW));
            const val = item.min + (item.max - item.min) * percentage;
            if (item.key === 'bgmVolume') {
              options.bgmVolume = val / 100;
            } else if (item.key === 'sfxVolume') {
              options.sfxVolume = val / 100;
              playSfx(sfxGunshot);
            } else if (item.key === 'clearDistance') {
              options.clearDistance = Math.round(val / 50) * 50;
            }
            saveOptions();
          }
        } else if (item.type === 'select') {
          if (pos.x > 140) {
            const currentIndex = item.options.indexOf(options[item.key]);
            const nextIndex = (currentIndex + 1) % item.options.length;
            options[item.key] = item.options[nextIndex];
            saveOptions();
          }
        }
        return;
      }
    }
    return;
  }

  if (state === 'collection') {
    if (pos.x >= 20 && pos.x <= 80 && pos.y >= 20 && pos.y <= 60) {
      if (isPaused) {
        isPaused = false;
        state = 'playing';
      } else {
        state = 'start';
      }
      return;
    }
    const cardSize = 60;
    const cardSpacing = 15;
    const startX = 30;
    const gridY = 100;
    for (let i = 0; i < COLLECTION_ITEMS.length; i++) {
      const cardX = startX + i * (cardSize + cardSpacing) - collectionScrollOffset;
      if (pos.x >= cardX && pos.x <= cardX + cardSize &&
        pos.y >= gridY && pos.y <= gridY + cardSize) {
        selectedFoodIndex = i;
        return;
      }
    }
    return;
  }

  if (state === 'stage1clear') {
    state = 'start';
    if (bgmStage) bgmStage.pause();
    if (bgmTitle && options.bgmEnabled) { bgmTitle.currentTime = 0; bgmTitle.play().catch(function () { }); }
    return;
  }

  if (state === 'gameover') {
    if (isInBtn(pos, RETRY_BTN)) {
      startPlay();
      return;
    }
    if (isInBtn(pos, TITLE_BTN)) {
      if (bgmStage) { bgmStage.pause(); bgmStage.currentTime = 0; }
      if (bgmTitle && options.bgmEnabled) { bgmTitle.currentTime = 0; bgmTitle.play().catch(function () { }); }
      state = 'start';
      return;
    }
  }
}

// canvas.addEventListener('click', handleTap); // Moved to window.onload
document.addEventListener('contextmenu', function (e) {
  if (state === 'playing') e.preventDefault();
});

// ?꾧컧 ?붾㈃ ?쒕옒洹??ㅽ겕濡?document.addEventListener('mousedown', function (e) {
  if (state === 'collection') {
    const pos = getCanvasCoords(e);
    const cardSize = 60;
    const gridY = 100;
    const startX = 30;

    // 洹몃━???곸뿭 泥댄겕
    if (pos.y >= gridY - 10 && pos.y <= gridY + cardSize + 10) {
      isDraggingCollection = true;
      dragStartX = pos.x;
      dragStartScrollOffset = collectionScrollOffset;
      e.preventDefault();
      return;
    }
  }

  if (state !== 'playing') return;
  // ?꾧컧/?듭뀡 踰꾪듉 ?대┃ 泥댄겕 (?뚮젅??以묒뿉???닿린 媛??
  const pos = getCanvasCoords(e);
  if (isInBtn(pos, COLLECTION_BTN)) {
    isPaused = true;
    state = 'collection';
    resetCollectionScroll();
    return;
  }
  if (isInBtn(pos, OPTIONS_BTN)) {
    isPaused = true;
    state = 'options';
    selectedOptionIndex = 0;
    return;
  }
  if (e.button === 0) addBullet();
  if (e.button === 2) addBomb();
});

document.addEventListener('mousemove', function (e) {
  if (state === 'collection' && isDraggingCollection) {
    const pos = getCanvasCoords(e);
    const deltaX = dragStartX - pos.x;
    collectionScrollOffset = dragStartScrollOffset + deltaX;
    e.preventDefault();
  }
});

document.addEventListener('mouseup', function (e) {
  if (isDraggingCollection) {
    isDraggingCollection = false;
    e.preventDefault();
  }
});

document.addEventListener('mouseleave', function (e) {
  if (isDraggingCollection) {
    isDraggingCollection = false;
  }
});
document.addEventListener('touchstart', function (e) {
  const pos = getCanvasCoords(e);
  // 異쒖꽍蹂댁긽 踰꾪듉 ?대┃ 泥댄겕 (?꾩씠肄?
  if (isInBtn(pos, ATTENDANCE_BTN)) {
    window.location.href = 'attendance.html';
    e.preventDefault();
    return;
  }
  // ?꾧컧/?듭뀡 踰꾪듉 ?대┃ 泥댄겕 (紐⑤뱺 ?곹깭?먯꽌)
  if (isInBtn(pos, COLLECTION_BTN)) {
    if (state === 'playing') {
      isPaused = true;
    }
    state = 'collection';
    resetCollectionScroll();
    e.preventDefault();
    return;
  }
  if (isInBtn(pos, OPTIONS_BTN)) {
    if (state === 'playing') {
      isPaused = true;
    }
    state = 'options';
    selectedOptionIndex = 0;
    e.preventDefault();
    return;
  }

  // ?꾧컧 ?붾㈃ ?곗튂 泥섎━
  if (state === 'collection') {
    // ?뚯떇 洹몃┝ ?곸뿭 ?곗튂 媛먯? (?붾뱾由??④낵)
    const selectedItem = COLLECTION_ITEMS[selectedFoodIndex];
    if (selectedItem && selectedItem.type === 'food') {
      const foodData = collectionData[selectedItem.emoji];
      const isDiscovered = foodData && foodData.discovered;
      if (isDiscovered) {
        const panelY = 200;
        const emojiX = GW / 2;
        const emojiY = panelY + 50;
        const emojiSize = 64; // ??듭쟻???대え吏 ?ш린
        const emojiRadius = emojiSize / 2;
        // ?뚯떇 洹몃┝ ?곸뿭 ?곗튂 泥댄겕 (?먰삎 ?곸뿭)
        const dx = pos.x - emojiX;
        const dy = pos.y - emojiY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= emojiRadius) {
          // ?붾뱾由??④낵 ?쒖옉
          foodShakeFrame = FOOD_SHAKE_DURATION;
          e.preventDefault();
          return;
        }
      }
    }

    // ?꾧컧 ?붾㈃ ?곗튂 ?쒕옒洹??쒖옉
    const cardSize = 60;
    const gridY = 100;
    if (pos.y >= gridY - 10 && pos.y <= gridY + cardSize + 10) {
      isDraggingCollection = true;
      dragStartX = pos.x;
      dragStartScrollOffset = collectionScrollOffset;
      e.preventDefault();
      return;
    }
  }

  if (state === 'playing') {
    addBullet();
    e.preventDefault();
    return;
  }
  handleTap(e);
  e.preventDefault();
}, { passive: false });

document.addEventListener('touchmove', function (e) {
  if (state === 'collection' && isDraggingCollection && e.touches.length > 0) {
    const pos = getCanvasCoords(e);
    const deltaX = dragStartX - pos.x;
    collectionScrollOffset = dragStartScrollOffset + deltaX;
    e.preventDefault();
  }
}, { passive: false });

document.addEventListener('touchend', function (e) {
  if (isDraggingCollection) {
    isDraggingCollection = false;
    e.preventDefault();
  }
});

document.addEventListener('touchcancel', function (e) {
  if (isDraggingCollection) {
    isDraggingCollection = false;
  }
});

document.addEventListener('keydown', function (e) {
  if (e.code === 'Escape') {
    e.preventDefault();
    if (state === 'collection') {
      if (isPaused) {
        // ?뚮젅??以??쇱떆?뺤? ?곹깭??ㅻ㈃ ?쇱떆?뺤? ?댁젣
        isPaused = false;
        state = 'playing';
      } else {
        state = 'start';
      }
      return;
    }
    if (bgmStage) { bgmStage.pause(); bgmStage.currentTime = 0; }
    if (bgmTitle && options.bgmEnabled) { bgmTitle.currentTime = 0; bgmTitle.play().catch(function () { }); }
    state = 'start';
    return;
  }
  // ?꾧컧 ?붾㈃ ?ㅻ낫???ㅻ퉬寃뚯씠??  if (state === 'collection') {
    if (e.code === 'ArrowLeft') {
      e.preventDefault();
      selectedFoodIndex = Math.max(0, selectedFoodIndex - 1);
      return;
    }
    if (e.code === 'ArrowRight') {
      e.preventDefault();
      selectedFoodIndex = Math.min(COLLECTION_ITEMS.length - 1, selectedFoodIndex + 1);
      return;
    }
    if (e.code === 'Escape') {
      e.preventDefault();
      if (isPaused) {
        // ?뚮젅??以??쇱떆?뺤? ?곹깭??ㅻ㈃ ?쇱떆?뺤? ?댁젣
        isPaused = false;
        state = 'playing';
      } else {
        state = 'start';
      }
      return;
    }
    return;
  }

  // ??궧 ?낅젰 ?붾㈃ ?ㅻ낫??泥섎━
  if (state === 'input_ranking') {
    if (e.code === 'Enter') {
      if (inputName.length === 3) {
        // ??궧 ?깅줉
        const finalScore = Math.floor(score);
        const newEntry = { name: inputName, score: finalScore };

        // ?꾩옱 ?먯닔 異붽?, ?뺣젹, ?먮Ⅴ湲?        highScores.push(newEntry);
        highScores.sort((a, b) => b.score - a.score);
        if (highScores.length > MAX_HIGH_SCORES) highScores.pop();

        // ???쒖쐞 李얘린 (?섏씠?쇱씠?몄슜)
        newHighScoreIndex = highScores.findIndex(x => x.name === newEntry.name && x.score === newEntry.score);

        localStorage.setItem('jg_highscores', JSON.stringify(highScores));
        state = 'ranking_board';
        return; // ?낅젰 泥섎━ ??諛붾줈 由ы꽩?섏뿬 遺덊븘?뷀븳 ???낅젰 諛⑹?
      }
    } else if (e.code === 'Backspace') {
      inputName = inputName.slice(0, -1);
    } else if (e.key.length === 1 && inputName.length < 3) {
      // ?곷Ц ?臾몄옄留??낅젰 媛?ν븯寃??꾪꽣留?      const char = e.key.toUpperCase();
      if (/[A-Z]/.test(char)) {
        inputName += char;
      }
    }
    return;
  }

  // ??궧 蹂대뱶 ?붾㈃ ?ㅻ낫??泥섎━
  if (state === 'ranking_board') {
    if (e.code === 'Space' || e.code === 'Enter' || e.code === 'Escape') {
      state = 'gameover';
      newHighScoreIndex = -1;
    }
    return;
  }

  // 1?ㅽ뀒?댁? ?대━???붾㈃ ?ㅻ낫??泥섎━
  if (state === 'stage1clear') {
    if (e.code === 'Enter' || e.code === 'Space' || e.code === 'Escape') {
      state = 'start';
      if (bgmStage) bgmStage.pause();
      if (bgmTitle && options.bgmEnabled) { bgmTitle.currentTime = 0; bgmTitle.play().catch(function () { }); }
    }
    return;
  }

  // ?듭뀡 ?붾㈃ ?ㅻ낫???ㅻ퉬寃뚯씠??  if (state === 'options') {
    if (e.code === 'ArrowUp') {
      e.preventDefault();
      selectedOptionIndex = Math.max(0, selectedOptionIndex - 1);
      return;
    }
    if (e.code === 'ArrowDown') {
      e.preventDefault();
      selectedOptionIndex = Math.min(OPTION_ITEMS.length - 1, selectedOptionIndex + 1);
      return;
    }
    if (e.code === 'ArrowLeft') {
      e.preventDefault();
      const item = OPTION_ITEMS[selectedOptionIndex];
      if (item.type === 'slider') {
        const currentValue = item.value();
        const newValue = Math.max(item.min, currentValue - 5);
        if (item.key === 'bgmVolume') {
          options.bgmVolume = newValue / 100;
        } else if (item.key === 'sfxVolume') {
          options.sfxVolume = newValue / 100;
          // ?④낵??蹂쇰ⅷ 議곗젙 ??珥앺깂 諛쒖궗 ?뚮━濡??덉떆 ?ъ깮
          playSfx(sfxGunshot);
        }
        saveOptions();
      } else if (item.type === 'select') {
        const currentIndex = item.options.indexOf(options[item.key]);
        const prevIndex = (currentIndex - 1 + item.options.length) % item.options.length;
        options[item.key] = item.options[prevIndex];
        saveOptions();
      } else if (item.type === 'toggle') {
        options[item.key] = false;
        saveOptions();
      }
      return;
    }
    if (e.code === 'ArrowRight') {
      e.preventDefault();
      const item = OPTION_ITEMS[selectedOptionIndex];
      if (item.type === 'slider') {
        const currentValue = item.value();
        const newValue = Math.min(item.max, currentValue + 5);
        if (item.key === 'bgmVolume') {
          options.bgmVolume = newValue / 100;
        } else if (item.key === 'sfxVolume') {
          options.sfxVolume = newValue / 100;
          // ?④낵??蹂쇰ⅷ 議곗젙 ??珥앺깂 諛쒖궗 ?뚮━濡??덉떆 ?ъ깮
          playSfx(sfxGunshot);
        }
        saveOptions();
      } else if (item.type === 'select') {
        const currentIndex = item.options.indexOf(options[item.key]);
        const nextIndex = (currentIndex + 1) % item.options.length;
        options[item.key] = item.options[nextIndex];
        saveOptions();
      } else if (item.type === 'toggle') {
        options[item.key] = true;
        saveOptions();
      }
      return;
    }
    if (e.code === 'Escape') {
      e.preventDefault();
      if (isPaused) {
        isPaused = false;
        state = 'playing';
      } else {
        state = 'start';
      }
      return;
    }
    return;
  }

  // 1?ㅽ뀒?댁? ?대━???붾㈃ ?ㅻ낫??泥섎━
  if (state === 'stage1clear') {
    if (e.code === 'Space' || e.code === 'Enter') {
      state = 'start'; // ?ㅼ쓬 ?ㅽ뀒?댁? ????꾩떆濡???댄?濡??대룞
      if (bgmStage) bgmStage.pause();
      if (bgmTitle && options.bgmEnabled) { bgmTitle.currentTime = 0; bgmTitle.play().catch(function () { }); }
    }
    return;
  }

  if (e.code === 'KeyP') {
    e.preventDefault();
    if (state === 'playing') isPaused = !isPaused;
    return;
  }
  if (e.code === 'Tab') {
    e.preventDefault();
    if (state === 'playing') isPaused = !isPaused;
    return;
  }
  if (e.code === 'CapsLock') {
    e.preventDefault();
    (async function doScreenShot() {
      const ts = new Date().toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '_');
      const name = 'jumping_girl_screen_shot_' + ts + '.png';
      let blob;
      try {
        blob = await new Promise(function (res, rej) {
          canvas.toBlob(function (b) { if (b) res(b); else rej(new Error('toBlob')); }, 'image/png');
        });
      } catch (err) { return; }
      try {
        if (typeof window.showDirectoryPicker === 'function') {
          if (!screenShotDirHandle) screenShotDirHandle = await window.showDirectoryPicker();
          const fh = await screenShotDirHandle.getFileHandle(name, { create: true });
          const w = await fh.createWritable();
          await w.write(blob);
          await w.close();
          return;
        }
      } catch (err) { /* ?대뜑 ?좏깮 痍⑥냼쨌API 誘몄????????ㅼ슫濡쒕뱶 ?대갚 */ }
      const a = document.createElement('a');
      a.download = name;
      a.href = URL.createObjectURL(blob);
      a.click();
      URL.revokeObjectURL(a.href);
    })();
    return;
  }
  if (e.code === 'Space') {
    e.preventDefault();
    if (state !== 'playing' || pauseFramesLeft > 0 || isPaused) return;
    // ?щ씪?대뵫 以묒뿉???먰봽 媛??(?щ씪?대뵫 痍⑥냼)
    if (slideActive) {
      slideActive = false;
      slideFrames = 0;
      slideFrameCount = 0;
    }
    if (girlY >= GROUND_Y - GIRL_H - 2) {
      vy = JUMP_FORCE;
      playSfx(sfxGirlHop);
    } else if (!airJumpUsed) {
      vy = AIR_JUMP_VY;
      airJumpUsed = true;
      playSfx(sfxGirlHop);
    }
  }
  if (e.code === 'KeyA') {
    e.preventDefault();
    if (state !== 'playing' || pauseFramesLeft > 0 || isPaused || slideActive) return;
    // ?먰봽 以묒뿉???щ씪?대뵫 遺덇?
    if (girlY < GROUND_Y - GIRL_H - 2) return; // ?먰봽 以?(?낆뿉 ?우? ?딆쓬)
    slideActive = true;
    slideFrames = 0;
    slideFrameCount = 0;
    slideStartFrame = frameCount;
    slideLoopCompleted = false;
  }
});

// Update function required by loop()
function update() {
  // Logic updates
  updateGifPositions();

  // Sync GameState needed for UI
  if (window.GameState) {
    window.GameState.state = state;
    window.GameState.score = score;
    window.GameState.highScores = highScores;
    window.GameState.options = options;
    window.GameState.inputName = inputName;
    window.GameState.newHighScoreIndex = newHighScoreIndex;
    window.GameState.scrollOffset = scrollOffset;
    window.GameState.selectedOptionIndex = selectedOptionIndex;
    window.GameState.selectedFoodIndex = selectedFoodIndex;
    window.GameState.collectionData = collectionData;
  }
}

```

## js\game_stable_backup.js
```js
/**
 * Jumping Girl - Food Escape
 * ?몃씪蹂??뚮?媛 ?щ━硫? ?ㅻⅨ履쎌뿉???ㅺ??ㅻ뒗 ?뚯떇???ㅽ럹?댁뒪(?먰봽)濡??쇳븯??寃뚯엫
 * @see docs/implementation-baseline.md   (援ы쁽 湲곗?쨌?꾩껜 ?ㅽ럺)
 * @see docs/instruction-002-game-design-basic.md
 * @see docs/instruction-003-bg-aspect-and-bullet.md
 * @see docs/instruction-004-bg-cover-and-ghosting-fix.md
 * @see docs/instruction-005-food-spawn-hp-pause.md
 * @see docs/instruction-006-hp-left-and-explosion.md
 * @see docs/instruction-007-explosion-led-digital-style.md
 * @see docs/instruction-008-explosion-big-star-fragments.md
 * @see docs/instruction-009-bg-offset-road.md
 * @see docs/instruction-010-bullet-visibility-and-girl-gif.md
 */

// Main Game Logic

// Initialize Global State Link
// const G = window.GameState; // Moved to ui.js / global scope

// Local aliases for convenience (optional)
// Note: Draw logic in ui.js uses G directly.
// Physics/Game logic here uses G properties.

// DOM Elements (GIFs)
const girlGifImg = document.getElementById('girlGif');
const slideGifImg = document.getElementById('slideGif');
const shootGifImg = document.getElementById('shootGif');
const bombGifImg = document.getElementById('bombGif');

let canvas, ctx;
let state = 'start'; // start, playing, gameover, collection, options, input_ranking, ranking_board, stage1clear
let highScores = JSON.parse(localStorage.getItem('jg_highscores')) || [];
if (highScores.length === 0) {
  for (let i = 0; i < 5; i++) {
    highScores.push({ name: 'AAA', score: (5 - i) * 1000 });
  }
}
let inputName = '';
let newHighScoreIndex = -1;
let selectedOptionIndex = 0; // ?듭뀡 硫붾돱 而ㅼ꽌
let selectedFoodIndex = 0;   // ?꾧컧 ?좏깮 而ㅼ꽌

window.addEventListener('load', () => {
  canvas = document.getElementById('gameCanvas');
  if (!canvas) return;
  ctx = canvas.getContext('2d');

  // Update Global Context
  if (window.GameState) {
    window.GameState.canvas = canvas;
    window.GameState.ctx = ctx;
  }

  // Resize canvas initially
  resize();

  // Input Listeners
  if (canvas) {
    canvas.addEventListener('click', handleTap);
  }

  // Start Game Loop
  requestAnimationFrame(loop);
});

// Main Loop Function (Hoisted)
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}
// Image Loading & Game Logic below...
// Background setup
const bgImage = new Image();
bgImage.src = 'graphic_resource/background.png';
let bgReady = false;
bgImage.onload = function () { bgReady = true; };

// 1?ㅽ뀒?댁? ?대━???대?吏
const stage1ClearImage = new Image();
stage1ClearImage.src = 'graphic_resource/stage_clear/1stage_clear.png';
let stage1ClearReady = false;
stage1ClearImage.onload = function () { stage1ClearReady = true; };

// 寃뚯엫 ?쒖옉 ?붾㈃: graphic_resource/screen_title.png (源붿뼱?볤린). 誘몃줈?????⑥깋+?띿뒪???대갚
const titleImage = new Image();
titleImage.src = 'graphic_resource/screen_title.png';
let titleReady = false;
titleImage.onload = function () { titleReady = true; };

// 二쇱씤怨? run.gif (?щ━湲? ?щ챸 諛곌꼍 GIF ?좊땲硫붿씠??
// Canvas?먯꽌??GIF ?좊땲硫붿씠?섏씠 ?ъ깮?섏? ?딆쑝誘濡?img ?쒓렇瑜??ъ슜
const girlImage = new Image();
girlImage.crossOrigin = 'anonymous';
let girlReady = false;
const girlGifPath = 'graphic_resource/character/anim/run.gif';

// img ?쒓렇??GIF ?ㅼ젙
if (girlGifImg) {
  girlGifImg.src = girlGifPath;
  girlGifImg.onload = function () {
    girlReady = true;
    console.log('???щ━湲?GIF 濡쒕뱶 ?꾨즺 (img ?쒓렇):', girlGifImg.naturalWidth, 'x', girlGifImg.naturalHeight);
  };
  girlGifImg.onerror = function (e) {
    girlReady = false;
    console.error('???щ━湲?GIF 濡쒕뱶 ?ㅽ뙣:', girlGifPath);
  };
}

// Image 媛앹껜??濡쒕뱶 (?대갚??
girlImage.onload = function () {
  if (!girlReady) girlReady = true;
  console.log('???щ━湲?GIF 濡쒕뱶 ?꾨즺 (Image 媛앹껜):', girlImage.naturalWidth, 'x', girlImage.naturalHeight);
};
girlImage.onerror = function (e) {
  console.error('???щ━湲?GIF 濡쒕뱶 ?ㅽ뙣 (Image 媛앹껜):', girlImage.src);
};
const girlChromaKeyRef = { chromaKey: null, isGif: true };
(async function loadGirlImage() {
  const path = girlGifPath;
  console.log('?봽 ?щ━湲?GIF 濡쒕뱶 ?쒖옉:', path);
  if (location.protocol === 'file:') {
    girlImage.removeAttribute('crossorigin');
    girlImage.src = path;
    return;
  }
  try {
    const r = await fetch(path);
    if (r.ok) {
      const blob = await r.blob();
      girlImage.src = URL.createObjectURL(blob);
      return;
    }
  } catch (e) { }
  girlImage.removeAttribute('crossorigin');
  girlImage.src = path;
})();

// ?꾪솚 諛쒖궗 ?? shoot.gif (?щ챸 諛곌꼍 GIF ?좊땲硫붿씠??
// Canvas?먯꽌??GIF ?좊땲硫붿씠?섏씠 ?ъ깮?섏? ?딆쑝誘濡?img ?쒓렇瑜??ъ슜
const shootImage = new Image();
shootImage.crossOrigin = 'anonymous';
let shootReady = false;
let shootActive = false; // true????drawGirl? shootGifImg瑜?洹몃┝
let shootFrameCount = 0; // 諛쒖궗 ?좊땲硫붿씠???꾨젅??移댁슫??const SHOOT_DURATION = 24; // 諛쒖궗 ?좊땲硫붿씠??吏???쒓컙 (?꾨젅?? - 30??80%
let reloadCooldown = 0; // ?ъ옣??荑⑦???(?꾨젅?? - 2珥?= 120?꾨젅??// Reload cooldown moved to config.js
// const RELOAD_COOLDOWN_DURATION = 120;
const shootGifPath = 'graphic_resource/character/anim/shoot.gif';

// ??깂 ?섏?湲??좊땲硫붿씠??let bombActive = false; // true????drawGirl? bombGifImg瑜?洹몃┝
let bombFrameCount = 0; // ??깂 ?섏?湲??좊땲硫붿씠???꾨젅??移댁슫??const BOMB_DURATION = 15; // ??깂 ?섏?湲??좊땲硫붿씠??吏???쒓컙 (?꾨젅?? - 2諛?鍮좊Ⅴ寃?const bombGifPath = 'graphic_resource/character/anim/bomb.gif';
let bombReady = false;

// img ?쒓렇??GIF ?ㅼ젙
if (shootGifImg) {
  shootGifImg.src = shootGifPath;
  shootGifImg.onload = function () {
    shootReady = true;
    console.log('??諛쒖궗 GIF 濡쒕뱶 ?꾨즺 (img ?쒓렇):', shootGifImg.naturalWidth, 'x', shootGifImg.naturalHeight);
  };
  shootGifImg.onerror = function (e) {
    shootReady = false;
    console.error('??諛쒖궗 GIF 濡쒕뱶 ?ㅽ뙣:', shootGifPath);
  };
}

// Image 媛앹껜??濡쒕뱶 (?대갚??
shootImage.onload = function () {
  if (!shootReady) shootReady = true;
  console.log('??諛쒖궗 GIF 濡쒕뱶 ?꾨즺 (Image 媛앹껜):', shootImage.naturalWidth, 'x', shootImage.naturalHeight);
};
shootImage.onerror = function (e) {
  console.error('??諛쒖궗 GIF 濡쒕뱶 ?ㅽ뙣 (Image 媛앹껜):', shootImage.src);
};

// ??깂 ?섏?湲?GIF 濡쒕뱶
if (bombGifImg) {
  bombGifImg.src = bombGifPath;
  bombGifImg.onload = function () {
    bombReady = true;
    console.log('????깂 ?섏?湲?GIF 濡쒕뱶 ?꾨즺 (img ?쒓렇):', bombGifImg.naturalWidth, 'x', bombGifImg.naturalHeight);
  };
  bombGifImg.onerror = function (e) {
    bombReady = false;
    console.error('????깂 ?섏?湲?GIF 濡쒕뱶 ?ㅽ뙣:', bombGifPath);
  };
}
const shootChromaKeyRef = { chromaKey: null, isGif: true };
(async function loadShootImage() {
  const path = shootGifPath;
  console.log('?봽 諛쒖궗 GIF 濡쒕뱶 ?쒖옉:', path);
  if (location.protocol === 'file:') {
    shootImage.removeAttribute('crossorigin');
    shootImage.src = path;
    return;
  }
  try {
    const r = await fetch(path);
    if (r.ok) {
      const blob = await r.blob();
      shootImage.src = URL.createObjectURL(blob);
      return;
    }
  } catch (e) { }
  shootImage.removeAttribute('crossorigin');
  shootImage.src = path;
})();

// ?щ씪?대뵫: sliding.gif (?щ챸 諛곌꼍 GIF ?좊땲硫붿씠??
// Canvas?먯꽌??GIF ?좊땲硫붿씠?섏씠 ?ъ깮?섏? ?딆쑝誘濡?img ?쒓렇瑜??ъ슜
const slideImage = new Image();
slideImage.crossOrigin = 'anonymous';
let slideReady = false;
let slideActive = false; // true????drawGirl? slideImage瑜?洹몃┝
let slideFrameCount = 0; // ?щ씪?대뵫 ?좊땲硫붿씠???꾨젅??移댁슫??let slideStartFrame = 0; // ?щ씪?대뵫 ?쒖옉 ?꾨젅??let slideLoopCompleted = false; // ?щ씪?대뵫 猷⑦봽 1???꾨즺 ?щ?
const slideGifPath = 'graphic_resource/character/anim/sliding.gif';

// img ?쒓렇??GIF ?ㅼ젙
if (slideGifImg) {
  slideGifImg.src = slideGifPath;
  slideGifImg.onload = function () {
    slideReady = true;
    console.log('???щ씪?대뵫 GIF 濡쒕뱶 ?꾨즺 (img ?쒓렇):', slideGifImg.naturalWidth, 'x', slideGifImg.naturalHeight);
  };
  slideGifImg.onerror = function (e) {
    slideReady = false;
    console.error('???щ씪?대뵫 GIF 濡쒕뱶 ?ㅽ뙣:', slideGifPath);
  };
}

// Image 媛앹껜??濡쒕뱶 (?대갚??
slideImage.onload = function () {
  if (!slideReady) slideReady = true;
  console.log('???щ씪?대뵫 GIF 濡쒕뱶 ?꾨즺 (Image 媛앹껜):', slideImage.naturalWidth, 'x', slideImage.naturalHeight);
};
slideImage.onerror = function (e) {
  console.error('???щ씪?대뵫 GIF 濡쒕뱶 ?ㅽ뙣 (Image 媛앹껜):', slideImage.src);
};
const slideChromaKeyRef = { chromaKey: null, isGif: true };
(async function loadSlideImage() {
  const path = slideGifPath;
  console.log('?봽 ?щ씪?대뵫 GIF 濡쒕뱶 ?쒖옉:', path);
  if (location.protocol === 'file:') {
    slideImage.removeAttribute('crossorigin');
    slideImage.src = path;
    return;
  }
  try {
    const r = await fetch(path);
    if (r.ok) {
      const blob = await r.blob();
      slideImage.src = URL.createObjectURL(blob);
      return;
    }
  } catch (e) { }
  slideImage.removeAttribute('crossorigin');
  slideImage.src = path;
})();

// Stage 1 Clear: 0m ?꾨떖 5珥????띿뒪???쒖떆 (MP4 ?쒓굅, GIF留??ъ슜)

// ?덊듃 ?? hurt.png (1쨌2踰덉㎏), 泥대젰 0 ?쒓컙(3踰덉㎏): down.png. 諛곌꼍 ?щ챸 PNG
const hurtImage = new Image();
hurtImage.crossOrigin = 'anonymous';
let hurtReady = false;
hurtImage.onload = function () {
  hurtReady = true;
  console.log('???덊듃 PNG 濡쒕뱶 ?꾨즺:', hurtImage.naturalWidth, 'x', hurtImage.naturalHeight);
};
hurtImage.onerror = function (e) {
  hurtReady = false;
  console.error('???덊듃 PNG 濡쒕뱶 ?ㅽ뙣:', hurtImage.src);
};
const hurtChromaKeyRef = { chromaKey: null };
(async function loadHurtImage() {
  const path = 'graphic_resource/character/hurt.png';
  console.log('?봽 ?덊듃 PNG 濡쒕뱶 ?쒖옉:', path);
  if (location.protocol === 'file:') {
    hurtImage.removeAttribute('crossorigin');
    hurtImage.src = path;
    return;
  }
  try {
    const r = await fetch(path);
    if (r.ok) {
      const blob = await r.blob();
      hurtImage.src = URL.createObjectURL(blob);
      return;
    }
  } catch (e) { }
  hurtImage.removeAttribute('crossorigin');
  hurtImage.src = path;
})();

const downImage = new Image();
downImage.crossOrigin = 'anonymous';
let downReady = false;
downImage.onload = function () {
  downReady = true;
  console.log('???ㅼ슫 PNG 濡쒕뱶 ?꾨즺:', downImage.naturalWidth, 'x', downImage.naturalHeight);
};
downImage.onerror = function (e) {
  downReady = false;
  console.error('???ㅼ슫 PNG 濡쒕뱶 ?ㅽ뙣:', downImage.src);
};
const downChromaKeyRef = { chromaKey: null };
(async function loadDownImage() {
  const path = 'graphic_resource/character/down.png';
  console.log('?봽 ?ㅼ슫 PNG 濡쒕뱶 ?쒖옉:', path);
  if (location.protocol === 'file:') {
    downImage.removeAttribute('crossorigin');
    downImage.src = path;
    return;
  }
  try {
    const r = await fetch(path);
    if (r.ok) {
      const blob = await r.blob();
      downImage.src = URL.createObjectURL(blob);
      return;
    }
  } catch (e) { }
  downImage.removeAttribute('crossorigin');
  downImage.src = path;
})();

// ?듭뀡 ?ㅼ젙
let options = {
  bgmVolume: 0.7,      // BGM 蹂쇰ⅷ (0.0 ~ 1.0)
  sfxVolume: 0.8,      // ?④낵??蹂쇰ⅷ (0.0 ~ 1.0)
  bgmEnabled: true,   // BGM ???ㅽ봽
  sfxEnabled: true,    // ?④낵?????ㅽ봽
  fullscreen: false,   // ?꾩껜?붾㈃ 紐⑤뱶
  graphicsQuality: 'high', // 洹몃옒???덉쭏: 'low', 'medium', 'high'
  clearDistance: 200   // ?대━??嫄곕━ ?ㅼ젙 (湲곕낯媛?200m)
};

// ?듭뀡 濡쒕뱶
function loadOptions() {
  try {
    const saved = localStorage.getItem('jg_options'); // Consistency with config.js
    if (saved) {
      const parsed = JSON.parse(saved);
      options = { ...options, ...parsed };
    }
  } catch (e) {
    console.error('?듭뀡 濡쒕뱶 ?ㅽ뙣:', e);
  }
  applyOptions();
}

// ?듭뀡 ???function saveOptions() {
  try {
    localStorage.setItem('jg_options', JSON.stringify(options));
  } catch (e) {
    console.error('?듭뀡 ????ㅽ뙣:', e);
  }
  applyOptions();
}

// BGM: ??댄? everybody.mp3, ?ㅽ뀒?댁? stage1.mp3
const bgmTitle = new Audio('bgm/everybody.mp3');
bgmTitle.loop = true;
const bgmStage = new Audio('bgm/stage1.mp3');
bgmStage.loop = true;
let titleBgmTried = false;

// ?④낵??const sfxGunshot = new Audio('effect_sound/gunshot.mp3');
const sfxBombFlying = new Audio('effect_sound/bomb_flying.mp3');
const sfxBombExplosion = new Audio('effect_sound/bomb_explosion.mp3');
const sfxGirlHurt = new Audio('effect_sound/girl_hurt.mp3');
const sfxGirlDown = new Audio('effect_sound/girl_down.mp3');
const sfxGirlHop = new Audio('effect_sound/girl_hop.mp3');
const sfxReload = new Audio('effect_sound/reload.mp3'); // ?ъ옣???뚮━
function playSfx(a) {
  if (a && options.sfxEnabled) {
    a.currentTime = 0;
    a.play().catch(function () { });
  }
}

// ?듭뀡 ?곸슜
function applyOptions() {
  const bgmVol = options.bgmEnabled ? options.bgmVolume : 0;
  const sfxVol = options.sfxEnabled ? options.sfxVolume : 0;

  if (bgmTitle) bgmTitle.volume = bgmVol;
  if (bgmStage) bgmStage.volume = bgmVol;
  if (sfxGunshot) sfxGunshot.volume = sfxVol;
  if (sfxBombFlying) sfxBombFlying.volume = sfxVol;
  if (sfxBombExplosion) sfxBombExplosion.volume = sfxVol;
  if (sfxGirlHurt) sfxGirlHurt.volume = sfxVol;
  if (sfxGirlDown) sfxGirlDown.volume = sfxVol;
  if (sfxGirlHop) sfxGirlHop.volume = sfxVol;
  if (sfxReload) sfxReload.volume = sfxVol;

  // BGM 利됱떆 諛섏쓳
  if (!options.bgmEnabled) {
    // BGM??爰쇱졇?덉쑝硫??뺤?
    if (bgmTitle) bgmTitle.pause();
    if (bgmStage) bgmStage.pause();
  } else {
    // BGM??耳쒖졇?덉쑝硫??꾩옱 ?곹깭??留욌뒗 BGM ?ъ깮
    if (state === 'playing' || state === 'stage1clear') {
      // ?뚮젅??以묒씠硫??ㅽ뀒?댁? BGM
      if (bgmTitle) bgmTitle.pause();
      if (bgmStage) {
        bgmStage.currentTime = 0;
        bgmStage.play().catch(function () { });
      }
    } else {
      // ??댄?/?꾧컧/?듭뀡/寃뚯엫?ㅻ쾭 ?붾㈃?대㈃ ??댄? BGM
      if (bgmStage) bgmStage.pause();
      if (bgmTitle) {
        bgmTitle.currentTime = 0;
        bgmTitle.play().catch(function () { });
      }
    }
  }
}

// 珥덇린 ?듭뀡 濡쒕뱶 (?ㅻ뵒??媛앹껜 ?앹꽦 ??
loadOptions();

// FONT_HANGUL moved to config.js
// const FONT_HANGUL = '"Nanum Myeongjo", serif';

let girlOffscreen = null;
let girlOffCtx = null;
let girlChromaOffscreen = null; // ?щ줈留덊궎 泥섎━??寃곌낵瑜???ν븷 蹂꾨룄 罹붾쾭??let girlChromaOffCtx = null;
let scaleOffscreen = null; // hurt 1.35諛? down 2諛???scale ??let scaleOffCtx = null;
let chromaKey = null; // ?곸긽 ?ш컖 諛곌꼍 ?щ챸??(?뚮몢由??섑뵆)
let deathFallFrames = 0;  // 3踰덉㎏ ?덊듃 ???⑥뼱吏???곗텧 移댁슫?? 0???꾨땲硫?fall 援ш컙
let deathFallOffsetY = 0; // ?⑥뼱吏???y 媛??let chromaUnavailable = false; // getImageData tainted ???덉쇅 ???щ줈留덊궎 嫄대꼫?
let screenShotDirHandle = null; // CapsLock ?ㅽ겕由곗꺑: 泥?CapsLock ???대뜑 ?좏깮?먯꽌 F:\cursor_project\screen_shot 怨좊Ⅴ硫??대떦 寃쎈줈?????(???몄뀡 ?숈븞 ?좎?)
const CHROMA_DIST = 100; // ?좏겢由щ뱶 嫄곕━ ?쒓퀎 (怨쇰룄???쒓굅쨌?쇨뎬 ?먯긽 諛⑹?)
// 洹몃┛?ㅽ겕由??쇱엫) 蹂댁“: G>R, G>B???뚮쭔 ?곸슜???쇰?/?쇨뎬? ?쒓굅 ??곸뿉???쒖쇅
const CHROMA_GREEN = [0, 255, 0]; // 湲곗? ?뱀깋
const CHROMA_DIST_GREEN = 120;    // ?뱀깋鍮??쇰?쨌洹몃┝??蹂댁〈
// ?쇱엫???щ줈留덊궎: #BFFF00 (191, 255, 0), #ADFF2F (173, 255, 47) ??const CHROMA_LIME = [191, 255, 0]; // ?쇱엫??湲곗?
const CHROMA_DIST_LIME = 100;      // ?쇱엫??嫄곕━ ?꾧퀎媛?
// 二쇱씤怨? ?몃씪蹂??뚮?, ?쇱そ 怨좎젙 (?ш린 2諛? 48횞90 ??96횞180). ?쇰큸: 醫뚯륫?쇰줈 遺숈엫, ?꾨줈 20
// GIRL constants moved to config.js
// const GIRL_X = 2;
// const GIRL_OFFSET_Y = -20; 
// const GIRL_W = 96;
// const GIRL_H = 180;
// const GROUND_Y = 580; 
let girlY = GROUND_Y - GIRL_H;
let vy = 0;
// const GRAVITY = 0.55; // moved to config.js
const JUMP_FORCE = -13.5; // ??먰봽, ?믪씠 ?덈컲 (|vy|/??)
const AIR_JUMP_VY = JUMP_FORCE / Math.sqrt(3); // 怨듭쨷 1???뚯젏?? ?먮옒 ?믪씠??1/3
let airJumpUsed = false;
let runFrame = 0;
let frameCount = 0;
let slideFrames = 0; // ?щ씪?대뵫 吏???꾨젅??移댁슫??const SLIDE_DURATION = 36; // ?щ씪?대뵫 吏???쒓컙 (??0.6珥?@ 60fps)

// 諛곌꼍 ?ㅽ겕濡? 200m: 12珥?60fps)쨌BG_SPEED=4 ??scrollOffset 2880????0m
// 諛곌꼍 ?ㅽ겕濡? 200m: 12珥?60fps)쨌BG_SPEED=4 ??scrollOffset 2880????0m
// let scrollOffset = 0; // Removed duplicate
let scrollOffset = 0;
const BG_SPEED = 4;
const SCROLL_FOR_200M = 200 * (3 * 60 * 4) / 50; // 2880 (200m)
const PIXELS_PER_METER = 14.4; // 2880 / 200 = 14.4

// ?뚯떇 ?μ븷臾?const FOODS = ['?뜋', '?뜑', '?뜒', '?뜜', '?뙪'];
const FOOD_W = 40, FOOD_H = 40;

// 媛??뚯떇蹂??먯젙 諛뺤뒪 (?뚯떇 紐⑥뼇??留욊쾶 議곗젙, ?ш린瑜?2/3濡?異뺤냼)
// ?뚯떇蹂??먯젙 諛뺤뒪 (2/3 -> 1/2濡?異뺤냼?섏뿬 ?먯젙????愿??섍쾶 ?섏젙)
const FOOD_HITBOXES = {
  '?뜋': { x: 10, y: 10, w: 14, h: 14 },   // ?ш낵: 28*1/2 = 14
  '?뜑': { x: 8, y: 12, w: 16, h: 12 },    // ?꾨쾭嫄? 32*1/2=16, 24*1/2=12
  '?뜒': { x: 10, y: 10, w: 14, h: 14 },   // ?쇱옄: 28*1/2 = 14
  '?뜜': { x: 9, y: 11, w: 15, h: 13 },    // 媛먯옄?源: 30*1/2=15, 26*1/2=13
  '?뙪': { x: 8, y: 13, w: 17, h: 11 }     // ?ル룄洹? 34*1/2=17, 22*1/2=11
};

// ?뚯떇???ㅼ젣 ?먯젙 諛뺤뒪 媛?몄삤湲?function getFoodHitbox(food) {
  const hitbox = FOOD_HITBOXES[food.emoji] || { x: 12, y: 12, w: 12, h: 12 }; // 湲곕낯媛?異뺤냼
  return {
    x: food.x + hitbox.x,
    y: food.y + hitbox.y,
    w: hitbox.w,
    h: hitbox.h
  };
}

// ?뚯떇 ?꾧컧 ?곗씠??// FOOD_COLLECTION_DATA moved to config.js
// const FOOD_COLLECTION_DATA = { ... };

// ?꾧컧 ?곗씠??濡쒕뱶
let collectionData = {};
function loadCollectionData() {
  try {
    const saved = localStorage.getItem('jg_collection');
    if (saved) {
      collectionData = JSON.parse(saved);
    }
  } catch (e) {
    console.error('?꾧컧 ?곗씠??濡쒕뱶 ?ㅽ뙣:', e);
    collectionData = {};
  }
  // 媛??뚯떇 珥덇린??(?놁쑝硫??앹꽦)
  FOODS.forEach(emoji => {
    if (!collectionData[emoji]) {
      collectionData[emoji] = {
        count: 0,
        firstFound: null,
        lastFound: null,
        discovered: false
      };
    }
  });
}

// ?꾧컧 ?곗씠?????function saveCollectionData() {
  try {
    localStorage.setItem('jg_collection', JSON.stringify(collectionData));
  } catch (e) {
    console.error('?꾧컧 ?곗씠??????ㅽ뙣:', e);
  }
}

// ?뚯떇 遺?섍린 ???꾧컧 ?낅뜲?댄듃
function updateCollection(emoji) {
  if (!collectionData[emoji]) {
    collectionData[emoji] = {
      count: 0,
      firstFound: null,
      lastFound: null,
      discovered: false
    };
  }

  const now = new Date().toISOString();
  collectionData[emoji].count++;
  collectionData[emoji].lastFound = now;

  if (!collectionData[emoji].discovered) {
    collectionData[emoji].discovered = true;
    collectionData[emoji].firstFound = now;
  }

  saveCollectionData();
}

// 珥덇린 濡쒕뱶
loadCollectionData();
// ?ㅽ룿 y 5?ъ씤??(?섃넂?? f.y=?뚯떇 ?곷떒): [0]諛쒓낵 媛숈? ?믪씠, [1節?]?꾪솚?쇰줈 留욎텧 ???덈뒗 ?믪씠, [4]?먰봽쨌?꾪솚?쇰줈 留욎텧 ???녾퀬 ?우쑝硫?泥대젰 媛먯냼
const FOOD_SPAWN_YS = [520, 450, 380, 310, 240];
let foods = [];
let nextSpawn = 60;
// FOOD_SPEED moved to config.js
// const FOOD_SPEED = 5.5;

// 珥앹븣 (留덉슦???쇱そ ?대┃ / ?곗튂): ?꾧킅?쇱엫 ?뱀깋, ?덉뿉 ?꾧쾶
// BULLET & BOMB constants moved to config.js
// const BULLET_W = 14, BULLET_H = 7;
// const BULLET_SPEED = 14;
const BULLET_FILL = '#39ff14';   // ?꾧킅?쇱엫 ?뱀깋
const BULLET_STROKE = '#000';    // 寃? ?뚮몢由?(?鍮?
let bullets = [];

// ??깂 (留덉슦???고겢由?: ?щЪ?????붾㈃ ?덉뿉???낆뿉 ?⑥뼱??李⑹?쨌??컻
// const BOMB_W = 32, BOMB_H = 32;
// const BOMB_VX = 4, BOMB_VY = -10; 
let bombs = [];

// ?꾪솚?볦쓬???덊듃: ???곗?硫댁꽌 蹂꾩“媛?(?ш퀬 遺꾨챸?섍쾶)
let explosions = [];
const EXPLOSION_FRAMES = 28;

// ?먯닔 (?ㅽ겕濡?嫄곕━)
let score = 0;

// 泥대젰 (理쒕? 3), ?덊듃 ??0.5珥??뺤?
let hp = 3;
let pauseFramesLeft = 0;
const HIT_PAUSE_FRAMES = 30;
let isPaused = false; // P???쇱떆?뺤?

// Stage 1 Clear: 0m ?꾨떖 ???띿뒪????＝ 5珥?????댄? 蹂듦? (MP4 ?쒓굅)
let stage1ClearFrames = 0;
let clearFireworks = []; // 洹밸챸??諛앹? ??＝ ?꾩슜 (drawExplosion ?ы솢??????

// 諛섏쓳??// 諛섏쓳??function resize() {
  if (!canvas) return; // Prevent error if canvas is not initialized

  // Set internal resolution matches game logic
  canvas.width = GW;
  canvas.height = GH;

  const w = window.innerWidth, h = window.innerHeight;
  const ratio = 9 / 16;
  let cw = Math.min(360, w), ch = cw / ratio;
  if (ch > h) { ch = h; cw = ch * ratio; }
  canvas.style.width = cw + 'px';
  canvas.style.height = ch + 'px';
  // GIF img ?쒓렇 ?ш린???낅뜲?댄듃
  updateGifPositions();
}
window.addEventListener('resize', resize);
// resize(); // moved to window.onload to ensure canvas is ready

// GIF img ?쒓렇 ?꾩튂 ?낅뜲?댄듃 ?⑥닔
function updateGifPositions() {
  if (!girlGifImg || !slideGifImg || !shootGifImg || !bombGifImg) return;

  // Determine visibility flags based on game state
  const shouldShowSlideGif = slideActive;
  const shouldShowShootGif = shootActive;
  const shouldShowBombGif = bombActive;
  // Girl is shown if not doing special actions and alive
  const shouldShowGirlGif = !slideActive && !shootActive && !bombActive && hp > 0 && deathFallFrames === 0 && pauseFramesLeft === 0;

  // Canvas???ㅼ젣 ?붾㈃ ?ш린 (CSS濡??ㅼ??쇰맂 ?ш린)
  const canvasRect = canvas.getBoundingClientRect();
  const screenWidth = canvasRect.width;
  const screenHeight = canvasRect.height;

  // 寃뚯엫 ?대? 醫뚰몴(360x640)瑜??붾㈃ 醫뚰몴濡?蹂?섑븯???ㅼ???  const scaleX = screenWidth / GW;  // ?? 360px / 360 = 1.0
  const scaleY = screenHeight / GH;  // ?? 640px / 640 = 1.0

  // ?щ━湲?GIF ?꾩튂 (寃뚯엫 ?뚮젅??以묒씠怨??쒖떆?댁빞 ????
  if (state === 'playing' && girlReady && shouldShowGirlGif) {
    // 寃뚯엫 ?대? 醫뚰몴瑜??붾㈃ 醫뚰몴濡?蹂??    // GIRL_X = 2, girlY + GIRL_OFFSET_Y??寃뚯엫 ?대? 醫뚰몴
    const gx = GIRL_X * scaleX;
    const gy = (girlY + GIRL_OFFSET_Y) * scaleY;
    const gw = GIRL_W * scaleX;
    const gh = GIRL_H * scaleY;

    // img ?쒓렇??Canvas 而⑦뀒?대꼫 湲곗??쇰줈 ?꾩튂 ?ㅼ젙 (position: absolute?대?濡?
    // Canvas???쇱そ ??紐⑥꽌由ш? (0, 0)???섎룄濡?    // Canvas container is relative, images are absolute children.
    // So coordinates are relative to the container (canvas top-left).

    girlGifImg.style.left = gx + 'px';
    girlGifImg.style.top = gy + 'px';
    girlGifImg.style.width = gw + 'px';
    girlGifImg.style.height = gh + 'px';
    girlGifImg.style.display = 'block';
  } else {
    girlGifImg.style.display = 'none';
  }

  // ?щ씪?대뵫 GIF ?꾩튂 (?ш린 90%濡?議곗젅)
  if (state === 'playing' && slideReady && shouldShowSlideGif) {
    const slideScale = 0.9; // ?щ씪?대뵫 GIF ?ш린 90% (80%?먯꽌 10% 利앷?)
    const slideW = GIRL_W * slideScale;
    const slideH = GIRL_H * slideScale;
    const gx = GIRL_X * scaleX;
    const gy = (girlY + GIRL_OFFSET_Y) * scaleY;
    const gw = slideW * scaleX;
    const gh = slideH * scaleY;
    // 以묒븰 ?뺣젹???꾪빐 ?ㅽ봽??異붽?
    const offsetX = (GIRL_W - slideW) * scaleX * 0.5;
    const offsetY = (GIRL_H - slideH) * scaleY * 0.5;

    slideGifImg.style.left = (gx + offsetX) + 'px';
    slideGifImg.style.top = (gy + offsetY) + 'px';
    slideGifImg.style.width = gw + 'px';
    slideGifImg.style.height = gh + 'px';
    slideGifImg.style.display = 'block';
  } else {
    slideGifImg.style.display = 'none';
  }

  // 諛쒖궗 GIF ?꾩튂
  if (state === 'playing' && shootReady && shouldShowShootGif) {
    const gx = GIRL_X * scaleX;
    const gy = (girlY + GIRL_OFFSET_Y) * scaleY;
    const gw = GIRL_W * scaleX;
    const gh = GIRL_H * scaleY;

    shootGifImg.style.left = gx + 'px';
    shootGifImg.style.top = gy + 'px';
    shootGifImg.style.width = gw + 'px';
    shootGifImg.style.height = gh + 'px';
    shootGifImg.style.display = 'block';
  } else {
    shootGifImg.style.display = 'none';
  }

  // ??깂 ?섏?湲?GIF ?꾩튂
  if (state === 'playing' && bombReady && shouldShowBombGif) {
    const gx = GIRL_X * scaleX;
    const gy = (girlY + GIRL_OFFSET_Y) * scaleY;
    const gw = GIRL_W * scaleX;
    const gh = GIRL_H * scaleY;

    bombGifImg.style.left = gx + 'px';
    bombGifImg.style.top = gy + 'px';
    bombGifImg.style.width = gw + 'px';
    bombGifImg.style.height = gh + 'px';
    bombGifImg.style.display = 'block';
  } else {
    bombGifImg.style.display = 'none';
  }
}

// 珥앹븣 洹몃━湲? ?꾧킅?쇱엫 ?뱀깋 + 寃? ?뚮몢由?function drawBullet(b) {
  ctx.fillStyle = BULLET_FILL;
  ctx.fillRect(b.x, b.y, b.w, b.h);
  ctx.strokeStyle = BULLET_STROKE;
  ctx.lineWidth = 2;
  ctx.strokeRect(b.x, b.y, b.w, b.h);
}

// ??깂 洹몃━湲? ?뮗 ?대え吏
function drawBomb(b) {
  ctx.font = '28px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('?뮗', b.x + BOMB_W / 2, b.y + BOMB_H / 2);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}

// 鍮꾨뵒?ㅻ? gx,gy??洹몃━湲? scale ?앸왂/1?대㈃ 96횞180, 1.5硫?1.5諛?以묒떖 ?뺣젹). ?щ줈留덊궎 ?곸슜.
// drawVideoChroma ?⑥닔 ??젣 (MP4 鍮꾨뵒???ъ슜 ????

// ?대?吏瑜?gx,gy??洹몃━湲? GIF ?좊땲硫붿씠?섏? 留??꾨젅?꾨쭏???먮낯 ?대?吏瑜?吏곸젒 洹몃젮???ъ깮??function drawImageChroma(img, gx, gy, chromaKeyRef, scale) {
  const nw = img.naturalWidth || 0, nh = img.naturalHeight || 0;
  if (nw <= 0 || nh <= 0) return;
  const sc = (scale == null || scale === 1) ? 1 : scale;
  // ?먮낯 ?대?吏 鍮꾩쑉 ?좎?
  const aspectRatio = nw / nh;
  let dw, dh;
  if (sc === 1) {
    dw = GIRL_W;
    dh = GIRL_H;
  } else {
    // ?덈퉬 湲곗??쇰줈 怨꾩궛?섍퀬 ?믪씠???먮낯 鍮꾩쑉 ?좎?
    const baseWidth = GIRL_W * sc;
    dw = Math.round(baseWidth);
    dh = Math.round(baseWidth / aspectRatio);
  }

  // GIF ?뚯씪?몄? ?뺤씤 (?대?吏 ?뚯뒪 寃쎈줈 ?먮뒗 chromaKeyRef??isGif ?뚮옒洹몃줈 ?뺤씤)
  const imgSrc = img.src || '';
  const isGif = chromaKeyRef.isGif === true ||
    imgSrc.toLowerCase().includes('.gif') ||
    imgSrc.toLowerCase().includes('run.gif') ||
    imgSrc.toLowerCase().includes('sliding.gif') ||
    imgSrc.toLowerCase().includes('anim/');

  // GIF ?뚯씪??寃쎌슦 紐⑤뱺 泥섎━瑜?嫄대꼫?곌퀬 諛붾줈 ?먮낯 ?대?吏瑜?吏곸젒 洹몃━湲?  // ?닿쾬??GIF ?좊땲硫붿씠?섏쓣 ?ъ깮?섎뒗 ?좎씪???뺤떎??諛⑸쾿
  // ?ㅽ봽?ㅽ겕由?罹붾쾭?ㅻ? 嫄곗튂嫄곕굹 getImageData瑜??몄텧?섎㈃ ?뺤쟻 ?대?吏媛 ?섏뼱 ?좊땲硫붿씠?섏씠 硫덉땄
  if (isGif) {
    // 留??꾨젅?꾨쭏???먮낯 ?대?吏瑜?吏곸젒 洹몃━硫?釉뚮씪?곗?媛 GIF???꾩옱 ?꾨젅?꾩쓣 ?먮룞?쇰줈 ?낅뜲?댄듃??    ctx.drawImage(img, 0, 0, nw, nh, gx, gy, dw, dh);
    return;
  }

  // GIF媛 ?꾨땶 寃쎌슦?먮쭔 ?щ챸??泥댄겕 諛??щ줈留덊궎 泥섎━
  if (chromaKeyRef.chromaKey === null) {
    // 泥?濡쒕뱶 ???щ챸??泥댄겕 (??踰덈쭔)
    try {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = dw;
      tempCanvas.height = dh;
      const tempCtx = tempCanvas.getContext('2d');
      tempCtx.drawImage(img, 0, 0, nw, nh, 0, 0, dw, dh);
      const d = tempCtx.getImageData(0, 0, dw, dh);
      const data = d.data;
      let asum = 0, cnt = 0;
      const step = 6;
      // ?뚮몢由??섑뵆留곸쑝濡??щ챸???뺤씤
      for (var x = 0; x < dw; x += step) {
        var iT = (0 * dw + x) * 4;
        asum += data[iT + 3]; cnt++;
        var iB = ((dh - 1) * dw + x) * 4;
        asum += data[iB + 3]; cnt++;
      }
      for (var y = 0; y < dh; y += step) {
        var iL = (y * dw + 0) * 4;
        asum += data[iL + 3]; cnt++;
        var iR = (y * dw + (dw - 1)) * 4;
        asum += data[iR + 3]; cnt++;
      }
      const avgAlpha = asum / cnt;

      // ?щ챸???대?吏??寃쎌슦 (?됯퇏 ?뚰뙆媛믪씠 ??쓬)
      if (avgAlpha < 20) {
        chromaKeyRef.chromaKey = 'transparent';
      } else {
        // 遺덊닾紐낇븳 諛곌꼍???덈뒗 寃쎌슦 ?щ줈留덊궎 泥섎━ ?꾩슂
        chromaKeyRef.chromaKey = 'opaque';
      }
    } catch (e) {
      // getImageData ?ㅽ뙣 ???щ챸?쇰줈 媛꾩＜
      chromaKeyRef.chromaKey = 'transparent';
    }
  }

  // ?щ챸 PNG??留??꾨젅?꾨쭏???먮낯 ?대?吏瑜?吏곸젒 洹몃━湲?  if (chromaKeyRef.chromaKey === 'transparent') {
    ctx.drawImage(img, 0, 0, nw, nh, gx, gy, dw, dh);
    return;
  }

  // 遺덊닾紐?諛곌꼍???덈뒗 寃쎌슦 ?щ줈留덊궎 泥섎━ (PNG ??
  // ??寃쎌슦???щ줈留덊궎 泥섎━媛 ?꾩슂?섏?留? GIF媛 ?꾨땺 媛?μ꽦???믪쓬
  try {
    var off, offCtx;
    if (sc === 1) {
      if (!girlOffscreen) {
        girlOffscreen = document.createElement('canvas');
        girlOffscreen.width = GIRL_W;
        girlOffscreen.height = GIRL_H;
        girlOffCtx = girlOffscreen.getContext('2d');
      }
      off = girlOffscreen; offCtx = girlOffCtx;
    } else {
      if (!scaleOffscreen || scaleOffscreen.width !== dw || scaleOffscreen.height !== dh) {
        scaleOffscreen = document.createElement('canvas');
        scaleOffscreen.width = dw;
        scaleOffscreen.height = dh;
        scaleOffCtx = scaleOffscreen.getContext('2d');
      }
      off = scaleOffscreen; offCtx = scaleOffCtx;
    }

    offCtx.clearRect(0, 0, dw, dh);
    offCtx.drawImage(img, 0, 0, nw, nh, 0, 0, dw, dh);
    const d = offCtx.getImageData(0, 0, dw, dh);
    const data = d.data;

    // ?щ줈留덊궎 ?됱긽 媛먯? (泥??꾨젅?꾩뿉?쒕쭔)
    if (!chromaKeyRef.chromaKeyRgb) {
      let rsum = 0, gsum = 0, bsum = 0, cnt = 0;
      const step = 6;
      for (var x = 0; x < dw; x += step) {
        var iT = (0 * dw + x) * 4;
        rsum += data[iT]; gsum += data[iT + 1]; bsum += data[iT + 2]; cnt++;
        var iB = ((dh - 1) * dw + x) * 4;
        rsum += data[iB]; gsum += data[iB + 1]; bsum += data[iB + 2]; cnt++;
      }
      for (var y = 0; y < dh; y += step) {
        var iL = (y * dw + 0) * 4;
        rsum += data[iL]; gsum += data[iL + 1]; bsum += data[iL + 2]; cnt++;
        var iR = (y * dw + (dw - 1)) * 4;
        rsum += data[iR]; gsum += data[iR + 1]; bsum += data[iR + 2]; cnt++;
      }
      chromaKeyRef.chromaKeyRgb = [rsum / cnt, gsum / cnt, bsum / cnt];
    }

    const r0 = chromaKeyRef.chromaKeyRgb[0], g0 = chromaKeyRef.chromaKeyRgb[1], b0 = chromaKeyRef.chromaKeyRgb[2];
    const distSq = CHROMA_DIST * CHROMA_DIST;
    const gR = CHROMA_GREEN[0], gG = CHROMA_GREEN[1], gB = CHROMA_GREEN[2];
    const greenDistSq = CHROMA_DIST_GREEN * CHROMA_DIST_GREEN;
    const lR = CHROMA_LIME[0], lG = CHROMA_LIME[1], lB = CHROMA_LIME[2];
    const limeDistSq = CHROMA_DIST_LIME * CHROMA_DIST_LIME;

    // ???됱긽 蹂댄샇???됱긽
    const NAVY_R = 30, NAVY_G = 58, NAVY_B = 95;
    const WHITE_THRESHOLD = 200;
    const SKIN_R = 255, SKIN_G = 219, SKIN_B = 172;
    const HAIR_R = 44, HAIR_G = 24, HAIR_B = 16;
    const CLOTHES_PROTECT_DIST = 80;

    for (var i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const dNavy = Math.sqrt((r - NAVY_R) * (r - NAVY_R) + (g - NAVY_G) * (g - NAVY_G) + (b - NAVY_B) * (b - NAVY_B));
      const dSkin = Math.sqrt((r - SKIN_R) * (r - SKIN_R) + (g - SKIN_G) * (g - SKIN_G) + (b - SKIN_B) * (b - SKIN_B));
      const dHair = Math.sqrt((r - HAIR_R) * (r - HAIR_R) + (g - HAIR_G) * (g - HAIR_G) + (b - HAIR_B) * (b - HAIR_B));
      const isWhite = r >= WHITE_THRESHOLD && g >= WHITE_THRESHOLD && b >= WHITE_THRESHOLD;
      const isClothes = dNavy < CLOTHES_PROTECT_DIST || isWhite || dSkin < CLOTHES_PROTECT_DIST || dHair < CLOTHES_PROTECT_DIST;
      if (isClothes) continue;

      const dr = r - r0, dg = g - g0, db = b - b0;
      const dGr = r - gR, dGg = g - gG, dGb = b - gB;
      const dLr = r - lR, dLg = g - lG, dLb = b - lB;
      const nearBorder = dr * dr + dg * dg + db * db <= distSq;
      const nearGreen = (g > r && g > b) && (dGr * dGr + dGg * dGg + dGb * dGb <= greenDistSq);
      const nearLime = (g > r && g > b && b < 50) && (dLr * dLr + dLg * dLg + dLb * dLb <= limeDistSq);
      if (nearBorder || nearGreen || nearLime) data[i + 3] = 0;
    }

    // ?щ줈留덊궎 泥섎━???대?吏 洹몃━湲?    if (sc === 1) {
      if (!girlChromaOffscreen) {
        girlChromaOffscreen = document.createElement('canvas');
        girlChromaOffscreen.width = GIRL_W;
        girlChromaOffscreen.height = GIRL_H;
        girlChromaOffCtx = girlChromaOffscreen.getContext('2d');
      }
      girlChromaOffCtx.putImageData(d, 0, 0);
      ctx.drawImage(girlChromaOffscreen, 0, 0, dw, dh, gx, gy, dw, dh);
    } else {
      if (!scaleOffscreen || scaleOffscreen.width !== dw || scaleOffscreen.height !== dh) {
        scaleOffscreen = document.createElement('canvas');
        scaleOffscreen.width = dw;
        scaleOffscreen.height = dh;
        scaleOffCtx = scaleOffscreen.getContext('2d');
      }
      scaleOffCtx.putImageData(d, 0, 0);
      ctx.drawImage(scaleOffscreen, 0, 0, dw, dh, gx, gy, dw, dh);
    }
  } catch (e) {
    chromaUnavailable = true;
    ctx.drawImage(img, 0, 0, nw, nh, gx, gy, dw, dh);
  }
}

// GIF ?쒖떆 ?곹깭 (?꾩뿭 蹂?섎줈 留뚮뱾?댁꽌 updateGifPositions?먯꽌 ?묎렐 媛?ν븯寃?
let shouldShowGirlGif = true;
let shouldShowSlideGif = false;
let shouldShowShootGif = false;
let shouldShowBombGif = false;

// 二쇱씤怨?洹몃━湲? ?덊듃 ??hurt/down, 諛쒖궗 以?shoot, ?꾨땲硫?run. ?щ챸 PNG ?ъ슜. 誘몃줈????罹붾쾭???대갚
function drawGirl() {
  const gx = GIRL_X, gy = girlY + GIRL_OFFSET_Y;

  // ?ㅻⅨ ?숈옉 以묒씪 ?뚮뒗 湲곕낯 ?대?吏 ?④린湲?  let showGif = true;
  shouldShowGirlGif = false;
  shouldShowSlideGif = false;
  shouldShowShootGif = false;
  shouldShowBombGif = false;

  if (pauseFramesLeft > 0) {
    // ?덊듃 ?? GIF ?④린怨?hurt/down ?대?吏 ?쒖떆
    showGif = false;
    shouldShowGirlGif = false;
    if (hp <= 0 && pauseFramesLeft <= 12 && downImage && downImage.naturalWidth > 0) {
      // ?щ━湲?洹몃┝怨?媛숈? 鍮꾩쑉濡?異뺤냼 ????諛곕줈 ?뺣? ??10% 異뺤냼 (?먮낯 鍮꾩쑉 ?좎?)
      const runOriginalWidth = 560;
      const scaleRatio = GIRL_W / runOriginalWidth; // ?щ━湲?洹몃┝??異뺤냼 鍮꾩쑉
      // 二쎈뒗 洹몃┝???먮낯 ?ш린瑜?湲곗??쇰줈 媛숈? 鍮꾩쑉 ?곸슜 ????諛? 10% 異뺤냼
      const scaledWidth = downImage.naturalWidth * scaleRatio * 2 * 0.9;
      const scaledHeight = downImage.naturalHeight * scaleRatio * 2 * 0.9;
      // ?щ━湲?二쇱씤怨듦낵 媛숈? ?꾩튂 (以묒븰 ?뺣젹)
      const dx = gx + GIRL_W / 2 - scaledWidth / 2;
      const dy = gy + GIRL_H / 2 - scaledHeight / 2;
      ctx.drawImage(downImage, 0, 0, downImage.naturalWidth, downImage.naturalHeight, dx, dy, scaledWidth, scaledHeight);
      return;
    }
    if (hurtImage && hurtImage.naturalWidth > 0) {
      // ?щ━湲?二쇱씤怨듦낵 ?뺥솗??媛숈? ?꾩튂? ?ш린
      const hx = gx;
      const hy = gy;
      ctx.drawImage(hurtImage, 0, 0, hurtImage.naturalWidth, hurtImage.naturalHeight, hx, hy, GIRL_W, GIRL_H);
      return;
    }
  }
  if (slideActive) {
    // ?щ씪?대뵫 以? img ?쒓렇濡?GIF ?좊땲硫붿씠???쒖떆 (updateGifPositions?먯꽌 泥섎━)
    showGif = false;
    shouldShowGirlGif = false;
    shouldShowSlideGif = true;
    return;
  }
  if (shootActive && shootReady) {
    // 諛쒖궗 以? img ?쒓렇濡?GIF ?좊땲硫붿씠???쒖떆 (updateGifPositions?먯꽌 泥섎━)
    showGif = false;
    shouldShowGirlGif = false;
    shouldShowShootGif = true;
    return;
  }
  if (bombActive && bombReady) {
    // ??깂 ?섏?湲?以? img ?쒓렇濡?GIF ?좊땲硫붿씠???쒖떆 (updateGifPositions?먯꽌 泥섎━)
    showGif = false;
    shouldShowGirlGif = false;
    shouldShowBombGif = true;
    return;
  }

  // 湲곕낯 ?щ━湲??곹깭 ?먮뒗 ?먰봽 以묒씪 ??GIF ?쒖떆 (?ㅻⅨ ?숈옉???놁쓣 ??
  // Canvas?먯꽌??GIF ?좊땲硫붿씠?섏씠 ?ъ깮?섏? ?딆쑝誘濡?img ?쒓렇瑜??ъ슜
  if (showGif) {
    // img ?쒓렇濡?GIF ?좊땲硫붿씠???쒖떆 (updateGifPositions?먯꽌 泥섎━)
    shouldShowGirlGif = true;
    shouldShowSlideGif = false;
    return;
  }
  // ?대갚: 罹붾쾭?ㅻ줈 洹몃┛ ?몃씪蹂??뚮? (2諛??ㅼ???
  ctx.save();
  ctx.translate(GIRL_X, girlY + GIRL_OFFSET_Y);
  ctx.scale(2, 2);
  const x = 0;
  const y = 0;
  runFrame = Math.floor(frameCount / 8) % 2;

  // 癒몃━ (?대갚: 48횞90 湲곗?, scale 2濡?96횞180)
  ctx.fillStyle = '#ffdbac';
  ctx.beginPath();
  ctx.arc(x + 24, y + 18, 16, 0, Math.PI * 2);
  ctx.fill();
  // 癒몃━移대씫 (ellipse 誘몄???釉뚮씪?곗?: arc濡?諛섏썝 ?泥?
  ctx.fillStyle = '#2c1810';
  ctx.beginPath();
  try {
    ctx.ellipse(x + 24, y + 20, 16, 14, 0, 0, Math.PI);
  } catch (e) {
    ctx.arc(x + 24, y + 20, 14, 0, Math.PI);
  }
  ctx.fill();

  // 紐? ?몃씪蹂?(???붿툩 + ?ㅼ씠鍮?移쇰씪)
  ctx.fillStyle = '#fff';
  ctx.fillRect(x + 6, y + 32, 36, 28);
  ctx.fillStyle = '#1e3a5f';
  ctx.fillRect(x + 10, y + 34, 28, 8);
  ctx.fillStyle = '#fff';
  ctx.fillRect(x + 14, y + 36, 6, 6);
  ctx.fillRect(x + 26, y + 36, 6, 6);

  // 移섎쭏 (?ㅼ씠鍮?
  ctx.fillStyle = '#1e3a5f';
  ctx.beginPath();
  ctx.moveTo(x + 8, y + 58);
  ctx.lineTo(x + 40, y + 58);
  ctx.lineTo(x + 36, y + 78);
  ctx.lineTo(x + 12, y + 78);
  ctx.closePath();
  ctx.fill();

  // ?ㅻ━ (?щ━湲??꾨젅??
  ctx.strokeStyle = '#2c1810';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  if (runFrame === 0) {
    ctx.beginPath();
    ctx.moveTo(x + 18, y + 78);
    ctx.lineTo(x + 14, y + 98);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + 32, y + 78);
    ctx.lineTo(x + 36, y + 92);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(x + 18, y + 78);
    ctx.lineTo(x + 22, y + 92);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + 32, y + 78);
    ctx.lineTo(x + 28, y + 98);
    ctx.stroke();
  }
  ctx.restore();
}

// ?뚯떇 洹몃━湲? ?대え吏 + ?먮㈇?섎뒗 ?꾧킅???뚮몢由?(?ш컖???쒓굅, ?먯껜 諛쒓킅 ?④낵)
function drawFood(f) {
  // ?쇨꺽???뚯떇? 源쒕묀???④낵
  let alpha = 1.0;
  if (f.hitFrames && f.hitFrames > 0) {
    // 源쒕묀???④낵: 鍮좊Ⅴ寃?源쒕묀?대떎媛 ?щ씪吏?    const blinkSpeed = 0.5;
    const progress = f.hitFrames / HIT_PAUSE_FRAMES;
    alpha = Math.sin(progress * Math.PI * 8) * 0.5 + 0.5; // 0.0 ~ 1.0 ?ъ씠 源쒕묀??    if (progress > 0.7) {
      // 留덉?留?30% 援ш컙?먯꽌???먯젏 ?щ씪吏?      alpha *= (1 - (progress - 0.7) / 0.3);
    }
  }

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = '32px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // ?먮㈇ ?꾧킅 誘쇳듃??(Bright Mint) ?뚮몢由??④낵
  const blink = 0.4 + 0.6 * Math.sin(frameCount * 0.15); // 泥쒖쿇???먮㈇

  // 諛앹? 誘쇳듃??洹몃┝?먮줈 ?뚮몢由??④낵, alpha媛믪쑝濡??먮㈇
  ctx.shadowColor = `rgba(0, 255, 170, ${1.0})`;
  ctx.shadowBlur = 10 * blink + 5; // 釉붾윭 ?ш린媛 而ㅼ죱???묒븘議뚮떎 ??(5~15)

  ctx.fillText(f.emoji, f.x + FOOD_W / 2, f.y + FOOD_H / 2);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.restore();
}

// 諛곌꼍 ?ㅽ겕濡? cover 鍮꾩쑉 ?좎?, 蹂댁씠??理쒗븯???꾨줈)??罹먮┃??諛쒕컩(GROUND_Y)???ㅻ룄濡?function drawBackground() {
  if (bgReady && bgImage.naturalWidth) {
    const iw = bgImage.naturalWidth, ih = bgImage.naturalHeight;
    const scale = Math.max(GW / iw, GH / ih);
    const dw = iw * scale, dh = ih * scale;
    const dy = GROUND_Y - dh; // ?ㅼ??쇰맂 諛곌꼍 ?섎떒 = GROUND_Y(諛쒕컩)
    const period = Math.max(dw, 1);
    const s = scrollOffset % period;
    ctx.drawImage(bgImage, 0, 0, iw, ih, -s, dy, dw, dh);
    ctx.drawImage(bgImage, 0, 0, iw, ih, period - s, dy, dw, dh);
  } else {
    ctx.fillStyle = '#16213e';
    ctx.fillRect(0, 0, GW, GH);
  }
}

const TOP_UI_Y = 26;

// 泥대젰 UI: 醫뚯긽??媛먯옄?源 ?뜜 3媛? ?섎굹??媛먯냼. ?곷떒 UI? ?쒕줈 媛?대뜲?뺣젹
function drawHp() {
  ctx.font = '24px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  for (let i = 0; i < hp; i++) {
    ctx.fillText('?뜜', 12 + i * 26, TOP_UI_Y);
  }
  ctx.textBaseline = 'alphabetic';
}

// 寃곗듅源뚯? 嫄곕━: 200m??m. ?곷떒 以묒븰, ?몃옉+寃? 援듭? ?뚮몢由? ?섎닎紐낆“. ?쒓? 1.5諛? ?곷떒 UI? ?쒕줈 媛?대뜲?뺣젹
function drawDistance() {
  const d = Math.max(0, Math.floor(options.clearDistance - scrollOffset / PIXELS_PER_METER));
  const text = d + ' m';
  ctx.font = 'bold 36px ' + FONT_HANGUL;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 4;
  ctx.strokeText(text, GW / 2, TOP_UI_Y);
  ctx.fillStyle = '#ffeb00';
  ctx.fillText(text, GW / 2, TOP_UI_Y);
}

// ?꾪솚/??깂 ?덊듃: ???곗?硫댁꽌 蹂꾩“媛? ex.scale ?덉쑝硫??ш쾶 (??깂=2)
function drawExplosion(ex) {
  const s = ex.scale || 1;
  const t = ex.frame / ex.maxFrames;
  const aBase = 1 - t;
  const twinkle = 0.55 + 0.45 * Math.sin(ex.frame * 0.8);

  // 0) ?? 珥덈컲 2?꾨젅??媛뺥븳 ?곗깋 ?뚮옒??(?곗????쒓컙)
  if (ex.frame < 2) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.98)';
    ctx.fillRect(ex.x - 8 * s, ex.y - 8 * s, 16 * s, 16 * s);
  }

  // 1) LED 肄붿뼱: ???ш쾶 (9x9, 5x5)
  const coreA = aBase * twinkle;
  ctx.fillStyle = 'rgba(255, 255, 255, ' + coreA + ')';
  ctx.fillRect(ex.x - 4 * s, ex.y - 4 * s, 9 * s, 9 * s);
  ctx.fillStyle = 'rgba(255, 200, 220, ' + (coreA * 0.8) + ')';
  ctx.fillRect(ex.x - 2 * s, ex.y - 2 * s, 5 * s, 5 * s);

  // 2) 蹂꾩“媛? 4諛⑺뼢 蹂?紐⑥뼇 ?뚰렪, 吏꾪솉/?뱀깋, 留롮씠쨌硫由?肉뚮━湲?  const N = 24;
  const seed = (ex.x * 0.02 + ex.y * 0.02) % 1;
  const R = 5 * s, r = 2.5 * s;
  const c = 0.707;
  for (let i = 0; i < N; i++) {
    const angle = (i / N) * Math.PI * 2 + seed * 6.28;
    const dist = (ex.frame * 5 + (i % 5) * 2.5) * s;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist;
    const dotTwinkle = 0.85 + 0.15 * Math.sin(ex.frame * 0.6 + i * 0.5);
    const dotA = aBase * dotTwinkle;
    const isCrimson = (i % 2 === 0);

    ctx.save();
    ctx.translate(ex.x + dx, ex.y + dy);
    ctx.rotate(angle);
    ctx.fillStyle = isCrimson
      ? 'rgba(220, 40, 70, ' + dotA + ')'
      : 'rgba(50, 230, 100, ' + dotA + ')';
    ctx.beginPath();
    ctx.moveTo(0, -R);
    ctx.lineTo(r * c, -r * c);
    ctx.lineTo(R, 0);
    ctx.lineTo(r * c, r * c);
    ctx.lineTo(0, R);
    ctx.lineTo(-r * c, r * c);
    ctx.lineTo(-R, 0);
    ctx.lineTo(-r * c, -r * c);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

// ?ㅽ뀒?댁??대━???꾩슜 ??＝: 洹밸챸??諛앹? burst (drawExplosion ?ы솢??????
function drawClearFirework(fw) {
  const t = fw.frame / fw.maxFrames;
  const a = 1 - t;
  if (fw.frame < 2) {
    ctx.fillStyle = 'rgba(255,255,255,0.98)';
    ctx.beginPath();
    ctx.arc(fw.x, fw.y, 14, 0, Math.PI * 2);
    ctx.fill();
  }
  const R = 6 + fw.frame * 2.2;
  const N = 16;
  const colors = ['rgba(255,255,255,', 'rgba(255,255,255,', 'rgba(255,255,240,', 'rgba(255,240,255,'];
  for (let i = 0; i < N; i++) {
    const angle = (i / N) * Math.PI * 2 + fw.seed;
    const dx = Math.cos(angle) * R;
    const dy = Math.sin(angle) * R;
    const c = colors[i % 4];
    ctx.fillStyle = c + (a * 0.98).toFixed(2) + ')';
    ctx.fillRect(fw.x + dx - 2, fw.y + dy - 2, 4, 4);
  }
  ctx.fillStyle = 'rgba(255,255,255,' + (a * 0.95).toFixed(2) + ')';
  ctx.beginPath();
  ctx.arc(fw.x, fw.y, 4, 0, Math.PI * 2);
  ctx.fill();
}

// ?뚯떇 ??뙆쨌??깂 ?곗쭚: ??諛섏쭩?닿쾶 蹂?뺥븳 ??＝ (ex: {x,y,frame,maxFrames,scale,emoji})
function drawSparklyFirework(ex) {
  // ??컻 ?대え吏媛 ?덉쑝硫??대え吏濡??쒖떆
  if (ex.emoji) {
    const t = ex.frame / ex.maxFrames;
    const scale = 1 + (1 - t) * 0.5; // ?먯젏 而ㅼ??ㅺ? ?щ씪吏?    const alpha = 1 - t;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = (32 * scale) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(ex.emoji, ex.x, ex.y);
    ctx.restore();
    return;
  }

  const s = ex.scale || 1;
  const t = ex.frame / ex.maxFrames;
  const a = 1 - t;
  const seed = ((ex.x * 0.02 + ex.y * 0.02) % 1) * 6.28;
  if (ex.frame < 2) {
    ctx.fillStyle = 'rgba(255,255,255,0.98)';
    ctx.beginPath();
    ctx.arc(ex.x, ex.y, 12 * s, 0, Math.PI * 2);
    ctx.fill();
  }
  const R = (5 + ex.frame * 2) * s;
  const N = 20;
  const colors = ['rgba(255,255,255,', 'rgba(255,255,240,', 'rgba(255,240,255,', 'rgba(240,255,255,'];
  for (let i = 0; i < N; i++) {
    const tw = 0.88 + 0.24 * Math.sin(ex.frame * 1.3 + i * 0.6);
    const angle = (i / N) * Math.PI * 2 + seed;
    const dx = Math.cos(angle) * R;
    const dy = Math.sin(angle) * R;
    const c = colors[i % 4];
    ctx.fillStyle = c + (Math.min(1, a * tw * 0.98)).toFixed(2) + ')';
    const sz = Math.max(2, 3 * s);
    ctx.fillRect(ex.x + dx - sz / 2, ex.y + dy - sz / 2, sz, sz);
  }
  const coreTw = 0.9 + 0.2 * Math.sin(ex.frame * 1.1);
  ctx.fillStyle = 'rgba(255,255,255,' + (Math.min(1, a * coreTw * 0.95)).toFixed(2) + ')';
  ctx.beginPath();
  ctx.arc(ex.x, ex.y, 4 * s, 0, Math.PI * 2);
  ctx.fill();
}

// Stage 1 Clear: "Stage 1 Clear" ?띿뒪???붾㈃ ?? + 洹밸챸??諛앹? ??＝. 5珥?????댄? 蹂듦? (MP4 ?쒓굅)
function drawStage1Clear() {
  ctx.clearRect(0, 0, GW, GH);
  stage1ClearFrames++;
  drawBackground();
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(0, 0, GW, GH);
  if (stage1ClearFrames % 2 === 0) {
    clearFireworks.push({
      x: GW / 2 + (Math.random() - 0.5) * 220,
      y: GH / 2 + (Math.random() - 0.5) * 180,
      frame: 0,
      maxFrames: 32,
      seed: Math.random() * 6.28
    });
  }
  for (let i = clearFireworks.length - 1; i >= 0; i--) {
    clearFireworks[i].frame++;
    if (clearFireworks[i].frame >= clearFireworks[i].maxFrames) clearFireworks.splice(i, 1);
  }
  clearFireworks.forEach(drawClearFirework);
  // ?고듃: ?붾㈃ ?덉뿉 紐⑤몢 ?쒖떆 (measureText濡?fit)
  const str = 'Stage 1 Clear';
  let fs = 52;
  for (; fs >= 24; fs -= 2) {
    ctx.font = 'bold ' + fs + 'px sans-serif';
    if (ctx.measureText(str).width <= GW - 32) break;
  }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = Math.max(2, Math.floor(fs / 12));
  ctx.strokeText(str, GW / 2, GH / 2);
  ctx.fillStyle = '#ffeb00';
  ctx.fillText(str, GW / 2, GH / 2);

  // 1?ㅽ뀒?댁? ?대━???대?吏 洹몃━湲?  if (stage1ClearReady) {
    const iw = stage1ClearImage.naturalWidth;
    const ih = stage1ClearImage.naturalHeight;
    // ?붾㈃ ?덈퉬??留욎땄 (鍮꾩쑉 ?좎?)
    const scale = GW / iw;
    const dh = ih * scale;
    const dy = GH / 2 - dh / 2 - 50; // 以묒븰蹂대떎 ?쎄컙 ??    ctx.drawImage(stage1ClearImage, 0, 0, iw, ih, 0, dy, GW, dh);
  }

  // ?띿뒪?? "Let's go to next stage!!"
  ctx.font = 'bold 24px "Courier New", monospace';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 3;

  // 源쒕묀???④낵
  if (Math.floor(Date.now() / 500) % 2 === 0) {
    ctx.strokeText("Let's go to next stage!!", GW / 2, GH - 100);
    ctx.fillText("Let's go to next stage!!", GW / 2, GH - 100);
  }

  ctx.font = '16px "Courier New", monospace';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.strokeText("Press Enter or Click", GW / 2, GH - 60);
  ctx.fillText("Press Enter or Click", GW / 2, GH - 60);

  // ?먮룞 ??댄? 蹂듦? ?쒓굅 (?ъ슜???낅젰 ?湲?
}

// ?꾧컧 ?붾㈃ 洹몃━湲?// let selectedFoodIndex = 0; // Moved to top
let collectionScrollOffset = 0; // ?뚯떇 洹몃━???ㅽ겕濡??ㅽ봽??let isDraggingCollection = false; // ?쒕옒洹?以??щ?
let dragStartX = 0; // ?쒕옒洹??쒖옉 x 醫뚰몴
let dragStartScrollOffset = 0; // ?쒕옒洹??쒖옉 ???ㅽ겕濡??ㅽ봽??let foodShakeFrame = 0; // ?뚯떇 洹몃┝ ?붾뱾由??꾨젅??移댁슫??let foodShakeOffset = 0; // ?뚯떇 洹몃┝ ?붾뱾由??ㅽ봽??(x 醫뚰몴)
const FOOD_SHAKE_DURATION = 20; // ?붾뱾由?吏???쒓컙 (?꾨젅??
const FOOD_SHAKE_INTENSITY = 8; // ?붾뱾由?媛뺣룄 (?쎌?)

// ?꾧컧 ?붾㈃ 珥덇린?????ㅽ겕濡?由ъ뀑
function resetCollectionScroll() {
  collectionScrollOffset = 0;
  selectedFoodIndex = 0;
  foodShakeFrame = 0;
  foodShakeOffset = 0;
}

// ?꾧컧 ??ぉ (?꾩옱 5媛?+ 援ы쁽 ?덉젙 5媛?
// COLLECTION_ITEMS moved to config.js
// const COLLECTION_ITEMS = [ ... ];

function drawCollection() {
  ctx.clearRect(0, 0, GW, GH);

  // 諛곌꼍
  ctx.fillStyle = '#16213e';
  ctx.fillRect(0, 0, GW, GH);

  // ?곷떒 ?ㅻ뜑
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 36px ' + FONT_HANGUL;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 4;
  ctx.strokeText('?꾧컧', GW / 2, 40);
  ctx.fillText('?꾧컧', GW / 2, 40);

  // ?ㅻ줈 媛湲?踰꾪듉
  ctx.fillStyle = '#e94560';
  if (typeof ctx.roundRect === 'function') {
    ctx.beginPath();
    ctx.roundRect(20, 20, 60, 40, 8);
    ctx.fill();
  } else {
    ctx.fillRect(20, 20, 60, 40);
  }
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 20px ' + FONT_HANGUL;
  ctx.textAlign = 'center';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.strokeText('??, 50, 40);
  ctx.fillText('??, 50, 40);

  // ?뚯떇 洹몃━??(10媛? ?ㅽ겕濡?媛??
  const cardSize = 60;
  const cardSpacing = 15;
  const startX = 30;
  const gridY = 100;
  const gridHeight = cardSize + 20; // 洹몃━???곸뿭 ?믪씠
  const totalWidth = COLLECTION_ITEMS.length * (cardSize + cardSpacing) - cardSpacing;
  const visibleWidth = GW - startX * 2;

  // ?ㅽ겕濡?踰붿쐞 ?쒗븳
  const maxScroll = Math.max(0, totalWidth - visibleWidth);
  collectionScrollOffset = Math.max(0, Math.min(maxScroll, collectionScrollOffset));

  // ?좏깮????ぉ???붾㈃??蹂댁씠?꾨줉 ?ㅽ겕濡?議곗젙
  const selectedCardX = selectedFoodIndex * (cardSize + cardSpacing);
  const selectedCardRight = selectedCardX + cardSize;
  const visibleLeft = collectionScrollOffset;
  const visibleRight = collectionScrollOffset + visibleWidth;

  if (selectedCardX < visibleLeft) {
    collectionScrollOffset = selectedCardX;
  } else if (selectedCardRight > visibleRight) {
    collectionScrollOffset = selectedCardRight - visibleWidth;
  }

  // 洹몃━???곸뿭 ?대━??  ctx.save();
  ctx.beginPath();
  ctx.rect(startX, gridY - 10, visibleWidth, gridHeight);
  ctx.clip();

  COLLECTION_ITEMS.forEach((item, index) => {
    const cardX = startX + index * (cardSize + cardSpacing) - collectionScrollOffset;
    const isSelected = index === selectedFoodIndex;

    // ?붾㈃ 諛뽰씠硫?洹몃━吏 ?딆쓬
    if (cardX + cardSize < startX || cardX > startX + visibleWidth) return;

    let isDiscovered = false;
    if (item.type === 'food') {
      const foodData = collectionData[item.emoji];
      isDiscovered = foodData && foodData.discovered;
    } else {
      // ?뚮젅?댁뒪??붾뒗 ??긽 誘몃컻寃??곹깭
      isDiscovered = false;
    }

    // 移대뱶 諛곌꼍
    if (isDiscovered) {
      ctx.fillStyle = isSelected ? 'rgba(57, 255, 20, 0.3)' : 'rgba(255, 255, 255, 0.1)';
    } else {
      ctx.fillStyle = 'rgba(100, 100, 100, 0.2)';
    }
    if (typeof ctx.roundRect === 'function') {
      ctx.beginPath();
      ctx.roundRect(cardX, gridY, cardSize, cardSize, 8);
      ctx.fill();
    } else {
      ctx.fillRect(cardX, gridY, cardSize, cardSize);
    }

    // 移대뱶 ?뚮몢由?    ctx.strokeStyle = isDiscovered
      ? (isSelected ? '#39ff14' : 'rgba(255, 255, 255, 0.5)')
      : '#666666';
    ctx.lineWidth = isSelected ? 3 : 2;
    if (typeof ctx.roundRect === 'function') {
      ctx.beginPath();
      ctx.roundRect(cardX, gridY, cardSize, cardSize, 8);
      ctx.stroke();
    } else {
      ctx.strokeRect(cardX, gridY, cardSize, cardSize);
    }

    // ?뚯떇 ?대え吏 ?먮뒗 臾쇱쓬??    ctx.font = '40px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (item.type === 'food' && isDiscovered) {
      ctx.fillStyle = '#fff';
      ctx.fillText(item.emoji, cardX + cardSize / 2, gridY + cardSize / 2);
    } else {
      // ?뚮젅?댁뒪????먮뒗 誘몃컻寃??뚯떇
      ctx.font = 'bold 40px sans-serif';
      ctx.fillStyle = '#999999';
      ctx.fillText('?', cardX + cardSize / 2, gridY + cardSize / 2);
    }
  });

  ctx.restore();

  // ?좏깮???뚯떇 ?곸꽭 ?뺣낫 ?⑤꼸
  const selectedItem = COLLECTION_ITEMS[selectedFoodIndex];
  let selectedEmoji = null;
  let foodInfo = null;
  let foodData = null;
  let isDiscovered = false;

  if (selectedItem.type === 'food') {
    selectedEmoji = selectedItem.emoji;
    foodInfo = FOOD_COLLECTION_DATA[selectedEmoji];
    foodData = collectionData[selectedEmoji];
    isDiscovered = foodData && foodData.discovered;
  }

  const panelY = 200;
  const panelH = GH - panelY - 20;

  // ?⑤꼸 諛곌꼍
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(20, panelY, GW - 40, panelH);

  if (selectedItem.type === 'food' && isDiscovered && foodInfo) {
    // ?뚯떇 ?대え吏 (???ш린) - ?붾뱾由??④낵 ?곸슜
    ctx.font = '64px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    ctx.fillText(selectedEmoji, GW / 2 + foodShakeOffset, panelY + 50);

    // ?대쫫
    ctx.font = 'bold 28px ' + FONT_HANGUL;
    ctx.fillText(foodInfo.name, GW / 2, panelY + 120);
    ctx.font = '20px sans-serif';
    ctx.fillStyle = '#cccccc';
    ctx.fillText(foodInfo.nameEn, GW / 2, panelY + 150);

    // 遺???잛닔
    ctx.font = 'bold 32px ' + FONT_HANGUL;
    ctx.fillStyle = '#39ff14';
    ctx.fillText('遺???잛닔: ' + (foodData.count || 0) + '??, GW / 2, panelY + 200);

    // 泥섏쓬 諛쒓껄
    if (foodData.firstFound) {
      const firstDate = new Date(foodData.firstFound);
      const dateStr = firstDate.toLocaleDateString('ko-KR') + ' ' +
        firstDate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
      ctx.font = '18px ' + FONT_HANGUL;
      ctx.fillStyle = '#cccccc';
      ctx.fillText('泥섏쓬 諛쒓껄: ' + dateStr, GW / 2, panelY + 240);
    }

    // 留덉?留?諛쒓껄
    if (foodData.lastFound) {
      const lastDate = new Date(foodData.lastFound);
      const dateStr = lastDate.toLocaleDateString('ko-KR') + ' ' +
        lastDate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
      ctx.font = '18px ' + FONT_HANGUL;
      ctx.fillStyle = '#cccccc';
      ctx.fillText('留덉?留?諛쒓껄: ' + dateStr, GW / 2, panelY + 270);
    }

    // ?ㅻ챸
    ctx.font = '18px ' + FONT_HANGUL;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    const descY = panelY + 310;
    const descLines = wrapText(ctx, foodInfo.description, GW - 80, 18);
    descLines.forEach((line, i) => {
      ctx.fillText(line, 40, descY + i * 25);
    });
  } else if (selectedItem.type === 'food') {
    // 誘몃컻寃??뚯떇 ?곹깭
    ctx.font = 'bold 24px ' + FONT_HANGUL;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#999999';
    ctx.fillText('?꾩쭅 諛쒓껄?섏? 紐삵븳 ?뚯떇?낅땲??', GW / 2, panelY + panelH / 2);
    ctx.font = '18px ' + FONT_HANGUL;
    ctx.fillText('寃뚯엫???뚮젅?댄븯???뚯떇??諛쒓껄?섏꽭??', GW / 2, panelY + panelH / 2 + 40);
  } else {
    // ?뚮젅?댁뒪???(援ы쁽 ?덉젙)
    ctx.font = 'bold 24px ' + FONT_HANGUL;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#999999';
    ctx.fillText('援ы쁽 ?덉젙', GW / 2, panelY + panelH / 2);
    ctx.font = '18px ' + FONT_HANGUL;
    ctx.fillText('怨?異붽????덉젙?낅땲??', GW / 2, panelY + panelH / 2 + 40);
  }

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}

// ??궧 ?낅젰 ?붾㈃ 洹몃━湲?(80?꾨? ?ㅻ씫???ㅽ???
// ??궧 ?낅젰 ?붾㈃ 洹몃━湲?(80?꾨? ?ㅻ씫???ㅽ???
// UI Functions are now in ui.js
// drawInputRanking, drawOptions, drawRankingBoard, wrapText, drawCollectionButton, drawOptionsButton
function drawReloadUI() {
  if (reloadCooldown <= 0) return; // ?ъ옣??以묒씠 ?꾨땲硫??쒖떆?섏? ?딆쓬

  const reloadX = GIRL_X + GIRL_W / 2; // 罹먮┃??以묒븰
  const reloadY = girlY + GIRL_OFFSET_Y - 15; // 癒몃━ 諛붾줈 ??  const reloadSize = 20; // ?묒? ?ш린

  // ?ъ옣??吏꾪뻾??(0.0 ~ 1.0)
  const progress = 1 - (reloadCooldown / RELOAD_COOLDOWN_DURATION);

  // ?먰삎 諛곌꼍
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.beginPath();
  ctx.arc(reloadX, reloadY, reloadSize / 2, 0, Math.PI * 2);
  ctx.fill();

  // ?ъ옣??吏꾪뻾 ?먰샇 (?쒓퀎諛⑺뼢?쇰줈 梨꾩썙吏?
  ctx.strokeStyle = '#39ff14'; // ?꾧킅?쇱엫 ?뱀깋
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  // ?쒓퀎諛⑺뼢: -90?????먯꽌 ?쒖옉?섏뿬 ?쒓퀎諛⑺뼢?쇰줈 吏꾪뻾
  ctx.arc(reloadX, reloadY, reloadSize / 2 - 2, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
  ctx.stroke();

  // 以묒븰 ?묒? ??  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(reloadX, reloadY, 3, 0, Math.PI * 2);
  ctx.fill();
}

// AABB 異⑸룎
function collides(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function startPlay() {
  state = 'playing';
  if (bgmTitle) { bgmTitle.pause(); bgmTitle.currentTime = 0; }
  if (bgmStage && options.bgmEnabled) { bgmStage.currentTime = 0; bgmStage.play().catch(function () { }); }
  girlY = GROUND_Y - GIRL_H;
  vy = 0;
  shootActive = false;
  shootFrameCount = 0;
  reloadCooldown = 0;
  bombActive = false;
  bombFrameCount = 0;
  slideActive = false;
  slideFrames = 0;
  slideFrameCount = 0;
  slideStartFrame = 0;
  slideLoopCompleted = false;
  foods = [];
  bullets = [];
  bombs = [];
  explosions = [];
  scrollOffset = 0;
  score = 0;
  nextSpawn = 60;
  frameCount = 0;
  hp = 3;
  pauseFramesLeft = 0;
  deathFallFrames = 0;
  deathFallOffsetY = 0;
  isPaused = false;
  airJumpUsed = false;
}

// ??깂 ?섏?湲?(留덉슦???고겢由?: ?щЪ?? ?뮗. ?곗?湲??꾧퉴吏 ?ㅼ쓬 ??깂 遺덇?
function addBomb() {
  if (state !== 'playing' || pauseFramesLeft > 0 || isPaused || deathFallFrames > 0) return;
  if (bombs.length > 0) return; // ?섏쭊 ??깂???곗쭏 ?뚭퉴吏 ?湲?  if (bombActive) return; // ?좊땲硫붿씠??吏꾪뻾 以묒씠硫??湲?  // ?щ씪?대뵫 以묒씠硫??щ씪?대뵫 痍⑥냼
  if (slideActive) {
    slideActive = false;
    slideFrames = 0;
    slideFrameCount = 0;
    slideLoopCompleted = false;
  }
  playSfx(sfxBombFlying);
  // ??깂 ?섏?湲??좊땲硫붿씠???쒖옉 諛?利됱떆 ??깂 ?앹꽦
  bombActive = true;
  bombFrameCount = 0;
  // 利됱떆 ??깂 ?앹꽦 (吏???놁쓬)
  bombs.push({
    x: GIRL_X + GIRL_W,
    y: girlY + GIRL_OFFSET_Y + GIRL_H / 2 - BOMB_H / 2,
    vx: BOMB_VX,
    vy: BOMB_VY,
    w: BOMB_W,
    h: BOMB_H
  });
}

// 珥앹븣 諛쒖궗 (shoot.mp4 ?곗텧)
function addBullet() {
  if (state !== 'playing' || pauseFramesLeft > 0 || isPaused || deathFallFrames > 0) return;
  if (shootActive) return; // ?대? 諛쒖궗 ?곗텧 以묒씠硫??곗텧留?異붽??섏? ?딆쓬
  if (reloadCooldown > 0) return; // ?ъ옣??荑⑦???以묒씠硫?諛쒖궗 遺덇?
  // ?щ씪?대뵫 以묒씠硫??щ씪?대뵫 痍⑥냼
  if (slideActive) {
    slideActive = false;
    slideFrames = 0;
    slideFrameCount = 0;
    slideLoopCompleted = false;
  }
  playSfx(sfxGunshot);
  bullets.push({
    x: GIRL_X + GIRL_W,
    y: girlY + GIRL_OFFSET_Y + GIRL_H / 2 - BULLET_H / 2,
    w: BULLET_W,
    h: BULLET_H
  });
  if (!shootActive) {
    shootActive = true;
    shootFrameCount = 0;
  }
  ctx.arc(reloadX, reloadY, 3, 0, Math.PI * 2);
  ctx.fill();
}

// 異쒖꽍蹂댁긽 踰꾪듉 洹몃━湲?(?쒕쪟 紐⑥뼇 ?꾩씠肄?
function drawAttendanceButton() {
  // 諛곌꼍 ?먰삎 踰꾪듉
  ctx.fillStyle = 'rgba(255, 152, 0, 0.8)'; // 二쇳솴??  ctx.beginPath();
  ctx.arc(ATTENDANCE_BTN.x + ATTENDANCE_BTN.w / 2, ATTENDANCE_BTN.y + ATTENDANCE_BTN.h / 2, ATTENDANCE_BTN.w / 2, 0, Math.PI * 2);
  ctx.fill();

  // ?뚮몢由?  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.stroke();

  // ?쒕쪟 ?꾩씠肄?  ctx.font = '32px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fff';
  ctx.fillText('?뱞', ATTENDANCE_BTN.x + ATTENDANCE_BTN.w / 2, ATTENDANCE_BTN.y + ATTENDANCE_BTN.h / 2);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}

function draw() {
  if (state === 'start') {
    if (!titleBgmTried) {
      titleBgmTried = true;
      if (bgmTitle && options.bgmEnabled) bgmTitle.play().catch(function () { });
    }
    if (titleReady && titleImage.naturalWidth > 0) {
      const iw = titleImage.naturalWidth, ih = titleImage.naturalHeight;
      const scale = Math.max(GW / iw, GH / ih);
      const dw = iw * scale, dh = ih * scale;
      const dx = (GW - dw) / 2, dy = (GH - dh) / 2;
      ctx.drawImage(titleImage, 0, 0, iw, ih, dx, dy, dw, dh);
    } else {
      ctx.fillStyle = '#16213e';
      ctx.fillRect(0, 0, GW, GH);
      ctx.fillStyle = '#f1f1f1';
      ctx.font = 'bold 26px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Jumping Girl', GW / 2, 180);
      ctx.font = '14px sans-serif';
      ctx.fillStyle = '#a0a0a0';
      ctx.fillText('Food Escape', GW / 2, 212);
    }
    // 寃뚯엫 ?쒖옉 踰꾪듉
    ctx.fillStyle = '#5FD9B0'; // 誘쇳듃?뱀깋
    if (typeof ctx.roundRect === 'function') {
      ctx.beginPath();
      ctx.roundRect(BTN.x, BTN.y, BTN.w, BTN.h, 12);
      ctx.fill();
    } else {
      ctx.fillRect(BTN.x, BTN.y, BTN.w, BTN.h);
    }
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px ' + FONT_HANGUL; // 踰꾪듉 ?ш린??留욎떠 ?고듃 異뺤냼 (30 -> 20)
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.strokeText('寃뚯엫 ?쒖옉', BTN.x + BTN.w / 2, BTN.y + BTN.h / 2);
    ctx.fillText('寃뚯엫 ?쒖옉', BTN.x + BTN.w / 2, BTN.y + BTN.h / 2);
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';

    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';

    // 異쒖꽍蹂댁긽 踰꾪듉 (?꾩씠肄?
    drawAttendanceButton();

    // ?꾧컧 踰꾪듉 (醫뚰븯??
    drawCollectionButton();
    // ?듭뀡 踰꾪듉 (?고븯??
    drawOptionsButton();
    return;
  }

  if (state === 'collection') {
    // ?뚯떇 洹몃┝ ?붾뱾由??좊땲硫붿씠???낅뜲?댄듃
    if (foodShakeFrame > 0) {
      foodShakeFrame--;
      // 醫뚯슦 ?붾뱾由??④낵 (?ъ씤???ъ슜)
      const shakeProgress = foodShakeFrame / FOOD_SHAKE_DURATION;
      foodShakeOffset = Math.sin(foodShakeFrame * 0.8) * FOOD_SHAKE_INTENSITY * shakeProgress;
      if (foodShakeFrame === 0) {
        foodShakeOffset = 0;
      }
    }
    drawCollection();
    return;
  }

  if (state === 'options') {
    drawOptions();
    return;
  }

  if (state === 'input_ranking') {
    drawBackground(); // 諛곌꼍??癒쇱? 洹몃젮??寃????꾩쟻 諛⑹?
    drawRankingInput();
    return;
  }

  if (state === 'ranking_board') {
    drawRankingBoard();
    return;
  }

  if (state === 'gameover') {
    drawBackground();
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, GW, GH);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 42px ' + FONT_HANGUL;
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.strokeText('寃뚯엫 ?ㅻ쾭', GW / 2, 220);
    ctx.fillText('寃뚯엫 ?ㅻ쾭', GW / 2, 220);
    ctx.font = 'bold 24px ' + FONT_HANGUL;
    ctx.strokeText('?먯닔: ' + Math.floor(score), GW / 2, 270);
    ctx.fillStyle = '#39ff14';
    ctx.fillText('?먯닔: ' + Math.floor(score), GW / 2, 270);
    // ?ㅼ떆 ?섍린 踰꾪듉
    ctx.fillStyle = '#e94560';
    if (typeof ctx.roundRect === 'function') {
      ctx.beginPath();
      ctx.roundRect(RETRY_BTN.x, RETRY_BTN.y, RETRY_BTN.w, RETRY_BTN.h, 12);
      ctx.fill();
    } else {
      ctx.fillRect(RETRY_BTN.x, RETRY_BTN.y, RETRY_BTN.w, RETRY_BTN.h);
    }
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 27px ' + FONT_HANGUL;
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.strokeText('怨꾩냽?섍린', GW / 2, RETRY_BTN.y + RETRY_BTN.h / 2);
    ctx.fillText('怨꾩냽?섍린', GW / 2, RETRY_BTN.y + RETRY_BTN.h / 2);

    // ??댄?濡??뚯븘媛湲?踰꾪듉
    ctx.fillStyle = '#5FD9B0'; // 誘쇳듃?뱀깋
    if (typeof ctx.roundRect === 'function') {
      ctx.beginPath();
      ctx.roundRect(TITLE_BTN.x, TITLE_BTN.y, TITLE_BTN.w, TITLE_BTN.h, 12);
      ctx.fill();
    } else {
      ctx.fillRect(TITLE_BTN.x, TITLE_BTN.y, TITLE_BTN.w, TITLE_BTN.h);
    }
    ctx.fillStyle = '#fff';
    ctx.strokeText('??댄?濡??뚯븘媛湲?, GW / 2, TITLE_BTN.y + TITLE_BTN.h / 2);
    ctx.fillText('??댄?濡??뚯븘媛湲?, GW / 2, TITLE_BTN.y + TITLE_BTN.h / 2);
    ctx.textBaseline = 'alphabetic';

    // ?꾧컧 踰꾪듉 (醫뚰븯??
    drawCollectionButton();
    // ?듭뀡 踰꾪듉 (?고븯??
    drawOptionsButton();
    return;
  }

  if (state === 'stage1clear') {
    drawStage1Clear();
    return;
  }

  // --- playing ---

  // 3踰덉㎏ ?덊듃 ?? down 2諛곕줈 遺?ㅻ????붾뱾由????꾨줈 ?댁쭩 ?뺢? ?????⑥뼱吏??寃뚯엫?ㅻ쾭 ?곗텧
  if (deathFallFrames > 0) {
    ctx.clearRect(0, 0, GW, GH);
    drawBackground();
    drawDistance();
    if (downImage && downImage.naturalWidth > 0) {
      var gx = GIRL_X, gy = girlY + GIRL_OFFSET_Y;
      // ?щ━湲?洹몃┝怨?媛숈? 鍮꾩쑉濡?異뺤냼 ????諛곕줈 ?뺣? ??10% 異뺤냼 (?먮낯 鍮꾩쑉 ?좎?)
      const runOriginalWidth = 560;
      const scaleRatio = GIRL_W / runOriginalWidth; // ?щ━湲?洹몃┝??異뺤냼 鍮꾩쑉
      // 二쎈뒗 洹몃┝???먮낯 ?ш린瑜?湲곗??쇰줈 媛숈? 鍮꾩쑉 ?곸슜 ????諛? 10% 異뺤냼
      const scaledWidth = downImage.naturalWidth * scaleRatio * 2 * 0.9;
      const scaledHeight = downImage.naturalHeight * scaleRatio * 2 * 0.9;
      // ?щ━湲?二쇱씤怨듦낵 媛숈? ?꾩튂 (以묒븰 ?뺣젹)
      var dx = gx + GIRL_W / 2 - scaledWidth / 2;
      var dyBase = gy + GIRL_H / 2 - scaledHeight / 2;
      var elapsed = 72 - deathFallFrames;
      if (elapsed < 18) {
        var shakeX = (Math.random() - 0.5) * 10, shakeY = (Math.random() - 0.5) * 10;
        ctx.drawImage(downImage, 0, 0, downImage.naturalWidth, downImage.naturalHeight, dx + shakeX, dyBase + shakeY, scaledWidth, scaledHeight);
      } else if (elapsed < 27) {
        deathFallOffsetY = -4 * (elapsed - 18);
        ctx.drawImage(downImage, 0, 0, downImage.naturalWidth, downImage.naturalHeight, dx, dyBase + deathFallOffsetY, scaledWidth, scaledHeight);
      } else {
        deathFallOffsetY = -32 + 10 * (elapsed - 27);
        ctx.drawImage(downImage, 0, 0, downImage.naturalWidth, downImage.naturalHeight, dx, dyBase + deathFallOffsetY, scaledWidth, scaledHeight);
      }
    }
    deathFallFrames--;
    if (deathFallFrames === 0) {
      if (bgmStage) { bgmStage.pause(); bgmStage.currentTime = 0; }

      // ?먯닔 ?뚮줈??泥섎━
      const finalScore = Math.floor(score);

      // 寃뚯엫 ??-> 臾댁“嫄???궧 ?낅젰 ?붾㈃(寃뚯엫?ㅻ쾭 吏곹썑 ?곗텧)?쇰줈 ?대룞
      // ?? ?먯닔 湲곕줉 ?먯껜??湲곗〈 濡쒖쭅???쒖슜?섎릺, ?낅젰? 紐⑤뱺 ?좎??먭쾶 諛쏆쓬(?щ? ?붿냼)
      // ?먮뒗 "?좉린濡??ъ꽦 ?쒖뿉留? ?낅젰 諛쏅뒗寃??꾨땲??"寃뚯엫?ㅻ쾭 ?섎㈃ 利됱떆 ?대땲??3湲?먮? ?덇린???붾㈃???섏삩?????붿껌 泥섎━

      // ?ш린?쒕뒗 "?좉린濡??щ?? ?곴??놁씠" ?대땲???낅젰 ?붾㈃???꾩?
      state = 'input_ranking';
      inputName = '';
      newHighScoreIndex = -1; // ?꾩쭅 ??궧 ?깅줉 ??    }
    return;
  }

  // ?덊듃 ??0.5珥??뺤?: ?낅뜲?댄듃 ?놁씠 洹몃━湲곕쭔
  if (pauseFramesLeft > 0) {
    ctx.clearRect(0, 0, GW, GH);
    drawBackground();
    foods.forEach(drawFood);
    drawGirl();
    bullets.forEach(drawBullet);
    bombs.forEach(drawBomb);
    explosions.forEach(drawSparklyFirework);
    drawDistance();
    ctx.font = 'bold 24px ' + FONT_HANGUL;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.strokeText('?먯닔: ' + Math.floor(score), GW - 12, TOP_UI_Y);
    ctx.fillStyle = '#39ff14';
    ctx.fillText('?먯닔: ' + Math.floor(score), GW - 12, TOP_UI_Y);
    ctx.fillStyle = '#fff';
    drawHp();
    ctx.fillStyle = 'rgba(200,0,0,0.2)';
    ctx.fillRect(0, 0, GW, GH);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Hit!', GW / 2, GH / 2);
    ctx.textAlign = 'left';

    // ?쇨꺽???뚯떇??hitFrames ?낅뜲?댄듃 諛??쒓굅
    for (let i = foods.length - 1; i >= 0; i--) {
      if (foods[i].hitFrames && foods[i].hitFrames > 0) {
        foods[i].hitFrames--;
        if (foods[i].hitFrames <= 0) {
          foods.splice(i, 1);
        }
      }
    }

    pauseFramesLeft--;
    if (pauseFramesLeft === 0 && hp <= 0) {
      shootActive = false;
      shootFrameCount = 0;
      deathFallFrames = 72;
      deathFallOffsetY = 0;
    }
    return;
  }

  // P???쇱떆?뺤?: ?낅뜲?댄듃 ?놁씠 洹몃━湲곕쭔, ?곷떒??Pause
  if (isPaused) {
    ctx.clearRect(0, 0, GW, GH);
    drawBackground();
    foods.forEach(drawFood);
    drawGirl();
    bullets.forEach(drawBullet);
    bombs.forEach(drawBomb);
    explosions.forEach(drawSparklyFirework);
    drawDistance();
    ctx.font = 'bold 24px ' + FONT_HANGUL;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.strokeText('?먯닔: ' + Math.floor(score), GW - 12, TOP_UI_Y);
    ctx.fillStyle = '#39ff14';
    ctx.fillText('?먯닔: ' + Math.floor(score), GW - 12, TOP_UI_Y);
    ctx.fillStyle = '#fff';
    drawHp();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Pause', GW / 2, 36);
    ctx.textAlign = 'left';
    return;
  }

  frameCount++;

  // ?щ씪?대뵫 ?꾨젅??移댁슫???낅뜲?댄듃 諛?諛???怨듦꺽 ?먯젙 泥섎━
  if (slideActive) {
    slideFrames++;
    slideFrameCount++;

    // ?щ씪?대뵫 以?諛???怨듦꺽 ?먯젙?쇰줈 ?뚯떇 ?뚭눼
    // 諛????꾩튂: 罹먮┃???ㅻⅨ履??? 諛??믪씠 (GIRL_H ?섎떒)
    const attackBox = {
      x: GIRL_X + GIRL_W - 15,  // 諛????꾩튂 (?ㅻⅨ履??앹뿉??15px ?덉そ, ?쇱そ?쇰줈 10px ?대룞)
      y: girlY + GIRL_OFFSET_Y + GIRL_H - 20,  // 諛??믪씠
      w: 30,  // 怨듦꺽 ?먯젙 ?덈퉬 (諛????곸뿭)
      h: 20   // 怨듦꺽 ?먯젙 ?믪씠
    };

    // 諛???怨듦꺽 ?먯젙??留욎? ?뚯떇 ?뚭눼 (?섏쨷??紐명넻 異⑸룎 泥댄겕?먯꽌 ?쒖쇅?섍린 ?꾪빐 湲곕줉)
    const destroyedFoodIndices = [];
    for (let fi = foods.length - 1; fi >= 0; fi--) {
      const food = foods[fi];
      const foodHitbox = getFoodHitbox(food);
      if (collides(attackBox, foodHitbox)) {
        // ?꾧컧 ?낅뜲?댄듃
        updateCollection(food.emoji);
        // ?щ씪?대뵫 諛??앹뿉 留욎? ?뚯떇? ??컻 ?대え吏濡??쒖떆
        explosions.push({
          x: food.x + FOOD_W / 2 - 15,  // ?쇱そ?쇰줈 15px ?대룞
          y: food.y + FOOD_H / 2,
          frame: 0,
          maxFrames: EXPLOSION_FRAMES,
          emoji: '?뮙' // ??컻 ?대え吏
        });
        playSfx(sfxBombExplosion);
        destroyedFoodIndices.push(fi);
        foods.splice(fi, 1);
      }
    }

    // ?щ씪?대뵫 ?좊땲硫붿씠??1珥??좎? (60?꾨젅??@ 60fps)
    if (slideFrameCount >= 60) {
      slideActive = false;
      slideFrames = 0;
      slideFrameCount = 0;
      slideLoopCompleted = false;
    }
  }

  // 諛쒖궗 ?꾨젅??移댁슫???낅뜲?댄듃
  if (shootActive) {
    shootFrameCount++;
    if (shootFrameCount >= SHOOT_DURATION) {
      shootActive = false;
      shootFrameCount = 0;
    }
  }

  // ??깂 ?섏?湲??꾨젅??移댁슫???낅뜲?댄듃
  if (bombActive) {
    bombFrameCount++;
    if (bombFrameCount >= BOMB_DURATION) {
      bombActive = false;
      bombFrameCount = 0;
    }
  }

  // ?ъ옣??荑⑦????낅뜲?댄듃
  if (reloadCooldown > 0) {
    const wasReloading = reloadCooldown > 0;
    reloadCooldown--;
    // ?ъ옣???꾨즺 ???뚮━ ?ъ깮 (荑⑦??꾩씠 0???섎뒗 ?쒓컙)
    if (wasReloading && reloadCooldown === 0) {
      playSfx(sfxReload);
    }
  }

  // ?붿긽 諛⑹?: 留??꾨젅??罹붾쾭???꾩껜 ?대━?????ш렇由ш린
  ctx.clearRect(0, 0, GW, GH);

  // 諛곌꼍 ?ㅽ겕濡?  scrollOffset += BG_SPEED;
  score = scrollOffset;
  const d = Math.max(0, Math.floor(options.clearDistance - scrollOffset / PIXELS_PER_METER));
  if (d <= 0) {
    scrollOffset = options.clearDistance * PIXELS_PER_METER;
    state = 'stage1clear';
    stage1ClearFrames = 0;
    clearFireworks = [];
    return;
  }
  drawBackground();

  // 以묐젰쨌?먰봽 (?щ씪?대뵫 以묒뿉??以묐젰 ?곸슜 ????
  if (!slideActive) {
    vy += GRAVITY;
    girlY += vy;
    if (girlY >= GROUND_Y - GIRL_H) {
      girlY = GROUND_Y - GIRL_H;
      vy = 0;
      airJumpUsed = false;
    }
  }

  // ?뚯떇 ?ㅽ룿: ?ㅻⅨ履??앹뿉??  nextSpawn--;
  if (nextSpawn <= 0) {
    foods.push({
      x: GW,
      y: FOOD_SPAWN_YS[Math.floor(Math.random() * FOOD_SPAWN_YS.length)],
      w: FOOD_W,
      h: FOOD_H,
      emoji: FOODS[Math.floor(Math.random() * FOODS.length)]
    });
    nextSpawn = 50 + Math.floor(Math.random() * 60);
  }

  // ?뚯떇 ?대룞 (?쇱そ?쇰줈)
  for (let i = foods.length - 1; i >= 0; i--) {
    foods[i].x -= FOOD_SPEED;
    if (foods[i].x + foods[i].w < 0) foods.splice(i, 1);
  }

  // 珥앹븣?볦쓬??異⑸룎: 蹂???＝ ?앹꽦, 留욎? ?뚯떇쨌珥앹븣 ?쒓굅 (遺?쒖쭚)
  for (let bi = bullets.length - 1; bi >= 0; bi--) {
    for (let fi = foods.length - 1; fi >= 0; fi--) {
      const foodHitbox = getFoodHitbox(foods[fi]);
      if (collides(bullets[bi], foodHitbox)) {
        // ?꾧컧 ?낅뜲?댄듃
        updateCollection(foods[fi].emoji);
        explosions.push({
          x: foods[fi].x + FOOD_W / 2,
          y: foods[fi].y + FOOD_H / 2,
          frame: 0,
          maxFrames: EXPLOSION_FRAMES
        });
        bullets.splice(bi, 1);
        foods.splice(fi, 1);
        break;
      }
    }
  }

  // 珥앹븣 ?대룞 (?곗륫?쇰줈) 諛??붾㈃ 諛??쒓굅
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].x += BULLET_SPEED;
    if (bullets[i].x > GW) bullets.splice(i, 1);
  }

  // ??깂: ?щЪ??臾쇰━ ???뚯떇 異⑸룎(?ш쾶 ??컻) / ??GROUND_Y) 異⑸룎(?ш쾶 ??컻) / ?붾㈃ 諛??쒓굅
  for (let i = bombs.length - 1; i >= 0; i--) {
    const b = bombs[i];
    b.vy += GRAVITY;
    b.y += b.vy;
    b.x += b.vx;
  }
  for (let bi = bombs.length - 1; bi >= 0; bi--) {
    const b = bombs[bi];
    for (let fi = foods.length - 1; fi >= 0; fi--) {
      const foodHitbox = getFoodHitbox(foods[fi]);
      if (collides(b, foodHitbox)) {
        // ?꾧컧 ?낅뜲?댄듃
        updateCollection(foods[fi].emoji);
        explosions.push({ x: foods[fi].x + FOOD_W / 2, y: foods[fi].y + FOOD_H / 2, frame: 0, maxFrames: EXPLOSION_FRAMES, scale: 2 });
        playSfx(sfxBombExplosion);
        bombs.splice(bi, 1);
        foods.splice(fi, 1);
        break;
      }
    }
  }
  for (let i = bombs.length - 1; i >= 0; i--) {
    const b = bombs[i];
    if (b.y + b.h >= GROUND_Y) {
      explosions.push({ x: b.x + b.w / 2, y: GROUND_Y - BOMB_H / 2, frame: 0, maxFrames: EXPLOSION_FRAMES, scale: 2 });
      playSfx(sfxBombExplosion);
      bombs.splice(i, 1);
    } else if (b.x > GW || b.x + b.w < 0) {
      bombs.splice(i, 1);
    }
  }

  // ??＝ ?꾨젅??吏꾪뻾 諛?留뚮즺 ?쒓굅
  for (let i = explosions.length - 1; i >= 0; i--) {
    explosions[i].frame++;
    if (explosions[i].frame >= explosions[i].maxFrames) explosions.splice(i, 1);
  }

  // 洹몃━湲? ?뚯떇 -> ?뚮? -> 珥앹븣 -> ??깂 -> ??＝
  foods.forEach(drawFood);
  drawGirl();
  drawReloadUI(); // ?ъ옣??UI
  bullets.forEach(drawBullet);
  bombs.forEach(drawBomb);
  explosions.forEach(drawSparklyFirework);

  // 寃곗듅源뚯? 嫄곕━ (?곷떒 以묒븰) + ?먯닔(?꾧킅?뱀깋+寃?뺥뀒?먮━) + 泥대젰. ???붿냼 ?쒕줈 媛?대뜲?뺣젹
  drawDistance();
  ctx.font = 'bold 24px ' + FONT_HANGUL;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 4;
  ctx.strokeText('?먯닔: ' + Math.floor(score), GW - 12, TOP_UI_Y);
  ctx.fillStyle = '#39ff14';
  ctx.fillText('?먯닔: ' + Math.floor(score), GW - 12, TOP_UI_Y);
  ctx.fillStyle = '#fff';
  drawHp();

  // 異쒖꽍蹂댁긽 踰꾪듉 (?곗륫 ?곷떒 ?꾩씠肄?
  drawAttendanceButton();
  // ?꾧컧 踰꾪듉 (醫뚰븯?? - ?뚮젅??以묒뿉???묎렐 媛??  drawCollectionButton();
  // ?듭뀡 踰꾪듉 (?고븯?? - ?뚮젅??以묒뿉???묎렐 媛??  drawOptionsButton();

  // 二쇱씤怨듈볦쓬??異⑸룎: ?뚯떇 ?쒓굅, 泥대젰 -1, 0.5珥??뺤?. 泥대젰 0?대㈃ ?뺤? ??寃뚯엫?ㅻ쾭
  // ?щ씪?대뵫 以묒뿉??紐명넻? ?쇨꺽諛쏆?留? 諛???怨듦꺽 ?먯젙 ?곸뿭? ?쒖쇅
  if (slideActive) {
    // ?щ씪?대뵫 以? 癒몃━ 異⑸룎 諛뺤뒪 + 紐명넻 異⑸룎 諛뺤뒪 (諛???怨듦꺽 ?먯젙 ?곸뿭 ?쒖쇅)
    const attackBox = {
      x: GIRL_X + GIRL_W - 15,  // 諛????꾩튂 (?ㅻⅨ履??앹뿉??15px ?덉そ, ?쇱そ?쇰줈 10px ?대룞)
      y: girlY + GIRL_OFFSET_Y + GIRL_H - 20,
      w: 30,
      h: 20
    };
    // 癒몃━ 異⑸룎 諛뺤뒪 (?곷떒 30%)
    const headBoxH = GIRL_H * 0.3;
    const headBox = { x: GIRL_X, y: girlY + GIRL_OFFSET_Y, w: GIRL_W, h: headBoxH };
    // 紐명넻 異⑸룎 諛뺤뒪 (以묎컙 50%)
    const girlBoxH = GIRL_H * 0.5;
    const girlBoxY = girlY + GIRL_OFFSET_Y + GIRL_H * 0.5;
    const girlBox = { x: GIRL_X, y: girlBoxY, w: GIRL_W, h: girlBoxH };

    for (let i = 0; i < foods.length; i++) {
      const food = foods[i];
      const foodHitbox = getFoodHitbox(food);
      // 癒몃━ 遺遺?異⑸룎 泥댄겕 (諛???怨듦꺽 ?먯젙 ?곸뿭 ?쒖쇅)
      if (collides(headBox, foodHitbox) && !collides(attackBox, foodHitbox)) {
        // ?뚯떇??利됱떆 ?쒓굅?섏? ?딄퀬 ?쇨꺽 ?쒖떆
        foods[i].hitFrames = HIT_PAUSE_FRAMES;
        hp--;
        if (hp <= 0) playSfx(sfxGirlDown); else playSfx(sfxGirlHurt);
        pauseFramesLeft = HIT_PAUSE_FRAMES;
        break; // for food loops
      }
      // 紐명넻 異⑸룎 泥댄겕 (諛???怨듦꺽 ?먯젙 ?곸뿭 ?쒖쇅)
      if (collides(girlBox, foodHitbox) && !collides(attackBox, foodHitbox)) {
        // ?뚯떇??利됱떆 ?쒓굅?섏? ?딄퀬 ?쇨꺽 ?쒖떆
        foods[i].hitFrames = HIT_PAUSE_FRAMES;
        hp--;
        if (hp <= 0) playSfx(sfxGirlDown); else playSfx(sfxGirlHurt);
        pauseFramesLeft = HIT_PAUSE_FRAMES;
        break; // for food loops
      }
    }
  } else {
    // ?쇰컲 ?곹깭: ?꾩껜 紐명넻 異⑸룎 泥댄겕 (?먯젙 諛뺤뒪瑜??덈퉬 60%, ?믪씠 90%濡??섏젙)
    const shrinkW = 0.6; // ?덈퉬 60%
    const shrinkH = 0.9; // ?믪씠 90% (癒몃━履??먯젙 ?뺣낫)
    const w = GIRL_W * shrinkW;
    const h = GIRL_H * shrinkH;
    const offsetX = (GIRL_W - w) / 2;
    const offsetY = (GIRL_H - h) / 2; // 以묒븰 ?뺣젹 (癒몃━? 諛?紐⑤몢 ?대뒓 ?뺣룄 而ㅻ쾭??

    const girlBox = {
      x: GIRL_X + offsetX,
      y: girlY + GIRL_OFFSET_Y + offsetY,
      w: w,
      h: h
    };

    for (let i = 0; i < foods.length; i++) {
      const foodHitbox = getFoodHitbox(foods[i]);
      if (collides(girlBox, foodHitbox)) {
        // ?뚯떇??利됱떆 ?쒓굅?섏? ?딄퀬 ?쇨꺽 ?쒖떆
        foods[i].hitFrames = HIT_PAUSE_FRAMES;
        hp--;
        if (hp <= 0) playSfx(sfxGirlDown); else playSfx(sfxGirlHurt);
        pauseFramesLeft = HIT_PAUSE_FRAMES;
        break; // for food loops
      }
    }
  }
}

function getCanvasCoords(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width, scaleY = canvas.height / rect.height;
  let cx, cy;
  if (e.touches && e.touches.length > 0) {
    cx = e.touches[0].clientX;
    cy = e.touches[0].clientY;
  } else {
    cx = e.clientX;
    cy = e.clientY;
  }
  return { x: (cx - rect.left) * scaleX, y: (cy - rect.top) * scaleY };
}

function isInBtn(p, btn) {
  return p.x >= btn.x && p.x <= btn.x + btn.w && p.y >= btn.y && p.y <= btn.y + btn.h;
}

function handleTap(e) {
  const pos = getCanvasCoords(e);

  // ?꾧컧 踰꾪듉 ?대┃ 泥섎━ (紐⑤뱺 ?붾㈃?먯꽌 ?숈씪)
  if (isInBtn(pos, COLLECTION_BTN)) {
    if (state === 'playing') {
      isPaused = true;
    }
    state = 'collection';
    resetCollectionScroll();
    return;
  }

  // ?듭뀡 踰꾪듉 ?대┃ 泥섎━
  if (isInBtn(pos, OPTIONS_BTN)) {
    if (state === 'playing') {
      isPaused = true;
    }
    state = 'options';
    selectedOptionIndex = 0;
    return;
  }

  // 異쒖꽍蹂댁긽 踰꾪듉 ?대┃ 泥섎━
  if (isInBtn(pos, ATTENDANCE_BTN)) {
    window.location.href = 'attendance.html';
    return;
  }

  if (state === 'playing') return;

  if (state === 'start') {
    if (isInBtn(pos, BTN)) {
      startPlay();
      return;
    }
  }

  if (state === 'options') {
    // ?ㅻ줈 媛湲?踰꾪듉
    if (pos.x >= 20 && pos.x <= 80 && pos.y >= 20 && pos.y <= 60) {
      if (isPaused) {
        isPaused = false;
        state = 'playing';
      } else {
        state = 'start';
      }
      return;
    }
    // ?듭뀡 ??ぉ ?대┃
    const startY = 100;
    const itemHeight = 60;
    for (let i = 0; i < OPTION_ITEMS.length; i++) {
      const y = startY + i * itemHeight;
      if (pos.y >= y - itemHeight / 2 && pos.y <= y + itemHeight / 2) {
        selectedOptionIndex = i;
        const item = OPTION_ITEMS[i];
        if (item.type === 'toggle') {
          if (pos.x > GW - 120) {
            options[item.key] = !options[item.key];
            saveOptions();
          }
        } else if (item.type === 'slider') {
          const sliderX = 140;
          const sliderW = GW - 140 - 50 - 40;
          if (pos.x >= sliderX - 10 && pos.x <= sliderX + sliderW + 10) {
            const relativeX = pos.x - sliderX;
            const percentage = Math.max(0, Math.min(1, relativeX / sliderW));
            const val = item.min + (item.max - item.min) * percentage;
            if (item.key === 'bgmVolume') {
              options.bgmVolume = val / 100;
            } else if (item.key === 'sfxVolume') {
              options.sfxVolume = val / 100;
              playSfx(sfxGunshot);
            } else if (item.key === 'clearDistance') {
              options.clearDistance = Math.round(val / 50) * 50;
            }
            saveOptions();
          }
        } else if (item.type === 'select') {
          if (pos.x > 140) {
            const currentIndex = item.options.indexOf(options[item.key]);
            const nextIndex = (currentIndex + 1) % item.options.length;
            options[item.key] = item.options[nextIndex];
            saveOptions();
          }
        }
        return;
      }
    }
    return;
  }

  if (state === 'collection') {
    if (pos.x >= 20 && pos.x <= 80 && pos.y >= 20 && pos.y <= 60) {
      if (isPaused) {
        isPaused = false;
        state = 'playing';
      } else {
        state = 'start';
      }
      return;
    }
    const cardSize = 60;
    const cardSpacing = 15;
    const startX = 30;
    const gridY = 100;
    for (let i = 0; i < COLLECTION_ITEMS.length; i++) {
      const cardX = startX + i * (cardSize + cardSpacing) - collectionScrollOffset;
      if (pos.x >= cardX && pos.x <= cardX + cardSize &&
        pos.y >= gridY && pos.y <= gridY + cardSize) {
        selectedFoodIndex = i;
        return;
      }
    }
    return;
  }

  if (state === 'stage1clear') {
    state = 'start';
    if (bgmStage) bgmStage.pause();
    if (bgmTitle && options.bgmEnabled) { bgmTitle.currentTime = 0; bgmTitle.play().catch(function () { }); }
    return;
  }

  if (state === 'gameover') {
    if (isInBtn(pos, RETRY_BTN)) {
      startPlay();
      return;
    }
    if (isInBtn(pos, TITLE_BTN)) {
      if (bgmStage) { bgmStage.pause(); bgmStage.currentTime = 0; }
      if (bgmTitle && options.bgmEnabled) { bgmTitle.currentTime = 0; bgmTitle.play().catch(function () { }); }
      state = 'start';
      return;
    }
  }
}

// canvas.addEventListener('click', handleTap); // Moved to window.onload
document.addEventListener('contextmenu', function (e) {
  if (state === 'playing') e.preventDefault();
});

// ?꾧컧 ?붾㈃ ?쒕옒洹??ㅽ겕濡?document.addEventListener('mousedown', function (e) {
  if (state === 'collection') {
    const pos = getCanvasCoords(e);
    const cardSize = 60;
    const gridY = 100;
    const startX = 30;

    // 洹몃━???곸뿭 泥댄겕
    if (pos.y >= gridY - 10 && pos.y <= gridY + cardSize + 10) {
      isDraggingCollection = true;
      dragStartX = pos.x;
      dragStartScrollOffset = collectionScrollOffset;
      e.preventDefault();
      return;
    }
  }

  if (state !== 'playing') return;
  // ?꾧컧/?듭뀡 踰꾪듉 ?대┃ 泥댄겕 (?뚮젅??以묒뿉???닿린 媛??
  const pos = getCanvasCoords(e);
  if (isInBtn(pos, COLLECTION_BTN)) {
    isPaused = true;
    state = 'collection';
    resetCollectionScroll();
    return;
  }
  if (isInBtn(pos, OPTIONS_BTN)) {
    isPaused = true;
    state = 'options';
    selectedOptionIndex = 0;
    return;
  }
  if (e.button === 0) addBullet();
  if (e.button === 2) addBomb();
});

document.addEventListener('mousemove', function (e) {
  if (state === 'collection' && isDraggingCollection) {
    const pos = getCanvasCoords(e);
    const deltaX = dragStartX - pos.x;
    collectionScrollOffset = dragStartScrollOffset + deltaX;
    e.preventDefault();
  }
});

document.addEventListener('mouseup', function (e) {
  if (isDraggingCollection) {
    isDraggingCollection = false;
    e.preventDefault();
  }
});

document.addEventListener('mouseleave', function (e) {
  if (isDraggingCollection) {
    isDraggingCollection = false;
  }
});
document.addEventListener('touchstart', function (e) {
  const pos = getCanvasCoords(e);
  // 異쒖꽍蹂댁긽 踰꾪듉 ?대┃ 泥댄겕 (?꾩씠肄?
  if (isInBtn(pos, ATTENDANCE_BTN)) {
    window.location.href = 'attendance.html';
    e.preventDefault();
    return;
  }
  // ?꾧컧/?듭뀡 踰꾪듉 ?대┃ 泥댄겕 (紐⑤뱺 ?곹깭?먯꽌)
  if (isInBtn(pos, COLLECTION_BTN)) {
    if (state === 'playing') {
      isPaused = true;
    }
    state = 'collection';
    resetCollectionScroll();
    e.preventDefault();
    return;
  }
  if (isInBtn(pos, OPTIONS_BTN)) {
    if (state === 'playing') {
      isPaused = true;
    }
    state = 'options';
    selectedOptionIndex = 0;
    e.preventDefault();
    return;
  }

  // ?꾧컧 ?붾㈃ ?곗튂 泥섎━
  if (state === 'collection') {
    // ?뚯떇 洹몃┝ ?곸뿭 ?곗튂 媛먯? (?붾뱾由??④낵)
    const selectedItem = COLLECTION_ITEMS[selectedFoodIndex];
    if (selectedItem && selectedItem.type === 'food') {
      const foodData = collectionData[selectedItem.emoji];
      const isDiscovered = foodData && foodData.discovered;
      if (isDiscovered) {
        const panelY = 200;
        const emojiX = GW / 2;
        const emojiY = panelY + 50;
        const emojiSize = 64; // ??듭쟻???대え吏 ?ш린
        const emojiRadius = emojiSize / 2;
        // ?뚯떇 洹몃┝ ?곸뿭 ?곗튂 泥댄겕 (?먰삎 ?곸뿭)
        const dx = pos.x - emojiX;
        const dy = pos.y - emojiY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= emojiRadius) {
          // ?붾뱾由??④낵 ?쒖옉
          foodShakeFrame = FOOD_SHAKE_DURATION;
          e.preventDefault();
          return;
        }
      }
    }

    // ?꾧컧 ?붾㈃ ?곗튂 ?쒕옒洹??쒖옉
    const cardSize = 60;
    const gridY = 100;
    if (pos.y >= gridY - 10 && pos.y <= gridY + cardSize + 10) {
      isDraggingCollection = true;
      dragStartX = pos.x;
      dragStartScrollOffset = collectionScrollOffset;
      e.preventDefault();
      return;
    }
  }

  if (state === 'playing') {
    addBullet();
    e.preventDefault();
    return;
  }
  handleTap(e);
  e.preventDefault();
}, { passive: false });

document.addEventListener('touchmove', function (e) {
  if (state === 'collection' && isDraggingCollection && e.touches.length > 0) {
    const pos = getCanvasCoords(e);
    const deltaX = dragStartX - pos.x;
    collectionScrollOffset = dragStartScrollOffset + deltaX;
    e.preventDefault();
  }
}, { passive: false });

document.addEventListener('touchend', function (e) {
  if (isDraggingCollection) {
    isDraggingCollection = false;
    e.preventDefault();
  }
});

document.addEventListener('touchcancel', function (e) {
  if (isDraggingCollection) {
    isDraggingCollection = false;
  }
});

document.addEventListener('keydown', function (e) {
  if (e.code === 'Escape') {
    e.preventDefault();
    if (state === 'collection') {
      if (isPaused) {
        // ?뚮젅??以??쇱떆?뺤? ?곹깭??ㅻ㈃ ?쇱떆?뺤? ?댁젣
        isPaused = false;
        state = 'playing';
      } else {
        state = 'start';
      }
      return;
    }
    if (bgmStage) { bgmStage.pause(); bgmStage.currentTime = 0; }
    if (bgmTitle && options.bgmEnabled) { bgmTitle.currentTime = 0; bgmTitle.play().catch(function () { }); }
    state = 'start';
    return;
  }
  // ?꾧컧 ?붾㈃ ?ㅻ낫???ㅻ퉬寃뚯씠??  if (state === 'collection') {
    if (e.code === 'ArrowLeft') {
      e.preventDefault();
      selectedFoodIndex = Math.max(0, selectedFoodIndex - 1);
      return;
    }
    if (e.code === 'ArrowRight') {
      e.preventDefault();
      selectedFoodIndex = Math.min(COLLECTION_ITEMS.length - 1, selectedFoodIndex + 1);
      return;
    }
    if (e.code === 'Escape') {
      e.preventDefault();
      if (isPaused) {
        // ?뚮젅??以??쇱떆?뺤? ?곹깭??ㅻ㈃ ?쇱떆?뺤? ?댁젣
        isPaused = false;
        state = 'playing';
      } else {
        state = 'start';
      }
      return;
    }
    return;
  }

  // ??궧 ?낅젰 ?붾㈃ ?ㅻ낫??泥섎━
  if (state === 'input_ranking') {
    if (e.code === 'Enter') {
      if (inputName.length === 3) {
        // ??궧 ?깅줉
        const finalScore = Math.floor(score);
        const newEntry = { name: inputName, score: finalScore };

        // ?꾩옱 ?먯닔 異붽?, ?뺣젹, ?먮Ⅴ湲?        highScores.push(newEntry);
        highScores.sort((a, b) => b.score - a.score);
        if (highScores.length > MAX_HIGH_SCORES) highScores.pop();

        // ???쒖쐞 李얘린 (?섏씠?쇱씠?몄슜)
        newHighScoreIndex = highScores.findIndex(x => x.name === newEntry.name && x.score === newEntry.score);

        localStorage.setItem('jg_highscores', JSON.stringify(highScores));
        state = 'ranking_board';
        return; // ?낅젰 泥섎━ ??諛붾줈 由ы꽩?섏뿬 遺덊븘?뷀븳 ???낅젰 諛⑹?
      }
    } else if (e.code === 'Backspace') {
      inputName = inputName.slice(0, -1);
    } else if (e.key.length === 1 && inputName.length < 3) {
      // ?곷Ц ?臾몄옄留??낅젰 媛?ν븯寃??꾪꽣留?      const char = e.key.toUpperCase();
      if (/[A-Z]/.test(char)) {
        inputName += char;
      }
    }
    return;
  }

  // ??궧 蹂대뱶 ?붾㈃ ?ㅻ낫??泥섎━
  if (state === 'ranking_board') {
    if (e.code === 'Space' || e.code === 'Enter' || e.code === 'Escape') {
      state = 'gameover';
      newHighScoreIndex = -1;
    }
    return;
  }

  // 1?ㅽ뀒?댁? ?대━???붾㈃ ?ㅻ낫??泥섎━
  if (state === 'stage1clear') {
    if (e.code === 'Enter' || e.code === 'Space' || e.code === 'Escape') {
      state = 'start';
      if (bgmStage) bgmStage.pause();
      if (bgmTitle && options.bgmEnabled) { bgmTitle.currentTime = 0; bgmTitle.play().catch(function () { }); }
    }
    return;
  }

  // ?듭뀡 ?붾㈃ ?ㅻ낫???ㅻ퉬寃뚯씠??  if (state === 'options') {
    if (e.code === 'ArrowUp') {
      e.preventDefault();
      selectedOptionIndex = Math.max(0, selectedOptionIndex - 1);
      return;
    }
    if (e.code === 'ArrowDown') {
      e.preventDefault();
      selectedOptionIndex = Math.min(OPTION_ITEMS.length - 1, selectedOptionIndex + 1);
      return;
    }
    if (e.code === 'ArrowLeft') {
      e.preventDefault();
      const item = OPTION_ITEMS[selectedOptionIndex];
      if (item.type === 'slider') {
        const currentValue = item.value();
        const newValue = Math.max(item.min, currentValue - 5);
        if (item.key === 'bgmVolume') {
          options.bgmVolume = newValue / 100;
        } else if (item.key === 'sfxVolume') {
          options.sfxVolume = newValue / 100;
          // ?④낵??蹂쇰ⅷ 議곗젙 ??珥앺깂 諛쒖궗 ?뚮━濡??덉떆 ?ъ깮
          playSfx(sfxGunshot);
        }
        saveOptions();
      } else if (item.type === 'select') {
        const currentIndex = item.options.indexOf(options[item.key]);
        const prevIndex = (currentIndex - 1 + item.options.length) % item.options.length;
        options[item.key] = item.options[prevIndex];
        saveOptions();
      } else if (item.type === 'toggle') {
        options[item.key] = false;
        saveOptions();
      }
      return;
    }
    if (e.code === 'ArrowRight') {
      e.preventDefault();
      const item = OPTION_ITEMS[selectedOptionIndex];
      if (item.type === 'slider') {
        const currentValue = item.value();
        const newValue = Math.min(item.max, currentValue + 5);
        if (item.key === 'bgmVolume') {
          options.bgmVolume = newValue / 100;
        } else if (item.key === 'sfxVolume') {
          options.sfxVolume = newValue / 100;
          // ?④낵??蹂쇰ⅷ 議곗젙 ??珥앺깂 諛쒖궗 ?뚮━濡??덉떆 ?ъ깮
          playSfx(sfxGunshot);
        }
        saveOptions();
      } else if (item.type === 'select') {
        const currentIndex = item.options.indexOf(options[item.key]);
        const nextIndex = (currentIndex + 1) % item.options.length;
        options[item.key] = item.options[nextIndex];
        saveOptions();
      } else if (item.type === 'toggle') {
        options[item.key] = true;
        saveOptions();
      }
      return;
    }
    if (e.code === 'Escape') {
      e.preventDefault();
      if (isPaused) {
        isPaused = false;
        state = 'playing';
      } else {
        state = 'start';
      }
      return;
    }
    return;
  }

  // 1?ㅽ뀒?댁? ?대━???붾㈃ ?ㅻ낫??泥섎━
  if (state === 'stage1clear') {
    if (e.code === 'Space' || e.code === 'Enter') {
      state = 'start'; // ?ㅼ쓬 ?ㅽ뀒?댁? ????꾩떆濡???댄?濡??대룞
      if (bgmStage) bgmStage.pause();
      if (bgmTitle && options.bgmEnabled) { bgmTitle.currentTime = 0; bgmTitle.play().catch(function () { }); }
    }
    return;
  }

  if (e.code === 'KeyP') {
    e.preventDefault();
    if (state === 'playing') isPaused = !isPaused;
    return;
  }
  if (e.code === 'Tab') {
    e.preventDefault();
    if (state === 'playing') isPaused = !isPaused;
    return;
  }
  if (e.code === 'CapsLock') {
    e.preventDefault();
    (async function doScreenShot() {
      const ts = new Date().toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '_');
      const name = 'jumping_girl_screen_shot_' + ts + '.png';
      let blob;
      try {
        blob = await new Promise(function (res, rej) {
          canvas.toBlob(function (b) { if (b) res(b); else rej(new Error('toBlob')); }, 'image/png');
        });
      } catch (err) { return; }
      try {
        if (typeof window.showDirectoryPicker === 'function') {
          if (!screenShotDirHandle) screenShotDirHandle = await window.showDirectoryPicker();
          const fh = await screenShotDirHandle.getFileHandle(name, { create: true });
          const w = await fh.createWritable();
          await w.write(blob);
          await w.close();
          return;
        }
      } catch (err) { /* ?대뜑 ?좏깮 痍⑥냼쨌API 誘몄????????ㅼ슫濡쒕뱶 ?대갚 */ }
      const a = document.createElement('a');
      a.download = name;
      a.href = URL.createObjectURL(blob);
      a.click();
      URL.revokeObjectURL(a.href);
    })();
    return;
  }
  if (e.code === 'Space') {
    e.preventDefault();
    if (state !== 'playing' || pauseFramesLeft > 0 || isPaused) return;
    // ?щ씪?대뵫 以묒뿉???먰봽 媛??(?щ씪?대뵫 痍⑥냼)
    if (slideActive) {
      slideActive = false;
      slideFrames = 0;
      slideFrameCount = 0;
    }
    if (girlY >= GROUND_Y - GIRL_H - 2) {
      vy = JUMP_FORCE;
      playSfx(sfxGirlHop);
    } else if (!airJumpUsed) {
      vy = AIR_JUMP_VY;
      airJumpUsed = true;
      playSfx(sfxGirlHop);
    }
  }
  if (e.code === 'KeyA') {
    e.preventDefault();
    if (state !== 'playing' || pauseFramesLeft > 0 || isPaused || slideActive) return;
    // ?먰봽 以묒뿉???щ씪?대뵫 遺덇?
    if (girlY < GROUND_Y - GIRL_H - 2) return; // ?먰봽 以?(?낆뿉 ?우? ?딆쓬)
    slideActive = true;
    slideFrames = 0;
    slideFrameCount = 0;
    slideStartFrame = frameCount;
    slideLoopCompleted = false;
  }
});

// Update function required by loop()
function update() {
  // Logic updates
  updateGifPositions();

  // Sync GameState needed for UI
  if (window.GameState) {
    window.GameState.state = state;
    window.GameState.score = score;
    window.GameState.highScores = highScores;
    window.GameState.options = options;
    window.GameState.inputName = inputName;
    window.GameState.newHighScoreIndex = newHighScoreIndex;
    window.GameState.scrollOffset = scrollOffset;
    window.GameState.selectedOptionIndex = selectedOptionIndex;
    window.GameState.selectedFoodIndex = selectedFoodIndex;
    window.GameState.collectionData = collectionData;
  }
}

```

## js\stages.js
```js
// Stage registry + helpers (loaded after stage definitions)
(function () {
  const defs = Array.isArray(window.STAGE_DEFS) ? window.STAGE_DEFS.slice() : [];
  defs.sort((a, b) => (a.order || 0) - (b.order || 0));

  window.STAGES = defs;

  window.getStageByIndex = function (index) {
    if (!Array.isArray(window.STAGES) || window.STAGES.length === 0) return null;
    if (index < 0 || index >= window.STAGES.length) return null;
    return window.STAGES[index];
  };

  window.getStageById = function (id) {
    if (!Array.isArray(window.STAGES)) return null;
    return window.STAGES.find(s => s.id === id) || null;
  };

  window.getAllStageFoods = function () {
    if (!Array.isArray(window.STAGES)) return [];
    const seen = new Set();
    for (const stage of window.STAGES) {
      if (!stage || !Array.isArray(stage.foods)) continue;
      for (const food of stage.foods) seen.add(food);
    }
    return Array.from(seen);
  };
})();

```

## js\ui.js
```js
/**
 * UI Renderer for Jumping Girl
 * Handles drawing of menus, options, ranking, HUD, etc.
 * DO NOT MODIFY THIS FILE WITHOUT EXPLICIT USER CONSENT.
 * PRESERVES USER CUSTOMIZATIONS.
 */

// Global access to game state aliases (Now provided by config.js)
// const G = window.GameState;

// Color Palette
const COLORS = {
    MINT: '#5FD9B0',
    ORANGE: '#FF9800',
    NEON_GREEN: '#39ff14',
    MAGENTA: '#ff00ff',
    CYAN: '#00ffff',
    RED: '#e94560',
    WHITE: '#fff',
    BLACK: '#000',
    GRAY: '#555',
    BG_DARK: '#16213e'
};

function isInBtn(p, btn) {
    return p.x >= btn.x && p.x <= btn.x + btn.w && p.y >= btn.y && p.y <= btn.y + btn.h;
}

// ?띿뒪??以꾨컮轅??⑥닔
function wrapText(ctx, text, maxWidth, fontSize) {
    const words = text.split('');
    const lines = [];
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
        const testLine = currentLine + words[i];
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && currentLine !== '') {
            lines.push(currentLine);
            currentLine = words[i];
        } else {
            currentLine = testLine;
        }
    }
    if (currentLine !== '') {
        lines.push(currentLine);
    }
    return lines;
}

// ?듭뀡 踰꾪듉 洹몃━湲?(?고븯???깅땲諛뷀??꾩씠肄?
function drawOptionsButton(ctx) {
    if (!ctx) ctx = G.ctx;
    // 諛곌꼍 ?먰삎 踰꾪듉
    ctx.fillStyle = 'rgba(155, 89, 182, 0.8)'; // 諛섑닾紐?蹂대씪??
    ctx.beginPath();
    ctx.arc(OPTIONS_BTN.x + OPTIONS_BTN.w / 2, OPTIONS_BTN.y + OPTIONS_BTN.h / 2, OPTIONS_BTN.w / 2, 0, Math.PI * 2);
    ctx.fill();

    // ?뚮몢由?
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // ?깅땲諛뷀??꾩씠肄?
    ctx.font = '32px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    ctx.fillText('?숋툘', OPTIONS_BTN.x + OPTIONS_BTN.w / 2, OPTIONS_BTN.y + OPTIONS_BTN.h / 2);

    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
}

// ?꾧컧 踰꾪듉 洹몃━湲?
function drawCollectionButton(ctx) {
    if (!ctx) ctx = G.ctx;
    // 諛곌꼍 ?먰삎 踰꾪듉
    ctx.fillStyle = 'rgba(155, 89, 182, 0.8)';
    ctx.beginPath();
    ctx.arc(COLLECTION_BTN.x + COLLECTION_BTN.w / 2, COLLECTION_BTN.y + COLLECTION_BTN.h / 2, COLLECTION_BTN.w / 2, 0, Math.PI * 2);
    ctx.fill();

    // ?뚮몢由?
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 梨??꾩씠肄?
    ctx.font = '32px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    ctx.fillText('?뱰', COLLECTION_BTN.x + COLLECTION_BTN.w / 2, COLLECTION_BTN.y + COLLECTION_BTN.h / 2);

    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
}

function drawOptions(ctx) {
    if (!ctx) ctx = G.ctx;
    const options = G.options;
    const GW = ctx.canvas.width;
    const GH = ctx.canvas.height;

    // 1. 諛곌꼍 ?대몼寃?(釉붾윭 ?먮굦??源딆? ?대몺)
    ctx.fillStyle = 'rgba(10, 10, 10, 0.98)';
    ctx.fillRect(0, 0, GW, GH);

    // 2. ?쒕ぉ
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px ' + FONT_HANGUL;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('OPTIONS', GW / 2, 55);

    // 3. ?ㅻ줈 媛湲?踰꾪듉 (?곷떒 醫뚯륫)
    ctx.fillStyle = '#e94560';
    if (typeof ctx.roundRect === 'function') {
        ctx.beginPath();
        ctx.roundRect(20, 25, 60, 40, 12);
        ctx.fill();
    } else {
        ctx.fillRect(20, 25, 60, 40);
    }
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px ' + FONT_HANGUL;
    ctx.fillText('??, 50, 45);

    // 4. ?듭뀡 由ъ뒪???뺤쓽 (媛꾧꺽 議곗젙: startY=110, itemHeight=60)
    const listStartY = 110;
    const listHeight = 60;
    const items = G.OPTION_ITEMS;

    if (!items) return;

    items.forEach((item, index) => {
        const itemY = listStartY + index * listHeight;
        const isSelected = (G.selectedOptionIndex === index);

        // ?좏깮 媛뺤“ (諛곌꼍 湲濡쒖슦)
        if (isSelected) {
            const gradient = ctx.createLinearGradient(0, itemY - 25, GW, itemY + 25);
            gradient.addColorStop(0, 'rgba(57, 255, 20, 0.05)');
            gradient.addColorStop(0.5, 'rgba(57, 255, 20, 0.15)');
            gradient.addColorStop(1, 'rgba(57, 255, 20, 0.05)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, itemY - 28, GW, 56);

            // ?쇱そ ?몃뵒耳?댄꽣 諛?
            ctx.fillStyle = '#39ff14';
            ctx.fillRect(0, itemY - 25, 4, 50);
        }

        // ?쇰꺼 (醫뚯륫)
        ctx.textAlign = 'left';
        ctx.fillStyle = isSelected ? '#39ff14' : '#ffffff';
        ctx.font = isSelected ? 'bold 20px ' + FONT_HANGUL : '18px ' + FONT_HANGUL;
        ctx.fillText(item.label, 25, itemY);

        // 而⑦듃濡?(?곗륫)
        ctx.textAlign = 'right';
        const controlX = GW - 25;

        if (item.type === 'toggle') {
            const isOn = options[item.key];
            // ?좉? 諛곌꼍
            ctx.fillStyle = isOn ? '#39ff14' : '#333';
            if (typeof ctx.roundRect === 'function') {
                ctx.beginPath();
                ctx.roundRect(controlX - 55, itemY - 12, 55, 24, 12);
                ctx.fill();
            } else {
                ctx.fillRect(controlX - 55, itemY - 12, 55, 24);
            }
            // ?좉? ?띿뒪??
            ctx.fillStyle = isOn ? '#000' : '#fff';
            ctx.font = 'bold 12px sans-serif';
            ctx.fillText(isOn ? 'ON' : 'OFF', controlX - 27.5, itemY);
        } else if (item.type === 'slider') {
            let val = options[item.key];
            if (item.isPercent && val <= 1) val = Math.round(val * 100);
            const valTxt = val + (item.suffix || (item.isPercent ? '%' : ''));

            // ?щ씪?대뜑 ?띿뒪??
            ctx.fillStyle = isSelected ? '#39ff14' : '#fff';
            ctx.font = '16px ' + FONT_HANGUL;
            ctx.fillText(valTxt, controlX, itemY - 8);

            // 寃뚯씠吏 諛?
            ctx.fillStyle = '#222';
            ctx.fillRect(controlX - 100, itemY + 8, 100, 4);
            const ratio = (val - (item.min || 0)) / ((item.max || 100) - (item.min || 0));
            ctx.fillStyle = '#39ff14';
            ctx.fillRect(controlX - 100, itemY + 8, 100 * ratio, 4);
        } else if (item.type === 'select') {
            ctx.fillStyle = isSelected ? '#39ff14' : '#fff';
            ctx.font = '16px sans-serif';
            ctx.fillText(String(options[item.key]).toUpperCase(), controlX, itemY);
        }
    });

    // 5. ?ㅼ젙 珥덇린??踰꾪듉 (?꾩튂 議곗젙)
    const resetBtnY = GH - 110;
    ctx.fillStyle = '#ff9800';
    if (typeof ctx.roundRect === 'function') {
        ctx.beginPath();
        ctx.roundRect(50, resetBtnY, GW - 100, 45, 10);
        ctx.fill();
    } else {
        ctx.fillRect(50, resetBtnY, GW - 100, 45);
    }
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px ' + FONT_HANGUL;
    ctx.textAlign = 'center';
    ctx.fillText('?ㅼ젙 珥덇린??, GW / 2, resetBtnY + 22.5);

    // 6. ?섎떒 ?덈궡
    ctx.textAlign = 'center';
    ctx.fillStyle = '#777777';
    ctx.font = '13px ' + FONT_HANGUL;
    ctx.fillText('??ぉ???곗튂?섏뿬 ?ㅼ젙??蹂寃쏀븯?몄슂', GW / 2, GH - 35);
}


function drawRankingInput(ctx) {
    if (!ctx) ctx = G.ctx;
    // 諛곌꼍 ?ㅽ겕濡?(泥쒖쿇??
    G.scrollOffset += 2;
    // drawBackground handled in Game Loop or logic?
    // Assume Logic handles BG clearing or we need shared BG drawing.
    // Ideally UI should just draw UI. Logic handles Scene.

    const GW = ctx.canvas.width;
    const GH = ctx.canvas.height;

    // Overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, GW, GH);

    ctx.font = 'bold 36px "Courier New", monospace';
    ctx.textAlign = 'center';

    ctx.fillStyle = '#ff0000';
    ctx.fillText('HIGH SCORE!', GW / 2, 80);

    ctx.fillStyle = '#fff';
    ctx.font = '20px "Courier New", monospace';
    ctx.fillText('ENTER YOUR INITIALS', GW / 2, 140);

    ctx.fillStyle = COLORS.NEON_GREEN;
    ctx.font = '32px "Courier New", monospace';
    ctx.fillText('SCORE: ' + Math.floor(G.score), GW / 2, 200);

    const charW = 40;
    const totalW = charW * 3;
    const startX = (GW - totalW) / 2 + charW / 2;
    const y = 300;

    ctx.font = 'bold 40px "Courier New", monospace';
    for (let i = 0; i < 3; i++) {
        const char = G.inputName[i] || '_';
        const x = startX + i * charW;

        ctx.fillStyle = '#fff';
        if (i === G.inputName.length && Math.floor(Date.now() / 500) % 2 === 0) {
            ctx.fillStyle = '#ffff00';
        }
        ctx.fillText(char, x, y);
    }

    ctx.font = '18px "Courier New", monospace';
    ctx.fillStyle = '#aaa';
    ctx.fillText('TYPE INITIALS & ENTER', GW / 2, 400);
}

function drawRankingBoard(ctx) {
    if (!ctx) ctx = G.ctx;
    const GW = ctx.canvas.width;
    const GH = ctx.canvas.height;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, GW, GH);

    ctx.font = 'bold 32px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = COLORS.MAGENTA;
    ctx.fillText('TOP 20 RANKING', GW / 2, 50);

    ctx.font = '20px "Courier New", monospace';
    ctx.fillStyle = COLORS.CYAN;
    ctx.fillText('RANK  NAME   SCORE', GW / 2, 90);

    const startY = 120;
    const lineHeight = 24;

    for (let i = 0; i < G.highScores.length; i++) {
        if (i >= 20) break;
        const entry = G.highScores[i];
        const y = startY + i * lineHeight;

        if (i === G.newHighScoreIndex && Math.floor(Date.now() / 300) % 2 === 0) {
            ctx.fillStyle = '#ffff00';
        } else {
            ctx.fillStyle = '#fff';
        }

        const rank = i + 1;
        const rankStr = rank < 10 ? ' ' + rank : rank;

        ctx.textAlign = 'left';
        ctx.fillText(rankStr + 'TH', 20, y);
        ctx.textAlign = 'center';
        ctx.fillText(entry.name, GW / 2, y);
        ctx.textAlign = 'right';
        ctx.fillText(entry.score, GW - 20, y);
    }

    ctx.font = '18px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = COLORS.NEON_GREEN;
    if (Math.floor(Date.now() / 800) % 2 === 0) {
        ctx.fillText('PRESS SPACE/ENTER', GW / 2, GH - 50);
    }

    ctx.font = '16px "Courier New", monospace';
    ctx.fillStyle = '#aaa';
    ctx.fillText('TO GAME OVER', GW / 2, GH - 20);
}

```

## js\ui_GOLDEN_MASTER.js
```js
/**
 * UI Renderer for Jumping Girl
 * Handles drawing of menus, options, ranking, HUD, etc.
 * DO NOT MODIFY THIS FILE WITHOUT EXPLICIT USER CONSENT.
 * PRESERVES USER CUSTOMIZATIONS.
 */

// Global access to game state aliases
const G = window.GameState;

// Color Palette
const COLORS = {
    MINT: '#5FD9B0',
    ORANGE: '#FF9800',
    NEON_GREEN: '#39ff14',
    MAGENTA: '#ff00ff',
    CYAN: '#00ffff',
    RED: '#e94560',
    WHITE: '#fff',
    BLACK: '#000',
    GRAY: '#555',
    BG_DARK: '#16213e'
};

function isInBtn(p, btn) {
    return p.x >= btn.x && p.x <= btn.x + btn.w && p.y >= btn.y && p.y <= btn.y + btn.h;
}

// ?띿뒪??以꾨컮轅??⑥닔
function wrapText(ctx, text, maxWidth, fontSize) {
    const words = text.split('');
    const lines = [];
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
        const testLine = currentLine + words[i];
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && currentLine !== '') {
            lines.push(currentLine);
            currentLine = words[i];
        } else {
            currentLine = testLine;
        }
    }
    if (currentLine !== '') {
        lines.push(currentLine);
    }
    return lines;
}

// ?듭뀡 踰꾪듉 洹몃━湲?(?고븯???깅땲諛뷀??꾩씠肄?
function drawOptionsButton(ctx) {
    if (!ctx) ctx = G.ctx;
    // 諛곌꼍 ?먰삎 踰꾪듉
    ctx.fillStyle = 'rgba(155, 89, 182, 0.8)'; // 諛섑닾紐?蹂대씪??
    ctx.beginPath();
    ctx.arc(OPTIONS_BTN.x + OPTIONS_BTN.w / 2, OPTIONS_BTN.y + OPTIONS_BTN.h / 2, OPTIONS_BTN.w / 2, 0, Math.PI * 2);
    ctx.fill();

    // ?뚮몢由?
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // ?깅땲諛뷀??꾩씠肄?
    ctx.font = '32px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    ctx.fillText('?숋툘', OPTIONS_BTN.x + OPTIONS_BTN.w / 2, OPTIONS_BTN.y + OPTIONS_BTN.h / 2);

    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
}

// ?꾧컧 踰꾪듉 洹몃━湲?
function drawCollectionButton(ctx) {
    if (!ctx) ctx = G.ctx;
    // 諛곌꼍 ?먰삎 踰꾪듉
    ctx.fillStyle = 'rgba(155, 89, 182, 0.8)';
    ctx.beginPath();
    ctx.arc(COLLECTION_BTN.x + COLLECTION_BTN.w / 2, COLLECTION_BTN.y + COLLECTION_BTN.h / 2, COLLECTION_BTN.w / 2, 0, Math.PI * 2);
    ctx.fill();

    // ?뚮몢由?
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 梨??꾩씠肄?
    ctx.font = '32px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    ctx.fillText('?뱰', COLLECTION_BTN.x + COLLECTION_BTN.w / 2, COLLECTION_BTN.y + COLLECTION_BTN.h / 2);

    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
}

function drawOptions(ctx) {
    const G = window.GameState;
    if (!ctx) ctx = G.ctx;
    const options = G.options;
    const GW = ctx.canvas.width;
    const GH = ctx.canvas.height;

    // 1. 諛곌꼍 ?대몼寃?(釉붾윭 ?먮굦??源딆? ?대몺)
    ctx.fillStyle = 'rgba(10, 10, 10, 0.98)';
    ctx.fillRect(0, 0, GW, GH);

    // 2. ?쒕ぉ
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px ' + FONT_HANGUL;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('OPTIONS', GW / 2, 55);

    // 3. ?ㅻ줈 媛湲?踰꾪듉 (?곷떒 醫뚯륫)
    ctx.fillStyle = '#e94560';
    if (typeof ctx.roundRect === 'function') {
        ctx.beginPath();
        ctx.roundRect(20, 25, 60, 40, 12);
        ctx.fill();
    } else {
        ctx.fillRect(20, 25, 60, 40);
    }
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px ' + FONT_HANGUL;
    ctx.fillText('??, 50, 45);

    // 4. ?듭뀡 由ъ뒪???뺤쓽 (媛꾧꺽 議곗젙: startY=110, itemHeight=60)
    const listStartY = 110;
    const listHeight = 60;
    const items = G.OPTION_ITEMS;

    if (!items) return;

    items.forEach((item, index) => {
        const itemY = listStartY + index * listHeight;
        const isSelected = (G.selectedOptionIndex === index);

        // ?좏깮 媛뺤“ (諛곌꼍 湲濡쒖슦)
        if (isSelected) {
            const gradient = ctx.createLinearGradient(0, itemY - 25, GW, itemY + 25);
            gradient.addColorStop(0, 'rgba(57, 255, 20, 0.05)');
            gradient.addColorStop(0.5, 'rgba(57, 255, 20, 0.15)');
            gradient.addColorStop(1, 'rgba(57, 255, 20, 0.05)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, itemY - 28, GW, 56);

            // ?쇱そ ?몃뵒耳?댄꽣 諛?
            ctx.fillStyle = '#39ff14';
            ctx.fillRect(0, itemY - 25, 4, 50);
        }

        // ?쇰꺼 (醫뚯륫)
        ctx.textAlign = 'left';
        ctx.fillStyle = isSelected ? '#39ff14' : '#ffffff';
        ctx.font = isSelected ? 'bold 20px ' + FONT_HANGUL : '18px ' + FONT_HANGUL;
        ctx.fillText(item.label, 25, itemY);

        // 而⑦듃濡?(?곗륫)
        ctx.textAlign = 'right';
        const controlX = GW - 25;

        if (item.type === 'toggle') {
            const isOn = options[item.key];
            // ?좉? 諛곌꼍
            ctx.fillStyle = isOn ? '#39ff14' : '#333';
            if (typeof ctx.roundRect === 'function') {
                ctx.beginPath();
                ctx.roundRect(controlX - 55, itemY - 12, 55, 24, 12);
                ctx.fill();
            } else {
                ctx.fillRect(controlX - 55, itemY - 12, 55, 24);
            }
            // ?좉? ?띿뒪??
            ctx.fillStyle = isOn ? '#000' : '#fff';
            ctx.font = 'bold 12px sans-serif';
            ctx.fillText(isOn ? 'ON' : 'OFF', controlX - 27.5, itemY);
        } else if (item.type === 'slider') {
            let val = options[item.key];
            if (item.isPercent && val <= 1) val = Math.round(val * 100);
            const valTxt = val + (item.suffix || (item.isPercent ? '%' : ''));

            // ?щ씪?대뜑 ?띿뒪??
            ctx.fillStyle = isSelected ? '#39ff14' : '#fff';
            ctx.font = '16px ' + FONT_HANGUL;
            ctx.fillText(valTxt, controlX, itemY - 8);

            // 寃뚯씠吏 諛?
            ctx.fillStyle = '#222';
            ctx.fillRect(controlX - 100, itemY + 8, 100, 4);
            const ratio = (val - (item.min || 0)) / ((item.max || 100) - (item.min || 0));
            ctx.fillStyle = '#39ff14';
            ctx.fillRect(controlX - 100, itemY + 8, 100 * ratio, 4);
        } else if (item.type === 'select') {
            ctx.fillStyle = isSelected ? '#39ff14' : '#fff';
            ctx.font = '16px sans-serif';
            ctx.fillText(String(options[item.key]).toUpperCase(), controlX, itemY);
        }
    });

    // 5. ?ㅼ젙 珥덇린??踰꾪듉 (?꾩튂 議곗젙)
    const resetBtnY = GH - 110;
    ctx.fillStyle = '#ff9800';
    if (typeof ctx.roundRect === 'function') {
        ctx.beginPath();
        ctx.roundRect(50, resetBtnY, GW - 100, 45, 10);
        ctx.fill();
    } else {
        ctx.fillRect(50, resetBtnY, GW - 100, 45);
    }
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px ' + FONT_HANGUL;
    ctx.textAlign = 'center';
    ctx.fillText('?ㅼ젙 珥덇린??, GW / 2, resetBtnY + 22.5);

    // 6. ?섎떒 ?덈궡
    ctx.textAlign = 'center';
    ctx.fillStyle = '#777777';
    ctx.font = '13px ' + FONT_HANGUL;
    ctx.fillText('??ぉ???곗튂?섏뿬 ?ㅼ젙??蹂寃쏀븯?몄슂', GW / 2, GH - 35);
}


function drawRankingInput(ctx) {
    if (!ctx) ctx = G.ctx;
    // 諛곌꼍 ?ㅽ겕濡?(泥쒖쿇??
    G.scrollOffset += 2;
    // drawBackground handled in Game Loop or logic?
    // Assume Logic handles BG clearing or we need shared BG drawing.
    // Ideally UI should just draw UI. Logic handles Scene.

    const GW = ctx.canvas.width;
    const GH = ctx.canvas.height;

    // Overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, GW, GH);

    ctx.font = 'bold 36px "Courier New", monospace';
    ctx.textAlign = 'center';

    ctx.fillStyle = '#ff0000';
    ctx.fillText('HIGH SCORE!', GW / 2, 80);

    ctx.fillStyle = '#fff';
    ctx.font = '20px "Courier New", monospace';
    ctx.fillText('ENTER YOUR INITIALS', GW / 2, 140);

    ctx.fillStyle = COLORS.NEON_GREEN;
    ctx.font = '32px "Courier New", monospace';
    ctx.fillText('SCORE: ' + Math.floor(G.score), GW / 2, 200);

    const charW = 40;
    const totalW = charW * 3;
    const startX = (GW - totalW) / 2 + charW / 2;
    const y = 300;

    ctx.font = 'bold 40px "Courier New", monospace';
    for (let i = 0; i < 3; i++) {
        const char = G.inputName[i] || '_';
        const x = startX + i * charW;

        ctx.fillStyle = '#fff';
        if (i === G.inputName.length && Math.floor(Date.now() / 500) % 2 === 0) {
            ctx.fillStyle = '#ffff00';
        }
        ctx.fillText(char, x, y);
    }

    ctx.font = '18px "Courier New", monospace';
    ctx.fillStyle = '#aaa';
    ctx.fillText('TYPE INITIALS & ENTER', GW / 2, 400);
}

function drawRankingBoard(ctx) {
    if (!ctx) ctx = G.ctx;
    const GW = ctx.canvas.width;
    const GH = ctx.canvas.height;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, GW, GH);

    ctx.font = 'bold 32px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = COLORS.MAGENTA;
    ctx.fillText('TOP 20 RANKING', GW / 2, 50);

    ctx.font = '20px "Courier New", monospace';
    ctx.fillStyle = COLORS.CYAN;
    ctx.fillText('RANK  NAME   SCORE', GW / 2, 90);

    const startY = 120;
    const lineHeight = 24;

    for (let i = 0; i < G.highScores.length; i++) {
        if (i >= 20) break;
        const entry = G.highScores[i];
        const y = startY + i * lineHeight;

        if (i === G.newHighScoreIndex && Math.floor(Date.now() / 300) % 2 === 0) {
            ctx.fillStyle = '#ffff00';
        } else {
            ctx.fillStyle = '#fff';
        }

        const rank = i + 1;
        const rankStr = rank < 10 ? ' ' + rank : rank;

        ctx.textAlign = 'left';
        ctx.fillText(rankStr + 'TH', 20, y);
        ctx.textAlign = 'center';
        ctx.fillText(entry.name, GW / 2, y);
        ctx.textAlign = 'right';
        ctx.fillText(entry.score, GW - 20, y);
    }

    ctx.font = '18px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = COLORS.NEON_GREEN;
    if (Math.floor(Date.now() / 800) % 2 === 0) {
        ctx.fillText('PRESS SPACE/ENTER', GW / 2, GH - 50);
    }

    ctx.font = '16px "Courier New", monospace';
    ctx.fillStyle = '#aaa';
    ctx.fillText('TO GAME OVER', GW / 2, GH - 20);
}

```

## js\ui_stable_backup.js
```js
/**
 * UI Renderer for Jumping Girl
 * Handles drawing of menus, options, ranking, HUD, etc.
 * DO NOT MODIFY THIS FILE WITHOUT EXPLICIT USER CONSENT.
 * PRESERVES USER CUSTOMIZATIONS.
 */

// Global access to game state aliases
const G = window.GameState;

// Color Palette
const COLORS = {
    MINT: '#5FD9B0',
    ORANGE: '#FF9800',
    NEON_GREEN: '#39ff14',
    MAGENTA: '#ff00ff',
    CYAN: '#00ffff',
    RED: '#e94560',
    WHITE: '#fff',
    BLACK: '#000',
    GRAY: '#555',
    BG_DARK: '#16213e'
};

function isInBtn(p, btn) {
    return p.x >= btn.x && p.x <= btn.x + btn.w && p.y >= btn.y && p.y <= btn.y + btn.h;
}

// ?띿뒪??以꾨컮轅??⑥닔
function wrapText(ctx, text, maxWidth, fontSize) {
    const words = text.split('');
    const lines = [];
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
        const testLine = currentLine + words[i];
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && currentLine !== '') {
            lines.push(currentLine);
            currentLine = words[i];
        } else {
            currentLine = testLine;
        }
    }
    if (currentLine !== '') {
        lines.push(currentLine);
    }
    return lines;
}

// ?듭뀡 踰꾪듉 洹몃━湲?(?고븯???깅땲諛뷀??꾩씠肄?
function drawOptionsButton(ctx) {
    if (!ctx) ctx = G.ctx;
    // 諛곌꼍 ?먰삎 踰꾪듉
    ctx.fillStyle = 'rgba(155, 89, 182, 0.8)'; // 諛섑닾紐?蹂대씪??
    ctx.beginPath();
    ctx.arc(OPTIONS_BTN.x + OPTIONS_BTN.w / 2, OPTIONS_BTN.y + OPTIONS_BTN.h / 2, OPTIONS_BTN.w / 2, 0, Math.PI * 2);
    ctx.fill();

    // ?뚮몢由?
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // ?깅땲諛뷀??꾩씠肄?
    ctx.save();
    ctx.translate(OPTIONS_BTN.x + OPTIONS_BTN.w / 2, OPTIONS_BTN.y + OPTIONS_BTN.h / 2);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    const radius = 12;
    const innerRadius = 8;
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const x1 = Math.cos(angle) * radius;
        const y1 = Math.sin(angle) * radius;
        const x2 = Math.cos(angle) * innerRadius;
        const y2 = Math.sin(angle) * innerRadius;
        if (i === 0) ctx.moveTo(x1, y1);
        else ctx.lineTo(x1, y1);
        ctx.lineTo(x2, y2);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // 以묒븰 ??
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

// ?꾧컧 踰꾪듉 洹몃━湲?
function drawCollectionButton(ctx) {
    if (!ctx) ctx = G.ctx;
    // 諛곌꼍 ?먰삎 踰꾪듉
    ctx.fillStyle = 'rgba(155, 89, 182, 0.8)';
    ctx.beginPath();
    ctx.arc(COLLECTION_BTN.x + COLLECTION_BTN.w / 2, COLLECTION_BTN.y + COLLECTION_BTN.h / 2, COLLECTION_BTN.w / 2, 0, Math.PI * 2);
    ctx.fill();

    // ?뚮몢由?
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 梨??꾩씠肄?
    ctx.font = '32px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    ctx.fillText('?뱰', COLLECTION_BTN.x + COLLECTION_BTN.w / 2, COLLECTION_BTN.y + COLLECTION_BTN.h / 2);

    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
}

function drawOptions(ctx) {
    if (!ctx) ctx = G.ctx;
    const options = G.options;
    const GW = ctx.canvas.width;
    const GH = ctx.canvas.height;

    // Clear & BG
    ctx.clearRect(0, 0, GW, GH);
    ctx.fillStyle = COLORS.BG_DARK;
    ctx.fillRect(0, 0, GW, GH);

    // Header
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 36px ' + FONT_HANGUL;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.strokeText('?듭뀡', GW / 2, 40);
    ctx.fillText('?듭뀡', GW / 2, 40);

    // Back Button
    ctx.fillStyle = '#e94560';
    if (typeof ctx.roundRect === 'function') {
        ctx.beginPath();
        ctx.roundRect(20, 20, 60, 40, 8);
        ctx.fill();
    } else {
        ctx.fillRect(20, 20, 60, 40);
    }
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px ' + FONT_HANGUL;
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeText('??, 50, 40);
    ctx.fillText('??, 50, 40);

    // --- Options List ---
    // DO NOT CHANGE LAYOUT - USER REQUEST
    const startY = 100;
    const itemHeight = 60;
    const selectedOptionIndex = G.selectedOptionIndex || 0; // Fallback

    const OPTION_ITEMS_RENDER = [
        { label: 'BGM', type: 'toggle', value: options.bgmEnabled },
        { label: 'BGM 蹂쇰ⅷ', type: 'slider', value: options.bgmVolume, min: 0, max: 100, isPercent: true },
        { label: '?④낵??, type: 'toggle', value: options.sfxEnabled },
        { label: '?④낵??蹂쇰ⅷ', type: 'slider', value: options.sfxVolume, min: 0, max: 100, isPercent: true },
        { label: '?대━??嫄곕━', type: 'slider', value: options.clearDistance, min: 100, max: 1000, suffix: 'm' },
        { label: '洹몃옒???덉쭏', type: 'select', value: options.graphicsQuality },
        { label: '?꾩껜?붾㈃', type: 'toggle', value: options.fullscreen }
    ];

    ctx.font = '20px ' + FONT_HANGUL;
    ctx.textBaseline = 'middle';

    OPTION_ITEMS_RENDER.forEach((item, index) => {
        const y = startY + index * itemHeight;

        // Highlight Text Color Only
        if (index === selectedOptionIndex) {
            ctx.fillStyle = COLORS.NEON_GREEN;
        } else {
            ctx.fillStyle = COLORS.WHITE;
        }

        // Label
        ctx.textAlign = 'left';
        ctx.fillText(item.label, 40, y);

        // Control
        ctx.textAlign = 'right';

        if (item.type === 'toggle') {
            // Switch
            const switchW = 60;
            const switchH = 30;
            const switchX = GW - 40 - switchW;
            const switchY = y - switchH / 2;
            const isOn = item.value;

            ctx.fillStyle = isOn ? COLORS.NEON_GREEN : COLORS.GRAY;
            if (typeof ctx.roundRect === 'function') {
                ctx.beginPath();
                ctx.roundRect(switchX, switchY, switchW, switchH, 15);
                ctx.fill();
            } else {
                ctx.fillRect(switchX, switchY, switchW, switchH);
            }

            const circleX = isOn ? switchX + switchW - 15 - 2 : switchX + 15 + 2;
            ctx.fillStyle = COLORS.WHITE;
            ctx.beginPath();
            ctx.arc(circleX, switchY + switchH / 2, 12, 0, Math.PI * 2);
            ctx.fill();

        } else if (item.type === 'slider') {
            // Value Text
            let displayVal = item.value;
            if (item.isPercent && displayVal <= 1) displayVal = Math.round(displayVal * 100);

            let valueText = displayVal + (item.isPercent ? '%' : '');
            if (item.suffix) valueText = displayVal + item.suffix;

            ctx.fillText(valueText, GW - 40, y);

            // Slider Gauge
            const sliderX = 140;
            const sliderW = GW - 140 - 50 - 40;
            const sliderY = y;

            // Background Bar
            ctx.fillStyle = COLORS.GRAY;
            ctx.fillRect(sliderX, sliderY - 4, sliderW, 8);

            // Filled Bar
            let min = item.min || 0;
            let max = item.max || 100;
            let val = displayVal; // Normalized handled in logic, here raw
            let percentage = (val - min) / (max - min);

            ctx.fillStyle = index === selectedOptionIndex ? COLORS.NEON_GREEN : COLORS.WHITE;
            ctx.fillRect(sliderX, sliderY - 4, sliderW * percentage, 8);

            // Handle
            ctx.fillStyle = COLORS.WHITE;
            ctx.beginPath();
            ctx.arc(sliderX + sliderW * percentage, sliderY, 8, 0, Math.PI * 2);
            ctx.fill();

        } else if (item.type === 'select') {
            ctx.fillText(item.value.toUpperCase(), GW - 40, y);
        }
    });

    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';

    // Guide
    ctx.font = '16px ' + FONT_HANGUL;
    ctx.fillStyle = '#999999';
    ctx.fillText('?곗튂/?대┃?섏뿬 媛?蹂寃?, GW / 2, GH - 30);
}

function drawRankingInput(ctx) {
    if (!ctx) ctx = G.ctx;
    // 諛곌꼍 ?ㅽ겕濡?(泥쒖쿇??
    G.scrollOffset += 2;
    // drawBackground handled in Game Loop or logic?
    // Assume Logic handles BG clearing or we need shared BG drawing.
    // Ideally UI should just draw UI. Logic handles Scene.

    const GW = ctx.canvas.width;
    const GH = ctx.canvas.height;

    // Overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, GW, GH);

    ctx.font = 'bold 36px "Courier New", monospace';
    ctx.textAlign = 'center';

    ctx.fillStyle = '#ff0000';
    ctx.fillText('HIGH SCORE!', GW / 2, 80);

    ctx.fillStyle = '#fff';
    ctx.font = '20px "Courier New", monospace';
    ctx.fillText('ENTER YOUR INITIALS', GW / 2, 140);

    ctx.fillStyle = COLORS.NEON_GREEN;
    ctx.font = '32px "Courier New", monospace';
    ctx.fillText('SCORE: ' + Math.floor(G.score), GW / 2, 200);

    const charW = 40;
    const totalW = charW * 3;
    const startX = (GW - totalW) / 2 + charW / 2;
    const y = 300;

    ctx.font = 'bold 40px "Courier New", monospace';
    for (let i = 0; i < 3; i++) {
        const char = G.inputName[i] || '_';
        const x = startX + i * charW;

        ctx.fillStyle = '#fff';
        if (i === G.inputName.length && Math.floor(Date.now() / 500) % 2 === 0) {
            ctx.fillStyle = '#ffff00';
        }
        ctx.fillText(char, x, y);
    }

    ctx.font = '18px "Courier New", monospace';
    ctx.fillStyle = '#aaa';
    ctx.fillText('TYPE INITIALS & ENTER', GW / 2, 400);
}

function drawRankingBoard(ctx) {
    if (!ctx) ctx = G.ctx;
    const GW = ctx.canvas.width;
    const GH = ctx.canvas.height;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, GW, GH);

    ctx.font = 'bold 32px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = COLORS.MAGENTA;
    ctx.fillText('TOP 20 RANKING', GW / 2, 50);

    ctx.font = '20px "Courier New", monospace';
    ctx.fillStyle = COLORS.CYAN;
    ctx.fillText('RANK  NAME   SCORE', GW / 2, 90);

    const startY = 120;
    const lineHeight = 24;

    for (let i = 0; i < G.highScores.length; i++) {
        if (i >= 20) break;
        const entry = G.highScores[i];
        const y = startY + i * lineHeight;

        if (i === G.newHighScoreIndex && Math.floor(Date.now() / 300) % 2 === 0) {
            ctx.fillStyle = '#ffff00';
        } else {
            ctx.fillStyle = '#fff';
        }

        const rank = i + 1;
        const rankStr = rank < 10 ? ' ' + rank : rank;

        ctx.textAlign = 'left';
        ctx.fillText(rankStr + 'TH', 20, y);
        ctx.textAlign = 'center';
        ctx.fillText(entry.name, GW / 2, y);
        ctx.textAlign = 'right';
        ctx.fillText(entry.score, GW - 20, y);
    }

    ctx.font = '18px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = COLORS.NEON_GREEN;
    if (Math.floor(Date.now() / 800) % 2 === 0) {
        ctx.fillText('PRESS SPACE/ENTER', GW / 2, GH - 50);
    }

    ctx.font = '16px "Courier New", monospace';
    ctx.fillStyle = '#aaa';
    ctx.fillText('TO GAME OVER', GW / 2, GH - 20);
}

```

