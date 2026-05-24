# iRHEA-Light UI ↔ C++ 백엔드 핸드오프

**대상 독자:** C++ 데몬·웹서버를 구현할 임베디드 개발팀
**현재 상태:** UI prototype 완성 (irhea-design-2, GitHub Pages 배포), 백엔드 미구현 (spec V0.1만 작성)
**작성 기준:** myapp_ipc 스켈레톤 + iRHEA-LIGHT IPC 정의 V0.1 (2026.03.20) + iRHEA-LIGHT 파일 정의 + STM32MP1 Yocto BSP

---

## 1. 시스템 개요

```
브라우저 (Chromium kiosk on STM32MP1)
   │ HTTP + SSE
   ▼
Apache2 (현재 동작 중, 정적 서빙)        ◄── 정적 docs/ 서빙 유지
   │
   │ /api/* 만 mod_proxy로 리버스          ◄── 추가 작업 (C++ 팀)
   ▼
C++ webserver  (8080 TCP, 신규 구현)
   │ UDS: ipc_cmd.sock (REQ/RSP)
   │ UDS: ipc_evt.sock (one-way push)
   ▼
C daemon  (신규 구현)
   │ CAN bus
   ▼
보드 (MCP / WHP / MDP / Nozzle×5)
   │ 파일 시스템
   ▼
/opt/irhea/data/*.dat
/opt/irhea/log/*.log
```

**Apache 유지 이유:** 이미 STM32MP1 BSP에 들어가 있고 정적 자산(docs/) 서빙은 안정적. C++ webserver는 `/api/*`만 담당.

**Apache mod_proxy 설정 추가 (apache2-irhea-light.conf):**
```apache
ProxyPass        /api/   http://127.0.0.1:8080/api/
ProxyPassReverse /api/   http://127.0.0.1:8080/api/
# SSE — buffering 끄기
ProxyPass        /api/events http://127.0.0.1:8080/api/events flushpackets=on
SetEnvIf Request_URI "^/api/events" no-gzip dont-vary
```

---

## 2. /api ↔ IPC cmd / 파일 매핑 표

### 표기

| 기호 | 의미 |
|---|---|
| 🔌 | spec V0.1 정의된 IPC cmd |
| 🆕 | spec에 없음 — V0.2 추가 필요 (담당자 협의) |
| 📄 | `.dat` 파일 read (웹서버가 직접) |
| 📝 | `.dat` 파일 write (데몬만, IPC 경유) |
| 🔀 | SSE 이벤트 (`ipc_evt.sock` → `GET /api/events`) |
| 🏠 | 웹서버 로컬 처리 (IPC·파일 모두 무관) |

### 2.1 시스템 정보 / 초기 설정

| Method | Path | Body / Query | Response | 매핑 |
|---|---|---|---|---|
| GET | `/api/system-config` | — | `{serialNumber, modelName, modelNumber, firmwareVersion, firmwareDate, installedAt, configured}` | 📄 `sys_info.dat` |
| POST | `/api/system-config/configure` | `{}` | `{ok}` | 🆕 0x1601 SET_INITIAL_CONFIG (또는 별도 휘발성 플래그) |
| POST | `/api/system-config/unconfigure` | `{}` | `{ok}` | (개발 전용 — production 제거) |
| GET | `/api/connection` | — | `{ipAddress, store, deviceId, role, username}` | 📄 `sys_info.dat` 일부 |
| POST | `/api/connection` | `{ipAddress, store, ...}` | `{ok}` | 🆕 0x1502 SET_CONNECTION |
| POST | `/api/connection/test` | — | `{ok, latencyMs}` | 🔌 0x1001 GET_STATUS (ack 시간 측정) |
| POST | `/api/admin/login` | `{username, password}` | 200 `{ok}` / 401 | 🏠 (webserver에서 PAM 또는 로컬 hash 검증) |

**시안 누락:** admin 인증 위치 미정의. 권장: webserver 프로세스 안에서 검증, 성공 시 세션 쿠키 발급. 모든 admin 보호 엔드포인트는 세션 쿠키 검증.

### 2.2 추출구 상태 (라이브 모니터링)

| Method | Path | Body | Response | 매핑 |
|---|---|---|---|---|
| GET | `/api/spouts` | — | `[{id, status, currentRecipeId, elapsedSec, totalSec, progressPct, extractCount, favoriteRecipeIds, calibration}, ...×5]` | 🔌 0x1001 GET_STATUS + 0x1002 GET_CURRENT_BREW |

**`status` enum** (UI 의존):
- `idle` / `extracting` / `complete` / `rinsing` / `watering`
- spec 명령 시그니처에 정확히 매핑됨

