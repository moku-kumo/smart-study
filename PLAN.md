# SmartStudy — 작업 계획서

> 6세 어린이를 위한 종합 학습 PWA  
> 모토: **놀면서 학습할 수 있는 앱**  
> 전신: [SmartGame (smart-plus)](../SmartGame) — 더하기 단일 게임

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|---|---|
| 이름 | SmartStudy |
| 대상 | 6세 어린이 (미취학~초1) |
| 과목 | 수학 · 영어 · 국어 |
| 형태 | PWA (모바일 설치, 오프라인 지원) |
| 배포 | GitHub Pages (GitHub Actions 자동 빌드) |
| 저장소 | GitHub `SmartStudy` (신규) |

---

## 2. 기술 스택

| 레이어 | 선택 | 이유 |
|---|---|---|
| 빌드 | **Vite** | 빠른 HMR, 가벼운 설정 |
| 언어 | **TypeScript** | 모드/문제 데이터 타입 안전 |
| 프레임워크 | **React 18** | 컴포넌트 재사용 (모드/카드/버튼) |
| 라우팅 | **React Router** | 과목 → 모드 → 게임 화면 |
| 스타일 | **Tailwind CSS** | 빠른 시안, 6세용 큰 UI 일관성 |
| UI 컴포넌트 | **shadcn/ui** | 모달/버튼/시트 등 세련된 기본기 |
| 애니메이션 | **Framer Motion** | 정답 시 즐거운 피드백 |
| 아이콘 | **lucide-react** + 이모지 | 가벼움 |
| 상태 | **Zustand** (로컬 진도/설정) | Redux보다 단순 |
| 음성 | **Web Speech API (SpeechSynthesis)** | 외부 의존 X |
| 효과음 | **WebAudio API** | 기존 코드 이식 |
| 저장소 | **localStorage** | 6세 대상이라 계정 X |
| PWA | **vite-plugin-pwa** | manifest/SW 자동 생성 |

---

## 3. 디렉토리 구조 (예정)

```
SmartStudy/
├── public/
│   ├── icons/                 # PWA 아이콘
│   └── images/                # 영어 단어 그림 (SVG/PNG)
├── src/
│   ├── main.tsx
│   ├── App.tsx                # 라우터
│   ├── routes/
│   │   ├── Home.tsx           # 과목 선택 홈
│   │   ├── math/
│   │   │   ├── MathHome.tsx
│   │   │   ├── Addition.tsx
│   │   │   ├── Pattern.tsx
│   │   │   └── StepPattern.tsx
│   │   ├── english/
│   │   │   ├── EnglishHome.tsx
│   │   │   ├── Alphabet.tsx
│   │   │   ├── PictureWord.tsx
│   │   │   └── ListenWord.tsx
│   │   └── korean/
│   │       ├── KoreanHome.tsx
│   │       ├── Jamo.tsx       # 자음/모음
│   │       └── ReadWord.tsx   # 받침없는 단어
│   ├── components/
│   │   ├── ui/                # shadcn/ui
│   │   ├── game/
│   │   │   ├── GameLayout.tsx
│   │   │   ├── TimerBar.tsx
│   │   │   ├── ScoreBoard.tsx
│   │   │   ├── OptionGrid.tsx
│   │   │   └── Feedback.tsx
│   │   └── SubjectCard.tsx
│   ├── hooks/
│   │   ├── useTimer.ts
│   │   ├── useScore.ts
│   │   └── useSpeech.ts
│   ├── lib/
│   │   ├── audio.ts           # WebAudio 효과음
│   │   ├── storage.ts         # localStorage 래퍼
│   │   └── random.ts          # 문제 생성 유틸
│   ├── data/
│   │   ├── alphabet.ts
│   │   ├── englishWords.ts
│   │   ├── koreanJamo.ts
│   │   └── koreanWords.ts
│   ├── stores/
│   │   ├── settingsStore.ts
│   │   └── progressStore.ts
│   └── styles/
│       └── globals.css
├── index.html
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 4. 화면 흐름

```
[홈: 과목 선택]
  ├─ 🔢 수학  → [수학 홈] → ➕ 더하기 / ⬜ 빈칸 / 🧩 패턴
  ├─ 🔤 영어  → [영어 홈] → 🅰️ 알파벳 / 🖼️ 그림단어 / 🔊 듣기
  └─ 한글    → [국어 홈] → ㄱㅏ 자모 / 📖 받침없는 단어
                                      └─ ⚙️ 설정 (난이도/소리/타이머 끄기)
