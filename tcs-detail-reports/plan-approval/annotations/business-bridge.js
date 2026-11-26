(function () {
  'use strict';
  var titles = { review: '人工审核点评 · 说明', plan: '调查方案审批 · 说明', sampling: '推送数据 · 说明', questionnaireReport: '问卷报表明细 · 说明' };
  function page() {
    return window.TCSApp && window.TCSApp.getCurrentPage ? window.TCSApp.getCurrentPage() : (window.location.hash.replace(/^#/, '') || 'review');
  }
  function finishReveal() {
    if (window.matchMedia && window.matchMedia('(max-width: 760px)').matches) {
      var collapse = document.querySelector('#anno-panel .anno-collapse');
      if (collapse) collapse.click();
    }
    return new Promise(function (resolve) { window.requestAnimationFrame(resolve); });
  }
  window.AnnotationConfig = {
    enabled: function () { return page() !== 'home'; },
    mode: 'b-drawer',
    projectId: 'tcs-review-v1-20260908-business',
    dataVersion: 'POINTS-RESTORE-0914-v3',
    editable: false,
    page: page,
    pageTitle: function () { return titles[page()] || '本页说明'; },
    pageContext: function () {
      var hint = '点击说明定位相应内容；悬停或键盘聚焦可对照。';
      if (page() !== 'sampling' || !window.Pages || !window.Pages.sampling || !window.Pages.sampling.annotationContext) return hint;
      try {
        var live = window.Pages.sampling.annotationContext();
        var context = live && live.context;
        if (!context) return hint;
        var scope = context.independent ? '独立评审例子' : '当前审批绑定数据';
        if (context.scenario && context.scenario.name) scope += '：' + context.scenario.name;
        if (context.message) scope += '；' + context.message;
        if (live.result && live.result.error) scope += '；' + live.result.error;
        return scope + '。' + hint;
      } catch (error) { return hint; }
    },
    revealTarget: function (anno) {
      if (!anno.target) return;
      if (page() === 'review' && anno.target === '#review-filter-riskStatus') {
        var advanced = document.getElementById('review-advanced-filters');
        if (advanced && advanced.hidden) {
          var expand = document.getElementById('review-collapse');
          if (expand) expand.click();
        }
      }
      if (page() === 'questionnaireReport' && /^#qr-filter-(region|district|province|city|dealerName)$/.test(anno.target)) {
        var reportAdvanced = document.getElementById('qr-advanced-filters');
        if (reportAdvanced && reportAdvanced.hidden) {
          var reportExpand = document.getElementById('qr-toggle-filters');
          if (reportExpand) reportExpand.click();
        }
      }
      if (page() === 'sampling' && anno.target === '#monthly-candidate-details' && !document.getElementById('monthly-candidate-details')) {
        var candidates = document.getElementById('view-monthly-candidates');
        if (candidates) candidates.click();
      }
      if (page() !== 'plan') return finishReveal();
      var modal = document.querySelector('.modal-overlay');
      if (!modal && /^#modal-|plan-sampling-month|plan-class-code/.test(anno.target)) {
        var create = document.getElementById('new-approval');
        if (create) create.click();
      }
      if (!modal && anno.target.indexOf('plan-organization-snapshot') !== -1) {
        var detail = document.querySelector('[data-plan-action="detail"]');
        if (detail) detail.click();
      }
      if (anno.target === '#modal-random-days' || anno.target === '#modal-push-date-examples') {
        var mode = document.getElementById('modal-push-mode');
        if (mode && mode.value !== 'random') {
          mode.value = 'random';
          mode.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
      if (anno.target === '#modal-push-date-examples') {
        var examples = document.querySelector('.push-date-examples');
        if (examples) examples.open = true;
      }
      return finishReveal();
    }
  };
  window.addEventListener('hashchange', function () {
    if (window.AnnotationRuntime) window.AnnotationRuntime.refresh();
  });
})();
