// strudel-jungle · Sayang Track

setcpm(170/4)

samples('github:tidalcycles/dirt-samples')
samples('github:ZaynIsk/strudel-jungle')
// samples('http://localhost:5544/strudel.json')   // local: npm run dev

// intro 16 · roller 32 · breakdown 16 · roller + trumpet 32
const DRUMS = "<0!16 1!32 0!16 1!32>"
const BIRDS = "<1!48 0!16 1!32>"
const BREAK = "<0!48 1!16 0!32>"
const LATE  = "<0!64 1!32>"

// F minor, 2 bars per chord
const prog = "<Fm9 Db^9 Bbm9 Eb11 Ab^7 Db^9 Gm7b5 C7sus>/2"
const bass = "<f1 db2 bb1 eb2 ab1 db2 g1 c2>/2"

// mixer
const master         = slider(1,     0, 2)
const breakVol       = slider(1.125, 0, 1.5)
const rideVol        = slider(.28,   0, 1)
const hatsVol        = slider(1,     0, 3)
const kickVol        = slider(.55,   0, 1.5)
const subVol         = slider(.85,   0, 1.5)
const rhodesVol      = slider(.5,    0, 1.5)
const stringsVol     = slider(.35,   0, 1.5)
const forestVol      = slider(.45,   0, 1.5)
const ghostBirdVol   = slider(.3,    0, 1.5)
const blackbirdVol   = slider(.55,   0, 1.5)
const nightingaleVol = slider(.55,   0, 1.5)
const trumpetVol     = slider(.7335, 0, 1.5)
const vocalVol       = slider(.8,    0, 1.5)
all(x => x.postgain(master))

// drums
$: s("breaks165").color("orange")
  .splice(16, "<[0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15]!3 [0 1 2 3 4 5 6 7 8 9 [10 10] 11 12 [13 14] 15 [14 15]]>")
  .gain(breakVol).hpf(70).room(.12).mask(DRUMS).analyze(4)
$: s("jungle:10*4").color("gold").analyze(4).gain(rideVol).pan(.62).mask(DRUMS)
$: s("jungle:0*16").color("khaki").analyze(4).gain(perlin.range(.06, .2).mul(hatsVol)).hpf(7000).pan(.38).mask(DRUMS)
_$: s("jungle:5").color("tomato").analyze(4).struct("x ~ ~ ~ ~ ~ ~ ~ ~ ~ x ~ ~ ~ ~ ~").gain(kickVol).lpf(300).mask(DRUMS)

// sub
$: note(bass).struct("x@6 x@4 x@6").s("sine")
  .attack(.005).release(.12).lpf(200).gain(subVol).mask(DRUMS)
  .color("mediumpurple").analyze(2)

// rhodes + strings
$: chord(prog).voicing().struct("<[x@3 x@5] [x@3 x@3 x@2]>")
  .s("gm_epiano1").gain(rhodesVol).lpf(3200).room(.5).roomsize(4)
  .color("#ffd166").analyze(3)._pianoroll({ labels: 1, autorange: 1 })
$: chord(prog).voicing().s("gm_string_ensemble_1")
  .attack(.8).release(2.5).lpf(sine.range(2000, 5000).slow(32))
  .gain(stringsVol).room(.85).roomsize(8).color("#48dbfb").analyze(3)

// birds
$: s("<rainforest:1 rainforest:0 rainforest:2 rainforest:0>/16")
  .clip(1).release(4).gain(forestVol).hpf(300).room(.3).color("#1dd1a1").analyze(5)
$: s("blackbird:5").color("seagreen").analyze(5).slow(16).gain(ghostBirdVol).lpf(2200).room(.8).roomsize(6)
$: n("<1 ~ ~ 3 ~ 2 ~ ~ 4 ~ ~ ~>").s("blackbird")
  .delay(.45).delaytime(.265).delayfeedback(.5)
  .room(.7).roomsize(6).pan(sine.slow(12)).gain(blackbirdVol).mask(BIRDS)
  .color("#7bed9f")._spectrum()
$: s("nightingale:0").slow(8).clip(1).release(3).gain(nightingaleVol).room(.5).mask(BREAK).color("pink").analyze(5)
$: n("<1 ~ 3 ~ 5 ~ 2 4>").s("nightingale")
  .delay(.35).delaytime(.265).delayfeedback(.4)
  .room(.8).roomsize(6).pan(cosine.slow(8)).gain(nightingaleVol).mask(BREAK).color("hotpink").analyze(5)

