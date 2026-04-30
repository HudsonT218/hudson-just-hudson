// Component registry — maps variant IDs to lazy-loaded components.
// Used by LivePreview to render real component variants in the wizard.
//
// Auto-generated style: every section in /sections/{type}/{variant}/component.tsx
// is registered here. When you add a new variant, add it to this map.
import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

export type ComponentVariantId = string;

type AnyProps = Record<string, unknown>;
type LazyComp = LazyExoticComponent<ComponentType<AnyProps>>;

export const COMPONENT_REGISTRY: Record<ComponentVariantId, LazyComp> = {
  // navbar
  'navbar-minimal': lazy(() => import('./sections/navbar/navbar-minimal/component')),
  'navbar-centered': lazy(() => import('./sections/navbar/navbar-centered/component')),
  'navbar-transparent': lazy(() => import('./sections/navbar/navbar-transparent/component')),
  'navbar-megamenu': lazy(() => import('./sections/navbar/navbar-megamenu/component')),

  // hero
  'hero-centered': lazy(() => import('./sections/hero/hero-centered/component')),
  'hero-split': lazy(() => import('./sections/hero/hero-split/component')),
  'hero-video': lazy(() => import('./sections/hero/hero-video/component')),
  'hero-animated': lazy(() => import('./sections/hero/hero-animated/component')),
  'hero-form': lazy(() => import('./sections/hero/hero-form/component')),

  // features
  'features-icon-grid': lazy(() => import('./sections/features/features-icon-grid/component')),
  'features-bento': lazy(() => import('./sections/features/features-bento/component')),
  'features-alternating': lazy(() => import('./sections/features/features-alternating/component')),
  'features-hover-cards': lazy(() => import('./sections/features/features-hover-cards/component')),

  // social-proof
  'social-proof-marquee': lazy(() => import('./sections/social-proof/social-proof-marquee/component')),
  'social-proof-grid': lazy(() => import('./sections/social-proof/social-proof-grid/component')),

  // how-it-works
  'how-it-works-vertical': lazy(() => import('./sections/how-it-works/how-it-works-vertical/component')),
  'how-it-works-horizontal': lazy(() => import('./sections/how-it-works/how-it-works-horizontal/component')),
  'how-it-works-cards': lazy(() => import('./sections/how-it-works/how-it-works-cards/component')),

  // pricing
  'pricing-three-tier': lazy(() => import('./sections/pricing/pricing-three-tier/component')),
  'pricing-two-toggle': lazy(() => import('./sections/pricing/pricing-two-toggle/component')),
  'pricing-single-spotlight': lazy(() => import('./sections/pricing/pricing-single-spotlight/component')),

  // testimonials
  'testimonials-cards-grid': lazy(() => import('./sections/testimonials/testimonials-cards-grid/component')),
  'testimonials-carousel': lazy(() => import('./sections/testimonials/testimonials-carousel/component')),
  'testimonials-large-quote': lazy(() => import('./sections/testimonials/testimonials-large-quote/component')),

  // cta
  'cta-centered': lazy(() => import('./sections/cta/cta-centered/component')),
  'cta-split': lazy(() => import('./sections/cta/cta-split/component')),

  // footer
  'footer-simple': lazy(() => import('./sections/footer/footer-simple/component')),
  'footer-multi-column': lazy(() => import('./sections/footer/footer-multi-column/component')),
  'footer-cta': lazy(() => import('./sections/footer/footer-cta/component')),

  // faq
  'faq-accordion': lazy(() => import('./sections/faq/faq-accordion/component')),
  'faq-two-column': lazy(() => import('./sections/faq/faq-two-column/component')),

  // stats
  'stats-inline': lazy(() => import('./sections/stats/stats-inline/component')),
  'stats-cards': lazy(() => import('./sections/stats/stats-cards/component')),
};

export function getComponent(variantId: string): LazyComp | undefined {
  return COMPONENT_REGISTRY[variantId];
}
