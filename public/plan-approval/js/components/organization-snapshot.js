(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.TCSOrganizationSnapshot = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  function freeze(value) {
    if (!value || typeof value !== 'object') return value;
    Object.keys(value).forEach(function (key) { freeze(value[key]); });
    return Object.freeze(value);
  }
  function capture(source) {
    if (!source || source.fetchStatus !== 'success' || !source.acquiredAt || !Array.isArray(source.records)) {
      return freeze({ snapshotId: source && source.snapshotId || '', status: 'not-acquired', records: [] });
    }
    var snapshot = JSON.parse(JSON.stringify(source));
    snapshot.status = 'frozen';
    snapshot.frozenAt = snapshot.acquiredAt;
    return freeze(snapshot);
  }
  function compare(snapshot, latest) {
    var current = Object.create(null);
    (latest && latest.records || []).forEach(function (record) { current[record.storeCode] = record; });
    return (snapshot && snapshot.records || []).map(function (record) {
      var next = current[record.storeCode];
      var keys = ['province', 'city', 'region', 'district'];
      return { storeCode: record.storeCode, storeName: record.storeName,
        frozen: keys.map(function (key) { return record[key] || '—'; }).join(' / '),
        latest: next ? keys.map(function (key) { return next[key] || '—'; }).join(' / ') : '未取得',
        changed: Boolean(next && keys.some(function (key) { return record[key] !== next[key]; })) };
    });
  }
  return { capture: capture, compare: compare };
});
