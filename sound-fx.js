/**
 * sound-fx.js
 * High-fidelity, trauma-informed procedural Web Audio API sound generator.
 * 100% offline, zero external audio assets, low latency and soft on ears.
 * Provides:
 * - DTMF Phone Dial tones & Ringing chimes for the 3D Helpline Phone
 * - Serene Teal Survivor Chimes for interactive exploration
 * - Synthesized Night Walk Footsteps
 * - Ambient Calming Atmosphere (toggleable)
 */

const SoundFX = (function () {
  'use strict';

  let audioCtx = null;
  let isMuted = false;
  let ambientGain = null;
  let isAmbientPlaying = false;
  let ambientOscillators = [];

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  /**
   * Play a delicate, crystalline Teal Survivor Chime
   */
  function playTealChime(frequency = 528) {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, now);
      osc.frequency.exponentialRampToValueAtTime(frequency * 1.5, now + 0.35);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.85);
    } catch (e) {
      // Audio autoplay policy
    }
  }

  /**
   * Play realistic DTMF Dual-Tone Telephone Dial Tone
   * Used when dialing helplines on the 3D Phone
   */
  function playPhoneDialTone(key = '1') {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    // Standard DTMF keypad frequencies (Hz)
    const dtmfFreqs = {
      '1': [697, 1209],
      '2': [697, 1336],
      '3': [697, 1477],
      '4': [770, 1209],
      '5': [770, 1336],
      '6': [770, 1477],
      '7': [852, 1209],
      '8': [852, 1336],
      '9': [852, 1477],
      '0': [941, 1336],
      '*': [941, 1209],
      '#': [941, 1477]
    };

    const freqs = dtmfFreqs[key] || [770, 1336];

    try {
      const now = ctx.currentTime;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.06, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

      freqs.forEach(f => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now);
        osc.connect(gain);
        osc.start(now);
        osc.stop(now + 0.23);
      });

      gain.connect(ctx.destination);
    } catch (e) {}
  }

  /**
   * Play Gentle Phone Ring / Connect Chime
   */
  function playPhoneRing() {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(440, now);
      osc2.frequency.setValueAtTime(480, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.05, now + 0.05);
      gain.gain.setValueAtTime(0.05, now + 0.6);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.95);
      osc2.stop(now + 0.95);
    } catch (e) {}
  }

  /**
   * Synthesize soft footstep sound for the 3D Night Walk
   */
  function playWalkFootstep() {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const bufferSize = ctx.sampleRate * 0.12;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.025));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320 + Math.random() * 80, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.035, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.11);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now);
    } catch (e) {}
  }

  /**
   * Toggle Ambient Meditative Soundscape (Peace & Hope)
   */
  function toggleAmbientSoundscape() {
    const ctx = getAudioContext();
    if (!ctx) return false;

    if (isAmbientPlaying) {
      stopAmbientSoundscape();
      return false;
    } else {
      startAmbientSoundscape();
      return true;
    }
  }

  function startAmbientSoundscape() {
    const ctx = getAudioContext();
    if (!ctx) return;

    stopAmbientSoundscape();
    const now = ctx.currentTime;

    ambientGain = ctx.createGain();
    ambientGain.gain.setValueAtTime(0.0001, now);
    ambientGain.gain.linearRampToValueAtTime(0.04, now + 2);
    ambientGain.connect(ctx.destination);

    // 4 gentle ambient frequencies in harmony (528Hz Solfeggio frequency for healing & transformation)
    const freqs = [174, 285, 396, 528];
    ambientOscillators = freqs.map((f, i) => {
      const osc = ctx.createOscillator();
      const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);

      if (panner) {
        panner.pan.value = (i % 2 === 0) ? -0.4 : 0.4;
        osc.connect(panner);
        panner.connect(ambientGain);
      } else {
        osc.connect(ambientGain);
      }

      osc.start(now);
      return osc;
    });

    isAmbientPlaying = true;
  }

  function stopAmbientSoundscape() {
    if (!isAmbientPlaying) return;
    const ctx = getAudioContext();
    if (ctx && ambientGain) {
      const now = ctx.currentTime;
      ambientGain.gain.linearRampToValueAtTime(0.00001, now + 1);
      setTimeout(() => {
        ambientOscillators.forEach(osc => {
          try { osc.stop(); osc.disconnect(); } catch (e) {}
        });
        ambientOscillators = [];
      }, 1000);
    }
    isAmbientPlaying = false;
  }

  return {
    init: getAudioContext,
    playTealChime,
    playPhoneDialTone,
    playPhoneRing,
    playWalkFootstep,
    toggleAmbientSoundscape,
    isAmbientPlaying: () => isAmbientPlaying,
    setMuted: (val) => { isMuted = !!val; if (isMuted) stopAmbientSoundscape(); },
    isMuted: () => isMuted
  };
})();

if (typeof window !== 'undefined') {
  window.SoundFX = SoundFX;
}
