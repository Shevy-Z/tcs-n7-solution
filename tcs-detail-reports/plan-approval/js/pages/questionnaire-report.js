(function () {
  'use strict';

  window.Pages = window.Pages || {};

  var columns = [
    { key: 'sequence', label: '序号', width: 64 },
    { key: 'planNo', label: '调查方案单号', width: 208 },
    { key: 'questionnaireId', label: '问卷ID', width: 236 },
    { key: 'seriesCode', label: '车系编码', width: 112 },
    { key: 'vin', label: 'vin', width: 192 },
    { key: 'pushId', label: '推送ID', width: 232 },
    { key: 'commentStatus', label: '点评状态', width: 104 },
    { key: 'mis', label: '调研MIS', width: 160 },
    { key: 'questionnaireTitle', label: '问卷标题', width: 208 },
    { key: 'planName', label: '调查方案名称', width: 208 },
    { key: 'commentMethod', label: '点评方式', width: 104 },
    { key: 'pushTime', label: '推送时间', width: 188 },
    { key: 'commentTime', label: '点评时间', width: 188 },
    { key: 'deliveryDate', label: '交车日期', width: 128 },
    { key: 'dealerName', label: '专营店', width: 260 },
    { key: 'province', label: '省', width: 104 },
    { key: 'city', label: '市', width: 104 },
    { key: 'region', label: '大区', width: 128 },
    { key: 'district', label: '小区', width: 128 },
    { key: 'level1Score', label: '第一层 评分', width: 112 },
    { key: 'level1Project', label: '第一层 Lvl_1项目', width: 156 },
    { key: 'level2Project', label: '第二层 Lvl_2项目', width: 156 },
    { key: 'level3Project', label: '第三层 Lvl_3项目', width: 156 },
    { key: 'level4Detail', label: '第四层 Lvl_4详细', width: 184 },
    { key: 'level5Comment', label: '第五层 留言', width: 296 },
    { key: 'annoyance', label: '困扰度', width: 104 },
    { key: 'lastOccurredAt', label: '最近发生时间', width: 148 }
  ];
  var scalarFilterKeys = [
    'planNo', 'questionnaireId', 'vin', 'pushId', 'commentStatus', 'mis',
    'deliveryFrom', 'deliveryTo', 'pushFrom', 'pushTo', 'commentFrom', 'commentTo',
    'region', 'district', 'province', 'city', 'dealerName'
  ];
  var filters = blankFilters();
  var draftFilters = blankFilters();
  var filtersCollapsed = false;
  var compactDensity = false;
  var hiddenColumns = {};
  var hasPromptedSeries = false;

  function data() {
    return window.TCSData && window.TCSData.questionnaireReport || {};
  }

  function escape(value) {
    return window.escapeHtml(value === undefined || value === null ? '' : String(value));
  }

  function blankFilters() {
    return {
      planNo: '', questionnaireId: '', seriesCodes: [], vin: '', pushId: '',
      commentStatus: 'all', mis: 'all', deliveryFrom: '', deliveryTo: '',
      pushFrom: '', pushTo: '', commentFrom: '', commentTo: '', logicTreeId: 'all',
      region: 'all', district: 'all', province: 'all', city: 'all', dealerName: ''
    };
  }

  function copyFilters(value) {
    var result = Object.assign({}, value);
    result.seriesCodes = (value.seriesCodes || []).slice();
    return result;
  }

  function records() {
    return Array.isArray(data().records) ? data().records.slice() : [];
  }

  function contains(value, term) {
    return !term || String(value || '').toLowerCase().indexOf(String(term).trim().toLowerCase()) !== -1;
  }

  function dateMatches(value, from, to) {
    if (!from && !to) return true;
    if (!value) return false;
    var day = String(value).slice(0, 10);
    return (!from || day >= from) && (!to || day <= to);
  }

  function recordMatches(record) {
    if (filters.seriesCodes.indexOf(record.seriesCode) === -1) return false;
    if (!contains(record.planNo, filters.planNo)) return false;
    if (!contains(record.questionnaireId, filters.questionnaireId)) return false;
    if (!contains(record.vin, filters.vin)) return false;
    if (!contains(record.pushId, filters.pushId)) return false;
    if (filters.commentStatus !== 'all' && record.commentStatus !== filters.commentStatus) return false;
    if (filters.mis !== 'all' && record.mis !== filters.mis) return false;
    if (filters.logicTreeId !== 'all' && record.logicTreeId !== filters.logicTreeId) return false;
    if (filters.region !== 'all' && record.region !== filters.region) return false;
    if (filters.district !== 'all' && record.district !== filters.district) return false;
    if (filters.province !== 'all' && record.province !== filters.province) return false;
    if (filters.city !== 'all' && record.city !== filters.city) return false;
    if (!contains(record.dealerName, filters.dealerName)) return false;
    if (!dateMatches(record.deliveryDate, filters.deliveryFrom, filters.deliveryTo)) return false;
    if (!dateMatches(record.pushTime, filters.pushFrom, filters.pushTo)) return false;
    if (!dateMatches(record.commentTime, filters.commentFrom, filters.commentTo)) return false;
    return true;
  }

  function filteredRecords() {
    return filters.seriesCodes.length ? records().filter(recordMatches) : [];
  }

  function getColumns() {
    return columns.filter(function (column) { return !hiddenColumns[column.key]; });
  }

  function displayValue(record, column, index) {
    if (column.key === 'sequence') return index + 1;
    var value = record[column.key];
    return value === undefined || value === null || value === '' ? '—' : value;
  }

  function option(value, label, selected) {
    return '<option value="' + escape(value) + '"' + (String(selected) === String(value) ? ' selected' : '') + '>' + escape(label) + '</option>';
  }

  function textField(label, key, placeholder) {
    return '<label class="qr-filter-field"><span class="field__label">' + escape(label) + '</span>' +
      '<input class="form-input" id="qr-filter-' + key + '" type="text" value="' + escape(draftFilters[key]) + '" placeholder="' + escape(placeholder || '请输入') + '"></label>';
  }

  function selectField(label, key, values, allLabel) {
    return '<label class="qr-filter-field"><span class="field__label">' + escape(label) + '</span>' +
      '<select class="form-select" id="qr-filter-' + key + '">' + option('all', allLabel || '请选择', draftFilters[key]) +
      values.map(function (value) { return option(value, value, draftFilters[key]); }).join('') + '</select></label>';
  }

  function regionOptions(key) {
    return Array.from(new Set(records().map(function (record) { return record[key]; }).filter(Boolean)))
      .sort(function (left, right) { return left.localeCompare(right, 'zh-CN'); });
  }

  function rangeField(label, prefix) {
    return '<div class="qr-filter-field"><span class="field__label">' + escape(label) + '</span><div class="qr-date-range">' +
      '<input class="form-input" id="qr-filter-' + prefix + 'From" type="date" aria-label="' + escape(label) + '开始日期" value="' + escape(draftFilters[prefix + 'From']) + '">' +
      '<span aria-hidden="true">~</span>' +
      '<input class="form-input" id="qr-filter-' + prefix + 'To" type="date" aria-label="' + escape(label) + '结束日期" value="' + escape(draftFilters[prefix + 'To']) + '"></div></div>';
  }

  function seriesSummary() {
    if (!draftFilters.seriesCodes.length) return '请选择车系';
    var names = (data().seriesOptions || []).filter(function (item) {
      return draftFilters.seriesCodes.indexOf(item.value) !== -1;
    }).map(function (item) { return item.label; });
    return names.length === 1 ? names[0] : '已选择 ' + names.length + ' 个车系';
  }

  function seriesField() {
    return '<div class="qr-filter-field"><span class="field__label" id="qr-series-label">车系</span>' +
      '<details class="qr-series-picker"><summary class="form-select" id="qr-series-summary" aria-labelledby="qr-series-label qr-series-summary">' + escape(seriesSummary()) + '</summary>' +
      '<div class="qr-series-options" role="group" aria-label="车系多选">' + (data().seriesOptions || []).map(function (item) {
        return '<label><input type="checkbox" data-qr-series="' + escape(item.value) + '"' +
          (draftFilters.seriesCodes.indexOf(item.value) !== -1 ? ' checked' : '') + '> <span>' + escape(item.label) + '</span></label>';
      }).join('') + '</div></details></div>';
  }

  function renderFilters() {
    return [
      '<section class="qr-filter-panel"><form id="qr-filter-form">',
        '<div class="qr-filter-grid">',
          textField('调查方案单号', 'planNo'), textField('问卷ID', 'questionnaireId'), seriesField(), textField('vin', 'vin'),
        '</div>',
        '<div id="qr-advanced-filters" class="qr-filter-grid"', filtersCollapsed ? ' hidden' : '', '>',
          rangeField('交车时间', 'delivery'), rangeField('推送时间', 'push'), rangeField('点评时间', 'comment'), textField('推送ID', 'pushId'),
          selectField('点评状态', 'commentStatus', data().commentStatusOptions || [], '全部'), selectField('MIS', 'mis', data().misOptions || []),
          selectField('大区', 'region', regionOptions('region'), '全部'), selectField('小区', 'district', regionOptions('district'), '全部'),
          selectField('省份', 'province', regionOptions('province'), '全部'), selectField('城市', 'city', regionOptions('city'), '全部'),
          textField('门店', 'dealerName', '请输入专营店名称'),
        '</div>',
        '<div class="qr-query-actions">',
          '<button class="btn" id="qr-reset" type="button">重置</button>',
          '<button class="btn btn-primary" id="qr-query" type="submit">查询</button>',
          '<button class="btn btn-link" id="qr-toggle-filters" type="button" aria-controls="qr-advanced-filters" aria-expanded="', !filtersCollapsed, '">', filtersCollapsed ? '展开' : '收起', '</button>',
        '</div>',
      '</form></section>'
    ].join('');
  }

  function renderLogicTree() {
    var trees = data().logicTrees || [];
    var selected = trees.filter(function (tree) { return tree.id === filters.logicTreeId; })[0];
    return '<section class="qr-logic-panel" aria-label="逻辑树筛选（Mock）">' +
      '<label class="qr-logic-select"><span>按逻辑树筛选：</span><select class="form-select" id="qr-logic-tree" aria-label="逻辑树">' +
      option('all', '逻辑树', filters.logicTreeId) + trees.map(function (tree) {
        return option(tree.id, tree.label, filters.logicTreeId);
      }).join('') + '</select></label>' +
      '<div class="qr-logic-level"><span class="qr-logic-level__label">L1</span><div class="qr-logic-level__items">' +
      (selected ? selected.level1Items.map(function (item) { return '<span>' + escape(item) + '（Mock）</span>'; }).join('') : '<span class="text-muted">请选择逻辑树（Mock）</span>') +
      '</div></div></section>';
  }

  function renderColumnSettings() {
    return '<details class="qr-column-settings"><summary class="btn" title="列设置" aria-label="列设置">列设置</summary>' +
      '<div class="qr-column-options"><div class="qr-column-options__heading"><strong>显示列</strong>' +
      '<button class="btn btn-link" type="button" id="qr-restore-columns">恢复全部</button></div>' +
      columns.map(function (column) {
        return '<label><input type="checkbox" data-qr-column="' + escape(column.key) + '"' + (!hiddenColumns[column.key] ? ' checked' : '') + '> <span>' + escape(column.label) + '</span></label>';
      }).join('') + '</div></details>';
  }

  function renderTableRows() {
    var rows = filteredRecords();
    var visible = getColumns();
    if (!rows.length) {
      return '<tr><td class="qr-empty-cell" colspan="' + visible.length + '">' +
        window.TCSUI.empty(filters.seriesCodes.length ? '暂无符合条件的数据' : '请先选择车系后查看数据', '') + '</td></tr>';
    }
    return rows.map(function (record, index) {
      return '<tr data-qr-record="' + escape(record.id) + '">' + visible.map(function (column) {
        return '<td data-column="' + escape(column.key) + '">' + escape(displayValue(record, column, index)) + '</td>';
      }).join('') + '</tr>';
    }).join('');
  }

  function renderTable() {
    var visible = getColumns();
    var width = visible.reduce(function (sum, column) { return sum + column.width; }, 0);
    var rows = filteredRecords();
    return [
      '<section class="qr-table-section">',
        '<div class="qr-table-toolbar"><span id="qr-result-count" aria-live="polite">共搜索到 <strong>', rows.length, '</strong> 条数据</span>',
          '<div class="qr-table-tools">',
            '<button class="btn btn-primary" type="button" id="qr-export"', rows.length ? '' : ' disabled', '>导出</button>',
            '<button class="btn" type="button" id="qr-refresh" title="刷新当前 Mock 查询结果" aria-label="刷新">刷新</button>',
            '<button class="btn" type="button" id="qr-density" aria-pressed="', compactDensity, '" title="切换表格密度">', compactDensity ? '标准密度' : '紧凑密度', '</button>',
            renderColumnSettings(),
          '</div>',
        '</div>',
        '<div class="table-wrapper qr-table-wrapper" tabindex="0" role="region" aria-label="问卷报表明细，可横向滚动查看全部列">',
          '<table class="data-table qr-data-table', compactDensity ? ' qr-data-table--compact' : '', '" style="min-width:', width, 'px" aria-label="问卷报表明细">',
            '<colgroup>', visible.map(function (column) { return '<col style="width:' + column.width + 'px">'; }).join(''), '</colgroup>',
            '<thead><tr>', visible.map(function (column) { return '<th scope="col" data-column="' + escape(column.key) + '">' + escape(column.label) + '</th>'; }).join(''), '</tr></thead>',
            '<tbody id="qr-table-body">', renderTableRows(), '</tbody>',
          '</table>',
        '</div>',
      '</section>'
    ].join('');
  }

  function render() {
    return '<div class="sit-questionnaire-report" id="questionnaire-report-page" data-feature="F-15">' +
      renderFilters() + renderLogicTree() + renderTable() + '</div>';
  }

  function captureDraftFilters() {
    scalarFilterKeys.forEach(function (key) {
      var input = document.getElementById('qr-filter-' + key);
      if (input) draftFilters[key] = String(input.value || '').trim();
    });
    var options = document.querySelectorAll('[data-qr-series]');
    if (options.length) {
      draftFilters.seriesCodes = Array.prototype.filter.call(options, function (input) { return input.checked; })
        .map(function (input) { return input.getAttribute('data-qr-series'); });
    }
    return copyFilters(draftFilters);
  }

  function renderCurrent() {
    var app = document.getElementById('app');
    if (!app) return;
    app.innerHTML = render();
    init();
  }

  function validDateRanges(value) {
    return ['delivery', 'push', 'comment'].every(function (prefix) {
      return !value[prefix + 'From'] || !value[prefix + 'To'] || value[prefix + 'From'] <= value[prefix + 'To'];
    });
  }

  function commitQuery(next) {
    if (!validDateRanges(next)) {
      window.showToast('开始日期不能晚于结束日期，请检查时间区间。', 'warning');
      return false;
    }
    filters = copyFilters(next);
    renderCurrent();
    if (!filters.seriesCodes.length) {
      window.showToast('请先选择一个或多个车系，再确认选择或查询。', 'warning');
      return false;
    }
    return true;
  }

  function applyQuery() {
    return commitQuery(captureDraftFilters());
  }

  function confirmSeriesDialog() {
    var selected = Array.prototype.filter.call(document.querySelectorAll('[data-qr-dialog-series]'), function (input) {
      return input.checked;
    }).map(function (input) { return input.getAttribute('data-qr-dialog-series'); });
    if (!selected.length) {
      window.showToast('请选择一个或多个车系。', 'warning');
      return false;
    }
    captureDraftFilters();
    draftFilters.seriesCodes = selected;
    var next = copyFilters(draftFilters);
    if (!validDateRanges(next)) {
      window.showToast('开始日期不能晚于结束日期，请检查时间区间。', 'warning');
      return false;
    }
    window.closeOverlay();
    return commitQuery(next);
  }

  function showSeriesDialog() {
    var content = '<header class="modal-header"><div><h2>请选择车系</h2></div>' +
      '<button class="btn btn-link" type="button" data-close-overlay>关闭</button></header>' +
      '<div class="modal-body"><p>请选择一个或多个车系，确认后才会加载报表数据。</p>' +
      '<div class="qr-series-dialog-options" role="group" aria-label="车系多选">' +
      (data().seriesOptions || []).map(function (item) {
        return '<label><input type="checkbox" data-qr-dialog-series="' + escape(item.value) + '"' +
          (draftFilters.seriesCodes.indexOf(item.value) !== -1 ? ' checked' : '') + '> <span>' + escape(item.label) + '</span></label>';
      }).join('') + '</div></div><footer class="modal-footer">' +
      '<button class="btn btn-primary" type="button" id="qr-dialog-confirm-series">确认选择</button></footer>';
    window.openOverlay(content, { label: '请选择车系' });
    bindClick('qr-dialog-confirm-series', confirmSeriesDialog);
  }

  function resetFilters() {
    filters = blankFilters();
    draftFilters = blankFilters();
    filtersCollapsed = false;
    renderCurrent();
  }

  function csvCell(value) {
    var text = String(value === undefined || value === null ? '' : value);
    if (/^[=+\-@\t\r]/.test(text)) text = "'" + text;
    return '"' + text.replace(/"/g, '""') + '"';
  }

  function exportRows() {
    var rows = filteredRecords();
    if (!rows.length) {
      window.showToast(filters.seriesCodes.length ? '当前没有可导出的数据。' : '请先选择车系后查询。', 'warning');
      return false;
    }
    var lines = [columns.map(function (column) { return csvCell(column.label); }).join(',')];
    rows.forEach(function (record, index) {
      lines.push(columns.map(function (column) { return csvCell(displayValue(record, column, index)); }).join(','));
    });
    window.downloadTextFile('TCS_问卷报表明细_Mock.csv', lines.join('\r\n'), 'text/csv;charset=utf-8');
    window.showToast('已导出当前查询结果，包含全部 27 列（Mock）。', 'success');
    return true;
  }

  function bindClick(id, callback) {
    var element = document.getElementById(id);
    if (element) element.addEventListener('click', callback);
  }

  function init() {
    var form = document.getElementById('qr-filter-form');
    if (form) {
      form.addEventListener('submit', function (event) { event.preventDefault(); applyQuery(); });
      form.addEventListener('input', captureDraftFilters);
      form.addEventListener('change', function () {
        captureDraftFilters();
        var summary = document.getElementById('qr-series-summary');
        if (summary) summary.textContent = seriesSummary();
      });
    }
    bindClick('qr-reset', resetFilters);
    bindClick('qr-toggle-filters', function () {
      captureDraftFilters();
      filtersCollapsed = !filtersCollapsed;
      renderCurrent();
    });
    bindClick('qr-export', exportRows);
    bindClick('qr-refresh', function () {
      captureDraftFilters();
      renderCurrent();
      window.showToast('已刷新当前查询的本地 Mock 结果。', 'success');
    });
    bindClick('qr-density', function () {
      captureDraftFilters();
      compactDensity = !compactDensity;
      renderCurrent();
    });
    bindClick('qr-restore-columns', function () {
      captureDraftFilters();
      hiddenColumns = {};
      renderCurrent();
    });
    var logicSelect = document.getElementById('qr-logic-tree');
    if (logicSelect) logicSelect.addEventListener('change', function () {
      captureDraftFilters();
      filters.logicTreeId = this.value;
      draftFilters.logicTreeId = this.value;
      renderCurrent();
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-qr-column]'), function (input) {
      input.addEventListener('change', function () {
        var key = this.getAttribute('data-qr-column');
        if (!this.checked && getColumns().length === 1) {
          this.checked = true;
          window.showToast('至少保留一列。', 'warning');
          return;
        }
        captureDraftFilters();
        if (this.checked) delete hiddenColumns[key];
        else hiddenColumns[key] = true;
        renderCurrent();
      });
    });
    if (!hasPromptedSeries && !filters.seriesCodes.length) {
      hasPromptedSeries = true;
      showSeriesDialog();
    }
  }

  window.Pages.questionnaireReport = { render: render, init: init };
})();
