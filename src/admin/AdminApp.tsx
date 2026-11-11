import { useEffect, useState } from 'react'
import { Link, NavLink, Navigate, Outlet, Route, Routes, useNavigate } from 'react-router-dom'
import { brand } from '../data/site'
import { store, type AdminUser } from '../lib/store'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import ShipmentDetail from './pages/ShipmentDetail'
import ShipmentForm from './pages/ShipmentForm'
import Shipments from './pages/Shipments'
import Types from './pages/Types'
import { Spinner, UIProvider } from './ui'

export default function AdminApp() {
  const [user, setUser] = useState<AdminUser | null | undefined>(undefined)

  useEffect(() => {
    document.title = `Admin | ${brand.name}`
    store.currentUser().then(setUser, () => setUser(null))
  }, [])

  if (user === undefined) return <Spinner />

  return (
    <UIProvider>
      {user ? (
        <Routes>
          <Route element={<Shell user={user} onSignOut={() => setUser(null)} />}>
            <Route index element={<Dashboard />} />
            <Route path="shipments" element={<Shipments />} />
            <Route path="shipments/new" element={<ShipmentForm />} />
            <Route path="shipments/:id" element={<ShipmentDetail />} />
            <Route path="shipments/:id/edit" element={<ShipmentForm />} />
            <Route path="types" element={<Types />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Route>
        </Routes>
      ) : (
        <Login onSignedIn={setUser} />
      )}
    </UIProvider>
  )
}

const nav = [
  { to: '/admin', label: 'Overview', end: true, icon: 'M3 12l9-9 9 9M5 10v10h5v-6h4v6h5V10' },
  { to: '/admin/shipments', label: 'Shipments', end: true, icon: 'M21 16V8l-9-5-9 5v8l9 5 9-5zM3.3 7L12 12l8.7-5M12 22V12' },
  { to: '/admin/shipments/new', label: 'New Shipment', end: true, icon: 'M12 5v14M5 12h14' },
  { to: '/admin/types', label: 'Shipment Types', end: true, icon: 'M4 6h16M4 12h16M4 18h10' },
]

function Shell({ user, onSignOut }: { user: AdminUser; onSignOut: () => void }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const signOut = async () => {
    await store.signOut()
    onSignOut()
    navigate('/admin')
  }

  return (
    <div className="min-h-screen bg-[#f2f4f7] text-[#222]">
      {store.mode === 'demo' && (
        <div className="bg-amber-100 px-4 py-2 text-center text-[13px] text-amber-900 print:hidden">
          <strong>Demo mode:</strong> no database is connected, so shipments are saved only in this browser. Connect Supabase to go live (see README).
        </div>
      )}

      {/* Top bar (mobile) */}
      <div className="flex items-center justify-between border-b-[3px] border-red bg-navy px-4 py-3 lg:hidden print:hidden">
        <img src={brand.logo} alt={brand.name} className="h-8 rounded-[3px] bg-white px-2 py-1" />
        <button type="button" aria-label="Open menu" onClick={() => setOpen(true)} className="text-white">
          <svg width="26" height="20" viewBox="0 0 26 20" fill="currentColor"><rect width="26" height="3" rx="1.5" /><rect y="8" width="18" height="3" rx="1.5" fill="#E42313" /><rect y="16" width="26" height="3" rx="1.5" /></svg>
        </button>
      </div>

      <div className="flex">
        {open && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setOpen(false)} />}
        <aside
          className={`fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col bg-navy text-white transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 print:hidden ${open ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="border-b-[3px] border-red px-5 py-5">
            <Link to="/admin" onClick={() => setOpen(false)}>
              <img src={brand.logo} alt={brand.name} className="h-10 rounded-[3px] bg-white px-2 py-1" />
            </Link>
            <div className="mt-2 text-[11px] font-bold tracking-[2px] text-white/60">ADMIN DASHBOARD</div>
          </div>
          <nav className="flex flex-col gap-0.5 p-3">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) => `flex items-center gap-3 rounded-[3px] px-3 py-2.5 text-[14px] font-bold transition-colors ${isActive ? 'bg-white text-navy' : 'text-white/85 hover:bg-white/10'}`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d={n.icon} /></svg>
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-auto border-t border-white/15 p-4 text-[13px]">
            <div className="truncate text-white/70" title={user.email}>{user.email}</div>
            <div className="mt-3 flex gap-2">
              <a href="/" target="_blank" rel="noopener" className="flex-1 rounded-[3px] border border-white/30 px-3 py-1.5 text-center hover:bg-white/10">View site</a>
              <button type="button" onClick={signOut} className="flex-1 rounded-[3px] bg-red px-3 py-1.5 font-bold hover:bg-[#c41e10]">Sign out</button>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8 print:p-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
