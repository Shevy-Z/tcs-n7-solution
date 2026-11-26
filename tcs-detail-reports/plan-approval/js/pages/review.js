(function () {
  'use strict';

  window.Pages = window.Pages || {};

  var activeTab = 'pending';
  var filtersCollapsed = false;
  var selectedRows = {};
  var SYSTEM_JUDGEMENTS = ['待定', '有效', '无效'];
  var DEVICE_RISK_STATUSES = ['正常', '异常'];

  var FIELD_KEYS = {
    brand: ['brand', 'brandName'],
    approvalNo: ['approvalNo', 'surveyApprovalNo', 'surveyNo'],
    approvalName: ['approvalName', 'planName'],
    pushId: ['pushId', 'approvalPushId'],
    questionnaireId: ['questionnaireId'],
    commentStatus: ['commentStatus', 'answerStatus'],
    commentTime: ['commentTime', 'answeredAt', 'completedAt'],
    vin: ['vinMasked', 'vin'],
    mis: ['mis', 'MIS'],
    storeName: ['storeName', 'dealerName'],
    storeCode: ['storeCode', 'dealerCode'],
    province: ['province'],
    city: ['city'],
    region: ['region'],
    district: ['district'],
    duration: ['durationSeconds', 'answerDurationSeconds', 'duration'],
    durationPercentile: ['durationPercentile', 'durationPercent', 'percentile'],
    nps: ['npsMatch', 'npsQualified'],
    nss: ['nssMatch', 'nssQualified'],
    timeJudgement: ['timeJudgement', 'durationJudgement', 'durationJudge'],
    messageCount: ['messageCount', 'commentCount'],
    avgMessageLength: ['avgMessageLength', 'avgCommentLength'],
    systemJudgement: ['systemJudgement', 'systemPreliminaryJudgement'],
    deviceId: ['deviceIdMasked', 'deviceId'],
    riskStatus: ['riskStatus', 'deviceRiskStatus'],
    deviceRiskId: ['deviceRiskId', 'riskRecordId'],
    reviewedAt: ['reviewedAt', 'manualReviewedAt'],
    reviewerAccountId: ['reviewerAccountId', 'reviewAccountId', 'accountId'],
    reviewer: ['reviewer', 'reviewerName'],
    invalidRemark: ['invalidRemark', 'invalidReason'],
    remark: ['remark', 'reviewRemark']
  };

  function blankFilters() {
    return {
      approvalNo: '', brand: 'all', commentStatus: 'all', vin: '', mis: '',
      store: '', province: 'all', city: 'all', region: 'all', district: 'all',
      nps: 'all', nss: 'all', timeJudgement: 'all', systemJudgement: 'all',
      commentDateStart: '', commentDateEnd: '', durationMin: '', durationMax: '',
      messageMin: '', messageMax: '', averageMin: '', averageMax: '',
      manualStatus: 'all', reviewDateStart: '', reviewDateEnd: '',
      riskStatus: 'all'
    };
  }

  var filterState = { pending: blankFilters(), reviewed: blankFilters() };

  function escape(value) {
    return window.escapeHtml(value === undefined || value === null ? '' : value);
  }

  function clone(record) {
    var copy = {};
    Object.keys(record || {}).forEach(function (key) { copy[key] = record[key]; });
    return copy;
  }

  function sourceRecords() {
    if (!window.TCSData || !Array.isArray(window.TCSData.reviewRecords)) return [];
    return window.TCSData.reviewRecords.map(function (record, index) {
      var copy = clone(record);
      copy.id = copy.id || 'REVIEW-' + (index + 1);
      return copy;
    });
  }

  function decisionMap() {
    if (!window.TCSData) window.TCSData = {};
    if (!window.TCSData.state) window.TCSData.state = {};
    if (!window.TCSData.state.reviewDecisions) window.TCSData.state.reviewDecisions = {};
    return window.TCSData.state.reviewDecisions;
  }

  function records() {
    var decisions = decisionMap();
    return sourceRecords().map(function (record) {
      var merged = clone(record);
      Object.keys(decisions[record.id] || {}).forEach(function (key) { merged[key] = decisions[record.id][key]; });
      return merged;
    });
  }

  function rawField(record, name, fallback) {
    var keys = FIELD_KEYS[name] || [name];
    var i;
    for (i = 0; i < keys.length; i += 1) {
      if (record[keys[i]] !== undefined && record[keys[i]] !== null && record[keys[i]] !== '') return record[keys[i]];
    }
    return fallback === undefined ? '' : fallback;
  }

  function completeRiskIdentifier(value) {
    return typeof value === 'string' && value.trim() !== '' && value.trim() !== '—';
  }

  function riskIdentity(record) {
    // 匹配使用完整的演示标识，脱敏展示值不能替代 VIN 或设备 ID 判等。
    return {
      answerId: record.answerId || record.id || '',
      vin: record.vin || '',
      questionnaireId: rawField(record, 'questionnaireId'),
      mis: rawField(record, 'mis'),
      deviceId: record.deviceId || '',
      commentTime: rawField(record, 'commentTime')
    };
  }

  function riskHistoryContext() {
    var history = window.TCSData && window.TCSData.reviewRiskHistory;
    return {
      queryStatus: history && Array.isArray(history.records) ? history.queryStatus : 'unavailable',
      records: history && Array.isArray(history.records) ? history.records.concat(sourceRecords()) : [],
      source: history && history.source
    };
  }

  function riskWindowRelation(previousTime, currentTime) {
    var elapsedDays = (currentTime - previousTime) / 86400000;
    if (elapsedDays < 0) return 'future';
    if (elapsedDays === 0) return 'same-time';
    // 一年的生产日历端点尚未定：只判定远离边界的完整 Mock。
    // 365～366 天边界带留待核验，不把此缓冲带定义为正式风控窗口。
    if (elapsedDays < 365) return 'inside';
    if (elapsedDays > 366) return 'outside';
    return 'boundary';
  }

  function evaluateDeviceRisk(record, suppliedContext) {
    var context = suppliedContext || riskHistoryContext();
    var current = riskIdentity(record);
    var currentTime = evidenceTimestamp(current.commentTime);
    var issues = [];
    var evidence = [];
    var candidates = [];
    var devices = Object.create(null);
    var seenAnswers = Object.create(null);
    var conflictingAnswers = Object.create(null);
    var historyAvailable = Array.isArray(context.records);
    var history = historyAvailable ? context.records : [];
    var queryComplete = historyAvailable && context.queryStatus === 'complete' && record.riskHistoryStatus !== 'failed';
    var complete = ['answerId', 'vin', 'questionnaireId', 'mis', 'deviceId'].every(function (key) {
      return completeRiskIdentifier(current[key]);
    });
    if (!complete || !Number.isFinite(currentTime)) issues.push('本次必要标识或点评时间待核验');
    if (!queryComplete) issues.push('历史查询未完成');
    if (complete) devices[current.deviceId] = true;

    if (complete && Number.isFinite(currentTime)) history.forEach(function (previous) {
      if (!previous || typeof previous !== 'object') return;
      var prior = riskIdentity(previous);
      if (prior.answerId === current.answerId) return;
      // 已知 VIN 不同即可排除；不按同设备多 VIN 的历史规则触发。
      if (completeRiskIdentifier(prior.vin) && prior.vin !== current.vin) return;
      var reason = '';
      var outcome = 'excluded';
      if (completeRiskIdentifier(prior.questionnaireId) && prior.questionnaireId !== current.questionnaireId) reason = '问卷不同';
      else if (completeRiskIdentifier(prior.mis) && prior.mis !== current.mis) reason = 'MIS 不同';
      else if (!['answerId', 'vin', 'questionnaireId', 'mis', 'deviceId'].every(function (key) { return completeRiskIdentifier(prior[key]); })) {
        reason = '历史必要标识待核验'; outcome = 'unverified';
      } else {
        var previousTime = evidenceTimestamp(prior.commentTime);
        var relation = Number.isFinite(previousTime) ? riskWindowRelation(previousTime, currentTime) : 'invalid-time';
        if (relation === 'future') reason = '晚于本次提交';
        else if (relation === 'outside') reason = '早于一年窗口';
        else if (relation === 'same-time' || relation === 'boundary' || relation === 'invalid-time') {
          reason = relation === 'boundary' ? '一年精确边界待核验' : relation === 'same-time' ? '同一时刻先后待核验' : '历史点评时间待核验';
          outcome = 'unverified';
        } else if (previous.historyState === 'withdrawn' || previous.historyState === 'invalid' || previous.withdrawn === true || manualStatus(previous) === '无效') {
          reason = '无效或撤回答卷参与规则待核验'; outcome = 'unverified';
        } else if (prior.deviceId === current.deviceId) reason = '设备相同';
        else {
          reason = '同 VIN、问卷、MIS，一年内不同设备';
          outcome = 'matched';
        }
      }
      if (completeRiskIdentifier(prior.answerId)) {
        var fingerprint = JSON.stringify(prior);
        if (seenAnswers[prior.answerId] === fingerprint) return;
        if (seenAnswers[prior.answerId]) {
          reason = '同一答卷历史数据冲突'; outcome = 'unverified'; conflictingAnswers[prior.answerId] = true;
        }
        seenAnswers[prior.answerId] = fingerprint;
      }
      candidates.push({ record: previous, identity: prior, outcome: outcome, reason: reason });
      if (outcome === 'matched') {
        devices[prior.deviceId] = true;
        evidence.push(previous);
      }
      if (outcome === 'unverified') issues.push(reason);
    });

    // 冲突副本不作为确定证据；单次提交多个重复副本也不增加设备种数。
    evidence = evidence.filter(function (previous) { return !conflictingAnswers[riskIdentity(previous).answerId]; });
    devices = Object.create(null);
    if (complete) devices[current.deviceId] = true;
    evidence.forEach(function (previous) { devices[riskIdentity(previous).deviceId] = true; });
    candidates.forEach(function (candidate) {
      if (conflictingAnswers[candidate.identity.answerId]) {
        candidate.outcome = 'unverified';
        candidate.reason = '同一答卷历史数据冲突';
      }
    });
    var status = complete && Number.isFinite(currentTime) && queryComplete && evidence.length ? '异常' :
      complete && Number.isFinite(currentTime) && queryComplete && !issues.length ? '正常' : '';
    return {
      status: status, checkStatus: status ? 'complete' : 'unverified', current: current,
      evidence: evidence, candidates: candidates, deviceCount: Object.keys(devices).length,
      issues: issues.filter(function (issue, index, all) { return all.indexOf(issue) === index; }),
      source: context.source || '历史来源待核验'
    };
  }

  function effectiveDeviceRisk(record) {
    return evaluateDeviceRisk(record).status;
  }

  function effectiveSystemJudgement(record, fallback) {
    var result = evaluateDeviceRisk(record);
    var original = rawField(record, 'systemJudgement', fallback);
    if (result.status === '异常') return '无效';
    // 未决输入不伪装成已通过；“待定”仅为原型未形成完整结论的展示，不制定失败处置策略。
    if (result.checkStatus === 'unverified') return original === '无效' ? '无效' : '待定';
    return original;
  }

  function field(record, name, fallback) {
    if (name === 'systemJudgement' || name === 'systemPreliminaryJudgement') return effectiveSystemJudgement(record, fallback);
    if (name === 'riskStatus' || name === 'deviceRiskStatus') return effectiveDeviceRisk(record, fallback);
    if (name === 'store') {
      var storeName = rawField(record, 'storeName');
      var storeCode = rawField(record, 'storeCode');
      if (!storeName && !storeCode) return fallback === undefined ? '' : fallback;
      return (storeName || '—') + '（编码：' + (storeCode || '—') + '）';
    }
    return rawField(record, name, fallback);
  }

  function manualStatus(record) {
    var value = String(record.manualReviewStatus || record.action || record.decision || record.reviewStatus || '');
    if (value === '确认有效' || value === 'valid' || value === '有效') return '有效';
    if (value === '确认无效' || value === 'invalid' || value === '无效') return '无效';
    if (value === 'reviewed' || value === 'done' || value === '已审核') return '已审核';
    return value || '—';
  }

  function isReviewed(record) {
    if (field(record, 'reviewedAt')) return true;
    var status = String(record.manualReviewStatus || record.action || record.decision || record.reviewStatus || '').toLowerCase();
    if (!status || status === '待复核' || status === '待审核' || status === '未审核' || status === 'pending' || status === 'unaudited') return false;
    return /有效|无效|已审核|继续观察|转人工复核|reviewed|done|valid|invalid/.test(status);
  }

  function currentFilters() { return filterState[activeTab]; }

  function lower(value) { return String(value === undefined || value === null ? '' : value).toLowerCase(); }

  function includes(recordValue, keyword) { return !keyword || lower(recordValue).indexOf(lower(keyword)) !== -1; }

  function exact(recordValue, selected) { return selected === 'all' || String(recordValue || '') === String(selected); }

  function inNumberRange(value, minimum, maximum) {
    if (minimum === '' && maximum === '') return true;
    var number = Number(value);
    if (!Number.isFinite(number)) return false;
    if (minimum !== '' && number < Number(minimum)) return false;
    if (maximum !== '' && number > Number(maximum)) return false;
    return true;
  }

  function dateOnly(value) {
    var match = String(value || '').match(/^\d{4}-\d{2}-\d{2}/);
    return match ? match[0] : '';
  }

  function inDateRange(value, start, end) {
    if (!start && !end) return true;
    var date = dateOnly(value);
    if (!date) return false;
    if (start && date < start) return false;
    if (end && date > end) return false;
    return true;
  }

  function recordMatches(record) {
    var filter = currentFilters();
    if (activeTab === 'pending' && isReviewed(record)) return false;
    if (activeTab === 'reviewed' && !isReviewed(record)) return false;
    if (!includes(field(record, 'approvalNo'), filter.approvalNo)) return false;
    if (!exact(field(record, 'brand'), filter.brand)) return false;
    if (!exact(field(record, 'commentStatus'), filter.commentStatus)) return false;
    if (!includes(field(record, 'vin'), filter.vin)) return false;
    if (!includes(field(record, 'mis'), filter.mis)) return false;
    var storeKeyword = String(filter.store || '').trim();
    if (!includes(field(record, 'storeName'), storeKeyword) && !includes(field(record, 'storeCode'), storeKeyword)) return false;
    if (!exact(field(record, 'province'), filter.province)) return false;
    if (!exact(field(record, 'city'), filter.city)) return false;
    if (!exact(field(record, 'region'), filter.region)) return false;
    if (!exact(field(record, 'district'), filter.district)) return false;
    if (!exact(field(record, 'nps'), filter.nps)) return false;
    if (!exact(field(record, 'nss'), filter.nss)) return false;
    if (!exact(field(record, 'timeJudgement'), filter.timeJudgement)) return false;
    if (!exact(field(record, 'systemJudgement'), filter.systemJudgement)) return false;
    if (!inDateRange(field(record, 'commentTime'), filter.commentDateStart, filter.commentDateEnd)) return false;
    if (!inNumberRange(field(record, 'duration'), filter.durationMin, filter.durationMax)) return false;
    if (!inNumberRange(field(record, 'messageCount'), filter.messageMin, filter.messageMax)) return false;
    if (!inNumberRange(field(record, 'avgMessageLength'), filter.averageMin, filter.averageMax)) return false;
    if (!exact(manualStatus(record), filter.manualStatus)) return false;
    if (!inDateRange(field(record, 'reviewedAt'), filter.reviewDateStart, filter.reviewDateEnd)) return false;
    if (!exact(field(record, 'riskStatus'), filter.riskStatus)) return false;
    return true;
  }

  function filteredRecords() { return records().filter(recordMatches); }

  function uniqueValues(name) {
    var seen = {};
    return records().filter(function (record) {
      return activeTab === 'reviewed' ? isReviewed(record) : !isReviewed(record);
    }).map(function (record) { return name === 'manualStatus' ? manualStatus(record) : field(record, name); }).filter(function (value) {
      var label = String(value || '').trim();
      if (!label || label === '—' || seen[label]) return false;
      seen[label] = true;
      return true;
    }).sort();
  }

  function optionList(name, selected, allLabel) {
    var output = '<option value="all">' + escape(allLabel || '全部') + '</option>';
    var values = name === 'systemJudgement' ? SYSTEM_JUDGEMENTS : name === 'riskStatus' ? DEVICE_RISK_STATUSES : uniqueValues(name);
    values.forEach(function (value) {
      output += '<option value="' + escape(value) + '"' + (String(value) === String(selected) ? ' selected' : '') + '>' + escape(value) + '</option>';
    });
    return output;
  }

  function inputField(label, key, placeholder, type) {
    return '<label class="field review-filter-field"><span class="field__label">' + escape(label) + '</span><input class="form-input" id="review-filter-' + escape(key) + '" type="' + escape(type || 'text') + '" value="' + escape(currentFilters()[key]) + '" placeholder="' + escape(placeholder || '') + '"></label>';
  }

  function selectField(label, key, sourceName, allLabel) {
    return '<label class="field review-filter-field"><span class="field__label">' + escape(label) + '</span><select class="form-select" id="review-filter-' + escape(key) + '">' + optionList(sourceName || key, currentFilters()[key], allLabel) + '</select></label>';
  }

  function rangeField(label, minKey, maxKey, type, suffix) {
    return [
      '<div class="field review-filter-field"><span class="field__label">', escape(label), '</span><div class="review-range">',
      '<input class="form-input" id="review-filter-', escape(minKey), '" type="', escape(type || 'number'), '" value="', escape(currentFilters()[minKey]), '" placeholder="最小值"><span>至</span>',
      '<input class="form-input" id="review-filter-', escape(maxKey), '" type="', escape(type || 'number'), '" value="', escape(currentFilters()[maxKey]), '" placeholder="最大值">', suffix ? '<span>' + escape(suffix) + '</span>' : '',
      '</div></div>'
    ].join('');
  }

  function organizationFilters() {
    return [
      inputField('门店', 'store', '请输入门店名称或编码'),
      selectField('省份', 'province'), selectField('城市', 'city'),
      selectField('大区', 'region'), selectField('小区', 'district')
    ].join('');
  }

  function pendingFilters() {
    return [
      '<div class="review-filter-grid review-filter-grid--primary form-grid form-grid--3">',
      inputField('调查审批单号', 'approvalNo', '请输入调查审批单号'), selectField('点评状态', 'commentStatus', 'commentStatus', '全部点评状态'), inputField('VIN码', 'vin', '请输入VIN码'),
      inputField('MIS', 'mis', '请输入MIS'), selectField('NPS符合', 'nps', 'nps', '全部'), selectField('NSS符合', 'nss', 'nss', '全部'),
      organizationFilters(),
      '</div>',
      '<div id="review-advanced-filters" class="review-filter-grid review-filter-grid--advanced form-grid form-grid--3"', filtersCollapsed ? ' hidden' : '', '>',
      selectField('时长判断', 'timeJudgement', 'timeJudgement', '全部'), selectField('设备风险', 'riskStatus', 'riskStatus', '全部风险状态'), selectField('系统初判', 'systemJudgement', 'systemJudgement', '请选择'),
      rangeField('点评时间', 'commentDateStart', 'commentDateEnd', 'date'), rangeField('答题时长', 'durationMin', 'durationMax', 'number', '秒'),
      rangeField('留言条数', 'messageMin', 'messageMax', 'number', '条'), rangeField('平均字数', 'averageMin', 'averageMax', 'number', '字'), '</div>'
    ].join('');
  }

  function reviewedFilters() {
    return [
      '<div class="review-filter-grid review-filter-grid--primary form-grid form-grid--3">',
      selectField('品牌', 'brand', 'brand', '全部品牌'), selectField('点评状态', 'commentStatus', 'commentStatus', '全部点评状态'), inputField('MIS', 'mis', '请输入MIS'),
      selectField('人工审核状态', 'manualStatus', 'manualStatus', '全部审核状态'), organizationFilters(), '</div>',
      '<div id="review-advanced-filters" class="review-filter-grid review-filter-grid--advanced form-grid form-grid--3"', filtersCollapsed ? ' hidden' : '', '>',
      selectField('时长判断', 'timeJudgement', 'timeJudgement', '全部'), selectField('设备风险', 'riskStatus', 'riskStatus', '全部风险状态'), selectField('系统初判', 'systemJudgement', 'systemJudgement', '请选择'),
      rangeField('人工审核时间', 'reviewDateStart', 'reviewDateEnd', 'date'), rangeField('答题时长', 'durationMin', 'durationMax', 'number', '秒'),
      rangeField('留言条数', 'messageMin', 'messageMax', 'number', '条'), rangeField('平均字数', 'averageMin', 'averageMax', 'number', '字'), '</div>'
    ].join('');
  }

  function renderTabs() {
    return '<div class="segmented sit-tabs" id="review-tabs" role="tablist" aria-label="人工审核点评页签"><button class="segmented__item' + (activeTab === 'pending' ? ' active' : '') + '" type="button" role="tab" aria-selected="' + (activeTab === 'pending' ? 'true' : 'false') + '" data-review-tab="pending">人工审核点评有效性</button><button class="segmented__item' + (activeTab === 'reviewed' ? ' active' : '') + '" type="button" role="tab" aria-selected="' + (activeTab === 'reviewed' ? 'true' : 'false') + '" data-review-tab="reviewed">已审核记录</button></div>';
  }

  function renderFilterPanel() {
    return [
      '<form id="review-filter-form" class="review-filter-panel" novalidate>', activeTab === 'pending' ? pendingFilters() : reviewedFilters(),
      '<div class="review-query-actions"><button class="btn" id="review-reset" type="button">重置</button><button class="btn btn-primary" id="review-query" type="submit">查询</button>',
      '<button class="btn btn-link" id="review-collapse" type="button">', filtersCollapsed ? '展开' : '收起', '</button><button class="btn" id="review-export" type="button">导出</button>',
      activeTab === 'pending' ? '<button class="btn" id="batch-valid" type="button">批量确认有效</button><button class="btn" id="batch-invalid" type="button">批量确认无效</button>' : '', '</div></form>'
    ].join('');
  }

  function valueText(value, suffix) {
    if (value === undefined || value === null || value === '') return '—';
    return escape(value) + (suffix || '');
  }

  function riskTone(value) {
    if (value === '异常') return 'danger';
    if (value === '正常') return 'success';
    return 'neutral';
  }

  function statusTone(value) {
    if (/无效/.test(String(value || ''))) return 'danger';
    if (/有效/.test(String(value || ''))) return 'success';
    return 'info';
  }

  function riskDisplay(record, clickable) {
    var result = evaluateDeviceRisk(record);
    var value = result.status || '待核验';
    if (clickable !== false) {
      return '<button class="tag tag--' + riskTone(value) + ' review-risk-trigger" type="button" data-device-risk="' + escape(record.id) + '" data-anno="review-risk-' + escape(record.id) + '" aria-haspopup="dialog" aria-label="设备风险' + escape(value) + '，查看 ' + escape(field(record, 'pushId', record.id)) + ' 的核验明细" title="查看本次与历史答卷核验明细">' + escape(value) + '</button>';
    }
    return window.TCSUI.tag(value, riskTone(value));
  }

  function systemJudgementDisplay(record) {
    var value = field(record, 'systemJudgement');
    var tone = value === '有效' ? 'success' : value === '无效' ? 'danger' : 'neutral';
    return value ? window.TCSUI.tag(value, tone) : '—';
  }

  function pendingHeader() {
    return '<tr><th class="selection-cell"><input id="review-select-all" type="checkbox" aria-label="选择当前页全部记录"></th><th>品牌</th><th>调查审批单号</th><th>审批名称</th><th>推送ID</th><th>点评状态</th><th>点评时间</th><th>VIN</th><th>MIS</th>' + organizationHeader() + '<th>设备ID（脱敏）</th><th>答题时长</th><th>时长百分位</th><th>NPS符合</th><th>NSS符合</th><th>时长判断</th><th>留言条数</th><th>平均字数</th><th>设备风险</th><th>系统初判</th><th>操作</th></tr>';
  }

  function reviewedHeader() {
    return '<tr><th>品牌</th><th>调查审批单号</th><th>审批名称</th><th>推送ID</th><th>点评状态</th><th>点评时间</th><th>VIN</th><th>MIS</th>' + organizationHeader() + '<th>设备ID（脱敏）</th><th>答题时长</th><th>时长百分位</th><th>NPS符合</th><th>NSS符合</th><th>时长判断</th><th>留言条数</th><th>平均字数</th><th>设备风险</th><th>系统初判</th><th>人工审核时间</th><th>人工审核状态</th><th>账户ID</th><th>账户名称</th><th>无效备注</th><th>操作</th></tr>';
  }

  function organizationHeader() {
    return '<th class="review-store-cell">门店</th><th class="review-area-cell">省份</th><th class="review-area-cell">城市</th><th class="review-area-cell">大区</th><th class="review-area-cell">小区</th>';
  }

  function organizationCells(record) {
    var storeName = field(record, 'storeName');
    var storeCode = field(record, 'storeCode');
    var store = !storeName && !storeCode ? '—' : '<span class="review-store-name">' + valueText(storeName) + '</span><span class="review-store-code">编码：' + valueText(storeCode) + '</span>';
    return '<td class="review-store-cell">' + store + '</td>' + ['province', 'city', 'region', 'district'].map(function (key) {
      return '<td class="review-area-cell">' + valueText(field(record, key)) + '</td>';
    }).join('');
  }

  function baseCells(record) {
    var duration = field(record, 'duration');
    var percentile = field(record, 'durationPercentile');
    return [
      '<td>', valueText(field(record, 'brand')), '</td><td>', valueText(field(record, 'approvalNo')), '</td><td>', valueText(field(record, 'approvalName')), '</td><td>', valueText(field(record, 'pushId')), '</td>',
      '<td>', valueText(field(record, 'commentStatus')), '</td><td>', valueText(field(record, 'commentTime')), '</td><td>', valueText(field(record, 'vin')), '</td><td>', valueText(field(record, 'mis')), '</td>',
      organizationCells(record),
      '<td>', valueText(field(record, 'deviceId')), '</td>',
      '<td>', valueText(duration, duration === '' ? '' : '秒'), '</td><td>', valueText(percentile), '</td><td>', valueText(field(record, 'nps')), '</td><td>', valueText(field(record, 'nss')), '</td>',
      '<td>', valueText(field(record, 'timeJudgement')), '</td><td>', valueText(field(record, 'messageCount')), '</td><td>', valueText(field(record, 'avgMessageLength')), '</td>',
      '<td>', riskDisplay(record), '</td><td>', systemJudgementDisplay(record), '</td>'
    ].join('');
  }

  function pendingRow(record) {
    return '<tr data-review-row="' + escape(record.id) + '"><td class="selection-cell"><input type="checkbox" data-row-select="' + escape(record.id) + '" aria-label="选择 ' + escape(field(record, 'approvalNo', record.id)) + '"' + (selectedRows[record.id] ? ' checked' : '') + '></td>' + baseCells(record) + '<td class="operation-cell"><button class="btn btn-link btn-sm" type="button" data-review-action="valid" data-record-id="' + escape(record.id) + '">确认有效</button><button class="btn btn-link btn-sm" type="button" data-review-action="invalid" data-record-id="' + escape(record.id) + '">确认无效</button></td></tr>';
  }

  function reviewedRow(record) {
    var status = manualStatus(record);
    var invalidRemark = status === '无效' ? (field(record, 'invalidRemark') || field(record, 'remark')) : '';
    return '<tr data-review-row="' + escape(record.id) + '">' + baseCells(record) + '<td>' + valueText(field(record, 'reviewedAt')) + '</td><td>' + (status === '—' ? '—' : window.TCSUI.tag(status, statusTone(status))) + '</td><td>' + valueText(field(record, 'reviewerAccountId')) + '</td><td>' + valueText(field(record, 'reviewer')) + '</td><td>' + valueText(invalidRemark) + '</td><td class="operation-cell"><button class="btn btn-link btn-sm" type="button" data-review-history="' + escape(record.id) + '">审核记录</button></td></tr>';
  }

  function renderRows() {
    var data = filteredRecords();
    if (!data.length) return '<tr><td colspan="' + (activeTab === 'pending' ? '25' : '29') + '">' + window.TCSUI.empty('暂无数据', '请调整筛选条件后重新查询。') + '</td></tr>';
    return data.map(activeTab === 'pending' ? pendingRow : reviewedRow).join('');
  }

  function renderTable() {
    return '<div class="review-table-summary"><span id="review-selected-count">' + (activeTab === 'pending' ? '已选择 0 项 · ' : '') + '共 ' + filteredRecords().length + ' 条</span></div><div class="table-wrapper review-table-wrapper"><table class="data-table review-data-table" aria-label="' + (activeTab === 'pending' ? '人工审核点评有效性' : '已审核记录') + '"><thead>' + (activeTab === 'pending' ? pendingHeader() : reviewedHeader()) + '</thead><tbody id="review-table-body">' + renderRows() + '</tbody></table></div><div class="pagination"><span class="text-secondary" id="review-count-label">共 ' + filteredRecords().length + ' 条</span></div>';
  }

  function render() {
    return [
      '<section class="card content-card sit-review-page" data-feature="F-01 F-02 F-03">', renderTabs(), '<div class="review-tab-content">', renderFilterPanel(),
      renderTable(), '</div></section>'
    ].join('');
  }

  function findRecord(id) { return records().filter(function (record) { return String(record.id) === String(id); })[0] || null; }

  function evidenceTimestamp(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)) return NaN;
    var time = Date.parse(value.replace(' ', 'T') + 'Z');
    if (!Number.isFinite(time) || new Date(time).toISOString().slice(0, 19).replace('T', ' ') !== value) return NaN;
    return time;
  }

  function riskEvidenceRow(record, role, outcome, index) {
    return [
      '<tr><td>', escape(role), '</td><td>', valueText(rawField(record, 'pushId')), '</td>',
      '<td>', valueText(rawField(record, 'questionnaireId')), '</td><td>', valueText(rawField(record, 'vin')), '</td>',
      '<td>', valueText(rawField(record, 'mis')), '</td><td data-anno="review-risk-device-', index, '">', valueText(rawField(record, 'deviceId')), '</td>',
      '<td>', valueText(rawField(record, 'commentTime')), '</td><td>', escape(outcome), '</td></tr>'
    ].join('');
  }

  function renderRiskEvidence(record) {
    var result = evaluateDeviceRisk(record);
    var rows = riskEvidenceRow(record, '本次', '判定基准', 'current');
    result.candidates.forEach(function (candidate, index) {
      rows += riskEvidenceRow(candidate.record, '历史', candidate.reason, 'history-' + index);
    });
    return [
      '<h3>本次与历史答卷对照</h3>',
      '<div class="table-wrapper"><table class="data-table" aria-label="设备风险答卷对照"><thead><tr>',
      '<th>答卷</th><th>推送ID</th><th>问卷ID</th><th>VIN（脱敏）</th><th>MIS</th>',
      '<th data-anno="review-risk-device-column">设备ID（脱敏）</th><th>点评时间</th><th>核验结果</th></tr></thead><tbody>', rows, '</tbody></table></div>',
      !result.candidates.length ? '<p class="text-secondary">无同 VIN 的可展示历史答卷。</p>' : '',
      result.checkStatus === 'unverified' ? '<p class="field__hint" role="status" data-anno="review-risk-unverified">待核验：' + escape(result.issues.join('；')) + '</p>' : ''
    ].join('');
  }

  function showDeviceRisk(id) {
    var record = findRecord(id);
    if (!record) { window.showToast('未找到对应的设备风险证据。', 'warning'); return; }
    window.openOverlay([
      '<header class="modal-header"><div><h2>设备风险详情</h2><p class="modal-caption">当前答卷 ', escape(record.id), '</p></div><button class="btn btn-link" type="button" data-close-overlay>关闭</button></header><div class="modal-body">',
      '<dl class="detail-list review-risk-evidence"><div><dt>设备风险</dt><dd>', riskDisplay(record, false), '</dd></div><div data-anno="review-risk-system-result"><dt>系统初判</dt><dd>', systemJudgementDisplay(record), '</dd></div>',
      '<div><dt>核验状态</dt><dd>', evaluateDeviceRisk(record).checkStatus === 'complete' ? '已核验' : '待核验', '</dd></div>',
      '<div><dt>满足条件的不同设备数（含本次）</dt><dd>', evaluateDeviceRisk(record).checkStatus === 'complete' ? evaluateDeviceRisk(record).deviceCount : '—', '</dd></div></dl>',
      renderRiskEvidence(record),
      '</div><footer class="modal-footer"><button class="btn btn-primary" type="button" data-close-overlay>关闭</button></footer>'
    ].join(''), { label: '设备风险详情', className: 'modal-content--wide' });
  }

  function showReviewHistory(id) {
    var record = findRecord(id);
    if (!record) { window.showToast('未找到对应的审核记录。', 'warning'); return; }
    var status = manualStatus(record);
    window.openOverlay([
      '<header class="modal-header"><div><h2>审核记录</h2><p class="modal-caption">', valueText(field(record, 'approvalNo')), '</p></div><button class="btn btn-link" type="button" data-close-overlay>关闭</button></header><div class="modal-body"><dl class="detail-list">',
      '<div><dt>设备风险</dt><dd>', riskDisplay(record, false), '</dd></div><div><dt>系统初判</dt><dd>', systemJudgementDisplay(record), '</dd></div>',
      '<div><dt>人工审核状态</dt><dd>', status === '—' ? '—' : window.TCSUI.tag(status, statusTone(status)), '</dd></div><div><dt>人工审核时间</dt><dd>', valueText(field(record, 'reviewedAt')), '</dd></div>',
      '<div><dt>账户 ID</dt><dd>', valueText(field(record, 'reviewerAccountId')), '</dd></div><div><dt>账户名称</dt><dd>', valueText(field(record, 'reviewer')), '</dd></div>',
      '<div><dt>审核备注</dt><dd>', valueText(field(record, 'invalidRemark') || field(record, 'remark')), '</dd></div><div><dt>设备 ID（脱敏）</dt><dd>', valueText(field(record, 'deviceId')), '</dd></div>',
      '</dl></div><footer class="modal-footer"><button class="btn" type="button" id="history-risk-button" data-risk-id="', escape(record.id), '" aria-haspopup="dialog">查看设备风险核验</button><button class="btn btn-primary" type="button" data-close-overlay>关闭</button></footer>'
    ].join(''), { label: '审核记录' });
    var riskButton = document.getElementById('history-risk-button');
    if (riskButton) riskButton.addEventListener('click', function () { showDeviceRisk(riskButton.getAttribute('data-risk-id')); });
  }

  function selectedPendingIds() {
    return records().filter(function (record) { return !isReviewed(record) && selectedRows[record.id]; }).map(function (record) { return record.id; });
  }

  function pad(number) { return number < 10 ? '0' + number : String(number); }

  function localTimestamp() {
    var now = new Date();
    return [now.getFullYear(), pad(now.getMonth() + 1), pad(now.getDate())].join('-') + ' ' + [pad(now.getHours()), pad(now.getMinutes()), pad(now.getSeconds())].join(':');
  }

  function openDecisionDialog(ids, decision) {
    var availableIds = ids.filter(function (id) { var record = findRecord(id); return record && !isReviewed(record); });
    if (!availableIds.length) { window.showToast('请先选择待审核记录。', 'warning'); return; }
    var invalid = decision === 'invalid';
    var title = invalid ? '确认无效' : '确认有效';
    window.openOverlay([
      '<header class="modal-header"><div><h2>', title, '</h2><p class="modal-caption">本次共 ', availableIds.length, ' 条记录</p></div><button class="btn btn-link" type="button" data-close-overlay>关闭</button></header><div class="modal-body">',
      '<label class="field"><span class="field__label">', invalid ? '无效备注 <em>*</em>' : '审核备注', '</span><textarea id="review-decision-remark" class="form-textarea" maxlength="300" placeholder="', invalid ? '请输入确认无效的原因' : '可填写审核说明', '"></textarea><span class="field__hint">最多 300 字</span></label>',
      '</div><footer class="modal-footer"><button class="btn" type="button" data-close-overlay>取消</button><button class="btn btn-primary" id="confirm-review-decision" type="button">', title, '</button></footer>'
    ].join(''), { label: title });
    var confirmButton = document.getElementById('confirm-review-decision');
    if (confirmButton) confirmButton.addEventListener('click', function () {
      var remarkInput = document.getElementById('review-decision-remark');
      var remark = remarkInput ? remarkInput.value.trim() : '';
      if (invalid && !remark) { window.showToast('确认无效必须填写无效备注。', 'warning'); if (remarkInput) remarkInput.focus(); return; }
      var now = localTimestamp();
      availableIds.forEach(function (id) {
        decisionMap()[id] = {
          reviewStatus: '已审核', manualReviewStatus: invalid ? '无效' : '有效', action: invalid ? '确认无效' : '确认有效', reviewedAt: now,
          reviewerAccountId: 'CURRENT-USER-MOCK', reviewer: '当前审核用户（Mock）', invalidRemark: invalid ? remark : '', remark: remark
        };
      });
      selectedRows = {};
      window.closeOverlay();
      window.TCSApp.render();
      window.showToast('已手工' + title + ' ' + availableIds.length + ' 条记录。');
    });
  }

  function readFilters() {
    var filter = currentFilters();
    Object.keys(filter).forEach(function (key) {
      var input = document.getElementById('review-filter-' + key);
      if (input) filter[key] = input.value.trim();
    });
  }

  function clearSelection() { selectedRows = {}; }

  function updateSelectionSummary() {
    var visible = activeTab === 'pending' ? filteredRecords() : [];
    var selected = selectedPendingIds();
    var count = document.getElementById('review-selected-count');
    if (count) count.textContent = activeTab === 'pending' ? '已选择 ' + selected.length + ' 项 · 共 ' + visible.length + ' 条' : '共 ' + visible.length + ' 条';
    var selectAll = document.getElementById('review-select-all');
    if (selectAll) {
      var visibleSelected = visible.filter(function (record) { return selectedRows[record.id]; }).length;
      selectAll.checked = Boolean(visible.length) && visibleSelected === visible.length;
      selectAll.indeterminate = visibleSelected > 0 && visibleSelected < visible.length;
    }
  }

  function refreshTable() {
    var body = document.getElementById('review-table-body');
    if (body) body.innerHTML = renderRows();
    var count = document.getElementById('review-count-label');
    if (count) count.textContent = '共 ' + filteredRecords().length + ' 条';
    bindTableActions();
    updateSelectionSummary();
  }

  function bindTableActions() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-row-select]'), function (checkbox) {
      checkbox.addEventListener('change', function () { selectedRows[checkbox.getAttribute('data-row-select')] = checkbox.checked; updateSelectionSummary(); });
    });
    var selectAll = document.getElementById('review-select-all');
    if (selectAll) selectAll.addEventListener('change', function () { filteredRecords().forEach(function (record) { selectedRows[record.id] = selectAll.checked; }); refreshTable(); });
    Array.prototype.forEach.call(document.querySelectorAll('[data-review-action]'), function (button) {
      button.addEventListener('click', function () { openDecisionDialog([button.getAttribute('data-record-id')], button.getAttribute('data-review-action')); });
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-device-risk]'), function (button) {
      button.addEventListener('click', function () { showDeviceRisk(button.getAttribute('data-device-risk')); });
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-review-history]'), function (button) {
      button.addEventListener('click', function () { showReviewHistory(button.getAttribute('data-review-history')); });
    });
  }

  function csvCell(value) { return '"' + String(value === undefined || value === null || value === '' ? '—' : value).replace(/"/g, '""') + '"'; }

  function exportRows() {
    var data = filteredRecords();
    if (!data.length) { window.showToast('当前查询没有可导出的记录。', 'warning'); return; }
    var headers = ['品牌', '调查审批单号', '审批名称', '推送ID', '点评状态', '点评时间', 'VIN', 'MIS', '门店', '省份', '城市', '大区', '小区', '设备ID（脱敏）', '答题时长', '时长百分位', 'NPS符合', 'NSS符合', '时长判断', '留言条数', '平均字数', '设备风险', '系统初判'];
    var keys = ['brand', 'approvalNo', 'approvalName', 'pushId', 'commentStatus', 'commentTime', 'vin', 'mis', 'store', 'province', 'city', 'region', 'district', 'deviceId', 'duration', 'durationPercentile', 'nps', 'nss', 'timeJudgement', 'messageCount', 'avgMessageLength', 'riskStatus', 'systemJudgement'];
    if (activeTab === 'reviewed') { headers = headers.concat(['人工审核时间', '人工审核状态', '账户ID', '账户名称', '无效备注']); keys = keys.concat(['reviewedAt', 'manualStatus', 'reviewerAccountId', 'reviewer', 'invalidRemark']); }
    var lines = [headers.map(csvCell).join(',')];
    data.forEach(function (record) {
      lines.push(keys.map(function (key) {
        if (key === 'manualStatus') return csvCell(manualStatus(record));
        if (key === 'invalidRemark') return csvCell(manualStatus(record) === '无效' ? (field(record, 'invalidRemark') || field(record, 'remark')) : '—');
        if (key === 'riskStatus') return csvCell(field(record, key) || '待核验（未形成风险结论）');
        return csvCell(field(record, key));
      }).join(','));
    });
    window.downloadTextFile('TCS-' + (activeTab === 'pending' ? '人工审核点评有效性' : '已审核记录') + '-' + dateOnly(localTimestamp()) + '.csv', lines.join('\n'), 'text/csv;charset=utf-8');
    window.showToast('已导出当前查询的 ' + data.length + ' 条记录。');
  }

  function bindTabs() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-review-tab]'), function (button) {
      button.addEventListener('click', function () { activeTab = button.getAttribute('data-review-tab'); clearSelection(); window.TCSApp.render(); });
    });
  }

  function bindFilterActions() {
    var form = document.getElementById('review-filter-form');
    if (form) form.addEventListener('submit', function (event) { event.preventDefault(); readFilters(); clearSelection(); refreshTable(); window.showToast('查询完成，共 ' + filteredRecords().length + ' 条。'); });
    var reset = document.getElementById('review-reset');
    if (reset) reset.addEventListener('click', function () { filterState[activeTab] = blankFilters(); clearSelection(); window.TCSApp.render(); window.showToast('筛选条件已重置。'); });
    var collapse = document.getElementById('review-collapse');
    if (collapse) collapse.addEventListener('click', function () { filtersCollapsed = !filtersCollapsed; var advanced = document.getElementById('review-advanced-filters'); if (advanced) advanced.hidden = filtersCollapsed; collapse.textContent = filtersCollapsed ? '展开' : '收起'; });
    var exportButton = document.getElementById('review-export');
    if (exportButton) exportButton.addEventListener('click', exportRows);
    var batchValid = document.getElementById('batch-valid');
    if (batchValid) batchValid.addEventListener('click', function () { openDecisionDialog(selectedPendingIds(), 'valid'); });
    var batchInvalid = document.getElementById('batch-invalid');
    if (batchInvalid) batchInvalid.addEventListener('click', function () { openDecisionDialog(selectedPendingIds(), 'invalid'); });
  }

  function init() {
    bindTabs();
    bindFilterActions();
    bindTableActions();
    updateSelectionSummary();
  }

  window.Pages.review = { render: render, init: init };
})();
