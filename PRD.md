## ⚙ PRODUCT REQUIREMENT DOCUMENT (PRD)

### 1. Overview

- **Product name and purpose**: PhotoMap — a desktop photo gallery application that reads and displays photos from a selected directory, similar to the iOS Photos app experience. The app's main feature is displaying a map showing where photos were taken, using location metadata (EXIF GPS data) when available.

- **Target audience summary**:
  - Primary: Photography enthusiasts, travelers, and professionals who want to organize and view their photo collections with location context
  - Secondary: Casual users who want to browse local photo folders with a modern, intuitive interface
  - Use case: Desktop users (Windows, macOS, Linux) who prefer native apps over web-based solutions

- **Core value proposition (one-line pitch)**: View your photo collection with beautiful iOS-style galleries and discover where each moment was captured on an integrated map.

### 2. Problem Statement

- **What problems does this solve?**
  - Desktop users lack a native, modern photo gallery app that matches the polished experience of iOS Photos
  - Existing desktop photo viewers are either too basic (Windows Photos, macOS Photos) or too complex (Adobe Lightroom) for casual browsing
  - No easy way to visualize photo locations on a map without exporting to web services or using complex GIS software
  - Users have photos scattered across local directories with no unified, beautiful interface to browse them
  - Location metadata (GPS EXIF data) is often present but invisible in standard file browsers
  - Cross-platform consistency is missing — users want the same great experience on Windows, macOS, and Linux

- **Why is this a problem now?**
  - Modern smartphones embed GPS data in photos, creating a rich dataset that desktop users can't easily explore
  - Travel photography has grown significantly, with users wanting to relive trips through location-aware browsing
  - The iOS Photos app has set a high bar for photo gallery UX that desktop users expect
  - Electron-based apps have matured, making it feasible to build cross-platform native apps with web technologies
  - Privacy concerns drive users to prefer local, offline photo viewing over cloud services

- **Who has this problem?**
  - Photography enthusiasts who shoot with DSLRs/mirrorless cameras and want to organize large local collections
  - Travelers who want to see where their trip photos were taken on a map
  - Casual users frustrated with slow, cluttered native photo apps
  - Professionals who need a lightweight gallery viewer that doesn't require cloud subscriptions
  - Users who value privacy and want to keep photos local but still enjoy modern UX

### 3. User Personas

- **Primary persona: Photography Enthusiast / Traveler**
  - Demographics: 25–55 years old; owns DSLR/mirrorless camera or high-end smartphone; travels frequently; values visual storytelling; tech-savvy but not a developer
  - Goals:
    - Quickly browse large photo collections with a beautiful, intuitive interface
    - See where photos were taken on a map to relive travel memories
    - Organize photos by location without manual tagging
    - Share location-aware photo stories with friends
  - Pain points:
    - Native photo apps are slow and cluttered
    - No easy way to visualize GPS data on a map
    - Cloud services require subscriptions and raise privacy concerns
    - Complex photo management software (Lightroom) is overkill for browsing
    - File browsers don't show photo metadata in a visual way
  - Tech proficiency: Medium-high; comfortable with desktop apps, file systems, and basic photo editing
  - Motivations: Organize memories, discover patterns in travel, share visual stories with location context
  - User journey contexts: Evening/weekend photo browsing sessions; trip planning; sharing memories with friends; organizing vacation photos

- **Secondary persona: Casual User**
  - Demographics: 20–60 years old; uses smartphone for photos; occasional traveler; prefers simplicity over features
  - Goals:
    - Browse photos from a specific folder easily
    - See photos in a clean, modern interface
    - Occasionally check where a photo was taken
  - Pain points:
    - Default photo apps are confusing or slow
    - Don't understand file systems or complex software
    - Want something simple that "just works"
  - Tech proficiency: Low-medium; prefers intuitive interfaces; may struggle with file paths
  - Motivations: Quick photo viewing, occasional location curiosity
  - User journey contexts: Quick photo lookups; sharing specific photos; checking where something was taken

- **Tertiary persona: Professional Photographer**
  - Demographics: 30–50 years old; professional or semi-professional photographer; manages large RAW files
  - Goals:
    - Quick preview of large photo collections
    - Verify location metadata for client deliverables
    - Lightweight viewer that doesn't require cloud sync
  - Pain points:
    - Adobe Lightroom is heavy and subscription-based
    - Need lightweight tools for quick previews
    - Client photos often need location verification
  - Tech proficiency: High; expert with photo software and metadata
  - Motivations: Efficiency, professional workflows, client deliverables
  - User journey contexts: Work sessions; client photo reviews; location verification tasks

### 4. Value Proposition

- **Differentiation**: PhotoMap is the only desktop photo gallery app that combines iOS Photos-style interface with integrated map visualization, all running locally with no cloud dependency. It automatically extracts location metadata from photos and displays them on an interactive map, making it easy to discover where memories were captured.

- **Unique selling points**:
  - **iOS Photos-inspired interface**: Beautiful, intuitive gallery experience that matches the polished feel of iOS Photos
  - **Integrated map visualization**: See where photos were taken on an interactive map without exporting to web services
  - **Automatic location detection**: Extracts GPS EXIF data automatically from photos with location metadata
  - **100% local and private**: No cloud sync, no subscriptions, no data leaving your device
  - **Cross-platform consistency**: Same great experience on Windows, macOS, and Linux
  - **Lightweight and fast**: Electron-based app that starts quickly and handles large photo collections efficiently
  - **Directory-based browsing**: Select any folder on your computer and browse photos instantly
  - **Smart photo grouping**: Automatically groups photos by date, location, or other metadata

- **Why choose us over alternatives**:
  - **vs. Native photo apps (Windows Photos, macOS Photos)**: More polished interface, integrated map feature, better performance with large collections
  - **vs. Adobe Lightroom**: Lighter weight, no subscription, simpler interface focused on browsing rather than editing
  - **vs. Cloud services (Google Photos, iCloud)**: Privacy-first, no uploads required, works offline, no storage limits
  - **vs. File browsers**: Visual, iOS-style interface with location awareness, not just file management
  - **vs. Web-based galleries**: Native desktop app with better performance, offline access, and system integration

### 5. Use Cases & User Stories

- **Use cases**:
  1. **Browse local photo directory**: Select a folder on the computer and browse photos in a beautiful iOS-style gallery
  2. **View photos on a map**: See where photos were taken on an interactive map using GPS metadata
  3. **Organize photos by location**: Group photos by location to discover travel patterns
  4. **Relive travel memories**: Browse vacation photos and see where each moment was captured
  5. **Quick photo preview**: Quickly preview large photo collections without heavy software
  6. **Verify location metadata**: Check if photos have GPS data and where they were taken
  7. **Share location-aware photos**: Share photos with location context

- **User stories** (in format: "As a {role}, I want to {action} so that {benefit}"):
  - As a photography enthusiast, I want to select a photo directory so that I can browse my photos in a beautiful interface
  - As a traveler, I want to see where my vacation photos were taken on a map so that I can relive my trip memories
  - As a user, I want the app to automatically extract location data from photos so that I don't have to manually tag locations
  - As a casual user, I want an iOS Photos-like interface so that I can browse photos intuitively without learning complex software
  - As a privacy-conscious user, I want all photos to stay local so that my data never leaves my device
  - As a professional photographer, I want to quickly verify location metadata so that I can confirm client photo locations
  - As a user, I want to see photos grouped by location so that I can discover patterns in my photography
  - As a traveler, I want to see multiple photos from the same location on a map so that I can understand my travel route
  - As a user, I want the app to work on Windows, macOS, and Linux so that I have the same experience across devices
  - As a user, I want fast performance with large photo collections so that browsing feels responsive

