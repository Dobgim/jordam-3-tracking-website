import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import PageBanner from '../components/PageBanner'
import TrackForm from '../components/TrackForm'
import { brand } from '../data/site'

/**
 * Tracking page. There is no shipment database connected yet, so any number entered
 * shows the "not found" state. Hook a real lookup in where `code` is handled.
 */
export default function Track() {
  const [params] = useSearchParams()
  const code = params.get('code')?.trim() ?? ''

  useEffect(() => {
    document.title = `Track a Shipment | ${brand.name}`
  }, [])

  return (
    <>
      <PageBanner image="/img/img-cargo-hero.jpg" title="Track a Shipment">
        Enter your tracking number to see the latest status of your freight.
      </PageBanner>
      <section className="bg-paper px-10 pt-14 pb-16">
        <div className="mx-auto flex max-w-[1175px] flex-col items-start">
          <TrackForm key={code} variant="hero" initial={code} />
          {code ? (
            <div className="mt-8 w-full max-w-[760px] border-l-[15px] border-alert-edge bg-alert px-[30px] py-5 text-[14px] leading-[22px] text-[#333]">
              <strong>No shipment found for “{code}”.</strong> Check the number and try again, or{' '}
              <Link to="/contact" className="text-blue underline">
                contact our support team
              </Link>{' '}
              for help.
            </div>
          ) : (
            <p className="mt-3.5 text-[14px] text-muted">You can find your tracking number on your booking confirmation email.</p>
          )}
        </div>
      </section>
    </>
  )
}
