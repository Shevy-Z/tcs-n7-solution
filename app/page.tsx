"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type PageKey = "question" | "customer" | "survey";
type Row = Record<string, string | number>;
type Column = { key: string; label: string; sublabel?: string; width?: number; group?: "base" | "region" | "detail" };

type Filter = {
  key: string;
  label: string;
  type: "text" | "select" | "multi" | "date-range";
  placeholder?: string;
  options?: readonly string[];
};

const misOptions = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "18", "19", "20", "21", "22", "24", "26", "28", "29", "31", "32", "44", "85", "217", "218", "255"];
const seriesCodeOptions = ["AC0", "AE0", "CE0", "L34"];
const anomalyLabels: Record<string, string> = {
  C: "代答（ID识别异常）",
  R: "结果异常（NPS/NSS异常）",
  T: "时间异常（时间过短）",
  H: "人工审核结果异常",
};

const pageInfo: Record<PageKey, { label: string; hint: string }> = {
  question: { label: "其它问题表明细", hint: "多层级问题与答案明细" },
  customer: { label: "客户表明细", hint: "客户评分指标明细" },
  survey: { label: "问卷报表明细", hint: "问卷发放与多层级评分明细" },
};

const filters: Filter[] = [
  { key: "planId", label: "方案ID", type: "text", placeholder: "请输入方案ID" },
  { key: "surveyType", label: "问卷类型", type: "select", options: ["全部", "NPS", "CCS", "ADAS", "专项"] },
  { key: "surveyId", label: "问卷ID", type: "text", placeholder: "请输入问卷ID" },
  { key: "pushId", label: "推送ID", type: "text", placeholder: "请输入推送ID" },
  { key: "commentStatus", label: "点评状态", type: "select", options: ["全部", "待点评", "已点评", "无需点评"] },
  { key: "commentTime", label: "点评时间", type: "date-range" },
  { key: "mis", label: "MIS", type: "multi", options: misOptions },
  { key: "seriesCode", label: "车系编码", type: "multi", options: seriesCodeOptions },
  { key: "code18", label: "18位码", type: "text", placeholder: "请输入18位码" },
  { key: "vin", label: "VIN", type: "text", placeholder: "请输入VIN" },
  { key: "region", label: "大区", type: "select", options: ["全部", "东区", "南区", "西区", "北区"] },
  { key: "district", label: "小区", type: "select", options: ["全部", "上海小区", "苏皖小区", "浙江小区", "京津小区"] },
  { key: "province", label: "省", type: "text", placeholder: "请输入省" },
  { key: "city", label: "市", type: "text", placeholder: "请输入市" },
  { key: "dealer", label: "专营店名称", type: "text", placeholder: "请输入专营店名称" },
  { key: "anomalyId", label: "ID", type: "multi", options: ["C", "R", "T", "H", "空值（未检出异常）"] },
];

