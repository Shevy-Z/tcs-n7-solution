(function (root, factory) {
  'use strict';

  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.TCSSampling = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var ALGORITHM_VERSION = 'TCS-SAMPLING-DEMO-2026-09-02';
  var ROUNDING_RULE = '四舍五入（0.5 进 1）';

  function isFiniteNumber(value) {
    return typeof value === 'number' && Number.isFinite(value);
  }

  function assert(condition, message, ErrorType) {
    if (!condition) throw new (ErrorType || TypeError)(message);
  }

  function roundSample(value) {
    // 样本数均为非负数；仅在最终名额处做一次四舍五入。
    return Math.floor(value + 0.5 + Number.EPSILON * Math.max(1, Math.abs(value)));
  }

  function safeAdd(total, value, label) {
    var result = total + value;
    assert(Number.isSafeInteger(result), label + '合计超出 JavaScript 安全整数范围', RangeError);
    return result;
  }

  function text(value) {
    return value === undefined || value === null ? '' : String(value);
  }

  function cloneVinList(community) {
    var source = Array.isArray(community.vins)
      ? community.vins
      : (Array.isArray(community.vinCandidates) ? community.vinCandidates : []);

    return source.map(function (item) {
      if (!item || typeof item !== 'object') return item;
      var copy = {};
      Object.keys(item).forEach(function (key) { copy[key] = item[key]; });
      return copy;
    });
  }

  function normalizeInput(input) {
    assert(input && typeof input === 'object' && !Array.isArray(input), '计算参数必须是对象');
    assert(isFiniteNumber(input.ratioPercent), 'ratioPercent 必须是 0–100 的数字');
    assert(input.ratioPercent >= 0 && input.ratioPercent <= 100, 'ratioPercent 必须在 0–100 之间', RangeError);
    assert(Array.isArray(input.communities), 'communities 必须是数组');

    var lowerBoundIsBlank = input.lowerBound === '' || input.lowerBound === null || input.lowerBound === undefined;
    var lowerBound = lowerBoundIsBlank ? null : input.lowerBound;
    if (lowerBound !== null) {
      assert(isFiniteNumber(lowerBound), 'lowerBound 必须是非负整数或空值');
      assert(Number.isSafeInteger(lowerBound) && lowerBound >= 0, 'lowerBound 必须是非负整数或空值', RangeError);
    }

    var regionId = text(input.regionId);
    var regionName = text(input.regionName);
    var ratio = input.ratioPercent / 100;
    var rows = input.communities.map(function (community, index) {
      assert(community && typeof community === 'object' && !Array.isArray(community), 'communities[' + index + '] 必须是对象');
      assert(isFiniteNumber(community.candidateCount), 'communities[' + index + '].candidateCount 必须是非负整数');
      assert(Number.isSafeInteger(community.candidateCount) && community.candidateCount >= 0,
        'communities[' + index + '].candidateCount 必须是非负整数', RangeError);

      var id = text(community.id) || 'community-' + (index + 1);
      var name = text(community.name) || '小区 ' + (index + 1);
      var province = text(community.province);
      var city = text(community.city);
      var storeCount = community.storeCount === undefined ? null : community.storeCount;
      var initialSampleCount = roundSample(community.candidateCount * ratio);

      return {
        inputIndex: index,
        id: id,
        name: name,
        regionId: regionId,
        regionName: regionName,
        province: province,
        city: city,
        storeCount: storeCount,
        organizationSnapshot: {
          province: province,
          city: city,
          regionId: regionId,
          regionName: regionName,
          communityId: id,
          communityName: name,
          storeCount: storeCount
        },
        vins: cloneVinList(community),
        candidateCount: community.candidateCount,
        ratioPercent: input.ratioPercent,
        ratio: ratio,
        lowerBound: lowerBound,
        initialSampleCount: initialSampleCount,
        category: lowerBound === null ? 'NOT_CONFIGURED' : (
          initialSampleCount < lowerBound ? 'LOW' : (initialSampleCount > lowerBound ? 'HIGH' : 'AT_BOUND')
        ),
        attainableTarget: lowerBound === null ? null : Math.min(community.candidateCount, lowerBound),
        gapToLowerBound: lowerBound === null || initialSampleCount >= lowerBound ? 0 : lowerBound - initialSampleCount,
        topUpNeeded: lowerBound === null || initialSampleCount >= lowerBound
          ? 0
          : Math.min(community.candidateCount, lowerBound) - initialSampleCount,
        releasedCount: 0,
        allocationOrder: null,
        topUpAllocated: 0,
        recoveryAllocated: 0,
        optimizedRatio: null,
        recoveryCoefficient: null,
        finalSampleCount: initialSampleCount,
        unselectedCount: community.candidateCount - initialSampleCount,
        allocationStatus: 'PENDING',
        reason: '',
        formulaTrace: [
          'A小=round(' + community.candidateCount + '×' + input.ratioPercent + '%)=' + initialSampleCount
        ],
        isBelowLowerBound: false,
        lowerBoundShortfall: 0,
        lowerBoundShortfallReason: null
      };
    });

    return {
      regionId: regionId,
      regionName: regionName,
      ratioPercent: input.ratioPercent,
      ratio: ratio,
      lowerBound: lowerBound,
      rows: rows
    };
  }

  function calculate(input) {
    var normalized = normalizeInput(input);
    var rows = normalized.rows;
    var warnings = [];
    var trace = [];
    var traceStep = 0;
    var branch;
    var candidateTotal = 0;

    function addWarning(code, level, message, communityIds) {
      var warning = { code: code, level: level || 'warning', message: message };
      if (communityIds && communityIds.length) warning.communityIds = communityIds.slice();
      warnings.push(warning);
    }

    function addTrace(code, title, scope, formula, substitution, result, reason, communityId) {
      var item = {
        step: ++traceStep,
        code: code,
        title: title,
        scope: scope,
        formula: formula,
        substitution: substitution,
        result: result,
        reason: reason
      };
      if (communityId !== undefined && communityId !== null) item.communityId = communityId;
      trace.push(item);
    }

    rows.forEach(function (row) {
      candidateTotal = safeAdd(candidateTotal, row.candidateCount, '候选 VIN 数');
      addTrace(
        'INITIAL_SAMPLE', '计算小区初步整数样本', 'community',
        'A小=round(S小×C)',
        'round(' + row.candidateCount + '×' + normalized.ratioPercent + '%)',
        row.initialSampleCount, '后续分类、缺口、释放和余量统一使用 A小。', row.id
      );
    });

    var targetSampleCount = roundSample(candidateTotal * normalized.ratio);
    var theoreticalMinimum = normalized.lowerBound === null ? null : normalized.lowerBound * rows.length;
    assert(theoreticalMinimum === null || Number.isSafeInteger(theoreticalMinimum), 'Lwr×n 超出 JavaScript 安全整数范围', RangeError);

    addTrace('REGION_TARGET', '计算大区参考目标', 'region',
      'S大=ΣS小；U=round(S大×C)',
      'S大=' + candidateTotal + '；round(' + candidateTotal + '×' + normalized.ratioPercent + '%)',
      targetSampleCount, 'U 是参考目标，计算结果可以少分或因已确认的独立取整而超配。');

    if (!rows.length) {
      addWarning('NO_COMMUNITIES', 'warning', '未传入参与计算的小区，本次结果为 0。');
    }

    var counts = { low: 0, atBound: 0, high: 0 };
    if (normalized.lowerBound !== null) {
      rows.forEach(function (row) {
        if (row.initialSampleCount < normalized.lowerBound) counts.low += 1;
        else if (row.initialSampleCount > normalized.lowerBound) counts.high += 1;
        else counts.atBound += 1;
      });
    }

    var intermediate = {
      optimizedRatio: null,
      lowFinalTotal: 0,
      highCandidateTotal: 0,
      releasedTotal: 0,
      adjustmentPoolInitial: 0,
      topUpAllocatedTotal: 0,
      adjustmentRemainder: 0,
      recoveryCoefficient: null,
      recoveryAllocatedTotal: 0,
      recoveryRoundingDelta: 0,
      stopTriggered: false,
      stopAtCommunityId: null
    };

    if (normalized.ratioPercent === 100) {
      branch = {
        code: 'FULL_TAKE',
        label: '100% 全取',
        reason: 'C=100%，全部合格候选 VIN 入选，不进入小区调剂。'
      };
      rows.forEach(function (row) {
        row.category = 'FULL_TAKE';
        row.finalSampleCount = row.candidateCount;
        row.unselectedCount = 0;
        row.allocationStatus = 'FULL_TAKE';
        row.reason = 'C=100%，全部合格候选入选。';
        row.formulaTrace.push('Y=S小=' + row.candidateCount);
      });
      addTrace('FULL_TAKE', '100% 全取', 'region', 'C=100% ⇒ Y小=S小',
        normalized.ratioPercent + '%=100%', candidateTotal, branch.reason);
    } else if (normalized.lowerBound === null) {
      branch = {
        code: 'NO_LOWER_BOUND',
        label: '未配置小区下限',
        reason: 'Lwr 为空，原型按比例的初步整数样本数直接取值。'
      };
      rows.forEach(function (row) {
        row.category = 'NO_LOWER_BOUND';
        row.finalSampleCount = row.initialSampleCount;
        row.unselectedCount = row.candidateCount - row.finalSampleCount;
        row.allocationStatus = 'PROPORTIONAL_DIRECT';
        row.reason = 'Lwr 为空，按 A小=round(S小×C) 直接取值。';
        row.formulaTrace.push('Y=A小=' + row.initialSampleCount);
      });
      addWarning('LOWER_BOUND_EMPTY_DEMO_BOUNDARY', 'warning',
        'Lwr 空值本次按比例直取；空值、0 和关闭开关是否等价仍待确认。');
      addTrace('PROPORTIONAL_DIRECT', '按比例直取', 'region', 'Y小=A小',
        'Lwr=空', null, branch.reason);
    } else {
      addTrace('THEORETICAL_MINIMUM', '计算大区理论最低总量', 'region',
        'L=Lwr×n', normalized.lowerBound + '×' + rows.length,
        theoreticalMinimum, 'n 暂按本次传入的小区行数计算。');
      addWarning('COMMUNITY_SCOPE_DEMO_BOUNDARY', 'warning',
        'n 暂按本次传入的 ' + rows.length + ' 个小区计算；正式口径是仅计有候选 VIN 小区还是营销平台全部小区仍待确认。');
      if (normalized.lowerBound === 0) {
        addWarning('ZERO_LOWER_BOUND_PENDING_MEANING', 'warning',
          'Lwr=0 本次作为已输入数值参与公式；是否等同于关闭下限仍待确认。');
      }

      if (targetSampleCount >= theoreticalMinimum) {
        branch = {
          code: 'COVERABLE',
          label: '能够覆盖理论下限',
          reason: 'U≥L：先确定低样本小区 Y，再用 C优统一重算原大样本小区。'
        };

        var originalLargeRows = [];
        rows.forEach(function (row) {
          if (row.initialSampleCount < normalized.lowerBound) {
            row.finalSampleCount = row.attainableTarget;
            row.unselectedCount = row.candidateCount - row.finalSampleCount;
            row.allocationStatus = 'LOW_FIXED_FIRST';
            row.reason = row.candidateCount < normalized.lowerBound
              ? '候选量低于 Lwr，取全部候选。'
              : 'A小<Lwr，先取 Lwr。';
            row.formulaTrace.push('Y=min(' + row.candidateCount + ',' + normalized.lowerBound + ')=' + row.finalSampleCount);
            intermediate.lowFinalTotal = safeAdd(intermediate.lowFinalTotal, row.finalSampleCount, '低样本小区 Y');
            addTrace('COVERABLE_LOW_RESULT', '确定低样本小区结果', 'community',
              'Y=min(S小,Lwr)', 'min(' + row.candidateCount + ',' + normalized.lowerBound + ')',
              row.finalSampleCount, row.reason, row.id);
          } else {
            originalLargeRows.push(row);
            intermediate.highCandidateTotal = safeAdd(intermediate.highCandidateTotal, row.candidateCount, '原大样本小区候选数');
          }
        });

        if (intermediate.highCandidateTotal > 0) {
          intermediate.optimizedRatio = (targetSampleCount - intermediate.lowFinalTotal) / intermediate.highCandidateTotal;
          addTrace('OPTIMIZED_RATIO', '计算统一调整比例', 'region',
            'C优=(U-Σ低样本Y)÷Σ原大样本S小',
            '(' + targetSampleCount + '-' + intermediate.lowFinalTotal + ')÷' + intermediate.highCandidateTotal,
            intermediate.optimizedRatio, '不预先截短 C优，仅在每个小区最终名额处取整。');

          originalLargeRows.forEach(function (row) {
            var raw = row.candidateCount * intermediate.optimizedRatio;
            var rounded = roundSample(raw);
            row.optimizedRatio = intermediate.optimizedRatio;
            row.finalSampleCount = Math.min(row.candidateCount, rounded);
            row.unselectedCount = row.candidateCount - row.finalSampleCount;
            row.allocationStatus = 'OPTIMIZED_RATIO_APPLIED';
            row.reason = 'A小≥Lwr，按 C优公式重算；结果直接采用，不保底回拉或二次调剂。';
            row.formulaTrace.push('C优=(' + targetSampleCount + '-' + intermediate.lowFinalTotal + ')÷' + intermediate.highCandidateTotal + '=' + intermediate.optimizedRatio);
            row.formulaTrace.push('Y=min(' + row.candidateCount + ',round(' + row.candidateCount + '×C优))=' + row.finalSampleCount);
            addTrace('COVERABLE_LARGE_RESULT', '重算原大样本小区', 'community',
              'Y=min[S小,round(S小×C优)]',
              'min[' + row.candidateCount + ',round(' + row.candidateCount + '×' + intermediate.optimizedRatio + ')]',
              row.finalSampleCount, row.reason, row.id);
          });
        } else {
          intermediate.optimizedRatio = null;
          originalLargeRows.forEach(function (row) {
            row.finalSampleCount = row.initialSampleCount;
            row.unselectedCount = row.candidateCount - row.finalSampleCount;
            row.allocationStatus = 'ZERO_DENOMINATOR_DEMO_FALLBACK';
            row.reason = 'C优分母为 0，原型暂保留 A小，不作为正式生产规则。';
            row.formulaTrace.push('C优分母=0；演示暂取Y=A小=' + row.initialSampleCount);
          });
          addWarning('OPTIMIZED_RATIO_ZERO_DENOMINATOR_DEMO_BOUNDARY', 'warning',
            'C优的原大样本小区候选数合计为 0；原型暂保留 A小，正式处理仍待确认。');
          addTrace('OPTIMIZED_RATIO_ZERO_DENOMINATOR', 'C优分母为 0', 'region',
            'C优=(U-Σ低样本Y)÷Σ原大样本S小',
            '分母=0', null, '未写死正式规则，仅使用可见的演示降级。');
        }
      } else {
        branch = {
          code: 'INSUFFICIENT',
          label: '不能覆盖理论下限',
          reason: 'U<L：大样本小区先释放，低样本小区按 Δ 升序完整补足，剩余余量再统一回补。'
        };

        var lowRows = [];
        var releasingRows = [];
        rows.forEach(function (row) {
          if (row.initialSampleCount > normalized.lowerBound) {
            row.releasedCount = row.initialSampleCount - normalized.lowerBound;
            row.finalSampleCount = normalized.lowerBound;
            row.allocationStatus = 'RELEASED_PENDING_RECOVERY';
            row.reason = 'A小>Lwr，先释放 R小=A小-Lwr。';
            row.formulaTrace.push('R小=' + row.initialSampleCount + '-' + normalized.lowerBound + '=' + row.releasedCount);
            intermediate.releasedTotal = safeAdd(intermediate.releasedTotal, row.releasedCount, '原释放名额');
            releasingRows.push(row);
            addTrace('RELEASE_QUOTA', '计算原释放名额', 'community',
              'R小=A小-Lwr', row.initialSampleCount + '-' + normalized.lowerBound,
              row.releasedCount, '只有 A小>Lwr 的小区释放并参与回补。', row.id);
          } else if (row.initialSampleCount < normalized.lowerBound) {
            row.finalSampleCount = row.initialSampleCount;
            row.allocationStatus = 'WAITING_FOR_TOP_UP';
            row.reason = '等待按 Δ小 升序完整补足。';
            lowRows.push(row);
          } else {
            row.finalSampleCount = row.initialSampleCount;
            row.allocationStatus = 'AT_BOUND_UNCHANGED';
            row.reason = 'A小=Lwr，不释放也不补足。';
            row.formulaTrace.push('Y=A小=Lwr=' + row.initialSampleCount);
          }
        });

        intermediate.adjustmentPoolInitial = intermediate.releasedTotal;
        var adjustmentPool = intermediate.adjustmentPoolInitial;
        addTrace('ADJUSTMENT_POOL', '汇总调剂余量', 'region',
          'R总=ΣR小；M=R总', 'ΣR小=' + intermediate.releasedTotal,
          adjustmentPool, '低样本小区补足仅使用本轮原释放名额。');

        if (intermediate.releasedTotal === 0 && lowRows.some(function (row) { return row.topUpNeeded > 0; })) {
          addWarning('NO_RELEASE_POOL_DEMO_BOUNDARY', 'warning',
            'R总=0，无可用调剂余量；原型按“M 不足即停止”展示并记录未分配，正式业务口径仍待确认。');
        }

        lowRows.sort(function (left, right) {
          return left.gapToLowerBound - right.gapToLowerBound || left.inputIndex - right.inputIndex;
        });

        var tiedIds = [];
        for (var tieIndex = 1; tieIndex < lowRows.length; tieIndex += 1) {
          if (lowRows[tieIndex - 1].gapToLowerBound === lowRows[tieIndex].gapToLowerBound) {
            if (tiedIds.indexOf(lowRows[tieIndex - 1].id) === -1) tiedIds.push(lowRows[tieIndex - 1].id);
            if (tiedIds.indexOf(lowRows[tieIndex].id) === -1) tiedIds.push(lowRows[tieIndex].id);
          }
        }
        if (tiedIds.length) {
          addWarning('EQUAL_GAP_ORDER_DEMO_BOUNDARY', 'warning',
            '多个小区的 Δ小 相同，原型暂按输入顺序演示；正式并列规则仍待确认。', tiedIds);
        }

        var stopped = false;
        lowRows.forEach(function (row, index) {
          row.allocationOrder = index + 1;
          row.formulaTrace.push('Δ小=' + normalized.lowerBound + '-' + row.initialSampleCount + '=' + row.gapToLowerBound);
          row.formulaTrace.push('B小=min(' + row.candidateCount + ',' + normalized.lowerBound + ')=' + row.attainableTarget);
          row.formulaTrace.push('D小=' + row.attainableTarget + '-' + row.initialSampleCount + '=' + row.topUpNeeded);

          if (stopped) {
            row.allocationStatus = 'NOT_PROCESSED_AFTER_STOP';
            row.reason = '前序小区因 M<D小 已触发停止，本小区不再调剂，保持 A小。';
            row.formulaTrace.push('前序已停止；Y=A小=' + row.initialSampleCount);
            addTrace('TOP_UP_SKIPPED_AFTER_STOP', '停止后不再调剂', 'community',
              'Y=A小', '前序已触发 M<D小', row.finalSampleCount,
              row.reason, row.id);
            return;
          }

          if (row.topUpNeeded === 0) {
            row.finalSampleCount = row.attainableTarget;
            row.allocationStatus = 'NO_TOP_UP_NEEDED';
            row.reason = '小区候选已全取，D小=0，无需占用 M。';
            row.formulaTrace.push('D小=0；Y=B小=' + row.finalSampleCount);
            addTrace('TOP_UP_NOT_NEEDED', '无需补足', 'community',
              'D小=B小-A小', row.attainableTarget + '-' + row.initialSampleCount,
              0, row.reason, row.id);
            return;
          }

          if (adjustmentPool >= row.topUpNeeded) {
            var before = adjustmentPool;
            row.topUpAllocated = row.topUpNeeded;
            row.finalSampleCount = row.attainableTarget;
            adjustmentPool -= row.topUpNeeded;
            intermediate.topUpAllocatedTotal = safeAdd(intermediate.topUpAllocatedTotal, row.topUpAllocated, '补足名额');
            row.allocationStatus = 'FULLY_TOPPED_UP';
            row.reason = 'M≥D小，按顺序完整补足到 B小。';
            row.formulaTrace.push('M:' + before + '-' + row.topUpNeeded + '=' + adjustmentPool + '；Y=B小=' + row.finalSampleCount);
            addTrace('TOP_UP_COMPLETE', '完整补足低样本小区', 'community',
              'M≥D小 ⇒ Y=B小；M=M-D小',
              before + '≥' + row.topUpNeeded + '；M=' + before + '-' + row.topUpNeeded,
              { finalSampleCount: row.finalSampleCount, adjustmentRemainder: adjustmentPool }, row.reason, row.id);
          } else {
            stopped = true;
            intermediate.stopTriggered = true;
            intermediate.stopAtCommunityId = row.id;
            row.allocationStatus = 'STOPPED_INSUFFICIENT_POOL';
            row.reason = 'M<D小，立即停止：不部分补足，不跳过本小区，保持 A小。';
            row.formulaTrace.push('M=' + adjustmentPool + '<D小=' + row.topUpNeeded + '；Y=A小=' + row.initialSampleCount + '，停止');
            addWarning('ADJUSTMENT_STOPPED', 'warning',
              '调剂在小区“' + row.name + '”停止：M=' + adjustmentPool + '<D小=' + row.topUpNeeded + '，未部分补足且未跳过。', [row.id]);
            if (row.candidateCount < normalized.lowerBound) {
              addWarning('LOW_CANDIDATE_INSUFFICIENT_POOL_DEMO_BOUNDARY', 'warning',
                '候选量低于 Lwr 且余量不足的正式处理仍待确认；原型本次仅按已确认的“M 不足即停止”展示。', [row.id]);
            }
            addTrace('TOP_UP_STOP', '余量不足时停止', 'community',
              'M<D小 ⇒ 不部分补、不跳过、立即停止',
              adjustmentPool + '<' + row.topUpNeeded,
              { finalSampleCount: row.finalSampleCount, adjustmentRemainder: adjustmentPool }, row.reason, row.id);
          }
        });

        intermediate.adjustmentRemainder = adjustmentPool;
        if (intermediate.releasedTotal > 0) {
          intermediate.recoveryCoefficient = intermediate.adjustmentRemainder / intermediate.releasedTotal;
          addTrace('RECOVERY_COEFFICIENT', '计算统一回补系数', 'region',
            'C回=M余÷R总', intermediate.adjustmentRemainder + '÷' + intermediate.releasedTotal,
            intermediate.recoveryCoefficient, '不预先截短 C回，仅在 Y补处取整。');
        } else {
          intermediate.recoveryCoefficient = null;
          addTrace('RECOVERY_NOT_APPLICABLE', '无可回补大样本小区', 'region',
            'C回=M余÷R总', 'R总=0', null, '不做除零，并将该情形保留为演示边界。');
        }

        releasingRows.forEach(function (row) {
          var recovered = roundSample(row.releasedCount * intermediate.recoveryCoefficient);
          row.recoveryCoefficient = intermediate.recoveryCoefficient;
          row.recoveryAllocated = recovered;
          row.finalSampleCount = Math.min(row.candidateCount, normalized.lowerBound + recovered);
          row.unselectedCount = row.candidateCount - row.finalSampleCount;
          row.allocationStatus = 'RECOVERED_BY_UNIFIED_COEFFICIENT';
          row.reason = '先释放到 Lwr，再按统一 C回独立四舍五入回补；单小区不超过 S小。';
          row.formulaTrace.push('C回=' + intermediate.adjustmentRemainder + '÷' + intermediate.releasedTotal + '=' + intermediate.recoveryCoefficient);
          row.formulaTrace.push('Y补=round(' + row.releasedCount + '×C回)=' + recovered);
          row.formulaTrace.push('Y=min(' + row.candidateCount + ',' + normalized.lowerBound + '+' + recovered + ')=' + row.finalSampleCount);
          intermediate.recoveryAllocatedTotal = safeAdd(intermediate.recoveryAllocatedTotal, recovered, '回补名额');
          addTrace('RECOVERY_RESULT', '回补原大样本小区', 'community',
            'Y补=round(R小×C回)；Y=min(S小,Lwr+Y补)',
            'Y补=round(' + row.releasedCount + '×' + intermediate.recoveryCoefficient + ')=' + recovered +
              '；Y=min(' + row.candidateCount + ',' + normalized.lowerBound + '+' + recovered + ')',
            row.finalSampleCount, row.reason, row.id);
        });

        intermediate.recoveryRoundingDelta = intermediate.recoveryAllocatedTotal - intermediate.adjustmentRemainder;
        if (intermediate.recoveryRoundingDelta > 0) {
          addWarning('RECOVERY_ROUNDING_OVER_ALLOCATION_ALLOWED', 'info',
            '各大样本小区独立取整后回补合计比 M余多 ' + intermediate.recoveryRoundingDelta +
              ' 份；按已确认规则允许落地并记录，不自动削减。', releasingRows.map(function (row) { return row.id; }));
        } else if (intermediate.recoveryRoundingDelta < 0) {
          addWarning('RECOVERY_ROUNDING_TAIL_RECORDED', 'info',
            '各大样本小区独立取整后少回补 ' + Math.abs(intermediate.recoveryRoundingDelta) +
              ' 份；尾差不二次分配，纳入未分配记录。');
        }
      }
    }

    var finalSampleTotal = 0;
    var belowLowerBoundIds = [];
    rows.forEach(function (row) {
      assert(Number.isSafeInteger(row.finalSampleCount) && row.finalSampleCount >= 0,
        '小区 ' + row.id + ' 的最终样本数无效', RangeError);
      assert(row.finalSampleCount <= row.candidateCount,
        '小区 ' + row.id + ' 的最终样本数不得超过候选数', RangeError);
      row.unselectedCount = row.candidateCount - row.finalSampleCount;
      finalSampleTotal = safeAdd(finalSampleTotal, row.finalSampleCount, '最终样本数');

      if (normalized.lowerBound !== null && row.finalSampleCount < normalized.lowerBound) {
        row.isBelowLowerBound = true;
        row.lowerBoundShortfall = normalized.lowerBound - row.finalSampleCount;
        if (row.candidateCount < normalized.lowerBound && row.finalSampleCount === row.candidateCount) {
          row.lowerBoundShortfallReason = '候选量低于 Lwr，已取全部可用候选。';
        } else if (row.allocationStatus === 'OPTIMIZED_RATIO_APPLIED') {
          row.lowerBoundShortfallReason = 'C优公式重算后低于 Lwr，按已确认规则直接采用。';
        } else if (row.allocationStatus === 'STOPPED_INSUFFICIENT_POOL' || row.allocationStatus === 'NOT_PROCESSED_AFTER_STOP') {
          row.lowerBoundShortfallReason = '余量不足触发停止，未部分补足或跳过。';
        } else if (branch.code === 'FULL_TAKE') {
          row.lowerBoundShortfallReason = 'C=100% 已取全部候选，候选总量低于 Lwr。';
        } else {
          row.lowerBoundShortfallReason = '按本次公式结果记录为未达 Lwr。';
        }
        belowLowerBoundIds.push(row.id);
      }
    });

    if (belowLowerBoundIds.length && branch.code !== 'NO_LOWER_BOUND') {
      addWarning('COMMUNITY_BELOW_LOWER_BOUND_RECORDED', 'info',
        belowLowerBoundIds.length + ' 个小区最终样本数低于 Lwr，已逐行记录原因，不自动回拉。', belowLowerBoundIds);
    }

    var unallocatedCount = Math.max(targetSampleCount - finalSampleTotal, 0);
    var overallocatedCount = Math.max(finalSampleTotal - targetSampleCount, 0);
    var targetDifference = finalSampleTotal - targetSampleCount;
    var targetStatus = targetDifference === 0 ? 'MATCHED' : (targetDifference < 0 ? 'UNDER' : 'OVER');
    var unallocatedReason = null;
    var overallocatedReason = null;

    if (unallocatedCount > 0) {
      if (branch.code === 'INSUFFICIENT') {
        // 停止补足只决定余量去向；余量之后仍会回补，不能将停止本身当作最终少分原因。
        var initialTotal = rows.reduce(function (total, row) { return total + row.initialSampleCount; }, 0);
        var initialDifference = initialTotal - targetSampleCount;
        var shortageReasons = [];
        if (initialDifference !== 0) {
          shortageReasons.push('逐小区初步取整合计比 U（大区目标参考值）' +
            (initialDifference < 0 ? '少 ' : '多 ') + Math.abs(initialDifference) + ' 份。');
        }
        if (intermediate.recoveryRoundingDelta !== 0) {
          shortageReasons.push('回补独立四舍五入' +
            (intermediate.recoveryRoundingDelta < 0 ? '少回补 ' : '多回补 ') +
            Math.abs(intermediate.recoveryRoundingDelta) + ' 份，尾差不二次调剂。');
        }
        if (intermediate.releasedTotal === 0) shortageReasons.push('本轮无原释放名额，保留原型演示边界提示。');
        if (intermediate.stopTriggered) shortageReasons.push('补足阶段曾因余量不足停止；剩余余量仍已进入回补计算。');
        unallocatedReason = shortageReasons.join('') || '按本次公式结果记录与参考目标的少分差额。';
      } else if (branch.code === 'COVERABLE') unallocatedReason = 'C优重算的独立四舍五入或候选量封顶产生差额。';
      else unallocatedReason = '逐小区独立四舍五入产生少分尾差。';
      addWarning('UNALLOCATED_RECORDED', 'info',
        '大区实际样本总数比参考目标少 ' + unallocatedCount + ' 份：' + unallocatedReason);
    }

    if (overallocatedCount > 0) {
      if (branch.code === 'INSUFFICIENT' && intermediate.recoveryRoundingDelta > 0) {
        overallocatedReason = '回补阶段各小区独立四舍五入产生多分。';
      } else if (branch.code === 'COVERABLE') {
        overallocatedReason = 'C优重算后各小区独立四舍五入产生多分。';
      } else {
        overallocatedReason = '逐小区独立四舍五入产生多分。';
      }
      addWarning('OVER_ALLOCATION_RECORDED', 'info',
        '大区实际样本总数比参考目标多 ' + overallocatedCount +
          ' 份：' + overallocatedReason + '已记录，不自动削减。');
    }

    addTrace('FINAL_TOTALS', '记录大区计算结果', 'region',
      'Y总=ΣY小；N未=max(U-Y总,0)；O超=max(Y总-U,0)',
      'Y总=' + finalSampleTotal + '；U=' + targetSampleCount,
      {
        finalSampleTotal: finalSampleTotal,
        unallocatedCount: unallocatedCount,
        overallocatedCount: overallocatedCount
      }, '不设置“是否等于 U”的二次修正，直接记录差额与原因。');

    var summary = {
      algorithmVersion: ALGORITHM_VERSION,
      roundingRule: ROUNDING_RULE,
      regionId: normalized.regionId,
      regionName: normalized.regionName,
      ratioPercent: normalized.ratioPercent,
      ratio: normalized.ratio,
      lowerBound: normalized.lowerBound,
      communityCount: rows.length,
      candidateTotal: candidateTotal,
      targetSampleCount: targetSampleCount,
      theoreticalMinimum: theoreticalMinimum,
      lowCommunityCount: counts.low,
      atBoundCommunityCount: counts.atBound,
      highCommunityCount: counts.high,
      optimizedRatio: intermediate.optimizedRatio,
      lowFinalTotal: intermediate.lowFinalTotal,
      highCandidateTotal: intermediate.highCandidateTotal,
      releasedTotal: intermediate.releasedTotal,
      adjustmentPoolInitial: intermediate.adjustmentPoolInitial,
      topUpAllocatedTotal: intermediate.topUpAllocatedTotal,
      adjustmentRemainder: intermediate.adjustmentRemainder,
      recoveryCoefficient: intermediate.recoveryCoefficient,
      recoveryAllocatedTotal: intermediate.recoveryAllocatedTotal,
      recoveryRoundingDelta: intermediate.recoveryRoundingDelta,
      finalSampleTotal: finalSampleTotal,
      unallocatedCount: unallocatedCount,
      overallocatedCount: overallocatedCount,
      targetDifference: targetDifference,
      targetStatus: targetStatus,
      stopTriggered: intermediate.stopTriggered,
      stopAtCommunityId: intermediate.stopAtCommunityId,
      unallocatedReason: unallocatedReason,
      overallocatedReason: overallocatedReason
    };

    return {
      summary: summary,
      rows: rows,
      branch: branch,
      trace: trace,
      warnings: warnings
    };
  }

  return {
    version: ALGORITHM_VERSION,
    roundingRule: ROUNDING_RULE,
    calculate: calculate
  };
});
