import type {
  ModelDefinition,
  ThemeDefinition,
  SectionTypeDefinition,
} from './configurator-types';

export const MODEL_DEFINITIONS: ModelDefinition[] = [
  {
    id: 'landing',
    name: 'Landing Page',
    description:
      'A focused single-page site to launch a product, capture leads, or test an offer.',
    icon: 'Rocket',
    defaultSections: [
      'navbar',
      'hero',
      'features',
      'social-proof',
      'how-it-works',
      'testimonials',
      'pricing',
      'faq',
      'cta',
      'footer',
    ],
    optionalSections: ['stats'],
    comingSoon: false,
    basePrice: 50000, // $500.00 in cents
  },
  {
    id: 'business',
    name: 'Business Website',
    description:
      'Multi-page site for established businesses — services, about, contact, and more.',
    icon: 'Building2',
    defaultSections: [],
    optionalSections: [],
    comingSoon: true,
    basePrice: 150000,
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    description:
      'A polished showcase site for creators, designers, photographers, or agencies.',
    icon: 'GalleryHorizontal',
    defaultSections: [],
    optionalSections: [],
    comingSoon: true,
    basePrice: 100000,
  },
  {
    id: 'saas',
    name: 'SaaS App Marketing',
    description:
      'A multi-section product marketing site purpose-built for SaaS launches.',
    icon: 'Layers',
    defaultSections: [],
    optionalSections: [],
    comingSoon: true,
    basePrice: 250000,
  },
];

export const THEME_DEFINITIONS: ThemeDefinition[] = [
  {
    id: 'clean-modern',
    name: 'Clean Modern',
    description:
      'Minimal, generous whitespace, professional but approachable. Linear/Notion vibes.',
    fonts: ['Inter'],
    swatches: {
      bg: '#FFFFFF',
      primary: '#2563EB',
      secondary: '#4F46E5',
      accent: '#06B6D4',
      text: '#111827',
    },
    isDark: false,
  },
  {
    id: 'bold-dark',
    name: 'Bold Dark',
    description:
      'Dark canvas, high contrast, electric blue/purple accents. Vercel/Raycast vibes.',
    fonts: ['Inter'],
    swatches: {
      bg: '#09090B',
      primary: '#6366F1',
      secondary: '#8B5CF6',
      accent: '#22D3EE',
      text: '#FAFAFA',
    },
    isDark: true,
  },
  {
    id: 'warm-minimal',
    name: 'Warm Minimal',
    description:
      'Cream tones, serif headings, soft shadows. Boutique brand, artisanal feel.',
    fonts: ['Playfair Display', 'Source Sans 3'],
    swatches: {
      bg: '#FFFBF5',
      primary: '#B45309',
      secondary: '#9A3412',
      accent: '#D97706',
      text: '#292524',
    },
    isDark: false,
  },
  {
    id: 'corporate-sharp',
    name: 'Corporate Sharp',
    description:
      'Navy/slate palette, sharp corners, authoritative. Law firm or enterprise.',
    fonts: ['Inter'],
    swatches: {
      bg: '#FFFFFF',
      primary: '#1E3A5F',
      secondary: '#334155',
      accent: '#0EA5E9',
      text: '#0F172A',
    },
    isDark: false,
  },
  {
    id: 'vibrant-startup',
    name: 'Vibrant Startup',
    description:
      'Bright accents, gradient CTAs, energetic and playful. Figma/Loom vibes.',
    fonts: ['Plus Jakarta Sans'],
    swatches: {
      bg: '#FFFFFF',
      primary: '#7C3AED',
      secondary: '#EC4899',
      accent: '#F59E0B',
      text: '#171717',
    },
    isDark: false,
  },
  {
    id: 'elegant-luxury',
    name: 'Elegant Luxury',
    description:
      'Dark canvas with gold and cream accents. Fashion or luxury hospitality.',
    fonts: ['Cormorant Garamond', 'Outfit'],
    swatches: {
      bg: '#0A0A0A',
      primary: '#C9A84C',
      secondary: '#A67C52',
      accent: '#E8D5B5',
      text: '#F5F0E8',
    },
    isDark: true,
  },
  {
    id: 'nature-organic',
    name: 'Nature Organic',
    description:
      'Greens, rounded shapes, earthy tones. Wellness, organic, sustainability.',
    fonts: ['DM Serif Display', 'DM Sans'],
    swatches: {
      bg: '#FEFDFB',
      primary: '#2D6A2E',
      secondary: '#5B8C5A',
      accent: '#C17817',
      text: '#1B2E1B',
    },
    isDark: false,
  },
  {
    id: 'tech-developer',
    name: 'Tech / Developer',
    description:
      'Code-inspired dark mode. GitHub/Stripe dev docs aesthetic.',
    fonts: ['Inter', 'JetBrains Mono'],
    swatches: {
      bg: '#0D1117',
      primary: '#58A6FF',
      secondary: '#BC8CFF',
      accent: '#39D353',
      text: '#E6EDF3',
    },
    isDark: true,
  },
];

