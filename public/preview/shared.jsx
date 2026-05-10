// Shared atoms: Eyebrow, Hairline, Mono, ScreenFrame, NavRail.

const { useState, useEffect, useRef, useMemo } = React;

// Editorial mono eyebrow — uppercase JetBrains Mono with wide tracking.
function Eyebrow({ children, className = '', tone = 'walnut' }) {
  const colors = {
    walnut: 'text-walnut-mid',
    brass:  'text-brass-aged',
    bark:   'text-bark',
    paper:  'text-cream',
  };
  return (
    <div className={`mono-eyebrow text-[10px] ${colors[tone]} ${className}`}>{children}</div>
  );
}

// A 1px hairline — horizontal or vertical.
function Rule({ vertical = false, className = '', tone = '' }) {
  if (vertical) {
    return <div className={`w-px self-stretch hairline ${className}`} />;
  }
  return <div className={`h-px w-full hairline ${className}`} />;
}

// Mono numeric tabular cell.
function Mono({ children, className = '' }) {
  return <span className={`font-mono tabular ${className}`}>{children}</span>;
}

// Section header used at the top of each screen — the editorial frame.
// Two lines: a tiny mono breadcrumb and a brass tag.
function ScreenHeader({ section, count, tag, dripNo, time }) {
  return (
    <div className="px-12 pt-8">
      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline gap-4">
          <span className="font-serif italic text-[20px] text-walnut">iRHEA</span>
          <span className="hairline w-6 h-px translate-y-[-4px]" />
          <Eyebrow>{section}</Eyebrow>
          {count != null && (
            <Eyebrow tone="brass" className="ml-2">— {count}</Eyebrow>
          )}
        </div>
        <div className="flex items-baseline gap-5">
          {tag && (
            <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-walnut bg-brass/40 px-2 py-[3px]">
              {tag}
            </span>
          )}
          {dripNo && <Eyebrow tone="bark">Drip No. {dripNo}</Eyebrow>}
          {time && <Mono className="text-[11px] text-bark tracking-[0.18em]">{time}</Mono>}
        </div>
      </div>
      <div className="mt-3 hairline h-px w-full" />
    </div>
  );
}

// Horizontal nav bar at the bottom — replaces the old left rail.
function NavRail({ items, active, onSelect, clock, drip }) {
  return (
    <div className="h-[88px] shrink-0 w-full border-t border-hairline flex bg-paper">
      {/* logotype */}
      <div className="px-6 flex flex-col justify-center border-r border-hairline">
        <div className="font-serif text-[20px] leading-none text-walnut">
          iR<span className="italic text-brass-aged">·</span>L
        </div>
        <div className="mono-eyebrow text-[8px] mt-1 text-bark">v0.9 build 24</div>
      </div>

      {/* tabs */}
      <nav className="flex-1 flex">
        {items.map((it, i) => {
          const isActive = it.id === active;
          return (
            <button
              key={it.id}
              onClick={() => onSelect(it.id)}
              className="group flex-1 text-left px-6 py-3 relative focus:outline-none border-r border-hairline"
            >
              <div className={`nav-tick absolute left-3 right-3 top-0 h-[3px] ${isActive ? 'bg-brass' : 'bg-transparent'}`} />
              <div className={`mono-eyebrow text-[9px] ${isActive ? 'text-walnut' : 'text-bark'} mb-1`}>
                {String(i + 1).padStart(2, '0')}
              </div>
              <div className="flex items-baseline gap-2">
                <div className={`font-serif text-[16px] leading-tight ${isActive ? 'text-walnut' : 'text-walnut-mid opacity-80'}`}>
                  {it.label}
                </div>
                {it.italic && (
                  <div className="font-serif italic text-[12px] text-brass-aged">{it.italic}</div>
                )}
              </div>
            </button>
          );
        })}
      </nav>

      {/* footer status */}
      <div className="px-6 flex flex-col justify-center min-w-[160px]">
        <div className="flex items-center gap-2 mb-1">
          <span className="block w-1.5 h-1.5 rounded-full bg-ok" />
          <Mono className="text-[10px] text-walnut-mid">READY</Mono>
        </div>
        <div className="flex items-baseline gap-3">
          <Mono className="text-[10px] text-bark tabular">{clock}</Mono>
          <Mono className="text-[9px] text-bark tracking-[0.18em]">DRIP {drip}</Mono>
        </div>
      </div>
    </div>
  );
}

