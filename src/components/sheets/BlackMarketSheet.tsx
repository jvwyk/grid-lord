import { useGameStore } from '@/stores/gameStore'
import { BLACK_MARKET_DEALS } from '@/data/blackMarket'
import { fmt } from '@/utils/format'

export default function BlackMarketSheet() {
  const selectedDeal = useGameStore((s) => s.selectedDeal)
  const selectDeal = useGameStore((s) => s.selectDeal)
  const setSheet = useGameStore((s) => s.setSheet)

  return (
    <div className="px-5 py-5 pb-8">
      <div className="flex justify-between items-center mb-3.5">
        <span className="font-mono text-base font-bold tracking-[2px]" style={{ color: '#FF3B30' }}>
          Black Market
        </span>
        <button
          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
          style={{ background: 'rgba(255,255,255,0.05)', color: '#555' }}
          onClick={() => setSheet(null)}
        >
          ✕
        </button>
      </div>

      <div
        className="flex gap-2 items-center px-3 py-2 rounded-md text-xs mb-3.5"
        style={{ background: 'rgba(255,59,48,0.04)', border: '1px solid rgba(255,59,48,0.08)', color: '#888' }}
      >
        <span>⚠</span>
        <span>Off-grid deals increase heat.</span>
      </div>

      {BLACK_MARKET_DEALS.map((d) => {
        const active = selectedDeal === d.id
        return (
          <button
            key={d.id}
            className="block w-full px-3.5 py-3.5 rounded-lg mb-2 text-left transition-all duration-150"
            style={{
              border: `1px solid ${active ? '#FF3B30' : 'rgba(255,255,255,0.06)'}`,
              background: active ? 'rgba(255,59,48,0.06)' : 'rgba(255,255,255,0.02)',
            }}
            onClick={() => selectDeal(d.id)}
          >
            <div className="flex justify-between items-start mb-1.5">
              <div>
                <div className="font-mono text-[13px] font-bold text-white">{d.buyer}</div>
                <div className="text-xs mt-0.5 leading-relaxed" style={{ color: '#666' }}>{d.desc}</div>
              </div>
              <span
                className="font-mono text-[8px] font-bold px-1.5 py-0.5 rounded tracking-[1.5px] whitespace-nowrap"
                style={{ background: 'rgba(255,214,10,0.06)', color: '#FFD60A' }}
              >
                {d.tag}
              </span>
            </div>
            <div className="flex justify-between font-mono text-[11px] mt-2" style={{ color: '#555' }}>
              <span><b className="text-white">{d.mw}</b> MW</span>
              <span><b style={{ color: '#FFD60A' }}>${d.price}</b>/MW</span>
              <span style={{ color: '#FF3B30' }}>+{d.risk}%</span>
              <span style={{ color: '#00E5A0' }}>${fmt(d.mw * d.price)}</span>
            </div>
            {active && (
              <div className="font-mono text-[10px] font-bold text-center mt-1.5 tracking-[2px]" style={{ color: '#FF3B30' }}>
                ✓ Selected
              </div>
            )}
          </button>
        )
      })}

      <button
        className="w-full py-4 rounded-lg font-mono text-[13px] font-bold tracking-[2px] text-center mt-4"
        style={{
          background: selectedDeal
            ? 'linear-gradient(135deg, #FF3B30, #CC2200)'
            : '#222',
          color: selectedDeal ? '#FFF' : '#555',
        }}
        onClick={() => setSheet(null)}
      >
        {selectedDeal ? 'CONFIRM DEAL' : 'CLOSE'}
      </button>
    </div>
  )
}
