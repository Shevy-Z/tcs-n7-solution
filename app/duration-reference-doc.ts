// Source: answer-statistics product documentation drawer.
export const durationReferenceDocHtml = `<div class="drawer-head"><div><span class="doc-kicker">PRODUCT BRIEF · V1.6</span><h2>答题统计 · 产品说明</h2></div><button class="close-button" id="closeDrawer" aria-label="关闭">×</button></div>
      <div class="doc-primary-tabs" role="tablist" aria-label="产品说明文档分类">
        <button class="active" data-doc-tab="page" role="tab" aria-selected="true"><span>页面说明文档</span><small>功能、操作与字段口径</small></button>
        <button data-doc-tab="rules" role="tab" aria-selected="false"><span>时长规则说明</span><small>计算、分位与补偿公式</small></button>
      </div>
      <div class="doc-tab-panel active" data-doc-panel="page" role="tabpanel" aria-label="页面说明文档">
        <div class="drawer-nav"><button class="active" data-section="page-overview">功能概述</button><button data-section="page-operation">页面操作</button><button data-section="page-rule">时长方案</button><button data-section="page-fields">字段口径</button></div>
        <div class="drawer-content">
          <section class="doc-section" id="page-overview">
            <h3>1. 功能概述</h3>
            <p>答题统计用于从问卷、车型和问卷类型三个维度，监控答卷规模、作答效率与异常质量，帮助审核人员快速定位需要复核的样本。</p>
            <div class="callout blue"><strong>页面定位</strong><p>页面集中展示品牌级核心指标及三个业务维度的明细列表，并提供有效分位配置入口。</p></div>
            <div class="doc-scope-grid"><div><span>01</span><strong>总览指标</strong><small>查看答题量、答卷量、均值、标准差和有效时长。</small></div><div><span>02</span><strong>分位配置</strong><small>配置题目级上分位与答卷级下分位阈值。</small></div><div><span>03</span><strong>维度明细</strong><small>按问卷、车型、问卷类型定位异常数据。</small></div></div>
          </section>
          <section class="doc-section" id="page-operation">
            <h3>2. 页面操作说明</h3>
            <h4>查询与查看</h4>
            <ol><li>选择调研项目、数据周期和问卷状态，点击「查询」刷新当前统计结果。</li><li>在关键指标区查看全品牌答题与答卷的数量、均值、标准差和有效时长。</li><li>通过答题与答卷有效分位配置调整时长判断阈值，再切换问卷、车型或问卷类型查看明细。</li><li>使用列表搜索、筛选和分页定位目标记录；需要留存时可导出当前报表。</li></ol>
            <h4>分位配置</h4>
            <ul><li>点击「答题有效分位」设置题目级分位上限，默认 P ≤ 95.00%。</li><li>点击「答卷有效分位」设置答卷级分位下限，默认 P ≥ 5.00%。</li><li>确认后配置保存在当前浏览器，并同步更新按钮中的当前值。</li></ul>
          </section>
          <section class="doc-section" id="page-rule">
            <h3>3. 人工审核 · 时长判断方案</h3>
            <p>实际答题时长通常呈右偏长尾，均值与标准差容易受极端值影响。生产判定建议以<strong>同分组经验百分位</strong>为主，正态 Z-score 作为历史兼容与指标解释口径。</p>
            <div class="formula-card"><span>建议主规则</span><strong>异常 = t &lt; P05 或 t &gt; P95</strong><small>t 为有效作答时长；阈值按问卷版本 × 渠道等同质分组计算。</small></div>
            <h4>处理流程</h4>
            <div class="steps"><div><b>1</b><span><strong>数据清洗</strong><small>排除预览、超时中断与无效记录</small></span></div><i></i><div><b>2</b><span><strong>分组计算</strong><small>计算经验 P05 / P95 阈值</small></span></div><i></i><div><b>3</b><span><strong>生成标记</strong><small>输出过短、正常、过长及原因</small></span></div></div>
            <div class="callout amber"><strong>小样本保护</strong><p>分组有效样本少于 200 时回退到同问卷类型近 90 天基线；少于 50 时仅提示，不自动判定异常。</p></div>
            <h4>落地改动</h4>
            <ul><li>离线任务：重算分组阈值，并保留规则版本与样本窗口。</li><li>审核接口：返回状态、上下阈值、分位值和判定原因。</li><li>页面列表：展示异常类型与规则状态，支持筛选并跳转人工审核。</li><li>上线验收：回放历史数据，对比人工命中率、误报率和异常覆盖率。</li></ul>
          </section>
          <section class="doc-section" id="page-fields">
            <h3>4. 字段与指标口径</h3>
            <p>以下公式均在当前筛选条件和同一统计分组内计算。题目级以有效作答记录为样本，答卷级以完成问卷的推定时长为样本。</p>

            <h4>4.1 数量指标</h4>
            <div class="doc-formula-stack">
              <div><span>答题总量</span><strong>n<sub>题</sub> = ∑<sub>r∈R题</sub> 𝟙(r 为有效题目作答记录)</strong><small>R题为筛选范围内全部题目作答记录；𝟙(条件)成立取 1，否则取 0。</small></div>
              <div><span>答卷总量</span><strong>n<sub>卷</sub> = ∑<sub>q∈R卷</sub> 𝟙(q 已完成且有效)</strong><small>预览、未提交、缺少开始或提交时间、无效样本不计入。</small></div>
            </div>

            <h4>4.2 平均时长</h4>
            <div class="doc-formula-grid">
              <div class="doc-formula"><span>平均答题时长</span><strong>μ<sub>题</sub> = (1 / n<sub>题</sub>) · ∑<sub>j=1</sub><sup>n题</sup> x<sub>j</sub></strong><small>xⱼ 为第 j 条有效题目作答时长，单位为秒。</small></div>
              <div class="doc-formula"><span>平均答卷时长</span><strong>μ<sub>卷</sub> = (1 / n<sub>卷</sub>) · ∑<sub>k=1</sub><sup>n卷</sup> y<sub>k</sub></strong><small>yₖ 为第 k 份完成答卷的推定时长，统一换算为秒或分钟。</small></div>
            </div>

            <h4>4.3 标准差</h4>
            <div class="doc-formula-grid">
              <div class="doc-formula"><span>答题标准差</span><strong>σ<sub>题</sub> = √[(1 / n<sub>题</sub>) · ∑(x<sub>j</sub> − μ<sub>题</sub>)²]</strong><small>反映单题作答时长的离散程度。</small></div>
              <div class="doc-formula"><span>答卷标准差</span><strong>σ<sub>卷</sub> = √[(1 / n<sub>卷</sub>) · ∑(y<sub>k</sub> − μ<sub>卷</sub>)²]</strong><small>反映整份答卷推定时长的离散程度。</small></div>
            </div>
            <div class="callout blue"><strong>总体标准差口径</strong><p>页面按当前分组的全量有效数据计算，因此分母使用 n。若抽样估计总体，应将分母改为 n − 1。</p></div>

            <h4>4.4 有效答题时长</h4>
            <p>生产规则优先采用适配右偏分布的经验百分位。默认上限为第 95 百分位，超过上限的超长单题按原业务方案使用 μ题 / 3 替代。</p>
            <div class="doc-formula-stack">
              <div><span>经验百分位上限</span><strong>T<sub>题,95</sub> = Q<sub>0.95</sub>({x₁, x₂, …, x<sub>n题</sub>})</strong><small>Qₚ 表示样本排序后的第 p 分位数；配置值变化时将 0.95 替换为 p题。</small></div>
              <div><span>正态兼容口径</span><strong>T<sub>题,p</sub> = μ<sub>题</sub> + σ<sub>题</sub> · Φ<sup>−1</sup>(p<sub>题</sub>)</strong><small>仅在沿用正态假设时使用；Φ⁻¹ 为标准正态分布的反函数。</small></div>
              <div><span>单题有效时长</span><strong>x<sub>i</sub><sup>*</sup> = { x<sub>i</sub>，P<sub>题,i</sub> &lt; p<sub>题</sub>； μ<sub>题</sub>/3，P<sub>题,i</sub> ≥ p<sub>题</sub> }</strong><small>P题,i = Φ[(xᵢ − μ题) / σ题]；默认 p题 = 95%。</small></div>
            </div>

            <h4>4.5 有效答卷时长与审核判断</h4>
            <div class="doc-formula-stack">
              <div><span>单份答卷推定时长</span><strong>y<sub>k</sub> = ∑<sub>i=1</sub><sup>mₖ</sup> x<sub>k,i</sub><sup>*</sup></strong><small>mₖ 为第 k 份答卷包含的题目数；若页面以分钟展示，则再除以 60。</small></div>
              <div><span>答卷经验分位下限</span><strong>T<sub>卷,05</sub> = Q<sub>0.05</sub>({y₁, y₂, …, y<sub>n卷</sub>})</strong><small>默认取第 5 百分位；配置值变化时将 0.05 替换为 p卷。</small></div>
              <div><span>答卷分位</span><strong>Z<sub>卷,k</sub> = (y<sub>k</sub> − μ<sub>卷</sub>) / σ<sub>卷</sub>；P<sub>卷,k</sub> = Φ(Z<sub>卷,k</sub>)</strong><small>正态兼容口径下，P卷表示该答卷在参考分布中的左侧累计分位。</small></div>
              <div><span>异常判定</span><strong>异常<sub>k</sub> = 𝟙(P<sub>卷,k</sub> ≤ p<sub>卷</sub>)</strong><small>默认 p卷 = 5%；经验百分位方案等价写为 𝟙(yₖ ≤ T卷,05)。</small></div>
            </div>

            <h4>4.6 异常率与人工审核</h4>
            <div class="doc-formula wide"><span>答卷时长异常率</span><strong>异常率 = (∑<sub>k=1</sub><sup>n卷</sup> 异常<sub>k</sub> / n<sub>卷</sub>) × 100%</strong><small>分母仅包含满足当前筛选条件的有效完成答卷。</small></div>
            <dl class="field-list"><div><dt>正常</dt><dd>P卷高于配置下限，保留正常状态。</dd></div><div><dt>异常</dt><dd>P卷不高于配置下限，标记为答题过快或疑似乱答，并进入人工审核。</dd></div><div><dt>待定</dt><dd>样本不足或 σ = 0，无法稳定计算分位时不自动判异常。</dd></div></dl>

            <div class="callout amber"><strong>计算注意事项</strong><p>所有时长必须先统一单位；同一指标应按车型、问卷版本等同质分组计算。实际数据明显右偏时使用经验 Qₚ，不应直接用 μ ± zσ 替代。</p></div>
            <p class="doc-note">页面说明版本：V1.6 · 更新时间：2026-10-23</p>
          </section>
        </div>
      </div>
      <div class="doc-tab-panel" data-doc-panel="rules" role="tabpanel" aria-label="时长规则说明">
  <div class="drawer-nav"><button class="active" data-section="overview">功能概述</button><button data-section="rule">题目时长</button><button data-section="percentile">分位解释</button><button data-section="answer-rule">答卷审核</button><button data-section="incremental">补偿计算</button><button data-section="fields">字段口径</button></div>
  <div class="drawer-content">
    <section class="doc-section" id="overview">
      <h3>1. 功能概述</h3>
      <p>本模块用于解释答题统计页面中题目级、答卷级时长指标的来源，以及异常答卷进入人工审核的判断过程。统计分别以<strong>车型下的题目作答记录</strong>和<strong>车型下的完整问卷记录</strong>为口径。</p>
      <div class="doc-scope-grid"><div><span>01</span><strong>题目级推定</strong><small>识别超长单题，计算每份答卷的推定答题时长。</small></div><div><span>02</span><strong>答卷级审核</strong><small>识别过快或疑似乱答答卷，进入人工审核。</small></div><div><span>03</span><strong>增量补偿</strong><small>以旧统计量和新增样本滚动更新均值、标准差及分位。</small></div></div>
      <h4>页面入口</h4>
      <ul><li>「答题有效分位」配置题目级分位上限，默认 <strong>P ≤ 95.00%</strong>。</li><li>「答卷有效分位」配置答卷级分位下限，默认 <strong>P ≥ 5.00%</strong>。</li><li>问卷、车型、问卷类型三个列表展示 n、μ、σ 及有效时长结果。</li></ul>
      <div class="callout amber"><strong>口径关系说明</strong><p>四张原图采用均值、标准差、Z 值和正态分布函数 Φ(z) 计算分位。实际答题时长若呈明显右偏长尾，生产判定应优先采用同分组的经验百分位；Z-score 方案作为指标推导和历史兼容口径保留，避免把“正态假设”误当成业务数据的必然分布。</p></div>
    </section>
    <section class="doc-section" id="rule">
      <h3>2. 第一步：推定用户答题时长</h3>
      <p>统计口径为<strong>题目维度</strong>。针对某一车型下所有问卷，收集实际单题作答时长集合 <code>{x₁, x₂, …, xₙ}</code>，其中 n 为答题记录数。</p>
      <div class="doc-step-list"><div><b>1</b><p><strong>准备样本</strong><small>剔除预览、未提交、无开始时间等无效记录；按车型及题目口径聚合。</small></p></div><div><b>2</b><p><strong>计算题目均值</strong><small>得到该车型下所有相关题目的平均答题时长 μ题。</small></p></div><div><b>3</b><p><strong>计算题目标准差</strong><small>得到 σ题，作为后续 Z 值与分位 P题的计算依据。</small></p></div></div>
      <div class="doc-formula-grid"><div class="doc-formula"><span>题目平均时长</span><strong>μ<sub>题</sub> = 1/n<sub>题</sub> · ∑ x<sub>j</sub></strong><small>j = 1 … n题</small></div><div class="doc-formula"><span>题目标准差</span><strong>σ<sub>题</sub> = √[1/n<sub>题</sub> · ∑(x<sub>i</sub> − μ<sub>题</sub>)²]</strong><small>总体标准差口径</small></div></div>
      <h4>单题分位与替代</h4>
      <p>对某 VIN 的每次作答时长 xᵢ，计算 Z题及 P题。当 P题达到配置的上分位（默认 95%）时，图示原口径将该超长记录从有效统计中剔除，并以 <strong>1/3 μ题</strong>补偿替代。</p>
      <div class="doc-formula-grid"><div class="doc-formula"><span>标准化</span><strong>Z<sub>题</sub> = (x<sub>i</sub> − μ<sub>题</sub>) / σ<sub>题</sub></strong></div><div class="doc-formula"><span>题目分位</span><strong>P<sub>题</sub> = Φ(Z<sub>题</sub>)</strong></div></div>
      <div class="logic-chain"><span>若 P题 &lt; P上限<br><b>保留 xᵢ</b></span><i>＋</i><span>若 P题 ≥ P上限<br><b>替换为 μ题 / 3</b></span><i>＝</i><span>汇总并换算分钟<br><b>推定时长 y</b></span></div>
      <div class="callout amber"><strong>需要业务确认</strong><p>“超长记录以 1/3 μ题替代”来自原图规则，会明显压低推定时长。正式上线前建议通过历史回放确认替代系数，或改为截尾值 P95 / 温莎化处理。</p></div>
    </section>
    <section class="doc-section" id="percentile">
      <h3>3. Φ(z) 与分位的含义</h3>
      <p>标准正态曲线下总面积为 1。Φ(z) 表示从负无穷到当前 z 值的<strong>左侧累计面积</strong>，也就是当前记录在参考分布中的累计分位。</p>
      <div class="curve-card">
        <svg viewBox="0 0 520 210" role="img" aria-label="标准正态分布累计分位示意图">
          <defs><linearGradient id="cdfShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e59a76" stop-opacity=".42"/><stop offset="1" stop-color="#e59a76" stop-opacity=".08"/></linearGradient></defs>
          <path d="M18 178 C76 177 112 165 146 133 C178 101 192 55 250 30 L250 178Z" fill="url(#cdfShade)"/>
          <path d="M18 178 C96 177 126 152 166 108 C208 62 226 25 273 18 C320 25 338 62 380 108 C420 152 450 177 505 178" fill="none" stroke="#6556d9" stroke-width="3"/>
          <line x1="18" y1="178" x2="508" y2="178" stroke="#7e8798"/><line x1="200" y1="72" x2="200" y2="184" stroke="#c46643" stroke-dasharray="5 4"/>
          <text x="185" y="201">z = −1</text><text x="264" y="201">0</text><text x="45" y="48">Φ(z) = 左侧面积</text><text x="45" y="67">z = −1 时约为 0.1587</text>
        </svg>
      </div>
      <div class="doc-formula wide"><span>标准正态累计分布函数</span><strong>Φ(z) = 1/2 [1 + erf(z / √2)] = ∫<sub>−∞</sub><sup>z</sup> (1 / √2π) e<sup>−t²/2</sup> dt</strong></div>
      <dl class="field-list"><div><dt>z = 0</dt><dd>位于均值，累计分位为 50%。</dd></div><div><dt>z = −1</dt><dd>低于均值一个标准差，左侧面积约为 15.87%。</dd></div><div><dt>z 越大</dt><dd>记录位于分布更靠右的位置，P 越接近 100%。</dd></div></dl>
    </section>
    <section class="doc-section" id="answer-rule">
      <h3>4. 第二步：标识答卷异常</h3>
      <p>统计口径切换为<strong>问卷维度</strong>。针对同一车型下所有已回答问卷，使用第一步得到的推定答题时长集合 <code>{y₁, y₂, …, yₙ}</code>，其中 n 为完成答卷数。</p>
      <div class="doc-step-list"><div><b>1</b><p><strong>计算答卷均值 μ卷</strong><small>统计同车型已完成问卷的推定答题时长。</small></p></div><div><b>2</b><p><strong>计算答卷标准差 σ卷</strong><small>描述完整答卷时长的离散程度。</small></p></div><div><b>3</b><p><strong>计算 P卷并审核</strong><small>识别分布左尾的过快答卷或疑似乱答记录。</small></p></div></div>
      <div class="doc-formula-grid"><div class="doc-formula"><span>答卷平均时长</span><strong>μ<sub>卷</sub> = 1/n<sub>卷</sub> · ∑ y<sub>j</sub></strong></div><div class="doc-formula"><span>答卷标准差</span><strong>σ<sub>卷</sub> = √[1/n<sub>卷</sub> · ∑(y<sub>i</sub> − μ<sub>卷</sub>)²]</strong></div><div class="doc-formula"><span>答卷 Z 值</span><strong>Z<sub>卷</sub> = (y<sub>i</sub> − μ<sub>卷</sub>) / σ<sub>卷</sub></strong></div><div class="doc-formula"><span>答卷分位</span><strong>P<sub>卷</sub> = Φ(Z<sub>卷</sub>)</strong></div></div>
      <div class="formula-card"><span>默认审核规则</span><strong>P<sub>卷</sub> ≤ 5.00% → 异常回答</strong><small>异常原因：答题过快或疑似乱回答；进入人工审核表单并高亮展示。</small></div>
      <h4>审核输出</h4>
      <table class="doc-table"><thead><tr><th>结果</th><th>条件</th><th>页面处理</th></tr></thead><tbody><tr><td><span class="doc-status danger">异常</span></td><td>P卷 ≤ 配置下限</td><td>高亮并进入人工审核</td></tr><tr><td><span class="doc-status success">正常</span></td><td>P卷 &gt; 配置下限</td><td>保留正常状态</td></tr><tr><td><span class="doc-status muted">待定</span></td><td>样本不足或 σ = 0</td><td>不自动判定，提示复核</td></tr></tbody></table>
    </section>
    <section class="doc-section" id="incremental">
      <h3>5. 历史统计量的补偿计算</h3>
      <p>历史数据量较大时，无需每新增一条记录就全量重算。系统可使用旧样本量、旧均值、旧标准差和新增数据，精确滚动更新最新统计量；该计算是数学等价更新，并非近似。</p>
      <div class="increment-inputs"><span><b>旧统计量</b>n旧、μ旧、σ旧</span><i>＋</i><span><b>新增记录</b>x新</span><i>→</i><span><b>新统计量</b>n新、μ新、σ新、Z新、P新</span></div>
      <div class="doc-formula-stack"><div><span>新的样本量</span><strong>n<sub>新</sub> = n<sub>旧</sub> + 1</strong></div><div><span>新的均值</span><strong>μ<sub>新</sub> = (n<sub>旧</sub> μ<sub>旧</sub> + x<sub>新</sub>) / n<sub>新</sub></strong></div><div><span>新的标准差</span><strong>σ<sub>新</sub> = √{[n<sub>旧</sub>σ<sub>旧</sub>² + (n<sub>旧</sub>/n<sub>新</sub>)(x<sub>新</sub>−μ<sub>旧</sub>)²] / n<sub>新</sub>}</strong></div><div><span>新的 Z 值</span><strong>Z<sub>新</sub> = (x<sub>新</sub> − μ<sub>新</sub>) / σ<sub>新</sub></strong></div><div><span>新的 P 值</span><strong>P<sub>新</sub> = Φ(Z<sub>新</sub>)</strong></div></div>
      <div class="callout blue"><strong>实现要求</strong><p>每次更新必须保存样本量、均值、标准差、规则版本和更新时间；按车型 × 问卷版本隔离统计状态。并发写入时使用原子更新或版本锁，防止样本量与均值错配。</p></div>
    </section>
    <section class="doc-section" id="fields">
      <h3>6. 字段与配置口径</h3>
      <table class="doc-table"><thead><tr><th>字段</th><th>含义</th><th>单位/默认值</th></tr></thead><tbody><tr><td>xᵢ</td><td>某 VIN 的单次题目实际作答时长</td><td>秒</td></tr><tr><td>yᵢ</td><td>完成异常替代后的单份问卷推定时长</td><td>分钟</td></tr><tr><td>n题 / n卷</td><td>答题记录数 / 完成答卷数</td><td>条</td></tr><tr><td>μ题 / σ题</td><td>题目级平均时长 / 标准差</td><td>秒</td></tr><tr><td>μ卷 / σ卷</td><td>答卷级平均时长 / 标准差</td><td>分钟</td></tr><tr><td>P题上限</td><td>题目超长记录的分位阈值</td><td>95.00%</td></tr><tr><td>P卷下限</td><td>过快答卷的审核阈值</td><td>5.00%</td></tr></tbody></table>
      <h4>边界与降级策略</h4>
      <ul><li>σ = 0 时不可计算 Z 值，记录进入“待定”，不自动判断异常。</li><li>有效样本少于 200 时回退至同问卷类型近 90 天基线；少于 50 时仅提示。</li><li>缺失、负值、未完成和超时中断记录不进入统计样本。</li><li>阈值修改后记录规则版本，历史结果不静默覆盖，支持重新回放。</li></ul>
      <p class="doc-note">文档版本：V1.4 · 更新时间：2026-10-22 · 负责人：数据产品组</p>
    </section>
  </div>

      </div>`;
