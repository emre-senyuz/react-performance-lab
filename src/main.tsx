import { StrictMode, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ArrowDown, ArrowUpRight, Check, ChevronRight, FlaskConical, Layers3, RotateCcw, Search, SlidersHorizontal, Timer, Zap } from 'lucide-react';
import { filterItems, rows, searchItems, type Item } from './data';
import './styles.css';

const number = (n: number) => n.toLocaleString('en-US');

function SearchField({ value, onChange, id, placeholder }: { value: string; onChange: (value: string) => void; id: string; placeholder: string }) {
  return <div className="search-field"><Search size={17}/><label className="sr-only" htmlFor={id}>{placeholder}</label><input id={id} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} autoComplete="off" spellCheck={false}/>{value && <button aria-label="Clear search" onClick={() => onChange('')}>×</button>}</div>;
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <div className="metric"><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>;
}

function DataRow({ item, index }: { item: Item; index: number }) {
  return <div className="data-row" role="row" aria-rowindex={index + 2}><span role="cell" className="row-id">{item.id}</span><span role="cell" className="row-name"><span className="avatar">{item.name.slice(0, 1)}</span>{item.name}</span><span role="cell" className="category">{item.category}</span><span role="cell" className="region">{item.region}</span></div>;
}

function VirtualizationDemo() {
  const [query, setQuery] = useState('');
  const [virtual, setVirtual] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const filtered = useMemo(() => filterItems(rows, query), [query]);
  const virtualizer = useVirtualizer({ count: filtered.length, getScrollElement: () => scrollRef.current, estimateSize: () => 56, overscan: 5, getItemKey: index => filtered[index].id, enabled: virtual });
  const virtualRows = virtualizer.getVirtualItems();
  const sample = filtered.slice(0, 500);
  function updateQuery(value: string) { setQuery(value); scrollRef.current?.scrollTo({ top: 0 }); }
  function changeMode(value: boolean) { setVirtual(value); scrollRef.current?.scrollTo({ top: 0 }); }
  return <section id="virtualization" className="demo-card">
    <div className="demo-heading"><div className="demo-icon"><Layers3 size={21}/></div><div><div className="eyebrow">EXPERIMENT 01</div><h2>More data. Less DOM.</h2></div><span className="tech-tag">Virtualization</span></div>
    <p className="description">Explore 10,000 rows without mounting them all. Only the visible window and a small buffer are rendered.</p>
    <div className="controls"><div className="segmented" aria-label="List rendering mode"><button aria-pressed={virtual} onClick={() => changeMode(true)}><Layers3 size={14}/>Virtualized</button><button aria-pressed={!virtual} onClick={() => changeMode(false)}>Standard sample</button></div><span className="quiet">{virtual ? 'Overscan: 5 rows per edge' : 'Safety cap: 500 rows'}</span></div>
    <div className="metrics"><Metric label="DATASET" value="10,000" detail="deterministic records"/><Metric label="MATCHING ROWS" value={number(filtered.length)} detail="across the full dataset"/><Metric label="MOUNTED ROWS ≈" value={number(virtual ? virtualRows.length : sample.length)} detail="estimate from rendered row entries"/></div>
    <SearchField id="list-search" value={query} onChange={updateQuery} placeholder="Search by name, category, city or ID…"/>
    <div className="data-table" role="table" aria-label="Mock project records" aria-colcount={4} aria-rowcount={(virtual ? filtered.length : sample.length) + 1}>
      <div className="table-header" role="row"><span role="columnheader">RECORD ID</span><span role="columnheader">PROJECT</span><span role="columnheader">CATEGORY</span><span role="columnheader">LOCATION</span></div>
      <div className="scroll-area" ref={scrollRef} tabIndex={0} aria-label="Scrollable records" role="rowgroup">
        {filtered.length === 0 ? <div className="empty">No records match “{query}”. Try another search.</div> : virtual ? <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>{virtualRows.map(row => <div key={row.key} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: row.size, transform: `translateY(${row.start}px)` }}><DataRow item={filtered[row.index]} index={row.index}/></div>)}</div> : sample.map((item, index) => <DataRow key={item.id} item={item} index={index}/>)}
      </div>
    </div>
    <div className="table-footer"><span><span className="live-dot"/>{virtual ? 'Virtual window active' : `Showing ${number(sample.length)} of ${number(filtered.length)} matches`}</span><span>Scroll to explore <ArrowDown size={13}/></span></div>
    <div className="lesson"><div className="lesson-label"><Zap size={16}/> WHY IT WORKS</div><p>Virtualization limits DOM work as a list grows. It changes what is mounted, not how many records are searched. The standard mode renders at most 500 matching rows.</p></div>
  </section>;
}

