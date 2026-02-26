# HTML/웹에서 크로마키(애니메이션)가 안 되는 이유와 해결법

**대상**: Jumping Girl 게임에서 녹색·라임 배경을 투명하게 만드는 **크로마키**가, 브라우저에서 HTML로 실행했을 때 동작하지 않는 경우.

---

## 1. 크로마키가 뭐고, 코드에선 어떻게 쓰나

- **크로마키**: 비디오/이미지의 **특정 색(녹색, 라임 등)을 투명**하게 만들어, 게임 배경 위에 자연스럽게 붙이기
- 이 프로젝트에서는 `js/game.js`의 `drawVideoChroma`, `drawImageChroma`에서:
  1. 오프스크린 캔버스에 비디오/이미지를 `drawImage`로 그림  
  2. **`getImageData()`** 로 픽셀 데이터(RGBA)를 읽음  
  3. 테두리·녹색에 가까운 픽셀의 **alpha를 0**으로 만들어 투명 처리  
  4. `putImageData`로 캔버스에 반영한 뒤, 메인 캔버스에 `drawImage`로 다시 그림  

---

## 2. 웹에서 안 되는 **주요 원인: Tainted Canvas + getImageData 차단**

- **`getImageData()`** 는 **“오염(tainted)된” 캔버스**에서는 **보안상 호출이 막힙니다.**  
  → 이때 `SecurityError`가 나고, `game.js`는 `catch` 안에서 **`chromaUnavailable = true`** 로 두어, **크로마키 없이** 그냥 `drawImage`만 합니다. (녹색/라임 배경이 그대로 보임)

### 캔버스가 “tainted”가 되는 경우

- canvas에 **다른 출처(cross-origin)** 의 이미지/비디오를 `drawImage`로 그린 뒤, 그 canvas에서 `getImageData`를 호출하면 **보안 정책** 때문에 막힙니다.
- **`file://` 로 HTML을 연 경우**:
  - 주소 예: `file:///f:/cursor_project/index.html`  
  - `file://` 오리진은 브라우저마다 **특수하게** 취급되고,  
    같은 `file://` 경로의 비디오/이미지라도 **cross-origin 또는 opaque** 로 간주되어  
    → **canvas가 tainted**  
  - 따라서 `getImageData()` → **SecurityError** → `chromaUnavailable = true` → **크로마키 비활성화**, 녹색 배경이 그대로 보임

### `http://localhost` 로 열었는데도 안 되는 경우

- **에셋 404**  
  - `graphic_resource/character/amin/run.mp4` 등이 없으면 fetch 실패 → 직경로·`crossOrigin` 조합에 따라 tainted 가능  
- **fetch → blob → Object URL** 이 실패해서 **직경로**로만 로드되고, 서버 CORS 설정이 맞지 않으면 tainted  
- **비디오가 아예 재생/로드 불가**  
  - 이때는 크로마키 이전에 **캔버스 폴백(도트)** 만 그려져, “크로마키가 안 된다”기보다 **영상이 안 보이는** 문제에 가까움  

---

## 3. 해결법

### ✅ 1) **로컬 HTTP 서버로 실행 (가장 확실한 방법)**

- **`file://` 를 쓰지 않고**, **HTTP**로 띄워서 **같은 출처**로 리소스를 불러오게 합니다.

**방법**

1. 터미널에서 프로젝트 폴더로 이동:
   ```text
   cd f:\cursor_project
   ```
2. 서버 실행:
   ```text
   npx -y serve . -l 3000
   ```
   (오류 나면 `npx.cmd -y serve . -l 3000`)
3. 브라우저 주소창에:
   ```text
   http://localhost:3000
   ```
4. `index.html` (또는 게임 페이지)로 들어가서 실행

- 이렇게 하면 `game.js`의 **fetch → blob → Object URL** 로드가 동작하고,  
  **tainted 없이** `getImageData` 사용 가능 → **크로마키 정상 동작**.