- **Prioritization of use cases**:
  - **Must have**: Browse local photo directory, view photos on map, automatic location extraction, iOS Photos-like interface
  - **Should have**: Photo grouping by location, fast performance, cross-platform support, location clustering on map
  - **Nice to have**: Photo sharing, advanced filtering, export location data, photo metadata editing

### 6. Main Features (Must / Should / Nice to Have)

- **Must Have** (MVP features):
  - **Directory selection**: Select a folder on the computer to browse photos
  - **Photo gallery view**: iOS Photos-style grid gallery with thumbnails
  - **Photo detail view**: Full-screen photo viewer with swipe navigation
  - **Map integration**: Interactive map showing where photos were taken (if GPS metadata exists)
  - **EXIF GPS extraction**: Automatically read location metadata from photos
  - **Photo metadata display**: Show date, location, camera info, and other EXIF data
  - **Basic filtering**: Filter photos by date, location, or file type
  - **Photo grouping**: Group photos by date, location, or other metadata
  - **Responsive grid layout**: Adaptive grid that adjusts to window size
  - **Fast thumbnail generation**: Efficient thumbnail generation for large collections
  - **Keyboard navigation**: Arrow keys, ESC, and other keyboard shortcuts
  - **Cross-platform support**: Windows, macOS, and Linux builds

- **Should Have** (Phase 2 features):
  - **Location clustering**: Group nearby photos on map with cluster markers
  - **Photo search**: Search photos by filename, date, location name
  - **Date range filtering**: Filter photos by date range with calendar picker
  - **Map view toggle**: Switch between gallery view and map view
  - **Photo metadata editing**: Edit location, date, and other metadata
  - **Photo export**: Export photos with or without location data
  - **Recent directories**: Remember recently opened directories
  - **Photo sorting**: Sort by date, name, location, or file size
  - **Photo zoom**: Zoom in/out on photos in detail view
  - **Slide show mode**: Automatic slide show with transitions
  - **Dark mode**: Dark theme option for low-light viewing
  - **Photo sharing**: Share photos via system share dialog
  - **Batch operations**: Select multiple photos for operations

- **Nice to Have** (Future features):
  - **Photo editing**: Basic photo editing (crop, rotate, brightness, contrast)
  - **Face detection**: Detect and group photos by faces
  - **Album creation**: Create custom albums/folders
  - **Photo tagging**: Add custom tags to photos
  - **Location reverse geocoding**: Show location names on map (city, country)
  - **Travel route visualization**: Show travel route connecting photo locations
  - **Photo statistics**: Show statistics about photo collection (total photos, locations, dates)
  - **RAW file support**: Support for RAW camera formats (CR2, NEF, etc.)
  - **Video support**: Browse and play videos with location metadata
  - **Photo deduplication**: Detect and remove duplicate photos
  - **Backup/sync**: Optional backup to external drives or cloud (user-controlled)
  - **Plugin system**: Extensible plugin system for custom features

### 7. Information Architecture

- **Top-level navigation structure**:
  - **Main Gallery View**: Primary photo browsing interface (default view)
  - **Map View**: Map showing photo locations
  - **Photo Detail View**: Full-screen photo viewer with metadata
  - **Settings/Preferences**: App settings and preferences

- **Content organization**:
  - **Photos**: Organized by date (default), location, or custom grouping
  - **Metadata**: Date, location (GPS), camera info, EXIF data
  - **Groups**: Date groups, location groups, custom albums (future)
  - **Filters**: Date range, location, file type, metadata presence

- **Navigation hierarchy**:

  ```
  App Launch
  ├── Directory Selection (first time / can change)
  ├── Main Gallery View
  │   ├── Photo Grid (thumbnails)
  │   ├── Photo Detail View (on photo click)
  │   │   ├── Photo viewer (full screen)
  │   │   ├── Metadata panel
  │   │   └── Navigation (previous/next)
  │   └── Map View (toggle)
  │       ├── Map with photo markers
  │       └── Photo clusters (if multiple photos at location)
  ├── Settings
  │   ├── Directory preferences
  │   ├── View preferences (grid size, sorting)
  │   └── Appearance (theme, dark mode)
  └── Filters & Search
      ├── Date filter
      ├── Location filter
      └── Search bar
  ```

- **Feature grouping**:
  - **Browsing**: Gallery view, photo detail, navigation
  - **Location**: Map view, GPS extraction, location grouping
  - **Organization**: Filtering, sorting, grouping
  - **Metadata**: EXIF display, metadata editing
  - **Settings**: Preferences, appearance, directory management

- **Discoverability**:
  - **Primary actions**: Gallery view, map view toggle (visible in toolbar)
  - **Secondary actions**: Filters, settings, search (accessible via toolbar/menu)
  - **Keyboard shortcuts**: Arrow keys, ESC, spacebar for common actions
  - **Contextual actions**: Right-click context menu for photo operations

### 8. User Flow Diagram

```
App Launch
  │
  ├─> First Launch
  │   │
  │   ├─> Directory Selection Dialog
  │   │   │
  │   │   ├─> Select Directory
  │   │   │   │
  │   │   │   ├─> Scanning Photos (Loading)
  │   │   │   │   │
  │   │   │   │   ├─> Extract EXIF Data
  │   │   │   │   │   │
  │   │   │   │   │   └─> Main Gallery View
  │   │   │   │
  │   │   │   └─> Error: No Photos Found
  │   │   │       └─> Retry Directory Selection
  │   │   │
  │   │   └─> Cancel
  │   │       └─> Exit App
  │
  └─> Returning Launch
      │
      └─> Load Last Directory
          │
          └─> Main Gallery View

Main Gallery View
  │
  ├─> Browse Photos (Grid)
  │   │
  │   ├─> Click Photo
  │   │   │
  │   │   └─> Photo Detail View
  │   │       │
  │   │       ├─> View Photo (Full Screen)
  │   │       │
  │   │       ├─> View Metadata
  │   │       │   │
  │   │       │   ├─> Has Location Data?
  │   │       │   │   │
  │   │       │   │   ├─> Yes: Show Location on Map
  │   │       │   │   │   └─> Map View (from Detail)
  │   │       │   │   │
  │   │       │   │   └─> No: Show "No Location Data"
  │   │       │   │
  │   │       │   └─> View Other Metadata (Date, Camera, etc.)
  │   │       │
  │   │       ├─> Navigate (Previous/Next)
  │   │       │   ├─> Arrow Keys / Swipe
  │   │       │   └─> Loop Through Photos
  │   │       │
  │   │       └─> Close (ESC / Click Outside)
  │   │           └─> Return to Gallery
  │   │
  │   ├─> Toggle Map View
  │   │   │
  │   │   └─> Map View
  │   │       │
  │   │       ├─> View Photo Locations
  │   │       │   │
  │   │       │   ├─> Click Marker
  │   │       │   │   │
  │   │       │   │   └─> Photo Detail View
  │   │       │   │
  │   │       │   ├─> Cluster Marker (Multiple Photos)
  │   │       │   │   │
  │   │       │   │   └─> Expand Cluster
  │   │       │   │       └─> Show Individual Markers
  │   │       │   │
  │   │       │   └─> Zoom In/Out
  │   │       │       └─> Adjust Marker Visibility
  │   │       │
  │   │       └─> Toggle Gallery View
  │   │           └─> Return to Gallery
  │   │
  │   ├─> Apply Filters
  │   │   │
  │   │   ├─> Date Filter
  │   │   │   └─> Filtered Gallery View
  │   │   │
  │   │   ├─> Location Filter
  │   │   │   └─> Filtered Gallery View
  │   │   │
  │   │   └─> Clear Filters
  │   │       └─> Full Gallery View
  │   │
  │   ├─> Search Photos
  │   │   │
  │   │   └─> Search Results
  │   │       │
  │   │       └─> Click Result
  │   │           └─> Photo Detail View
  │   │
  │   ├─> Change Directory
  │   │   │
  │   │   └─> Directory Selection Dialog
  │   │       └─> New Gallery View
  │   │
  │   └─> Open Settings
  │       │
  │       └─> Settings View
  │           │
  │           ├─> Change Directory
  │           ├─> View Preferences
  │           ├─> Appearance Settings
  │           └─> Close Settings
  │               └─> Return to Gallery
```

