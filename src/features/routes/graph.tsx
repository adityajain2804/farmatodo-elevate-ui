import React, { useState } from 'react';
import { Network, RotateCcw, Send, SlidersHorizontal } from 'lucide-react';

interface GraphNode {
  type: string;
  label: string;
  position: string;
  colorClass: string;
}

const suggestions: string[] = [
  'Why is Nivea Soft 200ml recommended at 15% in Bogotá but 10% in Medellín?',
  'Which campaigns exceeded supplier limits in Dermocosmética?',
  'Which products have high substitution risk in Mid-Year?',
  'Why was customer C-002795 allocated 20% Prime on Cetaphil?',
  'Show campaigns with positive CATE but negative NIM.',
  'Simulate raising Prime ceiling on OTC from 20% to 25%.',
];

const nodes: GraphNode[] = [
  { type: 'CUSTOMER', label: 'C001 · Champion', position: 'left-[8%] top-[42%]', colorClass: 'border-blue-300 bg-blue-50 text-blue-800' },
  { type: 'PRODUCT', label: 'Nivea Body Lotion 400ml', position: 'left-[28%] top-[42%]', colorClass: 'border-emerald-300 bg-emerald-50 text-emerald-800' },
  { type: 'OFFER', label: '15% Regular / 20% Prime', position: 'left-[52%] top-[42%]', colorClass: 'border-blue-300 bg-blue-50 text-blue-800' },
  { type: 'CONSTRAINT', label: 'Supplier Cap 20%', position: 'left-[75%] top-[20%]', colorClass: 'border-rose-300 bg-rose-50 text-rose-800' },
  { type: 'CAUSAL EFFECT', label: 'CATE · Dose +0.41', position: 'left-[50%] top-[72%]', colorClass: 'border-violet-300 bg-violet-50 text-violet-800' },
];

const scenarioTypes = ['Raise Prime Ceiling', 'Lower Regular Floor', 'Expand Audience', 'Change Mechanic'] as const;
type ScenarioType = typeof scenarioTypes[number];

