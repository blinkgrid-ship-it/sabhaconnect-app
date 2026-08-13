import { useCallback, useEffect, useState } from 'react'
import { api } from '@/services/api'
import { useApp } from '@/context/AppContext'
import type { Comment } from '@/types/models'

/**
 * Comments on a reflection, gated to selected followers.
 *
 * The gate (GHS_ProductArchitecture.md §14.2): a reader on the allow-list gets
 * the comment box; everyone else reads, and sees a quiet notice rather than a
 * disabled-looking form. "Quiet" is the design requirement — a member without
 * comment rights should not feel scolded by the interface.
 *
 * The gate is enforced in the seam as well as here. This component being
 * correct is a courtesy to the reader; the seam being correct is the guarantee.
 */

const MAX_LENGTH = 600

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''
  const mins = Math.round((Date.now() - then) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(then)
}

export function CommentThread({ targetId }: { targetId: string }): JSX.Element {
  const { currentUser, church } = useApp()

  const [comments, setComments] = useState<Comment[]>([])
  const [mayComment, setMayComment] = useState(false)
  const [loading, setLoading] = useState(true)
  const [draft, setDraft] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const churchId = church?.id ?? ''
  const userId = currentUser?.id ?? ''

  const load = useCallback(async () => {
    if (!churchId) return
    setLoading(true)
    try {
      const [list, allowed] = await Promise.all([
        api.listComments(targetId, churchId),
        userId ? api.canComment(userId, churchId) : Promise.resolve(false),
      ])
      setComments(list)
      setMayComment(allowed)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Comments could not be loaded.')
    } finally {
      setLoading(false)
    }
  }, [targetId, churchId, userId])

  useEffect(() => {
    void load()
  }, [load])

  async function submit(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    const body = draft.trim()
    if (!body || submitting || !userId || !churchId) return

    setSubmitting(true)
    setError(null)
    try {
      const created = await api.addComment(targetId, body, userId, churchId)
      setComments((prev) => [...prev, created])
      setDraft('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'That comment could not be posted.')
    } finally {
      setSubmitting(false)
    }
  }

  const remaining = MAX_LENGTH - draft.length

  return (
    <section aria-label="Comments" className="mt-6 border-t border-rule pt-5">
      <h4 className="ghs-overline text-ink-faint">
        {loading ? 'Comments' : `${comments.length} comment${comments.length === 1 ? '' : 's'}`}
      </h4>

      {comments.length > 0 ? (
        <ul className="mt-4 space-y-4">
          {comments.map((c) => (
            <li key={c.id} className="flex gap-3">
              <span
                aria-hidden="true"
                className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cedar/[0.09] font-overline text-[0.5625rem] tracking-normal text-cedar"
              >
                {c.authorInitials}
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-baseline gap-x-2">
                  <span className="text-ui font-semibold text-ink">{c.authorName}</span>
                  <time dateTime={c.createdAt} className="text-[0.71875rem] text-ink-faint">
                    {timeAgo(c.createdAt)}
                  </time>
                </p>
                <p className="mt-1 whitespace-pre-wrap break-words text-[0.875rem] leading-relaxed text-ink-muted">
                  {c.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {/* ---- the gate ---------------------------------------------------- */}
      {mayComment ? (
        <form onSubmit={submit} className="mt-5">
          <label htmlFor={`comment-${targetId}`} className="sr-only">
            Write a comment
          </label>
          <textarea
            id={`comment-${targetId}`}
            value={draft}
            onChange={(e) => setDraft(e.target.value.slice(0, MAX_LENGTH))}
            rows={3}
            placeholder="Add to the conversation…"
            className="ghs-input w-full resize-y leading-relaxed"
          />
          <div className="mt-2.5 flex items-center justify-between gap-3">
            <span className={`text-[0.71875rem] ${remaining < 60 ? 'text-brass-ink' : 'text-ink-faint'}`}>
              {remaining < 60 ? `${remaining} characters left` : ''}
            </span>
            <button
              type="submit"
              disabled={!draft.trim() || submitting}
              className="rounded-full bg-cedar px-5 py-2 text-ui font-semibold text-white transition hover:bg-sanctuary disabled:cursor-not-allowed disabled:opacity-35"
            >
              {submitting ? 'Posting…' : 'Post'}
            </button>
          </div>
        </form>
      ) : (
        <p
          data-testid="comment-gate-notice"
          className="mt-5 rounded-card border border-dashed border-rule bg-parchment px-4 py-3 text-[0.875rem] text-ink-muted"
        >
          Comments are limited to selected members.
        </p>
      )}

      {error ? (
        <p role="alert" className="mt-3 text-[0.875rem] text-brass-ink">
          {error}
        </p>
      ) : null}
    </section>
  )
}

export default CommentThread
