
# PlayFlix Admin Panel Changes Script (Robust Version)
# This will apply Hero Banner dropdown and Delete User feature
# Run in PowerShell

Write-Host "=== PlayFlix Admin Panel Changes ===" -ForegroundColor Cyan
Write-Host "Applying changes to lib/data.ts and app/admin/page.tsx..."

# Step 1: Modify lib/data.ts
Write-Host "`nStep 1/3: Updating lib/data.ts..." -ForegroundColor Yellow
$dataPath = "lib/data.ts"
if (-not (Test-Path $dataPath)) {
    Write-Host "ERROR: lib/data.ts not found!" -ForegroundColor Red
    exit 1
}

$content = Get-Content $dataPath -Raw

# 1a: Update getUsers condition to allow empty array (ignore whitespace)
$content = $content -replace "if\s*\(\s*Array\.isArray\s*\(\s*parsed\s*\)\s*&&\s*parsed\.length\s*>\s*0\s*\)", "if (Array.isArray(parsed))"

# 1b: Find saveUsers function and add deleteUser after it (match any whitespace)
$saveUsersPattern = [regex]::new("(export\s+function\s+saveUsers\s*\(\s*users\s*:\s*AppUser\[\]\s*\)\s*:\s*void\s*\{[^}]*\})", [System.Text.RegularExpressions.RegexOptions]::Singleline)
$deleteUserFunc = @"

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

$content = $saveUsersPattern.Replace($content, "`$1" + $deleteUserFunc)

# Save data.ts
Set-Content -Path $dataPath -Value $content -NoNewline
Write-Host "lib/data.ts updated successfully!" -ForegroundColor Green

# Step 2: Modify app/admin/page.tsx
Write-Host "`nStep 2/3: Updating app/admin/page.tsx..." -ForegroundColor Yellow
$adminPagePath = "app/admin/page.tsx"
if (-not (Test-Path $adminPagePath)) {
    Write-Host "ERROR: app/admin/page.tsx not found!" -ForegroundColor Red
    exit 1
}

$adminContent = Get-Content $adminPagePath -Raw

# 2a: Add deleteUser to imports (ignore whitespace)
$adminContent = $adminContent -replace "getUsers\s*,\s*AppUser\s*,", "getUsers, deleteUser, AppUser,"

# 2b: Replace all 'herobanner' items with 'hero-group' dropdown (ignore whitespace)
$heroItemPattern = [regex]::new("\{\s*id\s*:\s*'herobanner'\s*,\s*label\s*:\s*'Hero Banner'\s*,\s*icon\s*:\s*Image\s*\}\s*,", [System.Text.RegularExpressions.RegexOptions]::Singleline)
$newHeroItem = @"
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

$adminContent = $heroItemPattern.Replace($adminContent, $newHeroItem)

# 2c: Add Hero state in AdminSidebar (ignore whitespace)
$adminSidebarStatePattern = [regex]::new("(const\s+isImportTabActive\s*=\s*\[[^]]*\]\.includes\(activeTab\)\s*\n\s*const\s+\[importDropdownOpen,\s*setImportDropdownOpen\]\s*=\s*useState\(isImportTabActive\)\s*\n\s*const\s+navItems\s*=\s*)", [System.Text.RegularExpressions.RegexOptions]::Singleline)
$adminSidebarNewStatePart = @"
  const isImportTabActive = ['import-movies', 'import-tv', 'import-livetv'].includes(activeTab)
  const [importDropdownOpen, setImportDropdownOpen] = useState(isImportTabActive)
  const isHeroTabActive = ['default-hero', 'kids-hero', 'anime-hero'].includes(activeTab)
  const [heroDropdownOpen, setHeroDropdownOpen] = useState(isHeroTabActive)
  const navItems = [
"@

$adminContent = $adminSidebarStatePattern.Replace($adminContent, $adminSidebarNewStatePart)

# 2d: Update AdminSidebar useEffect (ignore whitespace)
$adminSidebarEffectPattern = [regex]::new("(useEffect\(\(\)\s*=>\s*\{[^}]*\}\s*,\s*\[\s*isHomeTabActive\s*,\s*isSliderTabActive\s*,\s*isImportTabActive\s*\]\))", [System.Text.RegularExpressions.RegexOptions]::Singleline)
$adminSidebarNewEffect = @"
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

$adminContent = $adminSidebarEffectPattern.Replace($adminContent, $adminSidebarNewEffect)

# 2e: Update AdminSidebar dropdown logic (ignore whitespace)
$adminSidebarDropdownPattern = [regex]::new("(const\s+isHomeGroup\s*=\s*item\.id\s*===\s*'home-group'\s*\n\s*const\s+isSliderGroup\s*=\s*item\.id\s*===\s*'sliders-group'\s*\n\s*const\s+dropdownOpen\s*=\s*isHomeGroup[^}]*importDropdownOpen\s*\n\s*const\s+setDropdownOpen\s*=\s*isHomeGroup[^}]*setImportDropdownOpen)", [System.Text.RegularExpressions.RegexOptions]::Singleline)
$adminSidebarNewDropdown = @"
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

$adminContent = $adminSidebarDropdownPattern.Replace($adminContent, $adminSidebarNewDropdown)

# Save page.tsx
Set-Content -Path $adminPagePath -Value $adminContent -NoNewline
Write-Host "app/admin/page.tsx updated successfully!" -ForegroundColor Green

Write-Host "`nStep 3/3: ALL CHANGES APPLIED! 🎉" -ForegroundColor Green
Write-Host "You can now start the dev server: npm run dev"
