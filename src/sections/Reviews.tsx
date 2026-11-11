import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronIcon, GoogleG } from '../components/Icons'
import { reviewSummary, reviews, type Review } from '../data/site'

const GOOGLE_COLORS = ['#4285F4', '#EA4335', '#FBBC05', '#4285F4', '#34A853', '#EA4335']

/** "oogle" in Google's letter colours, following the G mark. */
function GoogleWord({ className }: { className: string }) {
  return (
    <span className={className}>
      {'oogle'.split('').map((ch, i) => (
        <span key={i} style={{ color: GOOGLE_COLORS[i] }}>
          {ch}
        </span>
      ))}
    </span>
  )
}

function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating)
  const half = rating % 1 !== 0
  const empty = 5 - full - (half ? 1 : 0)
  return (
    <div className="mt-[3px] flex items-center gap-px text-xs" aria-label={`${rating} out of 5 stars`}>
      <span className="text-star">{'★'.repeat(full)}</span>
      {half && (
        <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true">
          <defs>
            <linearGradient id="halfStar">
              <stop offset="50%" stopColor="#F4B400" />
              <stop offset="50%" stopColor="#d1d8e4" />
            </linearGradient>
          </defs>
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill="url(#halfStar)" />
        </svg>
      )}
      {empty > 0 && <span className="text-[#d1d8e4]">{'☆'.repeat(empty)}</span>}
    </div>
  )
}

function Card({ r }: { r: Review }) {
  return (
    <div className="flex max-w-full min-w-full shrink-0 flex-col gap-3.5 rounded-[10px] bg-white p-6 min-[769px]:max-w-[calc(50%-8px)] min-[769px]:min-w-[calc(50%-8px)] min-[1025px]:max-w-[calc(33.333%-11px)] min-[1025px]:min-w-[calc(33.333%-11px)]">
      <div className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white" style={{ background: r.color }}>
          {r.initials}
        </div>
        <div>
          <div className="text-[14px] font-bold text-[#1e293b]">{r.name}</div>
          <Stars rating={r.rating} />
        </div>
      </div>
      <div className="flex-1 text-[13px] leading-[1.8] text-[#475569]">{r.text}</div>
      <div className="flex items-center gap-2 border-t border-[#f1f5f9] pt-3">
        <div className="flex items-center gap-[3px]">
          <GoogleG width={14} height={14} />
          <GoogleWord className="font-[Arial,sans-serif] text-[13px] leading-none" />
        </div>
      </div>
    </div>
  )
}

const perPageFor = (w: number) => (w <= 768 ? 1 : w <= 1024 ? 2 : 3)

export default function Reviews() {
  const trackRef = useRef<HTMLDivElement>(null)
  const [perPage, setPerPage] = useState(() => perPageFor(window.innerWidth))
  const [page, setPage] = useState(0)
  const [offset, setOffset] = useState(0)
  const [paused, setPaused] = useState(false)
  const [resumeAt, setResumeAt] = useState(0)
  const pages = Math.ceil(reviews.length / perPage)

  // Recompute pixel offset whenever page or layout changes.
  const measure = useCallback(() => {
    const card = trackRef.current?.firstElementChild as HTMLElement | null
    if (card) setOffset(page * perPage * (card.offsetWidth + 16))
  }, [page, perPage])
  useEffect(measure, [measure])

  useEffect(() => {
    const onResize = () => {
      setPerPage(perPageFor(window.innerWidth))
      setPage(0)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Auto-play every 2s; pauses on hover/touch and for 4s after manual navigation.
  useEffect(() => {
    if (paused) return
    const wait = Math.max(0, resumeAt - Date.now())
    let interval: number | undefined
    const timeout = window.setTimeout(() => {
      interval = window.setInterval(() => setPage((p) => (p + 1 < pages ? p + 1 : 0)), 2000)
    }, wait)
    return () => {
      clearTimeout(timeout)
      clearInterval(interval)
    }
  }, [paused, pages, resumeAt])

  const goTo = (p: number) => {
    setPage(Math.max(0, Math.min(p, pages - 1)))
    setResumeAt(Date.now() + 4000)
  }

  return (
    <div className="bg-reviews py-[72px]">
      <div className="mx-auto max-w-[1200px] px-8">
        <div className="mb-10 grid grid-cols-1 items-end gap-10 min-[901px]:grid-cols-[1fr_auto]">
          <div>
            <div className="mb-3 text-[9px] font-bold tracking-[3.5px] text-blue">CLIENT REVIEWS</div>
            <h2 className="mb-3.5 text-[32px] leading-9 font-bold text-navy">
              Trusted By Businesses <em className="text-blue not-italic">Worldwide.</em>
            </h2>
            <p className="m-0 max-w-[480px] text-[14px] leading-[22px] text-[#64748b]">
              Over 200 verified reviews from global clients who depend on us to move what matters most, on time, every time.
            </p>
          </div>
          <div className="flex flex-col items-start gap-1">
            <div className="flex items-center gap-1.5">
              <GoogleG width={36} height={36} />
              <GoogleWord className="font-[Arial,sans-serif] text-[28px] leading-none" />
            </div>
            <div className="mt-0.5 flex items-center gap-2">
              <div className="font-[Arial,sans-serif] text-[14px] text-[#5f6368]">Reviews</div>
              <div className="text-base tracking-[1px] text-star">★★★★★</div>
            </div>
          </div>
        </div>

        <div
          className="relative overflow-hidden"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={() => setPaused(true)}
          onTouchEnd={() => {
            setResumeAt(Date.now() + 1200)
            setPaused(false)
          }}
        >
          <div
            ref={trackRef}
            className="flex gap-4 transition-transform duration-[400ms] ease-[cubic-bezier(0.25,1,0.5,1)] will-change-transform"
            style={{ transform: `translateX(-${offset}px)` }}
          >
            {reviews.map((r) => (
              <Card key={r.name} r={r} />
            ))}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <div className="hidden gap-1.5 min-[769px]:flex">
            {Array.from({ length: pages }, (_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to reviews page ${i + 1}`}
                onClick={() => goTo(i)}
                className={`size-[7px] rounded-full transition-colors ${i === page ? 'bg-blue' : 'bg-[#d1d8e4]'}`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            {(['left', 'right'] as const).map((dir) => (
              <button
                key={dir}
                type="button"
                aria-label={dir === 'left' ? 'Previous' : 'Next'}
                onClick={() => goTo(page + (dir === 'left' ? -1 : 1))}
                className="flex size-9 items-center justify-center rounded-full border-2 border-[#e0e8f0] bg-white text-navy transition-all duration-[180ms] hover:border-navy hover:bg-navy hover:text-white"
              >
                <ChevronIcon dir={dir} />
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-[10px] bg-navy px-6 py-3.5">
          <div className="text-[10px] tracking-[1.5px] text-white/50">{reviewSummary.count} VERIFIED CLIENT REVIEWS</div>
          <div className="flex items-center gap-2.5">
            <div className="text-[13px] tracking-[2px] text-blue">★★★★★</div>
            <div className="text-base font-black text-white">
              {reviewSummary.score} <span className="text-[10px] font-normal text-white/40">/ 5</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
