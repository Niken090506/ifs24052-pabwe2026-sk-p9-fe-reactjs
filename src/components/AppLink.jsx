import { navigate } from '../helpers/navigation'

export default function AppLink({ href, children, ...props }) {
  const handleClick = (event) => {
    if (event.ctrlKey || event.metaKey) return
    event.preventDefault()
    navigate(href)
  }
  return (
    <a href={href} onClick={handleClick} {...props}>
      {children}
    </a>
  )
}
