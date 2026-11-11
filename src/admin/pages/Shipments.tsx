import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { errorMessage, store } from '../../lib/store'
import { STATUSES, STATUS_PROGRESS, type Shipment, type Status } from '../../lib/types'
import { Button, ErrorBox, Input, Select, Spinner, StatusBadge, fmtDate, inputCls, useUI } from '../ui'

const PAGE = 20
type SortKey = 'updated_at' | 'created_at' | 'estimated_delivery' | 'tracking_number'

function toCsv(rows: Shipment[]): string {
  const cols: [string, (s: Shipment) => unknown][] = [
    ['Tracking', (s) => s.tracking_number], ['Status', (s) => s.status], ['Type', (s) => s.shipment_type], ['Service', (s) => s.service_level],
    ['Origin', (s) => s.origin], ['Destination', (s) => s.destination], ['Current location', (s) => s.current_location], ['Progress %', (s) => s.progress],
    ['Sender', (s) => s.sender.name], ['Sender email', (s) => s.sender.email], ['Sender phone', (s) => s.sender.phone],
    ['Receiver', (s) => s.receiver.name], ['Receiver email', (s) => s.receiver.email], ['Receiver phone', (s) => s.receiver.phone], ['Receiver address', (s) => s.receiver.address],
    ['Description', (s) => s.description], ['Qty', (s) => s.quantity], ['Weight kg', (s) => s.weight_kg],
    ['Cost', (s) => s.shipping_cost], ['Currency', (s) => s.currency], ['Payment', (s) => s.payment_status],
    ['Pickup', (s) => s.pickup_date], ['ETA', (s) => s.estimated_delivery], ['Delivered', (s) => s.delivered_date], ['Created', (s) => s.created_at],
  ]
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
  return [cols.map((c) => esc(c[0])).join(','), ...rows.map((r) => cols.map((c) => esc(c[1](r))).join(','))].join('\r\n')
}

