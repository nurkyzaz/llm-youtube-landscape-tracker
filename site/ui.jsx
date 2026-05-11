/* global React */
const { useState, useMemo, useEffect } = React;

// ───────────────────────────────────────────────────────── helpers ──
const fmt = {
  views(n) {
    if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
    if (n >= 1e3) return Math.round(n / 1e3) + "K";
    return String(n);
  },
  duration(m) {
    const h = Math.floor(m / 60), mm = m % 60;
    return h ? `${h}:${String(mm).padStart(2, "0")}` : `${mm}:00`;
  },
  ago(days) {
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} wk ago`;
    return `${Math.floor(days / 30)} mo ago`;
  },
  clock(t) {
    const d = new Date(t);
    return d.toTimeString().slice(0, 8);
  },
};

const stanceLabel = {
  hype:       { glyph: "▲", label: "Hyped",       color: "var(--accent)" },
  skeptical:  { glyph: "▼", label: "Skeptical",   color: "var(--ink)" },
  neutral:    { glyph: "●", label: "Neutral",     color: "var(--ink-mute)" },
  analytical: { glyph: "◆", label: "Analytical",  color: "var(--good)" },
};

// ────────────────────────────────────────────────── header ──────────
function Header({ meta, counts }) {
  return (
    <header style={{ padding: "44px 48px 32px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24, flexWrap: "wrap" }}>
        <div style={{ maxWidth: 760 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 18,
                        padding: "6px 12px", background: "var(--accent)", color: "white",
                        borderRadius: 999, fontSize: 12, fontWeight: 700, letterSpacing: ".02em", whiteSpace: "nowrap" }}>
            LLM TRACKER · SCHEDULED
          </div>
          <h1 style={{ margin: 0, fontSize: 56, lineHeight: 1.04, fontWeight: 800, letterSpacing: "-.03em", color: "var(--ink)" }}>
            The LLM YouTube<br/>Landscape
          </h1>
          <p style={{ margin: "18px 0 0", color: "var(--ink-mute)", fontSize: 17, lineHeight: 1.45, fontWeight: 500, maxWidth: 640 }}>
            Transcript-backed monitoring of <b style={{ color: "var(--ink)" }}>{counts.channels} popular channels</b> covering large language models.
            Every row reflects what the creator actually said — not the title or thumbnail.
          </p>
        </div>
        <RefreshBadge meta={meta} counts={counts} />
      </div>
    </header>
  );
}

function RefreshBadge({ meta, counts }) {
  const updated = meta?.lastUpdated || "not run yet";
  const warning = meta?.warning;
  return (
    <div style={{
      background: "var(--bg-card)", border: "1px solid var(--rule-soft)",
      borderRadius: 16, padding: 16, minWidth: 240,
      display: "flex", flexDirection: "column", gap: 12,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 13, color: "var(--ink)", whiteSpace: "nowrap" }}>
          <span style={{
            width: 8, height: 8, borderRadius: 999,
            background: warning ? "var(--warn)" : "var(--accent)",
          }} />
          Last updated
        </span>
        <span style={{ fontSize: 12, color: "var(--ink-mute)", fontFamily: "var(--mono)", whiteSpace: "nowrap" }}>
          {updated}
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <Stat n={counts.videos} l="Videos" />
        <Stat n={counts.fresh} l="New today" accent />
      </div>
      {warning && <div style={{ fontSize: 12, lineHeight: 1.4, color: "var(--warn)", fontWeight: 700 }}>{warning}</div>}
    </div>
  );
}

function Stat({ n, l, accent }) {
  return (
    <div style={{
      background: accent ? "var(--accent)" : "var(--bg-sunk)",
      color: accent ? "white" : "var(--ink)",
      borderRadius: 12, padding: "10px 12px",
    }}>
      <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1, letterSpacing: "-.02em" }}>{n}</div>
      <div style={{ fontSize: 11, fontWeight: 600, opacity: accent ? 0.9 : 0.7, marginTop: 4, textTransform: "uppercase", letterSpacing: ".06em" }}>{l}</div>
    </div>
  );
}

function PillButton({ children, onClick, secondary, small }) {
  const base = {
    fontFamily: "var(--sans)", fontWeight: 600, fontSize: small ? 12 : 13,
    padding: small ? "6px 12px" : "9px 16px",
    borderRadius: 999, cursor: "pointer",
    border: "1px solid transparent",
    transition: "transform .08s, background .12s",
    flexShrink: 0, whiteSpace: "nowrap",
  };
  const styles = secondary
    ? { ...base, background: "var(--bg)", color: "var(--ink)", border: "1px solid var(--rule)" }
    : { ...base, background: "var(--ink)", color: "var(--bg)" };
  return (
    <button onClick={onClick} style={styles}
      onMouseDown={e => e.currentTarget.style.transform = "scale(.97)"}
      onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
      onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
      {children}
    </button>
  );
}

// ────────────────────────────────────────────────── filter bar ──────
function FilterBar({ filters, setFilters, channels, topics, models, resultCount, totalCount }) {
  const active = filters.q || filters.channel !== "all" || filters.topic !== "all" || filters.model !== "all" || filters.stance !== "all";
  return (
    <div style={{
      display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center",
      padding: "16px 48px", borderBottom: "1px solid var(--rule-soft)",
      background: "var(--bg)",
    }}>
      <SearchInput value={filters.q} onChange={q => setFilters({ ...filters, q })} />
      <PillSelect value={filters.channel} onChange={v => setFilters({ ...filters, channel: v })}
        placeholder="All channels"
        options={[["all", "All channels"], ...channels.map(c => [c.id, c.name])]} />
      <PillSelect value={filters.topic} onChange={v => setFilters({ ...filters, topic: v })}
        placeholder="All topics"
        options={[["all", "All topics"], ...topics.map(t => [t, t])]} />
      <PillSelect value={filters.model} onChange={v => setFilters({ ...filters, model: v })}
        placeholder="All models"
        options={[["all", "All models"], ...models.map(m => [m, m])]} />
      <PillSelect value={filters.stance} onChange={v => setFilters({ ...filters, stance: v })}
        placeholder="Any stance"
        options={[["all", "Any stance"], ["hype", "Hyped"], ["skeptical", "Skeptical"], ["neutral", "Neutral"], ["analytical", "Analytical"]]} />
      <div style={{ flex: 1 }} />
      <span style={{ fontSize: 13, color: "var(--ink-mute)", fontWeight: 600 }}>
        {resultCount === totalCount ? `${totalCount} videos` : `${resultCount} of ${totalCount}`}
      </span>
      {active && (
        <PillButton onClick={() => setFilters({ q: "", channel: "all", topic: "all", model: "all", stance: "all" })} secondary small>
          Clear all
        </PillButton>
      )}
    </div>
  );
}

function SearchInput({ value, onChange }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 8,
      padding: "8px 14px", background: "var(--bg-card)",
      borderRadius: 999, border: "1px solid var(--rule-soft)",
      minWidth: 280, transition: "border-color .12s",
    }}
      onFocus={e => e.currentTarget.style.borderColor = "var(--ink)"}
      onBlur={e => e.currentTarget.style.borderColor = "var(--rule-soft)"}>
      <span style={{ color: "var(--ink-mute)", fontSize: 14 }}>⌕</span>
      <input value={value} onChange={e => onChange(e.target.value)}
        placeholder="Search titles, quotes, models…"
        style={{ border: 0, outline: 0, background: "transparent", flex: 1, fontSize: 14, color: "var(--ink)", fontWeight: 500 }} />
      {value && <button onClick={() => onChange("")} style={{ color: "var(--ink-mute)", fontSize: 16 }}>×</button>}
    </div>
  );
}

function PillSelect({ value, onChange, options, placeholder }) {
  const isAll = value === "all";
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{
          appearance: "none", WebkitAppearance: "none",
          border: "1px solid var(--rule-soft)",
          background: isAll ? "var(--bg-card)" : "var(--ink)",
          color: isAll ? "var(--ink-mute)" : "var(--bg)",
          borderRadius: 999,
          padding: "8px 30px 8px 14px", fontSize: 13, fontWeight: 600,
          cursor: "pointer", fontFamily: "var(--sans)",
        }}>
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
      <span style={{
        position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
        pointerEvents: "none", fontSize: 10, color: isAll ? "var(--ink-mute)" : "var(--bg)",
      }}>▾</span>
    </div>
  );
}

// ──────────────────────────────────────────────── videos table ──────
function VideosTable({ videos, onSelect, selectedId }) {
  return (
    <div style={{ padding: "0 24px" }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "180px minmax(260px,1fr) 180px 130px 100px",
        gap: 16, alignItems: "center",
        padding: "16px 20px 12px", margin: "12px 0 0",
      }}>
        {["Channel", "Video", "Topics", "Stance", "Posted"].map((h) => (
          <div key={h} style={{
            fontSize: 11, fontWeight: 700, color: "var(--ink-mute)",
            textTransform: "uppercase", letterSpacing: ".09em",
          }}>{h}</div>
        ))}
      </div>
      <div style={{
        background: "var(--bg-card)", borderRadius: 16,
        border: "1px solid var(--rule-soft)", overflowX: "auto", overflowY: "hidden",
      }}>
        {videos.map((v, i) => <Row key={v.id} v={v} onSelect={onSelect} selected={selectedId === v.id} last={i === videos.length - 1} />)}
        {videos.length === 0 && (
          <div style={{ padding: 80, textAlign: "center", color: "var(--ink-mute)" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: "var(--ink)" }}>No matches</div>
            <div style={{ fontSize: 14, marginTop: 8 }}>Try clearing the search or broadening a dropdown.</div>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ v, onSelect, selected, last }) {
  const s = stanceLabel[v.stance];
  return (
    <button onClick={() => onSelect(v.id)} style={{
      display: "grid",
      gridTemplateColumns: "180px minmax(260px,1fr) 180px 130px 100px",
      gap: 16, alignItems: "center", textAlign: "left",
      padding: "0 20px", height: "var(--row-h)", width: "100%",  minWidth: 900,
      borderBottom: last ? "none" : "1px solid var(--rule-soft)",
      background: selected ? "var(--bg-sunk)" : "transparent",
      cursor: "pointer", position: "relative",
      transition: "background .12s",
    }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.background = "var(--bg-sunk)"; }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.background = "transparent"; }}>
      <span style={{ display: "flex", alignItems: "center", gap: 12, overflow: "hidden" }}>
        <ChannelMark id={v.channelId} />
        <span style={{ fontSize: 14.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "var(--ink)" }}>
          {v.channel}
        </span>
      </span>
      <span style={{ fontSize: 15, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", paddingRight: 12, display: "flex", alignItems: "center", gap: 10, color: "var(--ink)" }}>
        {v.new && <NewBadge />}
        {v.title}
      </span>
      <span style={{ fontSize: 13, color: "var(--ink-mute)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontWeight: 500 }}>
        {v.topics.slice(0, 2).join(" · ")}
        {v.topics.length > 2 && <span style={{ color: "var(--ink-soft)" }}> +{v.topics.length - 2}</span>}
      </span>
      <StanceChip stance={v.stance} />
      <span style={{ fontSize: 13, color: "var(--ink-mute)", fontWeight: 500 }}>
        {fmt.ago(v.daysAgo)}
      </span>
    </button>
  );
}

function NewBadge() {
  return (
    <span style={{
      fontSize: 10, fontWeight: 800, letterSpacing: ".06em",
      padding: "3px 7px", background: "var(--accent)", color: "white",
      borderRadius: 6, flexShrink: 0,
    }}>NEW</span>
  );
}

function StanceChip({ stance }) {
  const s = stanceLabel[stance];
  const filled = stance === "hype" || stance === "analytical";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "5px 11px 5px 9px", borderRadius: 999,
      fontSize: 12, fontWeight: 700,
      background: filled
        ? (stance === "hype" ? "var(--accent)" : "var(--ink)")
        : "var(--bg-sunk)",
      color: filled ? "white" : "var(--ink)",
      border: filled ? "none" : "1px solid var(--rule-soft)",
      width: "fit-content",
    }}>
      <span style={{ fontSize: 9 }}>{s.glyph}</span>
      {s.label}
    </span>
  );
}

function ChannelMark({ id, size = 32 }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: size, height: size, borderRadius: 10,
      background: "var(--ink)", color: "var(--bg)",
      fontSize: 14, fontWeight: 800, letterSpacing: "-.02em",
      flexShrink: 0,
    }}>{id}</span>
  );
}

// ──────────────────────────────────────────────── drill-down ────────
function VideoPanel({ video, channel, onClose }) {
  if (!video) return null;
  const t = video.transcript;
  const s = stanceLabel[video.stance];
  const ingestion = [
    `Video discovered via YouTube RSS${video.publishedAt ? ` · ${video.publishedAt}` : ""}`,
    `${video.transcriptStatus === "available" ? "Captions fetched" : "Caption fetch queued"} via ${video.transcriptProvider || "n/a"}`,
    `Summary status: ${video.status || "pending"}${video.summaryProvider ? ` · ${video.summaryProvider}` : ""}`,
    "Topics, stance, and channel matrix generated from backend JSON",
  ];
  return (
    <aside style={{
      position: "fixed", top: 0, right: 0, bottom: 0, width: "min(580px, 48vw)",
      background: "var(--bg)", borderLeft: "1px solid var(--rule)",
      boxShadow: "-32px 0 80px -40px rgba(39, 48, 67, 0.25)",
      overflowY: "auto", zIndex: 30,
      animation: "slideIn .25s cubic-bezier(.2,.8,.2,1)",
    }}>
      <style>{`@keyframes slideIn { from { transform: translateX(20px); opacity: 0; } to { transform: none; opacity: 1; } }`}</style>
      <div style={{ position: "sticky", top: 0, zIndex: 2, background: "var(--bg)", padding: "20px 32px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--rule-soft)" }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-mute)", textTransform: "uppercase", letterSpacing: ".08em" }}>
          Video detail · {video.id}
        </span>
        <PillButton onClick={onClose} secondary small>Close ✕</PillButton>
      </div>

      <div style={{ padding: "24px 32px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 14, marginBottom: 18 }}>
          <ChannelMark id={video.channelId} size={36} />
          <div>
            <div style={{ fontWeight: 700, color: "var(--ink)" }}>{video.channel}</div>
            <div style={{ color: "var(--ink-mute)", fontSize: 13 }}>{channel?.desc || video.relationship || "LLM coverage"}</div>
          </div>
        </div>
        <h2 style={{ margin: 0, fontSize: 30, fontWeight: 800, lineHeight: 1.18, letterSpacing: "-.02em", color: "var(--ink)" }}>
          {video.title}
        </h2>
        <div style={{ marginTop: 18, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Meta>{video.date}</Meta>
          <Meta>{fmt.duration(video.duration)}</Meta>
          <Meta>{fmt.views(video.views)} views</Meta>
          <StanceChip stance={video.stance} />
          {video.sourceUrl && (
            <a href={video.sourceUrl} target="_blank" rel="noreferrer" style={{
              fontSize: 12, fontWeight: 700, color: "white", textDecoration: "none",
              padding: "5px 10px", background: "var(--accent)",
              borderRadius: 999,
            }}>Open on YouTube</a>
          )}
        </div>
      </div>

      <div style={{ margin: "28px 32px 0", borderRadius: 12, overflow: "hidden", background: "var(--bg-sunk)" }}>
        <ThumbnailPlaceholder topic={video.topics[0]} />
      </div>

      <Section title="Topics">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {video.topics.map(t => <Tag key={t}>{t}</Tag>)}
        </div>
      </Section>

      <Section title="Models mentioned">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {video.models.map(m => <Tag key={m} accent>{m}</Tag>)}
        </div>
      </Section>

      <div style={{ padding: "28px 32px 0" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: ".09em", marginBottom: 12 }}>
          Key quote · auto-extracted
        </div>
        <blockquote style={{
          margin: 0, padding: "20px 24px",
          background: "var(--ink)", color: "var(--bg)",
          borderRadius: 16,
          fontSize: 19, lineHeight: 1.36, fontWeight: 500, letterSpacing: "-.01em",
        }}>
          “{t.quote}”
        </blockquote>
      </div>

      <Section title="What the transcript actually says">
        <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
          {t.bullets.map((b, i) => (
            <li key={i} style={{
              marginBottom: 12, fontSize: 14.5, lineHeight: 1.5, color: "var(--ink)",
              position: "relative", paddingLeft: 22, fontWeight: 500,
            }}>
              <span style={{
                position: "absolute", left: 0, top: 6,
                width: 12, height: 2, background: "var(--accent)",
              }} />
              {b}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Transcript excerpt">
        <p style={{
          margin: 0, padding: "14px 16px", background: "var(--bg-card)",
          border: "1px solid var(--rule-soft)", borderRadius: 12,
          fontSize: 14, color: "var(--ink-mute)", lineHeight: 1.55, fontWeight: 500,
        }}>
          {t.excerpt}
        </p>
      </Section>

      <Section title="Ingestion record" last>
        <div style={{ fontSize: 13.5, color: "var(--ink-mute)", lineHeight: 2, fontWeight: 500 }}>
          {ingestion.map((l, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ color: "var(--good)", fontWeight: 800 }}>✓</span>
              {l}
            </div>
          ))}
        </div>
      </Section>
    </aside>
  );
}

function Meta({ children }) {
  return (
    <span style={{
      fontSize: 12, fontWeight: 600, color: "var(--ink-mute)",
      padding: "5px 10px", background: "var(--bg-card)",
      borderRadius: 999, border: "1px solid var(--rule-soft)",
    }}>{children}</span>
  );
}

function Tag({ children, accent }) {
  return (
    <span style={{
      fontSize: 13, fontWeight: 600,
      padding: "6px 12px", borderRadius: 999,
      background: accent ? "var(--accent)" : "var(--bg-card)",
      color: accent ? "white" : "var(--ink)",
      border: accent ? "none" : "1px solid var(--rule-soft)",
    }}>{children}</span>
  );
}

function Section({ title, children, last }) {
  return (
    <div style={{ padding: last ? "28px 32px 40px" : "28px 32px 0" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-mute)", textTransform: "uppercase", letterSpacing: ".09em", marginBottom: 14 }}>{title}</div>
      {children}
    </div>
  );
}

function ThumbnailPlaceholder({ topic }) {
  return (
    <div style={{
      aspectRatio: "16 / 9", position: "relative",
      background: "var(--ink)", color: "var(--bg)",
      display: "flex", alignItems: "center", justifyContent: "center",
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "repeating-linear-gradient(135deg, transparent 0 22px, rgba(255,255,255,.06) 22px 44px)",
      }} />
      <div style={{ position: "relative", textAlign: "center" }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".18em", opacity: .55, marginBottom: 8 }}>THUMBNAIL</div>
        <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-.02em" }}>{topic}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────── heatmap view ───────
function Heatmap({ channels, topics, matrix, onCellClick }) {
  const max = Math.max(...channels.flatMap(c => topics.map(t => matrix[c.id][t])));
  return (
    <div style={{ padding: "36px 48px 48px" }}>
      <div style={{ marginBottom: 28, maxWidth: 720 }}>
        <h2 style={{ margin: 0, fontSize: 36, fontWeight: 800, lineHeight: 1.1, letterSpacing: "-.025em", color: "var(--ink)" }}>How channels cover topics</h2>
        <p style={{ margin: "10px 0 0", color: "var(--ink-mute)", fontSize: 15.5, lineHeight: 1.5, fontWeight: 500 }}>
          Each cell counts the videos a channel has published touching a topic. Click any cell to see those videos.
        </p>
      </div>
      <div style={{ overflowX: "auto", background: "var(--bg-card)", borderRadius: 16, padding: 20, border: "1px solid var(--rule-soft)" }}>
        <div style={{ display: "grid", gridTemplateColumns: `220px repeat(${topics.length}, minmax(38px, 1fr))`, gap: 4, minWidth: 900 }}>
          <div />
          {topics.map(t => (
            <div key={t} style={{
              fontSize: 11, fontWeight: 600, color: "var(--ink-mute)",
              writingMode: "vertical-rl", transform: "rotate(180deg)",
              padding: "4px 0", height: 120, display: "flex", alignItems: "flex-end",
            }}>{t}</div>
          ))}
          {channels.map(c => (
            <React.Fragment key={c.id}>
              <div style={{ padding: "10px 14px 10px 0", display: "flex", alignItems: "center", gap: 12 }}>
                <ChannelMark id={c.id} size={28} />
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{c.name}</span>
              </div>
              {topics.map(t => {
                const v = matrix[c.id][t];
                const a = max ? v / max : 0;
                const filled = v > 0;
                return (
                  <button key={t} onClick={() => onCellClick(c.id, t)}
                    title={`${c.name} × ${t}: ${v} videos`}
                    style={{
                      background: filled ? `color-mix(in srgb, var(--accent) ${10 + a * 75}%, transparent)` : "var(--bg-sunk)",
                      height: 36, borderRadius: 6,
                      color: a > 0.55 ? "white" : "var(--ink)",
                      fontWeight: 700, fontSize: 12.5,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: filled ? "pointer" : "default",
                      transition: "transform .08s",
                    }}
                    onMouseEnter={e => filled && (e.currentTarget.style.transform = "scale(1.08)")}
                    onMouseLeave={e => e.currentTarget.style.transform = "none"}>
                    {v > 0 ? v : ""}
                  </button>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
      <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 12, fontSize: 12.5, color: "var(--ink-mute)", fontWeight: 600 }}>
        <span>Fewer</span>
        <div style={{ display: "flex", gap: 3 }}>
          {[0, 1, 2, 3, 4, 5].map(i => (
            <div key={i} style={{
              width: 28, height: 14, borderRadius: 3,
              background: i === 0 ? "var(--bg-sunk)" : `color-mix(in srgb, var(--accent) ${10 + (i / 5) * 75}%, transparent)`,
            }} />
          ))}
        </div>
        <span>More videos</span>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────── ingestion log ───────
function IngestionLog({ entries }) {
  return (
    <div style={{ padding: "36px 48px 48px" }}>
      <div style={{ marginBottom: 24, maxWidth: 720 }}>
        <h2 style={{ margin: 0, fontSize: 36, fontWeight: 800, lineHeight: 1.1, letterSpacing: "-.025em", color: "var(--ink)" }}>Pipeline activity</h2>
        <p style={{ margin: "10px 0 0", color: "var(--ink-mute)", fontSize: 15.5, lineHeight: 1.5, fontWeight: 500 }}>
          Most recent ingestion events from the running pipeline.
        </p>
      </div>
      <div style={{ background: "var(--bg-card)", borderRadius: 16, border: "1px solid var(--rule-soft)", overflow: "hidden" }}>
        {entries.map((e, i) => (
          <div key={i} style={{
            display: "grid", gridTemplateColumns: "110px 130px 1fr",
            gap: 20, padding: "14px 22px", fontSize: 14, fontWeight: 500,
            borderBottom: i === entries.length - 1 ? "none" : "1px solid var(--rule-soft)",
            color: "var(--ink-mute)", alignItems: "center",
          }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: 12.5, color: "var(--ink-soft)" }}>{fmt.clock(e.t)}</span>
            <span>
              <span style={{
                fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 999,
                background: e.verb === "error" ? "var(--accent)" : "var(--bg-sunk)",
                color: e.verb === "error" ? "white" : "var(--ink)",
              }}>{e.verb}</span>
            </span>
            <span>
              {e.msg} <span style={{ color: "var(--ink-soft)" }}>· {e.title}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────── view switcher tabs ─────
function ViewTabs({ view, setView }) {
  const tabs = [
    ["table", "Videos"],
    ["heatmap", "Topic coverage"],
    ["log", "Pipeline"],
  ];
  return (
    <div style={{
      display: "flex", gap: 8, padding: "8px 48px 16px",
      borderBottom: "1px solid var(--rule-soft)",
    }}>
      {tabs.map(([k, l]) => {
        const on = view === k;
        return (
          <button key={k} onClick={() => setView(k)} style={{
            padding: "9px 16px",
            fontSize: 14, fontWeight: 600,
            color: on ? "var(--bg)" : "var(--ink)",
            background: on ? "var(--ink)" : "transparent",
            borderRadius: 999, border: on ? "none" : "1px solid var(--rule-soft)",
            cursor: "pointer", transition: "background .12s",
          }}>
            {l}
          </button>
        );
      })}
    </div>
  );
}

Object.assign(window, {
  Header, FilterBar, VideosTable, VideoPanel, Heatmap,
  IngestionLog, ViewTabs, fmt,
});
