"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const GOOGLE_MAPS_SCRIPT_ID = "google-maps-script";
const HAS_API_KEY =
  typeof window !== "undefined" &&
  Boolean(GOOGLE_MAPS_API_KEY) &&
  GOOGLE_MAPS_API_KEY !== "YOUR_GOOGLE_MAPS_API_KEY";

type Prediction = {
  placeId: string;
  description: string;
};

type ScriptStatus = "idle" | "loading" | "ready" | "error";

function getInitialScriptStatus(): ScriptStatus {
  if (typeof window === "undefined") return "idle";
  if (!HAS_API_KEY) return "error";
  if (document.getElementById(GOOGLE_MAPS_SCRIPT_ID)) return "ready";
  return "idle";
}

function getInitialError(): string | null {
  if (typeof window === "undefined") return null;
  if (!HAS_API_KEY) return "Google Maps API key is not configured.";
  return null;
}

export function useGooglePlaces() {
  const [scriptStatus, setScriptStatus] = useState<ScriptStatus>(getInitialScriptStatus);
  const [error, setError] = useState<string | null>(getInitialError);
  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!HAS_API_KEY) {
      return;
    }
    if (document.getElementById(GOOGLE_MAPS_SCRIPT_ID)) {
      setScriptStatus("ready"); // eslint-disable-line react-hooks/set-state-in-effect
      return;
    }

    setScriptStatus("loading");
    const script = document.createElement("script");
    script.id = GOOGLE_MAPS_SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(GOOGLE_MAPS_API_KEY || "")}&libraries=places`;
    script.async = true;
    script.defer = true;
    const handleLoad = () => {
      if (isMountedRef.current) {
        setScriptStatus("ready");
      }
    };
    const handleError = () => {
      if (isMountedRef.current) {
        setError("Failed to load Google Maps script.");
        setScriptStatus("error");
      }
    };
    script.addEventListener("load", handleLoad);
    script.addEventListener("error", handleError);
    document.head.appendChild(script);

    return () => {
      script.removeEventListener("load", handleLoad);
      script.removeEventListener("error", handleError);
    };
  }, []);

  return { scriptStatus, error };
}

export function usePlacePredictions(input: string) {
  const { scriptStatus, error } = useGooglePlaces();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  const fetchPredictions = useCallback((value: string) => {
    const win = window as unknown as { google?: { maps?: { places?: unknown } } };
    if (typeof window === "undefined" || !win.google?.maps?.places) {
      setPredictions([]);
      setLoading(false);
      return;
    }

    const requestId = ++requestIdRef.current;
    setLoading(true);
    const service = new google.maps.places.AutocompleteService();

    service.getPlacePredictions(
      {
        input: value,
        types: ["(cities)"],
      },
      (results, status) => {
        if (requestId !== requestIdRef.current) {
          return;
        }
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          setPredictions(
            results.map((item) => ({
              placeId: item.place_id,
              description: item.description,
            })),
          );
        } else {
          setPredictions([]);
        }
        setLoading(false);
      },
    );
  }, []);

  useEffect(() => {
    if (!input || scriptStatus !== "ready" || error) {
      return;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      fetchPredictions(input);
    }, 200);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [input, scriptStatus, error, fetchPredictions]);

  return useMemo(() => ({ predictions, loading, ready: scriptStatus === "ready", error }), [predictions, loading, scriptStatus, error]);
}
