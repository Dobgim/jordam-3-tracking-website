import { Link } from 'react-router-dom'
import TrackForm from '../components/TrackForm'
import { brand, hero, tradeLanes } from '../data/site'

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-paper">
      {/* Photo with skewed navy panel */}
      <div className="relative flex w-full flex-col overflow-hidden nav:block nav:h-[400px]">
        <img src={hero.image} alt={`${brand.name} warehouse`} className="block h-[200px] w-full object-cover object-top nav:absolute nav:inset-0 nav:h-full" />
        <div className="relative z-[5] w-full px-6 pt-9 pb-10 text-center text-white before:absolute before:inset-0 before:-z-10 before:bg-navy before:content-[''] nav:absolute nav:top-[65px] nav:left-0 nav:w-[44%] nav:min-w-[340px] nav:pt-9 nav:pr-14 nav:pb-[26px] nav:pl-[4%] nav:text-left nav:before:right-auto nav:before:-left-[30%] nav:before:w-[130%] nav:before:-skew-x-12">
          <h1 className="mb-[18px] text-[32px] leading-9 font-bold text-white">{hero.title}</h1>
          <p className="mx-auto mb-6 max-w-[400px] text-[14px] leading-[22px] text-white nav:mx-0">{hero.text}</p>
          <div className="flex flex-wrap items-center justify-center gap-[15px] nav:justify-start">
            <Link to="/track" className="inline-flex items-center rounded-[3px] border border-white px-6 py-2.5 text-white transition-colors hover:bg-white hover:text-navy">
              Track a Shipment
            </Link>
            <Link to="/contact" className="inline-flex items-center py-2.5 text-white underline hover:text-[#cfe0f1]">
              Get a Quote
            </Link>
          </div>
        </div>
      </div>

      {/* Tracking search */}
      <div className="relative z-[2] px-10 pt-14">
        <div className="mx-auto flex max-w-[1175px] flex-col items-start">
          <TrackForm variant="hero" />
          <div className="mt-3.5 text-[13px] text-muted min-[601px]:text-[14px]">
            or{' '}
            <Link to="/contact" className="text-blue underline">
              request an instant freight quote &rarr;
            </Link>
          </div>
          <div className="mt-7 flex w-full flex-wrap items-baseline justify-between gap-x-3.5 gap-y-3 border-t border-line pt-3.5 pb-5 min-[601px]:justify-start min-[601px]:gap-4 min-[601px]:pt-2 md:mt-10 md:gap-10 md:pt-[18px] md:pb-[26px]">
            <div className="w-full text-[10px] font-bold tracking-[1.5px] text-muted min-[601px]:w-auto min-[601px]:text-[11px] min-[601px]:tracking-[2px]">
              MOVING FREIGHT ACROSS MAJOR TRADE LANES
            </div>
            {tradeLanes.map((city) => (
              <div key={city} className="text-[11px] font-bold tracking-[0.3px] text-lane min-[601px]:text-[14px] min-[601px]:tracking-[0.5px]">
                {city}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export function PickupAlert() {
  return (
    <div className="mx-auto my-6 box-content max-w-[1175px] px-10 min-[601px]:mt-[60px] min-[601px]:mb-5 min-[1255px]:px-0">
      <p className="m-0 flex items-center gap-[18px] border-l-[15px] border-alert-edge bg-alert px-4 py-[18px] text-left text-[14px] leading-[22px] text-[#333] min-[601px]:gap-[34px] min-[601px]:px-[30px] min-[601px]:py-5">
        <Postmark />
        <span>
          <strong>Scheduled Pickups:</strong> If you want your freight collected the same day, book your pickup before 12 PM local time and our dispatch team will
          route a driver to you at no extra charge.{' '}
          <Link to="/services" className="text-blue underline hover:text-navy">
            Learn more
          </Link>
        </span>
      </p>
    </div>
  )
}

function Postmark() {
  const ink = '#1a1a1a'
  return (
    <svg className="size-[78px] shrink-0 -rotate-8 min-[601px]:size-24" viewBox="0 0 120 120" aria-hidden="true">
      <defs>
        <path id="pmArcTop" d="M 18 60 A 42 42 0 0 1 102 60" />
        <path id="pmArcBot" d="M 14 60 A 46 46 0 0 0 106 60" />
      </defs>
      <circle cx="60" cy="60" r="54" fill="none" stroke={ink} strokeWidth="2.5" strokeDasharray="10 5" />
      <text fontFamily="Inter, Arial, sans-serif" fontSize="13" fontWeight="700" letterSpacing="2" fill={ink}>
        <textPath href="#pmArcTop" startOffset="50%" textAnchor="middle">
          {brand.name.toUpperCase()}
        </textPath>
      </text>
      <text x="60" y="57" textAnchor="middle" fontFamily="Inter, Arial, sans-serif" fontSize="15" fontWeight="700" fill={ink}>
        DISPATCH
      </text>
      <text x="60" y="76" textAnchor="middle" fontFamily="Inter, Arial, sans-serif" fontSize="11" fontWeight="600" fill={ink}>
        SAME DAY
      </text>
      <text fontFamily="Inter, Arial, sans-serif" fontSize="10" fontWeight="600" letterSpacing="3" fill={ink}>
        <textPath href="#pmArcBot" startOffset="50%" textAnchor="middle">
          USA
        </textPath>
      </text>
    </svg>
  )
}
