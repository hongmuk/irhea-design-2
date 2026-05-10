// Brewing screen — the hero performance.

const { useState: bUseState, useEffect: bUseEffect, useMemo: bUseMemo } = React;

// ────────────────────────────────────────────────────────────────────────
// HandDripStage — animated SVG cross-section of the V60 hand-drip in flight.
// Composition rules:
//   · Everything aligns to a SHARED VERTICAL SPINE at x=CX.
//   · Kettle, stream, cone, drip and server stack as a single instrument.
//   · The plan-view callout is tethered to the bed with a leader line so
//     it reads as ONE schematic, not two unrelated shapes.
//   · Kettle orbit is small (its hand-circle), but the SPOUT TIP is what
//     stays fixed under the bed — the stream geometry is invariant.
// ────────────────────────────────────────────────────────────────────────

const CX = 200;             // shared vertical spine
const SPOUT_X = CX;         // spout tip x
const SPOUT_Y = 188;        // spout tip y (water exits here)
const BED_Y   = 250;        // top of cone / coffee bed
const CONE_TIP_Y = 392;     // cone tip
const SERVER_TOP = 416;
const SERVER_BOT = 568;

// Spiral path for the plan-view callout.
const HD_SPIRAL = (() => {
  const pts = [];
  const turns = 3, rMax = 26, n = 200;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const a = t * turns * Math.PI * 2 - Math.PI / 2;
    const r = t * rMax;
    pts.push(`${i ? 'L' : 'M'} ${(Math.cos(a) * r).toFixed(2)} ${(Math.sin(a) * r).toFixed(2)}`);
  }
  return pts.join(' ');
})();