**Key decision points:**

- **First launch**: Must select directory before browsing
- **Photo detail**: Can view metadata and navigate between photos
- **Location data**: Conditional flow — show map if location exists
- **Map view**: Can switch between gallery and map views
- **Filters**: Can filter photos by various criteria
- **Navigation**: Can navigate back from any view to gallery

**Entry points:**

- App launch (first time or returning)
- Directory selection
- Photo click
- Map view toggle
- Settings menu

**Exit points:**

- Close app
- Cancel directory selection (first launch)
- Return to gallery from any view

### 9. UI/UX Strategy & Engagement Model

- **Design system choice**: **OPTION A — iOS 26 Liquid Live UI System** (Apple "Liquid Glass")
  - **Rationale**: PhotoMap is inspired by iOS Photos, so the Liquid Glass design system perfectly matches the aesthetic and user expectations. The glassy surfaces, depth, and motion fluidity create a premium, polished experience that photography enthusiasts expect. The translucent materials with backdrop blur create a sense of depth that enhances photo viewing, while the holographic highlights add visual interest without distracting from the photos themselves. The friendly, large corner radii and contextual motion create a modern, approachable interface that feels familiar to iOS users while being accessible to all users.

- **First session flow**:
  - **App launch**: On first launch, show a welcome screen with a brief explanation of PhotoMap's features
  - **Directory selection**: Present a native file picker dialog to select a photo directory
  - **Loading state**: Show a beautiful loading animation while scanning photos and extracting metadata
  - **First gallery view**: Show the gallery with photos organized by date, with a subtle animation revealing photos
  - **Onboarding hints**: Optional tooltips highlighting key features (map view, photo detail, filters)
  - **Trust signals**: Show photo count, location count, and date range to confirm successful import

- **Returning session flow**:
  - **Fast launch**: Load last directory immediately and show gallery view
  - **Quick access**: Remember last viewed photo and directory for instant resume
  - **Keyboard shortcuts**: Provide keyboard shortcuts for common actions (arrow keys, ESC, spacebar)
  - **Recent directories**: Allow quick switching between recently opened directories
  - **Persistent state**: Remember view preferences (grid size, sorting, filters)

- **Engagement patterns**:
  - **Photo discovery**: Group photos by date and location to encourage exploration
  - **Map visualization**: Show location markers on map to encourage location-based browsing
  - **Smooth transitions**: Use fluid animations when navigating between views
  - **Visual feedback**: Provide clear feedback for all interactions (hover states, click animations)
  - **Progressive disclosure**: Show basic info first, allow expansion for detailed metadata
  - **Contextual actions**: Show relevant actions based on current view and selection

- **Trust signals**:
  - **Privacy-first**: Clear messaging that all photos stay local, no cloud uploads
  - **Performance**: Fast loading and smooth interactions build trust in the app
  - **Reliability**: Accurate EXIF extraction and location mapping
  - **Transparency**: Show metadata clearly and allow verification of location data
  - **Native feel**: System-native dialogs and interactions feel trustworthy

- **Onboarding approach**: **Minimal onboarding** — progressive disclosure
  - **Rationale**: PhotoMap is a desktop app focused on browsing, not a complex SaaS product. Users want to start viewing photos immediately, not read lengthy tutorials. Show a brief welcome screen on first launch, then provide contextual hints and tooltips as needed. Allow users to discover features organically through the interface.

- **Engagement touchpoints**:
  - **Photo detail view**: Encourage exploration by showing metadata and location
  - **Map view**: Visual representation of photo locations encourages discovery
  - **Date grouping**: Automatic grouping by date helps users find photos quickly
  - **Location clustering**: Show multiple photos from same location to encourage exploration
  - **Smooth navigation**: Fluid transitions between views keep users engaged
  - **Keyboard shortcuts**: Power users can navigate quickly without mouse

- **Accessibility considerations**:
  - **Keyboard navigation**: Full keyboard support for all features
  - **Screen reader support**: ARIA labels and semantic HTML for screen readers
  - **High contrast**: Ensure sufficient contrast for text and UI elements
  - **Focus indicators**: Clear focus indicators for keyboard navigation
  - **Reduced motion**: Respect `prefers-reduced-motion` for animations

### 10. Screen Requirements (DETAILED UI/UX SPECIFICATIONS)

#### Design Tokens & Visual System

- **Primary Color**: Electric Cyan — `#1EC8E6` (RGB 30,200,230; HSL 191,81%,51%)
  - **Usage**: Primary CTAs, focus rings, active states, location markers on map
  - **Avoid**: Overuse in text blocks, backgrounds

- **Secondary Color**: Midnight Blue — `#0A2A4A` (RGB 10,42,74)
  - **Usage**: Base surfaces, headers, dark backgrounds

- **Accent Color**: Royal Slate — `#314D6E` (RGB 49,77,110)
  - **Usage**: Secondary buttons, chips, metadata panels

- **Neutral Gray Scale** (10 levels with usage contexts):
  - **50**: `#FAFBFC` — Light headers, dividers on light backgrounds
  - **100**: `#F0F2F4` — Light backgrounds, subtle fills
  - **200**: `#E2E6EA` — Subtle dividers, borders
  - **300**: `#CBD2D9` — Hairline borders, disabled text
  - **400**: `#9AA5B1` — Secondary text, metadata labels
  - **500**: `#7B8794` — Default text on light backgrounds
  - **600**: `#616E7C` — Subdued controls, inactive states
  - **700**: `#3E4C59` — Dark cards, elevated surfaces
  - **800**: `#323F4B` — Dark surfaces, backgrounds
  - **900**: `#1F2933` — App background (dark mode)