**UI 갱신 주기:** 현재 1초 polling. C++ 백엔드 도입 후 SSE 푸시로 전환 — `0x2102 BREW_PROGRESS` 이벤트 받아서 갱신.

### 2.3 레시피

| Method | Path | Body | Response | 매핑 |
|---|---|---|---|---|
| GET | `/api/recipes` | — | `[{id, name, dripper, coffeeWeight, ratio, waterTemp, grindSize, notes, bloom{...}, stages[...]}, ...]` | 📄 `recipe_spoutN.dat` × 5 (총 12 레시피) |
| GET | `/api/recipes/:id` | — | 단일 recipe | 📄 |
| POST | `/api/recipes` | recipe 객체 | `{ok, id}` | 🆕 0x1401 SAVE_RECIPE |
| PUT | `/api/recipes/:id` | recipe 객체 | `{ok}` | 🆕 0x1401 SAVE_RECIPE (id 지정) |
| DELETE | `/api/recipes/:id` | — | `{ok}` | 🆕 0x1402 DELETE_RECIPE |

**시안 누락:** 12 레시피의 분포 — recipe_spoutN.dat 마다 12개 다 들어가는지, 각 추출구 별 다른 12개인지 spec 모호. **C++ 팀 결정 필요.**

### 2.4 즐겨찾기

| Method | Path | Body | Response | 매핑 |
|---|---|---|---|---|
| GET | `/api/favorites` | — | `[{spoutId, slotA: recipeId, slotB: recipeId}, ...]` | 📄 `recipe_fav_spoutN.dat` × 5 |
| PUT | `/api/favorites` | `[{spoutId, slotA, slotB}, ...]` | `{ok}` | 🆕 0x1403 SET_FAVORITE |

### 2.5 추출 제어

| Method | Path | Body | Response | 매핑 |
|---|---|---|---|---|
| POST | `/api/brew/start` | `{recipe_id, spout, cup_size, start_source}` | `{accepted, brew_job_id, state}` | 🔌 0x1101 START_BREW |
| POST | `/api/brew/stop` | `{brew_job_id}` | `{ok}` | 🔌 0x1102 STOP_BREW |
| POST | `/api/rinse/start` | `{spout}` | `{accepted}` | 🔌 0x1103 START_RINSE |
| POST | `/api/rinse/stop` | `{spout}` | `{ok}` | 🔌 0x1104 STOP_RINSE |
| POST | `/api/water/start` | `{spout, amount_ml}` | `{accepted}` | 🔌 0x1105 START_WATER |
| POST | `/api/water/stop` | `{spout}` | `{ok}` | 🔌 0x1106 STOP_WATER |

**프로토타입 현황:** 현재 `/brewing` 페이지가 22.5초 자동 시뮬레이션. 실배포 시 위 엔드포인트 호출하도록 prototype 수정 필요. **C++ 팀과 프로토타입 팀 합의 사항.**

### 2.6 알람

| Method | Path | Body | Response | 매핑 |
|---|---|---|---|---|
| GET | `/api/alarms` | — | `{count, alarms: [{alarm_id, code, level, source, message, active}]}` | 🔌 0x1003 GET_ACTIVE_ALARMS |
| POST | `/api/alarms/:id/ack` | — | `{ok}` | 🔌 0x1201 ACK_ALARM |
| POST | `/api/alarms/buzzer/stop` | — | `{ok}` | 🔌 0x1202 STOP_BUZZER |
| POST | `/api/warnings/clear` | `{warning_id}` | `{ok}` | 🔌 0x1203 CLEAR_WARNING |

### 2.7 설정

| Method | Path | Body | Response | 매핑 |
|---|---|---|---|---|
| GET | `/api/general-config` | — | `{unit, alarm, dripper, theme, language}` | 📄 `common_env.dat` |
| POST | `/api/general-config` | 부분 패치 | `{ok}` | 🆕 0x1501 SET_COMMON_ENV |
| GET | `/api/boiler-info` | — | `{tempSet, tempMax, serialNumber, modelNumber, firmwareVersion, firmwareDate, waterPump, valve}` | 📄 `sys_info.dat` |
| POST | `/api/boiler-info` | `{tempSet}` | `{ok}` | 🆕 0x1502 SET_BOILER |
| GET | `/api/pour-range` | — | `[{cup: 1, radius: 30}, ...×4]` | 📄 `default_pour_range_spiral.dat` |
| POST | `/api/pour-range` | `{items: [{cup, radius}]}` | `{ok}` | 🆕 0x1503 SET_POUR_RANGE |
| GET | `/api/pump-calibration` | — | `[{base, calibrated}, ...×5]` per 추출구 | 📄 `calibration_spoutN.dat` × 5 |
| POST | `/api/pump-calibration` | `{spoutId, items}` | `{ok}` | 🆕 0x1504 SET_PUMP_CALIBRATION |
| GET | `/api/water-rinse` | — | `{water: {speed, temp, amount}, rinse: {speed, temp, amount}}` | 📄 `default_drip_env.dat` |
| POST | `/api/water-rinse` | 부분 패치 | `{ok}` | 🆕 0x1505 SET_WATER_RINSE |

