
# FINAL PlayFlix Admin Changes Script
Write-Host "=== FINAL PlayFlix Admin Panel Changes ===" -ForegroundColor Cyan
Write-Host "Step 1/4: Read original files..." -ForegroundColor Yellow

# Read original data.ts
$dataPath = "lib/data.ts"
if (-not (Test-Path $dataPath)) {
    Write-Host "ERROR: lib/data.ts not found!" -ForegroundColor Red
    exit 1
}
$dataContent = [System.IO.File]::ReadAllText($dataPath, [System.Text.Encoding]::UTF8)

# Read original page.tsx
$adminPath = "app/admin/page.tsx"
if (-not (Test-Path $adminPath)) {
    Write-Host "ERROR: app/admin/page.tsx not found!" -ForegroundColor Red
    exit 1
}
$adminContent = [System.IO.File]::ReadAllText($adminPath, [System.Text.Encoding]::UTF8)

Write-Host "Step 2/4: Modify data.ts..." -ForegroundColor Yellow

# Modify data.ts: 1) remove "&& parsed.length >0"
$dataContent = $dataContent -replace "if\s*\(\s*Array\.isArray\s*\(\s*parsed\s*\)\s*&&\s*parsed\.length\s*>\s*0\s*\)", "if (Array.isArray(parsed))"

# Modify data.ts: add deleteUser after saveUsers
$saveUsersRegex = [regex]::new("(export\s+function\s+saveUsers\s*\([^)]*\)\s*:\s*void\s*\{[^\}]*\})", [System.Text.RegularExpressions.RegexOptions]::Singleline)
$deleteUserCode = @"

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
"@
$dataContent = $saveUsersRegex.Replace($dataContent, "`$1" + $deleteUserCode)

Write-Host "Step 3/4: Modify admin/page.tsx..." -ForegroundColor Yellow

# Modify page.tsx: add deleteUser to imports
$adminContent = $adminContent -replace "getUsers\s*,\s*AppUser\s*,", "getUsers, deleteUser, AppUser,"

# Modify page.tsx: replace all 'herobanner' items with hero-group
$heroItemRegex = [regex]::new("\{\s*id\s*:\s*'herobanner'\s*,\s*label\s*:\s*'Hero Banner'\s*,\s*icon\s*:\s*Image\s*\}\s*,", [System.Text.RegularExpressions.RegexOptions]::Singleline)
$newHeroGroup = @"
    { 
      id: 'hero-group', 
      label: 'Hero Banner', 
      icon: Image,
      subItems: [
        { id: 'default-hero', label: 'Default Hero Banner', icon: Image },
        { id: 'kids-hero', label: 'Kids Hero Banners', icon: Smile },
        { id: 'anime-hero', label: 'Anime Hero Banners', icon: Sparkles },
      ]
    },
"@
$adminContent = $heroItemRegex.Replace($adminContent, $newHeroGroup)

# Modify page.tsx: add hero state in both AdminSidebar and mobile
$addHeroState = @"
  const isImportTabActive = ['import-movies', 'import-tv', 'import-livetv'].includes(activeTab)
  const [importDropdownOpen, setImportDropdownOpen] = useState(isImportTabActive)
  const isHeroTabActive = ['default-hero', 'kids-hero', 'anime-hero'].includes(activeTab)
  const [heroDropdownOpen, setHeroDropdownOpen] = useState(isHeroTabActive)
  const navItems = [
"@
$heroStateRegex = [regex]::new("const\s+isImportTabActive\s*=\s*\[[^]]*\]\.includes\(activeTab\)\s*\n\s*const\s+\[importDropdownOpen,\s*setImportDropdownOpen\]\s*=\s*useState\(isImportTabActive\)\s*\n\s*const\s+navItems\s*=", [System.Text.RegularExpressions.RegexOptions]::Singleline)
$adminContent = $heroStateRegex.Replace($adminContent, $addHeroState)

# Modify page.tsx: add to useEffects
$addHeroEffect = @"
  useEffect(() => {
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
  }, [isHomeTabActive, isSliderTabActive, isImportTabActive, isHeroTabActive])
"@
$effectRegex = [regex]::new("useEffect\(\(\)\s*=>\s*\{[^}]*\}\s*,\s*\[\s*isHomeTabActive\s*,\s*isSliderTabActive\s*,\s*isImportTabActive\s*\]\)", [System.Text.RegularExpressions.RegexOptions]::Singleline)
$adminContent = $effectRegex.Replace($adminContent, $addHeroEffect)

# Modify page.tsx: add hero dropdown logic
$addHeroDropdown = @"
            const isHomeGroup = item.id === 'home-group'
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
                  : setImportDropdownOpen
"@
$dropdownRegex = [regex]::new("const\s+isHomeGroup\s*=\s*item\.id\s*===\s*'home-group'\s*\n\s*const\s+isSliderGroup\s*=\s*item\.id\s*===\s*'sliders-group'\s*\n\s*const\s+dropdownOpen\s*=\s*isHomeGroup[^}]*importDropdownOpen\s*\n\s*const\s+setDropdownOpen\s*=\s*isHomeGroup[^}]*setImportDropdownOpen", [System.Text.RegularExpressions.RegexOptions]::Singleline)
$adminContent = $dropdownRegex.Replace($adminContent, $addHeroDropdown)

Write-Host "Step 4/4: Save files..." -ForegroundColor Yellow

# Save modified files to root
[System.IO.File]::WriteAllText("modified_data.ts", $dataContent, [System.Text.Encoding]::UTF8)
[System.IO.File]::WriteAllText("modified_admin_page.tsx", $adminContent, [System.Text.Encoding]::UTF8)

# Replace original files
Move-Item -Path "lib/data.ts" -Destination "lib/data.ts.backup" -Force
Move-Item -Path "modified_data.ts" -Destination "lib/data.ts" -Force

Move-Item -Path "app/admin/page.tsx" -Destination "app/admin/page.tsx.backup" -Force
Move-Item -Path "modified_admin_page.tsx" -Destination "app/admin/page.tsx" -Force

Write-Host "`n🎉 SUCCESS! All changes applied!" -ForegroundColor Green
Write-Host "Backups saved as lib/data.ts.backup and app/admin/page.tsx.backup" -ForegroundColor Cyan
