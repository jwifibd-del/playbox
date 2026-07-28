# Hero Banner Dropdown Menu Changes

These are the changes to implement the Hero Banner dropdown menu with Default Hero Banner, Kids Hero Banners, and Anime Hero Banners!

---

## Changes in `app/admin/page.tsx`

### 1. Update the `AdminSidebar` component (line ~152-334)

#### Add new state variables (after line 158):
```tsx
  const isHeroTabActive = ['default-hero', 'kids-hero', 'anime-hero'].includes(activeTab)
  const [heroDropdownOpen, setHeroDropdownOpen] = useState(isHeroTabActive)
```

#### Replace the single `herobanner` nav item (originally line ~196) with this dropdown group:
```tsx
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
```

#### Update the `useEffect` (line ~211) to include heroDropdownOpen:
```tsx
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
    if (isHeroTabActive) { // New!
      setHeroDropdownOpen(true)
    }
  }, [isHomeTabActive, isSliderTabActive, isImportTabActive, isHeroTabActive]) // Added isHeroTabActive!
```

#### Update the dropdownOpen/setDropdownOpen logic (line ~235) to check for hero-group:
```tsx
          if (item.subItems) {
            const isAnySubItemActive = item.subItems.some((sub: any) => activeTab === sub.id)
            const isHomeGroup = item.id === 'home-group'
            const isSliderGroup = item.id === 'sliders-group'
            const isHeroGroup = item.id === 'hero-group' // New!
            const dropdownOpen = isHomeGroup
              ? homeDropdownOpen
              : isSliderGroup
                ? sliderDropdownOpen
                : isHeroGroup // New!
                  ? heroDropdownOpen
                  : importDropdownOpen
            const setDropdownOpen = isHomeGroup
              ? setHomeDropdownOpen
              : isSliderGroup
                ? setSliderDropdownOpen
                : isHeroGroup // New!
                  ? setHeroDropdownOpen
                  : setImportDropdownOpen
```

---

### 2. Update the main page's mobile sidebar and navItems

#### Add `mobileHeroDropdownOpen` state (after line ~2748):
```tsx
  const [mobileHomeDropdownOpen, setMobileHomeDropdownOpen] = useState(false)
  const [mobileSliderDropdownOpen, setMobileSliderDropdownOpen] = useState(false)
  const [mobileImportDropdownOpen, setMobileImportDropdownOpen] = useState(false)
  const [mobileHeroDropdownOpen, setMobileHeroDropdownOpen] = useState(false) // New!
```

#### Update the navItems in the main page to also use the hero-group dropdown (same as in AdminSidebar!)

#### Update the mobile dropdown's logic just like in AdminSidebar (to use mobileHeroDropdownOpen!)

---

### 3. Add render sections for the new tabs!
After the existing `activeTab === 'herobanner'` block, add these:
```tsx
            {activeTab === 'default-hero' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-white">Default Hero Banner</h2>
                    <p className="text-zinc-500 mt-1">Manage the main hero banner</p>
                  </div>
                  <button 
                    onClick={() => handleAddHeroBanner()}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Hero Banner
                  </button>
                </div>

                {heroBanners.length === 0 && (
                  <div className="text-center py-16 bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl">
                    <Image className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Hero Banners Yet</h3>
                    <p className="text-zinc-500">Add your first hero banner to get started</p>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {heroBanners.map((banner, index) => (
                    <div 
                      key={index} 
                      className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6"
                    >
                      <img 
                        src={banner.image} 
                        alt={banner.title} 
                        className="w-full aspect-video object-cover rounded-xl mb-4"
                      />
                      <h3 className="text-xl font-semibold text-white mb-2">{banner.title}</h3>
                      <p className="text-zinc-400 mb-4">{banner.description}</p>
                      <div className="flex gap-3">
                        <button 
                          onClick={() => handleEditHeroBanner(index)}
                          className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-xl transition-colors"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteHeroBanner(index)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'kids-hero' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-white">Kids Hero Banners</h2>
                    <p className="text-zinc-500 mt-1">Manage kids-specific hero banners</p>
                  </div>
                  <button 
                    onClick={() => handleAddKidsHeroBanner()}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Kids Hero Banner
                  </button>
                </div>

                {kidsHeroBanners.length === 0 && (
                  <div className="text-center py-16 bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl">
                    <Smile className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Kids Hero Banners Yet</h3>
                    <p className="text-zinc-500">Add your first kids hero banner to get started</p>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {kidsHeroBanners.map((banner, index) => (
                    <div 
                      key={index} 
                      className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6"
                    >
                      <img 
                        src={banner.image} 
                        alt={banner.title} 
                        className="w-full aspect-video object-cover rounded-xl mb-4"
                      />
                      <h3 className="text-xl font-semibold text-white mb-2">{banner.title}</h3>
                      <p className="text-zinc-400 mb-4">{banner.description}</p>
                      <div className="flex gap-3">
                        <button 
                          onClick={() => handleEditKidsHeroBanner(index)}
                          className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-xl transition-colors"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteKidsHeroBanner(index)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'anime-hero' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-white">Anime Hero Banners</h2>
                    <p className="text-zinc-500 mt-1">Manage anime-specific hero banners</p>
                  </div>
                  <button 
                    onClick={() => handleAddAnimeHeroBanner()}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Anime Hero Banner
                  </button>
                </div>

                {animeHeroBanners.length === 0 && (
                  <div className="text-center py-16 bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl">
                    <Sparkles className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Anime Hero Banners Yet</h3>
                    <p className="text-zinc-500">Add your first anime hero banner to get started</p>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {animeHeroBanners.map((banner, index) => (
                    <div 
                      key={index} 
                      className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6"
                    >
                      <img 
                        src={banner.image} 
                        alt={banner.title} 
                        className="w-full aspect-video object-cover rounded-xl mb-4"
                      />
                      <h3 className="text-xl font-semibold text-white mb-2">{banner.title}</h3>
                      <p className="text-zinc-400 mb-4">{banner.description}</p>
                      <div className="flex gap-3">
                        <button 
                          onClick={() => handleEditAnimeHeroBanner(index)}
                          className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-xl transition-colors"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteAnimeHeroBanner(index)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
```
