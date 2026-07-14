---
bug_id: BUG-009
title: macOS Metadata File EXIF Extraction Error
category: electron
severity: major
status: resolved
date: 2024-12-19
tech_stack: Electron, Node.js, exifr
context: Directory scanning, EXIF extraction
error_code: 'Error: Unknown file format'
related_files:
  - src/main/services/directoryScanner.ts
  - src/main/services/exifExtractor.ts
  - src/shared/constants/fileTypes.ts
tags:
  - macos
  - metadata-files
  - exif
  - file-filtering
related_bugs:
  - []
---

## Bug Description

When scanning directories containing photos from macOS, the app attempts to extract EXIF metadata from macOS resource fork/metadata files (files starting with `._`), resulting in "Unknown file format" errors.

### Error Message

```
Error extracting metadata from E:\Photos and Videos\Jogja\Les Renang Kai\._IMG_5172.HEIC: [Error: Unknown file format]
```

### Impact

- **User Experience:** Error messages appear in console during directory scanning
- **Performance:** Unnecessary processing of non-image files
- **Log Noise:** Error logs cluttered with metadata file errors

## Root Cause Analysis

**Primary Cause:** The directory scanner does not filter out macOS metadata files (resource forks) that start with `._`. These are hidden metadata files created by macOS to store additional file metadata, but they are not actual image files and cannot be processed by EXIF extraction libraries.

**Contributing Factors:**

1. macOS automatically creates `._` files when files are copied to non-HFS+ volumes (e.g., Windows, external drives)
2. The `isPhotoFile()` function checks file extensions but doesn't exclude macOS metadata files
3. The EXIF extractor attempts to process all files that pass the extension check, including these metadata files

**Why it wasn't caught earlier:**

- This only affects directories containing files copied from macOS
- The error is non-fatal and doesn't prevent the app from working
- Testing may not have included macOS-created files

## Steps to Reproduce

1. Copy photos from a macOS system to a Windows/external drive
2. Open PhotoMap and select the directory containing the photos
3. Observe console errors for files starting with `._`

**Expected Behavior:**

- macOS metadata files should be silently skipped
- No error messages for metadata files

**Actual Behavior:**

- EXIF extraction is attempted on `._` files
- "Unknown file format" errors appear in console

## Resolution

**Code Changes:**

1. **Updated `src/shared/constants/fileTypes.ts`** to add a helper function to detect macOS metadata files:

```typescript
/**
 * Checks if a filename is a macOS metadata/resource fork file
 * These files start with ._ and are not actual image files
 */
export const isMacOSMetadataFile = (filename: string): boolean => {
  return filename.startsWith('._');
};

/**
 * Checks if a file is a valid photo file (not a macOS metadata file)
 */
export const isPhotoFile = (filename: string): boolean => {
  // Skip macOS metadata files
  if (isMacOSMetadataFile(filename)) {
    return false;
  }

  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return PHOTO_EXTENSIONS.includes(ext);
};
```

2. **Updated `src/main/services/directoryScanner.ts`** to use the updated filter:

```typescript
// The scanner already uses isPhotoFile(), which now filters out macOS metadata files
// No changes needed if isPhotoFile() is updated
```

3. **Updated `src/main/services/exifExtractor.ts`** to add an additional safety check:

```typescript
export const extractPhotoMetadata = async (
  photoPath: string
): Promise<PhotoMetadata | null> => {
  try {
    // Skip macOS metadata files
    const filename = path.basename(photoPath);
    if (isMacOSMetadataFile(filename)) {
      return null;
    }

    // ... rest of the function
  } catch (error) {
    // Only log errors for actual photo files, not metadata files
    const filename = path.basename(photoPath);
    if (!isMacOSMetadataFile(filename)) {
      console.error(`Error extracting metadata from ${photoPath}:`, error);
    }
    return null;
  }
};
```

**Files Modified:**

- `src/shared/constants/fileTypes.ts` - Added macOS metadata file detection
- `src/main/services/exifExtractor.ts` - Added safety check and improved error logging

## Prevention Strategies

1. **Documentation Updates:**
   - Add note in setup checklist: "Directory scanner filters out macOS metadata files"
   - Document that `._` files are automatically skipped
   - Note that this is expected behavior for cross-platform compatibility

2. **Testing Checklist:**
   - Test with directories containing macOS-created files
   - Verify that `._` files are not processed
   - Verify no error messages appear for metadata files

3. **Code Review:**
   - Always filter out system/metadata files in file scanners
   - Consider hidden files (starting with `.`) when implementing file filters
   - Add platform-specific file filtering for cross-platform apps

## Additional Notes

- macOS metadata files are harmless but unnecessary for photo processing
- This fix improves cross-platform compatibility
- Similar filtering should be applied to other file operations (e.g., thumbnail generation)
