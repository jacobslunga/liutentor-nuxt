# Lucide → Octicons

Migration of all icons in `app/` from Lucide to GitHub Octicons via `@nuxt/icon`.

## Result

| | |
|---|---|
| `<Icon name="octicon:…">` tags | **163** across **53** files |
| Unique Octicons used | **61** (25.4 KB client bundle, uncompressed) |
| Lucide icons left in place | **3** (see [Not replaced](#not-replaced)) |
| `typecheck` / `build` | pass |

## Setup

Added `@nuxt/icon` + `@iconify-json/octicon` and registered the module in `nuxt.config.ts`:

```ts
icon: {
  mode: "svg",
  collections: ["octicon"],
  serverBundle: { collections: ["octicon"] },
  clientBundle: { scan: true, icons: [/* the 5 dynamic skill icons */] },
}
```

Two things there are load-bearing:

- **`mode: "svg"` is required, not a preference.** The shadcn variants size icons with
  `[&_svg:not([class*='size-'])]:size-4`, which only matches real `<svg>` elements. `@nuxt/icon`'s
  default `css` mode renders a `<span>`, and every icon that relies on the button/tab/dropdown
  auto-sizing (6 of them carry no size class at all) would have silently collapsed to `1em`.
- **`clientBundle.icons`** lists the five `SKILL_ICONS` in `ChatInput.vue` by hand — they're looked
  up dynamically so `scan: true` can't see them, and without the entries they'd fall back to an HTTP
  fetch from the Iconify API on client-side navigation.

Octicon bodies already carry `fill="currentColor"`, so the `fill-current` classes on the old
`Play`/`Pause`/`Square` icons were dropped as dead weight.

The icons are inlined during SSR (76 on `/search/TATA43`) and resolve from the local client bundle on
client-only routes (verified 16 on the exam page in headless Chrome) — no runtime network calls.

## Not replaced

Three icons stayed Lucide. Octicons has no glyph in the same conceptual family for any of them, and
`nuxt-lucide-icons` is still registered so they keep working unchanged.

| Icon | Where | Why |
|---|---|---|
| `LucideDelete` | `DailyGameKeyboard.vue:88` | Backspace key. Octicons has no backspace/delete-key glyph — nothing in the set reads as "erase last character". |
| `LucideCornerDownLeft` | `CourseSearchDropdown.vue:176` | The ↵ return-key hint next to a suggestion. `arrow-down-left-16` is a plain diagonal arrow and loses the "press Enter" meaning entirely. |
| `LucideMousePointerClick` | `search/[courseCode]/[examId].vue:389` | "Hover to reveal the answer key". Octicons has no cursor or pointer icon at all. |

## The odd ones

Straight matches (`x`, `check`, `plus`, `upload`, `download`, `chevron-*`, `arrow-*`, `eye`/`eye-closed`,
`lock`, `trash`, `search`, `gear`, `person`, `sign-out`, `globe`, `mail`, `inbox`, `image`, `book`,
`stopwatch`, `share`, `comment`, `sun`/`moon`, `grabber`, `kebab-horizontal`, `stack`, …) aren't listed.
These are the ones where I made a call:

### Semantics preserved, shape changed

| Lucide | Octicon | Note |
|---|---|---|
| `AlertCircle` | `alert-16` | Circle-with-! → triangle-with-!. Both usages are error states (`text-destructive` in `ExamUploadForm`, `feedback.vue`), so the meaning is exact even though the outline changed. |
| `Loader2` / `Loader` / `RefreshCw` / `RotateCw` | `sync-16` | Octicons has no spinner. `sync` is a circular arrow and reads correctly under `animate-spin` — 20 call sites now share it. It also absorbed `RotateCw` (PDF page rotate in `PdfPageControls.vue`), which is the weakest of the four: it now reads more like "refresh" than "rotate". |
| `Minus` | `dash-16` | Same glyph, Octicons just names it differently. |
| `Ellipsis` | `kebab-horizontal-16` | Same. |
| `Timer` | `stopwatch-16` | Same. |
| `Monitor` | `device-desktop-16` | Same. |
| `MoonStar` | `moon-16` | Loses the star; still the theme-switcher moon. |
| `Maximize` / `Minimize` | `screen-full-16` / `screen-normal-16` | Better than a literal match — these are Octicons' actual enter/exit-fullscreen pair, which is what the focus-mode toggle does. |
| `GripVertical` | `grabber-16` | Exact conceptual equivalent (drag handle). |
| `Square` (stop generating) | `square-fill-16` | Filled variant, so `fill-current` came off. |
| `Layers` (Quiz tab) | `stack-16` | Exact equivalent. |
| `GraduationCap` | `mortar-board-16` | Same object, different name. |
| `ListChecks` | `checklist-16` | Same. |

### Detail lost

| Lucide | Octicon | What went missing |
|---|---|---|
| `MailCheck` | `mail-16` | The checkmark. `logga-in.vue` signup-success panel — the surrounding copy ("Vi har skickat en bekräftelse… Kontrollera din inkorg") already carries the meaning. `inbox-16` was the alternative if you want the icon to echo "inkorg". |
| `ImagePlus` | `image-16` | The `+`. `ChatDropOverlay.vue` — it's a drop target, so "image" plus the overlay context is enough. |
| `ScrollText` (Tentor tab) | `file-16` | The scroll shape; now the same generic document icon as `FileText`. |
| `AlignLeft` (`/sammanfatta` skill) | `list-unordered-16` | Text-alignment lines → bulleted list. Octicons' only close alternative, `three-bars`, reads as a hamburger menu, which would be worse. |

### Directional / layout calls

| Lucide | Octicon | Reasoning |
|---|---|---|
| `CornerUpLeft` → `reply-16` | `SelectionPopover` "Svara", `ChatInput` reply banner | Octicons' `reply` is exactly this arrow, and both call sites mean "reply". Upgrade, not a compromise. |
| `CornerUpRight` → `arrow-up-right-16` | `PdfSelectionMenu` "Förklara" | No mirrored `reply` exists. The diagonal arrow keeps the "send this outward" motion. `comment-ai-16` would be more expressive if you'd rather lean into the AI framing. |
| `ArrowUpDown` → `arrow-switch-16` | sort trigger in `search/[courseCode]/index.vue` | Rotated 90° (Octicons' switch arrows are horizontal), but direction-neutral — which matters, because the current direction is shown by a separate `arrow-up`/`arrow-down` next to it. `sort-desc-16` would have contradicted an ascending sort. |
| `Columns2` → `split-view-16` | `ExamHeader` "Tenta och facit" | Exact match for a side-by-side layout. |
| `PanelRight` → **two different icons** | see below | |

`PanelRight` was doing two unrelated jobs, so it split:

- `ExamHeader.vue:398` — "Endast tenta", the single-pane sibling of the split view → **`sidebar-collapse-16`**
- `ChatHeader.vue:41`, `MobileChatSheet.vue:115` — the "Historik" toggle → **`sidebar-expand-16`**

`history-16` would arguably be a better icon for the history button than any panel glyph, but that
changes the metaphor from layout to content, so I left it as a panel toggle. Easy swap if you disagree.

### Charts

`ChartSpline` (Statistik tab) → `graph-16`, `ChartColumn` (`CourseStatsEmpty`) → `graph-bar-vertical-16`.
Octicons has no smooth-line chart; `graph-16` is GitHub's own "Insights" icon, which is the right
register for a statistics tab. `graph-stacked-area-16` is closer to a spline curve if you prefer that.

## Also worth knowing

- **`play-16` has a circle around it, `pause-16` doesn't.** In `lock-in/[examId].vue` these sit in the
  same toggle button, so the pair now looks slightly asymmetric. `triangle-right-16` is a bare filled
  triangle, but it's drawn much smaller within the 16px box (7px tall vs. pause's 12px), so it looked
  worse. Flagging rather than fixing.
- **The shadcn primitives were migrated too** — `DialogContent`, `DialogScrollContent`,
  `DropdownMenuCheckboxItem`, `DropdownMenuRadioItem`, `DropdownMenuSubTrigger`, `Sonner`. That means
  re-running the shadcn CLI on any of those components will reintroduce Lucide imports. Sonner's error
  toast went from `OctagonX` to `x-circle-fill-16` (GitHub's error icon) rather than `stop-16`: the
  Octicons octagon holds an `!`, not an `✕`, so it would have duplicated the warning toast's
  `alert-fill-16` instead of distinguishing error from warning.
- **`lucide-vue-next` is now an unused dependency.** It was only imported by `ChatInput.vue`. I left it
  in `package.json` rather than touch dependencies beyond adding the two new ones — safe to drop.
  `nuxt-lucide-icons` (and its `@lucide/vue` dependency) must stay for the three kept icons.
- **`MainInput.vue:198` got an explicit `size-6`.** Lucide components default to 24×24; `@nuxt/icon`
  defaults to `1em`. That icon is a bare sibling of an input with no button wrapper to size it, so
  without the class it would have shrunk to ~14px. Every other unsized icon sits inside a
  `Button`/`DialogClose` and is handled by the existing `[&_svg]` rules.
