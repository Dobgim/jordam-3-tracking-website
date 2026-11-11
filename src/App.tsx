import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Contact from './pages/Contact'
import Home from './pages/Home'
import { About, NotFound, Services, SignIn } from './pages/InfoPages'
import Track from './pages/Track'

// The dashboard (and the Supabase admin code) only downloads when someone opens /admin.
const AdminApp = lazy(() => import('./admin/AdminApp'))

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="services" element={<Services />} />
          <Route path="contact" element={<Contact />} />
          <Route path="track" element={<Track />} />
          <Route path="login" element={<SignIn />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route
          path="admin/*"
          element={
            <Suspense fallback={<div className="p-10 text-center text-muted">Loading dashboard…</div>}>
              <AdminApp />
            </Suspense>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
