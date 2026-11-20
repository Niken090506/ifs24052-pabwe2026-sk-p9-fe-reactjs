import { IconFileText, IconCircleCheck, IconPencil } from '@tabler/icons-react'
import { pick } from '../../../helpers/toolsHelper'
import { card, mutedText } from '../../../helpers/uiClasses'

export default function PostStats({ stats }) {
  const items = [
    { label: 'Total Artikel', sub: 'Total', value: pick(stats, ['total_posts', 'total']), Icon: IconFileText },
    { label: 'Total Terbit', sub: 'Total Selesai', value: pick(stats, ['total_published', 'published', 'total_selesai']), Icon: IconCircleCheck },
    { label: 'Belum Selesai (Draf)', sub: 'Draf', value: pick(stats, ['total_draft', 'draft', 'belum_selesai']), Icon: IconPencil },
  ]
  return (
    <ul className="grid gap-4 sm:grid-cols-3" aria-label="Statistik artikel">
      {items.map(({ label, sub, value, Icon }) => (
        <li key={label} className={`${card} flex items-center gap-4 p-5`}>
          <Icon size={32} aria-hidden="true" className="text-accent-text" />
          <div>
            <p className={`text-sm ${mutedText}`}>{label}</p>
            <p className="text-3xl font-extrabold">{value}</p>
            <span className="sr-only">{sub}</span>
          </div>
        </li>
      ))}
    </ul>
  )
}
