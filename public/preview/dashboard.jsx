// Dashboard — Spout Control. 5-spout grid + vital signs.
// Spout 03 is wired to the live brewing simulation: it shows a compact
// hand-drip animation, the current stage, and live percentage.

// Compact V60 hand-drip schematic for use inside a spout card.
function HandDripMini({ stageKind, water, target, paused }) {
  const isPouring = stageKind === 'Pour' || stageKind === 'Bloom';
  const isBloom   = stageKind === 'Bloom';
  const isPause   = stageKind === 'Pause';

  const fillPct = clamp((water / (target || 1)) * 100, 0, 100);
  const ST = 240, SB = 360;
  const fluidY = SB - 4 - (fillPct / 100) * (SB - ST - 6);
  const cid = `mini-clip-${Math.round(target * 100) || 0}`;

  return (
    <svg
      viewBox="0 0 200 410"
      preserveAspectRatio="xMidYMid meet"
      className={`w-full h-full ${paused ? 'hd-paused' : ''}`}
    >
      <defs>
        <clipPath id={cid}>
          <path d="M70 240 L70 332 Q70 358 96 358 L124 358 Q150 358 150 332 L150 240 Z" />
        </clipPath>
      </defs>

      {/* faint grid */}
      <g stroke="rgba(60,40,20,0.05)" strokeWidth="1">
        {Array.from({ length: 11 }).map((_, i) => (
          <line key={i} x1="0" y1={i * 40} x2="200" y2={i * 40} />
        ))}
      </g>

      {/* steam */}
      {isPouring && (
        <g fill="rgba(108,90,72,0.5)">
          <ellipse className="hd-steam"   cx="50" cy="46" rx="3" ry="2" />
          <ellipse className="hd-steam-2" cx="56" cy="46" rx="2.5" ry="1.5" />
        </g>
      )}

      {/* Kettle (mini, gooseneck side view) */}
      {isPouring ? (
        <g className="hd-kettle">
          <path d="M22 64 L22 96 Q22 106 32 106 L70 106 Q82 106 82 96 L82 70 Q82 64 76 64 Z" fill="#FCFAF4" stroke="#2C2317" strokeWidth="1" />
          <line x1="28" y1="64" x2="76" y2="64" stroke="#2C2317" strokeWidth="1" />
          <rect x="44" y="56" width="14" height="4" fill="#C5A059" />
          <path d="M82 74 L104 70 Q114 68 116 78 L116 88 L108 88 L108 80 Q108 76 102 76 L82 80 Z" fill="#FCFAF4" stroke="#2C2317" strokeWidth="1" />
          <path d="M22 70 Q10 70 10 90 Q10 106 22 106" fill="none" stroke="#2C2317" strokeWidth="1" />
        </g>
      ) : (
        <g opacity="0.4">
          <path d="M22 64 L22 96 Q22 106 32 106 L70 106 Q82 106 82 96 L82 70 Q82 64 76 64 Z" fill="#FCFAF4" stroke="#2C2317" strokeWidth="1" />
          <rect x="44" y="56" width="14" height="4" fill="#8B6F3D" />
          <path d="M82 74 L104 70 Q114 68 116 78 L116 88 L108 88 L108 80 Q108 76 102 76 L82 80 Z" fill="#FCFAF4" stroke="#2C2317" strokeWidth="1" />
          <path d="M22 70 Q10 70 10 90 Q10 106 22 106" fill="none" stroke="#2C2317" strokeWidth="1" />
        </g>
      )}

      {/* stream */}
      {isPouring && (
        <g className="hd-stream-wrap">
          <line x1="112" y1="88" x2="112" y2="138" stroke="#1B3A4B" strokeWidth="1.6" strokeDasharray="3 3" className="hd-stream" />
          <line x1="112" y1="88" x2="112" y2="138" stroke="rgba(27,58,75,0.25)" strokeWidth="3" />
        </g>
      )}

      {/* V60 cone */}
      <ellipse cx="110" cy="142" rx="40" ry="4.5" fill="#FCFAF4" stroke="#2C2317" strokeWidth="1" />
      <path d="M70 142 L150 142 L116 222 L104 222 Z" fill="#F5EDE0" stroke="#2C2317" strokeWidth="1" />
      {/* ribs */}
      <g stroke="rgba(60,40,20,0.18)" strokeWidth="0.7" fill="none">
        <line x1="86" y1="142" x2="108" y2="220" />
        <line x1="98" y1="142" x2="111" y2="220" />
        <line x1="122" y1="142" x2="113" y2="220" />
        <line x1="134" y1="142" x2="115" y2="220" />
      </g>

      {/* coffee bed */}
      <ellipse cx="110" cy="142" rx="38" ry={isBloom ? 5.5 : 3.8} fill="#4A3A26" />
      <ellipse cx="110" cy={140 - (isBloom ? 4.5 : 3)} rx="32" ry={isBloom ? 3.8 : 2.5} fill="#6A5B48" className="hd-shimmer" />

      {/* bed ripples on pour */}
      {isPouring && (
        <g fill="none" stroke="rgba(197,160,89,0.55)" strokeWidth="0.7" strokeDasharray="2 3">
          <ellipse className="hd-bed-ring" cx="110" cy="142" rx="14" ry="1.8" />
          <ellipse className="hd-bed-ring" cx="110" cy="142" rx="26" ry="3"   style={{ animationDelay: '0.4s' }} />
          <ellipse className="hd-bed-ring" cx="110" cy="142" rx="36" ry="3.8" style={{ animationDelay: '0.8s', opacity: 0.5 }} />
        </g>
      )}

      {/* drip from cone tip */}
      {(isPouring || isPause) && (
        <g transform="translate(110 226)">
          <ellipse className="hd-drip"   cx="0" cy="0" rx="1.6" ry="2.4" fill="#2C2317" />
          {!isPause && <ellipse className="hd-drip-2" cx="0" cy="0" rx="1.3" ry="2" fill="#2C2317" />}
        </g>
      )}

      {/* server (glass carafe) */}
      <path
        d="M70 240 L70 332 Q70 358 96 358 L124 358 Q150 358 150 332 L150 240 Z"
        fill="rgba(252,250,244,0.5)" stroke="#2C2317" strokeWidth="1"
      />
      <g clipPath={`url(#${cid})`}>
        <rect x="70" y={fluidY} width="80" height="130" fill="#2C2317" />
        <ellipse cx="110" cy={fluidY} rx="38" ry="2.5" fill="#1c1610" />
        <ellipse cx="110" cy={fluidY - 0.8} rx="34" ry="1.5" fill="rgba(197,160,89,0.35)" />
        {(isPouring || isPause) && (
          <ellipse className="hd-ripple" cx="110" cy={fluidY} rx="10" ry="1.5"
                   fill="none" stroke="rgba(197,160,89,0.6)" strokeWidth="0.8" />
        )}
      </g>
      <path d="M150 244 L160 240 L160 248 L150 252 Z" fill="#FCFAF4" stroke="#2C2317" strokeWidth="1" />

      {/* graduations */}
      <g stroke="#2C2317" strokeWidth="0.6">
        <line x1="70" y1="270" x2="76" y2="270" />
        <line x1="70" y1="300" x2="76" y2="300" />
        <line x1="70" y1="330" x2="76" y2="330" />
      </g>
    </svg>
  );
}

