(function () {
  'use strict';

  function escape(value) {
    return window.escapeHtml(String(value === undefined || value === null ? '' : value));
  }

  function tag(text, type) {
    return '<span class="tag tag--' + escape(type || 'neutral') + '">' + escape(text) + '</span>';
  }

  function pageHeader(options) {
    var actions = options.actions || '';
    var eyebrow = options.eyebrow ? '<div class="page-eyebrow">' + escape(options.eyebrow) + '</div>' : '';
    return [
      '<header class="page-header">',
        '<div>',
          eyebrow,
          '<div class="page-title-row">',
            '<h1>', escape(options.title), '</h1>',
            options.badge ? tag(options.badge, options.badgeType || 'info') : '',
          '</div>',
          options.subtitle ? '<p class="page-subtitle">' + escape(options.subtitle) + '</p>' : '',
        '</div>',
        actions ? '<div class="page-actions">' + actions + '</div>' : '',
      '</header>'
    ].join('');
  }

  function notice(title, body, type) {
    return [
      '<section class="notice notice--', escape(type || 'info'), '">',
        '<div><strong>', escape(title), '</strong><p>', escape(body), '</p></div>',
      '</section>'
    ].join('');
  }

  function statCard(label, value, note, tone) {
    return [
      '<article class="stat-card stat-card--', escape(tone || 'blue'), '">',
        '<span class="stat-card__label">', escape(label), '</span>',
        '<strong class="stat-card__value">', escape(value), '</strong>',
        '<span class="stat-card__note">', escape(note || ''), '</span>',
      '</article>'
    ].join('');
  }

  function empty(title, note) {
    return [
      '<div class="empty-state">',
        '<strong>', escape(title), '</strong>',
        '<p>', escape(note || ''), '</p>',
      '</div>'
    ].join('');
  }

  function sectionHeader(title, description, actions) {
    return [
      '<div class="section-header">',
        '<div><h2>', escape(title), '</h2>', description ? '<p>' + escape(description) + '</p>' : '', '</div>',
        actions ? '<div class="section-actions">' + actions + '</div>' : '',
      '</div>'
    ].join('');
  }

  window.TCSUI = {
    tag: tag,
    pageHeader: pageHeader,
    notice: notice,
    statCard: statCard,
    empty: empty,
    sectionHeader: sectionHeader
  };
})();
