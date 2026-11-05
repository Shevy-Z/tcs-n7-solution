"use client";

import { useEffect, useMemo, useState } from "react";

type DurationTab = "question" | "vehicle" | "type";

type DurationConfig = {
  label: string;
  total: number;
  headers: string[];
  rows: string[][];
};

const baseRows = [
  ["tcs-001", "NPS客户体验问卷", "3,029,000", "10.01", "5.52", "≤ 8.51", "30,290", "99.15", "13.40", "≥ 98.51"],
  ["tcs-002", "CCS服务满意度问卷", "120", "20.03", "3.22", "≤ 8.51", "12", "96.17", "13.64", "≥ 98.51"],
  ["tcs-003", "售后服务问卷", "2,486,000", "13.72", "4.18", "≤ 8.51", "24,860", "112.34", "12.06", "≥ 98.51"],
  ["tcs-004", "新车体验问卷", "1,843,000", "15.46", "4.91", "≤ 8.51", "18,430", "128.70", "14.22", "≥ 98.51"],
  ["tcs-005", "智能座舱问卷", "963,000", "18.28", "5.04", "≤ 8.51", "9,630", "147.52", "15.18", "≥ 98.51"],
  ["tcs-006", "门店接待问卷", "758,000", "12.64", "3.87", "≤ 8.51", "7,580", "106.43", "11.92", "≥ 98.51"],
  ["tcs-007", "客户关怀问卷", "642,000", "14.86", "4.26", "≤ 8.51", "6,420", "118.20", "12.48", "≥ 98.51"],
  ["tcs-008", "产品质量问卷", "518,000", "16.12", "4.74", "≤ 8.51", "5,180", "132.65", "13.86", "≥ 98.51"],
  ["tcs-009", "购车体验问卷", "396,300", "17.20", "4.82", "≤ 8.51", "3,963", "141.08", "14.92", "≥ 98.51"],
  ["tcs-010", "品牌认知问卷", "275,800", "11.42", "3.61", "≤ 8.51", "2,758", "103.26", "11.48", "≥ 98.51"],
];

const vehicleRows = [
  ["AC0", "天籁", "NPS", "18", "3,029,000", "10.01", "5.52", "≤ 8.51", "30,290", "99.15", "13.40", "≥ 98.51"],
  ["AE0", "轩逸", "CCS", "15", "120", "20.03", "3.22", "≤ 8.51", "12", "96.17", "13.64", "≥ 98.51"],
  ["CE0", "奇骏", "ADAS", "32", "2,486,000", "13.72", "4.18", "≤ 8.51", "24,860", "112.34", "12.06", "≥ 98.51"],
  ["L34", "逍客", "专项", "44", "1,843,000", "15.46", "4.91", "≤ 8.51", "18,430", "128.70", "14.22", "≥ 98.51"],
  ["AC0", "天籁", "CCS", "23", "963,000", "18.28", "5.04", "≤ 8.51", "9,630", "147.52", "15.18", "≥ 98.51"],
  ["AE0", "轩逸", "NPS", "22", "758,000", "12.64", "3.87", "≤ 8.51", "7,580", "106.43", "11.92", "≥ 98.51"],
  ["CE0", "奇骏", "专项", "28", "642,000", "14.86", "4.26", "≤ 8.51", "6,420", "118.20", "12.48", "≥ 98.51"],
  ["L34", "逍客", "ADAS", "16", "518,000", "16.12", "4.74", "≤ 8.51", "5,180", "132.65", "13.86", "≥ 98.51"],
  ["AC0", "天籁", "NPS", "12", "396,300", "17.20", "4.82", "≤ 8.51", "3,963", "141.08", "14.92", "≥ 98.51"],
  ["AE0", "轩逸", "CCS", "9", "275,800", "11.42", "3.61", "≤ 8.51", "2,758", "103.26", "11.48", "≥ 98.51"],
];

const typeRows = [
  ["NPS", "123", "3,029,000", "10.01", "5.52", "≤ 8.51", "30,290", "99.15", "13.40", "≥ 98.51"],
  ["CCS", "96", "2,486,000", "13.72", "4.18", "≤ 8.51", "24,860", "112.34", "12.06", "≥ 98.51"],
  ["ADAS", "68", "1,843,000", "15.46", "4.91", "≤ 8.51", "18,430", "128.70", "14.22", "≥ 98.51"],
  ["专项", "84", "963,000", "18.28", "5.04", "≤ 8.51", "9,630", "147.52", "15.18", "≥ 98.51"],
  ["NPS", "72", "758,000", "12.64", "3.87", "≤ 8.51", "7,580", "106.43", "11.92", "≥ 98.51"],
  ["CCS", "64", "642,000", "14.86", "4.26", "≤ 8.51", "6,420", "118.20", "12.48", "≥ 98.51"],
  ["ADAS", "52", "518,000", "16.12", "4.74", "≤ 8.51", "5,180", "132.65", "13.86", "≥ 98.51"],
  ["专项", "41", "396,300", "17.20", "4.82", "≤ 8.51", "3,963", "141.08", "14.92", "≥ 98.51"],
  ["NPS", "37", "275,800", "11.42", "3.61", "≤ 8.51", "2,758", "103.26", "11.48", "≥ 98.51"],
  ["CCS", "29", "184,600", "13.08", "3.96", "≤ 8.51", "1,846", "109.82", "12.15", "≥ 98.51"],
];

