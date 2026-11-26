// Existing algorithm explanation text; original HTML remains as the print/offline fallback.
window.AnnotationData = {
  "algorithm": [
    {
      "id": "1",
      "page": "algorithm",
      "stepIndex": 0,
      "stepLabel": "第 1 步",
      "target": "[data-anno=\"algorithm-candidate-processing\"]",
      "title": "第 1 步 · 解释",
      "sourceKind": "rule-note",
      "sourceText": "解释 先按销退及错误数据规则准备合格候选，不仅因历史已推送标记而排除。再按 TQMP 交车日期年月、大区和小区分组；发送任务自身的防重与重跑幂等仍属于独立规则。",
      "sections": {
        "interactionDesc": "先按销退及错误数据规则准备合格候选，不仅因历史已推送标记而排除。再按 TQMP 交车日期年月、大区和小区分组；发送任务自身的防重与重跑幂等仍属于独立规则。"
      }
    },
    {
      "id": "2",
      "page": "algorithm",
      "stepIndex": 0,
      "stepLabel": "第 1 步",
      "target": "[data-anno=\"algorithm-region-output\"]",
      "title": "第 1 步 · 仍待确认",
      "sourceKind": "pending-note",
      "sourceText": "仍待确认 区域获取成功即形成本次使用的快照，之后不随组织变更自动改写。发起获取的业务节点、缺门店/区域、获取失败和受控重建策略仍待确认。",
      "sections": {
        "exceptionRule": "区域获取成功即形成本次使用的快照，之后不随组织变更自动改写。发起获取的业务节点、缺门店/区域、获取失败和受控重建策略仍待确认。"
      }
    },
    {
      "id": "3",
      "page": "algorithm",
      "stepIndex": 0,
      "stepLabel": "第 1 步",
      "target": "[data-anno=\"algorithm-prepare-heading\"]",
      "title": "第 1 步 · 规则出处",
      "sourceKind": "evidence",
      "sourceText": "关联规则：TCS-R-0828-006～009、034。",
      "sections": {
        "dataSource": "关联规则：TCS-R-0828-006～009、034。"
      }
    },
    {
      "id": "4",
      "page": "algorithm",
      "stepIndex": 1,
      "stepLabel": "第 2 步",
      "target": "[data-anno=\"algorithm-reference-target\"]",
      "title": "第 2 步 · 关键规则",
      "sourceKind": "rule-note",
      "sourceText": "关键规则 U 是参考目标，不是绝对上限；小区独立取整后，最终合计可以与 U 不相等。",
      "sections": {
        "interactionDesc": "U 是参考目标，不是绝对上限；小区独立取整后，最终合计可以与 U 不相等。"
      }
    },
    {
      "id": "5",
      "page": "algorithm",
      "stepIndex": 1,
      "stepLabel": "第 2 步",
      "target": "[data-anno=\"algorithm-initial-heading\"]",
      "title": "第 2 步 · 规则出处",
      "sourceKind": "evidence",
      "sourceText": "关联规则：TCS-R-0828-010、068、072。",
      "sections": {
        "dataSource": "关联规则：TCS-R-0828-010、068、072。"
      }
    },
    {
      "id": "6",
      "page": "algorithm",
      "stepIndex": 2,
      "stepLabel": "第 3 步",
      "target": "[data-anno=\"algorithm-lower-config-heading\"]",
      "title": "第 3 步 · 仍待确认",
      "sourceKind": "pending-note",
      "sourceText": "仍待确认 Lwr 为空、填 0、关闭开关是否完全等价。",
      "sections": {
        "exceptionRule": "Lwr 为空、填 0、关闭开关是否完全等价。"
      }
    },
    {
      "id": "7",
      "page": "algorithm",
      "stepIndex": 2,
      "stepLabel": "第 3 步",
      "target": "[data-anno=\"algorithm-without-minimum-heading\"]",
      "title": "第 3 步 · 规则出处",
      "sourceKind": "evidence",
      "sourceText": "关联规则：TCS-R-0828-004、059。",
      "sections": {
        "dataSource": "关联规则：TCS-R-0828-004、059。"
      }
    },
    {
      "id": "8",
      "page": "algorithm",
      "stepIndex": 3,
      "stepLabel": "第 4 步",
      "target": "[data-anno=\"algorithm-theoretical-minimum\"]",
      "title": "第 4 步 · 仍待确认",
      "sourceKind": "pending-note",
      "sourceText": "仍待确认 n 是只统计本方案中有候选 VIN 的小区，还是统计营销平台主数据中的全部小区。",
      "sections": {
        "exceptionRule": "n 是只统计本方案中有候选 VIN 的小区，还是统计营销平台主数据中的全部小区。"
      }
    },
    {
      "id": "9",
      "page": "algorithm",
      "stepIndex": 3,
      "stepLabel": "第 4 步",
      "target": "[data-anno=\"algorithm-branch-heading\"]",
      "title": "第 4 步 · 规则出处",
      "sourceKind": "evidence",
      "sourceText": "关联规则：TCS-R-0828-011、074。",
      "sections": {
        "dataSource": "关联规则：TCS-R-0828-011、074。"
      }
    },
    {
      "id": "10",
      "page": "algorithm",
      "stepIndex": 4,
      "stepLabel": "第 5A 步",
      "target": "[data-anno=\"algorithm-minimum-limit\"]",
      "title": "第 5A 步 · 为什么要取 min？",
      "sourceKind": "rule-note",
      "sourceText": "为什么要取 min？ 因为系统不能抽取不存在的车辆。即使抽样 100% 仍达不到 Lwr ，也只能取全部真实候选量，并记录未达标原因。",
      "sections": {
        "interactionDesc": "因为系统不能抽取不存在的车辆。即使抽样 100% 仍达不到 Lwr ，也只能取全部真实候选量，并记录未达标原因。"
      }
    },
    {
      "id": "11",
      "page": "algorithm",
      "stepIndex": 4,
      "stepLabel": "第 5A 步",
      "target": "[data-anno=\"algorithm-low-sample-heading\"]",
      "title": "第 5A 步 · 规则出处",
      "sourceKind": "evidence",
      "sourceText": "关联规则：TCS-R-0828-046、054、074。",
      "sections": {
        "dataSource": "关联规则：TCS-R-0828-046、054、074。"
      }
    },
    {
      "id": "12",
      "page": "algorithm",
      "stepIndex": 5,
      "stepLabel": "第 6A 步",
      "target": "[data-anno=\"algorithm-optimized-result\"]",
      "title": "第 6A 步 · 本分支最重要的口径",
      "sourceKind": "rule-note",
      "sourceText": "本分支最重要的口径 即使重算后的原达标小区低于 Lwr ，也直接采用；不保底回拉、不做第二轮调剂，也不强制所有小区合计等于 U 。",
      "sections": {
        "interactionDesc": "即使重算后的原达标小区低于 Lwr ，也直接采用；不保底回拉、不做第二轮调剂，也不强制所有小区合计等于 U 。"
      }
    },
    {
      "id": "13",
      "page": "algorithm",
      "stepIndex": 5,
      "stepLabel": "第 6A 步",
      "target": "[data-anno=\"algorithm-optimized-denominator\"]",
      "title": "第 6A 步 · 仍待确认",
      "sourceKind": "pending-note",
      "sourceText": "仍待确认 当“原达标小区候选量合计”为 0 时， C优 分母为 0 的防御处理。",
      "sections": {
        "exceptionRule": "当“原达标小区候选量合计”为 0 时， C优 分母为 0 的防御处理。"
      }
    },
    {
      "id": "14",
      "page": "algorithm",
      "stepIndex": 5,
      "stepLabel": "第 6A 步",
      "target": "[data-anno=\"algorithm-optimized-heading\"]",
      "title": "第 6A 步 · 规则出处",
      "sourceKind": "evidence",
      "sourceText": "关联规则：TCS-R-0828-014、046、074；被否决方案记录为 TCS-R-0828-073。",
      "sections": {
        "dataSource": "关联规则：TCS-R-0828-014、046、074；被否决方案记录为 TCS-R-0828-073。"
      }
    },
    {
      "id": "15",
      "page": "algorithm",
      "stepIndex": 6,
      "stepLabel": "第 5B 步",
      "target": "[data-anno=\"algorithm-large-sample-scope\"]",
      "title": "第 5B 步 · “大样本小区”是什么意思？",
      "sourceKind": "rule-note",
      "sourceText": "“大样本小区”是什么意思？ 在本算法里，是指 A小（小区初步整数样本数）＞Lwr（小区最低样本数） 的小区，不是单纯指销量高或候选车辆多。",
      "sections": {
        "interactionDesc": "在本算法里，是指 A小（小区初步整数样本数）＞Lwr（小区最低样本数） 的小区，不是单纯指销量高或候选车辆多。"
      }
    },
    {
      "id": "16",
      "page": "algorithm",
      "stepIndex": 6,
      "stepLabel": "第 5B 步",
      "target": "[data-anno=\"algorithm-release-heading\"]",
      "title": "第 5B 步 · 规则出处",
      "sourceKind": "evidence",
      "sourceText": "关联规则：TCS-R-0828-047、051、068、069。",
      "sections": {
        "dataSource": "关联规则：TCS-R-0828-047、051、068、069。"
      }
    },
    {
      "id": "17",
      "page": "algorithm",
      "stepIndex": 7,
      "stepLabel": "第 6B 步",
      "target": "[data-anno=\"algorithm-stop-allocation\"]",
      "title": "第 6B 步 · 余量不足时怎么做？",
      "sourceKind": "rule-note",
      "sourceText": "余量不足时怎么做？ 不对当前小区做部分补给，也不跳过当前小区继续找后面的小区；停止向未达标小区分配，把剩余 M 转入回补阶段。",
      "sections": {
        "interactionDesc": "不对当前小区做部分补给，也不跳过当前小区继续找后面的小区；停止向未达标小区分配，把剩余 M 转入回补阶段。"
      }
    },
    {
      "id": "18",
      "page": "algorithm",
      "stepIndex": 7,
      "stepLabel": "第 6B 步",
      "target": "[data-anno=\"algorithm-gap-order\"]",
      "title": "第 6B 步 · 仍待确认",
      "sourceKind": "pending-note",
      "sourceText": "仍待确认 两个小区的 Δ小 相同时先补谁；以及“候选量本身低于 Lwr 且 M 也不足”时，是否要对“停止规则”设置强制全抽例外。",
      "sections": {
        "exceptionRule": "两个小区的 Δ小 相同时先补谁；以及“候选量本身低于 Lwr 且 M 也不足”时，是否要对“停止规则”设置强制全抽例外。"
      }
    },
    {
      "id": "19",
      "page": "algorithm",
      "stepIndex": 7,
      "stepLabel": "第 6B 步",
      "target": "[data-anno=\"algorithm-allocation-heading\"]",
      "title": "第 6B 步 · 规则出处",
      "sourceKind": "evidence",
      "sourceText": "关联规则：TCS-R-0828-053、055、064。",
      "sections": {
        "dataSource": "关联规则：TCS-R-0828-053、055、064。"
      }
    },
    {
      "id": "20",
      "page": "algorithm",
      "stepIndex": 8,
      "stepLabel": "第 7B 步",
      "target": "[data-anno=\"algorithm-recovery-rounding\"]",
      "title": "第 7B 步 · 取整尾差规则",
      "sourceKind": "rule-note",
      "sourceText": "取整尾差规则 C回（统一回补系数） 使用高精度结果，不先截短；各小区只在最终回补名额处独立四舍五入。少分尾差直接记为未分配，不再二次分配；多分时允许形成大区超配，不做削减。单个小区仍以真实候选量封顶。若 M余（可回补数量）≤0 ，无需回补；若 R总（原释放名额合计）＝0 ，原型仅作防除零处理，不计算回补系数，正式异常终态与记录方式仍待确认。",
      "sections": {
        "interactionDesc": "C回（统一回补系数） 使用高精度结果，不先截短；各小区只在最终回补名额处独立四舍五入。少分尾差直接记为未分配，不再二次分配；多分时允许形成大区超配，不做削减。单个小区仍以真实候选量封顶。若 M余（可回补数量）≤0 ，无需回补；若 R总（原释放名额合计）＝0 ，原型仅作防除零处理，不计算回补系数，正式异常终态与记录方式仍待确认。"
      }
    },
    {
      "id": "21",
      "page": "algorithm",
      "stepIndex": 8,
      "stepLabel": "第 7B 步",
      "target": "[data-anno=\"algorithm-recovery-heading\"]",
      "title": "第 7B 步 · 规则出处",
      "sourceKind": "evidence",
      "sourceText": "关联规则：TCS-R-0828-065～072。",
      "sections": {
        "dataSource": "关联规则：TCS-R-0828-065～072。"
      }
    },
    {
      "id": "22",
      "page": "algorithm",
      "stepIndex": 9,
      "stepLabel": "第 8 步",
      "target": "[data-anno=\"algorithm-vin-output\"]",
      "title": "第 8 步 · 最后再抽具体 VIN",
      "sourceKind": "rule-note",
      "sourceText": "最后再抽具体 VIN 系统根据每个小区的 Yᵢ ，在该小区合格候选 VIN 中抽取对应数量的具体车辆。 先按完整18位码销量占比计算并四舍五入车型名额，再记录车型取整差额。仅在差额为0、编码完整且所有级别候选足额时展示固定 Mock 顺序 VIN；存在差额或数据不足时保留结果与未决原因，不展示为正式已完成抽车。这不是生产随机策略。",
      "sections": {
        "interactionDesc": "系统根据每个小区的 Yᵢ ，在该小区合格候选 VIN 中抽取对应数量的具体车辆。 先按完整18位码销量占比计算并四舍五入车型名额，再记录车型取整差额。仅在差额为0、编码完整且所有级别候选足额时展示固定 Mock 顺序 VIN；存在差额或数据不足时保留结果与未决原因，不展示为正式已完成抽车。这不是生产随机策略。"
      }
    },
    {
      "id": "23",
      "page": "algorithm",
      "stepIndex": 9,
      "stepLabel": "第 8 步",
      "target": "[data-anno=\"algorithm-result-heading\"]",
      "title": "第 8 步 · 仍待确认",
      "sourceKind": "pending-note",
      "sourceText": "仍待确认 随机排序方式、随机种子、方案重跑是否复现同一批 VIN，以及抽样结果的冻结时点。",
      "sections": {
        "exceptionRule": "随机排序方式、随机种子、方案重跑是否复现同一批 VIN，以及抽样结果的冻结时点。"
      }
    },
    {
      "id": "24",
      "page": "algorithm",
      "stepIndex": 9,
      "stepLabel": "第 8 步",
      "target": "[data-anno=\"algorithm-result-step-label\"]",
      "title": "第 8 步 · 规则出处",
      "sourceKind": "evidence",
      "sourceText": "关联规则：TCS-R-0828-017、058、059、071、072、074。",
      "sections": {
        "dataSource": "关联规则：TCS-R-0828-017、058、059、071、072、074。"
      }
    },
    {
      "id": "25",
      "page": "algorithm",
      "stepIndex": 0,
      "stepLabel": "第 1 步",
      "target": "[data-anno=\"algorithm-month-scope\"]",
      "title": "第 1 步 · 当前月与大区作用域",
      "sourceKind": "rule-note",
      "sourceText": "当前交车月、当前大区的统一作用域 旧说明中的“按大区和小区分组”在本轮前面增加交车月。S小、S大、A小、U、n、Yᵢ、R总、M、C优、C回 等均只读取当前交车月 t 和当前大区；不同月份或不同大区不混合候选、参考目标及调剂余量。C 与 Lwr 沿用方案共用配置，不新增每月或每级别单独比例。原小区算法的公式、停止、回补、尾差及超配规则不变。",
      "sections": {
        "interactionDesc": "旧说明中的“按大区和小区分组”在本轮前面增加交车月。S小、S大、A小、U、n、Yᵢ、R总、M、C优、C回 等均只读取当前交车月 t 和当前大区；不同月份或不同大区不混合候选、参考目标及调剂余量。C 与 Lwr 沿用方案共用配置，不新增每月或每级别单独比例。原小区算法的公式、停止、回补、尾差及超配规则不变。"
      }
    },
    {
      "id": "26",
      "page": "algorithm",
      "stepIndex": 0,
      "stepLabel": "第 1 步",
      "target": "[data-anno=\"algorithm-month-scope\"]",
      "title": "第 1 步 · 新增仍待确认",
      "sourceKind": "pending-note",
      "sourceText": "新增仍待确认 月份业务来源已确认是 TQMP 交车日期；正式接口键名和缺失/无效日期策略仍待确认，不回退其他日期。销量统计范围与冻结时点未决；“销量”不默认等于合格候选数，原型使用独立演示销量。",
      "sections": {
        "exceptionRule": "月份业务来源已确认是 TQMP 交车日期；正式接口键名和缺失/无效日期策略仍待确认，不回退其他日期。销量统计范围与冻结时点未决；“销量”不默认等于合格候选数，原型使用独立演示销量。"
      }
    },
    {
      "id": "27",
      "page": "algorithm",
      "stepIndex": 0,
      "stepLabel": "第 1 步",
      "target": "[data-anno=\"algorithm-prepare-heading\"]",
      "title": "第 1 步 · 新增规则出处",
      "sourceKind": "evidence",
      "sourceText": "本轮来源：EXEC-0914-02/04/05；用户确认按 TQMP 交车日期归月；候选过滤及成功取得即快照见本轮执行单。早期 SMC 原话保留为历史证据。",
      "sections": {
        "dataSource": "本轮来源：EXEC-0914-02/04/05；用户确认按 TQMP 交车日期归月；候选过滤及成功取得即快照见本轮执行单。早期 SMC 原话保留为历史证据。"
      }
    },
    {
      "id": "28",
      "page": "algorithm",
      "stepIndex": 9,
      "stepLabel": "第 8 步",
      "target": "[data-anno=\"algorithm-class-allocation\"]",
      "title": "第 8 步 · 级别与 VIN 演示边界",
      "sourceKind": "rule-note",
      "sourceText": "级别与 VIN 演示边界 完整18位码、独立销量与正分母齐备即可保留占比、理论及取整名额。车型取整差额为0且所有级别候选足额，才展示固定 Mock 顺序 VIN。差额非0只记录为待处理，不自动调差、不展示为正式已抽车辆；缺码/销量/候选等未决也不伪装完成。逐记录、同月下一大区、下一交车月继续处理，不跨范围调剂。",
      "sections": {
        "interactionDesc": "完整18位码、独立销量与正分母齐备即可保留占比、理论及取整名额。车型取整差额为0且所有级别候选足额，才展示固定 Mock 顺序 VIN。差额非0只记录为待处理，不自动调差、不展示为正式已抽车辆；缺码/销量/候选等未决也不伪装完成。逐记录、同月下一大区、下一交车月继续处理，不跨范围调剂。"
      }
    },
    {
      "id": "29",
      "page": "algorithm",
      "stepIndex": 9,
      "stepLabel": "第 8 步",
      "target": "[data-anno=\"algorithm-class-quota\"]",
      "title": "第 8 步 · 新增仍待确认",
      "sourceKind": "pending-note",
      "sourceText": "新增仍待确认 正式车型尾差/超配处理、销量统计口径、缺码/缺销量/零分母/候选不足、正式 VIN 随机与重跑策略待确认。四舍五入已确认，不再列为未决；不得自动沿用小区层“尾差忽略、允许超配”。",
      "sections": {
        "exceptionRule": "正式车型尾差/超配处理、销量统计口径、缺码/缺销量/零分母/候选不足、正式 VIN 随机与重跑策略待确认。四舍五入已确认，不再列为未决；不得自动沿用小区层“尾差忽略、允许超配”。"
      }
    },
    {
      "id": "30",
      "page": "algorithm",
      "stepIndex": 9,
      "stepLabel": "第 8 步",
      "target": "[data-anno=\"algorithm-class-share\"]",
      "title": "第 8 步 · 新增规则出处",
      "sourceKind": "evidence",
      "sourceText": "本轮来源：EXEC-0914-02；2026-09-11完整18位码直接分组、2026-09-14车型名额四舍五入直接确认。示例及待处理状态仅为原型表达，不是正式差额或异常策略。",
      "sections": {
        "dataSource": "本轮来源：EXEC-0914-02；2026-09-11完整18位码直接分组、2026-09-14车型名额四舍五入直接确认。示例及待处理状态仅为原型表达，不是正式差额或异常策略。"
      }
    },
    {
      "id": "31",
      "page": "algorithm",
      "stepIndex": 9,
      "stepLabel": "第 8 步",
      "target": "[data-anno=\"algorithm-result-heading\"]",
      "title": "规则边界汇总",
      "sourceKind": "rule-note",
      "sourceText": "已确认与仍待确认事项",
      "sections": {
        "judgeRule": "先取整A小，保留原C优、按缺口补足、不足停止、按释放名额回补规则；小区层尾差忽略/超配允许且不强制等于U。按TQMP交车年月逐月逐大区计算，再按完整18位码销量占比分配并四舍五入车型名额。",
        "exceptionRule": "n口径、同缺口顺序、低候选不足例外、零分母、销量统计范围、缺日期/缺码/缺销量/候选不足、正式车型尾差超配处理仍未决。区域取得即冻结已确认；获取业务节点、失败和受控重建仍未决。"
      }
    },
    {
      "id": "32",
      "page": "algorithm",
      "stepIndex": 9,
      "stepLabel": "第 8 步",
      "target": "[data-anno=\"algorithm-class-quota\"]",
      "title": "第 8 步 · 计算示例",
      "sourceKind": "example-note",
      "sourceText": "交车日期跨月、完整三码与四舍五入差额",
      "sections": {
        "interactionDesc": "交车2026-08-05、销售2026-07-30、推送2026-09-10仍归8月。完整三码销量40/40/20、小区名额20，对应8/8/4；不合并不同码。两码各50%、小区名额5，理论2.5/2.5，取整3/3，合计6、差额+1，只记待处理，不伪装已抽6辆。"
      }
    }
  ]
};

