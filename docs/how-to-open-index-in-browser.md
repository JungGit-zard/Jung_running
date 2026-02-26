# 브라우저에서 index.html 여는 방법 (완전 초보자용)

이 글은 **프로그래밍을 처음 하는 분**을 위해, `index.html` 파일을 브라우저(Chrome, Edge, Firefox 등)로 여는 방법을 단계별로 설명합니다.

---

## 1. index.html이 뭔가요?

- **HTML** = 웹 페이지를 만드는 문서 형식
- **index.html** = 이 프로젝트의 **메인 게임 페이지**입니다.
- 이 파일을 브라우저로 열면 **Jumping Girl 게임** 화면이 나타납니다.

---

## 2. 파일이 어디 있나요?

이 프로젝트 폴더 구조는 대략 다음과 같습니다:

```
f:\cursor_project\
├── index.html    ← 이 파일을 브라우저로 엽니다
├── css\
├── js\
└── ...
```

- **경로**: `f:\cursor_project\index.html`
- **f:** = F 드라이브  
- **cursor_project** = 프로젝트 폴더 이름  
- **index.html** = 열 대상 파일

---

## 3. 브라우저란?

- **브라우저** = 웹사이트를 보는 프로그램 (Chrome, Edge, Firefox, Safari 등)
- Windows에서는 보통 **Edge** 또는 **Chrome**이 설치돼 있습니다.

---

## 4. index.html 여는 방법 (3가지)

### 방법 A: 더블클릭으로 열기 (가장 쉬움)

1. **파일 탐색기** 열기  
   - `Win + E` 를 누르거나  
   - 작업 표시줄에서 **폴더 모양 아이콘** 클릭

2. 왼쪽에서 **"내 PC"** 또는 **"이 PC"** 를 클릭한 뒤  
   **F:** 드라이브를 더블클릭

3. **cursor_project** 폴더를 더블클릭해서 들어갑니다.

4. **index.html** 파일을 찾아서 **더블클릭**  
   - 기본 브라우저(Edge, Chrome 등)에서 게임 화면이 열립니다.

> **TIP**: `index.html` 아이콘에 **브라우저 모양**이나 **Chrome/Edge** 로고가 보이면, 그 프로그램으로 열린다는 뜻입니다.

---

### 방법 B: "다른 앱으로 열기"로 브라우저 선택

