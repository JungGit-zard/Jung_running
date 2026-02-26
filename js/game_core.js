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
      foods: ['?뜋','?뜑','?뜒','?뜜','?뙪'],
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
      foods: ['?뜋','?뜑','?뜒','?뜜','?뙪'],
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
        const list = stage.foods || ['?뜋'];
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
    ctx.strokeText('寃뚯엫 ?쒖옉', BTN.x + BTN.w / 2, BTN.y + BTN.h / 2);
    ctx.fillText('寃뚯엫 ?쒖옉', BTN.x + BTN.w / 2, BTN.y + BTN.h / 2);

    // buttons placeholders
    drawCircleButton(COLLECTION_BTN, '?뱰');
    drawCircleButton(OPTIONS_BTN, '??);
    drawCircleButton(ATTENDANCE_BTN, '?㎨');
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
    ctx.fillText('嫄곕━: ' + remaining + ' m', GW - 10, 30);
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
    ctx.fillText('?대┃?섎㈃ ?ㅼ쓬 ?ㅽ뀒?댁?', GW / 2, GH / 2 + 20);
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
