import type { Comment, Question, Reflection, ReviewEvent } from '@/types/models'

/**
 * Sample content for the Today page.
 *
 * Every item here is written by a person and carries an author and an approver,
 * because the "never preach / never counsel" guardrail is not a tone rule — it
 * means no item on this page may be machine-generated. The types in models.ts
 * make `authorId` and `approvedBy` required so that stays true.
 *
 * Two items are deliberately NOT approved (`r-held`, `c-pending`) so the review
 * pipeline is visible in the demo rather than merely asserted: they exist in the
 * data and never reach the screen.
 */

export const SEED_QUESTIONS: Question[] = [
  {
    id: 'q-2026-08-13',
    churchId: 'ghs',
    date: '2026-08-13',
    prompt: {
      en: 'Where did you notice light this week, in a place you did not expect to find it?',
      ml: 'ഈ ആഴ്ചയിൽ നിങ്ങൾ പ്രതീക്ഷിക്കാത്ത ഒരിടത്ത് വെളിച്ചം ശ്രദ്ധിച്ചത് എവിടെയാണ്?',
    },
    scriptureRef: 'Genesis 1:3',
    status: 'approved',
    authorId: 'u-anna',
    authorName: 'Anna Kurian',
    approvedBy: 'u-nibin',
    approvedAt: '2026-08-12T18:20:00.000Z',
  },
  {
    id: 'q-2026-08-14',
    churchId: 'ghs',
    date: '2026-08-14',
    prompt: {
      en: 'Who has been carrying something quietly, that you could ask about today?',
      ml: 'ആരെങ്കിലും നിശ്ശബ്ദമായി എന്തെങ്കിലും ചുമക്കുന്നുണ്ടോ? ഇന്ന് നിങ്ങൾക്ക് ആരോട് ചോദിക്കാനാകും?',
    },
    scriptureRef: 'John 4:6',
    status: 'approved',
    authorId: 'u-anna',
    authorName: 'Anna Kurian',
    approvedBy: 'u-nibin',
    approvedAt: '2026-08-13T18:05:00.000Z',
  },
]

