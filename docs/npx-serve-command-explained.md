# `npx -y serve . -l 3000` 상세 설명

이 문서는 **로컬 서버 실행**에 쓰는 `npx -y serve . -l 3000` 명령이 **어떻게 동작하는지**를 부분별로 설명합니다.

---

## 1. 명령어 전체 구조

```text
npx -y serve . -l 3000
│   │   │    │  │  └── 3000: 포트 번호
│   │   │    │  └── -l: listen(포트 지정) 옵션
│   │   │    └── .: 제공할 폴더 (현재 디렉터리)
│   │   └── serve: 실행할 npm 패키지 이름
│   └── -y: npx 설치 확인 시 "y" 자동 응답
└── npx: npm 패키지 실행 도구
```

---

## 2. `npx` — 패키지 실행

### 역할

- **npx** = Node.js에 포함된 **패키지 실행기**
- "이 패키지를 **설치하지 않고** (또는 캐시에서) **한 번 실행**"할 때 사용

### 동작 순서

1. **`serve`가 로컬/캐시에 있는지** 확인  
   - `node_modules/.bin/serve` 또는 `npm` 캐시
2. **없으면** npm 레지스트리에서 내려받아 **임시로** 실행  
   - 전역 설치(`npm install -g serve`)는 하지 않음
3. **있으면** 그대로 실행

### `-y` (--yes)

- npx가 패키지를 **새로 받을 때** 나오는  
  `"Need to install the following packages: serve. Ok to proceed? [y/N]"`  
  같은 질문에 **자동으로 "y"로 응답**
- `-y` 없으면: 이 프롬프트에서 **직접 Enter 또는 y**를 눌러야 함  
- 터미널/스크립트에서 **끊김 없이** 실행하려면 `-y` 사용

---

## 3. `serve` — 정적 파일 서버

### 역할

- **Vercel**에서 만든 **정적 파일 서버** 패키지
- 지정한 폴더를 **HTTP**로 제공 (웹 서버처럼)

### 이 프로젝트와의 관계

- `package.json`에 **`serve`가 없음** → 매번 **npx로만** 실행
- npx가 필요할 때만 **최신 `serve`** 를 받아서 실행

### 기본 동작

1. **HTTP 서버**를 띄움
2. **폴더 안의 파일**을 URL 경로에 따라 그대로 전달  
   - `index.html` → `/` 또는 `/index.html`  
   - `css/style.css` → `/css/style.css`  
   - `js/game.js` → `/js/game.js`  
   - `graphic_resource/...` → `/graphic_resource/...`
3. **디렉터리 목록**  
   - `/`만 주고 `index.html`이 없으면, 해당 폴더의 파일/폴더 목록을 HTML로 보여 줌

---

## 4. `.` (점) — 제공할 폴더

### 의미

- **`.`** = **현재 작업 디렉터리(current directory)**
- `serve`에게 "**이 폴더**를 웹 루트로 제공해라"라고 지정

### 실제로 무엇이 제공되는가

- 명령을 **`f:\cursor_project`** 에서 실행했다면  
  **`f:\cursor_project`** 가 **웹 사이트의 `/`** 가 됨  
  - `f:\cursor_project\index.html` → `http://localhost:3000/` 또는 `http://localhost:3000/index.html`  
  - `f:\cursor_project\css\style.css` → `http://localhost:3000/css/style.css`  
  - `f:\cursor_project\js\game.js` → `http://localhost:3000/js/game.js`  
  - `graphic_resource`, `bgm`, `effect_sound` 등도 같은 규칙

### 주의

- **다른 폴더**에서 실행하면 **그 폴더**가 루트가 됨  
  - 예: `cd f:\cursor_project\css` 후 `npx -y serve . -l 3000`  
  → `http://localhost:3000/` 는 `css` 폴더 내용 → 게임 루트가 아니라 깨짐  
- **반드시 프로젝트 루트** `f:\cursor_project` 에서 실행할 것

---

## 5. `-l 3000` — 포트(Listen)

### 의미

- **`-l`** = **listen** (어떤 포트에서 대기할지)
- **`3000`** = **포트 번호**

### 동작

- 서버가 **`3000`번 포트**에서 **TCP**로 대기
- 주소는 보통  
  - **`http://localhost:3000`**  
  - **`http://127.0.0.1:3000`**  
  (같은 PC 기준)

### `localhost`와 `127.0.0.1`

- **localhost** = 이 PC를 가리키는 이름  
- **127.0.0.1** = 이 PC를 가리키는 IP  
- 같은 머신에서만 접속 가능 (로컬 개발용)

### 포트를 바꾸고 싶을 때

- `-l 3000` 대신  
  - `-l 8080`  
  - `-l 5000`  
  등으로 바꾸면, 접속 주소는  
  - `http://localhost:8080`  
  - `http://localhost:5000`  
  처럼 바뀜

---

## 6. 실행 시 터미널에서 일어나는 일 (순서)

### 1) 입력

```text
cd f:\cursor_project
npx -y serve . -l 3000
```

### 2) npx

- `serve`가 캐시/로컬에 없으면  
  - npm에서 `serve` (및 의존성) 다운로드  
  - `-y` 때문에 "Ok to proceed?"에 자동 yes
