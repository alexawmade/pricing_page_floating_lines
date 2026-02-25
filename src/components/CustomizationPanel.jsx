import { useState } from 'react';
import './CustomizationPanel.css';

function Slider({ label, value, min, max, step = 0.01, onChange }) {
  return (
    <label className="cp-control">
      <div className="cp-control__row">
        <span className="cp-control__label">{label}</span>
        <span className="cp-control__value">{Number(value).toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="cp-slider"
      />
    </label>
  );
}

function Toggle({ label, value, onChange }) {
  return (
    <label className="cp-toggle-row">
      <span className="cp-control__label">{label}</span>
      <button
        className={`cp-toggle ${value ? 'cp-toggle--on' : ''}`}
        onClick={() => onChange(!value)}
        type="button"
      >
        <span className="cp-toggle__thumb" />
      </button>
    </label>
  );
}

export default function CustomizationPanel({ open, onClose, effectProps, setProp, lightEffectProps, setLightProp }) {
  const [editingTheme, setEditingTheme] = useState('dark');

  if (!open) return null;

  const p = editingTheme === 'dark' ? effectProps : lightEffectProps;
  const set = editingTheme === 'dark' ? setProp : setLightProp;

  const toggleWave = (wave) => {
    const current = p.enabledWaves;
    const next = current.includes(wave)
      ? current.filter(w => w !== wave)
      : [...current, wave];
    set('enabledWaves', next);
  };

  const setGradientStop = (index, color) => {
    const stops = [...(p.linesGradient || ['#2f4ba2', '#e947f5', '#ffffff'])];
    stops[index] = color;
    set('linesGradient', stops);
  };

  const gradientStops = p.linesGradient || ['#2f4ba2', '#e947f5', '#ffffff'];

  return (
    <>
      {/* Backdrop */}
      <div className="cp-backdrop" onClick={onClose} />

      <aside className="cp-panel">
        <div className="cp-panel__header">
          <span className="cp-panel__title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            Effect Settings
          </span>
          <button className="cp-panel__close" onClick={onClose} aria-label="Close panel">✕</button>
        </div>

        {/* ── Theme picker ── */}
        <div className="cp-theme-picker">
          <button
            className={`cp-theme-btn${editingTheme === 'dark' ? ' cp-theme-btn--active' : ''}`}
            onClick={() => setEditingTheme('dark')}
            type="button"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
            Dark
          </button>
          <button
            className={`cp-theme-btn${editingTheme === 'light' ? ' cp-theme-btn--active' : ''}`}
            onClick={() => setEditingTheme('light')}
            type="button"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
            Light
          </button>
        </div>

        <div className="cp-panel__body">

          {/* ── ANIMATION ── */}
          <section className="cp-section">
            <h3 className="cp-section__title">Animation</h3>
            <Slider
              label="Speed"
              value={p.animationSpeed}
              min={0.1} max={5} step={0.05}
              onChange={v => set('animationSpeed', v)}
            />
            <Toggle
              label="Mouse Interactive"
              value={p.interactive}
              onChange={v => set('interactive', v)}
            />
            <Toggle
              label="Parallax"
              value={p.parallax}
              onChange={v => set('parallax', v)}
            />
            <Slider
              label="Parallax Strength"
              value={p.parallaxStrength}
              min={0} max={1} step={0.01}
              onChange={v => set('parallaxStrength', v)}
            />
          </section>

          {/* ── LINES ── */}
          <section className="cp-section">
            <h3 className="cp-section__title">Lines</h3>
            <Slider
              label="Line Count"
              value={p.lineCount[0]}
              min={1} max={20} step={1}
              onChange={v => { const n = Math.round(v); set('lineCount', [n, n, n]); }}
            />
            <Slider
              label="Line Distance"
              value={p.lineDistance[0]}
              min={1} max={20} step={0.5}
              onChange={v => set('lineDistance', [v, v, v])}
            />
          </section>

          {/* ── BEND ── */}
          <section className="cp-section">
            <h3 className="cp-section__title">Mouse Bend</h3>
            <Slider
              label="Bend Strength"
              value={p.bendStrength}
              min={-3} max={3} step={0.05}
              onChange={v => set('bendStrength', v)}
            />
            <Slider
              label="Bend Radius"
              value={p.bendRadius}
              min={0.5} max={20} step={0.5}
              onChange={v => set('bendRadius', v)}
            />
            <Slider
              label="Mouse Damping"
              value={p.mouseDamping}
              min={0.01} max={0.5} step={0.01}
              onChange={v => set('mouseDamping', v)}
            />
          </section>

          {/* ── WAVES ── */}
          <section className="cp-section">
            <h3 className="cp-section__title">Wave Layers</h3>
            <Toggle
              label="Top Wave"
              value={p.enabledWaves.includes('top')}
              onChange={() => toggleWave('top')}
            />
            <Toggle
              label="Middle Wave"
              value={p.enabledWaves.includes('middle')}
              onChange={() => toggleWave('middle')}
            />
            <Toggle
              label="Bottom Wave"
              value={p.enabledWaves.includes('bottom')}
              onChange={() => toggleWave('bottom')}
            />
          </section>

          {/* ── COLORS ── */}
          <section className="cp-section">
            <h3 className="cp-section__title">Colors</h3>
            <div className="cp-gradient-stops">
              <label className="cp-color-stop">
                <input
                  type="color"
                  value={p.backgroundColor || '#000000'}
                  onChange={e => set('backgroundColor', e.target.value)}
                  className="cp-color-input"
                />
                <span className="cp-color-stop__label">BG</span>
              </label>
              {gradientStops.map((color, i) => (
                <label key={i} className="cp-color-stop">
                  <input
                    type="color"
                    value={color}
                    onChange={e => setGradientStop(i, e.target.value)}
                    className="cp-color-input"
                  />
                  <span className="cp-color-stop__label">Stop {i + 1}</span>
                </label>
              ))}
            </div>
          </section>

        </div>

        <div className="cp-panel__footer">
          <span className="cp-panel__footer-label">FloatingLines · effect controls</span>
        </div>
      </aside>
    </>
  );
}
