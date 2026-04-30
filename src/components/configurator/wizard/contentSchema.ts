// Plain-English content form schema. One entry per section type.
// Used by StepContentIntake to render forms a non-technical owner can fill out.
import type { SectionType } from "@/lib/configurator-types";

export type FieldType = "text" | "textarea" | "image" | "url" | "boolean";

interface BaseField {
  key: string;
  label: string;
  placeholder?: string;
  helper?: string;
  type: FieldType;
  /** Show the AI Assist button next to this field. */
  ai?: boolean;
  /** Optional textarea row count. */
  rows?: number;
}

interface ArrayField {
  key: string;
  label: string;
  helper?: string;
  type: "array";
  itemFields: BaseField[];
  defaultItem: Record<string, string | boolean>;
  addLabel: string;
}

export type ContentField = BaseField | ArrayField;

export const SECTION_FORM_SCHEMA: Partial<Record<SectionType, ContentField[]>> = {
  navbar: [
    {
      key: "logo",
      label: "Your business name",
      placeholder: "e.g. Acme Co",
      type: "text",
    },
    {
      key: "ctaLabel",
      label: "Button text",
      placeholder: "e.g. Contact Us, Get Started",
      type: "text",
      ai: true,
    },
    {
      key: "ctaHref",
      label: "Button link",
      placeholder: "e.g. https://calendly.com/you or #contact",
      type: "url",
    },
    {
      key: "links",
      label: "Menu links",
      type: "array",
      addLabel: "Add another link",
      defaultItem: { label: "", href: "" },
      itemFields: [
        { key: "label", label: "Label", placeholder: "e.g. About", type: "text" },
        { key: "href", label: "URL", placeholder: "e.g. /about or #about", type: "url" },
      ],
    },
  ],

  hero: [
    {
      key: "badge",
      label: "Badge text (optional)",
      helper: "Small tag above the headline, e.g. 'Now Available' or 'New'",
      type: "text",
      ai: true,
    },
    {
      key: "headline",
      label: "Main headline",
      placeholder: "e.g. We help small businesses grow online",
      type: "text",
      ai: true,
    },
    {
      key: "subheadline",
      label: "Supporting text",
      placeholder: "e.g. A short sentence about what you do or offer",
      type: "textarea",
      rows: 2,
      ai: true,
    },
    {
      key: "ctaPrimaryLabel",
      label: "Button text",
      placeholder: "e.g. Get Started, Book a Call, Learn More",
      type: "text",
      ai: true,
    },
    {
      key: "ctaPrimaryHref",
      label: "Button link",
      placeholder: "e.g. https://calendly.com/you or #contact",
      type: "url",
    },
    {
      key: "ctaSecondaryLabel",
      label: "Second button text (optional)",
      placeholder: "e.g. See Our Work",
      type: "text",
    },
    {
      key: "ctaSecondaryHref",
      label: "Second button link",
      type: "url",
    },
    {
      key: "image",
      label: "Hero image",
      helper: "Upload a photo or graphic for your hero section",
      type: "image",
    },
  ],

  features: [
    {
      key: "title",
      label: "Section heading",
      placeholder: "e.g. What We Offer, Why Choose Us",
      type: "text",
      ai: true,
    },
    {
      key: "subtitle",
      label: "Section description",
      placeholder: "e.g. A sentence about your services",
      type: "textarea",
      rows: 2,
      ai: true,
    },
    {
      key: "features",
      label: "Your features or services",
      type: "array",
      addLabel: "Add another feature",
      defaultItem: { icon: "Sparkles", title: "", description: "" },
      itemFields: [
        { key: "icon", label: "Icon", placeholder: "e.g. Sparkles, Zap, Shield", type: "text" },
        { key: "title", label: "Title", placeholder: "e.g. Fast Delivery", type: "text", ai: true },
        {
          key: "description",
          label: "Short description",
          placeholder: "e.g. We ship within 24 hours",
          type: "textarea",
          rows: 2,
          ai: true,
        },
      ],
    },
  ],

  "social-proof": [
    {
      key: "label",
      label: "Heading",
      placeholder: "e.g. Trusted by, As seen in, Our partners",
      type: "text",
      ai: true,
    },
    {
      key: "logos",
      label: "Company logos",
      helper: "Add the names (and optional images) of companies you've worked with.",
      type: "array",
      addLabel: "Add another logo",
      defaultItem: { name: "", src: "" },
      itemFields: [
        { key: "name", label: "Company name", placeholder: "e.g. Acme Inc.", type: "text" },
        { key: "src", label: "Logo image URL (optional)", type: "url" },
      ],
    },
  ],

  "how-it-works": [
    { key: "title", label: "Section heading", placeholder: "e.g. How It Works, Our Process", type: "text", ai: true },
    { key: "subtitle", label: "Section description", type: "textarea", rows: 2, ai: true },
    {
      key: "steps",
      label: "Your steps",
      type: "array",
      addLabel: "Add another step",
      defaultItem: { title: "", description: "" },
      itemFields: [
        { key: "title", label: "Step name", placeholder: "e.g. Book a Call", type: "text", ai: true },
        {
          key: "description",
          label: "What happens in this step",
          type: "textarea",
          rows: 2,
          ai: true,
        },
      ],
    },
  ],

  pricing: [
    { key: "title", label: "Section heading", placeholder: "e.g. Pricing, Our Plans", type: "text", ai: true },
    { key: "subtitle", label: "Section description", type: "textarea", rows: 2, ai: true },
    {
      key: "plans",
      label: "Your plans",
      type: "array",
      addLabel: "Add another plan",
      defaultItem: {
        name: "",
        priceMonthly: "",
        priceAnnual: "",
        ctaLabel: "Get started",
        features: "",
        isRecommended: false,
      },
      itemFields: [
        { key: "name", label: "Plan name", placeholder: "e.g. Starter, Pro, Enterprise", type: "text" },
        { key: "priceMonthly", label: "Monthly price", placeholder: "e.g. $29/mo", type: "text" },
        { key: "priceAnnual", label: "Annual price", placeholder: "e.g. $299/yr", type: "text" },
        {
          key: "features",
          label: "What's included",
          helper: "One feature per line.",
          type: "textarea",
          rows: 4,
          ai: true,
        },
        { key: "ctaLabel", label: "Button text", placeholder: "e.g. Get Started", type: "text" },
        { key: "isRecommended", label: "Highlight as recommended?", type: "boolean" },
      ],
    },
  ],

  testimonials: [
    { key: "title", label: "Section heading", placeholder: "e.g. What Our Clients Say", type: "text", ai: true },
    { key: "subtitle", label: "Section description", type: "textarea", rows: 2, ai: true },
    {
      key: "testimonials",
      label: "Client testimonials",
      type: "array",
      addLabel: "Add another testimonial",
      defaultItem: { quote: "", authorName: "", authorRole: "", authorCompany: "", avatar: "" },
      itemFields: [
        { key: "quote", label: "What they said", type: "textarea", rows: 3, ai: true },
        { key: "authorName", label: "Their name", placeholder: "e.g. Jane Doe", type: "text" },
        {
          key: "authorRole",
          label: "Their title or role",
          placeholder: "e.g. CEO, Marketing Director",
          type: "text",
        },
        { key: "authorCompany", label: "Their company", placeholder: "e.g. Acme Inc.", type: "text" },
        { key: "avatar", label: "Their photo (optional)", type: "image" },
      ],
    },
  ],

  cta: [
    { key: "headline", label: "Heading", placeholder: "e.g. Ready to get started?", type: "text", ai: true },
    {
      key: "subtext",
      label: "Supporting text",
      placeholder: "e.g. Join hundreds of happy customers",
      type: "textarea",
      rows: 2,
      ai: true,
    },
    { key: "ctaLabel", label: "Button text", placeholder: "e.g. Start free trial", type: "text", ai: true },
    { key: "ctaHref", label: "Button link", type: "url" },
  ],

  faq: [
    { key: "title", label: "Section heading", placeholder: "e.g. Frequently Asked Questions", type: "text", ai: true },
    { key: "subtitle", label: "Section description", type: "textarea", rows: 2, ai: true },
    {
      key: "items",
      label: "Your questions",
      type: "array",
      addLabel: "Add another question",
      defaultItem: { question: "", answer: "" },
      itemFields: [
        { key: "question", label: "Question", placeholder: "e.g. How long does it take?", type: "text", ai: true },
        { key: "answer", label: "Answer", type: "textarea", rows: 3, ai: true },
      ],
    },
  ],

  stats: [
    { key: "title", label: "Section heading (optional)", placeholder: "e.g. By the Numbers", type: "text", ai: true },
    {
      key: "stats",
      label: "Your numbers",
      type: "array",
      addLabel: "Add another stat",
      defaultItem: { value: "", label: "" },
      itemFields: [
        { key: "value", label: "Number", placeholder: "e.g. 500, 99%, 24/7", type: "text" },
        { key: "label", label: "What it means", placeholder: "e.g. Happy Clients, Uptime, Support", type: "text" },
      ],
    },
  ],

  footer: [
    {
      key: "logo",
      label: "Your business name",
      placeholder: "e.g. Acme Co",
      type: "text",
    },
    {
      key: "copyrightText",
      label: "Copyright text",
      placeholder: "e.g. © 2026 Your Company",
      type: "text",
    },
    {
      key: "links",
      label: "Footer links",
      type: "array",
      addLabel: "Add another link",
      defaultItem: { label: "", href: "" },
      itemFields: [
        { key: "label", label: "Label", placeholder: "e.g. Privacy Policy", type: "text" },
        { key: "href", label: "URL", placeholder: "e.g. /privacy", type: "url" },
      ],
    },
    {
      key: "socialLinks",
      label: "Social media links",
      type: "array",
      addLabel: "Add another social link",
      defaultItem: { platform: "", href: "" },
      itemFields: [
        { key: "platform", label: "Platform", placeholder: "e.g. Twitter, LinkedIn, Instagram", type: "text" },
        { key: "href", label: "URL", placeholder: "e.g. https://...", type: "url" },
      ],
    },
  ],
};
