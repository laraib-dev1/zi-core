/**
 * Examples of using Spacing and Typography utilities
 * 
 * This file demonstrates how to use the spacing and typography utilities
 * in your components. Copy and adapt these patterns as needed.
 */

import { spacing, spacingCombos } from './spacing';
import { typography, typographyCombos } from './typography';

// Example 1: Basic section with standard gap
export const ExampleSection = () => {
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
};

// Example 2: Using CSS classes directly
export const ExampleSectionCSS = () => {
  return (
    <section className="section-gap">
      <div className="max-w-8xl mx-auto container-padding">
        <h2 className={typography.sectionHeading.default}>
          Section Title
        </h2>
      </div>
    </section>
  );
};

// Example 3: Hero section
export const ExampleHero = () => {
  return (
    <section className={spacing.section.gapLarge}>
      <div className={`max-w-8xl mx-auto ${spacing.container.padding}`}>
        <h1 className={typography.hero.title}>
          Welcome to Our Store
        </h1>
        <p className={typography.hero.subtitle}>
          Discover our latest collections
        </p>
      </div>
    </section>
  );
};

// Example 4: Card component
export const ExampleCard = () => {
  return (
    <div className={`${spacing.container.padding} ${spacing.section.gap}`}>
      <h3 className={typography.card.title}>
        Product Name
      </h3>
      <p className={typography.card.description}>
        Product description
      </p>
      <span className={typography.card.price}>
        $99.99
      </span>
    </div>
  );
};

// Example 5: Footer section
export const ExampleFooter = () => {
  return (
    <footer className={spacing.section.gap}>
      <div className={`max-w-8xl mx-auto ${spacing.container.padding}`}>
        <h3 className={typography.footer.heading}>
          Categories
        </h3>
        <a href="#" className={typography.footer.link}>
          Link Text
        </a>
        <p className={typography.footer.copyright}>
          © 2026 Company. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

// Example 6: Using pre-defined combinations
export const ExampleCombos = () => {
  return (
    <section className={spacingCombos.sectionContainer}>
      <h2 className={typographyCombos.sectionHeadingTheme}>
        Themed Section Heading
      </h2>
    </section>
  );
};

// Example 7: Section with no gap (for seamless sections)
export const ExampleNoGap = () => {
  return (
    <section className={spacing.container.padding}>
      <h2 className={typography.sectionHeading.default}>
        No Gap Section
      </h2>
    </section>
  );
};
