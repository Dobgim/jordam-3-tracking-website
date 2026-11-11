import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { errorMessage, store } from '../../lib/store'
import { STATUSES, normalizeTracking, type Shipment, type Status } from '../../lib/types'
import { Button, Card, ErrorBox, Input, Spinner, StatusBadge, fmtDate } from '../ui'

const MOVING: Status[] = ['Picked Up', 'In Transit', 'Customs Clearance', 'Out for Delivery']
const ATTENTION: Status[] = ['On Hold', 'Delayed', 'Returned']

export default function Dashboard() {
  const [rows, setRows] = useState<Shipment[] | null>(null)
  const [error, setError] = useState('')
  const [code, setCode] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    store.listShipments().then(setRows, (e) => setError(errorMessage(e)))
  }, [])

  const counts = useMemo(() => {
    const c = Object.fromEntries(STATUSES.map((s) => [s, 0])) as Record<Status, number>
    rows?.forEach((r) => c[r.status]++)
    return c
  }, [rows])

  const find = (e: FormEvent) => {
    e.preventDefault()
    const hit = rows?.find((r) => r.tracking_number === normalizeTracking(code))
    navigate(hit ? `/admin/shipments/${hit.id}` : `/admin/shipments?q=${encodeURIComponent(code)}`)
  }

  if (error) return <ErrorBox>{error}</ErrorBox>
  if (!rows) return <Spinner />

  const sum = (list: Status[]) => list.reduce((n, s) => n + counts[s], 0)
  const today = new Date().toISOString().slice(0, 10)
  const overdue = rows.filter((r) => r.estimated_delivery && r.estimated_delivery < today && !['Delivered', 'Cancelled', 'Returned'].includes(r.status))
  const stats = [
    { label: 'Total shipments', value: rows.length, tone: 'border-navy', to: '/admin/shipments' },
    { label: 'Pending / processing', value: counts.Pending + counts.Processing, tone: 'border-slate-400', to: '/admin/shipments?status=Pending' },
    { label: 'On the move', value: sum(MOVING), tone: 'border-blue', to: '/admin/shipments?status=In+Transit' },
    { label: 'Delivered', value: counts.Delivered, tone: 'border-emerald-500', to: '/admin/shipments?status=Delivered' },
    { label: 'Needs attention', value: sum(ATTENTION), tone: 'border-red', to: '/admin/shipments?status=On+Hold' },
  ]
  const max = Math.max(1, ...Object.values(counts))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-navy">Overview</h1>
        <Link to="/admin/shipments/new"><Button>+ New Shipment</Button></Link>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {stats.map((s) => (
          <Link key={s.label} to={s.to} className={`rounded border border-line border-l-4 bg-white px-4 py-4 transition-shadow hover:shadow-md ${s.tone}`}>
            <div className="text-[28px] leading-none font-black text-navy">{s.value}</div>
            <div className="mt-1.5 text-[12px] font-bold tracking-[0.5px] text-muted uppercase">{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card title="Recently updated" actions={<Link to="/admin/shipments" className="text-[13px] font-bold text-blue hover:underline">View all →</Link>}>
          {rows.length === 0 ? (
            <div className="py-8 text-center text-muted">
              No shipments yet. <Link to="/admin/shipments/new" className="font-bold text-blue underline">Create the first one</Link>.
            </div>
          ) : (
            <div className="-m-5 overflow-x-auto">
              <table className="w-full text-left text-[14px]">
                <thead className="bg-paper text-[12px] tracking-[0.5px] text-muted uppercase">
                  <tr>
                    <th className="px-5 py-2.5">Tracking</th>
                    <th className="px-3 py-2.5">Route</th>
                    <th className="px-3 py-2.5">Status</th>
                    <th className="px-5 py-2.5">ETA</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 8).map((r) => (
                    <tr key={r.id} className="border-t border-line hover:bg-paper/60">
                      <td className="px-5 py-3"><Link to={`/admin/shipments/${r.id}`} className="font-bold text-navy hover:underline">{r.tracking_number}</Link></td>
                      <td className="px-3 py-3 text-[#444]">{r.origin} → {r.destination}</td>
                      <td className="px-3 py-3"><StatusBadge status={r.status} /></td>
                      <td className="px-5 py-3 whitespace-nowrap text-[#444]">{fmtDate(r.estimated_delivery)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <Card title="Find a shipment">
            <form onSubmit={find} className="flex gap-2">
              <Input placeholder="Tracking number" value={code} onChange={(e) => setCode(e.target.value)} required />
              <Button type="submit">Go</Button>
            </form>
          </Card>

          <Card title="By status">
            <ul className="space-y-2">
              {STATUSES.map((s) => (
                <li key={s}>
                  <Link to={`/admin/shipments?status=${encodeURIComponent(s)}`} className="grid grid-cols-[130px_1fr_28px] items-center gap-2 text-[13px] hover:text-navy">
                    <span className="truncate text-[#444]">{s}</span>
                    <span className="h-2 rounded-full bg-[#e3e8ef]"><span className="block h-full rounded-full bg-blue" style={{ width: `${(counts[s] / max) * 100}%` }} /></span>
                    <span className="text-right font-bold text-navy">{counts[s]}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>

          {overdue.length > 0 && (
            <Card title={`Past estimated delivery (${overdue.length})`}>
              <ul className="space-y-2 text-[14px]">
                {overdue.slice(0, 6).map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-2">
                    <Link to={`/admin/shipments/${r.id}`} className="font-bold text-navy hover:underline">{r.tracking_number}</Link>
                    <span className="text-[13px] text-red">due {fmtDate(r.estimated_delivery)}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
