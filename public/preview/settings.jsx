// Settings — hairline-divided form sections.

function SettingRow({ label, desc, control, last }) {
  return (
    <div className={`grid grid-cols-[260px_1fr_220px] gap-8 items-center py-5 ${last ? '' : 'border-b border-hairline'}`}>
      <div>
        <span className="font-serif text-walnut text-[18px] leading-tight block">{label}</span>
      </div>
      <div>
        <p className="font-serif italic text-bark text-[13px] leading-snug pretty">{desc}</p>
      </div>
      <div className="justify-self-end">{control}</div>
    </div>
  );
}

function NumControl({ value, suffix, onMinus, onPlus }) {
  return (
    <div className="flex items-baseline gap-3 border-b border-walnut/40 pb-1">
      <button onClick={onMinus} className="font-mono text-[14px] text-bark hover:text-walnut">−</button>
      <span className="font-mono tabular text-walnut text-[20px] min-w-[64px] text-center">{value}</span>
      <Mono className="text-[10px] text-bark tracking-[0.18em]">{suffix}</Mono>
      <button onClick={onPlus} className="font-mono text-[14px] text-bark hover:text-walnut ml-1">+</button>
    </div>
  );
}

function Toggle({ on, onToggle, labels = ['OFF', 'ON'] }) {
  return (
    <button
      onClick={onToggle}
      className="relative w-[88px] h-[30px] border border-hairline flex items-center"
    >
      <div
        className={`absolute top-0 bottom-0 w-1/2 ${on ? 'left-1/2' : 'left-0'} bg-brass transition-all`}
      />
      <span className={`relative z-10 flex-1 text-center mono-eyebrow text-[9px] ${on ? 'text-bark' : 'text-walnut'}`}>{labels[0]}</span>
      <span className={`relative z-10 flex-1 text-center mono-eyebrow text-[9px] ${on ? 'text-walnut' : 'text-bark'}`}>{labels[1]}</span>
    </button>
  );
}

function SegControl({ options, value, onChange }) {
  return (
    <div className="flex border border-hairline">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={`px-3 py-2 ${value === o ? 'bg-walnut text-cream' : 'text-walnut'} ${o !== options[0] ? 'border-l border-hairline' : ''}`}
        >
          <Mono className={`text-[10px] tracking-[0.22em] ${value === o ? 'text-cream' : 'text-walnut'}`}>{o}</Mono>
        </button>
      ))}
    </div>
  );
}

function Section({ no, title, italic, children }) {
  return (
    <section className="mb-10">
      <div className="flex items-baseline gap-4 mb-3">
        <Mono className="text-[10px] text-brass-aged tracking-[0.22em]">§ {no}</Mono>
        <span className="hairline w-8 h-px translate-y-[-3px]" />
        <h2 className="font-serif text-walnut text-[24px] leading-none">
          {title} {italic && <span className="italic text-brass-aged">{italic}</span>}
        </h2>
      </div>
      <div className="border-t border-hairline">{children}</div>
    </section>
  );
}

function SettingsScreen() {
  const [s, setS] = React.useState({
    dose: 20, water: 320, temp: 93, ratio: 16,
    autoTare: true, soundCue: false, theme: 'AUTO',
    network: 'COFFEE-LAB',
    serviceMode: false,
  });

  return (
    <div className="h-full flex flex-col">
      <ScreenHeader section="Settings" tag="OPERATOR" />

      <div className="px-12 pt-6 pb-2">
        <Eyebrow tone="brass">Brewing defaults & machine</Eyebrow>
        <h1 className="font-serif text-walnut mt-2 leading-[1.02] balance" style={{ fontSize: 56, letterSpacing: '-0.025em' }}>
          A few <span className="italic">deliberate</span> choices.
        </h1>
      </div>

      <div className="flex-1 overflow-auto px-12 pb-8">

        <Section no="01" title="Brewing" italic="defaults">
          <SettingRow
            label="Default dose"
            desc="Ground coffee weight used when a recipe omits a dose value. Typical V60 range is 16–22g."
            control={<NumControl value={s.dose} suffix="G" onMinus={() => setS({...s, dose: Math.max(10, s.dose - 1)})} onPlus={() => setS({...s, dose: Math.min(40, s.dose + 1)})} />}
          />
          <SettingRow
            label="Default water"
            desc="Total brew water for unspecified recipes. Calculated against the ratio below if omitted."
            control={<NumControl value={s.water} suffix="ML" onMinus={() => setS({...s, water: Math.max(100, s.water - 10)})} onPlus={() => setS({...s, water: Math.min(600, s.water + 10)})} />}
          />
          <SettingRow
            label="Brew temperature"
            desc="Boiler target during extraction. Keep within ±0.5°C for repeatable cup quality."
            control={<NumControl value={s.temp} suffix="°C" onMinus={() => setS({...s, temp: Math.max(80, s.temp - 1)})} onPlus={() => setS({...s, temp: Math.min(98, s.temp + 1)})} />}
          />
          <SettingRow
            label="Auto-tare scale"
            desc="Zero the spout scale automatically when a fresh brew session begins."
            control={<Toggle on={s.autoTare} onToggle={() => setS({...s, autoTare: !s.autoTare})} />}
            last
          />
        </Section>

        <Section no="02" title="Display & sound">
          <SettingRow
            label="Theme"
            desc="The cream canvas is suited to bright cafés. Use amber for low-light service."
            control={<SegControl options={['LIGHT', 'AMBER', 'AUTO']} value={s.theme} onChange={(v) => setS({...s, theme: v})} />}
          />
          <SettingRow
            label="Sound cue at drawdown"
            desc="A single soft chime when the final pour completes."
            control={<Toggle on={s.soundCue} onToggle={() => setS({...s, soundCue: !s.soundCue})} />}
            last
          />
        </Section>

        <Section no="03" title="Network">
          <SettingRow
            label="Wi-Fi"
            desc="Used only for recipe sync and remote diagnostics. The machine brews fully offline."
            control={
              <div className="text-right">
                <span className="font-serif italic text-walnut text-[16px]">{s.network}</span>
                <Mono className="text-[10px] text-ok tracking-[0.18em] block mt-1">CONNECTED · −56 DBM</Mono>
              </div>
            }
          />
          <SettingRow
            label="Recipe sync"
            desc="Pull updates from the operator portal each morning. Local edits always win."
            control={<Toggle on={true} onToggle={() => {}} />}
            last
          />
        </Section>

        <Section no="04" title="Maintenance" italic="& service">
          <SettingRow
            label="Last descale"
            desc="Recommended every 30 brewing days. Heads beyond 60 days will refuse to start."
            control={
              <div className="text-right">
                <span className="font-mono tabular text-walnut text-[20px]">12 d</span>
                <Mono className="text-[10px] text-bark tracking-[0.18em] block mt-1">SINCE 27 APR</Mono>
              </div>
            }
          />
          <SettingRow
            label="Service mode"
            desc="Disables brewing and exposes valve, pump, and thermistor diagnostics."
            control={<Toggle on={s.serviceMode} onToggle={() => setS({...s, serviceMode: !s.serviceMode})} />}
            last
          />
        </Section>

        <div className="flex items-baseline justify-between pt-2 pb-6 border-t border-hairline">
          <Eyebrow>Build · STM32MP1 / rootfs 0.9.4</Eyebrow>
          <Mono className="text-[10px] text-bark tracking-[0.22em]">© 2026 IRHEA · MADE IN SEOUL</Mono>
        </div>
      </div>
    </div>
  );
}

window.SettingsScreen = SettingsScreen;
