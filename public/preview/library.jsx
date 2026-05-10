// Recipe Library + Recipe Detail.

const FILTERS = ['ALL', 'POUR-OVER', 'V60', 'KALITA', 'ORIGAMI', 'FAVOURITES'];

function RecipeCard({ r, onOpen }) {
  return (
    <button
      onClick={() => onOpen(r)}
      className="bg-paper border border-hairline text-left p-5 flex flex-col h-full hover:border-[var(--hairline-strong)] transition group focus:outline-none"
    >
      <div className="flex items-baseline justify-between">
        <Eyebrow tone="brass">No. {r.no} · {r.method}</Eyebrow>
        {r.favourite && <Icon.Star className="w-3 h-3 text-brass" filled />}
      </div>
      <h3 className="font-serif text-walnut text-[24px] leading-tight mt-2 balance">
        <span className="italic">{r.name}</span>
      </h3>
      <Mono className="text-[10px] text-bark tracking-[0.2em] mt-1 block">{r.region.toUpperCase()}</Mono>

      <p className="font-serif italic text-walnut-mid text-[13px] leading-snug mt-3 pretty">“{r.note}”</p>

      <div className="flex-1" />

      <div className="mt-4 pt-3 border-t border-hairline flex items-center justify-between">
        <Mono className="text-[11px] text-walnut tracking-[0.18em]">{r.ratio}</Mono>
        <Mono className="text-[11px] text-bark tracking-[0.18em]">{r.dose}g · {r.water}ml</Mono>
        <Mono className="text-[11px] text-walnut-mid tracking-[0.18em]">{r.total}</Mono>
      </div>
    </button>
  );
}