- **Component radius styles**:
  - **Buttons**: `14px` (`rounded-sm`) — Primary and secondary buttons
  - **Cards**: `20px` (`rounded-md`) — Photo cards, metadata panels
  - **Modals/Sheets**: `28px` (`rounded-xl`) — Dialogs, detail views
  - **Inputs**: `14px` (`rounded-sm`) — Search bars, filters

- **Spacing scale** (8-pt rhythm): 4, 8, 12, 16, 20, 24, 32, 48, 64px
  - **Examples**:
    - Card padding: 16–24px (desktop), 12–16px (mobile)
    - Grid gaps: 16–24px (desktop), 12–16px (mobile)
    - Page gutters: 24–32px (desktop), 16–24px (mobile)
    - Component gaps: 12–16px

- **Typography scale**:
  - **H1**: 48px / 56px line height / 700 weight — Page titles
  - **H2**: 36px / 44px line height / 700 weight — Section headers
  - **H3**: 28px / 36px line height / 600 weight — Card titles
  - **H4**: 22px / 30px line height / 600 weight — Subsection headers
  - **Body Large**: 16px / 26px line height / 400 weight — Main content
  - **Body Medium**: 14px / 22px line height / 400 weight — Secondary content
  - **Caption**: 12px / 18px line height / 400 weight — Metadata, labels

- **Shadow & Elevation styles**:
  - **L1**: `0 1px 2px rgba(0,0,0,0.06)` — Subtle elevation, hover states
  - **L2**: `0 4px 10px rgba(0,0,0,0.08)` — Cards, panels
  - **L3**: `0 10px 24px rgba(0,0,0,0.12)` — Modals, detail views

- **Interaction feedback**:
  - **Hover**: Elevate shadow by 1 level, subtle scale (1.02)
  - **Active/Pressed**: Darken 6–8%, compress shadow slightly
  - **Focus**: 2px Electric Cyan ring, 1px offset
  - **Disabled**: 50% opacity, no shadow, no pointer events

- **Border styles**:
  - **Hairline**: `1px solid rgba(255,255,255,0.15)` — Glass surfaces
  - **Regular**: `1.5px solid rgba(255,255,255,0.2)` — Emphasis borders

- **Glass/blur effects** (Liquid Glass System):
  - **Glass Surface 1**: `backdrop-blur-lg` + `bg-white/5` + hairline border
  - **Glass Surface 2**: `backdrop-blur-xl` + `bg-white/7` + inner rim highlight
  - **Glass Surface 3**: `backdrop-blur-2xl` + `bg-white/10` + shadow-glass
  - **Usage**: Higher levels for modals/detail views, lower for cards

#### Component Specifications (Global)

- **Visual hierarchy**:
  1. Primary CTA (map view toggle, directory selection)
  2. Photo grid/thumbnails
  3. Secondary actions (filters, settings, search)

- **Layout structure**:
  - Desktop: Max-width container with 24–32px gutters
  - Mobile: Full-width with 16–24px gutters
  - Grid system: Adaptive columns based on window size

- **Component states**:
  - Default, hover, active, focus, disabled, loading, error, empty
  - All states defined per component type

- **Interaction patterns**:
  - Click/tap for selection, double-click for detail view
  - Keyboard navigation (arrow keys, ESC, spacebar)
  - Swipe gestures for photo navigation (mobile/trackpad)

- **Responsive behavior**:
  - Mobile: Single column, stacked layout
  - Tablet: 2-column grid
  - Desktop: 3–4 column grid, side-by-side layouts

- **Accessibility considerations**:
  - WCAG AA contrast (≥4.5:1)
  - Visible focus rings (2px Electric Cyan)
  - Keyboard navigation support
  - ARIA labels and semantic HTML
  - Screen reader announcements

- **Animation and motion**:
  - Photo reveal: Fade in + slide up (200ms ease-ios)
  - View transitions: Fade + scale (240–320ms ease-ios)
  - Respect `prefers-reduced-motion`

#### Screen-by-Screen UI Requirements

**1. Welcome Screen (First Launch)**

- **Layout**: Centered card on dark background, max-width 600px
- **Components**:
  - Welcome message (H1), brief description (Body Large)
  - "Select Directory" button (Primary, Electric Cyan)
  - Optional: Feature highlights (3 cards)
- **Interactions**: Click "Select Directory" opens native file picker
- **States**: Default only (first launch)
- **Visual notes**: Glass Surface 2 card, centered, subtle animation on mount

**2. Directory Selection Dialog**

- **Layout**: Native file picker dialog (system-dependent)
- **Components**: System file picker UI
- **Interactions**: Browse folders, select directory, confirm/cancel
- **States**: Browsing, selected, error (no photos found)
- **Visual notes**: Use native system dialogs for trust and familiarity

**3. Main Gallery View**

- **Layout**:
  - **Top toolbar**: Directory path, search bar, map view toggle, settings
  - **Photo grid**: Adaptive grid with thumbnails
  - **Bottom status bar**: Photo count, location count, date range
- **Components**:
  - **Toolbar**: Search input, buttons (map view, settings, change directory)
  - **Photo grid**: Responsive grid of photo thumbnails
  - **Photo card**: Thumbnail image, date badge, location indicator (if GPS)
  - **Status bar**: Stats and metadata summary
- **Interactions**:
  - Click photo → Photo detail view
  - Hover photo → Show metadata preview
  - Scroll → Lazy load more photos
  - Keyboard: Arrow keys navigate, Enter opens detail view
- **States**:
  - Loading: Skeleton grid during scan
  - Empty: "No photos found" message with CTA
  - Error: Error message with retry button
  - Success: Grid of photos
- **Responsive**:
  - Mobile: 2-column grid, collapsed toolbar
  - Desktop: 3–4 column grid, full toolbar
- **Visual notes**: Glass Surface 1 cards for photos, Electric Cyan for location indicators

**4. Photo Detail View**

- **Layout**:
  - **Full-screen photo viewer**: Photo fills viewport, centered
  - **Metadata panel**: Slide-out panel (right side desktop, bottom mobile)
  - **Navigation controls**: Previous/Next buttons, close button
- **Components**:
  - **Photo viewer**: Full-screen image with zoom/pan
  - **Metadata panel**: Date, location (with map link), camera info, EXIF data
  - **Navigation**: Arrow buttons, keyboard shortcuts
  - **Close button**: Top-right (X icon)
- **Interactions**:
  - Click photo → Toggle metadata panel
  - Arrow keys → Navigate previous/next
  - ESC → Close detail view
  - Swipe → Navigate (mobile/trackpad)
  - Click location → Open map view
- **States**:
  - Loading: Skeleton for photo
  - Loaded: Photo displayed
  - Error: Error message with retry
- **Responsive**:
  - Mobile: Bottom sheet for metadata
  - Desktop: Side panel for metadata
- **Visual notes**: Glass Surface 3 for metadata panel, full-screen photo with overlay controls

**5. Map View**

- **Layout**:
  - **Full-screen map**: Map fills viewport
  - **Photo markers**: Markers on map showing photo locations
  - **Photo clusters**: Cluster markers for multiple photos at same location
  - **Toggle button**: Switch to gallery view
- **Components**:
  - **Map component**: Interactive map (Leaflet/Mapbox)
  - **Photo markers**: Custom markers with photo thumbnail
  - **Cluster markers**: Circle with count
  - **Info popup**: Photo preview on marker click
  - **Toolbar**: Gallery view toggle, zoom controls
