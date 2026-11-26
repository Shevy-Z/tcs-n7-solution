(function () {
  'use strict';

  window.Pages = window.Pages || {};

  var currentPage = 'home';
  var routes = {
    home: { label: '评审总览', internal: true },
    review: { label: '人工审核点评' },
    plan: { label: '调查方案审批' },
    questionnaireReport: { label: '问卷报表明细' },
    sampling: { label: '推送数据', internal: true }
  };

  function isKnownRoute(key) {
    return Object.prototype.hasOwnProperty.call(routes, key);
  }

  function getRoute() {
    var key = window.location.hash.replace(/^#/, '').split('?')[0];
    return isKnownRoute(key) ? key : 'plan';
  }

  function getRouteLabel(key) {
    return routes[key] ? routes[key].label : routes.home.label;
  }

  function placeholderPage(pageKey) {
    return {
      render: function () {
        return [
          window.TCSUI.pageHeader({ title: getRouteLabel(pageKey) }),
          window.TCSUI.notice('页面暂不可用', '对应的静态页面脚本未成功载入，请刷新后重试。', 'warning')
        ].join('');
      }
    };
  }

  function renderRoute() {
    var pageKey = getRoute();
    var page = window.Pages[pageKey] || placeholderPage(pageKey);
    var app = document.getElementById('app');
    if (!app || !page || typeof page.render !== 'function') return;

    if (typeof window.closeOverlay === 'function') window.closeOverlay();
    app.innerHTML = page.render();
    currentPage = pageKey;
    if (document.body && document.body.classList) document.body.classList.toggle('tcs-hub', pageKey === 'home');
    if (window.TCSNav) {
      window.TCSNav.setActive(pageKey);
      window.TCSNav.closeMobile();
    }
    var topbarPage = document.getElementById('topbar-page');
    if (topbarPage) topbarPage.textContent = getRouteLabel(pageKey);
    if (window.TCSReviewGuide) window.TCSReviewGuide.update(pageKey);
    if (typeof page.init === 'function') page.init();
    if (window.AnnotationRuntime) window.AnnotationRuntime.refresh();
    app.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }

  function navigate(pageKey) {
    var route = isKnownRoute(pageKey) ? pageKey : 'home';
    if (window.location.hash === '#' + route) {
      renderRoute();
    } else {
      window.location.hash = route;
    }
  }

  function init() {
    if (window.TCSNav) window.TCSNav.init();
    window.addEventListener('hashchange', renderRoute);
    renderRoute();
  }

  window.TCSApp = {
    navigate: navigate,
    render: renderRoute,
    getCurrentPage: function () { return currentPage; },
    getRouteLabel: getRouteLabel
  };
  window.navigateTo = navigate;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