### 2.8 펌웨어

| Method | Path | Body | Response | 매핑 |
|---|---|---|---|---|
| GET | `/api/firmware/status` | — | `{currentVersion, latestVersion, updateAvailable, state}` | 🔌 0x1004 GET_FW_STATUS |
| GET | `/api/firmware/files` | — | `[{file_name, version, target_board, size}]` | 🔌 0x1303 GET_FW_FILE_LIST |
| GET | `/api/firmware/targets` | — | `[{target_board, currentVersion}]` | 🔌 0x1304 GET_FW_TARGET_LIST |
| POST | `/api/firmware/check` | — | `{currentVersion, latestVersion, updateAvailable}` | 🔌 0x1004 + 0x1303 합쳐서 응답 |
| POST | `/api/firmware/start` | `{target_board, file_name, start_source}` | `{accepted, fw_job_id, state}` | 🔌 0x1301 START_FW_UPDATE |
| POST | `/api/firmware/cancel` | `{fw_job_id}` | `{ok}` | 🔌 0x1302 CANCEL_FW_UPDATE |
| POST | `/api/firmware/upgrade` | `{}` | `{ok}` | (mock — 위 start로 통합) |

### 2.9 시스템 작업

| Method | Path | Body | Response | 매핑 |
|---|---|---|---|---|
| POST | `/api/factory-reset` | `{categories: [...]}` | `{ok}` | 🆕 0x1601 FACTORY_RESET |
| POST | `/api/backup` | `{items: [...]}` | `{ok}` | 🆕 0x1602 BACKUP_USB |
| POST | `/api/restore` | `{items: [...]}` | `{ok}` | 🆕 0x1603 RESTORE_USB |

### 2.10 로그 / 사용 실적

| Method | Path | Body | Response | 매핑 |
|---|---|---|---|---|
| GET | `/api/error-log` | `?from=YYYY-MM-DD&to=YYYY-MM-DD` | `[{timestamp, code, message, detail, source}]` | 📄 `error_YYYYMMDD.log` scan |
| GET | `/api/system-log` | 동일 | 동일 | 📄 동일 |
| GET | `/api/usage-info` | — | `{totalBrews, todayBrews, weeklyTop}` | 📄 `usage_info.dat` |
| GET | `/api/usage-stats` | `?from=...&to=...` | `[{date, recipe_name, bean_weight}]` | 📄 `usage_YYYYMMDD.log` scan |

### 2.11 이벤트 스트림

| Method | Path | 응답 | 매핑 |
|---|---|---|---|
| GET | `/api/events` | `text/event-stream` (SSE) | 🔀 `ipc_evt.sock` 모든 EVT relay |

**SSE 포맷:**
```
event: brew_progress
id: 12345
data: {"brew_job_id":"BREW_20260324_0001","state":"brewing","progress":45,"current_stage":2,"remain_sec":22}

```

- `event:` = cmd 코드 매핑된 enum (lowercase): `brew_started`, `brew_progress`, `brew_completed`, `alarm_raised`, `alarm_cleared`, `fw_progress`, ...
- `id:` = IPC `seq` (Last-Event-ID 복원에 사용 — webserver의 ring buffer 필요)
- `data:` = JSON body (IPC body 그대로)

---

## 3. `.dat` ↔ mock JSON 필드 매핑

C++ 팀이 `.dat` 직렬화 시 prototype mock JSON 필드명과 매칭. **prototype은 mock JSON 그대로 사용 중**이므로 백엔드는 동일한 JSON 형태로 응답.

### 3.1 recipe_spoutN.dat ↔ `/api/recipes` 응답

