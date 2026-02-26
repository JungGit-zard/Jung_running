/**
 * Jumping Girl - Food Escape
 * 세라복 소녀가 달리며, 오른쪽에서 다가오는 음식을 스페이스(점프)로 피하는 게임
 * @see docs/implementation-baseline.md   (구현 기준·전체 스펙)
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
let selectedOptionIndex = 0; // 옵션 메뉴 커서
let selectedFoodIndex = 0;   // 도감 선택 커서

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

// 1스테이지 클리어 이미지
const stage1ClearImage = new Image();
stage1ClearImage.src = 'graphic_resource/stage_clear/1stage_clear.png';
let stage1ClearReady = false;
stage1ClearImage.onload = function () { stage1ClearReady = true; };

// 게임 시작 화면: graphic_resource/screen_title.png (깔어놓기). 미로딩 시 단색+텍스트 폴백
const titleImage = new Image();
titleImage.src = 'graphic_resource/screen_title.png';
let titleReady = false;
titleImage.onload = function () { titleReady = true; };

// 주인공: run.gif (달리기, 투명 배경 GIF 애니메이션)
// Canvas에서는 GIF 애니메이션이 재생되지 않으므로 img 태그를 사용
const girlImage = new Image();
girlImage.crossOrigin = 'anonymous';
let girlReady = false;
const girlGifPath = 'graphic_resource/character/anim/run.gif';

// img 태그에 GIF 설정
if (girlGifImg) {
  girlGifImg.src = girlGifPath;
  girlGifImg.onload = function () {
    girlReady = true;
    console.log('✅ 달리기 GIF 로드 완료 (img 태그):', girlGifImg.naturalWidth, 'x', girlGifImg.naturalHeight);
  };
  girlGifImg.onerror = function (e) {
    girlReady = false;
    console.error('❌ 달리기 GIF 로드 실패:', girlGifPath);
  };
}

// Image 객체도 로드 (폴백용)
girlImage.onload = function () {
  if (!girlReady) girlReady = true;
  console.log('✅ 달리기 GIF 로드 완료 (Image 객체):', girlImage.naturalWidth, 'x', girlImage.naturalHeight);
};
girlImage.onerror = function (e) {
  console.error('❌ 달리기 GIF 로드 실패 (Image 객체):', girlImage.src);
};
const girlChromaKeyRef = { chromaKey: null, isGif: true };
(async function loadGirlImage() {
  const path = girlGifPath;
  console.log('🔄 달리기 GIF 로드 시작:', path);
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

// 탄환 발사 시: shoot.gif (투명 배경 GIF 애니메이션)
// Canvas에서는 GIF 애니메이션이 재생되지 않으므로 img 태그를 사용
const shootImage = new Image();
shootImage.crossOrigin = 'anonymous';
let shootReady = false;
let shootActive = false; // true일 때 drawGirl은 shootGifImg를 그림
let shootFrameCount = 0; // 발사 애니메이션 프레임 카운트
const SHOOT_DURATION = 24; // 발사 애니메이션 지속 시간 (프레임) - 30의 80%
let reloadCooldown = 0; // 재장전 쿨타임 (프레임) - 2초 = 120프레임
// Reload cooldown moved to config.js
// const RELOAD_COOLDOWN_DURATION = 120;
const shootGifPath = 'graphic_resource/character/anim/shoot.gif';

// 폭탄 던지기 애니메이션
let bombActive = false; // true일 때 drawGirl은 bombGifImg를 그림
let bombFrameCount = 0; // 폭탄 던지기 애니메이션 프레임 카운트
const BOMB_DURATION = 15; // 폭탄 던지기 애니메이션 지속 시간 (프레임) - 2배 빠르게
const bombGifPath = 'graphic_resource/character/anim/bomb.gif';
let bombReady = false;

// img 태그에 GIF 설정
if (shootGifImg) {
  shootGifImg.src = shootGifPath;
  shootGifImg.onload = function () {
    shootReady = true;
    console.log('✅ 발사 GIF 로드 완료 (img 태그):', shootGifImg.naturalWidth, 'x', shootGifImg.naturalHeight);
  };
  shootGifImg.onerror = function (e) {
    shootReady = false;
    console.error('❌ 발사 GIF 로드 실패:', shootGifPath);
  };
}

// Image 객체도 로드 (폴백용)
shootImage.onload = function () {
  if (!shootReady) shootReady = true;
  console.log('✅ 발사 GIF 로드 완료 (Image 객체):', shootImage.naturalWidth, 'x', shootImage.naturalHeight);
};
shootImage.onerror = function (e) {
  console.error('❌ 발사 GIF 로드 실패 (Image 객체):', shootImage.src);
};

// 폭탄 던지기 GIF 로드
if (bombGifImg) {
  bombGifImg.src = bombGifPath;
  bombGifImg.onload = function () {
    bombReady = true;
    console.log('✅ 폭탄 던지기 GIF 로드 완료 (img 태그):', bombGifImg.naturalWidth, 'x', bombGifImg.naturalHeight);
  };
  bombGifImg.onerror = function (e) {
    bombReady = false;
    console.error('❌ 폭탄 던지기 GIF 로드 실패:', bombGifPath);
  };
}
const shootChromaKeyRef = { chromaKey: null, isGif: true };
(async function loadShootImage() {
  const path = shootGifPath;
  console.log('🔄 발사 GIF 로드 시작:', path);
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

// 슬라이딩: sliding.gif (투명 배경 GIF 애니메이션)
// Canvas에서는 GIF 애니메이션이 재생되지 않으므로 img 태그를 사용
const slideImage = new Image();
slideImage.crossOrigin = 'anonymous';
let slideReady = false;
let slideActive = false; // true일 때 drawGirl은 slideImage를 그림
let slideFrameCount = 0; // 슬라이딩 애니메이션 프레임 카운트
let slideStartFrame = 0; // 슬라이딩 시작 프레임
let slideLoopCompleted = false; // 슬라이딩 루프 1회 완료 여부
const slideGifPath = 'graphic_resource/character/anim/sliding.gif';

// img 태그에 GIF 설정
if (slideGifImg) {
  slideGifImg.src = slideGifPath;
  slideGifImg.onload = function () {
    slideReady = true;
    console.log('✅ 슬라이딩 GIF 로드 완료 (img 태그):', slideGifImg.naturalWidth, 'x', slideGifImg.naturalHeight);
  };
  slideGifImg.onerror = function (e) {
    slideReady = false;
    console.error('❌ 슬라이딩 GIF 로드 실패:', slideGifPath);
  };
}

// Image 객체도 로드 (폴백용)
slideImage.onload = function () {
  if (!slideReady) slideReady = true;
  console.log('✅ 슬라이딩 GIF 로드 완료 (Image 객체):', slideImage.naturalWidth, 'x', slideImage.naturalHeight);
};
slideImage.onerror = function (e) {
  console.error('❌ 슬라이딩 GIF 로드 실패 (Image 객체):', slideImage.src);
};
const slideChromaKeyRef = { chromaKey: null, isGif: true };
(async function loadSlideImage() {
  const path = slideGifPath;
  console.log('🔄 슬라이딩 GIF 로드 시작:', path);
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

// Stage 1 Clear: 0m 도달 5초 후 텍스트 표시 (MP4 제거, GIF만 사용)

// 히트 시: hurt.png (1·2번째), 체력 0 순간(3번째): down.png. 배경 투명 PNG
const hurtImage = new Image();
hurtImage.crossOrigin = 'anonymous';
let hurtReady = false;
hurtImage.onload = function () {
  hurtReady = true;
  console.log('✅ 히트 PNG 로드 완료:', hurtImage.naturalWidth, 'x', hurtImage.naturalHeight);
};
hurtImage.onerror = function (e) {
  hurtReady = false;
  console.error('❌ 히트 PNG 로드 실패:', hurtImage.src);
};
const hurtChromaKeyRef = { chromaKey: null };
(async function loadHurtImage() {
  const path = 'graphic_resource/character/hurt.png';
  console.log('🔄 히트 PNG 로드 시작:', path);
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
  console.log('✅ 다운 PNG 로드 완료:', downImage.naturalWidth, 'x', downImage.naturalHeight);
};
downImage.onerror = function (e) {
  downReady = false;
  console.error('❌ 다운 PNG 로드 실패:', downImage.src);
};
const downChromaKeyRef = { chromaKey: null };
(async function loadDownImage() {
  const path = 'graphic_resource/character/down.png';
  console.log('🔄 다운 PNG 로드 시작:', path);
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

// 옵션 설정
let options = {
  bgmVolume: 0.7,      // BGM 볼륨 (0.0 ~ 1.0)
  sfxVolume: 0.8,      // 효과음 볼륨 (0.0 ~ 1.0)
  bgmEnabled: true,   // BGM 온/오프
  sfxEnabled: true,    // 효과음 온/오프
  fullscreen: false,   // 전체화면 모드
  graphicsQuality: 'high', // 그래픽 품질: 'low', 'medium', 'high'
  clearDistance: 200   // 클리어 거리 설정 (기본값 200m)
};

// 옵션 로드
function loadOptions() {
  try {
    const saved = localStorage.getItem('jg_options'); // Consistency with config.js
    if (saved) {
      const parsed = JSON.parse(saved);
      options = { ...options, ...parsed };
    }
  } catch (e) {
    console.error('옵션 로드 실패:', e);
  }
  applyOptions();
}

// 옵션 저장
function saveOptions() {
  try {
    localStorage.setItem('jg_options', JSON.stringify(options));
  } catch (e) {
    console.error('옵션 저장 실패:', e);
  }
  applyOptions();
}

// BGM: 타이틀 everybody.mp3, 스테이지 stage1.mp3
const bgmTitle = new Audio('bgm/everybody.mp3');
bgmTitle.loop = true;
const bgmStage = new Audio('bgm/stage1.mp3');
bgmStage.loop = true;
let titleBgmTried = false;

// 효과음
const sfxGunshot = new Audio('effect_sound/gunshot.mp3');
const sfxBombFlying = new Audio('effect_sound/bomb_flying.mp3');
const sfxBombExplosion = new Audio('effect_sound/bomb_explosion.mp3');
const sfxGirlHurt = new Audio('effect_sound/girl_hurt.mp3');
const sfxGirlDown = new Audio('effect_sound/girl_down.mp3');
const sfxGirlHop = new Audio('effect_sound/girl_hop.mp3');
const sfxReload = new Audio('effect_sound/reload.mp3'); // 재장전 소리
function playSfx(a) {
  if (a && options.sfxEnabled) {
    a.currentTime = 0;
    a.play().catch(function () { });
  }
}

// 옵션 적용
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

  // BGM 즉시 반응
  if (!options.bgmEnabled) {
    // BGM이 꺼져있으면 정지
    if (bgmTitle) bgmTitle.pause();
    if (bgmStage) bgmStage.pause();
  } else {
    // BGM이 켜져있으면 현재 상태에 맞는 BGM 재생
    if (state === 'playing' || state === 'stage1clear') {
      // 플레이 중이면 스테이지 BGM
      if (bgmTitle) bgmTitle.pause();
      if (bgmStage) {
        bgmStage.currentTime = 0;
        bgmStage.play().catch(function () { });
      }
    } else {
      // 타이틀/도감/옵션/게임오버 화면이면 타이틀 BGM
      if (bgmStage) bgmStage.pause();
      if (bgmTitle) {
        bgmTitle.currentTime = 0;
        bgmTitle.play().catch(function () { });
      }
    }
  }
}

// 초기 옵션 로드 (오디오 객체 생성 후)
loadOptions();

// FONT_HANGUL moved to config.js
// const FONT_HANGUL = '"Nanum Myeongjo", serif';

let girlOffscreen = null;
let girlOffCtx = null;
let girlChromaOffscreen = null; // 크로마키 처리된 결과를 저장할 별도 캔버스
let girlChromaOffCtx = null;
let scaleOffscreen = null; // hurt 1.35배, down 2배 등 scale 용
let scaleOffCtx = null;
let chromaKey = null; // 영상 사각 배경 투명용 (테두리 샘플)
let deathFallFrames = 0;  // 3번째 히트 후 떨어지는 연출 카운트. 0이 아니면 fall 구간
let deathFallOffsetY = 0; // 떨어질 때 y 가산
let chromaUnavailable = false; // getImageData tainted 등 예외 시 크로마키 건너뜀
let screenShotDirHandle = null; // CapsLock 스크린샷: 첫 CapsLock 시 폴더 선택에서 F:\cursor_project\screen_shot 고르면 해당 경로에 저장 (이 세션 동안 유지)
const CHROMA_DIST = 100; // 유클리드 거리 한계 (과도한 제거·얼굴 손상 방지)
// 그린스크린(라임) 보조: G>R, G>B일 때만 적용해 피부/얼굴은 제거 대상에서 제외
const CHROMA_GREEN = [0, 255, 0]; // 기준 녹색
const CHROMA_DIST_GREEN = 120;    // 녹색빛 피부·그림자 보존
// 라임색 크로마키: #BFFF00 (191, 255, 0), #ADFF2F (173, 255, 47) 등
const CHROMA_LIME = [191, 255, 0]; // 라임색 기준
const CHROMA_DIST_LIME = 100;      // 라임색 거리 임계값

// 주인공: 세라복 소녀, 왼쪽 고정 (크기 2배: 48×90 → 96×180). 피봇: 좌측으로 붙임, 위로 20
// GIRL constants moved to config.js
// const GIRL_X = 2;
// const GIRL_OFFSET_Y = -20; 
// const GIRL_W = 96;
// const GIRL_H = 180;
// const GROUND_Y = 580; 
let girlY = GROUND_Y - GIRL_H;
let vy = 0;
// const GRAVITY = 0.55; // moved to config.js
const JUMP_FORCE = -13.5; // 대점프, 높이 절반 (|vy|/√2)
const AIR_JUMP_VY = JUMP_FORCE / Math.sqrt(3); // 공중 1회 소점프: 원래 높이의 1/3
let airJumpUsed = false;
let runFrame = 0;
let frameCount = 0;
let slideFrames = 0; // 슬라이딩 지속 프레임 카운트
const SLIDE_DURATION = 36; // 슬라이딩 지속 시간 (약 0.6초 @ 60fps)

// 배경 스크롤. 200m: 12초(60fps)·BG_SPEED=4 → scrollOffset 2880일 때 0m
// 배경 스크롤. 200m: 12초(60fps)·BG_SPEED=4 → scrollOffset 2880일 때 0m
// let scrollOffset = 0; // Removed duplicate
let scrollOffset = 0;
const BG_SPEED = 4;
const SCROLL_FOR_200M = 200 * (3 * 60 * 4) / 50; // 2880 (200m)
const PIXELS_PER_METER = 14.4; // 2880 / 200 = 14.4

// 음식 장애물
const FOODS = ['🍎', '🍔', '🍕', '🍟', '🌭'];
const FOOD_W = 40, FOOD_H = 40;

// 각 음식별 판정 박스 (음식 모양에 맞게 조정, 크기를 2/3로 축소)
// 음식별 판정 박스 (2/3 -> 1/2로 축소하여 판정을 더 관대하게 수정)
const FOOD_HITBOXES = {
  '🍎': { x: 10, y: 10, w: 14, h: 14 },   // 사과: 28*1/2 = 14
  '🍔': { x: 8, y: 12, w: 16, h: 12 },    // 햄버거: 32*1/2=16, 24*1/2=12
  '🍕': { x: 10, y: 10, w: 14, h: 14 },   // 피자: 28*1/2 = 14
  '🍟': { x: 9, y: 11, w: 15, h: 13 },    // 감자튀김: 30*1/2=15, 26*1/2=13
  '🌭': { x: 8, y: 13, w: 17, h: 11 }     // 핫도그: 34*1/2=17, 22*1/2=11
};

// 음식의 실제 판정 박스 가져오기
function getFoodHitbox(food) {
  const hitbox = FOOD_HITBOXES[food.emoji] || { x: 12, y: 12, w: 12, h: 12 }; // 기본값 축소
  return {
    x: food.x + hitbox.x,
    y: food.y + hitbox.y,
    w: hitbox.w,
    h: hitbox.h
  };
}

// 음식 도감 데이터
// FOOD_COLLECTION_DATA moved to config.js
// const FOOD_COLLECTION_DATA = { ... };

// 도감 데이터 로드
let collectionData = {};
function loadCollectionData() {
  try {
    const saved = localStorage.getItem('jg_collection');
    if (saved) {
      collectionData = JSON.parse(saved);
    }
  } catch (e) {
    console.error('도감 데이터 로드 실패:', e);
    collectionData = {};
  }
  // 각 음식 초기화 (없으면 생성)
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

// 도감 데이터 저장
function saveCollectionData() {
  try {
    localStorage.setItem('jg_collection', JSON.stringify(collectionData));
  } catch (e) {
    console.error('도감 데이터 저장 실패:', e);
  }
}

// 음식 부수기 시 도감 업데이트
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

// 초기 로드
loadCollectionData();
// 스폰 y 5포인트 (하→상, f.y=음식 상단): [0]발 영역, [1～3]탄환 영역, [4]공중 영역
const FOOD_SPAWN_YS = [500, 430, 360, 290, 220]; // 지면(540)과 캐릭터(360-540) 높이에 맞춰 정밀 조정
let foods = [];
let nextSpawn = 60;
// FOOD_SPEED moved to config.js
// const FOOD_SPEED = 5.5;

// 총알 (마우스 왼쪽 클릭 / 터치): 현광라임 녹색, 눈에 띄게
// BULLET & BOMB constants moved to config.js
// const BULLET_W = 14, BULLET_H = 7;
// const BULLET_SPEED = 14;
const BULLET_FILL = '#39ff14';   // 현광라임 녹색
const BULLET_STROKE = '#000';    // 검은 테두리 (대비)
let bullets = [];

// 폭탄 (마우스 우클릭): 포물선 → 화면 안에서 땅에 떨어져 착지·폭발
// const BOMB_W = 32, BOMB_H = 32;
// const BOMB_VX = 4, BOMB_VY = -10; 
let bombs = [];

// 탄환–음식 히트: 펑 터지면서 별조각 (크고 분명하게)
let explosions = [];
const EXPLOSION_FRAMES = 28;

// 점수 (스크롤 거리)
let score = 0;

// 체력 (최대 3), 히트 시 0.5초 정지
let hp = 3;
let pauseFramesLeft = 0;
const HIT_PAUSE_FRAMES = 30;
let isPaused = false; // P키 일시정지

// Stage 1 Clear: 0m 도달 후 텍스트+폭죽 5초 후 타이틀 복귀 (MP4 제거)
let stage1ClearFrames = 0;
let clearFireworks = []; // 극명히 밝은 폭죽 전용 (drawExplosion 재활용 안 함)

// 반응형
// 반응형
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
  // GIF img 태그 크기도 업데이트
  updateGifPositions();
}
window.addEventListener('resize', resize);
// resize(); // moved to window.onload to ensure canvas is ready

// GIF img 태그 위치 업데이트 함수
function updateGifPositions() {
  if (!girlGifImg || !slideGifImg || !shootGifImg || !bombGifImg) return;

  // Determine visibility flags based on game state
  const shouldShowSlideGif = slideActive;
  const shouldShowShootGif = shootActive;
  const shouldShowBombGif = bombActive;
  // Girl is shown if not doing special actions and alive
  const shouldShowGirlGif = !slideActive && !shootActive && !bombActive && hp > 0 && deathFallFrames === 0 && pauseFramesLeft === 0;

  // Canvas의 실제 화면 크기 (CSS로 스케일된 크기)
  const canvasRect = canvas.getBoundingClientRect();
  const screenWidth = canvasRect.width;
  const screenHeight = canvasRect.height;

  // 게임 내부 좌표(360x640)를 화면 좌표로 변환하는 스케일
  const scaleX = screenWidth / GW;  // 예: 360px / 360 = 1.0
  const scaleY = screenHeight / GH;  // 예: 640px / 640 = 1.0

  // 달리기 GIF 위치 (게임 플레이 중이고 표시해야 할 때)
  if (state === 'playing' && girlReady && shouldShowGirlGif) {
    // 게임 내부 좌표를 화면 좌표로 변환
    // GIRL_X = 2, girlY + GIRL_OFFSET_Y는 게임 내부 좌표
    const gx = GIRL_X * scaleX;
    const gy = (girlY + GIRL_OFFSET_Y) * scaleY;
    const gw = GIRL_W * scaleX;
    const gh = GIRL_H * scaleY;

    // img 태그는 Canvas 컨테이너 기준으로 위치 설정 (position: absolute이므로)
    // Canvas의 왼쪽 위 모서리가 (0, 0)이 되도록
    // Canvas container is relative, images are absolute children.
    // So coordinates are relative to the container (canvas top-left).

    girlGifImg.style.left = gx + 'px';
    girlGifImg.style.top = gy + 'px';
    girlGifImg.style.width = gw + 'px';
    girlGifImg.style.height = gh + 'px';
    girlGifImg.style.display = 'block';
  } else {
    girlGifImg.style.display = 'none';
  }

  // 슬라이딩 GIF 위치 (크기 90%로 조절)
  if (state === 'playing' && slideReady && shouldShowSlideGif) {
    const slideScale = 0.9; // 슬라이딩 GIF 크기 90% (80%에서 10% 증가)
    const slideW = GIRL_W * slideScale;
    const slideH = GIRL_H * slideScale;
    const gx = GIRL_X * scaleX;
    const gy = (girlY + GIRL_OFFSET_Y) * scaleY;
    const gw = slideW * scaleX;
    const gh = slideH * scaleY;
    // 중앙 정렬을 위해 오프셋 추가
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

  // 발사 GIF 위치
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

  // 폭탄 던지기 GIF 위치
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

// 총알 그리기: 🚀 이모지 + 오른쪽 45도 기울기
function drawBullet(b) {
  ctx.save();
  ctx.translate(b.x + b.w / 2, b.y + b.h / 2);
  ctx.rotate(Math.PI / 4); // 45도 기울임
  ctx.font = '24px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🚀', 0, 0);
  ctx.restore();
}

// 폭탄 그리기: 💣 이모지
function drawBomb(b) {
  ctx.font = '28px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('💣', b.x + BOMB_W / 2, b.y + BOMB_H / 2);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}

// 비디오를 gx,gy에 그리기. scale 생략/1이면 96×180, 1.5면 1.5배(중심 정렬). 크로마키 적용.
// drawVideoChroma 함수 삭제 (MP4 비디오 사용 안 함)

// 이미지를 gx,gy에 그리기. GIF 애니메이션은 매 프레임마다 원본 이미지를 직접 그려야 재생됨
function drawImageChroma(img, gx, gy, chromaKeyRef, scale) {
  const nw = img.naturalWidth || 0, nh = img.naturalHeight || 0;
  if (nw <= 0 || nh <= 0) return;
  const sc = (scale == null || scale === 1) ? 1 : scale;
  // 원본 이미지 비율 유지
  const aspectRatio = nw / nh;
  let dw, dh;
  if (sc === 1) {
    dw = GIRL_W;
    dh = GIRL_H;
  } else {
    // 너비 기준으로 계산하고 높이는 원본 비율 유지
    const baseWidth = GIRL_W * sc;
    dw = Math.round(baseWidth);
    dh = Math.round(baseWidth / aspectRatio);
  }

  // GIF 파일인지 확인 (이미지 소스 경로 또는 chromaKeyRef의 isGif 플래그로 확인)
  const imgSrc = img.src || '';
  const isGif = chromaKeyRef.isGif === true ||
    imgSrc.toLowerCase().includes('.gif') ||
    imgSrc.toLowerCase().includes('run.gif') ||
    imgSrc.toLowerCase().includes('sliding.gif') ||
    imgSrc.toLowerCase().includes('anim/');

  // GIF 파일인 경우 모든 처리를 건너뛰고 바로 원본 이미지를 직접 그리기
  // 이것이 GIF 애니메이션을 재생하는 유일한 확실한 방법
  // 오프스크린 캔버스를 거치거나 getImageData를 호출하면 정적 이미지가 되어 애니메이션이 멈춤
  if (isGif) {
    // 매 프레임마다 원본 이미지를 직접 그리면 브라우저가 GIF의 현재 프레임을 자동으로 업데이트함
    ctx.drawImage(img, 0, 0, nw, nh, gx, gy, dw, dh);
    return;
  }

  // GIF가 아닌 경우에만 투명도 체크 및 크로마키 처리
  if (chromaKeyRef.chromaKey === null) {
    // 첫 로드 시 투명도 체크 (한 번만)
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
      // 테두리 샘플링으로 투명도 확인
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

      // 투명한 이미지인 경우 (평균 알파값이 낮음)
      if (avgAlpha < 20) {
        chromaKeyRef.chromaKey = 'transparent';
      } else {
        // 불투명한 배경이 있는 경우 크로마키 처리 필요
        chromaKeyRef.chromaKey = 'opaque';
      }
    } catch (e) {
      // getImageData 실패 시 투명으로 간주
      chromaKeyRef.chromaKey = 'transparent';
    }
  }

  // 투명 PNG는 매 프레임마다 원본 이미지를 직접 그리기
  if (chromaKeyRef.chromaKey === 'transparent') {
    ctx.drawImage(img, 0, 0, nw, nh, gx, gy, dw, dh);
    return;
  }

  // 불투명 배경이 있는 경우 크로마키 처리 (PNG 등)
  // 이 경우는 크로마키 처리가 필요하지만, GIF가 아닐 가능성이 높음
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

    // 크로마키 색상 감지 (첫 프레임에서만)
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

    // 옷 색상 보호용 색상
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

    // 크로마키 처리된 이미지 그리기
    if (sc === 1) {
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

// GIF 표시 상태 (전역 변수로 만들어서 updateGifPositions에서 접근 가능하게)
let shouldShowGirlGif = true;
let shouldShowSlideGif = false;
let shouldShowShootGif = false;
let shouldShowBombGif = false;

// 주인공 그리기: 히트 시 hurt/down, 발사 중 shoot, 아니면 run. 투명 PNG 사용. 미로딩 시 캔버스 폴백
function drawGirl() {
  const gx = GIRL_X, gy = girlY + GIRL_OFFSET_Y;

  // 다른 동작 중일 때는 기본 이미지 숨기기
  let showGif = true;
  shouldShowGirlGif = false;
  shouldShowSlideGif = false;
  shouldShowShootGif = false;
  shouldShowBombGif = false;

  if (pauseFramesLeft > 0) {
    // 히트 시: GIF 숨기고 hurt/down 이미지 표시
    showGif = false;
    shouldShowGirlGif = false;
    if (hp <= 0 && pauseFramesLeft <= 12 && downImage && downImage.naturalWidth > 0) {
      // 달리기 그림과 같은 비율로 축소 후 두 배로 확대 후 10% 축소 (원본 비율 유지)
      const runOriginalWidth = 560;
      const scaleRatio = GIRL_W / runOriginalWidth; // 달리기 그림의 축소 비율
      // 죽는 그림의 원본 크기를 기준으로 같은 비율 적용 후 두 배, 10% 축소
      const scaledWidth = downImage.naturalWidth * scaleRatio * 2 * 0.9;
      const scaledHeight = downImage.naturalHeight * scaleRatio * 2 * 0.9;
      // 달리기 주인공과 같은 위치 (중앙 정렬)
      const dx = gx + GIRL_W / 2 - scaledWidth / 2;
      const dy = gy + GIRL_H / 2 - scaledHeight / 2;
      ctx.drawImage(downImage, 0, 0, downImage.naturalWidth, downImage.naturalHeight, dx, dy, scaledWidth, scaledHeight);
      return;
    }
    if (hurtImage && hurtImage.naturalWidth > 0) {
      // 달리기 주인공과 정확히 같은 위치와 크기
      const hx = gx;
      const hy = gy;
      ctx.drawImage(hurtImage, 0, 0, hurtImage.naturalWidth, hurtImage.naturalHeight, hx, hy, GIRL_W, GIRL_H);
      return;
    }
  }
  if (slideActive) {
    // 슬라이딩 중: img 태그로 GIF 애니메이션 표시 (updateGifPositions에서 처리)
    showGif = false;
    shouldShowGirlGif = false;
    shouldShowSlideGif = true;
    return;
  }
  if (shootActive && shootReady) {
    // 발사 중: img 태그로 GIF 애니메이션 표시 (updateGifPositions에서 처리)
    showGif = false;
    shouldShowGirlGif = false;
    shouldShowShootGif = true;
    return;
  }
  if (bombActive && bombReady) {
    // 폭탄 던지기 중: img 태그로 GIF 애니메이션 표시 (updateGifPositions에서 처리)
    showGif = false;
    shouldShowGirlGif = false;
    shouldShowBombGif = true;
    return;
  }

  // 기본 달리기 상태 또는 점프 중일 때 GIF 표시 (다른 동작이 없을 때)
  // Canvas에서는 GIF 애니메이션이 재생되지 않으므로 img 태그를 사용
  if (showGif) {
    // img 태그로 GIF 애니메이션 표시 (updateGifPositions에서 처리)
    shouldShowGirlGif = true;
    shouldShowSlideGif = false;
    return;
  }
  // 폴백: 캔버스로 그린 세라복 소녀 (2배 스케일)
  ctx.save();
  ctx.translate(GIRL_X, girlY + GIRL_OFFSET_Y);
  ctx.scale(2, 2);
  const x = 0;
  const y = 0;
  runFrame = Math.floor(frameCount / 8) % 2;

  // 머리 (폴백: 48×90 기준, scale 2로 96×180)
  ctx.fillStyle = '#ffdbac';
  ctx.beginPath();
  ctx.arc(x + 24, y + 18, 16, 0, Math.PI * 2);
  ctx.fill();
  // 머리카락 (ellipse 미지원 브라우저: arc로 반원 대체)
  ctx.fillStyle = '#2c1810';
  ctx.beginPath();
  try {
    ctx.ellipse(x + 24, y + 20, 16, 14, 0, 0, Math.PI);
  } catch (e) {
    ctx.arc(x + 24, y + 20, 14, 0, Math.PI);
  }
  ctx.fill();

  // 몸: 세라복 (흰 셔츠 + 네이비 칼라)
  ctx.fillStyle = '#fff';
  ctx.fillRect(x + 6, y + 32, 36, 28);
  ctx.fillStyle = '#1e3a5f';
  ctx.fillRect(x + 10, y + 34, 28, 8);
  ctx.fillStyle = '#fff';
  ctx.fillRect(x + 14, y + 36, 6, 6);
  ctx.fillRect(x + 26, y + 36, 6, 6);

  // 치마 (네이비)
  ctx.fillStyle = '#1e3a5f';
  ctx.beginPath();
  ctx.moveTo(x + 8, y + 58);
  ctx.lineTo(x + 40, y + 58);
  ctx.lineTo(x + 36, y + 78);
  ctx.lineTo(x + 12, y + 78);
  ctx.closePath();
  ctx.fill();

  // 다리 (달리기 프레임)
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

// 음식 그리기: 이모지 + 점멸하는 현광색 테두리 (사각형 제거, 자체 발광 효과)
function drawFood(f) {
  // 피격된 음식은 깜빡임 효과
  let alpha = 1.0;
  if (f.hitFrames && f.hitFrames > 0) {
    // 깜빡임 효과: 빠르게 깜빡이다가 사라짐
    const blinkSpeed = 0.5;
    const progress = f.hitFrames / HIT_PAUSE_FRAMES;
    alpha = Math.sin(progress * Math.PI * 8) * 0.5 + 0.5; // 0.0 ~ 1.0 사이 깜빡임
    if (progress > 0.7) {
      // 마지막 30% 구간에서는 점점 사라짐
      alpha *= (1 - (progress - 0.7) / 0.3);
    }
  }

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = '32px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // 점멸 현광 민트색 (Bright Mint) 테두리 효과
  const blink = 0.4 + 0.6 * Math.sin(frameCount * 0.15); // 천천히 점멸

  // 밝은 민트색 그림자로 테두리 효과, alpha값으로 점멸
  ctx.shadowColor = `rgba(0, 255, 170, ${1.0})`;
  ctx.shadowBlur = 10 * blink + 5; // 블러 크기가 커졌다 작아졌다 함 (5~15)

  ctx.fillText(f.emoji, f.x + FOOD_W / 2, f.y + FOOD_H / 2);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.restore();
}

// 배경 스크롤: cover 비율 유지, 보이는 최하단(도로)이 캐릭터 발밑(GROUND_Y)에 오도록
function drawBackground() {
  if (bgReady && bgImage.naturalWidth) {
    const iw = bgImage.naturalWidth, ih = bgImage.naturalHeight;
    const scale = Math.max(GW / iw, GH / ih);
    const dw = iw * scale, dh = ih * scale;
    const dy = GROUND_Y - dh; // 스케일된 배경 하단 = GROUND_Y(발밑)
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

// 체력 UI: 좌상단 감자튀김 🍟 3개, 하나씩 감소. 상단 UI와 서로 가운데정렬
function drawHp() {
  ctx.font = '24px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  for (let i = 0; i < hp; i++) {
    ctx.fillText('🍟', 12 + i * 26, TOP_UI_Y);
  }
  ctx.textBaseline = 'alphabetic';
}

// 결승까지 거리: 200m→0m. 상단 중앙, 노랑+검은 굵은 테두리, 나눔명조. 한글 1.5배, 상단 UI와 서로 가운데정렬
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

// 탄환/폭탄 히트: 펑 터지면서 별조각. ex.scale 있으면 크게 (폭탄=2)
function drawExplosion(ex) {
  const s = ex.scale || 1;
  const t = ex.frame / ex.maxFrames;
  const aBase = 1 - t;
  const twinkle = 0.55 + 0.45 * Math.sin(ex.frame * 0.8);

  // 0) 펑: 초반 2프레임 강한 흰색 플래시 (터지는 순간)
  if (ex.frame < 2) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.98)';
    ctx.fillRect(ex.x - 8 * s, ex.y - 8 * s, 16 * s, 16 * s);
  }

  // 1) LED 코어: 더 크게 (9x9, 5x5)
  const coreA = aBase * twinkle;
  ctx.fillStyle = 'rgba(255, 255, 255, ' + coreA + ')';
  ctx.fillRect(ex.x - 4 * s, ex.y - 4 * s, 9 * s, 9 * s);
  ctx.fillStyle = 'rgba(255, 200, 220, ' + (coreA * 0.8) + ')';
  ctx.fillRect(ex.x - 2 * s, ex.y - 2 * s, 5 * s, 5 * s);

  // 2) 별조각: 4방향 별 모양 파편, 진홍/녹색, 많이·멀리 뿌리기
  const N = 24;
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

// 스테이지클리어 전용 폭죽: 극명히 밝은 burst (drawExplosion 재활용 안 함)
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

// 음식 폭파·폭탄 터짐: 더 반짝이게 변형한 폭죽 (ex: {x,y,frame,maxFrames,scale,emoji})
function drawSparklyFirework(ex) {
  // 폭발 이모지가 있으면 이모지로 표시
  if (ex.emoji) {
    const t = ex.frame / ex.maxFrames;
    const scale = 1 + (1 - t) * 0.5; // 점점 커지다가 사라짐
    const alpha = 1 - t;
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

// Stage 1 Clear: "Stage 1 Clear" 텍스트(화면 안) + 극명히 밝은 폭죽. 5초 후 타이틀 복귀 (MP4 제거)
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
  // 폰트: 화면 안에 모두 표시 (measureText로 fit)
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
    // 화면 너비에 맞춤 (비율 유지)
    const scale = GW / iw;
    const dh = ih * scale;
    const dy = GH / 2 - dh / 2 - 50; // 중앙보다 약간 위
    ctx.drawImage(stage1ClearImage, 0, 0, iw, ih, 0, dy, GW, dh);
  }

  // 텍스트: "Let's go to next stage!!"
  ctx.font = 'bold 24px "Courier New", monospace';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 3;

  // 깜빡임 효과
  if (Math.floor(Date.now() / 500) % 2 === 0) {
    ctx.strokeText("Let's go to next stage!!", GW / 2, GH - 100);
    ctx.fillText("Let's go to next stage!!", GW / 2, GH - 100);
  }

  ctx.font = '16px "Courier New", monospace';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.strokeText("Press Enter or Click", GW / 2, GH - 60);
  ctx.fillText("Press Enter or Click", GW / 2, GH - 60);

  // 자동 타이틀 복귀 제거 (사용자 입력 대기)
}

// 도감 화면 그리기
// let selectedFoodIndex = 0; // Moved to top
let collectionScrollOffset = 0; // 음식 그리드 스크롤 오프셋
let isDraggingCollection = false; // 드래그 중 여부
let dragStartX = 0; // 드래그 시작 x 좌표
let dragStartScrollOffset = 0; // 드래그 시작 시 스크롤 오프셋
let foodShakeFrame = 0; // 음식 그림 흔들림 프레임 카운트
let foodShakeOffset = 0; // 음식 그림 흔들림 오프셋 (x 좌표)
const FOOD_SHAKE_DURATION = 20; // 흔들림 지속 시간 (프레임)
const FOOD_SHAKE_INTENSITY = 8; // 흔들림 강도 (픽셀)

// 도감 화면 초기화 시 스크롤 리셋
function resetCollectionScroll() {
  collectionScrollOffset = 0;
  selectedFoodIndex = 0;
  foodShakeFrame = 0;
  foodShakeOffset = 0;
}

// 도감 항목 (현재 5개 + 구현 예정 5개)
// COLLECTION_ITEMS moved to config.js
// const COLLECTION_ITEMS = [ ... ];

function drawCollection() {
  ctx.clearRect(0, 0, GW, GH);

  // 배경
  ctx.fillStyle = '#16213e';
  ctx.fillRect(0, 0, GW, GH);

  // 상단 헤더
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 36px ' + FONT_HANGUL;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 4;
  ctx.strokeText('도감', GW / 2, 40);
  ctx.fillText('도감', GW / 2, 40);

  // 뒤로 가기 버튼
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
  ctx.strokeText('←', 50, 40);
  ctx.fillText('←', 50, 40);

  // 음식 그리드 (10개, 스크롤 가능)
  const cardSize = 60;
  const cardSpacing = 15;
  const startX = 30;
  const gridY = 100;
  const gridHeight = cardSize + 20; // 그리드 영역 높이
  const totalWidth = COLLECTION_ITEMS.length * (cardSize + cardSpacing) - cardSpacing;
  const visibleWidth = GW - startX * 2;

  // 스크롤 범위 제한
  const maxScroll = Math.max(0, totalWidth - visibleWidth);
  collectionScrollOffset = Math.max(0, Math.min(maxScroll, collectionScrollOffset));

  // 선택된 항목이 화면에 보이도록 스크롤 조정
  const selectedCardX = selectedFoodIndex * (cardSize + cardSpacing);
  const selectedCardRight = selectedCardX + cardSize;
  const visibleLeft = collectionScrollOffset;
  const visibleRight = collectionScrollOffset + visibleWidth;

  if (selectedCardX < visibleLeft) {
    collectionScrollOffset = selectedCardX;
  } else if (selectedCardRight > visibleRight) {
    collectionScrollOffset = selectedCardRight - visibleWidth;
  }

  // 그리드 영역 클리핑
  ctx.save();
  ctx.beginPath();
  ctx.rect(startX, gridY - 10, visibleWidth, gridHeight);
  ctx.clip();

  COLLECTION_ITEMS.forEach((item, index) => {
    const cardX = startX + index * (cardSize + cardSpacing) - collectionScrollOffset;
    const isSelected = index === selectedFoodIndex;

    // 화면 밖이면 그리지 않음
    if (cardX + cardSize < startX || cardX > startX + visibleWidth) return;

    let isDiscovered = false;
    if (item.type === 'food') {
      const foodData = collectionData[item.emoji];
      isDiscovered = foodData && foodData.discovered;
    } else {
      // 플레이스홀더는 항상 미발견 상태
      isDiscovered = false;
    }

    // 카드 배경
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

    // 카드 테두리
    ctx.strokeStyle = isDiscovered
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

    // 음식 이모지 또는 물음표
    ctx.font = '40px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (item.type === 'food' && isDiscovered) {
      ctx.fillStyle = '#fff';
      ctx.fillText(item.emoji, cardX + cardSize / 2, gridY + cardSize / 2);
    } else {
      // 플레이스홀더 또는 미발견 음식
      ctx.font = 'bold 40px sans-serif';
      ctx.fillStyle = '#999999';
      ctx.fillText('?', cardX + cardSize / 2, gridY + cardSize / 2);
    }
  });

  ctx.restore();

  // 선택된 음식 상세 정보 패널
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

  // 패널 배경
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(20, panelY, GW - 40, panelH);

  if (selectedItem.type === 'food' && isDiscovered && foodInfo) {
    // 음식 이모지 (큰 크기) - 흔들림 효과 적용
    ctx.font = '64px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    ctx.fillText(selectedEmoji, GW / 2 + foodShakeOffset, panelY + 50);

    // 이름
    ctx.font = 'bold 28px ' + FONT_HANGUL;
    ctx.fillText(foodInfo.name, GW / 2, panelY + 120);
    ctx.font = '20px sans-serif';
    ctx.fillStyle = '#cccccc';
    ctx.fillText(foodInfo.nameEn, GW / 2, panelY + 150);

    // 부순 횟수
    ctx.font = 'bold 32px ' + FONT_HANGUL;
    ctx.fillStyle = '#39ff14';
    ctx.fillText('부순 횟수: ' + (foodData.count || 0) + '회', GW / 2, panelY + 200);

    // 처음 발견
    if (foodData.firstFound) {
      const firstDate = new Date(foodData.firstFound);
      const dateStr = firstDate.toLocaleDateString('ko-KR') + ' ' +
        firstDate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
      ctx.font = '18px ' + FONT_HANGUL;
      ctx.fillStyle = '#cccccc';
      ctx.fillText('처음 발견: ' + dateStr, GW / 2, panelY + 240);
    }

    // 마지막 발견
    if (foodData.lastFound) {
      const lastDate = new Date(foodData.lastFound);
      const dateStr = lastDate.toLocaleDateString('ko-KR') + ' ' +
        lastDate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
      ctx.font = '18px ' + FONT_HANGUL;
      ctx.fillStyle = '#cccccc';
      ctx.fillText('마지막 발견: ' + dateStr, GW / 2, panelY + 270);
    }

    // 설명
    ctx.font = '18px ' + FONT_HANGUL;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    const descY = panelY + 310;
    const descLines = wrapText(ctx, foodInfo.description, GW - 80, 18);
    descLines.forEach((line, i) => {
      ctx.fillText(line, 40, descY + i * 25);
    });
  } else if (selectedItem.type === 'food') {
    // 미발견 음식 상태
    ctx.font = 'bold 24px ' + FONT_HANGUL;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#999999';
    ctx.fillText('아직 발견하지 못한 음식입니다.', GW / 2, panelY + panelH / 2);
    ctx.font = '18px ' + FONT_HANGUL;
    ctx.fillText('게임을 플레이하여 음식을 발견하세요!', GW / 2, panelY + panelH / 2 + 40);
  } else {
    // 플레이스홀더 (구현 예정)
    ctx.font = 'bold 24px ' + FONT_HANGUL;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#999999';
    ctx.fillText('구현 예정', GW / 2, panelY + panelH / 2);
    ctx.font = '18px ' + FONT_HANGUL;
    ctx.fillText('곧 추가될 예정입니다!', GW / 2, panelY + panelH / 2 + 40);
  }

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}

// 랭킹 입력 화면 그리기 (80년대 오락실 스타일)
// 랭킹 입력 화면 그리기 (80년대 오락실 스타일)
// UI Functions are now in ui.js
// drawInputRanking, drawOptions, drawRankingBoard, wrapText, drawCollectionButton, drawOptionsButton
function drawReloadUI() {
  if (reloadCooldown <= 0) return; // 재장전 중이 아니면 표시하지 않음

  const reloadX = GIRL_X + GIRL_W / 2; // 캐릭터 중앙
  const reloadY = girlY + GIRL_OFFSET_Y - 15; // 머리 바로 위
  const reloadSize = 20; // 작은 크기

  // 재장전 진행도 (0.0 ~ 1.0)
  const progress = 1 - (reloadCooldown / RELOAD_COOLDOWN_DURATION);

  // 원형 배경
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.beginPath();
  ctx.arc(reloadX, reloadY, reloadSize / 2, 0, Math.PI * 2);
  ctx.fill();

  // 재장전 진행 원호 (시계방향으로 채워짐)
  ctx.strokeStyle = '#39ff14'; // 현광라임 녹색
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  // 시계방향: -90도(위)에서 시작하여 시계방향으로 진행
  ctx.arc(reloadX, reloadY, reloadSize / 2 - 2, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
  ctx.stroke();

  // 중앙 작은 원
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(reloadX, reloadY, 3, 0, Math.PI * 2);
  ctx.fill();
}

// AABB 충돌
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

// 폭탄 던지기 (마우스 우클릭): 포물선, 💣. 터지기 전까지 다음 폭탄 불가
function addBomb() {
  if (state !== 'playing' || pauseFramesLeft > 0 || isPaused || deathFallFrames > 0) return;
  if (bombs.length > 0) return; // 던진 폭탄이 터질 때까지 대기
  if (bombActive) return; // 애니메이션 진행 중이면 대기
  // 슬라이딩 중이면 슬라이딩 취소
  if (slideActive) {
    slideActive = false;
    slideFrames = 0;
    slideFrameCount = 0;
    slideLoopCompleted = false;
  }
  playSfx(sfxBombFlying);
  // 폭탄 던지기 애니메이션 시작 및 즉시 폭탄 생성
  bombActive = true;
  bombFrameCount = 0;
  // 즉시 폭탄 생성 (지연 없음)
  bombs.push({
    x: GIRL_X + GIRL_W,
    y: girlY + GIRL_OFFSET_Y + GIRL_H / 2 - BOMB_H / 2,
    vx: BOMB_VX,
    vy: BOMB_VY,
    w: BOMB_W,
    h: BOMB_H
  });
}

// 총알 발사 (shoot.mp4 연출)
function addBullet() {
  if (state !== 'playing' || pauseFramesLeft > 0 || isPaused || deathFallFrames > 0) return;
  if (shootActive) return; // 이미 발사 연출 중이면 연출만 추가하지 않음
  if (reloadCooldown > 0) return; // 재장전 쿨타임 중이면 발사 불가
  // 슬라이딩 중이면 슬라이딩 취소
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

// 출석보상 버튼 그리기 (서류 모양 아이콘)
function drawAttendanceButton() {
  // 배경 원형 버튼
  ctx.fillStyle = 'rgba(255, 152, 0, 0.8)'; // 주황색
  ctx.beginPath();
  ctx.arc(ATTENDANCE_BTN.x + ATTENDANCE_BTN.w / 2, ATTENDANCE_BTN.y + ATTENDANCE_BTN.h / 2, ATTENDANCE_BTN.w / 2, 0, Math.PI * 2);
  ctx.fill();

  // 테두리
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.stroke();

  // 서류 아이콘
  ctx.font = '32px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fff';
  ctx.fillText('📄', ATTENDANCE_BTN.x + ATTENDANCE_BTN.w / 2, ATTENDANCE_BTN.y + ATTENDANCE_BTN.h / 2);

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
    // 게임 시작 버튼
    ctx.fillStyle = '#5FD9B0'; // 민트녹색
    if (typeof ctx.roundRect === 'function') {
      ctx.beginPath();
      ctx.roundRect(BTN.x, BTN.y, BTN.w, BTN.h, 12);
      ctx.fill();
    } else {
      ctx.fillRect(BTN.x, BTN.y, BTN.w, BTN.h);
    }
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px ' + FONT_HANGUL; // 버튼 크기에 맞춰 폰트 축소 (30 -> 20)
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.strokeText('게임 시작', BTN.x + BTN.w / 2, BTN.y + BTN.h / 2);
    ctx.fillText('게임 시작', BTN.x + BTN.w / 2, BTN.y + BTN.h / 2);
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';

    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';

    // 출석보상 버튼 (아이콘)
    drawAttendanceButton();

    // 도감 버튼 (좌하단)
    drawCollectionButton();
    // 옵션 버튼 (우하단)
    drawOptionsButton();
    return;
  }

  if (state === 'collection') {
    // 음식 그림 흔들림 애니메이션 업데이트
    if (foodShakeFrame > 0) {
      foodShakeFrame--;
      // 좌우 흔들림 효과 (사인파 사용)
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
    drawBackground(); // 배경을 먼저 그려서 검은색 누적 방지
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
    ctx.strokeText('게임 오버', GW / 2, 220);
    ctx.fillText('게임 오버', GW / 2, 220);
    ctx.font = 'bold 24px ' + FONT_HANGUL;
    ctx.strokeText('점수: ' + Math.floor(score), GW / 2, 270);
    ctx.fillStyle = '#39ff14';
    ctx.fillText('점수: ' + Math.floor(score), GW / 2, 270);
    // 다시 하기 버튼
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
    ctx.strokeText('계속하기', GW / 2, RETRY_BTN.y + RETRY_BTN.h / 2);
    ctx.fillText('계속하기', GW / 2, RETRY_BTN.y + RETRY_BTN.h / 2);

    // 타이틀로 돌아가기 버튼
    ctx.fillStyle = '#5FD9B0'; // 민트녹색
    if (typeof ctx.roundRect === 'function') {
      ctx.beginPath();
      ctx.roundRect(TITLE_BTN.x, TITLE_BTN.y, TITLE_BTN.w, TITLE_BTN.h, 12);
      ctx.fill();
    } else {
      ctx.fillRect(TITLE_BTN.x, TITLE_BTN.y, TITLE_BTN.w, TITLE_BTN.h);
    }
    ctx.fillStyle = '#fff';
    ctx.strokeText('타이틀로 돌아가기', GW / 2, TITLE_BTN.y + TITLE_BTN.h / 2);
    ctx.fillText('타이틀로 돌아가기', GW / 2, TITLE_BTN.y + TITLE_BTN.h / 2);
    ctx.textBaseline = 'alphabetic';

    // 도감 버튼 (좌하단)
    drawCollectionButton();
    // 옵션 버튼 (우하단)
    drawOptionsButton();
    return;
  }

  if (state === 'stage1clear') {
    drawStage1Clear();
    return;
  }

  // --- playing ---

  // 3번째 히트 후: down 2배로 부들부들 흔들림 → 위로 살짝 튕김 → 뚝 떨어지는 게임오버 연출
  if (deathFallFrames > 0) {
    ctx.clearRect(0, 0, GW, GH);
    drawBackground();
    drawDistance();
    if (downImage && downImage.naturalWidth > 0) {
      var gx = GIRL_X, gy = girlY + GIRL_OFFSET_Y;
      // 달리기 그림과 같은 비율로 축소 후 두 배로 확대 후 10% 축소 (원본 비율 유지)
      const runOriginalWidth = 560;
      const scaleRatio = GIRL_W / runOriginalWidth; // 달리기 그림의 축소 비율
      // 죽는 그림의 원본 크기를 기준으로 같은 비율 적용 후 두 배, 10% 축소
      const scaledWidth = downImage.naturalWidth * scaleRatio * 2 * 0.9;
      const scaledHeight = downImage.naturalHeight * scaleRatio * 2 * 0.9;
      // 달리기 주인공과 같은 위치 (중앙 정렬)
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

      // 점수 플로어 처리
      const finalScore = Math.floor(score);

      // 게임 끝 -> 무조건 랭킹 입력 화면(게임오버 직후 연출)으로 이동
      // 단, 점수 기록 자체는 기존 로직을 활용하되, 입력은 모든 유저에게 받음(재미 요소)
      // 또는 "신기록 달성 시에만" 입력 받는게 아니라 "게임오버 되면 즉시 이니셜 3글자를 새기는 화면이 나온다"는 요청 처리

      // 여기서는 "신기록 여부와 상관없이" 이니셜 입력 화면을 띄움
      state = 'input_ranking';
      inputName = '';
      newHighScoreIndex = -1; // 아직 랭킹 등록 전
    }
    return;
  }

  // 히트 시 0.5초 정지: 업데이트 없이 그리기만
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
    ctx.strokeText('점수: ' + Math.floor(score), GW - 12, TOP_UI_Y);
    ctx.fillStyle = '#39ff14';
    ctx.fillText('점수: ' + Math.floor(score), GW - 12, TOP_UI_Y);
    ctx.fillStyle = '#fff';
    drawHp();
    ctx.fillStyle = 'rgba(200,0,0,0.2)';
    ctx.fillRect(0, 0, GW, GH);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Hit!', GW / 2, GH / 2);
    ctx.textAlign = 'left';

    // 피격된 음식의 hitFrames 업데이트 및 제거
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

  // P키 일시정지: 업데이트 없이 그리기만, 상단에 Pause
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
    ctx.strokeText('점수: ' + Math.floor(score), GW - 12, TOP_UI_Y);
    ctx.fillStyle = '#39ff14';
    ctx.fillText('점수: ' + Math.floor(score), GW - 12, TOP_UI_Y);
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

  // 슬라이딩 프레임 카운트 업데이트 및 발 끝 공격 판정 처리
  if (slideActive) {
    slideFrames++;
    slideFrameCount++;

    // 슬라이딩 중 발 끝 공격 판정으로 음식 파괴
    // 발 끝 위치: 캐릭터 오른쪽 끝, 발 높이 (GIRL_H 하단)
    const attackBox = {
      x: GIRL_X + GIRL_W - 15,  // 발 끝 위치 (오른쪽 끝에서 15px 안쪽, 왼쪽으로 10px 이동)
      y: girlY + GIRL_OFFSET_Y + GIRL_H - 20,  // 발 높이
      w: 30,  // 공격 판정 너비 (발 끝 영역)
      h: 20   // 공격 판정 높이
    };

    // 발 끝 공격 판정에 맞은 음식 파괴 (나중에 몸통 충돌 체크에서 제외하기 위해 기록)
    const destroyedFoodIndices = [];
    for (let fi = foods.length - 1; fi >= 0; fi--) {
      const food = foods[fi];
      const foodHitbox = getFoodHitbox(food);
      if (collides(attackBox, foodHitbox)) {
        // 도감 업데이트
        updateCollection(food.emoji);
        // 슬라이딩 발 끝에 맞은 음식은 폭발 이모지로 표시
        explosions.push({
          x: food.x + FOOD_W / 2 - 15,  // 왼쪽으로 15px 이동
          y: food.y + FOOD_H / 2,
          frame: 0,
          maxFrames: EXPLOSION_FRAMES,
          emoji: '💥' // 폭발 이모지
        });
        playSfx(sfxBombExplosion);
        destroyedFoodIndices.push(fi);
        foods.splice(fi, 1);
      }
    }

    // 슬라이딩 애니메이션 1초 유지 (60프레임 @ 60fps)
    if (slideFrameCount >= 60) {
      slideActive = false;
      slideFrames = 0;
      slideFrameCount = 0;
      slideLoopCompleted = false;
    }
  }

  // 발사 프레임 카운트 업데이트
  if (shootActive) {
    shootFrameCount++;
    if (shootFrameCount >= SHOOT_DURATION) {
      shootActive = false;
      shootFrameCount = 0;
    }
  }

  // 폭탄 던지기 프레임 카운트 업데이트
  if (bombActive) {
    bombFrameCount++;
    if (bombFrameCount >= BOMB_DURATION) {
      bombActive = false;
      bombFrameCount = 0;
    }
  }

  // 재장전 쿨타임 업데이트
  if (reloadCooldown > 0) {
    const wasReloading = reloadCooldown > 0;
    reloadCooldown--;
    // 재장전 완료 시 소리 재생 (쿨타임이 0이 되는 순간)
    if (wasReloading && reloadCooldown === 0) {
      playSfx(sfxReload);
    }
  }

  // 잔상 방지: 매 프레임 캔버스 전체 클리어 후 재그리기
  ctx.clearRect(0, 0, GW, GH);

  // 배경 스크롤
  scrollOffset += BG_SPEED;
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

  // 중력·점프 (슬라이딩 중에는 중력 적용 안 함)
  if (!slideActive) {
    vy += GRAVITY;
    girlY += vy;
    if (girlY >= GROUND_Y - GIRL_H) {
      girlY = GROUND_Y - GIRL_H;
      vy = 0;
      airJumpUsed = false;
    }
  }

  // 음식 스폰: 오른쪽 끝에서
  nextSpawn--;
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

  // 음식 이동 (왼쪽으로)
  for (let i = foods.length - 1; i >= 0; i--) {
    foods[i].x -= FOOD_SPEED;
    if (foods[i].x + foods[i].w < 0) foods.splice(i, 1);
  }

  // 총알–음식 충돌: 별 폭죽 생성, 맞은 음식·총알 제거 (부서짐)
  for (let bi = bullets.length - 1; bi >= 0; bi--) {
    for (let fi = foods.length - 1; fi >= 0; fi--) {
      const foodHitbox = getFoodHitbox(foods[fi]);
      if (collides(bullets[bi], foodHitbox)) {
        // 도감 업데이트
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

  // 총알 이동 (우측으로) 및 화면 밖 제거
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].x += BULLET_SPEED;
    if (bullets[i].x > GW) bullets.splice(i, 1);
  }

  // 폭탄: 포물선 물리 → 음식 충돌(크게 폭발) / 땅(GROUND_Y) 충돌(크게 폭발) / 화면 밖 제거
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
        // 도감 업데이트
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

  // 폭죽 프레임 진행 및 만료 제거
  for (let i = explosions.length - 1; i >= 0; i--) {
    explosions[i].frame++;
    if (explosions[i].frame >= explosions[i].maxFrames) explosions.splice(i, 1);
  }

  // 그리기: 음식 -> 소녀 -> 총알 -> 폭탄 -> 폭죽
  foods.forEach(drawFood);
  drawGirl();
  drawReloadUI(); // 재장전 UI
  bullets.forEach(drawBullet);
  bombs.forEach(drawBomb);
  explosions.forEach(drawSparklyFirework);

  // 결승까지 거리 (상단 중앙) + 점수(현광녹색+검정테두리) + 체력. 세 요소 서로 가운데정렬
  drawDistance();
  ctx.font = 'bold 24px ' + FONT_HANGUL;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 4;
  ctx.strokeText('점수: ' + Math.floor(score), GW - 12, TOP_UI_Y);
  ctx.fillStyle = '#39ff14';
  ctx.fillText('점수: ' + Math.floor(score), GW - 12, TOP_UI_Y);
  ctx.fillStyle = '#fff';
  drawHp();

  // 출석보상 버튼 (우측 상단 아이콘)
  drawAttendanceButton();
  // 도감 버튼 (좌하단) - 플레이 중에도 접근 가능
  drawCollectionButton();
  // 옵션 버튼 (우하단) - 플레이 중에도 접근 가능
  drawOptionsButton();

  // 주인공–음식 충돌: 음식 제거, 체력 -1, 0.5초 정지. 체력 0이면 정지 후 게임오버
  // 슬라이딩 중에도 몸통은 피격받지만, 발 끝 공격 판정 영역은 제외
  if (slideActive) {
    // 슬라이딩 중: 머리 충돌 박스 + 몸통 충돌 박스 (발 끝 공격 판정 영역 제외)
    const attackBox = {
      x: GIRL_X + GIRL_W - 15,  // 발 끝 위치 (오른쪽 끝에서 15px 안쪽, 왼쪽으로 10px 이동)
      y: girlY + GIRL_OFFSET_Y + GIRL_H - 20,
      w: 30,
      h: 20
    };
    // 머리 충돌 박스 (상단 30%)
    const headBoxH = GIRL_H * 0.3;
    const headBox = { x: GIRL_X, y: girlY + GIRL_OFFSET_Y, w: GIRL_W, h: headBoxH };
    // 몸통 충돌 박스 (중간 50%)
    const girlBoxH = GIRL_H * 0.5;
    const girlBoxY = girlY + GIRL_OFFSET_Y + GIRL_H * 0.5;
    const girlBox = { x: GIRL_X, y: girlBoxY, w: GIRL_W, h: girlBoxH };

    for (let i = 0; i < foods.length; i++) {
      const food = foods[i];
      const foodHitbox = getFoodHitbox(food);
      // 머리 부분 충돌 체크 (발 끝 공격 판정 영역 제외)
      if (collides(headBox, foodHitbox) && !collides(attackBox, foodHitbox)) {
        // 음식을 즉시 제거하지 않고 피격 표시
        foods[i].hitFrames = HIT_PAUSE_FRAMES;
        hp--;
        if (hp <= 0) playSfx(sfxGirlDown); else playSfx(sfxGirlHurt);
        pauseFramesLeft = HIT_PAUSE_FRAMES;
        // 피격 시 애니메이션 캔슬 (중첩 방지)
        shootActive = false;
        bombActive = false;
        slideActive = false;
        break; // for food loops
      }
      // 몸통 충돌 체크 (발 끝 공격 판정 영역 제외)
      if (collides(girlBox, foodHitbox) && !collides(attackBox, foodHitbox)) {
        // 음식을 즉시 제거하지 않고 피격 표시
        foods[i].hitFrames = HIT_PAUSE_FRAMES;
        hp--;
        if (hp <= 0) playSfx(sfxGirlDown); else playSfx(sfxGirlHurt);
        pauseFramesLeft = HIT_PAUSE_FRAMES;
        // 피격 시 애니메이션 캔슬 (중첩 방지)
        shootActive = false;
        bombActive = false;
        slideActive = false;
        break; // for food loops
      }
    }
  } else {
    // 일반 상태: 전체 몸통 충돌 체크 (판정 박스를 너비 60%, 높이 90%로 수정)
    const shrinkW = 0.6; // 너비 60%
    const shrinkH = 0.9; // 높이 90% (머리쪽 판정 확보)
    const w = GIRL_W * shrinkW;
    const h = GIRL_H * shrinkH;
    const offsetX = (GIRL_W - w) / 2;
    const offsetY = (GIRL_H - h) / 2; // 중앙 정렬 (머리와 발 모두 어느 정도 커버됨)

    const girlBox = {
      x: GIRL_X + offsetX,
      y: girlY + GIRL_OFFSET_Y + offsetY,
      w: w,
      h: h
    };

    for (let i = 0; i < foods.length; i++) {
      const foodHitbox = getFoodHitbox(foods[i]);
      if (collides(girlBox, foodHitbox)) {
        // 음식을 즉시 제거하지 않고 피격 표시
        foods[i].hitFrames = HIT_PAUSE_FRAMES;
        hp--;
        if (hp <= 0) playSfx(sfxGirlDown); else playSfx(sfxGirlHurt);
        pauseFramesLeft = HIT_PAUSE_FRAMES;
        // 피격 시 애니메이션 캔슬 (중첩 방지)
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

  // 도감 버튼 클릭 처리 (모든 화면에서 동일)
  if (isInBtn(pos, COLLECTION_BTN)) {
    if (state === 'playing') {
      isPaused = true;
    }
    state = 'collection';
    resetCollectionScroll();
    return;
  }

  // 옵션 버튼 클릭 처리
  if (isInBtn(pos, OPTIONS_BTN)) {
    if (state === 'playing') {
      isPaused = true;
    }
    state = 'options';
    selectedOptionIndex = 0;
    return;
  }

  // 출석보상 버튼 클릭 처리
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
    // 뒤로 가기 버튼
    if (pos.x >= 20 && pos.x <= 80 && pos.y >= 20 && pos.y <= 60) {
      if (isPaused) {
        isPaused = false;
        state = 'playing';
      } else {
        state = 'start';
      }
      return;
    }
    // 옵션 항목 클릭
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

// 도감 화면 드래그 스크롤
document.addEventListener('mousedown', function (e) {
  if (state === 'collection') {
    const pos = getCanvasCoords(e);
    const cardSize = 60;
    const gridY = 100;
    const startX = 30;

    // 그리드 영역 체크
    if (pos.y >= gridY - 10 && pos.y <= gridY + cardSize + 10) {
      isDraggingCollection = true;
      dragStartX = pos.x;
      dragStartScrollOffset = collectionScrollOffset;
      e.preventDefault();
      return;
    }
  }

  if (state !== 'playing') return;
  // 도감/옵션 버튼 클릭 체크 (플레이 중에도 열기 가능)
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
  // 출석보상 버튼 클릭 체크 (아이콘)
  if (isInBtn(pos, ATTENDANCE_BTN)) {
    window.location.href = 'attendance.html';
    e.preventDefault();
    return;
  }
  // 도감/옵션 버튼 클릭 체크 (모든 상태에서)
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

  // 도감 화면 터치 처리
  if (state === 'collection') {
    // 음식 그림 영역 터치 감지 (흔들림 효과)
    const selectedItem = COLLECTION_ITEMS[selectedFoodIndex];
    if (selectedItem && selectedItem.type === 'food') {
      const foodData = collectionData[selectedItem.emoji];
      const isDiscovered = foodData && foodData.discovered;
      if (isDiscovered) {
        const panelY = 200;
        const emojiX = GW / 2;
        const emojiY = panelY + 50;
        const emojiSize = 64; // 대략적인 이모지 크기
        const emojiRadius = emojiSize / 2;
        // 음식 그림 영역 터치 체크 (원형 영역)
        const dx = pos.x - emojiX;
        const dy = pos.y - emojiY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= emojiRadius) {
          // 흔들림 효과 시작
          foodShakeFrame = FOOD_SHAKE_DURATION;
          e.preventDefault();
          return;
        }
      }
    }

    // 도감 화면 터치 드래그 시작
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
        // 플레이 중 일시정지 상태였다면 일시정지 해제
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
  // 도감 화면 키보드 네비게이션
  if (state === 'collection') {
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
        // 플레이 중 일시정지 상태였다면 일시정지 해제
        isPaused = false;
        state = 'playing';
      } else {
        state = 'start';
      }
      return;
    }
    return;
  }

  // 랭킹 입력 화면 키보드 처리
  if (state === 'input_ranking') {
    if (e.code === 'Enter') {
      if (inputName.length === 3) {
        // 랭킹 등록
        const finalScore = Math.floor(score);
        const newEntry = { name: inputName, score: finalScore };

        // 현재 점수 추가, 정렬, 자르기
        highScores.push(newEntry);
        highScores.sort((a, b) => b.score - a.score);
        if (highScores.length > MAX_HIGH_SCORES) highScores.pop();

        // 내 순위 찾기 (하이라이트용)
        newHighScoreIndex = highScores.findIndex(x => x.name === newEntry.name && x.score === newEntry.score);

        localStorage.setItem('jg_highscores', JSON.stringify(highScores));
        state = 'ranking_board';
        return; // 입력 처리 후 바로 리턴하여 불필요한 키 입력 방지
      }
    } else if (e.code === 'Backspace') {
      inputName = inputName.slice(0, -1);
    } else if (e.key.length === 1 && inputName.length < 3) {
      // 영문 대문자만 입력 가능하게 필터링
      const char = e.key.toUpperCase();
      if (/[A-Z]/.test(char)) {
        inputName += char;
      }
    }
    return;
  }

  // 랭킹 보드 화면 키보드 처리
  if (state === 'ranking_board') {
    if (e.code === 'Space' || e.code === 'Enter' || e.code === 'Escape') {
      state = 'gameover';
      newHighScoreIndex = -1;
    }
    return;
  }

  // 1스테이지 클리어 화면 키보드 처리
  if (state === 'stage1clear') {
    if (e.code === 'Enter' || e.code === 'Space' || e.code === 'Escape') {
      state = 'start';
      if (bgmStage) bgmStage.pause();
      if (bgmTitle && options.bgmEnabled) { bgmTitle.currentTime = 0; bgmTitle.play().catch(function () { }); }
    }
    return;
  }

  // 옵션 화면 키보드 네비게이션
  if (state === 'options') {
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
          // 효과음 볼륨 조정 시 총탄 발사 소리로 예시 재생
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
          // 효과음 볼륨 조정 시 총탄 발사 소리로 예시 재생
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

  // 1스테이지 클리어 화면 키보드 처리
  if (state === 'stage1clear') {
    if (e.code === 'Space' || e.code === 'Enter') {
      state = 'start'; // 다음 스테이지 대신 임시로 타이틀로 이동
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
      } catch (err) { /* 폴더 선택 취소·API 미지원 등 → 다운로드 폴백 */ }
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
    // 슬라이딩 중에도 점프 가능 (슬라이딩 취소)
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
    // 점프 중에는 슬라이딩 불가
    if (girlY < GROUND_Y - GIRL_H - 2) return; // 점프 중 (땅에 닿지 않음)
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