export const SEED_REFLECTIONS: Reflection[] = [
  {
    id: 'r-pastor-1',
    churchId: 'ghs',
    questionId: 'q-2026-08-13',
    authorId: 'u-nibin',
    authorName: 'Pastor Nibin',
    authorRole: 'pastor',
    isPastor: true,
    body: {
      en: 'The first thing said over the world was not a rule. It was light. I keep returning to how ordinary the week has to be before you notice that — a kitchen at six in the morning, a bus window, someone remembering your name. I am not asking you to find a lesson in it. Only to notice where it fell.',
      ml: 'ലോകത്തിനുമേൽ ആദ്യം പറഞ്ഞത് ഒരു നിയമമായിരുന്നില്ല; അത് വെളിച്ചമായിരുന്നു. അത് ശ്രദ്ധിക്കാൻ ആഴ്ച എത്ര സാധാരണമായിരിക്കണം എന്നതിലേക്ക് ഞാൻ വീണ്ടും മടങ്ങുന്നു — രാവിലെ ആറുമണിക്കുള്ള ഒരു അടുക്കള, ഒരു ബസ് ജനൽ, നിങ്ങളുടെ പേര് ഓർത്തെടുക്കുന്ന ഒരാൾ. അതിൽനിന്ന് ഒരു പാഠം കണ്ടെത്താൻ ഞാൻ ആവശ്യപ്പെടുന്നില്ല. അത് എവിടെ വീണു എന്ന് ശ്രദ്ധിച്ചാൽ മാത്രം മതി.',
    },
    createdAt: '2026-08-13T05:40:00.000Z',
    status: 'approved',
  },
  {
    id: 'r-comm-1',
    churchId: 'ghs',
    questionId: 'q-2026-08-13',
    authorId: 'u-mary',
    authorName: 'Mary Thomas',
    authorRole: 'member',
    isPastor: false,
    body: {
      en: 'On Tuesday the power went out on our street for most of the evening. The neighbours all ended up outside on the steps because there was nothing else to do. We have lived there eleven years. It was the longest anyone had spoken to us.',
      ml: 'ചൊവ്വാഴ്ച ഞങ്ങളുടെ തെരുവിൽ വൈകുന്നേരം മുഴുവൻ വൈദ്യുതി ഇല്ലായിരുന്നു. വേറൊന്നും ചെയ്യാനില്ലാത്തതിനാൽ അയൽക്കാരെല്ലാം പടികളിൽ പുറത്തിരുന്നു. പതിനൊന്നു വർഷമായി ഞങ്ങൾ അവിടെ താമസിക്കുന്നു. ആരെങ്കിലും ഞങ്ങളോട് സംസാരിച്ച ഏറ്റവും ദൈർഘ്യമേറിയ സമയമായിരുന്നു അത്.',
    },
    createdAt: '2026-08-13T07:12:00.000Z',
    status: 'approved',
  },
  {
    id: 'r-comm-2',
    churchId: 'ghs',
    questionId: 'q-2026-08-13',
    authorId: 'u-john',
    authorName: 'John Varghese',
    authorRole: 'member',
    isPastor: false,
    body: {
      en: 'My father has not been well. I have been counting the days badly — I mean I have been counting them as things to get through. On Thursday he asked me to open the window and I did, and neither of us said anything for a while. That was the whole of it.',
      ml: 'എന്റെ അപ്പന് സുഖമില്ല. ഞാൻ ദിവസങ്ങൾ മോശമായി എണ്ണിക്കൊണ്ടിരിക്കുകയായിരുന്നു — കടന്നുപോകേണ്ട കാര്യങ്ങളായി മാത്രം. വ്യാഴാഴ്ച ജനൽ തുറക്കാൻ അപ്പൻ എന്നോട് പറഞ്ഞു, ഞാൻ തുറന്നു; കുറച്ചുനേരം ഞങ്ങളാരും ഒന്നും പറഞ്ഞില്ല. അത്രമാത്രമായിരുന്നു അത്.',
    },
    createdAt: '2026-08-13T08:03:00.000Z',
    status: 'approved',
  },
  {
    // Held in review. Proves the pipeline: present in the data, absent from the page.
    id: 'r-held',
    churchId: 'ghs',
    questionId: 'q-2026-08-13',
    authorId: 'u-mary',
    authorName: 'Mary Thomas',
    authorRole: 'member',
    isPastor: false,
    body: {
      en: 'A draft reflection that a reviewer has held. It must never appear on a member-facing page.',
      ml: 'ഒരു അവലോകകൻ തടഞ്ഞുവെച്ച ഒരു കരട് പ്രതിഫലനം. ഇത് അംഗങ്ങൾ കാണുന്ന പേജിൽ ഒരിക്കലും വരാൻ പാടില്ല.',
    },
    createdAt: '2026-08-13T08:30:00.000Z',
    status: 'held',
  },
]

export const SEED_COMMENTS: Comment[] = [
  {
    id: 'c-1',
    targetId: 'r-pastor-1',
    churchId: 'ghs',
    authorId: 'u-mary',
    authorName: 'Mary Thomas',
    authorInitials: 'MT',
    body: 'The kitchen at six in the morning. Yes. That is exactly the hour I would have skipped over.',
    createdAt: '2026-08-13T06:20:00.000Z',
    status: 'approved',
  },
  {
    id: 'c-2',
    targetId: 'r-pastor-1',
    churchId: 'ghs',
    authorId: 'u-anna',
    authorName: 'Anna Kurian',
    authorInitials: 'AK',
    body: 'Reading this before the household wakes up. Thank you for not turning it into a lesson.',
    createdAt: '2026-08-13T06:48:00.000Z',
    status: 'approved',
  },
  {
    // Pending review — must not render for members.
    id: 'c-pending',
    targetId: 'r-pastor-1',
    churchId: 'ghs',
    authorId: 'u-mary',
    authorName: 'Mary Thomas',
    authorInitials: 'MT',
    body: 'A comment still awaiting review. It must not be visible to members.',
    createdAt: '2026-08-13T09:00:00.000Z',
    status: 'pending_review',
  },
]

/** The audit trail (GHS_ProductArchitecture.md §5). */
export const SEED_REVIEW_EVENTS: ReviewEvent[] = [
  {
    id: 're-1',
    entityType: 'question',
    entityId: 'q-2026-08-13',
    from: 'pending_review',
    to: 'approved',
    actorId: 'u-nibin',
    at: '2026-08-12T18:20:00.000Z',
    note: 'Approved for 13 August.',
  },
  {
    id: 're-2',
    entityType: 'reflection',
    entityId: 'r-held',
    from: 'pending_review',
    to: 'held',
    actorId: 'u-anna',
    at: '2026-08-13T08:35:00.000Z',
    note: 'Held pending a conversation with the author.',
  },
]
