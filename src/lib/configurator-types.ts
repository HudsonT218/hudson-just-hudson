export type SiteModel = 'landing' | 'business' | 'portfolio' | 'saas';

export type ThemeId =
  | 'clean-modern'
  | 'bold-dark'
  | 'warm-minimal'
  | 'corporate-sharp'
  | 'vibrant-startup'
  | 'elegant-luxury'
  | 'nature-organic'
  | 'tech-developer';

export type SectionType =
  | 'navbar'
  | 'hero'
  | 'features'
  | 'social-proof'
  | 'how-it-works'
  | 'pricing'
  | 'testimonials'
  | 'cta'
  | 'footer'
  | 'faq'
  | 'stats';

export interface SectionSelection {
  type: SectionType;
  variant: string;
  order: number;
}

export interface SiteSpec {
  model: SiteModel;
  theme: ThemeId;
  sections: SectionSelection[];
  content: Record<string, Record<string, unknown>>;
}

export interface Draft {
  id: string;
  userId: string;
  name: string;
  model: SiteModel | null;
  theme: ThemeId | null;
  sections: SectionSelection[];
  content: Record<string, Record<string, unknown>>;
  currentStep: number;
  scrapedUrl: string | null;
  scrapedContent: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus =
  | 'paid'
  | 'building'
  | 'review'
  | 'approved'
  | 'delivered'
  | 'revision_requested';

export interface Order {
  id: string;
  userId: string;
  draftId: string | null;
  orderNumber: string;
  status: OrderStatus;
  spec: SiteSpec;
  stripePaymentIntentId: string | null;
  stripeCheckoutSessionId: string | null;
  amountPaid: number | null;
  previewUrl: string | null;
  buildStartedAt: string | null;
  buildCompletedAt: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewNotes: string | null;
  iterationCount: number;
  maxIterations: number;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackItem {
  section: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
}

export interface Feedback {
  id: string;
  orderId: string;
  userId: string;
  iterationNumber: number;
  changes: FeedbackItem[];
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
}

export interface Profile {
  id: string;
  email: string;
  fullName: string | null;
  companyName: string | null;
  phone: string | null;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ComponentMetadata {
  id: string;
  name: string;
  sectionType: SectionType;
  compatibleModels: SiteModel[];
  defaultContent: Record<string, unknown>;
  configurableProps: string[];
  tags: string[];
}

export interface ModelDefinition {
  id: SiteModel;
  name: string;
  description: string;
  icon: string;
  defaultSections: SectionType[];
  optionalSections: SectionType[];
  comingSoon: boolean;
  basePrice: number;
}

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  description: string;
  fonts: string[];
  swatches: {
    bg: string;
    primary: string;
    secondary: string;
    accent: string;
    text: string;
  };
  isDark: boolean;
}

export interface SectionTypeDefinition {
  id: SectionType;
  name: string;
  description: string;
  variants: string[];
  defaultVariant: string;
  required: boolean;
}
