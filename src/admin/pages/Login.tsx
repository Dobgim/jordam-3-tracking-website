import { useState, type FormEvent } from 'react'
import { brand } from '../../data/site'
import { errorMessage, store, type AdminUser } from '../../lib/store'
import { Button, ErrorBox, Field, Input } from '../ui'

export default function Login({ onSignedIn }: { onSignedIn: (u: AdminUser) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const demo = store.mode === 'demo'

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      onSignedIn(await store.signIn(email.trim(), password))
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper p-4">
      <form onSubmit={submit} className="w-full max-w-sm overflow-hidden rounded border border-line bg-white shadow-sm">
        <div className="relative overflow-hidden bg-navy px-6 py-6 after:absolute after:top-0 after:right-8 after:h-full after:w-[5px] after:-skew-x-12 after:bg-red after:content-['']">
          <img src={brand.logo} alt={brand.name} className="h-10 rounded-[3px] bg-white px-2 py-1" />
          <h1 className="mt-4 text-xl font-bold text-white">Admin sign in</h1>
        </div>
        <div className="space-y-4 p-6">
          {demo && (
            <p className="rounded bg-amber-50 px-3 py-2 text-[13px] text-amber-900">
              <strong>Demo mode.</strong> No database is connected yet, so any email and password will open the dashboard. Data stays in this browser.
            </p>
          )}
          {error && <ErrorBox>{error}</ErrorBox>}
          <Field label="Email">
            <Input type="email" autoComplete="username" required={!demo} value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label="Password">
            <Input type="password" autoComplete="current-password" required={!demo} value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>
          <Button type="submit" disabled={busy} className="w-full py-2.5">
            {busy ? 'Signing in…' : 'Sign in'}
          </Button>
        </div>
      </form>
    </div>
  )
}
