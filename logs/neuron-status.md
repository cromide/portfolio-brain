# Neuron Status Tracker

> 이 파일은 graph.json과 동기화됩니다.
> Claude가 자동으로 이 파일을 읽고 graph.json을 업데이트합니다.

## Status Legend
- `fired` = 습득 완료 (활성 뉴런)
- `sparking` = 학습 중 (점화 중)
- `blank` = 미습득 (빈 뉴런)
- `risk` = 해결 필요
- `resolved` = 리스크 해결됨

---

## SPARKING (현재 학습 중)

| neuron_id | label | started | target_date | progress |
|-----------|-------|---------|-------------|----------|
| skill_figma | Figma | - | 2026-09 | 0% |
| skill_design_system | 디자인 시스템 | - | 2026-09 | 0% |
| skill_testing | 테스트 코드 | - | 2026-07 | 0% |
| skill_cicd | CI/CD 배포 | - | 2026-08 | 0% |
| skill_git_workflow | Git 협업 | - | 2026-07 | 0% |
| skill_data_decision | 데이터 기반 의사결정 | - | 2026-11 | 0% |
| skill_prd | 표준 PRD | - | 2026-11 | 0% |
| skill_storybook | Storybook | - | 2026-09 | 0% |
| skill_vercel | Vercel 배포 | - | 2026-08 | 0% |
| skill_sentry | Sentry 모니터링 | - | 2026-08 | 0% |
| skill_nextauth | NextAuth.js | - | 2026-10 | 0% |
| skill_prisma | Prisma ORM | - | 2026-10 | 0% |
| skill_blog | 기술 블로그 | - | 2026-12 | 0% |

## BLANK (아직 시작 안 함)

| neuron_id | label | prerequisite | target_phase |
|-----------|-------|-------------|--------------|
| future_docker | Docker/컨테이너 | skill_cicd | Phase 2+ |
| future_aws | AWS/클라우드 | future_docker | Phase 4+ |
| future_ai_ml | AI/ML 심화 | skill_python | Phase 4+ |
| future_graphql | GraphQL | skill_node | optional |
| future_motion_design | 모션 디자인 | skill_animation | optional |
| future_product_analytics | 제품 분석/그로스 | skill_data_decision | Phase 5 |
| future_agile | 애자일/스크럼 | skill_prd | Phase 5 |

## RISK (해결 필요)

| neuron_id | label | severity | resolved | resolved_date |
|-----------|-------|----------|----------|---------------|
| risk_no_test | 테스트 코드 0개 | critical | false | - |
| risk_no_deploy | 배포 경험 0개 | critical | false | - |
| risk_no_collab | 팀 협업 이력 없음 | critical | false | - |
| risk_no_readme | README 부실 | critical | false | - |
| risk_no_figma | Figma 작업물 없음 | high | false | - |
| risk_no_metrics | 성과 지표 없음 | high | false | - |
| risk_shallow | 넓지만 얕은 스택 | high | false | - |
| risk_no_blog | 기술 블로그 없음 | medium | false | - |
