// Per-book scripture chunk — dynamically imported by src/services/api.ts so
// verse/lexicon text never ships in the initial bundle. Genesis 1 only, for
// this offline demo (EN: WEB, public domain; ML: Old Version register).

import type { LexiconEntry, Verse } from '../../types/models'

export const verses: Verse[] = [
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
]

export const lexicon: LexiconEntry[] = [
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
]
