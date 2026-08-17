// Seed/fixture data for the mocked demo: a believable sample week for two
// tenants. Internal to the services layer — screens must go through
// src/services/api.ts, never import this file directly.
//
// Genesis 1 (EN) is the World English Bible (WEB), public domain.
// Genesis 1 (ML) is rendered in the register of the public-domain Malayalam
// "Old Version" (~1910, British & Foreign Bible Society); reproduced here to
// the best of available knowledge for offline demo use — swap for a verified
// licensed source before any real deployment.

import type {
  Artifact,
  Book,
  Church,
  Comment,
  Devotional,
  FeedItem,
  GivingFund,
  JournalEntry,
  LexiconEntry,
  PrayerRequest,
  PrayerRoom,
  Question,
  Reflection,
  Reminder,
  Sermon,
  SmallGroup,
  User,
  Verse,
  VideoProject,
} from '../types/models'

export interface Db {
  churches: Church[]
  users: User[]
  sermons: Sermon[]
  devotionals: Devotional[]
  questions: Question[]
  reflections: Reflection[]
  comments: Comment[]
  feedItems: FeedItem[]
  prayerRooms: PrayerRoom[]
  prayerRequests: PrayerRequest[]
  smallGroups: SmallGroup[]
  givingFunds: GivingFund[]
  reminders: Reminder[]
  videoProjects: VideoProject[]
  artifacts: Artifact[]
  books: Book[]
  verses: Verse[]
  lexicon: LexiconEntry[]
  journalEntries: JournalEntry[]
}

const GHS = 'ghs'
const KF = 'kerala-fellowship'

