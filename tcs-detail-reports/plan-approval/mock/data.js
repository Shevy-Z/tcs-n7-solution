(function () {
  'use strict';

  var functions = [
    {
      id: 'F-01',
      order: 1,
      priority: 'P0',
      group: '设备 ID',
      priorityRank: 2,
      name: '答卷设备ID采集与留痕',
      target: '无页面—答卷提交接口/答卷记录',
      changeType: '改',
      description: 'App/SDK随答卷提交设备ID，TCS保存设备ID并关联VIN、调查方案/场景、调查周期和作答时间；格式、哈希、空值、权限及保存期限待确认。',
      createdAt: '2026-08-28 13:46',
      updatedAt: '2026/9/2 11:05',
      route: 'review',
      location: '人工审核点评 · 设备风险证据'
    },
    {
      id: 'F-02',
      order: 2,
      priority: 'P0',
      group: '设备 ID',
      priorityRank: 2,
      name: '设备风险历史与详情',
      target: '人工审核点评有效性/已审核记录 · 设备风险详情（行内入口）',
      changeType: '改',
      description: '新增设备对应VIN、问卷/方案、调查周期、答卷时间、命中原因、风险状态及处置记录；观察周期、阈值和风险口径待确认。',
      createdAt: '2026-08-28 13:46',
      updatedAt: '2026/9/2 11:05',
      route: 'review',
      location: '人工审核点评 · 设备风险详情'
    },
    {
      id: 'F-03',
      order: 3,
      priority: 'P0',
      group: '设备 ID',
      priorityRank: 2,
      name: '设备风险人工复核',
      target: '人工审核点评有效性/已审核记录',
      changeType: '改',
      description: '设备风险纳入系统初判：异常时系统初判为无效，正常时保留其他条件的初判结果；展示此前触发答卷证据并保留人工复核和处置记录，系统初判不自动生成或覆盖人工结论。是否自动进入人工队列，以及积分和专营店政策处理仍待确认。',
      createdAt: '2026-08-28 13:46',
      updatedAt: '2026/9/2 11:05',
      route: 'review',
      location: '人工审核点评 · 设备证据'
    },
    {
      id: 'F-04',
      order: 4,
      priority: 'P0',
      group: 'TQMP 对接',
      priorityRank: 1,
      name: '调查发起接口新增标识字段',
      target: '无页面—TQMP→TCS调查发起接口/调查任务数据',
      changeType: '改',
      description: '保持原调查流程不变，在现有调查发起接口接收并保存两个新增字段；已明确MIS值仅存储、透传并在结果中原值返回，第二个字段的名称、类型、含义以及MIS完整枚举和30/60/90/180天节点映射待确认。',
      createdAt: '2026-09-02 08:38',
      updatedAt: '2026/9/2 11:05',
      route: 'backend-evidence',
      location: '后台接口契约与验收证据（无生产菜单）'
    },
    {
      id: 'F-05',
      order: 5,
      priority: 'P0',
      group: 'TQMP 对接',
      priorityRank: 1,
      name: '客户结果回传接口',
      target: '无页面—TCS→TQMP客户结果接口',
      changeType: '增',
      description: '调查完成后通过新接口向TQMP推送客户维度结果，并原值返回MIS等标识字段；触发时点、字段清单、鉴权、幂等、超时、失败码、ACK和重试规则待确认。',
      createdAt: '2026-09-02 08:38',
      updatedAt: '2026/9/2 11:05',
      route: 'backend-evidence',
      location: '后台客户结果接口契约（无生产菜单）'
    },
    {
      id: 'F-06',
      order: 6,
      priority: 'P0',
      group: 'TQMP 对接',
      priorityRank: 1,
      name: '问题结果明细回传接口',
      target: '无页面—TCS→TQMP问题结果接口',
      changeType: '增',
      description: '通过独立新接口向TQMP推送逐题结果明细，不与客户结果强行共用旧接口；与客户结果的关联键、推送顺序、分批分页、ACK、失败重试和补偿规则待确认。',
      createdAt: '2026-09-02 08:38',
      updatedAt: '2026/9/2 11:05',
      route: 'backend-evidence',
      location: '后台问题明细接口契约（无生产菜单）'
    },
    {
      id: 'F-07',
      order: 7,
      priority: 'P0',
      group: 'TQMP 对接',
      priorityRank: 1,
      name: '结果回传任务与异常补偿',
      target: '无页面—结果推送后台任务/回传日志',
      changeType: '增',
      description: '编排客户结果和问题明细两个回传任务，记录批次、状态、请求结果及失败原因，并支持必要的重试、补偿和对账；两接口先后顺序、原子性、监控告警及人工补偿边界待确认。',
      createdAt: '2026-09-02 08:38',
      updatedAt: '2026/9/2 11:05',
      route: 'backend-evidence',
      location: '后台任务日志与异常补偿验收（无生产菜单）'
    },
    {
      id: 'F-08',
      order: 8,
      priority: 'P0',
      group: 'TQMP 对接',
      priorityRank: 1,
      name: '旧结果接口切换与历史数据处理',
      target: '无页面—旧结果接口/切换配置',
      changeType: '改',
      description: '新客户结果和问题结果接口启用后按确认切点停用旧结果接口；会议倾向本期历史数据不迁移、不补推，但兼容期、灰度切换、回退方案及旧数据查询方式仍待确认。',
      createdAt: '2026-09-02 08:38',
      updatedAt: '2026/9/2 11:05',
      route: 'backend-evidence',
      location: '发布切换方案与验收记录（无生产菜单）'
    },
    {
      id: 'F-09',
      order: 9,
      priority: 'P0',
      group: 'TQMP 对接',
      priorityRank: 1,
      name: '千级问卷题目下发性能验证',
      target: '无页面—现有题目下发接口/性能测试',
      changeType: '改',
      description: '问卷内容、题型及题间逻辑不作业务调整；针对1000～3000题、多媒体答案和逻辑关联场景验证现有题目下发性能。验证通过则不改接口，不通过时再评审字段裁剪或异步方案；性能阈值和备选方案待确认。',
      createdAt: '2026-09-02 08:38',
      updatedAt: '2026/9/2 11:05',
      route: 'test-evidence',
      location: '性能测试方案/报告（无生产菜单）'
    },
    {
      id: 'F-10',
      order: 10,
      priority: 'P1',
      group: '随机 / 抽样',
      priorityRank: 3,
      name: '调查方案分层抽样配置',
      target: '新建_编辑审批（0519）',
      changeType: '改',
      description: '新增调查方案级抽样比例和统一的小区样本下限配置；比例、小区下限空值/0值含义及不足分配、取整规则待确认。',
      createdAt: '2026-08-28 13:46',
      updatedAt: '2026/9/2 11:05',
      route: 'plan',
      location: '调查方案审批 · 新建/编辑审批抽样规则'
    },
    {
      id: 'F-11',
      order: 11,
      priority: 'P1',
      group: '随机 / 抽样',
      priorityRank: 3,
      name: '调查方案随机推送日期',
      target: '新建_编辑审批（0519）',
      changeType: '改',
      description: '在同一推送规则区保留固定星期/随机模式；随机模式每 VIN 在0～d整数天中取偏移（含两端），并单独配置必填推送时分，不自动沿用固定星期时分。用户确认不需夜间禁发时段；节假日等其他调度策略待确认。',
      createdAt: '2026-08-28 13:46',
      updatedAt: '2026/9/2 11:05',
      route: 'plan',
      location: '调查方案审批 · 新建/编辑审批推送规则'
    },
    {
      id: 'F-12',
      order: 12,
      priority: 'P1',
      group: '随机 / 抽样',
      priorityRank: 3,
      name: '营销平台区域映射与方案快照',
      target: '无页面—后台任务/接口',
      changeType: '改',
      description: '从营销平台按门店编码取得省、市、大区、小区；获取成功即形成本次冻结快照，后续组织变更不自动改写。获取业务节点、失败和受控重建策略待确认。',
      createdAt: '2026-08-28 13:46',
      updatedAt: '2026/9/2 11:05',
      route: 'plan',
      location: '调查方案审批 · 审批详情快照'
    },
    {
      id: 'F-13',
      order: 13,
      priority: 'P1',
      group: '随机 / 抽样',
      priorityRank: 3,
      name: '分层抽样计算与随机选VIN',
      target: '无页面—抽样计算后台任务',
      changeType: '改',
      description: '按大区/小区计算候选数、目标配额、调剂结果并在小区候选池随机选VIN；已确认计算按最新规则执行，参与小区口径、同缺口并列、随机种子和重跑幂等仍待确认。',
      createdAt: '2026-08-28 13:46',
      updatedAt: '2026/9/2 11:05',
      route: 'sampling',
      location: '调查方案审批 · 推送数据计算结果'
    },
    {
      id: 'F-14',
      order: 14,
      priority: 'P1',
      group: '随机 / 抽样',
      priorityRank: 3,
      name: '抽样结果查看与审计导出',
      target: '调查方案审批 · 推送数据（行操作详情）',
      changeType: '改',
      description: '展示或导出大区/小区候选数、目标数、最终数、入选VIN、算法版本和随机依据，供测试与审计；是否建设永久运营页面待确认。',
      createdAt: '2026-08-28 13:46',
      updatedAt: '2026/9/2 11:05',
      route: 'sampling',
      location: '调查方案审批 · 推送数据审计导出'
    },
    {
      id: 'F-15',
      order: 15,
      priority: 'P1',
      group: '随机 / 抽样',
      priorityRank: 3,
      name: '问卷报表明细区域字段',
      target: '统计报表 · 问卷报表明细',
      changeType: '改',
      description: '问卷报表明细展示并导出省、市、大区、小区；新增省份、城市、大区、小区、门店查询，与既有条件取交集。门店按现有专营店名称查询，不虚构编码。本地使用脱敏 Mock。',
      createdAt: '2026-08-28 13:46',
      updatedAt: '2026/9/2 11:05',
      route: 'questionnaireReport',
      location: '问卷报表明细 · 专营店后四个区域字段'
    }
  ];

  window.TCSData = {
    project: {
      name: 'TCS 全功能交互原型',
      version: '需求评审稿 · 2026-09-02',
      source: '内部功能清单（公开版脱敏）',
      sourceRange: '原始15项',
      requirementIds: ['TCS-REQ-20260827-001', 'TCS-REQ-20260828-001'],
      evidenceNotice: '本原型用于需求评审；页面、接口状态与业务数据均为 Mock，不代表现网或生产实现。'
    },
    priorityGroups: [
      { key: 'tqmp', label: '第一顺位', title: 'TQMP 对接', priority: 'P0', count: 6, route: 'backend-evidence' },
      { key: 'device', label: '第二顺位', title: '设备 ID', priority: 'P0', count: 3, route: 'review' },
      { key: 'sampling', label: '第三顺位', title: '随机 / 抽样', priority: 'P1', count: 6, route: 'plan' }
    ],
    nav: [
      { key: 'permission', label: '权限管理', disabled: true },
      { key: 'questionnaire', label: '问卷管理', disabled: true },
      {
        key: 'approval-group',
        label: '审批管理',
        expanded: true,
        children: [
          { key: 'publish-approval', label: '问卷发布审批', disabled: true },
          { key: 'review', label: '人工审核点评' },
          { key: 'plan', label: '调查方案审批' },
          { key: 'my-approval', label: '我的审批', disabled: true }
        ]
      },
      { key: 'material', label: '素材管理', disabled: true },
      {
        key: 'report',
        label: '统计报表',
        expanded: true,
        children: [
          { key: 'questionnaireReport', label: '问卷报表明细' }
        ]
      },
      { key: 'configuration', label: '配置管理', disabled: true }
    ],
    functions: functions,
    approvalRecords: [
      {
        approvalNo: 'TCS-AP-20260902-001',
        name: '2026年首保回访调查（Mock）',
        createdAt: '2026-09-02 09:06:18',
        questionnaireId: 'QNR-DEMO-1028',
        pushApprovalId: 'PUSH-AP-DEMO-8108',
        status: '待提交',
        currentApprover: '—',
        submittedAt: '—',
        completedAt: '—',
        pushStatus: '未开启',
        pushStartedAt: '—',
        pushRule: '定时循环推送',
        reward: '否',
        samplingEnabled: true,
        samplingRatio: 35,
        lowerBound: 20,
        randomPushMode: '基准日+每VIN随机偏移',
        randomDays: 15,
        scenarioId: 'coverage',
        snapshotId: 'SNAP-TCS-202609-DEMO-01'
      },
      {
        approvalNo: 'TCS-AP-20260901-003',
        name: '2026年交车体验调查（Mock）',
        createdAt: '2026-09-01 14:22:36',
        questionnaireId: 'QNR-DEMO-1019',
        pushApprovalId: 'PUSH-AP-DEMO-8101',
        status: '审批中',
        currentApprover: '王倩（Mock）',
        submittedAt: '2026-09-01 15:03:10',
        completedAt: '—',
        pushStatus: '未开启',
        pushStartedAt: '—',
        pushRule: '定时循环推送',
        reward: '是',
        samplingEnabled: false,
        samplingRatio: null,
        lowerBound: null,
        randomPushMode: '固定星期',
        randomDays: null,
        snapshotId: '—'
      },
      {
        approvalNo: 'TCS-AP-20260828-006',
        name: '2026年到店服务体验调查（Mock）',
        createdAt: '2026-08-28 10:18:42',
        questionnaireId: 'QNR-DEMO-0996',
        pushApprovalId: 'PUSH-AP-DEMO-8112',
        status: '已通过',
        currentApprover: '—',
        submittedAt: '2026-08-28 10:32:19',
        completedAt: '2026-08-29 16:08:55',
        pushStatus: '推送中',
        pushStartedAt: '2026-09-01 10:00:00',
        pushRule: '定时循环推送',
        reward: '是',
        samplingEnabled: true,
        samplingRatio: 35,
        lowerBound: 20,
        randomPushMode: '基准日+每VIN随机偏移',
        randomDays: 15,
        scenarioId: 'shortage-over',
        snapshotId: 'SNAP-TCS-202608-DEMO-S01'
      }
    ],
    pushRecords: [
      {
        id: 'PUSH-DATA-DEMO-0001', approvalNo: 'TCS-AP-20260828-006', channel: '服务号模板消息', status: '推送成功', sentAt: '2026-09-01 10:02:18', error: '—',
        vinMasked: 'LGBS18D0•••6K4A', phoneMasked: '138•••8721', vehicleSeries: '天籁', province: '广东省', city: '广州市', region: '华南一区', district: '广佛小区',
        candidateCount: 26, targetCount: 20, finalCount: 20, algorithmVersion: 'TCS-SAMPLE-R074-DEMO', randomBasis: 'Mock 固定顺序 DEMO-S01'
      },
      {
        id: 'PUSH-DATA-DEMO-0002', approvalNo: 'TCS-AP-20260828-006', channel: 'App Push', status: '推送成功', sentAt: '2026-09-01 10:02:31', error: '—',
        vinMasked: 'LGBT19E1•••7M8D', phoneMasked: '139•••3106', vehicleSeries: '奇骏', province: '广东省', city: '深圳市', region: '华南一区', district: '深莞小区',
        candidateCount: 22, targetCount: 20, finalCount: 20, algorithmVersion: 'TCS-SAMPLE-R074-DEMO', randomBasis: 'Mock 固定顺序 DEMO-S01'
      },
      {
        id: 'PUSH-DATA-DEMO-0003', approvalNo: 'TCS-AP-20260828-006', channel: '短信', status: '推送失败', sentAt: '2026-09-01 10:03:02', error: '演示：手机号无效',
        vinMasked: 'LGBV21G0•••6B4P', phoneMasked: '137•••0000', vehicleSeries: '轩逸', province: '广西壮族自治区', city: '南宁市', region: '华南一区', district: '广西小区',
        candidateCount: 18, targetCount: 18, finalCount: 18, algorithmVersion: 'TCS-SAMPLE-R074-DEMO', randomBasis: 'Mock 固定顺序 DEMO-S01'
      },
      {
        id: 'PUSH-DATA-DEMO-0004', approvalNo: 'TCS-AP-20260828-006', channel: '服务号模板消息', status: '推送成功', sentAt: '2026-09-01 10:03:24', error: '—',
        vinMasked: 'LGBW22H1•••5J8S', phoneMasked: '136•••5983', vehicleSeries: '楼兰', province: '海南省', city: '海口市', region: '华南一区', district: '海南小区',
        candidateCount: 12, targetCount: 12, finalCount: 12, algorithmVersion: 'TCS-SAMPLE-R074-DEMO', randomBasis: 'Mock 固定顺序 DEMO-S01'
      }
    ],
    organizationSnapshot: {
      snapshotId: 'SNAP-TCS-202609-DEMO-01',
      sourceSystem: '营销平台（Mock）',
      queryKey: '门店编码',
      fetchStatus: 'success',
      acquiredAt: '2026-09-02 09:05:00',
      frozenAt: '2026-09-02 09:05:00',
      mappingStatus: '4 个小区已映射 · 0 条失败（Mock）',
      records: [
        { storeCode: 'SH-A021', storeName: '上海浦东专营店', province: '上海市', city: '上海市', region: '华东一区', district: '沪东小区', regionId: 'REG-E01', districtId: 'DIST-HD' },
        { storeCode: 'HZ-B106', storeName: '杭州滨江专营店', province: '浙江省', city: '杭州市', region: '华东一区', district: '浙北小区', regionId: 'REG-E01', districtId: 'DIST-ZB' },
        { storeCode: 'NJ-C087', storeName: '南京江宁专营店', province: '江苏省', city: '南京市', region: '华东一区', district: '苏南小区', regionId: 'REG-E01', districtId: 'DIST-SN' },
        { storeCode: 'HF-D043', storeName: '合肥蜀山专营店', province: '安徽省', city: '合肥市', region: '华东一区', district: '皖中小区', regionId: 'REG-E01', districtId: 'DIST-WZ' }
      ]
    },
    organizationSnapshots: {
      'SNAP-TCS-202608-DEMO-S01': {
        snapshotId: 'SNAP-TCS-202608-DEMO-S01',
        sourceSystem: '营销平台（Mock）',
        queryKey: '门店编码',
        fetchStatus: 'success',
        acquiredAt: '2026-08-28 10:20:00',
        frozenAt: '2026-08-28 10:20:00',
        mappingStatus: '5 个小区已映射 · 0 条失败（Mock）',
        records: [
          { storeCode: 'GZ-S015', storeName: '广州专营店（Mock）', province: '广东省', city: '广州市', region: '华南一区', district: '广佛小区', regionId: 'REG-S01', districtId: 'DIST-GF' },
          { storeCode: 'SZ-S029', storeName: '深圳专营店（Mock）', province: '广东省', city: '深圳市', region: '华南一区', district: '深莞小区', regionId: 'REG-S01', districtId: 'DIST-SZ' },
          { storeCode: 'XM-S044', storeName: '厦门专营店（Mock）', province: '福建省', city: '厦门市', region: '华南一区', district: '闽南小区', regionId: 'REG-S01', districtId: 'DIST-MZ' },
          { storeCode: 'NN-S052', storeName: '南宁专营店（Mock）', province: '广西壮族自治区', city: '南宁市', region: '华南一区', district: '广西小区', regionId: 'REG-S01', districtId: 'DIST-GX' },
          { storeCode: 'HK-S061', storeName: '海口专营店（Mock）', province: '海南省', city: '海口市', region: '华南一区', district: '海南小区', regionId: 'REG-S01', districtId: 'DIST-HN' }
        ]
      }
    },
    // Latest lookup is a separate Mock object; changes never overwrite acquired snapshots.
    latestOrganizationLookup: {
      sourceSystem: '营销平台最新查询（Mock）',
      acquiredAt: '2026-09-14 09:00:00',
      records: [
        { storeCode: 'SH-A021', province: '上海市', city: '上海市', region: '华东二区', district: '上海新区' },
        { storeCode: 'HZ-B106', province: '浙江省', city: '杭州市', region: '华东一区', district: '浙北小区' },
        { storeCode: 'NJ-C087', province: '江苏省', city: '南京市', region: '华东一区', district: '苏南小区' },
        { storeCode: 'HF-D043', province: '安徽省', city: '合肥市', region: '华东一区', district: '皖中小区' },
        { storeCode: 'GZ-S015', province: '广东省', city: '广州市', region: '华南二区', district: '广州新区' },
        { storeCode: 'SZ-S029', province: '广东省', city: '深圳市', region: '华南一区', district: '深莞小区' },
        { storeCode: 'XM-S044', province: '福建省', city: '厦门市', region: '华南一区', district: '闽南小区' },
        { storeCode: 'NN-S052', province: '广西壮族自治区', city: '南宁市', region: '华南一区', district: '广西小区' },
        { storeCode: 'HK-S061', province: '海南省', city: '海口市', region: '华南一区', district: '海南小区' }
      ]
    },
    pushDateExamples: [
      { vin: 'VIN-DEMO-RANDOM-001', tqmpDeliveryDateMock: '2026-06-01' },
      { vin: 'VIN-DEMO-RANDOM-002', tqmpDeliveryDateMock: '2026-06-10' }
    ],
    samplingScenarios: [
      {
        id: 'coverage',
        name: '场景 A · 能够覆盖理论最低总量',
        description: 'U（目标参考值）≥L（理论最低总量），低样本小区先定值，原大样本小区按 C优 统一重算。',
        ratioPercent: 35,
        lowerBound: 20,
        regionId: 'REG-E01',
        regionName: '华东一区',
        algorithmVersion: 'TCS-SAMPLE-R074-DEMO',
        randomBasis: 'Mock 固定顺序 DEMO-E01（正式随机种子/重跑规则待确认）',
        communities: [
          { id: 'DIST-HD', name: '沪东小区', candidateCount: 140, province: '上海市', city: '上海市', storeCount: 8 },
          { id: 'DIST-ZB', name: '浙北小区', candidateCount: 80, province: '浙江省', city: '杭州市', storeCount: 6 },
          { id: 'DIST-SN', name: '苏南小区', candidateCount: 30, province: '江苏省', city: '南京市', storeCount: 4 },
          { id: 'DIST-WZ', name: '皖中小区', candidateCount: 12, province: '安徽省', city: '合肥市', storeCount: 2 }
        ]
      },
      {
        id: 'shortage-over',
        name: '场景 B · 不能覆盖且出现取整超配',
        description: 'U（目标参考值）<L（理论最低总量）；按缺口最近优先，余量不足即停止，剩余量按 C回 回补，独立四舍五入后允许记录超配。',
        ratioPercent: 50,
        lowerBound: 10,
        regionId: 'REG-S01',
        regionName: '华南一区',
        algorithmVersion: 'TCS-SAMPLE-R072-DEMO',
        randomBasis: 'Mock 固定顺序 DEMO-S01（正式随机种子/重跑规则待确认）',
        communities: [
          { id: 'DIST-GF', name: '广佛小区', candidateCount: 22, province: '广东省', city: '广州市', storeCount: 5 },
          { id: 'DIST-SZ', name: '深莞小区', candidateCount: 22, province: '广东省', city: '深圳市', storeCount: 4 },
          { id: 'DIST-MZ', name: '闽南小区', candidateCount: 22, province: '福建省', city: '厦门市', storeCount: 4 },
          { id: 'DIST-GX', name: '广西小区', candidateCount: 18, province: '广西壮族自治区', city: '南宁市', storeCount: 3 },
          { id: 'DIST-HN', name: '海南小区', candidateCount: 12, province: '海南省', city: '海口市', storeCount: 2 }
        ]
      }
    ],
    samplingVinPreview: {
      'DIST-HD': ['LGBH52E0••••8K3A', 'LGBH52E1••••1F7P', 'LGBH52E2••••6M2Q', 'LGBH52E3••••4D9R'],
      'DIST-ZB': ['LGBM41A0••••2H7S', 'LGBM41A1••••9C3K', 'LGBM41A2••••5P8N'],
      'DIST-SN': ['LGBN33B0••••7J2T', 'LGBN33B1••••4W6L', 'LGBN33B2••••3A9Q'],
      'DIST-WZ': ['LGBP24C0••••8E1M', 'LGBP24C1••••2R5V'],
      'DIST-GF': ['LGBS18D0••••6K4A', 'LGBS18D1••••3Q7F', 'LGBS18D2••••9N2H'],
      'DIST-SZ': ['LGBT19E0••••5P1C', 'LGBT19E1••••7M8D', 'LGBT19E2••••4R6J'],
      'DIST-MZ': ['LGBU20F0••••2T9K', 'LGBU20F1••••8V3L', 'LGBU20F2••••1X5N'],
      'DIST-GX': ['LGBV21G0••••6B4P', 'LGBV21G1••••3D7Q'],
      'DIST-HN': ['LGBW22H0••••9F2R', 'LGBW22H1••••5J8S']
    },
    deviceRisks: [
      {
        id: 'DR-202609-001',
        deviceIdMasked: 'DVC-7F2A••••A91C',
        vinMasked: 'LGBH52E0••••8K3A',
        surveyNo: 'TCS-SVY-202609-0108',
        planName: '2026年首保回访调查',
        scene: '首保后 30 天回访',
        cycle: '2026-09-01～2026-09-30',
        answeredAt: '2026-09-02 09:18:32',
        firstSeenAt: '2026-08-12 14:06:10',
        lastSeenAt: '2026-09-02 09:18:32',
        responseCount: 4,
        relatedVinCount: 3,
        causes: ['观察周期内关联 3 个 VIN', '短时段内连续提交 2 份答卷'],
        riskStatus: '待人工复核',
        latestDisposition: '仅预警，等待人工查看证据',
        province: '广东省', city: '广州市', region: '华南一区', district: '广佛小区',
        timeline: [
          { time: '2026-09-02 09:18:32', title: '设备风险提示生成', operator: '系统（Mock）', detail: '记录命中原因并转入待人工复核；未自动判无效。' },
          { time: '2026-09-02 09:18:31', title: '答卷留痕', operator: '答卷提交接口（Mock）', detail: '关联设备 ID、VIN、调查方案、场景、周期与作答时间。' },
          { time: '2026-08-12 14:06:10', title: '首次观察到设备', operator: '答卷提交接口（Mock）', detail: '仅保存脱敏后的演示标识；正式格式和哈希方案待确认。' }
        ]
      },
      {
        id: 'DR-202609-002',
        deviceIdMasked: 'DVC-91BD••••73EF',
        vinMasked: 'LGBT19E1••••7M8D',
        surveyNo: 'TCS-SVY-202609-0112',
        planName: '2026年到店服务体验调查',
        scene: '服务完成后回访',
        cycle: '2026-09-01～2026-09-15',
        answeredAt: '2026-09-02 10:41:05',
        firstSeenAt: '2026-08-28 16:20:44',
        lastSeenAt: '2026-09-02 10:41:05',
        responseCount: 2,
        relatedVinCount: 2,
        causes: ['观察周期内关联 2 个 VIN'],
        riskStatus: '观察中',
        latestDisposition: '继续观察，未改变答卷有效性',
        province: '广东省', city: '深圳市', region: '华南一区', district: '深莞小区',
        timeline: [
          { time: '2026-09-02 11:03:26', title: '人工结论：继续观察', operator: '审核员 李明（Mock）', detail: '现有证据不足以改变答卷有效性，保留风险提示。' },
          { time: '2026-09-02 10:41:05', title: '设备风险提示生成', operator: '系统（Mock）', detail: '展示历史关联证据，未触发自动业务动作。' }
        ]
      },
      {
        id: 'DR-202609-003',
        deviceIdMasked: 'DVC-3C88••••2D04',
        vinMasked: 'LGBM41A2••••5P8N',
        surveyNo: 'TCS-SVY-202609-0095',
        planName: '2026年首保回访调查',
        scene: '首保后 60 天回访',
        cycle: '2026-08-16～2026-08-31',
        answeredAt: '2026-08-30 18:22:17',
        firstSeenAt: '2026-08-30 18:22:17',
        lastSeenAt: '2026-08-30 18:22:17',
        responseCount: 1,
        relatedVinCount: 1,
        causes: ['规则命中后经人工核对为正常单次作答'],
        riskStatus: '已复核有效',
        latestDisposition: '人工确认有效；风险提示已关闭',
        province: '浙江省', city: '杭州市', region: '华东一区', district: '浙北小区',
        timeline: [
          { time: '2026-08-31 10:06:09', title: '人工结论：确认有效', operator: '审核员 王倩（Mock）', detail: '核对作答与设备历史后确认有效。' },
          { time: '2026-08-30 18:22:17', title: '答卷留痕', operator: '答卷提交接口（Mock）', detail: '建立设备、VIN 与调查上下文关联。' }
        ]
      },
      {
        id: 'DR-202609-004',
        deviceIdMasked: 'DVC-5A10••••CC82',
        vinMasked: 'LGBN33B1••••4W6L',
        surveyNo: 'TCS-SVY-202609-0101',
        planName: '2026年交车体验调查',
        scene: '交车后 7 天回访',
        cycle: '2026-09-01～2026-09-07',
        answeredAt: '2026-09-01 20:12:49',
        firstSeenAt: '2026-07-18 09:30:11',
        lastSeenAt: '2026-09-01 20:12:49',
        responseCount: 3,
        relatedVinCount: 2,
        causes: ['跨调查方案出现重复设备标识'],
        riskStatus: '待人工复核',
        latestDisposition: '已转人工队列，尚未形成业务结论',
        province: '江苏省', city: '南京市', region: '华东一区', district: '苏南小区',
        timeline: [
          { time: '2026-09-01 20:12:50', title: '进入人工复核队列', operator: '系统（Mock）', detail: '只创建复核任务，不自动判无效。' },
          { time: '2026-09-01 20:12:49', title: '设备风险提示生成', operator: '系统（Mock）', detail: '命中跨方案重复设备观察条件；阈值待确认。' }
        ]
      }
    ],
    // systemJudgement 保留其他条件的原始 Mock 初判；当前审核读取层叠加“设备风险异常则初判无效”，不改写人工结论。
    // EXEC-0914 当前样例：同 VIN、同问卷、同现有 MIS，一年内至少两个不同设备（含本次）。
    // 完整演示标识用于匹配，Masked 字段仅用于展示；不代表正式接口字段合同或新增生产表。
    // 旧 riskEvidence 与 reviewHint 已随本轮 before 快照归档，不再作为当前风险判定来源。
    // 问卷 ID 独立于调查审批单号；不跨问卷判风险，不用后来的答卷回写之前答卷的风险状态。
    reviewRecords: [
      {
        id: 'RV-202609-001', surveyNo: 'TCS-SVY-202609-0108', planName: '2026年首保回访调查', pushId: 'PUSH-202609-8108',
        storeName: '演示门店 A（Mock）', storeCode: 'STORE-MOCK-001',
        questionnaireId: 'QNR-DEMO-MAINT-30D',
        brand: '东风日产', commentStatus: '已完成', commentTime: '2026-09-02 09:18:32', mis: 'MIS-DEMO-30D', durationJudge: '正常', durationPercentile: 'P54',
        vinMasked: 'LGBH52E0••••8K3A', deviceRiskId: 'DR-202609-001', deviceIdMasked: 'DVC-7F2A••••A91C',
        vin: 'VINMOCK0000000001', deviceId: 'DEVICE-MOCK-001-CURRENT',
        riskStatus: '异常', reviewStatus: '待复核', systemJudgement: '有效', reviewHint: '最新历史 MIS 不同；更早 9 个月同 MIS、不同设备的答卷触发异常',
        npsMatch: '是', nssMatch: '是', durationSeconds: 186, messageCount: 3, avgMessageLength: 28,
        reviewedAt: '', reviewer: '', remark: '', province: '广东省', city: '广州市', region: '华南一区', district: '广佛小区'
      },
      {
        id: 'RV-202609-002', surveyNo: 'TCS-SVY-202609-0112', planName: '2026年到店服务体验调查', pushId: 'PUSH-202609-8112',
        storeName: '演示门店 B（Mock）', storeCode: 'STORE-MOCK-002',
        questionnaireId: 'QNR-DEMO-INSTORE-60D',
        brand: '东风日产', commentStatus: '已完成', commentTime: '2026-09-02 10:41:05', mis: 'MIS-DEMO-60D', durationJudge: '偏短', durationPercentile: 'P12',
        vinMasked: 'LGBT19E1••••7M8D', deviceRiskId: 'DR-202609-002', deviceIdMasked: 'DVC-91BD••••73EF',
        vin: 'VINMOCK0000000002', deviceId: 'DEVICE-MOCK-002-CURRENT',
        riskStatus: '正常', reviewStatus: '待复核', systemJudgement: '无效', reviewHint: '唯一不同设备历史距本次 13 个月，不触发本规则；其他初判条件仍无效',
        npsMatch: '否', nssMatch: '是', durationSeconds: 94, messageCount: 1, avgMessageLength: 16,
        reviewedAt: '', reviewer: '', remark: '', province: '广东省', city: '深圳市', region: '华南一区', district: '深莞小区'
      },
      {
        id: 'RV-202609-003', surveyNo: 'TCS-SVY-202609-0101', planName: '2026年交车体验调查', pushId: 'PUSH-202609-8101',
        storeName: '演示门店 C（Mock）', storeCode: 'STORE-MOCK-003',
        questionnaireId: 'QNR-DEMO-DELIVERY-7D',
        brand: '启辰', commentStatus: '已完成', commentTime: '2026-09-01 20:12:49', mis: 'MIS-DEMO-7D', durationJudge: '正常', durationPercentile: 'P69',
        vinMasked: 'LGBN33B1••••4W6L', deviceRiskId: 'DR-202609-004', deviceIdMasked: 'DVC-5A10••••CC82',
        vin: 'VINMOCK0000000003', deviceId: 'DEVICE-MOCK-003-CURRENT',
        riskStatus: '正常', reviewStatus: '待复核', systemJudgement: '待定', reviewHint: '唯一历史的 MIS 不同，不触发设备风险',
        npsMatch: '是', nssMatch: '否', durationSeconds: 241, messageCount: 4, avgMessageLength: 31,
        reviewedAt: '', reviewer: '', remark: '', province: '江苏省', city: '南京市', region: '华东一区', district: '苏南小区'
      },
      {
        id: 'RV-202609-004', surveyNo: 'TCS-SVY-202609-0095', planName: '2026年首保回访调查', pushId: 'PUSH-202608-8095',
        storeName: '演示门店 D（Mock）', storeCode: 'STORE-MOCK-004',
        questionnaireId: 'QNR-DEMO-MAINT-60D',
        brand: '东风日产', commentStatus: '已完成', commentTime: '2026-08-30 18:22:17', mis: 'MIS-DEMO-60D', durationJudge: '正常', durationPercentile: 'P61', accountId: 'USER-DEMO-0021',
        vinMasked: 'LGBM41A2••••5P8N', deviceRiskId: 'DR-202609-003', deviceIdMasked: 'DVC-3C88••••2D04',
        vin: 'VINMOCK0000000004', deviceId: 'DEVICE-MOCK-004-CURRENT',
        riskStatus: '正常', reviewStatus: '确认有效', systemJudgement: '有效', reviewHint: '9 个月历史与本次设备相同，未出现第二个设备',
        npsMatch: '是', nssMatch: '是', durationSeconds: 208, messageCount: 2, avgMessageLength: 34,
        reviewedAt: '2026-08-31 10:06:09', reviewer: '王倩（Mock）', remark: '单次正常作答，证据不足以否定答卷。', province: '浙江省', city: '杭州市', region: '华东一区', district: '浙北小区'
      },
      {
        id: 'RV-202609-005', surveyNo: 'TCS-SVY-202609-0088', planName: '2026年服务体验调查', pushId: 'PUSH-202608-8088',
        storeName: '演示门店 B（Mock）', storeCode: 'STORE-MOCK-002',
        questionnaireId: 'QNR-DEMO-SERVICE-90D',
        brand: '东风日产', commentStatus: '已完成', commentTime: '2026-09-02 10:18:09', mis: 'MIS-DEMO-90D', durationJudge: '正常', durationPercentile: 'P47', accountId: 'USER-DEMO-0017',
        vinMasked: 'LGBS18D2••••9N2H', deviceRiskId: 'DR-202609-002', deviceIdMasked: 'DVC-91BD••••73EF',
        vin: 'VINMOCK0000000005', deviceId: 'DEVICE-MOCK-005-CURRENT',
        riskStatus: '异常', reviewStatus: '继续观察', systemJudgement: '待定', reviewHint: '9 个月同 VIN、同问卷、同 MIS 的不同设备历史触发异常；人工结论独立',
        npsMatch: '是', nssMatch: '是', durationSeconds: 173, messageCount: 2, avgMessageLength: 22,
        reviewedAt: '2026-09-02 11:03:26', reviewer: '李明（Mock）', remark: '保留提示，暂不改变答卷有效性。', province: '广东省', city: '深圳市', region: '华南一区', district: '深莞小区'
      },
      {
        id: 'RV-202609-006', surveyNo: 'TCS-SVY-202609-0099', planName: '2026年交车体验调查', pushId: 'PUSH-202609-8099',
        storeName: '演示门店 E（Mock）', storeCode: 'STORE-MOCK-005',
        questionnaireId: 'QNR-DEMO-DELIVERY-7D',
        brand: '启辰', commentStatus: '已完成', commentTime: '2026-09-01 18:54:11', mis: 'MIS-DEMO-7D', durationJudge: '偏短', durationPercentile: 'P18', accountId: 'USER-DEMO-0032',
        vinMasked: 'LGBP24C1••••2R5V', deviceRiskId: 'DR-202609-004', deviceIdMasked: 'DVC-5A10••••CC82',
        vin: 'VINMOCK0000000006', deviceId: 'DEVICE-MOCK-006-CURRENT',
        riskStatus: '正常', reviewStatus: '转人工复核', systemJudgement: '待定', reviewHint: '历史问卷不同，不触发本次设备风险',
        npsMatch: '否', nssMatch: '是', durationSeconds: 119, messageCount: 1, avgMessageLength: 13,
        reviewedAt: '2026-09-01 20:18:22', reviewer: '陈琳（Mock）', remark: '转交二线复核，未自动改变有效性。', province: '安徽省', city: '合肥市', region: '华东一区', district: '皖中小区'
      },
      {
        id: 'RV-202609-007', surveyNo: 'TCS-SVY-202609-0076', planName: '2026年交车体验调查', pushId: 'PUSH-202608-8076',
        storeName: '演示门店 C（Mock）', storeCode: 'STORE-MOCK-003',
        questionnaireId: 'QNR-DEMO-DELIVERY-7D',
        brand: '东风日产', commentStatus: '已完成', commentTime: '2026-08-27 11:28:36', mis: 'MIS-DEMO-7D', durationJudge: '异常偏短', durationPercentile: 'P03', accountId: 'USER-DEMO-0009',
        vinMasked: 'LGBX23J0•••8C6T', deviceRiskId: '', deviceIdMasked: 'DVC-2E61•••B407',
        vin: 'VINMOCK0000000007', deviceId: 'DEVICE-MOCK-007-CURRENT',
        riskStatus: '正常', reviewStatus: '确认无效', systemJudgement: '无效', reviewHint: '时长与答案完整性异常',
        npsMatch: '否', nssMatch: '否', durationSeconds: 21, messageCount: 0, avgMessageLength: 0,
        reviewedAt: '2026-08-27 14:02:11', reviewer: '赵敏（Mock）', remark: '答题时长过短且关键题未完成；与设备风险无关。', province: '江苏省', city: '南京市', region: '华东一区', district: '苏南小区'
      },
      {
        id: 'RV-202609-008', surveyNo: 'TCS-SVY-202609-0115', planName: '2026年交车体验调查', pushId: 'PUSH-MOCK-202609-8115',
        storeName: '演示门店 A（Mock）', storeCode: 'STORE-MOCK-001',
        questionnaireId: 'QNR-DEMO-DELIVERY-7D',
        brand: '东风日产', commentStatus: '已完成', commentTime: '2026-09-02 12:30:00', mis: 'MIS-DEMO-7D', durationJudge: '正常', durationPercentile: 'P58',
        vin: 'VINMOCK0000000008', vinMasked: 'LGBX26M0••••8D2A', deviceId: '', deviceIdMasked: '—', deviceRiskId: '',
        riskStatus: '', reviewStatus: '待复核', systemJudgement: '待定', reviewHint: '设备 ID 缺失，未形成设备风险结论；正式处置待确认',
        npsMatch: '是', nssMatch: '是', durationSeconds: 190, messageCount: 2, avgMessageLength: 24,
        reviewedAt: '', reviewer: '', remark: '', province: '广东省', city: '广州市', region: '华南一区', district: '广佛小区'
      }
    ],
    // 本地完整演示历史，不发请求；它与上面的审核记录共同作为各次提交之前的候选历史。
    reviewRiskHistory: {
      source: 'EXEC-0914 脱敏 Mock 答卷历史',
      queryStatus: 'complete',
      records: [
        {
          answerId: 'RV-HIST-001-RECENT-DIFFERENT-MIS', pushId: 'PUSH-MOCK-202608-7108', questionnaireId: 'QNR-DEMO-MAINT-30D', mis: 'MIS-DEMO-OTHER',
          vin: 'VINMOCK0000000001', vinMasked: 'LGBH52E0••••8K3A', deviceId: 'DEVICE-MOCK-001-RECENT', deviceIdMasked: 'DVC-5D61••••B813',
          commentTime: '2026-08-12 14:06:10', historyState: 'submitted'
        },
        {
          answerId: 'RV-HIST-001-NINE-MONTHS', pushId: 'PUSH-MOCK-202512-6108', questionnaireId: 'QNR-DEMO-MAINT-30D', mis: 'MIS-DEMO-30D',
          vin: 'VINMOCK0000000001', vinMasked: 'LGBH52E0••••8K3A', deviceId: 'DEVICE-MOCK-001-PREVIOUS', deviceIdMasked: 'DVC-8E34••••C210',
          commentTime: '2025-12-02 09:18:32', historyState: 'submitted'
        },
        {
          answerId: 'RV-HIST-002-THIRTEEN-MONTHS', pushId: 'PUSH-MOCK-202508-6112', questionnaireId: 'QNR-DEMO-INSTORE-60D', mis: 'MIS-DEMO-60D',
          vin: 'VINMOCK0000000002', vinMasked: 'LGBT19E1••••7M8D', deviceId: 'DEVICE-MOCK-002-PREVIOUS', deviceIdMasked: 'DVC-3B82••••C104',
          commentTime: '2025-08-02 10:41:05', historyState: 'submitted'
        },
        {
          answerId: 'RV-HIST-003-DIFFERENT-MIS', pushId: 'PUSH-MOCK-202512-6101', questionnaireId: 'QNR-DEMO-DELIVERY-7D', mis: 'MIS-DEMO-30D',
          vin: 'VINMOCK0000000003', vinMasked: 'LGBN33B1••••4W6L', deviceId: 'DEVICE-MOCK-003-PREVIOUS', deviceIdMasked: 'DVC-4B39••••D318',
          commentTime: '2025-12-01 20:12:49', historyState: 'submitted'
        },
        {
          answerId: 'RV-HIST-004-SAME-DEVICE', pushId: 'PUSH-MOCK-202511-6095', questionnaireId: 'QNR-DEMO-MAINT-60D', mis: 'MIS-DEMO-60D',
          vin: 'VINMOCK0000000004', vinMasked: 'LGBM41A2••••5P8N', deviceId: 'DEVICE-MOCK-004-CURRENT', deviceIdMasked: 'DVC-3C88••••2D04',
          commentTime: '2025-11-30 18:22:17', historyState: 'submitted'
        },
        {
          answerId: 'RV-HIST-005-NINE-MONTHS', pushId: 'PUSH-MOCK-202512-6088', questionnaireId: 'QNR-DEMO-SERVICE-90D', mis: 'MIS-DEMO-90D',
          vin: 'VINMOCK0000000005', vinMasked: 'LGBS18D2••••9N2H', deviceId: 'DEVICE-MOCK-005-PREVIOUS', deviceIdMasked: 'DVC-6F20••••7E51',
          commentTime: '2025-12-02 10:18:09', historyState: 'submitted'
        },
        {
          answerId: 'RV-HIST-006-DIFFERENT-QUESTIONNAIRE', pushId: 'PUSH-MOCK-202512-6099', questionnaireId: 'QNR-DEMO-MAINT-30D', mis: 'MIS-DEMO-7D',
          vin: 'VINMOCK0000000006', vinMasked: 'LGBP24C1••••2R5V', deviceId: 'DEVICE-MOCK-006-PREVIOUS', deviceIdMasked: 'DVC-2D70••••1A29',
          commentTime: '2025-12-01 18:54:11', historyState: 'submitted'
        },
        {
          answerId: 'RV-HIST-007-DIFFERENT-VIN', pushId: 'PUSH-MOCK-202607-6076', questionnaireId: 'QNR-DEMO-DELIVERY-7D', mis: 'MIS-DEMO-7D',
          vin: 'VINMOCK0000000097', vinMasked: 'LGBX29M0••••7Q4T', deviceId: 'DEVICE-MOCK-007-CURRENT', deviceIdMasked: 'DVC-2E61•••B407',
          commentTime: '2026-07-27 11:28:36', historyState: 'submitted'
        }
      ]
    },
    questionnaireReport: {
      evidenceNotice: '车系、逻辑树与全部记录均为脱敏 Mock，仅演示页面交互，不连接真实报表或营销平台。',
      seriesOptions: [
        { value: 'MOCK-A01', label: '演示车系 A（Mock）' },
        { value: 'MOCK-B02', label: '演示车系 B（Mock）' },
        { value: 'MOCK-C03', label: '演示车系 C（Mock）' },
        { value: 'MOCK-EMPTY', label: '空数据车系（Mock）' }
      ],
      commentStatusOptions: ['已完成', '未点评'],
      misOptions: ['MIS-MOCK-7D', 'MIS-MOCK-30D', 'MIS-MOCK-90D'],
      logicTrees: [
        { id: 'TREE-MOCK-DELIVERY', label: '交车体验逻辑树（Mock）', level1Items: ['交车体验', '车辆讲解'] },
        { id: 'TREE-MOCK-SERVICE', label: '服务体验逻辑树（Mock）', level1Items: ['服务体验', '服务效率'] }
      ],
      records: [
        {
          id: 'QR-MOCK-001', planNo: 'TCS-PLAN-MOCK-0901', questionnaireId: 'QNR-MOCK-DELIVERY-7D', seriesCode: 'MOCK-A01',
          vin: 'VIN-MOCK-••••A101', pushId: 'PUSH-MOCK-REPORT-001', commentStatus: '已完成', mis: 'MIS-MOCK-7D',
          questionnaireTitle: '交车体验问卷（Mock）', planName: '九月交车回访（Mock）', commentMethod: '在线问卷',
          pushTime: '2026-09-02 09:00:00', commentTime: '2026-09-02 10:18:32', deliveryDate: '2026-08-26',
          dealerName: '广州演示专营店 A（Mock）', province: '广东省', city: '广州市', region: '华南一区', district: '广佛小区',
          level1Score: 9, level1Project: '交车体验', level2Project: '交付服务', level3Project: '服务沟通',
          level4Detail: '交车流程说明', level5Comment: '讲解清楚，交付顺畅（Mock）', annoyance: '无', lastOccurredAt: '2026-08-26',
          logicTreeId: 'TREE-MOCK-DELIVERY'
        },
        {
          id: 'QR-MOCK-002', planNo: 'TCS-PLAN-MOCK-0901', questionnaireId: 'QNR-MOCK-DELIVERY-7D', seriesCode: 'MOCK-B02',
          vin: 'VIN-MOCK-••••B202', pushId: 'PUSH-MOCK-REPORT-002', commentStatus: '已完成', mis: 'MIS-MOCK-7D',
          questionnaireTitle: '交车体验问卷（Mock）', planName: '九月交车回访（Mock）', commentMethod: '在线问卷',
          pushTime: '2026-09-02 09:00:00', commentTime: '2026-09-03 11:02:15', deliveryDate: '2026-08-27',
          dealerName: '深圳演示专营店 B（Mock）', province: '广东省', city: '深圳市', region: '华南一区', district: '深莞小区',
          level1Score: 7, level1Project: '车辆讲解', level2Project: '使用指导', level3Project: '功能讲解',
          level4Detail: '车机功能说明', level5Comment: '希望增加操作演示（Mock）', annoyance: '轻度', lastOccurredAt: '2026-08-27',
          logicTreeId: 'TREE-MOCK-DELIVERY'
        },
        {
          id: 'QR-MOCK-003', planNo: 'TCS-PLAN-MOCK-0902', questionnaireId: 'QNR-MOCK-SERVICE-30D', seriesCode: 'MOCK-A01',
          vin: 'VIN-MOCK-••••C303', pushId: 'PUSH-MOCK-REPORT-003', commentStatus: '已完成', mis: 'MIS-MOCK-30D',
          questionnaireTitle: '服务体验问卷（Mock）', planName: '九月服务回访（Mock）', commentMethod: '在线问卷',
          pushTime: '2026-09-04 10:00:00', commentTime: '2026-09-04 14:25:40', deliveryDate: '2026-08-05',
          dealerName: '杭州演示专营店 C（Mock）', province: '浙江省', city: '杭州市', region: '华东一区', district: '浙北小区',
          level1Score: 8, level1Project: '服务体验', level2Project: '到店服务', level3Project: '预约接待',
          level4Detail: '预约信息确认', level5Comment: '到店接待及时（Mock）', annoyance: '无', lastOccurredAt: '2026-09-01',
          logicTreeId: 'TREE-MOCK-SERVICE'
        },
        {
          id: 'QR-MOCK-004', planNo: 'TCS-PLAN-MOCK-0902', questionnaireId: 'QNR-MOCK-SERVICE-30D', seriesCode: 'MOCK-C03',
          vin: 'VIN-MOCK-••••D404', pushId: 'PUSH-MOCK-REPORT-004', commentStatus: '已完成', mis: 'MIS-MOCK-30D',
          questionnaireTitle: '服务体验问卷（Mock）', planName: '九月服务回访（Mock）', commentMethod: '在线问卷',
          pushTime: '2026-09-04 10:00:00', commentTime: '2026-09-05 15:06:21', deliveryDate: '2026-08-06',
          dealerName: '区域待映射演示专营店 D（Mock）', province: '', city: '', region: '', district: '',
          level1Score: 6, level1Project: '服务效率', level2Project: '维修服务', level3Project: '维修进度',
          level4Detail: '等待时间', level5Comment: '希望提前告知预计完成时间（Mock）', annoyance: '中度', lastOccurredAt: '2026-09-03',
          logicTreeId: 'TREE-MOCK-SERVICE'
        },
        {
          id: 'QR-MOCK-005', planNo: 'TCS-PLAN-MOCK-0903', questionnaireId: 'QNR-MOCK-SERVICE-90D', seriesCode: 'MOCK-B02',
          vin: 'VIN-MOCK-••••E505', pushId: 'PUSH-MOCK-REPORT-005', commentStatus: '未点评', mis: 'MIS-MOCK-90D',
          questionnaireTitle: '服务跟踪问卷（Mock）', planName: '九月服务跟踪（Mock）', commentMethod: '在线问卷',
          pushTime: '2026-09-06 09:30:00', commentTime: '', deliveryDate: '2026-06-08',
          dealerName: '南京演示专营店 E（Mock）', province: '江苏省', city: '南京市', region: '华东一区', district: '苏南小区',
          level1Score: '', level1Project: '', level2Project: '', level3Project: '', level4Detail: '', level5Comment: '', annoyance: '', lastOccurredAt: '',
          logicTreeId: 'TREE-MOCK-SERVICE'
        },
        {
          id: 'QR-MOCK-006', planNo: 'TCS-PLAN-MOCK-0903', questionnaireId: 'QNR-MOCK-SERVICE-90D', seriesCode: 'MOCK-C03',
          vin: 'VIN-MOCK-••••F606', pushId: 'PUSH-MOCK-REPORT-006', commentStatus: '已完成', mis: 'MIS-MOCK-90D',
          questionnaireTitle: '服务跟踪问卷（Mock）', planName: '九月服务跟踪（Mock）', commentMethod: '在线问卷',
          pushTime: '2026-09-06 09:30:00', commentTime: '2026-09-07 16:20:08', deliveryDate: '2026-06-09',
          dealerName: '成都演示专营店 F（Mock）', province: '四川省', city: '成都市', region: '西南一区', district: '川西小区',
          level1Score: 8, level1Project: '服务体验', level2Project: '服务跟踪', level3Project: '回访服务',
          level4Detail: '后续关怀', level5Comment: '问题得到跟进（Mock）', annoyance: '轻度', lastOccurredAt: '2026-09-05',
          logicTreeId: 'TREE-MOCK-SERVICE'
        }
      ]
    },
    interfaceDefinitions: [
      {
        id: 'initiation', functionId: 'F-04', name: '调查发起接口', direction: 'TQMP → TCS',
        status: '接口契约待确认', endpoint: '路径待确认',
        description: '保持原调查发起流程不变，仅评审两个新增标识字段的接收、保存与结果返回。',
        fields: [
          { name: 'MIS', type: '类型待确认', location: '请求新增 / 结果原值返回', required: '是否必填待确认', rule: 'TCS 仅存储、透传并原值返回，不解释业务语义', example: 'MIS-DEMO-30D（Mock 原值）' },
          { name: '第二标识字段', type: '名称与类型待确认', location: '请求 / 返回位置待确认', required: '待确认', rule: '不在原型中命名或定义枚举', example: '—' }
        ],
        pending: ['MIS 完整枚举与 30/60/90/180 天节点映射', '第二字段名称、类型与含义', '鉴权、幂等、超时与失败码']
      },
      {
        id: 'customer-result', functionId: 'F-05', name: '客户结果回传接口', direction: 'TCS → TQMP',
        status: '独立新接口 · 契约待确认', endpoint: '路径待确认',
        description: '调查完成后回传客户维度结果，并把调查发起时收到的 MIS 等标识原值返回。',
        fields: [
          { name: '调查任务标识', type: '待确认', location: '请求体', required: '待确认', rule: '关联原调查任务', example: 'SURVEY-DEMO-202609-01' },
          { name: 'VIN', type: '待确认', location: '请求体', required: '待确认', rule: '关联客户结果；脱敏示例仅用于原型', example: 'LGBH52E0••••8K3A' },
          { name: 'MIS', type: '原值类型待确认', location: '请求体', required: '随原请求', rule: '原值返回，不转换、不推导', example: 'MIS-DEMO-30D' },
          { name: '客户结果', type: '结构待确认', location: '请求体', required: '待确认', rule: '客户维度结果，与问题明细接口分离', example: 'Mock 结构' }
        ],
        pending: ['触发时点与字段清单', '鉴权、幂等、ACK、超时、失败码与重试']
      },
      {
        id: 'question-detail', functionId: 'F-06', name: '问题结果明细回传接口', direction: 'TCS → TQMP',
        status: '独立新接口 · 契约待确认', endpoint: '路径待确认',
        description: '逐题结果通过独立接口回传，不与客户结果强行复用旧接口。',
        fields: [
          { name: '客户结果关联键', type: '候选口径', location: '请求体', required: '待确认', rule: '问卷编号 + VIN 仅为原型候选，不作为已确认规则', example: 'TCS-SVY-DEMO + LGB…' },
          { name: '题目标识', type: '待确认', location: '明细项', required: '待确认', rule: '逐题结果定位', example: 'Q-DEMO-0001' },
          { name: '答案内容', type: '文本 / 多媒体结构待确认', location: '明细项', required: '待确认', rule: '支持题型能力范围待接口验证', example: 'Mock 答案' }
        ],
        pending: ['与客户结果的正式关联键', '两接口推送顺序', '分批/分页、ACK、失败重试与补偿']
      }
    ],
    returnTasks: [
      { id: 'RT-20260902-001', batchId: 'BATCH-C-0902-01', interfaceId: 'customer-result', interfaceName: '客户结果', associationKey: 'TCS-SVY-202609-0108 + VIN（候选）', status: '成功', recordCount: 120, attemptCount: 1, ack: 'ACK-DEMO-801', lastError: '', nextRetry: '—', updatedAt: '2026-09-02 10:26:18' },
      { id: 'RT-20260902-002', batchId: 'BATCH-Q-0902-01', interfaceId: 'question-detail', interfaceName: '问题明细', associationKey: 'TCS-SVY-202609-0108 + VIN（候选）', status: '失败', recordCount: 1680, attemptCount: 2, ack: '未收到（Mock）', lastError: '演示错误：下游超时；正式失败码待确认', nextRetry: '等待人工评审', updatedAt: '2026-09-02 10:28:42' },
      { id: 'RT-20260902-003', batchId: 'BATCH-C-0902-02', interfaceId: 'customer-result', interfaceName: '客户结果', associationKey: 'TCS-SVY-202609-0112 + VIN（候选）', status: '待发送', recordCount: 86, attemptCount: 0, ack: '—', lastError: '', nextRetry: '调度规则待确认', updatedAt: '2026-09-02 10:31:05' },
      { id: 'RT-20260902-004', batchId: 'BATCH-Q-0902-02', interfaceId: 'question-detail', interfaceName: '问题明细', associationKey: 'TCS-SVY-202609-0112 + VIN（候选）', status: '补偿评审中', recordCount: 904, attemptCount: 1, ack: 'ACK-DEMO-809（需对账）', lastError: '客户结果/问题明细一致性待核对', nextRetry: '不自动执行', updatedAt: '2026-09-02 10:35:27' }
    ],
    cutoverReview: {
      currentInterface: '旧结果接口（现状描述，接口名待核对）',
      targetInterfaces: ['客户结果回传接口', '问题结果明细回传接口'],
      confirmedCutoverAt: '',
      meetingTendency: '会议讨论倾向本期历史数据不迁移、不补推；尚不能作为最终实施规则。',
      pending: ['正式切点', '兼容期与灰度范围', '失败回退方案', '历史数据查询方式', '是否需要迁移或补推的最终确认']
    },
    performanceScenarios: [
      { id: 'Q1000', questionCount: 1000, label: '1000 题基础场景', mockBaseLatencyMs: 680, mockPayloadMB: 2.4, note: '仅用于演示结果版式，不是实测值。' },
      { id: 'Q2000', questionCount: 2000, label: '2000 题扩展场景', mockBaseLatencyMs: 1180, mockPayloadMB: 5.2, note: '仅用于演示结果版式，不是实测值。' },
      { id: 'Q3000', questionCount: 3000, label: '3000 题上限场景', mockBaseLatencyMs: 1760, mockPayloadMB: 8.1, note: '仅用于演示结果版式，不是实测值。' }
    ],
    // EXEC-0914 BEGIN: 按 TQMP 交车归月、完整18位码的独立 Mock；字段名不代表正式接口。
    monthlySamplingScenarios: (function () {
      var codes = {
        a1: 'MODEL0000000000001', a2: 'MODEL0000000000002',
        b1: 'MODEL0000000000003', missing: 'MODEL0000000000099'
      };
      function displayName(code) { return code === codes.a1 ? '轩逸' : code === codes.a2 ? '天籁' : code === codes.b1 ? 'NX8' : ''; }
      function scenario(id, name, description, schemeId, ratio, bound, salesBasis, vinPrefix) {
        return {
          id: id, name: name, description: description,
          input: { schemeId: schemeId, ratioPercent: ratio, lowerBound: bound, salesBasis: salesBasis, vehicles: [], salesStatistics: [], mockFieldContract: 'tqmpDeliveryDateMock 为 TQMP 交车日期的演示字段；samplingMonth 为该日期年月。正式接口键名未定。historyPushedMock/saleReturnSuccessMock/dataErrorMock 为资格演示字段。' },
          mockVinPrefix: vinPrefix
        };
      }
      function addCommunity(target, month, regionId, regionName, communityId, communityName, candidateGroups, salesRows) {
        candidateGroups.forEach(function (group) {
          for (var index = 0; index < group.count; index += 1) {
            target.input.vehicles.push({
              vin: 'MOCK' + target.mockVinPrefix + month.replace('-', '') + String(target.input.vehicles.length + 1).padStart(4, '0'),
              tqmpDeliveryDateMock: month + '-15', salesDate: month === '2026-08' ? '2026-07-12' : month + '-12', vehicleCode18: group.code,
              vehicleClassName: displayName(group.code), historyPushedMock: false, saleReturnSuccessMock: false, dataErrorMock: '',
              regionId: regionId, regionName: regionName, communityId: communityId, communityName: communityName,
              plannedPushDate: '2026-09-20'
            });
          }
        });
        // 销量独立传入；不从上方候选数组长度自动推导或补齐。
        salesRows.forEach(function (row) {
          target.input.salesStatistics.push({ samplingMonth: month, regionId: regionId, communityId: communityId, vehicleCode18: row.code, vehicleClassName: displayName(row.code), salesCount: row.salesCount });
        });
      }

      var mix = scenario(
        'MONTHLY-MIX-80-20', '交车归月与三码独立：8 / 8 / 4',
        '7月、8月同一小区各有100台合格候选和100台独立销量，C=20%、Lwr=20。7月三码销量20/40/40，8月40/40/20；8月交车车辆的销售日期为7月、计划推送为9月，仍归8月。完整18位码各自独立，车型名称仅为显示名。另含销退和错误输入各1台；历史已推送车辆仍入候选。',
        'MOCK-SCHEME-MONTHLY-MIX', 20, 20,
        'Mock 独立销量统计：仅此例明确假设销量与已过滤候选量相等，每月100台；不代表正式销量口径。', 'MIX'
      );
      addCommunity(mix, '2026-07', 'REG-MOCK-E', '演示东区', 'COM-MOCK-SAME', '同一小区', [{ code: codes.a1, count: 20 }, { code: codes.a2, count: 40 }, { code: codes.b1, count: 40 }], [{ code: codes.a1, salesCount: 20 }, { code: codes.a2, salesCount: 40 }, { code: codes.b1, salesCount: 40 }]);
      addCommunity(mix, '2026-08', 'REG-MOCK-E', '演示东区', 'COM-MOCK-SAME', '同一小区', [{ code: codes.a1, count: 40 }, { code: codes.a2, count: 40 }, { code: codes.b1, count: 20 }], [{ code: codes.a1, salesCount: 40 }, { code: codes.a2, salesCount: 40 }, { code: codes.b1, salesCount: 20 }]);
      mix.input.vehicles[100].historyPushedMock = true;
      mix.input.vehicles.push(Object.assign({}, mix.input.vehicles[100], { vin: 'MOCK-MIX-RETURNED', saleReturnSuccessMock: true, historyPushedMock: false }));
      mix.input.vehicles.push(Object.assign({}, mix.input.vehicles[100], { vin: 'MOCK-MIX-DATA-ERROR', dataErrorMock: '必填联系信息校验失败', historyPushedMock: false }));

      var branches = scenario(
        'MONTHLY-CORE-BRANCHES', '多月原算法：C优、停止、回补及允许超配',
        'C=50%、Lwr=10。7月东区候选2/98，南区24/12/2；8月东区5/20/100，南区22/22/22/18/12。同名小区分属不同大区，不得合并；级别只占一个类别以专门核对原内核。',
        'MOCK-SCHEME-MONTHLY-CORE', 50, 10,
        'Mock 独立销量统计：本例各行另给销量，为对应候选数量的两倍；统计与候选不是同一字段，单级别占比为100%。正式销量范围待确认。', 'COR'
      );
      [
        ['2026-07', 'REG-MOCK-E', '演示东区', 'COM-MOCK-SAME', '同名小区', 2, 4],
        ['2026-07', 'REG-MOCK-E', '演示东区', 'COM-E02', '东区第二小区', 98, 196],
        ['2026-07', 'REG-MOCK-S', '演示南区', 'COM-MOCK-SAME', '同名小区', 24, 48],
        ['2026-07', 'REG-MOCK-S', '演示南区', 'COM-S02', '南区第二小区', 12, 24],
        ['2026-07', 'REG-MOCK-S', '演示南区', 'COM-S03', '南区第三小区', 2, 4],
        ['2026-08', 'REG-MOCK-E', '演示东区', 'COM-MOCK-SAME', '同名小区', 5, 10],
        ['2026-08', 'REG-MOCK-E', '演示东区', 'COM-E02', '东区第二小区', 20, 40],
        ['2026-08', 'REG-MOCK-E', '演示东区', 'COM-E03', '东区第三小区', 100, 200],
        ['2026-08', 'REG-MOCK-S', '演示南区', 'COM-MOCK-SAME', '同名小区', 22, 44],
        ['2026-08', 'REG-MOCK-S', '演示南区', 'COM-S02', '南区第二小区', 22, 44],
        ['2026-08', 'REG-MOCK-S', '演示南区', 'COM-S03', '南区第三小区', 22, 44],
        ['2026-08', 'REG-MOCK-S', '演示南区', 'COM-S04', '南区第四小区', 18, 36],
        ['2026-08', 'REG-MOCK-S', '演示南区', 'COM-S05', '南区第五小区', 12, 24]
      ].forEach(function (row) {
        addCommunity(branches, row[0], row[1], row[2], row[3], row[4], [{ code: codes.a1, count: row[5] }], [{ code: codes.a1, salesCount: row[6] }]);
      });

      var pending = scenario(
        'MONTHLY-PENDING-CASES', '取整差额与缺码、销量、候选边界',
        '同月各小区分别演示理论2.5/2.5四舍五入为3/3，差额+1；以及18位码缺失、零销量分母、车型候选不足、缺车型销量和交车日期缺失。差额与异常未决，不自动调差、跨车型或跨月借额。',
        'MOCK-SCHEME-MONTHLY-PENDING', 50, 1,
        'Mock 独立销量统计：候选已经过资格过滤，销量统计另行输入。本例故意含不完整/异常行以展示待确认状态，不作正式异常政策。', 'PEN'
      );
      addCommunity(pending, '2026-07', 'REG-MOCK-P', '边界演示大区', 'COM-FRACTION', '小数名额小区', [{ code: codes.a1, count: 5 }, { code: codes.b1, count: 5 }], [{ code: codes.a1, salesCount: 50 }, { code: codes.b1, salesCount: 50 }]);
      addCommunity(pending, '2026-07', 'REG-MOCK-P', '边界演示大区', 'COM-MAPPING', '18位码缺失小区', [{ code: codes.a1, count: 9 }, { code: '', count: 1 }], [{ code: codes.a1, salesCount: 10 }]);
      addCommunity(pending, '2026-07', 'REG-MOCK-P', '边界演示大区', 'COM-ZERO', '零分母小区', [{ code: codes.a1, count: 2 }, { code: codes.b1, count: 2 }], [{ code: codes.a1, salesCount: 0 }, { code: codes.b1, salesCount: 0 }]);
      addCommunity(pending, '2026-07', 'REG-MOCK-P', '边界演示大区', 'COM-SHORTAGE', '车型候选不足小区', [{ code: codes.a1, count: 1 }, { code: codes.b1, count: 9 }], [{ code: codes.a1, salesCount: 8 }, { code: codes.b1, salesCount: 2 }]);
      addCommunity(pending, '2026-07', 'REG-MOCK-P', '边界演示大区', 'COM-SALES-MISSING', '缺车型销量小区', [{ code: codes.a1, count: 5 }, { code: codes.b1, count: 5 }], [{ code: codes.a1, salesCount: 5 }]);
      pending.input.vehicles.push(Object.assign({}, pending.input.vehicles[0], { vin: 'MOCK-DELIVERY-MISSING', tqmpDeliveryDateMock: '', salesDate: '2026-07-15', plannedPushDate: '2026-09-20' }));
      return [mix, branches, pending];
    })(),
    monthlySamplingByApproval: {
      'TCS-AP-20260902-001': 'MONTHLY-MIX-80-20',
      'TCS-AP-20260901-003': 'MONTHLY-PENDING-CASES',
      'TCS-AP-20260828-006': 'MONTHLY-CORE-BRANCHES'
    },
    // EXEC-0914 END
    state: {
      planDraft: {
        name: '2026年首保回访调查',
        code: 'TCS-PLAN-202609-DEMO',
        samplingEnabled: true,
        ratio: 35,
        lowerBound: 20,
        pushMode: 'fixed',
        baseDays: 75,
        weekday: '周三',
        time: '10:00',
        randomTime: '',
        randomDays: 15
      },
      reviewDecisions: {},
      taskActions: {}
    }
  };
})();
