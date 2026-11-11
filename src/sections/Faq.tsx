import { Link } from 'react-router-dom'
import { brand, faqs } from '../data/site'

function Item({ q, a, open }: { q: string; a: string; open?: boolean }) {
  return (
    <details
      open={open}
      className="faq-item overflow-hidden rounded border border-line bg-white transition-[box-shadow,transform] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] [@media(hover:hover)]:hover:-translate-y-0.5 [@media(hover:hover)]:hover:shadow-[0_8px_24px_rgba(0,75,135,0.08)]"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-[18px] text-base font-bold text-navy">
        {q}
        <span className="faq-chevron mb-1 size-2.5 shrink-0 border-r-2 border-b-2 border-blue transition-transform duration-250" />
      </summary>
      <div className="border-t border-line px-5 pt-3.5 pb-[18px] text-base leading-[22px] text-[#333]">{a}</div>
    </details>
  )
}

export default function Faq() {
  const half = Math.ceil(faqs.length / 2)
  const cols = [faqs.slice(0, half), faqs.slice(half)]

  return (
    <section id="faq" className="scroll-mt-4 bg-paper py-[60px]">
      <div className="mx-auto w-full max-w-[1250px] px-[15px]">
        <div className="mb-8 text-center">
          <h2 className="mb-3 text-[32px] leading-9 font-bold text-black">Frequently Asked Questions</h2>
          <p className="mx-auto max-w-[520px] text-base leading-[22px] text-muted">Everything you need to know about shipping with {brand.name}.</p>
        </div>
        <div className="flex flex-col items-start gap-3 md:flex-row">
          {cols.map((col, c) => (
            <div key={c} className="flex w-full min-w-0 flex-1 flex-col gap-3">
              {col.map((f, i) => (
                <Item key={f.q} q={f.q} a={f.a} open={c === 0 && i === 0} />
              ))}
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded bg-navy px-7 py-[22px]">
          <div className="text-base font-bold text-white">Still have questions? Talk to our team directly.</div>
          <Link
            to="/contact"
            className="rounded-[3px] border border-white px-6 py-2.5 whitespace-nowrap text-white transition-[background,transform] hover:-translate-y-0.5 hover:bg-white/15"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </section>
  )
}
