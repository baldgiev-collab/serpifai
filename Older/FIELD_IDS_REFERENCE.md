# 📋 81 Field IDs Quick Reference

**Use this as a checklist to verify your HTML has all required field IDs**

---

## ✅ Core Fields (4) - REQUIRED
```html
<input id="brandName" type="text" placeholder="Your brand name" required />
<textarea id="targetAudience" placeholder="Who is your target audience?" required></textarea>
<input id="coreTopic" type="text" placeholder="Your core topic/niche" required />
<input id="productOrService" type="text" placeholder="What you sell" />
```

---

## 🎨 Brand Identity (5)
```html
<textarea id="brandIdeology" placeholder="Brand philosophy/beliefs"></textarea>
<select id="brandArchetype">
  <option value="hero">Hero</option>
  <option value="sage">Sage</option>
  <option value="explorer">Explorer</option>
  <!-- Add all 12 archetypes -->
</select>
<textarea id="brandLexicon" placeholder="Unique terminology your brand uses"></textarea>
<textarea id="uvp" placeholder="Unique Value Proposition"></textarea>
<textarea id="existingMessaging" placeholder="Current messaging/taglines"></textarea>
```

---

## 👥 Audience Intelligence (6)
```html
<textarea id="audiencePains" placeholder="What problems does your audience face?"></textarea>
<textarea id="audienceDesired" placeholder="What outcomes do they desire?"></textarea>
<textarea id="secondaryAudience" placeholder="Secondary target audience"></textarea>
<input id="demographics" type="text" placeholder="Age, gender, income level" />
<input id="geography" type="text" placeholder="Target geographic locations" />
<input id="industry" type="text" placeholder="Target industry/sector" />
```

---

## 🏆 Competitive Intelligence (3)
```html
<textarea id="keyCompetitors" placeholder="Main competitors (comma-separated)"></textarea>
<textarea id="competitiveAdvantages" placeholder="Your unique advantages"></textarea>
<textarea id="coreMarketProblem" placeholder="Core problem you solve"></textarea>
```

---

## 🎯 Strategy & Goals (4)
```html
<textarea id="quarterlyObjective" placeholder="This quarter's main objective"></textarea>
<input id="northStarKpis" type="text" placeholder="Key performance indicators" />
<textarea id="contentGoals" placeholder="Content marketing goals"></textarea>
<textarea id="futureVision" placeholder="3-year vision"></textarea>
```

---

## 📱 Content Strategy (5)
```html
<input id="primaryChannels" type="text" placeholder="Main channels (blog, YouTube, etc.)" />
<input id="contentFormats" type="text" placeholder="Content formats (articles, videos, etc.)" />
<input id="postsPerWeek" type="number" placeholder="Publishing frequency" min="1" />
<textarea id="seasonality" placeholder="Seasonal trends or events"></textarea>
<input id="calendarHorizon" type="text" placeholder="Planning horizon (e.g., 90 days)" />
```

---

## 💰 Offers & Pricing (16)
```html
<!-- Primary Offer -->
<input id="primaryOfferName" type="text" placeholder="Main product/service name" />
<input id="primaryOfferPrice" type="text" placeholder="$999" />

<!-- Upsell Offer -->
<input id="upsellOfferName" type="text" placeholder="Upsell product name" />
<input id="upsellOfferPrice" type="text" placeholder="$1,999" />

<!-- Lead Magnet -->
<textarea id="leadMagnet" placeholder="Free offer to capture leads"></textarea>

<!-- Offer Matrix -->
<textarea id="offerMatrix" placeholder="Complete offer ladder/matrix"></textarea>

<!-- Bundle 1 -->
<input id="bundle1Name" type="text" placeholder="Bundle 1 name" />
<input id="bundle1Price" type="text" placeholder="$2,499" />
<textarea id="bundle1Items" placeholder="What's included in bundle 1"></textarea>

<!-- Bundle 2 -->
<input id="bundle2Name" type="text" placeholder="Bundle 2 name" />
<input id="bundle2Price" type="text" placeholder="$4,999" />
<textarea id="bundle2Items" placeholder="What's included in bundle 2"></textarea>

<!-- Bundle 3 -->
<input id="bundle3Name" type="text" placeholder="Bundle 3 name" />
<input id="bundle3Price" type="text" placeholder="$9,999" />
<textarea id="bundle3Items" placeholder="What's included in bundle 3"></textarea>

<!-- Offer Sequence -->
<textarea id="offerStackSequence" placeholder="Order of offer presentation"></textarea>
```

---

