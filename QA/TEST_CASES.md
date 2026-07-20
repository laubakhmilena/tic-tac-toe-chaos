# Тест-кейсы и автоматические проверки

Все статусы ниже отражают фактический запуск подготовленной версии. Для `BLOCKED` указано ограничение среды; такие пункты не считаются пройденными.

| ID | Область | Проверка | Метод | Статус | Доказательство |
|---|---|---|---|---|---|
| TC-SAVE-001 | Save / Pet / Rewards | new save opens only Classic | Node VM unit test | PASS | QA/logs/pet-and-save-tests.log |
| TC-SAVE-002 | Save / Pet / Rewards | existing unlocked themes survive migration | Node VM unit test | PASS | QA/logs/pet-and-save-tests.log |
| TC-SAVE-003 | Save / Pet / Rewards | invalid selected theme migrates to Classic | Node VM unit test | PASS | QA/logs/pet-and-save-tests.log |
| TC-SAVE-004 | Save / Pet / Rewards | old saves receive safe pet defaults | Node VM unit test | PASS | QA/logs/pet-and-save-tests.log |
| TC-SAVE-005 | Save / Pet / Rewards | theme achievement thresholds are correct | Node VM unit test | PASS | QA/logs/pet-and-save-tests.log |
| TC-SAVE-006 | Save / Pet / Rewards | match rewards map to 3, 2, 1 and friend 1 | Node VM unit test | PASS | QA/logs/pet-and-save-tests.log |
| TC-SAVE-007 | Save / Pet / Rewards | loss never reduces friendship and sets supportive mood | Node VM unit test | PASS | QA/logs/pet-and-save-tests.log |
| TC-SAVE-008 | Save / Pet / Rewards | friend match grants exactly one paw | Node VM unit test | PASS | QA/logs/pet-and-save-tests.log |
| TC-SAVE-009 | Save / Pet / Rewards | ten paws increase level and create a chest | Node VM unit test | PASS | QA/logs/pet-and-save-tests.log |
| TC-SAVE-010 | Save / Pet / Rewards | chests unlock sequential accessories without duplicates | Node VM unit test | PASS | QA/logs/pet-and-save-tests.log |
| TC-SAVE-011 | Save / Pet / Rewards | completed accessory sequence yields treat and two paws | Node VM unit test | PASS | QA/logs/pet-and-save-tests.log |
| TC-SAVE-012 | Save / Pet / Rewards | feeding consumes food and adds its paws | Node VM unit test | PASS | QA/logs/pet-and-save-tests.log |
| TC-SAVE-013 | Save / Pet / Rewards | only first petting in a session grants a paw | Node VM unit test | PASS | QA/logs/pet-and-save-tests.log |
| TC-SAVE-014 | Save / Pet / Rewards | daily gift is granted once per date | Node VM unit test | PASS | QA/logs/pet-and-save-tests.log |
| TC-SAVE-015 | Save / Pet / Rewards | daily quest persists on same date | Node VM unit test | PASS | QA/logs/pet-and-save-tests.log |
| TC-SAVE-016 | Save / Pet / Rewards | daily quest reward is paid once | Node VM unit test | PASS | QA/logs/pet-and-save-tests.log |
| TC-SAVE-017 | Save / Pet / Rewards | rewarded ad error gives no reward | Node VM unit test | PASS | QA/logs/pet-and-save-tests.log |
| TC-SAVE-018 | Save / Pet / Rewards | rewarded ads stop after three rewards | Node VM unit test | PASS | QA/logs/pet-and-save-tests.log |
| TC-SAVE-019 | Save / Pet / Rewards | infinite camera and zoom survive save restoration | Node VM unit test | PASS | QA/logs/pet-and-save-tests.log |
| TC-CORE-001 | Core Gameplay | classic game starts with an empty 3x3 board | Node VM unit test | PASS | QA/logs/core-game-tests.log |
| TC-CORE-002 | Core Gameplay | all eight classic winning lines are recognized | Node VM unit test | PASS | QA/logs/core-game-tests.log |
| TC-CORE-003 | Core Gameplay | non-winning classic board returns null | Node VM unit test | PASS | QA/logs/core-game-tests.log |
| TC-CORE-004 | Core Gameplay | hard bot takes an immediate winning move | Node VM unit test | PASS | QA/logs/core-game-tests.log |
| TC-CORE-005 | Core Gameplay | medium bot blocks an immediate player win | Node VM unit test | PASS | QA/logs/core-game-tests.log |
| TC-CORE-006 | Core Gameplay | disappearing game initializes independent queues | Node VM unit test | PASS | QA/logs/core-game-tests.log |
| TC-CORE-007 | Core Gameplay | strategic valid moves obey the active mini-board | Node VM unit test | PASS | QA/logs/core-game-tests.log |
| TC-CORE-008 | Core Gameplay | valid strategic save passes validation and malformed save fails | Node VM unit test | PASS | QA/logs/core-game-tests.log |
| TC-CORE-009 | Core Gameplay | infinite mode detects horizontal, vertical and diagonal lines of five | Node VM unit test | PASS | QA/logs/core-game-tests.log |
| TC-CORE-010 | Core Gameplay | infinite candidates start at origin and never include occupied cells | Node VM unit test | PASS | QA/logs/core-game-tests.log |
| TC-CORE-011 | Core Gameplay | infinite bot chooses its immediate winning move | Node VM unit test | PASS | QA/logs/core-game-tests.log |
| TC-CORE-012 | Core Gameplay | infinite save is rejected after the 1200-move cap | Node VM unit test | PASS | QA/logs/core-game-tests.log |
| TC-CORE-013 | Core Gameplay | strategic restore creates independent board arrays | Node VM unit test | PASS | QA/logs/core-game-tests.log |
| TC-SMOKE-001 | Browser Smoke | desktop 1440x900: title | Chromium + Playwright harness | PASS | QA/logs/browser-smoke.log |
| TC-SMOKE-002 | Browser Smoke | desktop 1440x900: app ready | Chromium + Playwright harness | PASS | QA/logs/browser-smoke.log |
| TC-SMOKE-003 | Browser Smoke | desktop 1440x900: home screen active | Chromium + Playwright harness | PASS | QA/logs/browser-smoke.log |
| TC-SMOKE-004 | Browser Smoke | desktop 1440x900: eight themes rendered | Chromium + Playwright harness | PASS | QA/logs/browser-smoke.log |
| TC-SMOKE-005 | Browser Smoke | desktop 1440x900: modes screen active | Chromium + Playwright harness | PASS | QA/logs/browser-smoke.log |
| TC-SMOKE-006 | Browser Smoke | desktop 1440x900: four modes available | Chromium + Playwright harness | PASS | QA/logs/browser-smoke.log |
| TC-SMOKE-007 | Browser Smoke | desktop 1440x900: friend mode hides difficulty | Chromium + Playwright harness | PASS | QA/logs/browser-smoke.log |
| TC-SMOKE-008 | Browser Smoke | desktop 1440x900: game screen active | Chromium + Playwright harness | PASS | QA/logs/browser-smoke.log |
| TC-SMOKE-009 | Browser Smoke | desktop 1440x900: classic board has nine cells | Chromium + Playwright harness | PASS | QA/logs/browser-smoke.log |
| TC-SMOKE-010 | Browser Smoke | desktop 1440x900: victory modal opens | Chromium + Playwright harness | PASS | QA/logs/browser-smoke.log |
| TC-SMOKE-011 | Browser Smoke | desktop 1440x900: victory text shown | Chromium + Playwright harness | PASS | QA/logs/browser-smoke.log |
| TC-SMOKE-012 | Browser Smoke | desktop 1440x900: in-memory statistics updated | Chromium + Playwright harness | PASS | QA/logs/browser-smoke.log |
| TC-SMOKE-013 | Browser Smoke | desktop 1440x900: real localStorage persistence | Chromium + Playwright harness | BLOCKED | QA/logs/browser-smoke.log |
| TC-SMOKE-014 | Browser Smoke | desktop 1440x900: no horizontal document overflow | Chromium + Playwright harness | PASS | QA/logs/browser-smoke.log |
| TC-SMOKE-015 | Browser Smoke | desktop 1440x900: no page errors | Chromium + Playwright harness | PASS | QA/logs/browser-smoke.log |
| TC-SMOKE-016 | Browser Smoke | desktop 1440x900: smoke sequence | Chromium + Playwright harness | PASS | QA/logs/browser-smoke.log |
| TC-SMOKE-017 | Browser Smoke | mobile 390x844: title | Chromium + Playwright harness | PASS | QA/logs/browser-smoke.log |
| TC-SMOKE-018 | Browser Smoke | mobile 390x844: app ready | Chromium + Playwright harness | PASS | QA/logs/browser-smoke.log |
| TC-SMOKE-019 | Browser Smoke | mobile 390x844: home screen active | Chromium + Playwright harness | PASS | QA/logs/browser-smoke.log |
| TC-SMOKE-020 | Browser Smoke | mobile 390x844: eight themes rendered | Chromium + Playwright harness | PASS | QA/logs/browser-smoke.log |
| TC-SMOKE-021 | Browser Smoke | mobile 390x844: modes screen active | Chromium + Playwright harness | PASS | QA/logs/browser-smoke.log |
| TC-SMOKE-022 | Browser Smoke | mobile 390x844: four modes available | Chromium + Playwright harness | PASS | QA/logs/browser-smoke.log |
| TC-SMOKE-023 | Browser Smoke | mobile 390x844: friend mode hides difficulty | Chromium + Playwright harness | PASS | QA/logs/browser-smoke.log |
| TC-SMOKE-024 | Browser Smoke | mobile 390x844: game screen active | Chromium + Playwright harness | PASS | QA/logs/browser-smoke.log |
| TC-SMOKE-025 | Browser Smoke | mobile 390x844: classic board has nine cells | Chromium + Playwright harness | PASS | QA/logs/browser-smoke.log |
| TC-SMOKE-026 | Browser Smoke | mobile 390x844: victory modal opens | Chromium + Playwright harness | PASS | QA/logs/browser-smoke.log |
| TC-SMOKE-027 | Browser Smoke | mobile 390x844: victory text shown | Chromium + Playwright harness | PASS | QA/logs/browser-smoke.log |
| TC-SMOKE-028 | Browser Smoke | mobile 390x844: in-memory statistics updated | Chromium + Playwright harness | PASS | QA/logs/browser-smoke.log |
| TC-SMOKE-029 | Browser Smoke | mobile 390x844: real localStorage persistence | Chromium + Playwright harness | BLOCKED | QA/logs/browser-smoke.log |
| TC-SMOKE-030 | Browser Smoke | mobile 390x844: no horizontal document overflow | Chromium + Playwright harness | PASS | QA/logs/browser-smoke.log |
| TC-SMOKE-031 | Browser Smoke | mobile 390x844: no page errors | Chromium + Playwright harness | PASS | QA/logs/browser-smoke.log |
| TC-SMOKE-032 | Browser Smoke | mobile 390x844: smoke sequence | Chromium + Playwright harness | PASS | QA/logs/browser-smoke.log |
| TC-SMOKE-033 | Browser Smoke | mode classic: launches | Chromium + Playwright harness | PASS | QA/logs/browser-smoke.log |
| TC-SMOKE-034 | Browser Smoke | mode classic: no page errors | Chromium + Playwright harness | PASS | QA/logs/browser-smoke.log |
| TC-SMOKE-035 | Browser Smoke | mode disappearing: launches | Chromium + Playwright harness | PASS | QA/logs/browser-smoke.log |
| TC-SMOKE-036 | Browser Smoke | mode disappearing: no page errors | Chromium + Playwright harness | PASS | QA/logs/browser-smoke.log |
| TC-SMOKE-037 | Browser Smoke | mode strategic: launches | Chromium + Playwright harness | PASS | QA/logs/browser-smoke.log |
| TC-SMOKE-038 | Browser Smoke | mode strategic: no page errors | Chromium + Playwright harness | PASS | QA/logs/browser-smoke.log |
| TC-SMOKE-039 | Browser Smoke | mode infinite: launches | Chromium + Playwright harness | PASS | QA/logs/browser-smoke.log |
| TC-SMOKE-040 | Browser Smoke | mode infinite: no page errors | Chromium + Playwright harness | PASS | QA/logs/browser-smoke.log |

## Сводка

- Всего оформлено проверок: **72**.
- PASS: **70**.
- FAIL: **0**.
- BLOCKED: **2**.

## Примечание

Unit-тесты выполняются без сторонних npm-зависимостей. Браузерный smoke запускался в Chromium через Playwright, установленный в тестовом окружении; он не включён в обязательные зависимости репозитория.
