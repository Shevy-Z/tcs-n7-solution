(function (root, factory) {
  'use strict';
  var core = typeof module === 'object' && module.exports ? require('./calculator.js') : root.TCSSampling;
  var api = factory(core);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.TCSMonthlySampling = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (core) {
  'use strict';

  var VERSION = 'TCS-DELIVERY-MONTH-CODE18-MOCK-2026-09-14';
  var STATUS_LABELS = {
    MOCK_SELECTED: '已生成固定顺序示例 VIN',
    ROUNDING_DIFFERENCE_PENDING: '车型取整差额待处理',
    CODE_MISSING_PENDING: '18位码缺失或无效',
    SALES_BASIS_PENDING: '销量统计口径待确认',
    SALES_STATISTICS_PENDING: '销量统计不完整或无效',
    ZERO_SALES_TOTAL: '销量分母为零，处理待确认',
    CANDIDATES_INSUFFICIENT: '该级别候选不足，处理待确认',
    INPUT_INVALID: '候选信息不完整或冲突',
    BASE_CALCULATION_FAILED: '原小区计算未完成',
    PENDING_CONFIRMATION: '存在待确认项，未完成示例抽车'
  };

  function text(value) { return typeof value === 'string' ? value.trim() : ''; }
  function copy(value) {
    if (Array.isArray(value)) return value.map(copy);
    if (!value || typeof value !== 'object') return value;
    var output = {};
    Object.keys(value).forEach(function (key) { output[key] = copy(value[key]); });
    return output;
  }
  function key(parts) { return JSON.stringify(parts); }
  function safeCount(value) { return Number.isSafeInteger(value) && value >= 0; }
  function deliveryMonthOf(value) {
    var match = text(value).match(/^(\d{4})-(\d{2})-(\d{2})(?:$|[T ])/);
    if (!match) return null;
    var day = match[1] + '-' + match[2] + '-' + match[3];
    var time = Date.parse(day + 'T00:00:00Z');
    if (!Number.isFinite(time) || new Date(time).toISOString().slice(0, 10) !== day) return null;
    return match[1] + '-' + match[2];
  }
  function isMonth(value) { return /^\d{4}-(0[1-9]|1[0-2])$/.test(text(value)); }
  function monthScope(month, regionId, communityId) {
    // salesMonth 仅为兼容属性，当前值与语义均是 TQMP 交车归月。
    return { samplingMonth: month, salesMonth: month, regionId: regionId, communityId: communityId };
  }
  function classQuota(finalCount, salesCount, salesTotal) {
    // 使用整数分子/分母执行 0.5 进 1；不先截短销量占比。
    var numerator = BigInt(finalCount) * BigInt(salesCount);
    var denominator = BigInt(salesTotal);
    var integer = Number((numerator * BigInt(2) + denominator) / (denominator * BigInt(2)));
    return {
      salesShare: salesCount / salesTotal,
      theoreticalSampleCount: Number(numerator) / salesTotal,
      theoreticalNumerator: String(numerator),
      theoreticalDenominator: String(denominator),
      integerSampleCount: integer
    };
  }

  function calculate(input) {
    var source = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
    var output = {
      version: VERSION,
      coreVersion: core && core.version || null,
      schemeId: text(source.schemeId),
      ratioPercent: source.ratioPercent,
      lowerBound: source.lowerBound,
      salesBasis: text(source.salesBasis),
      monthBasis: 'TQMP_DELIVERY_DATE', deliveryDateMockField: 'tqmpDeliveryDateMock',
      months: [], issues: [], qualificationAudit: [], complete: false,
      status: 'PENDING_CONFIRMATION', statusLabel: STATUS_LABELS.PENDING_CONFIRMATION,
      selectedTotal: 0, candidateTotal: 0, excludedVehicleCount: 0,
      selectionMode: 'FIXED_MOCK_INPUT_ORDER',
      selectionBoundary: '仅在本月本小区输入、销量完整、车型取整差额为0且各码候选足额时，按固定输入顺序展示脱敏 Mock VIN；正式随机、重跑及车型差额处理仍待确认。complete 仅表示静态示例完成。'
    };

    function issue(code, message, scope, local, blocking) {
      var item = { code: code, message: message, severity: blocking === false ? 'info' : 'warning', blocking: blocking !== false };
      Object.keys(scope || {}).forEach(function (name) { item[name] = scope[name]; });
      output.issues.push(item);
      if (local) local.push(item);
      return item;
    }

    if (!input || typeof input !== 'object' || Array.isArray(input)) issue('INPUT_INVALID', '计算输入必须是对象。');
    if (!output.schemeId) issue('SCHEME_ID_MISSING', '调查方案标识缺失，当前输入不可作为完整的方案计算结果。');
    if (!output.salesBasis) issue('SALES_BASIS_PENDING', '未提供独立销量统计口径；不会把销量默认替换为合格候选 VIN 数。');
    if (!Array.isArray(source.vehicles)) issue('VEHICLES_MISSING', '未提供该方案的候选车辆清单。');
    if (!Array.isArray(source.salesStatistics)) issue('SALES_STATISTICS_PENDING', '未提供按交车归月、大区、小区和完整18位码的独立销量统计。');
    var classNames = Object.create(null);

    var statistics = Object.create(null);
    var invalidStatistics = Object.create(null);
    (Array.isArray(source.salesStatistics) ? source.salesStatistics : []).forEach(function (entry, index) {
      var month = text(entry && entry.samplingMonth);
      var regionId = text(entry && entry.regionId);
      var communityId = text(entry && entry.communityId);
      var classId = text(entry && entry.vehicleCode18);
      var groupKey = key([month, regionId, communityId]);
      if (!isMonth(month) || !regionId || !communityId || classId.length !== 18 || !safeCount(entry && entry.salesCount)) {
        invalidStatistics[groupKey] = true;
        issue('SALES_STATISTICS_ROW_INVALID', '销量行缺少交车归月、分组标识、完整18位码或非负整数台数。', Object.assign(monthScope(month, regionId, communityId), { statisticsIndex: index, vehicleCode18: classId }));
        return;
      }
      if (!statistics[groupKey]) statistics[groupKey] = Object.create(null);
      if (Object.prototype.hasOwnProperty.call(statistics[groupKey], classId)) {
        invalidStatistics[groupKey] = true;
        issue('SALES_STATISTICS_DUPLICATED', '同月同大区同小区同18位码有重复销量行；汇总口径未定，不自动相加。', Object.assign(monthScope(month, regionId, communityId), { vehicleCode18: classId, classId: classId }));
        return;
      }
      statistics[groupKey][classId] = entry.salesCount;
      if (text(entry.vehicleClassName)) classNames[classId] = text(entry.vehicleClassName);
    });

    var monthGroups = Object.create(null);
    var seenVins = Object.create(null);
    (Array.isArray(source.vehicles) ? source.vehicles : []).forEach(function (vehicle, index) {
      vehicle = vehicle && typeof vehicle === 'object' ? vehicle : {};
      // 带 Mock 后缀的字段仅为静态演示，不代表正式接口字段合同。
      var month = deliveryMonthOf(vehicle.tqmpDeliveryDateMock);
      var regionId = text(vehicle.regionId);
      var communityId = text(vehicle.communityId);
      var vin = text(vehicle.vin);
      var audit = {
        vehicleIndex: index, vin: vin, vehicleCode18: text(vehicle.vehicleCode18),
        tqmpDeliveryDateMock: text(vehicle.tqmpDeliveryDateMock), salesDate: text(vehicle.salesDate),
        plannedPushDate: text(vehicle.plannedPushDate), samplingMonth: month, salesMonth: month,
        regionId: regionId, communityId: communityId,
        historyPushedMock: vehicle.historyPushedMock === true,
        saleReturnSuccessMock: vehicle.saleReturnSuccessMock === true,
        dataErrorMock: text(vehicle.dataErrorMock), eligible: false, status: '', reason: ''
      };
      output.qualificationAudit.push(audit);
      if (audit.saleReturnSuccessMock) {
        audit.status = 'SALE_RETURN_EXCLUDED'; audit.reason = '销退成功，排除';
        output.excludedVehicleCount += 1;
        issue(audit.status, '销退成功车辆不进入本轮候选。', { vehicleIndex: index, vin: vin }, null, false);
        return;
      }
      if (audit.dataErrorMock) {
        audit.status = 'DATA_ERROR_EXCLUDED'; audit.reason = '错误数据：' + audit.dataErrorMock;
        output.excludedVehicleCount += 1;
        issue(audit.status, audit.reason, { vehicleIndex: index, vin: vin }, null, false);
        return;
      }
      if (!month || !regionId || !communityId || !vin) {
        audit.status = 'GROUP_FIELDS_PENDING'; audit.reason = !month ? 'TQMP交车日期缺失或无效，未归月' : 'VIN或区域标识缺失';
        output.excludedVehicleCount += 1;
        issue('VEHICLE_GROUP_FIELDS_MISSING', audit.reason + '；未回退销售日期或推送日期，正式缺失处理待确认。', { vehicleIndex: index, vin: vin });
        return;
      }
      audit.eligible = true; audit.status = 'ELIGIBLE';
      audit.reason = audit.historyPushedMock ? '资格合格；历史已推送不排除' : '资格合格';
      if (!monthGroups[month]) monthGroups[month] = { samplingMonth: month, salesMonth: month, regions: [], byRegion: Object.create(null) };
      var monthGroup = monthGroups[month];
      if (!monthGroup.byRegion[regionId]) {
        monthGroup.byRegion[regionId] = { regionId: regionId, regionName: text(vehicle.regionName) || regionId, communities: [], byCommunity: Object.create(null) };
        monthGroup.regions.push(monthGroup.byRegion[regionId]);
      }
      var region = monthGroup.byRegion[regionId];
      if (!region.byCommunity[communityId]) {
        region.byCommunity[communityId] = { communityId: communityId, communityName: text(vehicle.communityName) || communityId, vehicles: [], issues: [], invalidIdentity: false };
        region.communities.push(region.byCommunity[communityId]);
      }
      var community = region.byCommunity[communityId];
      var scope = monthScope(month, regionId, communityId);
      var vinKey = vin;
      if (seenVins[vinKey]) {
        var previous = seenVins[vinKey];
        community.invalidIdentity = true;
        previous.community.invalidIdentity = true;
        audit.status = 'DUPLICATE_VIN_PENDING'; previous.audit.status = 'DUPLICATE_VIN_PENDING';
        audit.reason = previous.audit.reason = '当前输入重复VIN，未抽车；与历史已推送标记无关';
        var duplicateMessage = '同方案候选输入重复 VIN ' + vin + '，先核对本次输入，不静默去重或跨组抽取；不因此排除仅有历史推送标记的车辆。';
        issue('DUPLICATE_VIN_PENDING', duplicateMessage, scope, community.issues);
        if (previous.community !== community) issue('DUPLICATE_VIN_PENDING', duplicateMessage, previous.scope, previous.community.issues);
      } else seenVins[vinKey] = { community: community, scope: scope, audit: audit };
      if (!classNames[text(vehicle.vehicleCode18)] && text(vehicle.vehicleClassName)) classNames[text(vehicle.vehicleCode18)] = text(vehicle.vehicleClassName);
      community.vehicles.push(copy(vehicle));
      output.candidateTotal += 1;
    });

    Object.keys(monthGroups).sort().forEach(function (month) {
      var monthResult = { samplingMonth: month, salesMonth: month, regions: [] };
      monthGroups[month].regions.forEach(function (region) {
        var baseInput = {
          regionId: region.regionId, regionName: region.regionName,
          ratioPercent: source.ratioPercent, lowerBound: source.lowerBound,
          communities: region.communities.map(function (community) {
            return {
              id: community.communityId, name: community.communityName,
              candidateCount: community.vehicles.length,
              vins: community.vehicles.map(copy)
            };
          })
        };
        var regionResult = { regionId: region.regionId, regionName: region.regionName, baseInput: copy(baseInput), baseResult: null, communityAllocations: [], issues: [] };
        try {
          if (!core || typeof core.calculate !== 'function') throw new Error('原小区计算器未加载');
          // 每个“交车归月 × 大区”独立调用原小区内核，不改变原调剂口径。
          regionResult.baseResult = core.calculate(baseInput);
        } catch (error) {
          issue('BASE_CALCULATION_FAILED', '原小区计算未完成：' + error.message, monthScope(month, region.regionId), regionResult.issues);
        }

        region.communities.forEach(function (community) {
          var scope = monthScope(month, region.regionId, community.communityId);
          var groupKey = key([month, region.regionId, community.communityId]);
          var salesRows = statistics[groupKey] || Object.create(null);
          var baseRow = regionResult.baseResult && regionResult.baseResult.rows.filter(function (row) { return row.id === community.communityId; })[0];
          var allocation = {
            communityId: community.communityId, communityName: community.communityName,
            finalSampleCount: baseRow ? baseRow.finalSampleCount : null,
            candidateCount: community.vehicles.length, salesTotal: null,
            roundedClassTotal: null, roundingDifference: null,
            classes: [], issues: community.issues.slice(), status: 'PENDING_CONFIRMATION',
            statusLabel: STATUS_LABELS.PENDING_CONFIRMATION, complete: false, selectedTotal: 0
          };
          var candidatesByClass = Object.create(null);
          var classIds = Object.keys(salesRows);
          var codesComplete = true;
          var missingCodes = [];
          community.vehicles.forEach(function (vehicle) {
            var code = text(vehicle.vehicleCode18);
            if (code.length !== 18) {
              codesComplete = false;
              if (missingCodes.indexOf(code || '（缺失18位码）') === -1) missingCodes.push(code || '（缺失18位码）');
              return;
            }
            if (!candidatesByClass[code]) candidatesByClass[code] = [];
            candidatesByClass[code].push(vehicle);
            if (classIds.indexOf(code) === -1) classIds.push(code);
          });
          if (!codesComplete) issue('CODE_MISSING_PENDING', '候选完整18位码缺失或无效：' + missingCodes.join('、') + '。保留小区计算，不推断车型或从 VIN 派生编码。', scope, allocation.issues);
          var statisticsComplete = !invalidStatistics[groupKey] && Object.keys(salesRows).length > 0;
          var total = 0;
          classIds.forEach(function (classId) {
            if (!Object.prototype.hasOwnProperty.call(salesRows, classId)) statisticsComplete = false;
            else if (!Number.isSafeInteger(total + salesRows[classId])) statisticsComplete = false;
            else total += salesRows[classId];
          });
          if (!statisticsComplete) issue('SALES_STATISTICS_PENDING', '该月该小区的级别销量统计不完整、重复或超出安全范围，分母不可靠；不以候选量补齐销量。', scope, allocation.issues);
          else allocation.salesTotal = total;
          if (statisticsComplete && total === 0) issue('ZERO_SALES_TOTAL', '该月该小区总销量为 0，无法计算级别销量占比；正式处理待确认。', scope, allocation.issues);
          if (!output.salesBasis) issue('SALES_BASIS_PENDING', '缺少销量统计口径，不输出貌似确定的级别占比和名额。', scope, allocation.issues);

          var communityBlocker = !baseRow ? 'BASE_CALCULATION_FAILED' : community.invalidIdentity ? 'INPUT_INVALID' : !output.salesBasis ? 'SALES_BASIS_PENDING' : !statisticsComplete ? 'SALES_STATISTICS_PENDING' : total === 0 ? 'ZERO_SALES_TOTAL' : !codesComplete ? 'CODE_MISSING_PENDING' : null;
          classIds.sort().forEach(function (classId) {
            var candidateVehicles = candidatesByClass[classId] || [];
            var row = {
              vehicleCode18: classId, classId: classId, className: classNames[classId] || classId,
              salesCount: Object.prototype.hasOwnProperty.call(salesRows, classId) ? salesRows[classId] : null,
              salesShare: null, theoreticalSampleCount: null, integerSampleCount: null,
              candidateCount: candidateVehicles.length, selectedVins: [], selectedVehicles: [], issues: [],
              status: communityBlocker || 'MOCK_SELECTED', statusLabel: ''
            };
            var classScope = Object.assign({}, scope, { vehicleCode18: classId, classId: classId });
            if (baseRow && output.salesBasis && statisticsComplete && total > 0) {
              var quota = classQuota(baseRow.finalSampleCount, row.salesCount, total);
              Object.assign(row, quota);
              if (row.integerSampleCount > row.candidateCount) {
                row.status = communityBlocker || 'CANDIDATES_INSUFFICIENT';
                issue('CANDIDATES_INSUFFICIENT', '该18位码取整名额 ' + row.integerSampleCount + ' 大于可用候选 ' + row.candidateCount + '；不自动截减、跨车型或跨月补足。', classScope, row.issues);
              }
            }
            allocation.issues = allocation.issues.concat(row.issues);
            allocation.classes.push(row);
          });
          if (allocation.classes.length && allocation.classes.every(function (row) { return safeCount(row.integerSampleCount); })) {
            allocation.roundedClassTotal = allocation.classes.reduce(function (sum, row) { return sum + row.integerSampleCount; }, 0);
            allocation.roundingDifference = allocation.roundedClassTotal - allocation.finalSampleCount;
            if (allocation.roundingDifference !== 0) {
              issue('ROUNDING_DIFFERENCE_PENDING', '车型独立四舍五入合计 ' + allocation.roundedClassTotal + '，小区名额 ' + allocation.finalSampleCount + '，差额 ' + allocation.roundingDifference + '；正式尾差/超配策略未定，不自动调差。', scope, allocation.issues);
              allocation.classes.forEach(function (row) { if (row.status === 'MOCK_SELECTED') row.status = 'ROUNDING_DIFFERENCE_PENDING'; });
            }
          }
          // 未决项不转换成正式抽车结果；原小区算法的超配规则不套用到车型层。
          var ready = Boolean(baseRow) && !communityBlocker && allocation.roundingDifference === 0 && allocation.classes.length > 0 && allocation.classes.every(function (row) { return row.status === 'MOCK_SELECTED'; });
          allocation.classes.forEach(function (row) {
            if (ready) {
              row.selectedVehicles = (candidatesByClass[row.vehicleCode18] || []).slice(0, row.integerSampleCount).map(copy);
              row.selectedVins = row.selectedVehicles.map(function (vehicle) { return vehicle.vin; });
              allocation.selectedTotal += row.selectedVins.length; output.selectedTotal += row.selectedVins.length;
            } else if (row.status === 'MOCK_SELECTED') row.status = 'PENDING_CONFIRMATION';
            row.statusLabel = STATUS_LABELS[row.status] || row.status;
          });
          allocation.complete = ready;
          allocation.status = allocation.complete ? 'MOCK_SELECTED' : communityBlocker || (allocation.classes.filter(function (row) { return row.status !== 'MOCK_SELECTED'; })[0] || {}).status || 'PENDING_CONFIRMATION';
          allocation.statusLabel = STATUS_LABELS[allocation.status] || allocation.status;
          regionResult.communityAllocations.push(allocation);
        });
        monthResult.regions.push(regionResult);
      });
      output.months.push(monthResult);
    });
    if (!output.months.length) issue('NO_MONTHLY_CANDIDATES', '没有可按 TQMP 交车年月和大区分组的合格候选。');
    issue('RANDOM_SELECTION_RULE_PENDING', output.selectionBoundary, null, null, false);
    output.complete = output.months.length > 0 && !output.issues.some(function (item) { return item.blocking; }) && output.months.every(function (month) {
      return month.regions.every(function (region) { return region.communityAllocations.every(function (community) { return community.complete; }); });
    });
    output.status = output.complete ? 'MOCK_COMPLETE' : 'PENDING_CONFIRMATION';
    output.statusLabel = output.complete ? '固定顺序示例分配完成（非正式随机结果）' : STATUS_LABELS.PENDING_CONFIRMATION;
    return output;
  }

  return { version: VERSION, calculate: calculate, deliveryMonthOf: deliveryMonthOf, salesMonthOf: deliveryMonthOf, classQuota: classQuota, statusLabels: copy(STATUS_LABELS) };
});
