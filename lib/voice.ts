// Browser speech recognition (Chrome, Edge and Safari support it; availability varies). English and Hindi.
type Rec = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type RecCtor = new () => Rec;

function ctor(): RecCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: RecCtor; webkitSpeechRecognition?: RecCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export const speechSupported = () => ctor() !== null;

export type VoiceLang = "en-IN" | "hi-IN";

// Starts listening and returns a function that stops it. `onText` gets the final transcript.
export function listen(opts: { lang: VoiceLang; onText: (text: string) => void; onEnd: () => void; onError: (message: string) => void }): () => void {
  const C = ctor();
  if (!C) {
    opts.onError("Voice input isn't supported in this browser. You can type instead.");
    opts.onEnd();
    return () => {};
  }
  const rec = new C();
  rec.lang = opts.lang;
  rec.interimResults = false;
  rec.continuous = false;
  rec.onresult = (e) => {
    const parts: string[] = [];
    for (let i = 0; i < e.results.length; i++) parts.push(e.results[i][0].transcript);
    const text = parts.join(" ").trim();
    if (text) opts.onText(text);
  };
  rec.onerror = (e) => {
    const msg =
      e.error === "not-allowed" || e.error === "service-not-allowed"
        ? "Microphone permission is off. Allow it in your browser settings, or type instead."
        : e.error === "no-speech"
          ? "I didn't hear anything. Try again."
          : "Voice input stopped. You can try again or type.";
    opts.onError(msg);
  };
  rec.onend = opts.onEnd;
  try {
    rec.start();
  } catch {
    opts.onError("Voice input couldn't start. You can type instead.");
    opts.onEnd();
  }
  return () => {
    try {
      rec.stop();
    } catch {
      // already stopped
    }
  };
}
