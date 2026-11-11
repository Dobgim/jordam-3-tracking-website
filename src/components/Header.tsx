import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { brand, mainNav } from '../data/site'
import { GlobeIcon, HamburgerIcon, HeadsetIcon, PinIcon, RunnerIcon, SearchIcon } from './Icons'

const utility = [
  { label: 'English', to: '#', Icon: GlobeIcon },
  { label: 'Locations', to: '/contact', Icon: PinIcon },
  { label: 'Support', to: '/contact', Icon: HeadsetIcon },
  { label: 'Track Shipment', to: '/track', Icon: RunnerIcon },
]

/** Skewed grey parallelogram shown behind a nav item on hover / when active. */
const skewHover =
  "before:absolute before:inset-0 before:-z-10 before:origin-[0_35%] before:-skew-x-12 before:content-[''] before:bg-[#ededed] before:opacity-0 hover:before:opacity-100 focus-visible:before:opacity-100"

export default function Header() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const [lastPath, setLastPath] = useState(pathname)

  // Close the drawer whenever the route changes.
  if (pathname !== lastPath) {
    setLastPath(pathname)
    setOpen(false)
  }

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header className="bg-white pb-0 nav:pb-5">
      {/* Utility bar */}
      <div className="hidden h-[38px] items-center justify-end px-12 nav:flex">
        <ul className="flex items-center gap-[38px]">
          {utility.map(({ label, to, Icon }) => (
            <li key={label}>
              <Link to={to} className="flex items-center gap-1.5 text-[10px] leading-[10.5px] font-bold whitespace-nowrap text-[#575757] hover:text-navy">
                <Icon className="size-[18px] shrink-0" />
                {label}
              </Link>
            </li>
          ))}
          <li>
            <Link to="/login" className="text-[10px] leading-[10.5px] font-bold whitespace-nowrap text-[#575757] hover:text-navy">
              Register / Sign In
            </Link>
          </li>
        </ul>
      </div>

      {/* Main nav */}
      <div className="flex items-center justify-between py-2 nav:items-end nav:justify-start nav:py-0">
        <Link to="/" className="ml-4 flex shrink-0 items-center nav:ml-[3%] nav:pr-7">
          <img src={brand.logo} alt={brand.name} className="block h-11 w-auto nav:h-[52px]" />
        </Link>

        <button type="button" aria-label="Menu" onClick={() => setOpen(true)} className="flex items-center justify-center px-4 py-2 nav:hidden">
          <HamburgerIcon />
        </button>

        <nav aria-label="Main" className="relative hidden flex-1 bg-line nav:block">
          <ul className="flex w-full whitespace-nowrap">
            <li className="w-[15%]">
              <Link
                to="/track"
                className="group relative z-[6] block h-[43px] py-[14px] pr-5 pl-[14px] text-center text-[14px] leading-[15px] font-bold text-white hover:text-navy before:absolute before:inset-0 before:-z-10 before:-ml-[5px] before:origin-[0_35%] before:-skew-x-12 before:bg-navy before:content-[''] hover:before:bg-[#ededed] after:absolute after:top-0 after:right-[3px] after:-z-10 after:h-full after:w-[5px] after:origin-[0_35%] after:-skew-x-12 after:bg-red after:content-['']"
              >
                Quick Track
              </Link>
            </li>
            {mainNav.map((item, i) => (
              <li key={item.label} className="w-[15%]">
                <NavLink
                  to={item.to}
                  end
                  className={({ isActive }) =>
                    `relative z-[5] block h-[43px] p-[14px] text-center text-[14px] leading-[15px] font-bold text-navy ${skewHover} ${i === 0 ? 'before:-left-[6px]' : ''} ${isActive ? 'before:opacity-100' : ''}`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
            <li className="w-[4%] min-w-[50px]">
              <Link to="/track" aria-label="Search" className={`relative z-[5] flex h-[43px] items-center justify-center px-[14px] ${skewHover}`}>
                <SearchIcon className="block size-[22px]" />
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Mobile drawer */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-[100000] bg-black/50 transition-[opacity,visibility] duration-250 nav:hidden ${open ? 'visible opacity-100' : 'invisible opacity-0'}`}
      />
      <aside
        aria-hidden={!open}
        className={`fixed inset-y-0 right-0 z-[100001] flex w-[82%] max-w-[320px] flex-col bg-white shadow-[-8px_0_30px_rgba(0,0,0,0.2)] transition-transform duration-[280ms] ease-[cubic-bezier(0.23,1,0.32,1)] nav:hidden ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between border-b-[3px] border-red bg-navy px-[18px] py-3.5">
          <Link to="/">
            <img src={brand.logo} alt={brand.name} className="block h-[34px] w-auto rounded-[3px] bg-white px-2 py-1" />
          </Link>
          <button type="button" aria-label="Close menu" onClick={() => setOpen(false)} className="px-1 text-[30px] leading-none text-white">
            &times;
          </button>
        </div>
        <nav className="flex flex-col py-2">
          <Link to="/track" className="border-b border-[#003A69] bg-navy px-5 py-[15px] text-base font-bold text-white">
            Quick Track
          </Link>
          {mainNav.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end
              className={({ isActive }) =>
                `border-b border-[#ececec] py-[15px] text-base font-bold text-navy ${isActive ? 'border-l-4 border-l-red bg-paper pl-4' : 'px-5'} pr-5`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto border-t border-line bg-paper px-5 py-[18px]">
          <div className="mb-2 text-[11px] font-bold tracking-[1px] text-muted uppercase">Support</div>
          <a href={`mailto:${brand.email}`} className="block py-[3px] text-sm text-blue">
            {brand.email}
          </a>
        </div>
      </aside>
    </header>
  )
}
