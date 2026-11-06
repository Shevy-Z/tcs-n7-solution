"use client";

import { useMemo, useState } from "react";

type ReviewTab = "pending" | "reviewed";
type ReviewRow = {
  id: number;
  brand: string;
  approvalNo: string;
  flowName: string;
  pushId: string;
  commentStatus: string;
  mis: string;
  dealer: string;
  province: string;
  city: string;
  region: string;
  district: string;
  vin: string;
  nps: string;
  nss: string;
  duration: string;
  durationMinutes: number;
  messages: number;
  averageChars: number;
  deviceRisk: string;
  initialResult: string;
  reviewStatus?: string;
  reviewTime?: string;
};

const seedPending: ReviewRow[] = [
  { id: 1, brand: "东风日产-日产", approvalNo: "833", flowName: "业测问题测试10301327-2", pushId: "95821", commentStatus: "已完成", mis: "19", dealer: "上海冠松日产专营店", province: "上海市", city: "上海", region: "东区", district: "上海小区", vin: "LGBM9AE99M1240983", nps: "待定", nss: "待定", duration: "待定", durationMinutes: 2.4, messages: 3, averageChars: 2.3, deviceRisk: "待核验", initialResult: "待定" },
  { id: 2, brand: "东风日产-日产", approvalNo: "823", flowName: "业测问题测试10301327-1", pushId: "95820", commentStatus: "填写中", mis: "24", dealer: "南京汉虹日产专营店", province: "江苏省", city: "南京", region: "东区", district: "苏皖小区", vin: "LGBM9AE99M1240837", nps: "待定", nss: "待定", duration: "待定", durationMinutes: 3.1, messages: 6, averageChars: 3.3, deviceRisk: "待核验", initialResult: "待定" },
  { id: 3, brand: "东风日产-日产", approvalNo: "810", flowName: "业测问题测试10301327-3", pushId: "95819", commentStatus: "已完成", mis: "31", dealer: "杭州元通日产专营店", province: "浙江省", city: "杭州", region: "东区", district: "浙江小区", vin: "LGBM9AE99M1240608", nps: "是", nss: "是", duration: "待定", durationMinutes: 1.6, messages: 11, averageChars: 4.3, deviceRisk: "异常", initialResult: "无效" },
  { id: 4, brand: "东风日产-日产", approvalNo: "806", flowName: "业测问题测试10301327-2", pushId: "95818", commentStatus: "未填写", mis: "18", dealer: "北京华盛昌日产专营店", province: "北京市", city: "北京", region: "北区", district: "京津小区", vin: "LGBM9AE99M1240508", nps: "待定", nss: "待定", duration: "待定", durationMinutes: 8.2, messages: 7, averageChars: 8.7, deviceRisk: "正常", initialResult: "待定" },
  { id: 5, brand: "东风日产-日产", approvalNo: "801", flowName: "客户体验专项审核流", pushId: "95817", commentStatus: "已完成", mis: "217", dealer: "广州喜龙日产专营店", province: "广东省", city: "广州", region: "南区", district: "广佛小区", vin: "LGBM9AE99M1240337", nps: "否", nss: "是", duration: "过短", durationMinutes: 0.8, messages: 2, averageChars: 1.7, deviceRisk: "异常", initialResult: "无效" },
  { id: 6, brand: "东风日产-日产", approvalNo: "798", flowName: "客户体验专项审核流", pushId: "95816", commentStatus: "已完成", mis: "85", dealer: "成都启阳日产专营店", province: "四川省", city: "成都", region: "西区", district: "川渝小区", vin: "LGBM9AE99M1240206", nps: "是", nss: "是", duration: "正常", durationMinutes: 5.6, messages: 9, averageChars: 6.2, deviceRisk: "正常", initialResult: "有效" },
];

const seedReviewed: ReviewRow[] = [
  { ...seedPending[0], id: 101, approvalNo: "834", flowName: "业测问题测试10301327-3", pushId: "95826", messages: 2, averageChars: 4.0, reviewStatus: "有效", reviewTime: "2026-11-05 14:26:31" },
  { ...seedPending[1], id: 102, approvalNo: "834", flowName: "业测问题测试10301327-3", pushId: "95825", messages: 2, averageChars: 3.0, reviewStatus: "有效", reviewTime: "2026-11-05 14:18:06" },
  { ...seedPending[2], id: 103, approvalNo: "832", flowName: "业测问题测试10301327-1", pushId: "95824", messages: 3, averageChars: 2.7, reviewStatus: "无效", reviewTime: "2026-11-05 13:52:45" },
  { ...seedPending[3], id: 104, approvalNo: "833", flowName: "业测问题测试10301327-2", pushId: "95823", messages: 2, averageChars: 2.0, reviewStatus: "有效", reviewTime: "2026-11-05 11:36:20" },
  { ...seedPending[4], id: 105, approvalNo: "832", flowName: "业测问题测试10301327-1", pushId: "95822", messages: 3, averageChars: 2.0, reviewStatus: "无效", reviewTime: "2026-11-04 17:08:19" },
];

