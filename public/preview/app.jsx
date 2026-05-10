// App — router + brewing simulation state.

const { useState: aUseState, useEffect: aUseEffect, useRef: aUseRef } = React;

const NAV_ITEMS = [
  { id: 'brewing',   label: 'Brewing',   italic: 'in progress' },
  { id: 'dashboard', label: 'Spout',     italic: 'control' },
  { id: 'library',   label: 'Recipes',   italic: 'twelve' },
  { id: 'detail',    label: 'Recipe',    italic: 'sheet' },
  { id: 'settings',  label: 'Settings' },
];

function App() {
  const [screen, setScreen]       = aUseState('dashboard');
  const [active, setActive]       = aUseState(RECIPES[0]);   // recipe in the live brew
  const [activeSpout, setActiveSpout] = aUseState(3);        // which spout is currently brewing
  const [loadedSpouts, setLoadedSpouts] = aUseState({});     // { [spoutId]: recipe } — armed but not yet brewing
  const [opened, setOpened]       = aUseState(RECIPES[0]);
  const [brew, setBrew]           = aUseState({ elapsed: 47, paused: false, dripNo: 9 });
  const [now,  setNow]            = aUseState(() => new Date());

  // Live brewing simulation tick — 1Hz when not paused.
  aUseEffect(() => {
    const id = setInterval(() => {
      setNow(new Date());
      setBrew((b) => {
        if (b.paused) return b;
        const stages = active.stages || [];
        const total  = stages.length ? stages[stages.length - 1].to : 180;
        let next = b.elapsed + 1;
        if (next > total + 30) {
          next = 0;          // loop the demo so the screen always shows the performance
          return { ...b, elapsed: next, dripNo: b.dripNo + 1 };
        }
        return { ...b, elapsed: next };
      });
    }, 1000);
    return () => clearInterval(id);
  }, [active]);

  const clock = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  // Handlers
  // startBrew: starts the brew on the given spout AND navigates to the full screen.
  // Used when the user explicitly wants to watch the performance.
  const startBrew = (r, spoutId) => {
    armBrew(r, spoutId);
    setScreen('brewing');
  };
  // armBrew: same as startBrew but stays on the dashboard so the operator
  // can see the live mini and continue working with other spouts.
  const armBrew = (r, spoutId) => {
    setActive(r);
    if (spoutId != null) {
      setActiveSpout(spoutId);
      setLoadedSpouts(prev => {
        const next = { ...prev };
        delete next[spoutId];
        return next;
      });
    }
    setBrew({ elapsed: 0, paused: false, dripNo: brew.dripNo + 1 });
  };
  const loadRecipe = (r, spoutId) => {
    setLoadedSpouts(prev => ({ ...prev, [spoutId]: r }));
  };
  const unloadRecipe = (spoutId) => {
    setLoadedSpouts(prev => {
      const next = { ...prev };
      delete next[spoutId];
      return next;
    });
  };
  const openDetail = (r) => { setOpened(r); setScreen('detail'); };

  let body = null;
  if (screen === 'brewing') {
    body = (
      <BrewingScreen
        recipe={active}
        spoutId={activeSpout}
        brewState={brew}
        onPause={() => setBrew({ ...brew, paused: !brew.paused })}
        onStop={() => setBrew({ elapsed: 0, paused: true, dripNo: brew.dripNo })}
      />
    );
  } else if (screen === 'dashboard') {
    body = (
      <DashboardScreen
        recipe={active}
        activeSpout={activeSpout}
        loadedSpouts={loadedSpouts}
        brewState={brew}
        onOpenBrewing={() => setScreen('brewing')}
        onPickRecipe={(r, spout) => loadRecipe(r, spout.id)}
        onStartLoaded={(spoutId) => {
          const r = loadedSpouts[spoutId];
          if (r) armBrew(r, spoutId);   // start brew but STAY on dashboard
        }}
        onUnload={unloadRecipe}
      />
    );
  } else if (screen === 'library') {
    body = <LibraryScreen onOpen={openDetail} />;
  } else if (screen === 'detail') {
    body = <DetailScreen recipe={opened} onStart={() => startBrew(opened)} onBack={() => setScreen('library')} />;
  } else if (screen === 'settings') {
    body = <SettingsScreen />;
  }

  return (
    <div className="w-full h-full flex flex-col bg-cream" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <main className="flex-1 min-h-0 bg-cream">
        {body}
      </main>
      <NavRail
        items={NAV_ITEMS}
        active={screen}
        onSelect={setScreen}
        clock={clock}
        drip={String(brew.dripNo).padStart(2, '0')}
      />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