1. **방법 A**의 1~3단계처럼 `f:\cursor_project\` 폴더까지 들어갑니다.

2. **index.html** 파일을 **오른쪽 클릭** (마우스 우클릭)

3. 메뉴에서 아래 중 하나를 선택:
   - **"연결 프로그램"** → **Chrome** 또는 **Microsoft Edge** 선택  
   - 또는 **"다른 앱으로 열기"** → **Chrome** / **Edge** / **Firefox** 등 선택

4. (선택) **"항상 이 앱을 사용"** 에 체크하면, 앞으로 HTML 파일을 더블클릭할 때 이 브라우저로 열립니다.

---

### 방법 C: Cursor / VS Code에서 열기

1. **Cursor** (또는 **VS Code**)에서 `index.html` 파일을 엽니다.

2. **index.html** 탭이 열린 상태에서:
   - **오른쪽 클릭** → **"Reveal in File Explorer"** (파일 탐색기에서 표시)  
     → 탐색기에서 `index.html`이 보이면, 여기서 **더블클릭** 또는 **연결 프로그램**으로 브라우저 선택

   - 또는 **확장 기능** 사용:  
     - **"Open in Default Browser"** 같은 확장을 설치한 경우,  
       `index.html` 에서 **우클릭** → **"Open in Default Browser"** 선택

3. **단축키**로 여는 방법 (확장에 따라 다름):
   - `Alt + B` 또는 `Ctrl + Shift + P` → **"Open in Browser"** 입력 후 실행

---

## 5. 열렸을 때 보이는 화면

- 화면 중앙에 **캔버스(게임 화면)** 가 보이고  
- **"Canvas OK - Step 1"** 이라는 글이 보이면 **정상**입니다.
- 배경색은 **남색/진보라** 계열입니다.

---

## 6. 자주 하는 실수와 해결

### "파일을 찾을 수 없어요"

- **경로 확인**: `f:\cursor_project\index.html` 인지 확인  
- **드라이브**: F: 드라이브가 있는 PC인지 확인 (다른 PC라면 `f:\` 대신 `D:\`, `C:\` 등 실제 경로 사용)  
- **이름**: `index.html` 인지 (`index.html.txt` 처럼 확장자가 바뀌지 않았는지) 확인

### "한글이 깨져요"

- **인코딩**: `index.html` 이 **UTF-8** 로 저장돼 있어야 합니다.  
  Cursor/VS Code에서는 보통 기본이 UTF-8 이라, **다시 저장** 해보세요.

### "캔버스가 안 보여요" / "Canvas OK 메시지도 없어요"

- **캐시 새로고침**: 브라우저에서 `Ctrl + F5` (강력 새로고침)  
- **경로**: `index.html` 을 **`f:\cursor_project\` 폴더 안에서** 연 것을 확인  
  - `css/style.css`, `js/game.js` 가 같은 프로젝트 폴더 안에 있어야 합니다.

### "이 브라우저는 Canvas를 지원하지 않습니다" 라고 나와요

- **브라우저 업데이트**: Chrome, Edge, Firefox 최신 버전 사용  
- **다른 브라우저**로 열어보기 (Chrome 또는 Edge 권장)

---

## 7. 로컬 HTTP 서버로 열기 (크로마키·getImageData용)

**더블클릭(file://)**으로 열면 일부 브라우저에서 크로마키가 동작하지 않을 수 있습니다.  
**로컬 HTTP**로 띄우면 `getImageData`가 막히지 않고, 녹색 배경 투명 처리(크로마키)가 잘 됩니다.  
(자세한 이유·해결: `chroma-key-web.md` 참고)

**필요한 것**: [Node.js](https://nodejs.org/)가 설치돼 있어야 합니다. (`npx`는 Node 설치 시 함께 들어 있습니다. 터미널에 `npx -v` 입력해 보면 확인할 수 있습니다.)

### 1단계: 터미널에서 프로젝트 폴더로 이동

- **Cursor**에서: 상단 메뉴 **터미널 → 새 터미널** (또는 `` Ctrl+` ``)
- 아래처럼 **프로젝트 루트**가 현재 경로인지 확인:
  ```text
  f:\cursor_project>
  ```
- 다르다면 입력:
  ```text
  cd f:\cursor_project
  ```

### 2단계: serve로 서버 실행

다음 한 줄 입력 후 **Enter**:

```text
npx -y serve . -l 3000
```

- `npx -y` : npm 패키지를 한 번만 쓰고, “설치할까요?” 묻는 걸 `-y`로 자동 yes
- `serve` : 이 폴더를 HTTP로 제공하는 작은 서버
- `.` : 현재 폴더(`f:\cursor_project`)를 웹 루트로
- `-l 3000` : **3000번 포트** 사용

잘 뜨면 예시처럼 나옵니다:

```text
   Serving!  
   - Local:    http://localhost:3000
   - Network:  http://192.168.x.x:3000
```

이 상태로 **터미널을 닫지 말고** 두세요. 닫으면 서버가 꺼집니다.

### 3단계: 브라우저에서 접속

1. 브라우저(Chrome, Edge 등)를 엽니다.
2. 주소창에 입력:
   ```text
   http://localhost:3000
   ```
3. **Enter**  
   → `index.html`이 자동으로 열리거나, **index.html**를 클릭해 들어갑니다.

### 4단계: 서버 끄기

- 터미널에서 **Ctrl + C** 를 누르면 서버가 종료됩니다.

---

## 8. 요약

| 할 일 | 어떻게 |
|-------|--------|
| **가장 쉬운 방법** | 파일 탐색기 → `f:\cursor_project\` → `index.html` **더블클릭** |
| **브라우저를 골라서 열기** | `index.html` **우클릭** → **연결 프로그램** / **다른 앱으로 열기** → Chrome 또는 Edge |
| **Cursor에서** | `index.html` 열고 → **Reveal in File Explorer** 후 더블클릭, 또는 **Open in Browser** 확장 사용 |
| **크로마키용 (HTTP)** | 터미널에서 `npx -y serve . -l 3000` 실행 → 브라우저에서 **http://localhost:3000** 접속 |

---

*작성: how-to-open-index-in-browser.md*
