# AstroAI4U handmade home — Antigravity implementation brief

Implement the supplied SVG stationery assets in the existing React Native Expo app. Do not redraw the irregular shapes with rounded `View` components. SVG artwork owns the handmade silhouette; React Native owns live text, state, navigation and accessibility.

## Visual system

- Editorial, personal astrologer's daily note; not a generic AI dashboard.
- Type: Cormorant Garamond for display, Lora for reading, Caveat only for short handwritten annotations.
- Palette: aubergine `#6C278C`, amethyst `#8B42B2`, antique gold `#C89B43`, ivory `#FFF9EB`, ink `#291A33`.
- Keep at least 11% horizontal and 15% vertical inset inside irregular paper assets. Never allow live text into torn edges.
- Rotation must be restrained: paper ±1.2°, tape ±5°, doodles ±3°. Imperfect, not messy.
- Dark mode retains `starfield.svg`; use ivory/lavender paper on top. Do not invert paper to pure black.

## Home composition

1. Opening note: greeting, sign, date, one-sentence daily theme.
2. Three tactile reveal tabs: Watch / Opportunity / Power Window.
3. Event note woven into the page: “Also — Aditi's birthday is today.” Actions remain outside the exportable region: Explore insight, Ask Hope, Best time to call, Remind me.
4. Hope margin note with two contextual prompt chips.

Avoid a grid of equal cards. Use overlapping stationery with 12–20 px overlap, alternating alignment, and 28–44 px open space between narrative groups. Keep tap targets at least 44×44.

## Export contract

Every meaningful module has one `exportRef` containing artwork, branding, date and live text only. Buttons/navigation must be siblings outside that ref. Export PNG at 1080×1350 (4:5) and optionally 1080×1920 (story). Use `react-native-view-shot` + `expo-sharing`. Load fonts and SVGs before capture.

## Required packages

`npx expo install react-native-svg react-native-view-shot expo-sharing expo-font @expo-google-fonts/cormorant-garamond @expo-google-fonts/lora @expo-google-fonts/caveat`

Use the included `src/HandmadeCard.tsx` as the implementation pattern. If Metro does not accept SVG through `require`, import SVGs as components using `react-native-svg-transformer`; do not convert the assets to ordinary rectangular screenshots.
