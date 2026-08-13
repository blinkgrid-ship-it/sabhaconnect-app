import { Component, type ErrorInfo, type ReactNode } from 'react'
import { useApp } from '@/context/AppContext'

/**
 * The wrapper every screen renders inside (GHS_ArtifactBuildGuide.md §7).
 *
 * It does two jobs:
 *
 * 1. **Entitlement.** A surface only renders if the tenant's component registry
 *    enables it — the packaging mechanism from GHS_ProductArchitecture.md §4.
 * 2. **Containment.** If a screen throws, it fails inside its own box with a
 *    dignified message instead of blanking the app. This matters more than
 *    usual here: the failure mode being designed against is a white screen in
 *    front of the pastor.
 */

interface BoundaryProps {
  children: ReactNode
  name: string
}

interface BoundaryState {
  error: Error | null
}

class ErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): BoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(`[ghs] "${this.props.name}" failed to render.`, error, info.componentStack)
  }

  render(): ReactNode {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div
        role="alert"
        className="ghs-card mx-auto my-10 max-w-reading p-8 text-center animate-fade-in"
      >
        <p className="ghs-overline">This section could not be shown</p>
        <p className="mt-3 font-display text-xl text-ink">
          The rest of the page is unaffected.
        </p>
        <p className="mt-2 text-ui text-ink-muted">
          Reload to try again. Nothing you have written has been lost.
        </p>
        <button
          type="button"
          onClick={() => this.setState({ error: null })}
          className="mt-6 rounded-full border border-rule px-5 py-2 text-ui text-cedar transition hover:bg-parchment"
        >
          Try again
        </button>
      </div>
    )
  }
}

export function Guarded({
  component,
  name,
  children,
}: {
  /** Registry key checked against the tenant's enabled components. */
  component: string
  name: string
  children: ReactNode
}): JSX.Element {
  const { church, loading } = useApp()

  if (loading) {
    return (
      <div className="mx-auto my-16 max-w-reading px-6 text-center" aria-busy="true">
        <p className="ghs-overline text-ink-faint">Loading</p>
      </div>
    )
  }

  if (church && !church.enabledComponents.includes(component)) {
    return (
      <div className="ghs-card mx-auto my-10 max-w-reading p-8 text-center">
        <p className="ghs-overline text-ink-faint">Not enabled</p>
        <p className="mt-3 font-display text-xl text-ink">
          {name} is not part of this church&rsquo;s plan.
        </p>
      </div>
    )
  }

  return <ErrorBoundary name={name}>{children}</ErrorBoundary>
}

export default Guarded
