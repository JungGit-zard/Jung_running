/**
 * Game Configuration & Constants
 */
const GW = 360, GH = 640;
const GROUND_Y = GH - 100;
const GRAVITY = 0.55;
const JUMP_POWER = -13; // 1단 점프
const AIR_JUMP_POWER = -11; // 2단 점프
const GIRL_W = 96, GIRL_H = 180;
const GIRL_OFFSET_Y = 0; // 소녀가 지면에서 떠있는 간격 아님, 좌표 보정
const GIRL_X = 50;
const MAX_FALL_SPEED = 14;

// 폰트
const FONT_HANGUL = '"Nanum Myeongjo", serif';

// UI Constants
const BTN = { x: 50, y: 400, w: 260, h: 56 }; // 게임 시작 버튼
const RETRY_BTN = { x: 50, y: 320, w: 260, h: 56 }; // 다시 하기 버튼
const TITLE_BTN = { x: 50, y: 400, w: 260, h: 56 }; // 타이틀로 돌아가기 버튼
const MAX_HIGH_SCORES = 20; // 최대 랭킹 저장 수
const ATTENDANCE_BTN = { x: 50, y: 480, w: 260, h: 56 }; // 출석체크 버튼
const COLLECTION_BTN = { x: 20, y: GH - 80, w: 60, h: 60 }; // 도감 버튼 (좌하단)
const OPTIONS_BTN = { x: GW - 80, y: GH - 80, w: 60, h: 60 }; // 옵션 버튼 (우하단)

const FOOD_SPEED = 5.0; // 음식 이동 속도
const FOOD_SIZE = 56;
const RELOAD_COOLDOWN_DURATION = 14; // 총알 재장전 쿨타임 (프레임)
const BULLET_SPEED = 12;
const BULLET_W = 20, BULLET_H = 10;
const BOMB_W = 32, BOMB_H = 32;
const BOMB_VX = 5.5, BOMB_VY = -6.0; // 폭탄 던지는 속도

// Collection Data
const COLLECTION_ITEMS = [
    // 1열
    { type: 'food', emoji: '🍔' }, { type: 'food', emoji: '🍕' }, { type: 'food', emoji: '🌭' }, { type: 'food', emoji: '🍗' },
    // 2열
    { type: 'food', emoji: '🍟' }, { type: 'food', emoji: '🍩' }, { type: 'food', emoji: '🍰' }, { type: 'food', emoji: '🍦' },
    // 3열
    { type: 'food', emoji: '🍪' }, { type: 'food', emoji: '🍫' }, { type: 'food', emoji: '🍬' }, { type: 'placeholder' },
    // 4열
    { type: 'placeholder' }, { type: 'placeholder' }, { type: 'placeholder' }, { type: 'placeholder' }
];

const FOOD_COLLECTION_DATA = {
    '🍔': { name: '햄버거', nameEn: 'Hamburger', description: '육즙 가득한 패티와 신선한 야채의 조화. 한 입 베어 물면 행복이 퍼집니다.' },
    '🍕': { name: '피자', nameEn: 'Pizza', description: '치즈가 쭉 늘어나는 이탈리아의 맛. 토핑에 따라 다양한 매력을 가집니다.' },
    '🌭': { name: '핫도그', nameEn: 'Hotdog', description: '간편하게 즐기는 소시지와 빵. 케첩과 머스타드를 뿌려 드세요.' },
    '🍗': { name: '치킨', nameEn: 'Chicken', description: '바삭한 튀김옷 속 촉촉한 속살. 국민 간식 치킨입니다.' },
    '🍟': { name: '감자튀김', nameEn: 'French Fries', description: '짭짤하고 고소한 감자의 맛. 햄버거와 최고의 짝꿍입니다.' },
    '🍩': { name: '도넛', nameEn: 'Donut', description: '달콤한 설탕 코팅과 부드러운 빵. 커피와 함께 즐기면 더욱 좋습니다.' },
    '🍰': { name: '케이크', nameEn: 'Cake', description: '특별한 날을 축하하는 부드러운 디저트. 달콤한 크림이 입안에서 녹습니다.' },
    '🍦': { name: '아이스크림', nameEn: 'Ice Cream', description: '시원하고 달콤한 여름의 맛. 다양한 맛을 골라 먹는 재미가 있습니다.' },
    '🍪': { name: '쿠키', nameEn: 'Cookie', description: '바삭바삭한 식감과 달콤한 초콜릿 칩. 우유와 함께 먹으면 꿀맛입니다.' },
    '🍫': { name: '초콜릿', nameEn: 'Chocolate', description: '진한 카카오의 풍미. 스트레스를 날려버리는 달콤함입니다.' },
    '🍬': { name: '사탕', nameEn: 'Candy', description: '알록달록한 색깔과 다양한 과일 맛. 입안 가득 퍼지는 달콤함을 즐겨보세요.' }
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
        clearDistance: 450, // 450m (기본값)
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

