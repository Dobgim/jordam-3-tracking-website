import type { CSSProperties } from 'react'
import { tickerCities } from '../data/site'

const d = (delay: number, dur?: number) => ({ '--delay': `${delay}ms`, ...(dur ? { '--d': `${dur}s` } : {}) }) as CSSProperties

const routes = [
  { id: 'gn-rm', d: 'M 130 160 Q 280 80 430 138', stroke: '#005EA2', w: 1.8, dash: '7 5', op: 0.75, delay: 700, dur: 1.9 },
  { d: 'M 430 138 Q 580 68 700 118', stroke: '#005EA2', w: 1.8, dash: '7 5', op: 0.75, delay: 1050, dur: 1.9 },
  { d: 'M 130 160 Q 265 228 400 222', stroke: 'rgba(0,75,135,.18)', w: 1.4, dash: '5 6', delay: 1200, dur: 1.7 },
  { d: 'M 400 222 Q 530 255 660 230', stroke: 'rgba(0,75,135,.18)', w: 1.4, dash: '5 6', delay: 1500, dur: 1.7 },
  { d: 'M 430 138 Q 530 182 660 230', stroke: '#005EA2', w: 1.4, dash: '5 6', op: 0.38, delay: 1750, dur: 1.5 },
  { d: 'M 660 230 Q 755 178 790 128', stroke: 'rgba(0,75,135,.15)', w: 1.4, dash: '5 6', delay: 2050, dur: 1.5 },
]

const hubs = [
  { x: 130, y: 160, name: 'CHICAGO', ly: 143, major: true, dot: 800, ring: 1200 },
  { x: 430, y: 138, name: 'LONDON', ly: 122, major: true, dot: 2500, ring: 2900 },
  { x: 700, y: 118, name: 'DUBAI', ly: 102, major: true, dot: 2900, ring: 3300 },
  { x: 400, y: 222, name: 'NAIROBI', ly: 240, major: false, dot: 2800, ring: 3200 },
  { x: 660, y: 230, name: 'SINGAPORE', ly: 248, major: true, dot: 3150, ring: 3600 },
  { x: 790, y: 128, name: 'TOKYO', ly: 114, major: false, dot: 3500 },
]

export default function Network() {
  return (
    <section className="bg-paper">
      <div className="overflow-hidden px-5 pt-12 pb-10 min-[641px]:px-10 min-[641px]:pb-6">
        <div className="mb-7 text-center">
          <h2 className="mb-2 animate-fade-up text-[32px] leading-9 font-bold text-black [animation-delay:360ms]">Connected Across Every Continent</h2>
          <p className="mt-3 mb-[15px] animate-fade-up text-[14px] leading-[22px] text-muted [animation-delay:520ms]">
            One contract covers every trade lane and every mode of transport.
          </p>
        </div>
        <div className="mx-auto max-w-[860px]">
          <svg viewBox="0 0 860 300" className="block h-auto w-full" role="img" aria-label="Route map linking Chicago, London, Dubai, Nairobi, Singapore and Tokyo">
            {routes.map((r) => (
              <path
                key={r.d}
                id={r.id}
                className="gn-route"
                style={d(r.delay, r.dur)}
                d={r.d}
                fill="none"
                stroke={r.stroke}
                strokeWidth={r.w}
                strokeDasharray={r.dash}
                opacity={r.op}
              />
            ))}
            {hubs
              .filter((h) => h.ring)
              .map((h) => (
                <circle
                  key={`ring-${h.name}`}
                  className="gn-ring"
                  style={d(h.ring!)}
                  cx={h.x}
                  cy={h.y}
                  r={h.major ? 14 : 12}
                  fill="none"
                  stroke={h.major ? '#005EA2' : 'rgba(0,75,135,.35)'}
                  strokeWidth={h.major ? 1.5 : 1.2}
                />
              ))}
            {hubs.map((h) => (
              <g key={`dot-${h.name}`} className="gn-dot" style={d(h.dot)}>
                <circle cx={h.x} cy={h.y} r={h.major ? 7 : 5.5} fill={h.major ? '#005EA2' : 'rgba(0,75,135,.3)'} />
                <circle cx={h.x} cy={h.y} r={h.major ? 3.5 : 2.5} fill="#fff" />
              </g>
            ))}
            {hubs.map((h) => (
              <text
                key={`lbl-${h.name}`}
                x={h.x}
                y={h.ly}
                textAnchor="middle"
                fontFamily="Inter, Arial, sans-serif"
                fontSize={h.major ? 9 : 8.5}
                fill={h.major ? '#005EA2' : '#94a3b8'}
                letterSpacing={h.major ? 1.2 : 1}
                fontWeight={h.major ? 700 : 400}
              >
                {h.name}
              </text>
            ))}
            <circle r="3.5" fill="#004B87" opacity=".85">
              <animateMotion dur="3.2s" repeatCount="indefinite" begin="3.8s" rotate="auto">
                <mpath href="#gn-rm" />
              </animateMotion>
            </circle>
            <circle r="7" fill="rgba(0,75,135,.12)">
              <animateMotion dur="3.2s" repeatCount="indefinite" begin="3.8s" rotate="auto">
                <mpath href="#gn-rm" />
              </animateMotion>
            </circle>
          </svg>
        </div>
      </div>

      {/* City ticker */}
      <div className="relative overflow-hidden border-y border-line bg-white py-4 [mask-image:linear-gradient(90deg,transparent_0,#000_60px,#000_calc(100%-60px),transparent_100%)]">
        <div className="flex w-max animate-city-scroll items-center gap-[60px]">
          {[...tickerCities, ...tickerCities].map(([city, country], i) => (
            <span key={i} aria-hidden={i >= tickerCities.length} className="text-[11px] font-bold tracking-[2px] whitespace-nowrap text-navy">
              <span className="mr-2 text-blue">&#9679;</span>
              {city} <span className="text-[10px] font-normal text-[#94a3b8]">{country}</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
