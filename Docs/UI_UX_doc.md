# UI/UX Design Documentation

## Overview

This document defines the complete UI/UX design system for PhotoMap, including design tokens, component specifications, screen-by-screen requirements, and accessibility standards. The design system follows the **iOS 26 Liquid Live UI System** (Apple "Liquid Glass") to match the iOS Photos aesthetic and user expectations.

## Design System

### Design System Choice: iOS 26 Liquid Live UI System (Apple "Liquid Glass")

**Rationale**: PhotoMap is inspired by iOS Photos, so the Liquid Glass design system perfectly matches the aesthetic and user expectations. The glassy surfaces, depth, and motion fluidity create a premium, polished experience that photography enthusiasts expect. The translucent materials with backdrop blur create a sense of depth that enhances photo viewing, while the holographic highlights add visual interest without distracting from the photos themselves. The friendly, large corner radii and contextual motion create a modern, approachable interface that feels familiar to iOS users while being accessible to all users.

### Color System

#### Primary Colors

- **Electric Cyan**: `#1EC8E6` (RGB 30, 200, 230; HSL 191, 81%, 51%)
  - **Usage**: Primary CTAs, focus rings, active states, location markers on map
  - **Avoid**: Overuse in text blocks, backgrounds
  - **Tailwind Class**: `bg-[#1EC8E6]`, `text-[#1EC8E6]`, `border-[#1EC8E6]`

- **Midnight Blue**: `#0A2A4A` (RGB 10, 42, 74)
  - **Usage**: Base surfaces, headers, dark backgrounds, app background
  - **Tailwind Class**: `bg-[#0A2A4A]`, `text-[#0A2A4A]`

- **Royal Slate**: `#314D6E` (RGB 49, 77, 110)
  - **Usage**: Secondary buttons, chips, metadata panels, subtle accents
  - **Tailwind Class**: `bg-[#314D6E]`, `text-[#314D6E]`

#### Neutral Grayscale

10 levels with usage contexts:

| Level | Hex       | RGB           | Usage                                        |
| ----- | --------- | ------------- | -------------------------------------------- |
| 50    | `#FAFBFC` | 250, 251, 252 | Light headers, dividers on light backgrounds |
| 100   | `#F0F2F4` | 240, 242, 244 | Light backgrounds, subtle fills              |
| 200   | `#E2E6EA` | 226, 230, 234 | Subtle dividers, borders                     |
| 300   | `#CBD2D9` | 203, 210, 217 | Hairline borders, disabled text              |
| 400   | `#9AA5B1` | 154, 165, 177 | Secondary text, metadata labels              |
| 500   | `#7B8794` | 123, 135, 148 | Default text on light backgrounds            |
| 600   | `#616E7C` | 97, 110, 124  | Subdued controls, inactive states            |
| 700   | `#3E4C59` | 62, 76, 89    | Dark cards, elevated surfaces                |
| 800   | `#323F4B` | 50, 63, 75    | Dark surfaces, backgrounds                   |
| 900   | `#1F2933` | 31, 41, 51    | App background (dark mode)                   |

#### Semantic Colors

- **Success**: `#22C55E` (Green) — Success messages, confirmations
- **Error**: `#EF4444` (Red) — Error messages, destructive actions
- **Warning**: `#F59E0B` (Orange) — Warnings, caution messages
- **Info**: `#60A5FA` (Blue) — Informational messages, hints

#### Color Usage Rules

- Maintain 4.5:1 contrast ratio for all text on backgrounds (WCAG AA)
- Reserve primary color (Electric Cyan) for critical actions and highlights
- Use semantic colors sparingly for status messages only
- Use neutral grayscale for text, borders, and backgrounds
- Avoid overusing primary color in text blocks or large backgrounds

### Typography System

#### Font Families

