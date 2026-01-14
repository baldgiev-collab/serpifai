# 🏛️ ORACLE ELITE v23.0 - CLUSTER ARCHITECTURE BLUEPRINT

## 🎯 SYSTEM OVERHAUL: ZERO-TIMEOUT STRATEGY
The system is moving from a **Linear Sequential** model to a **Parallel Worker Cluster**.

### 1. Worker Thread Pattern (Anti-Timeout)
- **Engine:** `google.script.run.executeWorker(competitorDomain, jobToken)`
- **Logic:** - The UI iterates through the 6 competitors.
  - Fires 6 simultaneous server-side workers.
  - Each worker is responsible for its own: **Scrape -> API Enrich -> Gemini Analysis -> MySQL Save**.
  - Total time will equal the slowest single domain (~60s), not the sum of 6 (~360s).

### 2. Forensic Data Integrity
- **Gatekeeper:** No metric shall return "0" if Search Presence > 0.
- **Fallback:** If API fails, `ForensicMath.gs` must assert:
  - Traffic = (AuthScore * VisibilityFactor)
  - Backlinks = (OpenPageRank * log(DomainMass))
- **Validation:** Every Tab Intelligence module must have an `if (!data) return fallback;` block.

### 3. Payload Management
- **MySQL First:** Use the `job_results` table as the primary data exchange. Stop passing large JSON through `google.script.run`.
- **Chunking:** Large HTML scrapes must be cleaned (strip CSS/JS/SVG) before being sent to Gemini to stay within the 32k token efficient window.

### 4. Advanced UI Components
- **KW Mind Map:** Radial D3.js Tree grouping by [What/Why/How] and [Vs/Or/Like].
- **Real-time Hydration:** Bento-grids must "spin" individually and light up as their specific Worker finishes.

## 📝 URGENT TO-DO LIST
1. [ ] Create `executeWorker` server function.
2. [ ] Update UI analysis button to fire parallel worker calls.
3. [ ] Fix `ReferenceError` by globalizing `FT_fetchSingle`.
4. [ ] Implement `ForensicMath.gs` for assertive fallback metrics.
5. [ ] Integrate D3.js Radial Tree into the Keywords tab.