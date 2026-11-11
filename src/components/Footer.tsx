import { Link } from 'react-router-dom'
import { brand, footerColumns } from '../data/site'
import { FacebookIcon, InstagramIcon, LinkedInIcon, XIcon } from './Icons'

const social = [
  { label: 'Facebook', Icon: FacebookIcon },
  { label: 'Instagram', Icon: InstagramIcon },
  { label: 'X', Icon: XIcon },
  { label: 'LinkedIn', Icon: LinkedInIcon },
]

const YEAR = new Date().getFullYear()

const heading ='mb-2.5 text-[13px] leading-[22px] font-bold text-navy uppercase'
const item = 'text-[14px] leading-[25px] text-ink'

export default function Footer() {
  return (
    <footer className="border-t border-[#dadada] bg-paper px-5 pt-[30px] pb-[35px]">
      <div className="mx-auto max-w-[1240px]">
        <div className="pt-3.5">
          <Link to="/" className="inline-block">
            <img src={brand.logo} alt={brand.name} className="-ml-1.5 block h-11 w-auto" />
          </Link>
        </div>

        <div className="mt-3.5 grid grid-cols-2 gap-6 md:grid-cols-4">
          {footerColumns.map((col) => (
            <div key={col.title}>
              <div className={heading}>{col.title}</div>
              <ul>
                {col.links.map((l) => (
                  <li key={typeof l === 'string' ? l : l.label}>
                    {typeof l === 'string' ? (
                      <span className={item}>{l}</span>
                    ) : (
                      <Link to={l.to} className={`${item} hover:underline`}>
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <div className={heading}>Contact</div>
            <ul>
              <li>
                <a href={`mailto:${brand.email}`} className={`${item} hover:underline`}>
                  {brand.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-11 text-[13px] text-ink">
          Copyright &copy; {YEAR} {brand.name}. All Rights Reserved. &nbsp;&middot;&nbsp; Developed by {brand.name}
        </div>
        <div className="mt-5 flex gap-3.5 border-t border-[#dadada] pt-[22px]">
          {social.map(({ label, Icon }) => (
            <a key={label} href="#" aria-label={label} className="inline-flex">
              <Icon width={22} height={22} />
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