const SPOUT_BASE = [
  { id: 1, state: 'idle',  label: 'Ready' },
  { id: 2, state: 'idle',  label: 'Ready' },
  { id: 3, state: 'idle',  label: 'Ready' },
  { id: 4, state: 'idle',  label: 'Ready' },
  { id: 5, state: 'error', label: 'Halted', recipe: 'Sidamo Natural', pct: 18, stage: 'Flow obstructed' },
];

function VitalCell({ label, value, sub, status }) {
  const dot = status === 'ok' ? 'bg-ok' : status === 'warn' ? 'bg-warning' : status === 'err' ? 'bg-error' : 'bg-bark';
  return (
    <div className="flex-1 px-6 py-5 relative">
      <div className="flex items-center gap-2 mb-2">
        <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
        <Eyebrow>{label}</Eyebrow>
      </div>
      <div className="font-mono tabular text-walnut text-[24px] leading-none">{value}</div>
      {sub && <Mono className="text-[10px] text-bark mt-1.5 block">{sub}</Mono>}
    </div>
  );
}

// Stage chip strip — visual breadcrumb of the 6 brewing stages.
function StageStrip({ stages, currentIndex, paused }) {
  return (
    <div className="flex items-center gap-1 mt-2">
      {stages.map((s, i) => {
        const past = i < currentIndex;
        const now  = i === currentIndex;
        const dotCls = now
          ? `bg-brass ${paused ? '' : 'animate-pulse'}`
          : past ? 'bg-walnut-mid' : 'bg-sand';
        return (
          <div key={i} className="flex items-center gap-1">
            <span className={`block w-1.5 h-1.5 rounded-full ${dotCls}`} />
            {i < stages.length - 1 && <span className="block w-2 h-px hairline" />}
          </div>
        );
      })}
    </div>
  );
}

