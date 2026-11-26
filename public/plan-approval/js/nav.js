(function () {
  'use strict';

  var currentPage = 'review';
  var menu = [
    { label: '权限管理', children: [{ label: '用户管理' }, { label: '角色管理' }, { label: '菜单管理' }] },
    { label: '问卷管理', children: [{ label: '问卷列表' }] },
    {
      label: '审批管理',
      children: [
        { label: '问卷发布审批' },
        { href: '../index.html?view=review', label: '人工审核点评' },
        { key: 'plan', label: '调查方案审批' },
        { label: '我的审批' }
      ]
    },
    { label: '素材管理', children: [{ label: '链接库' }, { label: '图标库' }] },
    {
      label: '统计报表',
      children: [
        { label: '车主统计TCS' }, { label: '未点评里推送日志' },
        { href: '../index.html?view=question', label: '问题表明细' },
        { href: '../index.html?view=customer', label: '客户表明细' },
        { label: '点评奖励发放日志' },
        { href: '../index.html?view=duration', label: '答题时长统计' },
        { label: '逻辑树管理' },
        { href: '../logic-tree-association/pages/association.html?feature=F02&preview=20261012-no-layer', label: '逻辑树关联配置' },
        { href: '../index.html?view=survey', label: '问卷报表明细' }
      ]
    },
    { label: '配置管理', children: [{ href: '../index.html?view=sampleValidity', label: '系统样本有效性' }, { label: '积分发放配置' }] }
  ];

  function escape(value) {
    return window.escapeHtml ? window.escapeHtml(value) : String(value || '');
  }

  function renderItem(item, depth) {
    var hasChildren = item.children && item.children.length;
    var link;
    if (item.href) {
      link = '<a href="' + escape(item.href) + '" class="nav-link"><span class="nav-label">' + escape(item.label) + '</span></a>';
    } else if (item.key) {
      link = '<a href="#' + escape(item.key) + '" class="nav-link" data-page="' + escape(item.key) + '">' +
        '<span class="nav-label">' + escape(item.label) + '</span></a>';
    } else if (hasChildren) {
      link = '<button type="button" class="nav-link nav-link--group nav-link--expanded" aria-expanded="true"><span class="nav-label">' +
        escape(item.label) + '</span><span class="nav-chevron" aria-hidden="true">⌃</span></button>';
    } else {
      link = '<span class="nav-link nav-link--visual' + (hasChildren ? ' nav-link--group nav-link--expanded' : '') +
        '" aria-disabled="true"><span class="nav-label">' + escape(item.label) + '</span></span>';
    }

    return '<li class="nav-item' + (hasChildren ? ' nav-item--group' : '') + '">' +
      link + (hasChildren ? buildTree(item.children, depth + 1) : '') + '</li>';
  }

  function buildTree(items, depth) {
    var cls = depth === 0 ? 'nav-list nav-list--root' : 'nav-list nav-list--sub';
    return '<ul class="' + cls + '">' + items.map(function (item) {
      return renderItem(item, depth);
    }).join('') + '</ul>';
  }

  function render() {
    var navEl = document.getElementById('main-nav');
    if (!navEl) return;
    navEl.innerHTML = [
      '<div class="brand">',
        '<img class="brand__logo" src="assets/images/nissan-logo.png" alt="NISSAN">',
        '<span class="brand__copy"><strong>微信客户调研平台</strong><small>TCS</small></span>',
      '</div>',
      buildTree(menu, 0)
    ].join('');
    bindClicks(navEl);
    highlightCurrent();
  }

  function bindClicks(navEl) {
    var links = navEl.querySelectorAll('.nav-link[data-page]');
    Array.prototype.forEach.call(links, function (link) {
      link.addEventListener('click', function (event) {
        event.preventDefault();
        var pageKey = this.getAttribute('data-page');
        if (pageKey && window.TCSApp) window.TCSApp.navigate(pageKey);
      });
    });
    Array.prototype.forEach.call(navEl.querySelectorAll('.nav-link--group'), function (button) {
      button.addEventListener('click', function () {
        var expanded = this.getAttribute('aria-expanded') === 'true';
        this.setAttribute('aria-expanded', String(!expanded));
        this.querySelector('.nav-chevron').textContent = expanded ? '⌄' : '⌃';
        this.parentNode.querySelector('.nav-list--sub').hidden = expanded;
      });
    });
  }

  function highlightCurrent() {
    var navEl = document.getElementById('main-nav');
    if (!navEl) return;
    var activeLinks = navEl.querySelectorAll('.nav-link.active');
    Array.prototype.forEach.call(activeLinks, function (link) {
      link.classList.remove('active');
    });
    var navPage = currentPage === 'sampling' ? 'plan' : currentPage;
    var currentLink = navEl.querySelector('.nav-link[data-page="' + navPage + '"]');
    if (currentLink) currentLink.classList.add('active');
  }

  function setActive(pageKey) {
    currentPage = pageKey;
    highlightCurrent();
  }

  function closeMobile() {
    document.body.classList.remove('sidebar-open');
    var toggle = document.getElementById('mobile-nav-toggle');
    if (toggle) {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', '打开导航');
    }
  }

  function bindMobile() {
    var toggle = document.getElementById('mobile-nav-toggle');
    var scrim = document.getElementById('sidebar-scrim');
    if (toggle) {
      toggle.addEventListener('click', function () {
        document.body.classList.toggle('sidebar-open');
        var open = document.body.classList.contains('sidebar-open');
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? '关闭导航' : '打开导航');
      });
    }
    if (scrim) scrim.addEventListener('click', closeMobile);
  }

  window.TCSNav = {
    init: function () {
      render();
      bindMobile();
    },
    setActive: setActive,
    closeMobile: closeMobile
  };
})();