| .dat 필드 (파일 정의 xlsx) | 타입 | mock recipes.json 필드 | UI 노출 위치 |
|---|---|---|---|
| `index` | uint8/16 | `id` | 좌측 레일 "레시피 N" |
| `recipe_name` | string ≤80 | `name` | 상세 패널 제목 |
| `bean_name` | string | (현재 mock 동일 사용) | 원두명 |
| `bean_weight` | uint16 | `coffeeWeight` (g) | "원두량 20 g" |
| `extract_coffee_weight` | uint16 | `waterWeight` ? | (확인 필요) |
| `extraction_ratio` | float | `extractionRatio` 또는 `ratio` 파싱 | "추출 비율 1:16" |
| `extraction_unit` | uint8 | `extraction_unit` ("Percent" or "Weight") | "추출 단위 Percent (%)" |
| `pour_range_bloom` | int8 | (mock 없음 — 추가 필요) | "뜸들이기 3 cup" |
| `pour_range_brew` | int8 | (mock 없음) | "추출 4 cup" |
| `bean_grind_degree` | int8 | `grindSize` | "분쇄도 18" |
| `use_dripper` | string | `dripper` | "드립퍼 Hario" |
| `agtron_number` | uint8 | (mock 없음) | "Agtron : 87" |
| `favorite_flag` | uint8 | `favorite` (bool) | ★ 표시 |
| `brew_stage_total_count` | uint8 | `stageCount` | Stage 표 행 수 |
| `recipe_description` | string | `notes` | NOTE 영역 |
| `time_stamp` | string | `createdAt` / `updatedAt` (ISO) | (히든) |
| `drip_count` | uint32 | (mock 없음) | (히든, 통계용) |
| `bean_usage` | uint64 | (mock 없음) | (히든) |
| **bloom 영역** | | `bloom` 객체 | "뜸들이기" 행 |
| `bloom_water_volume` | uint16 | `bloom.waterVolume` | "양 40 ml" |
| `bloom_waittime` | uint16 | `bloom.waitTime` | "휴지 30 s" |
| `bloom_temperature` | uint8 | (mock 없음 — `waterTemp` 공유?) | (확인) |
| `bloom_flowrate` | float | `bloom.flowRate` | "유속 3.5" |
| `bloom_nozzle_speed` | uint8 | `bloom.nozzleSpeed` | (UI 미표시) |
| `bloom_pour_rate` | uint8 | `bloom.pourRate` | (UI 미표시) |
| **stage 1st~10th 영역** | | `stages` 배열 | 추출단계 행 |
| `brew_index` | uint8 | (배열 인덱스) | "1st / 2nd / ..." |
| `brew_ratio` | uint8 | (계산 필요 — total_water 대비 %) | "비율 31%" |
| `brew_waittime` | uint16 | `stages[].time` | "휴지 25 s" |
| `brew_flowrate` | float | `stages[].flowRate` | "유속 4.0 ★" |
| `nozzle_speed` | uint8 | `stages[].nozzleSpeed` | (UI 미표시) |
| `pour_rate` | uint8 | `stages[].pourRate` | "물붓기 70" |

**중요 차이:**
- prototype mock의 `stages` 배열은 `type: "bloom" | "pause" | "pour"` 혼합. spec은 bloom 별도 + brew stages 1st~10th 분리. **C++ 직렬화 시 분리 필요.**
- spec `extraction_ratio` 가 float 인데 prototype은 `"1:16"` 문자열. 응답 시 `extractionRatio: 16.0` 별도 필드로 제공 권장.
- `bloom_temperature`, `agtron_number`, `pour_range_*`, `drip_count`, `bean_usage` — **mock에 없음**. UI는 빈 값으로 처리하지만 spec 정의대로 채워야 표시 가능.

### 3.2 common_env.dat ↔ `/api/general-config`

| .dat 필드 | mock 필드 | UI |
|---|---|---|
| `registration_check` | `system-config.json: configured` | 부팅 시 /setup vs /connect 분기 |
| `model_no` | `system-config.json: modelNumber` | 정보 페이지 |
| `serial_no` | `system-config.json: serialNumber` | 정보 페이지 |
| `device_name` | `system-config.json: deviceName` ("NT-iRHEA 1호기") | topbar `brand-sub` |
| `owner_name` | (mock 없음) | (히든) |
| `store_name` | `connection.json: store` ("CafénobleT") | 연결 설정 |
| `time_zone` | `system-config.json: timezone` ("아시아 / 서울") | /setup 타임존 |
| `operating_time` | (mock 없음) | (히든) |
| `recipe_last_index` | (mock 없음) | 새 레시피 ID 발급 |
| `drip_count_spoutN` | `spouts.json[N].extractCount` | 메인 화면 "누적 1,247회" |
| `ext_sol_count_spoutN` | (mock 없음) | (히든) |
| `language` | `general-config.json: language` | KO/EN 토글 |
| `use_alarm` | `general-config.json: alarm` (bool) | 알람 활성화 토글 |
| (UI-only) | `general-config.json: unit` ("percent"/"gram") | 추출 단위 |
| (UI-only) | `general-config.json: dripper` | 기본 드립퍼 |
| (UI-only) | `general-config.json: theme` | UI 테마 |

