cd "c:\Users\jwifi\OneDrive\Desktop\Upload\PlayFlix\playbox\app\admin"
$content = Get-Content page.tsx -Raw
# Use a flexible regex that matches any whitespace between the closing divs
$pattern = [regex]::new('(\s+</div>\s+</div>\s+</div>\s+\)\s*\))', [System.Text.RegularExpressions.RegexOptions]::Singleline)
# Wait no, better to target the specific part after the gender div
# Let's use a pattern that looks for the gender div, then the closing divs
$betterPattern = [regex]::new('(<div className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3">\s*<p className="text-zinc-500 text-xs uppercase tracking-\[0\.18em\] mb-1">Gender</p>\s*<p className="text-white font-medium capitalize">\{user\.gender\}</p>\s*</div>\s*</div>\s*</div>)', [System.Text.RegularExpressions.RegexOptions]::Singleline)
# Let's test with a simpler approach: find the last </div> before the map closing
# Let's just insert the delete button right after line 10848 (the gender div's closing </div>)
# Alternatively, let's use a more flexible pattern that matches the end of the user card
# Let's match from "Gender" div to the end of the user card
$flexiblePattern = [regex]::new('(<div className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3">\s*<p className="text-zinc-500 text-xs uppercase tracking-\[0\.18em\] mb-1">Gender</p>\s*<p className="text-white font-medium capitalize">\{user\.gender\}</p>\s*</div>\s*</div>\s*</div>)', [System.Text.RegularExpressions.RegexOptions]::Singleline)
$replacement = @"
<div className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3">
                          <p className="text-zinc-500 text-xs uppercase tracking-[0.18em] mb-1">Gender</p>
                          <p className="text-white font-medium capitalize">{user.gender}</p>
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
# Wait let's use exact content we read from line 10835-10849
$exactExistingPart = @"
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 xl:min-w-[440px]">
                          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3">
                            <p className="text-zinc-500 text-xs uppercase tracking-[0.18em] mb-1">Join Date</p>
                            <p className="text-white font-medium">{user.joinDate}</p>
                          </div>
                          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3">
                            <p className="text-zinc-500 text-xs uppercase tracking-[0.18em] mb-1">Last Login</p>
                            <p className="text-white font-medium">{user.lastLogin}</p>
                          </div>
                          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3">
                            <p className="text-zinc-500 text-xs uppercase tracking-[0.18em] mb-1">Gender</p>
                            <p className="text-white font-medium capitalize">{user.gender}</p>
                          </div>
                        </div>
                      </div>
                    </div>
"@
$newPart = @"
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 xl:min-w-[440px]">
                          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3">
                            <p className="text-zinc-500 text-xs uppercase tracking-[0.18em] mb-1">Join Date</p>
                            <p className="text-white font-medium">{user.joinDate}</p>
                          </div>
                          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3">
                            <p className="text-zinc-500 text-xs uppercase tracking-[0.18em] mb-1">Last Login</p>
                            <p className="text-white font-medium">{user.lastLogin}</p>
                          </div>
                          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3">
                            <p className="text-zinc-500 text-xs uppercase tracking-[0.18em] mb-1">Gender</p>
                            <p className="text-white font-medium capitalize">{user.gender}</p>
                          </div>
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
$content = $content -replace [regex]::Escape($exactExistingPart), $newPart
Set-Content page.tsx.new -Value $content -NoNewline -Encoding UTF8
Rename-Item -Path page.tsx -NewName page.tsx.old4
Rename-Item -Path page.tsx.new -NewName page.tsx
Write-Host "✅ Added delete button to user cards!"
