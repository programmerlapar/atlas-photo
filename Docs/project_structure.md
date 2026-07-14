# Project Structure

## Root Directory

```
photomap/
├── src/                    # Source code
│   ├── main/               # Electron main process (Node.js)
│   ├── renderer/           # React renderer process (UI)
│   └── shared/             # Shared code between main and renderer
├── public/                 # Static assets (icons, images)
├── resources/              # App resources (icons, assets)
├── build/                  # Build configuration files
├── dist/                   # Build output (generated)
├── Docs/                   # Documentation (Implementation, project structure, UI/UX docs)
├── .vscode/                # VS Code settings (optional)
├── .cursor/                # Cursor AI rules and commands
├── electron-builder.yml    # Electron Builder configuration
├── electron.vite.config.ts # Electron Vite configuration
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration (main process)
├── tsconfig.node.json      # TypeScript configuration (Node.js)
├── tsconfig.web.json       # TypeScript configuration (renderer)
├── vite.config.ts          # Vite configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── postcss.config.js       # PostCSS configuration
└── .gitignore             # Git ignore rules
```

## Detailed Structure

### `/src/main/` - Electron Main Process (Node.js)

The main process handles window management, file system operations, and IPC communication.

```
src/main/
├── index.ts                # Main entry point (creates windows, handles lifecycle)
├── preload.ts              # Preload script (bridge between main and renderer)
├── windows/                # Window management
│   ├── mainWindow.ts       # Main window creation and management
│   └── types.ts            # Window type definitions
├── ipc/                    # IPC handlers
│   ├── handlers.ts         # IPC handler definitions
│   ├── directory.ts        # Directory selection and scanning handlers
│   ├── photos.ts           # Photo processing handlers
│   ├── metadata.ts         # EXIF metadata extraction handlers
│   ├── thumbnails.ts       # Thumbnail generation handlers
│   └── map.ts              # Map-related handlers (if needed)
├── services/               # Background services
│   ├── directoryScanner.ts # Directory scanning service
│   ├── photoProcessor.ts   # Photo processing service
│   ├── exifExtractor.ts    # EXIF data extraction service
│   ├── thumbnailGenerator.ts # Thumbnail generation service (Sharp)
│   └── cacheManager.ts    # Thumbnail cache management
├── utils/                  # Utility functions
│   ├── fileSystem.ts       # File system utilities
│   ├── imageUtils.ts       # Image processing utilities
│   └── logger.ts           # Logging utilities
└── types/                  # TypeScript type definitions
    ├── photo.ts            # Photo data types
    ├── metadata.ts         # Metadata types
    └── ipc.ts              # IPC message types
```

### `/src/renderer/` - React Renderer Process (UI)

The renderer process handles the user interface and interactions.

```
src/renderer/
├── index.html              # HTML entry point
├── main.tsx               # React entry point
├── App.tsx                 # Root App component
├── components/             # React components
│   ├── ui/                 # Reusable UI primitives
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Tooltip.tsx
│   │   └── index.ts        # Barrel exports
│   ├── layout/             # Layout components
│   │   ├── Toolbar.tsx
│   │   ├── StatusBar.tsx
│   │   └── Sidebar.tsx
│   ├── gallery/            # Gallery view components
│   │   ├── PhotoGrid.tsx
│   │   ├── PhotoCard.tsx
│   │   ├── PhotoGroup.tsx
│   │   └── EmptyState.tsx
│   ├── detail/             # Photo detail view components
│   │   ├── PhotoViewer.tsx
│   │   ├── MetadataPanel.tsx
│   │   └── NavigationControls.tsx
│   ├── map/                # Map view components
│   │   ├── MapView.tsx
│   │   ├── PhotoMarker.tsx
│   │   ├── ClusterMarker.tsx
│   │   └── MapPopup.tsx
│   ├── filters/            # Filter and search components
│   │   ├── FilterPanel.tsx
│   │   ├── SearchBar.tsx
│   │   └── DateRangePicker.tsx
│   ├── settings/           # Settings components
│   │   ├── SettingsView.tsx
│   │   ├── DirectorySettings.tsx
│   │   └── AppearanceSettings.tsx
│   └── welcome/            # Welcome screen components
│       └── WelcomeScreen.tsx
├── views/                  # Page/View components
│   ├── GalleryView.tsx
│   ├── MapView.tsx
│   ├── DetailView.tsx
│   └── SettingsView.tsx
├── hooks/                  # React hooks
│   ├── usePhotos.ts
│   ├── useDirectory.ts
│   ├── useMetadata.ts
│   ├── useMap.ts
│   └── useKeyboard.ts
├── stores/                 # State management (Zustand)
│   ├── photoStore.ts
│   ├── directoryStore.ts
│   ├── uiStore.ts
│   └── filterStore.ts
├── services/               # Renderer-side services
│   ├── api.ts              # IPC API client
│   └── photoService.ts     # Photo-related services
├── utils/                  # Utility functions
│   ├── formatters.ts       # Date, location formatters
│   ├── validators.ts       # Validation utilities
│   └── constants.ts       # Constants and configuration
├── styles/                 # Styles and themes
│   ├── globals.css         # Global styles (Tailwind import)
│   ├── tokens.css          # CSS variables (design tokens)
│   └── themes/            # Theme definitions
│       ├── apple-glass.css # Apple Liquid Glass theme
│       └── dark.css        # Dark mode theme
└── types/                  # TypeScript type definitions
    ├── photo.ts
    ├── metadata.ts
    └── ui.ts
```