> 자세한 서버 실행 절차: `how-to-start-local-server.md`, `how-to-open-index-in-browser.md` §7 참고.

---

### ✅ 2) **`file://` (더블클릭으로 index.html 열기) 피하기**

- **파일 탐색기에서 `index.html` 더블클릭** → `file:///.../index.html` 로 열림  
  → 위에서 말한 tainted → **크로마키가 안 됨**.
- **가능하면 `http://localhost:3000` 처럼 HTTP로만** 실행하는 것을 권장.

---

### ✅ 3) **에셋 경로·로드 확인**

- `graphic_resource/character/amin/run.mp4`, `shoot.mp4`, `hurt.png`, `down.png` 등이  
  **프로젝트 안에 있고, HTTP 서버 기준으로 404가 나지 않는지** 확인.
- 404로 fetch 실패 → 직경로·CORS 등으로 tainted 가능성 증가.

---

## 4. 요약

| 원인 | 설명 |
|------|------|
| **`file://` 로 실행** | 오리진·cross-origin 처리로 **canvas tainted** → `getImageData` 차단 → `chromaUnavailable` → 크로마키 비활성화 |
| **에셋 404 / fetch 실패** | blob 로드 실패 → tainted 가능성, 또는 영상 미로드로 폴백만 보임 |

| 해결 | 방법 |
|------|------|
| **로컬 HTTP 서버** | `npx -y serve . -l 3000` 후 **`http://localhost:3000`** 접속 (file:// 사용 금지) |
| **에셋 확인** | `amin/run.mp4`, `shoot.mp4`, `hurt.png`, `down.png` 등 존재·로드 확인 |

---

## 5. APK(Android)에서 폰으로 볼 때 — 크로마키 적용 여부

**결론: APK로 빌드해 폰에서 실행하면, 일반적으로 크로마키가 적용됩니다.**

### 이유

- APK는 **Capacitor**로 만듭니다. `copy-web` → `www/` → `npx cap sync`로 `www`가 `android/app/.../assets/public/`에 들어가고, **WebView가 그 번들을 그대로** 로드합니다.
- HTML, JS, 비디오, 이미지가 **전부 APK 안의 같은 자원**에서 오기 때문에, **cross-origin이 아닙니다.** (같은 `file://`/`capacitor://` 등 같은 출처.)
- **Tainted canvas**는 **다른 출처(cross-origin)** 리소스를 그렸을 때 발생합니다. 폰 안에서 번들만 쓰면 cross-origin이 없어서, `getImageData()`가 막히지 않고 **크로마키 로직이 그대로 동작**합니다.
- `game.js`는 `location.protocol === 'file:'` 일 때 `crossOrigin` 제거 후 상대 경로로 비디오/이미지를 로드합니다. Capacitor APK에서는 이 조건에 맞는 경우가 많고, 모두 같은 asset 기준이므로 **tainted 되지 않습니다.**

### 예외·주의

- **비디오 코덱**: 기기가 `run.mp4` 코덱을 지원하지 않으면 영상이 안 떠서, **캔버스 폴백(도트)** 만 보일 수 있습니다. 이건 크로마키 문제가 아니라 **재생 불가** 때문입니다.
- **매우 오래된 WebView** 또는 **일부 제한 정책**이 있는 기기에서는 이론적으로 `getImageData` 제한이 있을 수 있으나, 일반적인 APK 환경에서는 보기 드뭅니다.

### 요약

| 환경 | 크로마키 |
|------|----------|
| **웹 · file:// (더블클릭)** | ❌ tainted → `getImageData` 막힘 → 적용 안 됨 |
| **웹 · http://localhost (로컬 서버)** | ✅ 같은 출처 → 적용됨 |
| **APK · 폰** | ✅ 번들 전부 같은 출처 → **적용됨** |

---

*작성: chroma-key-web.md*
