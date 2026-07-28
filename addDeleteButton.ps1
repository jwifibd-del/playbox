cd "c:\Users\jwifi\OneDrive\Desktop\Upload\PlayFlix\playbox\app\admin"
$content = Get-Content page.tsx -Raw
# The part we want to replace is the end of the user card div, with exact whitespace
$userCardEnd = @"
                        </div>
                      </div>
                    </div>
"@
$userCardEndWithButton = @"
                        </div>
                      </div>
                      <div className="mt-5 flex justify-end">
                        <button
                          onClick={() => handleDeleteRegisteredUser(user.id, user.fullName)}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete User
                        </button>
                      </div>
                    </div>
"@
$content = $content -replace [regex]::Escape($userCardEnd), $userCardEndWithButton
Set-Content page.tsx.new -Value $content -NoNewline -Encoding UTF8
Rename-Item -Path page.tsx -NewName page.tsx.old3
Rename-Item -Path page.tsx.new -NewName page.tsx
Write-Host "✅ Added delete button to user cards!"