function DebounceDemo() {
  const [mode, setMode] = useState<'immediate' | 'debounced'>('debounced');
  const [query, setQuery] = useState('');
  const [result, setResult] = useState({ items: searchItems, query: '', mode, executions: 0 });
  // Track the last applied input to avoid counting StrictMode's effect replay.
  const applied = useRef({ query: '', mode });
  useEffect(() => {
    if (applied.current.query === query && applied.current.mode === mode) return;
    const run = () => {
      const items = filterItems(searchItems, query);
      applied.current = { query, mode };
      setResult(previous => ({ items, query, mode, executions: previous.executions + 1 }));
    };
    if (mode === 'immediate') { run(); return; }
    const timeout = window.setTimeout(run, 300);
    return () => window.clearTimeout(timeout);
  }, [query, mode]);
  const pending = result.query !== query || result.mode !== mode;
  return <section id="debouncing" className="demo-card">
    <div className="demo-heading"><div className="demo-icon amber"><Timer size={21}/></div><div><div className="eyebrow">EXPERIMENT 02</div><h2>A little pause goes a long way.</h2></div><span className="tech-tag">Debouncing</span></div>
    <p className="description">Search 2,000 items. Compare filtering on every input change with waiting until typing pauses for 300 ms.</p>
    <div className="controls"><div className="segmented" aria-label="Search execution mode"><button aria-pressed={mode === 'immediate'} onClick={() => setMode('immediate')}>Immediate</button><button aria-pressed={mode === 'debounced'} onClick={() => setMode('debounced')}><Timer size={14}/>Debounced</button></div><span className="quiet">{mode === 'debounced' ? 'Delay: 300 ms' : 'Delay: 0 ms'}</span></div>
    <div className="metrics"><Metric label="SEARCH SPACE" value="2,000" detail="deterministic items"/><Metric label="FILTER EXECUTIONS" value={number(result.executions)} detail="input and mode changes since reset"/><Metric label="MATCHING ITEMS" value={number(result.items.length)} detail="for the last applied search"/></div>
    <SearchField id="debounce-search" value={query} onChange={setQuery} placeholder="Try typing “Juniper” quickly…"/>
    <div className={`search-status ${pending ? 'pending' : ''}`} role="status"><span>{pending ? <Timer size={14}/> : <Check size={14}/>} {pending ? 'Waiting to apply your search…' : 'Search is up to date'}</span><span>Applied: <code>{result.query ? `“${result.query}”` : 'all items'}</code></span></div>
    <div className="result-list">{result.items.slice(0, 6).map(item => <div className="result-row" key={item.id}><span className="result-icon"><Layers3 size={17}/></span><div><strong>{item.name}</strong><small>{item.category} <span>·</span> {item.region}</small></div><span className="result-id">{item.id}</span></div>)}{result.items.length === 0 && <div className="empty">No matches. Try “Atlas”, “Tokyo” or a record ID.</div>}</div>
    <div className="table-footer"><span>Previewing {Math.min(6, result.items.length)} of {number(result.items.length)} matches</span><span>Fixed preview size</span></div>
    <div className="lesson"><div className="lesson-label"><Zap size={16}/> WHY IT WORKS</div><p>Debouncing skips intermediate searches during a typing burst. It reduces how often filtering runs; each search still scans all 2,000 items. Type quickly, then pause and watch the counter.</p></div>
  </section>;
}

function App() {
  const [resetKey, setResetKey] = useState(0);
  return <><header className="site-header"><a className="brand" href="#"><span className="brand-icon"><FlaskConical size={20}/></span>react<span className="brand-light">/ performance lab</span></a><span className="header-note"><span className="live-dot"/>A hands-on React playground</span><a className="source-link" href="#experiments">Explore the lab <ArrowUpRight size={16}/></a></header>
    <main><div className="hero"><div className="eyebrow hero-eyebrow"><span/> SMALL CHANGES. OBSERVABLE DIFFERENCES.</div><h1>Make less work.<br/><span>Build better experiences.</span></h1><p>Performance patterns, made tangible. Two focused experiments<br className="desktop-break"/> to help you see what React renders—and when it works.</p><div className="hero-tags"><span><Layers3 size={15}/>10,000 rows</span><span><Timer size={15}/>300 ms debounce</span><span><SlidersHorizontal size={15}/>You’re in control</span></div><div className="hero-mark" aria-hidden="true"><div/><div/><div/><span>render only<br/>what matters.</span></div></div>
      <div className="section-bar" id="experiments"><div><span className="eyebrow">THE WORKBENCH</span><span className="experiment-count">02 experiments</span></div><button className="reset-button" onClick={() => setResetKey(key => key + 1)}><RotateCcw size={14}/>Reset experiments</button></div>
      <div className="demo-grid" key={resetKey}><VirtualizationDemo/><DebounceDemo/></div>
      <div className="bottom-note"><span className="note-icon"><FlaskConical size={19}/></span><div><strong>Observe the work, not a synthetic score.</strong><p>These counters describe this demo’s behavior. There are no simulated FPS numbers or universal speed claims.</p></div><ChevronRight size={18}/></div>
    </main><footer><span>REACT PERFORMANCE LAB <span className="footer-divider">/</span> Built to be explored.</span><span>React + TypeScript <span>·</span> TanStack Virtual</span></footer></>;
}

createRoot(document.getElementById('root')!).render(<StrictMode><App/></StrictMode>);