export default function Shipments() {
  const [params, setParams] = useSearchParams()
  const [rows, setRows] = useState<Shipment[] | null>(null)
  const [types, setTypes] = useState<string[]>([])
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const { confirm, toast } = useUI()

  // The search box keeps its own state so fast typing never loses characters;
  // the URL is updated alongside it so filtered views can be bookmarked.
  const [q, setQ] = useState(() => params.get('q') ?? '')
  const status = params.get('status') ?? ''
  const type = params.get('type') ?? ''
  const sort = (params.get('sort') as SortKey) || 'updated_at'
  const page = Math.max(1, Number(params.get('page')) || 1)

  const setParam = (k: string, v: string) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (v) next.set(k, v)
        else next.delete(k)
        if (k !== 'page') next.delete('page')
        return next
      },
      { replace: true },
    )
  const search = (v: string) => {
    setQ(v)
    setParam('q', v)
  }

  const load = () => store.listShipments().then(setRows, (e) => setError(errorMessage(e)))
  useEffect(() => {
    load()
    store.listTypes().then((t) => setTypes(t.map((x) => x.name)), () => {})
  }, [])

  const filtered = useMemo(() => {
    if (!rows) return []
    const needle = q.trim().toLowerCase()
    return rows
      .filter((r) => !status || r.status === status)
      .filter((r) => !type || r.shipment_type === type)
      .filter(
        (r) =>
          !needle ||
          [r.tracking_number, r.origin, r.destination, r.current_location, r.sender.name, r.receiver.name, r.sender.email, r.receiver.email, r.description]
            .join(' ')
            .toLowerCase()
            .includes(needle),
      )
      .sort((a, b) => {
        if (sort === 'tracking_number') return a.tracking_number.localeCompare(b.tracking_number)
        if (sort === 'estimated_delivery') return (a.estimated_delivery || '9999').localeCompare(b.estimated_delivery || '9999')
        return b[sort].localeCompare(a[sort])
      })
  }, [rows, q, status, type, sort])

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE))
  const shown = filtered.slice((Math.min(page, pages) - 1) * PAGE, Math.min(page, pages) * PAGE)

  const changeStatus = async (r: Shipment, next: Status) => {
    const p = STATUS_PROGRESS[next]
    try {
      const saved = await store.updateShipment(r.id, { ...r, status: next, progress: p >= 0 ? p : r.progress })
      setRows((all) => all!.map((x) => (x.id === r.id ? saved : x)))
      toast(`${r.tracking_number} → ${next}`)
    } catch (e) {
      toast(errorMessage(e), 'error')
    }
  }

  const remove = async (ids: string[]) => {
    const label = ids.length === 1 ? rows!.find((r) => r.id === ids[0])?.tracking_number : `${ids.length} shipments`
    const ok = await confirm({ title: 'Delete shipment', message: <>Delete <strong>{label}</strong> and its tracking history? This cannot be undone.</>, confirmLabel: 'Delete', danger: true })
    if (!ok) return
    try {
      for (const id of ids) await store.deleteShipment(id)
      setRows((all) => all!.filter((r) => !ids.includes(r.id)))
      setSelected(new Set())
      toast(`Deleted ${label}`)
    } catch (e) {
      toast(errorMessage(e), 'error')
      load()
    }
  }

  const exportCsv = () => {
    const blob = new Blob(['﻿' + toCsv(filtered)], { type: 'text/csv;charset=utf-8' })
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `shipments-${new Date().toISOString().slice(0, 10)}.csv` })
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const toggle = (id: string) => setSelected((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n })
  const allShown = shown.length > 0 && shown.every((r) => selected.has(r.id))

  if (error) return <ErrorBox>{error}</ErrorBox>
  if (!rows) return <Spinner />

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-navy">Shipments <span className="text-base font-normal text-muted">({filtered.length})</span></h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={exportCsv} disabled={!filtered.length}>Export CSV</Button>
          <Link to="/admin/shipments/new"><Button>+ New Shipment</Button></Link>
        </div>
      </div>

      <div className="grid gap-3 rounded border border-line bg-white p-4 sm:grid-cols-2 lg:grid-cols-[1fr_180px_180px_190px]">
        <Input type="search" placeholder="Search tracking, names, places…" value={q} onChange={(e) => search(e.target.value)} aria-label="Search shipments" />
        <Select aria-label="Filter by status" value={status} onChange={(e) => setParam('status', e.target.value)} options={['', ...STATUSES]} emptyLabel="All statuses" />
        <Select aria-label="Filter by type" value={type} onChange={(e) => setParam('type', e.target.value)} options={['', ...types]} emptyLabel="All types" />
        <select aria-label="Sort" value={sort} onChange={(e) => setParam('sort', e.target.value)} className={inputCls}>
          <option value="updated_at">Recently updated</option>
          <option value="created_at">Newest first</option>
          <option value="estimated_delivery">Delivery date</option>
          <option value="tracking_number">Tracking number</option>
        </select>
      </div>

      {selected.size > 0 && (
        <div className="flex items-center justify-between rounded bg-navy px-4 py-2.5 text-white">
          <span className="text-[14px] font-bold">{selected.size} selected</span>
          <div className="flex gap-2">
            <Button variant="ghost" className="!text-white hover:!bg-white/10" onClick={() => setSelected(new Set())}>Clear</Button>
            <Button variant="danger" onClick={() => remove([...selected])}>Delete selected</Button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded border border-line bg-white">
        <table className="w-full min-w-[920px] text-left text-[14px]">
          <thead className="bg-paper text-[12px] tracking-[0.5px] text-muted uppercase">
            <tr>
              <th className="w-10 px-4 py-3">
                <input type="checkbox" aria-label="Select all on this page" checked={allShown} onChange={() => setSelected((s) => { const n = new Set(s); shown.forEach((r) => (allShown ? n.delete(r.id) : n.add(r.id))); return n })} />
              </th>
              <th className="px-3 py-3">Tracking</th>
              <th className="px-3 py-3">Type</th>
              <th className="px-3 py-3">Route</th>
              <th className="px-3 py-3">Receiver</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">ETA</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => (
              <tr key={r.id} className="border-t border-line align-middle hover:bg-paper/60">
                <td className="px-4 py-3"><input type="checkbox" aria-label={`Select ${r.tracking_number}`} checked={selected.has(r.id)} onChange={() => toggle(r.id)} /></td>
                <td className="px-3 py-3">
                  <Link to={`/admin/shipments/${r.id}`} className="font-bold text-navy hover:underline">{r.tracking_number}</Link>
                  <div className="text-[12px] text-muted">{r.service_level}</div>
                </td>
                <td className="px-3 py-3 text-[#444]">{r.shipment_type}</td>
                <td className="px-3 py-3 text-[#444]">
                  {r.origin} → {r.destination}
                  {r.current_location && <div className="text-[12px] text-muted">Now: {r.current_location}</div>}
                </td>
                <td className="px-3 py-3 text-[#444]">{r.receiver.name || '—'}</td>
                <td className="px-3 py-3">
                  <div className="flex flex-col gap-1">
                    <StatusBadge status={r.status} />
                    <select
                      aria-label={`Change status of ${r.tracking_number}`}
                      value={r.status}
                      onChange={(e) => changeStatus(r, e.target.value as Status)}
                      className="w-[150px] rounded-[3px] border border-line bg-white px-1.5 py-1 text-[12px] text-[#333]"
                    >
                      {STATUSES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-[#444]">{fmtDate(r.estimated_delivery)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1.5">
                    <Link to={`/admin/shipments/${r.id}`}><Button variant="secondary" className="!px-2.5 !py-1 !text-[13px]">View</Button></Link>
                    <Link to={`/admin/shipments/${r.id}/edit`}><Button variant="secondary" className="!px-2.5 !py-1 !text-[13px]">Edit</Button></Link>
                    <Button variant="danger" className="!px-2.5 !py-1 !text-[13px]" onClick={() => remove([r.id])}>Delete</Button>
                  </div>
                </td>
              </tr>
            ))}
            {shown.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-muted">
                  {rows.length === 0 ? <>No shipments yet. <Link to="/admin/shipments/new" className="font-bold text-blue underline">Create one</Link>.</> : 'No shipments match these filters.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-end gap-2 text-[14px]">
          <Button variant="secondary" disabled={page <= 1} onClick={() => setParam('page', String(page - 1))}>← Prev</Button>
          <span className="px-2 text-muted">Page {Math.min(page, pages)} of {pages}</span>
          <Button variant="secondary" disabled={page >= pages} onClick={() => setParam('page', String(page + 1))}>Next →</Button>
        </div>
      )}
    </div>
  )
}
