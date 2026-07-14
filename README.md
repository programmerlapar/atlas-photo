# PhotoMap

A beautiful photo gallery app with map integration, inspired by iOS Photos.

## Features

- 🖼️ iOS Photos-style gallery interface
- 🗺️ Interactive map showing photo locations
- 📍 Automatic GPS extraction from EXIF data
- 🔒 100% local, privacy-first
- 🖥️ Cross-platform (Windows, macOS, Linux)

## Development

### Prerequisites

- Node.js 18+
- Yarn

### Setup

1. Install dependencies:

```bash
yarn install
```

2. Start development server:

```bash
yarn electron:dev
```

### Build

Build for production:

```bash
yarn electron:build
```

## Tech Stack

- **Framework**: Electron + React 18
- **Build Tool**: Vite
- **UI**: Tailwind CSS v4
- **Icons**: lucide-react
- **Map**: Leaflet
- **EXIF**: exifr
- **Image Processing**: Sharp

## License

MIT