- 있으면 이 단계 생략

### 3) serve

- **현재 디렉터리(`.`)** = `f:\cursor_project` 를 문서 루트로 사용
- **3000번 포트**에 HTTP 서버 생성·바인드
- "요청 들어오면 이 폴더에서 파일 찾아서 보내라" 설정

### 4) 출력 예시

```text
   Serving!

   - Local:            http://localhost:3000
   - On Your Network:  http://192.168.0.10:3000
```

- **Local**  
  - 이 PC의 브라우저에서 `http://localhost:3000` 으로 접속
- **On Your Network**  
  - 같은 Wi‑Fi/LAN의 다른 기기에서 `http://192.168.0.10:3000` (실제 IP는 기기마다 다름)으로 접속 가능

### 5) 대기

- 이 시점부터 **프로세스가 계속 실행**  
  - Enter를 눌러도 종료되지 않음  
  - **Ctrl+C** 를 누르기 전까지 서버 유지  
- 브라우저에서  
  - `http://localhost:3000`  
  - `http://localhost:3000/index.html`  
  요청이 들어올 때마다:
  1. `serve`가 요청 경로(`/`, `/index.html`, `/css/style.css` 등) 해석
  2. `f:\cursor_project` 아래에서 해당 파일/폴더 검색
  3. 찾으면 **HTTP 응답** (HTML, CSS, JS, 이미지, 소리 등) 전송  
  4. 터미널에 **접속 로그** 한 줄 출력 (설정/버전에 따라 다름)

### 6) 종료

- 터미널에서 **Ctrl+C**
- `serve` 프로세스 종료 → 3000번 포트 해제 → `http://localhost:3000` 접속 불가

---

## 7. `file://` 와의 차이 (왜 serve를 쓰는가)

### `file://` (파일 경로로 여는 경우)

- 주소 예: `file:///f:/cursor_project/index.html`
- 브라우저가 **로컬 파일**을 직접 읽음  
  - **다른 오리진(origin)** 로 간주  
  - `file://` ↔ `http://` 차이, 경로 제한 등으로  
    - `getImageData`, 크로마키, 일부 API가 제한되거나 **CORS** 에러가 날 수 있음

### `http://localhost:3000` (serve 사용 시)

- **HTTP 프로토콜**로, **로컬 웹 서버**를 통해 제공
- 브라우저 입장에선 "일반 웹페이지"와 비슷  
  - 상대 경로(`/css/style.css`, `./js/game.js` 등)가 일관되게 동작  
  - `getImageData`, fetch, 오디오 등 **제한이 덜함**  
  - 게임처럼 리소스가 많은 경우에도 **동작이 안정적**

그래서 이 프로젝트에서는 **`npx -y serve . -l 3000`** 으로 띄운 뒤  
**`http://localhost:3000`** 로 여는 방식을 권장합니다.

---

## 8. 사전 조건

- **Node.js** 설치 (v14 이상 권장)  
  - [nodejs.org](https://nodejs.org/) 에서 LTS 설치
- **npm** (Node 설치 시 함께 설치됨)  
  - `npx`는 npm과 함께 들어 있음
- 터미널 **현재 디렉터리**가 `f:\cursor_project`  
  - `cd f:\cursor_project` 먼저 실행

---

## 9. 문제 해결

### "npx를 찾을 수 없습니다"

- Node.js가 PATH에 있는지 확인  
  - `node -v`, `npm -v` 가 동작하면 `npx`도 보통 사용 가능  
  - `npx -v` 로 확인

### "Port 3000 is already in use"

- 3000번 포트를 **다른 프로그램**이 이미 사용 중  
- **방법 1**: 그 프로그램 종료  
- **방법 2**: 다른 포트 사용  
  - `npx -y serve . -l 3001`  
  - 접속: `http://localhost:3001`

### "Serving!"은 뜨는데 브라우저에서 안 뜸

- 주소: `http://localhost:3000` (오타, `https` 아닌 `http`)  
- 방화벽이 **localhost/127.0.0.1** 을 막고 있지는 않은지 확인  
- `http://127.0.0.1:3000` 으로도 시도

### 터미널을 닫았더니 접속이 안 됨

- 터미널을 닫으면 **그 안에서 돌던 `serve` 프로세스도 종료**  
- 다시 `cd f:\cursor_project` 후 `npx -y serve . -l 3000` 실행

---

## 10. 요약

| 구성 | 의미 | 이 명령에서의 값 |
|------|------|------------------|
| **npx** | npm 패키지를 (캐시/임시)로 실행 | `serve` 실행 |
| **-y** | "패키지 설치해도 될까?"에 자동 yes | 설치 확인 없이 진행 |
| **serve** | Vercel 정적 파일 서버 패키지 | HTTP로 폴더 제공 |
| **.** | 서버 루트가 될 폴더 | 현재 디렉터리 = `f:\cursor_project` |
| **-l 3000** | listen 포트 | 3000 → `http://localhost:3000` |

**한 줄 요약:**  
`f:\cursor_project` 폴더를 **3000번 포트**에서 **HTTP**로 열어 두고,  
브라우저에서 **`http://localhost:3000`** 으로 접속해 게임을 연다.

---

*작성: npx-serve-command-explained.md*
