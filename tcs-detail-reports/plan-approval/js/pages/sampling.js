(function () {
  'use strict';

  window.Pages = window.Pages || {};

  var filters = {
    vin: '',
    phone: '',
    status: 'all'
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
    return window.TCSData.state;
  }

  function fallbackApproval() {
    return {
      id: 'TCS-AP-DEMO-090201',
      approvalNo: 'TCS-AP-DEMO-090201',
      name: '2026年首保回访调查',
      pushId: 'PUSH-DEMO-801',
      scenarioId: 'coverage'
    };
  }

  function normalizeApproval(record, index) {
    var id = pick(record, ['approvalNo', 'approvalId', 'id', 'no'], 'TCS-AP-DEMO-' + (index + 1));
    return {
      id: String(id),
      approvalNo: id,
      name: pick(record, ['name', 'approvalName', 'title'], '未命名审批'),
      pushId: pick(record, ['pushId', 'approvalPushId', 'pushApprovalId'], '—'),
      scenarioId: pick(record, ['scenarioId', 'samplingScenarioId'], ''),
      samplingEnabled: hasOwn(record, 'samplingEnabled') ? Boolean(record.samplingEnabled) : true,
      ratio: hasOwn(record, 'samplingRatio') ? record.samplingRatio : pick(record, ['ratio'], 35),
      lowerBound: hasOwn(record, 'lowerBound') ? record.lowerBound : 20
    };
  }

  function currentApproval() {
    var state = getState();
    var source = window.TCSData && Array.isArray(window.TCSData.approvalRecords) ? window.TCSData.approvalRecords.slice() : [];
    if (Array.isArray(state.approvalAdded)) source = source.concat(state.approvalAdded);
    var records = source.map(normalizeApproval).map(function (record) {
      var edit = state.approvalEdits && state.approvalEdits[record.id];
      Object.keys(edit || {}).forEach(function (key) { record[key] = edit[key]; });
      return record;
    });
    var selected = records.filter(function (record) { return record.id === state.selectedApprovalId; })[0];
    return selected || records[0] || fallbackApproval();
  }

  function fallbackPushRecords() {
    return [
      { id: 'PD-DEMO-0001', approvalNo: 'TCS-AP-DEMO-090201', pushId: 'PUSH-DEMO-801-001', channel: '服务号模板消息', status: '推送成功', plannedAt: '2026-09-02 10:00:00', sentAt: '2026-09-02 10:00:06', error: '—', vin: 'LGBH52E0•••8K3A', phone: '138•••5678', customerName: '客户A（Mock）', vehicleSeries: '轩逸（Mock）', province: '上海市', city: '上海市', region: '华东一区', district: '沪东小区' },
      { id: 'PD-DEMO-0002', approvalNo: 'TCS-AP-DEMO-090201', pushId: 'PUSH-DEMO-801-002', channel: 'app push', status: '推送成功', plannedAt: '2026-09-02 10:00:00', sentAt: '2026-09-02 10:00:08', error: '—', vin: 'LGBM41A1•••9C3K', phone: '139•••1236', customerName: '客户B（Mock）', vehicleSeries: '天籁（Mock）', province: '浙江省', city: '杭州市', region: '华东一区', district: '浙北小区' },
      { id: 'PD-DEMO-0003', approvalNo: 'TCS-AP-DEMO-090201', pushId: 'PUSH-DEMO-801-003', channel: '短信', status: '推送失败', plannedAt: '2026-09-02 10:00:00', sentAt: '2026-09-02 10:00:11', error: '演示错误：通道超时', vin: 'LGBN33B0•••7J2T', phone: '136•••9017', customerName: '客户C（Mock）', vehicleSeries: '奇骏（Mock）', province: '江苏省', city: '南京市', region: '华东一区', district: '苏南小区' },
      { id: 'PD-DEMO-0004', approvalNo: 'TCS-AP-DEMO-090201', pushId: 'PUSH-DEMO-801-004', channel: '服务号模板消息', status: '待推送', plannedAt: '2026-09-03 10:00:00', sentAt: '—', error: '—', vin: 'LGBP24C1•••2R5V', phone: '135•••6890', customerName: '客户D（Mock）', vehicleSeries: '逐客（Mock）', province: '安徽省', city: '合肥市', region: '华东一区', district: '皖中小区' }
    ];
  }

  function normalizePush(record, index) {
    var rawStatus = pick(record, ['status', 'pushStatus'], '待推送');
    return {
      id: pick(record, ['id', 'recordId'], 'PD-DEMO-' + (index + 1)),
      approvalNo: pick(record, ['approvalNo', 'approvalId'], ''),
      pushId: pick(record, ['pushId', 'approvalPushId', 'id'], '—'),
      channel: pick(record, ['channel', 'pushChannel', 'pushMethod'], '—'),
      status: rawStatus,
      plannedAt: pick(record, ['plannedAt', 'planPushTime', 'scheduledAt'], '—'),
      sentAt: pick(record, ['sentAt', 'pushTime', 'updatedAt'], '—'),
      error: pick(record, ['error', 'errorMessage', 'failureReason'], '—'),
      vin: pick(record, ['vin', 'vinMasked'], '—'),
      phone: pick(record, ['phone', 'phoneMasked', 'mobile'], '—'),
      customerName: pick(record, ['customerName', 'name'], '—'),
      vehicleSeries: pick(record, ['vehicleSeries', 'carSeries', 'model'], '—'),
      province: pick(record, ['province'], '—'),
      city: pick(record, ['city'], '—'),
      region: pick(record, ['region'], '—'),
      district: pick(record, ['district'], '—'),
      algorithmVersion: pick(record, ['algorithmVersion'], ''),
      randomBasis: pick(record, ['randomBasis'], '')
    };
  }

  function pushRecords() {
    var configured = window.TCSData && Array.isArray(window.TCSData.pushRecords) ? window.TCSData.pushRecords : [];
    var records = (configured.length ? configured : fallbackPushRecords()).map(normalizePush);
    var approval = currentApproval();
    var matched = records.filter(function (record) {
      return !record.approvalNo || record.approvalNo === approval.id || record.approvalNo === approval.approvalNo;
    });
    if (!configured.length) return matched.length ? matched : records;
    if (records.every(function (record) { return !record.approvalNo; })) return records;
    return matched;
  }

  function statusTone(value) {
    var text = String(value || '');
    if (text.indexOf('成功') !== -1) return 'success';
    if (text.indexOf('失败') !== -1) return 'danger';
    if (text.indexOf('待') !== -1 || text.indexOf('未') !== -1) return 'warning';
    return 'info';
  }

  function filteredPushRecords() {
    return pushRecords().filter(function (record) {
      if (filters.status !== 'all' && record.status !== filters.status) return false;
      if (filters.vin && String(record.vin).toLowerCase().indexOf(filters.vin.toLowerCase()) === -1) return false;
      if (filters.phone && String(record.phone).toLowerCase().indexOf(filters.phone.toLowerCase()) === -1) return false;
      return true;
    });
  }

  function uniqueStatuses(records) {
    var seen = {};
    return records.map(function (record) { return record.status; }).filter(function (value) {
      if (!value || seen[value]) return false;
      seen[value] = true;
      return true;
    });
  }

  function renderCounters(records) {
    var success = records.filter(function (record) { return String(record.status).indexOf('成功') !== -1; }).length;
    var failed = records.filter(function (record) { return String(record.status).indexOf('失败') !== -1; }).length;
    return [
      '<div class="sit-counter-row">',
        '<div class="sit-counter"><span>推送成功</span><strong>', success, '</strong></div>',
        '<div class="sit-counter"><span>推送失败</span><strong>', failed, '</strong></div>',
      '</div>'
    ].join('');
  }

  function renderFilters(records) {
    return [
      '<section class="card content-card sit-filter-card"><div class="form-section__body">',
        '<div class="form-grid form-grid--3">',
          '<label class="field"><span class="field__label">VIN</span><input id="push-filter-vin" class="form-input" value="', escape(filters.vin), '" placeholder="请输入 VIN"></label>',
          '<label class="field"><span class="field__label">手机号码</span><input id="push-filter-phone" class="form-input" value="', escape(filters.phone), '" placeholder="请输入手机号码"></label>',
          '<label class="field"><span class="field__label">推送状态</span><select id="push-filter-status" class="form-select"><option value="all">全部</option>', uniqueStatuses(records).map(function (value) { return '<option value="' + escape(value) + '"' + (value === filters.status ? ' selected' : '') + '>' + escape(value) + '</option>'; }).join(''), '</select></label>',
        '</div>',
        '<div class="filter-actions page-actions"><button class="btn" id="reset-push-filter" type="button">重置</button><button class="btn btn-primary" id="query-push" type="button">查询</button></div>',
      '</div></section>'
    ].join('');
  }

  function renderPushTable() {
    var records = filteredPushRecords();
    var rows = records.map(function (record) {
      return [
        '<tr>',
          '<td>', escape(record.pushId), '</td>',
          '<td>', escape(record.channel), '</td>',
          '<td>', window.TCSUI.tag(record.status, statusTone(record.status)), '</td>',
          '<td>', escape(record.plannedAt), '</td>',
          '<td>', escape(record.sentAt), '</td>',
          '<td><span class="truncate-2" title="', escape(record.error), '">', escape(record.error), '</span></td>',
          '<td><span class="cell-title">', escape(record.vin), '</span></td>',
          '<td>', escape(record.phone), '</td>',
          '<td>', escape(record.customerName), '</td>',
          '<td>', escape(record.vehicleSeries), '</td>',
          '<td>', escape(record.province), '</td>',
          '<td>', escape(record.city), '</td>',
          '<td>', escape(record.region), '</td>',
          '<td>', escape(record.district), '</td>',
        '</tr>'
      ].join('');
    }).join('');
    if (!rows) rows = '<tr><td colspan="14">' + window.TCSUI.empty('暂无推送数据', '请调整 VIN、手机号码或推送状态。') + '</td></tr>';
    return [
      '<section class="card content-card sit-table-card">',
        '<div class="table-toolbar"><button class="btn btn-primary" id="back-to-plan" type="button">返回</button><button class="btn btn-primary" id="export-push" type="button">导出</button></div>',
        '<div class="table-wrapper"><table class="data-table" aria-label="推送数据列表"><thead><tr>',
          '<th>审批推送ID</th><th>推送方式</th><th>推送状态</th><th>计划推送时间</th><th>推送时间</th><th>失败原因</th><th>VIN</th><th>手机号码</th><th>客户名称</th><th>车系</th><th>省份</th><th>城市</th><th>大区</th><th>小区</th>',
        '</tr></thead><tbody>', rows, '</tbody></table></div>',
        '<div class="pagination"><span>共 ', records.length, ' 条</span><button class="btn btn-sm btn-primary" type="button">1</button><span>20 条/页</span></div>',
      '</section>'
    ].join('');
  }

  function scenarios() {
    return window.TCSData && Array.isArray(window.TCSData.samplingScenarios) ? window.TCSData.samplingScenarios : [];
  }

  function currentScenario() {
    var state = getState();
    var approval = currentApproval();
    var selectedId = state.selectedScenarioId || approval.scenarioId;
    var selected = scenarios().filter(function (scenario) { return scenario.id === selectedId; })[0];
    var rows = pushRecords();
    var region = rows.length ? rows[0].region : '';
    var byRegion = scenarios().filter(function (scenario) { return region && scenario.regionName === region; })[0];
    return selected || byRegion || scenarios()[0] || null;
  }

  function calculateResult() {
    var scenario = currentScenario();
    if (!scenario || !window.TCSSampling || typeof window.TCSSampling.calculate !== 'function') return null;
    try {
      return window.TCSSampling.calculate(scenario) || null;
    } catch (error) {
      return { error: error && error.message ? error.message : '抽样结果不可用。' };
    }
  }

  function summaryValue(result, keys, fallback) {
    return pick(result && result.summary, keys, fallback === undefined ? 0 : fallback);
  }

  function numberText(value) {
    var number = Number(value);
    return Number.isFinite(number) ? window.formatNumber(number) : '—';
  }

  function normalizeAuditRow(row, index) {
    var scenario = currentScenario() || {};
    var communities = Array.isArray(scenario.communities) ? scenario.communities : [];
    var id = pick(row, ['id', 'communityId', 'districtId', '小区ID'], 'DIST-' + (index + 1));
    var source = communities.filter(function (item) { return item.id === id; })[0] || communities[index] || {};
    return {
      id: id,
      district: pick(row, ['name', 'communityName', 'districtName', '小区'], source.name || id),
      region: scenario.regionName || '—',
      candidate: pick(row, ['S小', 'S', 'candidateCount'], source.candidateCount),
      initial: pick(row, ['A小', 'A', 'initialCount', 'initialSampleCount'], 0),
      category: pick(row, ['分类', 'category', 'classification'], '—'),
      final: pick(row, ['Y', 'finalCount', 'finalSampleCount'], 0),
      reason: pick(row, ['reason', '原因'], '—'),
      vins: auditVins(id, row)
    };
  }

  function auditVins(id, row) {
    var direct = pick(row, ['selectedVins', 'vins', 'vinList', '入选VIN'], null);
    var preview = window.TCSData && window.TCSData.samplingVinPreview || {};
    if (Array.isArray(direct) && direct.length) return direct;
    return Array.isArray(preview[id]) ? preview[id] : [];
  }

  function categoryLabel(value) {
    var map = {
      LOW: '低样本小区',
      AT_BOUND: '等于下限',
      HIGH: '原大样本小区',
      FULL_TAKE: '全量入选',
      NO_LOWER_BOUND: '无下限',
      NOT_CONFIGURED: '无下限'
    };
    return map[value] || value;
  }

  function resultRows(result) {
    var rows = result && Array.isArray(result.rows) ? result.rows : [];
    return rows.map(normalizeAuditRow);
  }

  function renderAuditSection(result) {
    var scenario = currentScenario();
    var algorithmVersion;
    var randomBasis;
    if (!scenario) {
      return '<section class="card content-card" data-feature="F-13 F-14">' + window.TCSUI.notice('单计算单元回归示例未载入', '当前 Mock 数据未提供 samplingScenarios，推送数据列表仍可使用；不代表当前审批的月度结果。', 'warning') + '</section>';
    }
    if (result && result.error) {
      return '<section class="card content-card" data-feature="F-13 F-14">' + window.TCSUI.notice('单计算单元回归示例不可用', result.error, 'warning') + '</section>';
    }
    algorithmVersion = pick(result && result.summary, ['algorithmVersion'], scenario.algorithmVersion || '—');
    randomBasis = scenario.randomBasis || '待确认';
    var rows = resultRows(result);
    var summary = [
      ['S大（合格候选总数）', summaryValue(result, ['S大', 'candidateTotal'])],
      ['U（目标参考值）', summaryValue(result, ['U', 'target', 'targetSampleCount'])],
      ['L（理论最低总量）', summaryValue(result, ['L', 'lowerTotal', 'theoreticalMinimum'])],
      ['Y总（实际样本）', summaryValue(result, ['Y总', 'finalTotal', 'finalSampleTotal'])],
      ['N未（未分配）', summaryValue(result, ['N未', 'unallocated', 'unallocatedCount'])],
      ['O超（超配记录）', summaryValue(result, ['O超', 'overAllocated', 'overallocatedCount'])]
    ].map(function (item) {
      return '<div class="audit-summary-item"><span>' + escape(item[0]) + '</span><strong>' + numberText(item[1]) + '</strong></div>';
    }).join('');
    var body = rows.map(function (row) {
      return [
        '<tr>',
          '<td>', escape(row.region), '</td>',
          '<td>', escape(row.district), '</td>',
          '<td>', numberText(row.candidate), '</td>',
          '<td>', numberText(row.initial), '</td>',
          '<td>', escape(categoryLabel(row.category)), '</td>',
          '<td><strong>', numberText(row.final), '</strong></td>',
          '<td><span class="truncate-2" title="', escape(row.reason), '">', escape(row.reason), '</span></td>',
          '<td><button class="btn btn-link btn-sm" type="button" data-audit-vins="', escape(row.id), '">查看示例（', row.vins.length, '）</button></td>',
        '</tr>'
      ].join('');
    }).join('');
    if (!body) body = '<tr><td colspan="8">暂无小区结果明细。</td></tr>';
    return [
      '<section class="card content-card audit-result" data-feature="F-13 F-14">',
        window.TCSUI.sectionHeader('单计算单元回归示例（原小区算法）', '', '<button class="btn" id="export-audit" type="button">导出回归示例</button>'),
        '<label class="field monthly-example-picker"><span class="field__label">原算法回归场景</span><select id="single-unit-scenario" class="form-select">', scenarios().map(function (item) { return '<option value="' + escape(item.id) + '"' + (item.id === scenario.id ? ' selected' : '') + '>' + escape(item.name) + '</option>'; }).join(''), '</select></label>',
        '<p class="field__hint" id="single-unit-parameters">示例 C（抽样比例）＝', escape(scenario.ratioPercent), '%；Lwr（小区最低样本数）＝', escape(scenario.lowerBound), '</p>',
        '<div class="audit-meta"><span>算法版本：', escape(algorithmVersion), '</span><span>固定顺序 Mock · 非当前审批结果</span></div>',
        '<div class="audit-summary-grid">', summary, '</div>',
        '<div class="table-wrapper"><table class="data-table" aria-label="抽样结果审计表"><thead><tr><th>大区</th><th>小区</th><th>S小（候选）</th><th>A小（初步）</th><th>分类</th><th>Y（最终）</th><th>原因</th><th>入选VIN（Mock）</th></tr></thead><tbody>', body, '</tbody></table></div>',
      '</section>'
    ].join('');
  }

  function monthlyScenarios() {
    return window.TCSData && Array.isArray(window.TCSData.monthlySamplingScenarios) ? window.TCSData.monthlySamplingScenarios : [];
  }

  function monthlyAuditContext() {
    var state = getState();
    var approval = currentApproval();
    var source = state.monthlySamplingViews && state.monthlySamplingViews[approval.id] || 'approval';
    var independent = source.indexOf('example:') === 0;
    var bindings = window.TCSData && window.TCSData.monthlySamplingByApproval || {};
    var scenarioId = independent ? source.slice(8) : bindings[approval.id];
    var scenario = monthlyScenarios().filter(function (item) { return item.id === scenarioId; })[0] || null;
    var context = { approval: approval, source: source, independent: independent, scenario: scenario, input: null, message: '' };
    if (!independent && approval.samplingEnabled === false) {
      context.message = '当前方案已关闭分层抽样，不执行月度抽样。下方可主动选择独立评审例子，但不会成为本方案结果。';
      return context;
    }
    if (!scenario) {
      context.message = independent ? '所选独立评审例子不可用，请重新选择。' : '当前审批未绑定月度候选与销量 Mock，不展示其他方案的计算结果。可主动选择独立评审例子查看规则。';
      return context;
    }
    context.input = JSON.parse(JSON.stringify(scenario.input || {}));
    if (!independent) {
      context.input.schemeId = approval.id;
      context.input.ratioPercent = approval.ratio;
      context.input.lowerBound = approval.lowerBound;
    }
    return context;
  }

  function calculateMonthlyResult(context) {
    if (!context.input) return null;
    if (!window.TCSMonthlySampling || typeof window.TCSMonthlySampling.calculate !== 'function') {
      return { error: '月度计算组件未载入；不会以原单计算单元结果代替。' };
    }
    try { return window.TCSMonthlySampling.calculate(context.input); }
    catch (error) { return { error: error && error.message || '月度演示计算不可用。' }; }
  }

  function monthlyNumber(value) {
    return typeof value === 'number' && Number.isFinite(value) ? String(value) : '—';
  }

  function monthlyBasis(input) {
    var value = input && input.salesBasis;
    if (typeof value === 'string') return value || '待确认';
    if (value && typeof value === 'object') return value.description || value.label || value.name || JSON.stringify(value);
    return '销量口径待确认';
  }

  function monthlyIssues(items) {
    return (Array.isArray(items) ? items : []).map(function (item) {
      return typeof item === 'string' ? item : item && (item.message || item.code) || '待确认';
    }).join('；');
  }

  function monthlyStatus(item) {
    if (item && item.statusLabel) return item.statusLabel;
    if (item && item.status === 'MOCK_SELECTED') return '已生成固定顺序 VIN 示例';
    if (item && item.status === 'ROUNDING_DIFFERENCE_PENDING') return '车型取整差额待处理';
    return '待确认' + (item && item.status ? '（' + item.status + '）' : '');
  }

  function monthlyFlatRows(result) {
    var rows = [];
    (result && Array.isArray(result.months) ? result.months : []).forEach(function (month, monthIndex) {
      (Array.isArray(month.regions) ? month.regions : []).forEach(function (region, regionIndex) {
        (Array.isArray(region.communityAllocations) ? region.communityAllocations : []).forEach(function (community, communityIndex) {
          var classes = Array.isArray(community.classes) && community.classes.length ? community.classes : [null];
          classes.forEach(function (vehicleClass, classIndex) {
            rows.push({ month: month, region: region, community: community, vehicleClass: vehicleClass,
              key: [monthIndex, regionIndex, communityIndex, classIndex].join(':') });
          });
        });
      });
    });
    return rows;
  }

  function monthlyBaseRow(region, communityId) {
    var rows = region.baseResult && Array.isArray(region.baseResult.rows) ? region.baseResult.rows : [];
    return rows.filter(function (row) { return String(row.id || row.communityId) === String(communityId); })[0] || {};
  }

  function renderMonthlyBase(region) {
    var result = region.baseResult || {};
    var rows = Array.isArray(result.rows) ? result.rows : [];
    var summary = [
      ['S大（该月大区候选数）', ['S大', 'candidateTotal']], ['U（该月参考目标）', ['U', 'targetSampleCount']], ['L（理论最低总量）', ['L', 'theoreticalMinimum']],
      ['Y总（该月实际名额）', ['Y总', 'finalSampleTotal']], ['N未（未分配）', ['N未', 'unallocatedCount']], ['O超（超配记录）', ['O超', 'overallocatedCount']]
    ].map(function (entry) { return '<div class="audit-summary-item"><span>' + escape(entry[0]) + '</span><strong>' + monthlyNumber(summaryValue(result, entry[1], null)) + '</strong></div>'; }).join('');
    return [
      '<div class="audit-summary-grid">', summary, '</div>',
      '<div class="table-wrapper"><table class="data-table monthly-base-table" aria-label="该抽样月该大区小区计算结果"><thead><tr><th>小区</th><th>S小（候选）</th><th>A小（初步）</th><th>分类</th><th>Y小（最终名额）</th><th>原算法处理说明</th></tr></thead><tbody>',
      rows.map(function (row) { return '<tr><td>' + escape(row.name || row.communityName || row.id) + '</td><td>' + monthlyNumber(pick(row, ['S小', 'candidateCount'], null)) + '</td><td>' + monthlyNumber(pick(row, ['A小', 'initialSampleCount'], null)) + '</td><td>' + escape(categoryLabel(pick(row, ['分类', 'category'], '—'))) + '</td><td><strong>' + monthlyNumber(pick(row, ['Y', 'finalSampleCount'], null)) + '</strong></td><td>' + escape(row.reason || '—') + '</td></tr>'; }).join('') || '<tr><td colspan="6">暂无小区计算结果。</td></tr>',
      '</tbody></table></div>'
    ].join('');
  }

  function renderMonthlyClasses(rows) {
    var communities = [];
    rows.forEach(function (row) { if (communities.indexOf(row.community) === -1) communities.push(row.community); });
    return [
      '<div class="table-wrapper"><table class="data-table monthly-class-table" aria-label="该月小区车型级别分配"><thead><tr><th>小区</th><th>Y小（已定名额）</th><th>车型 / 完整18位码</th><th>V级（车型销量）</th><th>V小（小区总销量）</th><th>P级（销量占比）</th><th>Q级（理论名额）</th><th>四舍五入名额</th><th>状态</th><th>VIN 示例</th></tr></thead><tbody>',
      rows.map(function (row) {
        var entry = row.vehicleClass || {};
        var selected = Array.isArray(entry.selectedVins) ? entry.selectedVins : [];
        return '<tr><td>' + escape(row.community.communityName || row.community.communityId) + '</td><td>' + monthlyNumber(row.community.finalSampleCount) + '</td><td><span class="cell-title">' + escape(entry.className || entry.vehicleCode18 || '缺少编码') + '</span><small>' + escape(entry.vehicleCode18 || '—') + '</small></td><td>' + monthlyNumber(entry.salesCount) + '</td><td>' + monthlyNumber(row.community.salesTotal) + '</td><td>' + (typeof entry.salesShare === 'number' && Number.isFinite(entry.salesShare) ? escape(String(entry.salesShare * 100)) + '%' : '—') + '</td><td><strong>' + monthlyNumber(entry.theoreticalSampleCount) + '</strong></td><td>' + (entry.integerSampleCount === null || entry.integerSampleCount === undefined ? '待处理' : monthlyNumber(entry.integerSampleCount)) + '</td><td>' + window.TCSUI.tag(monthlyStatus(entry), entry.status === 'MOCK_SELECTED' ? 'success' : 'warning') + '</td><td>' + (selected.length ? '<button class="btn btn-link btn-sm" type="button" data-monthly-vins="' + escape(row.key) + '">查看 VIN（' + selected.length + '）</button>' : '暂无已确定 VIN') + '</td></tr>';
      }).join('') || '<tr><td colspan="10">暂无车型分配结果。</td></tr>',
      '</tbody></table></div>',
      '<div class="table-wrapper"><table class="data-table monthly-rounding-table" aria-label="车型取整差额"><thead><tr><th>小区</th><th>Y小（原小区名额）</th><th>车型四舍五入合计</th><th>差额（车型合计－Y小）</th><th>状态</th></tr></thead><tbody>',
      communities.map(function (community) { var difference = community.roundingDifference; return '<tr><td>' + escape(community.communityName) + '</td><td>' + monthlyNumber(community.finalSampleCount) + '</td><td>' + monthlyNumber(community.roundedClassTotal) + '</td><td><strong>' + (typeof difference === 'number' && difference > 0 ? '+' : '') + monthlyNumber(difference) + '</strong></td><td>' + (difference === null ? '待处理' : difference === 0 ? '差额为0' : window.TCSUI.tag('差额处理待确认', 'warning')) + '</td></tr>'; }).join(''),
      '</tbody></table></div>'
    ].join('');
  }

  function renderMonthlyAuditSection() {
    var context = monthlyAuditContext();
    var result = calculateMonthlyResult(context);
    var rows = monthlyFlatRows(result);
    var approval = context.approval;
    var sourceLabel = context.independent ? '独立评审例子（非当前审批结果）' : '当前方案配置演示（绑定 Mock，非真实任务结果）';
    var body = '';
    if (!context.input) body = window.TCSUI.notice('未运行当前方案月度抽样', context.message, 'warning');
    else if (!result || result.error) body = window.TCSUI.notice('月度结果不可用', result && result.error || '计算未返回结果。', 'warning');
    else {
      body = (result.months || []).map(function (month) {
        return '<section class="monthly-month-block"><h3>抽样月份：' + escape(month.samplingMonth) + '</h3>' + (month.regions || []).map(function (region) {
          var scoped = rows.filter(function (row) { return row.month === month && row.region === region; });
          return '<section class="monthly-region-block"><h4>' + escape(region.regionName || region.regionId) + ' · 本月独立计算</h4>' + renderMonthlyBase(region) + '<h4>小区定量后的车型级别分配</h4>' + renderMonthlyClasses(scoped) + '</section>';
        }).join('') + '</section>';
      }).join('');
      if (!body) body = window.TCSUI.notice('暂无可计算月份', '请核对 TQMP 交车日期、车型编码及区域输入。', 'warning');
    }
    return [
      '<section class="card content-card monthly-audit-section" data-feature="F-10 F-13 F-14" id="monthly-audit-section">',
      window.TCSUI.sectionHeader('月度车型级别审计', '', '<button class="btn" id="export-monthly-audit" type="button"' + (!rows.length ? ' disabled' : '') + '>导出月度审计 CSV</button>'),
      '<label class="field monthly-example-picker"><span class="field__label">查看范围</span><select class="form-select" id="monthly-audit-source"><option value="approval"' + (!context.independent ? ' selected' : '') + '>当前审批绑定的 Mock · 使用当前方案配置</option>',
      monthlyScenarios().map(function (scenario) { return '<option value="example:' + escape(scenario.id) + '"' + (context.source === 'example:' + scenario.id ? ' selected' : '') + '>独立评审例子：' + escape(scenario.name) + '</option>'; }).join(''), '</select></label>',
      '<dl class="detail-list monthly-context" id="monthly-calculation-context"><div><dt>当前方案配置</dt><dd>', escape(approval.approvalNo), '；抽样', approval.samplingEnabled === false ? '关闭' : '启用', '；C（抽样比例）＝', approval.ratio === null || approval.ratio === undefined ? '未配置' : escape(approval.ratio) + '%', '；Lwr（小区最低样本数）＝', approval.lowerBound === null ? '空值（待确认）' : escape(approval.lowerBound), '</dd></div>',
      '<div><dt>本区结果身份</dt><dd>', escape(sourceLabel), '</dd></div>',
      context.input ? '<div><dt>本次计算参数</dt><dd>C（抽样比例）＝' + escape(context.input.ratioPercent) + '%；Lwr（小区最低样本数）＝' + (context.input.lowerBound === null ? '空值（待确认）' : escape(context.input.lowerBound)) + '</dd></div><div id="monthly-month-basis"><dt>抽样月份来源</dt><dd>TQMP 交车日期的年月</dd></div>' : '', '</dl>',
      result && !result.error ? '<div class="table-toolbar" id="monthly-qualification-summary"><span>输入 ' + (result.qualificationAudit || []).length + ' 台 · 合格候选 ' + result.candidateTotal + ' 台 · 排除/待处理 ' + result.excludedVehicleCount + ' 台</span><button class="btn" id="view-monthly-candidates" type="button">查看候选资格</button><button class="btn" id="export-monthly-candidates" type="button">导出候选资格 CSV</button></div>' : '',
      '<div id="monthly-calculation-results">', body, '</div></section>'
    ].join('');
  }

  function exportMonthlyAudit() {
    var context = monthlyAuditContext();
    var result = calculateMonthlyResult(context);
    var rows = monthlyFlatRows(result);
    if (!rows.length) { window.showToast('当前没有可导出的月度审计。', 'warning'); return; }
    var headers = ['结果身份', '当前审批号', '示例ID', '示例名称', '计算C（%）', '计算Lwr', '销量统计来源', '抽样月份（按TQMP交车日期）', '大区ID', '大区', '小区ID', '小区', 'S小（候选）', 'A小（初步）', 'Y小（最终名额）', '完整18位码', '车型显示名', 'V级（车型销量）', 'V小（小区总销量）', 'P级（销量占比）', 'Q级（理论样本数）', '四舍五入名额', '车型取整合计', '车型取整差额', 'VIN示例', '入选VIN交车日期（Mock）', '状态', '待确认事项', 'S大', 'U', 'L', 'Y总', 'N未', 'O超'];
    var lines = rows.map(function (row) {
      var entry = row.vehicleClass || {};
      var base = monthlyBaseRow(row.region, row.community.communityId);
      var totals = [['S大', 'candidateTotal'], ['U', 'targetSampleCount'], ['L', 'theoreticalMinimum'], ['Y总', 'finalSampleTotal'], ['N未', 'unallocatedCount'], ['O超', 'overallocatedCount']].map(function (keys) { return summaryValue(row.region.baseResult, keys, null); });
      return [context.independent ? '独立评审例子（非当前审批结果）' : '当前方案配置演示（绑定Mock，非真实任务结果）', context.approval.approvalNo, context.scenario.id, context.scenario.name, context.input.ratioPercent, context.input.lowerBound, monthlyBasis(context.input), row.month.samplingMonth, row.region.regionId, row.region.regionName, row.community.communityId, row.community.communityName, pick(base, ['S小', 'candidateCount'], ''), pick(base, ['A小', 'initialSampleCount'], ''), row.community.finalSampleCount, entry.vehicleCode18, entry.className, entry.salesCount, row.community.salesTotal, entry.salesShare, entry.theoreticalSampleCount, entry.integerSampleCount === null || entry.integerSampleCount === undefined ? '待处理' : entry.integerSampleCount, row.community.roundedClassTotal, row.community.roundingDifference, (entry.selectedVins || []).join(' / '), (entry.selectedVehicles || []).map(function (vehicle) { return vehicle.vin + '：' + vehicle.tqmpDeliveryDateMock; }).join(' / '), monthlyStatus(entry), monthlyIssues((entry.issues || []).concat(row.community.issues || [], result.issues || []))].concat(totals).map(csvCell).join(',');
    });
    window.downloadTextFile('月度车型级别审计_' + (context.independent ? context.scenario.id : context.approval.approvalNo) + '.csv', [headers.map(csvCell).join(',')].concat(lines).join('\r\n'), 'text/csv;charset=utf-8');
    window.showToast('已导出当前范围的月度审计及车型取整差额。');
  }

  function showMonthlyVinDetails(key) {
    var context = monthlyAuditContext();
    var result = calculateMonthlyResult(context);
    var row = monthlyFlatRows(result).filter(function (entry) { return entry.key === key; })[0];
    if (!row || !row.vehicleClass) return;
    var vehicleClass = row.vehicleClass;
    var vehicles = Array.isArray(vehicleClass.selectedVehicles) ? vehicleClass.selectedVehicles : context.input.vehicles || [];
    var selected = Array.isArray(vehicleClass.selectedVins) ? vehicleClass.selectedVins : [];
    if (!selected.length) { window.showToast('该级别暂无已确定的 VIN 示例。', 'warning'); return; }
    var body = selected.map(function (vin, index) {
      var vehicle = vehicles.filter(function (item) { return item.vin === vin; })[0] || {};
      return '<tr><td>' + (index + 1) + '</td><td>' + escape(vin) + '</td><td>' + escape(vehicle.vehicleCode18 || '—') + '</td><td>' + escape(vehicle.tqmpDeliveryDateMock || '—') + '</td><td>' + escape(row.month.samplingMonth) + '</td><td>' + escape(row.region.regionName) + '</td><td>' + escape(row.community.communityName) + '</td><td>' + escape(vehicleClass.className || vehicleClass.vehicleCode18) + '</td></tr>';
    }).join('');
    window.openOverlay([
      '<header class="modal-header"><div><h2>月度车型级别 VIN 示例</h2><p class="modal-caption">', escape(row.month.samplingMonth), ' / ', escape(row.region.regionName), ' / ', escape(row.community.communityName), ' · 固定顺序 Mock</p></div><button class="btn btn-link" type="button" data-close-overlay>关闭</button></header>',
      '<div class="modal-body"><div class="table-wrapper"><table class="data-table monthly-vin-table" id="monthly-vin-details"><thead><tr><th>示例顺序</th><th>VIN</th><th>18 位车型码</th><th>TQMP交车日期（Mock）</th><th>抽样月份</th><th>大区</th><th>小区</th><th>车型显示名</th></tr></thead><tbody>', body, '</tbody></table></div></div>',
      '<footer class="modal-footer"><button class="btn btn-primary" type="button" data-close-overlay>关闭</button></footer>'
    ].join(''), { label: '月度车型级别 VIN 示例', className: 'modal-content--wide' });
  }

  function monthlyCandidateRows(result) {
    var selected = {};
    monthlyFlatRows(result).forEach(function (row) {
      ((row.vehicleClass || {}).selectedVins || []).forEach(function (vin) { selected[vin] = true; });
    });
    return (result && result.qualificationAudit || []).map(function (row) {
      return Object.assign({}, row, { selectedMock: selected[row.vin] === true });
    });
  }

  function showMonthlyCandidateDetails() {
    var context = monthlyAuditContext();
    var rows = monthlyCandidateRows(calculateMonthlyResult(context));
    if (!rows.length) { window.showToast('暂无候选资格明细。', 'warning'); return; }
    var body = rows.map(function (row) {
      return '<tr><td>' + escape(row.vin || '—') + '</td><td>' + escape(row.tqmpDeliveryDateMock || '未提供') + '</td><td>' + escape(row.samplingMonth || '未归月') + '</td><td>' + escape(row.salesDate || '—') + '</td><td>' + escape(row.plannedPushDate || '—') + '</td><td>' + escape(row.vehicleCode18 || '缺失') + '</td><td>' + (row.historyPushedMock ? '是' : '否') + '</td><td>' + escape(row.reason) + '</td><td>' + (row.selectedMock ? '入选示例' : '未入选示例') + '</td></tr>';
    }).join('');
    window.openOverlay([
      '<header class="modal-header"><div><h2>候选资格明细</h2><p class="modal-caption">', escape(context.scenario.name), ' · Mock</p></div><button class="btn btn-link" type="button" data-close-overlay>关闭</button></header>',
      '<div class="modal-body"><div class="table-wrapper"><table class="data-table" id="monthly-candidate-details"><thead><tr><th>VIN</th><th>TQMP交车日期（Mock）</th><th>抽样月份</th><th>销售日期（对照）</th><th>计划推送日期（对照）</th><th>完整18位码</th><th>历史已推送</th><th>资格结果</th><th>抽车示例</th></tr></thead><tbody>', body, '</tbody></table></div></div>',
      '<footer class="modal-footer"><button class="btn btn-primary" type="button" data-close-overlay>关闭</button></footer>'
    ].join(''), { label: '候选资格明细', className: 'modal-content--wide' });
  }

  function exportMonthlyCandidates() {
    var context = monthlyAuditContext();
    var rows = monthlyCandidateRows(calculateMonthlyResult(context));
    if (!rows.length) { window.showToast('暂无可导出的候选资格。', 'warning'); return; }
    var headers = ['当前审批号', '示例ID', 'VIN', 'TQMP交车日期（Mock）', '抽样月份（按TQMP交车日期）', '销售日期（对照）', '计划推送日期（对照）', '大区ID', '小区ID', '完整18位码', '历史已推送（Mock）', '销退成功（Mock）', '错误信息（Mock）', '资格状态', '资格结果', '入选固定顺序Mock'];
    var lines = rows.map(function (row) {
      return [context.approval.approvalNo, context.scenario.id, row.vin, row.tqmpDeliveryDateMock, row.samplingMonth, row.salesDate, row.plannedPushDate, row.regionId, row.communityId, row.vehicleCode18, row.historyPushedMock ? '是' : '否', row.saleReturnSuccessMock ? '是' : '否', row.dataErrorMock, row.status, row.reason, row.selectedMock ? '是' : '否'].map(csvCell).join(',');
    });
    window.downloadTextFile('候选资格审计_' + (context.independent ? context.scenario.id : context.approval.approvalNo) + '.csv', [headers.map(csvCell).join(',')].concat(lines).join('\r\n'), 'text/csv;charset=utf-8');
    window.showToast('已导出当前范围的候选资格明细。');
  }

  function bindMonthlyAudit() {
    var picker = document.getElementById('monthly-audit-source');
    var exporter = document.getElementById('export-monthly-audit');
    var candidateViewer = document.getElementById('view-monthly-candidates');
    var candidateExporter = document.getElementById('export-monthly-candidates');
    var regression = document.getElementById('single-unit-scenario');
    if (picker) picker.addEventListener('change', function () {
      var state = getState();
      if (!state.monthlySamplingViews) state.monthlySamplingViews = {};
      state.monthlySamplingViews[currentApproval().id] = picker.value;
      window.TCSApp.render();
    });
    if (exporter) exporter.addEventListener('click', exportMonthlyAudit);
    if (candidateViewer) candidateViewer.addEventListener('click', showMonthlyCandidateDetails);
    if (candidateExporter) candidateExporter.addEventListener('click', exportMonthlyCandidates);
    if (regression) regression.addEventListener('change', function () { getState().selectedScenarioId = regression.value; window.TCSApp.render(); });
    Array.prototype.forEach.call(document.querySelectorAll('[data-monthly-vins]'), function (button) {
      button.addEventListener('click', function () { showMonthlyVinDetails(button.getAttribute('data-monthly-vins')); });
    });
  }

  function render() {
    var approval = currentApproval();
    var records = pushRecords();
    var result = calculateResult();
    return [
      renderCounters(records),
      renderFilters(records),
      renderPushTable(),
      renderMonthlyAuditSection(),
      renderAuditSection(result)
    ].join('');
  }

  function inputValue(id) {
    var node = document.getElementById(id);
    return node ? node.value.trim() : '';
  }

  function applyFilters() {
    filters.vin = inputValue('push-filter-vin');
    filters.phone = inputValue('push-filter-phone');
    filters.status = inputValue('push-filter-status') || 'all';
    window.TCSApp.render();
  }

  function resetFilters() {
    filters = { vin: '', phone: '', status: 'all' };
    window.TCSApp.render();
    window.showToast('筛选条件已重置。');
  }

  function csvCell(value) {
    var text = value === undefined || value === null ? '' : String(value);
    if (/^[=+\-@]/.test(text)) text = '\'' + text;
    return '"' + text.replace(/"/g, '""') + '"';
  }

  function exportPush() {
    var records = filteredPushRecords();
    var keys = ['pushId', 'channel', 'status', 'plannedAt', 'sentAt', 'error', 'vin', 'phone', 'customerName', 'vehicleSeries', 'province', 'city', 'region', 'district'];
    var labels = ['审批推送ID', '推送方式', '推送状态', '计划推送时间', '推送时间', '失败原因', 'VIN', '手机号码', '客户名称', '车系', '省份', '城市', '大区', '小区'];
    var lines = records.map(function (record) { return keys.map(function (key) { return csvCell(record[key]); }).join(','); });
    if (!records.length) {
      window.showToast('当前查询无可导出数据。', 'warning');
      return;
    }
    window.downloadTextFile('推送数据_' + currentApproval().approvalNo + '.csv', [labels.map(csvCell).join(',')].concat(lines).join('\r\n'), 'text/csv;charset=utf-8');
    window.showToast('已导出当前查询的推送数据。');
  }

  function exportAudit() {
    var result = calculateResult();
    var scenario = currentScenario();
    var algorithmVersion = scenario && scenario.algorithmVersion;
    var randomBasis = scenario && scenario.randomBasis;
    var rows = resultRows(result);
    var summary = [
      summaryValue(result, ['S大', 'candidateTotal']),
      summaryValue(result, ['U', 'target', 'targetSampleCount']),
      summaryValue(result, ['L', 'lowerTotal', 'theoreticalMinimum']),
      summaryValue(result, ['Y总', 'finalTotal', 'finalSampleTotal']),
      summaryValue(result, ['N未', 'unallocated', 'unallocatedCount']),
      summaryValue(result, ['O超', 'overAllocated', 'overallocatedCount'])
    ];
    var header = ['大区', '小区', 'S小（候选）', 'A小（初步）', '分类', 'Y（最终）', '原因', '入选VIN（Mock）', '算法版本', '随机依据', 'S大', 'U（目标参考值）', 'L（理论最低总量）', 'Y总（实际样本）', 'N未（未分配）', 'O超（超配记录）', '示例类型', '示例ID', '示例C（%）', '示例Lwr'];
    var lines = rows.map(function (row) {
      var vins = row.vins.map(function (item) { return typeof item === 'object' ? pick(item, ['vin', 'maskedVin', 'value'], '') : item; }).join(' / ');
      return [row.region, row.district, row.candidate, row.initial, categoryLabel(row.category), row.final, row.reason, vins, algorithmVersion, randomBasis].concat(summary, ['单计算单元回归示例（非当前审批结果）', scenario && scenario.id, scenario && scenario.ratioPercent, scenario && scenario.lowerBound]).map(csvCell).join(',');
    });
    if (!rows.length) {
      window.showToast('当前无可导出的抽样审计明细。', 'warning');
      return;
    }
    window.downloadTextFile('单计算单元回归示例_' + (scenario && scenario.id || '无场景') + '.csv', [header.map(csvCell).join(',')].concat(lines).join('\r\n'), 'text/csv;charset=utf-8');
    window.showToast('已导出抽样审计明细，字段与页面一致。');
  }

  function showVinDetails(id) {
    var rows = resultRows(calculateResult());
    var row = rows.filter(function (item) { return item.id === id; })[0];
    if (!row) return;
    var body = row.vins.map(function (item, index) {
      var vin = typeof item === 'object' ? pick(item, ['vin', 'maskedVin', 'value'], '') : item;
      return '<tr><td>' + (index + 1) + '</td><td><strong>' + escape(vin) + '</strong></td><td>' + escape(row.region) + '</td><td>' + escape(row.district) + '</td></tr>';
    }).join('');
    if (!body) body = '<tr><td colspan="4">暂无 VIN 示例。</td></tr>';
    window.openOverlay([
      '<header class="modal-header"><div><h2>单计算单元 VIN 回归示例</h2><p class="modal-caption">', escape((currentScenario() || {}).name || '原算法示例'), ' / ', escape(row.region), ' / ', escape(row.district), '</p></div><button class="btn btn-link" type="button" data-close-overlay>关闭</button></header>',
      '<div class="modal-body"><div class="table-wrapper"><table class="data-table" id="single-unit-vin-details"><thead><tr><th>入选顺序</th><th>VIN</th><th>大区</th><th>小区</th></tr></thead><tbody>', body, '</tbody></table></div></div>',
      '<footer class="modal-footer"><button class="btn btn-primary" type="button" data-close-overlay>关闭</button></footer>'
    ].join(''), { label: '单计算单元 VIN 回归示例' });
  }

  function init() {
    bindMonthlyAudit();
    var back = document.getElementById('back-to-plan');
    var query = document.getElementById('query-push');
    var reset = document.getElementById('reset-push-filter');
    var exportButton = document.getElementById('export-push');
    var exportAuditButton = document.getElementById('export-audit');
    var vinButtons = document.querySelectorAll('[data-audit-vins]');
    if (back) back.addEventListener('click', function () { window.TCSApp.navigate('plan'); });
    if (query) query.addEventListener('click', applyFilters);
    if (reset) reset.addEventListener('click', resetFilters);
    if (exportButton) exportButton.addEventListener('click', exportPush);
    if (exportAuditButton) exportAuditButton.addEventListener('click', exportAudit);
    Array.prototype.forEach.call(vinButtons, function (button) {
      button.addEventListener('click', function () { showVinDetails(button.getAttribute('data-audit-vins')); });
    });
  }

  window.Pages.sampling = { render: render, init: init };
  window.Pages.sampling.annotationContext = function () {
    var context = monthlyAuditContext();
    return { context: context, result: calculateMonthlyResult(context), regressionScenario: currentScenario() };
  };
})();
