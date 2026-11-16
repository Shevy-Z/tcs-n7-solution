"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Survey = { id: number; name: string; series: string; configured: boolean };
type PrimaryOption = "NPS题目" | "产品NSS题目" | "特性NSS题目" | "销售NSS题目" | "售后NSS题目";
type QuestionSelection = { primary: PrimaryOption | null; features: string[] };
type SavedConfig = Record<number, { selections: QuestionSelection[] }>;

const primaryOptions: PrimaryOption[] = ["NPS题目", "产品NSS题目", "特性NSS题目", "销售NSS题目", "售后NSS题目"];
const featureOptions = [
  "外观评分", "内饰评分", "车机音响与OTA评分", "辅助驾驶评分", "空调评分", "车内静音评分", "座椅与空间评分",
  "储物与充电评分", "控制功能操作评分", "动力系统评分", "操控性能评分", "电池续航或油耗评分", "车主App评分",
];
const firstSurveys: Survey[] = [
  { id: 1680, name: "测试2611161717", series: "-", configured: true },
  { id: 1679, name: "测试2611161645", series: "-", configured: true },
  { id: 1677, name: "业测设备异常测试专用0950", series: "-", configured: false },
  { id: 1676, name: "NSP+NSS判断专用问卷1", series: "全新一代奇骏", configured: true },
  { id: 1675, name: "业测设备异常测试专用1951", series: "全新天籁", configured: true },
  { id: 1674, name: "业测设备异常测试专用1950", series: "全新天籁", configured: true },
  { id: 1673, name: "业测问题测试11100908", series: "全新天籁", configured: true },
  { id: 1672, name: "业测问题测试11091023", series: "全新天籁", configured: true },
  { id: 1671, name: "业测问题测试11061631", series: "全新天籁", configured: true },
  { id: 1670, name: "业测问题测试10301329", series: "全新天籁", configured: true },
];
const sampleSurveys: Survey[] = [
  ...firstSurveys,
  ...Array.from({ length: 409 }, (_, index) => ({
    id: 1669 - index,
    name: `业测问题测试${String(10301328 - index).padStart(8, "0")}`,
    series: ["全新天籁", "全新一代奇骏", "轩逸", "-", "逍客"][index % 5],
    configured: index % 8 !== 3,
  })),
];
const questionTitles = [
  "NSP题目1", "NSP题目2", "销售NSS题目1", "销售NSS题目2", "售后NSS题目1", "售后NSS题目1",
  "产品NSS题目1", "产品NSS题目2", "特性NSS题目1", "特性NSS题目2", "特性NSS题目3",
  "产品NSS题目3", "销售NSS题目3", "售后NSS题目2", "特性NSS题目4",
];
const defaultSelections: QuestionSelection[] = questionTitles.map((_, index) => ({
  primary: index < 2 ? "NPS题目" : index < 4 || index === 12 ? "销售NSS题目" : index < 6 || index === 13 ? "售后NSS题目" : index < 8 || index === 11 ? "产品NSS题目" : "特性NSS题目",
  features: [],
}));
const storageKey = "tcs-system-sample-validity-v1";

function pageButtons(current: number, count: number) {
  if (count <= 7) return Array.from({ length: count }, (_, index) => index + 1);
  const pages = new Set([1, 2, count - 1, count, current - 1, current, current + 1]);
  const sorted = [...pages].filter((page) => page >= 1 && page <= count).sort((a, b) => a - b);
  return sorted.flatMap((page, index) => index && page - sorted[index - 1] > 1 ? ["…", page] : [page]);
}

