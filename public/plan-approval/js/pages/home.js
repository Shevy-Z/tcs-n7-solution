(function () {
  'use strict';

  window.Pages = window.Pages || {};

  function render() {
    return [
      '<div class="hub-page">',
        '<header class="hub-header">',
          '<div class="hub-wordmark"><strong>TCS</strong><span>需求评审资料</span></div>',
          '<span class="hub-header-note">静态评审入口</span>',
        '</header>',
        '<div class="hub-content">',
          '<section class="hub-intro" aria-labelledby="hub-title">',
            '<h1 id="hub-title">需求与原型，从这里开始</h1>',
            '<p>按资料类型进入。原有业务原型和页面链接保持可用。</p>',
          '</section>',
          '<nav class="hub-grid" aria-label="评审资料入口">',
            '<article class="hub-card hub-card--list">',
              '<h2><a href="docs/function-list-current-20260914.html">功能清单 <span aria-hidden="true">↗</span></a></h2>',
              '<p>查看本期前后端拆分及今天新增的功能项。</p>',
              '<div class="hub-links"><a href="docs/requirements.html#section-5">原 15 项来源表</a><a href="docs/requirements.html#current-0914">最新规则说明</a></div>',
              '<small>实施拆分与来源记录分开，未确认项不当作已开发。</small>',
            '</article>',
            '<article class="hub-card hub-card--prototype">',
              '<h2><a href="#review">原型 <span aria-hidden="true">↗</span></a></h2>',
              '<p>进入现有 TCS 页面，查看本期功能在真实页面结构中的位置。</p>',
              '<div class="hub-links"><a href="#review">人工审核点评</a><a href="#plan">调查方案审批</a><a href="#sampling">推送数据</a><a href="#questionnaireReport">问卷报表明细</a><a href="docs/logic-tree/index.html">逻辑树管理</a></div>',
            '</article>',
            '<article class="hub-card hub-card--algorithm">',
              '<h2><a href="docs/algorithm.html">算法 <span aria-hidden="true">↗</span></a></h2>',
              '<p>按步骤阅读小区调剂与车型名额计算，公式附中文解释。</p>',
            '</article>',
            '<article class="hub-card hub-card--examples">',
              '<h2><a href="docs/examples/index.html">示例 <span aria-hidden="true">↗</span></a></h2>',
              '<p>用跨三个月、三个小区和三种车型的案例理解不同分支。</p>',
            '</article>',
            '<article class="hub-card hub-card--flows">',
              '<h2>流程</h2>',
              '<p>在一张图中查看完整判断与跨系统连接。</p>',
              '<div class="hub-links"><a href="docs/sampling-flow/index.html">抽样调剂流程 <span aria-hidden="true">↗</span></a><a href="docs/points-flow/index.html">积分发放流程 <span aria-hidden="true">↗</span></a></div>',
            '</article>',
          '</nav>',
          '<p class="hub-boundary">以上为离线评审资料，不代表真实问卷推送或积分发放已经执行。</p>',
        '</div>',
      '</div>'
    ].join('');
  }

  window.Pages.home = { render: render };
})();