function HandDripStage({ stageKind, water, target, temp, flow, paused }) {
  const isPouring = stageKind === 'Pour' || stageKind === 'Bloom';
  const isBloom   = stageKind === 'Bloom';
  const isPause   = stageKind === 'Pause';

  const fillPct = clamp((water / target) * 100, 0, 100);
  const fluidRange = SERVER_BOT - SERVER_TOP - 8;
  const fluidY = SERVER_BOT - 4 - (fillPct / 100) * fluidRange;
  const bedRy  = isBloom ? 8 : 5;

  return (
    <svg
      viewBox="0 0 400 620"
      preserveAspectRatio="xMidYMid meet"
      className={`absolute inset-0 w-full h-full ${paused ? 'hd-paused' : ''}`}
    >
      <defs>
        <clipPath id="serverClip">
          <path d={`M${CX-62} ${SERVER_TOP} L${CX-62} ${SERVER_BOT-26} Q${CX-62} ${SERVER_BOT} ${CX-32} ${SERVER_BOT} L${CX+32} ${SERVER_BOT} Q${CX+62} ${SERVER_BOT} ${CX+62} ${SERVER_BOT-26} L${CX+62} ${SERVER_TOP} Z`} />
        </clipPath>
        <clipPath id="coneClip">
          <path d={`M${CX-68} ${BED_Y} L${CX+68} ${BED_Y} L${CX+8} ${CONE_TIP_Y} L${CX-8} ${CONE_TIP_Y} Z`} />
        </clipPath>
        <linearGradient id="bedGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#5a4630" />
          <stop offset="100%" stopColor="#2C2317" />
        </linearGradient>
      </defs>

      {/* Background grid */}
      <g stroke="rgba(60,40,20,0.05)" strokeWidth="1">
        {Array.from({ length: 16 }).map((_, i) => (
          <line key={'h'+i} x1="0" y1={i * 40} x2="400" y2={i * 40} />
        ))}
        {Array.from({ length: 11 }).map((_, i) => (
          <line key={'v'+i} x1={i * 40} y1="0" x2={i * 40} y2="620" />
        ))}
      </g>

      {/* Centerline — the visible spine that ties everything together */}
      <line x1={CX} y1="40" x2={CX} y2="600" stroke="rgba(60,40,20,0.10)" strokeDasharray="2 5" strokeWidth="0.7" />

      {/* Editorial frame ticks */}
      <g stroke="#2C2317" strokeWidth="1">
        <line x1="14" y1="14" x2="34" y2="14" />
        <line x1="14" y1="14" x2="14" y2="34" />
        <line x1="386" y1="14" x2="366" y2="14" />
        <line x1="386" y1="14" x2="386" y2="34" />
        <line x1="14" y1="606" x2="34" y2="606" />
        <line x1="14" y1="606" x2="14" y2="586" />
        <line x1="386" y1="606" x2="366" y2="606" />
        <line x1="386" y1="606" x2="386" y2="586" />
      </g>

      {/* ─── Kettle assembly: orbits as ONE group around the spine. ─── */}
      {/* Translation puts the kettle's spout-tip directly above CX,SPOUT_Y; */}
      {/* the orbit class circles a small radius around that anchor. */}
      <g className={isPouring ? 'hd-kettle' : ''}>
        <g transform={`translate(${CX} ${SPOUT_Y})`}>
          {/* steam, anchored above body */}
          {isPouring && (
            <g fill="rgba(108,90,72,0.5)">
              <ellipse className="hd-steam"   cx="-58" cy="-118" rx="5" ry="3" />
              <ellipse className="hd-steam-2" cx="-50" cy="-118" rx="4" ry="2.5" />
              <ellipse className="hd-steam-3" cx="-66" cy="-118" rx="4" ry="2.5" />
            </g>
          )}
          {/* body — gooseneck profile, side view, looking like a kettle */}
          <path
            d="M-110 -98 L-110 -52 Q-110 -36 -94 -36 L-44 -36 Q-30 -36 -28 -50 L-26 -64 Q-24 -88 -36 -98 Z"
            fill="#FCFAF4" stroke="#2C2317" strokeWidth="1.2"
          />
          {/* shoulder line */}
          <line x1="-110" y1="-98" x2="-36" y2="-98" stroke="#2C2317" strokeWidth="1.2" />
          {/* lid */}
          <rect x="-86" y="-110" width="32" height="6" fill="#FCFAF4" stroke="#2C2317" strokeWidth="1" />
          {/* knob — brass */}
          <rect x="-72" y="-118" width="6" height="8" fill="#C5A059" />
          {/* handle */}
          <path d="M-110 -84 Q-138 -84 -138 -56 Q-138 -36 -110 -36" stroke="#2C2317" strokeWidth="1.2" fill="none" />
          {/* gooseneck — long curved spout sweeping down to the spine */}
          <path
            d="M-28 -64 C -8 -68 6 -54 8 -38 C 10 -22 4 -8 0 0"
            fill="none" stroke="#2C2317" strokeWidth="1.2"
          />
          <path
            d="M-26 -56 C -10 -58 0 -48 2 -36 C 4 -22 -2 -10 -4 -2"
            fill="none" stroke="#2C2317" strokeWidth="1.2"
          />
          {/* fill the spout shape lightly so it reads as a tube */}
          <path
            d="M-28 -64 C -8 -68 6 -54 8 -38 C 10 -22 4 -8 0 0 L -4 -2 C -2 -10 4 -22 2 -36 C 0 -48 -10 -58 -26 -56 Z"
            fill="#FCFAF4"
          />
          {/* etched temp on the body */}
          <text x="-86" y="-58" fontFamily="JetBrains Mono, monospace" fontSize="8.5" fill="#6A5B48" letterSpacing="1.2">
            {temp.toFixed(1)}°
          </text>
        </g>
      </g>

      {/* ─── Water stream: starts at SPOUT_Y, ends at BED_Y. Always centered. ─── */}
      {isPouring && (
        <g>
          {/* faint glow column */}
          <line x1={CX} y1={SPOUT_Y} x2={CX} y2={BED_Y} stroke="rgba(27,58,75,0.20)" strokeWidth="4" />
          {/* dashed flowing core */}
          <line x1={CX} y1={SPOUT_Y} x2={CX} y2={BED_Y}
                stroke="#1B3A4B" strokeWidth="2" strokeDasharray="3 3" className="hd-stream" />
        </g>
      )}

      {/* ─── V60 cone (side-section) ─── */}
      <g>
        {/* paper filter inside */}
        <path d={`M${CX-64} ${BED_Y+2} L${CX+64} ${BED_Y+2} L${CX+8} ${CONE_TIP_Y-2} L${CX-8} ${CONE_TIP_Y-2} Z`} fill="#F5EDE0" />
        {/* cone outline */}
        <path d={`M${CX-68} ${BED_Y} L${CX+68} ${BED_Y} L${CX+8} ${CONE_TIP_Y} L${CX-8} ${CONE_TIP_Y} Z`}
              fill="none" stroke="#2C2317" strokeWidth="1.2" />
        {/* rim oval */}
        <ellipse cx={CX} cy={BED_Y} rx="68" ry="7" fill="#FCFAF4" stroke="#2C2317" strokeWidth="1.2" />

        {/* spiral ribs projected on the cone */}
        <g clipPath="url(#coneClip)" stroke="rgba(60,40,20,0.18)" strokeWidth="1" fill="none">
          {Array.from({ length: 11 }).map((_, i) => {
            const x = CX - 60 + i * 12;
            return <line key={i} x1={x} y1={BED_Y} x2={CX + (x - CX) * 0.10} y2={CONE_TIP_Y} />;
          })}
        </g>

        {/* coffee bed — swells during bloom */}
        <g className={isBloom ? 'hd-bloom' : ''}>
          <ellipse cx={CX} cy={BED_Y} rx="64" ry={bedRy} fill="url(#bedGrad)" />
          <ellipse cx={CX} cy={BED_Y - bedRy + 1} rx="58" ry={bedRy * 0.7} fill="#6A5B48" className="hd-shimmer" />
        </g>

        {/* bloom bubbles */}
        {isBloom && (
          <g fill="#8B6F3D">
            <circle cx={CX-20} cy={BED_Y-2} r="1.5" className="hd-shimmer" />
            <circle cx={CX+10} cy={BED_Y-4} r="1.8" className="hd-shimmer" />
            <circle cx={CX+25} cy={BED_Y-1} r="1.3" className="hd-shimmer" />
            <circle cx={CX-10} cy={BED_Y}   r="1.4" className="hd-shimmer" />
          </g>
        )}

        {/* concentric ripples on the bed */}
        {isPouring && (
          <g fill="none" stroke="rgba(197,160,89,0.55)" strokeWidth="0.8" strokeDasharray="3 4">
            <ellipse className="hd-bed-ring" cx={CX} cy={BED_Y} rx="22" ry="3" />
            <ellipse className="hd-bed-ring" cx={CX} cy={BED_Y} rx="42" ry="4.5" style={{ animationDelay: '0.5s' }} />
            <ellipse className="hd-bed-ring" cx={CX} cy={BED_Y} rx="58" ry="5.5" style={{ animationDelay: '1s', opacity: 0.5 }} />
          </g>
        )}
      </g>

      {/* ─── Drip from the cone tip ─── */}
      {(isPouring || isPause) && (
        <g transform={`translate(${CX} ${CONE_TIP_Y + 6})`}>
          <ellipse className="hd-drip"   cx="0" cy="0" rx="2.2" ry="3.2" fill="#2C2317" />
          {!isPause && <ellipse className="hd-drip-2" cx="0" cy="0" rx="1.8" ry="2.6" fill="#2C2317" />}
        </g>
      )}

      {/* ─── Server (glass carafe) ─── */}
      <g>
        <path
          d={`M${CX-62} ${SERVER_TOP} L${CX-62} ${SERVER_BOT-26} Q${CX-62} ${SERVER_BOT} ${CX-32} ${SERVER_BOT} L${CX+32} ${SERVER_BOT} Q${CX+62} ${SERVER_BOT} ${CX+62} ${SERVER_BOT-26} L${CX+62} ${SERVER_TOP} Z`}
          fill="rgba(252,250,244,0.55)" stroke="#2C2317" strokeWidth="1.2"
        />
        {/* coffee fluid */}
        <g clipPath="url(#serverClip)">
          <rect x={CX-62} y={fluidY} width="124" height={SERVER_BOT - fluidY + 4} fill="#2C2317" />
          <ellipse cx={CX} cy={fluidY} rx="62" ry="3.5" fill="#1c1610" />
          <ellipse cx={CX} cy={fluidY - 1} rx="55" ry="2" fill="rgba(197,160,89,0.35)" />
          {(isPouring || isPause) && (
            <ellipse className="hd-ripple" cx={CX} cy={fluidY} rx="14" ry="2"
                     fill="none" stroke="rgba(197,160,89,0.7)" strokeWidth="1" />
          )}
        </g>
        {/* spout lip */}
        <path d={`M${CX+62} ${SERVER_TOP+4} L${CX+74} ${SERVER_TOP-2} L${CX+74} ${SERVER_TOP+8} L${CX+62} ${SERVER_TOP+14} Z`}
              fill="#FCFAF4" stroke="#2C2317" strokeWidth="1.2" />
        {/* graduations */}
        <g stroke="#2C2317" strokeWidth="0.8">
          {[0, 1, 2, 3].map(i => (
            <line key={i} x1={CX-62} y1={SERVER_TOP + 32 + i * 30} x2={CX-54} y2={SERVER_TOP + 32 + i * 30} />
          ))}
        </g>
        <g fontFamily="JetBrains Mono, monospace" fontSize="7.5" fill="#6A5B48" letterSpacing="0.6">
          {[300, 200, 100, 0].map((v, i) => (
            <text key={i} x={CX-72} y={SERVER_TOP + 35 + i * 30} textAnchor="end">
              {String(v).padStart(3, '0')}
            </text>
          ))}
        </g>
      </g>

      {/* ─── Plan-view callout, tethered to the bed via a leader line ─── */}
      <g>
        {/* leader from bed-edge to medallion */}
        <path
          d={`M${CX+68} ${BED_Y} Q${CX+110} ${BED_Y-30} ${CX+138} ${BED_Y-58}`}
          fill="none" stroke="rgba(60,40,20,0.35)" strokeWidth="0.8" strokeDasharray="2 3"
        />
        <circle cx={CX+68} cy={BED_Y} r="1.6" fill="#2C2317" />

        <g transform={`translate(${CX+138} ${BED_Y-92})`}>
          {/* outer ring + concentric guides */}
          <circle r="34" fill="#FCFAF4" stroke="#2C2317" strokeWidth="1" />
          <circle r="26" fill="none" stroke="rgba(60,40,20,0.18)" strokeWidth="0.6" />
          <circle r="16" fill="none" stroke="rgba(60,40,20,0.14)" strokeWidth="0.6" />
          <circle r="8"  fill="none" stroke="rgba(60,40,20,0.12)" strokeWidth="0.6" />
          <line x1="-32" y1="0" x2="32" y2="0" stroke="rgba(60,40,20,0.12)" strokeDasharray="2 3" strokeWidth="0.5" />
          <line x1="0" y1="-32" x2="0" y2="32" stroke="rgba(60,40,20,0.12)" strokeDasharray="2 3" strokeWidth="0.5" />
          {/* bed disc */}
          <circle r="24" fill="#6A5B48" opacity="0.20" />
          <circle r="24" fill="none" stroke="rgba(44,35,23,0.4)" strokeWidth="0.6" />
          {/* spiral path */}
          {isPouring && (
            <>
              <path d={HD_SPIRAL} fill="none" stroke="#1B3A4B" strokeWidth="1.4"
                    strokeLinecap="round" className="hd-spiral-path" />
              <circle r="2.2" fill="#C5A059" stroke="#2C2317" strokeWidth="0.6"
                      className="hd-pour-dot"
                      style={{ offsetPath: `path('${HD_SPIRAL}')`, offsetRotate: '0deg' }} />
            </>
          )}
          {!isPouring && <circle r="1.6" fill="#8B6F3D" />}
          {/* label */}
          <text fontFamily="JetBrains Mono, monospace" fontSize="6.5" fill="#6A5B48"
                letterSpacing="1.2" x="0" y="-42" textAnchor="middle">
            PLAN · POUR PATTERN
          </text>
          <text fontFamily="JetBrains Mono, monospace" fontSize="6" fill="#8B6F3D"
                letterSpacing="1" x="0" y="46" textAnchor="middle">
            {isPouring ? 'SPIRAL · 3T · 30MM' : isPause ? 'STEEP · NO POUR' : 'IDLE'}
          </text>
        </g>
      </g>

      {/* ─── Annotation system (left margin) ─── */}
      <g stroke="rgba(60,40,20,0.55)" strokeWidth="0.8" fill="none">
        {/* kettle */}
        <line x1={CX-110} y1={SPOUT_Y-50} x2="60" y2={SPOUT_Y-50} />
        <line x1="60" y1={SPOUT_Y-50} x2="60" y2={SPOUT_Y-30} />
        {/* bed */}
        <line x1={CX-68} y1={BED_Y} x2="60" y2={BED_Y} />
        {/* server */}
        <line x1={CX-62} y1={SERVER_TOP+76} x2="60" y2={SERVER_TOP+76} />
      </g>
      <g fontFamily="JetBrains Mono, monospace" fill="#2C2317" letterSpacing="1.5">
        <text x="22"  y={SPOUT_Y-22}    fontSize="8">A · KETTLE</text>
        <text x="22"  y={BED_Y-4}       fontSize="8">B · BED 20G</text>
        <text x="22"  y={BED_Y+10}      fontSize="7" fill="#6A5B48">{isBloom ? 'BLOOMING' : isPause ? 'STEEPING' : 'EXTRACTING'}</text>
        <text x="22"  y={SERVER_TOP+72} fontSize="8">C · SERVER</text>
        <text x="22"  y={SERVER_TOP+84} fontSize="7" fill="#6A5B48">{Math.round(water)} / {target}ML</text>
      </g>

      {/* Stage epigraph at the bottom */}
      <g>
        <line x1="100" y1="592" x2="300" y2="592" stroke="rgba(60,40,20,0.28)" strokeWidth="1" />
      </g>
      <text x="200" y="588" textAnchor="middle"
            fontFamily="Georgia, serif" fontStyle="italic" fontSize="14" fill="#2C2317">
        {stageKind === 'Bloom' ? 'first breath' : stageKind === 'Pause' ? 'a held silence' : 'the pour'}
      </text>
    </svg>
  );
}