function MultiSelect({ label, options, value, onChange }: { label: string; options: readonly string[]; value: string; onChange: (value: string) => void }) {
  const selected = value ? value.split(",") : [];
  const toggle = (option: string) => {
    const next = selected.includes(option) ? selected.filter((item) => item !== option) : [...selected, option];
    onChange(next.join(","));
  };

  return (
    <details className="multi-select">
      <summary aria-label={`${label}，可多选`}><span className={selected.length ? "has-value" : ""}>{selected.length ? selected.join("、") : "请选择，可多选"}</span><i>⌄</i></summary>
      <div className="multi-options">
        <div className="multi-options-head"><span>已选 {selected.length} 项</span>{selected.length > 0 && <button type="button" onClick={() => onChange("")}>清空</button>}</div>
        {options.map((option) => (
          <label key={option}>
            <input type="checkbox" checked={selected.includes(option)} onChange={() => toggle(option)} />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </details>
  );
}

const weekDays = ["一", "二", "三", "四", "五", "六", "日"];

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateKey(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function calendarDays(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const mondayOffset = (first.getDay() + 6) % 7;
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(month.getFullYear(), month.getMonth(), index - mondayOffset + 1);
    return { date, key: dateKey(date), currentMonth: date.getMonth() === month.getMonth() };
  });
}

function DateRangePicker({ start, end, onChange }: { start: string; end: string; onChange: (start: string, end: string) => void }) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const initialMonth = start ? parseDateKey(start) : new Date();
  const [month, setMonth] = useState(() => new Date(initialMonth.getFullYear(), initialMonth.getMonth(), 1));
  const rightMonth = addMonths(month, 1);

  const chooseDate = (value: string) => {
    if (!start || end) {
      onChange(value, "");
      return;
    }
    if (value < start) onChange(value, start);
    else onChange(start, value);
    detailsRef.current?.removeAttribute("open");
  };

  const renderMonth = (panelMonth: Date) => (
    <div className="calendar-month">
      <div className="calendar-title">{panelMonth.getFullYear()}年&nbsp;&nbsp;{panelMonth.getMonth() + 1}月</div>
      <div className="calendar-week">{weekDays.map((day) => <span key={day}>{day}</span>)}</div>
      <div className="calendar-days">
        {calendarDays(panelMonth).map((item) => {
          const isStart = item.key === start;
          const isEnd = item.key === end;
          const inRange = Boolean(start && end && item.key > start && item.key < end);
          const isToday = item.key === dateKey(new Date());
          const classes = [!item.currentMonth ? "outside" : "", isStart ? "range-start" : "", isEnd ? "range-end" : "", inRange ? "in-range" : "", isToday ? "today" : ""].filter(Boolean).join(" ");
          return <button className={classes} key={item.key} type="button" onClick={() => chooseDate(item.key)} aria-label={item.key}>{item.date.getDate()}</button>;
        })}
      </div>
    </div>
  );

  return (
    <details className="date-picker" ref={detailsRef}>
      <summary aria-label="选择点评时间范围">
        <span className={start ? "has-value" : ""}>{start || "开始日期"}</span>
        <i>→</i>
        <span className={end ? "has-value" : ""}>{end || "结束日期"}</span>
        <b aria-hidden="true">▣</b>
      </summary>
      <div className="calendar-popover">
        <div className="calendar-navigation calendar-navigation-left">
          <button type="button" onClick={() => setMonth(addMonths(month, -12))} aria-label="上一年">«</button>
          <button type="button" onClick={() => setMonth(addMonths(month, -1))} aria-label="上个月">‹</button>
        </div>
        <div className="calendar-navigation calendar-navigation-right">
          <button type="button" onClick={() => setMonth(addMonths(month, 1))} aria-label="下个月">›</button>
          <button type="button" onClick={() => setMonth(addMonths(month, 12))} aria-label="下一年">»</button>
        </div>
        <div className="calendar-panels">{renderMonth(month)}{renderMonth(rightMonth)}</div>
        <div className="calendar-footer"><span>{start ? `${start}${end ? ` → ${end}` : " → 请选择结束日期"}` : "请选择开始日期"}</span><button type="button" onClick={() => onChange("", "")}>清空</button></div>
      </div>
    </details>
  );
}

const baseColumns: Column[] = [
  { key: "no", label: "序号", width: 68, group: "base" },
  { key: "planId", label: "方案ID", width: 92, group: "base" },
  { key: "surveyType", label: "问卷类型", width: 120, group: "base" },
  { key: "surveyId", label: "问卷ID", width: 96, group: "base" },
  { key: "pushId", label: "推送ID", width: 98, group: "base" },
  { key: "commentStatus", label: "点评状态", width: 94, group: "base" },
  { key: "commentTime", label: "点评时间", width: 154, group: "base" },
  { key: "mis", label: "MIS", width: 80, group: "base" },
  { key: "seriesCode", label: "车系编码", width: 100, group: "base" },
  { key: "code18", label: "18位码", width: 180, group: "base" },
  { key: "vin", label: "VIN", width: 180, group: "base" },
  { key: "region", label: "大区", width: 82, group: "region" },
  { key: "district", label: "小区", width: 98, group: "region" },
];

const questionColumns: Column[] = [
  ...baseColumns,
  { key: "province", label: "省", width: 86, group: "region" },
  { key: "city", label: "市", width: 86, group: "region" },
  { key: "dealer", label: "专营店", width: 152, group: "region" },
  { key: "anomalyId", label: "ID", width: 74, group: "detail" },
  { key: "q1", label: "第一层题目", width: 210, group: "detail" },
  { key: "a1", label: "第一层答案", width: 120, group: "detail" },
  { key: "q2", label: "第二层题目", width: 190, group: "detail" },
  { key: "a2", label: "第二层答案", width: 120, group: "detail" },
  { key: "q3", label: "第三层题目", width: 180, group: "detail" },
  { key: "a3", label: "第三层答案", width: 120, group: "detail" },
  { key: "q4", label: "第四层题目", width: 180, group: "detail" },
  { key: "a4", label: "第四层答案", width: 120, group: "detail" },
  { key: "q5", label: "第五层题目", width: 180, group: "detail" },
  { key: "a5", label: "第五层答案", width: 120, group: "detail" },
];

const rewardColumns: Column[] = [
  { key: "rewardSuccess", label: "是否已成功发放点评奖励", width: 180, group: "detail" },
  { key: "rewardTime", label: "发放点评奖励时间", width: 156, group: "detail" },
  { key: "rewardFailure", label: "发放奖励失败原因", width: 160, group: "detail" },
];

const customerScoreColumns: Column[] = [
  { key: "vehicleOverallScore", label: "【必填】车辆整体评分为?", width: 190, group: "detail" },
  { key: "recommendFriends", label: "【必填】您有多大可能推荐您的车型给亲友、同事?", width: 255, group: "detail" },
  { key: "exteriorPaint", label: "外观与油漆", width: 120, group: "detail" },
  { key: "interiorMaterial", label: "内饰与材质", width: 120, group: "detail" },
  { key: "infotainment", label: "车机导航音响娱乐", width: 150, group: "detail" },
  { key: "airConditioning", label: "空调性能", width: 110, group: "detail" },
  { key: "seatSpace", label: "座椅与乘坐空间", width: 140, group: "detail" },
  { key: "storageCharge", label: "车内储物与充电", width: 140, group: "detail" },
  { key: "quietness", label: "车内静音", width: 110, group: "detail" },
  { key: "controlConvenience", label: "操控便利", width: 110, group: "detail" },
  { key: "driverAssist", label: "辅助驾驶功能", width: 130, group: "detail" },
  { key: "steeringBraking", label: "行驶转向制动性能", width: 155, group: "detail" },
  { key: "powertrain", label: "动力系统性能", width: 130, group: "detail" },
  { key: "fuelTank", label: "油耗及油箱容量", width: 140, group: "detail" },
  { key: "vehicleApp", label: "车主APP连接车辆", width: 145, group: "detail" },
];

const customerColumns: Column[] = [
  ...baseColumns,
  { key: "province", label: "省", width: 86, group: "region" },
  { key: "city", label: "市", width: 86, group: "region" },
  { key: "dealer", label: "专营店名称", width: 168, group: "region" },
  { key: "anomalyId", label: "ID", width: 74, group: "detail" },
  ...rewardColumns,
  ...customerScoreColumns,
];

const surveyColumns: Column[] = [
  ...baseColumns,
  { key: "province", label: "省", width: 86, group: "region" },
  { key: "city", label: "市", width: 86, group: "region" },
  { key: "dealer", label: "专营店名称", width: 168, group: "region" },
  ...rewardColumns,
  { key: "levelScore", label: "第一层", sublabel: "评分", width: 145, group: "detail" },
  { key: "level1Item", label: "第一层", sublabel: "Lvl_1项目", width: 190, group: "detail" },
  { key: "level2Item", label: "第二层", sublabel: "Lvl_2项目", width: 190, group: "detail" },
  { key: "level3Item", label: "第三层", sublabel: "Lvl_3项目", width: 190, group: "detail" },
  { key: "level4Detail", label: "第四层", sublabel: "Lvl_4详细", width: 190, group: "detail" },
  { key: "level5Detail", label: "第五层", sublabel: "Lvl_5详细", width: 220, group: "detail" },
  { key: "message", label: "留言", width: 240, group: "detail" },
  { key: "distress", label: "困扰度", width: 105, group: "detail" },
  { key: "recentOccurrence", label: "最近发生时间", width: 150, group: "detail" },
];

const columnsByPage: Record<PageKey, Column[]> = {
  question: questionColumns,
  customer: customerColumns,
  survey: surveyColumns,
};

const dealers = ["上海冠松日产专营店", "上海众泰日产专营店", "南京汉虹日产专营店", "杭州元通日产专营店"];
const cities = ["上海", "上海", "南京", "杭州"];
const districts = ["上海小区", "上海小区", "苏皖小区", "浙江小区"];
const vins = ["LGBM9AE99M1240983", "LGBM9AE99M1240837", "LGBM9AE99M1240608", "LGBM9AE99M1240508"];

function buildRows(page: PageKey): Row[] {
  return Array.from({ length: 13 }, (_, index) => {
    const group = index % 4;
    const base: Row = {
      no: index + 1,
      planId: index < 8 ? "118" : "126",
      surveyType: ["NPS", "CCS", "ADAS", "专项"][index % 4],
      surveyId: index % 3 === 2 ? "Q20261012" : "Q20260901",
      pushId: ["97051", "96905", "96676", "96674", "96576"][index % 5],
      commentStatus: index % 4 === 0 ? "已点评" : "待点评",
      commentTime: index % 4 === 0 ? "2026-10-31 15:36:43" : "—",
      mis: ["19", "24", "31", "218"][index % 4],
      seriesCode: seriesCodeOptions[index % seriesCodeOptions.length],
      code18: `1N4AL3AP${String(1000000000 + index).slice(-10)}`,
      vin: vins[group],
      region: group < 3 ? "东区" : "南区",
      district: districts[group],
      province: group < 2 ? "上海市" : group === 2 ? "江苏省" : "浙江省",
      city: cities[group],
      dealer: dealers[group],
      anomalyId: ["C", "R", "T", "H", ""][index % 5],
      q1: index % 2 ? "【必填】车辆整体评分为何？" : "【必填】车辆整体满意度如何？",
      a1: index % 4 === 0 ? "4 - 满意" : "5 - 非常满意",
      q2: index % 3 === 0 ? "最满意的车辆表现是？" : "—",
      a2: index % 3 === 0 ? "外观设计" : "—",
      q3: "—",
      a3: "—",
      q4: "—",
      a4: "—",
      q5: "—",
      a5: "—",
      rewardSuccess: index % 5 === 0 ? "否" : "是",
      rewardTime: index % 5 === 0 ? "—" : "2026-11-01 09:16:08",
      rewardFailure: index % 5 === 0 ? "用户账户信息缺失" : "—",
      vehicleOverallScore: index % 4 === 0 ? 4 : 5,
      recommendFriends: index % 3 === 0 ? 9 : 10,
      exteriorPaint: index % 4 === 0 ? 4 : 5,
      interiorMaterial: 5,
      infotainment: index % 3 === 0 ? 4 : 5,
      airConditioning: 5,
      seatSpace: index % 2 === 0 ? 5 : 4,
      storageCharge: 5,
      quietness: 4,
      controlConvenience: 5,
      driverAssist: index % 4 === 0 ? 4 : 5,
      steeringBraking: 5,
      powertrain: 5,
      fuelTank: index % 3 === 0 ? 4 : 5,
      vehicleApp: 5,
      levelScore: index % 4 === 0 ? 4 : 5,
      level1Item: index % 2 === 0 ? "车辆质量" : "车辆性能",
      level2Item: index % 2 === 0 ? "车身与外观" : "动力与操控",
      level3Item: index % 3 === 0 ? "外观油漆" : "转向表现",
      level4Detail: index % 3 === 0 ? "漆面存在色差" : "方向盘操控轻便",
      level5Detail: index % 3 === 0 ? "车身漆面细节" : "整体性能表现",
      message: index % 3 === 0 ? "希望进一步提升细节品质" : "整体使用体验良好",
      distress: index % 3 === 0 ? "一般困扰" : "不困扰",
      recentOccurrence: index % 3 === 0 ? "近一个月" : "—",
    };
    return base;
  });
}

function SideIcon({ children }: { children: React.ReactNode }) {
  return <span className="side-icon" aria-hidden="true">{children}</span>;
}

export default function Home() {
  const [activePage, setActivePage] = useState<PageKey>("question");
  const [collapsed, setCollapsed] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [form, setForm] = useState<Record<string, string>>({});
  const [applied, setApplied] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const view = new URLSearchParams(window.location.search).get("view") as PageKey | null;
    if (view && pageInfo[view]) setActivePage(view);
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 2200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const allRows = useMemo(() => buildRows(activePage), [activePage]);
  const columns = columnsByPage[activePage];
  const visibleFilters = activePage === "survey" ? filters.filter((filter) => filter.key !== "anomalyId") : filters;
  const visibleRows = useMemo(() => {
    const activeEntries = Object.entries(applied).filter(([key, value]) => value && value !== "全部" && key !== "commentTimeStart" && key !== "commentTimeEnd");
    const start = applied.commentTimeStart;
    const end = applied.commentTimeEnd;
    if (!activeEntries.length && !start && !end) return allRows;
    return allRows.filter((row) => {
      const valuesMatch = activeEntries.every(([key, value]) => {
        if (key === "mis" || key === "seriesCode") return value.split(",").includes(String(row[key] ?? ""));
        if (key === "anomalyId") {
          const rowValue = String(row.anomalyId ?? "");
          return value.split(",").some((option) => option === "空值（未检出异常）" ? rowValue === "" : rowValue === option);
        }
        return String(row[key] ?? "").toLowerCase().includes(value.toLowerCase());
      });
      if (!valuesMatch) return false;
      if (!start && !end) return true;
      const rowDate = String(row.commentTime ?? "").slice(0, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(rowDate)) return false;
      return (!start || rowDate >= start) && (!end || rowDate <= end);
    });
  }, [allRows, applied]);

  const switchPage = (key: PageKey) => {
    setActivePage(key);
    setApplied({});
    setForm({});
    const next = new URL(window.location.href);
    next.searchParams.set("view", key);
    window.history.replaceState({}, "", next);
  };

  const runSearch = () => {
    setApplied(form);
    setNotice("查询完成，列表已更新");
  };

  const reset = () => {
    setForm({});
    setApplied({});
    setNotice("筛选条件已重置");
  };

  const exportCsv = () => {
    const csv = [
      columns.map((column) => column.sublabel ? `${column.label}（${column.sublabel}）` : column.label),
      ...visibleRows.map((row) => columns.map((column) => String(row[column.key] ?? ""))),
    ].map((line) => line.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(",")).join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
    link.download = `${pageInfo[activePage].label}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    setNotice("明细文件已导出");
  };

  return (
    <div className={`app-shell ${collapsed ? "nav-collapsed" : ""}`}>
      <aside className="sidebar">
        <div className="brand-block">
          <span className="brand-orbit">NISSAN</span>
          <span className="brand-text"><b>微信客户调研平台</b><small>TCS</small></span>
        </div>
        <nav className="main-nav" aria-label="系统菜单">
          <div className="nav-parent"><SideIcon>♙</SideIcon><span>权限管理</span><i>⌄</i></div>
          <div className="nav-parent"><SideIcon>▣</SideIcon><span>问卷管理</span><i>⌄</i></div>
          <div className="nav-parent"><SideIcon>⌁</SideIcon><span>审批管理</span><i>⌄</i></div>
          <div className="nav-parent"><SideIcon>▤</SideIcon><span>素材管理</span><i>⌄</i></div>
          <div className="nav-parent open"><SideIcon>◔</SideIcon><span>统计报表</span><i>⌃</i></div>
          <div className="subnav">
            <button type="button"><span>车主统计TCS</span></button>
            <button type="button"><span>未点评里推送进度日志</span></button>
            {(Object.keys(pageInfo) as PageKey[]).map((key) => (
              <button className={activePage === key ? "active" : ""} key={key} type="button" onClick={() => switchPage(key)}>
                <span>{pageInfo[key].label}</span>
              </button>
            ))}
            <button type="button"><span>点评奖励发放日志</span></button>
            <button type="button"><span>答题时长统计</span></button>
            <button type="button"><span>逻辑树管理</span></button>
            <button type="button"><span>逻辑树关联配置</span></button>
          </div>
          <div className="nav-parent"><SideIcon>⚿</SideIcon><span>配置管理</span><i>⌄</i></div>
        </nav>
        <div className="sidebar-foot"><span className="status-dot" /> <span>系统运行正常</span></div>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <button className="nav-toggle" type="button" onClick={() => setCollapsed((value) => !value)} aria-label="展开或收起侧栏">☰</button>
          <div className="crumb"><span>统计报表</span><b>/</b><strong>{pageInfo[activePage].label}</strong></div>
          <div className="account"><span className="account-avatar">A</span><span><b>admin</b><small>超级管理员</small></span><i>⌄</i></div>
        </header>

        <main className="content">
          <section className="page-heading">
            <div><p>STATISTICS / DETAIL</p><h1>{pageInfo[activePage].label}</h1><span>{pageInfo[activePage].hint}</span></div>
            <div className="data-summary"><small>当前数据集</small><b>2026 客户体验调研</b><span>更新于 10:42</span></div>
          </section>

          <section className={`filter-card ${filtersOpen ? "" : "filter-card--closed"}`}>
            <div className="filter-head">
              <div><span className="section-kicker">FILTER</span><h2>筛选条件</h2><em>{visibleFilters.length} 项</em></div>
              <button type="button" onClick={() => setFiltersOpen((value) => !value)}>{filtersOpen ? "收起" : "展开"}<span>{filtersOpen ? "⌃" : "⌄"}</span></button>
            </div>
            {filtersOpen && (
              <div className="filter-body">
                <div className="filter-grid">
                  {visibleFilters.map((filter) => (
                    <label className="field" key={filter.key}>
                      <span>{filter.label}</span>
                      {filter.type === "select" ? (
                        <select value={form[filter.key] ?? "全部"} onChange={(event) => setForm({ ...form, [filter.key]: event.target.value })}>
                          {filter.options?.map((option) => <option key={option}>{option}</option>)}
                        </select>
                      ) : filter.type === "multi" ? (
                        <MultiSelect label={filter.label} options={filter.options ?? []} value={form[filter.key] ?? ""} onChange={(value) => setForm({ ...form, [filter.key]: value })} />
                      ) : filter.type === "date-range" ? (
                        <DateRangePicker start={form.commentTimeStart ?? ""} end={form.commentTimeEnd ?? ""} onChange={(start, end) => setForm({ ...form, commentTimeStart: start, commentTimeEnd: end })} />
                      ) : (
                        <input value={form[filter.key] ?? ""} placeholder={filter.placeholder} onChange={(event) => setForm({ ...form, [filter.key]: event.target.value })} />
                      )}
                    </label>
                  ))}
                </div>
                <div className="filter-actions">
                  <button className="secondary-btn" type="button" onClick={reset}>重置</button>
                  <button className="primary-btn" type="button" onClick={runSearch}><span>⌕</span>查询</button>
                </div>
              </div>
            )}
          </section>

          <section className="table-card">
            <div className="table-toolbar">
              <div className="result-title"><span className="section-kicker">RESULT</span><h2>明细列表</h2><em>共 {visibleRows.length} 条</em></div>
              <div className="table-legend"><span><i className="legend-base" />基础信息</span><span><i className="legend-region" />区域信息</span><span><i className="legend-detail" />业务明细</span></div>
              <div className="toolbar-actions">
                <button className="export-btn" type="button" onClick={exportCsv}>⇩<span>导出</span></button>
                <button type="button" onClick={runSearch} title="刷新">↻</button>
                <button type="button" title="表格密度">≡</button>
                <button type="button" title="列设置">⚙</button>
              </div>
            </div>

            <div className="table-wrap" tabIndex={0} aria-label={`${pageInfo[activePage].label}，可横向滚动查看更多字段`}>
              <table>
                <thead>
                  <tr>{columns.map((column) => <th className={`col-${column.group}`} key={column.key} style={{ width: column.width, minWidth: column.width }}><span className="th-label">{column.label}{column.sublabel && <small>{column.sublabel}</small>}</span></th>)}</tr>
                </thead>
                <tbody>
                  {visibleRows.length ? visibleRows.map((row) => (
                    <tr key={`${activePage}-${row.no}`}>
                      {columns.map((column) => {
                        const value = String(row[column.key] ?? "");
                        const title = column.key === "anomalyId" ? (anomalyLabels[value] ?? "未检出异常") : (value || "—");
                        const className = column.key === "commentStatus" ? `status status-${row.commentStatus}` : column.key === "anomalyId" && value ? `anomaly-id anomaly-id-${value}` : "";
                        return <td key={column.key} title={title}><span className={className}>{value}</span></td>;
                      })}
                    </tr>
                  )) : (
                    <tr><td className="empty-state" colSpan={columns.length}><b>未找到匹配记录</b><span>请调整筛选条件后重新查询</span></td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="table-foot">
              <span>显示第 {visibleRows.length ? 1 : 0}–{visibleRows.length} 条，共 {visibleRows.length} 条</span>
              <div className="pagination"><button disabled>‹</button><button className="current">1</button><button disabled>›</button><select aria-label="每页条数"><option>20 条/页</option><option>50 条/页</option></select></div>
            </div>
          </section>
          <footer>Copyright © 东风日产乘用车公司 · 微信客户调研平台 TCS</footer>
        </main>
      </div>
      {notice && <div className="toast" role="status"><span>✓</span>{notice}</div>}
    </div>
  );
}
