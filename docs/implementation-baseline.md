# Jumping Girl - Food Escape | 구현 기준 (Implementation Baseline)

> **목적**: 여기까지 구현된 내용을 한 번에 정리한 기준 문서. 이후 수정·추가 시 이 스펙을 기준으로 활용.

---

## 1. 개요

- **게임명**: Jumping Girl - Food Escape
- **요약**: 세라복 소녀가 달리며, 오른쪽에서 다가오는 음식을 **스페이스(점프)**로 피하고 **클릭/터치(총알)**로 부수는 게임
- **해상도**: 360×640 (9:16, 내부 로직)
- **파일**: `js/game.js`, `index.html`, `css/style.css`

---

## 2. 게임 상태 (state)

| state     | 설명 |
|----------|------|
| `start`  | 타이틀. "게임 시작" 버튼으로 `playing` 전환 |
| `playing`| 플레이 중. 점프, 총알, 음식·배경 스크롤, 충돌 처리 |
| `gameover` | 게임 오버. "다시 하기" 버튼으로 `playing` 재시작 |

**보조 플래그**
- `pauseFramesLeft` : 히트 시 0.5초(30프레임) 정지. 0이 되고 `hp<=0`이면 `gameover`
- `isPaused` : **P키**로 토글. `playing` 중에만 유효. 일시정지 중 업데이트 없음, 상단에 "Pause" 표시

---

## 3. 입력

| 입력 | 동작 | 비고 |
|------|------|------|
| **Space** | 점프 | `playing` + `!pauseFramesLeft` + `!isPaused` + 착지 시에만 |
| **마우스 왼쪽 / 터치** | 총알 발사 | `playing` + `!pauseFramesLeft` + `!isPaused`. 터치 시 `preventDefault` |
| **P** | 일시정지 토글 | `playing`에서만. 상단 "Pause" 표시 |
| **클릭/터치** | start: 게임 시작 버튼, gameover: 다시 하기 버튼 | `getCanvasCoords`로 캔버스 좌표 보정 |

---

## 4. 상수 (캔버스·UI)

| 이름 | 값 | 설명 |
|------|-----|------|
| `GW` | 360 | 캔버스 너비 |
| `GH` | 640 | 캔버스 높이 |
| `BTN` | (80,292,200,56) | 게임 시작 버튼 |
| `RETRY_BTN` | (80,320,200,56) | 다시 하기 버튼 |

---

## 5. 주인공 (캐릭터)

| 이름 | 값 | 설명 |
|------|-----|------|
| `GIRL_X` | 50 | x 고정 |
| `GIRL_W`, `GIRL_H` | 48, 90 | 크기 |
| `GROUND_Y` | **580** | 발밑 y. 배경 최하단~화면 최하단 빈공간의 **절반(60px)**만큼 아래로 내린 값 |
| `GRAVITY` | 0.55 | 중력 |
| `JUMP_FORCE` | -14 | 점프 초기 vy |

**그리기**
- `graphic_resource/character/cha_01.mp4` 로드·재생 가능 시: 매 프레임 `ctx.drawImage(girlVideo, 0,0, videoWidth,videoHeight, GIRL_X, girlY, GIRL_W, GIRL_H)`. `startPlay`에서 `play()`, 게임오버 시 `pause()`.
- 실패 시: 캔버스 폴백(세라복, `runFrame`으로 다리 애니)

---

## 6. 배경

| 이름 | 값 | 설명 |
|------|-----|------|
| `bgImage` | `graphic_resource/background.png` | 소스 |
| `BG_SPEED` | 4 | 스크롤 속도 (scrollOffset 증분) |
| `scrollOffset` | 0→증가 | 스크롤 오프셋, 점수에 사용 |

**그리기 (`drawBackground`)**
- **cover**: `scale = max(GW/iw, GH/ih)`, `dw=iw*scale`, `dh=ih*scale`
- **세로 정렬**: `dy = GROUND_Y - dh` → 스케일된 배경 **최하단 = GROUND_Y(580)**에 맞춤. 맨 아래 도로가 캐릭터 발밑에 오도록.
- **가로**: `period = max(dw,1)`, `s = scrollOffset % period`로 무한 스크롤 (이미지 2장 이어붙임)
- 미로딩 시: `#16213e` 단색

---

## 7. 음식 장애물

| 이름 | 값 | 설명 |
|------|-----|------|
| `FOODS` | 🍎🍔🍕🍟🌭 | 이모지 풀 |
| `FOOD_W`, `FOOD_H` | 40, 40 | 히트박스·그리기 |
| `FOOD_SPEED` | 5.5 | 왼쪽 이동 속도 |
| 스폰 y | **440 + random*140** | GROUND_Y(580)와 배경·캐릭터 60px 하강에 맞춤 |
| `nextSpawn` | 60→ 50+random(60) | 스폰 간격(프레임) |

스폰: 오른쪽 `x=GW`. 이동 중 `x+w < 0`이면 제거.

---

## 8. 총알