function repeatRows(rows: string[][], total: number, tab: DurationTab) {
  return Array.from({ length: total }, (_, index) => {
    const row = [...rows[index % rows.length]];
    if (index >= rows.length && tab === "question") {
      row[0] = `tcs-${String(index + 1).padStart(3, "0")}`;
      row[1] = `${row[1]} ${index + 1}`;
    }
    return row;
  });
}

const configs: Record<DurationTab, DurationConfig> = {
  question: {
    label: "问卷维度",
    total: 24,
    headers: ["序号", "问卷编号", "问卷名称", "答题数量（n题）", "平均答题时长（μ题）", "答题标准差（σ题）", "有效答题时长", "完成答卷数量（n卷）", "平均答卷时长（μ卷）", "答卷标准差（σ卷）", "有效答卷时长"],
    rows: repeatRows(baseRows, 24, "question"),
  },
  vehicle: {
    label: "车系维度",
    total: 18,
    headers: ["序号", "车系编码", "车系名称", "问卷类型", "关联问卷", "答题数量（n题）", "平均答题时长（μ题）", "答题标准差（σ题）", "有效答题时长", "完成答卷数量（n卷）", "平均答卷时长（μ卷）", "答卷标准差（σ卷）", "有效答卷时长"],
    rows: repeatRows(vehicleRows, 18, "vehicle"),
  },
  type: {
    label: "问卷类型维度",
    total: 10,
    headers: ["序号", "问卷类型", "关联问卷", "答题数量（n题）", "平均答题时长（μ题）", "答题标准差（σ题）", "有效答题时长", "完成答卷数量（n卷）", "平均答卷时长（μ卷）", "答卷标准差（σ卷）", "有效答卷时长"],
    rows: typeRows,
  },
};

const metrics = [
  { label: "答题总量", value: "8,610,420", unit: "题", trend: "+12.8%" },
  { label: "平均答题时长", value: "12.84", unit: "秒/题", trend: "-1.6%" },
  { label: "答题时长标准差", value: "4.26", unit: "秒", trend: "稳定" },
  { label: "完成答卷数量", value: "86,104", unit: "卷", trend: "+8.4%" },
  { label: "平均答卷时长", value: "112.34", unit: "秒/卷", trend: "-3.1%" },
  { label: "答卷时长标准差", value: "12.06", unit: "秒", trend: "稳定" },
  { label: "有效答题率", value: "96.72", unit: "%", trend: "+1.2%" },
  { label: "有效答卷率", value: "94.38", unit: "%", trend: "+0.9%" },
];

