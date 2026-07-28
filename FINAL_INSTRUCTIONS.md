
# FINAL INSTRUCTIONS

## Quick Steps to Apply All Changes

1. **Release File Locks**:
   - Close any editors/IDEs with lib/data.ts or app/admin/page.tsx open!
   - Pause OneDrive sync temporarily!

2. **Update lib/data.ts**:
   - Replace lines 1717-1741 with the code in modified_data.ts!
   - The changes are:
     a. In getUsers(), change the condition to `if (Array.isArray(parsed))` (remove `&& parsed.length > 0`)!
     b. Add the new `deleteUser(userId)` function after `saveUsers()`!

3. **Update app/admin/page.tsx**:
   a. Update the import from @/lib/data to include `deleteUser`!
   b. Update the AdminSidebar component completely with the code in modified_AdminSidebar.tsx!
   c. Add `isHeroTabActive` and `heroDropdownOpen` state in AdminSidebar!
   d. Update navItems in both AdminSidebar and the main page to use hero-group!
   e. Add the mobileHeroDropdownOpen state and update the mobile sidebar's logic!
   f. Add handleDeleteRegisteredUser() function!
   g. Add the render sections for default-hero, kids-hero, anime-hero!
   h. Add the Delete User button to each user in the Users tab!

## What's Changed

### ✨ Hero Banner Dropdown Menu
- Default Hero Banner
- Kids Hero Banners
- Anime Hero Banners

### 🗑️ Delete User Feature
- Delete button on user cards in Users tab
- Confirmation prompt before deleting
- Clears localStorage session if user deletes themselves

## All Files Created in Project Root
- `modified_data.ts`: The exact updated functions for data.ts
- `modified_AdminSidebar.tsx`: The fully updated AdminSidebar component
- `modified_main_admin_page.tsx`: All changes needed for the main page
- `PATCH_DATA_TS.txt`, `PATCH_ADMIN_PAGE_TSX.txt`: Patch diffs
- `HERO_BANNER_DROPDOWN_CHANGES.md`: Detailed step-by-step
