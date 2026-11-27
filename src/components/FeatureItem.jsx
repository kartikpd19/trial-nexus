import { FeatureIcon } from './Icons.jsx'

export default function FeatureItem({ icon, title, text }) {
  return (
    <li className="flex gap-4">
      <FeatureIcon name={icon} />
      <div>
        <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted">{text}</p>
      </div>
    </li>
  )
}
