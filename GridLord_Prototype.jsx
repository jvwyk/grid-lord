import { useState, useEffect, useCallback, useRef } from "react";

// ══════════════════════════════════════════════════════════════════════
// DATA
// ══════════════════════════════════════════════════════════════════════
const REGIONS_INIT = [
  { id: "r1", name: "Northgate", demand: 120, price: 42, priority: "hospital", stability: 72, icon: "🏥", popK: 340, trait: "High sensitivity — blackouts trigger major risk spikes" },
  { id: "r2", name: "Iron Basin", demand: 95, price: 38, priority: "industrial", stability: 85, icon: "🏭", popK: 180, trait: "Price volatile — responds sharply to supply changes" },
  { id: "r3", name: "Lakeshore", demand: 60, price: 51, priority: "residential", stability: 58, icon: "🏘️", popK: 520, trait: "Large population — unrest spreads fast" },
  { id: "r4", name: "Crest Hill", demand: 45, price: 44, priority: "commercial", stability: 90, icon: "🏢", popK: 210, trait: "Low maintenance — stable income source" },
];

const POWERUPS = [
  { id: "pu1", name: "Surge Capacity", desc: "+50 MW generation for 3 turns", icon: "⚡", cost: 2000, duration: 3, effect: "surge", color: "#00E5A0" },
  { id: "pu2", name: "Grid Shield", desc: "Risk gains halved for 2 turns", icon: "🛡️", cost: 1800, duration: 2, effect: "shield", color: "#00C9FF" },
  { id: "pu3", name: "Market Intel", desc: "See next turn's demand shifts", icon: "📡", cost: 1200, duration: 1, effect: "intel", color: "#FFD60A" },
  { id: "pu4", name: "Lobbying", desc: "Instantly reduce risk by 15%", icon: "🤝", cost: 2500, duration: 0, effect: "lobby", color: "#8E8AFF" },
  { id: "pu5", name: "Price Lock", desc: "Freeze all region prices for 2 turns", icon: "🔒", cost: 1500, duration: 2, effect: "pricelock", color: "#FF6B35" },
  { id: "pu6", name: "Emergency Reserve", desc: "Fill storage to max instantly", icon: "🔋", cost: 800, duration: 0, effect: "reserve", color: "#B0ADFF" },
];

const EVENTS_POOL = [
  { id: "e1", title: "HEATWAVE", desc: "Record temperatures across Lakeshore. AC demand overwhelms the grid. Brownouts reported in residential blocks.", icon: "🔥", severity: "critical", effect: "+40% demand in Lakeshore", mechanical: { region: "r3", demandMult: 1.4 } },
  { id: "e2", title: "GENERATOR FAILURE", desc: "Turbine 3 at the Northgate plant trips offline. Maintenance crew estimates 2 days for repairs.", icon: "⚠️", severity: "warning", effect: "-30% supply for 2 turns", mechanical: { supplyMult: 0.7, duration: 2 } },
  { id: "e3", title: "GOVERNMENT AUDIT", desc: "Federal energy regulators announce a surprise compliance review. Inspectors en route.", icon: "🏛️", severity: "danger", effect: "Risk sensitivity ×2 for 3 turns", mechanical: { riskMult: 2, duration: 3 } },
  { id: "e4", title: "CRYPTO BOOM", desc: "Bitcoin surges past $200k. Mining operations across Iron Basin doubling their power draw.", icon: "₿", severity: "warning", effect: "+60% demand in Iron Basin", mechanical: { region: "r2", demandMult: 1.6 } },
  { id: "e5", title: "GRID SABOTAGE", desc: "Suspected cyber intrusion detected on grid SCADA systems. Storage systems compromised.", icon: "💀", severity: "critical", effect: "Storage drained to 0", mechanical: { drainStorage: true } },
  { id: "e6", title: "FEDERAL SUBSIDY", desc: "Emergency energy subsidy approved. Government covers 25% of your supply costs this turn.", icon: "💰", severity: "good", effect: "-25% supply costs", mechanical: { costMult: 0.75 } },
  { id: "e7", title: "COLD SNAP", desc: "Unexpected freeze hits all regions. Heating demand spikes across the board.", icon: "❄️", severity: "warning", effect: "+20% demand everywhere", mechanical: { allDemandMult: 1.2 } },
  { id: "e8", title: "SOLAR SURPLUS", desc: "Perfect weather conditions. Solar farms producing at 120% capacity for one day.", icon: "☀️", severity: "good", effect: "+40 MW bonus generation", mechanical: { bonusSupply: 40 } },
  { id: "e9", title: "WHISTLEBLOWER", desc: "A former employee leaks internal documents. Media attention intensifies.", icon: "📰", severity: "danger", effect: "+10% risk immediately", mechanical: { riskAdd: 10 } },
  { id: "e10", title: "HOSPITAL EMERGENCY", desc: "Major incident at Northgate General. ICU at capacity. Power failure would be catastrophic.", icon: "🚨", severity: "critical", effect: "Northgate blackout = +25% risk", mechanical: { region: "r1", blackoutRisk: 25 } },
];

// ── Helpers ──
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const fmt = n => n.toLocaleString("en-US");
const riskColor = v => v < 30 ? "#00E5A0" : v < 55 ? "#FFD60A" : v < 75 ? "#FF6B35" : "#FF3B30";
const riskLabel = v => v < 30 ? "LOW" : v < 55 ? "MEDIUM" : v < 75 ? "HIGH" : "CRITICAL";
const prioColor = { hospital: "#FF3B30", residential: "#00E5A0", industrial: "#FFD60A", commercial: "#8E8AFF" };
const allocColor = pct => pct === 0 ? "#333" : pct < 0.5 ? "#FF3B30" : pct < 0.85 ? "#FFD60A" : pct <= 1.05 ? "#00E5A0" : "#8E8AFF";
const allocLabel = pct => pct === 0 ? "Unpowered" : pct < 0.5 ? "Critical" : pct < 0.85 ? "Low" : pct <= 1.05 ? "Balanced" : "Excess";
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const sevColor = s => s === "critical" ? "#FF3B30" : s === "danger" ? "#FF6B35" : s === "warning" ? "#FFD60A" : "#00E5A0";

// ── Fresh state ──
const freshState = () => ({
  day: 1, money: 12400, risk: 34, stored: 40,
  regions: REGIONS_INIT.map(r => ({ ...r, allocated: 0 })),
  selectedDeal: null, expandedRegion: null, sheet: null,
  turnData: null, currentEvent: null, menuOpen: false,
  activePowerups: [], streak: 0, totalProfit: 0,
  toasts: [], notifications: [],
});

