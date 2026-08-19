import type { InjectionKey } from "vue";

/** Refits the PDF to the width its layout mode allows, then scrolls to the top. */
export const pdfResetZoomKey: InjectionKey<() => void> = Symbol("pdfResetZoom");
