import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Footer from './Footer'
import Header from './Header'
import HelpWidget from './HelpWidget'

/** Scrolls to the top on page change, or to #hash targets like /#faq. */
function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1))
      if (el) return void el.scrollIntoView({ behavior: 'smooth' })
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

export default function Layout() {
  return (
    <>
      <ScrollManager />
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
      <HelpWidget />
    </>
  )
}
