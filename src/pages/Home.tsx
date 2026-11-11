import { useEffect } from 'react'
import { brand } from '../data/site'
import Faq from '../sections/Faq'
import Featured from '../sections/Featured'
import Hero, { PickupAlert } from '../sections/Hero'
import Network from '../sections/Network'
import Reviews from '../sections/Reviews'
import TrustBar from '../sections/TrustBar'

export default function Home() {
  useEffect(() => {
    document.title = `Home | ${brand.name}`
  }, [])

  return (
    <>
      <Hero />
      <PickupAlert />
      <Featured />
      <Network />
      <TrustBar />
      <Reviews />
      <Faq />
    </>
  )
}
