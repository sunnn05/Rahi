import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Thin wrapper over the browser's built-in SpeechRecognition (Web Speech API).
 *
 * Free: no key, no account, no cost. Built into Chrome, Edge, and Safari.
 *
 * Two honest limitations, surfaced to the caller rather than hidden:
 *  1. Not universally supported (Firefox notably lacks it). We feature-detect
 *     and expose `supported` so the UI can fall back to the text box instead
 *     of showing a broken mic button.
 *  2. In Chrome, audio is sent to Google's servers for transcription, so it
 *     needs a connection — it will NOT work offline. That's acceptable here
 *     because voice is an enhancement; the text box and the offline protocol
 *     cards remain the reliable path with no signal.
 *
 * The hook only ever produces a transcript string. It does no classification
 * itself — the transcript goes to the keyword classifier exactly as typed
 * text would, so voice and typing share one code path downstream.
 */
export function useSpeechInput({ lang = "en-IN" } = {}) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SR =
      typeof window !== "undefined" &&
      (window.SpeechRecognition || window.webkitSpeechRecognition);

    if (!SR) {
      setSupported(false);
      return;
    }
    setSupported(true);

    const recognition = new SR();
    recognition.lang = lang;
    recognition.continuous = true; // keep listening through pauses
    recognition.interimResults = true; // show words as they're recognised

    recognition.onresult = (event) => {
      let full = "";
      for (let i = 0; i < event.results.length; i++) {
        full += event.results[i][0].transcript;
      }
      setTranscript(full);
    };

    recognition.onerror = (event) => {
      // 'no-speech', 'audio-capture', 'not-allowed' are the common ones.
      if (event.error === "not-allowed") {
        setError("Microphone permission denied. You can type instead.");
      } else if (event.error === "no-speech") {
        setError("Didn't catch that. Try again, or type instead.");
      } else if (event.error === "network") {
        setError("Voice needs a connection. Type instead if you have no signal.");
      } else {
        setError("Voice input failed. Please type instead.");
      }
      setListening(false);
    };

    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.abort();
      } catch {
        /* already stopped */
      }
    };
  }, [lang]);

  const start = useCallback(() => {
    if (!recognitionRef.current) return;
    setError(null);
    setTranscript("");
    try {
      recognitionRef.current.start();
      setListening(true);
    } catch {
      // start() throws if called while already running — ignore.
    }
  }, []);

  const stop = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch {
      /* already stopped */
    }
    setListening(false);
  }, []);

  return { supported, listening, transcript, error, start, stop, setTranscript };
}
