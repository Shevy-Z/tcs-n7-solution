(function () {
  'use strict';

  window.Pages = window.Pages || {};

  var filters = {
    status: 'all',
    pushStatus: 'all',
    pushRule: 'all',
    reward: 'all'
  };

  function hasOwn(object, key) {
    return Boolean(object) && Object.prototype.hasOwnProperty.call(object, key);
  }

  function pick(object, keys, fallback) {
    var index;
    for (index = 0; index < keys.length; index += 1) {
      if (hasOwn(object, keys[index]) && object[keys[index]] !== undefined && object[keys[index]] !== null && object[keys[index]] !== '') {
        return object[keys[index]];
      }
    }
    return fallback;
  }

  function escape(value) {
    return window.escapeHtml(value === undefined || value === null ? '' : String(value));
  }

  function getState() {
    if (!window.TCSData) window.TCSData = {};
    if (!window.TCSData.state) window.TCSData.state = {};
    if (!window.TCSData.state.approvalEdits) window.TCSData.state.approvalEdits = {};
    if (!Array.isArray(window.TCSData.state.approvalAdded)) window.TCSData.state.approvalAdded = [];
    return window.TCSData.state;
  }

  function fallbackRecords() {
    return [
      {
        approvalNo: 'TCS-AP-DEMO-090201',
        name: '2026年首保回访调查',
        createdAt: '2026-09-02 09:18:32',
        questionnaireId: 'Q-DEMO-0108',
        pushId: 'PUSH-DEMO-801',
        status: '待提交',
        approver: '—',
        submittedAt: '—',
        completedAt: '—',
        pushStatus: '未开启',
        pushStartAt: '—',
        pushRule: '定时循环推送',
        reward: '开启·积分100（Mock）',
        scenarioId: 'coverage'
      },
      {
        approvalNo: 'TCS-AP-DEMO-083102',
        name: '2026年交车后回访调查',
        createdAt: '2026-08-31 14:36:05',
        questionnaireId: 'Q-DEMO-0112',
        pushId: 'PUSH-DEMO-809',
        status: '审批完成',
        approver: '审批人A（Mock）',
        submittedAt: '2026-08-31 15:02:16',
        completedAt: '2026-09-01 10:12:28',
        pushStatus: '推送中',
        pushStartAt: '2026-09-01 11:00:00',
        pushRule: '定时循环推送',
        reward: '关闭',
        scenarioId: 'shortage-over'
      }
    ];
  }

  function sourceRecords() {
    var configured = window.TCSData && Array.isArray(window.TCSData.approvalRecords)
      ? window.TCSData.approvalRecords
      : [];
    return configured.length ? configured : fallbackRecords();
  }

  function normalizeRecord(record, index) {
    var id = pick(record, ['approvalNo', 'approvalId', 'id', 'no'], 'TCS-AP-DEMO-' + (index + 1));
    var rewardValue = pick(record, ['reward', 'commentReward', 'rewardStatus'], '关闭');
    if (typeof rewardValue === 'boolean') rewardValue = rewardValue ? '开启' : '关闭';
    return {
      raw: record || {},
      id: String(id),
      approvalNo: id,
      name: pick(record, ['name', 'approvalName', 'title'], '未命名审批'),
      createdAt: pick(record, ['createdAt', 'createTime'], '—'),
      questionnaireId: pick(record, ['questionnaireId', 'surveyId', 'questionnaireNo'], '—'),
      pushId: pick(record, ['pushId', 'approvalPushId', 'pushApprovalId'], '—'),
      status: pick(record, ['status', 'approvalStatus'], '待提交'),
      approver: pick(record, ['approver', 'currentApprover'], '—'),
      submittedAt: pick(record, ['submittedAt', 'submitTime'], '—'),
      completedAt: pick(record, ['completedAt', 'completeTime'], '—'),
      pushStatus: pick(record, ['pushStatus'], '未开启'),
      pushStartAt: pick(record, ['pushStartAt', 'pushStartedAt', 'startPushTime'], '—'),
      pushRule: pick(record, ['pushRule', 'pushRuleName'], '定时循环推送'),
      recurringEnabled: pick(record, ['recurringEnabled'], true) !== false,
      reward: rewardValue,
      scenarioId: pick(record, ['scenarioId', 'samplingScenarioId'], ''),
      samplingEnabled: hasOwn(record, 'samplingEnabled') ? Boolean(record.samplingEnabled) : true,
      ratio: hasOwn(record, 'samplingRatio') ? record.samplingRatio : pick(record, ['ratio'], 35),
      lowerBound: hasOwn(record, 'lowerBound') ? record.lowerBound : 20,
      pushMode: pick(record, ['pushMode', 'randomPushMode'], 'fixed'),
      baseDays: pick(record, ['baseDays'], 75),
      weekday: pick(record, ['weekday'], '周三'),
      time: pick(record, ['time', 'pushTime'], '10:00'),
      randomTime: hasOwn(record, 'randomTime') ? record.randomTime : '',
      randomDays: hasOwn(record, 'randomDays') ? record.randomDays : 15,
      pushChannel: pick(record, ['pushChannel', 'channel'], '服务号模板消息'),
      snapshotId: pick(record, ['snapshotId'], '—')
    };
  }

  function approvalRecords() {
    var state = getState();
    return sourceRecords().concat(state.approvalAdded).map(normalizeRecord).map(function (record) {
      var edit = state.approvalEdits[record.id];
      if (!edit) return record;
      Object.keys(edit).forEach(function (key) { record[key] = edit[key]; });
      return record;
    });
  }

  function statusTone(value) {
    var text = String(value || '');
    if (text.indexOf('完成') !== -1 || text.indexOf('成功') !== -1 || text.indexOf('已开启') !== -1) return 'success';
    if (text.indexOf('失败') !== -1 || text.indexOf('驳回') !== -1) return 'danger';
    if (text.indexOf('待') !== -1 || text.indexOf('未') !== -1) return 'warning';
    return 'info';
  }

  function option(value, label, selected) {
    return '<option value="' + escape(value) + '"' + (String(value) === String(selected) ? ' selected' : '') + '>' + escape(label) + '</option>';
  }

  function filterRecords(records) {
    return records.filter(function (record) {
      if (filters.status !== 'all' && String(record.status) !== filters.status) return false;
      if (filters.pushStatus !== 'all' && String(record.pushStatus) !== filters.pushStatus) return false;
      if (filters.pushRule !== 'all' && String(record.pushRule) !== filters.pushRule) return false;
      if (filters.reward !== 'all') {
        var rewardText = String(record.reward);
        var enabled = rewardText.indexOf('开启') !== -1 || rewardText === '是';
        if ((filters.reward === 'enabled') !== enabled) return false;
      }
      return true;
    });
  }

  function unique(records, key) {
    var seen = {};
    return records.map(function (record) { return record[key]; }).filter(function (value) {
      var text = String(value || '');
      if (!text || seen[text]) return false;
      seen[text] = true;
      return true;
    });
  }

  function renderFilters(records) {
    return [
      '<section class="card content-card sit-filter-card">',
        '<div class="form-section__body">',
          '<div id="plan-filter-fields" class="form-grid form-grid--4">',
            '<label class="field"><span class="field__label">状态</span><select id="filter-status" class="form-select">', option('all', '全部', filters.status), unique(records, 'status').map(function (value) { return option(value, value, filters.status); }).join(''), '</select></label>',
            '<label class="field"><span class="field__label">推送状态</span><select id="filter-push-status" class="form-select">', option('all', '全部', filters.pushStatus), unique(records, 'pushStatus').map(function (value) { return option(value, value, filters.pushStatus); }).join(''), '</select></label>',
            '<label class="field"><span class="field__label">推送规则</span><select id="filter-push-rule" class="form-select">', option('all', '全部', filters.pushRule), unique(records, 'pushRule').map(function (value) { return option(value, value, filters.pushRule); }).join(''), '</select></label>',
            '<label class="field"><span class="field__label">点评奖励</span><select id="filter-reward" class="form-select">', option('all', '全部', filters.reward), option('enabled', '开启', filters.reward), option('disabled', '关闭', filters.reward), '</select></label>',
          '</div>',
          '<div class="filter-actions page-actions">',
            '<button class="btn" id="reset-plan-filters" type="button">重置</button>',
            '<button class="btn btn-primary" id="query-plan" type="button">查询</button>',
            '<button class="btn btn-link" id="collapse-plan-filters" type="button">收起</button>',
          '</div>',
        '</div>',
      '</section>'
    ].join('');
  }

  function operationButtons(record) {
    var editable = String(record.status).indexOf('待提交') !== -1;
    var approved = /(已通过|审批完成)/.test(String(record.status));
    var pushing = /推送中|已完成/.test(String(record.pushStatus));
    function disabled(value) { return value ? ' disabled aria-disabled="true"' : ''; }
    return [
      '<button class="btn btn-link btn-sm" type="button" data-plan-action="edit" data-plan-id="', escape(record.id), '"', disabled(!editable), '>编辑</button>',
      '<button class="btn btn-link btn-sm" type="button" data-plan-action="submit" data-plan-id="', escape(record.id), '"', disabled(!editable), '>提交审批</button>',
      '<button class="btn btn-link btn-sm" type="button" data-plan-action="push-data" data-plan-id="', escape(record.id), '"', disabled(!approved), '>推送数据</button>',
      '<button class="btn btn-link btn-sm" type="button" data-plan-action="start-push" data-plan-id="', escape(record.id), '"', disabled(!approved || pushing), '>开启推送</button>',
      '<button class="btn btn-link btn-sm" type="button" data-plan-action="detail" data-plan-id="', escape(record.id), '">审批详情</button>',
      '<button class="btn btn-link btn-sm" type="button" data-plan-action="comment-data" data-plan-id="', escape(record.id), '"', disabled(!approved), '>点评数据</button>',
      '<button class="btn btn-link btn-sm" type="button" data-plan-action="link" data-plan-id="', escape(record.id), '"', disabled(!approved), '>引流链接</button>',
      '<button class="btn btn-link btn-sm" type="button" data-plan-action="reward" data-plan-id="', escape(record.id), '"', disabled(!approved), '>补发奖励</button>'
    ].join('');
  }

  function renderTable(records) {
    var filtered = filterRecords(records);
    var rows = filtered.map(function (record) {
      return [
        '<tr>',
          '<td><span class="cell-title">', escape(record.approvalNo), '</span></td>',
          '<td><span class="truncate-2" title="', escape(record.name), '">', escape(record.name), '</span></td>',
          '<td>', escape(record.createdAt), '</td>',
          '<td>', escape(record.questionnaireId), '</td>',
          '<td>', escape(record.pushId), '</td>',
          '<td>', window.TCSUI.tag(record.status, statusTone(record.status)), '</td>',
          '<td>', escape(record.approver), '</td>',
          '<td>', escape(record.submittedAt), '</td>',
          '<td>', escape(record.completedAt), '</td>',
          '<td>', window.TCSUI.tag(record.pushStatus, statusTone(record.pushStatus)), '</td>',
          '<td>', escape(record.pushStartAt), '</td>',
          '<td>', escape(record.pushRule), '</td>',
          '<td>', escape(record.reward), '</td>',
          '<td class="table-actions">', operationButtons(record), '</td>',
        '</tr>'
      ].join('');
    }).join('');
    if (!rows) rows = '<tr><td colspan="14">' + window.TCSUI.empty('暂无数据', '请调整筛选条件后重新查询。') + '</td></tr>';
    return [
      '<section class="card content-card sit-table-card">',
        '<div class="table-toolbar table-toolbar--start"><button class="btn btn-primary" id="new-approval" type="button">新建审批</button><a class="btn btn-default" id="points-flow-review-link" href="docs/points-flow/index.html">查看积分发放流程图</a></div>',
        '<div class="table-wrapper"><table class="data-table plan-approval-table" aria-label="调查方案审批列表">',
          '<thead><tr><th>审批单号</th><th>审批名称</th><th>审批单创建时间</th><th>问卷ID</th><th>审批推送ID</th><th>状态</th><th>当前审批人</th><th>提交审批时间</th><th>完成审批时间</th><th>推送状态</th><th>开启推送时间</th><th>推送规则</th><th>点评奖励</th><th>操作</th></tr></thead>',
          '<tbody>', rows, '</tbody>',
        '</table></div>',
        '<div class="pagination"><span>共 ', filtered.length, ' 条</span><button class="btn btn-sm btn-primary" type="button">1</button><span>20 条/页</span></div>',
      '</section>'
    ].join('');
  }

  function render() {
    var records = approvalRecords();
    return [
      renderFilters(records),
      renderTable(records)
    ].join('');
  }

  function samplingFields(draft) {
    return [
      '<div class="subsection" data-feature="F-10">',
        '<h3>分层抽样</h3>',
        '<div class="switch-row"><div><strong>启用分层抽样</strong></div><label class="switch"><input id="modal-sampling-enabled" type="checkbox"', draft.samplingEnabled ? ' checked' : '', '><span></span></label></div>',
        '<div id="modal-sampling-fields" class="form-grid form-grid--2">',
          '<label class="field"><span class="field__label">C（抽样比例）</span><div class="input-suffix"><input id="modal-ratio" class="form-input" type="number" min="0" max="100" step="1" value="', escape(draft.ratio), '"><span>%</span></div></label>',
          '<label class="field"><span class="field__label">Lwr（小区最低样本数）</span><div class="input-suffix"><input id="modal-lower" class="form-input" type="number" min="0" step="1" value="', draft.lowerBound === null ? '' : escape(draft.lowerBound), '"><span>份</span></div></label>',
        '</div>',
      '</div>'
    ].join('');
  }

  function normalizedPushMode(value) {
    return value === 'random' || /随机/.test(String(value || '')) ? 'random' : 'fixed';
  }

  function timeOptions(count, selected, paddedLabel) {
    var choices = [];
    for (var value = 0; value < count; value += 1) {
      var code = ('0' + value).slice(-2);
      choices.push(option(code, paddedLabel ? code : String(value), selected));
    }
    return choices.join('');
  }

  function pushRuleFields(draft) {
    var mode = normalizedPushMode(draft.pushMode);
    var time = String(draft.time || '10:00').split(':');
    var randomTime = String(draft.randomTime || '').split(':');
    var recurringEnabled = draft.recurringEnabled !== false;
    return [
      '<div class="push-rule-row"><span class="push-rule-label">定时循环推送：</span>',
        '<label class="switch push-rule-switch"><input id="modal-recurring-enabled" type="checkbox" aria-label="定时循环推送"', recurringEnabled ? ' checked' : '', '><span aria-hidden="true"></span></label>',
      '</div>',
      '<div id="modal-push-settings"', recurringEnabled ? '' : ' class="is-hidden"', '>',
        '<div class="push-rule-row"><label class="push-rule-label" for="modal-push-mode">推送安排：</label><select id="modal-push-mode" class="form-select push-rule-mode">', option('fixed', '固定星期', mode), option('random', '基准日＋每 VIN 随机偏移', mode), '</select></div>',
        '<div class="push-rule-schedule">',
          '<div id="modal-fixed-date" class="push-rule-weekly', mode === 'fixed' ? '' : ' is-hidden', '">',
            '<label class="push-rule-unit">每周 <select id="modal-weekday" class="form-select" aria-label="每周星期">', ['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map(function (day) { return option(day, day.slice(1), draft.weekday); }).join(''), '</select></label>',
            '<label class="push-rule-unit"><select id="modal-push-hour" class="form-select" aria-label="推送小时">', timeOptions(24, ('0' + time[0]).slice(-2), false), '</select> 时</label>',
            '<label class="push-rule-unit"><select id="modal-push-minute" class="form-select" aria-label="推送分钟">', timeOptions(60, time[1] || '00', true), '</select> 分</label>',
            '<input id="modal-push-time" type="hidden" value="', escape(draft.time || '10:00'), '">',
          '</div>',
          '<label class="push-rule-threshold"><span id="modal-base-prefix">', mode === 'fixed' ? '执行推送时且需满足大于或等于交车时间的' : '基准推送日为交车时间后', '</span> <span class="push-rule-unit"><input id="modal-base-days" class="form-input" type="number" min="1" step="1" aria-label="交车后基准天数" value="', escape(draft.baseDays), '"> 天</span></label>',
        '</div>',
        '<div id="modal-random-date" class="push-rule-random', mode === 'random' ? '' : ' is-hidden', '">',
          '<label class="push-rule-unit">d（随机天数范围） <input id="modal-random-days" class="form-input" type="number" min="0" step="1" value="', escape(draft.randomDays), '"> 天</label>',
          '<div class="push-rule-random-time"><span>推送时间 <em>*</em></span>',
            '<label class="push-rule-unit"><select id="modal-random-hour" class="form-select" aria-label="随机推送小时"><option value="">选择小时</option>', timeOptions(24, randomTime[0], true), '</select> 时</label>',
            '<label class="push-rule-unit"><select id="modal-random-minute" class="form-select" aria-label="随机推送分钟"><option value="">选择分钟</option>', timeOptions(60, randomTime[1], true), '</select> 分</label>',
            '<input id="modal-random-time" type="hidden" value="', escape(draft.randomTime || ''), '">',
          '</div>',
          '<details class="push-date-examples"><summary>查看推送时刻示例</summary><div id="modal-push-date-examples"></div></details>',
        '</div>',
      '</div>',
      '<p id="modal-push-disabled-note" class="field__hint push-rule-note', recurringEnabled ? ' is-hidden' : '', '">已关闭定时循环推送</p>'
    ].join('');
  }

  function pushRuleDetail(record) {
    var mode = normalizedPushMode(record.pushMode);
    return [
      '<section class="detail-section push-rule-detail"><h3 data-anno="plan-push-detail">推送规则</h3>',
        '<dl class="detail-list"><div><dt>定时循环推送</dt><dd>', record.recurringEnabled === false ? '否' : '是', '</dd></div>',
        '<div><dt>推送安排</dt><dd>', mode === 'random' ? '基准日＋每 VIN 随机偏移' : '固定星期', '</dd></div>',
        mode === 'fixed' ? '<div><dt>每周执行时间</dt><dd>' + escape(record.weekday) + ' ' + escape(record.time) + '</dd></div>' : '',
        '<div><dt>', mode === 'fixed' ? '交车后天数条件' : '交车后基准天数', '</dt><dd>', mode === 'fixed' ? '执行推送时距离交车时间大于或等于 ' : '', escape(record.baseDays), ' 天</dd></div>',
        mode === 'random' ? '<div><dt>随机偏移范围</dt><dd>0～' + escape(record.randomDays) + ' 整数天（含两端）</dd></div><div><dt>推送时间</dt><dd>' + escape(record.randomTime || '待配置') + '</dd></div>' : '',
        '</dl>',
      '</section>'
    ].join('');
  }

  function approvalModal(record) {
    var state = getState();
    var stateDraft = state.planDraft || {};
    var source = record || {};
    var recordPushMode = pick(source, ['pushMode', 'randomPushMode'], '');
    var recordPushChannel = pick(source, ['pushChannel', 'channel'], stateDraft.pushChannel || '服务号模板消息');
    var draft = record ? {
      samplingEnabled: pick(source, ['samplingEnabled'], stateDraft.samplingEnabled !== false),
      recurringEnabled: pick(source, ['recurringEnabled'], true) !== false,
      ratio: pick(source, ['ratio', 'samplingRatio'], stateDraft.ratio === undefined ? 35 : stateDraft.ratio),
      lowerBound: hasOwn(source, 'lowerBound') ? source.lowerBound : (stateDraft.lowerBound === undefined ? 20 : stateDraft.lowerBound),
      pushMode: normalizedPushMode(recordPushMode || stateDraft.pushMode),
      baseDays: pick(source, ['baseDays'], stateDraft.baseDays || 75),
      weekday: pick(source, ['weekday'], stateDraft.weekday || '周三'),
      time: pick(source, ['time', 'pushTime'], stateDraft.time || '10:00'),
      randomTime: hasOwn(source, 'randomTime') ? source.randomTime : '',
      randomDays: pick(source, ['randomDays'], stateDraft.randomDays === undefined ? 15 : stateDraft.randomDays),
      pushChannel: recordPushChannel
    } : stateDraft;
    var editing = Boolean(record);
    var name = record ? record.name : (draft.name || '');
    var questionnaireId = record ? record.questionnaireId : (stateDraft.questionnaireId || 'Q-DEMO-0108');
    var questionnaireChoices = [
      { value: 'Q-DEMO-0108', label: '首保回访调查（Mock）' },
      { value: 'Q-DEMO-0112', label: '交车后回访调查（Mock）' },
      { value: 'QNR-DEMO-1028', label: '首保回访调查（Mock）' },
      { value: 'QNR-DEMO-1019', label: '交车后回访调查（Mock）' },
      { value: 'QNR-DEMO-0996', label: '到店服务体验调查（Mock）' }
    ];
    if (!questionnaireChoices.some(function (item) { return item.value === questionnaireId; })) {
      questionnaireChoices.push({ value: questionnaireId, label: questionnaireId + '（当前 Mock）' });
    }
    var rewardMode = /^(是|开启)/.test(String(record ? record.reward : stateDraft.reward || '开启')) ? '开启' : '关闭';
    window.openOverlay([
      '<header class="modal-header"><div><h2>', editing ? '编辑调查方案审批' : '新建调查方案审批', '</h2></div><button class="btn btn-link" type="button" data-close-overlay>关闭</button></header>',
      '<form id="approval-form" class="modal-body long-form" novalidate>',
        '<section class="form-section"><h3>基础信息</h3><div class="form-grid form-grid--2">',
          '<label class="field"><span class="field__label">审批名称 <em>*</em></span><input id="modal-approval-name" class="form-input" maxlength="30" value="', escape(name), '"></label>',
          '<label class="field field--full"><span class="field__label">审批说明</span><textarea id="modal-description" class="form-textarea" maxlength="500">用于调查方案审批的 Mock 说明。</textarea></label>',
        '</div></section>',
        '<section class="form-section"><h3>选择调查方案</h3><div class="form-grid form-grid--2">',
          '<label class="field"><span class="field__label">调查方案 <em>*</em></span><select id="modal-survey" class="form-select">', questionnaireChoices.map(function (item) { return option(item.value, item.label, questionnaireId); }).join(''), '</select></label>',
          '<label class="field"><span class="field__label">品牌</span><select class="form-select"><option>东风日产</option><option>启辰</option></select></label>',
        '</div></section>',
        '<section class="form-section">', samplingFields({
          samplingEnabled: draft.samplingEnabled !== false,
          ratio: draft.ratio === undefined ? 35 : draft.ratio,
          lowerBound: draft.lowerBound === undefined ? 20 : draft.lowerBound,
          pushMode: draft.pushMode || 'fixed',
          baseDays: draft.baseDays || 75,
          weekday: draft.weekday || '周三',
          time: draft.time || '10:00',
          randomDays: draft.randomDays === undefined ? 15 : draft.randomDays
        }), '</section>',
        '<section class="form-section push-rule-section" data-feature="F-11"><h3>推送规则</h3>', pushRuleFields({
          recurringEnabled: draft.recurringEnabled !== false,
          pushMode: normalizedPushMode(draft.pushMode),
          baseDays: draft.baseDays === undefined ? 75 : draft.baseDays,
          weekday: draft.weekday || '周三',
          time: draft.time || '10:00',
          randomTime: draft.randomTime === undefined ? '' : draft.randomTime,
          randomDays: draft.randomDays === undefined ? 15 : draft.randomDays
        }), '</section>',
        '<section class="form-section"><h3>选择推送方式</h3><div class="checkbox-row"><label><input type="radio" name="push-channel" value="服务号模板消息"', (draft.pushChannel || '服务号模板消息') === '服务号模板消息' ? ' checked' : '', '> 服务号模板消息</label><label><input type="radio" name="push-channel" value="短信"', draft.pushChannel === '短信' ? ' checked' : '', '> 短信</label><label><input type="radio" name="push-channel" value="App Push"', /app push/i.test(draft.pushChannel || '') ? ' checked' : '', '> app push消息</label></div>',
          '<div class="dynamic-parameter-grid"><label><span>VIN</span><input class="form-input" value="{distinct_id}" readonly></label><label><span>新车交车时间</span><input class="form-input" value="{d_delivery_date}" readonly></label><label><span>姓名</span><input class="form-input" value="{s_cust_name}" readonly></label><label><span>车系</span><input class="form-input" value="{s_cust_car_series}" readonly></label></div>',
          '<div class="form-grid form-grid--2"><label class="field"><span class="field__label">消息模板</span><select class="form-select"><option>调查邀请模板（Mock）</option></select></label><span></span>',
          '<label class="field"><span class="field__label">预览模板消息</span><textarea class="form-textarea" readonly>您好，{{姓名}}，邀请您参与 {{车系}} 服务调查。</textarea></label><label class="field"><span class="field__label">设置模板消息</span><textarea class="form-textarea">您好，{{姓名}}，邀请您参与 {{车系}} 服务调查。</textarea></label></div>',
          '<div class="switch-row"><div><strong>推送失败时启用备用通道</strong></div><label class="switch"><input type="checkbox"><span></span></label></div>',
          '<div class="switch-row"><div><strong>失败后再推送</strong></div><label class="switch"><input type="checkbox"><span></span></label></div>',
        '</section>',
        '<section class="form-section"><h3>点评奖励</h3><div class="form-grid form-grid--2"><label class="field"><span class="field__label">是否开启</span><select id="modal-reward" class="form-select">', option('开启', '开启', rewardMode), option('关闭', '关闭', rewardMode), '</select></label><label class="field"><span class="field__label">奖励配置</span><select class="form-select"><option>积分 100（Mock）</option></select></label></div></section>',
        '<section class="form-section"><h3>审批流程</h3><div class="form-grid form-grid--2"><label class="field"><span class="field__label">审批人 <em>*</em></span><select class="form-select"><option>审批人A（Mock）</option></select></label><label class="field"><span class="field__label">流程</span><input class="form-input" value="申请人、审批人" readonly></label></div></section>',
      '</form>',
      '<footer class="modal-footer"><button class="btn" type="button" data-close-overlay>取消</button><button class="btn btn-primary" id="save-approval" type="button">保存</button></footer>'
    ].join(''), { label: editing ? '编辑调查方案审批' : '新建调查方案审批', className: 'modal-content--wide' });

    bindModalInteractions(record);
  }

  function inputValue(id) {
    var node = document.getElementById(id);
    return node ? node.value : '';
  }

  function checkedValue(name) {
    var node = document.querySelector('input[name="' + name + '"]:checked');
    return node ? node.value : '';
  }

  function modalToggle() {
    var enabled = document.getElementById('modal-sampling-enabled');
    var fields = document.getElementById('modal-sampling-fields');
    var mode = inputValue('modal-push-mode') || 'fixed';
    if (fields) {
      fields.classList.toggle('is-disabled', enabled && !enabled.checked);
      Array.prototype.forEach.call(fields.querySelectorAll('input'), function (input) { input.disabled = enabled && !enabled.checked; });
    }
    var fixed = document.getElementById('modal-fixed-date');
    var random = document.getElementById('modal-random-date');
    var recurring = document.getElementById('modal-recurring-enabled');
    var settings = document.getElementById('modal-push-settings');
    var disabledNote = document.getElementById('modal-push-disabled-note');
    var basePrefix = document.getElementById('modal-base-prefix');
    if (fixed) fixed.classList.toggle('is-hidden', mode !== 'fixed');
    if (random) random.classList.toggle('is-hidden', mode !== 'random');
    if (settings) settings.classList.toggle('is-hidden', recurring && !recurring.checked);
    if (disabledNote) disabledNote.classList.toggle('is-hidden', !recurring || recurring.checked);
    if (basePrefix) basePrefix.textContent = mode === 'fixed' ? '执行推送时且需满足大于或等于交车时间的' : '基准推送日为交车时间后';
    updatePushDateExamples();
  }

  function updatePushDateExamples() {
    var target = document.getElementById('modal-push-date-examples');
    if (!target) return;
    var examples = window.TCSData && window.TCSData.pushDateExamples || [];
    var baseText = inputValue('modal-base-days').trim();
    var daysText = inputValue('modal-random-days').trim();
    var base = baseText === '' ? NaN : Number(baseText);
    var days = daysText === '' ? NaN : Number(daysText);
    var randomTime = inputValue('modal-random-time');
    var hasTime = /^([01]\d|2[0-3]):[0-5]\d$/.test(randomTime);
    var rows = examples.map(function (item) {
      var dates = window.TCSPushDate && window.TCSPushDate.range(item.tqmpDeliveryDateMock, base, days);
      var ready = dates && dates.ok && hasTime;
      return '<tr><td>' + escape(item.vin) + '</td><td>' + escape(item.tqmpDeliveryDateMock) + '</td><td>' + escape(ready ? dates.earliest + ' ' + randomTime : '日期或时间待配置') + '</td><td>' + escape(ready ? dates.latest + ' ' + randomTime : '日期或时间待配置') + '</td></tr>';
    }).join('');
    target.innerHTML = '<div class="table-wrapper"><table class="data-table"><thead><tr><th>示例 VIN</th><th>交车日期</th><th>偏移 0 天的推送时刻</th><th>偏移 ' + escape(Number.isInteger(days) ? days : 'd') + ' 天的推送时刻</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
  }

  function syncPushTime() {
    var hour = document.getElementById('modal-push-hour');
    var minute = document.getElementById('modal-push-minute');
    var time = document.getElementById('modal-push-time');
    if (hour && minute && time) time.value = hour.value + ':' + minute.value;
  }

  function syncRandomTime() {
    var hour = document.getElementById('modal-random-hour');
    var minute = document.getElementById('modal-random-minute');
    var time = document.getElementById('modal-random-time');
    if (hour && minute && time) time.value = hour.value && minute.value ? hour.value + ':' + minute.value : '';
    updatePushDateExamples();
  }

  function bindModalInteractions(record) {
    var samplingSwitch = document.getElementById('modal-sampling-enabled');
    var pushMode = document.getElementById('modal-push-mode');
    var save = document.getElementById('save-approval');
    if (samplingSwitch) samplingSwitch.addEventListener('change', modalToggle);
    if (pushMode) pushMode.addEventListener('change', modalToggle);
    var recurringSwitch = document.getElementById('modal-recurring-enabled');
    if (recurringSwitch) recurringSwitch.addEventListener('change', modalToggle);
    ['modal-push-hour', 'modal-push-minute'].forEach(function (id) {
      var field = document.getElementById(id);
      if (field) field.addEventListener('change', syncPushTime);
    });
    ['modal-random-hour', 'modal-random-minute'].forEach(function (id) {
      var field = document.getElementById(id);
      if (field) field.addEventListener('change', syncRandomTime);
    });
    ['modal-base-days', 'modal-random-days'].forEach(function (id) {
      var field = document.getElementById(id);
      if (field) field.addEventListener('input', updatePushDateExamples);
    });
    if (save) save.addEventListener('click', function () { saveApproval(record); });
    syncRandomTime();
    modalToggle();
  }

  function saveApproval(record) {
    var name = inputValue('modal-approval-name').trim();
    var ratio = Number(inputValue('modal-ratio'));
    var lowerText = inputValue('modal-lower').trim();
    var lower = lowerText === '' ? null : Number(lowerText);
    var enabledNode = document.getElementById('modal-sampling-enabled');
    var recurringNode = document.getElementById('modal-recurring-enabled');
    var state = getState();
    var recurringEnabled = recurringNode ? recurringNode.checked : pick(record || state.planDraft || {}, ['recurringEnabled'], true) !== false;
    var rewardDisplay = inputValue('modal-reward') === '开启' ? '是' : '否';
    var pushMode = normalizedPushMode(inputValue('modal-push-mode'));
    var baseDaysText = inputValue('modal-base-days').trim();
    var randomDaysText = inputValue('modal-random-days').trim();
    var baseDays = baseDaysText === '' ? NaN : Number(baseDaysText);
    var randomDays = randomDaysText === '' ? NaN : Number(randomDaysText);
    syncPushTime();
    syncRandomTime();
    var randomTime = inputValue('modal-random-time');
    var id;
    if (!name) {
      window.showToast('请填写审批名称。', 'warning');
      return;
    }
    if (enabledNode && enabledNode.checked && (!Number.isInteger(ratio) || ratio < 0 || ratio > 100)) {
      window.showToast('抽样比例请输入 0～100 的整数。', 'warning');
      return;
    }
    if (enabledNode && enabledNode.checked && lower !== null && (!Number.isInteger(lower) || lower < 0)) {
      window.showToast('小区最低样本数请输入非负整数或留空。', 'warning');
      return;
    }
    if (recurringEnabled && (!Number.isInteger(baseDays) || baseDays < 1)) {
      window.showToast('交车后基准天数请输入大于 0 的整数。', 'warning');
      return;
    }
    if (recurringEnabled && pushMode === 'fixed' && (!/^([01]\d|2[0-3]):[0-5]\d$/.test(inputValue('modal-push-time')) || !/^周[一二三四五六日]$/.test(inputValue('modal-weekday')))) {
      window.showToast('请选择每周执行的星期、小时和分钟。', 'warning');
      return;
    }
    if (recurringEnabled && pushMode === 'random' && (!Number.isInteger(randomDays) || randomDays < 0)) {
      window.showToast('随机天数范围请输入非负整数。', 'warning');
      return;
    }
    if (recurringEnabled && pushMode === 'random' && !/^([01]\d|2[0-3]):[0-5]\d$/.test(randomTime)) {
      window.showToast('请选择随机日期的推送小时和分钟。', 'warning');
      return;
    }
    var savedConfig = {
      name: name,
      code: pick(state.planDraft || {}, ['code'], 'TCS-PLAN-DEMO'),
      samplingEnabled: Boolean(enabledNode && enabledNode.checked),
      recurringEnabled: recurringEnabled,
      ratio: ratio,
      lowerBound: lower,
      pushMode: record && normalizedPushMode(record.pushMode) === pushMode ? record.pushMode : pushMode,
      baseDays: baseDays,
      weekday: inputValue('modal-weekday'),
      time: inputValue('modal-push-time'),
      randomTime: randomTime,
      randomDays: randomDays,
      pushChannel: checkedValue('push-channel') || '服务号模板消息'
    };
    if (record) {
      var previousEdit = state.approvalEdits[record.id] || {};
      var nextEdit = {
        name: name,
        questionnaireId: inputValue('modal-survey'),
        pushRule: '定时循环推送',
        recurringEnabled: savedConfig.recurringEnabled,
        reward: rewardDisplay,
        samplingEnabled: savedConfig.samplingEnabled,
        ratio: savedConfig.ratio,
        lowerBound: savedConfig.lowerBound,
        pushMode: savedConfig.pushMode,
        baseDays: savedConfig.baseDays,
        weekday: savedConfig.weekday,
        time: savedConfig.time,
        randomTime: savedConfig.randomTime,
        randomDays: savedConfig.randomDays,
        pushChannel: savedConfig.pushChannel
      };
      Object.keys(nextEdit).forEach(function (key) { previousEdit[key] = nextEdit[key]; });
      state.approvalEdits[record.id] = previousEdit;
    } else {
      var savedDraft = {};
      Object.keys(state.planDraft || {}).forEach(function (key) { savedDraft[key] = state.planDraft[key]; });
      Object.keys(savedConfig).forEach(function (key) { savedDraft[key] = savedConfig[key]; });
      state.planDraft = savedDraft;
      id = 'TCS-AP-DEMO-' + String(Date.now()).slice(-6);
      state.approvalAdded.unshift({
        approvalNo: id,
        name: name,
        createdAt: '刚刚（本页 Mock）',
        questionnaireId: inputValue('modal-survey'),
        pushId: '—',
        status: '待提交',
        approver: '—',
        submittedAt: '—',
        completedAt: '—',
        pushStatus: '未开启',
        pushStartAt: '—',
        pushRule: '定时循环推送',
        recurringEnabled: savedConfig.recurringEnabled,
        reward: rewardDisplay,
        samplingEnabled: savedConfig.samplingEnabled,
        ratio: savedConfig.ratio,
        lowerBound: savedConfig.lowerBound,
        pushMode: savedConfig.pushMode,
        baseDays: savedConfig.baseDays,
        weekday: savedConfig.weekday,
        time: savedConfig.time,
        randomTime: savedConfig.randomTime,
        randomDays: savedConfig.randomDays,
        pushChannel: savedConfig.pushChannel,
        snapshotId: '—'
      });
    }
    window.closeOverlay();
    window.TCSApp.render();
    window.showToast('审批草稿已保存（Mock）。');
  }

  function findRecord(id) {
    return approvalRecords().filter(function (record) { return record.id === id; })[0] || null;
  }

  function showDetail(record) {
    var defaultSnapshot = window.TCSData && window.TCSData.organizationSnapshot || {};
    var snapshotMap = window.TCSData && window.TCSData.organizationSnapshots || {};
    var recordSnapshotId = pick(record, ['snapshotId'], pick(record.raw, ['snapshotId'], '—'));
    var snapshotSource = snapshotMap[recordSnapshotId] || (defaultSnapshot.snapshotId === recordSnapshotId ? defaultSnapshot : {});
    var snapshot = window.TCSOrganizationSnapshot ? window.TCSOrganizationSnapshot.capture(snapshotSource) : snapshotSource;
    var hasSnapshot = Boolean(snapshot && snapshot.status === 'frozen');
    var snapshotRecords = Array.isArray(snapshot.records) ? snapshot.records : [];
    var changedStores = hasSnapshot && window.TCSOrganizationSnapshot ? window.TCSOrganizationSnapshot.compare(snapshot, window.TCSData && window.TCSData.latestOrganizationLookup).filter(function (item) { return item.changed; }) : [];
    var regionCount = {};
    var districtCount = {};
    snapshotRecords.forEach(function (item) {
      if (item.region) regionCount[item.region] = true;
      if (item.district) districtCount[item.district] = true;
    });
    window.openOverlay([
      '<header class="modal-header"><div><h2>审批详情</h2><p class="modal-caption">', escape(record.approvalNo), '</p></div><button class="btn btn-link" type="button" data-close-overlay>关闭</button></header>',
      '<div class="modal-body">',
        '<section class="detail-section"><h3>基础信息</h3><dl class="detail-list"><div><dt>审批名称</dt><dd>', escape(record.name), '</dd></div><div><dt>审批状态</dt><dd>', window.TCSUI.tag(record.status, statusTone(record.status)), '</dd></div><div><dt>问卷ID</dt><dd>', escape(record.questionnaireId), '</dd></div><div><dt>当前审批人</dt><dd>', escape(record.approver), '</dd></div></dl></section>',
        '<section class="detail-section"><h3>调查方案</h3><dl class="detail-list"><div><dt>推送方式</dt><dd>', escape(record.pushChannel || '服务号模板消息'), '（Mock）</dd></div><div><dt>消息模板</dt><dd>调查邀请模板（Mock）</dd></div><div><dt>点评奖励</dt><dd>', escape(record.reward), '</dd></div></dl></section>',
        '<section class="detail-section monthly-sampling-config"><h3>方案抽样配置</h3><dl class="detail-list"><div><dt>分层抽样</dt><dd>', record.samplingEnabled ? '启用' : '关闭（不执行分层抽样计算）', '</dd></div><div><dt>C（抽样比例）</dt><dd>', escape(record.ratio), '%</dd></div><div><dt>Lwr（小区最低样本数）</dt><dd>', record.lowerBound === null ? '空值（执行含义待确认）' : escape(record.lowerBound) + ' 份', '</dd></div></dl></section>',
        pushRuleDetail(record),
        '<section class="detail-section" data-feature="F-12"><h3 data-anno="plan-organization-snapshot">区域快照</h3>',
          '<dl class="detail-list"><div><dt>状态</dt><dd>', hasSnapshot ? '已取得并冻结' : '未取得', '</dd></div><div><dt>快照标识</dt><dd>', escape(hasSnapshot ? recordSnapshotId : '—'), '</dd></div><div><dt>来源</dt><dd>', escape(hasSnapshot ? snapshot.sourceSystem : '—'), '</dd></div><div><dt>取得时间</dt><dd>', escape(hasSnapshot ? snapshot.acquiredAt : '—'), '</dd></div><div><dt>冻结时间</dt><dd>', escape(hasSnapshot ? snapshot.frozenAt : '—'), '</dd></div><div><dt>覆盖范围</dt><dd>', hasSnapshot ? Object.keys(regionCount).length + ' 个大区 / ' + Object.keys(districtCount).length + ' 个小区 / ' + snapshotRecords.length + ' 条门店' : '—', '</dd></div></dl>',
          changedStores.length ? '<div class="table-wrapper snapshot-diff"><table class="data-table"><thead><tr><th>门店</th><th>本次冻结区域</th><th>营销平台最新区域</th></tr></thead><tbody>' + changedStores.map(function (item) { return '<tr><td>' + escape(item.storeName || item.storeCode) + '</td><td>' + escape(item.frozen) + '</td><td>' + escape(item.latest) + '</td></tr>'; }).join('') + '</tbody></table></div>' : '',
        '</section>',
        '<section class="detail-section"><h3>审批进度</h3><div class="approval-timeline"><span>创建审批单</span><span>提交审批</span><span>审批完成</span></div></section>',
      '</div>',
      '<footer class="modal-footer"><button class="btn btn-primary" type="button" data-close-overlay>关闭</button></footer>'
    ].join(''), { label: '审批详情', className: 'modal-content--wide' });
  }

  function showCommentData(record) {
    window.openOverlay([
      '<header class="modal-header"><div><h2>点评数据</h2><p class="modal-caption">', escape(record.name), '</p></div><button class="btn btn-link" type="button" data-close-overlay>关闭</button></header>',
      '<div class="modal-body"><div class="stats-grid"><article class="stat-card"><span>未填写</span><strong>12</strong></article><article class="stat-card"><span>填写中</span><strong>3</strong></article><article class="stat-card"><span>已完成</span><strong>85</strong></article></div>',
      '</div>',
      '<footer class="modal-footer"><button class="btn btn-primary" type="button" data-close-overlay>返回</button></footer>'
    ].join(''), { label: '点评数据' });
  }

  function showLink(record) {
    window.openOverlay([
      '<header class="modal-header"><div><h2>引流链接</h2><p class="modal-caption">', escape(record.approvalNo), '</p></div><button class="btn btn-link" type="button" data-close-overlay>关闭</button></header>',
      '<div class="modal-body"><label class="field"><span class="field__label">链接（Mock）</span><input class="form-input" value="https://example.invalid/tcs/survey/', escape(record.id), '" readonly></label></div>',
      '<footer class="modal-footer"><button class="btn btn-primary" type="button" data-close-overlay>关闭</button></footer>'
    ].join(''), { label: '引流链接' });
  }

  function applyFilters() {
    filters.status = inputValue('filter-status') || 'all';
    filters.pushStatus = inputValue('filter-push-status') || 'all';
    filters.pushRule = inputValue('filter-push-rule') || 'all';
    filters.reward = inputValue('filter-reward') || 'all';
    window.TCSApp.render();
  }

  function resetFilters() {
    filters = { status: 'all', pushStatus: 'all', pushRule: 'all', reward: 'all' };
    window.TCSApp.render();
    window.showToast('筛选条件已重置。');
  }

  function handleAction(event) {
    var action = event.currentTarget.getAttribute('data-plan-action');
    var id = event.currentTarget.getAttribute('data-plan-id');
    var record = findRecord(id);
    var state = getState();
    if (!record) return;
    if (action === 'edit') approvalModal(record);
    if (action === 'detail') showDetail(record);
    if (action === 'comment-data') showCommentData(record);
    if (action === 'link') showLink(record);
    if (action === 'push-data') {
      state.selectedApprovalId = record.id;
      state.selectedScenarioId = record.scenarioId || '';
      window.TCSApp.navigate('sampling');
    }
    if (action === 'submit') {
      state.approvalEdits[record.id] = state.approvalEdits[record.id] || {};
      state.approvalEdits[record.id].status = '审批中';
      state.approvalEdits[record.id].submittedAt = '刚刚（本页 Mock）';
      window.TCSApp.render();
      window.showToast('已记录提交审批操作（Mock）。');
    }
    if (action === 'start-push') {
      if (record.recurringEnabled !== false && normalizedPushMode(record.pushMode) === 'random' && !/^([01]\d|2[0-3]):[0-5]\d$/.test(String(record.randomTime || ''))) {
        window.showToast('请先编辑推送规则，配置随机日期的推送时间。', 'warning');
        return;
      }
      state.approvalEdits[record.id] = state.approvalEdits[record.id] || {};
      state.approvalEdits[record.id].pushStatus = '推送中';
      state.approvalEdits[record.id].pushStartAt = '刚刚（本页 Mock）';
      window.TCSApp.render();
      window.showToast('已更新为推送中（Mock）。');
    }
    if (action === 'reward') window.showToast('已记录补发奖励请求（Mock，未调用服务）。');
  }

  function init() {
    var query = document.getElementById('query-plan');
    var reset = document.getElementById('reset-plan-filters');
    var collapse = document.getElementById('collapse-plan-filters');
    var create = document.getElementById('new-approval');
    var actionButtons = document.querySelectorAll('[data-plan-action]');
    if (query) query.addEventListener('click', applyFilters);
    if (reset) reset.addEventListener('click', resetFilters);
    if (create) create.addEventListener('click', function () { approvalModal(null); });
    if (collapse) collapse.addEventListener('click', function () {
      var fields = document.getElementById('plan-filter-fields');
      if (!fields) return;
      fields.classList.toggle('is-hidden');
      collapse.textContent = fields.classList.contains('is-hidden') ? '展开' : '收起';
    });
    Array.prototype.forEach.call(actionButtons, function (button) { button.addEventListener('click', handleAction); });
  }

  window.Pages.plan = { render: render, init: init };
})();
