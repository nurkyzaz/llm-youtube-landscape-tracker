
/* /home/runner/work/llm-youtube-landscape-tracker/llm-youtube-landscape-tracker/site/tweaks-panel.jsx */
(function(){
const __TWEAKS_STYLE = `
  .twk-panel{position:fixed;right:16px;bottom:16px;z-index:2147483646;width:280px;
    max-height:calc(100vh - 32px);display:flex;flex-direction:column;
    transform:scale(var(--dc-inv-zoom,1));transform-origin:bottom right;
    background:rgba(250,249,247,.78);color:#29261b;
    -webkit-backdrop-filter:blur(24px) saturate(160%);backdrop-filter:blur(24px) saturate(160%);
    border:.5px solid rgba(255,255,255,.6);border-radius:14px;
    box-shadow:0 1px 0 rgba(255,255,255,.5) inset,0 12px 40px rgba(0,0,0,.18);
    font:11.5px/1.4 ui-sans-serif,system-ui,-apple-system,sans-serif;overflow:hidden}
  .twk-hd{display:flex;align-items:center;justify-content:space-between;
    padding:10px 8px 10px 14px;cursor:move;user-select:none}
  .twk-hd b{font-size:12px;font-weight:600;letter-spacing:.01em}
  .twk-x{appearance:none;border:0;background:transparent;color:rgba(41,38,27,.55);
    width:22px;height:22px;border-radius:6px;cursor:default;font-size:13px;line-height:1}
  .twk-x:hover{background:rgba(0,0,0,.06);color:#29261b}
  .twk-body{padding:2px 14px 14px;display:flex;flex-direction:column;gap:10px;
    overflow-y:auto;overflow-x:hidden;min-height:0;
    scrollbar-width:thin;scrollbar-color:rgba(0,0,0,.15) transparent}
  .twk-body::-webkit-scrollbar{width:8px}
  .twk-body::-webkit-scrollbar-track{background:transparent;margin:2px}
  .twk-body::-webkit-scrollbar-thumb{background:rgba(0,0,0,.15);border-radius:4px;
    border:2px solid transparent;background-clip:content-box}
  .twk-body::-webkit-scrollbar-thumb:hover{background:rgba(0,0,0,.25);
    border:2px solid transparent;background-clip:content-box}
  .twk-row{display:flex;flex-direction:column;gap:5px}
  .twk-row-h{flex-direction:row;align-items:center;justify-content:space-between;gap:10px}
  .twk-lbl{display:flex;justify-content:space-between;align-items:baseline;
    color:rgba(41,38,27,.72)}
  .twk-lbl>span:first-child{font-weight:500}
  .twk-val{color:rgba(41,38,27,.5);font-variant-numeric:tabular-nums}

  .twk-sect{font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
    color:rgba(41,38,27,.45);padding:10px 0 0}
  .twk-sect:first-child{padding-top:0}

  .twk-field{appearance:none;width:100%;height:26px;padding:0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;
    background:rgba(255,255,255,.6);color:inherit;font:inherit;outline:none}
  .twk-field:focus{border-color:rgba(0,0,0,.25);background:rgba(255,255,255,.85)}
  select.twk-field{padding-right:22px;
    background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path fill='rgba(0,0,0,.5)' d='M0 0h10L5 6z'/></svg>");
    background-repeat:no-repeat;background-position:right 8px center}

  .twk-slider{appearance:none;-webkit-appearance:none;width:100%;height:4px;margin:6px 0;
    border-radius:999px;background:rgba(0,0,0,.12);outline:none}
  .twk-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;
    width:14px;height:14px;border-radius:50%;background:#fff;
    border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}
  .twk-slider::-moz-range-thumb{width:14px;height:14px;border-radius:50%;
    background:#fff;border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}

  .twk-seg{position:relative;display:flex;padding:2px;border-radius:8px;
    background:rgba(0,0,0,.06);user-select:none}
  .twk-seg-thumb{position:absolute;top:2px;bottom:2px;border-radius:6px;
    background:rgba(255,255,255,.9);box-shadow:0 1px 2px rgba(0,0,0,.12);
    transition:left .15s cubic-bezier(.3,.7,.4,1),width .15s}
  .twk-seg.dragging .twk-seg-thumb{transition:none}
  .twk-seg button{appearance:none;position:relative;z-index:1;flex:1;border:0;
    background:transparent;color:inherit;font:inherit;font-weight:500;min-height:22px;
    border-radius:6px;cursor:default;padding:4px 6px;line-height:1.2;
    overflow-wrap:anywhere}

  .twk-toggle{position:relative;width:32px;height:18px;border:0;border-radius:999px;
    background:rgba(0,0,0,.15);transition:background .15s;cursor:default;padding:0}
  .twk-toggle[data-on="1"]{background:#34c759}
  .twk-toggle i{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;
    background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25);transition:transform .15s}
  .twk-toggle[data-on="1"] i{transform:translateX(14px)}

  .twk-num{display:flex;align-items:center;height:26px;padding:0 0 0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;background:rgba(255,255,255,.6)}
  .twk-num-lbl{font-weight:500;color:rgba(41,38,27,.6);cursor:ew-resize;
    user-select:none;padding-right:8px}
  .twk-num input{flex:1;min-width:0;height:100%;border:0;background:transparent;
    font:inherit;font-variant-numeric:tabular-nums;text-align:right;padding:0 8px 0 0;
    outline:none;color:inherit;-moz-appearance:textfield}
  .twk-num input::-webkit-inner-spin-button,.twk-num input::-webkit-outer-spin-button{
    -webkit-appearance:none;margin:0}
  .twk-num-unit{padding-right:8px;color:rgba(41,38,27,.45)}

  .twk-btn{appearance:none;height:26px;padding:0 12px;border:0;border-radius:7px;
    background:rgba(0,0,0,.78);color:#fff;font:inherit;font-weight:500;cursor:default}
  .twk-btn:hover{background:rgba(0,0,0,.88)}
  .twk-btn.secondary{background:rgba(0,0,0,.06);color:inherit}
  .twk-btn.secondary:hover{background:rgba(0,0,0,.1)}

  .twk-swatch{appearance:none;-webkit-appearance:none;width:56px;height:22px;
    border:.5px solid rgba(0,0,0,.1);border-radius:6px;padding:0;cursor:default;
    background:transparent;flex-shrink:0}
  .twk-swatch::-webkit-color-swatch-wrapper{padding:0}
  .twk-swatch::-webkit-color-swatch{border:0;border-radius:5.5px}
  .twk-swatch::-moz-color-swatch{border:0;border-radius:5.5px}

  .twk-chips{display:flex;gap:6px}
  .twk-chip{position:relative;appearance:none;flex:1;min-width:0;height:46px;
    padding:0;border:0;border-radius:6px;overflow:hidden;cursor:default;
    box-shadow:0 0 0 .5px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.06);
    transition:transform .12s cubic-bezier(.3,.7,.4,1),box-shadow .12s}
  .twk-chip:hover{transform:translateY(-1px);
    box-shadow:0 0 0 .5px rgba(0,0,0,.18),0 4px 10px rgba(0,0,0,.12)}
  .twk-chip[data-on="1"]{box-shadow:0 0 0 1.5px rgba(0,0,0,.85),
    0 2px 6px rgba(0,0,0,.15)}
  .twk-chip>span{position:absolute;top:0;bottom:0;right:0;width:34%;
    display:flex;flex-direction:column;box-shadow:-1px 0 0 rgba(0,0,0,.1)}
  .twk-chip>span>i{flex:1;box-shadow:0 -1px 0 rgba(0,0,0,.1)}
  .twk-chip>span>i:first-child{box-shadow:none}
  .twk-chip svg{position:absolute;top:6px;left:6px;width:13px;height:13px;
    filter:drop-shadow(0 1px 1px rgba(0,0,0,.3))}
`;
function useTweaks(defaults) {
  const [values, setValues] = React.useState(defaults);
  const setTweak = React.useCallback((keyOrEdits, val) => {
    const edits = typeof keyOrEdits === 'object' && keyOrEdits !== null ? keyOrEdits : {
      [keyOrEdits]: val
    };
    setValues(prev => ({
      ...prev,
      ...edits
    }));
    window.parent.postMessage({
      type: '__edit_mode_set_keys',
      edits
    }, '*');
    window.dispatchEvent(new CustomEvent('tweakchange', {
      detail: edits
    }));
  }, []);
  return [values, setTweak];
}
function TweaksPanel({
  title = 'Tweaks',
  noDeckControls = false,
  children
}) {
  const [open, setOpen] = React.useState(false);
  const dragRef = React.useRef(null);
  const hasDeckStage = React.useMemo(() => typeof document !== 'undefined' && !!document.querySelector('deck-stage'), []);
  const [railEnabled, setRailEnabled] = React.useState(() => hasDeckStage && !!document.querySelector('deck-stage')?._railEnabled);
  React.useEffect(() => {
    if (!hasDeckStage || railEnabled) return undefined;
    const onMsg = e => {
      if (e.data && e.data.type === '__omelette_rail_enabled') setRailEnabled(true);
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [hasDeckStage, railEnabled]);
  const [railVisible, setRailVisible] = React.useState(() => {
    try {
      return localStorage.getItem('deck-stage.railVisible') !== '0';
    } catch (e) {
      return true;
    }
  });
  const toggleRail = on => {
    setRailVisible(on);
    window.postMessage({
      type: '__deck_rail_visible',
      on
    }, '*');
  };
  const offsetRef = React.useRef({
    x: 16,
    y: 16
  });
  const PAD = 16;
  const clampToViewport = React.useCallback(() => {
    const panel = dragRef.current;
    if (!panel) return;
    const w = panel.offsetWidth,
      h = panel.offsetHeight;
    const maxRight = Math.max(PAD, window.innerWidth - w - PAD);
    const maxBottom = Math.max(PAD, window.innerHeight - h - PAD);
    offsetRef.current = {
      x: Math.min(maxRight, Math.max(PAD, offsetRef.current.x)),
      y: Math.min(maxBottom, Math.max(PAD, offsetRef.current.y))
    };
    panel.style.right = offsetRef.current.x + 'px';
    panel.style.bottom = offsetRef.current.y + 'px';
  }, []);
  React.useEffect(() => {
    if (!open) return;
    clampToViewport();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', clampToViewport);
      return () => window.removeEventListener('resize', clampToViewport);
    }
    const ro = new ResizeObserver(clampToViewport);
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, [open, clampToViewport]);
  React.useEffect(() => {
    const onMsg = e => {
      const t = e?.data?.type;
      if (t === '__activate_edit_mode') setOpen(true);else if (t === '__deactivate_edit_mode') setOpen(false);
    };
    window.addEventListener('message', onMsg);
    window.parent.postMessage({
      type: '__edit_mode_available'
    }, '*');
    return () => window.removeEventListener('message', onMsg);
  }, []);
  const dismiss = () => {
    setOpen(false);
    window.parent.postMessage({
      type: '__edit_mode_dismissed'
    }, '*');
  };
  const onDragStart = e => {
    const panel = dragRef.current;
    if (!panel) return;
    const r = panel.getBoundingClientRect();
    const sx = e.clientX,
      sy = e.clientY;
    const startRight = window.innerWidth - r.right;
    const startBottom = window.innerHeight - r.bottom;
    const move = ev => {
      offsetRef.current = {
        x: startRight - (ev.clientX - sx),
        y: startBottom - (ev.clientY - sy)
      };
      clampToViewport();
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };
  if (!open) return null;
  return React.createElement(React.Fragment, null, React.createElement("style", null, __TWEAKS_STYLE), React.createElement("div", {
    ref: dragRef,
    className: "twk-panel",
    "data-noncommentable": "",
    style: {
      right: offsetRef.current.x,
      bottom: offsetRef.current.y
    }
  }, React.createElement("div", {
    className: "twk-hd",
    onMouseDown: onDragStart
  }, React.createElement("b", null, title), React.createElement("button", {
    className: "twk-x",
    "aria-label": "Close tweaks",
    onMouseDown: e => e.stopPropagation(),
    onClick: dismiss
  }, "\u2715")), React.createElement("div", {
    className: "twk-body"
  }, children, hasDeckStage && railEnabled && !noDeckControls && React.createElement(TweakSection, {
    label: "Deck"
  }, React.createElement(TweakToggle, {
    label: "Thumbnail rail",
    value: railVisible,
    onChange: toggleRail
  })))));
}
function TweakSection({
  label,
  children
}) {
  return React.createElement(React.Fragment, null, React.createElement("div", {
    className: "twk-sect"
  }, label), children);
}
function TweakRow({
  label,
  value,
  children,
  inline = false
}) {
  return React.createElement("div", {
    className: inline ? 'twk-row twk-row-h' : 'twk-row'
  }, React.createElement("div", {
    className: "twk-lbl"
  }, React.createElement("span", null, label), value != null && React.createElement("span", {
    className: "twk-val"
  }, value)), children);
}
function TweakSlider({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  unit = '',
  onChange
}) {
  return React.createElement(TweakRow, {
    label: label,
    value: `${value}${unit}`
  }, React.createElement("input", {
    type: "range",
    className: "twk-slider",
    min: min,
    max: max,
    step: step,
    value: value,
    onChange: e => onChange(Number(e.target.value))
  }));
}
function TweakToggle({
  label,
  value,
  onChange
}) {
  return React.createElement("div", {
    className: "twk-row twk-row-h"
  }, React.createElement("div", {
    className: "twk-lbl"
  }, React.createElement("span", null, label)), React.createElement("button", {
    type: "button",
    className: "twk-toggle",
    "data-on": value ? '1' : '0',
    role: "switch",
    "aria-checked": !!value,
    onClick: () => onChange(!value)
  }, React.createElement("i", null)));
}
function TweakRadio({
  label,
  value,
  options,
  onChange
}) {
  const trackRef = React.useRef(null);
  const [dragging, setDragging] = React.useState(false);
  const valueRef = React.useRef(value);
  valueRef.current = value;
  const labelLen = o => String(typeof o === 'object' ? o.label : o).length;
  const maxLen = options.reduce((m, o) => Math.max(m, labelLen(o)), 0);
  const fitsAsSegments = maxLen <= ({
    2: 16,
    3: 10
  }[options.length] ?? 0);
  if (!fitsAsSegments) {
    const resolve = s => {
      const m = options.find(o => String(typeof o === 'object' ? o.value : o) === s);
      return m === undefined ? s : typeof m === 'object' ? m.value : m;
    };
    return React.createElement(TweakSelect, {
      label: label,
      value: value,
      options: options,
      onChange: s => onChange(resolve(s))
    });
  }
  const opts = options.map(o => typeof o === 'object' ? o : {
    value: o,
    label: o
  });
  const idx = Math.max(0, opts.findIndex(o => o.value === value));
  const n = opts.length;
  const segAt = clientX => {
    const r = trackRef.current.getBoundingClientRect();
    const inner = r.width - 4;
    const i = Math.floor((clientX - r.left - 2) / inner * n);
    return opts[Math.max(0, Math.min(n - 1, i))].value;
  };
  const onPointerDown = e => {
    setDragging(true);
    const v0 = segAt(e.clientX);
    if (v0 !== valueRef.current) onChange(v0);
    const move = ev => {
      if (!trackRef.current) return;
      const v = segAt(ev.clientX);
      if (v !== valueRef.current) onChange(v);
    };
    const up = () => {
      setDragging(false);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return React.createElement(TweakRow, {
    label: label
  }, React.createElement("div", {
    ref: trackRef,
    role: "radiogroup",
    onPointerDown: onPointerDown,
    className: dragging ? 'twk-seg dragging' : 'twk-seg'
  }, React.createElement("div", {
    className: "twk-seg-thumb",
    style: {
      left: `calc(2px + ${idx} * (100% - 4px) / ${n})`,
      width: `calc((100% - 4px) / ${n})`
    }
  }), opts.map(o => React.createElement("button", {
    key: o.value,
    type: "button",
    role: "radio",
    "aria-checked": o.value === value
  }, o.label))));
}
function TweakSelect({
  label,
  value,
  options,
  onChange
}) {
  return React.createElement(TweakRow, {
    label: label
  }, React.createElement("select", {
    className: "twk-field",
    value: value,
    onChange: e => onChange(e.target.value)
  }, options.map(o => {
    const v = typeof o === 'object' ? o.value : o;
    const l = typeof o === 'object' ? o.label : o;
    return React.createElement("option", {
      key: v,
      value: v
    }, l);
  })));
}
function TweakText({
  label,
  value,
  placeholder,
  onChange
}) {
  return React.createElement(TweakRow, {
    label: label
  }, React.createElement("input", {
    className: "twk-field",
    type: "text",
    value: value,
    placeholder: placeholder,
    onChange: e => onChange(e.target.value)
  }));
}
function TweakNumber({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange
}) {
  const clamp = n => {
    if (min != null && n < min) return min;
    if (max != null && n > max) return max;
    return n;
  };
  const startRef = React.useRef({
    x: 0,
    val: 0
  });
  const onScrubStart = e => {
    e.preventDefault();
    startRef.current = {
      x: e.clientX,
      val: value
    };
    const decimals = (String(step).split('.')[1] || '').length;
    const move = ev => {
      const dx = ev.clientX - startRef.current.x;
      const raw = startRef.current.val + dx * step;
      const snapped = Math.round(raw / step) * step;
      onChange(clamp(Number(snapped.toFixed(decimals))));
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return React.createElement("div", {
    className: "twk-num"
  }, React.createElement("span", {
    className: "twk-num-lbl",
    onPointerDown: onScrubStart
  }, label), React.createElement("input", {
    type: "number",
    value: value,
    min: min,
    max: max,
    step: step,
    onChange: e => onChange(clamp(Number(e.target.value)))
  }), unit && React.createElement("span", {
    className: "twk-num-unit"
  }, unit));
}
function __twkIsLight(hex) {
  const h = String(hex).replace('#', '');
  const x = h.length === 3 ? h.replace(/./g, c => c + c) : h.padEnd(6, '0');
  const n = parseInt(x.slice(0, 6), 16);
  if (Number.isNaN(n)) return true;
  const r = n >> 16 & 255,
    g = n >> 8 & 255,
    b = n & 255;
  return r * 299 + g * 587 + b * 114 > 148000;
}
const __TwkCheck = ({
  light
}) => React.createElement("svg", {
  viewBox: "0 0 14 14",
  "aria-hidden": "true"
}, React.createElement("path", {
  d: "M3 7.2 5.8 10 11 4.2",
  fill: "none",
  strokeWidth: "2.2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  stroke: light ? 'rgba(0,0,0,.78)' : '#fff'
}));
function TweakColor({
  label,
  value,
  options,
  onChange
}) {
  if (!options || !options.length) {
    return React.createElement("div", {
      className: "twk-row twk-row-h"
    }, React.createElement("div", {
      className: "twk-lbl"
    }, React.createElement("span", null, label)), React.createElement("input", {
      type: "color",
      className: "twk-swatch",
      value: value,
      onChange: e => onChange(e.target.value)
    }));
  }
  const key = o => String(JSON.stringify(o)).toLowerCase();
  const cur = key(value);
  return React.createElement(TweakRow, {
    label: label
  }, React.createElement("div", {
    className: "twk-chips",
    role: "radiogroup"
  }, options.map((o, i) => {
    const colors = Array.isArray(o) ? o : [o];
    const [hero, ...rest] = colors;
    const sup = rest.slice(0, 4);
    const on = key(o) === cur;
    return React.createElement("button", {
      key: i,
      type: "button",
      className: "twk-chip",
      role: "radio",
      "aria-checked": on,
      "data-on": on ? '1' : '0',
      "aria-label": colors.join(', '),
      title: colors.join(' · '),
      style: {
        background: hero
      },
      onClick: () => onChange(o)
    }, sup.length > 0 && React.createElement("span", null, sup.map((c, j) => React.createElement("i", {
      key: j,
      style: {
        background: c
      }
    }))), on && React.createElement(__TwkCheck, {
      light: __twkIsLight(hero)
    }));
  })));
}
function TweakButton({
  label,
  onClick,
  secondary = false
}) {
  return React.createElement("button", {
    type: "button",
    className: secondary ? 'twk-btn secondary' : 'twk-btn',
    onClick: onClick
  }, label);
}
Object.assign(window, {
  useTweaks,
  TweaksPanel,
  TweakSection,
  TweakRow,
  TweakSlider,
  TweakToggle,
  TweakRadio,
  TweakSelect,
  TweakText,
  TweakNumber,
  TweakColor,
  TweakButton
});
})();


/* /home/runner/work/llm-youtube-landscape-tracker/llm-youtube-landscape-tracker/site/ui.jsx */
(function(){
const {
  useState,
  useMemo,
  useEffect
} = React;
const fmt = {
  views(n) {
    if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
    if (n >= 1e3) return Math.round(n / 1e3) + "K";
    return String(n);
  },
  duration(m) {
    const h = Math.floor(m / 60),
      mm = m % 60;
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
  }
};
const stanceLabel = {
  hype: {
    glyph: "▲",
    label: "Hyped",
    color: "var(--accent)"
  },
  skeptical: {
    glyph: "▼",
    label: "Skeptical",
    color: "var(--ink)"
  },
  neutral: {
    glyph: "●",
    label: "Neutral",
    color: "var(--ink-mute)"
  },
  analytical: {
    glyph: "◆",
    label: "Analytical",
    color: "var(--good)"
  }
};
function Header({
  meta,
  counts
}) {
  return React.createElement("header", {
    style: {
      padding: "44px 48px 32px"
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 24,
      flexWrap: "wrap"
    }
  }, React.createElement("div", {
    style: {
      maxWidth: 760
    }
  }, React.createElement("div", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      marginBottom: 18,
      padding: "6px 12px",
      background: "var(--accent)",
      color: "white",
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: ".02em",
      whiteSpace: "nowrap"
    }
  }, "LLM TRACKER \xB7 SCHEDULED"), React.createElement("h1", {
    style: {
      margin: 0,
      fontSize: 56,
      lineHeight: 1.04,
      fontWeight: 800,
      letterSpacing: "-.03em",
      color: "var(--ink)"
    }
  }, "The LLM YouTube", React.createElement("br", null), "Landscape"), React.createElement("p", {
    style: {
      margin: "18px 0 0",
      color: "var(--ink-mute)",
      fontSize: 17,
      lineHeight: 1.45,
      fontWeight: 500,
      maxWidth: 640
    }
  }, "Transcript-backed monitoring of ", React.createElement("b", {
    style: {
      color: "var(--ink)"
    }
  }, counts.channels, " popular channels"), " covering large language models. Every row reflects what the creator actually said \u2014 not the title or thumbnail.")), React.createElement(RefreshBadge, {
    meta: meta,
    counts: counts
  })));
}
function RefreshBadge({
  meta,
  counts
}) {
  const updated = meta?.lastUpdated || "not run yet";
  const warning = meta?.warning;
  return React.createElement("div", {
    style: {
      background: "var(--bg-card)",
      border: "1px solid var(--rule-soft)",
      borderRadius: 16,
      padding: 16,
      minWidth: 240,
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    }
  }, React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      fontWeight: 700,
      fontSize: 13,
      color: "var(--ink)",
      whiteSpace: "nowrap"
    }
  }, React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: 999,
      background: warning ? "var(--warn)" : "var(--accent)"
    }
  }), "Last updated"), React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--ink-mute)",
      fontFamily: "var(--mono)",
      whiteSpace: "nowrap"
    }
  }, updated)), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 8
    }
  }, React.createElement(Stat, {
    n: counts.videos,
    l: "Videos"
  }), React.createElement(Stat, {
    n: counts.fresh,
    l: "New today",
    accent: true
  })), warning && React.createElement("div", {
    style: {
      fontSize: 12,
      lineHeight: 1.4,
      color: "var(--warn)",
      fontWeight: 700
    }
  }, warning));
}
function Stat({
  n,
  l,
  accent
}) {
  return React.createElement("div", {
    style: {
      background: accent ? "var(--accent)" : "var(--bg-sunk)",
      color: accent ? "white" : "var(--ink)",
      borderRadius: 12,
      padding: "10px 12px"
    }
  }, React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 800,
      lineHeight: 1,
      letterSpacing: "-.02em"
    }
  }, n), React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 600,
      opacity: accent ? 0.9 : 0.7,
      marginTop: 4,
      textTransform: "uppercase",
      letterSpacing: ".06em"
    }
  }, l));
}
function PillButton({
  children,
  onClick,
  secondary,
  small
}) {
  const base = {
    fontFamily: "var(--sans)",
    fontWeight: 600,
    fontSize: small ? 12 : 13,
    padding: small ? "6px 12px" : "9px 16px",
    borderRadius: 999,
    cursor: "pointer",
    border: "1px solid transparent",
    transition: "transform .08s, background .12s",
    flexShrink: 0,
    whiteSpace: "nowrap"
  };
  const styles = secondary ? {
    ...base,
    background: "var(--bg)",
    color: "var(--ink)",
    border: "1px solid var(--rule)"
  } : {
    ...base,
    background: "var(--ink)",
    color: "var(--bg)"
  };
  return React.createElement("button", {
    onClick: onClick,
    style: styles,
    onMouseDown: e => e.currentTarget.style.transform = "scale(.97)",
    onMouseUp: e => e.currentTarget.style.transform = "scale(1)",
    onMouseLeave: e => e.currentTarget.style.transform = "scale(1)"
  }, children);
}
function FilterBar({
  filters,
  setFilters,
  channels,
  topics,
  models,
  resultCount,
  totalCount
}) {
  const active = filters.q || filters.channel !== "all" || filters.topic !== "all" || filters.model !== "all" || filters.stance !== "all";
  return React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 10,
      alignItems: "center",
      padding: "16px 48px",
      borderBottom: "1px solid var(--rule-soft)",
      background: "var(--bg)"
    }
  }, React.createElement(SearchInput, {
    value: filters.q,
    onChange: q => setFilters({
      ...filters,
      q
    })
  }), React.createElement(PillSelect, {
    value: filters.channel,
    onChange: v => setFilters({
      ...filters,
      channel: v
    }),
    placeholder: "All channels",
    options: [["all", "All channels"], ...channels.map(c => [c.id, c.name])]
  }), React.createElement(PillSelect, {
    value: filters.topic,
    onChange: v => setFilters({
      ...filters,
      topic: v
    }),
    placeholder: "All topics",
    options: [["all", "All topics"], ...topics.map(t => [t, t])]
  }), React.createElement(PillSelect, {
    value: filters.model,
    onChange: v => setFilters({
      ...filters,
      model: v
    }),
    placeholder: "All models",
    options: [["all", "All models"], ...models.map(m => [m, m])]
  }), React.createElement(PillSelect, {
    value: filters.stance,
    onChange: v => setFilters({
      ...filters,
      stance: v
    }),
    placeholder: "Any stance",
    options: [["all", "Any stance"], ["hype", "Hyped"], ["skeptical", "Skeptical"], ["neutral", "Neutral"], ["analytical", "Analytical"]]
  }), React.createElement("div", {
    style: {
      flex: 1
    }
  }), React.createElement("span", {
    style: {
      fontSize: 13,
      color: "var(--ink-mute)",
      fontWeight: 600
    }
  }, resultCount === totalCount ? `${totalCount} videos` : `${resultCount} of ${totalCount}`), active && React.createElement(PillButton, {
    onClick: () => setFilters({
      q: "",
      channel: "all",
      topic: "all",
      model: "all",
      stance: "all"
    }),
    secondary: true,
    small: true
  }, "Clear all"));
}
function SearchInput({
  value,
  onChange
}) {
  return React.createElement("div", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "8px 14px",
      background: "var(--bg-card)",
      borderRadius: 999,
      border: "1px solid var(--rule-soft)",
      minWidth: 280,
      transition: "border-color .12s"
    },
    onFocus: e => e.currentTarget.style.borderColor = "var(--ink)",
    onBlur: e => e.currentTarget.style.borderColor = "var(--rule-soft)"
  }, React.createElement("span", {
    style: {
      color: "var(--ink-mute)",
      fontSize: 14
    }
  }, "\u2315"), React.createElement("input", {
    value: value,
    onChange: e => onChange(e.target.value),
    placeholder: "Search titles, quotes, models\u2026",
    style: {
      border: 0,
      outline: 0,
      background: "transparent",
      flex: 1,
      fontSize: 14,
      color: "var(--ink)",
      fontWeight: 500
    }
  }), value && React.createElement("button", {
    onClick: () => onChange(""),
    style: {
      color: "var(--ink-mute)",
      fontSize: 16
    }
  }, "\xD7"));
}
function PillSelect({
  value,
  onChange,
  options,
  placeholder
}) {
  const isAll = value === "all";
  return React.createElement("div", {
    style: {
      position: "relative",
      display: "inline-block"
    }
  }, React.createElement("select", {
    value: value,
    onChange: e => onChange(e.target.value),
    style: {
      appearance: "none",
      WebkitAppearance: "none",
      border: "1px solid var(--rule-soft)",
      background: isAll ? "var(--bg-card)" : "var(--ink)",
      color: isAll ? "var(--ink-mute)" : "var(--bg)",
      borderRadius: 999,
      padding: "8px 30px 8px 14px",
      fontSize: 13,
      fontWeight: 600,
      cursor: "pointer",
      fontFamily: "var(--sans)"
    }
  }, options.map(([v, l]) => React.createElement("option", {
    key: v,
    value: v
  }, l))), React.createElement("span", {
    style: {
      position: "absolute",
      right: 12,
      top: "50%",
      transform: "translateY(-50%)",
      pointerEvents: "none",
      fontSize: 10,
      color: isAll ? "var(--ink-mute)" : "var(--bg)"
    }
  }, "\u25BE"));
}
function VideosTable({
  videos,
  onSelect,
  selectedId
}) {
  return React.createElement("div", {
    style: {
      padding: "0 24px"
    }
  }, React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "180px minmax(260px,1fr) 180px 130px 100px",
      gap: 16,
      alignItems: "center",
      padding: "16px 20px 12px",
      margin: "12px 0 0"
    }
  }, ["Channel", "Video", "Topics", "Stance", "Posted"].map(h => React.createElement("div", {
    key: h,
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: "var(--ink-mute)",
      textTransform: "uppercase",
      letterSpacing: ".09em"
    }
  }, h))), React.createElement("div", {
    style: {
      background: "var(--bg-card)",
      borderRadius: 16,
      border: "1px solid var(--rule-soft)",
      overflowX: "auto",
      overflowY: "hidden"
    }
  }, videos.map((v, i) => React.createElement(Row, {
    key: v.id,
    v: v,
    onSelect: onSelect,
    selected: selectedId === v.id,
    last: i === videos.length - 1
  })), videos.length === 0 && React.createElement("div", {
    style: {
      padding: 80,
      textAlign: "center",
      color: "var(--ink-mute)"
    }
  }, React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 700,
      color: "var(--ink)"
    }
  }, "No matches"), React.createElement("div", {
    style: {
      fontSize: 14,
      marginTop: 8
    }
  }, "Try clearing the search or broadening a dropdown."))));
}
function Row({
  v,
  onSelect,
  selected,
  last
}) {
  const s = stanceLabel[v.stance];
  return React.createElement("button", {
    onClick: () => onSelect(v.id),
    style: {
      display: "grid",
      gridTemplateColumns: "180px minmax(260px,1fr) 180px 130px 100px",
      gap: 16,
      alignItems: "center",
      textAlign: "left",
      padding: "0 20px",
      height: "var(--row-h)",
      width: "100%",
      minWidth: 900,
      borderBottom: last ? "none" : "1px solid var(--rule-soft)",
      background: selected ? "var(--bg-sunk)" : "transparent",
      cursor: "pointer",
      position: "relative",
      transition: "background .12s"
    },
    onMouseEnter: e => {
      if (!selected) e.currentTarget.style.background = "var(--bg-sunk)";
    },
    onMouseLeave: e => {
      if (!selected) e.currentTarget.style.background = "transparent";
    }
  }, React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      overflow: "hidden"
    }
  }, React.createElement(ChannelMark, {
    id: v.channelId
  }), React.createElement("span", {
    style: {
      fontSize: 14.5,
      fontWeight: 600,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      color: "var(--ink)"
    }
  }, v.channel)), React.createElement("span", {
    style: {
      fontSize: 15,
      fontWeight: 500,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      paddingRight: 12,
      display: "flex",
      alignItems: "center",
      gap: 10,
      color: "var(--ink)"
    }
  }, v.new && React.createElement(NewBadge, null), v.title), React.createElement("span", {
    style: {
      fontSize: 13,
      color: "var(--ink-mute)",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      fontWeight: 500
    }
  }, v.topics.slice(0, 2).join(" · "), v.topics.length > 2 && React.createElement("span", {
    style: {
      color: "var(--ink-soft)"
    }
  }, " +", v.topics.length - 2)), React.createElement(StanceChip, {
    stance: v.stance
  }), React.createElement("span", {
    style: {
      fontSize: 13,
      color: "var(--ink-mute)",
      fontWeight: 500
    }
  }, fmt.ago(v.daysAgo)));
}
function NewBadge() {
  return React.createElement("span", {
    style: {
      fontSize: 10,
      fontWeight: 800,
      letterSpacing: ".06em",
      padding: "3px 7px",
      background: "var(--accent)",
      color: "white",
      borderRadius: 6,
      flexShrink: 0
    }
  }, "NEW");
}
function StanceChip({
  stance
}) {
  const s = stanceLabel[stance];
  const filled = stance === "hype" || stance === "analytical";
  return React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: "5px 11px 5px 9px",
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 700,
      background: filled ? stance === "hype" ? "var(--accent)" : "var(--ink)" : "var(--bg-sunk)",
      color: filled ? "white" : "var(--ink)",
      border: filled ? "none" : "1px solid var(--rule-soft)",
      width: "fit-content"
    }
  }, React.createElement("span", {
    style: {
      fontSize: 9
    }
  }, s.glyph), s.label);
}
function ChannelMark({
  id,
  size = 32
}) {
  return React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: size,
      height: size,
      borderRadius: 10,
      background: "var(--ink)",
      color: "var(--bg)",
      fontSize: 14,
      fontWeight: 800,
      letterSpacing: "-.02em",
      flexShrink: 0
    }
  }, id);
}
function VideoPanel({
  video,
  channel,
  onClose
}) {
  if (!video) return null;
  const t = video.transcript;
  const s = stanceLabel[video.stance];
  const ingestion = [`Video discovered via YouTube RSS${video.publishedAt ? ` · ${video.publishedAt}` : ""}`, `${video.transcriptStatus === "available" ? "Captions fetched" : "Caption fetch queued"} via ${video.transcriptProvider || "n/a"}`, `Summary status: ${video.status || "pending"}${video.summaryProvider ? ` · ${video.summaryProvider}` : ""}`, "Topics, stance, and channel matrix generated from backend JSON"];
  return React.createElement("aside", {
    style: {
      position: "fixed",
      top: 0,
      right: 0,
      bottom: 0,
      width: "min(580px, 48vw)",
      background: "var(--bg)",
      borderLeft: "1px solid var(--rule)",
      boxShadow: "-32px 0 80px -40px rgba(39, 48, 67, 0.25)",
      overflowY: "auto",
      zIndex: 30,
      animation: "slideIn .25s cubic-bezier(.2,.8,.2,1)"
    }
  }, React.createElement("style", null, `@keyframes slideIn { from { transform: translateX(20px); opacity: 0; } to { transform: none; opacity: 1; } }`), React.createElement("div", {
    style: {
      position: "sticky",
      top: 0,
      zIndex: 2,
      background: "var(--bg)",
      padding: "20px 32px 12px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottom: "1px solid var(--rule-soft)"
    }
  }, React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: "var(--ink-mute)",
      textTransform: "uppercase",
      letterSpacing: ".08em"
    }
  }, "Video detail \xB7 ", video.id), React.createElement(PillButton, {
    onClick: onClose,
    secondary: true,
    small: true
  }, "Close \u2715")), React.createElement("div", {
    style: {
      padding: "24px 32px 0"
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      fontSize: 14,
      marginBottom: 18
    }
  }, React.createElement(ChannelMark, {
    id: video.channelId,
    size: 36
  }), React.createElement("div", null, React.createElement("div", {
    style: {
      fontWeight: 700,
      color: "var(--ink)"
    }
  }, video.channel), React.createElement("div", {
    style: {
      color: "var(--ink-mute)",
      fontSize: 13
    }
  }, channel?.desc || video.relationship || "LLM coverage"))), React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 30,
      fontWeight: 800,
      lineHeight: 1.18,
      letterSpacing: "-.02em",
      color: "var(--ink)"
    }
  }, video.title), React.createElement("div", {
    style: {
      marginTop: 18,
      display: "flex",
      gap: 8,
      flexWrap: "wrap"
    }
  }, React.createElement(Meta, null, video.date), React.createElement(Meta, null, fmt.duration(video.duration)), React.createElement(Meta, null, fmt.views(video.views), " views"), React.createElement(StanceChip, {
    stance: video.stance
  }), video.sourceUrl && React.createElement("a", {
    href: video.sourceUrl,
    target: "_blank",
    rel: "noreferrer",
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: "white",
      textDecoration: "none",
      padding: "5px 10px",
      background: "var(--accent)",
      borderRadius: 999
    }
  }, "Open on YouTube"))), React.createElement("div", {
    style: {
      margin: "28px 32px 0",
      borderRadius: 12,
      overflow: "hidden",
      background: "var(--bg-sunk)"
    }
  }, React.createElement(ThumbnailPlaceholder, {
    topic: video.topics[0]
  })), React.createElement(Section, {
    title: "Topics"
  }, React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 8
    }
  }, video.topics.map(t => React.createElement(Tag, {
    key: t
  }, t)))), React.createElement(Section, {
    title: "Models mentioned"
  }, React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 8
    }
  }, video.models.map(m => React.createElement(Tag, {
    key: m,
    accent: true
  }, m)))), React.createElement("div", {
    style: {
      padding: "28px 32px 0"
    }
  }, React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: "var(--accent)",
      textTransform: "uppercase",
      letterSpacing: ".09em",
      marginBottom: 12
    }
  }, "Key quote \xB7 auto-extracted"), React.createElement("blockquote", {
    style: {
      margin: 0,
      padding: "20px 24px",
      background: "var(--ink)",
      color: "var(--bg)",
      borderRadius: 16,
      fontSize: 19,
      lineHeight: 1.36,
      fontWeight: 500,
      letterSpacing: "-.01em"
    }
  }, "\u201C", t.quote, "\u201D")), React.createElement(Section, {
    title: "What the transcript actually says"
  }, React.createElement("ul", {
    style: {
      margin: 0,
      padding: 0,
      listStyle: "none"
    }
  }, t.bullets.map((b, i) => React.createElement("li", {
    key: i,
    style: {
      marginBottom: 12,
      fontSize: 14.5,
      lineHeight: 1.5,
      color: "var(--ink)",
      position: "relative",
      paddingLeft: 22,
      fontWeight: 500
    }
  }, React.createElement("span", {
    style: {
      position: "absolute",
      left: 0,
      top: 6,
      width: 12,
      height: 2,
      background: "var(--accent)"
    }
  }), b)))), React.createElement(Section, {
    title: "Transcript excerpt"
  }, React.createElement("p", {
    style: {
      margin: 0,
      padding: "14px 16px",
      background: "var(--bg-card)",
      border: "1px solid var(--rule-soft)",
      borderRadius: 12,
      fontSize: 14,
      color: "var(--ink-mute)",
      lineHeight: 1.55,
      fontWeight: 500
    }
  }, t.excerpt)), React.createElement(Section, {
    title: "Ingestion record",
    last: true
  }, React.createElement("div", {
    style: {
      fontSize: 13.5,
      color: "var(--ink-mute)",
      lineHeight: 2,
      fontWeight: 500
    }
  }, ingestion.map((l, i) => React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, React.createElement("span", {
    style: {
      color: "var(--good)",
      fontWeight: 800
    }
  }, "\u2713"), l)))));
}
function Meta({
  children
}) {
  return React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      color: "var(--ink-mute)",
      padding: "5px 10px",
      background: "var(--bg-card)",
      borderRadius: 999,
      border: "1px solid var(--rule-soft)"
    }
  }, children);
}
function Tag({
  children,
  accent
}) {
  return React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      padding: "6px 12px",
      borderRadius: 999,
      background: accent ? "var(--accent)" : "var(--bg-card)",
      color: accent ? "white" : "var(--ink)",
      border: accent ? "none" : "1px solid var(--rule-soft)"
    }
  }, children);
}
function Section({
  title,
  children,
  last
}) {
  return React.createElement("div", {
    style: {
      padding: last ? "28px 32px 40px" : "28px 32px 0"
    }
  }, React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: "var(--ink-mute)",
      textTransform: "uppercase",
      letterSpacing: ".09em",
      marginBottom: 14
    }
  }, title), children);
}
function ThumbnailPlaceholder({
  topic
}) {
  return React.createElement("div", {
    style: {
      aspectRatio: "16 / 9",
      position: "relative",
      background: "var(--ink)",
      color: "var(--bg)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden"
    }
  }, React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      backgroundImage: "repeating-linear-gradient(135deg, transparent 0 22px, rgba(255,255,255,.06) 22px 44px)"
    }
  }), React.createElement("div", {
    style: {
      position: "relative",
      textAlign: "center"
    }
  }, React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: ".18em",
      opacity: .55,
      marginBottom: 8
    }
  }, "THUMBNAIL"), React.createElement("div", {
    style: {
      fontSize: 26,
      fontWeight: 800,
      letterSpacing: "-.02em"
    }
  }, topic)));
}
function Heatmap({
  channels,
  topics,
  matrix,
  onCellClick
}) {
  const max = Math.max(...channels.flatMap(c => topics.map(t => matrix[c.id][t])));
  return React.createElement("div", {
    style: {
      padding: "36px 48px 48px"
    }
  }, React.createElement("div", {
    style: {
      marginBottom: 28,
      maxWidth: 720
    }
  }, React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 36,
      fontWeight: 800,
      lineHeight: 1.1,
      letterSpacing: "-.025em",
      color: "var(--ink)"
    }
  }, "How channels cover topics"), React.createElement("p", {
    style: {
      margin: "10px 0 0",
      color: "var(--ink-mute)",
      fontSize: 15.5,
      lineHeight: 1.5,
      fontWeight: 500
    }
  }, "Each cell counts the videos a channel has published touching a topic. Click any cell to see those videos.")), React.createElement("div", {
    style: {
      overflowX: "auto",
      background: "var(--bg-card)",
      borderRadius: 16,
      padding: 20,
      border: "1px solid var(--rule-soft)"
    }
  }, React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: `220px repeat(${topics.length}, minmax(38px, 1fr))`,
      gap: 4,
      minWidth: 900
    }
  }, React.createElement("div", null), topics.map(t => React.createElement("div", {
    key: t,
    style: {
      fontSize: 11,
      fontWeight: 600,
      color: "var(--ink-mute)",
      writingMode: "vertical-rl",
      transform: "rotate(180deg)",
      padding: "4px 0",
      height: 120,
      display: "flex",
      alignItems: "flex-end"
    }
  }, t)), channels.map(c => React.createElement(React.Fragment, {
    key: c.id
  }, React.createElement("div", {
    style: {
      padding: "10px 14px 10px 0",
      display: "flex",
      alignItems: "center",
      gap: 12
    }
  }, React.createElement(ChannelMark, {
    id: c.id,
    size: 28
  }), React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: "var(--ink)"
    }
  }, c.name)), topics.map(t => {
    const v = matrix[c.id][t];
    const a = max ? v / max : 0;
    const filled = v > 0;
    return React.createElement("button", {
      key: t,
      onClick: () => onCellClick(c.id, t),
      title: `${c.name} × ${t}: ${v} videos`,
      style: {
        background: filled ? `color-mix(in srgb, var(--accent) ${10 + a * 75}%, transparent)` : "var(--bg-sunk)",
        height: 36,
        borderRadius: 6,
        color: a > 0.55 ? "white" : "var(--ink)",
        fontWeight: 700,
        fontSize: 12.5,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: filled ? "pointer" : "default",
        transition: "transform .08s"
      },
      onMouseEnter: e => filled && (e.currentTarget.style.transform = "scale(1.08)"),
      onMouseLeave: e => e.currentTarget.style.transform = "none"
    }, v > 0 ? v : "");
  }))))), React.createElement("div", {
    style: {
      marginTop: 20,
      display: "flex",
      alignItems: "center",
      gap: 12,
      fontSize: 12.5,
      color: "var(--ink-mute)",
      fontWeight: 600
    }
  }, React.createElement("span", null, "Fewer"), React.createElement("div", {
    style: {
      display: "flex",
      gap: 3
    }
  }, [0, 1, 2, 3, 4, 5].map(i => React.createElement("div", {
    key: i,
    style: {
      width: 28,
      height: 14,
      borderRadius: 3,
      background: i === 0 ? "var(--bg-sunk)" : `color-mix(in srgb, var(--accent) ${10 + i / 5 * 75}%, transparent)`
    }
  }))), React.createElement("span", null, "More videos")));
}
function IngestionLog({
  entries
}) {
  return React.createElement("div", {
    style: {
      padding: "36px 48px 48px"
    }
  }, React.createElement("div", {
    style: {
      marginBottom: 24,
      maxWidth: 720
    }
  }, React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 36,
      fontWeight: 800,
      lineHeight: 1.1,
      letterSpacing: "-.025em",
      color: "var(--ink)"
    }
  }, "Pipeline activity"), React.createElement("p", {
    style: {
      margin: "10px 0 0",
      color: "var(--ink-mute)",
      fontSize: 15.5,
      lineHeight: 1.5,
      fontWeight: 500
    }
  }, "Most recent ingestion events from the running pipeline.")), React.createElement("div", {
    style: {
      background: "var(--bg-card)",
      borderRadius: 16,
      border: "1px solid var(--rule-soft)",
      overflow: "hidden"
    }
  }, entries.map((e, i) => React.createElement("div", {
    key: i,
    style: {
      display: "grid",
      gridTemplateColumns: "110px 130px 1fr",
      gap: 20,
      padding: "14px 22px",
      fontSize: 14,
      fontWeight: 500,
      borderBottom: i === entries.length - 1 ? "none" : "1px solid var(--rule-soft)",
      color: "var(--ink-mute)",
      alignItems: "center"
    }
  }, React.createElement("span", {
    style: {
      fontFamily: "var(--mono)",
      fontSize: 12.5,
      color: "var(--ink-soft)"
    }
  }, fmt.clock(e.t)), React.createElement("span", null, React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      padding: "3px 10px",
      borderRadius: 999,
      background: e.verb === "error" ? "var(--accent)" : "var(--bg-sunk)",
      color: e.verb === "error" ? "white" : "var(--ink)"
    }
  }, e.verb)), React.createElement("span", null, e.msg, " ", React.createElement("span", {
    style: {
      color: "var(--ink-soft)"
    }
  }, "\xB7 ", e.title))))));
}
function ViewTabs({
  view,
  setView
}) {
  const tabs = [["table", "Videos"], ["heatmap", "Topic coverage"], ["log", "Pipeline"]];
  return React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      padding: "8px 48px 16px",
      borderBottom: "1px solid var(--rule-soft)"
    }
  }, tabs.map(([k, l]) => {
    const on = view === k;
    return React.createElement("button", {
      key: k,
      onClick: () => setView(k),
      style: {
        padding: "9px 16px",
        fontSize: 14,
        fontWeight: 600,
        color: on ? "var(--bg)" : "var(--ink)",
        background: on ? "var(--ink)" : "transparent",
        borderRadius: 999,
        border: on ? "none" : "1px solid var(--rule-soft)",
        cursor: "pointer",
        transition: "background .12s"
      }
    }, l);
  }));
}
Object.assign(window, {
  Header,
  FilterBar,
  VideosTable,
  VideoPanel,
  Heatmap,
  IngestionLog,
  ViewTabs,
  fmt
});
})();