## ✨ Social Proof (13)
```html
<!-- General Social Proof -->
<textarea id="socialProof" placeholder="Awards, recognition, stats"></textarea>

<!-- Testimonials -->
<textarea id="testimonial1" placeholder="Customer testimonial 1"></textarea>
<textarea id="testimonial2" placeholder="Customer testimonial 2"></textarea>

<!-- Case Studies -->
<textarea id="caseStudy1" placeholder="Case study 1 summary"></textarea>
<textarea id="caseStudy2" placeholder="Case study 2 summary"></textarea>
<textarea id="caseStudy3" placeholder="Case study 3 summary"></textarea>

<!-- Expert Quotes -->
<textarea id="expertQuote1" placeholder="Expert endorsement 1"></textarea>
<textarea id="expertQuote2" placeholder="Expert endorsement 2"></textarea>

<!-- Trust Signals -->
<input id="trustAnchors" type="text" placeholder="Trust badges, certifications" />
<textarea id="proprietaryData" placeholder="Your unique data/research"></textarea>
<textarea id="marketData" placeholder="Industry data/statistics"></textarea>

<!-- Primary Sources -->
<input id="primarySource1" type="url" placeholder="https://source1.com" />
<input id="primarySource2" type="url" placeholder="https://source2.com" />
```

---

## 🏗️ Content Architecture (6)
```html
<textarea id="foundationalPillars" placeholder="Main content pillars (3-5)"></textarea>
<textarea id="pillarContext" placeholder="Description of each pillar"></textarea>
<input id="parentPillar" type="text" placeholder="Parent category" />
<textarea id="childSpokes" placeholder="Sub-categories under each pillar"></textarea>
<textarea id="internalLinkingStrategy" placeholder="How content links together"></textarea>
<textarea id="categoryDefinition" placeholder="Content categorization logic"></textarea>
```

---

## 🔍 Keywords & SEO (3)
```html
<input id="primaryKeyword" type="text" placeholder="Main target keyword" />
<textarea id="secondaryKeywords" placeholder="Supporting keywords (comma-separated)"></textarea>
<textarea id="keywordsEntities" placeholder="Named entities (brands, people, places)"></textarea>
```

---

## ✍️ Content Generation (5)
```html
<textarea id="authorBio" placeholder="Author bio for content"></textarea>
<select id="persuasionFramework">
  <option value="pas">PAS (Problem-Agitate-Solution)</option>
  <option value="aida">AIDA (Attention-Interest-Desire-Action)</option>
  <option value="baf">BAF (Before-After-Bridge)</option>
  <!-- Add more frameworks -->
</select>
<textarea id="uniqueMechanism" placeholder="Your unique mechanism/method"></textarea>
<textarea id="forbiddenTerms" placeholder="Words/phrases to avoid"></textarea>
<select id="readabilityDirectives">
  <option value="grade8">8th Grade</option>
  <option value="grade10">10th Grade</option>
  <option value="grade12">12th Grade</option>
  <option value="college">College Level</option>
</select>
```

---

## ⚙️ Technical SEO (4)
```html
<textarea id="schemaArticle" placeholder="Article schema markup template"></textarea>
<textarea id="schemaFaq" placeholder="FAQ schema markup template"></textarea>
<textarea id="visualHooks" placeholder="Visual elements strategy (charts, infographics)"></textarea>
<input id="assetTitle" type="text" placeholder="Asset naming convention" />
```

---

## 🤖 AI Context (2)
```html
<textarea id="aiPersonaContext" placeholder="AI persona for content generation"></textarea>
<textarea id="platformContext" placeholder="Platform-specific context (LinkedIn vs Twitter)"></textarea>
```

---

## 📊 Quick Stats

- **Total Fields**: 81
- **Required Fields**: 3 (brandName, targetAudience, coreTopic)
- **Categories**: 11
- **Text Inputs**: 26
- **Textareas**: 47
- **Selects**: 3
- **Number Inputs**: 1
- **URL Inputs**: 2
- **Checkboxes**: 2

---

## 🔍 Field Naming Convention

**Pattern**: `camelCase` starting with lowercase

**Examples**:
- ✅ `brandName` (correct)
- ❌ `brand_name` (wrong - no underscores)
- ❌ `BrandName` (wrong - starts with uppercase)
- ❌ `brand-name` (wrong - no hyphens)

**Category Prefixes** (not used in IDs, just for organization):
- `brand*` → Brand identity fields
- `audience*` → Audience targeting fields
- `competitive*` → Competitive analysis fields
- `content*` → Content strategy fields
- `offer*`, `bundle*` → Pricing/offers fields
- `schema*` → Technical SEO fields
- `ai*` → AI context fields

