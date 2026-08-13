import { api } from '@/services/api'
import { useApp } from '@/context/AppContext'
import { useAsync } from '@/lib/useAsync'
import QuestionOfTheDay from './QuestionOfTheDay'
import ReflectionCard from './ReflectionCard'
import ArtifactOfTheDay from './ArtifactOfTheDay'
import RhythmCard from './RhythmCard'
import type { Artifact, Question, Reflection } from '@/types/models'
import type { ReadingRhythm } from '@/lib/rhythm'

/**
 * The Today page — the daily home a member lands on (GHS_MVP_Brief.md §3.1).
 *
 * Reading column on the left: question of the day, the pastor's reflection with
 * the gated comment thread, then community reflections. Companion column on the
 * right: the artifact of the day and the reading rhythm. On a phone the
 * companion column follows the reading, because the reading is what someone
 * opens the page for.
 *
 * Everything is read through `api.*` — this screen has no data layer of its own,
 * which is what makes the production cutover a body swap (§1).
 */

interface TodayData {
  question: Question | null
  reflections: Reflection[]
  artifact: Artifact | null
  rhythm: ReadingRhythm
}

function Skeleton(): JSX.Element {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Loading today">
      <div className="ghs-card h-48 animate-pulse" />
      <div className="ghs-card h-64 animate-pulse" />
    </div>
  )
}

export function TodayPage(): JSX.Element {
  const { church } = useApp()
  const churchId = church?.id ?? ''

  const { data, loading, error, reload } = useAsync<TodayData>(async () => {
    if (!churchId) {
      return { question: null, reflections: [], artifact: null, rhythm: { streakDays: 0, week: [] } }
    }

    const question = await api.getTodayQuestion(churchId)
    const [reflections, artifact, rhythm] = await Promise.all([
      api.getReflections(churchId, question?.id),
      api.getArtifactOfDay(),
      // Opening Today is what counts as a reading day, so recording it belongs
      // here rather than in a separate effect that could drift out of step.
      api.recordReadingDay(churchId),
    ])
    return { question, reflections, artifact, rhythm }
  }, [churchId])

  if (error) {
    return (
      <div role="alert" className="ghs-card mx-auto my-12 max-w-reading p-8 text-center">
        <p className="ghs-overline">Today could not be loaded</p>
        <p className="mt-3 text-ui text-ink-muted">{error}</p>
        <button
          type="button"
          onClick={reload}
          className="mt-6 rounded-full border border-rule px-5 py-2 text-ui text-cedar transition hover:bg-parchment"
        >
          Try again
        </button>
      </div>
    )
  }

  const pastor = data?.reflections.filter((r) => r.isPastor) ?? []
  const community = data?.reflections.filter((r) => !r.isPastor) ?? []

  return (
    <div className="mx-auto w-full max-w-[76rem] px-4 py-6 sm:px-6 sm:py-8">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-6">
        {/* -- reading column ------------------------------------------- */}
        <div className="min-w-0 space-y-5">
          {loading ? (
            <Skeleton />
          ) : (
            <>
              {data?.question ? (
                <QuestionOfTheDay question={data.question} />
              ) : (
                <section className="ghs-card px-6 py-10 text-center">
                  <p className="ghs-overline">Question of the day</p>
                  <p className="mt-3 font-display text-xl text-ink">
                    No question has been published yet.
                  </p>
                  <p className="mt-2 text-ui text-ink-muted">
                    Questions are written and approved by a person before they appear here.
                  </p>
                </section>
              )}

              {/* The pastor's reflection anchors the page and carries comments. */}
              {pastor.map((r) => (
                <ReflectionCard key={r.id} reflection={r} withComments />
              ))}

              {community.length > 0 ? (
                <section aria-labelledby="community-heading" className="space-y-4 pt-1">
                  <h2 id="community-heading" className="ghs-overline px-1 text-ink-faint">
                    Community reflections
                  </h2>
                  {community.map((r) => (
                    <ReflectionCard key={r.id} reflection={r} />
                  ))}
                </section>
              ) : null}
            </>
          )}
        </div>

        {/* -- companion column ------------------------------------------ */}
        <aside className="min-w-0 space-y-5 lg:sticky lg:top-6 lg:self-start">
          {loading ? (
            <div className="ghs-card h-80 animate-pulse" />
          ) : (
            <>
              {data?.artifact ? <ArtifactOfTheDay artifact={data.artifact} /> : null}
              {data?.rhythm && data.rhythm.week.length > 0 ? (
                <RhythmCard rhythm={data.rhythm} />
              ) : null}
            </>
          )}
        </aside>
      </div>
    </div>
  )
}

export default TodayPage
