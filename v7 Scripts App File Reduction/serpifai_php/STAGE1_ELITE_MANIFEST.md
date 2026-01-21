# 🏛️ ORACLE ELITE: 5-STAGE STRATEGIC WORKFLOW (v39.0)

## 🎯 SYSTEM GOAL
An end-to-end autonomous pipeline that transforms 30 market fields into a high-EEAT content asset, verified against live competitor forensics at every step.

## 🏗️ UI ARCHITECTURE: THE ACCORDION FIX
- **State Engine:** Only ONE stage can be active (expanded) at a time.
- **Logic:** Clicking Header(N) triggers:
  1. `collapse(CurrentStage)`
  2. `expand(TargetStage)`
  3. `checkLockStatus(TargetStage)` (Prevents Stage 3 from opening if Stage 2 data is missing).

## ⛓️ DATA INHERITANCE MAP (The 0.1% Chain)
1. **S1 (Strategy):** Pulls from MySQL `link_forensics`.
2. **S2 (Keyword):** Pulls from S1 "Narrative Arc" + `keyword_intelligence`.
3. **S3 (Clustering):** Pulls from S2 "Full Research List" + `structural_fingerprinting`.
4. **S4 (Calendar):** Pulls from S3 "Pillars" + `competitor_trends`.
5. **S5 (Generation):** Pulls from all of the above + `emotional_debt_audit`.