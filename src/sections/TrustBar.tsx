import { TrustIcon } from '../components/Icons'
import { trustItems } from '../data/site'

export default function TrustBar() {
  return (
    <div className="overflow-hidden bg-navy">
      <div className="mx-auto grid max-w-[1175px] grid-cols-1 min-[901px]:grid-cols-[300px_1fr]">
        <div className="relative z-[1] flex flex-col justify-center px-6 py-5 before:absolute before:inset-0 before:-z-10 before:bg-red before:content-[''] min-[901px]:py-[30px] min-[901px]:pr-11 min-[901px]:pl-2.5 min-[901px]:before:right-auto min-[901px]:before:-left-[60%] min-[901px]:before:w-[158%] min-[901px]:before:-skew-x-12">
          <div className="text-xl leading-[26px] font-bold text-white">
            Licensed, Bonded
            <br />
            &amp; Insured.
          </div>
        </div>
        <div className="grid grid-cols-2 min-[901px]:grid-cols-4">
          {trustItems.map((t, i) => (
            <div key={t.name} className={`flex flex-col justify-center px-7 py-[26px] ${i % 2 ? 'border-l border-white/15' : ''} ${i === 2 ? 'min-[901px]:border-l min-[901px]:border-white/15' : ''}`}>
              <TrustIcon name={t.icon} className="mb-2" />
              <div className="mb-[3px] text-[13px] font-bold text-white">{t.name}</div>
              <div className="text-xs text-white/65">{t.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
