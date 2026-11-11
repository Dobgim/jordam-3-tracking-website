import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { brand } from '../data/site'
import { BoxIcon } from './Icons'

interface Props {
  variant: 'hero' | 'widget'
  initial?: string
  onSubmitted?: () => void
}

/** Tracking-number search. Sends the visitor to /track?code=… */
export default function TrackForm({ variant, initial = '', onSubmitted }: Props) {
  const [code, setCode] = useState(initial)
  const navigate = useNavigate()

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const value = code.trim()
    if (!value) return
    navigate(`/track?code=${encodeURIComponent(value)}`)
    onSubmitted?.()
  }

  if (variant === 'widget') {
    return (
      <form onSubmit={submit} className="m-0 flex border-b border-line">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter a tracking number"
          autoComplete="off"
          required
          className="min-w-0 flex-1 border-0 bg-paper px-3.5 py-[13px] text-[13px] text-[#333] outline-0 placeholder:text-[#757575]"
        />
        <button type="submit" className="bg-navy px-[18px] text-xs font-bold text-white hover:bg-navy-dark">
          TRACK
        </button>
      </form>
    )
  }

  return (
    <form
      onSubmit={submit}
      className="flex w-full max-w-[760px] flex-wrap items-center overflow-hidden rounded border border-muted bg-white md:flex-nowrap md:items-stretch"
    >
      <span className="flex shrink-0 items-center self-center pr-0.5 pl-3 text-navy md:pr-1 md:pl-4">
        <BoxIcon width={20} height={20} />
      </span>
      <input
        type="text"
        name="tracking_code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder={`Search ${brand.name} or Enter Tracking Number(s)`}
        autoComplete="off"
        required
        className="min-w-0 flex-1 border-0 px-2 py-3.5 text-[14px] text-[#333] outline-0 placeholder:text-xs placeholder:tracking-[-0.2px] placeholder:text-[#757575] min-[601px]:px-2.5 min-[601px]:py-4 min-[601px]:text-base min-[601px]:placeholder:text-base min-[601px]:placeholder:tracking-normal"
      />
      <button
        type="submit"
        className="w-full basis-full bg-navy p-3.5 text-[14px] font-bold tracking-[0.3px] text-white transition-[background,transform] hover:bg-navy-dark active:scale-[0.97] min-[601px]:p-4 md:w-auto md:basis-auto md:px-7 md:py-0"
      >
        TRACK NOW
      </button>
    </form>
  )
}