---

## ✅ Validation Checklist

Use this script to verify all fields exist in your HTML:

```javascript
// Copy/paste into browser console
const REQUIRED_FIELDS = [
  // Core (4)
  'brandName', 'targetAudience', 'coreTopic', 'productOrService',
  
  // Brand (5)
  'brandIdeology', 'brandArchetype', 'brandLexicon', 'uvp', 'existingMessaging',
  
  // Audience (6)
  'audiencePains', 'audienceDesired', 'secondaryAudience', 
  'demographics', 'geography', 'industry',
  
  // Competitive (3)
  'keyCompetitors', 'competitiveAdvantages', 'coreMarketProblem',
  
  // Strategy (4)
  'quarterlyObjective', 'northStarKpis', 'contentGoals', 'futureVision',
  
  // Content (5)
  'primaryChannels', 'contentFormats', 'postsPerWeek', 
  'seasonality', 'calendarHorizon',
  
  // Offers (16)
  'primaryOfferName', 'primaryOfferPrice', 'upsellOfferName', 'upsellOfferPrice',
  'leadMagnet', 'offerMatrix',
  'bundle1Name', 'bundle1Price', 'bundle1Items',
  'bundle2Name', 'bundle2Price', 'bundle2Items',
  'bundle3Name', 'bundle3Price', 'bundle3Items',
  'offerStackSequence',
  
  // Proof (13)
  'socialProof', 'testimonial1', 'testimonial2',
  'caseStudy1', 'caseStudy2', 'caseStudy3',
  'expertQuote1', 'expertQuote2',
  'trustAnchors', 'proprietaryData', 'marketData',
  'primarySource1', 'primarySource2',
  
  // Architecture (6)
  'foundationalPillars', 'pillarContext', 'parentPillar',
  'childSpokes', 'internalLinkingStrategy', 'categoryDefinition',
  
  // Keywords (3)
  'primaryKeyword', 'secondaryKeywords', 'keywordsEntities',
  
  // Generation (5)
  'authorBio', 'persuasionFramework', 'uniqueMechanism',
  'forbiddenTerms', 'readabilityDirectives',
  
  // Technical (4)
  'schemaArticle', 'schemaFaq', 'visualHooks', 'assetTitle',
  
  // AI Context (2)
  'aiPersonaContext', 'platformContext'
];

console.log('🔍 Checking for 81 field IDs...\n');

let found = 0;
let missing = [];

REQUIRED_FIELDS.forEach(fieldId => {
  const element = document.getElementById(fieldId);
  if (element) {
    found++;
    console.log(`✅ ${fieldId}`);
  } else {
    missing.push(fieldId);
    console.log(`❌ ${fieldId} - NOT FOUND`);
  }
});

console.log('\n═══════════════════════════════════════════════════');
console.log(`RESULTS: ${found} / 81 fields found`);
console.log('═══════════════════════════════════════════════════');

if (missing.length > 0) {
  console.log('\n⚠️ MISSING FIELDS:');
  missing.forEach(id => console.log(`  - ${id}`));
} else {
  console.log('\n✅ ALL 81 FIELDS FOUND! Ready for auto-population.');
}
```

---

## 🎯 Common HTML Patterns

### Standard Text Input
```html
<div class="form-group">
  <label for="brandName">Brand Name *</label>
  <input 
    id="brandName" 
    type="text" 
    class="form-control" 
    placeholder="Your brand name"
    required 
  />
</div>
```

### Textarea (Multi-line)
```html
<div class="form-group">
  <label for="audiencePains">Audience Pain Points</label>
  <textarea 
    id="audiencePains" 
    class="form-control" 
    rows="4"
    placeholder="What problems does your audience face?"
  ></textarea>
</div>
```

### Select Dropdown
```html
<div class="form-group">
  <label for="brandArchetype">Brand Archetype</label>
  <select id="brandArchetype" class="form-control">
    <option value="">Select archetype...</option>
    <option value="hero">Hero</option>
    <option value="sage">Sage</option>
    <option value="explorer">Explorer</option>
  </select>
</div>
```

### Number Input
```html
<div class="form-group">
  <label for="postsPerWeek">Posts Per Week</label>
  <input 
    id="postsPerWeek" 
    type="number" 
    class="form-control" 
    min="1" 
    max="50"
    placeholder="How many posts per week?"
  />
</div>
```

---

## 📱 Responsive Layout Example