| 이름 | 값 | 설명 |
|------|-----|------|
| `BULLET_W`, `BULLET_H` | 14, 7 | 크기 |
| `BULLET_SPEED` | 14 | 오른쪽 이동 |
| `BULLET_FILL` | `#fffb00` | 밝은 노랑 (시인성) |
| `BULLET_STROKE` | `#ffffff` | 흰 테두리 |

- 생성: 주인공 오른쪽 `GIRL_X+GIRL_W`, y= `girlY + GIRL_H/2 - BULLET_H/2`
- `drawBullet`: `fillRect` + `strokeRect`

---

## 9. 폭발 (탄환–음식 히트)

| 이름 | 값 | 설명 |
|------|-----|------|
| `EXPLOSION_FRAMES` | 28 | 수명(프레임) |

**연출 (`drawExplosion`)**
1. **펑**: 프레임 0–1, 16×16 흰 플래시
2. **LED 코어**: 9×9 백색, 5×5 연분홍, `aBase * twinkle` 알파
3. **별조각**: 24개, 4방향 별 모양, 진홍/녹색 교차, `dist = frame*5 + (i%5)*2.5`, `dotA = aBase * dotTwinkle`

- 탄환–음식 AABB 충돌 시: 해당 음식 중심에 폭발 생성, 음식·탄환 제거

---

## 10. 체력·점수·히트

| 이름 | 값 | 설명 |
|------|-----|------|
| `hp` | 3 | 최대 체력, 히트 시 -1 |
| `HIT_PAUSE_FRAMES` | 30 | 히트 시 정지(≈0.5초) |
| `score` | `scrollOffset` | 스크롤 거리 |

**체력 UI**: 좌상단 🍟 3개, `hp`만큼 표시.

**주인공–음식 충돌**: AABB. 음식 제거, `hp--`, `pauseFramesLeft=30`. `pauseFramesLeft`가 0이 되었을 때 `hp<=0`이면 `gameover`.

**히트 연출**: `pauseFramesLeft>0` 동안 업데이트 중단, 화면에 `rgba(200,0,0,0.2)` 오버레이 + 중앙 "Hit!".

---

## 11. P키 일시정지

- **P**: `playing`일 때 `isPaused = !isPaused`
- **일시정지 중**: 스크롤·중력·스폰·이동·충돌 등 **모든 업데이트 중단**. 그리기만 수행.
- **UI**: 상단 중앙 `"Pause"` (bold 22px, y=36)
- **입력**: 점프·총알 차단 (`pauseFramesLeft`·`isPaused` 체크)

---

## 12. 배경·캐릭터 하단 정렬 (빈공간 보정)

- **의도**: 배경 그래픽 최하단 ~ 화면 최하단(GH=640) 사이 빈 공간이 크므로, 그 **절반**만큼 캐릭터와 배경을 아래로.
- **계산**: 빈공간 = 640 - 520 = 120 → 절반 = **60**
- **적용**:
  - `GROUND_Y`: 520 → **580**
  - `dy = GROUND_Y - dh` (배경 최하단 = 580)
  - 음식 스폰 y: `380+random*140` → **`440+random*140`**

---

## 13. 반응형

- `resize`: 비율 9/16 유지, `canvas.style`으로 width/height 조절. `canvas` 실제 해상도는 HTML/CSS에 따름.

---

## 14. 에셋

| 경로 | 용도 |
|------|------|
| `graphic_resource/background.png` | 배경 (필수) |
| `graphic_resource/character/cha_01.mp4` | 주인공 달리기 영상. muted·loop, 캔버스에 drawImage. 로드/재생 실패 시 캔버스 폴백 |

---

## 15. Instruction 문서 매핑

| docs | 내용 |
|------|------|
| instruction-002 | 게임 설계 기본 |
| instruction-003 | 배경 비율·총알 도입 |
| instruction-004 | 배경 cover·잔상 방지 |
| instruction-005 | 음식 스폰·체력·히트 정지 |
| instruction-006 | 체력 좌측·폭발 |
| instruction-007 | 폭발 LED 스타일 |
| instruction-008 | 폭발 별조각 크기·수 |
| instruction-009 | 배경 오프셋(도로=발밑) |
| instruction-010 | 총알 시인성·girl_run.gif |
| *(이 문서)* | P키 일시정지, 배경/캐릭터 60px 하강, 전체 기준 정리 |

---

## 16. draw() 흐름 요약

1. `start`: 단색+타이틀+게임 시작 버튼
2. `gameover`: 배경+어두운 오버레이+점수+다시 하기 버튼
3. `playing`:
   - `pauseFramesLeft>0` → 히트 연출만, 카운트 감소. 0이 되고 `hp<=0`이면 `gameover`
   - `isPaused` → 현재 화면+상단 "Pause", **return** (업데이트 없음)
   - 그 외: clear → scrollOffset·score → drawBackground → 중력·점프 → 음식 스폰/이동 → 탄환–음식 충돌 → 탄환 이동 → 폭발 업데이트 → 그리기(음식·소녀·탄환·폭발)·점수·체력 → 주인공–음식 충돌

---

*이 기준은 `js/game.js` 구현과 1:1 대응하도록 유지함.*
