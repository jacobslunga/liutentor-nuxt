import type { InjectionKey, Ref } from "vue";

/** Refits the PDF to the width its layout mode allows, then scrolls to the top. */
export const pdfResetZoomKey: InjectionKey<() => void> = Symbol("pdfResetZoom");

/**
 * Scale of the in-flight zoom gesture, or 1 when no gesture is running.
 *
 * EmbedPDF previews a pinch with a CSS transform and only commits the real zoom
 * level 150ms after the last wheel event, so the committed level alone lags the
 * gesture. Multiply it by this to show what is actually on screen.
 */
export const pdfLiveZoomScaleKey: InjectionKey<Ref<number>> =
  Symbol("pdfLiveZoomScale");
