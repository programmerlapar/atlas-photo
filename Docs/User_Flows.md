# User Flows Documentation

## Overview

This document defines the user flows and navigation paths for PhotoMap, ensuring all required navigation paths exist for each persona and that user journeys are complete and navigable.

## Persona-Specific User Journeys

### Persona 1: Photography Enthusiast / Traveler

**Goals:**

- Quickly browse large photo collections with a beautiful, intuitive interface
- See where photos were taken on a map to relive travel memories
- Organize photos by location without manual tagging
- Share location-aware photo stories with friends

**Primary Journey: Browse Photos with Location Context**

1. **First Launch**
   - App launches → Welcome Screen appears
   - Click "Select Directory" → Native file picker opens
   - Select photo directory → App scans photos and extracts EXIF data
   - Loading screen shows progress → Main Gallery View appears

2. **Browse Photos**
   - Main Gallery View shows photos grouped by date
   - Scroll through photo grid → Photos lazy load as user scrolls
   - Hover over photo → Metadata preview appears (date, location, camera)
   - Click photo → Photo Detail View opens

3. **View Photo Details**
   - Photo Detail View shows full-screen photo
   - View metadata panel → See date, location, camera info, EXIF data
   - If location data exists → Click location → Map View opens showing photo location
   - Navigate photos → Arrow keys or swipe to previous/next photo
   - Close detail view → ESC key or click outside → Return to Gallery

4. **View Map**
   - Click "Map View" toggle → Map View opens
   - Map shows photo locations as markers
   - Click marker → Photo info popup appears
   - Click popup → Photo Detail View opens
   - Pan/zoom map → Navigate to different locations
   - Click "Gallery View" toggle → Return to Gallery

5. **Filter and Search**
   - Click filter icon → Filter panel opens
   - Select date range → Gallery updates with filtered photos
   - Search photos → Type in search bar → Results appear
   - Click search result → Photo Detail View opens

6. **Share Photos**
   - Select photo → Click share button → System share dialog opens
   - Share via email, social media, or save to location

**Navigation Paths:**

- Welcome Screen → Directory Selection → Gallery View ✓
- Gallery View → Photo Detail View → Map View ✓
- Gallery View → Map View → Photo Detail View ✓
- Gallery View → Filters → Filtered Gallery View ✓
- Gallery View → Search → Photo Detail View ✓

### Persona 2: Casual User

**Goals:**

- Browse photos from a specific folder easily
- See photos in a clean, modern interface
- Occasionally check where a photo was taken

**Primary Journey: Simple Photo Browsing**

1. **First Launch**
   - App launches → Welcome Screen appears
   - Click "Select Directory" → Native file picker opens
   - Select photo folder → App scans photos
   - Main Gallery View appears

2. **Browse Photos**
   - Main Gallery View shows photos in grid
   - Scroll through photos → View thumbnails
   - Click photo → Photo Detail View opens

3. **View Photo Details**
   - Photo Detail View shows full-screen photo
   - View metadata panel → See date, location (if available)
   - Navigate photos → Arrow keys to previous/next
   - Close detail view → ESC key → Return to Gallery

4. **Check Location (Optional)**
   - If photo has location data → Click location in metadata → Map View opens
   - View location on map → Close map → Return to Detail View

**Navigation Paths:**

- Welcome Screen → Directory Selection → Gallery View ✓
- Gallery View → Photo Detail View ✓
- Photo Detail View → Map View (if location exists) ✓

### Persona 3: Professional Photographer

**Goals:**

- Quick preview of large photo collections
- Verify location metadata for client deliverables
- Lightweight viewer that doesn't require cloud sync

**Primary Journey: Verify Location Metadata**

1. **App Launch**
   - App launches → Load last directory (if available)
   - Main Gallery View appears

2. **Browse Collection**
   - Gallery View shows photos grouped by date
   - Use filters → Filter by date range or location
   - Search photos → Search by filename or date

3. **Verify Location**
   - Click photo → Photo Detail View opens
   - View metadata panel → Check location data
   - If location exists → Click location → Map View opens
   - Verify location on map → Confirm accuracy
   - Navigate to next photo → Arrow keys → Verify next location

4. **Export Photos**
   - Select photo(s) → Click export → Export dialog opens
   - Choose export options → Export with or without location data
   - Export photos → Save to location

**Navigation Paths:**

- Gallery View → Photo Detail View → Map View ✓
- Gallery View → Filters → Filtered Gallery View ✓
- Gallery View → Search → Photo Detail View ✓
- Photo Detail View → Export → Export Dialog ✓

## Navigation Path Matrix

### View Transitions

