import { useEffect, useRef } from 'react'
import { IconX } from '@tabler/icons-react'

/**
 * Modal layar penuh (max-w-[96vw]) dengan header & footer berwarna kontras.
 * Footer berisi tombol aksi (Batal & Simpan) di sisi kanan.
 */
export default function Modal({ title, titleId, onClose, children, footer }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    dialogRef.current.focus()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-2">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="flex max-h-[96vh] w-full max-w-[96vw] flex-col overflow-hidden rounded-xl bg-white text-slate-900 shadow-2xl outline-none dark:bg-slate-900 dark:text-slate-100"
      >
        <div className="flex items-center justify-between bg-slate-800 px-5 py-3 text-white">
          <h2 id={titleId} className="text-lg font-semibold">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup dialog"
            className="rounded-lg p-1 hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-white"
          >
            <IconX size={22} aria-hidden="true" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        <div className="flex justify-end gap-3 border-t border-slate-300 bg-slate-200 px-5 py-3 dark:border-slate-600 dark:bg-slate-800">
          {footer}
        </div>
      </div>
    </div>
  )
}
