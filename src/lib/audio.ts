import type { AmbientSoundId } from '@/types'

// All sounds are synthesized in-browser with the Web Audio API — no external
// audio files are fetched, so this works fully offline and needs no assets.

let ctx: AudioContext | null = null
function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

/**
 * Browsers can silently suspend an AudioContext while a tab sits in the
 * background for a while (exactly what happens during a real ~25 minute
 * focus session). Nothing else re-triggers `getCtx()` if playback state
 * never toggles, so the context can be stuck "suspended" forever even
 * though the UI still thinks a sound is playing. Call this to force a
 * resume attempt whenever the app comes back to the foreground or a
 * session completes.
 */
export function resumeAudioContext() {
  if (ctx && ctx.state === 'suspended') void ctx.resume()
}

/**
 * Safari (unlike Chrome's "sticky activation") requires the AudioContext to
 * actually be created/resumed synchronously inside a user-gesture event
 * handler, or it can stay permanently suspended. Our sound/oscillator setup
 * normally runs a tick later inside a React effect, which is too late for
 * Safari's stricter rule. Call this directly and synchronously from every
 * click/keydown handler that starts audio, before any state updates —
 * it's idempotent, so later `getCtx()` calls from the effect just reuse
 * this same already-unlocked context.
 */
export function primeAudioContext() {
  getCtx()
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') resumeAudioContext()
  })
  window.addEventListener('focus', () => resumeAudioContext())
}

export function playChime(kind: 'chime' | 'bell' | 'digital' | 'none', volume: number) {
  if (kind === 'none') return
  const audio = getCtx()
  const now = audio.currentTime
  const master = audio.createGain()
  master.gain.value = volume
  master.connect(audio.destination)

  const notes: Record<typeof kind, number[]> = {
    chime: [523.25, 659.25, 783.99],
    bell: [880, 1108.73],
    digital: [988, 988, 1318.5],
  }

  notes[kind].forEach((freq, i) => {
    const osc = audio.createOscillator()
    const gain = audio.createGain()
    osc.type = kind === 'digital' ? 'square' : 'sine'
    osc.frequency.value = freq
    const start = now + i * 0.15
    gain.gain.setValueAtTime(0, start)
    gain.gain.linearRampToValueAtTime(0.8, start + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.9)
    osc.connect(gain)
    gain.connect(master)
    osc.start(start)
    osc.stop(start + 1)
  })
}

function makeNoiseBuffer(audio: AudioContext, seconds = 4) {
  const buffer = audio.createBuffer(1, audio.sampleRate * seconds, audio.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  return buffer
}

export interface AmbientHandle {
  analyser: AnalyserNode
  stop: () => void
  setVolume: (v: number) => void
}

export function startAmbientSound(sound: AmbientSoundId, volume: number): AmbientHandle {
  const audio = getCtx()
  const master = audio.createGain()
  master.gain.value = volume
  const analyser = audio.createAnalyser()
  analyser.fftSize = 256
  // The analyser is only a monitoring tap for the visualizer — it must not
  // sit in series on the audible path. A couple of WebKit/Safari versions
  // have had quirks with audio silently failing to reach the destination
  // when routed through an AnalyserNode first, so connect both in parallel
  // straight off `master` instead of chaining through the analyser.
  master.connect(analyser)
  master.connect(audio.destination)

  const nodes: (OscillatorNode | AudioBufferSourceNode)[] = []
  const gains: GainNode[] = []

  function addNoiseLayer(filterFreq: number, filterType: BiquadFilterType, gainValue: number) {
    const source = audio.createBufferSource()
    source.buffer = makeNoiseBuffer(audio)
    source.loop = true
    const filter = audio.createBiquadFilter()
    filter.type = filterType
    filter.frequency.value = filterFreq
    const gain = audio.createGain()
    gain.gain.value = gainValue
    source.connect(filter)
    filter.connect(gain)
    gain.connect(master)
    source.start()
    nodes.push(source)
    gains.push(gain)
  }

  function addTone(freq: number, gainValue: number, type: OscillatorType = 'sine') {
    const osc = audio.createOscillator()
    osc.type = type
    osc.frequency.value = freq
    const gain = audio.createGain()
    gain.gain.value = gainValue
    osc.connect(gain)
    gain.connect(master)
    osc.start()
    nodes.push(osc)
    gains.push(gain)
  }

  let lfo: OscillatorNode | null = null

  switch (sound) {
    case 'rain':
      addNoiseLayer(2200, 'lowpass', 0.5)
      addNoiseLayer(5000, 'highpass', 0.12)
      break
    case 'ocean': {
      addNoiseLayer(900, 'lowpass', 0.5)
      const waveGain = audio.createGain()
      waveGain.gain.value = 0.3
      lfo = audio.createOscillator()
      lfo.frequency.value = 0.12
      const lfoDepth = audio.createGain()
      lfoDepth.gain.value = 0.25
      lfo.connect(lfoDepth)
      lfoDepth.connect(waveGain.gain)
      addNoiseLayer(700, 'lowpass', 0.001)
      gains[gains.length - 1] = waveGain
      lfo.start()
      break
    }
    case 'forest':
      addNoiseLayer(1500, 'bandpass', 0.15)
      addTone(1800, 0.015, 'sine')
      addTone(2600, 0.01, 'triangle')
      break
    case 'lofi':
    default:
      addTone(220, 0.18, 'sine')
      addTone(277.18, 0.14, 'sine')
      addTone(329.63, 0.12, 'triangle')
      addNoiseLayer(3000, 'lowpass', 0.1)
      break
  }

  return {
    analyser,
    setVolume: (v) => (master.gain.value = v),
    stop: () => {
      nodes.forEach((n) => {
        try {
          n.stop()
        } catch {
          /* already stopped */
        }
      })
      lfo?.stop()
      master.disconnect()
    },
  }
}
