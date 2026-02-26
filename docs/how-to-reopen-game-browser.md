# 게임 브라우저 다시 열기 (Cursor 내/외부)

Cursor 안에서 게임을 보던 브라우저가 사라지거나 꺼졌을 때, 다시 띄우는 방법입니다.

---

## 1. Cursor **Simple Browser**(내장 브라우저)로 다시 열기

1. **Ctrl+Shift+P** 로 명령 팔레트를 연다.
2. `Simple Browser` 또는 `간단한 브라우저` 를 입력한다.
3. **"Simple Browser: Show"** 를 실행한다.
4. URL 입력창에 다음 중 하나를 넣고 Enter:
   - **로컬 서버 사용 중**: `http://localhost:3000`
   - **file:// 로 열기**: `file:///f:/cursor_project/index.html`

---

## 2. **외부 Chrome**으로 다시 열기

### A) 로컬 서버를 이미 켜둔 경우 (`npx -y serve . -l 3000` 실행 중)

- Chrome 주소창에 `http://localhost:3000` 입력 후 접속
- 또는 Cursor 터미널에서:
  ```powershell
  Start-Process "http://localhost:3000"
  ```
  (기본 브라우저로 열림. Chrome이 기본이면 Chrome에서 열림)

### B) 로컬 서버 없이 `file://` 로 열기

- Cursor 터미널에서:
  ```powershell
  Invoke-Item "f:\cursor_project\index.html"
  ```
- 또는 **파일 탐색기**에서 `f:\cursor_project\index.html` **더블클릭**

---

## 3. 로컬 서버까지 꺼졌다면

1. 터미널에서:
   ```powershell
   cd f:\cursor_project
   npx -y serve . -l 3000
   ```
2. 서버가 뜨면 **Simple Browser** 또는 Chrome에서 `http://localhost:3000` 접속.

---

## 요약

| 상황 | 어떻게 다시 열기 |
|------|------------------|
| **Simple Browser가 안 보일 때** | **Ctrl+Shift+P** → `Simple Browser: Show` → URL `http://localhost:3000` 입력 |
| **로컬 서버는 켜져 있고**, Chrome만 닫았을 때 | Chrome에서 `http://localhost:3000` 접속 |
| **로컬 서버까지 꺼졌을 때** | 터미널에서 `npx -y serve . -l 3000` 다시 실행 후 `http://localhost:3000` 접속 |

---

*작성: how-to-reopen-game-browser.md*