// Stub kept so any old reference does not crash.
function _OldNavRail({ items, active, onSelect, clock, drip }) {
  return (
    <div className="w-[112px] shrink-0 h-full border-r border-hairline flex flex-col bg-paper">
      {/* logotype */}
      <div className="px-5 py-6 border-b border-hairline">
        <div className="font-serif text-[22px] leading-none text-walnut">iR<span className="italic text-brass-aged">·</span>L</div>
        <div className="mono-eyebrow text-[8px] mt-1 text-bark">v0.9 build 24</div>
      </div>

      {/* tabs */}
      <nav className="flex-1 pt-4">
        {items.map((it, i) => {
          const isActive = it.id === active;
          return (
            <button
              key={it.id}
              onClick={() => onSelect(it.id)}
              className="group w-full text-left pl-5 pr-3 py-4 relative focus:outline-none"
            >
              <div className={`nav-tick absolute left-0 top-3 bottom-3 w-[3px] ${isActive ? 'bg-brass' : 'bg-transparent'}`} />
              <div className={`mono-eyebrow text-[9px] ${isActive ? 'text-walnut' : 'text-bark'} mb-1`}>{String(i + 1).padStart(2, '0')}</div>
              <div className={`font-serif text-[15px] leading-tight ${isActive ? 'text-walnut' : 'text-walnut-mid'} ${isActive ? '' : 'opacity-80'}`}>
                {it.label}
              </div>
              {it.italic && (
                <div className="font-serif italic text-[12px] text-brass-aged mt-0.5">{it.italic}</div>
              )}
            </button>
          );
        })}
      </nav>

      {/* footer status */}
      <div className="border-t border-hairline px-5 py-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="block w-1.5 h-1.5 rounded-full bg-ok" />
          <Mono className="text-[10px] text-walnut-mid">READY</Mono>
        </div>
        <Mono className="text-[10px] text-bark block tabular">{clock}</Mono>
        <Mono className="text-[9px] text-bark block mt-1 tracking-[0.18em]">DRIP {drip}</Mono>
      </div>
    </div>
  );
}

// Tiny inline icon set — keep to geometric primitives (per design rule).
const Icon = {
  ArrowRight: ({ className = '' }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.25">
      <path d="M4 12 H19 M13 6 L19 12 L13 18" strokeLinecap="square" strokeLinejoin="miter" />
    </svg>
  ),
  ArrowLeft: ({ className = '' }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.25">
      <path d="M20 12 H5 M11 6 L5 12 L11 18" strokeLinecap="square" strokeLinejoin="miter" />
    </svg>
  ),
  Search: ({ className = '' }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.25">
      <circle cx="11" cy="11" r="6" />
      <path d="M16 16 L21 21" strokeLinecap="square" />
    </svg>
  ),
  Plus: ({ className = '' }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.25">
      <path d="M12 5 V19 M5 12 H19" strokeLinecap="square" />
    </svg>
  ),
  Star: ({ className = '', filled = false }) => (
    <svg viewBox="0 0 24 24" className={className} fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.25">
      <path d="M12 4 L14.5 9.5 L20.5 10.2 L16.2 14.4 L17.3 20.3 L12 17.4 L6.7 20.3 L7.8 14.4 L3.5 10.2 L9.5 9.5 Z" strokeLinejoin="miter" />
    </svg>
  ),
  Pause: ({ className = '' }) => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <rect x="7" y="5" width="3" height="14" />
      <rect x="14" y="5" width="3" height="14" />
    </svg>
  ),
  Stop: ({ className = '' }) => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <rect x="6" y="6" width="12" height="12" />
    </svg>
  ),
};

// Format helpers
function fmtTime(s) {
  s = Math.max(0, Math.floor(s));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }

// Default 6-stage skeleton used when a recipe doesn't define its own.
// Scales Bloom/Pour/Pause cadence to whatever total water the recipe targets.
function defaultStagesFor(recipe) {
  const w = recipe.water || 320;
  const bloom  = Math.round(w * 0.125);
  const after1 = Math.round(w * 0.5);
  const after2 = Math.round(w * 0.83);
  return [
    { kind: 'Bloom', to: 30,  water: bloom,  label: 'Bloom' },
    { kind: 'Pour',  to: 70,  water: after1, label: 'First pour' },
    { kind: 'Pause', to: 90,  water: after1, label: 'Pause' },
    { kind: 'Pour',  to: 130, water: after2, label: 'Second pour' },
    { kind: 'Pause', to: 150, water: after2, label: 'Pause' },
    { kind: 'Pour',  to: 180, water: w,      label: 'Final pour' },
  ];
}

// Compute live telemetry from a recipe + elapsed seconds. Used by both the
// Brewing screen and the Spout card mini-view, so they stay in sync.
function getBrewSnapshot(recipe, elapsed) {
  const stages = (recipe.stages && recipe.stages.length) ? recipe.stages : defaultStagesFor(recipe);
  const total  = stages[stages.length - 1].to;
  let currentIndex = stages.length - 1;
  for (let i = 0; i < stages.length; i++) {
    if (elapsed < stages[i].to) { currentIndex = i; break; }
  }
  const cur       = stages[currentIndex];
  const prevTo    = currentIndex === 0 ? 0 : stages[currentIndex - 1].to;
  const stageDur  = Math.max(1, cur.to - prevTo);
  const stagePct  = clamp(((elapsed - prevTo) / stageDur) * 100, 0, 100);
  const prevWater = currentIndex === 0 ? 0 : stages[currentIndex - 1].water;
  const water = cur.kind === 'Pause'
    ? cur.water
    : prevWater + (cur.water - prevWater) * (stagePct / 100);
  const overallPct = clamp((elapsed / total) * 100, 0, 100);
  const flow = cur.kind === 'Pause' ? 0 : 4 + Math.sin(elapsed * 0.6) * 0.4;
  const temp = 93 + Math.sin(elapsed * 0.3) * 0.4;
  return { stages, total, currentIndex, cur, prevTo, stageDur, stagePct, prevWater, water, overallPct, flow, temp };
}

Object.assign(window, {
  Eyebrow, Rule, Mono, ScreenHeader, NavRail, Icon, fmtTime, clamp, getBrewSnapshot,
});