- **Interactions**:
  - Click marker → Show photo info popup
  - Click popup → Open photo detail view
  - Click cluster → Zoom in, expand cluster
  - Pan/zoom → Navigate map
  - Keyboard: Arrow keys pan map, +/- zoom
- **States**:
  - Loading: Loading map tiles
  - Loaded: Map with markers
  - Empty: "No photos with location data" message
  - Error: Error loading map
- **Responsive**:
  - Mobile: Full-screen map, touch gestures
  - Desktop: Full-screen map, mouse controls
- **Visual notes**: Electric Cyan markers, cluster circles, glass info popups

**6. Settings View**

- **Layout**:
  - **Side panel** (desktop) or **Bottom sheet** (mobile)
  - **Sections**: Directory, View Preferences, Appearance
- **Components**:
  - **Directory section**: Current directory, change button
  - **View preferences**: Grid size slider, sorting options, grouping options
  - **Appearance**: Theme toggle (light/dark), reduce motion toggle
  - **Save/Cancel buttons**: Apply or discard changes
- **Interactions**:
  - Change settings → Update preview
  - Save → Apply and close
  - Cancel → Discard and close
- **States**: Default, saving, error
- **Responsive**:
  - Mobile: Bottom sheet
  - Desktop: Side panel
- **Visual notes**: Glass Surface 2 panel, form inputs with Electric Cyan focus

**7. Loading States**

- **Layout**: Centered on screen or in-place
- **Components**:
  - **Spinner**: Circular spinner (Electric Cyan)
  - **Skeleton**: Placeholder cards for photos
  - **Progress bar**: For directory scanning
- **Interactions**: None (loading)
- **States**: Loading, complete, error
- **Visual notes**: Subtle animations, Electric Cyan accents

**8. Empty States**

- **Layout**: Centered message
- **Components**:
  - **Icon**: Large icon (camera, folder)
  - **Message**: H3 title + Body description
  - **CTA**: Primary button (Select Directory, Retry)
- **Interactions**: Click CTA to take action
- **States**: No photos, no location data, error
- **Visual notes**: Muted colors, clear CTAs

**9. Error States**

- **Layout**: Inline or modal
- **Components**:
  - **Error icon**: Warning icon
  - **Error message**: Clear description
  - **Action button**: Retry, dismiss, or alternative action
- **Interactions**: Click action button
- **States**: Error, retrying, resolved
- **Visual notes**: Red accent for errors, clear recovery paths

### 11. Non-Functional Requirements

- **Performance targets**:
  - **App startup**: < 2 seconds from launch to first gallery view
  - **Directory scan**: < 5 seconds for 1000 photos, < 30 seconds for 10,000 photos
  - **Thumbnail generation**: < 100ms per thumbnail, lazy loading for large collections
  - **Photo detail view**: < 500ms to load full-resolution photo
  - **Map rendering**: < 1 second to render map with markers
  - **Smooth animations**: 60fps for all UI animations and transitions
  - **Memory usage**: < 500MB for typical photo collection (1000 photos)
  - **Responsive interactions**: < 100ms feedback for user actions (hover, click)

- **Security requirements**:
  - **Local-only**: All photos stay on device, no network requests for photo data
  - **File system access**: Only read photos from selected directory, no write access without user permission
  - **No telemetry**: No tracking, analytics, or data collection (user privacy)
  - **Safe EXIF parsing**: Validate EXIF data to prevent parsing errors or exploits
  - **Sandboxed**: Electron app should run in sandboxed environment (if possible on platform)

- **Scalability considerations**:
  - **Photo collection size**: Handle collections from 10 photos to 100,000+ photos
  - **Thumbnail caching**: Cache thumbnails to disk for faster subsequent loads
  - **Lazy loading**: Load photos on demand, not all at once
  - **Memory management**: Release memory for off-screen photos
  - **Efficient scanning**: Use file system watchers to detect new photos without full rescan

- **Accessibility requirements**:
  - **WCAG 2.1 AA compliance**: Minimum contrast ratio 4.5:1 for text
  - **Keyboard navigation**: Full keyboard support for all features
  - **Screen reader support**: ARIA labels, semantic HTML, live regions for dynamic content
  - **Focus indicators**: Visible focus rings for all interactive elements
  - **Reduced motion**: Respect `prefers-reduced-motion` media query
  - **High contrast mode**: Support system high contrast mode (if available)

- **Browser/device support**:
  - **Desktop platforms**: Windows 10+, macOS 10.14+, Linux (Ubuntu 20.04+, Fedora 32+)
  - **Electron version**: Electron 43.4.1 or newer (requires Node.js 22.12.0+)
  - **Display resolutions**: Support from 1280x720 to 4K and higher
  - **DPI scaling**: Support high-DPI displays (Retina, 4K, etc.)
  - **Touch support**: Basic touch gestures for photo navigation (trackpad/touchscreen)

- **Reliability requirements**:
  - **Error handling**: Graceful error handling for corrupted photos, invalid EXIF data
  - **Crash recovery**: Recover from crashes, restore last viewed state
  - **File system errors**: Handle permission errors, missing files, deleted directories
  - **Map loading errors**: Fallback if map service unavailable, show error message
  - **Photo loading errors**: Skip corrupted photos, show error count, allow retry

### 12. Success Metrics / KPIs

- **User engagement metrics**:
  - **Daily active users (DAU)**: Users who open app daily
  - **Session duration**: Average time spent browsing photos per session
  - **Photos viewed per session**: Average number of photos viewed per session
  - **Map view usage**: Percentage of sessions where map view is used
  - **Photo detail view opens**: Average number of detail views per session
  - **Directory changes**: Frequency of switching between directories

- **Feature adoption metrics**:
  - **Map view adoption**: Percentage of users who use map view
  - **Location data usage**: Percentage of users with photos containing GPS data
  - **Filter usage**: Percentage of users who use filters
  - **Search usage**: Percentage of users who use search
  - **Settings customization**: Percentage of users who customize settings

- **Performance benchmarks** (user-focused):
  - **Time to first gallery view**: < 2 seconds (from launch)
  - **Time to scan directory**: < 5 seconds for 1000 photos
  - **Time to load photo detail**: < 500ms
  - **Time to render map**: < 1 second
  - **User satisfaction**: NPS score (if feedback mechanism exists)

- **Business metrics** (if applicable):
  - **User retention**: Percentage of users who return after first use
  - **User growth**: Monthly active users (MAU) growth rate
  - **Error rate**: Percentage of sessions with errors
  - **Crash rate**: Percentage of sessions ending in crashes

### 13. Tech Stack Recommendation (HIGH-LEVEL ONLY)

- **Frontend framework**: **React** (via Vite)
  - **Rationale**: User-specified requirement. React provides component-based architecture for building reusable UI components. Vite offers fast development experience with hot module replacement and optimized builds.

- **Desktop framework**: **Electron**
  - **Rationale**: User-specified requirement. Electron enables cross-platform desktop app development (Windows, macOS, Linux) using web technologies. Provides native file system access and system integration.

- **Build tool**: **Vite**
  - **Rationale**: User-specified requirement. Vite provides fast development server and optimized production builds. Better performance than Create React App for Electron apps.

