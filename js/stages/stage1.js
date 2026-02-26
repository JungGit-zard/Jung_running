// Stage 1 definition (keep stage-specific data isolated here)
(function () {
  window.STAGE_DEFS = window.STAGE_DEFS || [];
  window.STAGE_DEFS.push({
    id: 'stage1',
    order: 1,
    name: 'Stage 1',
    title: 'Stage 1 clear',
    bgImage: 'graphic_resource/background.png',
    clearImage: 'graphic_resource/stage_clear/1stage_clear.png',
    bgm: 'bgm/stage1.mp3',
    clearDistance: 450,
    allowClearDistanceOption: true,
    foods: ['🍎', '🍔', '🍕', '🍟', '🌭'],
    foodSpawnYs: [500, 430, 360, 290, 220],
    spawnMinFrames: 50,
    spawnMaxFrames: 60,
    initialSpawnFrames: 60
  });
})();
