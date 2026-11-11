import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import PageBanner from '../components/PageBanner'
import { brand } from '../data/site'
import Faq from '../sections/Faq'
import Featured from '../sections/Featured'
import Network from '../sections/Network'
import TrustBar from '../sections/TrustBar'

const useTitle = (t: string) =>
  useEffect(() => {
    document.title = `${t} | ${brand.name}`
  }, [t])

export function About() {
  useTitle('About')
  return (
    <>
      <PageBanner image="/img/img-about-freight.jpg" title={`About ${brand.name}`}>
        One team moving freight by air, ocean and road, from booking to final delivery.
      </PageBanner>
      <Featured />
      <TrustBar />
      <Network />
    </>
  )
}

export function Services() {
  useTitle('Services')
  return (
    <>
      <PageBanner image="/img/img-svc-ocean.jpg" title="Our Services">
        Air, ocean and road freight, warehousing and same-day pickups under one contract.
      </PageBanner>
      <Featured />
      <Faq />
    </>
  )
}

export function SignIn() {
  useTitle('Register / Sign In')
  return (
    <>
      <PageBanner image="/img/hero-warehouse.jpg" title="Register / Sign In" />
      <section className="bg-paper px-5 py-16 text-center">
        <p className="mx-auto mb-6 max-w-[520px] text-base leading-[22px] text-muted">
          Customer accounts are set up by our support team. Get in touch and we will create your account.
        </p>
        <Link to="/contact" className="inline-block min-w-[275px] rounded-[3px] bg-navy px-5 py-2.5 text-white hover:bg-navy-dark">
          Contact Support
        </Link>
      </section>
    </>
  )
}

export function NotFound() {
  useTitle('Page not found')
  return (
    <section className="bg-paper px-5 py-24 text-center">
      <h1 className="mb-3 text-[32px] leading-9 font-bold text-black">Page not found</h1>
      <p className="mb-6 text-base text-muted">The page you are looking for does not exist.</p>
      <Link to="/" className="inline-block rounded-[3px] bg-navy px-6 py-2.5 text-white hover:bg-navy-dark">
        Back to Home
      </Link>
    </section>
  )
}