**UI-only 필드** (unit, dripper, theme) — 어디 저장할지 spec 미정의. 권장: common_env.dat 확장 필드로 추가.

### 3.3 sys_info.dat ↔ `/api/system-config`, `/api/boiler-info`

| .dat 필드 | mock 필드 |
|---|---|
| `mcp_version` | `system-info.json: appVersion` (예 3.00) |
| `whp_version` | `boiler-info.json: firmwareVersion` (예 3.10) |
| `min`, `max` (각 항목) | (제한값 — 현재 UI 미사용) |

**파일 정의 xlsx의 `dev_version_info`** 는 보드 버전 정보. mock의 `system-info.json` 과 `boiler-info.json` 으로 분리해 응답.

### 3.4 default_pour_range_spiral.dat ↔ `/api/pour-range`

| .dat 필드 | mock |
|---|---|
| (cup 1) `radius` | `pour-range.json: [{cup: 1, radius: 30}]` |
| (cup 2) `radius` | `[{cup: 2, radius: 40}]` |
| (cup 3) `radius` | `[{cup: 3, radius: 45}]` |
| (cup 4) `radius` | `[{cup: 4, radius: 55}]` |

### 3.5 calibration_spoutN.dat ↔ `/api/pump-calibration`

| .dat 필드 | mock |
|---|---|
| 5단계 base/calibrated 유속 | `pump-calibration.json: [{base: 1.0, calibrated: 1.1}, ...×5]` |

### 3.6 default_drip_env.dat ↔ `/api/water-rinse`

| .dat 필드 | mock |
|---|---|
| `drain_flow_rate` (워터 속도) | `water-rinse.json: water.speed` (6 ml/s) |
| `drain_water_volume` (워터 온수량) | `water.amount` (50 ml) |
| (워터 온도) | `water.temp` (85°) |
| `rinse_flow_rate` | `rinse.speed` |
| `rinse_water_volume` | `rinse.amount` |
| (린스 온도) | `rinse.temp` |

### 3.7 default_brew_spiral.dat

UI 미사용 (Spiral 패턴 기본값 보유 파일). 레시피 추가 시 기본값으로 사용. **현재 mock 없음.**

### 3.8 usage_info.dat ↔ `/api/usage-info`, `/api/usage-stats`

| .dat 필드 | mock |
|---|---|
| 총 추출횟수 | `usage-info.json: total` |
| 오늘 추출횟수 | `usage-info.json: today` |
| 추출구별 누적 | (위 common_env.drip_count_spoutN 참조) |

### 3.9 error_YYYYMMDD.log ↔ `/api/error-log`

| 로그 필드 (정의 xlsx) | mock |
|---|---|
| `error_item` (에러 대분류) | `error-log.json: items[].source` ("WHP", "MDP") |
| `error_code` | `code` ("WHP-ERR-11") |
| `error_message` (제목) | `title` ("BOILER SHUTDOWN EVENT") |
| `error_detail` | `detail` |
| 발생일시 | `timestamp` |

---

## 4. SSE 이벤트 ↔ UI 컴포넌트 매핑

브라우저는 `/api/events` SSE에 연결. C++ 웹서버가 `ipc_evt.sock` 받은 EVT를 SSE 프레임으로 변환.

### 4.1 0x21XX 브루잉 이벤트

| spec cmd | SSE event 이름 | data body | UI 반응 |
|---|---|---|---|
| 0x2101 BREW_STARTED | `brew_started` | `{brew_job_id, state, source, recipe_id, spout}` | `/main` 추출구 카드 상태색 빨강 + "BREWING" + 도넛 0% |
| 0x2102 BREW_PROGRESS | `brew_progress` | `{brew_job_id, state, progress, current_stage, remain_sec}` | 도넛 % 갱신, Stage 표 현재 단계 강조, ETA 갱신 |
| 0x2103 BREW_COMPLETED | `brew_completed` | `{brew_job_id, yield_ml, avg_temp}` | `/brewing/complete` 모달 → 5초 후 `/main` |
| 0x2104 BREW_FAILED | `brew_failed` | `{brew_job_id, reason}` | 빨강 토스트 + 추출구 카드 IDLE 복귀 |
| 0x2105 BREW_REJECTED | `brew_rejected` | `{reason: "machine_busy" 등}` | 황색 모달 "추출 시작 거부" |

