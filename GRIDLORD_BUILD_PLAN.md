# ⚡ GRIDLORD — Build Plan v2
**Stack:** TypeScript · React 19 · Vite · Zustand · Tailwind CSS  
**Target:** Web-first, mobile-optimised (PWA-ready)

---

## 1. Architecture

```
src/
├── main.tsx
├── App.tsx                     # Single-screen game + title toggle
├── stores/
│   ├── gameStore.ts            # Zustand — all game state
│   └── metaStore.ts            # Run history, unlocks, achievements
├── engines/
│   ├── turnEngine.ts           # Full turn orchestration
│   ├── economyEngine.ts        # Price curves, supply/demand
│   ├── eventEngine.ts          # Weighted selection + chaining + state triggers
│   ├── riskEngine.ts           # Heat meter + threshold effects
│   ├── powerupEngine.ts        # Buy, activate, tick down, resolve effects
│   ├── streakEngine.ts         # Consecutive supply tracking + bonuses
│   └── progressionEngine.ts    # Difficulty scaling, unlocks
├── data/
│   ├── regions.ts
│   ├── events.ts               # 20+ events with mechanical effects
│   ├── powerups.ts             # 6+ power-ups with costs/durations
│   ├── blackMarket.ts
│   └── balanceTables.ts
├── components/
│   ├── dashboard/              # StatusBar, RiskRow, GaugeRow, RegionStack
│   ├── sheets/                 # BlackMarket, PowerUps, Result, Event, Menu, End
│   ├── shared/                 # RiskMeter, MiniBar, Toast, Badge
│   └── title/                  # TitleScreen
├── hooks/
│   ├── useGameLoop.ts
│   ├── useToast.ts
│   └── usePersistence.ts
├── utils/
│   └── random.ts, format.ts, sound.ts
└── types/
    └── index.ts
```

---

## 2. Interaction Model

**Single-screen dashboard.** No separate pages. Everything happens on one screen via:

- **Tap-to-expand regions** — inline allocation slider + stats + quick actions
- **Tappable storage widget** — inline panel with store/release buttons
- **Bottom sheets** — black market, power-ups, turn results, events, pause menu, game over/victory
- **Toast notifications** — ephemeral feedback for power-up activations, warnings, streaks

### Screen Flow
```
[Title] → BEGIN → [Dashboard]
  Dashboard contains:
  ├── Status bar (⋮ menu, day, money)
  ├── Risk meter
  ├── Active power-up chips
  ├── Supply + Storage gauges
  ├── Region cards (tap to expand/allocate)
  ├── Black Market trigger → bottom sheet
  ├── Power-Ups trigger → bottom sheet
  └── End Turn button → Result sheet → Event sheet (40%) → next day

  ⋮ Menu → Resume / New Run / End Run
  Risk ≥ 95% → Game Over sheet
  Day 30 reached → Victory sheet
```

---

## 3. Game Systems

### 3.1 Economy Engine
```
priceMultiplier = 1 + (demand - supply) / demand * sensitivity
newPrice = basePrice * priceMultiplier * eventModifier
```
- Price Lock power-up freezes prices for N turns
- Shortage spike: 1.4x–2.2x
- Oversupply decay: 0.85x–0.95x

### 3.2 Risk Engine
```
risk += blackoutPenalty(priority, govSensitivity)
risk += blackMarketDealRisk
risk -= timeDecay(3/turn if clean)
risk -= complianceBonus
if (shieldActive) riskGain *= 0.5
if (lobbyUsed) risk -= 15 instantly
```
Thresholds: 0-29 Low → 30-54 Medium (audit events) → 55-74 High (fines) → 75-94 Critical → 95+ Game Over

### 3.3 Event Engine (10 events, expandable)

| Event | Severity | Effect |
|---|---|---|
| Heatwave | Critical | +40% demand in Lakeshore |
| Generator Failure | Warning | -30% supply for 2 turns |
| Government Audit | Danger | Risk sensitivity ×2 for 3 turns |
| Crypto Boom | Warning | +60% demand in Iron Basin |
| Grid Sabotage | Critical | Storage drained to 0 |
| Federal Subsidy | Good | -25% supply costs this turn |
| Cold Snap | Warning | +20% demand everywhere |
| Solar Surplus | Good | +40 MW bonus generation |
| Whistleblower | Danger | +10% risk immediately |
| Hospital Emergency | Critical | Northgate blackout = +25% risk |

**Selection:** Weighted random. Weights shift based on state:
- High demand → heatwave/cold snap more likely
- High risk → audit/whistleblower more likely
- Low money → subsidy/surplus more likely (mercy mechanic)

**Chaining:** Events can trigger follow-ups 1-2 turns later (e.g., Heatwave → Infrastructure Strain).

### 3.4 Power-Up System

| Power-Up | Cost | Duration | Effect |
|---|---|---|---|
| ⚡ Surge Capacity | $2,000 | 3 turns | +50 MW generation |
| 🛡️ Grid Shield | $1,800 | 2 turns | Risk gains halved |
| 📡 Market Intel | $1,200 | 1 turn | Preview next turn's demand shifts |
| 🤝 Lobbying | $2,500 | Instant | -15% risk immediately |
| 🔒 Price Lock | $1,500 | 2 turns | Freeze all region prices |
| 🔋 Emergency Reserve | $800 | Instant | Fill storage to max |

**Design principles:**
- Expensive enough that you can't spam them
- Each addresses a specific pain point (supply, risk, information, prices, storage)
- Instant vs duration creates different strategic weight
- Active power-ups shown as chips below the risk meter
- Toast notification on activation

