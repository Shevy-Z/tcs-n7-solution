(function () {
  'use strict';

  var annotationPanel = null;
  var cLayout = null;
  var cPageRoot = null;
  var viewKey = '';
  var panelSignature = '';
  var collapsed = false;
  var highlightedSelector = null;
  var highlightTimer = null;
  var activePopup = null;
  var currentAnno = null;
  var dragState = null;
  var observer = null;

  var sectionFields = [
    ['functionName', '功能名称'],
    ['functionDesc', '功能说明'],
    ['permissionScope', '权限范围'],
    ['dataSource', '数据来源'],
    ['valueLogic', '取值逻辑'],
    ['fieldDesc', '字段说明'],
    ['interactionDesc', '交互说明'],
    ['judgeRule', '判断规则'],
    ['exceptionRule', '异常规则'],
    ['otherDesc', '其他说明']
  ];

  function getConfig() {
    return window.AnnotationConfig || {};
  }

  function getPageKey() {
    var cfg = getConfig();
    if (typeof cfg.page === 'function') return cfg.page();
    if (cfg.page) return cfg.page;
    var active = document.querySelector('.nav-sub-item.active');
    return active && active.id ? active.id : 'index';
  }

  function getRawAnnotations() {
    var cfg = getConfig();
    var page = getPageKey();
    if (cfg.dataKey && Array.isArray(window[cfg.dataKey])) {
      return window[cfg.dataKey].filter(function (item) { return item.page === page; });
    }
    if (window.AnnotationData && Array.isArray(window.AnnotationData[page])) {
      return window.AnnotationData[page];
    }
    return [];
  }

  function storageKey() {
    var cfg = getConfig();
    var projectId = cfg.projectId || window.location.pathname || 'default-project';
    var dataVersion = cfg.dataVersion || '1';
    return ['prototype_annotations', projectId, dataVersion, getPageKey()].join('_');
  }

  function loadCached() {
    try {
      var raw = window.localStorage.getItem(storageKey());
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      return [];
    }
  }

  function saveCached(items) {
    try {
      window.localStorage.setItem(storageKey(), JSON.stringify(items));
    } catch (err) {
      showToast('保存到浏览器缓存失败');
    }
  }

  function getAnnotations() {
    var source = getRawAnnotations();
    if (!source.length) return [];
    // Read-only review pages always show the checked-in source, never stale edits.
    var cached = option('editable') === true ? loadCached() : [];
    var cachedMap = {};
    cached.forEach(function (item) {
      if (item && item.id != null) cachedMap[item.id] = item;
    });
    var items = source.map(function (item) {
      return clone(cachedMap[item.id] || item);
    }).sort(function (a, b) {
      return Number(a.id) - Number(b.id);
    });
    var filter = getConfig().filterAnnotations;
    return typeof filter === 'function' ? filter(items) : items;
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value || {}));
  }

  function option(name) {
    var value = getConfig()[name];
    return typeof value === 'function' ? value() : value;
  }

  function renderedTarget(selector) {
    var target = resolveTarget(selector);
    if (!target || !target.getClientRects().length || getComputedStyle(target).visibility === 'hidden') return null;
    return target;
  }

  function targetMessage(selector) {
    if (!selector) return '说明缺少定位信息，当前无法定位。';
    try {
      var matches = document.querySelectorAll(selector);
      if (!matches.length) return '未找到对应内容，当前无法定位。';
      if (matches.length !== 1) return '对应内容不唯一，当前无法定位。';
      if (!renderedTarget(selector)) return '对应内容当前不可见；点击说明可查看所在步骤。';
    } catch (err) {
      return '说明定位信息不可用，当前无法定位。';
    }
    return '';
  }

  function showTargetStatus(note, message) {
    if (!note) return;
    var status = note.querySelector('.anno-target-status');
    if (status && status.textContent !== message) status.textContent = message;
    if (status) status.hidden = !message;
  }

  function previewTarget(anno, note) {
    var message = targetMessage(anno.target);
    showTargetStatus(note, message);
    if (message) clearHighlight();
    else highlight(anno.target);
  }

  function clearHighlight() {
    window.clearTimeout(highlightTimer);
    highlightedSelector = null;
    var hotspot = document.getElementById('anno-hotspot');
    if (hotspot) hotspot.remove();
  }

  function updateHighlight() {
    if (!highlightedSelector) return;
    var target = renderedTarget(highlightedSelector);
    var hotspot = document.getElementById('anno-hotspot');
    if (!hotspot) {
      hotspot = document.createElement('div');
      hotspot.id = 'anno-hotspot';
      hotspot.setAttribute('aria-hidden', 'true');
      document.body.appendChild(hotspot);
    }
    if (!target) { hotspot.hidden = true; return; }
    var box = target.getBoundingClientRect();
    var left = Math.max(0, box.left), top = Math.max(0, box.top);
    var right = Math.min(window.innerWidth, box.right), bottom = Math.min(window.innerHeight, box.bottom);
    for (var parent = target.parentElement; parent && parent !== document.body; parent = parent.parentElement) {
      var style = getComputedStyle(parent), rect = parent.getBoundingClientRect();
      if (/(auto|scroll|hidden|clip)/.test(style.overflowX)) {
        left = Math.max(left, rect.left); right = Math.min(right, rect.right);
      }
      if (/(auto|scroll|hidden|clip)/.test(style.overflowY)) {
        top = Math.max(top, rect.top); bottom = Math.min(bottom, rect.bottom);
      }
    }
    hotspot.hidden = right <= left || bottom <= top;
    if (!hotspot.hidden) {
      hotspot.style.left = left + 'px'; hotspot.style.top = top + 'px';
      hotspot.style.width = (right - left) + 'px'; hotspot.style.height = (bottom - top) + 'px';
    }
  }

  function highlight(selector) {
    clearHighlight();
    highlightedSelector = selector;
    updateHighlight();
  }

  function locate(anno, note) {
    var cfg = getConfig(), page = getPageKey();
    Promise.resolve().then(function () {
      if (typeof cfg.revealTarget === 'function') return cfg.revealTarget(anno);
    }).then(function () {
      if (page !== getPageKey() || option('enabled') !== true) return;
      var target = renderedTarget(anno.target);
      if (!target) {
        var message = targetMessage(anno.target);
        clearHighlight(); showTargetStatus(note, message); showToast(message); return;
      }
      showTargetStatus(note, '');
      target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
      highlight(anno.target);
      highlightTimer = window.setTimeout(function () {
        if (!note.matches(':hover, :focus-within')) clearHighlight();
      }, 2200);
    }).catch(function () { clearHighlight(); showToast('无法打开目标所在状态'); });
  }

  function removeView() {
    clearHighlight();
    closePopup();
    document.querySelectorAll('.anno-toast').forEach(function (toast) { toast.remove(); });
    if (annotationPanel) annotationPanel.remove();
    annotationPanel = null;
    var reopen = document.getElementById('anno-reopen');
    if (reopen) reopen.remove();
    if (cLayout && cLayout.parentNode) {
      if (cPageRoot && cPageRoot.parentNode === cLayout) cLayout.parentNode.insertBefore(cPageRoot, cLayout);
      cLayout.remove();
    }
    cLayout = null; cPageRoot = null;
    document.body.classList.remove('anno-b-reserved', 'anno-b-collapsed');
    document.body.style.removeProperty('--anno-original-padding');
    viewKey = ''; panelSignature = '';
  }

  function applyCollapse() {
    var reopen = document.getElementById('anno-reopen');
    if (!annotationPanel || !reopen) return;
    annotationPanel.hidden = collapsed;
    reopen.hidden = !collapsed;
    document.body.classList.toggle('anno-b-reserved', !collapsed);
    document.body.classList.toggle('anno-b-collapsed', collapsed);
    if (collapsed) clearHighlight();
    window.dispatchEvent(new CustomEvent('annotation:layout-change', { detail: { collapsed: collapsed } }));
  }

  function createView(mode, root) {
    annotationPanel = document.createElement('aside');
    annotationPanel.id = 'anno-panel';
    annotationPanel.className = 'anno-panel ' + (mode === 'c-side' ? 'anno-sidecar' : 'anno-drawer');
    annotationPanel.setAttribute('aria-label', option('pageTitle') || '页面标注');
    if (mode === 'c-side') {
      cPageRoot = root;
      cLayout = document.createElement('div');
      cLayout.className = 'anno-c-layout';
      root.parentNode.insertBefore(cLayout, root);
      cLayout.appendChild(root);
      cLayout.appendChild(annotationPanel);
    } else {
      document.body.style.setProperty('--anno-original-padding', getComputedStyle(document.body).paddingInlineEnd);
      document.body.appendChild(annotationPanel);
      var reopen = document.createElement('button');
      reopen.id = 'anno-reopen'; reopen.type = 'button'; reopen.textContent = '展开标注';
      reopen.setAttribute('aria-controls', 'anno-panel');
      reopen.setAttribute('aria-expanded', 'false');
      reopen.addEventListener('click', function () {
        collapsed = false; applyCollapse();
        annotationPanel.querySelector('.anno-collapse').focus();
      });
      document.body.appendChild(reopen);
      applyCollapse();
    }
  }

  function createNote(anno, index) {
    var note = document.createElement('li'); note.className = 'anno-note';
    note.dataset.annotationId = anno.id || String(index + 1);
    if (anno.sourceKind) note.dataset.sourceKind = anno.sourceKind;
    var link = document.createElement('button'); link.type = 'button'; link.className = 'anno-note-link';
    link.dataset.annotationId = anno.id || String(index + 1);
    var title = document.createElement('span'); title.className = 'anno-note-title';
    title.textContent = (anno.id || String(index + 1)) + '. ' + (anno.title || '未命名标注') + '\n';
    link.appendChild(title);
    var sections = anno.sections || {}, hasText = false;
    sectionFields.forEach(function (field) {
      if (!sections[field[0]]) return;
      var text = document.createElement('span'); text.className = 'anno-note-detail';
      var label = (getConfig().sectionLabels || {})[field[0]] || field[1];
      text.textContent = (option('showSectionLabels') === false ? '' : label + '：') + sections[field[0]];
      link.appendChild(text); hasText = true;
    });
    if (!hasText && anno.desc) {
      var legacy = document.createElement('div');
      legacy.innerHTML = String(anno.desc).replace(/<br\s*\/?\s*>/gi, '\n');
      var desc = document.createElement('span'); desc.className = 'anno-note-detail';
      desc.textContent = legacy.textContent; link.appendChild(desc);
    }
    link.addEventListener('click', function () { locate(anno, note); });
    note.addEventListener('mouseenter', function () { previewTarget(anno, note); });
    note.addEventListener('mouseleave', clearHighlight);
    link.addEventListener('focus', function () { previewTarget(anno, note); });
    link.addEventListener('blur', clearHighlight);
    var status = document.createElement('span'); status.className = 'anno-target-status';
    status.setAttribute('role', 'status'); status.hidden = true; link.appendChild(status);
    note.appendChild(link);
    if (option('editable') === true) {
      var edit = document.createElement('button'); edit.type = 'button'; edit.className = 'anno-btn';
      edit.textContent = '编辑 / 导出';
      edit.addEventListener('click', function () { openPopup(anno, edit); });
      note.appendChild(edit);
    }
    return note;
  }

  function render() {
    var mode = option('mode');
    if (option('enabled') !== true || (mode !== 'c-side' && mode !== 'b-drawer')) { removeView(); return; }
    var root = mode === 'c-side' ? resolveTarget(option('pageRoot')) : null;
    if (mode === 'c-side' && (!root || root === document.body || root === document.documentElement)) { removeView(); return; }
    var key = getPageKey() + '|' + mode;
    if (key !== viewKey || !annotationPanel || !annotationPanel.isConnected || (mode === 'c-side' && root !== cPageRoot)) {
      removeView(); collapsed = false;
      createView(mode, root); viewKey = key;
    }
    var items = getAnnotations(), titleText = option('pageTitle') || '本页交互与规则';
    var contextText = option('pageContext') || '';
    var signature = JSON.stringify([items, titleText, contextText, option('editable')]);
    if (signature !== panelSignature) {
      annotationPanel.innerHTML = '';
      var header = document.createElement('div'); header.className = 'anno-panel-header';
      var heading = document.createElement('h2'); heading.textContent = titleText; header.appendChild(heading);
      if (mode === 'b-drawer') {
        var close = document.createElement('button'); close.type = 'button'; close.className = 'anno-btn anno-collapse';
        close.textContent = '收起'; close.setAttribute('aria-controls', 'anno-panel'); close.setAttribute('aria-expanded', 'true');
        close.addEventListener('click', function () {
          collapsed = true; applyCollapse(); document.getElementById('anno-reopen').focus();
        });
        header.appendChild(close);
      }
      annotationPanel.appendChild(header);
      if (contextText) {
        var context = document.createElement('p'); context.className = 'anno-panel-context';
        context.textContent = contextText; annotationPanel.appendChild(context);
      }
      var list = document.createElement('ol'); list.className = 'anno-note-list';
      items.forEach(function (anno, index) { list.appendChild(createNote(anno, index)); });
      annotationPanel.appendChild(list);
      if (!items.length) {
        var empty = document.createElement('p'); empty.className = 'anno-empty'; empty.textContent = '本页暂无标注'; annotationPanel.appendChild(empty);
      }
      panelSignature = signature;
    }
    updateHighlight();
  }

  function resolveTarget(selector) {
    if (!selector) return null;
    try {
      var nodes = document.querySelectorAll(selector);
      return nodes.length === 1 ? nodes[0] : null;
    } catch (err) {
      return null;
    }
  }

  function openPopup(anno, marker) {
    closePopup();
    currentAnno = clone(anno);
    currentAnno.desc = currentAnno.desc || generateDesc(currentAnno.sections);
    activePopup = document.createElement('div');
    activePopup.className = 'anno-popup';
    activePopup.innerHTML = buildViewHTML(currentAnno);
    document.body.appendChild(activePopup);
    positionPopup(activePopup, marker);
    bindViewEvents();
    bindDrag();
  }

  function positionPopup(popup, marker) {
    var rect = marker.getBoundingClientRect();
    var popupWidth = popup.offsetWidth;
    var popupHeight = popup.offsetHeight;
    var left = rect.right + 12;
    var top = rect.top;
    if (left + popupWidth > window.innerWidth - 16) {
      left = rect.left - popupWidth - 12;
    }
    left = Math.max(16, Math.min(left, window.innerWidth - popupWidth - 16));
    top = Math.max(16, Math.min(top, window.innerHeight - popupHeight - 16));
    popup.style.left = left + 'px';
    popup.style.top = top + 'px';
  }

  function fitPopupToViewport(popup) {
    if (!popup) return;
    var rect = popup.getBoundingClientRect();
    var left = Math.max(16, Math.min(rect.left, window.innerWidth - rect.width - 16));
    var top = Math.max(16, Math.min(rect.top, window.innerHeight - rect.height - 16));
    popup.style.left = left + 'px';
    popup.style.top = top + 'px';
  }

  function buildViewHTML(anno) {
    return ''
      + '<div class="anno-popup-header">'
      + '  <div class="anno-popup-title">' + escapeHTML(anno.title || '未命名标注') + '</div>'
      + '  <button class="anno-popup-close" type="button" title="关闭">&times;</button>'
      + '</div>'
      + '<div class="anno-popup-body"><div class="anno-popup-desc">' + (anno.desc || generateDesc(anno.sections)) + '</div></div>'
      + '<div class="anno-popup-footer">'
      + '  <button class="anno-btn anno-copy" type="button">复制数据</button>'
      + '  <button class="anno-btn anno-btn-primary anno-edit" type="button">编辑</button>'
      + '</div>';
  }

  function buildEditHTML(anno) {
    var sections = anno.sections || {};
    var fields = sectionFields.map(function (field) {
      return ''
        + '<div class="anno-edit-field">'
        + '  <label class="anno-edit-label">' + field[1] + '</label>'
        + '  <textarea class="anno-edit-textarea" data-section="' + field[0] + '">' + escapeHTML(sections[field[0]] || '') + '</textarea>'
        + '</div>';
    }).join('');
    return ''
      + '<div class="anno-popup-header">'
      + '  <div class="anno-popup-title">编辑标注</div>'
      + '  <button class="anno-popup-close" type="button" title="关闭">&times;</button>'
      + '</div>'
      + '<div class="anno-popup-body">'
      + '  <div class="anno-edit-field">'
      + '    <label class="anno-edit-label">标注标题</label>'
      + '    <input class="anno-edit-input" id="anno-edit-title" value="' + escapeHTML(anno.title || '') + '">'
      + '  </div>'
      + fields
      + '</div>'
      + '<div class="anno-popup-footer">'
      + '  <button class="anno-btn anno-cancel" type="button">取消</button>'
      + '  <button class="anno-btn anno-copy" type="button">复制数据</button>'
      + '  <button class="anno-btn anno-btn-primary anno-save" type="button">保存</button>'
      + '</div>';
  }

  function bindViewEvents() {
    activePopup.querySelector('.anno-popup-close').addEventListener('click', closePopup);
    activePopup.querySelector('.anno-copy').addEventListener('click', copyCurrent);
    activePopup.querySelector('.anno-edit').addEventListener('click', function () {
      activePopup.innerHTML = buildEditHTML(currentAnno);
      bindEditEvents();
      bindDrag();
      fitPopupToViewport(activePopup);
    });
  }

  function bindEditEvents() {
    activePopup.querySelector('.anno-popup-close').addEventListener('click', closePopup);
    activePopup.querySelector('.anno-cancel').addEventListener('click', function () {
      activePopup.innerHTML = buildViewHTML(currentAnno);
      bindViewEvents();
      bindDrag();
      fitPopupToViewport(activePopup);
    });
    activePopup.querySelector('.anno-copy').addEventListener('click', copyCurrent);
    activePopup.querySelector('.anno-save').addEventListener('click', saveEdit);
  }

  function saveEdit() {
    currentAnno.title = activePopup.querySelector('#anno-edit-title').value.trim();
    currentAnno.sections = {};
    activePopup.querySelectorAll('[data-section]').forEach(function (field) {
      currentAnno.sections[field.getAttribute('data-section')] = field.value.trim();
    });
    sectionFields.forEach(function (field) {
      if (!(field[0] in currentAnno.sections)) currentAnno.sections[field[0]] = '';
    });
    currentAnno.desc = generateDesc(currentAnno.sections);
    var items = getAnnotations();
    var found = false;
    items = items.map(function (item) {
      if (item.id === currentAnno.id) {
        found = true;
        return clone(currentAnno);
      }
      return item;
    });
    if (!found) items.push(clone(currentAnno));
    saveCached(items);
    render();
    activePopup.innerHTML = buildViewHTML(currentAnno);
    bindViewEvents();
    bindDrag();
    fitPopupToViewport(activePopup);
    showToast('已保存到浏览器缓存');
  }

  function copyCurrent() {
    if (!currentAnno) return;
    copyText(JSON.stringify(currentAnno, null, 2));
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { showToast('数据已复制'); });
      return;
    }
    var input = document.createElement('textarea');
    input.value = text;
    input.style.position = 'fixed';
    input.style.left = '-9999px';
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    input.remove();
    showToast('数据已复制');
  }

  function bindDrag() {
    var header = activePopup.querySelector('.anno-popup-header');
    header.addEventListener('mousedown', function (event) {
      if (event.target.closest('button')) return;
      var rect = activePopup.getBoundingClientRect();
      dragState = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      event.preventDefault();
    });
  }

  function closePopup() {
    if (activePopup) activePopup.remove();
    activePopup = null;
    currentAnno = null;
    dragState = null;
  }

  function generateDesc(sections) {
    var data = sections || {};
    return sectionFields.map(function (field, index) {
      return (index + 1) + '. ' + field[1] + '：' + escapeHTML(data[field[0]] || '待确认');
    }).join('<br>');
  }

  function escapeHTML(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function showToast(text) {
    var old = document.querySelector('.anno-toast');
    if (old) old.remove();
    var toast = document.createElement('div');
    toast.className = 'anno-toast';
    toast.textContent = text;
    document.body.appendChild(toast);
    setTimeout(function () { toast.remove(); }, 1800);
  }

  document.addEventListener('mousemove', function (event) {
    if (!dragState || !activePopup) return;
    var x = Math.max(8, Math.min(event.clientX - dragState.x, window.innerWidth - activePopup.offsetWidth - 8));
    var y = Math.max(8, Math.min(event.clientY - dragState.y, window.innerHeight - activePopup.offsetHeight - 8));
    activePopup.style.left = x + 'px';
    activePopup.style.top = y + 'px';
  });

  document.addEventListener('mouseup', function () {
    dragState = null;
    fitPopupToViewport(activePopup);
  });

  window.addEventListener('resize', function () { render(); fitPopupToViewport(activePopup); });
  window.addEventListener('scroll', updateHighlight, true);

  function observeChanges() {
    if (observer) observer.disconnect();
    observer = new MutationObserver(function (mutations) {
      if (option('enabled') !== true) return;
      var ownUI = '#anno-panel, #anno-reopen, #anno-hotspot, .anno-popup, .anno-toast';
      var relevant = mutations.some(function (mutation) {
        var target = mutation.target;
        if (target.closest && target.closest(ownUI)) return false;
        if (mutation.type === 'childList') {
          var changed = Array.from(mutation.addedNodes).concat(Array.from(mutation.removedNodes));
          if (changed.length && changed.every(function (node) { return node.nodeType === 1 && node.matches(ownUI); })) return false;
        }
        return true;
      });
      if (!relevant) return;
      window.clearTimeout(observer._timer);
      observer._timer = window.setTimeout(render, 100);
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style', 'hidden', 'open'] });
  }

  function init() {
    render();
    if (option('observeChanges') !== false) observeChanges();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.AnnotationRuntime = {
    refresh: render,
    getPageKey: getPageKey,
    getAnnotations: getAnnotations,
    clearHighlight: clearHighlight,
    close: closePopup
  };
})();
