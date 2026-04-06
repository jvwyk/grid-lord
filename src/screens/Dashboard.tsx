import { useGameStore } from '@/stores/gameStore'
import { BLACK_MARKET_DEALS } from '@/data/blackMarket'
import StatusBar from '@/components/dashboard/StatusBar'
import RiskRow from '@/components/dashboard/RiskRow'
import GaugeRow from '@/components/dashboard/GaugeRow'
import RegionCard from '@/components/dashboard/RegionCard'
import StoragePanel from '@/components/dashboard/StoragePanel'
import BottomDock from '@/components/dashboard/BottomDock'
import Sheet from '@/components/shared/Sheet'
import BlackMarketSheet from '@/components/sheets/BlackMarketSheet'
import PowerUpSheet from '@/components/sheets/PowerUpSheet'
import ResultSheet from '@/components/sheets/ResultSheet'
import EventSheet from '@/components/sheets/EventSheet'
import MenuSheet from '@/components/sheets/MenuSheet'
import EndSheet from '@/components/sheets/EndSheet'

export default function Dashboard() {
  const regions = useGameStore((s) => s.regions)
  const activePowerups = useGameStore((s) => s.activePowerups)
  const selectedDeal = useGameStore((s) => s.selectedDeal)
  const sheet = useGameStore((s) => s.sheet)
  const menuOpen = useGameStore((s) => s.menuOpen)
  const setSheet = useGameStore((s) => s.setSheet)
  const setMenuOpen = useGameStore((s) => s.setMenuOpen)
  const nextDay = useGameStore((s) => s.nextDay)

  const bmDeal = selectedDeal ? BLACK_MARKET_DEALS.find((d) => d.id === selectedDeal) ?? null : null

  return (
    <div className="w-full flex justify-center min-h-screen" style={{ background: '#050505', fontFamily: 'var(--font-sans)' }}>
      <div
        className="w-full max-w-[430px] min-h-screen relative px-3.5 pt-3.5 pb-[130px]"
        style={{ background: '#0D0D0D', color: '#E0E0E0' }}
      >
        {/* Scanlines */}
        <div
          className="fixed inset-0 pointer-events-none z-50"
          style={{
            background:
              'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.015) 3px, rgba(0,0,0,0.015) 6px)',
          }}
        />

        <StatusBar />
        <RiskRow />

        {/* Active power-up chips */}
        {activePowerups.length > 0 && (
          <div className="flex gap-1.5 mb-2.5 flex-wrap">
            {activePowerups.map((p, i) => (
              <div
                key={i}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-sm"
                style={{ border: `1px solid ${p.color}40`, background: p.color + '10' }}
              >
                <span>{p.icon}</span>
                <span className="font-mono text-[10px] font-bold" style={{ color: p.color }}>
                  {p.turnsLeft}t
                </span>
              </div>
            ))}
          </div>
        )}

        <GaugeRow />
        <StoragePanel />

        {/* Regions */}
        <div className="flex justify-between items-center mb-2">
          <span className="font-mono text-[10px] tracking-[3px]" style={{ color: '#555' }}>REGIONS</span>
          <span className="text-[11px] italic" style={{ color: '#333' }}>tap to allocate</span>
        </div>
        <div className="flex flex-col gap-1.5 mb-3">
          {regions.map((r) => (
            <RegionCard key={r.id} regionId={r.id} />
          ))}
        </div>

        {/* Black Market trigger */}
        <button
          className="w-full flex items-center justify-between px-3.5 py-3.5 rounded-[10px] mb-2 text-left"
          style={{
            background: 'rgba(255,59,48,0.025)',
            border: `1px solid ${selectedDeal ? 'rgba(255,59,48,0.3)' : 'rgba(255,255,255,0.06)'}`,
          }}
          onClick={() => setSheet('blackmarket')}
        >
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🕳️</span>
            <div>
              <span className="block font-mono text-[13px] font-bold">Black Market</span>
              <span className="block text-[11px] mt-px" style={{ color: '#555' }}>
                {bmDeal ? `${bmDeal.buyer} — ${bmDeal.mw} MW` : 'No active deals'}
              </span>
            </div>
          </div>
          <span className="text-sm" style={{ color: '#444' }}>›</span>
        </button>

        {/* Power-ups trigger */}
        <button
          className="w-full flex items-center justify-between px-3.5 py-3.5 rounded-[10px] mb-3 text-left"
          style={{ background: 'rgba(255,214,10,0.025)', border: '1px solid rgba(255,214,10,0.08)' }}
          onClick={() => setSheet('powerups')}
        >
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🧰</span>
            <div>
              <span className="block font-mono text-[13px] font-bold">Power-Ups</span>
              <span className="block text-[11px] mt-px" style={{ color: '#555' }}>
                {activePowerups.length > 0 ? `${activePowerups.length} active` : 'Buy tactical advantages'}
              </span>
            </div>
          </div>
          <span className="text-sm" style={{ color: '#444' }}>›</span>
        </button>

        <BottomDock />

        {/* Sheets */}
        <Sheet open={menuOpen} onClose={() => setMenuOpen(false)}>
          <MenuSheet />
        </Sheet>

        <Sheet open={sheet === 'blackmarket'} onClose={() => setSheet(null)}>
          <BlackMarketSheet />
        </Sheet>

        <Sheet open={sheet === 'powerups'} onClose={() => setSheet(null)}>
          <PowerUpSheet />
        </Sheet>

        <Sheet open={sheet === 'result'} onClose={nextDay}>
          <ResultSheet />
        </Sheet>

        <Sheet open={sheet === 'event'} onClose={() => setSheet(null)}>
          <EventSheet />
        </Sheet>

        <Sheet open={sheet === 'gameover'} onClose={() => {}}>
          <EndSheet type="over" />
        </Sheet>

        <Sheet open={sheet === 'victory'} onClose={() => {}}>
          <EndSheet type="win" />
        </Sheet>
      </div>
    </div>
  )
}