```html
<div class="container">
  <div class="row">
    
    <!-- Left Column: Core & Brand -->
    <div class="col-md-6">
      <h3>Core Information</h3>
      <input id="brandName" type="text" required />
      <textarea id="targetAudience" required></textarea>
      <input id="coreTopic" type="text" required />
      
      <h3>Brand Identity</h3>
      <textarea id="brandIdeology"></textarea>
      <select id="brandArchetype"></select>
      <!-- ... more brand fields -->
    </div>
    
    <!-- Right Column: Audience & Competitive -->
    <div class="col-md-6">
      <h3>Audience Intelligence</h3>
      <textarea id="audiencePains"></textarea>
      <textarea id="audienceDesired"></textarea>
      <!-- ... more audience fields -->
      
      <h3>Competitive Analysis</h3>
      <textarea id="keyCompetitors"></textarea>
      <textarea id="competitiveAdvantages"></textarea>
      <!-- ... more competitive fields -->
    </div>
    
  </div>
</div>
```

---

## 🚀 Auto-Population Test Script

After integrating the JavaScript, test with this:

```javascript
// Test auto-population with mock data
const mockProjectData = {
  brandName: 'BairesDev',
  targetAudience: 'CTOs, VPs of Engineering at enterprise companies',
  coreTopic: 'Nearshore Software Development',
  productOrService: 'Staff Augmentation',
  brandIdeology: 'Agility without compromise',
  brandArchetype: 'sage',
  uvp: 'Latin America\'s top 1% tech talent',
  audiencePains: 'Difficult to find skilled developers, High US salaries',
  audienceDesired: 'Access to top talent, Cost savings, Cultural alignment',
  keyCompetitors: 'Toptal, Globant, EPAM',
  competitiveAdvantages: 'Nearshore timezone, Cultural fit, Pre-vetted talent',
  quarterlyObjective: 'Increase enterprise acquisition by 20%',
  primaryChannels: 'LinkedIn, Blog, Webinars',
  contentFormats: 'Case studies, Technical whitepapers, Video testimonials',
  postsPerWeek: 5,
  primaryOfferName: 'Staff Augmentation',
  primaryOfferPrice: '$5,000/month per developer',
  upsellOfferName: 'Dedicated Development Team',
  upsellOfferPrice: '$25,000/month',
  // ... add more fields as needed
};

// Populate fields
Object.keys(mockProjectData).forEach(fieldId => {
  const element = document.getElementById(fieldId);
  if (element) {
    element.value = mockProjectData[fieldId];
    console.log(`✅ ${fieldId}: ${mockProjectData[fieldId].substring(0, 30)}...`);
  }
});

console.log('✅ Mock data populated');
```

---

## 💡 Pro Tips

### Tip 1: Use Autocomplete Off
For security-sensitive fields:
```html
<input id="primaryOfferPrice" type="text" autocomplete="off" />
```

### Tip 2: Add Helper Text
```html
<div class="form-group">
  <label for="brandArchetype">Brand Archetype</label>
  <select id="brandArchetype" class="form-control"></select>
  <small class="form-text text-muted">
    Choose the personality that best represents your brand
  </small>
</div>
```

### Tip 3: Visual Field Requirements
```html
<label for="brandName">
  Brand Name 
  <span class="required-badge">*</span>
</label>

<style>
.required-badge {
  color: #ef4444;
  font-weight: bold;
}
</style>
```

### Tip 4: Character Count
```html
<textarea id="uvp" maxlength="200"></textarea>
<div class="char-count">
  <span id="uvp-count">0</span> / 200 characters
</div>

<script>
document.getElementById('uvp').addEventListener('input', function(e) {
  document.getElementById('uvp-count').textContent = e.target.value.length;
});
</script>
```

---

## 📋 Field Groups Summary

| Category | Fields | Primary Use |
|----------|--------|-------------|
| **Core** | 4 | Project identification |
| **Brand** | 5 | Brand positioning |
| **Audience** | 6 | Target market definition |
| **Competitive** | 3 | Competitive analysis |
| **Strategy** | 4 | Business goals |
| **Content** | 5 | Content planning |
| **Offers** | 16 | Pricing & products |
| **Proof** | 13 | Social validation |
| **Architecture** | 6 | Content structure |
| **Keywords** | 3 | SEO optimization |
| **Generation** | 5 | AI content rules |
| **Technical** | 4 | Technical SEO |
| **AI Context** | 2 | AI personalization |

---

**Total: 81 fields organized for elite SaaS performance** 🎯

Use this reference when building your HTML forms to ensure complete integration with the auto-population system.