/* /home/runner/work/llm-youtube-landscape-tracker/llm-youtube-landscape-tracker/site/app.jsx */
(function(){
const {
  useState,
  useMemo,
  useEffect
} = React;
const DEFAULTS = {
  "density": "comfortable",
  "theme": "light",
  "relView": "heatmap",
  "showLog": true,
  "accent": "#c2603f"
};
function App() {
  const [t, setTweak] = useTweaks(DEFAULTS);
  const {
    CHANNELS,
    TOPICS,
    MODELS,
    VIDEOS,
    MATRIX,
    INGEST_LOG,
    META
  } = window.__DATA__;
  const [filters, setFilters] = useState({
    q: "",
    channel: "all",
    topic: "all",
    model: "all",
    stance: "all"
  });
  const [selectedId, setSelectedId] = useState(null);
  const [view, setView] = useState("table");
  useEffect(() => {
    document.body.dataset.theme = t.theme;
    document.body.dataset.density = t.density;
    document.documentElement.style.setProperty("--accent", oklchFromHex(t.accent));
  }, [t.theme, t.density, t.accent]);
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
    events: INGEST_LOG.length
  };
  const selected = VIDEOS.find(v => v.id === selectedId);
  const selectedChannel = selected ? CHANNELS.find(c => c.id === selected.channelId) : null;
  return React.createElement(React.Fragment, null, React.createElement(Header, {
    meta: META,
    counts: counts
  }), React.createElement(ViewTabs, {
    view: view,
    setView: setView,
    counts: counts
  }), view === "table" && React.createElement(React.Fragment, null, React.createElement(FilterBar, {
    filters: filters,
    setFilters: setFilters,
    channels: CHANNELS,
    topics: TOPICS,
    models: MODELS,
    resultCount: filtered.length,
    totalCount: VIDEOS.length
  }), React.createElement(VideosTable, {
    videos: filtered,
    onSelect: id => setSelectedId(id === selectedId ? null : id),
    selectedId: selectedId
  })), view === "heatmap" && React.createElement(Heatmap, {
    channels: CHANNELS,
    topics: TOPICS,
    matrix: MATRIX,
    onCellClick: (channel, topic) => {
      setView("table");
      setFilters({
        ...filters,
        channel,
        topic
      });
    }
  }), view === "log" && React.createElement(IngestionLog, {
    entries: INGEST_LOG
  }), React.createElement("footer", {
    style: {
      padding: "20px 32px 36px",
      borderTop: "1px solid var(--rule)",
      color: "var(--ink-soft)",
      fontSize: 12,
      display: "flex",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 12
    }
  }, React.createElement("span", {
    className: "mono"
  }, "Pipeline: YouTube RSS \u2192 captions/transcript fallback \u2192 GitHub Models/local summary \u2192 static data.js \u2192 GitHub Pages."), React.createElement("span", {
    className: "mono"
  }, "\xA9 ", new Date().getFullYear(), " \xB7 Tracker uses public YouTube metadata and transcript-backed summaries.")), React.createElement(VideoPanel, {
    video: selected,
    channel: selectedChannel,
    onClose: () => setSelectedId(null)
  }), React.createElement(TweaksPanel, {
    title: "Tweaks"
  }, React.createElement(TweakSection, {
    label: "Display"
  }, React.createElement(TweakRadio, {
    label: "Density",
    value: t.density,
    onChange: v => setTweak("density", v),
    options: [{
      value: "comfortable",
      label: "Comfy"
    }, {
      value: "compact",
      label: "Compact"
    }, {
      value: "dense",
      label: "Dense"
    }]
  }), React.createElement(TweakRadio, {
    label: "Theme",
    value: t.theme,
    onChange: v => setTweak("theme", v),
    options: [{
      value: "light",
      label: "Light"
    }, {
      value: "sepia",
      label: "Sepia"
    }, {
      value: "dark",
      label: "Dark"
    }]
  })), React.createElement(TweakSection, {
    label: "Accent"
  }, React.createElement(ColorSwatches, {
    value: t.accent,
    onChange: v => setTweak("accent", v),
    options: ["#c2603f", "#3f6cc2", "#3f9270", "#7a3fc2", "#2b2b2b"]
  }))));
}
function ColorSwatches({
  value,
  onChange,
  options
}) {
  return React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      padding: "4px 0"
    }
  }, options.map(c => React.createElement("button", {
    key: c,
    onClick: () => onChange(c),
    title: c,
    style: {
      width: 28,
      height: 28,
      borderRadius: 999,
      background: c,
      cursor: "pointer",
      border: value === c ? "2px solid var(--ink)" : "2px solid var(--rule)",
      outline: value === c ? "2px solid var(--bg)" : "none",
      outlineOffset: -4
    }
  })));
}
function oklchFromHex(hex) {
  return hex;
}
ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(App, null));
})();
