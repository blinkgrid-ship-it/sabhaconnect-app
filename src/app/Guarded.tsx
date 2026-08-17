import type { ReactNode } from 'react'
import { Lock } from 'lucide-react'
import { useDemo } from '../demo/DemoContext'
import { parts } from './parts'
import type { Church, Role } from '../types/models'

/** Why a part is blocked for the current church/role, or null if it's allowed. */
export function blockedReason(partKey: string, church: Church, role: Role): string | null {
  const part = parts.find((p) => p.key === partKey)
  if (!part) return null
  if (!church.components.includes(partKey)) {
    return `${part.label.en} isn't enabled for ${church.name.en}.`
  }
  if (part.roles && !part.roles.includes(role)) {
    return `${part.label.en} requires ${part.roles.join('/')} access — you're signed in as ${role}.`
  }
  return null
}

export function isPartAccessible(partKey: string, church: Church, role: Role): boolean {
  return blockedReason(partKey, church, role) === null
}

/** Wraps a routed screen and shows the guardrail reason instead of silently hiding it. */
export function Guarded({ partKey, children }: { partKey: string; children: ReactNode }) {
  const { church, role } = useDemo()
  const reason = blockedReason(partKey, church, role)

  if (reason) {
    return (
      <div className="card flex animate-fade-in items-start gap-3 p-6">
        <Lock className="mt-0.5 h-5 w-5 shrink-0 text-plum" aria-hidden="true" />
        <div>
          <p className="font-display text-lg text-ink">Not available</p>
          <p className="mt-1 text-sm text-ink/70">{reason}</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