export default function SystemSampleValidity({ onNotice }: { onNotice: (message: string) => void }) {
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [form, setForm] = useState({ id: "", name: "", series: "", configured: "" });
  const [applied, setApplied] = useState(form);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [jumpPage, setJumpPage] = useState("");
  const [configured, setConfigured] = useState<SavedConfig>({});
  const [editing, setEditing] = useState<Survey | null>(null);
  const [selections, setSelections] = useState<QuestionSelection[]>(defaultSelections);
  const [questionPage, setQuestionPage] = useState(1);
  const [questionPageSize, setQuestionPageSize] = useState(10);
  const [questionJump, setQuestionJump] = useState("");
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
  const modalBodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) setConfigured(JSON.parse(saved) as SavedConfig);
    } catch {
      // The page remains usable when browser storage is disabled.
    }
  }, []);

  useEffect(() => {
    if (!editing) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setEditing(null); };
    document.addEventListener("keydown", onEscape);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", onEscape); };
  }, [editing]);

  const filtered = useMemo(() => sampleSurveys.filter((survey) => {
    const isConfigured = survey.configured || Boolean(configured[survey.id]);
    return (!applied.id || String(survey.id).includes(applied.id.trim()))
      && (!applied.name || survey.name.toLowerCase().includes(applied.name.trim().toLowerCase()))
      && (!applied.series || survey.series === applied.series)
      && (!applied.configured || (applied.configured === "是") === isConfigured);
  }), [applied, configured]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const shownSurveys = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const questionPages = Math.ceil(questionTitles.length / questionPageSize);
  const shownQuestions = questionTitles.map((title, index) => ({ title, index })).slice((questionPage - 1) * questionPageSize, questionPage * questionPageSize);

  const openConfig = (survey: Survey) => {
    setEditing(survey);
    setSelections(configured[survey.id]?.selections?.map((item) => ({ primary: item.primary, features: [...item.features] })) ?? defaultSelections.map((item) => ({ ...item, features: [] })));
    setQuestionPage(1);
    setQuestionPageSize(10);
    setQuestionJump("");
    setExpandedQuestion(null);
  };
  const choosePrimary = (index: number, option: PrimaryOption) => {
    setSelections((items) => items.map((item, itemIndex) => itemIndex !== index ? item : {
      primary: item.primary === option ? null : option,
      features: item.primary === option || option !== "特性NSS题目" ? [] : item.features,
    }));
    setExpandedQuestion(option === "特性NSS题目" ? index : null);
  };
  const chooseFeature = (index: number, feature: string) => {
    setSelections((items) => items.map((item, itemIndex) => {
      if (itemIndex !== index) return item;
      const features = item.features.includes(feature) ? item.features.filter((value) => value !== feature) : [...item.features, feature];
      return { primary: "特性NSS题目", features };
    }));
  };
  const saveConfig = () => {
    if (!editing) return;
    const next = { ...configured, [editing.id]: { selections } };
    setConfigured(next);
    try { window.localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* Keep the current session's saved state. */ }
    setEditing(null);
    onNotice(`问卷 ${editing.id} 的系统样本有效性配置已保存`);
  };
  const jumpTo = (value: string, count: number, setter: (page: number) => void) => {
    const next = Number(value);
    if (Number.isInteger(next) && next >= 1 && next <= count) setter(next);
    else onNotice(`请输入 1–${count} 之间的页码`);
  };
  const changeQuestionPage = (next: number) => {
    setQuestionPage(next);
    setExpandedQuestion(null);
    modalBodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  return <section className="sample-validity-card">
    <div className="sample-filter-area">
      {filtersOpen && <div className="sample-filter-grid">
        <label><span>问卷ID：</span><input value={form.id} placeholder="请输入" onChange={(event) => setForm({ ...form, id: event.target.value })} /></label>
        <label><span>问卷名称：</span><input value={form.name} placeholder="请输入" onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
        <label><span>关联车系：</span><select value={form.series} onChange={(event) => setForm({ ...form, series: event.target.value })}><option value="">请选择</option>{["全新一代奇骏", "全新天籁", "轩逸", "逍客", "-"].map((item) => <option key={item}>{item}</option>)}</select></label>
        <label><span>是否已配置：</span><select value={form.configured} onChange={(event) => setForm({ ...form, configured: event.target.value })}><option value="">请选择</option><option>是</option><option>否</option></select></label>
      </div>}
      <div className="sample-filter-actions">
        <button type="button" className="secondary-btn" onClick={() => { const empty = { id: "", name: "", series: "", configured: "" }; setForm(empty); setApplied(empty); setPage(1); onNotice("筛选条件已重置"); }}>重置</button>
        <button type="button" className="primary-btn" onClick={() => { setApplied(form); setPage(1); onNotice("查询完成"); }}>查询</button>
        <button type="button" className="sample-collapse" onClick={() => setFiltersOpen((open) => !open)}>{filtersOpen ? "收起⌃" : "展开⌄"}</button>
      </div>
    </div>
    <div className="sample-table-wrap"><table className="sample-table"><thead><tr><th>问卷ID</th><th>问卷名称</th><th>关联车系</th><th>是否已配置</th><th>操作</th></tr></thead><tbody>
      {shownSurveys.length ? shownSurveys.map((survey) => <tr key={survey.id}><td>{survey.id}</td><td>{survey.name}</td><td>{survey.series}</td><td>{survey.configured || configured[survey.id] ? "是" : "否"}</td><td><button type="button" className="sample-config-link" onClick={() => openConfig(survey)}>配置</button></td></tr>) : <tr><td colSpan={5} className="sample-empty">未找到匹配问卷，请调整筛选条件</td></tr>}
    </tbody></table></div>
    <div className="sample-pagination"><span>第 {filtered.length ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, filtered.length)} 条/总共 {filtered.length} 条</span><button type="button" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>‹</button>{pageButtons(currentPage, totalPages).map((item, index) => item === "…" ? <span key={`gap-${index}`} className="sample-page-gap">···</span> : <button type="button" className={currentPage === item ? "active" : ""} key={item} onClick={() => setPage(Number(item))}>{item}</button>)}<button type="button" disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)}>›</button><select aria-label="列表每页条数" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }}>{[10, 20, 50].map((size) => <option value={size} key={size}>{size} 条/页</option>)}</select><span>跳至</span><input aria-label="列表跳转页码" inputMode="numeric" value={jumpPage} onChange={(event) => setJumpPage(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") jumpTo(jumpPage, totalPages, setPage); }} /><span>页</span></div>

    {editing && <div className="sample-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditing(null); }}><div className="sample-modal" role="dialog" aria-modal="true" aria-labelledby="sample-modal-title">
      <div className="sample-modal-head"><div><h2 id="sample-modal-title">编辑系统样本有效题目</h2><span>问卷 {editing.id} · {editing.name}</span></div><button type="button" aria-label="关闭配置弹窗" onClick={() => setEditing(null)}>×</button></div>
      <div className="sample-modal-body" ref={modalBodyRef}><div className="sample-question-table-wrap"><table className="sample-question-table"><thead><tr><th>序号</th><th>题目标题</th><th>操作</th></tr></thead><tbody>{shownQuestions.map(({ title, index }) => <tr key={index}><td>{index + 1}</td><td>{title}</td><td><div className="sample-primary-options">{primaryOptions.map((option) => <label key={option}><input type="checkbox" checked={selections[index]?.primary === option} onChange={() => choosePrimary(index, option)} /><span>{option}</span></label>)}<button type="button" className="sample-feature-toggle" aria-label={`展开${title}的特性NSS二级选项`} aria-expanded={expandedQuestion === index} onClick={() => setExpandedQuestion(expandedQuestion === index ? null : index)}>{selections[index]?.features.length ? `已选 ${selections[index].features.length} 项` : "选择特性细项"}{expandedQuestion === index ? "⌃" : "⌄"}</button></div>{expandedQuestion === index && <div className="sample-feature-panel"><div className="sample-feature-head"><strong>特性NSS评分项</strong><span>可多选；勾选细项会自动选中“特性NSS题目”</span></div><div className="sample-feature-grid">{featureOptions.map((feature) => <label key={feature}><input type="checkbox" checked={selections[index]?.features.includes(feature) ?? false} onChange={() => chooseFeature(index, feature)} /><span>{feature}</span></label>)}</div></div>}</td></tr>)}</tbody></table><div className="sample-question-note">仅展示当前问卷中的 10 分制评分题目；每道题只能选择一个一级选项。</div></div></div>
      <div className="sample-modal-foot"><div className="sample-pagination"><span>第 {(questionPage - 1) * questionPageSize + 1}–{Math.min(questionPage * questionPageSize, questionTitles.length)} 条/总共 {questionTitles.length} 条</span><button type="button" disabled={questionPage === 1} onClick={() => changeQuestionPage(questionPage - 1)}>‹</button>{Array.from({ length: questionPages }, (_, index) => <button type="button" key={index} className={questionPage === index + 1 ? "active" : ""} onClick={() => changeQuestionPage(index + 1)}>{index + 1}</button>)}<button type="button" disabled={questionPage === questionPages} onClick={() => changeQuestionPage(questionPage + 1)}>›</button><select aria-label="弹窗每页条数" value={questionPageSize} onChange={(event) => { setQuestionPageSize(Number(event.target.value)); changeQuestionPage(1); }}>{[10, 20, 50].map((size) => <option value={size} key={size}>{size} 条/页</option>)}</select><span>跳至</span><input aria-label="弹窗跳转页码" inputMode="numeric" value={questionJump} onChange={(event) => setQuestionJump(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") jumpTo(questionJump, questionPages, changeQuestionPage); }} /><span>页</span></div><button type="button" className="sample-save" onClick={saveConfig}>确认保存</button></div>
    </div></div>}
  </section>;
}