function StageRibbon({ stages, totalDuration, elapsed }) {
  return (
    <div className="w-full">
      <div className="flex items-end justify-between mb-2">
        {stages.map((s, i) => {
          const reached = elapsed >= (i === 0 ? 0 : stages[i - 1].to);
          const past = elapsed >= s.to;
          return (
            <div key={i} className="flex-1">
              <div className="flex items-baseline gap-2">
                <span className={`mono-eyebrow text-[9px] ${reached ? 'text-walnut' : 'text-bark/60'}`}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className={`font-serif italic text-[13px] ${reached ? 'text-walnut' : 'text-bark/60'}`}>
                  {s.label}
                </span>
              </div>
              <Mono className={`block text-[10px] mt-0.5 ${past ? 'text-brass-aged' : 'text-bark/70'}`}>
                {fmtTime(s.to)} · {s.water}g
              </Mono>
            </div>
          );
        })}
      </div>
      <div className="relative h-[2px] w-full hairline">
        <div className="absolute left-0 top-0 h-[2px] bg-brass"
             style={{ width: `${clamp((elapsed / totalDuration) * 100, 0, 100)}%` }} />
        {stages.map((s, i) => (
          <div key={i} className="absolute -top-[3px] h-[8px] w-px bg-walnut/40"
               style={{ left: `${(s.to / totalDuration) * 100}%` }} />
        ))}
      </div>
    </div>
  );
}