```

---

## 5. 학습 모드 상세

### 수학 (기존 이식)
1. **➕ 더하기** — 1자리 덧셈, 6지선다 (난이도 3단계)
2. **⬜ 빈칸채우기** — 연속 수열 빈칸
3. **🧩 패턴채우기** — 등차수열 (5단위 / 임의)

### 영어 (신규)
4. **🅰️ 알파벳 맞히기** — 대문자↔소문자 매칭
5. **🖼️ 그림 보고 단어 고르기** — 4지선다 (apple/cat 등 50단어)
6. **🔊 단어 듣고 고르기** — TTS로 듣고 보기 선택

### 국어 (신규)
7. **ㄱㅏ 자음/모음** — 자모 인식 + 음가 듣기
8. **📖 받침없는 단어 읽기** — 그림+글자 매칭 (가지/나비/모자 등)

---

## 6. 디자인 원칙 (6세 UX)

- **큰 글씨/버튼**: 최소 터치 영역 64×64px
- **밝고 따뜻한 색**: 파스텔 그라디언트 (기존 톤 유지)
- **즉각적 피드백**: 정답 시 색·소리·애니메이션 동시
- **글 의존도 ↓**: 이모지/아이콘 우선, 메뉴 텍스트 최소화
- **좌절감 ↓**: 오답도 격려 톤 ("괜찮아요, 다시!")
- **자동 진행**: 정답 1초 후 다음 문제 (기존 동작 유지)
- **선택적 음성 안내**: 모든 화면 TTS 읽어주기 토글

---

## 7. PWA / 배포

- `vite-plugin-pwa` (autoUpdate, workbox precache)
- 아이콘: 192/512/maskable, Apple touch
- `manifest.webmanifest`: ko, standalone, theme #ff6347
- 오프라인: 정적 자산 + 단어 데이터 모두 캐시
- GitHub Pages 자동 배포 (GitHub Actions, main → production)

---

## 8. 단계별 작업 순서

### Phase 0 — 환경 셋업
- [ ] Node.js LTS 설치 (winget)
- [ ] `npm create vite@latest SmartStudy -- --template react-ts`
- [ ] Tailwind / shadcn-ui / Router / Zustand / Framer Motion / vite-plugin-pwa 설치
- [ ] GitHub 신규 레포 생성 + 연결
- [ ] GitHub Actions 워크플로우 설정 → GitHub Pages 첫 배포 확인

### Phase 1 — 골격 (1차 PR)
- [ ] 레이아웃, 과목 선택 홈
- [ ] 라우팅 + 공통 컴포넌트 (GameLayout/Timer/Score/OptionGrid/Feedback)
- [ ] WebAudio 효과음, useTimer, useScore 훅
- [ ] 설정 모달 (글로벌)

### Phase 2 — 수학 이식
- [ ] 더하기, 빈칸, 패턴 3종 React로 포팅
- [ ] 기존 localStorage 키 마이그레이션 X (새 스키마)

### Phase 3 — 영어
- [ ] 알파벳 데이터 + 모드
- [ ] 그림단어 (이모지/SVG) 50개
- [ ] TTS 듣기 모드

### Phase 4 — 국어
- [ ] 자모 데이터 + 모드 (음가 TTS)
- [ ] 받침없는 단어 30개 + 그림

### Phase 5 — 마감
- [ ] PWA 아이콘/스플래시
- [ ] 진도 저장(별 스티커 보상)
- [ ] 접근성 (aria-label, 키보드 포커스)
- [ ] README + 스크린샷

---

## 9. 향후 확장 (백로그)

- 부모 모드: 학습 통계 대시보드
- 일일 미션 / 연속 학습 보상
- 다크모드
- 뺄셈/곱셈 / 영어 파닉스 / 한글 받침 단어
- 진도 클라우드 동기화 (계정 도입 시, 외부 BaaS 활용)

---

## 10. 즉시 다음 액션

1. **Node.js 설치** (`winget install OpenJS.NodeJS.LTS`)
2. Vite 프로젝트 스캐폴딩
3. 의존성 설치 + 기본 라우팅 + 홈 화면
4. GitHub/Vercel 연결
