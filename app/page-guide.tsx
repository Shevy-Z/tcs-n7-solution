"use client";

import { useState } from "react";

type GuideNote = { title: string; target: string; details: { label: string; text: string }[] };

const guides: Record<"survey" | "review", { title: string; notes: GuideNote[] }> = {
  survey: {
    title: "问卷报表明细 · 说明",
    notes: [
      { title: "选择车系后查询", target: "[data-guide='seriesCode']", details: [{ label: "交互说明", text: "可选择一个或多个车系，再按其他条件查询。列表和导出使用同一份查询结果。" }] },
      { title: "门店与区域查询", target: "[data-guide='region']", details: [
        { label: "交互说明", text: "门店、省、市、大区、小区与其他筛选条件取交集。查询、重置、列表和导出使用同一筛选结果。" },
        { label: "数据来源", text: "门店名称沿用“专营店名称”字段；省、市、大区、小区沿用明细列。" },
      ] },
      { title: "区域明细与逻辑树", target: "#survey-logic-tree", details: [
        { label: "判断规则", text: "选择逻辑树后显示对应的 L1 节点，并立即按所选逻辑树更新列表；选择“全部逻辑树”显示全部记录。" },
        { label: "数据来源", text: "车系、逻辑树和记录均为脱敏演示数据，页面不连接真实报表。" },
      ] },
      { title: "导出当前结果", target: "#detail-export", details: [{ label: "交互说明", text: "按当前逻辑树、车系和其他筛选条件导出列表中的记录。" }] },
    ],
  },
  review: {
    title: "人工审核点评 · 说明",
    notes: [
      { title: "两个审核页签共用规则", target: ".review-tabs", details: [{ label: "交互说明", text: "待审核和已审核均显示门店、省市、大区、小区、设备风险与系统初判；查询和导出按当前页签结果执行，人工审核记录独立。" }] },
      { title: "门店和区域查询", target: ".review-filter-grid", details: [
        { label: "判断规则", text: "门店可按名称或编码查找；省、市、大区、小区可分别筛选，条件取交集。详情和导出使用同一份筛选结果。" },
        { label: "数据来源", text: "区域来自按门店编码取得的本次区域数据；原型使用脱敏演示数据。" },
      ] },
      { title: "设备风险判定", target: ".review-table-wrap", details: [
        { label: "判断规则", text: "提交本次答卷时，同 VIN、同问卷 ID、同现有 TCS MIS，在一年内含本次出现至少两个不同设备 ID，则本次设备风险异常；MIS 不同或同设备不能单独触发。" },
        { label: "异常规则", text: "一年精确端点、无效或撤回答卷、缺失设备 ID 及查询失败的正式处理仍待确认；待核验不是第三种设备风险状态。" },
      ] },
      { title: "系统初判与人工结论", target: ".review-filter-actions", details: [{ label: "判断规则", text: "设备风险异常使系统初判无效；设备风险正常仍须检查其他初判条件。人工确认有效或无效独立记录，不反向修改风险结果。" }] },
    ],
  },
};

export default function PageGuide({ page }: { page: "survey" | "review" }) {
  const [collapsed, setCollapsed] = useState(false);
  const guide = guides[page];
  const locate = (selector: string) => document.querySelector(selector)?.scrollIntoView({ behavior: "smooth", block: "center" });

  return <>
    {collapsed ? <button className="guide-reopen" type="button" onClick={() => setCollapsed(false)}>展开说明</button> :
      <aside className="page-guide" aria-label={guide.title}>
        <div className="page-guide-head"><h2>{guide.title}</h2><button type="button" onClick={() => setCollapsed(true)}>收起</button></div>
        <p className="page-guide-intro">点击说明定位相应内容；悬停或键盘聚焦可对照。</p>
        <ol>{guide.notes.map((note, index) => <li key={note.title}>
          <button type="button" onClick={() => locate(note.target)}><strong>{index + 1}. {note.title}</strong>{note.details.map((detail) => <span key={detail.label}><b>{detail.label}：</b>{detail.text}</span>)}</button>
        </li>)}</ol>
      </aside>}
  </>;
}
