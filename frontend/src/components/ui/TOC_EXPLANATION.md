# Table of Contents (TOC) - How It Works

## Overview
The Table of Contents component automatically generates a nested navigation menu from headings (H1, H2, H3, H4) in your HTML content. It creates a clickable, hierarchical structure that allows users to quickly navigate to different sections.

## How It Works - Step by Step

### 1. **HTML Parsing**
```typescript
// The component receives HTML content as a string
const parser = new DOMParser();
const doc = parser.parseFromString(htmlContent, "text/html");
const headings = Array.from(doc.querySelectorAll("h1, h2, h3, h4"));
```
- Parses the HTML string to find all headings (H1 through H4)
- Extracts the text content and determines the heading level (1-4)

### 2. **ID Generation**
```typescript
// Creates unique IDs for each heading
id = `heading-${index}-${text.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
heading.id = id;
```
- Generates a unique ID for each heading if it doesn't already have one
- IDs are URL-friendly (lowercase, hyphens instead of spaces)
- Example: "Introduction" → "heading-0-introduction"

### 3. **Tree Structure Building**
The component builds a nested tree structure based on heading hierarchy:

**Example HTML:**
```html
<h1>Introduction</h1>
  <h2>Getting Started</h2>
    <h3>Installation</h3>
    <h3>Configuration</h3>
      <h4>Settings</h4>
<h1>Advanced Topics</h1>
  <h2>Best Practices</h2>
```

**Resulting Tree:**
```
Introduction (H1)
  └─ Getting Started (H2)
      ├─ Installation (H3)
      └─ Configuration (H3)
          └─ Settings (H4)
Advanced Topics (H1)
  └─ Best Practices (H2)
```

**Algorithm:**
- Uses a stack to track parent-child relationships
- When a heading has a higher level than the previous one, it becomes a child
- When a heading has the same or lower level, it closes previous parents

### 4. **Rendering**
The component renders the tree with:
- **Indentation**: Each nested level is indented (20px per level)
- **Expand/Collapse**: Clicking a parent heading toggles its children
- **Active State**: Highlights the current section while scrolling
- **Smooth Scrolling**: Clicking an item smoothly scrolls to that section

### 5. **Scroll Tracking**
```typescript
const observer = new IntersectionObserver((entries) => {
  // Detects which heading is currently in view
  if (entry.isIntersecting) {
    setActiveId(entry.target.id);
  }
});
```
- Uses Intersection Observer API to track which section is visible
- Highlights the active item in the TOC as you scroll

## Visual Structure

```
┌─────────────────────────────┐
│ Table of Contents           │
├─────────────────────────────┤
│ ► Introduction              │  ← H1 (expanded)
│   ► Getting Started         │  ← H2 (expanded)
│     • Installation          │  ← H3
│     ► Configuration         │  ← H3 (expanded)
│       • Settings            │  ← H4
│ ► Advanced Topics           │  ← H1 (expanded)
│   • Best Practices          │  ← H2
└─────────────────────────────┘
```

## Usage Example

```tsx
import { TableOfContents } from "@/components/ui/TableOfContents";

function MyPage() {
  const contentRef = useRef<HTMLDivElement>(null);
  const htmlContent = "<h1>Title</h1><h2>Subtitle</h2>...";

  return (
    <div className="grid grid-cols-4">
      <div className="col-span-1">
        <TableOfContents 
          htmlContent={htmlContent} 
          contentRef={contentRef} 
        />
      </div>
      <div className="col-span-3" ref={contentRef}>
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </div>
    </div>
  );
}
```

## Key Features

1. **Auto-Generation**: Automatically detects headings from HTML
2. **Nested Structure**: Shows hierarchy (H1 → H2 → H3 → H4)
3. **Click to Navigate**: Smooth scroll to sections
4. **Active Highlighting**: Shows current section while scrolling
5. **Expand/Collapse**: Toggle visibility of nested items
6. **Sticky Position**: TOC stays visible while scrolling (on desktop)

## Styling

- **Active Item**: Highlighted with theme color background
- **Hover Effect**: Gray background on hover
- **Indentation**: 20px per nesting level
- **Icons**: ChevronRight (collapsed) / ChevronDown (expanded)

## Technical Details

- **React Hooks**: Uses `useState`, `useEffect`, `useRef`
- **DOM APIs**: `DOMParser`, `querySelector`, `IntersectionObserver`
- **Smooth Scrolling**: Native `scrollTo` with `behavior: "smooth"`
- **Performance**: Debounced updates, efficient tree building

## Customization

You can customize:
- Colors: Modify the `bg-[#A8734B]/10` and `text-[#A8734B]` classes
- Spacing: Adjust `paddingLeft` calculation
- Icons: Replace `ChevronRight`/`ChevronDown` with other icons
- Position: Change `sticky top-24` to adjust sticky position











