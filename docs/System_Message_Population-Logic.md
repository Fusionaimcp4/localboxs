System Message Population Logic — v3 Documentation Summary

Validated Components

✅ All critical anchors confirmed:
## Business Knowledge, ## Website links (canonical), ### Canonical URLs, # AI to Human Escalation Rules, ## Valid Teams (with responsibilities).

✅ Added sections now reflected in doc:
## Knowledge Base Usage Guidelines, ## General Behavior, ## Output Format, ### Example Scenarios.

✅ Corrected variable-replacement order (runs after KB merge).

✅ Documented regex match rules (^##\s*Business Knowledge$ etc.).

Behavioral Notes

Dynamic content insertion verified at two injection points: Business Knowledge + Website Links.

Admin editing safe only for: Voice & POV, Information You Receive, Goals, descriptive text.

Template integrity depends on exact Markdown header level and spacing.

New Admin-Editable Candidates

Knowledge Base Usage Guidelines

General Behavior

Output Format (partial – must retain JSON examples)

Stability

Template fully aligned with codebase functions:
mergeKBIntoSkeleton(), injectWebsiteLinksSection(), generateKBFromWebsite().

No undocumented markers or orphaned regex patterns found.

Ready for v3 Git push with updated /docs/System_Message_Population.md.

## **Insertion Points & Section Markers**

### **Critical Section Markers (Must Not Change)**
- `## Business Knowledge` - Primary insertion point for AI-generated content
- `## Website links (canonical)` - Insertion point for canonical URLs
- `### Canonical URLs` - Sub-section for URL list
- `# AI to Human Escalation Rules` - Fixed section for escalation logic
- `## Valid Teams (with responsibilities)` - Team definitions section
- `## Knowledge Base Usage Guidelines` - Guidelines for AI behavior with KB
- `## General Behavior` - Core AI behavior rules
- `## Output Format` - JSON output format specifications
- `### Example Scenarios` - Escalation examples and patterns

### **Template Structure Markers**
- `# ${businessName} – Chat Platform System Message` - Main title with variable
- `You are a **customer assistant for ${businessName}**` - Voice definition
- `### Voice & POV (very important)` - Voice guidelines section
- `## Information You Receive` - Input parameters section
- `**Your Goals**` - AI behavior guidelines

## **Variable Placeholders**

### **Mandatory Variables**
- `${businessName}` - Replaced with actual business name (e.g., "starsling.dev")
- `${businessURL}` - Business website URL (used in canonical links)

### **Optional Variables**
- `${slug}` - URL slug (if provided)
- Additional custom variables can be added without breaking the system

## **Population Rules & Order**

### **Step-by-Step Assembly Process**
1. **Load Base Template** - Read `data/templates/n8n_System_Message.md`
2. **Scrape Website Content** - Extract text from business website
3. **Generate Knowledge Base** - Use GPT to create structured KB from scraped content
4. **Merge KB into Template** - Insert generated content at `## Business Knowledge` marker
5. **Replace Variables** - Replace `${businessName}` with actual business name (happens AFTER KB merge)
6. **Inject Canonical URLs** - Add website links at `## Website links (canonical)` marker
7. **Final Assembly** - Combine all components into complete system message

### **Conditional Logic**
- **Skip if section exists**: If `## Business Knowledge` already has content, it gets replaced
- **URL injection**: Only adds canonical URLs if business URL is provided
- **Fallback behavior**: If scraping fails, uses basic template with business name only

## **Naming & Formatting Constraints**

### **Must Not Change (Code References)**
- `## Business Knowledge` - Hardcoded in `mergeKBIntoSkeleton()` function
- `## Website links (canonical)` - Hardcoded in `injectWebsiteLinksSection()` function
- `### Canonical URLs` - Referenced in URL injection logic
- `# AI to Human Escalation Rules` - Fixed escalation section
- `## Valid Teams (with responsibilities)` - Team definitions header
- `## Knowledge Base Usage Guidelines` - Referenced in AI behavior logic
- `## General Behavior` - Core AI behavior rules
- `## Output Format` - JSON format specifications
- `### Example Scenarios` - Escalation pattern examples

### **Safe to Modify**
- `### Voice & POV (very important)` - Can be renamed/restructured
- `## Information You Receive` - Can be modified
- `**Your Goals**` - Can be changed
- Most descriptive text and examples
- Markdown formatting within sections

## **Content Source Mapping**

### **Template Sections**
- **Base Structure**: `data/templates/n8n_System_Message.md` (static template)
- **Business Name**: User input during demo creation
- **Voice & POV**: Static template content

### **Dynamic Content**
- **Business Knowledge**: GPT-4o-mini generated from scraped website content
- **Canonical URLs**: Business website URL + discovered page URLs
- **Business Context**: Scraped from website using web scraping tools

### **AI-Generated Content**
- **Project Overview**: Extracted from website content
- **Key Features**: Identified from website text
- **FAQs**: Generated based on website content
- **Glossary**: Created from technical terms found on website

### **Static Template Sections**
- **Knowledge Base Usage Guidelines**: Instructions for AI on when/how to use KB
- **General Behavior**: Core AI behavior rules and confidence thresholds
- **Output Format**: JSON structure specifications for AI responses
- **Example Scenarios**: Sample escalation patterns and responses

## **Current System Behavior Analysis**

Based on your example output, the system successfully:

1. **Replaced Variables**: `${businessName}` → "starsling.dev"
2. **Generated Business Knowledge**: Created comprehensive business knowledge from website
3. **Injected Canonical URLs**: Added website links section
4. **Maintained Structure**: Preserved all critical section markers
5. **Preserved Escalation Rules**: Kept AI-to-human escalation logic intact

## **Critical Dependencies**

### **Code Functions That Must Work**
- `mergeKBIntoSkeleton()` - Depends on `## Business Knowledge` marker (uses exact match regex)
- `injectWebsiteLinksSection()` - Depends on `## Website links (canonical)` marker
- `generateKBFromWebsite()` - Creates structured content for insertion
- Variable replacement logic - Depends on `${businessName}` placeholder

### **Critical Regex Patterns**
- **Business Knowledge**: Uses `^##\s*Business Knowledge$` to match exactly (not "Knowledge Base Usage Guidelines")
- **Website Links**: Uses `^##\s*Website links \(canonical\)` for exact matching
- **Section Extraction**: All section operations use `^##\s*` prefix for line-start matching

### **Template Integrity Requirements**
- Section headers must maintain exact Markdown level (`##`, `###`)
- Variable placeholders must use `${variableName}` syntax
- Business Knowledge section must be empty or replaceable
- Escalation rules section must remain intact for AI behavior

This system provides a robust template-based approach where the core structure remains stable while allowing dynamic content injection based on business-specific information.