export const seed: Db = {
  churches: [
    {
      id: GHS,
      slug: 'ghs',
      name: {
        en: 'Gift of Holy Spirit International Ministries',
        ml: 'ഗിഫ്റ്റ് ഓഫ് ഹോളി സ്പിരിറ്റ് ഇന്റർനാഷണൽ മിനിസ്ട്രീസ്',
      },
      theme: { primary: 'spirit', accent: 'gold' },
      components: [
        'feed',
        'sermons',
        'devotionals',
        'questions',
        'reflections',
        'prayer',
        'groups',
        'giving',
        'reminders',
        'video',
        'artifacts',
        'bible',
        'review',
        'admin',
      ],
    },
    {
      id: KF,
      slug: 'kerala-fellowship',
      name: { en: 'Kerala Fellowship', ml: 'കേരള ഫെല്ലോഷിപ്പ്' },
      theme: { primary: 'spirit', accent: 'plum' },
      parentChurchId: GHS,
      // Lighter, Malayalam-forward partner: no sermon library, giving, video,
      // reminders desk, or admin console of its own yet.
      components: ['feed', 'devotionals', 'questions', 'reflections', 'prayer', 'groups', 'artifacts', 'bible', 'review'],
    },
  ],

  users: [
    { id: 'gh-u-member', name: 'Neha George', churchId: GHS, role: 'member', canComment: true },
    { id: 'gh-u-member-muted', name: 'Blessy Samuel', churchId: GHS, role: 'member', canComment: false },
    { id: 'gh-u-reviewer', name: 'Reeba Varghese', churchId: GHS, role: 'reviewer', canComment: true },
    { id: 'gh-u-pastor', name: 'Pastor Thomas Eapen', churchId: GHS, role: 'pastor', canComment: true },
    { id: 'gh-u-admin', name: 'Vinod Kurian', churchId: GHS, role: 'admin', canComment: true },
    { id: 'kf-u-member', name: 'Ansu Thomas', churchId: KF, role: 'member', canComment: true },
    { id: 'kf-u-reviewer', name: 'Jibin Chacko', churchId: KF, role: 'reviewer', canComment: true },
    { id: 'kf-u-pastor', name: 'Pastor Sam Varghese', churchId: KF, role: 'pastor', canComment: true },
    { id: 'kf-u-admin', name: 'Divya Nair', churchId: KF, role: 'admin', canComment: true },
  ],

  // ---- Sermons: GHS "Named by God" Genesis series -------------------------
  sermons: [
    {
      id: 'gh-s1',
      churchId: GHS,
      title: { en: 'Named by God: Wrestling Till Dawn', ml: 'ദൈവം പേരിട്ടവൻ: പുലരുവോളം മല്ലയുദ്ധം' },
      speaker: 'Pastor Thomas Eapen',
      date: '2026-08-09',
      transcript: {
        en: "Tonight I want you to picture Jacob, alone, in the dark, at a river called Jabbok. Everything he's built is behind him, and ahead of him is a brother he wronged twenty years ago. In that darkness, a stranger wrestles with him until the sun comes up, and Jacob won't let go. Even wounded, even limping, he says, 'I will not let you go unless you bless me.' Then comes a question that changes everything: 'What is your name?' Not because the stranger doesn't know it — but because Jacob needs to say it out loud. 'Jacob.' The deceiver. The one who grabs the heel. And God says, 'Your name will no longer be Jacob. It will be Israel — because you have wrestled with God and with men, and you have prevailed.' Church, some of us have been running from a name too. Tonight, God isn't done with you. He's renaming you in the dark before He ever sends you into the light.",
        ml: 'യാബ്ബോക്ക് നദിക്കരികെ ഇരുട്ടിൽ ഒറ്റയ്ക്കായ യാക്കോബിനെ ഓർക്കുക. അവൻ കെട്ടിപ്പടുത്തതെല്ലാം പിന്നിലാണ്, മുന്നിലോ ഇരുപതു വർഷം മുമ്പ് വഞ്ചിച്ച സഹോദരൻ. ആ ഇരുട്ടിൽ ഒരാൾ അവനോടു പുലരുവോളം മല്ലയുദ്ധം ചെയ്തു. യാക്കോബ് വിടാൻ കൂട്ടാക്കിയില്ല: \'എന്നെ അനുഗ്രഹിക്കാതെ ഞാൻ നിന്നെ വിടുകയില്ല.\' അപ്പോൾ ചോദ്യം വന്നു: \'നിന്റെ പേരെന്ത്?\' — \'യാക്കോബ്.\' ചതിയൻ. കുതികാൽ പിടിക്കുന്നവൻ. ദൈവം പറഞ്ഞു: \'ഇനി നിന്റെ പേർ യാക്കോബ് എന്നല്ല, യിസ്രായേൽ എന്നായിരിക്കും; നീ ദൈവത്തോടും മനുഷ്യരോടും പോരാടി ജയിച്ചു.\' സഭയേ, നമ്മളിൽ ചിലരും ഒരു പേരിൽനിന്ന് ഓടിക്കൊണ്ടിരിക്കുന്നു. ഇന്നു രാത്രി, ദൈവം നിന്നെ ഇരുട്ടിൽ പുതിയ പേരു വിളിക്കുന്നു — വെളിച്ചത്തിലേക്ക് അയക്കുന്നതിനു മുമ്പേ.',
      },
    },
    {
      id: 'gh-s2',
      churchId: GHS,
      title: { en: 'Named by God: The God Who Sees', ml: 'ദൈവം പേരിട്ടവൻ: കാണുന്ന ദൈവം' },
      speaker: 'Pastor Thomas Eapen',
      date: '2026-08-16',
      transcript: {
        en: "Hagar is running. She is pregnant, alone, and cast out into the wilderness — invisible, by every measure of her world. And it's there, by a spring in the desert, that the angel of the Lord finds her. Not the other way around. He finds her. After that encounter, Hagar does something no one else in Scripture does first — she gives God a name. She calls Him El Roi — 'the God who sees me.' Not sees things in general. Sees her, specifically, in her specific wilderness, with her specific fear. Church, before you ever had a name for God, He already had eyes on you. Whatever wilderness you're walking through this week, you are not unseen. You are not forgotten. He is El Roi, and He has already found you.",
        ml: 'ഹാഗാർ ഓടുകയാണ്. ഗർഭിണിയായി, ഒറ്റയ്ക്കായി, മരുഭൂമിയിലേക്കു തള്ളപ്പെട്ടവളായി — ആരും കാണാത്തവൾ. എന്നാൽ മരുഭൂമിയിലെ ഒരു നീരുറവയ്ക്കരികെ യഹോവയുടെ ദൂതൻ അവളെ കണ്ടെത്തി. അവളല്ല, അവനാണ് അവളെ കണ്ടെത്തിയത്. അതിനുശേഷം ഹാഗാർ ദൈവത്തിനു ഒരു പേരു നൽകുന്നു: \'ഏൽ റോയി\' — \'എന്നെ കാണുന്ന ദൈവം.\' പൊതുവേ കാണുന്നവനല്ല, അവളെ പ്രത്യേകം കാണുന്നവൻ. സഭയേ, നിങ്ങൾ ദൈവത്തിനു ഒരു പേരു നൽകുന്നതിനു മുമ്പേ, അവൻ നിങ്ങളെ നോക്കിക്കൊണ്ടിരുന്നു. ഈ ആഴ്ച നിങ്ങൾ ഏതു മരുഭൂമിയിലൂടെ കടന്നുപോയാലും, നിങ്ങൾ കാണപ്പെടാത്തവരല്ല.',
      },
    },
  ],

  // ---- Devotionals: GHS sample week Aug 10-16, plus 2 lighter KF ones ------
  devotionals: [
    {
      id: 'gh-d1',
      churchId: GHS,
      title: { en: 'Wrestling in the Dark', ml: 'ഇരുട്ടിലെ മല്ലയുദ്ധം' },
      body: {
        en: "Jacob's turning point didn't come in a sanctuary — it came alone, at night, at a river he had to cross. Maybe your turning point looks like that too: unglamorous, exhausting, and closer than you think. Don't let go before the blessing comes.",
        ml: 'യാക്കോബിന്റെ വഴിത്തിരിവു വന്നത് ഒരു ദേവാലയത്തിലല്ല — രാത്രിയിൽ, ഒറ്റയ്ക്ക്, കടക്കേണ്ട ഒരു നദിക്കരികെ ആയിരുന്നു. നിന്റെ വഴിത്തിരിവും അതുപോലെ ആയിരിക്കാം: അലങ്കാരമില്ലാത്തതും ക്ഷീണിപ്പിക്കുന്നതും, എന്നാൽ നീ കരുതുന്നതിലും അടുത്തതും. അനുഗ്രഹം വരുന്നതിനു മുമ്പേ വിട്ടുകളയരുത്.',
      },
      day: '2026-08-10',
      sourceSermonId: 'gh-s1',
      narratorName: 'Neha George',
      status: 'approved',
    },
    {
      id: 'gh-d2',
      churchId: GHS,
      title: { en: "A Name You Didn't Choose", ml: 'നീ തിരഞ്ഞെടുക്കാത്ത ഒരു പേര്' },
      body: {
        en: "Jacob means 'the one who grabs the heel' — a name given at birth, before he ever made a choice. Israel means 'he strives with God' — a name given after a fight he almost lost. God is more interested in who you're becoming than who you've been.",
        ml: "'യാക്കോബ്' എന്നാൽ 'കുതികാൽ പിടിക്കുന്നവൻ' എന്നർത്ഥം — ജനിക്കുമ്പോൾ തന്നെ കിട്ടിയ പേര്. 'യിസ്രായേൽ' എന്നാൽ 'ദൈവത്തോടു പോരാടുന്നവൻ' — തോൽക്കുമായിരുന്ന ഒരു പോരാട്ടത്തിനു ശേഷം കിട്ടിയ പേര്. നീ ആരായിരുന്നു എന്നതിനെക്കാൾ, നീ ആരായി മാറുന്നു എന്നതിലാണ് ദൈവത്തിനു താല്പര്യം.",
      },
      day: '2026-08-11',
      sourceSermonId: 'gh-s1',
      narratorName: 'Neha George',
      status: 'approved',
    },
    {
      id: 'gh-d3',
      churchId: GHS,
      title: { en: 'Limping Into the Blessing', ml: 'മുടന്തിക്കൊണ്ടു അനുഗ്രഹത്തിലേക്ക്' },
      body: {
        en: "Jacob walked away from that night blessed and limping. Scripture doesn't hide the cost of the encounter — it just insists the blessing was worth it. Some seasons leave a mark. That doesn't mean God wasn't in them.",
        ml: 'ആ രാത്രിക്കുശേഷം യാക്കോബ് അനുഗ്രഹിക്കപ്പെട്ടവനായി, എന്നാൽ മുടന്തിക്കൊണ്ടു നടന്നു. അനുഭവത്തിന്റെ വില തിരുവെഴുത്തു മറച്ചുവെക്കുന്നില്ല — അനുഗ്രഹം അതിനു യോഗ്യമായിരുന്നു എന്നു മാത്രം ഉറപ്പിക്കുന്നു. ചില കാലങ്ങൾ ഒരു അടയാളം അവശേഷിപ്പിക്കും. അതിനർത്ഥം ദൈവം അതിലില്ലായിരുന്നു എന്നല്ല.',
      },
      day: '2026-08-12',
      sourceSermonId: 'gh-s1',
      narratorName: 'Reeba Varghese',
      status: 'pending_review',
    },
    {
      id: 'gh-d4',
      churchId: GHS,
      title: { en: 'Peniel: Seeing God and Living', ml: 'പെനീയേൽ: ദൈവത്തെ കണ്ടു ജീവിച്ചവൻ' },
      body: {
        en: "Jacob named the place Peniel — 'the face of God' — because he expected the encounter to cost him his life, and instead it gave him one. Sometimes the thing we're most afraid to face is the very place we meet God.",
        ml: "യാക്കോബ് ആ സ്ഥലത്തിനു 'പെനീയേൽ' എന്നു പേരിട്ടു — 'ദൈവത്തിന്റെ മുഖം' എന്നർത്ഥം — കാരണം ആ കൂടിക്കാഴ്ച തന്റെ ജീവൻ അപഹരിക്കുമെന്നു കരുതി, എന്നാൽ അതു അവനു പുതിയൊരു ജീവിതം നൽകി. ചിലപ്പോൾ നാം ഏറ്റവും ഭയപ്പെടുന്ന കാര്യം തന്നെയാണ് ദൈവത്തെ കണ്ടുമുട്ടുന്ന സ്ഥലം.",
      },
      day: '2026-08-13',
      sourceSermonId: 'gh-s1',
      narratorName: 'Pastor Thomas Eapen',
      status: 'approved',
    },
    {
      id: 'gh-d5',
      churchId: GHS,
      title: { en: 'Seen Before You Were Sure', ml: 'നീ ഉറപ്പാകുന്നതിനു മുമ്പേ കാണപ്പെട്ടവൾ' },
      body: {
        en: 'No one sent help to Hagar. No one even seemed to notice she was gone. And yet, in the wilderness, she was found first — before she prayed, before she named anything. Being unseen by everyone else has never meant being unseen by God.',
        ml: 'ഹാഗാറിനെ സഹായിക്കാൻ ആരും അയച്ചില്ല. അവൾ പോയതു പോലും ആരും ശ്രദ്ധിച്ചില്ല. എന്നിട്ടും മരുഭൂമിയിൽ അവൾ ആദ്യം കണ്ടെത്തപ്പെട്ടു — അവൾ പ്രാർത്ഥിക്കുന്നതിനു മുമ്പേ, ഒരു പേരു നൽകുന്നതിനു മുമ്പേ. മറ്റുള്ളവർ കാണാതെ പോകുന്നത് ദൈവം കാണാതെ പോകുന്നു എന്നല്ല.',
      },
      day: '2026-08-14',
      sourceSermonId: 'gh-s2',
      narratorName: 'Reeba Varghese',
      status: 'pending_review',
    },
    {
      id: 'gh-d6',
      churchId: GHS,
      title: { en: 'El Roi: A Name We Give Back', ml: 'ഏൽ റോയി: നാം തിരികെ നൽകുന്ന പേര്' },
      body: {
        en: "Hagar is the only person in Scripture who names God. Not a prophet, not a patriarch — a servant with no status in her world. Worship isn't reserved for people with standing. It belongs to anyone who has truly been seen.",
        ml: 'തിരുവെഴുത്തിൽ ദൈവത്തിനു പേരിടുന്ന ഏകവ്യക്തി ഹാഗാർ ആണ്. ഒരു പ്രവാചകനല്ല, ഒരു ഗോത്രപിതാവുമല്ല — തന്റെ ലോകത്തിൽ യാതൊരു സ്ഥാനവുമില്ലാത്ത ഒരു ദാസി. ആരാധന സ്ഥാനമുള്ളവർക്കു മാത്രമുള്ളതല്ല. യഥാർത്ഥത്തിൽ കാണപ്പെട്ട ആർക്കും അതു അവകാശപ്പെട്ടതാണ്.',
      },
      day: '2026-08-15',
      sourceSermonId: 'gh-s2',
      narratorName: 'Neha George',
      status: 'approved',
    },
    {
      id: 'gh-d7',
      churchId: GHS,
      title: { en: 'Living Between the Wells', ml: 'കിണറുകൾക്കിടയിലെ ജീവിതം' },
      body: {
        en: "Hagar's story doesn't end at the well — she still had to walk back into a hard household. But she walked back different, carrying a name for God that no one could take from her. Some circumstances don't change. What changes is what you now know is true.",
        ml: 'ഹാഗാറിന്റെ കഥ ആ കിണറ്റിൽ അവസാനിക്കുന്നില്ല — അവൾക്കു വീണ്ടും ആ കഠിനമായ വീട്ടിലേക്കു തിരികെ പോകേണ്ടിവന്നു. എന്നാൽ ആരും അപഹരിക്കാൻ കഴിയാത്ത ഒരു പേരു ദൈവത്തിനു നൽകിക്കൊണ്ട് അവൾ വേറൊരാളായി തിരികെ നടന്നു. ചില സാഹചര്യങ്ങൾ മാറില്ല. നീ ഇപ്പോൾ സത്യമെന്നറിയുന്നതാണ് മാറുന്നത്.',
      },
      day: '2026-08-16',
      sourceSermonId: 'gh-s2',
      narratorName: 'Pastor Thomas Eapen',
      status: 'pending_review',
    },
    {
      id: 'kf-d1',
      churchId: KF,
      title: { en: 'Steadfast Love', ml: 'സ്ഥിരമായ സ്നേഹം' },
      body: {
        en: "The Lord's mercies are new every morning — not recycled, not worn thin from yesterday's failures, but new. Whatever burned out in you this week, His faithfulness didn't burn with it.",
        ml: 'യഹോവയുടെ കരുണകൾ ഓരോ പ്രഭാതത്തിലും പുതിയതാണ് — ഇന്നലത്തെ പരാജയങ്ങളാൽ പഴകിയതല്ല, പുതിയതു തന്നെ. ഈ ആഴ്ച നിന്നിൽ എന്തു കത്തിത്തീർന്നാലും, അവന്റെ വിശ്വസ്തത അതോടൊപ്പം കത്തിയില്ല.',
      },
      day: '2026-08-11',
      narratorName: 'Ansu Thomas',
      status: 'approved',
    },
    {
      id: 'kf-d2',
      churchId: KF,
      title: { en: 'A Quiet Trust', ml: 'ശാന്തമായ വിശ്വാസം' },
      body: {
        en: "'Be still and know that I am God' was never a suggestion for a slow week. It was written for the loud ones. Stillness isn't the absence of noise — it's trust in the middle of it.",
        ml: "'അടങ്ങിയിരിക്കുവിൻ, ഞാൻ ദൈവം ആകുന്നു എന്നറിവിൻ' എന്നതു ശാന്തമായ ആഴ്ചക്കു വേണ്ടിയുള്ള നിർദ്ദേശമല്ല. ഒച്ചപ്പാടുള്ള ആഴ്ചകൾക്കു വേണ്ടിയാണ് അതു എഴുതിയത്. നിശ്ശബ്ദത എന്നാൽ ശബ്ദമില്ലായ്മയല്ല — അതിനു നടുവിലുള്ള വിശ്വാസമാണ്.",
      },
      day: '2026-08-14',
      narratorName: 'Jibin Chacko',
      status: 'pending_review',
    },
  ],

  // ---- Questions: GHS daily week + one KF ----------------------------------
  questions: [
    { id: 'gh-q1', churchId: GHS, prompt: { en: 'When have you refused to let go of God until He blessed you?', ml: 'ദൈവം അനുഗ്രഹിക്കുവോളം നീ വിടാതെ പിടിച്ചു നിന്ന ഒരു നിമിഷം ഓർക്കുക.' }, day: '2026-08-10', sourceSermonId: 'gh-s1', status: 'approved' },
    { id: 'gh-q2', churchId: GHS, prompt: { en: 'What name or label from your past is God asking you to release?', ml: 'ഭൂതകാലത്തിലെ ഏതു പേരോ മുദ്രയോ വിട്ടുകളയാൻ ദൈവം നിന്നോടു ആവശ്യപ്പെടുന്നു?' }, day: '2026-08-11', sourceSermonId: 'gh-s1', status: 'approved' },
    { id: 'gh-q3', churchId: GHS, prompt: { en: 'What has this season cost you — and was it worth it?', ml: 'ഈ കാലം നിന്നിൽനിന്ന് എന്തു വിലയിട്ടു — അതു യോഗ്യമായിരുന്നോ?' }, day: '2026-08-12', sourceSermonId: 'gh-s1', status: 'approved' },
    { id: 'gh-q4', churchId: GHS, prompt: { en: 'What are you most afraid to bring honestly before God?', ml: 'ദൈവത്തിന്റെ മുമ്പിൽ സത്യസന്ധമായി കൊണ്ടുവരാൻ നീ ഏറ്റവും ഭയപ്പെടുന്നത് എന്ത്?' }, day: '2026-08-13', sourceSermonId: 'gh-s1', status: 'pending_review' },
    { id: 'gh-q5', churchId: GHS, prompt: { en: 'When have you felt truly unseen — and how might God have been present there?', ml: 'എപ്പോഴെങ്കിലും നീ യഥാർത്ഥത്തിൽ കാണപ്പെടാത്തവളാണ് എന്നു തോന്നിയോ — അവിടെ ദൈവം സന്നിഹിതനായിരുന്നത് എങ്ങനെ?' }, day: '2026-08-14', sourceSermonId: 'gh-s2', status: 'approved' },
    { id: 'gh-q6', churchId: GHS, prompt: { en: 'Who in your life might need you to notice them the way God noticed Hagar?', ml: 'ദൈവം ഹാഗാറിനെ ശ്രദ്ധിച്ചതുപോലെ, നിന്റെ ജീവിതത്തിൽ ആരെയാണ് നീ ശ്രദ്ധിക്കേണ്ടത്?' }, day: '2026-08-15', sourceSermonId: 'gh-s2', status: 'approved' },
    { id: 'gh-q7', churchId: GHS, prompt: { en: 'What name would you give God based on how He has met you this week?', ml: 'ഈ ആഴ്ച ദൈവം നിന്നെ കണ്ടുമുട്ടിയ വിധം അനുസരിച്ച്, നീ അവനു എന്തു പേരു നൽകും?' }, day: '2026-08-16', sourceSermonId: 'gh-s2', status: 'approved' },
    { id: 'kf-q1', churchId: KF, prompt: { en: 'How has God shown His steadfast love to you this week?', ml: 'ഈ ആഴ്ച ദൈവം തന്റെ സ്ഥിരമായ സ്നേഹം നിനക്കു എങ്ങനെ കാണിച്ചു?' }, day: '2026-08-12', status: 'approved' },
  ],

  // ---- Reflections: The Assembly --------------------------------------------
  reflections: [
    {
      id: 'gh-ref1',
      churchId: GHS,
      author: 'Pastor Thomas Eapen',
      body: {
        en: "This series has been on my heart for months. So many of us carry a name we never chose — words spoken over us by people who didn't know what they were doing. I wanted us to sit with two people in Genesis who walked away from an encounter with God carrying a new name instead. My prayer is that by Sunday, some of you leave this room the same way.",
        ml: 'ഈ പരമ്പര മാസങ്ങളായി എന്റെ ഹൃദയത്തിലുണ്ടായിരുന്നു. നമ്മളിൽ പലരും തിരഞ്ഞെടുക്കാത്ത ഒരു പേരു വഹിക്കുന്നു — എന്തു ചെയ്യുന്നു എന്നറിയാതെ മറ്റുള്ളവർ പറഞ്ഞ വാക്കുകൾ. ഉല്പത്തിയിലെ രണ്ടു പേരോടൊപ്പം ഇരിക്കാൻ ഞാൻ ആഗ്രഹിച്ചു — ദൈവവുമായുള്ള കൂടിക്കാഴ്ചയിൽനിന്നു പുതിയ പേരുമായി മടങ്ങിയവർ. ഞായറാഴ്ചയോടെ, നിങ്ങളിൽ ചിലരും അതുപോലെ ഈ മുറി വിട്ടുപോകട്ടെ എന്നു ഞാൻ പ്രാർത്ഥിക്കുന്നു.',
      },
      isPastor: true,
    },
    {
      id: 'gh-ref2',
      churchId: GHS,
      author: 'Neha George',
      body: {
        en: "I've always identified with the 'grabber' in Jacob's story more than I'd like to admit. This week made me ask what I'm still trying to grab for myself instead of trusting God to hold.",
        ml: 'യാക്കോബിന്റെ കഥയിലെ \'പിടിച്ചുവാങ്ങുന്നവനോട്\' ഞാൻ എപ്പോഴും സാമ്യം തോന്നിയിട്ടുണ്ട്, സമ്മതിക്കാൻ ഇഷ്ടമില്ലെങ്കിലും. ദൈവം കൈവശം വെക്കട്ടെ എന്നു വിശ്വസിക്കുന്നതിനു പകരം ഇപ്പോഴും ഞാൻ എന്തിനു വേണ്ടി പിടിവലി നടത്തുന്നു എന്നു ഈ ആഴ്ച എന്നോടു ചോദിപ്പിച്ചു.',
      },
      isPastor: false,
    },
    {
      id: 'gh-ref3',
      churchId: GHS,
      author: 'Vinod Kurian',
      body: {
        en: 'El Roi hit different for me this year. Lost my job in March and felt completely invisible in every room I walked into. Reading that Hagar was found before she even asked to be — that\'s the reminder I needed.',
        ml: 'ഈ വർഷം എനിക്കു \'ഏൽ റോയി\' വേറൊരു അർത്ഥം നൽകി. മാർച്ചിൽ ജോലി നഷ്ടപ്പെട്ടു, ഓരോ മുറിയിലും ഞാൻ പൂർണ്ണമായും അദൃശ്യനാണെന്നു തോന്നി. ഹാഗാർ ചോദിക്കുന്നതിനു മുമ്പേ കണ്ടെത്തപ്പെട്ടു എന്നു വായിച്ചത് — അതാണ് എനിക്കു വേണ്ടിയിരുന്ന ഓർമ്മപ്പെടുത്തൽ.',
      },
      isPastor: false,
    },
    {
      id: 'kf-ref1',
      churchId: KF,
      author: 'Pastor Sam Varghese',
      body: {
        en: "Our fellowship is small, but I've watched God be faithful to every single family in this room. His mercies really are new every morning — I've seen it in our own waiting room this year.",
        ml: 'നമ്മുടെ കൂട്ടായ്മ ചെറുതാണ്, എന്നാൽ ഈ മുറിയിലെ ഓരോ കുടുംബത്തോടും ദൈവം വിശ്വസ്തനായിരിക്കുന്നതു ഞാൻ കണ്ടു. അവന്റെ കരുണകൾ ഓരോ പ്രഭാതത്തിലും പുതിയതാണ് — ഈ വർഷം നമ്മുടെ കാത്തിരിപ്പിൽ ഞാൻ അതു കണ്ടു.',
      },
      isPastor: true,
    },
    {
      id: 'kf-ref2',
      churchId: KF,
      author: 'Ansu Thomas',
      body: {
        en: "Be still and know — that verse has been hard for me this year with a new baby and a new city. Still learning what 'still' even means right now.",
        ml: "'അടങ്ങിയിരിക്കുവിൻ, ഞാൻ ദൈവം ആകുന്നു എന്നറിവിൻ' — പുതിയ കുഞ്ഞും പുതിയ നഗരവുമായി ഈ വർഷം ആ വാക്യം എനിക്കു പ്രയാസമായിരുന്നു. 'അടങ്ങിയിരിക്കുക' എന്നാൽ എന്താണെന്നു ഇപ്പോഴും പഠിച്ചുകൊണ്ടിരിക്കുന്നു.",
      },
      isPastor: false,
    },
  ],

  // ---- Comments: mix of allow-listed and muted authors ---------------------
  comments: [
    { id: 'gh-cm1', targetId: 'gh-d1', authorId: 'gh-u-member', body: 'This one hit hard this morning. Needed it.', createdAt: '2026-08-10T13:20:00Z', status: 'approved' },
    { id: 'gh-cm2', targetId: 'gh-d1', authorId: 'gh-u-member-muted', body: 'Wrestling with this too honestly.', createdAt: '2026-08-10T14:05:00Z', status: 'approved' },
    { id: 'gh-cm3', targetId: 'gh-d4', authorId: 'gh-u-reviewer', body: 'Sharing this with my small group tonight.', createdAt: '2026-08-13T16:45:00Z', status: 'pending_review' },
    { id: 'gh-cm4', targetId: 'gh-q1', authorId: 'gh-u-pastor', body: 'Praying over every answer to this one.', createdAt: '2026-08-10T09:00:00Z', status: 'approved' },
    { id: 'kf-cm1', targetId: 'kf-d1', authorId: 'kf-u-member', body: 'Reading this every morning this week.', createdAt: '2026-08-11T07:30:00Z', status: 'approved' },
  ],

  // ---- Feed: testimonies, encouragements, announcements ---------------------
  feedItems: [
    {
      id: 'gh-f1',
      churchId: GHS,
      title: { en: 'Job Offer After Eight Months', ml: 'എട്ടു മാസത്തിനു ശേഷം ജോലി വാഗ്ദാനം' },
      body: {
        en: 'After eight months of searching and a lot of prayer, I got the call this week — I start my new role in September. Thank you all for praying with me through the waiting.',
        ml: 'എട്ടു മാസത്തെ അന്വേഷണത്തിനും ഒരുപാടു പ്രാർത്ഥനക്കും ശേഷം ഈ ആഴ്ച എനിക്കു കോൾ വന്നു — സെപ്റ്റംബറിൽ പുതിയ ജോലി ആരംഭിക്കുന്നു. കാത്തിരിപ്പിലുടനീളം എന്നോടൊപ്പം പ്രാർത്ഥിച്ച എല്ലാവർക്കും നന്ദി.',
      },
      source: 'member-submission',
      category: 'testimony',
      status: 'approved',
    },
    {
      id: 'gh-f2',
      churchId: GHS,
      title: { en: 'Healing After Surgery', ml: 'ശസ്ത്രക്രിയക്കു ശേഷമുള്ള സൗഖ്യം' },
      body: {
        en: "My surgery went better than the doctors expected, and I'm already walking without help. Praise God — and thank you to this church for surrounding my family with prayer.",
        ml: 'എന്റെ ശസ്ത്രക്രിയ ഡോക്ടർമാർ പ്രതീക്ഷിച്ചതിലും നന്നായി നടന്നു, ഞാൻ ഇപ്പോൾ സഹായമില്ലാതെ നടക്കുന്നു. ദൈവത്തിനു സ്തുതി — എന്റെ കുടുംബത്തെ പ്രാർത്ഥനയാൽ ചുറ്റിനിന്ന ഈ സഭക്കു നന്ദി.',
      },
      source: 'prayer-room',
      category: 'answered-prayer',
      status: 'approved',
    },
    {
      id: 'gh-f3',
      churchId: GHS,
      title: { en: 'Reconciled With My Father', ml: 'അച്ഛനുമായി അനുരഞ്ജനം' },
      body: {
        en: "After years of silence, my father called me last week. We talked for two hours. I'm still processing it, but I wanted to share this small miracle with the church that's been praying for our family.",
        ml: 'വർഷങ്ങളുടെ മൗനത്തിനു ശേഷം കഴിഞ്ഞ ആഴ്ച എന്റെ അച്ഛൻ എന്നെ വിളിച്ചു. ഞങ്ങൾ രണ്ടു മണിക്കൂർ സംസാരിച്ചു. ഇപ്പോഴും ഞാൻ ഇതു ഉൾക്കൊള്ളുകയാണ്, എന്നാൽ ഞങ്ങളുടെ കുടുംബത്തിനുവേണ്ടി പ്രാർത്ഥിച്ച ഈ സഭയോടു ഈ ചെറിയ അത്ഭുതം പങ്കിടാൻ ആഗ്രഹിച്ചു.',
      },
      source: 'member-submission',
      category: 'testimony',
      status: 'pending_review',
    },
    {
      id: 'gh-f4',
      churchId: GHS,
      title: { en: 'Youth Retreat Registration Open', ml: 'യൂത്ത് റിട്രീറ്റ് രജിസ്ട്രേഷൻ ആരംഭിച്ചു' },
      body: {
        en: 'Registration for the fall youth retreat (Oct 2-4) is open now through the church office. Early bird pricing ends September 1.',
        ml: 'വീഴ്ചക്കാല യൂത്ത് റിട്രീറ്റിന്റെ (ഒക്ടോബർ 2-4) രജിസ്ട്രേഷൻ ഇപ്പോൾ ചർച്ച് ഓഫീസ് വഴി ആരംഭിച്ചു. ആദ്യകാല നിരക്ക് സെപ്റ്റംബർ 1 വരെ.',
      },
      source: 'office',
      category: 'announcement',
      status: 'approved',
    },
    {
      id: 'gh-f5',
      churchId: GHS,
      title: { en: 'New Small Group Forming: Young Families', ml: 'പുതിയ ചെറു ഗ്രൂപ്പ്: യുവ കുടുംബങ്ങൾ' },
      body: {
        en: 'A new small group for young families with kids under five is forming this month. Childcare provided. Contact the office to join.',
        ml: 'അഞ്ചു വയസ്സിനു താഴെയുള്ള കുട്ടികളുള്ള യുവ കുടുംബങ്ങൾക്കായി ഈ മാസം പുതിയ ചെറു ഗ്രൂപ്പ് ആരംഭിക്കുന്നു. ശിശുപരിപാലനം ലഭ്യമാണ്. ചേരാൻ ഓഫീസുമായി ബന്ധപ്പെടുക.',
      },
      source: 'office',
      category: 'announcement',
      status: 'approved',
    },
    {
      id: 'gh-f6',
      churchId: GHS,
      title: { en: "A Word of Encouragement From Sunday", ml: 'ഞായറാഴ്ചയിൽ നിന്നൊരു പ്രോത്സാഹന വാക്ക്' },
      body: {
        en: '"You are not unseen." That line from Sunday\'s message is still sitting with a lot of us this week. Wherever you are, He sees you.',
        ml: '"നീ കാണപ്പെടാത്തവളല്ല." ഞായറാഴ്ചത്തെ സന്ദേശത്തിലെ ആ വരി ഈ ആഴ്ച പലരുടെയും ഹൃദയത്തിൽ തങ്ങിനിൽക്കുന്നു. നീ എവിടെയായിരുന്നാലും, അവൻ നിന്നെ കാണുന്നു.',
      },
      source: 'staff',
      category: 'encouragement',
      status: 'approved',
    },
    {
      id: 'gh-f7',
      churchId: GHS,
      title: { en: 'Volunteers Needed: Food Pantry', ml: 'വോളന്റിയർമാർ വേണം: ഭക്ഷ്യ പാൻട്രി' },
      body: {
        en: 'Our food pantry serves over 60 families a month, and we need hands this Saturday from 9-12 to sort and pack. Sign up at the welcome table.',
        ml: 'ഞങ്ങളുടെ ഭക്ഷ്യ പാൻട്രി പ്രതിമാസം 60ലധികം കുടുംബങ്ങളെ സേവിക്കുന്നു, ഈ ശനിയാഴ്ച 9 മുതൽ 12 വരെ അടുക്കി പാക്ക് ചെയ്യാൻ സഹായം വേണം. വെൽക്കം ടേബിളിൽ സൈൻ അപ്പ് ചെയ്യുക.',
      },
      source: 'office',
      category: 'volunteer',
      status: 'approved',
    },
    {
      id: 'gh-f8',
      churchId: GHS,
      title: { en: 'Baby Dedication This Sunday', ml: 'ഈ ഞായറാഴ്ച കുഞ്ഞു സമർപ്പണം' },
      body: {
        en: 'Join us this Sunday as we dedicate three little ones to the Lord during the 10am service. Family and friends welcome.',
        ml: 'ഈ ഞായറാഴ്ച 10 മണിക്കുള്ള ശുശ്രൂഷയിൽ മൂന്നു കുഞ്ഞുങ്ങളെ കർത്താവിനു സമർപ്പിക്കുമ്പോൾ ഞങ്ങളോടൊപ്പം ചേരുക. കുടുംബവും സുഹൃത്തുക്കളും സ്വാഗതം.',
      },
      source: 'office',
      category: 'announcement',
      status: 'approved',
    },
    {
      id: 'kf-f1',
      churchId: KF,
      title: { en: 'Onam Fellowship Lunch', ml: 'ഓണം കൂട്ടായ്മ ഭക്ഷണം' },
      body: {
        en: 'Join the fellowship for a potluck Onam lunch after service on August 23. Bring a dish if you can — sadya-style spread!',
        ml: 'ഓഗസ്റ്റ് 23ന് ശുശ്രൂഷക്കു ശേഷം ഓണം സദ്യ പോട്‌ലക്കിൽ കൂട്ടായ്മയോടൊപ്പം ചേരുക. കഴിയുമെങ്കിൽ ഒരു വിഭവം കൊണ്ടുവരൂ!',
      },
      source: 'office',
      category: 'announcement',
      status: 'approved',
    },
    {
      id: 'kf-f2',
      churchId: KF,
      title: { en: 'Praying for Rain Relief in Kerala', ml: 'കേരളത്തിലെ മഴക്കെടുതിക്കായി പ്രാർത്ഥന' },
      body: {
        en: 'Several of our families have relatives affected by flooding back home. Join us in praying for safety and quick relief efforts this week.',
        ml: 'നമ്മുടെ പല കുടുംബങ്ങൾക്കും നാട്ടിൽ വെള്ളപ്പൊക്കം ബാധിച്ച ബന്ധുക്കളുണ്ട്. ഈ ആഴ്ച സുരക്ഷക്കും വേഗത്തിലുള്ള സഹായത്തിനുമായി ഞങ്ങളോടൊപ്പം പ്രാർത്ഥിക്കുക.',
      },
      source: 'member-submission',
      category: 'prayer-need',
      status: 'approved',
    },
  ],

  // ---- Prayer: rooms + requests, public and anonymous ------------------------
  prayerRooms: [
    { id: 'gh-room1', churchId: GHS, name: { en: 'General Prayer', ml: 'പൊതു പ്രാർത്ഥന' } },
    { id: 'gh-room2', churchId: GHS, name: { en: 'Healing & Health', ml: 'സൗഖ്യവും ആരോഗ്യവും' } },
    { id: 'kf-room1', churchId: KF, name: { en: 'Family & Provision', ml: 'കുടുംബവും കരുതലും' } },
  ],

  prayerRequests: [
    { id: 'gh-preq1', churchId: GHS, roomId: 'gh-room1', requesterName: 'Manoj Abraham', isAnonymous: false, body: { en: 'Praying for wisdom in a big career decision this month.', ml: 'ഈ മാസം ഒരു വലിയ കരിയർ തീരുമാനത്തിൽ ജ്ഞാനത്തിനായി പ്രാർത്ഥിക്കുന്നു.' }, prayerCount: 18, status: 'approved', createdAt: '2026-08-11T10:00:00Z' },
    { id: 'gh-preq2', churchId: GHS, roomId: 'gh-room1', requesterName: 'Anonymous', isAnonymous: true, body: { en: 'Please pray for my marriage — we are going through a really hard season.', ml: 'ഞങ്ങളുടെ വിവാഹത്തിനുവേണ്ടി പ്രാർത്ഥിക്കുക — ഞങ്ങൾ വളരെ ബുദ്ധിമുട്ടുള്ള ഒരു കാലത്തിലൂടെയാണ് കടന്നുപോകുന്നത്.' }, prayerCount: 34, status: 'approved', createdAt: '2026-08-09T20:15:00Z' },
    { id: 'gh-preq3', churchId: GHS, roomId: 'gh-room2', requesterName: 'Grace Thomas', isAnonymous: false, body: { en: "Pray for my mother's recovery after her surgery on Thursday.", ml: 'വ്യാഴാഴ്ചത്തെ ശസ്ത്രക്രിയക്കു ശേഷം എന്റെ അമ്മയുടെ സൗഖ്യത്തിനായി പ്രാർത്ഥിക്കുക.' }, prayerCount: 26, status: 'approved', createdAt: '2026-08-13T08:40:00Z' },
    { id: 'gh-preq4', churchId: GHS, roomId: 'gh-room2', requesterName: 'Anonymous', isAnonymous: true, body: { en: 'Struggling with anxiety lately, please pray for peace.', ml: 'ഈയിടെയായി ഉത്കണ്ഠയുമായി മല്ലിടുകയാണ്, സമാധാനത്തിനായി പ്രാർത്ഥിക്കുക.' }, prayerCount: 3, status: 'pending_review', createdAt: '2026-08-16T21:05:00Z' },
    { id: 'kf-preq1', churchId: KF, roomId: 'kf-room1', requesterName: 'Bincy Joseph', isAnonymous: false, body: { en: 'Pray for a safe delivery — due next month.', ml: 'സുരക്ഷിതമായ പ്രസവത്തിനായി പ്രാർത്ഥിക്കുക — അടുത്ത മാസം പ്രസവം.' }, prayerCount: 15, status: 'approved', createdAt: '2026-08-12T09:00:00Z' },
    { id: 'kf-preq2', churchId: KF, roomId: 'kf-room1', requesterName: 'Anonymous', isAnonymous: true, body: { en: 'Pray for provision — my husband lost his job.', ml: 'കരുതലിനായി പ്രാർത്ഥിക്കുക — എന്റെ ഭർത്താവിനു ജോലി നഷ്ടപ്പെട്ടു.' }, prayerCount: 9, status: 'approved', createdAt: '2026-08-14T17:30:00Z' },
  ],

  // ---- Small groups & giving (UI only) ---------------------------------------
  smallGroups: [
    { id: 'gh-sg1', churchId: GHS, name: { en: 'Young Adults', ml: 'യുവജനങ്ങൾ' }, leaderName: 'Neha George', meetingDay: 'Wednesday', meetingTime: '7:00 PM', location: 'Fellowship Hall, Room 3', memberCount: 16 },
    { id: 'kf-sg1', churchId: KF, name: { en: 'Malayalam Family Fellowship', ml: 'മലയാളം കുടുംബ കൂട്ടായ്മ' }, leaderName: 'Ansu Thomas', meetingDay: 'Friday', meetingTime: '6:30 PM', location: 'Community Center', memberCount: 24 },
  ],

  givingFunds: [
    { id: 'gh-fund1', churchId: GHS, name: { en: 'General Fund', ml: 'പൊതു ഫണ്ട്' }, description: { en: 'Supports weekly operations and ministry.', ml: 'പ്രതിവാര പ്രവർത്തനങ്ങളെയും ശുശ്രൂഷയെയും പിന്തുണക്കുന്നു.' }, goalAmount: 80000, raisedAmount: 52300 },
    { id: 'gh-fund2', churchId: GHS, name: { en: 'Missions & Outreach', ml: 'മിഷൻ & ഔട്ട്റീച്ച്' }, description: { en: 'Funds local outreach and partner missionaries abroad.', ml: 'പ്രാദേശിക ഔട്ട്റീച്ചിനെയും വിദേശത്തുള്ള പങ്കാളി മിഷനറിമാരെയും ധനസഹായം ചെയ്യുന്നു.' }, goalAmount: 25000, raisedAmount: 9800 },
  ],

  // ---- Reminders: What Falls Through, across every kind ----------------------
  reminders: [
    { id: 'gh-rem1', churchId: GHS, kind: 'first_time_visitor', person: 'the Fernandez family', summary: 'Visited for the first time last Sunday — send a welcome note and connect them with a small group.', firedOn: '2026-08-11', done: false, private: true },
    { id: 'gh-rem2', churchId: GHS, kind: 'prayer_follow_up', person: 'Grace Thomas', summary: "Mother's surgery was Thursday — check in on recovery.", firedOn: '2026-08-15', done: false, private: true },
    { id: 'gh-rem3', churchId: GHS, kind: 'hospital_or_illness', person: "Manoj Abraham's father", summary: "Had surgery at St. Luke's this week — arrange a follow-up visit.", firedOn: '2026-08-14', done: true, private: true },
    { id: 'gh-rem4', churchId: GHS, kind: 'birthday', person: 'Vinod Kurian', summary: 'Birthday is Friday — team card going around.', firedOn: '2026-08-14', done: false, private: false },
    { id: 'gh-rem5', churchId: GHS, kind: 'bereavement', person: 'The Chandy family', summary: 'Lost their grandmother last week — check in and confirm memorial service support.', firedOn: '2026-08-10', done: false, private: true },
    { id: 'gh-rem6', churchId: GHS, kind: 'stopped_attending', person: 'the Verghese family', summary: "Regular for two years, haven't seen them in six weeks — reach out before they feel forgotten.", firedOn: '2026-08-13', done: false, private: true },
    { id: 'gh-rem7', churchId: GHS, kind: 'bereavement', person: 'the Kutty family', summary: 'One year today since they lost their son — a quiet call would mean a lot on a hard anniversary.', firedOn: '2026-08-16', done: false, private: true },
    { id: 'kf-rem1', churchId: KF, kind: 'anniversary', person: 'Pastor Sam & Priya Varghese', summary: '25th wedding anniversary this Sunday — recognize during service.', firedOn: '2026-08-16', done: false, private: false },
  ],

  // ---- Video: The Screen ------------------------------------------------------
  videoProjects: [
    { id: 'gh-v1', churchId: GHS, title: 'Named by God — Week 1 Highlights', posterUrl: '/placeholders/video/named-by-god-week1.jpg', status: 'approved' },
    { id: 'gh-v2', churchId: GHS, title: 'Baptism Sunday — August', posterUrl: '/placeholders/video/baptism-august.jpg', status: 'pending_review' },
    { id: 'gh-v3', churchId: GHS, title: 'Youth Retreat Recap 2026', posterUrl: '/placeholders/video/youth-retreat-2026.jpg', status: 'approved' },
  ],

  // ---- Artifacts: places & objects, global library ---------------------------
  artifacts: [
    {
      id: 'art1',
      name: 'Pool of Siloam',
      blurb: "A stepped pool in Jerusalem's City of David, identified with the pool where Jesus sent a blind man to wash and receive his sight.",
      imageUrl: '/placeholders/artifacts/pool-of-siloam.jpg',
      sourceUrl: 'https://en.wikipedia.org/wiki/Pool_of_Siloam',
      bibleRefs: ['John 9:7'],
    },
    {
      id: 'art2',
      name: 'Tel Dan Stele',
      blurb: "A 9th-century BC basalt inscription found at Tel Dan bearing one of the earliest extra-biblical references to the \"House of David.\"",
      imageUrl: '/placeholders/artifacts/tel-dan-stele.jpg',
      sourceUrl: 'https://en.wikipedia.org/wiki/Tel_Dan_Stele',
      bibleRefs: ['Judges 18:29', '1 Kings 12:29'],
    },
    {
      id: 'art3',
      name: 'First-Century Oil Lamp',
      blurb: "A small clay lamp typical of the Herodian period, the everyday household light behind Jesus' parables of watchfulness.",
      imageUrl: '/placeholders/artifacts/first-century-oil-lamp.jpg',
      sourceUrl: 'https://en.wikipedia.org/wiki/Oil_lamp',
      bibleRefs: ['Matthew 25:1-13'],
    },
    {
      id: 'art4',
      name: 'Pilate Stone',
      blurb: 'A limestone inscription found at Caesarea Maritima naming Pontius Pilate as prefect of Judea — the only known contemporary inscription of his name.',
      imageUrl: '/placeholders/artifacts/pilate-stone.jpg',
      sourceUrl: 'https://en.wikipedia.org/wiki/Pilate_Stone',
      bibleRefs: ['Luke 3:1'],
    },
    {
      id: 'art5',
      name: 'Caiaphas Ossuary',
      blurb: 'An ornately carved first-century burial box bearing the name "Joseph son of Caiaphas," believed to belong to the high priest of the Gospels.',
      imageUrl: '/placeholders/artifacts/caiaphas-ossuary.jpg',
      sourceUrl: 'https://en.wikipedia.org/wiki/Caiaphas_ossuary',
      bibleRefs: ['John 18:13-14'],
    },
    {
      id: 'art6',
      name: 'Great Isaiah Scroll',
      blurb: 'The best-preserved of the Dead Sea Scrolls: a nearly complete copy of the book of Isaiah, over a thousand years older than any previously known manuscript.',
      imageUrl: '/placeholders/artifacts/great-isaiah-scroll.jpg',
      sourceUrl: 'https://en.wikipedia.org/wiki/Great_Isaiah_Scroll',
      bibleRefs: ['Isaiah 53:4-6'],
    },
  ],

  // ---- Bible: full 66-book canon list; Genesis 1 fully bundled ----------------
  books: [
    { id: 'genesis', name: { en: 'Genesis', ml: 'ഉല്പത്തി' }, testament: 'old', chapterCount: 50 },
    { id: 'exodus', name: { en: 'Exodus', ml: 'പുറപ്പാടു' }, testament: 'old', chapterCount: 40 },
    { id: 'leviticus', name: { en: 'Leviticus', ml: 'ലേവ്യപുസ്തകം' }, testament: 'old', chapterCount: 27 },
    { id: 'numbers', name: { en: 'Numbers', ml: 'സംഖ്യാപുസ്തകം' }, testament: 'old', chapterCount: 36 },
    { id: 'deuteronomy', name: { en: 'Deuteronomy', ml: 'ആവർത്തനപുസ്തകം' }, testament: 'old', chapterCount: 34 },
    { id: 'joshua', name: { en: 'Joshua', ml: 'യോശുവ' }, testament: 'old', chapterCount: 24 },
    { id: 'judges', name: { en: 'Judges', ml: 'ന്യായാധിപന്മാർ' }, testament: 'old', chapterCount: 21 },
    { id: 'ruth', name: { en: 'Ruth', ml: 'രൂത്ത്' }, testament: 'old', chapterCount: 4 },
    { id: '1-samuel', name: { en: '1 Samuel', ml: 'ഒന്നാം ശമൂവേൽ' }, testament: 'old', chapterCount: 31 },
    { id: '2-samuel', name: { en: '2 Samuel', ml: 'രണ്ടാം ശമൂവേൽ' }, testament: 'old', chapterCount: 24 },
    { id: '1-kings', name: { en: '1 Kings', ml: 'ഒന്നാം രാജാക്കന്മാർ' }, testament: 'old', chapterCount: 22 },
    { id: '2-kings', name: { en: '2 Kings', ml: 'രണ്ടാം രാജാക്കന്മാർ' }, testament: 'old', chapterCount: 25 },
    { id: '1-chronicles', name: { en: '1 Chronicles', ml: 'ഒന്നാം ദിനവൃത്താന്തം' }, testament: 'old', chapterCount: 29 },
    { id: '2-chronicles', name: { en: '2 Chronicles', ml: 'രണ്ടാം ദിനവൃത്താന്തം' }, testament: 'old', chapterCount: 36 },
    { id: 'ezra', name: { en: 'Ezra', ml: 'എസ്രാ' }, testament: 'old', chapterCount: 10 },
    { id: 'nehemiah', name: { en: 'Nehemiah', ml: 'നെഹെമ്യാവു' }, testament: 'old', chapterCount: 13 },
    { id: 'esther', name: { en: 'Esther', ml: 'എസ്ഥേർ' }, testament: 'old', chapterCount: 10 },
    { id: 'job', name: { en: 'Job', ml: 'ഇയ്യോബ്' }, testament: 'old', chapterCount: 42 },
    { id: 'psalms', name: { en: 'Psalms', ml: 'സങ്കീർത്തനങ്ങൾ' }, testament: 'old', chapterCount: 150 },
    { id: 'proverbs', name: { en: 'Proverbs', ml: 'സദൃശവാക്യങ്ങൾ' }, testament: 'old', chapterCount: 31 },
    { id: 'ecclesiastes', name: { en: 'Ecclesiastes', ml: 'സഭാപ്രസംഗി' }, testament: 'old', chapterCount: 12 },
    { id: 'song-of-solomon', name: { en: 'Song of Solomon', ml: 'ഉത്തമഗീതം' }, testament: 'old', chapterCount: 8 },
    { id: 'isaiah', name: { en: 'Isaiah', ml: 'യെശയ്യാവു' }, testament: 'old', chapterCount: 66 },
    { id: 'jeremiah', name: { en: 'Jeremiah', ml: 'യിരെമ്യാവു' }, testament: 'old', chapterCount: 52 },
    { id: 'lamentations', name: { en: 'Lamentations', ml: 'വിലാപങ്ങൾ' }, testament: 'old', chapterCount: 5 },
    { id: 'ezekiel', name: { en: 'Ezekiel', ml: 'യെഹെസ്കേൽ' }, testament: 'old', chapterCount: 48 },
    { id: 'daniel', name: { en: 'Daniel', ml: 'ദാനീയേൽ' }, testament: 'old', chapterCount: 12 },
    { id: 'hosea', name: { en: 'Hosea', ml: 'ഹോശേയ' }, testament: 'old', chapterCount: 14 },
    { id: 'joel', name: { en: 'Joel', ml: 'യോവേൽ' }, testament: 'old', chapterCount: 3 },
    { id: 'amos', name: { en: 'Amos', ml: 'ആമോസ്' }, testament: 'old', chapterCount: 9 },
    { id: 'obadiah', name: { en: 'Obadiah', ml: 'ഓബദ്യാവു' }, testament: 'old', chapterCount: 1 },
    { id: 'jonah', name: { en: 'Jonah', ml: 'യോനാ' }, testament: 'old', chapterCount: 4 },
    { id: 'micah', name: { en: 'Micah', ml: 'മീഖാ' }, testament: 'old', chapterCount: 7 },
    { id: 'nahum', name: { en: 'Nahum', ml: 'നഹൂം' }, testament: 'old', chapterCount: 3 },
    { id: 'habakkuk', name: { en: 'Habakkuk', ml: 'ഹബക്കൂക്' }, testament: 'old', chapterCount: 3 },
    { id: 'zephaniah', name: { en: 'Zephaniah', ml: 'സെഫന്യാവു' }, testament: 'old', chapterCount: 3 },
    { id: 'haggai', name: { en: 'Haggai', ml: 'ഹഗ്ഗായി' }, testament: 'old', chapterCount: 2 },
    { id: 'zechariah', name: { en: 'Zechariah', ml: 'സെഖര്യാവു' }, testament: 'old', chapterCount: 14 },
    { id: 'malachi', name: { en: 'Malachi', ml: 'മലാഖി' }, testament: 'old', chapterCount: 4 },
    { id: 'matthew', name: { en: 'Matthew', ml: 'മത്തായി' }, testament: 'new', chapterCount: 28 },
    { id: 'mark', name: { en: 'Mark', ml: 'മർക്കൊസ്' }, testament: 'new', chapterCount: 16 },
    { id: 'luke', name: { en: 'Luke', ml: 'ലൂക്കൊസ്' }, testament: 'new', chapterCount: 24 },
    { id: 'john', name: { en: 'John', ml: 'യോഹന്നാൻ' }, testament: 'new', chapterCount: 21 },
    { id: 'acts', name: { en: 'Acts', ml: 'അപ്പൊസ്തലപ്രവൃത്തികൾ' }, testament: 'new', chapterCount: 28 },
    { id: 'romans', name: { en: 'Romans', ml: 'റോമർ' }, testament: 'new', chapterCount: 16 },
    { id: '1-corinthians', name: { en: '1 Corinthians', ml: 'ഒന്നാം കൊരിന്ത്യർ' }, testament: 'new', chapterCount: 16 },
    { id: '2-corinthians', name: { en: '2 Corinthians', ml: 'രണ്ടാം കൊരിന്ത്യർ' }, testament: 'new', chapterCount: 13 },
    { id: 'galatians', name: { en: 'Galatians', ml: 'ഗലാത്യർ' }, testament: 'new', chapterCount: 6 },
    { id: 'ephesians', name: { en: 'Ephesians', ml: 'എഫെസ്യർ' }, testament: 'new', chapterCount: 6 },
    { id: 'philippians', name: { en: 'Philippians', ml: 'ഫിലിപ്പിയർ' }, testament: 'new', chapterCount: 4 },
    { id: 'colossians', name: { en: 'Colossians', ml: 'കൊലൊസ്സ്യർ' }, testament: 'new', chapterCount: 4 },
    { id: '1-thessalonians', name: { en: '1 Thessalonians', ml: 'ഒന്നാം തെസ്സലൊനീക്യർ' }, testament: 'new', chapterCount: 5 },
    { id: '2-thessalonians', name: { en: '2 Thessalonians', ml: 'രണ്ടാം തെസ്സലൊനീക്യർ' }, testament: 'new', chapterCount: 3 },
    { id: '1-timothy', name: { en: '1 Timothy', ml: 'ഒന്നാം തിമൊഥെയൊസ്' }, testament: 'new', chapterCount: 6 },
    { id: '2-timothy', name: { en: '2 Timothy', ml: 'രണ്ടാം തിമൊഥെയൊസ്' }, testament: 'new', chapterCount: 4 },
    { id: 'titus', name: { en: 'Titus', ml: 'തീത്തൊസ്' }, testament: 'new', chapterCount: 3 },
    { id: 'philemon', name: { en: 'Philemon', ml: 'ഫിലേമോൻ' }, testament: 'new', chapterCount: 1 },
    { id: 'hebrews', name: { en: 'Hebrews', ml: 'എബ്രായർ' }, testament: 'new', chapterCount: 13 },
    { id: 'james', name: { en: 'James', ml: 'യാക്കോബ്' }, testament: 'new', chapterCount: 5 },
    { id: '1-peter', name: { en: '1 Peter', ml: 'ഒന്നാം പത്രൊസ്' }, testament: 'new', chapterCount: 5 },
    { id: '2-peter', name: { en: '2 Peter', ml: 'രണ്ടാം പത്രൊസ്' }, testament: 'new', chapterCount: 3 },
    { id: '1-john', name: { en: '1 John', ml: 'ഒന്നാം യോഹന്നാൻ' }, testament: 'new', chapterCount: 5 },
    { id: '2-john', name: { en: '2 John', ml: 'രണ്ടാം യോഹന്നാൻ' }, testament: 'new', chapterCount: 1 },
    { id: '3-john', name: { en: '3 John', ml: 'മൂന്നാം യോഹന്നാൻ' }, testament: 'new', chapterCount: 1 },
    { id: 'jude', name: { en: 'Jude', ml: 'യൂദാ' }, testament: 'new', chapterCount: 1 },
    { id: 'revelation', name: { en: 'Revelation', ml: 'വെളിപ്പാടു' }, testament: 'new', chapterCount: 22 },
  ],

  // Genesis 1, verse by verse (EN: WEB, public domain; ML: Old Version register).
  verses: [
    { ref: 'Genesis 1:1', num: 1, text: { en: 'In the beginning, God created the heavens and the earth.', ml: 'ആദിയിൽ ദൈവം ആകാശവും ഭൂമിയും സൃഷ്ടിച്ചു.' } },
    { ref: 'Genesis 1:2', num: 2, text: { en: "The earth was formless and empty. Darkness was on the surface of the deep and God's Spirit was hovering over the surface of the waters.", ml: 'ഭൂമി രൂപരഹിതവും ശൂന്യവുമായിരുന്നു; ആഴത്തിന്മീതെ ഇരുട്ടു ഉണ്ടായിരുന്നു; ദൈവത്തിന്റെ ആത്മാവു വെള്ളത്തിന്മീതെ പരിവർത്തിച്ചുകൊണ്ടിരുന്നു.' } },
    { ref: 'Genesis 1:3', num: 3, text: { en: 'God said, "Let there be light," and there was light.', ml: 'ദൈവം: വെളിച്ചം ഉണ്ടാകട്ടെ എന്നു കല്പിച്ചു; വെളിച്ചം ഉണ്ടായി.' } },
    { ref: 'Genesis 1:4', num: 4, text: { en: 'God saw the light, and saw that it was good. God divided the light from the darkness.', ml: 'വെളിച്ചം നല്ലതു എന്നു ദൈവം കണ്ടു; ദൈവം വെളിച്ചവും ഇരുട്ടും തമ്മിൽ വേർപിരിച്ചു.' } },
    { ref: 'Genesis 1:5', num: 5, text: { en: 'God called the light "day", and the darkness he called "night". There was evening and there was morning, the first day.', ml: 'ദൈവം വെളിച്ചത്തിന്നു പകൽ എന്നും ഇരുട്ടിന്നു രാത്രി എന്നും പേരിട്ടു. സന്ധ്യയായി പ്രഭാതമായി, ഒന്നാം ദിവസം.' } },
    { ref: 'Genesis 1:6', num: 6, text: { en: 'God said, "Let there be an expanse in the middle of the waters, and let it divide the waters from the waters."', ml: 'ദൈവം: വെള്ളങ്ങളുടെ നടുവിൽ ഒരു വിതാനം ഉണ്ടാകട്ടെ; അതു വെള്ളത്തിനും വെള്ളത്തിനും തമ്മിൽ വേർപിരിക്കട്ടെ എന്നു കല്പിച്ചു.' } },
    { ref: 'Genesis 1:7', num: 7, text: { en: 'God made the expanse, and divided the waters which were under the expanse from the waters which were above the expanse; and it was so.', ml: 'അങ്ങനെ ദൈവം വിതാനത്തെ ഉണ്ടാക്കി, വിതാനത്തിൻ കീഴിലുള്ള വെള്ളവും വിതാനത്തിന്മീതെയുള്ള വെള്ളവും തമ്മിൽ വേർപിരിച്ചു; അതു അങ്ങനെയായി.' } },
    { ref: 'Genesis 1:8', num: 8, text: { en: 'God called the expanse "sky". There was evening and there was morning, a second day.', ml: 'ദൈവം വിതാനത്തിന്നു ആകാശം എന്നു പേരിട്ടു. സന്ധ്യയായി പ്രഭാതമായി, രണ്ടാം ദിവസം.' } },
    { ref: 'Genesis 1:9', num: 9, text: { en: 'God said, "Let the waters under the sky be gathered together to one place, and let the dry land appear;" and it was so.', ml: 'ദൈവം: ആകാശത്തിൻ കീഴെയുള്ള വെള്ളം ഒരു സ്ഥലത്തു കൂടട്ടെ, ഉണങ്ങിയ നിലം കാണട്ടെ എന്നു കല്പിച്ചു; അതു അങ്ങനെയായി.' } },
    { ref: 'Genesis 1:10', num: 10, text: { en: 'God called the dry land "earth", and the gathering together of the waters he called "seas". God saw that it was good.', ml: 'ഉണങ്ങിയ നിലത്തിന്നു ദൈവം ഭൂമി എന്നും വെള്ളത്തിന്റെ കൂട്ടത്തിന്നു സമുദ്രം എന്നും പേരിട്ടു; അതു നല്ലതു എന്നു ദൈവം കണ്ടു.' } },
    { ref: 'Genesis 1:11', num: 11, text: { en: 'God said, "Let the earth put forth grass, herbs yielding seed, and fruit trees bearing fruit after their kind, with its seed in it, on the earth;" and it was so.', ml: 'ദൈവം: ഭൂമി പുല്ലും വിത്തുള്ള സസ്യങ്ങളും അതതു തരം അനുസരിച്ചു വിത്തുള്ള ഫലം കായ്ക്കുന്ന വൃക്ഷങ്ങളും മുളപ്പിക്കട്ടെ എന്നു കല്പിച്ചു; അതു അങ്ങനെയായി.' } },
    { ref: 'Genesis 1:12', num: 12, text: { en: 'The earth brought forth grass, herbs yielding seed after their kind, and trees bearing fruit, with its seed in it, after their kind; and God saw that it was good.', ml: 'ഭൂമി പുല്ലും അതതു തരം അനുസരിച്ചു വിത്തുള്ള സസ്യങ്ങളും അതതു തരം അനുസരിച്ചു വിത്തുള്ള ഫലം കായ്ക്കുന്ന വൃക്ഷങ്ങളും മുളപ്പിച്ചു; അതു നല്ലതു എന്നു ദൈവം കണ്ടു.' } },
    { ref: 'Genesis 1:13', num: 13, text: { en: 'There was evening and there was morning, a third day.', ml: 'സന്ധ്യയായി പ്രഭാതമായി, മൂന്നാം ദിവസം.' } },
    { ref: 'Genesis 1:14', num: 14, text: { en: 'God said, "Let there be lights in the expanse of sky to divide the day from the night; and let them be for signs, and for seasons, and for days and years;', ml: 'ദൈവം: പകലും രാത്രിയും തമ്മിൽ വേർപിരിക്കേണ്ടതിന്നു ആകാശവിതാനത്തിൽ വെളിച്ചങ്ങൾ ഉണ്ടാകട്ടെ; അവ അടയാളങ്ങൾക്കും കാലങ്ങൾക്കും ദിവസങ്ങൾക്കും സംവത്സരങ്ങൾക്കും ആയിരിക്കട്ടെ.' } },
    { ref: 'Genesis 1:15', num: 15, text: { en: 'and let them be for lights in the expanse of sky to give light on the earth;" and it was so.', ml: 'ഭൂമിയിൽ വെളിച്ചം കൊടുപ്പാൻ അവ ആകാശവിതാനത്തിൽ വെളിച്ചങ്ങളായിരിക്കട്ടെ എന്നു കല്പിച്ചു; അതു അങ്ങനെയായി.' } },
    { ref: 'Genesis 1:16', num: 16, text: { en: 'God made the two great lights: the greater light to rule the day, and the lesser light to rule the night. He also made the stars.', ml: 'ദൈവം രണ്ടു വലിയ വെളിച്ചങ്ങളെ ഉണ്ടാക്കി; പകൽ വാഴുവാൻ വലിയ വെളിച്ചവും രാത്രി വാഴുവാൻ ചെറിയ വെളിച്ചവും നക്ഷത്രങ്ങളെയും ഉണ്ടാക്കി.' } },
    { ref: 'Genesis 1:17', num: 17, text: { en: 'God set them in the expanse of sky to give light to the earth,', ml: 'ഭൂമിയിൽ വെളിച്ചം കൊടുപ്പാനും' } },
    { ref: 'Genesis 1:18', num: 18, text: { en: 'and to rule over the day and over the night, and to divide the light from the darkness. God saw that it was good.', ml: 'പകലും രാത്രിയും വാഴുവാനും വെളിച്ചവും ഇരുട്ടും തമ്മിൽ വേർപിരിപ്പാനും ദൈവം അവയെ ആകാശവിതാനത്തിൽ നിർത്തി; അതു നല്ലതു എന്നു ദൈവം കണ്ടു.' } },
    { ref: 'Genesis 1:19', num: 19, text: { en: 'There was evening and there was morning, a fourth day.', ml: 'സന്ധ്യയായി പ്രഭാതമായി, നാലാം ദിവസം.' } },
    { ref: 'Genesis 1:20', num: 20, text: { en: 'God said, "Let the waters swarm with swarms of living creatures, and let birds fly above the earth in the open expanse of sky."', ml: 'ദൈവം: വെള്ളത്തിൽ ജീവജന്തുക്കൾ കൂട്ടമായി ജനിക്കട്ടെ; ഭൂമിയുടെ മീതെ ആകാശവിതാനത്തിൽ പക്ഷികൾ പറക്കട്ടെ എന്നു കല്പിച്ചു.' } },
    { ref: 'Genesis 1:21', num: 21, text: { en: 'God created the large sea creatures, and every living creature that moves, with which the waters swarmed, after their kind, and every winged bird after its kind. God saw that it was good.', ml: 'ദൈവം വലിയ തിമിംഗലങ്ങളെയും വെള്ളത്തിൽ കൂട്ടമായി ജനിച്ചു ചരിക്കുന്ന അതതു തരം ജീവജന്തുക്കളെയും അതതു തരം ചിറകുള്ള പറവജാതിയെയും സൃഷ്ടിച്ചു; അതു നല്ലതു എന്നു ദൈവം കണ്ടു.' } },
    { ref: 'Genesis 1:22', num: 22, text: { en: 'God blessed them, saying, "Be fruitful, and multiply, and fill the waters in the seas, and let birds multiply on the earth."', ml: 'ദൈവം അവയെ അനുഗ്രഹിച്ചു: നിങ്ങൾ വർദ്ധിച്ചു പെരുകി സമുദ്രത്തിലെ വെള്ളത്തിൽ നിറവിൻ; പക്ഷികൾ ഭൂമിയിൽ പെരുകട്ടെ എന്നു കല്പിച്ചു.' } },
    { ref: 'Genesis 1:23', num: 23, text: { en: 'There was evening and there was morning, a fifth day.', ml: 'സന്ധ്യയായി പ്രഭാതമായി, അഞ്ചാം ദിവസം.' } },
    { ref: 'Genesis 1:24', num: 24, text: { en: 'God said, "Let the earth produce living creatures after their kind, livestock, creeping things, and animals of the earth after their kind;" and it was so.', ml: 'ദൈവം: ഭൂമി അതതു തരം അനുസരിച്ചു ജീവജന്തുക്കളെയും കന്നുകാലികളെയും ഇഴജാതിയെയും കാട്ടുമൃഗങ്ങളെയും അതതു തരം അനുസരിച്ചു ഉളവാക്കട്ടെ എന്നു കല്പിച്ചു; അതു അങ്ങനെയായി.' } },
    { ref: 'Genesis 1:25', num: 25, text: { en: 'God made the animals of the earth after their kind, and the livestock after their kind, and everything that creeps on the ground after its kind. God saw that it was good.', ml: 'ദൈവം അതതു തരം അനുസരിച്ചു കാട്ടുമൃഗങ്ങളെയും കന്നുകാലികളെയും നിലത്തിലെ ഇഴജാതിയെയും ഉണ്ടാക്കി; അതു നല്ലതു എന്നു ദൈവം കണ്ടു.' } },
    { ref: 'Genesis 1:26', num: 26, text: { en: 'God said, "Let us make man in our image, after our likeness: and let them have dominion over the fish of the sea, and over the birds of the sky, and over the livestock, and over all the earth, and over every creeping thing that creeps on the earth."', ml: 'ദൈവം: നാം നമ്മുടെ സ്വരൂപത്തിൽ നമ്മുടെ സാദൃശ്യപ്രകാരം മനുഷ്യനെ ഉണ്ടാക്കുക; അവർ സമുദ്രത്തിലെ മത്സ്യത്തിന്മേലും ആകാശത്തിലെ പക്ഷികളിന്മേലും കന്നുകാലികളിന്മേലും സർവ്വഭൂമിയിന്മേലും ഭൂമിയിൽ ഇഴയുന്ന എല്ലാ ഇഴജാതിയിന്മേലും വാഴട്ടെ എന്നു കല്പിച്ചു.' } },
    { ref: 'Genesis 1:27', num: 27, text: { en: "God created man in his own image. In God's image he created him; male and female he created them.", ml: 'ഇങ്ങനെ ദൈവം തന്റെ സ്വരൂപത്തിൽ മനുഷ്യനെ സൃഷ്ടിച്ചു, ദൈവത്തിന്റെ സ്വരൂപത്തിൽ അവനെ സൃഷ്ടിച്ചു, ആണും പെണ്ണുമായി അവരെ സൃഷ്ടിച്ചു.' } },
    { ref: 'Genesis 1:28', num: 28, text: { en: 'God blessed them. God said to them, "Be fruitful, multiply, fill the earth, and subdue it. Have dominion over the fish of the sea, over the birds of the sky, and over every living thing that moves on the earth."', ml: 'ദൈവം അവരെ അനുഗ്രഹിച്ചു; നിങ്ങൾ സന്താനപുഷ്ടിയുള്ളവരായി പെരുകി ഭൂമിയിൽ നിറഞ്ഞു അതിനെ അടക്കി വാഴുവിൻ; സമുദ്രത്തിലെ മത്സ്യത്തിന്മേലും ആകാശത്തിലെ പക്ഷികളിന്മേലും ഭൂമിയിൽ ചരിക്കുന്ന സകലജീവജന്തുവിന്മേലും വാഴുവിൻ എന്നു ദൈവം അവരോടു കല്പിച്ചു.' } },
    { ref: 'Genesis 1:29', num: 29, text: { en: 'God said, "Behold, I have given you every herb yielding seed, which is on the surface of all the earth, and every tree, which bears fruit yielding seed. It will be your food.', ml: 'ഭൂമിയിലെങ്ങും ഉള്ള വിത്തുള്ള സകലസസ്യങ്ങളെയും വിത്തുള്ള ഫലം കായ്ക്കുന്ന സകലവൃക്ഷങ്ങളെയും ഞാൻ നിങ്ങൾക്കു തന്നിരിക്കുന്നു; അവ നിങ്ങൾക്കു ആഹാരമായിരിക്കട്ടെ.' } },
    { ref: 'Genesis 1:30', num: 30, text: { en: 'To every animal of the earth, and to every bird of the sky, and to everything that creeps on the earth, in which there is life, I have given every green herb for food;" and it was so.', ml: 'ഭൂമിയിലെ സകലമൃഗങ്ങൾക്കും ആകാശത്തിലെ സകലപക്ഷികൾക്കും ഭൂമിയിൽ ചരിക്കുന്ന ജീവനുള്ള സകലജന്തുക്കൾക്കും പച്ചസസ്യം ഒക്കെയും ഞാൻ ആഹാരമായി കൊടുത്തിരിക്കുന്നു എന്നു ദൈവം കല്പിച്ചു; അതു അങ്ങനെയായി.' } },
    { ref: 'Genesis 1:31', num: 31, text: { en: 'God saw everything that he had made, and, behold, it was very good. There was evening and there was morning, the sixth day.', ml: 'ദൈവം താൻ ഉണ്ടാക്കിയതൊക്കെയും നോക്കി, ഇതാ, വളരെ നല്ലതു എന്നു കണ്ടു. സന്ധ്യയായി പ്രഭാതമായി, ആറാം ദിവസം.' } },
  ],

  // ---- Lexicon: word-study roots for The Word (citation is always required) --
  lexicon: [
    {
      id: 'lex-bara',
      verseRef: 'Genesis 1:1',
      word: 'created',
      original: 'בָּרָא',
      transliteration: 'bara',
      language: 'hebrew',
      meaning: {
        en: 'To create, shape, form. In the Hebrew Bible this verb is used exclusively of divine activity — never of a human making something from existing material.',
        ml: 'സൃഷ്ടിക്കുക, രൂപപ്പെടുത്തുക. എബ്രായ തിരുവെഴുത്തിൽ ഈ ക്രിയ ദൈവിക പ്രവർത്തനത്തിനു മാത്രമേ ഉപയോഗിക്കുന്നുള്ളൂ — നിലവിലുള്ള വസ്തുക്കളിൽനിന്നു മനുഷ്യൻ എന്തെങ്കിലും ഉണ്ടാക്കുന്നതിനല്ല.',
      },
      citation: 'Brown-Driver-Briggs Hebrew Lexicon, ברא (bara), Strong\'s H1254',
    },
    {
      id: 'lex-ruach',
      verseRef: 'Genesis 1:2',
      word: 'Spirit',
      original: 'רוּחַ',
      transliteration: 'ruach',
      language: 'hebrew',
      meaning: {
        en: "Breath, wind, spirit — one word behind both \"the Spirit of God\" and \"a mighty wind.\" Its sense shifts with context, from a physical gust to the very breath of life.",
        ml: 'ശ്വാസം, കാറ്റ്, ആത്മാവ് — "ദൈവത്തിന്റെ ആത്മാവ്" എന്നും "ശക്തമായ കാറ്റ്" എന്നും വിവർത്തനം ചെയ്യപ്പെടുന്ന ഒരേ പദം. സന്ദർഭം അനുസരിച്ചു അർത്ഥം മാറുന്നു.',
      },
      citation: 'Brown-Driver-Briggs Hebrew Lexicon, רוּחַ (ruach), Strong\'s H7307',
    },
    {
      id: 'lex-or',
      verseRef: 'Genesis 1:3',
      word: 'light',
      original: 'אוֹר',
      transliteration: 'or',
      language: 'hebrew',
      meaning: {
        en: 'Light — the first thing spoken directly into being. Used literally of daylight, and figuratively throughout Scripture for life, joy, and the presence of God.',
        ml: 'വെളിച്ചം — നേരിട്ടു സംസാരിച്ചു ഉളവാക്കിയ ആദ്യത്തെ വസ്തു. അക്ഷരാർത്ഥത്തിൽ പകൽവെളിച്ചത്തിനും, ആലങ്കാരികമായി ജീവൻ, സന്തോഷം, ദൈവസാന്നിധ്യം എന്നിവയ്ക്കും ഉപയോഗിക്കുന്നു.',
      },
      citation: 'Brown-Driver-Briggs Hebrew Lexicon, אוֹר (or), Strong\'s H216',
    },
    {
      id: 'lex-tov',
      verseRef: 'Genesis 1:4',
      word: 'good',
      original: 'טוֹב',
      transliteration: 'tov',
      language: 'hebrew',
      meaning: {
        en: 'Good, pleasant, agreeable — the refrain repeated at every stage of creation, culminating in "very good" (tov me\'od) once humanity is made.',
        ml: 'നല്ലതു, ഇമ്പമുള്ളതു — സൃഷ്ടിയുടെ ഓരോ ഘട്ടത്തിലും ആവർത്തിക്കുന്ന വാക്ക്, മനുഷ്യനെ സൃഷ്ടിച്ചശേഷം "അതിവിശേഷമായി നല്ലതു" എന്നതിൽ പര്യവസാനിക്കുന്നു.',
      },
      citation: 'Brown-Driver-Briggs Hebrew Lexicon, טוֹב (tov), Strong\'s H2896',
    },
  ],

  // ---- Journal: private per-user reflections. Empty until a member writes one.
  journalEntries: [],
}
