"use client";

import { useState, useEffect } from "react";
import { PwaBeforeInstallPromptEvent } from "@/types";

export function usePwa() {
  const [deferredPrompt, setDeferredPrompt] = useState<PwaBeforeInstallPromptEvent | null>(null);

  const [isStandalone] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const isStandaloneDisplay = window.matchMedia("(display-mode: standalone)").matches;
    const isNavStandalone = Boolean(
      (navigator as unknown as { standalone?: boolean }).standalone
    );
    return isStandaloneDisplay || isNavStandalone;
  });

  const [isInstalled, setIsInstalled] = useState<boolean>(() => isStandalone);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as PwaBeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const installPwa = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
      setDeferredPrompt(null);
    }
  };

  return { isInstalled, isStandalone, canInstall: Boolean(deferredPrompt), installPwa };
}
