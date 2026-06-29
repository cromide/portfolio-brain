# Portfolio Brain — Claude Integration Guide

이 프로젝트는 유동화의 뉴런 기반 포트폴리오 그래프 시각화입니다.
Claude는 이 프로젝트에서 **학습 코치 + 그래프 관리자** 역할을 합니다.

## 프로젝트 구조

```
portfolio_visual/
├── CLAUDE.md              ← 이 파일 (Claude 지침)
├── ROADMAP.md             ← 6개월 로드맵
├── index.html / style.css / app.js  ← 시각화 앱
├── data/
│   ├── graph.json         ← 뉴런 그래프 데이터 (노드 + 엣지)
│   └── career-paths.json  ← 취직 포지셔닝 전략
└── logs/
    ├── learning-log.md    ← 학습 기록 (시간순)
    └── neuron-status.md   ← 뉴런 상태 추적 (현황표)
```

## 뉴런 상태 모델

| state | 의미 | graph.json 표현 |
|-------|------|----------------|
| `fired` | 습득 완료 | `status: "acquired"` 또는 `"completed"` |
| `sparking` | 학습 중 | `status: "learning"` |
| `blank` | 미습득 | `type: "future"` |
| `risk` | 해결 필요 | `type: "risk"` |
| `phase` | 로드맵 단계 | `type: "phase"` |

## 진행률 모델 — "원이 채워지고 늘어난다" (★핵심)

각 학습 가능 뉴런(`skill`/`project`/`future`/`risk`)은 **`progress` (0~100)** 필드를 가진다.
시각화에서 progress는 두 가지로 표현된다:
- **채워짐:** 노드 둘레의 링이 progress 비율만큼 12시 방향부터 차오른다.
- **늘어남:** progress가 높을수록 노드 반지름이 커진다 (0%→0.6배, 100%→1.05배).

**작업을 수행할 때마다 progress를 올리는 것이 이 앱의 핵심 루프다.**

### progress 업데이트 규칙 (Claude가 graph.json을 수정)
- `/brain log` 으로 학습 보고가 들어오면 → 관련 뉴런의 `progress`를 **+10~30** 올린다 (작업 크기에 따라).
- `progress`가 100에 도달하면 → `status`를 `"acquired"`로 바꾸고 state가 `fired`로 전환.
- `/brain activate [id]` → 해당 뉴런 `progress: 100` + `status: "acquired"`.
- `/brain risk [id] resolve` → risk 뉴런 `progress: 100` + `status: "resolved"`.
- 수정 후 브라우저를 새로고침하면 링이 더 차오르고 노드가 커진 게 보인다.

> 즉, 매일 `/brain log` → progress 상승 → 원이 차오름/성장 → 100%면 점화(fired).
> 이것이 "수행할 때마다 채워지고 늘어나는" 동작이다.

## Claude 명령어 (유저가 입력하는 프롬프트)

### `/brain log` — 학습 기록 추가
유저가 오늘 공부한 내용을 말하면:
1. `logs/learning-log.md`에 날짜+뉴런ID+내용 추가
2. `logs/neuron-status.md`에서 해당 뉴런의 progress 업데이트
3. progress가 100%면 `data/graph.json`에서 status를 `"acquired"`로 변경
4. 연관 risk가 해결되면 risk 노드도 업데이트

**예시 프롬프트:**
```
/brain log 오늘 Vitest로 Nobizform 컴포넌트 테스트 5개 작성했어
```

Claude가 할 일:
- learning-log.md에 기록 추가
- neuron-status.md의 skill_testing progress 업데이트
- 필요 시 graph.json 수정

### `/brain status` — 현재 뇌 상태 요약
유저가 현재 상태를 확인하고 싶을 때:
1. `logs/neuron-status.md` 읽기
2. 전체 진행률 (fired/total) 계산
3. 이번 Phase에서 남은 작업 목록 출력
4. 다음으로 해야 할 뉴런 추천

### `/brain activate [neuron_id]` — 뉴런 활성화 (습득 완료 처리)
특정 스킬을 완전히 습득했을 때:
1. `data/graph.json`에서 해당 노드의 status를 `"acquired"`로 변경
2. `logs/neuron-status.md`에서 progress를 100%로, SPARKING → FIRED 섹션으로 이동
3. 연관 risk 노드 체크 → 조건 충족 시 risk 해결 처리
4. `logs/learning-log.md`에 완료 기록
5. 연결된 blank 뉴런이 새로 sparking으로 전환 가능한지 확인

### `/brain risk [risk_id] resolve` — 리스크 해결
리스크가 해결되었을 때:
1. `data/graph.json`에서 해당 risk 노드를 `status: "resolved"`로 변경
2. `logs/neuron-status.md` RISK 테이블 업데이트
3. 해결 날짜 기록

### `/brain plan` — 이번 달 할 일 생성
현재 Phase 기준으로:
1. ROADMAP.md에서 해당 Phase 체크리스트 읽기
2. neuron-status.md에서 미완료 항목 확인
3. 이번 주 구체적 TODO 리스트 생성

### `/brain career` — 취직 전략 확인
1. `data/career-paths.json` 읽기
2. 현재 뉴런 상태와 비교하여 각 경로의 준비도 계산
3. 가장 빠르게 도달 가능한 경로 추천

### `/brain add [type] [label]` — 새 뉴런 추가
새로운 스킬이나 프로젝트를 그래프에 추가:
1. `data/graph.json`에 새 노드 추가
2. 적절한 엣지(연결) 자동 생성
3. `logs/neuron-status.md` 업데이트

## graph.json 수정 규칙

1. **노드 추가 시**: id는 snake_case, `skill_` / `proj_` / `future_` 접두사 사용
2. **상태 변경 시**: status 필드만 변경, 구조는 변경하지 않음
3. **리스크 해결 시**: type을 변경하지 말고 status만 `"resolved"`로
4. **엣지 추가 시**: type은 `has_skill`, `used_in`, `leads_to`, `cross_domain`, `resolves`, `solves`, `sequence` 중 하나

## 취직 포지셔닝 전략 (요약)

### 추천 포지션: 프론트엔드 개발자 (디자인 출신)
- 핵심 차별점: Figma → 코드 전환, 디자인 시스템 구축
- 필수 보강: Figma, Storybook, 테스트 코드, CI/CD
- 킬러 프로젝트: Nobizform, fake reddit, 데이터 대시보드

### 보조 포지션: 프로덕트 디자이너 (코딩 가능)
- 핵심 차별점: 기획→디자인→코드 전 과정 이해
- 필수 보강: Figma 심화, UX 리서치, 데이터 분석
- 킬러 프로젝트: 메디녹스, 갓맥, 민트케이크

## 주의사항

- graph.json을 수정할 때는 반드시 전체 JSON 유효성을 확인할 것
- 뉴런 상태 변경 시 learning-log.md에도 반드시 기록할 것
- 유저가 학습 내용을 말하면 자동으로 관련 뉴런을 찾아서 연결할 것
- career-paths.json의 must_develop 항목과 현재 neuron-status를 항상 비교할 것