function LibraryScreen({ onOpen }) {
  const [q, setQ] = React.useState('');
  const [filter, setFilter] = React.useState('ALL');

  const filtered = RECIPES.filter((r) => {
    if (filter === 'FAVOURITES' && !r.favourite) return false;
    if (filter === 'V60'       && !r.method.includes('V60')) return false;
    if (filter === 'KALITA'    && !r.method.includes('Kalita')) return false;
    if (filter === 'ORIGAMI'   && !r.method.includes('Origami')) return false;
    if (q && !(r.name + r.region + r.note).toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="h-full flex flex-col">
      <ScreenHeader section="Recipe Library" count={`${RECIPES.length} entries`} tag="OPERATOR" />

      <div className="px-12 pt-6">
        <Eyebrow tone="brass">A working ledger of decisions</Eyebrow>
        <h1 className="font-serif text-walnut mt-2 leading-[1.02] balance" style={{ fontSize: 56, letterSpacing: '-0.025em' }}>
          Each cup is a <span className="italic">set of decisions</span>.
        </h1>
      </div>

      {/* Search + filters */}
      <div className="mx-12 mt-6 border-t border-hairline">
        <div className="flex items-center py-4 gap-4">
          <Icon.Search className="w-4 h-4 text-brass-aged" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search regions, varietals, notes…"
            className="flex-1 bg-transparent font-serif italic text-[20px] text-walnut placeholder:text-bark/60 outline-none"
          />
          <Mono className="text-[10px] text-bark tracking-[0.22em]">{filtered.length} OF {RECIPES.length}</Mono>
        </div>
        <div className="border-t border-hairline flex">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-3 border-r border-hairline ${filter === f ? 'bg-paper' : ''}`}
            >
              <Mono className={`text-[10px] tracking-[0.22em] ${filter === f ? 'text-walnut' : 'text-bark'}`}>{f}</Mono>
            </button>
          ))}
          <div className="flex-1 border-r border-hairline" />
          <button className="px-5 py-3 flex items-center gap-2 hover:bg-paper">
            <Icon.Plus className="w-3.5 h-3.5 text-walnut" />
            <Mono className="text-[10px] text-walnut tracking-[0.22em]">NEW RECIPE</Mono>
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="px-12 pt-5 pb-6 flex-1 overflow-hidden">
        <div className="grid grid-cols-4 gap-3 h-full content-start">
          {filtered.slice(0, 8).map((r) => (
            <RecipeCard key={r.no} r={r} onOpen={onOpen} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ParamRow({ k, v }) {
  return (
    <div className="flex items-baseline justify-between py-3 border-b border-hairline">
      <Mono className="text-[10px] text-bark tracking-[0.22em]">{k}</Mono>
      <span className="font-serif text-walnut text-[16px]">{v}</span>
    </div>
  );
}

function DetailScreen({ recipe, onStart, onBack }) {
  return (
    <div className="h-full flex flex-col">
      <ScreenHeader section={`Recipe · No. ${recipe.no}`} tag={recipe.method.toUpperCase()} />

      <div className="px-12 pt-2 pb-2 flex items-center gap-3">
        <button onClick={onBack} className="flex items-center gap-2 px-3 py-1.5 hover:bg-paper">
          <Icon.ArrowLeft className="w-3.5 h-3.5 text-walnut" />
          <Mono className="text-[10px] text-walnut tracking-[0.22em]">LIBRARY</Mono>
        </button>
        <span className="hairline w-6 h-px" />
        <Mono className="text-[10px] text-bark tracking-[0.22em]">{recipe.region.toUpperCase()}</Mono>
        <div className="flex-1" />
        <button
          onClick={onStart}
          className="bg-walnut text-cream px-5 py-3 flex items-center gap-3 hover:bg-walnut-mid transition"
        >
          <Mono className="text-[10px] tracking-[0.22em]">START BREWING</Mono>
          <Icon.ArrowRight className="w-4 h-4 text-brass" />
        </button>
      </div>

      {/* 7:5 split */}
      <div className="flex-1 flex min-h-0 px-12 gap-10 pb-7">
        {/* LEFT 7 — note + params */}
        <div className="basis-7/12 flex flex-col">
          <Eyebrow tone="brass">Tasting note</Eyebrow>
          <p className="font-serif italic text-walnut text-[34px] leading-[1.18] mt-2 balance">
            “{recipe.note}”
          </p>
          <Mono className="text-[10px] text-bark tracking-[0.22em] mt-3 block">— OPERATOR LOG, 02 MAY 2026</Mono>

          <div className="mt-8">
            <Eyebrow>Parameters</Eyebrow>
            <div className="mt-3 border-t border-hairline">
              <ParamRow k="Dose"        v={`${recipe.dose} g`} />
              <ParamRow k="Water"       v={`${recipe.water} ml`} />
              <ParamRow k="Ratio"       v={recipe.ratio} />
              <ParamRow k="Temperature" v={`${recipe.temp} °C`} />
              <ParamRow k="Grind"       v={recipe.grind} />
              <ParamRow k="Total time"  v={recipe.total} />
            </div>
          </div>
        </div>

        {/* RIGHT 5 — pour log */}
        <div className="basis-5/12 flex flex-col">
          <Eyebrow tone="brass">Pour schedule</Eyebrow>
          <h2 className="font-serif text-walnut text-[28px] leading-tight mt-1 balance">
            Six movements, <span className="italic">one cup.</span>
          </h2>

          <div className="mt-5 border-t border-hairline">
            <div className="grid grid-cols-[64px_1fr_72px_56px_56px] py-2 border-b border-hairline">
              <Mono className="text-[9px] text-bark tracking-[0.22em]">T</Mono>
              <Mono className="text-[9px] text-bark tracking-[0.22em]">STAGE</Mono>
              <Mono className="text-[9px] text-bark tracking-[0.22em] text-right">TARGET</Mono>
              <Mono className="text-[9px] text-bark tracking-[0.22em] text-right">FLOW</Mono>
              <Mono className="text-[9px] text-bark tracking-[0.22em] text-right">°C</Mono>
            </div>
            {POUR_LOG.map((row, i) => (
              <div key={i} className="grid grid-cols-[64px_1fr_72px_56px_56px] py-2.5 border-b border-hairline items-baseline">
                <Mono className="text-[12px] text-walnut tracking-[0.18em]">{row.t}</Mono>
                <span className="font-serif italic text-walnut text-[14px]">{row.stage}</span>
                <Mono className="text-[12px] text-walnut tabular text-right">{row.target}g</Mono>
                <Mono className="text-[12px] text-bark tabular text-right">{row.flow.toFixed(1)}</Mono>
                <Mono className="text-[12px] text-bark tabular text-right">{row.temp}</Mono>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-4 flex items-center justify-between">
            <Eyebrow>Last served</Eyebrow>
            <span className="font-serif italic text-walnut-mid text-[14px]">07 May, 14:22 — Drip 06</span>
          </div>
        </div>
      </div>
    </div>
  );
}

window.LibraryScreen = LibraryScreen;
window.DetailScreen  = DetailScreen;