| From View           | To View               | Navigation Method          | Status        |
| ------------------- | --------------------- | -------------------------- | ------------- |
| Welcome Screen      | Directory Selection   | Button click               | ✓ Implemented |
| Directory Selection | Gallery View          | Directory selected         | ✓ Implemented |
| Gallery View        | Photo Detail View     | Photo click                | ✓ Implemented |
| Photo Detail View   | Gallery View          | ESC key / Close button     | ✓ Implemented |
| Gallery View        | Map View              | Map toggle button          | ✓ Implemented |
| Map View            | Gallery View          | Gallery toggle button      | ✓ Implemented |
| Photo Detail View   | Map View              | Location click (if exists) | ✓ Implemented |
| Map View            | Photo Detail View     | Marker click               | ✓ Implemented |
| Gallery View        | Filter Panel          | Filter button              | ✓ Implemented |
| Filter Panel        | Filtered Gallery View | Filter applied             | ✓ Implemented |
| Gallery View        | Settings View         | Settings button            | ✓ Implemented |
| Settings View       | Gallery View          | Close button               | ✓ Implemented |
| Gallery View        | Search Results        | Search query               | ✓ Implemented |
| Search Results      | Photo Detail View     | Result click               | ✓ Implemented |

### Keyboard Navigation

| Key         | Action               | Context                               | Status        |
| ----------- | -------------------- | ------------------------------------- | ------------- |
| Arrow Left  | Previous photo       | Photo Detail View                     | ✓ Implemented |
| Arrow Right | Next photo           | Photo Detail View                     | ✓ Implemented |
| Arrow Up    | Previous photo       | Photo Detail View                     | ✓ Implemented |
| Arrow Down  | Next photo           | Photo Detail View                     | ✓ Implemented |
| ESC         | Close view           | Photo Detail View, Map View, Settings | ✓ Implemented |
| Enter       | Open photo           | Gallery View (selected photo)         | ✓ Implemented |
| Space       | Play/Pause slideshow | Photo Detail View                     | ✓ Implemented |
| F           | Toggle fullscreen    | Photo Detail View                     | ✓ Implemented |
| /           | Focus search         | Gallery View                          | ✓ Implemented |

### Mouse/Touch Navigation

| Gesture      | Action                | Context                | Status        |
| ------------ | --------------------- | ---------------------- | ------------- |
| Click        | Select/Open           | Gallery View, Map View | ✓ Implemented |
| Double-click | Open detail view      | Gallery View           | ✓ Implemented |
| Swipe Left   | Next photo            | Photo Detail View      | ✓ Implemented |
| Swipe Right  | Previous photo        | Photo Detail View      | ✓ Implemented |
| Pinch Zoom   | Zoom photo            | Photo Detail View      | ✓ Implemented |
| Hover        | Show metadata preview | Gallery View           | ✓ Implemented |

## Critical Navigation Paths

### Must-Have Navigation Paths (MVP)

1. **Welcome → Directory Selection → Gallery View**
   - **Status**: ✓ Required for MVP
   - **Implementation**: Stage 1 (Foundation & Setup)
   - **Testing**: First launch flow

2. **Gallery View → Photo Detail View → Gallery View**
   - **Status**: ✓ Required for MVP
   - **Implementation**: Stage 4 (Photo Detail View)
   - **Testing**: Photo click, ESC key, close button

3. **Gallery View → Map View → Gallery View**
   - **Status**: ✓ Required for MVP
   - **Implementation**: Stage 5 (Map Integration)
   - **Testing**: Map toggle button, gallery toggle button

4. **Photo Detail View → Map View (if location exists)**
   - **Status**: ✓ Required for MVP
   - **Implementation**: Stage 5 (Map Integration)
   - **Testing**: Location click in metadata panel

### Should-Have Navigation Paths (Phase 2)

5. **Gallery View → Filter Panel → Filtered Gallery View**
   - **Status**: ⚠ Implemented in Phase 2
   - **Implementation**: Stage 6 (Filtering & Search)
   - **Testing**: Filter button, filter selection, filtered results

6. **Gallery View → Search → Search Results → Photo Detail View**
   - **Status**: ⚠ Implemented in Phase 2
   - **Implementation**: Stage 6 (Filtering & Search)
   - **Testing**: Search bar, search query, result click

7. **Gallery View → Settings View → Gallery View**
   - **Status**: ⚠ Implemented in Phase 2
   - **Implementation**: Stage 10 (Settings & Preferences)
   - **Testing**: Settings button, settings changes, close button

## Missing Routes / Gaps

### Critical Gaps (Must Fix)

- None identified — all critical navigation paths are defined

### Nice-to-Have Gaps (Future)

1. **Photo Editing View**
   - **Status**: Future feature
   - **Priority**: Low
   - **Description**: Navigate to photo editing view from detail view

2. **Album Creation View**
   - **Status**: Future feature
   - **Priority**: Low
   - **Description**: Navigate to album creation view from gallery

3. **Photo Statistics View**
   - **Status**: Future feature
   - **Priority**: Low
   - **Description**: Navigate to statistics view from gallery

## Testing Checklist

### Navigation Flow Testing

#### First Launch Flow