// SpoutCard — different layout per state.
function SpoutCard({ s, brewing, isActive, loadedRecipe, onActivate, onStartLoaded, onUnload }) {
  // Loaded state — recipe selected, ready to brew, not yet started.
  if (loadedRecipe && !isActive) {
    const r = loadedRecipe;
    return (
      <div className="relative bg-paper border border-hairline flex flex-col h-full overflow-hidden">
        <div className="px-4 pt-4 pb-2 flex items-start justify-between">
          <div>
            <Eyebrow tone="brass">Spout {String(s.id).padStart(2, '0')}</Eyebrow>
            <Mono className="text-[9px] text-bark tracking-[0.22em] mt-1.5 block">LOADED · STAGED</Mono>
          </div>
          <button
            onClick={() => onUnload && onUnload(s.id)}
            aria-label="Remove recipe"
            className="w-7 h-7 flex items-center justify-center border border-hairline hover:bg-cream"
          >
            <svg viewBox="0 0 16 16" className="w-3 h-3 text-bark" stroke="currentColor" strokeWidth="1.4" fill="none">
              <path d="M3 3 L13 13 M13 3 L3 13" strokeLinecap="square" />
            </svg>
          </button>
        </div>

        <div className="px-4 pt-2 pb-3 flex-1 flex flex-col">
          <Mono className="text-[10px] text-bark tracking-[0.18em] block">NO. {r.no} · {r.method.toUpperCase()}</Mono>
          <h3 className="font-serif text-walnut text-[22px] leading-tight mt-1.5 balance">
            <span className="italic">{r.name}</span>
          </h3>
          <Mono className="text-[10px] text-bark tracking-[0.18em] mt-1 block">{r.region.toUpperCase()}</Mono>

          <p className="font-serif italic text-walnut-mid text-[12.5px] leading-snug mt-2.5 pretty line-clamp-3">"{r.note}"</p>

          <div className="flex-1" />

          {/* Tiny ledger */}
          <div className="grid grid-cols-3 gap-1 mt-3 text-center border-t border-hairline pt-2.5">
            <div>
              <Mono className="text-[8px] text-bark tracking-[0.18em] block">DOSE</Mono>
              <Mono className="text-[12px] text-walnut tabular mt-0.5 block">{r.dose}g</Mono>
            </div>
            <div>
              <Mono className="text-[8px] text-bark tracking-[0.18em] block">WATER</Mono>
              <Mono className="text-[12px] text-walnut tabular mt-0.5 block">{r.water}ml</Mono>
            </div>
            <div>
              <Mono className="text-[8px] text-bark tracking-[0.18em] block">TEMP</Mono>
              <Mono className="text-[12px] text-walnut tabular mt-0.5 block">{r.temp}°</Mono>
            </div>
          </div>
        </div>

        {/* Two-action footer */}
        <div className="border-t border-hairline grid grid-cols-[1fr_1.4fr]">
          <button
            onClick={onActivate}  /* re-open picker to change recipe */
            className="px-3 py-3 border-r border-hairline hover:bg-cream focus:outline-none flex items-center justify-center"
          >
            <Mono className="text-[10px] text-walnut-mid tracking-[0.22em]">CHANGE</Mono>
          </button>
          <button
            onClick={() => onStartLoaded && onStartLoaded(s.id)}
            className="px-3 py-3 bg-walnut text-cream hover:bg-walnut-mid focus:outline-none flex items-center justify-center gap-2 transition"
          >
            <Mono className="text-[10px] tracking-[0.22em]" style={{ color: 'var(--cream, #F5EDE0)' }}>START BREW</Mono>
            <Icon.ArrowRight className="w-3.5 h-3.5 text-brass" />
          </button>
        </div>
      </div>
    );
  }

  // Wire the active brewing spout to the live brew snapshot.
  if (isActive && brewing) {
    const { snap, recipe, paused } = brewing;
    const { cur, currentIndex, stages, water, overallPct, flow, total } = snap;
    return (
      <button
        onClick={onActivate}
        className="relative bg-paper border border-hairline text-left flex flex-col h-full overflow-hidden focus:outline-none hover:border-[var(--hairline-strong)] transition"
      >
        {/* header */}
        <div className="px-4 pt-4 pb-2 flex items-start justify-between">
          <div>
            <Eyebrow tone="bark">Spout {String(s.id).padStart(2, '0')}</Eyebrow>
            <div className="font-serif text-[20px] leading-none mt-1.5 text-walnut">
              {paused ? 'Paused' : cur.label}
            </div>
            <Mono className="text-[9px] text-bark tracking-[0.2em] mt-1 block">{cur.kind.toUpperCase()}</Mono>
          </div>
          <div className="flex flex-col items-end">
            <div className="font-mono tabular text-walnut text-[26px] leading-none">
              {Math.round(overallPct)}<span className="text-[12px] text-brass-aged">%</span>
            </div>
            <Mono className="text-[9px] text-bark tracking-[0.2em] mt-1 block">
              {fmtTime(snap.total - 0)} TOTAL
            </Mono>
          </div>
        </div>

        {/* live mini animation */}
        <div className="relative flex-1 mx-3 mb-2 bg-paper border border-hairline overflow-hidden">
          <HandDripMini stageKind={cur.kind} water={water} target={recipe.water} paused={paused} />
          <div className="absolute left-2 top-2 flex items-center gap-1.5">
            <span className={`block w-1.5 h-1.5 rounded-full ${paused ? 'bg-warning' : 'bg-error animate-pulse'}`} />
            <Mono className="text-[8px] text-walnut tracking-[0.2em]">{paused ? 'PAUSED' : 'LIVE'}</Mono>
          </div>
          <div className="absolute right-2 top-2">
            <Mono className="text-[8px] text-walnut tracking-[0.2em]">{snap.temp.toFixed(1)}°</Mono>
          </div>
        </div>

        {/* recipe + stage strip */}
        <div className="px-4 pb-2">
          <Mono className="text-[9px] text-bark tracking-[0.2em] block">RECIPE · NO. {recipe.no}</Mono>
          <div className="font-serif italic text-walnut text-[14px] mt-0.5">{recipe.name}</div>
          <StageStrip stages={stages} currentIndex={currentIndex} paused={paused} />
        </div>

        {/* ledger row */}
        <div className="border-t border-hairline grid grid-cols-3 text-center">
          <div className="px-2 py-2 border-r border-hairline">
            <Mono className="text-[8px] text-bark tracking-[0.18em] block">ELAPSED</Mono>
            <Mono className="text-[12px] text-walnut tabular mt-0.5 block">{fmtTime(snap.total ? Math.round((overallPct / 100) * total) : 0)}</Mono>
          </div>
          <div className="px-2 py-2 border-r border-hairline">
            <Mono className="text-[8px] text-bark tracking-[0.18em] block">WATER</Mono>
            <Mono className="text-[12px] text-walnut tabular mt-0.5 block">{Math.round(water)}g</Mono>
          </div>
          <div className="px-2 py-2">
            <Mono className="text-[8px] text-bark tracking-[0.18em] block">FLOW</Mono>
            <Mono className="text-[12px] text-walnut tabular mt-0.5 block">{flow.toFixed(1)}</Mono>
          </div>
        </div>

        {/* footer */}
        <div className="border-t border-hairline px-4 py-2.5 flex items-center justify-between">
          <Mono className="text-[10px] text-walnut tracking-[0.22em]">OPEN BREW</Mono>
          <Icon.ArrowRight className="w-4 h-4 text-brass-aged" />
        </div>
      </button>
    );
  }

  // Idle and error states (smaller, calmer cards).
  const isError = s.state === 'error';
  return (
    <button
      onClick={onActivate}
      className="relative bg-paper border border-hairline text-left flex flex-col h-full overflow-hidden focus:outline-none hover:border-[var(--hairline-strong)] transition"
    >
      <div className="px-5 pt-5 pb-3 flex items-start justify-between">
        <div>
          <Eyebrow tone={isError ? 'brass' : 'bark'}>Spout {String(s.id).padStart(2, '0')}</Eyebrow>
          <div className={`font-serif text-[28px] leading-none mt-2 ${isError ? 'text-error' : 'text-walnut'}`}>
            {s.label}
          </div>
        </div>
        <span className={`block w-2 h-2 rounded-full mt-2 ${isError ? 'bg-error' : 'bg-ok'}`} />
      </div>
      <div className="flex-1 px-5">
        {s.recipe ? (
          <>
            <Mono className="text-[10px] text-bark tracking-[0.2em] block">RECIPE</Mono>
            <div className="font-serif italic text-[15px] text-walnut mt-1">{s.recipe}</div>
            {s.stage && <Mono className="text-[10px] text-bark tracking-[0.18em] mt-2 block">{s.stage}</Mono>}
          </>
        ) : (
          <p className="font-serif italic text-bark text-[14px] mt-1 pretty">
            Awaiting recipe — tap to load.
          </p>
        )}
      </div>
      <div className="h-px hairline" />
      <div className="px-5 py-3 flex items-center justify-between">
        <Mono className="text-[10px] text-walnut-mid tracking-[0.2em]">
          {isError ? 'INTERVENE' : 'TAP TO LOAD'}
        </Mono>
        <Icon.ArrowRight className={`w-4 h-4 ${isError ? 'text-error' : 'text-brass-aged'}`} />
      </div>
    </button>
  );
}

