cd "c:\Users\jwifi\OneDrive\Desktop\Upload\PlayFlix\playbox\app\admin"
$content = Get-Content page.tsx -Raw
$showToastDef = @"
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }
"@
$deleteHandler = @"

  const handleDeleteRegisteredUser = (userId: string | number, userName: string) => {
    const shouldDelete = window.confirm(`Delete ${userName} from registered users?`)

    if (!shouldDelete) return
    deleteUser(userId)
    setRegisteredUsers(getUsers())
    showToast('User deleted successfully!', 'success')
  }
"@
$content = $content -replace [regex]::Escape($showToastDef), ($showToastDef + $deleteHandler)
Set-Content page.tsx.new -Value $content -NoNewline -Encoding UTF8
Rename-Item -Path page.tsx -NewName page.tsx.old2
Rename-Item -Path page.tsx.new -NewName page.tsx
Write-Host "✅ Added handleDeleteRegisteredUser!"
