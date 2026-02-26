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