const selectOptions: Record<string, string[]> = {
  commentStatus: ["全部", "未填写", "填写中", "已完成"],
  mis: ["全部", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "18", "19", "20", "21", "22", "24", "26", "28", "29", "31", "32", "44", "85", "217", "218", "255"],
  province: ["全部", "北京市", "上海市", "江苏省", "浙江省", "广东省", "四川省"],
  city: ["全部", "北京", "上海", "南京", "杭州", "广州", "成都"],
  region: ["全部", "东区", "南区", "西区", "北区"],
  district: ["全部", "上海小区", "苏皖小区", "浙江小区", "京津小区", "广佛小区", "川渝小区"],
  nps: ["全部", "待定", "是", "否"],
  nss: ["全部", "待定", "是", "否"],
  duration: ["全部", "待定", "正常", "过短", "过长"],
  deviceRisk: ["全部", "待核验", "正常", "异常"],
  initialResult: ["全部", "待定", "有效", "无效"],
  reviewStatus: ["全部", "有效", "无效"],
};

type FieldDef = { key: string; label: string; type?: "text" | "select" | "range" | "date"; placeholder?: string; unit?: string };

const pendingFields: FieldDef[] = [
  { key: "approvalNo", label: "调查审批单号", placeholder: "请输入" },
  { key: "commentStatus", label: "点评状态", type: "select" },
  { key: "vin", label: "VIN码", placeholder: "请输入" },
  { key: "mis", label: "MIS", type: "select" },
  { key: "dealer", label: "门店", placeholder: "请输入门店名称" },
  { key: "province", label: "省份", type: "select" },
  { key: "city", label: "城市", type: "select" },
  { key: "region", label: "大区", type: "select" },
  { key: "district", label: "小区", type: "select" },
  { key: "nps", label: "NPS符合", type: "select" },
  { key: "nss", label: "NSS符合", type: "select" },
  { key: "duration", label: "时长判断", type: "select" },
  { key: "deviceRisk", label: "设备风险", type: "select" },
  { key: "initialResult", label: "系统初判", type: "select" },
  { key: "commentTime", label: "点评时间", type: "date" },
  { key: "durationMinutes", label: "答题时长", type: "range", unit: "分" },
  { key: "messages", label: "留言条数", type: "range" },
  { key: "averageChars", label: "平均字数", type: "range" },
];

const reviewedFields: FieldDef[] = [
  { key: "brand", label: "品牌", placeholder: "请输入" },
  { key: "commentStatus", label: "点评状态", type: "select" },
  { key: "mis", label: "MIS", type: "select" },
  { key: "dealer", label: "门店", placeholder: "请输入门店名称" },
  { key: "province", label: "省份", type: "select" },
  { key: "city", label: "城市", type: "select" },
  { key: "region", label: "大区", type: "select" },
  { key: "district", label: "小区", type: "select" },
  { key: "duration", label: "时长判断", type: "select" },
  { key: "deviceRisk", label: "设备风险", type: "select" },
  { key: "initialResult", label: "系统初判", type: "select" },
  { key: "durationMinutes", label: "答题时长", type: "range", unit: "分" },
  { key: "messages", label: "留言条数", type: "range" },
  { key: "averageChars", label: "平均字数", type: "range" },
  { key: "reviewStatus", label: "人工审核状态", type: "select" },
  { key: "reviewTime", label: "人工审核时间", type: "date" },
];

function RangeInput({ field, form, setForm }: { field: FieldDef; form: Record<string, string>; setForm: (next: Record<string, string>) => void }) {
  return <div className="review-range"><input inputMode="decimal" value={form[`${field.key}Min`] ?? ""} placeholder="最小" onChange={(event) => setForm({ ...form, [`${field.key}Min`]: event.target.value })} /><span>至</span><input inputMode="decimal" value={form[`${field.key}Max`] ?? ""} placeholder="最大" onChange={(event) => setForm({ ...form, [`${field.key}Max`]: event.target.value })} />{field.unit && <b>{field.unit}</b>}</div>;
}

