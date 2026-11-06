"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type SearchableMultiSelectProps = {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export default function SearchableMultiSelect({ label, options, value, onChange, placeholder = "请输入或选择，可多选" }: SearchableMultiSelectProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selected = useMemo(() => value.split(",").filter(Boolean), [value]);
  const filteredOptions = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return keyword ? options.filter((option) => option.toLowerCase().includes(keyword)) : options;
  }, [options, query]);

  useEffect(() => {
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        setQuery("");
        inputRef.current?.blur();
      }
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const toggle = (option: string) => {
    const next = selected.includes(option) ? selected.filter((item) => item !== option) : [...selected, option];
    onChange(next.join(","));
  };

  return (
    <div className={`searchable-multi ${open ? "is-open" : ""} ${selected.length ? "has-selection" : ""}`} ref={rootRef}>
      <div className="searchable-multi-control">
        <input
          ref={inputRef}
          type="text"
          value={query}
          placeholder={selected.length ? selected.join("、") : placeholder}
          aria-label={`${label}，输入搜索，可多选`}
          aria-expanded={open}
          aria-haspopup="listbox"
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
        />
        <button type="button" tabIndex={-1} aria-label={`${open ? "收起" : "展开"}${label}选项`} onMouseDown={(event) => event.preventDefault()} onClick={() => {
          if (open) {
            setOpen(false);
            setQuery("");
            inputRef.current?.blur();
          } else {
            setOpen(true);
            inputRef.current?.focus();
          }
        }}>⌄</button>
      </div>
      {open && (
        <div className="searchable-multi-menu" role="listbox" aria-label={`${label}选项`} aria-multiselectable="true">
          <div className="searchable-multi-head">
            <span>{query ? `匹配 ${filteredOptions.length} 项` : `已选 ${selected.length} 项`}</span>
            {selected.length > 0 && <button type="button" onClick={() => onChange("")}>清空</button>}
          </div>
          <div className="searchable-multi-options">
            {filteredOptions.length ? filteredOptions.map((option) => (
              <label key={option} role="option" aria-selected={selected.includes(option)}>
                <input type="checkbox" checked={selected.includes(option)} onChange={() => toggle(option)} />
                <span>{option}</span>
              </label>
            )) : <div className="searchable-multi-empty">无匹配选项</div>}
          </div>
        </div>
      )}
    </div>
  );
}