// Business-route notes. The existing algorithm group above remains the source for docs/algorithm.html.
window.AnnotationData.plan = [
  { id: '1', page: 'plan', target: '#new-approval', title: '从调查方案审批开始', sections: { interactionDesc: '新建或编辑方案时，分层抽样和推送规则在同一张审批单内配置。保存只写当前页面的脱敏演示状态；刷新后恢复原始样例。' } },
  { id: '2', page: 'plan', target: '#modal-sampling-enabled', title: '分层抽样范围', sections: { judgeRule: '整个方案共用 C（抽样比例）和 Lwr（小区最低样本数）；先按 TQMP 交车日期拆月，每月每大区分别执行小区调剂。级别层不重复执行小区最低样本调剂。', exceptionRule: 'Lwr 为空、填 0、关闭开关是否完全等价，仍待确认。' } },
  { id: '3', page: 'plan', target: '#modal-sampling-fields', title: '抽样月份来源', sections: { dataSource: '交车日期由 TQMP 推送。原型字段 tqmpDeliveryDateMock 是演示键名，不定义正式接口合同。', judgeRule: '抽样月份只取该交车日期的年月；缺失或无效时不使用销售日期、推送日期替代。审批表单和详情不另占三行展示此项说明。' } },
  { id: '4', page: 'plan', target: '#modal-sampling-fields', title: '车型级别与取整', sections: { judgeRule: '一个完整 18 位码就是一个车型级别。先定同月同小区名额，再乘以该码销量占比，按四舍五入取整；独立取整差额单列。审批表单和详情不另占三行展示当前方案数据。', exceptionRule: '车型差额的正式处理、销量统计范围、缺码、候选不足和正式抽车策略仍待确认；不增加编码映射。' } },
  { id: '5', page: 'plan', target: '#modal-push-mode', title: '单一推送规则', sections: { interactionDesc: '固定星期和基准日加每 VIN 随机偏移是同一个推送规则中的互斥选择；切换保留已填参数。', judgeRule: '现有固定星期可配置每周星期、时分及交车后基准天数。开启任务后保持推送中，直到方案全部 VIN 完成推送（包含失败）才为已完成。', exceptionRule: '定时循环开关关闭后的执行方式待确认。' } },
  { id: '6', page: 'plan', target: '#modal-random-days', title: '随机日期与发送时间', sections: { judgeRule: '实际推送时刻＝TQMP 交车日期＋基准天数＋当前 VIN 的 0～d 整数天偏移，再使用随机模式单独配置的发送时分（HH:mm）。偏移包含 0 和 d；随机模式不叠加固定星期。', exceptionRule: '随机发送时间必填；无该值的旧记录显示待配置，不能继承固定星期时间或推断为 00:00／10:00。用户确认不设置夜间禁发时段，也不限制可选小时；正式随机结果复现及节假日策略仍待确认。15 天只是演示例值。' } },
  { id: '7', page: 'plan', target: '#modal-push-date-examples', title: '查看两个端点的推送时刻', sections: { interactionDesc: '展开示例后，可对照某 VIN 的交车日期、偏移 0 天与偏移 d 天在已配置时分下的推送时刻。这里只演示日期与时间的组合，不实际调度推送。' } },
  { id: '8', page: 'plan', target: '[data-anno="plan-organization-snapshot"]', title: '成功取得后形成区域快照', sections: { judgeRule: '按门店编码从营销平台成功取得省、市、大区、小区时形成本次快照；取得时间就是冻结时间，此后组织归属变化不自动覆盖历史值。详情对照冻结区域与最新查询值。', exceptionRule: '在审批哪个业务节点发起查询、查询失败、缺失映射和受控重建仍待确认；未取得时显示未取得，不伪装成功。', dataSource: '原型中的取得时间、来源和组织变更均为脱敏 Mock。' } },
  { id: '9', page: 'plan', target: '#points-flow-review-link', title: '积分发放流程图（以第二张截图为准）', sections: { interactionDesc: '此入口打开独立静态流程图。可查看用户提交点评、TCS 保存点评、手工补发、渠道查卡、VIN 重复发放判断、积分系统发放和日志记录；点击图中节点或连线在右侧抽屉阅读完整原文。', dataSource: '依据 2026-09-14 用户最后确认的第二张截图复原；先前含“每日定时执行”和系统／人工有效性前置判断的第一张截图已弃用。', exceptionRule: '原图未画出的判断出口和外部服务失败策略只列为待确认，不补造流程。此页是离线评审演示，不触发真实积分发放。' } }
];
window.AnnotationData.review = [
  { id: '1', page: 'review', target: '#review-tabs', title: '两个审核页签共用规则', sections: { interactionDesc: '待审核和已审核均显示门店、省市、大区、小区、设备风险与系统初判；查询和导出按当前页签结果执行，人工审核记录独立。' } },
  { id: '2', page: 'review', target: '#review-filter-store', title: '门店和区域查询', sections: { judgeRule: '门店可按名称或编码查找；省、市、大区、小区可分别筛选，条件取交集。详情和导出使用同一份筛选结果。', dataSource: '区域来自按门店编码取得的本次区域数据；原型使用脱敏 Mock。' } },
  { id: '3', page: 'review', target: '#review-filter-riskStatus', title: '设备风险判定', sections: { judgeRule: '提交本次答卷时，同 VIN、同问卷 ID、同现有 TCS MIS，在一年内含本次出现至少两个不同设备 ID，则本次设备风险异常；MIS 不同或同设备不能单独触发。', exceptionRule: '一年精确端点、无效/撤回答卷、缺失设备 ID 及查询失败的正式处理仍待确认；待核验不是第三种设备风险状态。' } },
  { id: '4', page: 'review', target: '#review-query', title: '系统初判与人工结论', sections: { judgeRule: '设备风险异常使系统初判无效；设备风险正常仍须检查其他初判条件。人工确认有效或无效独立记录，不反向修改风险结果。' } }
];
window.AnnotationData.sampling = [
  { id: '1', page: 'sampling', target: '#monthly-audit-source', title: '选择计算范围', sections: { interactionDesc: '可看当前审批绑定数据，或独立评审例子；独立例子使用自己的参数，不写回当前方案。' } },
  { id: '2', page: 'sampling', target: '#monthly-month-basis', title: 'TQMP 交车日期归月', sections: { judgeRule: '只按 TQMP 交车日期年月确定抽样单元；销售日期或计划推送日期仅供对照，缺失交车日期不回退。' } },
  { id: '3', page: 'sampling', target: '#monthly-qualification-summary', title: '候选车辆资格', sections: { judgeRule: '成功销退及错误数据先排出候选；历史已推送标记不作为本轮候选资格排除条件。', exceptionRule: '同一发送任务的防重复发送和重跑幂等是后续执行控制，不因资格口径调整而取消。' } },
  { id: '4', page: 'sampling', target: '#monthly-calculation-results', title: '月内小区与车型结果', sections: { judgeRule: '每月每大区先运行原小区调剂，再按同月同小区的完整 18 位码销量占比分名额。理论值四舍五入，0.5 进 1；取整合计差额单列，不自动削减、补给或跨月调剂。', exceptionRule: '销量统计口径、零分母、缺码、候选不足及差额正式处理未确认；差额非零的结果不伪装为已完成抽车。' } },
  { id: '5', page: 'sampling', target: '#view-monthly-candidates', title: '查看资格明细', sections: { interactionDesc: '资格明细可分别对照交车日期、销售日期、推送日期、历史已推送标记、过滤结果和实际抽车示例。当前结果与 CSV 使用同源数据。' } },
  { id: '6', page: 'sampling', target: '#export-monthly-audit', title: '导出审计结果', sections: { interactionDesc: '导出使用当前审批或当前独立例子的计算结果，包含交车归月、完整码、车型四舍五入名额与差额。', dataSource: '只导出本地脱敏演示数据，不调用真实 TQMP 或营销平台接口。' } }
];
window.AnnotationData.questionnaireReport = [
  { id: '1', page: 'questionnaireReport', target: '#qr-series-summary', title: '选择车系后查询', sections: { interactionDesc: '先选车系，再按条件查询。列表和导出保持同一查询结果。' } },
  { id: '4', page: 'questionnaireReport', target: '#qr-filter-region', title: '门店与区域查询', sections: { interactionDesc: '在既有车系及其他条件基础上，增加门店、省份、城市、大区、小区五项查询；各条件取交集。查询、重置、表格和导出使用同一筛选结果，车系前置不变。', dataSource: '门店名称沿用现有“专营店”字段；仅在记录有可信门店编码时才支持按编码查询，不凭空补造。省市大区小区是本页已有明细列。' } },
  { id: '2', page: 'questionnaireReport', target: '#qr-table-body', title: '区域明细', sections: { judgeRule: '现有报表明细在专营店后展示省、市、大区、小区，不改变客户表或问题表。', dataSource: '车系、逻辑树和记录均为脱敏 Mock；页面仅演示交互，不连接真实报表或营销平台。' } },
  { id: '3', page: 'questionnaireReport', target: '#qr-export', title: '导出当前结果', sections: { interactionDesc: '按当前车系和筛选条件导出；表格列设置只改变本页展示，导出仍按页面原有规则执行。' } }
];