- [ ] Welcome Screen appears on first launch
- [ ] "Select Directory" button opens native file picker
- [ ] Directory selection scans photos and extracts EXIF data
- [ ] Loading screen shows progress during scan
- [ ] Main Gallery View appears after successful scan
- [ ] Error handling for no photos found
- [ ] Error handling for directory access denied

#### Gallery View Navigation

- [ ] Gallery View displays photos in grid
- [ ] Photos lazy load as user scrolls
- [ ] Photo click opens Photo Detail View
- [ ] Hover over photo shows metadata preview
- [ ] Map toggle button switches to Map View
- [ ] Filter button opens filter panel
- [ ] Search bar focuses on keyboard shortcut (/)
- [ ] Settings button opens Settings View
- [ ] Keyboard navigation works (Enter to open photo)

#### Photo Detail View Navigation

- [ ] Photo Detail View displays full-screen photo
- [ ] Metadata panel shows date, location, camera info
- [ ] Location click opens Map View (if location exists)
- [ ] Arrow keys navigate previous/next photo
- [ ] Swipe gestures navigate photos (mobile/trackpad)
- [ ] ESC key closes detail view
- [ ] Close button closes detail view
- [ ] Click outside closes detail view
- [ ] Photo zoom works (pinch-to-zoom, mouse wheel)
- [ ] Navigation controls (previous/next buttons) work

#### Map View Navigation

- [ ] Map View displays map with photo locations
- [ ] Photo markers appear on map
- [ ] Marker click shows photo info popup
- [ ] Popup click opens Photo Detail View
- [ ] Cluster markers expand when clicked
- [ ] Map zoom and pan controls work
- [ ] Gallery toggle button switches to Gallery View
- [ ] Keyboard navigation works (arrow keys pan map)

#### Filter and Search Navigation

- [ ] Filter panel opens from filter button
- [ ] Date filter filters photos by date range
- [ ] Location filter filters photos by location
- [ ] Clear filters button removes all filters
- [ ] Search bar filters photos by query
- [ ] Search results navigate to Photo Detail View
- [ ] Filtered gallery view maintains state

#### Settings View Navigation

- [ ] Settings View opens from settings button
- [ ] Settings changes persist after close
- [ ] Close button returns to Gallery View
- [ ] Settings reset functionality works

### Keyboard Navigation Testing

- [ ] Arrow keys navigate photos in detail view
- [ ] ESC key closes modals and detail views
- [ ] Enter key opens selected photo
- [ ] Space key toggles slideshow
- [ ] F key toggles fullscreen
- [ ] / key focuses search bar
- [ ] Tab key navigates through interactive elements
- [ ] Focus indicators visible for keyboard users

### Mouse/Touch Navigation Testing

- [ ] Click opens photo in detail view
- [ ] Double-click opens photo in detail view
- [ ] Swipe gestures navigate photos (mobile/trackpad)
- [ ] Pinch-to-zoom works in photo detail view
- [ ] Hover shows metadata preview
- [ ] Right-click context menu works (if implemented)

### Error Handling Testing

- [ ] No photos found error handled gracefully
- [ ] Directory access denied error handled
- [ ] Corrupted photo error handled
- [ ] Invalid EXIF data error handled
- [ ] Map loading error handled
- [ ] Network error (if map requires network) handled

### Performance Testing

- [ ] Navigation transitions are smooth (60fps)
- [ ] Photo loading is fast (< 500ms)
- [ ] Map rendering is fast (< 1 second)
- [ ] Large photo collections (10,000+ photos) navigate smoothly
- [ ] Memory usage remains reasonable during navigation

### Accessibility Testing

- [ ] Screen reader announces navigation changes
- [ ] Focus indicators visible for keyboard users
- [ ] Keyboard navigation works for all features
- [ ] Color contrast meets WCAG 2.1 AA standards
- [ ] Reduced motion respects `prefers-reduced-motion`
- [ ] High contrast mode supported (if available)

## Implementation Priorities

### Priority 1: Critical Navigation Paths (MVP)

- Welcome → Directory Selection → Gallery View
- Gallery View → Photo Detail View → Gallery View
- Gallery View → Map View → Gallery View
- Photo Detail View → Map View (if location exists)

### Priority 2: Enhanced Navigation Paths (Phase 2)

- Gallery View → Filter Panel → Filtered Gallery View
- Gallery View → Search → Search Results → Photo Detail View
- Gallery View → Settings View → Gallery View

### Priority 3: Future Navigation Paths

- Photo Detail View → Photo Editing View
- Gallery View → Album Creation View
- Gallery View → Photo Statistics View

## Notes

- **Navigation State**: All navigation state should be preserved when switching between views
- **Back Navigation**: Users should be able to navigate back from any view to gallery
- **Keyboard Shortcuts**: All keyboard shortcuts should be documented and accessible
- **Error Recovery**: Users should be able to recover from errors without losing their place
- **Performance**: Navigation should be smooth and responsive (< 100ms feedback)
