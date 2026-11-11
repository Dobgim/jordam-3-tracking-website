import { useEffect, useState, type FormEvent } from 'react'
import { MailIcon, WhatsAppIcon } from '../components/Icons'
import PageBanner from '../components/PageBanner'
import { brand } from '../data/site'

const field = 'w-full rounded border border-muted bg-white px-3 py-3 text-[14px] text-[#333] outline-none focus:border-navy'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: 'Freight quote', message: '' })

  useEffect(() => {
    document.title = `Contact | ${brand.name}`
  }, [])

  // Opens the visitor's email app with the message filled in (no server needed).
  const submit = (e: FormEvent) => {
    e.preventDefault()
    const body = `${form.message}\n\n— ${form.name} (${form.email})`
    window.location.href = `mailto:${brand.email}?subject=${encodeURIComponent(form.subject)}&body=${encodeURIComponent(body)}`
  }

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm({ ...form, [k]: e.target.value })

  return (
    <>
      <PageBanner image="/img/img-svc-warehouse.jpg" title="Contact Us">
        Request a freight quote, book a pickup or ask about a shipment. Our team replies within a few hours.
      </PageBanner>
      <section className="bg-paper px-5 py-14 md:px-10">
        <div className="mx-auto grid max-w-[1175px] gap-8 md:grid-cols-[1fr_340px]">
          <form onSubmit={submit} className="rounded border border-line bg-white p-6 md:p-8">
            <h2 className="mb-6 text-2xl font-bold text-black">Send us a message</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-[13px] font-bold text-navy">Full name</span>
                <input required value={form.name} onChange={set('name')} className={field} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[13px] font-bold text-navy">Email</span>
                <input required type="email" value={form.email} onChange={set('email')} className={field} />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-[13px] font-bold text-navy">Subject</span>
                <select value={form.subject} onChange={set('subject')} className={field}>
                  <option>Freight quote</option>
                  <option>Schedule a pickup</option>
                  <option>Shipment enquiry</option>
                  <option>Other</option>
                </select>
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-[13px] font-bold text-navy">Message</span>
                <textarea required rows={6} value={form.message} onChange={set('message')} className={field} />
              </label>
            </div>
            <button type="submit" className="mt-6 min-w-[200px] rounded-[3px] bg-navy px-6 py-3 font-bold text-white hover:bg-navy-dark">
              Send Message
            </button>
          </form>

          <div className="flex flex-col gap-3">
            <a href={`mailto:${brand.email}`} className="flex items-center gap-3.5 rounded border border-line bg-white px-5 py-4 hover:bg-paper">
              <MailIcon className="size-[22px] shrink-0" />
              <span>
                <strong className="block text-[14px] text-navy">Email Us</strong>
                <span className="text-xs text-muted">{brand.email}</span>
              </span>
            </a>
            <a
              href={`https://wa.me/${brand.whatsapp}`}
              target="_blank"
              rel="noopener"
              className="flex items-center gap-3.5 rounded border border-line bg-white px-5 py-4 hover:bg-paper"
            >
              <WhatsAppIcon className="size-[22px] shrink-0" />
              <span>
                <strong className="block text-[14px] text-navy">WhatsApp</strong>
                <span className="text-xs text-muted">Message us any time</span>
              </span>
            </a>
            <div className="rounded bg-navy px-5 py-4 text-white">
              <strong className="block text-[14px]">Support hours</strong>
              <span className="text-xs text-white/75">{brand.hours}</span>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
