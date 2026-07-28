import os

# Paths to files
data_ts_path = os.path.join(os.path.dirname(__file__), 'lib', 'data.ts')
admin_page_tsx_path = os.path.join(os.path.dirname(__file__), 'app', 'admin', 'page.tsx')

print("Starting to apply changes...")

# Step 1: Update lib/data.ts
with open(data_ts_path, 'r', encoding='utf-8') as f:
    data_ts_content = f.read()

# Replace "if (Array.isArray(parsed) && parsed.length > 0)" with "if (Array.isArray(parsed))"
import re
data_ts_content = re.sub(
    r'if\s*\(\s*Array\.isArray\s*\(\s*parsed\s*\)\s*&&\s*parsed\.length\s*>\s*0\s*\)',
    'if (Array.isArray(parsed))',
    data_ts_content
)

# Add deleteUser function after saveUsers
save_users_match = re.search(
    r'(export\s+function\s+saveUsers\s*\(\s*users:\s*AppUser\[\]\s*\)\s*:\s*void\s*\{[\s\S]*?\})',
    data_ts_content
)
if save_users_match:
    delete_user_function = '''

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
'''
    data_ts_content = data_ts_content.replace(
        save_users_match.group(1),
        save_users_match.group(1) + delete_user_function
    )
    print("✅ Added deleteUser function to lib/data.ts")
else:
    print("❌ Could not find saveUsers function")

# Write back to lib/data.ts
with open(data_ts_path, 'w', encoding='utf-8') as f:
    f.write(data_ts_content)
print("✅ lib/data.ts updated successfully")

print("\nAll changes applied successfully!")
