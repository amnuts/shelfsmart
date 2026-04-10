# ShelfSmart - Design Specification

## Overview

ShelfSmart is a mobile cost comparison app for grocery shoppers. Users enter the price and unit count for two products, and the app instantly calculates which is the better value per unit. The app is designed for quick, in-store use with bold visuals that make the winner immediately obvious.

## Scope

### Phase 1 (This Build)
- Manual input comparison of two products
- Instant auto-calculation
- Bold visual result display
- Settings screen with theme toggle

### Phase 2 (Future)
- Camera-based OCR to photograph price tags and auto-populate fields
- Google Play Store launch (Android)

## Technology

- **Framework:** React Native (single codebase for iOS and Android)
- **Target platform (Phase 1):** iOS
- **Language:** TypeScript

## Architecture

### Navigation Structure

Tab-based navigation with two tabs:

1. **Compare** (default) - Main comparison screen
2. **Settings** - Theme toggle and app info

### State Management

Lightweight local state (React `useState`/`useReducer`). No external state library needed for Phase 1. Four input values + calculated result is the entire app state.

## Compare Screen

### Layout (top to bottom)

1. **Header** - "ShelfSmart" app title
2. **Product A Card** - Labeled "Product A" with two side-by-side input fields:
   - Price (numeric, accepts decimals, locale-aware currency symbol displayed outside the field)
   - Units (numeric, accepts decimals and whole numbers)
3. **Product B Card** - Same layout as Product A
4. **Result Area** - Hidden until all 4 fields have non-zero values, then slides in (300ms ease-out animation):
   - Product A card updates to show per-unit price (e.g., "$0.03/unit") within the card
   - Product B card updates to show per-unit price within the card
   - Winner card: green left border + subtle green background tint + checkmark icon
   - Loser card: grey left border + slightly dimmed
   - Percentage badge (pill shape) between result cards: "Product B is **28% cheaper**"
5. **Clear Button** - Always visible at bottom, resets all fields and hides result

### Input Behavior

- Tapping any field opens the numeric keypad (no full keyboard)
- Price field: decimals allowed, no negative numbers
- Units field: decimals and whole numbers allowed, no negatives
- Tab order: Product A Price -> Product A Units -> Product B Price -> Product B Units
- Auto-calculation triggers the moment all 4 fields have a value > 0
- Changing any field after result is showing recalculates instantly

### Clear Button Behavior

- Clears all 4 input fields
- Hides the result area
- Returns focus to Product A Price field

### Edge Cases

- **Zero or empty field:** Result stays hidden, no error messages
- **Very large numbers:** Allow up to 9,999,999.99 for both price and units
- **Very small per-unit result:** Display up to 4 decimal places (e.g., $0.0012/unit), then round
- **Equal per-unit price:** Both cards get neutral blue highlight, badge shows "Same value!"
- **Dramatic difference (e.g., 99%):** No special treatment, just show the percentage

### Calculation

```
perUnitA = priceA / unitsA
perUnitB = priceB / unitsB
winner = perUnitA < perUnitB ? "A" : "B"
percentageDifference = abs(perUnitA - perUnitB) / max(perUnitA, perUnitB) * 100
```

## Visual Design

### Bold Theme (Default)

| Element | Color |
|---|---|
| Background | White (#FFFFFF) |
| Product input cards | Light grey (#F5F5F5), rounded corners |
| Winner highlight | Green (#22C55E) border + background tint |
| Loser treatment | Grey border, slightly dimmed |
| Percentage badge | Green background, white bold text |
| Equal value highlight | Neutral blue |
| Clear button | Coral/red (#EF4444) |
| Tab bar | Dark charcoal (#1F2937) |

### System Adaptive Theme (Dark Mode)

| Element | Color |
|---|---|
| Background | Dark charcoal (#1F2937) |
| Product input cards | Lighter dark (#374151) |
| Text | White / light grey |
| Winner highlight | Same green (#22C55E) |
| Loser treatment | Dimmed with muted border |
| Percentage badge | Same green background |
| Clear button | Same coral (#EF4444) |

### Typography

| Element | Style |
|---|---|
| App title | Bold, 24pt |
| Product labels ("Product A") | Semi-bold, 16pt |
| Input fields | Regular, 18pt (large for in-store use) |
| Percentage badge | Bold, 22pt |
| Per-unit prices | Regular, 14pt |

## Settings Screen

- **Theme toggle:** Segmented control with two options:
  - "Bold" (default) - Vibrant color scheme
  - "System" - Follows device light/dark mode
- **App version number** at the bottom

## Currency Handling

- Auto-detect currency symbol from device locale
- No currency selector needed
- Currency symbol displayed alongside price fields, not inside them

## Phase 2 Considerations

These decisions are documented for future reference. Nothing in this section is built in Phase 1.

### Camera/OCR Feature
- Camera icon button on the Compare screen (top right or between product cards)
- User photographs two price tags
- OCR extracts price and unit count, populates the same input fields
- Auto-calculation triggers as normal
- User can manually correct misread values
- Libraries: `react-native-vision-camera`, `react-native-mlkit`

### Architectural Decisions Supporting Phase 2
- Input state management is centralized - camera is just another way to set the 4 values
- No architectural changes needed to add camera input
- React Native codebase already runs on Android with minor styling tweaks

### Android Launch
- Codebase is cross-platform by default
- Platform-specific styling tweaks may be needed
- No structural changes required