### `/src/shared/` - Shared Code

Code shared between main and renderer processes.

```
src/shared/
├── types/                  # Shared TypeScript types
│   ├── photo.ts
│   ├── metadata.ts
│   └── ipc.ts
├── constants/              # Shared constants
│   ├── fileTypes.ts
│   └── config.ts
└── utils/                  # Shared utilities
    ├── validators.ts
    └── formatters.ts
```

### `/public/` - Static Assets

Static assets served to the renderer process.

```
public/
├── icons/                  # App icons
│   ├── icon.ico           # Windows icon
│   ├── icon.icns          # macOS icon
│   └── icon.png           # Linux icon
└── assets/                # Static assets (if any)
    └── images/
```

### `/resources/` - App Resources

Build-time resources for Electron Builder.

```
resources/
├── icons/                  # App icons for packaging
│   ├── icon.ico
│   ├── icon.icns
│   └── icon.png
└── build/                  # Build resources
    ├── installer.nsh       # NSIS installer script (Windows)
    └── background.png     # DMG background (macOS)
```

### `/build/` - Build Configuration

Build configuration files and scripts.

```
build/
├── electron-builder.yml    # Electron Builder configuration
├── vite/                   # Vite configuration overrides
│   ├── main.config.ts
│   └── renderer.config.ts
└── scripts/                # Build scripts
    ├── build.js
    └── package.js
```

### `/Docs/` - Documentation

Project documentation.

```
Docs/
├── Implementation.md       # Implementation plan
├── project_structure.md   # This file
├── UI_UX_doc.md          # UI/UX design specifications
├── User_Flows.md         # User flow documentation
└── Bug_Reports/          # Bug tracking documentation
    ├── INDEX.md
    ├── QUICK_START.md
    └── [category]/       # Bug reports by category
```

## File Organization Patterns

### Component Organization

- **Atomic Design**: Components organized by complexity (ui → layout → features)
- **Co-location**: Related files (component, styles, tests) kept together
- **Barrel Exports**: Use `index.ts` files for clean imports

### Naming Conventions

- **Components**: PascalCase (`PhotoCard.tsx`)
- **Files**: PascalCase for components, camelCase for utilities (`photoUtils.ts`)
- **Folders**: camelCase for features, lowercase for utilities (`photoCard/`, `utils/`)
- **Types**: PascalCase with `Type` or `Interface` suffix (`PhotoType`, `PhotoInterface`)

### Import Patterns

- **Absolute imports**: Use path aliases for cleaner imports
  ```typescript
  import { PhotoCard } from '@/components/gallery/PhotoCard';
  ```
- **Relative imports**: Use for closely related files
  ```typescript
  import { PhotoGrid } from './PhotoGrid';
  ```

## Configuration Files

### `package.json`

- **Dependencies**: React, Electron, Vite, Tailwind, etc.
- **Scripts**: `dev`, `build`, `preview`, `pack`, `dist`
- **Metadata**: App name, version, description

### `electron.vite.config.ts`

- **Electron Vite**: Main and renderer entry points
- **Preload scripts**: Security bridge configuration
- **Build targets**: Platform-specific builds

### `vite.config.ts`

- **Vite configuration**: React plugin, path aliases
- **Build optimization**: Code splitting, tree shaking
- **Dev server**: HMR configuration

### `tsconfig.json`

- **TypeScript**: Main process configuration
- **Compiler options**: Strict mode, target, module
- **Path aliases**: Import path resolution

### `tsconfig.node.json`

- **Node.js types**: Main process Node.js types
- **ESM/CJS**: Module system configuration

### `tsconfig.web.json`

- **Web types**: Renderer process browser types
- **DOM types**: Browser API types