export const SECTION_TYPE_DEFINITIONS: SectionTypeDefinition[] = [
  {
    id: 'navbar',
    name: 'Navigation',
    description: 'Top navigation bar with logo, links, and CTA.',
    variants: ['navbar-minimal', 'navbar-centered', 'navbar-transparent', 'navbar-megamenu'],
    defaultVariant: 'navbar-minimal',
    required: true,
  },
  {
    id: 'hero',
    name: 'Hero',
    description: 'The first thing visitors see — headline, subheadline, and a primary CTA.',
    variants: ['hero-centered', 'hero-split', 'hero-video', 'hero-animated', 'hero-form'],
    defaultVariant: 'hero-centered',
    required: true,
  },
  {
    id: 'features',
    name: 'Features',
    description: 'Highlight what your product or service does — usually 3-6 features.',
    variants: [
      'features-icon-grid',
      'features-bento',
      'features-alternating',
      'features-hover-cards',
    ],
    defaultVariant: 'features-icon-grid',
    required: false,
  },
  {
    id: 'social-proof',
    name: 'Social Proof',
    description: 'Logos of clients, partners, or press to build trust.',
    variants: ['social-proof-marquee', 'social-proof-grid'],
    defaultVariant: 'social-proof-marquee',
    required: false,
  },
  {
    id: 'how-it-works',
    name: 'How It Works',
    description: 'Walk visitors through the 3-5 steps of using your product.',
    variants: ['how-it-works-vertical', 'how-it-works-horizontal', 'how-it-works-cards'],
    defaultVariant: 'how-it-works-vertical',
    required: false,
  },
  {
    id: 'pricing',
    name: 'Pricing',
    description: 'Clear pricing tiers and plan comparisons.',
    variants: ['pricing-three-tier', 'pricing-two-toggle', 'pricing-single-spotlight'],
    defaultVariant: 'pricing-three-tier',
    required: false,
  },
  {
    id: 'testimonials',
    name: 'Testimonials',
    description: 'Quotes from happy customers.',
    variants: [
      'testimonials-cards-grid',
      'testimonials-carousel',
      'testimonials-large-quote',
    ],
    defaultVariant: 'testimonials-cards-grid',
    required: false,
  },
  {
    id: 'cta',
    name: 'Call to Action',
    description: 'A focused conversion block — usually before the footer.',
    variants: ['cta-centered', 'cta-split'],
    defaultVariant: 'cta-centered',
    required: false,
  },
  {
    id: 'footer',
    name: 'Footer',
    description: 'Bottom of the page — links, legal, social, copyright.',
    variants: ['footer-simple', 'footer-multi-column', 'footer-cta'],
    defaultVariant: 'footer-simple',
    required: true,
  },
  {
    id: 'faq',
    name: 'FAQ',
    description: 'Frequently asked questions to remove buyer hesitation.',
    variants: ['faq-accordion', 'faq-two-column'],
    defaultVariant: 'faq-accordion',
    required: false,
  },
  {
    id: 'stats',
    name: 'Stats',
    description: 'Big numbers that prove credibility — customers, uptime, revenue.',
    variants: ['stats-inline', 'stats-cards'],
    defaultVariant: 'stats-inline',
    required: false,
  },
];

export const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  paid: { label: 'Paid', color: 'bg-blue-500/15 text-blue-700 border-blue-500/30' },
  building: { label: 'Building', color: 'bg-yellow-500/15 text-yellow-700 border-yellow-500/30' },
  review: { label: 'In Review', color: 'bg-orange-500/15 text-orange-700 border-orange-500/30' },
  approved: { label: 'Approved', color: 'bg-green-500/15 text-green-700 border-green-500/30' },
  delivered: { label: 'Delivered', color: 'bg-green-500/15 text-green-700 border-green-500/30' },
  revision_requested: {
    label: 'Revision Requested',
    color: 'bg-purple-500/15 text-purple-700 border-purple-500/30',
  },
};
