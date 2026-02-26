# Cursor 내 브라우저로 게임 보기

Cursor 터미널에서 **새 터미널** 연 뒤, 아래 순서로 입력하면 됩니다.

---

## 1. 프로젝트 폴더로 이동

```text
cd f:\cursor_project
```

---

## 2. 로컬 서버 실행

```text
npx -y serve . -l 3000
```

- `Serving!` / `Local: http://localhost:3000` 같은 메시지가 나오면 **이 터미널은 그대로 둔 상태**로 사용
- 이 창을 닫거나 `Ctrl+C`를 누르면 서버가 꺼짐

---

## 3. Cursor 브라우저에서 열기

1. **Ctrl+Shift+P** → `Simple Browser` 입력
2. **"Simple Browser: Show"** 실행
3. 주소창에 **`http://localhost:3000`** 입력 후 Enter  
   - 또는 **`http://localhost:3000/index.html`**

---

## 요약

| 순서 | 입력 |
|------|------|
| 1 | `cd f:\cursor_project` |
| 2 | `npx -y serve . -l 3000` |
| 3 | Ctrl+Shift+P → **Simple Browser: Show** → `http://localhost:3000` |

`npx`를 쓰려면 [Node.js](https://nodejs.org/)가 설치되어 있어야 합니다.

---

*작성: how-to-run-game-in-cursor-browser.md*