### `tailwind.config.ts`

- **Tailwind CSS**: Content paths, theme configuration
- **Design tokens**: Colors, spacing, typography
- **Plugins**: Custom utilities and components

### `postcss.config.js`

- **PostCSS**: Tailwind CSS v4 plugin configuration
- **CRITICAL**: Use `@tailwindcss/postcss` plugin (not `tailwindcss`)
- **Autoprefixer**: Browser compatibility

### `electron-builder.yml`

- **Electron Builder**: Cross-platform build configuration
- **Platforms**: Windows, macOS, Linux
- **Icons**: Platform-specific icon configuration
- **Auto-updater**: Update server configuration

## Module/Component Hierarchy

### Main Process (Node.js)

```
index.ts (Entry)
  ├── windows/mainWindow.ts (Window Management)
  ├── ipc/handlers.ts (IPC Handlers)
  │   ├── directory.ts (Directory Operations)
  │   ├── photos.ts (Photo Processing)
  │   ├── metadata.ts (EXIF Extraction)
  │   └── thumbnails.ts (Thumbnail Generation)
  └── services/
      ├── directoryScanner.ts (Directory Scanning)
      ├── photoProcessor.ts (Photo Processing)
      ├── exifExtractor.ts (EXIF Extraction)
      └── thumbnailGenerator.ts (Thumbnail Generation)
```

### Renderer Process (React)

```
App.tsx (Root)
  ├── views/
  │   ├── GalleryView.tsx
  │   ├── MapView.tsx
  │   ├── DetailView.tsx
  │   └── SettingsView.tsx
  ├── components/
  │   ├── ui/ (UI Primitives)
  │   ├── layout/ (Layout Components)
  │   ├── gallery/ (Gallery Components)
  │   ├── detail/ (Detail Components)
  │   ├── map/ (Map Components)
  │   └── filters/ (Filter Components)
  ├── stores/ (State Management)
  ├── hooks/ (React Hooks)
  └── services/ (API Services)
```

## Build and Deployment Structure

### Development Build

```
dist/
├── main/                   # Compiled main process
│   └── index.js
├── renderer/               # Compiled renderer process
│   ├── assets/
│   └── index.html
└── preload/                # Compiled preload scripts
    └── preload.js
```

### Production Build

```
dist/
├── win-unpacked/          # Windows unpacked app
├── mac/                    # macOS app bundle
├── linux-unpacked/        # Linux unpacked app
├── PhotoMap-Setup.exe      # Windows installer
├── PhotoMap.dmg            # macOS DMG
└── PhotoMap.AppImage       # Linux AppImage
```

## Environment-Specific Configurations

### Development

- **Hot Reload**: Vite HMR for renderer, nodemon for main
- **Dev Tools**: Electron DevTools enabled
- **Source Maps**: Full source maps for debugging
- **Logging**: Verbose logging enabled

### Production

- **Optimization**: Code minification, tree shaking
- **Source Maps**: Optional (for error reporting)
- **Logging**: Minimal logging
- **Security**: CSP headers, context isolation

### Platform-Specific

- **Windows**: NSIS installer, auto-updater, code signing
- **macOS**: DMG distribution, notarization, code signing
- **Linux**: AppImage, DEB packages, auto-updater

## Asset Organization

### Images

- **Icons**: Platform-specific icons in `/resources/icons/`
- **App Icons**: Generated from source icons
- **Assets**: Static images in `/public/assets/`

### Styles

- **Global Styles**: `/src/renderer/styles/globals.css`
- **Design Tokens**: `/src/renderer/styles/tokens.css`
- **Themes**: `/src/renderer/styles/themes/`

### Fonts

- **System Fonts**: Use system font stack (Inter, SF Pro)
- **Custom Fonts**: Place in `/public/fonts/` if needed

## Documentation Placement

- **Implementation Plan**: `/Docs/Implementation.md`
- **Project Structure**: `/Docs/project_structure.md`
- **UI/UX Design**: `/Docs/UI_UX_doc.md`
- **User Flows**: `/Docs/User_Flows.md`
- **Bug Reports**: `/Docs/Bug_Reports/`

## Notes

- **Separation of Concerns**: Clear separation between main and renderer processes
- **Type Safety**: Shared types between main and renderer in `/src/shared/types/`
- **Security**: IPC communication through preload scripts (context isolation)
- **Performance**: Lazy loading for large photo collections, virtual scrolling
- **Accessibility**: WCAG 2.1 AA compliance, keyboard navigation, screen reader support
- **Cross-Platform**: Platform-specific code in platform-specific files or conditionals
