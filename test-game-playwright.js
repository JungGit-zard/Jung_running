/**
 * Playwright를 사용한 게임 테스트 스크립트
 * 
 * 사용법:
 * 1. 로컬 서버가 켜져 있어야 함: npx -y serve . -l 3000
 * 2. 터미널에서: node test-game-playwright.js
 */

const { chromium } = require('playwright');

(async () => {
  console.log('브라우저 시작 중...');
  const browser = await chromium.launch({ 
    headless: false, // 브라우저를 실제로 띄움
    slowMo: 100 // 동작을 천천히 (디버깅용)
  });

  const context = await browser.newContext({
    viewport: { width: 360, height: 640 } // 게임 해상도에 맞춤
  });

  const page = await context.newPage();
  
  console.log('게임 페이지 로드 중: http://localhost:3000');
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 5000 });
  } catch (e) {
    if (e.message.includes('ERR_CONNECTION_REFUSED') || e.message.includes('net::ERR')) {
      console.error('\n❌ 에러: 로컬 서버에 연결할 수 없습니다!');
      console.error('먼저 다른 터미널에서 로컬 서버를 켜주세요:');
      console.error('  cd f:\\cursor_project');
      console.error('  npx.cmd -y serve . -l 3000');
      console.error('\n서버가 "Serving!" 메시지를 보여야 합니다.');
      await browser.close();
      return;
    }
    throw e;
  }

  // 콘솔 에러 확인
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('브라우저 콘솔 에러:', msg.text());
    }
  });

  // 페이지 에러 확인
  page.on('pageerror', error => {
    console.error('페이지 에러:', error.message);
  });

  console.log('게임 화면 대기 중...');
  await page.waitForTimeout(2000); // 2초 대기

  // 캔버스가 로드되었는지 확인
  const canvas = await page.$('#gameCanvas');
  if (!canvas) {
    console.error('❌ 캔버스를 찾을 수 없습니다!');
    await browser.close();
    return;
  }
  console.log('✅ 캔버스 발견됨');

  // 스크린샷 저장
  await page.screenshot({ path: 'test-screenshot.png' });
  console.log('📸 스크린샷 저장: test-screenshot.png');

  // 게임 시작 버튼 클릭 (있는 경우)
  try {
    const startButton = await page.$('canvas');
    if (startButton) {
      console.log('게임 시작 버튼 클릭 시도...');
      await page.click('canvas', { position: { x: 180, y: 520 } }); // 게임 시작 버튼 위치 (BTN: 80,520,200,56)
      await page.waitForTimeout(1000);
    }
  } catch (e) {
    console.log('게임 시작 버튼 클릭 실패 (이미 시작되었거나 다른 위치일 수 있음)');
  }

  // 간단한 게임 플레이 테스트
  console.log('게임 플레이 테스트 시작...');
  
  // Space 키 (점프) 테스트
  await page.keyboard.press('Space');
  await page.waitForTimeout(500);
  console.log('✅ Space 키 (점프) 입력됨');

  // 마우스 클릭 (총알 발사) 테스트
  await page.mouse.click(200, 320);
  await page.waitForTimeout(500);
  console.log('✅ 마우스 클릭 (총알 발사) 입력됨');

  // S 키 (슬라이딩) 테스트
  await page.keyboard.press('KeyS');
  await page.waitForTimeout(1000);
  console.log('✅ S 키 (슬라이딩) 입력됨');

  // 최종 스크린샷
  await page.screenshot({ path: 'test-screenshot-after-play.png' });
  console.log('📸 플레이 후 스크린샷 저장: test-screenshot-after-play.png');

  console.log('\n✅ 테스트 완료! 브라우저는 5초 후 자동으로 닫힙니다.');
  console.log('브라우저를 수동으로 닫으려면 지금 닫으셔도 됩니다.');
  
  await page.waitForTimeout(5000);
  await browser.close();
})();
