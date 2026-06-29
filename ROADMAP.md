# 물경력 탈출 6개월 로드맵

> 진단일: 2026-06-29
> 대상: 유동화 — 브랜드 디자이너/서비스 기획 → 제품 제너럴리스트

---

## 1. 현재 진단: 물경력 리스크 분석

### CRITICAL (즉시 해결 — 면접 탈락 원인)

| # | 리스크 | 현재 상태 | 면접관 시선 |
|---|--------|----------|------------|
| C1 | **프로젝트에 테스트 코드 0개** | Nobizform, bapsajugi, Recorder 전부 테스트 없음 | "코드 품질 관리 의지가 없다" |
| C2 | **배포된 서비스가 0개** | 모든 프로젝트가 localhost에서만 동작 | "만들기만 하고 운영해본 적 없다" |
| C3 | **Git 이력이 1인 작업** | 브랜치 전략, PR 리뷰, 커밋 컨벤션 부재 | "팀 협업 경험이 없다" |
| C4 | **README가 부실하거나 없음** | Recorder 양쪽 다 README 없음, 나머지도 기본 수준 | "문서화 습관이 없다" |

### HIGH (1~2개월 내 해결)

| # | 리스크 | 현재 상태 | 면접관 시선 |
|---|--------|----------|------------|
| H1 | **Figma 작업물 0개** | 디자인 전부 Adobe 도구 | "현업 UI 도구를 못 쓴다" |
| H2 | **성과 지표(숫자) 없음** | "구축했다" "참여했다"만 반복 | "임팩트를 모른다" |
| H3 | **CI/CD 파이프라인 0개** | GitHub Actions 설정 없음 | "자동화 감각이 없다" |
| H4 | **기술 스택이 넓지만 얕다** | React, Svelte, Go, Flutter, Python... | "뭐 하나 깊은 게 없다" |

### MEDIUM (3~4개월 내 해결)

| # | 리스크 | 현재 상태 |
|---|--------|----------|
| M1 | **데이터 기반 의사결정 경험 없음** | 기획서에 지표/퍼널/A/B 없음 |
| M2 | **오픈소스 기여 / 커뮤니티 활동 없음** | GitHub 프로필 비어있음 |
| M3 | **기술 블로그 없음** | 학습 기록이 외부에 없음 |

---

## 2. 핵심 전략: "넓은 제너럴리스트"가 아니라 "깊이 있는 T자형 인재"

### 포지션 재정의
```
현재: "디자인도 기획도 개발도 할 줄 압니다" (= 다 얕다)
목표: "제품의 0→1을 실제로 배포까지 끌고 간 사람" (= 깊이 증명)
```

### 주력 무기 선택 (1개만 깊게)
- **추천: Next.js 풀스택 + Vercel 배포** (Nobizform이 가장 고도화됨)
- 보조: React 생태계 (bapsajugi, 퍼블리싱 4개)
- 차별점: Figma → 코드 전환 (디자인 출신 개발자)

---

## 3. 6개월 타임라인 (2026.07 ~ 2026.12)

### Phase 1: 기초 체력 (7월) — "프로답게 만들기"

