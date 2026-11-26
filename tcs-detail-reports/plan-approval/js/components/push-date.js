(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.TCSPushDate = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  function day(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    var time = Date.parse(value + 'T00:00:00Z');
    return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value ? time : null;
  }
  function atOffset(deliveryDate, baseDays, rangeDays, offset) {
    var start = day(deliveryDate);
    if (start === null) return { ok: false, reason: '交车日期缺失或无效' };
    if (![baseDays, rangeDays, offset].every(Number.isSafeInteger) || baseDays < 1 || rangeDays < 0 || offset < 0 || offset > rangeDays) {
      return { ok: false, reason: '基准天数或随机整数偏移无效' };
    }
    var base = new Date(start + baseDays * 86400000);
    var actual = new Date(start + (baseDays + offset) * 86400000);
    if (!Number.isFinite(base.getTime()) || !Number.isFinite(actual.getTime())) return { ok: false, reason: '日期超出可演示范围' };
    return { ok: true, deliveryDate: deliveryDate, baseDays: baseDays, rangeDays: rangeDays, offset: offset,
      baseDate: base.toISOString().slice(0, 10), actualDate: actual.toISOString().slice(0, 10) };
  }
  function range(deliveryDate, baseDays, rangeDays) {
    var first = atOffset(deliveryDate, baseDays, rangeDays, 0);
    var last = atOffset(deliveryDate, baseDays, rangeDays, rangeDays);
    return first.ok && last.ok ? { ok: true, earliest: first.actualDate, latest: last.actualDate, baseDate: first.baseDate } : (first.ok ? last : first);
  }
  function demoOffset(rangeDays, random) {
    if (!Number.isSafeInteger(rangeDays) || rangeDays < 0) return null;
    var value = (random || Math.random)();
    if (!Number.isFinite(value) || value < 0 || value >= 1) return null;
    return Math.min(rangeDays, Math.floor(value * (rangeDays + 1)));
  }
  return { version: 'EXEC-0914-PUSH-DATE', atOffset: atOffset, range: range, demoOffset: demoOffset };
});