**flag 처리:**
- `0x00000001 IMPORTANT` — 알림 UI 표시 필수
- `0x00000002 POPUP` — 모달로 띄움 (vs 토스트)
- `0x00000003 BLOCKING` — 다른 입력 막음 (예: 종료 진행)
- `0x00000004 ACK_REQ` — 사용자 확인 받아 `0x1201 ACK_ALARM` 회신

### 4.2 0x22XX 시스템 이벤트

| spec cmd | SSE event 이름 | data body | UI 반응 |
|---|---|---|---|
| 0x2201 ALARM_RAISED | `alarm_raised` | `{alarm_id, code, level, source, message, brew_block}` | 빨강 모달 (popup flag) + topbar 빨강 점멸 |
| 0x2202 ALARM_CLEARED | `alarm_cleared` | `{alarm_id, code, source, message}` | 토스트 "해제됨" + 알람 리스트에서 제거 |
| 0x2203 WARNING_RAISED | `warning_raised` | 동일 | 노랑 토스트 + 알람 리스트에 warning level |
| 0x2204 WARNING_CLEARED | `warning_cleared` | 동일 | 리스트에서 제거 |
| 0x2205 SYSTEM_NOTICE | `system_notice` | `{message}` | 정보 토스트 (4초) |

### 4.3 0x23XX 펌웨어 이벤트

| spec cmd | SSE event 이름 | data body | UI 반응 |
|---|---|---|---|
| 0x2301 FW_FILE_DETECTED | `fw_file_detected` | `{file_name, source: "usb"}` | 펌웨어 페이지에 새 파일 표시 |
| 0x2302 FW_FILE_IMPORTED | `fw_file_imported` | `{file_name}` | "USB 가져오기 완료" |
| 0x2303 FW_FILE_REMOTE_RX | `fw_file_remote_rx` | `{file_name, source: "aws"}` | "원격 다운로드 완료" |
| 0x2304 FW_VALIDATING | `fw_validating` | `{fw_job_id, target_board, state, message}` | "검증 중" + spinner |
| 0x2305 FW_VALID_OK | `fw_valid_ok` | `{fw_job_id}` | "검증 성공" + 업그레이드 버튼 활성화 |
| 0x2306 FW_VALID_FAIL | `fw_valid_fail` | `{fw_job_id, reason}` | 빨강 토스트 |
| 0x2307 FW_UPDATE_STARTED | `fw_update_started` | `{fw_job_id, target_board}` | 진행률 0% 표시 |
| 0x2308 FW_UPDATE_PROGRESS | `fw_update_progress` | `{fw_job_id, state, progress, acked_blocks, total_blocks}` | 진행률 % 갱신 |
| 0x2309 FW_UPDATE_STAGE | `fw_update_stage` | `{fw_job_id, stage}` | "다운로드 → 검증 → 적용" 단계 |
| 0x230A FW_UPDATE_SUCCESS | `fw_update_success` | `{fw_job_id, target_board}` | 토스트 + 100% 표시 + "완료" 모달 |
| 0x230B FW_UPDATE_FAIL | `fw_update_fail` | `{fw_job_id, reason, message}` | 빨강 모달 "실패" |
| 0x230C FW_UPDATE_CANCELLED | `fw_update_cancelled` | `{fw_job_id}` | "취소됨" + 0% 복귀 |

---

## 5. 시안 누락 / 구현 시 결정 필요 항목

### 5.1 IPC V0.1에 추가 필요 (V0.2 협의 사항)

```
0x14XX 레시피 CRUD
  0x1401 SAVE_RECIPE         REQ {recipe object} → RSP {id}
  0x1402 DELETE_RECIPE       REQ {id} → RSP {ok}
  0x1403 SET_FAVORITE        REQ [{spoutId, slotA, slotB}] → RSP {ok}

0x15XX 설정 변경
  0x1501 SET_COMMON_ENV      REQ {partial common_env} → RSP {ok}
  0x1502 SET_BOILER          REQ {tempSet} → RSP {ok}
  0x1503 SET_POUR_RANGE      REQ {items: [{cup, radius}]} → RSP {ok}
  0x1504 SET_PUMP_CAL        REQ {spoutId, items} → RSP {ok}
  0x1505 SET_WATER_RINSE     REQ {water, rinse} → RSP {ok}

0x16XX 시스템 작업
  0x1601 FACTORY_RESET       REQ {categories: []} → RSP {ok} + 0x2205 SYSTEM_NOTICE
  0x1602 BACKUP_USB          REQ {items: []} → RSP {ok}
  0x1603 RESTORE_USB         REQ {items: []} → RSP {ok}
  0x1604 SET_INITIAL_CONFIG  REQ {serial, model, timezone} → RSP {ok}
```

