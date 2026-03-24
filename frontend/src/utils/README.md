# Utility Files

This directory contains reusable utility files for spacing and typography.

## Spacing Utilities (`spacing.ts`)

Provides consistent spacing classes for sections, containers, and gaps.

### Usage

```tsx
import { spacing, spacingCombos } from '@/utils/spacing';

// Use in your component
<section className={spacing.section.gap}>
  {/* Section content */}
</section>

// Or use the pre-defined combinations
<section className={spacingCombos.sectionContainer}>
  {/* Section with gap and container padding */}
</section>
```

### Available Spacing Options

- **Section Spacing**: `spacing.section.gap` (20px top/bottom), `spacing.section.gapTop`, `spacing.section.gapBottom`
- **Container Padding**: `spacing.container.padding` (responsive horizontal padding)
- **Gaps**: `spacing.gap.vertical`, `spacing.gap.horizontal`
- **Margins**: `spacing.margin.top`, `spacing.margin.bottom`, etc.

### CSS Classes

You can also use the custom CSS classes directly:

```tsx
<section className="section-gap">
  {/* 20px top and bottom padding */}
</section>

<section className="section-gap-top">
  {/* 20px top padding only */}
</section>

<div className="container-padding">
  {/* Responsive horizontal padding */}
</div>
```

## Typography Utilities (`typography.ts`)

Provides consistent text size classes for different text types.

### Usage

```tsx
import { typography, typographyCombos } from '@/utils/typography';

// Use in your component
<h1 className={typography.pageHeading.default}>
  Page Title
</h1>

<h2 className={typography.sectionHeading.default}>
  Section Title
</h2>

<p className={typography.card.description}>
  Card description text
</p>

// Or use pre-defined combinations with theme colors
<h2 className={typographyCombos.sectionHeadingTheme}>
  Themed Section Heading
</h2>
```

### Available Typography Options

- **Page Headings**: `typography.pageHeading.default`, `small`, `medium`, `large`
- **Section Headings**: `typography.sectionHeading.default`, `small`, `medium`, `large`
- **Hero Text**: `typography.hero.title`, `subtitle`, `description`
- **Card Text**: `typography.card.title`, `subtitle`, `description`, `price`
- **Footer Text**: `typography.footer.heading`, `link`, `copyright`, `brand`
- **Info Text**: `typography.info.heading`, `text`, `small`, `large`
- **Body Text**: `typography.body.default`, `small`, `large`
- **Button Text**: `typography.button.default`, `small`, `large`
- **Label Text**: `typography.label.default`, `small`

## Examples

### Complete Section Example

```tsx
import { spacing, typography } from '@/utils/spacing';
import { typography } from '@/utils/typography';

function MySection() {
  return (
    <section className={spacing.section.gap}>
      <div className={`max-w-8xl mx-auto ${spacing.container.padding}`}>
        <h2 className={typography.sectionHeading.default}>
          Section Title
        </h2>
        <p className={typography.body.default}>
          Section content goes here...
        </p>
      </div>
    </section>
  );
}
```

### Using CSS Classes Directly

```tsx
<section className="section-gap">
  <div className="max-w-8xl mx-auto container-padding">
    <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold">
      Section Title
    </h2>
  </div>
</section>
```
