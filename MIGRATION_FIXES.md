# Migration Fixes - Critical Issues Resolved

## Date: October 17, 2025

## Issues Identified and Fixed

### 1. **CRITICAL: Incorrect Filesystem Mount Prefix**

**Location:** `src/hooks/useOpenSCAD.ts:33`

**Issue:** The filesystem was being created with the wrong prefix:
```typescript
// WRONG - This was causing libraries to be mounted in the wrong location
const filesystem = await createEditorFS({ prefix: '/tmp', allowPersistence: false });

// CORRECT - Libraries must be mounted at /libraries/
const filesystem = await createEditorFS({ prefix: '/libraries/', allowPersistence: false });
```

**Impact:** This was preventing the OpenSCAD libraries from being accessible, causing the entire application to fail. The worker needs to find libraries at `/libraries/` for proper operation.

---

### 2. **Library Fetch Path Issue**

**Location:** `src/fs/filesystem.ts:28`

**Issue:** The library ZIP files were being fetched with an absolute path instead of a relative one:
```typescript
// WRONG - Absolute path may not work correctly in all environments
await fetchData(`/libraries/${n}.zip`)

// CORRECT - Relative path matching the reference implementation
await fetchData(`./libraries/${n}.zip`)
```

**Impact:** In some deployment scenarios, the absolute path could fail to resolve correctly. The relative path ensures compatibility across different hosting configurations.

---

### 3. **Missing Mobile Compatibility CSS**

**Location:** `src/hooks/useOpenSCAD.ts:34`

**Issue:** The custom CSS property for mobile viewport height was not being registered:
```typescript
// ADDED
registerCustomAppHeightCSSProperty();
```

**Impact:** On mobile devices (especially iOS Safari), the viewport height calculations were incorrect, causing layout issues. This function sets the `--app-height` CSS custom property that handles the dynamic viewport height on mobile browsers.

---

## Files Modified

1. `src/hooks/useOpenSCAD.ts`
   - Changed filesystem prefix from `/tmp` to `/libraries/`
   - Added `registerCustomAppHeightCSSProperty()` call
   - Added import for `registerCustomAppHeightCSSProperty`

2. `src/fs/filesystem.ts`
   - Changed library fetch path from `/libraries/` to `./libraries/`

---

## Testing

After these fixes:
- ✅ Build completes successfully
- ✅ No TypeScript errors
- ✅ No linter errors
- ⏳ Runtime testing in progress

---

## Key Takeaways

The main issue was that we had changed the filesystem prefix during migration without understanding its critical role in the application architecture. The reference implementation uses:

- **Main App:** `createEditorFS({ prefix: '/libraries/', ... })`
- **Worker:** `createEditorFS({ prefix: '', ... })`

This setup ensures that:
1. Libraries are mounted and accessible at `/libraries/<library-name>`
2. The worker can create symlinks properly
3. OpenSCAD can find and include library files during compilation

All code has been verified against the reference implementation (`openscad-playground-reference/`) to ensure completeness.

