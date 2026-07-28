const fs = require('fs');
const path = require('path');

// Paths to files
const dataTsPath = path.join(__dirname, 'lib', 'data.ts');
const adminPageTsxPath = path.join(__dirname, 'app', 'admin', 'page.tsx');

// Step 1: Update lib/data.ts
let dataTsContent = fs.readFileSync(dataTsPath, 'utf8');

// Replace "if (Array.isArray(parsed) && parsed.length > 0)" with "if (Array.isArray(parsed))"
// Use a regex that ignores whitespace
dataTsContent = dataTsContent.replace(
  /if\s*\(\s*Array\.isArray\s*\(\s*parsed\s*\)\s*&&\s*parsed\.length\s*>\s*0\s*\)/,
  'if (Array.isArray(parsed))'
);

// Add deleteUser function after saveUsers
// Use flexible regex for saveUsers
const saveUsersRegex = /(export\s+function\s+saveUsers\s*\(\s*users:\s*AppUser\[\]\s*\)\s*:\s*void\s*\{[\s\S]*?\})/;
const deleteUserFunction = `

export function deleteUser(userId: string | number): void {
  if (typeof window === 'undefined') {
    return;
  }

  const currentUserId = getCurrentUserId();
  const updatedUsers = getUsers().filter((user) => String(user.id) !== String(userId));

  saveUsers(updatedUsers);

  if (currentUserId && String(currentUserId) === String(userId)) {
    localStorage.removeItem(USER_AUTH_STORAGE_KEY);
    localStorage.removeItem(USER_SESSION_STORAGE_KEY);
    localStorage.removeItem('playflix_token');
    localStorage.removeItem('playflix_user');
  }
}
`;
const saveUsersMatch = dataTsContent.match(saveUsersRegex);
if (saveUsersMatch) {
  dataTsContent = dataTsContent.replace(saveUsersMatch[0], saveUsersMatch[0] + deleteUserFunction);
} else {
  console.error('❌ Could not find saveUsers function!');
}

// Write back to lib/data.ts
fs.writeFileSync(dataTsPath, dataTsContent, 'utf8');

// Step 2: Update app/admin/page.tsx
let adminPageTsxContent = fs.readFileSync(adminPageTsxPath, 'utf8');

// First, add deleteUser to the import from @/lib/data
const importRegex = /import \{([^}]+)\} from '@\/lib\/data'/;
const importMatch = adminPageTsxContent.match(importRegex);
if (importMatch) {
  let importContent = importMatch[1];
  if (!importContent.includes('deleteUser')) {
    importContent = importContent.replace('getUsers', 'getUsers, deleteUser');
    adminPageTsxContent = adminPageTsxContent.replace(importRegex, `import {${importContent}} from '@/lib/data'`);
  }
}

// Next, add isHeroTabActive and heroDropdownOpen to AdminSidebar
const adminSidebarStateRegex = /(const isImportTabActive = \['import-movies', 'import-tv', 'import-livetv'\]\.includes\(activeTab\)\s+const \[importDropdownOpen, setImportDropdownOpen\] = useState\(isImportTabActive\))/s;
const adminSidebarNewState = `const isImportTabActive = ['import-movies', 'import-tv', 'import-livetv'].includes(activeTab)
  const [importDropdownOpen, setImportDropdownOpen] = useState(isImportTabActive)
  const isHeroTabActive = ['default-hero', 'kids-hero', 'anime-hero'].includes(activeTab)
  const [heroDropdownOpen, setHeroDropdownOpen] = useState(isHeroTabActive)`;
adminPageTsxContent = adminPageTsxContent.replace(adminSidebarStateRegex, adminSidebarNewState);

// Replace the "herobanner" nav item with hero-group
const herobannerItemRegex = /\{ id: 'herobanner', label: 'Hero Banner', icon: Image \},/s;
const heroGroupItem = `{ 
      id: 'hero-group', 
      label: 'Hero Banner', 
      icon: Image,
      subItems: [
        { id: 'default-hero', label: 'Default Hero Banner', icon: Image },
        { id: 'kids-hero', label: 'Kids Hero Banners', icon: Smile },
        { id: 'anime-hero', label: 'Anime Hero Banners', icon: Sparkles },
      ]
    },`;
adminPageTsxContent = adminPageTsxContent.replace(herobannerItemRegex, heroGroupItem);

// Update the useEffect in AdminSidebar to include isHeroTabActive
const adminSidebarEffectRegex = /(useEffect\(\(\) => \{\s+if \(isHomeTabActive\) \{\s+setHomeDropdownOpen\(true\)\s+}\s+if \(isSliderTabActive\) \{\s+setSliderDropdownOpen\(true\)\s+}\s+if \(isImportTabActive\) \{\s+setImportDropdownOpen\(true\)\s+}\s+\}, \[isHomeTabActive, isSliderTabActive, isImportTabActive\]\))/s;
const adminSidebarNewEffect = `useEffect(() => {
    if (isHomeTabActive) {
      setHomeDropdownOpen(true)
    }
    if (isSliderTabActive) {
      setSliderDropdownOpen(true)
    }
    if (isImportTabActive) {
      setImportDropdownOpen(true)
    }
    if (isHeroTabActive) {
      setHeroDropdownOpen(true)
    }
  }, [isHomeTabActive, isSliderTabActive, isImportTabActive, isHeroTabActive])`;
adminPageTsxContent = adminPageTsxContent.replace(adminSidebarEffectRegex, adminSidebarNewEffect);

// Update the dropdown logic in AdminSidebar
const dropdownLogicRegex = /(const isHomeGroup = item\.id === 'home-group'\s+const isSliderGroup = item\.id === 'sliders-group'\s+const dropdownOpen = isHomeGroup\s+\? homeDropdownOpen\s+\: isSliderGroup\s+\? sliderDropdownOpen\s+\: importDropdownOpen\s+const setDropdownOpen = isHomeGroup\s+\? setHomeDropdownOpen\s+\: isSliderGroup\s+\? setSliderDropdownOpen\s+\: setImportDropdownOpen)/s;
const newDropdownLogic = `const isHomeGroup = item.id === 'home-group'
            const isSliderGroup = item.id === 'sliders-group'
            const isHeroGroup = item.id === 'hero-group'
            const dropdownOpen = isHomeGroup
              ? homeDropdownOpen
              : isSliderGroup
                ? sliderDropdownOpen
                : isHeroGroup
                  ? heroDropdownOpen
                  : importDropdownOpen
            const setDropdownOpen = isHomeGroup
              ? setHomeDropdownOpen
              : isSliderGroup
                ? setSliderDropdownOpen
                : isHeroGroup
                  ? setHeroDropdownOpen
                  : setImportDropdownOpen`;
adminPageTsxContent = adminPageTsxContent.replace(dropdownLogicRegex, newDropdownLogic);

// TODO: Add more updates for mobile sidebar, handleDeleteRegisteredUser, and hero tab rendering
// For now, let's write back the changes we have
fs.writeFileSync(adminPageTsxPath, adminPageTsxContent, 'utf8');
