import { useEffect, useRef, useState, type FormEvent, type MouseEvent } from 'react'
import { ArrowUpRight, Check, Copy, X } from '@phosphor-icons/react'
import './contact.css'

type ContactDialogProps = {
  open: boolean
  onClose: () => void
  eventType?: string
}

const emailAddress = 'trnevents@gmail.com'
const eventTypes = ['Live events', 'Private celebrations', 'Brand experiences', 'Something else']

function selectedEventType(value?: string) {
  return eventTypes.find((option) => option.toLowerCase() === value?.toLowerCase()) ?? 'Something else'
}

export default function ContactDialog({ open, onClose, eventType }: ContactDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLAnchorElement>(null)
  const [selectedType, setSelectedType] = useState(selectedEventType(eventType))
  const [draftReady, setDraftReady] = useState(false)
  const [copyStatus, setCopyStatus] = useState('')

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open) {
      if (!dialog.open) dialog.showModal()
      nameRef.current?.focus({ preventScroll: true })
      const previousOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = previousOverflow
      }
    }

    if (dialog.open) dialog.close()
  }, [open])

  useEffect(() => {
    if (open && eventType) setSelectedType(selectedEventType(eventType))
  }, [open, eventType])

  function closeFromBackdrop(event: MouseEvent<HTMLDialogElement>) {
    if (event.target !== event.currentTarget) return
    const bounds = event.currentTarget.getBoundingClientRect()
    if (
      event.clientX < bounds.left || event.clientX > bounds.right ||
      event.clientY < bounds.top || event.clientY > bounds.bottom
    ) onClose()
  }

  function prepareEnquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    if (!form.reportValidity()) return

    const data = new FormData(form)
    const name = String(data.get('name') ?? '').trim()
    const email = String(data.get('email') ?? '').trim()
    const type = String(data.get('eventType') ?? 'Something else')
    const date = String(data.get('date') ?? '')
    const message = String(data.get('message') ?? '').trim()
    const subject = `Event enquiry: ${type} | ${name}`
    const body = [
      'Hi TRN Events,',
      '',
      message,
      '',
      `Name: ${name}`,
      `Email: ${email}`,
      `Event type: ${type}`,
      `Preferred date: ${date || 'To be decided'}`,
      '',
      'Let’s make it happen!',
    ].join('\n')

    window.location.href = `mailto:${emailAddress}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    setDraftReady(true)
  }

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(emailAddress)
      setCopyStatus('Email copied.')
    } catch {
      const address = emailRef.current
      const selection = window.getSelection()
      if (address && selection) {
        const range = document.createRange()
        range.selectNodeContents(address)
        selection.removeAllRanges()
        selection.addRange(range)
      }
      setCopyStatus('Select and copy the email address below.')
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="contact-dialog"
      aria-labelledby="contact-title"
      aria-describedby="contact-intro"
      onCancel={onClose}
      onClose={onClose}
      onClick={closeFromBackdrop}
      data-lenis-prevent
    >
      <div className="contact-dialog__topline">
        <span>TRN EVENTS / YOUR NEXT BIG THING</span>
        <button type="button" className="contact-dialog__close" onClick={onClose} aria-label="Close enquiry form">
          <X size={24} weight="light" aria-hidden="true" />
        </button>
      </div>

      <h2 id="contact-title" className="contact-dialog__title">LET’S MAKE<br />IT HAPPEN.</h2>
      <p id="contact-intro" className="contact-dialog__intro">Big plans. Wild ideas. A date in mind. Tell us what you’re dreaming of.</p>

      <form className="contact-form" onSubmit={prepareEnquiry} onChange={() => setDraftReady(false)}>
        <div className="contact-form__grid">
          <div className="contact-form__field">
            <label htmlFor="contact-name">Your name <span aria-hidden="true">*</span></label>
            <input ref={nameRef} id="contact-name" name="name" autoComplete="name" placeholder="First and last name" required maxLength={120} />
          </div>
          <div className="contact-form__field">
            <label htmlFor="contact-email">Email address <span aria-hidden="true">*</span></label>
            <input id="contact-email" name="email" type="email" autoComplete="email" placeholder="you@company.com" required maxLength={254} />
          </div>
          <div className="contact-form__field">
            <label htmlFor="contact-type">What are we creating?</label>
            <select id="contact-type" name="eventType" value={selectedType} onChange={(event) => setSelectedType(event.target.value)}>
              {eventTypes.map((type) => <option key={type}>{type}</option>)}
            </select>
          </div>
          <div className="contact-form__field">
            <label htmlFor="contact-date">A date in mind? <span className="contact-form__optional">(optional)</span></label>
            <input id="contact-date" name="date" type="date" />
          </div>
          <div className="contact-form__field contact-form__field--wide">
            <label htmlFor="contact-message">Tell us about your event <span aria-hidden="true">*</span></label>
            <textarea id="contact-message" name="message" placeholder="The occasion, the place, the people. We’re all ears." rows={3} required maxLength={5000} />
          </div>
        </div>

        <div className="contact-form__actions">
          <button type="submit" className="contact-form__submit">
            <span>Prepare my enquiry</span><ArrowUpRight size={22} aria-hidden="true" />
          </button>
          <p>Opens a draft in your email app.<br /><span>* Required fields</span></p>
        </div>
        <div className="contact-form__status" role="status" aria-live="polite">
          {draftReady && <p><Check size={19} aria-hidden="true" /><span>Your email draft is ready. Send it from your email app to start the conversation.</span></p>}
        </div>
      </form>

      <div className="contact-dialog__direct">
        <div>
          <span className="contact-dialog__direct-label">Prefer to say hello directly?</span>
          <a ref={emailRef} href={`mailto:${emailAddress}`}>{emailAddress}</a>
        </div>
        <button type="button" className="contact-dialog__copy" onClick={copyEmail}>
          {copyStatus === 'Email copied.' ? <Check size={17} aria-hidden="true" /> : <Copy size={17} aria-hidden="true" />}
          {copyStatus === 'Email copied.' ? 'Copied' : 'Copy email'}
        </button>
        <span className="contact-dialog__copy-status" role="status" aria-live="polite">{copyStatus}</span>
      </div>
    </dialog>
  )
}
