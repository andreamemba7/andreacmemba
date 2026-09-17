// Fallback/demo data - used automatically until js/sanity-config.js is
// filled in with a real Sanity project ID. Once Sanity is connected, this
// is ignored in favor of live content (see sanity-client.js).
window.FALLBACK_PROJECTS = [
  {
    slug: "lululemon-train",
    name: "Lululemon – Train",
    description: "A director's cut about reclaiming the joy of movement, not as a means to an end, but as the end itself. Somewhere along the way, fitness became synonymous with goals, as if you're either training for something or you're not serious. This piece pushes back on that, following real people across a full spectrum of movement: hiking, trail running, Pilates, strength training, capturing the individual and collective moments that make it all worth it, the small wins, the struggle, the laughter, the quiet perseverance. No finish lines. No metrics. Just people who've found something real in the simple act of moving their bodies.",
    role: "Director",
    credits: [
      { role: "DP", name: "Severin Strauss" },
      { role: "Edit", name: "Davy Gomez" },
      { role: "Production Co", name: "Anorak" },
      { role: "Editor", name: "Benno Schoppmann" }
    ],
    cast: "Sam Rivera and Priya Nair",
    media: [
      { type: "video", src: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", poster: "https://picsum.photos/seed/lltrain1/1400/1050" },
      { type: "video", src: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4", poster: "https://picsum.photos/seed/lltrain2/1400/1050" },
      { type: "image", src: "https://picsum.photos/seed/lltrain3/1400/1050" }
    ],
    outtakes: [
      { type: "image", src: "https://picsum.photos/seed/lltrainout1/900/1350", orientation: "portrait" },
      { type: "image", src: "https://picsum.photos/seed/lltrainout2/1350/900", orientation: "landscape" },
      { type: "image", src: "https://picsum.photos/seed/lltrainout3/1100/1100", orientation: "square" },
      { type: "video", src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4", orientation: "portrait" }
    ]
  },
  {
    slug: "lululemon-yoga",
    name: "Lululemon – Yoga",
    description: "A director's cut about reclaiming the joy of movement, not as a means to an end, but as the end itself. Somewhere along the way, fitness became synonymous with goals, as if you're either training for something or you're not serious. This piece pushes back on that, following real people across a full spectrum of movement: hiking, trail running, Pilates, strength training, capturing the individual and collective moments that make it all worth it, the small wins, the struggle, the laughter, the quiet perseverance. No finish lines. No metrics. Just people who've found something real in the simple act of moving their bodies.",
    role: "Director",
    credits: [
      { role: "DP", name: "Severin Strauss" },
      { role: "Edit", name: "Davy Gomez" },
      { role: "Production Co", name: "Anorak" },
      { role: "Editor", name: "Benno Schoppmann" }
    ],
    media: [
      { type: "video", src: "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4", poster: "https://picsum.photos/seed/llyoga1/1400/1050" },
      { type: "image", src: "https://picsum.photos/seed/llyoga2/1400/1050" },
      { type: "video", src: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4", poster: "https://picsum.photos/seed/llyoga3/1400/1050" }
    ],
    outtakes: [
      { type: "image", src: "https://picsum.photos/seed/llyogaout1/900/1350", orientation: "portrait" },
      { type: "image", src: "https://picsum.photos/seed/llyogaout2/1350/900", orientation: "landscape" },
      { type: "video", src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4", orientation: "landscape" },
      { type: "image", src: "https://picsum.photos/seed/llyogaout4/1100/1100", orientation: "square" }
    ]
  },
  {
    slug: "nike-run",
    name: "Nike – Run",
    description: "A director's cut about reclaiming the joy of movement, not as a means to an end, but as the end itself. Somewhere along the way, fitness became synonymous with goals, as if you're either training for something or you're not serious. This piece pushes back on that, following real people across a full spectrum of movement: hiking, trail running, Pilates, strength training, capturing the individual and collective moments that make it all worth it, the small wins, the struggle, the laughter, the quiet perseverance. No finish lines. No metrics. Just people who've found something real in the simple act of moving their bodies.",
    role: "Director",
    credits: [
      { role: "DP", name: "Severin Strauss" },
      { role: "Edit", name: "Davy Gomez" },
      { role: "Production Co", name: "Anorak" },
      { role: "Editor", name: "Benno Schoppmann" }
    ],
    media: [
      { type: "video", src: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4", poster: "https://picsum.photos/seed/nikerun1/1400/1050" },
      { type: "image", src: "https://picsum.photos/seed/nikerun2/1400/1050" }
    ],
    outtakes: [
      { type: "image", src: "https://picsum.photos/seed/nikerunout1/1100/1100", orientation: "square" },
      { type: "image", src: "https://picsum.photos/seed/nikerunout2/900/1350", orientation: "portrait" },
      { type: "image", src: "https://picsum.photos/seed/nikerunout3/1350/900", orientation: "landscape" },
      { type: "video", src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4", orientation: "portrait" }
    ]
  },
  {
    slug: "nike-studio",
    name: "Nike – Studio",
    description: "A director's cut about reclaiming the joy of movement, not as a means to an end, but as the end itself. Somewhere along the way, fitness became synonymous with goals, as if you're either training for something or you're not serious. This piece pushes back on that, following real people across a full spectrum of movement: hiking, trail running, Pilates, strength training, capturing the individual and collective moments that make it all worth it, the small wins, the struggle, the laughter, the quiet perseverance. No finish lines. No metrics. Just people who've found something real in the simple act of moving their bodies.",
    role: "Director",
    credits: [
      { role: "DP", name: "Severin Strauss" },
      { role: "Edit", name: "Davy Gomez" },
      { role: "Production Co", name: "Anorak" },
      { role: "Editor", name: "Benno Schoppmann" }
    ],
    media: [
      { type: "image", src: "https://picsum.photos/seed/nikestudio1/1400/1050" },
      { type: "video", src: "https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4", poster: "https://picsum.photos/seed/nikestudio2/1400/1050" }
    ],
    outtakes: [
      { type: "image", src: "https://picsum.photos/seed/nikestudioout1/900/1350", orientation: "portrait" },
      { type: "video", src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4", orientation: "landscape" },
      { type: "image", src: "https://picsum.photos/seed/nikestudioout3/1100/1100", orientation: "square" },
      { type: "image", src: "https://picsum.photos/seed/nikestudioout4/1350/900", orientation: "landscape" }
    ]
  }
];

// Demo photos for the Photography page - 15 portrait + 1 landscape source
// image, matching the reference grid's mix. The grid itself crops every
// cell to a uniform 2:3 box via object-fit: cover regardless of the
// source's own orientation. Each also carries a heading/subheading pair
// for the single-photo viewer.
window.FALLBACK_PHOTOS = [
  { url: "https://picsum.photos/seed/photo01/800/1200", heading: "Studio Visit", subheading: "Working Objects" },
  { url: "https://picsum.photos/seed/photo02/800/1200", heading: "Studio Visit", subheading: "Working Objects" },
  { url: "https://picsum.photos/seed/photo03/800/1200", heading: "Studio Visit", subheading: "Working Objects" },
  { url: "https://picsum.photos/seed/photo04/800/1200", heading: "Coastal Light", subheading: "Morning Series" },
  { url: "https://picsum.photos/seed/photo05/1200/800", heading: "Coastal Light", subheading: "Morning Series" },
  { url: "https://picsum.photos/seed/photo06/800/1200", heading: "Coastal Light", subheading: "Morning Series" },
  { url: "https://picsum.photos/seed/photo07/800/1200", heading: "Field Notes", subheading: "Personal Work" },
  { url: "https://picsum.photos/seed/photo08/800/1200", heading: "Field Notes", subheading: "Personal Work" },
  { url: "https://picsum.photos/seed/photo09/800/1200", heading: "Field Notes", subheading: "Personal Work" },
  { url: "https://picsum.photos/seed/photo10/800/1200", heading: "Interiors", subheading: "Quiet Spaces" },
  { url: "https://picsum.photos/seed/photo11/800/1200", heading: "Interiors", subheading: "Quiet Spaces" },
  { url: "https://picsum.photos/seed/photo12/800/1200", heading: "Interiors", subheading: "Quiet Spaces" },
  { url: "https://picsum.photos/seed/photo13/800/1200", heading: "On Location", subheading: "Behind the Scenes" },
  { url: "https://picsum.photos/seed/photo14/800/1200", heading: "On Location", subheading: "Behind the Scenes" },
  { url: "https://picsum.photos/seed/photo15/800/1200", heading: "On Location", subheading: "Behind the Scenes" },
  { url: "https://picsum.photos/seed/photo16/800/1200", heading: "On Location", subheading: "Behind the Scenes" }
];