// ══════════════════════════════════════════════════════════════════════
// APP
// ══════════════════════════════════════════════════════════════════════
export default function GridLord() {
  const [screen, setScreen] = useState("title");
  const [g, setG] = useState(freshState);
  const baseGen = 280;
  const storageMax = 80;
  const surgeBonus = g.activePowerups.some(p => p.effect === "surge") ? 50 : 0;
  const generation = baseGen + surgeBonus;
  const shieldActive = g.activePowerups.some(p => p.effect === "shield");
  const priceLock = g.activePowerups.some(p => p.effect === "pricelock");

  const totalAllocated = g.regions.reduce((s, r) => s + r.allocated, 0);
  const remaining = generation + g.stored - totalAllocated;
  const bmDeal = g.selectedDeal ? BM_DEALS.find(d => d.id === g.selectedDeal) : null;

  const set = (patch) => setG(prev => ({ ...prev, ...(typeof patch === "function" ? patch(prev) : patch) }));

  const addToast = (msg, color = "#FFF") => {
    const id = Date.now();
    set(p => ({ toasts: [...p.toasts, { id, msg, color }] }));
    setTimeout(() => set(p => ({ toasts: p.toasts.filter(t => t.id !== id) })), 2800);
  };

  const updateAlloc = (id, val) => {
    setG(prev => {
      const otherAlloc = prev.regions.filter(r => r.id !== id).reduce((s, r) => s + r.allocated, 0);
      const maxForThis = generation + prev.stored - otherAlloc;
      return { ...prev, regions: prev.regions.map(r => r.id === id ? { ...r, allocated: clamp(val, 0, Math.min(r.demand + 30, maxForThis)) } : r) };
    });
  };

  const storeEnergy = (amount) => {
    setG(prev => {
      const avail = generation + prev.stored - prev.regions.reduce((s, r) => s + r.allocated, 0);
      const actual = clamp(amount, -prev.stored, Math.min(storageMax - prev.stored, avail));
      return { ...prev, stored: prev.stored + actual };
    });
  };

  const buyPowerup = (pu) => {
    if (g.money < pu.cost) { addToast("Not enough funds", "#FF3B30"); return; }
    setG(prev => {
      let next = { ...prev, money: prev.money - pu.cost };
      if (pu.effect === "lobby") {
        next.risk = clamp(prev.risk - 15, 0, 100);
        addToast("Risk reduced by 15%", "#8E8AFF");
      } else if (pu.effect === "reserve") {
        next.stored = storageMax;
        addToast("Storage filled to max", "#B0ADFF");
      } else {
        next.activePowerups = [...prev.activePowerups, { ...pu, turnsLeft: pu.duration }];
        addToast(`${pu.name} activated!`, pu.color);
      }
      return next;
    });
  };

  const endTurn = () => {
    setG(prev => {
      const revenue = prev.regions.reduce((s, r) => s + Math.min(r.allocated, r.demand) * r.price, 0);
      const deal = prev.selectedDeal ? BM_DEALS.find(d => d.id === prev.selectedDeal) : null;
      const bmIncome = deal ? deal.mw * deal.price : 0;
      const costMult = prev.activePowerups.some(p => p.effect === "costMult") ? 0.75 : 1;
      const costs = Math.round(prev.regions.reduce((s, r) => s + r.allocated, 0) * 12 * costMult);
      const net = revenue + bmIncome - costs;
      const blackouts = prev.regions.filter(r => r.allocated < r.demand * 0.5);
      let riskDelta = (deal ? deal.risk : 0)
        + blackouts.reduce((s, r) => s + (r.priority === "hospital" ? 15 : r.priority === "residential" ? 8 : 4), 0)
        - 3;
      if (shieldActive) riskDelta = Math.round(riskDelta * 0.5);
      const allSupplied = prev.regions.every(r => r.allocated >= r.demand * 0.85);
      const newStreak = allSupplied ? prev.streak + 1 : 0;
      const streakBonus = newStreak >= 3 ? Math.floor(newStreak * 200) : 0;
      const regionOutcomes = prev.regions.map(r => {
        const pct = r.demand > 0 ? r.allocated / r.demand : 0;
        return { ...r, pct, outcome: pct >= 0.85 ? "Supplied" : pct >= 0.5 ? "Partial" : "BLACKOUT" };
      });
      const updatedPowerups = prev.activePowerups
        .map(p => ({ ...p, turnsLeft: p.turnsLeft - 1 }))
        .filter(p => p.turnsLeft > 0);

      return {
        ...prev,
        turnData: { revenue, bmIncome, costs, net: net + streakBonus, riskDelta, regionOutcomes, streakBonus, newStreak },
        money: prev.money + net + streakBonus,
        risk: clamp(prev.risk + riskDelta, 0, 100),
        totalProfit: prev.totalProfit + net + streakBonus,
        streak: newStreak,
        expandedRegion: null,
        sheet: "result",
        activePowerups: updatedPowerups,
      };
    });
  };

  const nextDay = () => {
    setG(prev => {
      const newRegions = prev.regions.map(r => ({
        ...r, allocated: 0,
        demand: Math.round(r.demand * (0.93 + Math.random() * 0.14)),
        price: priceLock ? r.price : Math.round(r.price * (0.92 + Math.random() * 0.16)),
        stability: clamp(r.stability + (r.allocated >= r.demand * 0.7 ? 3 : -4), 0, 100),
      }));
      let next = { ...prev, day: prev.day + 1, regions: newRegions, selectedDeal: null, sheet: null };
      if (prev.risk >= 95) return { ...next, sheet: "gameover" };
      if (prev.day >= 30) return { ...next, sheet: "victory" };
      if (Math.random() < 0.45) {
        const ev = pick(EVENTS_POOL);
        return { ...next, currentEvent: ev, sheet: "event" };
      }
      return next;
    });
  };

  const newRun = () => { setG(freshState()); setScreen("game"); };
  const backToTitle = () => { setG(freshState()); setScreen("title"); };

  // ── TITLE ──
  if (screen === "title") {
    return (
      <div style={S.titleOuter}>
        <style>{CSS}</style>
        <div style={S.titleWrap}>
          <div style={S.titleGrid} />
          <div style={S.titleGlow} />
          {/* Scanlines */}
          <div style={S.scanlines} />
          <div style={S.titleContent} className="stagger-in">
            <div style={S.titleBolt}>⚡</div>
            <h1 style={S.titleH1}>GRIDLORD</h1>
            <p style={S.titleTag}>Power is finite. Control is not.</p>
            <button onClick={newRun} style={S.startBtn}>
              <span style={S.startBtnText}>BEGIN</span>
            </button>
            <p style={S.titleHint}>Web-first · Mobile-optimised · Strategy</p>
          </div>
          <div style={S.titleVer}>v0.1.0 — PROTOTYPE</div>
        </div>
      </div>
    );
  }

  // ── GAME ──
  return (
    <div style={S.shell}>
      <style>{CSS}</style>
      <div style={S.phone}>
        <div style={S.scanlinesSoft} />

        {/* Toasts */}
        <div style={S.toastStack}>
          {g.toasts.map(t => (
            <div key={t.id} style={{ ...S.toast, borderLeftColor: t.color }} className="toast-in">{t.msg}</div>
          ))}
        </div>

        {/* ── STATUS BAR ── */}
        <div style={S.statusBar}>
          <div style={S.statusLeft}>
            <button style={S.menuBtn} onClick={() => set({ menuOpen: true })}>⋮</button>
            <div style={S.dayChip}>
              <span style={S.dayNum}>DAY {g.day}</span>
              <span style={S.dayOf}>/30</span>
            </div>
          </div>
          <div style={S.statusRight}>
            {g.streak >= 3 && <span style={S.streakBadge}>🔥 {g.streak}</span>}
            <span style={S.moneyAmt}>${fmt(g.money)}</span>
          </div>
        </div>

        {/* ── RISK ── */}
        <div style={S.riskRow}>
          <span style={S.riskWord}>HEAT</span>
          <div style={S.riskTrack}>
            <div style={{ ...S.riskFill, width: `${g.risk}%`, background: `linear-gradient(90deg, #1a1a1a, ${riskColor(g.risk)})` }}>
              <div style={S.riskGlint} />
            </div>
            {[30, 55, 75].map(t => <div key={t} style={{ ...S.riskTick, left: `${t}%` }} />)}
          </div>
          <span style={{ ...S.riskPct, color: riskColor(g.risk) }}>{g.risk}%</span>
          <span style={{ ...S.riskBadge, background: riskColor(g.risk) + "18", color: riskColor(g.risk) }}>{riskLabel(g.risk)}</span>
        </div>

        {/* ── ACTIVE POWERUPS ── */}
        {g.activePowerups.length > 0 && (
          <div style={S.puActiveRow}>
            {g.activePowerups.map((p, i) => (
              <div key={i} style={{ ...S.puActiveChip, borderColor: p.color + "40", background: p.color + "10" }}>
                <span>{p.icon}</span>
                <span style={{ color: p.color, fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700 }}>{p.turnsLeft}t</span>
              </div>
            ))}
          </div>
        )}

        {/* ── SUPPLY + STORAGE ── */}
        <div style={S.gaugeRow}>
          <div style={S.gaugeCard}>
            <span style={S.gaugeLabel}>GENERATION{surgeBonus > 0 ? " ⚡" : ""}</span>
            <span style={{ ...S.gaugeNum, color: surgeBonus > 0 ? "#00E5A0" : "#FFF" }}>{generation}<span style={S.gaugeUnit}> MW</span></span>
            <div style={S.gaugeMini}>
              <div style={{ ...S.gaugeMiniF, width: `${clamp((totalAllocated / generation) * 100, 0, 100)}%`, background: totalAllocated > generation ? "#FF3B30" : "#00E5A0" }} />
            </div>
            <span style={S.gaugeHint}>{totalAllocated} allocated</span>
          </div>
          <button style={S.storageCard} onClick={() => set({ sheet: g.sheet === "storage" ? null : "storage" })}>
            <span style={S.gaugeLabel}>STORAGE</span>
            <div style={S.batteryWrap}>
              <div style={S.battery}><div style={{ ...S.batteryFill, height: `${(g.stored / storageMax) * 100}%` }} /></div>
              <div>
                <span style={S.gaugeNum}>{g.stored}<span style={S.gaugeUnit}>/{storageMax}</span></span>
                <span style={S.gaugeHint}>Tap to manage</span>
              </div>
            </div>
          </button>
        </div>

        {/* ── STORAGE PANEL ── */}
        {g.sheet === "storage" && (
          <div style={S.storagePanel} className="slide-down">
            <div style={S.spHead}><span style={S.spTitle}>Energy Storage</span><button onClick={() => set({ sheet: null })} style={S.closeX}>✕</button></div>
            <p style={S.spDesc}>Store surplus for future turns or release to meet demand.</p>
            <div style={S.spActions}>
              <button onClick={() => storeEnergy(10)} disabled={g.stored >= storageMax || remaining <= 0} style={{ ...S.spBtn, opacity: g.stored >= storageMax || remaining <= 0 ? 0.3 : 1 }}>↓ Store +10</button>
              <button onClick={() => storeEnergy(-10)} disabled={g.stored <= 0} style={{ ...S.spBtn, ...S.spBtnAlt, opacity: g.stored <= 0 ? 0.3 : 1 }}>↑ Release 10</button>
            </div>
            <div style={S.spBar}><div style={{ ...S.spBarF, width: `${(g.stored / storageMax) * 100}%` }} /></div>
            <div style={S.spLabels}><span>0</span><span>{storageMax} MW</span></div>
          </div>
        )}

        {/* ── REGIONS ── */}
        <div style={S.sectionHead}><span style={S.sectionTitle}>REGIONS</span><span style={S.sectionSub}>tap to allocate</span></div>
        <div style={S.regionStack}>
          {g.regions.map(r => {
            const ex = g.expandedRegion === r.id;
            const pct = r.demand > 0 ? r.allocated / r.demand : 0;
            const col = prioColor[r.priority];
            const ac = allocColor(pct);
            return (
              <div key={r.id} style={{ ...S.rCard, borderColor: ex ? col + "40" : "rgba(255,255,255,0.05)" }}>
                <button style={S.rRow} onClick={() => set({ expandedRegion: ex ? null : r.id })}>
                  <div style={{ ...S.rIcon, background: col + "12" }}>{r.icon}</div>
                  <div style={S.rInfo}>
                    <div style={S.rName}>{r.name}</div>
                    <div style={S.rMeta}>{r.priority} · {r.demand} MW · ${r.price}/MW</div>
                  </div>
                  <div style={S.rRight}>
                    {r.allocated > 0 ? (
                      <div style={{ textAlign: "right" }}>
                        <div style={{ ...S.rAllocNum, color: ac }}>{r.allocated}<span style={S.rAllocUnit}> MW</span></div>
                        <div style={{ fontSize: 9, fontFamily: "var(--mono)", color: ac, opacity: 0.7 }}>{allocLabel(pct)}</div>
                      </div>
                    ) : (
                      <span style={S.rTapHint}>tap</span>
                    )}
                    <span style={{ ...S.rChevron, transform: ex ? "rotate(180deg)" : "" }}>▾</span>
                  </div>
                </button>
                {ex && (
                  <div style={S.rEx} className="slide-down">
                    <div style={S.rExTrait}>{r.trait}</div>
                    <div style={S.rExStats}>
                      <div style={S.rES}><span style={S.rESL}>Demand</span><span style={S.rESV}>{r.demand} MW</span></div>
                      <div style={S.rES}><span style={S.rESL}>Price</span><span style={{ ...S.rESV, color: "#FFD60A" }}>${r.price}/MW</span></div>
                      <div style={S.rES}><span style={S.rESL}>Stability</span><div style={S.miniBar}><div style={{ ...S.miniBarF, width: `${r.stability}%`, background: r.stability > 70 ? "#00E5A0" : r.stability > 40 ? "#FFD60A" : "#FF3B30" }} /></div></div>
                      <div style={S.rES}><span style={S.rESL}>Revenue</span><span style={{ ...S.rESV, color: "#00E5A0" }}>${fmt(Math.min(r.allocated, r.demand) * r.price)}</span></div>
                    </div>
                    <div style={S.allocBlock}>
                      <div style={S.allocHead}>
                        <span style={S.allocTitle}>ALLOCATE POWER</span>
                        <span style={{ ...S.allocVal, color: ac }}>{r.allocated} <span style={{ fontSize: 11, opacity: 0.4 }}>/ {r.demand}</span></span>
                      </div>
                      <input type="range" min={0} max={r.demand + 30} step={5} value={r.allocated} onChange={e => updateAlloc(r.id, parseInt(e.target.value))} className="alloc-slider" style={{ "--fill-pct": `${(r.allocated / (r.demand + 30)) * 100}%`, "--fill-color": ac }} />
                      <div style={S.allocFR}>
                        <div style={S.allocFB}><div style={{ ...S.allocFF, width: `${clamp(pct * 100, 0, 105)}%`, background: ac }} /><div style={{ ...S.allocMark, left: `${(r.demand / (r.demand + 30)) * 100}%` }} /></div>
                        <span style={{ ...S.allocSt, color: ac }}>{allocLabel(pct)}</span>
                      </div>
                      {pct > 0 && pct < 0.5 && <div style={S.allocWarn}>⚠ Blackout risk — unrest and price spikes likely</div>}
                    </div>
                    <div style={S.quickActs}>
                      <button style={S.quickBtn} onClick={() => updateAlloc(r.id, r.demand)}>Match demand</button>
                      <button style={S.quickBtn} onClick={() => updateAlloc(r.id, 0)}>Cut power</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── BLACK MARKET TRIGGER ── */}
        <button style={{ ...S.bmTrigger, borderColor: g.selectedDeal ? "rgba(255,59,48,0.3)" : "rgba(255,255,255,0.06)" }} onClick={() => set({ sheet: "blackmarket" })}>
          <div style={S.bmTrigLeft}>
            <span style={{ fontSize: 20 }}>🕳️</span>
            <div><span style={S.bmTrigTitle}>Black Market</span><span style={S.bmTrigSub}>{g.selectedDeal ? `${bmDeal.buyer} — ${bmDeal.mw} MW` : "No active deals"}</span></div>
          </div>
          <span style={S.rChevron}>›</span>
        </button>

        {/* ── POWER-UPS TRIGGER ── */}
        <button style={S.puTrigger} onClick={() => set({ sheet: "powerups" })}>
          <div style={S.bmTrigLeft}>
            <span style={{ fontSize: 20 }}>🧰</span>
            <div><span style={S.bmTrigTitle}>Power-Ups</span><span style={S.bmTrigSub}>{g.activePowerups.length > 0 ? `${g.activePowerups.length} active` : "Buy tactical advantages"}</span></div>
          </div>
          <span style={S.rChevron}>›</span>
        </button>

        {/* ── BOTTOM DOCK ── */}
        <div style={S.bottomDock}>
          <div style={S.remainChip}>
            <span style={{ color: remaining < 0 ? "#FF3B30" : remaining < 50 ? "#FFD60A" : "#00E5A0" }}>{remaining} MW remaining</span>
            {g.streak >= 3 && <span style={{ color: "#FF6B35", marginLeft: 8 }}>🔥 streak ×{g.streak}</span>}
          </div>
          <button style={{ ...S.endBtn, ...(g.risk >= 95 ? { background: "linear-gradient(135deg,#FF3B30,#CC2200)" } : {}) }} onClick={g.risk >= 95 ? () => set({ sheet: "gameover" }) : endTurn}>
            {g.risk >= 95 ? "⚠️ INVESTIGATION IMMINENT" : `END DAY ${g.day}  →`}
          </button>
        </div>

        {/* ── SHEETS ── */}
        {g.menuOpen && <Sheet onClose={() => set({ menuOpen: false })}><MenuSheet g={g} onResume={() => set({ menuOpen: false })} onNewRun={newRun} onTitle={backToTitle} /></Sheet>}
        {g.sheet === "blackmarket" && <Sheet onClose={() => set({ sheet: null })}><BMSheet deals={BM_DEALS} selected={g.selectedDeal} onSelect={id => set(p => ({ selectedDeal: p.selectedDeal === id ? null : id }))} onClose={() => set({ sheet: null })} /></Sheet>}
        {g.sheet === "powerups" && <Sheet onClose={() => set({ sheet: null })}><PUSheet powerups={POWERUPS} money={g.money} active={g.activePowerups} onBuy={buyPowerup} onClose={() => set({ sheet: null })} /></Sheet>}
        {g.sheet === "result" && g.turnData && <Sheet onClose={nextDay}><ResultSheet d={g.turnData} day={g.day} money={g.money} risk={g.risk} onContinue={nextDay} /></Sheet>}
        {g.sheet === "event" && g.currentEvent && <Sheet onClose={() => set({ sheet: null })}><EventSheet event={g.currentEvent} onDismiss={() => set({ sheet: null })} /></Sheet>}
        {g.sheet === "gameover" && <Sheet onClose={() => {}}><EndSheet type="over" day={g.day} money={g.money} risk={g.risk} total={g.totalProfit} streak={g.streak} onNew={newRun} onTitle={backToTitle} /></Sheet>}
        {g.sheet === "victory" && <Sheet onClose={() => {}}><EndSheet type="win" day={g.day} money={g.money} risk={g.risk} total={g.totalProfit} streak={g.streak} onNew={newRun} onTitle={backToTitle} /></Sheet>}
      </div>
    </div>
  );
}

// ── BM Data ──
const BM_DEALS = [
  { id: "bm1", buyer: "Meridian Corp", mw: 30, price: 89, risk: 12, desc: "Off-books corporate data center deal.", tag: "HIGH MARGIN" },
  { id: "bm2", buyer: "HashRate Mining", mw: 50, price: 72, risk: 18, desc: "Crypto op. Cash upfront, draws attention.", tag: "VOLATILE" },
  { id: "bm3", buyer: "St. Mary's Hospital", mw: 20, price: 65, risk: 4, desc: "Grey-area emergency supply bypass.", tag: "LOW RISK" },
];

// ══════════════════════════════════════════════════════════════════════
// SHEET COMPONENTS
// ══════════════════════════════════════════════════════════════════════
function Sheet({ children, onClose }) {
  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.sheetWrap} className="sheet-enter" onClick={e => e.stopPropagation()}>
        <div style={S.sheetHandle} />
        {children}
      </div>
    </div>
  );
}

function MenuSheet({ g, onResume, onNewRun, onTitle }) {
  return (
    <div style={S.sc}>
      <div style={S.menuHdr}><span style={S.menuHdrT}>⚡ GRIDLORD</span><span style={S.menuHdrS}>Day {g.day}/30 · ${fmt(g.money)}</span></div>
      <button style={S.menuItem} onClick={onResume}><span style={S.miIcon}>▶</span><div><span style={S.miLabel}>Resume</span><span style={S.miDesc}>Continue current run</span></div></button>
      <button style={S.menuItem} onClick={onNewRun}><span style={S.miIcon}>↻</span><div><span style={S.miLabel}>New Run</span><span style={S.miDesc}>Start fresh from Day 1</span></div></button>
      <button style={{ ...S.menuItem, borderColor: "rgba(255,59,48,0.1)" }} onClick={onTitle}><span style={{ ...S.miIcon, color: "#FF3B30" }}>✕</span><div><span style={{ ...S.miLabel, color: "#FF3B30" }}>End Run</span><span style={S.miDesc}>Return to title screen</span></div></button>
      <div style={S.menuFoot}>Progress saved automatically</div>
    </div>
  );
}

function BMSheet({ deals, selected, onSelect, onClose }) {
  return (
    <div style={S.sc}>
      <div style={S.sheetHdr}><span style={{ ...S.sheetT, color: "#FF3B30" }}>Black Market</span><button onClick={onClose} style={S.closeX}>✕</button></div>
      <div style={S.bmWarn}><span>⚠</span><span>Off-grid deals increase heat.</span></div>
      {deals.map(d => {
        const a = selected === d.id;
        return (
          <button key={d.id} onClick={() => onSelect(d.id)} style={{ ...S.bmCard, borderColor: a ? "#FF3B30" : "rgba(255,255,255,0.06)", background: a ? "rgba(255,59,48,0.06)" : "rgba(255,255,255,0.02)" }}>
            <div style={S.bmCardTop}><div><div style={S.bmBuyer}>{d.buyer}</div><div style={S.bmDesc}>{d.desc}</div></div><span style={S.bmTag}>{d.tag}</span></div>
            <div style={S.bmStatRow}>
              <span><b style={{ color: "#FFF" }}>{d.mw}</b> MW</span>
              <span><b style={{ color: "#FFD60A" }}>${d.price}</b>/MW</span>
              <span style={{ color: "#FF3B30" }}>+{d.risk}%</span>
              <span style={{ color: "#00E5A0" }}>${fmt(d.mw * d.price)}</span>
            </div>
            {a && <div style={S.bmChk}>✓ Selected</div>}
          </button>
        );
      })}
      <button style={{ ...S.sheetPri, background: selected ? "linear-gradient(135deg,#FF3B30,#CC2200)" : "#222", color: selected ? "#FFF" : "#555" }} onClick={onClose}>{selected ? "CONFIRM DEAL" : "CLOSE"}</button>
    </div>
  );
}

function PUSheet({ powerups, money, active, onBuy, onClose }) {
  const activeIds = active.map(a => a.id);
  return (
    <div style={S.sc}>
      <div style={S.sheetHdr}><span style={{ ...S.sheetT, color: "#FFD60A" }}>Power-Ups</span><button onClick={onClose} style={S.closeX}>✕</button></div>
      <p style={{ fontSize: 12, color: "#777", marginBottom: 14, lineHeight: 1.4 }}>Tactical advantages. Spend money now to gain an edge. Some are instant, others last multiple turns.</p>
      <div style={S.puGrid}>
        {powerups.map(pu => {
          const owned = activeIds.includes(pu.id);
          const canAfford = money >= pu.cost;
          return (
            <button key={pu.id} onClick={() => !owned && canAfford && onBuy(pu)} style={{ ...S.puCard, opacity: owned ? 0.4 : canAfford ? 1 : 0.5, borderColor: owned ? pu.color + "30" : "rgba(255,255,255,0.06)" }}>
              <div style={S.puCardIcon}>{pu.icon}</div>
              <div style={S.puCardName}>{pu.name}</div>
              <div style={S.puCardDesc}>{pu.desc}</div>
              <div style={{ ...S.puCardCost, color: canAfford ? "#00E5A0" : "#FF3B30" }}>
                {owned ? "ACTIVE" : `$${fmt(pu.cost)}`}
              </div>
            </button>
          );
        })}
      </div>
      <button style={S.sheetPri} onClick={onClose}>CLOSE</button>
    </div>
  );
}

function ResultSheet({ d, day, money, risk, onContinue }) {
  const rows = [
    { l: "Grid Revenue", v: `+$${fmt(d.revenue)}`, c: "#00E5A0" },
    { l: "Black Market", v: d.bmIncome > 0 ? `+$${fmt(d.bmIncome)}` : "—", c: d.bmIncome > 0 ? "#FF6B35" : "#333" },
    { l: "Supply Costs", v: `-$${fmt(d.costs)}`, c: "#FF3B30" },
  ];
  return (
    <div style={S.sc}>
      <div style={S.resHero}>
        <span style={S.resLabel}>DAY {day} COMPLETE</span>
        <span style={{ ...S.resBig, color: d.net >= 0 ? "#00E5A0" : "#FF3B30" }}>{d.net >= 0 ? "+" : ""}${fmt(d.net)}</span>
        {d.streakBonus > 0 && <span style={S.resStreak}>🔥 Streak bonus +${fmt(d.streakBonus)} (×{d.newStreak})</span>}
      </div>
      <div style={S.resBlock}>
        {rows.map((r, i) => <div key={i} style={S.resRow}><span style={S.resRowL}>{r.l}</span><span style={{ ...S.resRowV, color: r.c }}>{r.v}</span></div>)}
      </div>
      <div style={S.resBlock}>
        <span style={S.resBlockT}>GRID STATUS</span>
        {d.regionOutcomes.map((r, i) => (
          <div key={i} style={S.resRow}>
            <span style={S.resRowL}>{r.icon} {r.name}</span>
            <span style={{ ...S.resRowV, color: r.outcome === "Supplied" ? "#00E5A0" : r.outcome === "Partial" ? "#FFD60A" : "#FF3B30" }}>
              {r.outcome === "Supplied" ? "✓" : r.outcome === "Partial" ? "~" : "✗"} {r.outcome}
            </span>
          </div>
        ))}
      </div>
      <div style={S.resBlock}>
        <span style={S.resBlockT}>RISK</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={S.riskTrack}><div style={{ ...S.riskFill, width: `${risk}%`, background: `linear-gradient(90deg,#1a1a1a,${riskColor(risk)})` }} /></div>
          <span style={{ color: riskColor(risk), fontFamily: "var(--mono)", fontSize: 13, fontWeight: 700 }}>{risk}%</span>
        </div>
        <span style={{ fontSize: 11, color: d.riskDelta > 0 ? "#FF6B35" : "#00E5A0", fontFamily: "var(--mono)", marginTop: 4, display: "block" }}>
          {d.riskDelta > 0 ? "▲" : "▼"} {Math.abs(d.riskDelta)}%
        </span>
      </div>
      <button style={S.sheetPri} onClick={onContinue}>NEXT DAY →</button>
    </div>
  );
}

function EventSheet({ event, onDismiss }) {
  const c = sevColor(event.severity);
  return (
    <div style={{ ...S.sc, textAlign: "center" }}>
      <div style={{ ...S.evBadge, background: c + "18", color: c }}>{event.severity.toUpperCase()}</div>
      <div style={S.evIcon}>{event.icon}</div>
      <h2 style={S.evH2}>{event.title}</h2>
      <p style={S.evP}>{event.desc}</p>
      <div style={{ ...S.evEffect, borderColor: c + "30", background: c + "08", color: c }}>{event.effect}</div>
      <button style={{ ...S.sheetPri, background: `linear-gradient(135deg,${c},${c}BB)` }} onClick={onDismiss}>ACKNOWLEDGE</button>
    </div>
  );
}

function EndSheet({ type, day, money, risk, total, streak, onNew, onTitle }) {
  const win = type === "win";
  const score = Math.floor(total / 100) + (win ? (100 - risk) * 10 : 0) + day * 20 + streak * 50;
  const c = win ? "#00E5A0" : "#FF3B30";
  return (
    <div style={{ ...S.sc, textAlign: "center" }}>
      <div style={{ ...S.evBadge, background: c + "18", color: c }}>{win ? "RUN COMPLETE" : "GAME OVER"}</div>
      <div style={S.evIcon}>{win ? "⚡" : "🏛️"}</div>
      <h2 style={S.evH2}>{win ? "SURVIVED" : "INVESTIGATION"}</h2>
      <p style={S.evP}>{win ? "30 days. Grid intact. You are the GridLord." : "Federal regulators launched a probe. Your tenure is over."}</p>
      <div style={S.goGrid}>
        <div style={S.goCell}><span style={S.goCL}>DAYS</span><span style={S.goCV}>{day}</span></div>
        <div style={S.goCell}><span style={S.goCL}>PROFIT</span><span style={{ ...S.goCV, color: "#00E5A0" }}>${fmt(total)}</span></div>
        <div style={S.goCell}><span style={S.goCL}>BEST STREAK</span><span style={{ ...S.goCV, color: "#FF6B35" }}>{streak}</span></div>
        <div style={S.goCell}><span style={S.goCL}>SCORE</span><span style={{ ...S.goCV, fontSize: 24, color: "#FFD60A" }}>{fmt(score)}</span></div>
      </div>
      <button style={{ ...S.sheetPri, background: `linear-gradient(135deg,${c},${c}CC)` }} onClick={onNew}>NEW RUN</button>
      <button style={S.sheetSec} onClick={onTitle}>TITLE SCREEN</button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// CSS
// ══════════════════════════════════════════════════════════════════════
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
  :root { --mono: 'JetBrains Mono', monospace; --sans: 'DM Sans', sans-serif; }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
  ::-webkit-scrollbar { width: 0; }
  button { cursor: pointer; border: none; background: none; color: inherit; font-family: inherit; }
  button:active { transform: scale(0.97); transition: transform 0.08s; }

  .stagger-in > * { animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both; }
  .stagger-in > *:nth-child(1) { animation-delay: 0.1s; }
  .stagger-in > *:nth-child(2) { animation-delay: 0.2s; }
  .stagger-in > *:nth-child(3) { animation-delay: 0.35s; }
  .stagger-in > *:nth-child(4) { animation-delay: 0.5s; }
  .stagger-in > *:nth-child(5) { animation-delay: 0.65s; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } }

  .slide-down { animation: slideDown 0.3s cubic-bezier(0.16,1,0.3,1) both; }
  @keyframes slideDown { from { opacity: 0; max-height: 0; } to { opacity: 1; max-height: 600px; } }

  .sheet-enter { animation: sheetUp 0.4s cubic-bezier(0.16,1,0.3,1) both; }
  @keyframes sheetUp { from { transform: translateY(100%); } to { transform: translateY(0); } }

  .toast-in { animation: toastIn 0.3s cubic-bezier(0.16,1,0.3,1) both, toastOut 0.3s 2.5s ease both; }
  @keyframes toastIn { from { opacity: 0; transform: translateY(-10px) scale(0.95); } }
  @keyframes toastOut { to { opacity: 0; transform: translateY(-10px) scale(0.95); } }

  @keyframes glowPulse { 0%,100% { opacity: 0.2; transform: translate(-50%,-50%) scale(1); } 50% { opacity: 0.4; transform: translate(-50%,-50%) scale(1.12); } }
  @keyframes glint { 0% { left: -40%; } 100% { left: 140%; } }
  @keyframes scanMove { 0% { transform: translateY(-100%); } 100% { transform: translateY(100vh); } }

  .alloc-slider { -webkit-appearance: none; appearance: none; width: 100%; height: 36px; background: transparent; cursor: pointer; }
  .alloc-slider::-webkit-slider-runnable-track { height: 6px; border-radius: 3px; background: linear-gradient(to right, var(--fill-color) var(--fill-pct), rgba(255,255,255,0.05) var(--fill-pct)); }
  .alloc-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 28px; height: 28px; border-radius: 50%; background: var(--fill-color); border: 3px solid #0D0D0D; margin-top: -11px; box-shadow: 0 2px 12px rgba(0,0,0,0.6); }
  .alloc-slider::-moz-range-track { height: 6px; border-radius: 3px; background: rgba(255,255,255,0.05); border: none; }
  .alloc-slider::-moz-range-thumb { width: 28px; height: 28px; border-radius: 50%; background: var(--fill-color); border: 3px solid #0D0D0D; }
  .alloc-slider::-moz-range-progress { height: 6px; border-radius: 3px; background: var(--fill-color); }
`;

// ══════════════════════════════════════════════════════════════════════
// STYLES
// ══════════════════════════════════════════════════════════════════════
const S = {
  // Title — ORIGINAL from v1
  titleOuter: { width: "100%", minHeight: "100vh", background: "#050505", display: "flex", justifyContent: "center" },
  titleWrap: { width: "100%", maxWidth: 430, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", padding: "40px 32px", background: "#0A0A0A" },
  titleGrid: { position: "absolute", inset: 0, opacity: 0.04, backgroundImage: "linear-gradient(rgba(255,255,255,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.3) 1px,transparent 1px)", backgroundSize: "40px 40px" },
  titleGlow: { position: "absolute", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,107,53,.15) 0%,transparent 70%)", top: "20%", left: "50%", animation: "glowPulse 3s ease-in-out infinite" },
  scanlines: { position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)", pointerEvents: "none", zIndex: 3 },
  scanlinesSoft: { position: "fixed", inset: 0, background: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.015) 3px, rgba(0,0,0,0.015) 6px)", pointerEvents: "none", zIndex: 50 },
  titleContent: { position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", color: "#FFF" },
  titleBolt: { fontSize: 64, marginBottom: 8 },
  titleH1: { fontSize: 48, fontFamily: "var(--mono)", fontWeight: 700, letterSpacing: 12, textShadow: "0 0 40px rgba(255,107,53,0.4)" },
  titleTag: { fontSize: 14, color: "rgba(255,255,255,0.4)", marginTop: 8, fontStyle: "italic", letterSpacing: 2 },
  startBtn: { marginTop: 48, padding: "16px 48px", background: "transparent", border: "1px solid rgba(255,107,53,0.6)", borderRadius: 2 },
  startBtnText: { fontFamily: "var(--mono)", fontSize: 14, fontWeight: 600, letterSpacing: 4, color: "#FF6B35" },
  titleHint: { marginTop: 24, fontSize: 11, color: "rgba(255,255,255,0.2)", letterSpacing: 1 },
  titleVer: { position: "absolute", bottom: 20, fontSize: 10, fontFamily: "var(--mono)", color: "rgba(255,255,255,0.1)", letterSpacing: 1 },

  // Shell
  shell: { width: "100%", display: "flex", justifyContent: "center", minHeight: "100vh", background: "#050505", fontFamily: "var(--sans)" },
  phone: { width: "100%", maxWidth: 430, minHeight: "100vh", background: "#0D0D0D", color: "#E0E0E0", padding: "14px 14px 130px", position: "relative" },

  // Toasts
  toastStack: { position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)", zIndex: 200, display: "flex", flexDirection: "column", gap: 6, maxWidth: 400, width: "90%" },
  toast: { padding: "10px 14px", background: "rgba(17,17,17,0.95)", borderRadius: 8, borderLeft: "3px solid", fontFamily: "var(--mono)", fontSize: 12, fontWeight: 600, color: "#E0E0E0", backdropFilter: "blur(8px)", boxShadow: "0 4px 20px rgba(0,0,0,0.4)" },

  // Status
  statusBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  statusLeft: { display: "flex", alignItems: "center", gap: 8 },
  statusRight: { display: "flex", alignItems: "center", gap: 8 },
  menuBtn: { width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#555", fontWeight: 700 },
  dayChip: { display: "inline-flex", alignItems: "baseline", gap: 2, background: "rgba(255,107,53,0.08)", padding: "5px 12px", borderRadius: 4, border: "1px solid rgba(255,107,53,0.12)" },
  dayNum: { fontFamily: "var(--mono)", fontSize: 13, fontWeight: 700, color: "#FF6B35", letterSpacing: 2 },
  dayOf: { fontFamily: "var(--mono)", fontSize: 11, color: "rgba(255,107,53,0.35)" },
  streakBadge: { fontFamily: "var(--mono)", fontSize: 11, fontWeight: 700, color: "#FF6B35", padding: "3px 8px", background: "rgba(255,107,53,0.08)", borderRadius: 4 },
  moneyAmt: { fontFamily: "var(--mono)", fontSize: 22, fontWeight: 700, color: "#00E5A0" },

  // Risk
  riskRow: { display: "flex", alignItems: "center", gap: 8, marginBottom: 10, padding: "8px 12px", background: "rgba(255,255,255,0.02)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.04)" },
  riskWord: { fontFamily: "var(--mono)", fontSize: 9, letterSpacing: 2, color: "#555", minWidth: 32 },
  riskTrack: { flex: 1, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.06)", position: "relative", overflow: "hidden" },
  riskFill: { height: "100%", borderRadius: 3, transition: "width 0.5s cubic-bezier(0.16,1,0.3,1)", position: "relative" },
  riskGlint: { position: "absolute", top: 0, width: "30%", height: "100%", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)", animation: "glint 3s ease-in-out infinite" },
  riskTick: { position: "absolute", top: -2, width: 1, height: 9, background: "rgba(255,255,255,0.1)" },
  riskPct: { fontFamily: "var(--mono)", fontSize: 12, fontWeight: 700, minWidth: 32, textAlign: "right" },
  riskBadge: { fontFamily: "var(--mono)", fontSize: 8, fontWeight: 700, padding: "2px 6px", borderRadius: 3, letterSpacing: 1.5 },

  // Active powerups
  puActiveRow: { display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" },
  puActiveChip: { display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 20, border: "1px solid", fontSize: 14 },

  // Gauges
  gaugeRow: { display: "flex", gap: 8, marginBottom: 12 },
  gaugeCard: { flex: 1, padding: "10px 12px", background: "rgba(255,255,255,0.02)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.04)" },
  storageCard: { flex: 1, padding: "10px 12px", background: "rgba(138,142,255,0.04)", borderRadius: 8, border: "1px solid rgba(138,142,255,0.1)", textAlign: "left", display: "block" },
  gaugeLabel: { display: "block", fontFamily: "var(--mono)", fontSize: 8, letterSpacing: 2, color: "#555", marginBottom: 4 },
  gaugeNum: { fontFamily: "var(--mono)", fontSize: 16, fontWeight: 700, color: "#FFF" },
  gaugeUnit: { fontSize: 11, color: "#555", fontWeight: 500 },
  gaugeMini: { height: 3, borderRadius: 2, background: "rgba(255,255,255,0.06)", marginTop: 6, overflow: "hidden" },
  gaugeMiniF: { height: "100%", borderRadius: 2, transition: "width 0.3s" },
  gaugeHint: { display: "block", fontFamily: "var(--mono)", fontSize: 9, color: "#444", marginTop: 3 },
  batteryWrap: { display: "flex", alignItems: "center", gap: 10, marginTop: 2 },
  battery: { width: 18, height: 28, borderRadius: 3, border: "2px solid rgba(138,142,255,0.3)", position: "relative", overflow: "hidden" },
  batteryFill: { position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(to top, #8E8AFF, #B0ADFF)", borderRadius: "0 0 1px 1px", transition: "height 0.3s" },

  // Storage panel
  storagePanel: { padding: "14px", background: "rgba(138,142,255,0.04)", borderRadius: 8, border: "1px solid rgba(138,142,255,0.1)", marginBottom: 12, overflow: "hidden" },
  spHead: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  spTitle: { fontFamily: "var(--mono)", fontSize: 13, fontWeight: 700, color: "#8E8AFF" },
  spDesc: { fontSize: 12, color: "#666", lineHeight: 1.4, marginBottom: 12 },
  spActions: { display: "flex", gap: 8, marginBottom: 12 },
  spBtn: { flex: 1, padding: "11px", borderRadius: 6, background: "rgba(138,142,255,0.1)", border: "1px solid rgba(138,142,255,0.2)", color: "#8E8AFF", fontFamily: "var(--mono)", fontSize: 11, fontWeight: 600 },
  spBtnAlt: { background: "rgba(0,229,160,0.06)", borderColor: "rgba(0,229,160,0.15)", color: "#00E5A0" },
  spBar: { height: 5, borderRadius: 3, background: "rgba(255,255,255,0.05)", overflow: "hidden" },
  spBarF: { height: "100%", borderRadius: 3, background: "linear-gradient(90deg,#8E8AFF,#B0ADFF)", transition: "width 0.3s" },
  spLabels: { display: "flex", justifyContent: "space-between", fontFamily: "var(--mono)", fontSize: 9, color: "#444", marginTop: 3 },

  // Section
  sectionHead: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  sectionTitle: { fontFamily: "var(--mono)", fontSize: 10, letterSpacing: 3, color: "#555" },
  sectionSub: { fontSize: 11, color: "#333", fontStyle: "italic" },

  // Region cards
  regionStack: { display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 },
  rCard: { borderRadius: 10, background: "rgba(255,255,255,0.018)", border: "1px solid", transition: "border-color 0.2s", overflow: "hidden" },
  rRow: { display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", width: "100%", textAlign: "left" },
  rIcon: { width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 },
  rInfo: { flex: 1, minWidth: 0 },
  rName: { fontSize: 14, fontWeight: 700, fontFamily: "var(--mono)" },
  rMeta: { fontSize: 11, color: "#555", textTransform: "capitalize", marginTop: 1 },
  rRight: { display: "flex", alignItems: "center", gap: 8, flexShrink: 0 },
  rAllocNum: { fontFamily: "var(--mono)", fontSize: 18, fontWeight: 800 },
  rAllocUnit: { fontSize: 10, color: "#555" },
  rTapHint: { fontFamily: "var(--mono)", fontSize: 10, color: "#333" },
  rChevron: { fontSize: 14, color: "#444", transition: "transform 0.2s" },

  rEx: { padding: "0 14px 14px", borderTop: "1px solid rgba(255,255,255,0.04)", overflow: "hidden" },
  rExTrait: { padding: "8px 0", fontSize: 11, color: "#666", fontStyle: "italic", lineHeight: 1.4 },
  rExStats: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, paddingBottom: 12 },
  rES: { display: "flex", flexDirection: "column", gap: 3 },
  rESL: { fontFamily: "var(--mono)", fontSize: 8, letterSpacing: 1.5, color: "#444" },
  rESV: { fontFamily: "var(--mono)", fontSize: 13, fontWeight: 700, color: "#CCC" },
  miniBar: { width: "100%", height: 3, borderRadius: 2, background: "rgba(255,255,255,0.06)", marginTop: 4 },
  miniBarF: { height: "100%", borderRadius: 2, transition: "width 0.3s" },

  allocBlock: { paddingBottom: 10 },
  allocHead: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 2 },
  allocTitle: { fontFamily: "var(--mono)", fontSize: 9, letterSpacing: 2, color: "#555" },
  allocVal: { fontFamily: "var(--mono)", fontSize: 18, fontWeight: 800 },
  allocFR: { display: "flex", alignItems: "center", gap: 10 },
  allocFB: { flex: 1, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.05)", position: "relative", overflow: "hidden" },
  allocFF: { height: "100%", borderRadius: 2, transition: "width 0.2s" },
  allocMark: { position: "absolute", top: -4, width: 2, height: 11, background: "rgba(255,255,255,0.2)", borderRadius: 1 },
  allocSt: { fontFamily: "var(--mono)", fontSize: 10, fontWeight: 600, minWidth: 60 },
  allocWarn: { fontSize: 11, color: "#FF6B35", marginTop: 6, padding: "6px 10px", background: "rgba(255,107,53,0.05)", borderRadius: 4, border: "1px solid rgba(255,107,53,0.08)" },
  quickActs: { display: "flex", gap: 6, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.04)" },
  quickBtn: { flex: 1, padding: "8px", borderRadius: 5, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)", fontFamily: "var(--mono)", fontSize: 10, color: "#777", fontWeight: 600 },

  // Triggers
  bmTrigger: { width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px", borderRadius: 10, background: "rgba(255,59,48,0.025)", border: "1px solid", marginBottom: 8, textAlign: "left" },
  puTrigger: { width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px", borderRadius: 10, background: "rgba(255,214,10,0.025)", border: "1px solid rgba(255,214,10,0.08)", marginBottom: 12, textAlign: "left" },
  bmTrigLeft: { display: "flex", alignItems: "center", gap: 10 },
  bmTrigTitle: { display: "block", fontFamily: "var(--mono)", fontSize: 13, fontWeight: 700 },
  bmTrigSub: { display: "block", fontSize: 11, color: "#555", marginTop: 1 },

  // Bottom dock
  bottomDock: { position: "sticky", bottom: 0, padding: "8px 0 0", background: "linear-gradient(transparent, #0D0D0D 15%)", zIndex: 10 },
  remainChip: { textAlign: "center", fontFamily: "var(--mono)", fontSize: 11, marginBottom: 8, padding: "4px 0" },
  endBtn: { width: "100%", padding: "18px", background: "linear-gradient(135deg,#FF6B35,#E05520)", borderRadius: 10, color: "#FFF", fontFamily: "var(--mono)", fontSize: 13, fontWeight: 700, letterSpacing: 3, textAlign: "center", boxShadow: "0 4px 20px rgba(255,107,53,0.2)" },

  // Overlay + sheets
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 100, backdropFilter: "blur(4px)" },
  sheetWrap: { width: "100%", maxWidth: 430, maxHeight: "88vh", overflowY: "auto", background: "#111", borderRadius: "20px 20px 0 0" },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.12)", margin: "10px auto 0" },
  sc: { padding: "20px 20px 32px" },
  sheetHdr: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  sheetT: { fontFamily: "var(--mono)", fontSize: 16, fontWeight: 700, letterSpacing: 2 },
  closeX: { width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.05)", fontSize: 14, color: "#555", display: "flex", alignItems: "center", justifyContent: "center" },
  sheetPri: { width: "100%", padding: "16px", background: "linear-gradient(135deg,#FF6B35,#E05520)", borderRadius: 8, color: "#FFF", fontFamily: "var(--mono)", fontSize: 13, fontWeight: 700, letterSpacing: 2, marginTop: 16, textAlign: "center" },
  sheetSec: { width: "100%", padding: "14px", background: "transparent", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)", color: "#777", fontFamily: "var(--mono)", fontSize: 12, fontWeight: 600, letterSpacing: 2, marginTop: 8, textAlign: "center" },

  // Menu
  menuHdr: { textAlign: "center", paddingBottom: 16, marginBottom: 12, borderBottom: "1px solid rgba(255,255,255,0.05)" },
  menuHdrT: { display: "block", fontFamily: "var(--mono)", fontSize: 18, fontWeight: 800, letterSpacing: 3, color: "#FFF" },
  menuHdrS: { display: "block", fontFamily: "var(--mono)", fontSize: 11, color: "#555", marginTop: 4 },
  menuItem: { width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.04)", background: "rgba(255,255,255,0.015)", marginBottom: 6, textAlign: "left" },
  miIcon: { fontSize: 18, color: "#FF6B35", width: 28, textAlign: "center", flexShrink: 0 },
  miLabel: { display: "block", fontFamily: "var(--mono)", fontSize: 14, fontWeight: 700, color: "#E0E0E0" },
  miDesc: { display: "block", fontSize: 12, color: "#555", marginTop: 1 },
  menuFoot: { textAlign: "center", marginTop: 10, fontFamily: "var(--mono)", fontSize: 10, color: "#333" },

  // BM sheet
  bmWarn: { display: "flex", gap: 8, padding: "8px 12px", borderRadius: 6, background: "rgba(255,59,48,0.04)", border: "1px solid rgba(255,59,48,0.08)", fontSize: 12, color: "#888", marginBottom: 14, alignItems: "center" },
  bmCard: { display: "block", width: "100%", padding: "14px", borderRadius: 8, border: "1px solid", marginBottom: 8, textAlign: "left", transition: "all 0.15s" },
  bmCardTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 },
  bmBuyer: { fontFamily: "var(--mono)", fontSize: 13, fontWeight: 700, color: "#FFF" },
  bmDesc: { fontSize: 12, color: "#666", marginTop: 2, lineHeight: 1.4 },
  bmTag: { fontFamily: "var(--mono)", fontSize: 8, fontWeight: 700, padding: "3px 7px", borderRadius: 3, background: "rgba(255,214,10,0.06)", color: "#FFD60A", letterSpacing: 1.5, whiteSpace: "nowrap" },
  bmStatRow: { display: "flex", justifyContent: "space-between", fontFamily: "var(--mono)", fontSize: 11, color: "#555", marginTop: 8 },
  bmChk: { fontFamily: "var(--mono)", fontSize: 10, color: "#FF3B30", fontWeight: 700, textAlign: "center", marginTop: 6, letterSpacing: 2 },

  // Power-ups
  puGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 },
  puCard: { padding: "14px 12px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", textAlign: "center", transition: "all 0.15s" },
  puCardIcon: { fontSize: 28, marginBottom: 6 },
  puCardName: { fontFamily: "var(--mono)", fontSize: 11, fontWeight: 700, color: "#E0E0E0", marginBottom: 4 },
  puCardDesc: { fontSize: 10, color: "#666", lineHeight: 1.3, marginBottom: 8, minHeight: 26 },
  puCardCost: { fontFamily: "var(--mono)", fontSize: 12, fontWeight: 800 },

  // Result
  resHero: { textAlign: "center", paddingBottom: 14, marginBottom: 12, borderBottom: "1px solid rgba(255,255,255,0.04)" },
  resLabel: { display: "block", fontFamily: "var(--mono)", fontSize: 10, color: "#FF6B35", letterSpacing: 4, marginBottom: 4 },
  resBig: { display: "block", fontFamily: "var(--mono)", fontSize: 36, fontWeight: 800 },
  resStreak: { display: "block", fontFamily: "var(--mono)", fontSize: 11, color: "#FF6B35", marginTop: 6 },
  resBlock: { padding: "12px", borderRadius: 8, background: "rgba(255,255,255,0.018)", border: "1px solid rgba(255,255,255,0.04)", marginBottom: 8 },
  resBlockT: { display: "block", fontFamily: "var(--mono)", fontSize: 9, letterSpacing: 2, color: "#444", marginBottom: 8 },
  resRow: { display: "flex", justifyContent: "space-between", padding: "4px 0" },
  resRowL: { fontSize: 13, color: "#999" },
  resRowV: { fontFamily: "var(--mono)", fontSize: 13, fontWeight: 600 },

  // Event
  evBadge: { display: "inline-block", fontFamily: "var(--mono)", fontSize: 9, fontWeight: 700, padding: "4px 12px", borderRadius: 4, letterSpacing: 3, marginBottom: 14 },
  evIcon: { fontSize: 52, marginBottom: 8 },
  evH2: { fontFamily: "var(--mono)", fontSize: 22, fontWeight: 800, color: "#FFF", letterSpacing: 2, marginBottom: 6 },
  evP: { fontSize: 14, color: "#999", lineHeight: 1.6, maxWidth: 300, margin: "0 auto 18px" },
  evEffect: { display: "inline-block", fontFamily: "var(--mono)", fontSize: 12, fontWeight: 600, padding: "8px 16px", borderRadius: 6, border: "1px solid", marginBottom: 8 },

  // End screens
  goGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, margin: "16px 0 8px" },
  goCell: { padding: "12px", borderRadius: 8, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 },
  goCL: { fontFamily: "var(--mono)", fontSize: 8, letterSpacing: 2, color: "#555" },
  goCV: { fontFamily: "var(--mono)", fontSize: 18, fontWeight: 800, color: "#FFF" },
};