**Future power-ups (unlockable via meta progression):**
- 🔧 Maintenance Crew — prevent next generator failure
- 📰 Media Blackout — suppress next whistleblower event  
- 💰 Insider Trading — double black market prices for 1 turn
- ⚖️ Regulatory Capture — +20% risk threshold for 3 turns

### 3.5 Streak System

**Supply Streak:** Consecutive turns where ALL regions are ≥ 85% supplied.

- Streak ×1–2: No bonus (building up)
- Streak ×3+: Cash bonus = streak × $200 per turn
- Streak ×5+: Bonus increases to streak × $350
- Streak ×10+: "GridLord" achievement unlocked

**Displayed:** 🔥 badge next to money in status bar. Streak bonus shown in turn results.

**Strategic tension:** Maintaining a streak means you can't starve any region, which conflicts with black market diversions and tight supply situations. Breaking a streak resets to 0.

### 3.6 Region Traits

Each region now has a flavour trait that hints at its mechanical personality:
- Northgate (Hospital): "High sensitivity — blackouts trigger major risk spikes"
- Iron Basin (Industrial): "Price volatile — responds sharply to supply changes"  
- Lakeshore (Residential): "Large population — unrest spreads fast"
- Crest Hill (Commercial): "Low maintenance — stable income source"

Traits visible in expanded region panel. Future: unlock new regions with unique traits.

---

## 4. Engagement Hooks

### 4.1 Short-Term (Within a Run)
- **Streak bonuses** — rewarding consistent full supply
- **Power-up timing** — when to spend money for tactical advantage
- **Event anticipation** — 40% chance each turn, can't predict which
- **Risk brinkmanship** — playing at high heat for black market profits
- **Turn-by-turn profit tracking** — seeing your money grow

### 4.2 Mid-Term (Across Runs)
- **Score chasing** — composite score factors profit, risk, streaks
- **Run history** — personal leaderboard of past attempts
- **Achievement system** — badges for specific milestones:
  - "Clean Hands" — complete a run with 0 black market deals
  - "GridLord" — maintain 10+ supply streak
  - "On the Edge" — survive 5+ turns above 75% risk
  - "Philanthropist" — never blackout a hospital
  - "Robber Baron" — earn $50k+ from black market in one run
  - "Perfect Grid" — all regions balanced for 20+ turns

### 4.3 Long-Term (Meta Progression)
- **Unlock new regions** with unique traits and mechanics
- **Unlock advanced power-ups** via achievements
- **Difficulty tiers** — Standard → Hard → Nightmare → Chaos
- **Scenario mode** — fixed seed runs with shared leaderboards
- **Weekly challenges** — "Survive with 50% less generation"

---

## 5. Game Lifecycle

### Starting
- Title screen → BEGIN → fresh state (day 1, $12,400, risk 34%)
- Future: "CONTINUE" if save exists, difficulty selector

### Mid-Run Controls
- ⋮ menu (top-left) → Resume / New Run / End Run
- New Run: confirm → reset to day 1
- End Run: confirm → title screen, run scored as incomplete

### Natural Endings
- **Game Over** (risk ≥ 95%) — Investigation sheet, score breakdown, New Run / Title
- **Victory** (day 30, risk < 95%) — Survived sheet, score with low-heat bonus, New Run / Title

### Scoring
```
score = totalProfit / 100
      + daysCompleted × 20
      + (victory ? (100 - finalRisk) × 10 : 0)
      + bestStreak × 50
```

### Auto-Save
- State serialised to localStorage after each turn
- Title screen detects save → "CONTINUE" button

---

## 6. Build Phases

### Phase 1 — Core Loop (2 weeks)
- Game state + turn engine
- Economy engine (price model)
- Dashboard with tap-to-expand regions
- Storage widget
- 4 regions, basic allocation

### Phase 2 — Risk, Events & Black Market (1.5 weeks)
- Risk engine + heat meter
- Event engine + 10 events
- Black market bottom sheet
- Turn result sheet
- Game over / victory conditions

### Phase 3 — Power-Ups & Engagement (1.5 weeks)
- Power-up system + shop sheet
- Streak tracking + bonuses
- Toast notification system
- Region traits
- Save/load

### Phase 4 — Polish & Launch (1 week)
- Animations (Framer Motion)
- Sound effects (Tone.js)
- PWA setup + service worker
- Scoring + run history
- Deploy to Vercel

### Phase 5 — Post-Launch (ongoing)
- Achievement system
- New regions + power-ups
- Difficulty tiers
- Scenario mode
- Multiplayer exploration

---

## 7. Visual Language

- **Background:** Near-black (#0D0D0D) with subtle CRT scanlines
- **Typography:** JetBrains Mono (data/UI), DM Sans (body text)
- **Palette:** Orange (#FF6B35) primary, Green (#00E5A0) positive, Red (#FF3B30) danger, Yellow (#FFD60A) warning, Purple (#8E8AFF) storage/utility
- **Cards:** Ultra-subtle borders (rgba white 5%), barely-there backgrounds
- **Animations:** Spring-eased slides, staggered entry, glint effects on risk bar
- **Sheets:** iOS-style bottom sheets with drag handle, backdrop blur
- **Toasts:** Slide-in from top with coloured left border, auto-dismiss

---

*This plan accompanies an interactive prototype (GridLord_Prototype.jsx) with all systems working: allocation, storage, black market, power-ups with 6 items, 10 events, streak tracking, pause menu, victory/game over, and toast notifications.*
