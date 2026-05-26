/*
 * IRError — 회의 피드백 v1.2: 통신 끊김 / 응답 없음 / 장비 오류 시 팝업
 *
 * 사용:
 *   IRError.commsLost()                — "장비와 통신할 수 없습니다" 모달
 *   IRError.deviceTimeout()            — "장비 응답이 없습니다" 모달
 *   IRError.saveFailed(msg)            — 저장 실패 모달
 *   IRError.validation(field, range)   — min/max 초과 안내
 *   IRError.code('ERR-1234', 'msg')    — 코드 + 메시지 (회의: 사용자는 에러 코드만 보면 됨)
 *
 * 자동 catch:
 *   IRFetch(url, opts)  — fetch wrapper. 10초 timeout, 5xx/통신실패 시 자동 모달
 */
(function () {
  function modalConfirm(title, body, bodyClass, ok, onOk) {
    if (!window.IRModal) {
      console.error('[IRError]', title, body);
      return;
    }
    window.IRModal.info({
      title: title,
      body: body,
      bodyClass: bodyClass || 'is-error',
      buttons: [{ label: ok || '확인', primary: true, value: 'ok' }],
      onClose: function () { if (typeof onOk === 'function') onOk(); }
    });
  }

  var IRError = {
    commsLost: function (onRetry) {
      if (!window.IRModal) return;
      window.IRModal.confirm({
        title: '통신 끊김',
        body: '장비와의 통신이 끊어졌습니다.<br>전원과 네트워크 연결을 확인해 주세요.',
        bodyClass: 'is-error',
        ok: '재시도',
        onOk: onRetry || function () { location.reload(); }
      });
    },
    deviceTimeout: function (onRetry) {
      if (!window.IRModal) return;
      window.IRModal.confirm({
        title: '응답 없음',
        body: '장비가 응답하지 않습니다.<br>잠시 후 다시 시도해 주세요.',
        bodyClass: 'is-error',
        ok: '재시도',
        onOk: onRetry || function () {}
      });
    },
    saveFailed: function (detail) {
      modalConfirm('저장 실패', '설정 저장에 실패했습니다.' + (detail ? '<br>' + detail : ''));
    },
    validation: function (field, range) {
      modalConfirm('입력 값 초과', (field || '값') + '이(가) 허용 범위를 벗어났습니다.' + (range ? '<br>허용: ' + range : ''));
    },
    code: function (code, message) {
      // 회의 피드백: 사용자는 에러 코드 + 짧은 메시지만 보면 됨. 상세는 엔지니어 모드.
      modalConfirm('오류 발생', '<b>' + code + '</b>' + (message ? '<br><br>' + message : ''));
    }
  };

  // Fetch wrapper — 통신 실패 / 타임아웃 자동 처리
  function IRFetch(url, opts) {
    opts = opts || {};
    var timeoutMs = opts.timeout || 10000;
    var silent = opts.silent === true;
    delete opts.timeout;
    delete opts.silent;

    var controller = (typeof AbortController !== 'undefined') ? new AbortController() : null;
    if (controller) opts.signal = controller.signal;
    var to = setTimeout(function () {
      if (controller) controller.abort();
    }, timeoutMs);

    return fetch(url, opts).then(function (res) {
      clearTimeout(to);
      if (!res.ok) {
        if (!silent) {
          if (res.status >= 500) IRError.code('ERR-' + res.status, '서버 내부 오류 (' + res.statusText + ')');
          else if (res.status === 0 || res.status === 408) IRError.deviceTimeout();
        }
        var err = new Error('HTTP ' + res.status);
        err.status = res.status;
        throw err;
      }
      return res;
    }).catch(function (err) {
      clearTimeout(to);
      if (silent) throw err;
      if (err.name === 'AbortError') {
        IRError.deviceTimeout();
      } else if (err.status == null) {
        // 네트워크 자체 실패 (fetch reject)
        IRError.commsLost();
      }
      throw err;
    });
  }

  window.IRError = IRError;
  window.IRFetch = IRFetch;
})();