- **Map library**: **Leaflet** or **Mapbox GL JS**
  - **Rationale**: Both provide interactive map functionality. Leaflet is lightweight and open-source. Mapbox offers better styling and performance but requires API key. Choose based on privacy requirements (Leaflet for fully offline, Mapbox for better UX).

- **EXIF extraction**: **exifr** or **exif-js**
  - **Rationale**: JavaScript libraries for reading EXIF data from photos, including GPS coordinates. Essential for location feature.

- **Image processing**: **Sharp** (Node.js) or browser-based solution
  - **Rationale**: Fast thumbnail generation and image manipulation. Sharp is efficient for server-side processing in Electron main process.

- **UI framework**: **Tailwind CSS** (v4)
  - **Rationale**: Utility-first CSS framework for rapid UI development. Matches Liquid Glass design system requirements. V4 provides improved performance and features.

- **Icons**: **lucide-react**
  - **Rationale**: User preference. Modern, consistent icon library with React components. Matches the design aesthetic.

- **State management**: **React Context** or **Zustand**
  - **Rationale**: Lightweight state management for photo collection, directory selection, and UI state. Zustand provides simple API for complex state.

- **Routing**: **React Router** (if needed)
  - **Rationale**: For navigation between views (gallery, map, detail, settings) if using SPA architecture.

- **Note**: Detailed tech stack, dependencies, and configuration are handled by the implementation plan generator.

### 14. Release Plan

- **MVP scope** (Phase 1 — Core features):
  - Directory selection and photo scanning
  - Photo gallery view (iOS Photos-style grid)
  - Photo detail view with full-screen viewer
  - Map view with photo location markers
  - EXIF GPS extraction and location display
  - Basic photo metadata display
  - Photo grouping by date
  - Keyboard navigation (arrow keys, ESC, Enter)
  - Cross-platform builds (Windows, macOS, Linux)

- **Phase 2 features** (Enhanced functionality):
  - Location clustering on map
  - Photo search by filename/date
  - Date range filtering
  - Photo sorting options
  - Photo metadata editing
  - Recent directories
  - Dark mode support
  - Photo sharing via system share dialog
  - Batch photo selection
  - Photo zoom in detail view
  - Slide show mode

- **Future roadmap** (Vision for scaling):
  - Advanced filtering and search
  - Photo tagging and custom albums
  - Location reverse geocoding (city, country names)
  - Travel route visualization
  - Photo statistics dashboard
  - RAW file support
  - Video support with location metadata
  - Photo editing capabilities
  - Face detection and grouping
  - Photo deduplication
  - Backup/sync features (user-controlled)
  - Plugin system for extensibility

- **Timeline estimates** (high-level):
  - **MVP**: 8–12 weeks (core features, basic UI, cross-platform builds)
  - **Phase 2**: +8–12 weeks (enhanced features, polish, performance optimization)
  - **Future roadmap**: Ongoing development based on user feedback

### 15. Design System (COMPREHENSIVE)

#### Color System

- **Primary Color**: Electric Cyan
  - **HEX**: `#1EC8E6`
  - **RGB**: `30, 200, 230`
  - **HSL**: `191, 81%, 51%`
  - **Usage**: Primary CTAs, focus rings, active states, location markers on map, accent highlights
  - **Avoid**: Overuse in text blocks, large backgrounds

- **Secondary Color**: Midnight Blue
  - **HEX**: `#0A2A4A`
  - **RGB**: `10, 42, 74`
  - **HSL**: `210, 77%, 16%`
  - **Usage**: Base surfaces, headers, dark backgrounds, app background

- **Accent Color**: Royal Slate
  - **HEX**: `#314D6E`
  - **RGB**: `49, 77, 110`
  - **HSL**: `210, 38%, 31%`
  - **Usage**: Secondary buttons, chips, metadata panels, subtle accents

- **Neutral Grayscale** (10 levels with usage contexts):
  - **50**: `#FAFBFC` — Light headers, dividers on light backgrounds
  - **100**: `#F0F2F4` — Light backgrounds, subtle fills
  - **200**: `#E2E6EA` — Subtle dividers, borders
  - **300**: `#CBD2D9` — Hairline borders, disabled text
  - **400**: `#9AA5B1` — Secondary text, metadata labels
  - **500**: `#7B8794` — Default text on light backgrounds
  - **600**: `#616E7C` — Subdued controls, inactive states
  - **700**: `#3E4C59` — Dark cards, elevated surfaces
  - **800**: `#323F4B` — Dark surfaces, backgrounds
  - **900**: `#1F2933` — App background (dark mode)

- **Semantic Colors**:
  - **Success**: `#22C55E` (Green) — Success messages, confirmations
  - **Error**: `#EF4444` (Red) — Error messages, destructive actions
  - **Warning**: `#F59E0B` (Orange) — Warnings, caution messages
  - **Info**: `#60A5FA` (Blue) — Informational messages, hints

- **Usage rules**:
  - Maintain 4.5:1 contrast ratio for all text on backgrounds
  - Reserve primary color for critical actions and highlights
  - Use semantic colors sparingly for status messages only
  - Neutral grayscale for text, borders, and backgrounds

#### Typography System

