import { Link } from 'react-router-dom'
import { brand, features } from '../data/site'

export default function Featured() {
  return (
    <section className="mt-[70px] mb-[60px] overflow-hidden bg-white nav:mt-[125px]">
      <div className="mx-auto max-w-[1175px] px-[30px]">
        <h2 className="m-0 pb-[22px] text-center text-[32px] leading-9 font-bold text-black">Featured {brand.name} Services</h2>

        {features.map((f, i) => (
          <div key={f.image} className={`mb-14 flex flex-col items-center nav:mb-12 ${i % 2 ? 'nav:flex-row-reverse' : 'nav:flex-row'}`}>
            <div className="w-full shrink-0 text-center nav:w-[42%] nav:text-left">
              <h3 className="relative z-[5] mt-[26px] mb-[18px] inline-block px-[30px] py-6 text-[22px] leading-[26px] font-bold text-white after:absolute after:top-0 after:-left-[60px] after:-z-10 after:h-full after:w-[calc(100%+120px)] after:-skew-x-12 after:bg-navy after:content-[''] nav:mt-[30px] nav:p-[38px] nav:text-2xl nav:leading-7 nav:after:-left-[100px] nav:after:w-[650px]">
                {f.title[0]}
                {f.title[1] && (
                  <>
                    <br />
                    {f.title[1]}
                  </>
                )}
              </h3>
              <p className="mx-2.5 mt-4 mb-2.5 text-[14px] leading-[22px] text-[#333] nav:mx-[38px] nav:mt-5 nav:mb-[15px]">{f.text}</p>
              <Link
                to={f.cta.to}
                className="mt-3.5 inline-block max-w-[450px] min-w-[275px] rounded-[3px] border border-navy bg-navy px-5 py-2.5 text-center text-white transition-colors hover:bg-navy-dark nav:mt-[18px] nav:ml-[38px] nav:max-w-none"
              >
                {f.cta.label}
              </Link>
            </div>
            <div className="order-first w-full nav:order-none nav:w-[58%]">
              <img src={f.image} alt={f.alt} loading="lazy" className="mx-auto block aspect-[3/2] w-full max-w-[675px] object-cover" />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
