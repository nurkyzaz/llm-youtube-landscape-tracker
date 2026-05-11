/* global React, ReactDOM, useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakToggle, TweakSelect */
const { useState, useMemo, useEffect } = React;

const DEFAULTS = /*EDITMODE-BEGIN*/{
  "density": "comfortable",
  "theme": "light",
  "relView": "heatmap",
  "showLog": true,
  "accent": "#c2603f"
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(DEFAULTS);
  const { CHANNELS, TOPICS, MODELS, VIDEOS, MATRIX, INGEST_LOG } = window.__DATA__;

  const [filters, setFilters] = useState({ q: "", channel: "all", topic: "all", model: "all", stance: "all" });
  const [selectedId, setSelectedId] = useState(null);
  const [view, setView] = useState("table");
  const [paused, setPaused] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  // Apply theme + density to body
  useEffect(() => {
    document.body.dataset.theme = t.theme;
    document.body.dataset.density = t.density;
    document.documentElement.style.setProperty("--accent", oklchFromHex(t.accent));
  }, [t.theme, t.density, t.accent]);

  // Simulated live refresh tick
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setLastRefresh(Date.now()), 45000);
    return () => clearInterval(id);
  }, [paused]);

  const filtered = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    return VIDEOS.filter(v => {
      if (filters.channel !== "all" && v.channelId !== filters.channel) return false;
      if (filters.topic !== "all" && !v.topics.includes(filters.topic)) return false;
      if (filters.model !== "all" && !v.models.includes(filters.model)) return false;
      if (filters.stance !== "all" && v.stance !== filters.stance) return false;
      if (q) {
        const hay = (v.title + " " + v.channel + " " + v.topics.join(" ") + " " + v.models.join(" ") + " " + v.transcript.quote + " " + v.transcript.excerpt).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [filters, VIDEOS]);

  const counts = {
    videos: VIDEOS.length,
    channels: CHANNELS.length,
    transcripts: VIDEOS.filter(v => v.transcriptStatus === "available").length,
    fresh: VIDEOS.filter(v => v.new).length,
    events: INGEST_LOG.length,
  };

  const selected = VIDEOS.find(v => v.id === selectedId);
  const selectedChannel = selected ? CHANNELS.find(c => c.id === selected.channelId) : null;

  return (
    <>
      <Header
        lastRefresh={lastRefresh}
        paused={paused}
        onTogglePause={() => setPaused(p => !p)}
        onForceRefresh={() => setLastRefresh(Date.now())}
        counts={counts}
      />
      <ViewTabs view={view} setView={setView} counts={counts} />

      {view === "table" && (
        <>
          <FilterBar
            filters={filters} setFilters={setFilters}
            channels={CHANNELS} topics={TOPICS} models={MODELS}
            resultCount={filtered.length} totalCount={VIDEOS.length}
          />
          <VideosTable videos={filtered} onSelect={id => setSelectedId(id === selectedId ? null : id)} selectedId={selectedId} />
        </>
      )}

      {view === "heatmap" && (
        <Heatmap channels={CHANNELS} topics={TOPICS} matrix={MATRIX}
          onCellClick={(channel, topic) => { setView("table"); setFilters({ ...filters, channel, topic }); }} />
      )}

      {view === "graph" && (
        <RelationshipGraph channels={CHANNELS} topics={TOPICS} matrix={MATRIX} />
      )}

      {view === "log" && (
        <IngestionLog entries={INGEST_LOG} />
      )}

      <footer style={{
        padding: "20px 32px 36px", borderTop: "1px solid var(--rule)",
        color: "var(--ink-soft)", fontSize: 12, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
      }}>
        <span className="mono">
          Pipeline: YouTube RSS → captions/transcript fallback → GitHub Models/local summary → static data.js → GitHub Pages.
        </span>
        <span className="mono">© {new Date().getFullYear()} · Live tracker using public YouTube metadata and transcript-backed summaries.</span>
      </footer>

      <VideoPanel video={selected} channel={selectedChannel} onClose={() => setSelectedId(null)} />

      <TweaksPanel title="Tweaks">
        <TweakSection label="Display">
          <TweakRadio label="Density" value={t.density} onChange={v => setTweak("density", v)}
            options={[{value:"comfortable",label:"Comfy"},{value:"compact",label:"Compact"},{value:"dense",label:"Dense"}]} />
          <TweakRadio label="Theme" value={t.theme} onChange={v => setTweak("theme", v)}
            options={[{value:"light",label:"Light"},{value:"sepia",label:"Sepia"},{value:"dark",label:"Dark"}]} />
        </TweakSection>
        <TweakSection label="Accent">
          <ColorSwatches value={t.accent} onChange={v => setTweak("accent", v)}
            options={["#c2603f", "#3f6cc2", "#3f9270", "#7a3fc2", "#2b2b2b"]} />
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

function ColorSwatches({ value, onChange, options }) {
  return (
    <div style={{ display: "flex", gap: 8, padding: "4px 0" }}>
      {options.map(c => (
        <button key={c} onClick={() => onChange(c)} title={c}
          style={{
            width: 28, height: 28, borderRadius: 999,
            background: c, cursor: "pointer",
            border: value === c ? "2px solid var(--ink)" : "2px solid var(--rule)",
            outline: value === c ? "2px solid var(--bg)" : "none",
            outlineOffset: -4,
          }} />
      ))}
    </div>
  );
}

function oklchFromHex(hex) {
  // Cheap mapping — just return the hex; oklch(from <hex>...) works in modern browsers
  return hex;
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
