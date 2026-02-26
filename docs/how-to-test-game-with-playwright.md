# Playwright로 게임 테스트하기

Playwright를 사용해서 **별도의 브라우저를 띄우고** 게임을 자동으로 플레이하며 버그를 검사하는 방법입니다.

---

## 1. 필요한 것

- **Node.js** 설치됨
- **로컬 서버가 켜져 있어야 함** (`npx -y serve . -l 3000` 실행 중)

---

## 2. Playwright 설치

터미널에서 프로젝트 폴더(`f:\cursor_project`)에서:

```text
npm install
```

이렇게 하면 `package.json`에 있는 `playwright`가 설치됩니다.

---

## 3. 게임 테스트 실행

### 방법 1: npm 스크립트 사용

```text
npm run test:playwright
```

### 방법 2: 직접 실행

```text
node test-game-playwright.js
```

---

## 4. 테스트 스크립트가 하는 일

1. **Chromium 브라우저를 별도 창으로 띄움** (headless: false)
2. **게임 해상도에 맞춘 창 크기** (360×640)
3. `http://localhost:3000` 접속
4. **콘솔 에러 확인** (빨간 에러 메시지 감지)
5. **캔버스 로드 확인**
6. **스크린샷 저장** (`test-screenshot.png`)
7. **게임 시작 버튼 클릭** (자동)
8. **게임 플레이 테스트**:
   - **Space 키** (점프)
   - **마우스 클릭** (총알 발사)
   - **S 키** (슬라이딩)
9. **플레이 후 스크린샷 저장** (`test-screenshot-after-play.png`)
10. **5초 후 브라우저 자동 종료**

---

## 5. 결과 확인

- **콘솔 출력**: 테스트 진행 상황과 에러 메시지
- **스크린샷 파일**:
  - `test-screenshot.png`: 게임 시작 화면
  - `test-screenshot-after-play.png`: 플레이 후 화면

---

## 6. 문제 해결

### "playwright를 찾을 수 없습니다"

- `npm install` 실행 후 다시 시도

### "http://localhost:3000에 접속할 수 없습니다"

- **로컬 서버가 켜져 있는지 확인**:
  - 다른 터미널에서 `npx -y serve . -l 3000` 실행 중이어야 함
  - `Serving!` 메시지가 보여야 함

### 브라우저가 안 뜸

- Playwright 브라우저 설치:
  ```text
  npx playwright install chromium
  ```

---

## 7. 테스트 스크립트 수정하기

`test-game-playwright.js` 파일을 열어서:
- 대기 시간 조정 (`waitForTimeout` 값)
- 테스트할 키/클릭 추가
- 스크린샷 위치 변경
- 에러 체크 로직 추가

등을 수정할 수 있습니다.

---

*작성: how-to-test-game-with-playwright.md*
