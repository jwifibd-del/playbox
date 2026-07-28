cd "c:\Users\jwifi\OneDrive\Desktop\Upload\PlayFlix\playbox\app\admin"

# Read the original file
$content = Get-Content page.tsx -Raw

# Step 1: Add deleteUser to the imports from @/lib/data
# Find the import line with getUsers, AppUser, etc.
$importPattern = [regex]::new('(import\s*\{[^}]*getUsers[^}]*\}\s*from\s*''@/lib/data'')', [System.Text.RegularExpressions.RegexOptions]::Singleline)
$importMatch = $importPattern.Match($content)
if ($importMatch.Success) {
    $newImport = $importMatch.Groups[1].Value -replace 'getUsers', 'getUsers, deleteUser'
    $content = $importPattern.Replace($content, $newImport)
    Write-Host "✅ Added deleteUser to imports"
}

# Step 2: Update AdminSidebar state: add isHeroTabActive and heroDropdownOpen
$sidebarStatePattern = [regex]::new('(const\s+isImportTabActive\s*=\s*\[[^]]+\]\.includes\(activeTab\)\s*\n\s*const\s+\[importDropdownOpen,\s*setImportDropdownOpen\]\s*=\s*useState\(isImportTabActive\))', [System.Text.RegularExpressions.RegexOptions]::Singleline)
$newSidebarState = @"
const isImportTabActive = ['import-movies', 'import-tv', 'import-livetv'].includes(activeTab)
  const [importDropdownOpen, setImportDropdownOpen] = useState(isImportTabActive)
  const isHeroTabActive = ['default-hero', 'kids-hero', 'anime-hero'].includes(activeTab)
  const [heroDropdownOpen, setHeroDropdownOpen] = useState(isHeroTabActive)
"@
$content = $sidebarStatePattern.Replace($content, $newSidebarState)
Write-Host "✅ Added hero state to AdminSidebar"

# Step 3: Replace the "herobanner" nav item with the hero group
$heroItemPattern = [regex]::new('\{\s*id\s*:\s*''herobanner''\s*,\s*label\s*:\s*''Hero Banner''\s*,\s*icon\s*:\s*Image\s*\}\s*,', [System.Text.RegularExpressions.RegexOptions]::Singleline)
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
$content = $heroItemPattern.Replace($content, $newHeroGroup)
Write-Host "✅ Replaced herobanner nav item with hero group"

# Step 4: Update AdminSidebar useEffect
$sidebarEffectPattern = [regex]::new('(useEffect\s*\(\s*\(\s*\)\s*=>\s*\{[^}]*isImportTabActive[^}]*\}\s*,\s*\[\s*isHomeTabActive\s*,\s*isSliderTabActive\s*,\s*isImportTabActive\s*\])', [System.Text.RegularExpressions.RegexOptions]::Singleline)
$newSidebarEffect = @"
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
$content = $sidebarEffectPattern.Replace($content, $newSidebarEffect)
Write-Host "✅ Updated AdminSidebar useEffect"

# Step 5: Update AdminSidebar dropdown logic
$dropdownLogicPattern = [regex]::new('(const\s+isHomeGroup\s*=\s*item\.id\s*===\s*''home-group''\s*\n\s*const\s+isSliderGroup\s*=\s*item\.id\s*===\s*''sliders-group''\s*\n\s*const\s+dropdownOpen\s*=\s*isHomeGroup[^}]*importDropdownOpen\s*\n\s*const\s+setDropdownOpen\s*=\s*isHomeGroup[^}]*setImportDropdownOpen)', [System.Text.RegularExpressions.RegexOptions]::Singleline)
$newDropdownLogic = @"
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
$content = $dropdownLogicPattern.Replace($content, $newDropdownLogic)
Write-Host "✅ Updated AdminSidebar dropdown logic"

# Step 6: Add the handleDeleteRegisteredUser function
# Find the right place (after showToast or another handler)
# For now, let's add it after a common handler, like handleSaveGeneralSettings
# Alternatively, add it after the import section
# Let's use a flexible approach
$handlerToFind = "const showToast = (message, type) => {"
if ($content.Contains($handlerToFind)) {
    $deleteUserHandler = @"

const handleDeleteRegisteredUser = (userId, userName) => {
  const shouldDelete = window.confirm(\`Delete \${userName} from registered users?\`)

  if (!shouldDelete) return
  deleteUser(userId)
  setRegisteredUsers(getUsers())
  showToast('User deleted successfully!', 'success')
}
"@
    $content = $content -replace [regex]::Escape($handlerToFind), ($handlerToFind + $deleteUserHandler)
    Write-Host "✅ Added handleDeleteRegisteredUser function"
}

# Write the modified content to page.tsx.new
Set-Content page.tsx.new -Value $content -NoNewline -Encoding UTF8
Write-Host "✅ Wrote modified content to page.tsx.new"

# Now replace page.tsx with page.tsx.new
Rename-Item -Path page.tsx -NewName page.tsx.old
Rename-Item -Path page.tsx.new -NewName page.tsx
Write-Host "🎉 Successfully updated app/admin/page.tsx!"
