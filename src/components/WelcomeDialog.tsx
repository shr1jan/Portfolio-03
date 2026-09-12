import { useEffect, useRef } from 'react'
import { X } from '@phosphor-icons/react'
import './welcome.css'

type WelcomeDialogProps = {
  open: boolean
  onClose: () => void
}

export default function WelcomeDialog({ open, onClose }: WelcomeDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open) {
      if (!dialog.open) dialog.showModal()
      const previousOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = previousOverflow
      }
    }

    if (dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      className="welcome-dialog"
      aria-label="Welcome"
      onCancel={onClose}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      data-lenis-prevent
    >
      <div className="welcome-dialog__inner">
        <button type="button" className="welcome-dialog__close" onClick={onClose} aria-label="Close welcome message" autoFocus>
          <X size={22} weight="light" aria-hidden="true" />
        </button>
        <a className="welcome-dialog__link" href="https://mamagharentertainment.com" onClick={onClose}><img className="welcome-dialog__image" src="/images/popup.jpg" alt="Mamaghar Entertainment" /></a>
      </div>
    </dialog>
  )
}