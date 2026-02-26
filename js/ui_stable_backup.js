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

// 텍스트 줄바꿈 함수
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

// 옵션 버튼 그리기 (우하단 톱니바퀴 아이콘)
function drawOptionsButton(ctx) {
    if (!ctx) ctx = G.ctx;
    // 배경 원형 버튼
    ctx.fillStyle = 'rgba(155, 89, 182, 0.8)'; // 반투명 보라색
    ctx.beginPath();
    ctx.arc(OPTIONS_BTN.x + OPTIONS_BTN.w / 2, OPTIONS_BTN.y + OPTIONS_BTN.h / 2, OPTIONS_BTN.w / 2, 0, Math.PI * 2);
    ctx.fill();

    // 테두리
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 톱니바퀴 아이콘
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
    // 중앙 원
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

// 도감 버튼 그리기
function drawCollectionButton(ctx) {
    if (!ctx) ctx = G.ctx;
    // 배경 원형 버튼
    ctx.fillStyle = 'rgba(155, 89, 182, 0.8)';
    ctx.beginPath();
    ctx.arc(COLLECTION_BTN.x + COLLECTION_BTN.w / 2, COLLECTION_BTN.y + COLLECTION_BTN.h / 2, COLLECTION_BTN.w / 2, 0, Math.PI * 2);
    ctx.fill();

    // 테두리
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 책 아이콘
    ctx.font = '32px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    ctx.fillText('📖', COLLECTION_BTN.x + COLLECTION_BTN.w / 2, COLLECTION_BTN.y + COLLECTION_BTN.h / 2);

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
    ctx.strokeText('옵션', GW / 2, 40);
    ctx.fillText('옵션', GW / 2, 40);

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
    ctx.strokeText('←', 50, 40);
    ctx.fillText('←', 50, 40);

    // --- Options List ---
    // DO NOT CHANGE LAYOUT - USER REQUEST
    const startY = 100;
    const itemHeight = 60;
    const selectedOptionIndex = G.selectedOptionIndex || 0; // Fallback

    const OPTION_ITEMS_RENDER = [
        { label: 'BGM', type: 'toggle', value: options.bgmEnabled },
        { label: 'BGM 볼륨', type: 'slider', value: options.bgmVolume, min: 0, max: 100, isPercent: true },
        { label: '효과음', type: 'toggle', value: options.sfxEnabled },
        { label: '효과음 볼륨', type: 'slider', value: options.sfxVolume, min: 0, max: 100, isPercent: true },
        { label: '클리어 거리', type: 'slider', value: options.clearDistance, min: 100, max: 1000, suffix: 'm' },
        { label: '그래픽 품질', type: 'select', value: options.graphicsQuality },
        { label: '전체화면', type: 'toggle', value: options.fullscreen }
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
    ctx.fillText('터치/클릭하여 값 변경', GW / 2, GH - 30);
}

function drawRankingInput(ctx) {
    if (!ctx) ctx = G.ctx;
    // 배경 스크롤 (천천히)
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