function ReviewDateRange({ fieldKey, form, setForm }: { fieldKey: string; form: Record<string, string>; setForm: (next: Record<string, string>) => void }) {
  return <div className="review-date"><input type="date" aria-label="开始日期" value={form[`${fieldKey}Start`] ?? ""} onChange={(event) => setForm({ ...form, [`${fieldKey}Start`]: event.target.value })} /><span>→</span><input type="date" aria-label="结束日期" value={form[`${fieldKey}End`] ?? ""} onChange={(event) => setForm({ ...form, [`${fieldKey}End`]: event.target.value })} /><i>▣</i></div>;
}

function statusClass(value: string) {
  if (["异常", "无效", "否", "过短", "过长"].includes(value)) return "review-tag danger";
  if (["正常", "有效", "是"].includes(value)) return "review-tag success";
  if (value === "待定") return "review-link-value";
  return "review-tag";
}

export default function ManualReview({ onNotice }: { onNotice: (message: string) => void }) {
  const [tab, setTab] = useState<ReviewTab>("pending");
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [form, setForm] = useState<Record<string, string>>({});
  const [applied, setApplied] = useState<Record<string, string>>({});
  const [pendingRows, setPendingRows] = useState(seedPending);
  const [reviewedRows, setReviewedRows] = useState(seedReviewed);
  const [selected, setSelected] = useState<number[]>([]);

  const fields = tab === "pending" ? pendingFields : reviewedFields;
  const sourceRows = tab === "pending" ? pendingRows : reviewedRows;
  const visibleRows = useMemo(() => sourceRows.filter((row) => {
    return Object.entries(applied).every(([key, value]) => {
      if (!value || value === "全部" || key.endsWith("Start") || key.endsWith("End") || key.endsWith("Min") || key.endsWith("Max")) return true;
      return String(row[key as keyof ReviewRow] ?? "").toLowerCase().includes(value.toLowerCase());
    }) && ["durationMinutes", "messages", "averageChars"].every((key) => {
      const value = Number(row[key as keyof ReviewRow]);
      const min = applied[`${key}Min`] ? Number(applied[`${key}Min`]) : null;
      const max = applied[`${key}Max`] ? Number(applied[`${key}Max`]) : null;
      return (min === null || value >= min) && (max === null || value <= max);
    });
  }), [applied, sourceRows]);

  const changeTab = (next: ReviewTab) => {
    setTab(next);
    setForm({});
    setApplied({});
    setSelected([]);
  };

  const review = (ids: number[], result: "有效" | "无效") => {
    if (!ids.length) return;
    const now = "2026-11-06 10:28:16";
    const moved = pendingRows.filter((row) => ids.includes(row.id)).map((row) => ({ ...row, reviewStatus: result, reviewTime: now }));
    setPendingRows((rows) => rows.filter((row) => !ids.includes(row.id)));
    setReviewedRows((rows) => [...moved, ...rows]);
    setSelected([]);
    onNotice(`已确认 ${ids.length} 条记录${result}`);
  };

  const exportCsv = () => {
    const headers = tab === "pending" ? ["品牌", "调查审批单号", "调查数据审核流名称", "推送ID", "NPS符合", "NSS符合", "时长判断", "留言条数", "平均字数", "设备风险", "系统初判"] : ["品牌", "调查审批单号", "调查数据审核流名称", "推送ID", "NPS符合", "NSS符合", "时长判断", "留言条数", "平均字数", "设备风险", "系统初判", "人工审核状态", "人工审核时间"];
    const keys: (keyof ReviewRow)[] = ["brand", "approvalNo", "flowName", "pushId", "nps", "nss", "duration", "messages", "averageChars", "deviceRisk", "initialResult", ...(tab === "reviewed" ? ["reviewStatus" as const, "reviewTime" as const] : [])];
    const csv = [headers, ...visibleRows.map((row) => keys.map((key) => String(row[key] ?? "")))].map((line) => line.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(",")).join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
    link.download = `${tab === "pending" ? "人工审核点评有效性" : "已审核记录"}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    onNotice("审核明细已导出");
  };

  const renderField = (field: FieldDef) => <label className={`review-field review-field-${field.type ?? "text"}`} key={field.key}><span>{field.label}：</span>{field.type === "select" ? <select value={form[field.key] ?? "全部"} onChange={(event) => setForm({ ...form, [field.key]: event.target.value })}>{(selectOptions[field.key] ?? ["全部"]).map((option) => <option key={option}>{option}</option>)}</select> : field.type === "range" ? <RangeInput field={field} form={form} setForm={setForm} /> : field.type === "date" ? <ReviewDateRange fieldKey={field.key} form={form} setForm={setForm} /> : <input value={form[field.key] ?? ""} placeholder={field.placeholder} onChange={(event) => setForm({ ...form, [field.key]: event.target.value })} />}</label>;

  return <section className="manual-review-card">
    <div className="review-tabs" role="tablist"><button className={tab === "pending" ? "active" : ""} type="button" onClick={() => changeTab("pending")}>人工审核点评有效性</button><button className={tab === "reviewed" ? "active" : ""} type="button" onClick={() => changeTab("reviewed")}>已审核记录</button></div>
    {filtersOpen && <div className="review-filter-grid">{fields.map(renderField)}</div>}
    <div className="review-filter-actions"><button className="secondary-btn" type="button" onClick={() => { setForm({}); setApplied({}); onNotice("筛选条件已重置"); }}>重置</button><button className="primary-btn" type="button" onClick={() => { setApplied(form); onNotice("查询完成，列表已更新"); }}>查询</button><button className="review-collapse" type="button" onClick={() => setFiltersOpen((open) => !open)}>{filtersOpen ? "收起⌃" : "展开⌄"}</button></div>
    <div className="review-toolbar"><span>{tab === "pending" ? `待审核 ${visibleRows.length} 条` : `已审核 ${visibleRows.length} 条`}</span><div><button className="review-export" type="button" onClick={exportCsv}>⇩ 导出</button>{tab === "pending" && <><button disabled={!selected.length} type="button" onClick={() => review(selected, "有效")}>批量确认有效</button><button disabled={!selected.length} type="button" onClick={() => review(selected, "无效")}>批量确认无效</button></>}<button type="button" onClick={() => onNotice("列表已刷新")} title="刷新">↻</button><button type="button" title="表格密度">↕</button><button type="button" title="列设置">⚙</button></div></div>
    <div className="review-table-wrap"><table className="review-table"><thead><tr>{tab === "pending" && <th><input type="checkbox" aria-label="全选" checked={visibleRows.length > 0 && selected.length === visibleRows.length} onChange={(event) => setSelected(event.target.checked ? visibleRows.map((row) => row.id) : [])} /></th>}<th>品牌</th><th>调查审批单号</th><th>调查数据审核流名称</th><th>推送ID</th><th>NPS符合</th><th>NSS符合</th><th>时长判断</th><th>留言条数</th><th>平均字数</th><th>设备风险</th><th>系统初判</th>{tab === "reviewed" && <><th>人工审核状态</th><th>人工审核时间</th></>}{tab === "pending" && <th>操作</th>}</tr></thead><tbody>{visibleRows.map((row) => <tr key={row.id}>{tab === "pending" && <td><input type="checkbox" aria-label={`选择审批单${row.approvalNo}`} checked={selected.includes(row.id)} onChange={() => setSelected((ids) => ids.includes(row.id) ? ids.filter((id) => id !== row.id) : [...ids, row.id])} /></td>}<td>{row.brand}</td><td>{row.approvalNo}</td><td title={row.flowName}>{row.flowName}</td><td>{row.pushId}</td><td><span className={statusClass(row.nps)}>{row.nps}</span></td><td><span className={statusClass(row.nss)}>{row.nss}</span></td><td><span className={statusClass(row.duration)}>{row.duration}</span></td><td>{row.messages}</td><td>{row.averageChars.toFixed(1)}</td><td><span className={statusClass(row.deviceRisk)}>{row.deviceRisk}</span></td><td><span className={statusClass(row.initialResult)}>{row.initialResult}</span></td>{tab === "reviewed" && <><td><span className={statusClass(row.reviewStatus ?? "")}>{row.reviewStatus}</span></td><td>{row.reviewTime}</td></>}{tab === "pending" && <td><div className="review-row-actions"><button type="button" onClick={() => review([row.id], "有效")}>确认有效</button><button type="button" onClick={() => review([row.id], "无效")}>确认无效</button></div></td>}</tr>)}</tbody></table></div>
    <div className="review-table-foot"><span>共 {visibleRows.length} 条数据</span><div><button disabled>‹</button><button className="active">1</button><button disabled>›</button><select><option>20 条/页</option><option>50 条/页</option></select></div></div>
  </section>;
}