**액션:** 김현상 작성자께 V0.2 제안서 전달 → 코드 확정.

### 5.2 spec 모호한 부분 — C++ 팀 결정 필요

1. **12 레시피 분포** — recipe_spoutN.dat 각각에 12개 다 들어가는지, 추출구별로 다른 12개인지?
2. **레시피 stage 표현** — spec은 bloom 별도 + brew 1st~10th 분리. mock은 통합 배열 + pause/pour 구분. 어느 쪽을 정규 표현으로?
3. **admin 인증 위치** — webserver 단독 vs daemon에 위임? 권장: webserver + PAM
4. **세션 모델** — 쿠키 vs JWT vs 단순 IP 기반?
5. **파일 락 정책** — D4 결정 따라 atomic rename + inotify, 또는 데몬 단독 소유 가정?
6. **systemd 의존성** — daemon `After=`/`Requires=` 관계, restart policy?
7. **이벤트 ring buffer 크기** — 데몬 재시작 시 최근 N개 이벤트 보존?
8. **시퀀스(`seq`) 충돌** — 다중 클라이언트 연결 시 분리?
9. **HTTP 타임아웃 vs IPC seq 타임아웃 매핑** — 추출 명령 시 60초 이상도 가능
10. **로그 회전** — 일별 파일 → 월별 머지는 누가 어떻게? cron? daemon?

### 5.3 보안

- **EventSource는 Authorization 헤더 못 보냄** — admin 세션을 쿠키로 처리해야 SSE도 인증됨
- **HTTPS 인증서** — kiosk 폐쇄망이면 self-signed + 브라우저 미리 trust, 외부 노출 시 정식 인증서
- **CSP** — Apache에서 `Content-Security-Policy: default-src 'self'` 권장
- **localStorage 보존** — Yocto kiosk 브라우저 설정에 따라 부팅 시 wipe 가능. 사용자 설정은 모두 백엔드(.dat) 저장 권장 — prototype의 IRState는 임시

### 5.4 dev 환경

prototype 팀의 dev 환경은 **현재 Express(폐기 예정)** + mock JSON. C++ 백엔드 도입 후:
- **옵션 1**: C++ 백엔드를 native dev box에서도 실행 (cross-compile 없이 x86 빌드)
- **옵션 2**: prototype 팀은 Express 유지, **백엔드 API stub 모드** 추가 (Apache + 정적 JSON, 현재 GitHub Pages 동일)

권장: 옵션 2 — prototype 팀과 C++ 팀 작업 분리. prototype은 GitHub Pages mock 으로 디자인·UX 반복, 통합 테스트는 STM32MP1 보드에서 일별 빌드.

---

## 6. 마이그레이션 단계 제안 (C++ 팀 참고)

### Phase 1 — 인프라 (1-2주)

- myapp_ipc 스켈레톤 fork → `meta-myir-st/recipes-irhea/myapp-daemon` / `myapp-webserver` 두 recipe 작성
- 헤더 `0xDEADBEEF` → spec V0.1 "CDM1" 40B 교체
- 두 소켓 분리 (`ipc_cmd.sock` + `ipc_evt.sock`)
- 0x1001 GET_STATUS 만 구현 → curl로 검증
- systemd unit 파일 (daemon → webserver 순)
- Apache mod_proxy `/api/` → 8080 설정

### Phase 2 — 라이브 모니터링 (2-3주)

- 0x1001 GET_STATUS 풍부화 (5 추출구 상태)
- 0x1002 GET_CURRENT_BREW
- 0x1003 GET_ACTIVE_ALARMS
- SSE `/api/events` 구현 + 0x2201 ALARM_RAISED relay
- prototype의 `/main` 페이지를 1초 polling → SSE 전환

### Phase 3 — 명령 실행 (2-3주)

- 0x1101 START_BREW + 0x2101/0x2102/0x2103 이벤트
- 0x1102 STOP_BREW
- 0x1201 ACK_ALARM + 부저/경고 처리

### Phase 4 — 파일 데이터 (2-3주)

- recipe_spoutN.dat reader/writer
- common_env.dat reader/writer
- 0x1401 SAVE_RECIPE / 0x1402 DELETE_RECIPE / 0x1403 SET_FAVORITE
- 0x1501-0x1505 설정 변경

### Phase 5 — 펌웨어·시스템 (2-3주)

