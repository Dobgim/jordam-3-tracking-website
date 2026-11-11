import type { ReactNode } from 'react'

/** Photo banner with the skewed navy title panel, used on inner pages. */
export default function PageBanner({ image, title, children }: { image: string; title: string; children?: ReactNode }) {
  return (
    <div className="relative flex w-full flex-col overflow-hidden nav:block nav:h-[260px]">
      <img src={image} alt="" className="block h-[160px] w-full object-cover nav:absolute nav:inset-0 nav:h-full" />
      <div className="relative z-[5] w-full px-6 pt-8 pb-9 text-center text-white before:absolute before:inset-0 before:-z-10 before:bg-navy before:content-[''] nav:absolute nav:top-[55px] nav:left-0 nav:w-[44%] nav:min-w-[340px] nav:pt-9 nav:pr-14 nav:pb-[30px] nav:pl-[4%] nav:text-left nav:before:right-auto nav:before:-left-[30%] nav:before:w-[130%] nav:before:-skew-x-12">
        <h1 className="mb-3 text-[28px] leading-[34px] font-bold text-white nav:text-[32px] nav:leading-9">{title}</h1>
        {children && <p className="mx-auto max-w-[400px] text-[14px] leading-[22px] text-white nav:mx-0">{children}</p>}
      </div>
    </div>
  )
}