// trumpet
$: n("<[4 ~ ~ 3] [2@3 ~] [~ 1 2 ~] [0@3 ~] [4 ~ 5 ~] [6@2 5 4] [3@3 ~] ~>")
  .scale("F4:minor:pentatonic").s("gm_trumpet")
  .gain(trumpetVol).lpf(4000).room(.6).roomsize(5)
  .delay(.3).delaytime(.265).delayfeedback(.35).mask(LATE)
  .color("#54a0ff")._pianoroll({ labels: 1, autorange: 1 })

// vocal
$: s("vocals:0").slow(8).clip(1).release(2)
  .gain(vocalVol).room(.5).roomsize(5).delay(.25).delaytime(.265).mask(DRUMS).color("white")

// visuals (use 'single quotes' in here)
const look = {
  x: .70,
  y: .50,
  size: .56,
  trails: .10,
  glow: 10,
  spin: .02,
  opacity: .45,
  rings: [
    { id: 2, r: .45, wobble: .6,  color: '#a78bfa', width: 3   },  // sub
    { id: 3, r: .75, wobble: .35, color: '#48dbfb', width: 1.5 },  // rhodes + strings
    { id: 5, r: 1.0, wobble: .4,  color: '#1dd1a1', width: 1   },  // birds
  ],
  rays: { id: 4, r: 1.15, length: .4, color: '#ff9f43' },          // drums
  sparks: ['blackbird', 'nightingale', 'gm_trumpet'],
  beat: true,
}

const atmosphere = (ctx, time, haps) => {
  const w = ctx.canvas.width, h = ctx.canvas.height
  const cx = w * look.x, cy = h * look.y, R = Math.min(w, h) * look.size
  const TAU = Math.PI * 2, turn = time * look.spin * TAU
  const at = (a, r) => [cx + Math.cos(a) * r, cy + Math.sin(a) * r]
  const wave = (type, id) => (typeof getAnalyzerData === 'function' ? getAnalyzerData(type, id) : null)

  ctx.save()
  ctx.globalCompositeOperation = 'destination-out'
  ctx.fillStyle = 'rgba(0,0,0,' + look.trails + ')'
  ctx.fillRect(0, 0, w, h)
  ctx.globalCompositeOperation = 'screen'
  ctx.lineJoin = 'round'

  ctx.shadowBlur = look.glow
  ctx.globalAlpha = look.opacity
  for (const ring of look.rings) {
    const d = wave('time', ring.id)
    if (!d || !d.length) continue
    const half = d.length / 2
    ctx.beginPath()
    for (let i = 0; i <= 360; i++) {
      const t = i / 360, k = Math.floor((t < .5 ? t * 2 : 2 - t * 2) * (half - 1))
      const [x, y] = at(turn + t * TAU, R * ring.r * (1 + d[k] * ring.wobble))
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)
    }
    ctx.strokeStyle = ctx.shadowColor = ring.color
    ctx.lineWidth = ring.width
    ctx.stroke()
  }

  const f = wave('frequency', look.rays.id)
  if (f && f.length) {
    ctx.shadowBlur = 0
    ctx.strokeStyle = look.rays.color
    ctx.lineWidth = 2
    for (let i = 0; i < 120; i++) {
      const t = i / 120, u = t < .5 ? t * 2 : 2 - t * 2
      const db = f[Math.min(f.length - 1, Math.floor(Math.pow(f.length, u)))]
      const v = Math.max(0, Math.min(1, (db + 85) / 70))
      if (!(v > 0)) continue
      const a = t * TAU - turn, r0 = R * look.rays.r
      ctx.globalAlpha = look.opacity * v
      ctx.beginPath()
      ctx.moveTo(...at(a, r0))
      ctx.lineTo(...at(a, r0 + R * look.rays.length * v * v))
      ctx.stroke()
    }
  }

  ctx.shadowBlur = look.glow
  for (const hap of haps) {
    const v = hap.value
    if (!hap.whole || !look.sparks.includes(v.s)) continue
    const age = time - hap.whole.begin
    if (age < 0 || age > 2) continue
    const life = 1 - age / 2
    const pan = typeof v.pan === 'number' ? v.pan : (hap.whole.begin * .618) % 1
    const [x, y] = at(turn + pan * TAU, R * (1.3 + age * .25))
    ctx.globalAlpha = look.opacity * life
    ctx.fillStyle = ctx.shadowColor = v.color || 'white'
    ctx.beginPath()
    ctx.arc(x, y, 2 + 5 * life, 0, TAU)
    ctx.fill()
  }

  if (look.beat) {
    const [x, y] = at((time % 1) * TAU - Math.PI / 2, R * 1.3)
    ctx.globalAlpha = look.opacity
    ctx.fillStyle = ctx.shadowColor = 'white'
    ctx.beginPath()
    ctx.arc(x, y, 2.5, 0, TAU)
    ctx.fill()
  }
  ctx.restore()
}
all(x => x.onPaint(atmosphere))