- 0x13XX 펌웨어 cmd + 0x23XX 이벤트
- 0x1601 FACTORY_RESET / 0x1602 BACKUP_USB / 0x1603 RESTORE_USB
- 로그 파일 (error / usage) scan API

### Phase 6 — 보드 통신 (별도 spec)

- CAN bus 드라이버
- MCP / WHP / MDP 보드별 프로토콜
- 본 문서 범위 외

---

## 7. 빠른 참조 — 코드/문서 위치

| 자료 | 경로 |
|---|---|
| 본 핸드오프 문서 | `irhea-design-2/HANDOFF.md` (이 파일) |
| Prototype 코드 | https://github.com/hongmuk/irhea-design-2 |
| 라이브 prototype | https://hongmuk.github.io/irhea-design-2/ |
| Mock JSON 데이터 | `irhea-design-2/mock/*.json` |
| EJS 페이지 (UI 진실 소스) | `irhea-design-2/views/pages/` |
| 디자인 시안 시리즈 | `nobletree/designs/02-*.html` (Cinema Gold) |
| IPC 정의 V0.1 | `iRHEA-LIGHT IPC 정의_260324.xlsx` |
| 파일 정의 | `iRHEA-LIGHT 파일 정의.xlsx` |
| IPC 메시지 예제 | `IPC메시지 예제.txt` |
| myapp_ipc 스켈레톤 | `myapp_ipc.zip` |
| STM32MP1 BSP | `STM32MP1_hmsoft.zip` → `STM32MP1/MYiR/layers/meta-myir-st/recipes-irhea/` |

---

## 8. 연락처 / 후속 액션

| 항목 | 담당 | 액션 |
|---|---|---|
| spec V0.2 (0x14/15/16XX 추가) | 김현상 | 본 문서 §5.1 검토 |
| prototype UI 변경 (실 백엔드 호출로 전환) | UI 팀 | Phase 2-3 진행 시 협의 |
| CAN bus spec | 보드 팀 | 본 문서 범위 외 — 별도 spec |
| Yocto BSP 통합 | C++ 팀 | Phase 1 시작 |
| STM32MP1 BSP에 새 docs/ 반영 | C++ 팀 또는 UI 팀 | `irhea-light_1.0.bb` 의 docs/ 교체 |

---

## 7. UI 디자인 정책 (v1.4 — 2026-05-24 반응형 전환)

**변경 사항:** 이전 회의 v1.3 에서 정한 `1024×768 fixed + fit-scale` 패턴을
**진짜 반응형(media query 기반)** 으로 전환. 다양한 태블릿/노트북 디바이스
지원. C++ 백엔드 영향 0 (UI 만의 변경, API/IPC 명세 그대로).

### 7.1 Viewport 정책

```
이전: .viewport { width: 1024px; height: 768px }
      + body { transform: scale(min(w/1024, h/768)) }
신규: .viewport { width: 100%; height: 100vh; max-width: 1600px }
      + media query 기반 grid columns 재배치
```

- **min**: 800×600 — 작은 노트북에서도 fit (stations 2-col)
- **baseline**: 1024×768 — 10" 4:3 키오스크 태블릿
- **typical**: 1280×800 (안드로이드 10.1) ~ 1920×1200 (FHD 10")
- **max**: 1600px wide (그 이상은 양옆 흰 여백 — 너무 늘어짐 방지)

### 7.2 Breakpoint

| 화면 폭 | stations | 매뉴얼 큐 | favorites grid | settings cards | KPI |
|---|---|---|---|---|---|
| ≥ 1100px | 5-col | 5-col | 5×6 | 3×2 | 4-col |
| 900~1099 | 5-col | 5-col | 3×6 | 2×3 | 4-col |
| 768~899  | 3-col | 3-col | 3×6 | 2×3 | 4-col |
| < 768    | 2-col | 2-col | 1×30 | 1×6 | 2×2 |

### 7.3 폰트/터치 토큰

- `--fs-xs ~ --fs-2xl`: `clamp()` 기반, 베이스라인 ≥11px 보장
- `--tap-min: 44px`: 모든 인터랙티브 버튼 최소 크기 (WCAG 2.5.5)
- 작은 폰트 (8.5~10.5px) 84곳 → `clamp(11px, ...)` 일괄 보정 완료

### 7.4 C++ 팀 영향

**없음.** UI 만의 변경으로 `/api/*` 엔드포인트, IPC cmd, `.dat` 파일 포맷
모두 동일. 백엔드 구현 시 본 문서 §1~§6 그대로 사용.

---

**문서 버전:** 1.4 (반응형 전환)
**최종 수정:** 2026-05-24
