(function () {
  'use strict';

  window.escapeHtml = function (value) {
    return String(value === undefined || value === null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  window.showToast = function (message, type) {
    var region = document.getElementById('toast-region');
    if (!region) return;
    var toast = document.createElement('div');
    toast.className = 'toast toast--' + (type || 'success');
    toast.setAttribute('role', 'status');
    toast.innerHTML = '<span>' + window.escapeHtml(message) + '</span>';
    region.appendChild(toast);
    window.setTimeout(function () {
      toast.classList.add('toast--leaving');
      window.setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 180);
    }, 2600);
  };

  window.openOverlay = function (content, options) {
    var root = document.getElementById('overlay-root');
    if (!root) return;
    var opts = options || {};
    root.innerHTML = [
      '<div class="modal-overlay" data-overlay-close="true">',
        '<section class="modal-content ', window.escapeHtml(opts.className || ''), '" role="dialog" aria-modal="true" aria-label="', window.escapeHtml(opts.label || '详情'), '">',
          content,
        '</section>',
      '</div>'
    ].join('');
    document.body.classList.add('overlay-open');
    var overlay = root.querySelector('.modal-overlay');
    overlay.addEventListener('click', function (event) {
      if (event.target.getAttribute('data-overlay-close') === 'true') window.closeOverlay();
    });
    var closeButtons = root.querySelectorAll('[data-close-overlay]');
    Array.prototype.forEach.call(closeButtons, function (button) {
      button.addEventListener('click', window.closeOverlay);
    });
    var focusTarget = root.querySelector('button, input, select, textarea');
    if (focusTarget) focusTarget.focus();
  };

  window.closeOverlay = function () {
    var root = document.getElementById('overlay-root');
    if (root) root.innerHTML = '';
    document.body.classList.remove('overlay-open');
  };

  window.downloadTextFile = function (filename, content, mimeType) {
    var blob = new Blob(['\uFEFF' + content], { type: mimeType || 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 500);
  };

  window.formatNumber = function (value, digits) {
    var number = Number(value);
    if (!Number.isFinite(number)) return '—';
    return number.toLocaleString('zh-CN', {
      minimumFractionDigits: digits || 0,
      maximumFractionDigits: digits || 0
    });
  };

  window.getRouteLabel = function (route) {
    var queue = (window.TCSData && window.TCSData.nav || []).slice();
    while (queue.length) {
      var item = queue.shift();
      if (item.key === route) return item.label;
      if (item.children) queue = queue.concat(item.children);
    }
    return '未识别页面';
  };
})();