function LedgerCell({ label, value, sub, progress }) {
  return (
    <div className="flex-1 px-5 py-4 relative">
      {progress != null && (
        <div className="absolute left-0 right-0 -top-px h-px bg-sand">
          <div className="h-px bg-brass" style={{ width: `${clamp(progress, 0, 100)}%` }} />
        </div>
      )}
      <Eyebrow className="mb-2">{label}</Eyebrow>
      <div className="font-mono tabular text-walnut text-[26px] leading-none">{value}</div>
      {sub && <Mono className="text-[10px] text-bark mt-1.5 block">{sub}</Mono>}
    </div>
  );
}

function BrewingScreen({ recipe, spoutId = 3, brewState, onPause, onStop }) {
  const elapsed = brewState.elapsed;
  const snap = bUseMemo(() => getBrewSnapshot(recipe, elapsed), [recipe, elapsed]);
  const { stages, total, cur, water, overallPct, flow, temp } = snap;
  const spoutLabel = String(spoutId).padStart(2, '0');

  return (
    <div className="h-full flex flex-col">
      <ScreenHeader
        section={`Brewing · Spout ${spoutLabel} · ${cur.label}`}
        tag={cur.kind}
        dripNo="09"
        time={`${fmtTime(elapsed)} / ${fmtTime(total)}`}
      />

      <div className="flex-1 flex min-h-0">
        <div className="basis-7/12 px-12 pt-6 pb-2 flex flex-col">
          <Eyebrow tone="brass">Currently extracting</Eyebrow>

          <div className="mt-1 flex items-start gap-1">
            <span className="font-sans text-walnut tabular leading-[0.85]"
                  style={{ fontSize: 220, fontWeight: 200, letterSpacing: '-0.04em' }}>
              {Math.round(overallPct)}
            </span>
            <span className="font-serif italic text-brass-aged leading-none"
                  style={{ fontSize: 80, marginTop: 28, marginLeft: 4 }}>%</span>
          </div>

          <div className="-mt-1 flex items-baseline gap-3">
            <Mono className="text-[11px] text-bark tracking-[0.2em]">EXTRACTION TARGET 320 G</Mono>
            <span className="hairline w-12 h-px translate-y-[-3px]" />
            <Mono className="text-[11px] text-walnut-mid tracking-[0.2em]">{Math.round(water)} G CURRENT</Mono>
          </div>

          <h1 className="font-serif text-walnut mt-7 leading-[1.02] balance"
              style={{ fontSize: 44, letterSpacing: '-0.025em' }}>
            {(() => {
              const country = (recipe.region || '').split('·')[0].trim();
              return (
                <>
                  {country && <span>{country} </span>}
                  <span className="italic">{recipe.name}</span>
                </>
              );
            })()}
          </h1>
          <Mono className="text-[12px] text-bark tracking-[0.2em] mt-2 block">
            {recipe.method} · {recipe.dose}g / {recipe.water}ml · {recipe.temp}°C · {recipe.ratio}
          </Mono>

          <div className="mt-8" />
          <StageRibbon stages={stages} totalDuration={total} elapsed={elapsed} />

          <div className="flex-1" />

          <div className="flex items-center gap-3 pb-4">
            <button onClick={onPause}
                    className="flex items-center gap-3 px-5 py-3 border border-hairline hover:bg-paper transition">
              {brewState.paused
                ? <Icon.ArrowRight className="w-4 h-4 text-walnut" />
                : <Icon.Pause className="w-4 h-4 text-walnut" />}
              <Mono className="text-[10px] text-walnut tracking-[0.22em]">
                {brewState.paused ? 'RESUME' : 'PAUSE'}
              </Mono>
            </button>
            <button onClick={onStop}
                    className="flex items-center gap-3 px-5 py-3 border border-hairline hover:bg-paper transition">
              <Icon.Stop className="w-3 h-3 text-error" />
              <Mono className="text-[10px] text-walnut tracking-[0.22em]">ABORT BREW</Mono>
            </button>
            <div className="ml-auto flex items-baseline gap-3">
              <Eyebrow tone="bark">Recipe</Eyebrow>
              <span className="font-serif italic text-walnut text-[14px]">No. {recipe.no} · {recipe.method}</span>
            </div>
          </div>
        </div>

        <div className="basis-5/12 pr-12 pt-6 flex flex-col">
          <div className="relative flex-1 bg-paper border border-hairline overflow-hidden">
            <HandDripStage
              stageKind={cur.kind}
              water={water}
              target={recipe.water}
              temp={temp}
              flow={flow}
              paused={brewState.paused}
            />
            <div className="absolute left-3 top-3 flex items-center gap-2">
              <span className={`block w-1.5 h-1.5 rounded-full ${brewState.paused ? 'bg-warning' : 'bg-error'} ${brewState.paused ? '' : 'animate-pulse'}`} />
              <span className="font-mono text-[9px] tracking-[0.22em] uppercase text-walnut">
                Live · Spout {spoutLabel} · {brewState.paused ? 'Paused' : 'Recording'}
              </span>
            </div>
            <div className="absolute right-3 top-3 text-right">
              <Mono className="text-[10px] text-walnut tracking-[0.2em] block">FLOW {flow.toFixed(1)} G/S</Mono>
              <Mono className="text-[10px] text-walnut tracking-[0.2em] block">{temp.toFixed(1)}°C</Mono>
            </div>
            <div className="absolute left-3 bottom-3 right-3 flex items-baseline justify-between">
              <Mono className="text-[9px] tracking-[0.22em] text-bark">SECTION · A–A′</Mono>
              <Mono className="text-[9px] tracking-[0.22em] text-bark">SCALE 1 : 1</Mono>
            </div>
          </div>
          <div className="mt-4 mb-1">
            <Eyebrow>Tasting Note · {(recipe.region || '').split('·').slice(-1)[0].trim() || 'Operator log'}</Eyebrow>
            <p className="font-serif italic text-walnut text-[15px] leading-snug pretty mt-1.5">
              "{recipe.note}"
            </p>
          </div>
        </div>
      </div>

      <div className="mx-12 mb-6 mt-2 border-t border-hairline border-b border-x flex">
        <LedgerCell label="Elapsed"     value={fmtTime(elapsed)} sub="of 03:00" progress={overallPct} />
        <Rule vertical />
        <LedgerCell label="Remaining"   value={fmtTime(Math.max(0, total - elapsed))} sub="to drawdown" />
        <Rule vertical />
        <LedgerCell label="Temperature" value={`${temp.toFixed(1)}°`} sub="target 93.0°" />
        <Rule vertical />
        <LedgerCell label="Flow rate"   value={`${flow.toFixed(1)}`} sub="g · s⁻¹" />
        <Rule vertical />
        <LedgerCell label="Water"       value={`${Math.round(water)}g`} sub={`of ${recipe.water}g`} progress={(water / recipe.water) * 100} />
      </div>
    </div>
  );
}

window.BrewingScreen = BrewingScreen;
window.HandDripStage = HandDripStage;
