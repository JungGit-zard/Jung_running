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
    ctx.font = '32px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    ctx.fillText('⚙️', OPTIONS_BTN.x + OPTIONS_BTN.w / 2, OPTIONS_BTN.y + OPTIONS_BTN.h / 2);

    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
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
    const G = window.GameState;
    if (!ctx) ctx = G.ctx;
    const options = G.options;
    const GW = ctx.canvas.width;
    const GH = ctx.canvas.height;

    // 1. 배경 어둡게 (블러 느낌의 깊은 어둠)
    ctx.fillStyle = 'rgba(10, 10, 10, 0.98)';
    ctx.fillRect(0, 0, GW, GH);

    // 2. 제목
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px ' + FONT_HANGUL;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('OPTIONS', GW / 2, 55);

    // 3. 뒤로 가기 버튼 (상단 좌측)
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
    ctx.fillText('←', 50, 45);

    // 4. 옵션 리스트 정의 (간격 조정: startY=110, itemHeight=60)
    const listStartY = 110;
    const listHeight = 60;
    const items = G.OPTION_ITEMS;

    if (!items) return;

    items.forEach((item, index) => {
        const itemY = listStartY + index * listHeight;
        const isSelected = (G.selectedOptionIndex === index);

        // 선택 강조 (배경 글로우)
        if (isSelected) {
            const gradient = ctx.createLinearGradient(0, itemY - 25, GW, itemY + 25);
            gradient.addColorStop(0, 'rgba(57, 255, 20, 0.05)');
            gradient.addColorStop(0.5, 'rgba(57, 255, 20, 0.15)');
            gradient.addColorStop(1, 'rgba(57, 255, 20, 0.05)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, itemY - 28, GW, 56);

            // 왼쪽 인디케이터 바
            ctx.fillStyle = '#39ff14';
            ctx.fillRect(0, itemY - 25, 4, 50);
        }

        // 라벨 (좌측)
        ctx.textAlign = 'left';
        ctx.fillStyle = isSelected ? '#39ff14' : '#ffffff';
        ctx.font = isSelected ? 'bold 20px ' + FONT_HANGUL : '18px ' + FONT_HANGUL;
        ctx.fillText(item.label, 25, itemY);

        // 컨트롤 (우측)
        ctx.textAlign = 'right';
        const controlX = GW - 25;

        if (item.type === 'toggle') {
            const isOn = options[item.key];
            // 토글 배경
            ctx.fillStyle = isOn ? '#39ff14' : '#333';
            if (typeof ctx.roundRect === 'function') {
                ctx.beginPath();
                ctx.roundRect(controlX - 55, itemY - 12, 55, 24, 12);
                ctx.fill();
            } else {
                ctx.fillRect(controlX - 55, itemY - 12, 55, 24);
            }
            // 토글 텍스트
            ctx.fillStyle = isOn ? '#000' : '#fff';
            ctx.font = 'bold 12px sans-serif';
            ctx.fillText(isOn ? 'ON' : 'OFF', controlX - 27.5, itemY);
        } else if (item.type === 'slider') {
            let val = options[item.key];
            if (item.isPercent && val <= 1) val = Math.round(val * 100);
            const valTxt = val + (item.suffix || (item.isPercent ? '%' : ''));

            // 슬라이더 텍스트
            ctx.fillStyle = isSelected ? '#39ff14' : '#fff';
            ctx.font = '16px ' + FONT_HANGUL;
            ctx.fillText(valTxt, controlX, itemY - 8);

            // 게이지 바
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

    // 5. 설정 초기화 버튼 (위치 조정)
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
    ctx.fillText('설정 초기화', GW / 2, resetBtnY + 22.5);

    // 6. 하단 안내
    ctx.textAlign = 'center';
    ctx.fillStyle = '#777777';
    ctx.font = '13px ' + FONT_HANGUL;
    ctx.fillText('항목을 터치하여 설정을 변경하세요', GW / 2, GH - 35);
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