- **Font families**:
  - **Primary**: `Inter` or `SF Pro` (system font stack)
  - **Fallback**: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif`
  - **Monospace**: `'SF Mono', 'Monaco', 'Courier New', monospace` (for metadata, code)

- **Type scale** (with line heights and weights):
  - **H1**: 48px / 56px line height / 700 weight — Page titles, welcome screens
  - **H2**: 36px / 44px line height / 700 weight — Section headers, main headings
  - **H3**: 28px / 36px line height / 600 weight — Card titles, subsection headers
  - **H4**: 22px / 30px line height / 600 weight — Subsection headers, labels
  - **Body Large**: 16px / 26px line height / 400 weight — Main content, descriptions
  - **Body Medium**: 14px / 22px line height / 400 weight — Secondary content, metadata
  - **Caption**: 12px / 18px line height / 400 weight — Labels, metadata, timestamps
  - **Small**: 11px / 16px line height / 400 weight — Fine print, helper text

- **Usage contexts**:
  - **Headings**: Use for page/section titles, card titles, hierarchy
  - **Body**: Use for main content, descriptions, user-facing text
  - **Caption**: Use for metadata, labels, timestamps, secondary info
  - **Small**: Use for fine print, helper text, tooltips

#### Spacing System

- **Base unit**: 4px (8-pt rhythm)
- **Spacing scale**: 4, 8, 12, 16, 20, 24, 32, 48, 64px
- **Usage examples**:
  - **4px**: Tight spacing, icon padding
  - **8px**: Small gaps, tight component spacing
  - **12px**: Component gaps, small padding
  - **16px**: Standard padding, card gaps
  - **20px**: Medium padding, section spacing
  - **24px**: Card padding, grid gaps (desktop)
  - **32px**: Page gutters, large section spacing
  - **48px**: Large section spacing, hero padding
  - **64px**: Maximum spacing, page margins

- **Patterns**:
  - **Page gutters**: 24–32px (desktop), 16–24px (mobile)
  - **Card padding**: 16–24px (desktop), 12–16px (mobile)
  - **Grid gaps**: 16–24px (desktop), 12–16px (mobile)
  - **Component gaps**: 12–16px
  - **Photo grid gaps**: 8–12px (tight spacing for photos)

#### Component Styles

- **Border radius values**:
  - **Buttons**: `14px` (`rounded-sm`) — All buttons (primary, secondary, tertiary)
  - **Cards**: `20px` (`rounded-md`) — Photo cards, metadata panels, info cards
  - **Inputs**: `14px` (`rounded-sm`) — Search bars, text inputs, filters
  - **Modals/Sheets**: `28px` (`rounded-xl`) — Dialogs, detail views, side panels
  - **Badges**: `8px` (`rounded-xs`) — Date badges, location indicators, status badges

- **Border styles**:
  - **Width**: 1px (hairline), 1.5px (regular)
  - **Color**: `rgba(255,255,255,0.15)` (hairline), `rgba(255,255,255,0.2)` (regular)
  - **Usage**: Hairline for glass surfaces, regular for emphasis

- **Shadow system** (all elevation levels):
  - **L1** (Subtle): `0 1px 2px rgba(0,0,0,0.06)` — Hover states, subtle elevation
  - **L2** (Medium): `0 4px 10px rgba(0,0,0,0.08)` — Cards, panels, elevated surfaces
  - **L3** (High): `0 10px 24px rgba(0,0,0,0.12)` — Modals, detail views, highest elevation
  - **Usage**: Elevate on hover, use higher levels for modals and overlays

- **Blur effects** (Liquid Glass System):
  - **Glass Surface 1** (Low): `backdrop-blur-lg` + `bg-white/5` + hairline border
  - **Glass Surface 2** (Medium): `backdrop-blur-xl` + `bg-white/7` + inner rim highlight
  - **Glass Surface 3** (High): `backdrop-blur-2xl` + `bg-white/10` + shadow-glass
  - **Usage**: Higher levels for modals/detail views, lower for cards and panels
  - **Tint opacity**: ≤ 28% (`bg-white/5` to `bg-white/10`)

#### Interaction Patterns

- **Hover states**:
  - **Cards**: Elevate shadow L1 → L2, translateY -4px, 200ms transition
  - **Buttons**: Darken 6–8%, scale 1.02, 200ms transition
  - **Links**: Color → Electric Cyan, underline, 200ms transition
  - **Photos**: Scale 1.02, show metadata preview, 200ms transition

- **Active/Pressed states**:
  - **Buttons**: Darken 8–10%, compress shadow slightly, 100ms transition
  - **Cards**: Darken 4–6%, compress shadow, 100ms transition
  - **Visual feedback**: Immediate response to user action

- **Focus states** (accessibility):
  - **Visible focus ring**: 2px Electric Cyan ring, 1px offset, 200ms transition
  - **Keyboard navigation**: Full tab order follows visual hierarchy
  - **Focus indicators**: Always visible for keyboard users

- **Disabled states**:
  - **Opacity**: 50% opacity
  - **Remove**: Shadows, pointer events
  - **Visual**: Muted colors, no interaction feedback

- **Transitions**:
  - **Duration**: 160–200ms (components), 240–320ms (overlays/sheets)
  - **Easing**: `cubic-bezier(0.2, 0.8, 0.2, 1)` (iOS ease)
  - **Timing**: Contextual motion (sub-200ms for small UI, 240–320ms for sheets)

- **Animation triggers**:
  - **On mount**: Fade in + slide up for cards (200ms ease-ios)
  - **On state change**: Fade + scale for view transitions (240–320ms ease-ios)
  - **On scroll**: Reveal animations with intersection observer (200ms ease-ios)
  - **List reorders**: Subtle animations for list changes (200ms ease-ios)

#### Component Recipes (Liquid Glass)

- **Card (default)**:
  - `border border-white/15 bg-white/5 backdrop-blur-xl rounded-md shadow-[0_4px_10px_rgba(0,0,0,0.08)]`
  - Padding: 16–24px (desktop), 12–16px (mobile)
  - Hover: Elevate shadow, translateY -4px

- **Button Primary**:
  - Fill: `#1EC8E6` (Electric Cyan)
  - Text: White
  - Radius: `14px` (`rounded-sm`)
  - Hover: Darken 8%
  - Focus: 2px Electric Cyan ring

- **Button Secondary**:
  - Border: `1px solid rgba(255,255,255,0.2)`
  - Background: Transparent
  - Text: White
  - Hover: `bg-white/5`

- **Modal/Sheet**:
  - Glass Surface 3: `backdrop-blur-2xl bg-white/10`
  - Radius: `28px` (`rounded-xl`)
  - Shadow: L3
  - Enter: 280ms ease-ios
  - Exit: 200ms ease-ios

- **Input/Search**:
  - Border: `1px solid rgba(255,255,255,0.15)`
  - Background: `bg-white/5 backdrop-blur-lg`
  - Radius: `14px` (`rounded-sm`)
  - Focus: 2px Electric Cyan ring

#### Responsive Breakpoints

- **Mobile**: ≤ 640px
  - Single column layout
  - Stack all sections vertically
  - Collapsed toolbar, bottom sheet for metadata
  - Card padding: 12–16px
  - Typography: H1 36px, H2 28px, Body 14px

- **Tablet**: 641–1024px
  - 2-column grid for features
  - Horizontal scroll for lists
  - Side-by-side layouts where appropriate
  - Card padding: 16–24px

- **Desktop**: ≥ 1025px
  - 3–4 column grid for photos
  - Full navigation visible
  - Max-width containers: 1280px
  - Card padding: 24–32px
  - Full typography scale

#### Accessibility Standards

- **Color contrast**: WCAG 2.1 AA compliance (≥4.5:1 for text, ≥3:1 for UI components)
- **Focus indicators**: Visible 2px Electric Cyan ring for all interactive elements
- **Keyboard navigation**: Full tab order, arrow keys for photo navigation, ESC for closing
- **Screen reader support**: ARIA labels, semantic HTML, live regions for dynamic content
- **Reduced motion**: Respect `prefers-reduced-motion` media query, disable translations
- **High contrast mode**: Support system high contrast mode (if available)

### 16. Landing/Home Page Layout Proposal

**Decision Rationale**: PhotoMap is a desktop app (Electron), not a web app. The "landing page" concept translates to the **Welcome Screen** (first launch) and **Main Gallery View** (primary interface). Unlike web apps, desktop apps don't have marketing landing pages; instead, they have functional entry points.

- **Welcome Screen** (`/` or first launch):
  - Purpose: First-time user onboarding, directory selection, feature introduction
  - Entry point: App launch (first time only)
  - User state: Unauthenticated, no directory selected

- **Main Gallery View** (`/gallery` or default view):
  - Purpose: Primary functional interface for browsing photos
  - Entry point: Post-directory selection, returning app launches
  - User state: Directory selected, photos loaded

---

#### Welcome Screen Layout (First Launch)

**Overall Structure**: Centered card on dark background (Midnight Blue `#0A2A4A`), max-width 600px, vertical padding 48–64px
**Background**: Dark base (`#0A2A4A`) with subtle gradient overlays (Electric Cyan 10% opacity)
**Motion Philosophy**: Fade in + slide up on mount (280ms ease-ios), subtle animations

**Welcome Content Card**:

