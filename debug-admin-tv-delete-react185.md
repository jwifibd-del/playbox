# DEBUG: Admin TV Channel Delete → React #185

## Session
- **sessionId**: `admin-tv-delete-react185`
- **Status**: `[OPEN]`
- **Opened**: 2026-07-28
- **Symptom**: Minified React error #185 ("Rendered more/fewer hooks than expected") fires when user clicks Delete on a TV Channel card in Admin panel. User reports the previous key/double-render fixes did NOT resolve it.
- **Stack trace user provided**: `Array.map → Array.map → hooks mismatch (Ce/Gc/ac in react-dom.production)`
- **Trigger**: Admin panel → TV Channels tab → click Delete button on a card → confirm → error thrown on the next render.

---

## 5 Falsifiable Hypotheses

### H1: Hooks inside conditional tab block (HIGH LIKELIHOOD)
The Admin main page has a massive conditional tab switch (e.g. `{activeTab === 'tv-channels' && (...)}`). The TV Channels section declares **React hooks (useMemo/useState/useEffect/useCallback OR framer-motion useMotionValue)** DIRECTLY INSIDE the conditional render block — not at the top of AdminPage function. So when you first land on other tabs, those hooks never run (fewer hooks). Then the TV Channels delete fires a state update and React sees "more hooks" than last render → invariant 185. Pattern: `.map` calls inside `{activeTab === ...}` which create components that run conditionally-hooked subtrees.

### H2: Nested inlined function components INSIDE render that use hooks
AdminPage has inline `const XxxCard = ({...}) => { const [...] = useState() }` DECLARED INSIDE a section of AdminPage that conditionally renders, or inside a .map callback that gets invoked conditionally. Each render, React sees these as "different" component types, so hooks don't match → 185. AdminTvChannelCard was already found at line 1077 — but is IT declared inside a conditional function body?

### H3: Filter/search state changes on TV channels list cause conditional hook short-circuits
The `filteredTvChannels` list uses a `.filter()` and then `.map()`. If the filter logic does something like:
```
filteredList.map((ch, i) => {
  if (i >= firstVisible) return <Card ... />  // Card uses hooks
  return null;  // <——— short-circuits, hooks never called for filtered-out
})
```
then changing filter/search + delete causes different hook counts.

### H4: Layout animation + reorder creating reconciliation mismatches
AdminTvChannelCard has `motion.div` with `layout` attribute. On delete, re-order plus animation + state updates on same tick cause React to see one version of framer-motion internal hooks count during render vs commit → #185.

### H5: `confirm()` synchronous call inside event handler + `React.StrictMode` double-invoke
`confirm()` blocks the event handler mid-flight. In StrictMode dev builds, React double-invokes state updater functions. If state updaters reference `confirm`'d return or mutate the same Set twice, you get N vs 2N state updates → misaligned hook lifecycles.

---

## Test Matrix
| Step | Action | Expected | Purpose |
|------|--------|----------|---------|
| 1 | Instrument AdminPage around tab render boundary | Detect if TV Channels section has hooks in conditionals | H1/H2 |
| 2 | Check: is AdminTvChannelCard declared inside another function? | If yes → 185 guaranteed | H2 |
| 3 | Wrap delete state updaters with "defensive single setter" | Prevent double-apply strict-mode issues | H5 |
| 4 | Render keys: replace layout-animated wrappers with static keys | Eliminate motion reconciliation mismatches | H4 |
| 5 | Count hooks per render before/after delete | Spot the exact list index where hook count differs | All |

---

## Instrumentation Log Points (planned, not yet applied)
| ID | File:Line | Hook |
|----|-----------|------|
| P1 | admin/page.tsx AdminPage top | Log `activeTab`, render seq, hook count |
| P2 | admin/page.tsx TV Channels section top | Log `entering`, list length |
| P3 | Before setTvChannels setter in DELETE handler | Log prev list, new list, ids |
| P4 | AdminTvChannelCard (if applicable) | Log mount order by `ch.id` |

---

## Fixes Applied (none yet — evidence first)
_Reserved for confirmed-root-cause minimal patch._

---

## Verification Log (pre/post)
_Reserved for pre-fix vs post-fix comparison._
