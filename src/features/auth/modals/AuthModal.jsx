import Modal from '../../../components/Modal'
import AuthForm from '../components/AuthForm'
import { btnSecondary, mutedText } from '../../../helpers/uiClasses'

/** Modal login yang muncul saat sesi berakhir (token kedaluwarsa). */
export default function AuthModal({ onClose, onSuccess }) {
  return (
    <Modal
      title="Sesi Berakhir, Masuk Kembali"
      titleId="auth-modal-title"
      onClose={onClose}
      footer={
        <button type="button" onClick={onClose} className={btnSecondary}>
          Batal
        </button>
      }
    >
      <div className="mx-auto max-w-md">
        <p className={`mb-4 text-sm ${mutedText}`}>Sesi Anda telah berakhir. Silakan masuk kembali untuk melanjutkan.</p>
        <AuthForm mode="login" onSuccess={onSuccess} withLinks={false} />
      </div>
    </Modal>
  )
}