- **H1 Headline**: "Welcome to PhotoMap" (48/56 700, white)
- **Subheadline**: "Browse your photos with iOS-style galleries and discover where each moment was captured on a map." (Body Large 16/26 400, neutral-400 `#9AA5B1`)
- **Feature highlights** (3 cards, optional):
  1. **iOS Photos-style interface** (Icon: Grid, Text: "Beautiful, intuitive gallery experience")
  2. **Map integration** (Icon: MapPin, Text: "See where photos were taken")
  3. **Privacy-first** (Icon: Lock, Text: "100% local, no cloud uploads")
- **Primary CTA**: "Select Directory" button (Electric Cyan fill, white text, 16px radius, 48px height)
- **Trust badge**: "✓ Free • ✓ Privacy-first • ✓ Cross-platform"

**Styling**: Glass Surface 2 card (`backdrop-blur-xl bg-white/7 border-white/15`), padding 48px (desktop) / 32px (mobile), gap 16px between sections

**Motion**: Card fades in from bottom (opacity 0 → 1, translateY 24px → 0) on mount (280ms ease-ios), feature cards stagger in (80ms delay per card)

---

#### Main Gallery View Layout (Primary Interface)

**Overall Structure**: Full-width app window, max-width 1920px (large screens), padding 24–32px (desktop) / 16–24px (mobile)
**Background**: Dark base (`#0A2A4A` Midnight Blue) with subtle glass surfaces
**Motion Philosophy**: Smooth transitions between views, lazy loading for photos

**Top Toolbar** (Fixed, sticky, height 64px desktop / 56px mobile):

- **Left section**: Directory path breadcrumb (clickable to change directory)
- **Center section**: Search bar (Glass Surface 1, rounded-sm, 320px width desktop)
- **Right section**: Map view toggle button, Settings button, Change directory button

**Photo Grid** (Adaptive grid, responsive columns):

- **Layout**: 3–4 columns desktop, 2 tablet, 2 mobile, gap 12–16px
- **Photo cards**:
  - Thumbnail image (aspect ratio maintained, object-fit cover)
  - Date badge (bottom-left, Glass Surface 1, Caption 12/18 400)
  - Location indicator (bottom-right, Electric Cyan icon if GPS data exists)
  - Hover overlay: Photo metadata preview (date, location, camera info)

**Bottom Status Bar** (Fixed, sticky, height 48px):

- **Left section**: Photo count, Location count (Body Medium 14/22 400, neutral-400)
- **Right section**: Date range (Body Medium 14/22 400, neutral-400)

**Visual Hierarchy**:

1. Primary: Photo grid (main content area)
2. Secondary: Toolbar (actions, navigation)
3. Tertiary: Status bar (metadata, stats)

**Layout Spacing**: Page gutters 24–32px (desktop), 16–24px (mobile); Grid gaps 16px (desktop), 12px (tablet), 8px (mobile)

**Typography**: Toolbar Body Medium 14/22 400; Photo cards Caption 12/18 400; Status bar Body Medium 14/22 400

**Component Behavior**: Photo cards lazy load on scroll, fade in on mount (200ms ease-ios); Toolbar sticky on scroll, background opacity increases; Status bar updates dynamically

**Motion / Interaction Ideas**: Photo reveal fade in + slide up (200ms ease-ios) on scroll; Hover feedback elevate card, show metadata preview (200ms); View transitions fade + scale (240–320ms ease-ios)

**Responsive Behavior**:

- Mobile (≤ 640px): 2-column grid, collapsed toolbar, bottom sheet for metadata
- Tablet (641–1024px): 2–3 column grid, full toolbar, side panel for metadata
- Desktop (≥ 1025px): 3–4 column grid, full toolbar, max-width container: 1920px

### 17. Background Design Proposal

**Mood & Purpose**: PhotoMap is a desktop photo gallery app inspired by iOS Photos. The background design should create a sense of depth and elegance that enhances photo viewing without distracting from the photos themselves. The mood should be calm, sophisticated, and focused on the content (photos), not the UI.

**Background Type**: **Gradient + Glass Blur** combination

- **Base layer**: Dark gradient (Midnight Blue `#0A2A4A` to darker `#1F2933`)
- **Glass surfaces**: Translucent glass cards with backdrop blur
- **Subtle texture**: Optional subtle noise/grain for depth (10% opacity)

**Color & Light Composition**:

- **Base gradient**: Vertical gradient from `#0A2A4A` (top) to `#1F2933` (bottom)
- **Accent highlights**: Subtle Electric Cyan (`#1EC8E6`) gradient overlays at 10% opacity in corners
- **Glass surfaces**: White tint at 5–10% opacity (`bg-white/5` to `bg-white/10`) with backdrop blur
- **Depth layers**:
  - **Base layer**: Dark gradient background
  - **Mid layer**: Glass Surface 1 cards (photos, panels)
  - **Top layer**: Glass Surface 2–3 modals, detail views

**Depth Layers**:

- **Z-index hierarchy**:
  - Base: Background gradient (z-0)
  - Mid: Photo grid, cards (z-10)
  - Top: Toolbar, status bar (z-1000)
  - Overlay: Modals, detail views (z-2000)
- **Blur intensity**:
  - Base: No blur (solid gradient)
  - Mid: `backdrop-blur-lg` (cards)
  - Top: `backdrop-blur-xl` to `backdrop-blur-2xl` (modals)

**Motion Concept**:

- **Static background**: Base gradient remains static (no animation)
- **Subtle parallax**: Optional very subtle parallax on scroll (if performance allows, disabled by default)
- **Floating elements**: Optional subtle floating gradient orbs (Electric Cyan 5% opacity) for depth (if performance allows)
- **Respect reduced motion**: Disable all animations if `prefers-reduced-motion` is enabled

**Implementation Suggestion** (Tailwind CSS):

```css
/* Base background */
.app-background {
  background: linear-gradient(180deg, #0a2a4a 0%, #1f2933 100%);
}

/* Optional subtle accent gradient */
.app-background::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(
    circle at 20% 20%,
    rgba(30, 200, 230, 0.1) 0%,
    transparent 50%
  );
  pointer-events: none;
}

/* Glass surfaces */
.glass-surface-1 {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.glass-surface-2 {
  background: rgba(255, 255, 255, 0.07);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.glass-surface-3 {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(40px);
  border: 1px solid rgba(255, 255, 255, 0.15);
}
```

**Accessibility & Responsiveness**:

- **Contrast**: Dark background ensures high contrast for text and UI elements (WCAG AA compliant)
- **Device adaptation**:
  - Desktop: Full gradient background, glass surfaces
  - Tablet: Same design, optimized for touch
  - Mobile: Same design, optimized for smaller screens
- **Reduced motion**: Disable all animations and parallax if `prefers-reduced-motion` is enabled
- **Performance**: Use CSS backdrop-filter for blur (GPU-accelerated), avoid heavy JavaScript animations
- **Dark mode**: Default dark background, no light mode variant (desktop app focused on photo viewing)

**Implementation Notes**:

- Use Tailwind CSS utilities for gradient backgrounds (`bg-gradient-to-b from-[#0A2A4A] to-[#1F2933]`)
- Use Tailwind's backdrop-blur utilities for glass effects
- Optimize for performance: avoid heavy animations, use CSS transforms
- Test on different screen sizes and resolutions (Retina, 4K, etc.)