export const KnowledgeGraphRoute: React.FC = () => {
  const [query, setQuery] = useState('');
  const [answered, setAnswered] = useState(false);
  const [scenario, setScenario] = useState<ScenarioType>('Raise Prime Ceiling');
  const [ceiling, setCeiling] = useState(25);
  const [simulated, setSimulated] = useState(false);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(nodes[2]); // OFFER node selected by default

  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(node);
  };

  const handleWhyButton = () => {
    if (selectedNode) {
      setQuery(`Why was ${selectedNode.label} assigned under the current ${selectedNode.type.toLowerCase()} configuration?`);
      setAnswered(true);
    }
  };

  const handleAsk = () => {
    if (query.trim()) setAnswered(true);
  };

  const handleSuggestionClick = (text: string) => {
    setQuery(text);
    setAnswered(false);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <header className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Knowledge Graph</h2>
          <p className="text-xs text-slate-500">Phase 3 ontology — how every business entity, constraint and causal effect connects.</p>
        </div>
        <button
          onClick={handleWhyButton}
          className="h-8 px-3 rounded bg-blue-600 text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-blue-700 transition-colors"
          title={selectedNode ? `Pre-fill copilot for: ${selectedNode.label}` : 'Select a node first'}
        >
          🔍 WHY? — Causal Trace
        </button>
      </header>

      {/* Filter Bar */}
      <div className="bg-slate-50 border-y border-slate-200 p-3 flex flex-wrap items-end gap-2">
        {['Campaign', 'Category', 'Channel', 'Customer Segment', 'Behavioral Cluster'].map(label => (
          <label key={label} className="flex flex-col gap-1 text-[9px] font-bold uppercase text-slate-400">
            <span>{label}</span>
            <select className="h-8 w-36 px-2 bg-white border border-slate-200 rounded text-xs text-slate-700">
              <option>{label === 'Customer Segment' || label === 'Behavioral Cluster' ? 'All' : 'Select'}</option>
            </select>
          </label>
        ))}
        <button className="h-8 px-2.5 rounded border border-slate-200 bg-white text-xs flex items-center gap-1 text-slate-600 hover:bg-slate-100 transition-colors">
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* Graph Health KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Triple Density', value: '18.4', sub: 'triples / entity', color: 'text-slate-900' },
          { label: 'Schema Compliance', value: '97.8%', sub: 'validated triples', color: 'text-emerald-600' },
          { label: 'Constraint Breaches', value: '12', sub: 'active', color: 'text-amber-600' },
          { label: 'Competitor Mapping', value: '84.1%', sub: 'SKUs mapped', color: 'text-blue-600' },
          { label: 'Path Connectivity', value: '0.91', sub: 'traceable paths', color: 'text-slate-900' },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs">
            <div className="text-[10px] uppercase font-bold text-slate-500">{label}</div>
            <div className={`text-lg font-bold mt-1 ${color}`}>{value}</div>
            <div className="text-[10px] text-slate-400">{sub}</div>
          </div>
        ))}
      </div>

      {/* Semantic KPI Chips */}
      <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-2">
        {[
          { label: 'NIM', value: '$2.10' },
          { label: 'DER', value: '3.4x' },
          { label: 'PPM', value: '1.28' },
          { label: 'CATE Exposure', value: '+0.06' },
          { label: 'CATE Dose', value: '+0.41' },
          { label: 'Pull Fwd', value: '9.4%' },
          { label: 'Cannib Loss', value: '$412' },
        ].map(({ label, value }) => (
          <div key={label} className="rounded bg-slate-100 px-3 py-1.5 text-[10px] cursor-pointer hover:bg-blue-100 transition-colors">
            <span className="text-slate-400">{label}</span>
            <b className="ml-2 text-slate-800">{value}</b>
          </div>
        ))}
      </div>

      {/* Main Canvas + Right Panel */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-0 bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">

        {/* Ontology Network Canvas — 65% */}
        <div className="xl:col-span-8 min-h-[480px] p-3 border-r border-slate-200 flex flex-col">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-3">
            <Network className="w-4 h-4 text-blue-600" />
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Ontology Network</h3>
              <p className="text-[10px] text-slate-400">13 entities · 13 relationships · Colombia · Click a node to inspect</p>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 mb-3">
            {[
              { color: 'bg-blue-400', label: 'Customer / Offer' },
              { color: 'bg-emerald-400', label: 'Product / Category' },
              { color: 'bg-amber-400', label: 'Campaign / Channel' },
              { color: 'bg-rose-400', label: 'Constraint / Supplier' },
              { color: 'bg-violet-400', label: 'Causal Effect' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-[9px] text-slate-500">
                <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                {label}
              </div>
            ))}
          </div>

          <div className="relative flex-1 bg-slate-50 rounded border border-slate-200 overflow-hidden" style={{ minHeight: 340 }}>
            {/* Edge lines */}
            <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
              <defs>
                <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L6,3 Z" fill="#94a3b8" />
                </marker>
              </defs>
              <line x1="15%" y1="50%" x2="33%" y2="50%" stroke="#cbd5e1" strokeWidth="1.5" markerEnd="url(#arrow)" />
              <line x1="35%" y1="50%" x2="58%" y2="50%" stroke="#cbd5e1" strokeWidth="1.5" markerEnd="url(#arrow)" />
              <line x1="60%" y1="47%" x2="78%" y2="28%" stroke="#cbd5e1" strokeWidth="1.5" markerEnd="url(#arrow)" />
              <line x1="60%" y1="53%" x2="57%" y2="74%" stroke="#cbd5e1" strokeWidth="1.5" markerEnd="url(#arrow)" />
              {/* Edge labels */}
              <text x="23%" y="47%" fontSize="8" fill="#94a3b8" textAnchor="middle" className="select-none">responds_to</text>
              <text x="48%" y="47%" fontSize="8" fill="#94a3b8" textAnchor="middle" className="select-none">assigned_offer</text>
              <text x="71%" y="37%" fontSize="8" fill="#94a3b8" textAnchor="middle" className="select-none" transform="rotate(-25 71% 37%)">constrained_by</text>
              <text x="62%" y="67%" fontSize="8" fill="#94a3b8" textAnchor="middle" className="select-none">hasCATEResult</text>
            </svg>

            {/* Nodes */}
            {nodes.map(node => (
              <button
                key={node.type}
                onClick={() => handleNodeClick(node)}
                className={`absolute ${node.position} w-44 rounded border-2 p-2 text-left transition-all hover:shadow-md
                  ${node.colorClass}
                  ${selectedNode?.type === node.type ? 'shadow-md ring-2 ring-offset-1 ring-blue-400' : 'border-opacity-60'}
                `}
              >
                <div className="text-[9px] uppercase font-bold opacity-70">{node.type}</div>
                <div className="text-[10px] font-semibold mt-0.5">{node.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Panel — 35% */}
        <aside className="xl:col-span-4 divide-y divide-slate-100 flex flex-col">

          {/* Panel 1 — Entity Inspector */}
          <div className="p-3">
            <h3 className="text-xs font-bold uppercase text-slate-500 mb-2">Entity Inspector</h3>
            {selectedNode ? (
              <>
                <div className={`inline-flex px-2 py-0.5 rounded text-[9px] uppercase font-bold mb-2 ${selectedNode.colorClass}`}>
                  {selectedNode.type}
                </div>
                <div className="text-sm font-semibold text-blue-700 mb-2">{selectedNode.label}</div>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  {[
                    { label: 'Expected NIM', value: '$2.10' },
                    { label: 'Confidence', value: 'High' },
                    { label: 'Effective Cap', value: '20%' },
                    { label: 'CATE Dose', value: '+0.41' },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-slate-50 border border-slate-200 rounded p-2">
                      <span className="text-slate-400 block">{label}</span>
                      <b className="text-slate-800">{value}</b>
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-[9px] text-slate-400">
                  <div className="font-semibold text-slate-500 uppercase mb-1">Relationships</div>
                  <div>→ contains — Mid-Year Reactivation</div>
                  <div>→ respondsTo — C001 · Champion</div>
                  <div>→ hasCATEResult — Dose +0.41</div>
                </div>
                <div className="mt-2 text-[9px] text-slate-400">
                  <div className="font-semibold text-slate-500 uppercase mb-1">Provenance</div>
                  <div>Dataset: ft_promo_snap · Model: feat-v3.4.1 · Country: Colombia</div>
                </div>
              </>
            ) : (
              <p className="text-[10px] text-slate-400 italic text-center mt-4">Click any node in the graph to inspect its attributes</p>
            )}
          </div>

          {/* Panel 2 — Conversational Planning Copilot */}
          <div className="p-3 flex flex-col gap-2">
            <h3 className="text-xs font-bold uppercase text-slate-500">Conversational Planning Copilot</h3>
            <p className="text-[10px] text-slate-400">Translates natural language into graph traversals</p>

            <div className="text-[9px] uppercase text-slate-400 font-semibold">Suggested Queries</div>
            <div className="space-y-0.5 max-h-32 overflow-y-auto">
              {suggestions.map(item => (
                <button
                  key={item}
                  onClick={() => handleSuggestionClick(item)}
                  className="block w-full rounded bg-slate-50 hover:bg-blue-50 border-b border-slate-100 p-1.5 text-left text-[9px] text-slate-600 transition-colors"
                >
                  🔍 {item}
                </button>
              ))}
            </div>

            <div className="flex gap-1">
              <input
                value={query}
                onChange={e => { setQuery(e.target.value); setAnswered(false); }}
                onKeyDown={e => e.key === 'Enter' && handleAsk()}
                placeholder="Ask about campaign reasoning, constraints or CATE..."
                className="h-8 min-w-0 flex-1 border border-slate-200 rounded px-2 text-[10px] focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
              <button onClick={handleAsk} className="h-8 px-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                <Send className="w-3 h-3" />
              </button>
            </div>

            {answered && query && (
              <div className="rounded bg-blue-50 border border-blue-100 p-2 text-[9px] text-blue-800 animate-fade-in">
                <div className="font-semibold mb-1.5">"{query}"</div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {[['Dose CATE', '+0.41'], ['Expected NIM', '$2.10'], ['Effective Cap', '20%'], ['Optimizer Choice', '15%/20%']].map(([k, v]) => (
                    <span key={k} className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-semibold">{k}: {v}</span>
                  ))}
                </div>
                <ol className="space-y-1 text-[9px] list-decimal list-inside">
                  <li>Customer Cluster B in Bogotá exhibits higher CATE elasticity (1.82 vs 1.14) for Skincare.</li>
                  <li>Supplier cap for Nivea (Beiersdorf LATAM) constrains Prime discount to 20% maximum.</li>
                  <li>Medellín cluster shows lower affinity_score — optimizer assigns 10% to maximize DER above 1.5× floor.</li>
                </ol>
                <div className="text-[8px] text-slate-400 mt-1.5 italic">Source: optimizer_decision_log · Model: optimize-milo-v3.1 · Confidence: 89%</div>
              </div>
            )}
          </div>

          {/* Panel 3 — Macro Scenario Simulator */}
          <div className="p-3 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-blue-600" />
              <div>
                <h3 className="text-xs font-bold uppercase text-slate-500">Macro Scenario Simulator</h3>
                <p className="text-[10px] text-slate-400">Simulate a policy change before committing</p>
              </div>
            </div>

            {/* Scenario Type Selector */}
            <div className="grid grid-cols-2 gap-1">
              {scenarioTypes.map(type => (
                <button
                  key={type}
                  onClick={() => { setScenario(type); setSimulated(false); }}
                  className={`rounded px-1.5 py-1.5 text-[9px] font-semibold transition-colors ${scenario === type ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Parameter Slider */}
            <div>
              <div className="flex items-center justify-between text-[10px] text-slate-600 mb-1">
                <span>Raise OTC Prime ceiling from 20% to:</span>
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-bold text-[10px]">{ceiling}%</span>
              </div>
              <input
                type="range"
                min={20}
                max={35}
                value={ceiling}
                onChange={e => { setCeiling(Number(e.target.value)); setSimulated(false); }}
                className="w-full h-1.5 accent-blue-600"
              />
              <div className="flex justify-between text-[8px] text-slate-400 mt-0.5">
                <span>20%</span><span>35%</span>
              </div>
            </div>

            <button
              onClick={() => setSimulated(true)}
              className="w-full h-8 rounded bg-blue-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-blue-700 transition-colors"
            >
              ▶ Simulate Impact
            </button>

            {simulated && (
              <div className="grid grid-cols-3 gap-1.5">
                <div className="rounded bg-emerald-50 border border-emerald-200 p-1.5">
                  <b className="text-emerald-700 text-xs block">+$8.4M</b>
                  <div className="text-[8px] text-emerald-700">Expected NIM uplift across 6 campaigns</div>
                </div>
                <div className="rounded bg-blue-50 border border-blue-200 p-1.5">
                  <b className="text-blue-700 text-xs block">+4,200</b>
                  <div className="text-[8px] text-blue-700">Additional units (Deciles 1–3 only)</div>
                </div>
                <div className="rounded bg-amber-50 border border-amber-200 p-1.5">
                  <b className="text-amber-700 text-xs block">-2.1pp</b>
                  <div className="text-[8px] text-amber-700">DER — still above 1.5× floor ✓</div>
                </div>
                <div className="col-span-3 flex gap-1.5 mt-1">
                  <button className="flex-1 h-7 rounded bg-blue-600 text-white text-[9px] font-semibold hover:bg-blue-700 transition-colors">
                    Apply to Campaign Plan
                  </button>
                  <button className="flex-1 h-7 rounded border border-slate-300 text-slate-600 text-[9px] font-semibold hover:bg-slate-50 transition-colors">
                    Export Scenario
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>
      </section>
    </div>
  );
};