// Inline recipe picker — slides over the dashboard so the operator picks
// without leaving the screen. Lists all RECIPES; click → startBrew on the spout.
function SpoutRecipePicker({ spout, onPick, onClose }) {
  const [q, setQ] = React.useState('');
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  const filtered = RECIPES.filter((r) => {
    if (!q) return true;
    return (r.name + r.region + r.note).toLowerCase().includes(q.toLowerCase());
  });

  const spoutLabel = String(spout.id).padStart(2, '0');

  return (
    <div
      className="absolute inset-0 z-50 flex items-end justify-center"
      style={{
        background: mounted ? 'rgba(28, 22, 16, 0.55)' : 'rgba(28, 22, 16, 0)',
        backdropFilter: mounted ? 'blur(4px)' : 'blur(0px)',
        transition: 'background 240ms ease, backdrop-filter 240ms ease',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-paper border-t border-hairline w-full max-h-[82%] flex flex-col"
        style={{
          transform: mounted ? 'translateY(0)' : 'translateY(20px)',
          opacity: mounted ? 1 : 0,
          transition: 'transform 280ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 240ms ease',
          boxShadow: '0 -24px 60px rgba(40,30,10,0.22)',
        }}
      >
        {/* Editorial header — big italic spout number anchors the sheet */}
        <div className="px-12 pt-7 pb-5 flex items-end justify-between border-b border-hairline">
          <div className="flex items-end gap-7">
            {/* Spout marker */}
            <div className="flex flex-col items-center pb-1">
              <Mono className="text-[9px] text-bark tracking-[0.24em]">SPOUT</Mono>
              <span className="font-serif italic text-walnut leading-none mt-1" style={{ fontSize: 64, letterSpacing: '-0.02em' }}>
                {spoutLabel}
              </span>
            </div>
            <span className="hairline w-px h-14 self-end" />
            <div className="pb-1">
              <Eyebrow tone="brass">Load a recipe</Eyebrow>
              <h2 className="font-serif text-walnut mt-1 leading-[1.02] balance" style={{ fontSize: 40, letterSpacing: '-0.025em' }}>
                Pick a <span className="italic">recipe.</span>
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-5 pb-1">
            <Mono className="text-[11px] text-bark tracking-[0.22em]">{filtered.length} / {RECIPES.length}</Mono>
            <button
              onClick={onClose}
              aria-label="Close picker"
              className="w-9 h-9 flex items-center justify-center border border-hairline hover:bg-cream focus:outline-none"
            >
              <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 text-walnut" stroke="currentColor" strokeWidth="1.4" fill="none">
                <path d="M3 3 L13 13 M13 3 L3 13" strokeLinecap="square" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search — editorial italic field */}
        <div className="px-12 py-3 border-b border-hairline flex items-center gap-4">
          <Icon.Search className="w-4 h-4 text-brass-aged" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search regions, varietals, notes…"
            autoFocus
            className="flex-1 bg-transparent font-serif italic text-[18px] text-walnut placeholder:text-bark/60 outline-none"
          />
          {q && (
            <button onClick={() => setQ('')} className="text-bark/70 hover:text-walnut">
              <Mono className="text-[10px] tracking-[0.22em]">CLEAR</Mono>
            </button>
          )}
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-auto px-12 py-5">
          {filtered.length === 0 ? (
            <div className="font-serif italic text-bark text-[20px] py-12 text-center">
              No matches for <span className="text-walnut">"{q}"</span>.
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {filtered.map((r) => (
                <button
                  key={r.no}
                  onClick={() => onPick(r)}
                  className="bg-cream border border-hairline text-left p-4 flex flex-col hover:border-[var(--hairline-strong)] hover:bg-paper focus:outline-none focus:border-brass transition group"
                >
                  <div className="flex items-baseline justify-between">
                    <Eyebrow tone="brass">No. {r.no} · {r.method}</Eyebrow>
                    {r.favourite && <Icon.Star className="w-3 h-3 text-brass" filled />}
                  </div>
                  <h3 className="font-serif text-walnut text-[22px] leading-tight mt-2 balance">
                    <span className="italic">{r.name}</span>
                  </h3>
                  <Mono className="text-[10px] text-bark tracking-[0.18em] mt-0.5 block">{r.region.toUpperCase()}</Mono>
                  <p className="font-serif italic text-walnut-mid text-[12.5px] leading-snug mt-2.5 pretty line-clamp-2">"{r.note}"</p>
                  <div className="flex-1" />
                  <div className="mt-3 pt-2.5 border-t border-hairline flex items-center justify-between">
                    <Mono className="text-[11px] text-walnut tracking-[0.18em]">{r.ratio}</Mono>
                    <Mono className="text-[10px] text-bark tracking-[0.18em]">{r.dose}g · {r.water}ml</Mono>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DashboardScreen({ recipe, activeSpout, loadedSpouts = {}, brewState, onOpenBrewing, onPickRecipe, onStartLoaded, onUnload }) {
  const snap = React.useMemo(() => getBrewSnapshot(recipe, brewState.elapsed), [recipe, brewState.elapsed]);
  const brewing = { snap, recipe, paused: brewState.paused };
  const now = new Date();
  const [pickerSpout, setPickerSpout] = React.useState(null);

  return (
    <div className="h-full flex flex-col relative">
      <ScreenHeader
        section="Spout Control"
        tag="OPERATOR"
        time={now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
      />

      <div className="px-12 pt-5">
        <Eyebrow tone="brass">The five-head, single-vessel pour</Eyebrow>
        <h1 className="font-serif text-walnut mt-1.5 leading-[1.02] balance" style={{ fontSize: 52, letterSpacing: '-0.025em' }}>
          Five spouts, <span className="italic">one machine.</span>
        </h1>
      </div>

      {/* Vital signs strip */}
      <div className="mx-12 mt-5 border-t border-b border-hairline flex">
        <VitalCell status="ok"   label="Boiler"     value={`${snap.temp.toFixed(1)}°C`} sub="target 93.0°"   />
        <Rule vertical />
        <VitalCell status="ok"   label="Water tank" value="78%"     sub="11.7 L of 15"   />
        <Rule vertical />
        <VitalCell status="ok"   label="Pressure"   value="0.92 bar" sub="line steady"   />
        <Rule vertical />
        <VitalCell status="warn" label="Active brews" value="1 / 5" sub={`spout ${String(activeSpout).padStart(2, '0')} · ${snap.cur.kind}`} />
        <Rule vertical />
        <VitalCell status="ok"   label="Uptime"     value="14d 06h" sub="last service 04 May" />
      </div>

      {/* Spout grid */}
      <div className="px-12 mt-5 flex-1 grid grid-cols-5 gap-3 pb-6 min-h-0">
        {SPOUT_BASE.map((s) => (
          <SpoutCard
            key={s.id}
            s={s}
            isActive={s.id === activeSpout}
            loadedRecipe={loadedSpouts[s.id]}
            brewing={brewing}
            onActivate={() => {
              if (s.id === activeSpout) onOpenBrewing && onOpenBrewing();
              else setPickerSpout(s);  // open inline picker over the dashboard
            }}
            onStartLoaded={onStartLoaded}
            onUnload={onUnload}
          />
        ))}
      </div>

      {pickerSpout && (
        <SpoutRecipePicker
          spout={pickerSpout}
          onClose={() => setPickerSpout(null)}
          onPick={(r) => {
            setPickerSpout(null);
            if (onPickRecipe) onPickRecipe(r, pickerSpout);
          }}
        />
      )}
    </div>
  );
}

window.DashboardScreen = DashboardScreen;
window.HandDripMini    = HandDripMini;
