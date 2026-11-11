import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { errorMessage, store } from '../../lib/store'
import type { ShipmentType } from '../../lib/types'
import { Button, Card, ErrorBox, Input, Spinner, useUI } from '../ui'

export default function Types() {
  const [types, setTypes] = useState<ShipmentType[] | null>(null)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [edit, setEdit] = useState<{ id: string; name: string } | null>(null)
  const { confirm, toast } = useUI()

  const load = () => store.listTypes().then(setTypes, (e) => setError(errorMessage(e)))
  useEffect(() => {
    load()
  }, [])

  const run = async (fn: () => Promise<unknown>, ok: string) => {
    try {
      await fn()
      toast(ok)
      await load()
      return true
    } catch (e) {
      toast(errorMessage(e), 'error')
      return false
    }
  }

  const add = async (e: FormEvent) => {
    e.preventDefault()
    if (await run(() => store.addType(name), `Added “${name.trim()}”`)) setName('')
  }

  const rename = async (e: FormEvent) => {
    e.preventDefault()
    if (edit && (await run(() => store.renameType(edit.id, edit.name), 'Type renamed'))) setEdit(null)
  }

  const remove = async (t: ShipmentType) => {
    if (t.count) {
      toast(`“${t.name}” is used by ${t.count} shipment${t.count > 1 ? 's' : ''}. Change those shipments first.`, 'error')
      return
    }
    const ok = await confirm({ title: 'Delete shipment type', message: <>Delete <strong>{t.name}</strong>?</>, confirmLabel: 'Delete', danger: true })
    if (ok) await run(() => store.deleteType(t.id), `Deleted “${t.name}”`)
  }

  if (error) return <ErrorBox>{error}</ErrorBox>
  if (!types) return <Spinner />

  return (
    <div className="max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-navy">Shipment Types</h1>
        <p className="text-[14px] text-muted">The options in the “Shipment type” list. Renaming a type updates every shipment that uses it.</p>
      </div>

      <Card title="Add a type">
        <form onSubmit={add} className="flex gap-2">
          <Input required maxLength={60} placeholder="e.g. Cold Chain Freight" value={name} onChange={(e) => setName(e.target.value)} aria-label="New type name" />
          <Button type="submit">Add</Button>
        </form>
      </Card>

      <Card title={`All types (${types.length})`}>
        <ul className="-m-5 divide-y divide-line">
          {types.map((t) => (
            <li key={t.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
              {edit?.id === t.id ? (
                <form onSubmit={rename} className="flex flex-1 gap-2">
                  <Input autoFocus required maxLength={60} value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} aria-label="Type name" />
                  <Button type="submit">Save</Button>
                  <Button variant="secondary" onClick={() => setEdit(null)}>Cancel</Button>
                </form>
              ) : (
                <>
                  <div>
                    <div className="font-bold text-navy">{t.name}</div>
                    <Link to={`/admin/shipments?type=${encodeURIComponent(t.name)}`} className="text-[13px] text-muted hover:text-blue hover:underline">
                      {t.count ?? 0} shipment{t.count === 1 ? '' : 's'}
                    </Link>
                  </div>
                  <div className="flex gap-1.5">
                    <Button variant="secondary" className="!px-3 !py-1 !text-[13px]" onClick={() => setEdit({ id: t.id, name: t.name })}>Rename</Button>
                    <Button variant="danger" className="!px-3 !py-1 !text-[13px]" onClick={() => remove(t)} title={t.count ? 'In use by shipments' : undefined}>Delete</Button>
                  </div>
                </>
              )}
            </li>
          ))}
          {types.length === 0 && <li className="px-5 py-8 text-center text-muted">No types yet. Add one above.</li>}
        </ul>
      </Card>
    </div>
  )
}
