"use client";

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") {
    return null;
  }

  if (!audioContext) {
    const Ctor =
      window.AudioContext ??
      (
        window as unknown as {
          webkitAudioContext?: typeof AudioContext;
        }
      ).webkitAudioContext;

    if (!Ctor) {
      return null;
    }

    audioContext = new Ctor();
  }

  return audioContext;
}

function playTone(
  context: AudioContext,
  frequency: number,
  startTime: number,
  duration: number,
) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = "sine";
  oscillator.frequency.value = frequency;

  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(
    0.25,
    startTime + 0.02,
  );
  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    startTime + duration,
  );

  oscillator.connect(gain);
  gain.connect(context.destination);

  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
}

/**
 * Alerta sonoro de pedido novo — dois tons curtos (sintetizados
 * pela Web Audio API, sem depender de nenhum arquivo de áudio).
 * Usado no painel, no Garçom e no Atendente sempre que um pedido
 * novo chega em tempo real.
 */
export function playNewOrderChime() {
  const context = getAudioContext();

  if (!context) {
    return;
  }

  if (context.state === "suspended") {
    void context.resume();
  }

  const now = context.currentTime;

  playTone(context, 880, now, 0.18);
  playTone(context, 1174.66, now + 0.14, 0.24);
}
