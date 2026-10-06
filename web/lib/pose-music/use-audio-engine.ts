'use client';

import { useCallback, useRef, useState, type RefObject } from 'react';

/**
 * Port of the legacy WebAudio block in posemusic.html: a lazily-created
 * AudioContext with gain -> lowshelf(bass) -> highshelf(treble) -> lowpass(lo-fi)
 * -> destination, and the <audio> element wired into it through a
 * MediaElementSource the first time an effect needs it.
 */

const EFFECT_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];
const NIGHTCORE_RATE = 1.3;
const FULL_BANDWIDTH_HZ = 22050;
const LOFI_CUTOFF_HZ = 2200;
const REVERB_SECONDS = 2.5;
const REVERB_WET_GAIN = 0.45;

type Graph = {
  ctx: AudioContext;
  gain: GainNode;
  bass: BiquadFilterNode;
  treble: BiquadFilterNode;
  lofi: BiquadFilterNode;
};

export type ToggleName = 'reverb' | 'echo' | 'lofi' | 'nightcore';

export function useAudioEngine(audioRef: RefObject<HTMLAudioElement | null>) {
  const graphRef = useRef<Graph | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const reverbRef = useRef<ConvolverNode | null>(null);

  const [volume, setVolumeState] = useState(1);
  const [pitch, setPitchState] = useState(0);
  const [bass, setBassState] = useState(0);
  const [treble, setTrebleState] = useState(0);
  const [activeSpeed, setActiveSpeed] = useState<number | null>(1);
  const [toggles, setToggles] = useState<Record<ToggleName, boolean>>({
    reverb: false,
    echo: false,
    lofi: false,
    nightcore: false,
  });

  const getGraph = useCallback((): Graph => {
    if (!graphRef.current) {
      const AudioCtor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const ctx = new AudioCtor();
      const gain = ctx.createGain();
      const bass = ctx.createBiquadFilter();
      bass.type = 'lowshelf';
      bass.frequency.value = 200;
      const treble = ctx.createBiquadFilter();
      treble.type = 'highshelf';
      treble.frequency.value = 4000;
      const lofi = ctx.createBiquadFilter();
      lofi.type = 'lowpass';
      lofi.frequency.value = FULL_BANDWIDTH_HZ;
      gain.connect(bass);
      bass.connect(treble);
      treble.connect(lofi);
      lofi.connect(ctx.destination);
      graphRef.current = { ctx, gain, bass, treble, lofi };
    }
    return graphRef.current;
  }, []);

  // Routing the element through WebAudio makes a cross-origin, non-CORS stream
  // silent, so this only happens once an effect is actually engaged.
  const connectSource = useCallback(() => {
    const graph = getGraph();
    const el = audioRef.current;
    if (!sourceRef.current && el) {
      try {
        sourceRef.current = graph.ctx.createMediaElementSource(el);
        sourceRef.current.connect(graph.gain);
      } catch {
        sourceRef.current = null;
      }
    }
    return sourceRef.current;
  }, [audioRef, getGraph]);

  const rewireWithoutReverb = useCallback(() => {
    const graph = graphRef.current;
    if (!graph) return;
    graph.treble.disconnect();
    graph.treble.connect(graph.lofi);
  }, []);

  const setSpeed = useCallback((value: number) => {
    const el = audioRef.current;
    if (el) el.playbackRate = value;
    setActiveSpeed(value);
  }, [audioRef]);

  const setVolume = useCallback((value: number) => {
    const el = audioRef.current;
    if (el) el.volume = value;
    setVolumeState(value);
  }, [audioRef]);

  const setPitch = useCallback((value: number) => {
    const el = audioRef.current;
    if (el) el.playbackRate = Math.pow(2, value / 12);
    setPitchState(value);
    setActiveSpeed(null);
  }, [audioRef]);

  const setBass = useCallback((value: number) => {
    getGraph();
    connectSource();
    const graph = graphRef.current;
    if (graph) graph.bass.gain.value = value;
    setBassState(value);
  }, [connectSource, getGraph]);

  const setTreble = useCallback((value: number) => {
    getGraph();
    connectSource();
    const graph = graphRef.current;
    if (graph) graph.treble.gain.value = value;
    setTrebleState(value);
  }, [connectSource, getGraph]);

  const setReverb = useCallback((on: boolean) => {
    const graph = getGraph();
    connectSource();
    if (on) {
      const length = graph.ctx.sampleRate * REVERB_SECONDS;
      const impulse = graph.ctx.createBuffer(2, length, graph.ctx.sampleRate);
      for (let channel = 0; channel < 2; channel += 1) {
        const data = impulse.getChannelData(channel);
        for (let i = 0; i < length; i += 1) {
          data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3);
        }
      }
      const convolver = graph.ctx.createConvolver();
      convolver.buffer = impulse;
      const wet = graph.ctx.createGain();
      wet.gain.value = REVERB_WET_GAIN;
      graph.treble.disconnect();
      graph.treble.connect(graph.lofi);
      graph.treble.connect(convolver);
      convolver.connect(wet);
      wet.connect(graph.ctx.destination);
      reverbRef.current = convolver;
    } else {
      try {
        reverbRef.current?.disconnect();
      } catch {
        /* already disconnected */
      }
      reverbRef.current = null;
      rewireWithoutReverb();
    }
  }, [connectSource, getGraph, rewireWithoutReverb]);

  const setLofi = useCallback((on: boolean) => {
    const graph = getGraph();
    connectSource();
    graph.lofi.frequency.value = on ? LOFI_CUTOFF_HZ : FULL_BANDWIDTH_HZ;
  }, [connectSource, getGraph]);

  /** Legacy applyEcho() only primes the context and wires the source. */
  const setEcho = useCallback(() => {
    getGraph();
    connectSource();
  }, [connectSource, getGraph]);

  const setNightcore = useCallback((on: boolean) => {
    const el = audioRef.current;
    if (el) el.playbackRate = on ? NIGHTCORE_RATE : 1;
    setActiveSpeed(on ? null : 1);
  }, [audioRef]);

  const toggle = useCallback((name: ToggleName, on: boolean) => {
    setToggles((prev) => ({ ...prev, [name]: on }));
    if (name === 'reverb') setReverb(on);
    if (name === 'echo') setEcho();
    if (name === 'lofi') setLofi(on);
    if (name === 'nightcore') setNightcore(on);
  }, [setEcho, setLofi, setNightcore, setReverb]);

  /**
   * Mirrors legacy resetEffects(), including the detail that re-applying pitch
   * afterwards clears the highlighted speed button.
   */
  const resetEffects = useCallback(() => {
    const el = audioRef.current;
    setSpeed(1);
    setVolume(1);
    setPitchState(0);
    if (el) el.playbackRate = 1;
    setActiveSpeed(null);
    setBass(0);
    setTreble(0);
    setToggles({ reverb: false, echo: false, lofi: false, nightcore: false });
    const graph = graphRef.current;
    if (graph) graph.lofi.frequency.value = FULL_BANDWIDTH_HZ;
    if (reverbRef.current) {
      try {
        reverbRef.current.disconnect();
      } catch {
        /* already disconnected */
      }
      reverbRef.current = null;
      rewireWithoutReverb();
    }
  }, [audioRef, rewireWithoutReverb, setBass, setSpeed, setTreble, setVolume]);

  /** Re-arm the graph for a newly loaded element after the view reset it. */
  const resumeGraph = useCallback(() => {
    if (graphRef.current) connectSource();
  }, [connectSource]);

  return {
    effects: EFFECT_SPEEDS,
    volume,
    pitch,
    bass,
    treble,
    activeSpeed,
    toggles,
    setSpeed,
    setVolume,
    setPitch,
    setBass,
    setTreble,
    toggle,
    resetEffects,
    resumeGraph,
    graphReady: () => graphRef.current !== null,
  };
}

export type AudioEngine = ReturnType<typeof useAudioEngine>;
