// Seed/fixture data for the mocked demo. Internal to the services layer —
// screens must go through src/services/api.ts, never import this file.

import type {
  Artifact,
  Book,
  Church,
  Comment,
  Devotional,
  FeedItem,
  GivingFund,
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
}

const GH = 'grace-harbor'
const SM = 'st-marys'

export const seed: Db = {
  churches: [
    {
      id: GH,
      slug: 'grace-harbor',
      name: { en: 'Grace Harbor Church', ml: 'ഗ്രേസ് ഹാർബർ ചർച്ച്' },
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
      id: SM,
      slug: 'st-marys-malayalam',
      name: {
        en: "St. Mary's Malayalam Parish",
        ml: 'സെന്റ് മേരീസ് മലയാളം ഇടവക',
      },
      theme: { primary: 'spirit', accent: 'plum' },
      // No giving or video ministry yet — demonstrates tenant-level gating.
      components: [
        'feed',
        'sermons',
        'devotionals',
        'questions',
        'reflections',
        'prayer',
        'groups',
        'reminders',
        'artifacts',
        'bible',
        'review',
        'admin',
      ],
    },
  ],

  users: [
    { id: 'gh-u-member', name: 'Alex Rivera', churchId: GH, role: 'member', canComment: true },
    { id: 'gh-u-reviewer', name: 'Priya Nair', churchId: GH, role: 'reviewer', canComment: true },
    { id: 'gh-u-pastor', name: 'Pastor Daniel Kurian', churchId: GH, role: 'pastor', canComment: true },
    { id: 'gh-u-admin', name: 'Sam Okafor', churchId: GH, role: 'admin', canComment: true },
    { id: 'sm-u-member', name: 'Teena Thomas', churchId: SM, role: 'member', canComment: true },
    { id: 'sm-u-reviewer', name: 'Reeba Varghese', churchId: SM, role: 'reviewer', canComment: true },
    { id: 'sm-u-pastor', name: 'Fr. Abraham Mathew', churchId: SM, role: 'pastor', canComment: true },
    { id: 'sm-u-admin', name: 'Jino Philip', churchId: SM, role: 'admin', canComment: true },
  ],

  sermons: [
    {
      id: 'gh-s1',
      churchId: GH,
      title: { en: 'Walking in the Spirit', ml: 'ആത്മാവിൽ നടക്കുക' },
      speaker: 'Pastor Daniel Kurian',
      date: '2026-08-02',
      transcript: {
        en: 'Full transcript of Walking in the Spirit...',
        ml: 'ആത്മാവിൽ നടക്കുക എന്ന പ്രസംഗത്തിന്റെ പൂർണ്ണ പകർപ്പ്...',
      },
    },
    {
      id: 'gh-s2',
      churchId: GH,
      title: { en: 'The Good Samaritan', ml: 'നല്ല ശമര്യക്കാരൻ' },
      speaker: 'Pastor Daniel Kurian',
      date: '2026-08-09',
      transcript: {
        en: 'Full transcript of The Good Samaritan...',
        ml: 'നല്ല ശമര്യക്കാരൻ എന്ന പ്രസംഗത്തിന്റെ പൂർണ്ണ പകർപ്പ്...',
      },
    },
    {
      id: 'sm-s1',
      churchId: SM,
      title: { en: 'The Vine and the Branches', ml: 'മുന്തിരിവള്ളിയും ശാഖകളും' },
      speaker: 'Fr. Abraham Mathew',
      date: '2026-08-03',
      transcript: {
        en: 'Full transcript of The Vine and the Branches...',
        ml: 'മുന്തിരിവള്ളിയും ശാഖകളും എന്ന പ്രസംഗത്തിന്റെ പൂർണ്ണ പകർപ്പ്...',
      },
    },
    {
      id: 'sm-s2',
      churchId: SM,
      title: { en: 'Faith of the Centurion', ml: 'ശതാധിപന്റെ വിശ്വാസം' },
      speaker: 'Fr. Abraham Mathew',
      date: '2026-08-10',
      transcript: {
        en: 'Full transcript of Faith of the Centurion...',
        ml: 'ശതാധിപന്റെ വിശ്വാസം എന്ന പ്രസംഗത്തിന്റെ പൂർണ്ണ പകർപ്പ്...',
      },
    },
  ],

  devotionals: [
    {
      id: 'gh-d1',
      churchId: GH,
      title: { en: 'Fruit That Remains', ml: 'നിലനിൽക്കുന്ന ഫലം' },
      body: { en: 'Devotional body drawn from Walking in the Spirit...', ml: '...' },
      day: '2026-08-03',
      sourceSermonId: 'gh-s1',
      narratorName: 'Alex Rivera',
      status: 'approved',
    },
    {
      id: 'gh-d2',
      churchId: GH,
      title: { en: 'Step by Step', ml: 'പടിപടിയായി' },
      body: { en: 'Devotional body drawn from Walking in the Spirit, part two...', ml: '...' },
      day: '2026-08-04',
      sourceSermonId: 'gh-s1',
      narratorName: 'Alex Rivera',
      status: 'pending_review',
    },
    {
      id: 'gh-d3',
      churchId: GH,
      title: { en: 'Who Is My Neighbor', ml: 'ആരാണ് എന്റെ അയൽക്കാരൻ' },
      body: { en: 'Draft devotional from The Good Samaritan...', ml: '...' },
      day: '2026-08-10',
      sourceSermonId: 'gh-s2',
      status: 'draft',
    },
    {
      id: 'sm-d1',
      churchId: SM,
      title: { en: 'Abiding in the Vine', ml: 'വള്ളിയിൽ വസിക്കുക' },
      body: { en: 'Devotional body drawn from The Vine and the Branches...', ml: '...' },
      day: '2026-08-04',
      sourceSermonId: 'sm-s1',
      narratorName: 'Reeba Varghese',
      status: 'approved',
    },
    {
      id: 'sm-d2',
      churchId: SM,
      title: { en: 'Pruned to Grow', ml: 'വളരാൻ വെട്ടിയൊതുക്കി' },
      body: { en: 'Devotional body drawn from The Vine and the Branches, part two...', ml: '...' },
      day: '2026-08-05',
      sourceSermonId: 'sm-s1',
      status: 'held',
    },
  ],

  questions: [
    { id: 'gh-q1', churchId: GH, prompt: { en: 'Where have you seen the Spirit at work this week?', ml: '...' }, day: '2026-08-03', status: 'approved' },
    { id: 'gh-q2', churchId: GH, prompt: { en: 'Who is someone you could show mercy to this week?', ml: '...' }, day: '2026-08-10', status: 'pending_review' },
    { id: 'sm-q1', churchId: SM, prompt: { en: 'What does it mean for you to abide in Christ?', ml: '...' }, day: '2026-08-04', status: 'approved' },
  ],

  reflections: [
    { id: 'gh-r1', churchId: GH, author: 'Pastor Daniel Kurian', body: { en: 'A pastoral reflection on walking faithfully...', ml: '...' }, isPastor: true },
    { id: 'gh-r2', churchId: GH, author: 'Alex Rivera', body: { en: 'What this passage meant to me this week...', ml: '...' }, isPastor: false },
    { id: 'sm-r1', churchId: SM, author: 'Fr. Abraham Mathew', body: { en: 'A reflection on abiding in the vine...', ml: '...' }, isPastor: true },
  ],

  comments: [
    { id: 'gh-c1', targetId: 'gh-d1', authorId: 'gh-u-member', body: 'This spoke to me this morning.', createdAt: '2026-08-03T13:05:00Z', status: 'approved' },
    { id: 'gh-c2', targetId: 'gh-d1', authorId: 'gh-u-reviewer', body: 'Sharing this with my small group.', createdAt: '2026-08-03T15:40:00Z', status: 'pending_review' },
    { id: 'sm-c1', targetId: 'sm-d1', authorId: 'sm-u-member', body: 'Needed this today.', createdAt: '2026-08-04T09:12:00Z', status: 'approved' },
  ],

  feedItems: [
    { id: 'gh-f1', churchId: GH, title: { en: 'Fall Retreat Registration Open', ml: '...' }, body: { en: 'Sign up now for the fall retreat...', ml: '...' }, source: 'office', category: 'announcement', status: 'approved' },
    { id: 'gh-f2', churchId: GH, title: { en: 'Volunteers Needed for Food Drive', ml: '...' }, body: { en: 'We need volunteers this Saturday...', ml: '...' }, source: 'office', category: 'news', status: 'pending_review' },
    { id: 'sm-f1', churchId: SM, title: { en: 'Onam Fellowship Gathering', ml: 'ഓണം കൂട്ടായ്മ' }, body: { en: 'Join us for a parish Onam gathering...', ml: '...' }, source: 'office', category: 'announcement', status: 'approved' },
  ],

  prayerRooms: [
    { id: 'gh-room1', churchId: GH, name: { en: 'General Prayer', ml: 'പൊതു പ്രാർത്ഥന' } },
    { id: 'sm-room1', churchId: SM, name: { en: 'General Prayer', ml: 'പൊതു പ്രാർത്ഥന' } },
  ],

  prayerRequests: [
    { id: 'gh-preq1', churchId: GH, roomId: 'gh-room1', requesterName: 'Jamie L.', isAnonymous: false, body: { en: 'Praying for healing after surgery.', ml: '...' }, prayerCount: 12, status: 'approved', createdAt: '2026-08-10T18:00:00Z' },
    { id: 'gh-preq2', churchId: GH, roomId: 'gh-room1', requesterName: 'Anonymous', isAnonymous: true, body: { en: 'Please pray for my family situation.', ml: '...' }, prayerCount: 0, status: 'pending_review', createdAt: '2026-08-15T09:30:00Z' },
    { id: 'sm-preq1', churchId: SM, roomId: 'sm-room1', requesterName: 'Anu K.', isAnonymous: false, body: { en: 'Praying for a new job.', ml: '...' }, prayerCount: 5, status: 'approved', createdAt: '2026-08-12T11:00:00Z' },
  ],

  smallGroups: [
    { id: 'gh-sg1', churchId: GH, name: { en: 'Young Adults', ml: '...' }, leaderName: 'Alex Rivera', meetingDay: 'Wednesday', meetingTime: '7:00 PM', location: 'Room 204', memberCount: 14 },
    { id: 'sm-sg1', churchId: SM, name: { en: 'Malayalam Fellowship', ml: 'മലയാളം കൂട്ടായ്മ' }, leaderName: 'Teena Thomas', meetingDay: 'Friday', meetingTime: '6:30 PM', location: 'Parish Hall', memberCount: 22 },
  ],

  givingFunds: [
    { id: 'gh-fund1', churchId: GH, name: { en: 'General Fund', ml: '...' }, description: { en: 'Supports weekly operations and ministry.', ml: '...' }, goalAmount: 50000, raisedAmount: 31250 },
  ],

  reminders: [
    { id: 'gh-rem1', churchId: GH, kind: 'follow-up', person: 'Jamie L.', summary: 'Check in after hospital visit', firedOn: '2026-08-15', done: false, private: true },
    { id: 'gh-rem2', churchId: GH, kind: 'birthday', person: 'Morgan T.', summary: 'Birthday this week', firedOn: '2026-08-18', done: false, private: false },
    { id: 'sm-rem1', churchId: SM, kind: 'follow-up', person: 'Anu K.', summary: 'New visitor follow-up', firedOn: '2026-08-16', done: true, private: true },
  ],

  videoProjects: [
    { id: 'gh-v1', churchId: GH, title: 'Sunday Highlights - Aug 2', posterUrl: '/placeholders/sunday-highlights.jpg', status: 'approved' },
    { id: 'gh-v2', churchId: GH, title: 'Baptism Service', posterUrl: '/placeholders/baptism-service.jpg', status: 'pending_review' },
  ],

  artifacts: [
    { id: 'art1', name: 'The Prodigal Son (Rembrandt)', blurb: 'A meditation on grace and homecoming.', imageUrl: '/placeholders/prodigal-son.jpg', sourceUrl: 'https://example.org/prodigal-son', bibleRefs: ['Luke 15:11-32'] },
    { id: 'art2', name: 'Icon of the Good Shepherd', blurb: 'An early depiction of Christ carrying a lamb.', imageUrl: '/placeholders/good-shepherd.jpg', sourceUrl: 'https://example.org/good-shepherd', bibleRefs: ['John 10:11'] },
    { id: 'art3', name: 'The Last Supper Fresco', blurb: 'A study of the fresco tradition depicting the Last Supper.', imageUrl: '/placeholders/last-supper.jpg', sourceUrl: 'https://example.org/last-supper', bibleRefs: ['Luke 22:14-20'] },
  ],

  books: [
    { id: 'john', name: { en: 'John', ml: 'യോഹന്നാൻ' }, testament: 'new', chapterCount: 21 },
    { id: 'psalms', name: { en: 'Psalms', ml: 'സങ്കീർത്തനങ്ങൾ' }, testament: 'old', chapterCount: 150 },
  ],

  verses: [
    { ref: 'John 3:16', num: 16, text: { en: 'For God so loved the world...', ml: 'ദൈവം ലോകത്തെ ഇത്രമാത്രം സ്നേഹിച്ചു...' } },
    { ref: 'John 15:5', num: 5, text: { en: 'I am the vine, you are the branches...', ml: 'ഞാൻ മുന്തിരിവള്ളി, നിങ്ങൾ ശാഖകൾ...' } },
    { ref: 'Psalm 23:1', num: 1, text: { en: 'The Lord is my shepherd, I shall not want.', ml: 'യഹോവ എന്റെ ഇടയനാകുന്നു; എനിക്കു മുട്ടുണ്ടാകയില്ല.' } },
  ],
}
