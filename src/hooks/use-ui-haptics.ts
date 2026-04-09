"use client";

import { useCallback } from "react";

import { useWebHaptics } from "web-haptics/react";

export function useUiHaptics() {
  const { trigger } = useWebHaptics();

  const triggerMenuHaptic = useCallback(() => {
    void trigger("nudge");
  }, [trigger]);

  const triggerThemeHaptic = useCallback(() => {
    void trigger("success");
  }, [trigger]);

  return {
    triggerMenuHaptic,
    triggerThemeHaptic,
  };
}