export default function DurationStatistics({ onNotice }: { onNotice: (message: string) => void }) {
  const [activeTab, setActiveTab] = useState<DurationTab>("question");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [project, setProject] = useState("2026 客户体验调研");
  const [cycle, setCycle] = useState("2026-11");
  const [status, setStatus] = useState("全部");
  const [modal, setModal] = useState<"question" | "survey" | "help" | null>(null);
  const config = configs[activeTab];
  const pageSize = 10;

  useEffect(() => {
    if (!modal) return;
    const close = (event: KeyboardEvent) => event.key === "Escape" && setModal(null);
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [modal]);

  const filtered = useMemo(() => config.rows.filter((row) => row.join("").toLowerCase().includes(query.toLowerCase())), [config, query]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const changeTab = (tab: DurationTab) => {
    setActiveTab(tab);
    setQuery("");
    setPage(1);
  };

  const exportCsv = () => {
    const lines = [config.headers, ...filtered.map((row, index) => [String(index + 1), ...row])];
    const csv = lines.map((line) => line.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(",")).join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
    link.download = `答题时长统计-${config.label}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    onNotice("答题时长统计已导出");
  };

  return (
    <div className="duration-page">
      <section className="duration-filter-card">
        <div className="duration-filter-title"><div><span>DATA SCOPE</span><h2>统计范围</h2></div><button type="button" onClick={() => setModal("help")}>? 使用说明</button></div>
        <div className="duration-filter-grid">
          <label><span>调研项目</span><select value={project} onChange={(event) => setProject(event.target.value)}><option>2026 客户体验调研</option><option>2026 专项调研</option></select></label>
          <label><span>数据周期</span><input type="month" value={cycle} onChange={(event) => setCycle(event.target.value)} /></label>
          <label><span>问卷状态</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option>全部</option><option>进行中</option><option>已结束</option></select></label>
          <div className="duration-filter-actions"><button type="button" onClick={() => { setProject("2026 客户体验调研"); setCycle("2026-11"); setStatus("全部"); onNotice("统计条件已重置"); }}>重置</button><button type="button" onClick={() => onNotice("统计数据已按条件更新")}>查询</button></div>
        </div>
      </section>

      <section className="duration-metrics" aria-label="核心指标">
        {metrics.map((metric, index) => <article key={metric.label}><div className={`metric-icon metric-icon-${index % 4}`}>{["∑", "◷", "σ", "▤"][index % 4]}</div><div><span>{metric.label}</span><strong>{metric.value}<small>{metric.unit}</small></strong><em>{metric.trend}</em></div></article>)}
      </section>

      <section className="duration-rule-card">
        <div><span>有效时长识别规则</span><strong>基于均值、标准差与百分位阈值自动识别异常答题记录</strong></div>
        <div><button type="button" onClick={() => setModal("question")}>答题时长百分位配置</button><button type="button" onClick={() => setModal("survey")}>答卷时长百分位配置</button></div>
      </section>

      <section className="duration-table-card">
        <div className="duration-table-head">
          <div><span>DIMENSION ANALYSIS</span><h2>维度分析</h2><em>共 {filtered.length} 条数据</em></div>
          <div className="duration-search"><span>⌕</span><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="搜索当前维度" /><button type="button" onClick={exportCsv}>⇩ 导出</button></div>
        </div>
        <div className="duration-tabs" role="tablist">
          {(Object.keys(configs) as DurationTab[]).map((tab) => <button className={activeTab === tab ? "active" : ""} key={tab} type="button" onClick={() => changeTab(tab)}>{configs[tab].label}<span>{configs[tab].total}</span></button>)}
        </div>
        <div className="duration-table-wrap">
          <table className="duration-table">
            <thead><tr>{config.headers.map((header) => <th key={header}>{header}</th>)}</tr></thead>
            <tbody>{rows.map((row, index) => <tr key={`${activeTab}-${page}-${index}`}><td><span className="duration-row-number">{(page - 1) * pageSize + index + 1}</span></td>{row.map((value, cellIndex) => <td className={value.startsWith("≤") || value.startsWith("≥") ? "duration-rule" : cellIndex === 0 && activeTab !== "question" ? "duration-link" : ""} key={`${cellIndex}-${value}`}>{value}</td>)}</tr>)}</tbody>
          </table>
        </div>
        <div className="duration-table-foot"><span>第 {(page - 1) * pageSize + (rows.length ? 1 : 0)}–{(page - 1) * pageSize + rows.length} 条，共 {filtered.length} 条</span><div><button disabled={page === 1} onClick={() => setPage((value) => value - 1)}>‹</button>{Array.from({ length: totalPages }, (_, index) => index + 1).map((value) => <button className={page === value ? "active" : ""} key={value} onClick={() => setPage(value)}>{value}</button>)}<button disabled={page === totalPages} onClick={() => setPage((value) => value + 1)}>›</button></div></div>
      </section>

      {modal && <div className="duration-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setModal(null)}><section className="duration-modal" role="dialog" aria-modal="true"><button className="duration-modal-close" type="button" onClick={() => setModal(null)}>×</button><span>STATISTICS RULE</span><h2>{modal === "question" ? "答题时长百分位配置" : modal === "survey" ? "答卷时长百分位配置" : "答题时长统计说明"}</h2>{modal === "help" ? <p>页面按问卷、车系和问卷类型三个维度汇总答题及答卷时长。有效时长由样本均值、标准差和百分位阈值共同计算，可用于快速定位时间过短或过长的异常记录。</p> : <><p>当前采用 P5–P95 百分位范围，并结合标准差校正异常阈值。配置仅影响统计识别，不改变原始答卷数据。</p><div className="duration-config-row"><label>下限百分位<select defaultValue="P5"><option>P1</option><option>P5</option><option>P10</option></select></label><label>上限百分位<select defaultValue="P95"><option>P90</option><option>P95</option><option>P99</option></select></label></div><button className="duration-modal-primary" type="button" onClick={() => { setModal(null); onNotice("百分位配置已保存"); }}>保存配置</button></>}</section></div>}
    </div>
  );
}