**Week 1~2: Git 워크플로우 + README 정비**
- [ ] 모든 프로젝트에 Git 컨벤션 적용 (Conventional Commits)
- [ ] Nobizform에 브랜치 전략 적용 (main / develop / feature/*)
- [ ] 5개 프로젝트 README 전면 재작성:
  - 프로젝트 개요 + 스크린샷/GIF
  - 기술 스택 + 아키텍처 다이어그램
  - 설치/실행 방법
  - 주요 기능 목록
  - 트러블슈팅 기록
- [ ] .env.example 전 프로젝트 추가

**Week 3~4: 테스트 코드 입문**
- [ ] Nobizform 프론트: Vitest + React Testing Library (핵심 컴포넌트 5개)
- [ ] Nobizform 백엔드: pytest (API 엔드포인트 테스트 10개)
- [ ] bapsajugi 백엔드: Jest (인증 플로우 테스트)
- [ ] 커버리지 배지 README에 추가
- 학습 자료: Kent C. Dodds "Testing JavaScript" 패턴

### Phase 2: 배포 + CI/CD (8월) — "세상에 공개하기"

**Week 1~2: Nobizform 배포**
- [ ] Vercel에 프론트 배포 (커스텀 도메인)
- [ ] Railway/Render에 FastAPI 백엔드 배포
- [ ] GitHub Actions: push → lint → test → build → deploy 파이프라인
- [ ] 환경변수 관리 (dotenv-vault 또는 Vercel 환경변수)
- [ ] 에러 모니터링: Sentry 연동

**Week 3~4: bapsajugi + 포트폴리오 사이트 배포**
- [ ] bapsajugi: Vercel + Railway 배포
- [ ] 이 뉴런 그래프 포트폴리오도 Vercel 배포 (커스텀 도메인)
- [ ] GitHub Actions 2개 프로젝트 추가
- [ ] Docker Compose → 프로덕션 환경 문서화
- [ ] Lighthouse 성능 점수 90+ 달성 후 README에 기록

### Phase 3: Figma + 디자인 시스템 (9월) — "디자인 출신 증명"

**Week 1~2: Figma 기초 → 실전**
- [ ] Figma 기본 마스터: Auto Layout, Component, Variants, Tokens
- [ ] Nobizform UI를 Figma로 리디자인 (5~10 화면)
- [ ] 모바일 반응형 디자인 추가

**Week 3~4: 디자인 시스템 구축**
- [ ] Figma 컴포넌트 라이브러리 → 코드 컴포넌트 1:1 매핑
- [ ] Storybook 셋업 (Nobizform 컴포넌트 10개)
- [ ] 디자인 토큰 (색상, 타이포, 간격) JSON 관리
- [ ] "Figma → Storybook → 코드" 워크플로우를 기술 블로그에 작성

### Phase 4: 깊이 파기 (10월) — "한 우물 깊게"

**Week 1~2: Next.js 심화**
- [ ] App Router 심화: Server Actions, Streaming SSR, Parallel Routes
- [ ] 인증: NextAuth.js v5 (Google/Kakao) → bapsajugi의 커스텀 인증을 대체
- [ ] DB: Prisma + PostgreSQL (현재 MongoDB → 관계형 경험 추가)
- [ ] 캐싱 전략: ISR, on-demand revalidation

**Week 3~4: 성능 최적화 + 모니터링**
- [ ] Web Vitals (LCP, FID, CLS) 측정 → 최적화 → 수치 기록
- [ ] Bundle 분석 (next/bundle-analyzer) → 코드 스플리팅
- [ ] 이미지 최적화 (next/image, WebP, lazy loading)
- [ ] "Nobizform 성능 최적화 여정" 기술 블로그 작성

### Phase 5: 기획 역량 증명 (11월) — "숫자로 말하기"

**Week 1~2: 데이터 기반 의사결정**
- [ ] Nobizform에 간단한 분석 도구 연동 (Vercel Analytics / Mixpanel 무료)
- [ ] 핵심 지표 정의: DAU, 프레젠테이션 생성 수, 완주율, 이탈 구간
- [ ] 메디녹스 기획서에 KPI 페이지 추가 (가상이라도 지표 프레임워크 적용)
- [ ] SQL 기초 복습 → 쿼리로 데이터 추출하는 시나리오 만들기

**Week 3~4: PRD + 애자일 실습**
- [ ] Nobizform을 대상으로 표준 PRD 1건 작성 (Notion/Linear 템플릿)
- [ ] GitHub Projects로 스프린트 보드 운영 (실제 2주 스프린트 1회)
- [ ] 회고 문서 작성 (KPT 포맷)
- [ ] 경력기술서 전면 재작성: 모든 프로젝트에 "성과 숫자" 추가

### Phase 6: 완성 + 구직 준비 (12월) — "패키징"

**Week 1~2: 기술 블로그 + 오픈소스**
- [ ] 기술 블로그 6편 이상 (월 1편씩 누적):
  1. Figma→코드 디자인 시스템 워크플로우
  2. Next.js 성능 최적화 실전
  3. CI/CD 파이프라인 구축기
  4. 테스트 코드 도입 회고
  5. 브랜드 디자이너가 풀스택이 된 과정
  6. 뉴런 그래프 포트폴리오 만들기 (D3.js)
- [ ] planning-with-files 오픈소스 정비: issue 관리, CONTRIBUTING.md
- [ ] 유의미한 오픈소스 PR 1~2건 (사용 중인 라이브러리)

**Week 3~4: 취업 패키지 최종 정비**
- [ ] 경력기술서 직무별 버전 완성 (디자인/프론트엔드/기획 각 1부)
- [ ] 포트폴리오 사이트 최종 점검 (라이브 데모 링크 전부 동작 확인)
- [ ] GitHub 프로필 README 작성 (pinned repos, 기술 스택, 활동 그래프)
- [ ] 모의 면접 준비: 프로젝트별 STAR 답변 5개씩

---

## 4. 주간 루틴 (권장)

| 요일 | 오전 (2h) | 오후 (3h) | 저녁 (1h) |
|------|----------|----------|----------|
| 월~금 | 이론 학습 (강의/문서) | 코드 실습 (프로젝트 적용) | 기술 블로그 초안 / TIL |
| 토 | 주간 회고 + 다음주 계획 | 프로젝트 집중 작업 | 자유 |
| 일 | 휴식 | 포트폴리오 정비 (선택) | 휴식 |

## 5. 각 Phase 완료 시 체크포인트

| Phase | 완료 조건 | 증거물 |
|-------|----------|--------|
| 1 (7월) | 테스트 30개+ / README 5개 재작성 | GitHub 커밋 + 커버리지 배지 |
| 2 (8월) | 2개 서비스 라이브 배포 + CI/CD 동작 | 배포 URL + GitHub Actions 녹색 |
| 3 (9월) | Figma 파일 + Storybook 배포 | Figma 공유 링크 + Chromatic URL |
| 4 (10월) | 성능 점수 기록 + 블로그 2편 | Lighthouse 스크린샷 + 블로그 URL |
| 5 (11월) | PRD 1건 + 지표 대시보드 | Notion/Linear + Analytics 스크린샷 |
| 6 (12월) | 블로그 6편 + 경력기술서 완성 | 전체 패키지 완성 |

---

## 6. "물경력"에서 "실경력"으로 바뀌는 핵심 전환점

```
Before: "React, Svelte, Go, Flutter, Python 다 할 줄 알아요"
After:  "Next.js로 AI 프레젠테이션 도구를 만들어 배포했고,
         Vitest 50개 + GitHub Actions CI/CD로 품질 관리하며,
         Figma 디자인 시스템에서 코드까지 원스톱으로 연결합니다.
         월 DAU 50명, 프레젠테이션 생성 200건을 달성했습니다."
```