- **Primary**: `Inter` or `SF Pro` (system font stack)
- **Fallback**: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif`
- **Monospace**: `'SF Mono', 'Monaco', 'Courier New', monospace` (for metadata, code)

#### Type Scale

| Style       | Size | Line Height | Weight | Usage                           |
| ----------- | ---- | ----------- | ------ | ------------------------------- |
| H1          | 48px | 56px        | 700    | Page titles, welcome screens    |
| H2          | 36px | 44px        | 700    | Section headers, main headings  |
| H3          | 28px | 36px        | 600    | Card titles, subsection headers |
| H4          | 22px | 30px        | 600    | Subsection headers, labels      |
| Body Large  | 16px | 26px        | 400    | Main content, descriptions      |
| Body Medium | 14px | 22px        | 400    | Secondary content, metadata     |
| Caption     | 12px | 18px        | 400    | Labels, metadata, timestamps    |
| Small       | 11px | 16px        | 400    | Fine print, helper text         |

#### Typography Usage Contexts

- **Headings**: Use for page/section titles, card titles, hierarchy
- **Body**: Use for main content, descriptions, user-facing text
- **Caption**: Use for metadata, labels, timestamps, secondary info
- **Small**: Use for fine print, helper text, tooltips

#### Tailwind Typography Classes

```css
/* Typography utilities */
.text-h1 {
  font-size: 48px;
  line-height: 56px;
  font-weight: 700;
}
.text-h2 {
  font-size: 36px;
  line-height: 44px;
  font-weight: 700;
}
.text-h3 {
  font-size: 28px;
  line-height: 36px;
  font-weight: 600;
}
.text-h4 {
  font-size: 22px;
  line-height: 30px;
  font-weight: 600;
}
.text-body-large {
  font-size: 16px;
  line-height: 26px;
  font-weight: 400;
}
.text-body-medium {
  font-size: 14px;
  line-height: 22px;
  font-weight: 400;
}
.text-caption {
  font-size: 12px;
  line-height: 18px;
  font-weight: 400;
}
.text-small {
  font-size: 11px;
  line-height: 16px;
  font-weight: 400;
}
```

### Spacing System

#### Base Unit

- **Base Unit**: 4px (8-pt rhythm)

#### Spacing Scale

| Size | Value | Usage Examples                      |
| ---- | ----- | ----------------------------------- |
| 4px  | `1`   | Tight spacing, icon padding         |
| 8px  | `2`   | Small gaps, tight component spacing |
| 12px | `3`   | Component gaps, small padding       |
| 16px | `4`   | Standard padding, card gaps         |
| 20px | `5`   | Medium padding, section spacing     |
| 24px | `6`   | Card padding, grid gaps (desktop)   |
| 32px | `8`   | Page gutters, large section spacing |
| 48px | `12`  | Large section spacing, hero padding |
| 64px | `16`  | Maximum spacing, page margins       |

#### Spacing Patterns

- **Page gutters**: 24–32px (desktop), 16–24px (mobile)
- **Card padding**: 16–24px (desktop), 12–16px (mobile)
- **Grid gaps**: 16–24px (desktop), 12–16px (mobile)
- **Component gaps**: 12–16px
- **Photo grid gaps**: 8–12px (tight spacing for photos)

#### Tailwind Spacing Classes

```css
/* Use Tailwind spacing scale: p-1, p-2, p-3, p-4, p-5, p-6, p-8, p-12, p-16 */
```

### Iconography

Use Lucide icons with the following context-based scale. Icon size follows the
control's role, not the screen it appears on, so equivalent controls remain
visually consistent across Gallery, Albums, Detail, and Settings.

| Context | Icon size | Control size | Examples |
| ------- | --------- | ------------ | -------- |
| Compact inline | 14px | N/A | Metadata actions, sidebar disclosure, status indicators |
| Inline action | 16px | Text-button or field height | Form labels, menu items, text-button icons |
| Icon-only action | 20px | 40px high, 42px wide | Toolbar actions, thumbnail-size controls, window controls |
| Prominent navigation | 24px | 44px minimum target | Previous/next photo actions |
| Empty or feature state | 32px+ | Contextual | Empty states, onboarding illustrations |

- Keep icon-only controls at least 40px high so they have a comfortable pointer target.
- Use a single visual treatment for related controls: 999px group radius, 1px divider, and 20px icons.
- Do not resize an icon merely to make a control feel denser; use the compact-inline or inline-action context when appropriate.

### Component Radius Styles

| Component     | Radius | Tailwind Class | Usage                                           |
| ------------- | ------ | -------------- | ----------------------------------------------- |
| Buttons       | 14px   | `rounded-sm`   | Primary and secondary buttons                   |
| Cards         | 20px   | `rounded-md`   | Photo cards, metadata panels, info cards        |
| Inputs        | 14px   | `rounded-sm`   | Search bars, text inputs, filters               |
| Modals/Sheets | 28px   | `rounded-xl`   | Dialogs, detail views, side panels              |
| Badges        | 8px    | `rounded-xs`   | Date badges, location indicators, status badges |

### Shadow & Elevation Styles

| Level       | Shadow                         | Usage                                   |
| ----------- | ------------------------------ | --------------------------------------- |
| L1 (Subtle) | `0 1px 2px rgba(0,0,0,0.06)`   | Hover states, subtle elevation          |
| L2 (Medium) | `0 4px 10px rgba(0,0,0,0.08)`  | Cards, panels, elevated surfaces        |
| L3 (High)   | `0 10px 24px rgba(0,0,0,0.12)` | Modals, detail views, highest elevation |

#### Tailwind Shadow Classes

```css
.shadow-l1 {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}
.shadow-l2 {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
}
.shadow-l3 {
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.12);
}
```

### Glass/Blur Effects (Liquid Glass System)

| Level                    | Blur                | Background    | Border            | Usage                    |
| ------------------------ | ------------------- | ------------- | ----------------- | ------------------------ |
| Glass Surface 1 (Low)    | `backdrop-blur-lg`  | `bg-white/5`  | `border-white/15` | Photo cards, panels      |
| Glass Surface 2 (Medium) | `backdrop-blur-xl`  | `bg-white/7`  | `border-white/15` | Modals, detail views     |
| Glass Surface 3 (High)   | `backdrop-blur-2xl` | `bg-white/10` | `border-white/15` | Highest elevation modals |

#### Tailwind Glass Classes

```css
.glass-surface-1 {
  backdrop-filter: blur(16px);
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.glass-surface-2 {
  backdrop-filter: blur(24px);
  background-color: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.glass-surface-3 {
  backdrop-filter: blur(40px);
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
}
```

### Border Styles

| Style    | Width | Color                    | Usage            |
| -------- | ----- | ------------------------ | ---------------- |
| Hairline | 1px   | `rgba(255,255,255,0.15)` | Glass surfaces   |
| Regular  | 1.5px | `rgba(255,255,255,0.2)`  | Emphasis borders |

### Interaction Patterns

#### Hover States

- **Cards**: Elevate shadow L1 → L2, translateY -4px, 200ms transition
- **Buttons**: Darken 6–8%, scale 1.02, 200ms transition
- **Links**: Color → Electric Cyan, underline, 200ms transition
- **Photos**: Scale 1.02, show metadata preview, 200ms transition

#### Active/Pressed States

- **Buttons**: Darken 8–10%, compress shadow slightly, 100ms transition
- **Cards**: Darken 4–6%, compress shadow, 100ms transition
- **Visual feedback**: Immediate response to user action

#### Focus States (Accessibility)

- **Visible focus ring**: 2px Electric Cyan ring, 1px offset, 200ms transition
- **Keyboard navigation**: Full tab order follows visual hierarchy
- **Focus indicators**: Always visible for keyboard users

#### Disabled States

- **Opacity**: 50% opacity
- **Remove**: Shadows, pointer events
- **Visual**: Muted colors, no interaction feedback

#### Transitions

- **Duration**: 160–200ms (components), 240–320ms (overlays/sheets)
- **Easing**: `cubic-bezier(0.2, 0.8, 0.2, 1)` (iOS ease)
- **Timing**: Contextual motion (sub-200ms for small UI, 240–320ms for sheets)

#### Animation Triggers

- **On mount**: Fade in + slide up for cards (200ms ease-ios)
- **On state change**: Fade + scale for view transitions (240–320ms ease-ios)
- **On scroll**: Reveal animations with intersection observer (200ms ease-ios)
- **List reorders**: Subtle animations for list changes (200ms ease-ios)

### Component Recipes (Liquid Glass)

#### Card (Default)

```css
.glass-card {
  backdrop-filter: blur(24px);
  background-color: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  padding: 16px 24px; /* Desktop: 16–24px, Mobile: 12–16px */
}

.glass-card:hover {
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-4px);
  transition: all 200ms cubic-bezier(0.2, 0.8, 0.2, 1);
}
```

#### Button Primary

```css
.btn-primary {
  background-color: #1ec8e6; /* Electric Cyan */
  color: white;
  border-radius: 14px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  transition: all 200ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.btn-primary:hover {
  background-color: #1ab8d6; /* Darken 8% */
  transform: scale(1.02);
}

.btn-primary:focus {
  outline: 2px solid #1ec8e6;
  outline-offset: 1px;
}
```

#### Button Secondary

```css
.btn-secondary {
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: transparent;
  color: white;
  border-radius: 14px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  transition: all 200ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.btn-secondary:hover {
  background-color: rgba(255, 255, 255, 0.05);
}
```

#### Modal/Sheet

```css
.glass-modal {
  backdrop-filter: blur(40px);
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 28px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.12);
  padding: 32px;
}

/* Enter animation */
@keyframes modal-enter {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.glass-modal {
  animation: modal-enter 280ms cubic-bezier(0.2, 0.8, 0.2, 1);
}
```

#### Input/Search

```css
.input-search {
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(16px);
  border-radius: 14px;
  padding: 12px 16px;
  font-size: 14px;
  color: white;
  transition: all 200ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.input-search:focus {
  outline: 2px solid #1ec8e6;
  outline-offset: 1px;
  border-color: #1ec8e6;
}
```

### Responsive Breakpoints

| Breakpoint | Size       | Layout Changes                                                              |
| ---------- | ---------- | --------------------------------------------------------------------------- |
| Mobile     | ≤ 640px    | Single column, stacked layout, collapsed toolbar, bottom sheet for metadata |
| Tablet     | 641–1024px | 2-column grid, horizontal scroll for lists, side-by-side layouts            |
| Desktop    | ≥ 1025px   | 3–4 column grid, full navigation visible, max-width containers: 1280px      |

### Accessibility Standards

#### WCAG 2.1 AA Compliance

- **Color contrast**: Minimum 4.5:1 for text, 3:1 for UI components
- **Focus indicators**: Visible 2px Electric Cyan ring for all interactive elements
- **Keyboard navigation**: Full keyboard support for all features
- **Screen reader support**: ARIA labels, semantic HTML, live regions for dynamic content
- **Reduced motion**: Respect `prefers-reduced-motion` media query
- **High contrast mode**: Support system high contrast mode (if available)

#### Keyboard Navigation

- **Tab**: Navigate through interactive elements
- **Arrow Keys**: Navigate photos in detail view, pan map in map view
- **ESC**: Close modals, detail views, settings
- **Enter**: Open selected photo, activate button
- **Space**: Play/pause slideshow
- **F**: Toggle fullscreen
- **/**: Focus search bar

#### Screen Reader Support

- **ARIA labels**: All interactive elements have descriptive labels
- **Semantic HTML**: Use semantic HTML elements (button, nav, main, etc.)
- **Live regions**: Announce dynamic content changes (photo count, filter results)
- **Focus management**: Manage focus when views change

## Screen-by-Screen UI Requirements

### 1. Welcome Screen (First Launch)

**Purpose**: First-time user onboarding, directory selection, feature introduction

**Layout**: Centered card on dark background (Midnight Blue `#0A2A4A`), max-width 600px, vertical padding 48–64px

**Components**:

- **Welcome message**: H1 "Welcome to PhotoMap" (48/56 700, white)
- **Subheadline**: Body Large "Browse your photos with iOS-style galleries and discover where each moment was captured on a map." (16/26 400, neutral-400 `#9AA5B1`)
- **Feature highlights** (3 cards, optional):
  1. **iOS Photos-style interface** (Icon: Grid, Text: "Beautiful, intuitive gallery experience")
  2. **Map integration** (Icon: MapPin, Text: "See where photos were taken")
  3. **Privacy-first** (Icon: Lock, Text: "100% local, no cloud uploads")
- **Primary CTA**: "Select Directory" button (Electric Cyan fill, white text, 16px radius, 48px height)
- **Trust badge**: "✓ Free • ✓ Privacy-first • ✓ Cross-platform"

**Styling**: Glass Surface 2 card (`backdrop-blur-xl bg-white/7 border-white/15`), padding 48px (desktop) / 32px (mobile), gap 16px between sections

**Interactions**: Click "Select Directory" opens native file picker

**States**: Default only (first launch)

**Motion**: Card fades in from bottom (opacity 0 → 1, translateY 24px → 0) on mount (280ms ease-ios), feature cards stagger in (80ms delay per card)

**Responsive**: Mobile (≤ 640px): Full-width card, 32px padding; Desktop (≥ 1025px): Max-width 600px, 48px padding

### 2. Directory Selection Dialog

**Purpose**: Select photo directory for browsing

**Layout**: Native file picker dialog (system-dependent)

**Components**: System file picker UI

**Interactions**: Browse folders, select directory, confirm/cancel

**States**: Browsing, selected, error (no photos found)

**Visual notes**: Use native system dialogs for trust and familiarity

### 3. Main Gallery View

**Purpose**: Primary photo browsing interface

**Layout**:

- **Top toolbar**: Fixed, sticky, height 64px desktop / 56px mobile
  - **Left section**: Directory path breadcrumb (clickable to change directory)
  - **Center section**: Search bar (Glass Surface 1, rounded-sm, 320px width desktop)
  - **Right section**: Map view toggle button, Settings button, Change directory button
- **Photo grid**: Adaptive grid, responsive columns
  - **Layout**: 3–4 columns desktop, 2 tablet, 2 mobile, gap 12–16px
- **Bottom status bar**: Fixed, sticky, height 48px
  - **Left section**: Photo count, Location count (Body Medium 14/22 400, neutral-400)
  - **Right section**: Date range (Body Medium 14/22 400, neutral-400)

**Components**:

- **Toolbar**: Search input, buttons (map view, settings, change directory)
- **Photo grid**: Responsive grid of photo thumbnails
- **Photo card**: Thumbnail image, date badge, location indicator (if GPS)
- **Status bar**: Stats and metadata summary

**Interactions**:

- Click photo → Photo detail view
- Hover photo → Show metadata preview
- Scroll → Lazy load more photos
- Keyboard: Arrow keys navigate, Enter opens detail view

**States**:

- **Loading**: Skeleton grid during scan
- **Empty**: "No photos found" message with CTA
- **Error**: Error message with retry button
- **Success**: Grid of photos

**Responsive**:

- **Mobile** (≤ 640px): 2-column grid, collapsed toolbar, bottom sheet for metadata
- **Desktop** (≥ 1025px): 3–4 column grid, full toolbar, max-width container: 1920px

**Visual notes**: Glass Surface 1 cards for photos, Electric Cyan for location indicators

**Motion**: Photo reveal fade in + slide up (200ms ease-ios) on scroll; Hover feedback elevate card, show metadata preview (200ms); View transitions fade + scale (240–320ms ease-ios)

### 4. Photo Detail View

**Purpose**: Full-screen photo viewer with metadata

**Layout**:

- **Full-screen photo viewer**: Photo fills viewport, centered
- **Metadata panel**: Slide-out panel (right side desktop, bottom mobile)
- **Navigation controls**: Previous/Next buttons, close button

**Components**:

- **Photo viewer**: Full-screen image with zoom/pan
- **Metadata panel**: Date, location (with map link), camera info, EXIF data
- **Navigation**: Arrow buttons, keyboard shortcuts
- **Close button**: Top-right (X icon)

**Interactions**:

- Click photo → Toggle metadata panel
- Arrow keys → Navigate previous/next
- ESC → Close detail view
- Swipe → Navigate (mobile/trackpad)
- Click location → Open map view

**States**:

- **Loading**: Skeleton for photo
- **Loaded**: Photo displayed
- **Error**: Error message with retry

**Responsive**:

- **Mobile** (≤ 640px): Bottom sheet for metadata
- **Desktop** (≥ 1025px): Side panel for metadata

**Visual notes**: Glass Surface 3 for metadata panel, full-screen photo with overlay controls

**Motion**: Photo transitions fade + scale (240–320ms ease-ios); Metadata panel slides in from right (desktop) or bottom (mobile) (280ms ease-ios)

### 5. Map View

**Purpose**: Interactive map showing photo locations

**Layout**:

- **Full-screen map**: Map fills viewport
- **Photo markers**: Markers on map showing photo locations
- **Photo clusters**: Cluster markers for multiple photos at same location
- **Toggle button**: Switch to gallery view

**Components**:

- **Map component**: Interactive map (Leaflet/Mapbox)
- **Photo markers**: Custom markers with photo thumbnail
- **Cluster markers**: Circle with count
- **Info popup**: Photo preview on marker click
- **Toolbar**: Gallery view toggle, zoom controls

**Interactions**:

- Click marker → Show photo info popup
- Click popup → Open photo detail view
- Click cluster → Zoom in, expand cluster
- Pan/zoom → Navigate map
- Keyboard: Arrow keys pan map, +/- zoom

**States**:

- **Loading**: Loading map tiles
- **Loaded**: Map with markers
- **Empty**: "No photos with location data" message
- **Error**: Error loading map

**Responsive**:

- **Mobile** (≤ 640px): Full-screen map, touch gestures
- **Desktop** (≥ 1025px): Full-screen map, mouse controls

**Visual notes**: Electric Cyan markers, cluster circles, glass info popups

**Motion**: Marker click animations fade + scale (200ms ease-ios); Cluster expansion animations (240ms ease-ios)

### 6. Settings View

**Purpose**: App settings and preferences

**Layout**:

- **Side panel** (desktop) or **Bottom sheet** (mobile)
- **Sections**: Directory, View Preferences, Appearance

**Components**:

- **Directory section**: Current directory, change button
- **View preferences**: Grid size slider, sorting options, grouping options
- **Appearance**: Theme toggle (light/dark), reduce motion toggle
- **Save/Cancel buttons**: Apply or discard changes

**Interactions**:

- Change settings → Update preview
- Save → Apply and close
- Cancel → Discard and close

**States**: Default, saving, error

**Responsive**:

- **Mobile** (≤ 640px): Bottom sheet
- **Desktop** (≥ 1025px): Side panel

**Visual notes**: Glass Surface 2 panel, form inputs with Electric Cyan focus

**Motion**: Panel slides in from right (desktop) or bottom (mobile) (280ms ease-ios)

### 7. Loading States

**Purpose**: Show loading progress during operations

**Layout**: Centered on screen or in-place

**Components**:

- **Spinner**: Circular spinner (Electric Cyan)
- **Skeleton**: Placeholder cards for photos
- **Progress bar**: For directory scanning

**Interactions**: None (loading)

**States**: Loading, complete, error

**Visual notes**: Subtle animations, Electric Cyan accents

**Motion**: Spinner rotates (linear, infinite); Skeleton cards pulse (1.5s ease-in-out, infinite)

### 8. Empty States

**Purpose**: Show when no content is available

**Layout**: Centered message

**Components**:

- **Icon**: Large icon (camera, folder) from lucide-react
- **Message**: H3 title + Body description
- **CTA**: Primary button (Select Directory, Retry)

**Interactions**: Click CTA to take action

**States**: No photos, no location data, error

**Visual notes**: Muted colors, clear CTAs

**Motion**: Icon fades in (200ms ease-ios); CTA button appears with delay (300ms ease-ios)

### 9. Error States

**Purpose**: Show error messages and recovery options

**Layout**: Inline or modal

**Components**:

- **Error icon**: Warning icon from lucide-react
- **Error message**: Clear description (Body Medium)
- **Action button**: Retry, dismiss, or alternative action

**Interactions**: Click action button

**States**: Error, retrying, resolved

**Visual notes**: Red accent for errors, clear recovery paths

**Motion**: Error message fades in (200ms ease-ios); Action button appears with delay (300ms ease-ios)

## Component Library Organization

### UI Primitives (`/src/renderer/components/ui/`)

- **Button**: Primary, Secondary, Tertiary variants
- **Card**: Default, Photo, Metadata variants
- **Input**: Text, Search, Date variants
- **Modal**: Dialog, Sheet, Bottom Sheet variants
- **Tooltip**: Default, Rich variants
- **Badge**: Date, Location, Status variants
- **Spinner**: Circular, Linear variants
- **Skeleton**: Card, Text, Image variants

### Layout Components (`/src/renderer/components/layout/`)

- **Toolbar**: Main toolbar with search, actions
- **StatusBar**: Bottom status bar with stats
- **Sidebar**: Settings sidebar (desktop)
- **BottomSheet**: Settings bottom sheet (mobile)

### Feature Components (`/src/renderer/components/[feature]/`)

- **Gallery**: PhotoGrid, PhotoCard, PhotoGroup, EmptyState
- **Detail**: PhotoViewer, MetadataPanel, NavigationControls
- **Map**: MapView, PhotoMarker, ClusterMarker, MapPopup
- **Filters**: FilterPanel, SearchBar, DateRangePicker
- **Settings**: SettingsView, DirectorySettings, AppearanceSettings
- **Welcome**: WelcomeScreen

## Design Tool Integration

### Figma/Design Tools

- **Design System**: Export design tokens to CSS variables
- **Components**: Export component specs to Storybook
- **Screens**: Export screen mockups to documentation
- **Icons**: Export icons to SVG format for lucide-react

### Design Tokens Export

```json
{
  "colors": {
    "primary": "#1EC8E6",
    "secondary": "#0A2A4A",
    "accent": "#314D6E",
    "neutral": {
      "50": "#FAFBFC",
      "100": "#F0F2F4",
      "200": "#E2E6EA",
      "300": "#CBD2D9",
      "400": "#9AA5B1",
      "500": "#7B8794",
      "600": "#616E7C",
      "700": "#3E4C59",
      "800": "#323F4B",
      "900": "#1F2933"
    }
  },
  "typography": {
    "h1": { "size": 48, "lineHeight": 56, "weight": 700 },
    "h2": { "size": 36, "lineHeight": 44, "weight": 700 },
    "h3": { "size": 28, "lineHeight": 36, "weight": 600 },
    "bodyLarge": { "size": 16, "lineHeight": 26, "weight": 400 }
  },
  "spacing": {
    "base": 4,
    "scale": [4, 8, 12, 16, 20, 24, 32, 48, 64]
  },
  "radius": {
    "button": 14,
    "card": 20,
    "modal": 28
  },
  "shadows": {
    "l1": "0 1px 2px rgba(0,0,0,0.06)",
    "l2": "0 4px 10px rgba(0,0,0,0.08)",
    "l3": "0 10px 24px rgba(0,0,0,0.12)"
  }
}
```

## User Journey Maps

### Journey 1: First-Time User

1. **App Launch** → Welcome Screen
2. **Select Directory** → Directory Selection Dialog
3. **Scan Photos** → Loading State
4. **Gallery View** → Browse Photos
5. **Photo Detail** → View Photo & Metadata
6. **Map View** → See Photo Locations

### Journey 2: Returning User

1. **App Launch** → Load Last Directory
2. **Gallery View** → Browse Photos
3. **Filter/Search** → Find Specific Photos
4. **Photo Detail** → View Photo & Metadata
5. **Map View** → See Photo Locations

### Journey 3: Professional Photographer

1. **App Launch** → Load Last Directory
2. **Filter by Date** → Filter Photos
3. **Photo Detail** → Verify Location Metadata
4. **Map View** → Confirm Location Accuracy
5. **Export Photos** → Export with Location Data

## Notes

- **Design Consistency**: All components should follow the Liquid Glass design system consistently
- **Accessibility**: All components must meet WCAG 2.1 AA standards
- **Performance**: All animations should target 60fps for smooth user experience
- **Responsive**: All components should adapt to different screen sizes
- **Motion**: Respect `prefers-reduced-motion` for users who prefer reduced motion
- **Dark Mode**: Default dark theme (Midnight Blue background) for optimal photo viewing
