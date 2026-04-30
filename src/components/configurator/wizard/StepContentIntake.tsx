import { useState } from 'react';
import { Globe, Edit3, Loader2, Plus, Trash2 } from 'lucide-react';
import type { SectionSelection } from '@/lib/configurator-types';
import { SECTION_TYPE_DEFINITIONS } from '@/lib/configurator-constants';
import { Input, Textarea, Field } from '@/components/configurator/ui/form-helpers';
import { Button } from '@/components/configurator/ui/loading-button';
import { cn } from '@/lib/utils';

interface StepContentIntakeProps {
  sections: SectionSelection[];
  content: Record<string, Record<string, unknown>>;
  scrapedUrl: string | null;
  onContentChange: (content: Record<string, Record<string, unknown>>) => void;
  onScrapedUrlChange: (url: string | null) => void;
}

type IntakeMode = 'url' | 'manual';

/**
 * Form schemas per section type. Drives the dynamic ContentForm.
 * Field type maps:
 *   text → Input, textarea → Textarea, image → Input (URL for now),
 *   array → Repeatable group of fields
 */
type FieldDef =
  | { key: string; label: string; type: 'text' | 'textarea' | 'image' }
  | {
      key: string;
      label: string;
      type: 'array';
      itemFields: { key: string; label: string; type: 'text' | 'textarea' | 'image' }[];
      defaultItem: Record<string, string>;
    };

const SECTION_FORM_SCHEMA: Partial<Record<string, FieldDef[]>> = {
  navbar: [
    { key: 'logo', label: 'Logo text', type: 'text' },
    { key: 'logoImage', label: 'Logo image URL', type: 'image' },
    { key: 'ctaLabel', label: 'CTA label', type: 'text' },
    { key: 'ctaHref', label: 'CTA href', type: 'text' },
    {
      key: 'links',
      label: 'Nav links',
      type: 'array',
      defaultItem: { label: '', href: '' },
      itemFields: [
        { key: 'label', label: 'Label', type: 'text' },
        { key: 'href', label: 'Href', type: 'text' },
      ],
    },
  ],
  hero: [
    { key: 'eyebrow', label: 'Eyebrow / badge', type: 'text' },
    { key: 'headline', label: 'Headline', type: 'text' },
    { key: 'subheadline', label: 'Subheadline', type: 'textarea' },
    { key: 'primaryCtaLabel', label: 'Primary CTA label', type: 'text' },
    { key: 'primaryCtaHref', label: 'Primary CTA href', type: 'text' },
    { key: 'secondaryCtaLabel', label: 'Secondary CTA label', type: 'text' },
    { key: 'secondaryCtaHref', label: 'Secondary CTA href', type: 'text' },
    { key: 'image', label: 'Image URL (split/form variants)', type: 'image' },
  ],
  features: [
    { key: 'title', label: 'Section title', type: 'text' },
    { key: 'subtitle', label: 'Section subtitle', type: 'textarea' },
    {
      key: 'features',
      label: 'Features',
      type: 'array',
      defaultItem: { icon: 'Sparkles', title: '', description: '' },
      itemFields: [
        { key: 'icon', label: 'Icon (Lucide name)', type: 'text' },
        { key: 'title', label: 'Title', type: 'text' },
        { key: 'description', label: 'Description', type: 'textarea' },
      ],
    },
  ],
  'social-proof': [
    { key: 'label', label: 'Label (e.g. "Trusted by")', type: 'text' },
    {
      key: 'logos',
      label: 'Logos',
      type: 'array',
      defaultItem: { name: '', src: '' },
      itemFields: [
        { key: 'name', label: 'Company name', type: 'text' },
        { key: 'src', label: 'Logo image URL', type: 'image' },
      ],
    },
  ],
  'how-it-works': [
    { key: 'title', label: 'Section title', type: 'text' },
    { key: 'subtitle', label: 'Section subtitle', type: 'textarea' },
    {
      key: 'steps',
      label: 'Steps',
      type: 'array',
      defaultItem: { title: '', description: '' },
      itemFields: [
        { key: 'title', label: 'Step title', type: 'text' },
        { key: 'description', label: 'Step description', type: 'textarea' },
      ],
    },
  ],
  pricing: [
    { key: 'title', label: 'Section title', type: 'text' },
    { key: 'subtitle', label: 'Section subtitle', type: 'textarea' },
    {
      key: 'plans',
      label: 'Plans',
      type: 'array',
      defaultItem: { name: '', priceMonthly: '', priceAnnual: '', ctaLabel: 'Get started' },
      itemFields: [
        { key: 'name', label: 'Plan name', type: 'text' },
        { key: 'priceMonthly', label: 'Monthly price', type: 'text' },
        { key: 'priceAnnual', label: 'Annual price', type: 'text' },
        { key: 'ctaLabel', label: 'CTA label', type: 'text' },
      ],
    },
  ],
  testimonials: [
    { key: 'title', label: 'Section title', type: 'text' },
    { key: 'subtitle', label: 'Section subtitle', type: 'textarea' },
    {
      key: 'testimonials',
      label: 'Testimonials',
      type: 'array',
      defaultItem: { quote: '', authorName: '', authorRole: '', authorCompany: '' },
      itemFields: [
        { key: 'quote', label: 'Quote', type: 'textarea' },
        { key: 'authorName', label: 'Author name', type: 'text' },
        { key: 'authorRole', label: 'Author role', type: 'text' },
        { key: 'authorCompany', label: 'Company', type: 'text' },
      ],
    },
  ],
  cta: [
    { key: 'headline', label: 'Headline', type: 'text' },
    { key: 'subtext', label: 'Supporting text', type: 'textarea' },
    { key: 'ctaLabel', label: 'CTA label', type: 'text' },
    { key: 'ctaHref', label: 'CTA href', type: 'text' },
  ],
  footer: [
    { key: 'logo', label: 'Logo text', type: 'text' },
    { key: 'copyrightText', label: 'Copyright text', type: 'text' },
    {
      key: 'socialLinks',
      label: 'Social links',
      type: 'array',
      defaultItem: { platform: '', href: '' },
      itemFields: [
        { key: 'platform', label: 'Platform', type: 'text' },
        { key: 'href', label: 'URL', type: 'text' },
      ],
    },
  ],
  faq: [
    { key: 'title', label: 'Section title', type: 'text' },
    { key: 'subtitle', label: 'Section subtitle', type: 'textarea' },
    {
      key: 'items',
      label: 'Q&A',
      type: 'array',
      defaultItem: { question: '', answer: '' },
      itemFields: [
        { key: 'question', label: 'Question', type: 'text' },
        { key: 'answer', label: 'Answer', type: 'textarea' },
      ],
    },
  ],
  stats: [
    { key: 'title', label: 'Section title (optional)', type: 'text' },
    {
      key: 'stats',
      label: 'Stats',
      type: 'array',
      defaultItem: { value: '', label: '' },
      itemFields: [
        { key: 'value', label: 'Value', type: 'text' },
        { key: 'label', label: 'Label', type: 'text' },
      ],
    },
  ],
};

export function StepContentIntake({
  sections,
  content,
  scrapedUrl,
  onContentChange,
  onScrapedUrlChange,
}: StepContentIntakeProps) {
  const [mode, setMode] = useState<IntakeMode>(scrapedUrl ? 'url' : 'manual');
  const [openSection, setOpenSection] = useState<string | null>(sections[0]?.type ?? null);
  const [scraping, setScraping] = useState(false);
  const [scrapeStatus, setScrapeStatus] = useState<string | null>(null);

  function updateSectionContent(type: string, key: string, value: unknown) {
    const next = {
      ...content,
      [type]: { ...(content[type] ?? {}), [key]: value },
    };
    onContentChange(next);
  }

  function setSection(type: string, value: Record<string, unknown>) {
    onContentChange({ ...content, [type]: value });
  }

  async function startScrape() {
    if (!scrapedUrl) return;
    setScraping(true);
    setScrapeStatus(null);
    // The actual scraping happens server-side in the build agent.
    // We just capture the URL here; build-agent will do the work post-checkout.
    setTimeout(() => {
      setScraping(false);
      setScrapeStatus(
        'Saved. Content will be extracted from this URL when your site is built.',
      );
    }, 600);
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-bold text-foreground">Add your content</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Either point us at an existing site to scrape, or fill in the fields per section.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-border p-1 bg-card mb-6 w-full max-w-md">
        <button
          type="button"
          onClick={() => setMode('url')}
          className={cn(
            'flex-1 inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
            mode === 'url' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <Globe className="h-4 w-4" />
          I have a website
        </button>
        <button
          type="button"
          onClick={() => setMode('manual')}
          className={cn(
            'flex-1 inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
            mode === 'manual' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <Edit3 className="h-4 w-4" />
          Enter manually
        </button>
      </div>

      {mode === 'url' ? (
        <div className="rounded-lg border border-border bg-card p-5 max-w-md">
          <Field
            label="Existing site URL"
            htmlFor="scrape-url"
            description="We'll extract headlines, copy, and images, then map them to your selected sections."
          >
            <Input
              id="scrape-url"
              type="url"
              placeholder="https://your-existing-site.com"
              value={scrapedUrl ?? ''}
              onChange={(e) => onScrapedUrlChange(e.target.value || null)}
            />
          </Field>
          <Button
            type="button"
            className="mt-3 w-full"
            onClick={startScrape}
            disabled={!scrapedUrl}
            loading={scraping}
          >
            Save URL for extraction
          </Button>
          {scraping && (
            <p className="text-xs text-muted-foreground/70 mt-3 inline-flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" /> Saving…
            </p>
          )}
          {scrapeStatus && <p className="text-xs text-emerald-500 mt-3">{scrapeStatus}</p>}
          <p className="text-xs text-muted-foreground/70 mt-4">
            You can still edit anything we extract before approving the build.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sections.length === 0 && (
            <p className="text-muted-foreground">Add sections in step 3 first.</p>
          )}
          {sections.map((section) => {
            const def = SECTION_TYPE_DEFINITIONS.find((d) => d.id === section.type);
            const schema = SECTION_FORM_SCHEMA[section.type] ?? [];
            const values = content[section.type] ?? {};
            const isOpen = openSection === section.type;
            return (
              <div
                key={section.type}
                className="rounded-lg border border-border bg-card overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenSection(isOpen ? null : section.type)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left"
                >
                  <div>
                    <div className="font-medium text-foreground">
                      {def?.name ?? section.type}
                    </div>
                    <div className="text-xs text-muted-foreground/70">{section.variant}</div>
                  </div>
                  <span className="text-xs text-muted-foreground/70">{isOpen ? 'Hide' : 'Edit'}</span>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-1 border-t border-border space-y-4">
                    {schema.map((field) => (
                      <FieldRenderer
                        key={field.key}
                        field={field}
                        value={values[field.key]}
                        onChange={(v) => updateSectionContent(section.type, field.key, v)}
                      />
                    ))}
                    {schema.length === 0 && (
                      <p className="text-xs text-muted-foreground/70">No editable fields for this section type yet.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FieldRenderer({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  if (field.type === 'array') {
    const items: Record<string, string>[] = Array.isArray(value)
      ? (value as Record<string, string>[])
      : [];
    return (
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">{field.label}</span>
          <Button
            size="sm"
            variant="outline"
            type="button"
            onClick={() => onChange([...items, { ...field.defaultItem }])}
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Add
          </Button>
        </div>
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="rounded-md border border-border p-3 bg-muted">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground/70">#{i + 1}</span>
                <button
                  type="button"
                  onClick={() => onChange(items.filter((_, idx) => idx !== i))}
                  className="text-muted-foreground/70 hover:text-destructive"
                  aria-label="Remove"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-2">
                {field.itemFields.map((sub) => (
                  <Field key={sub.key} label={sub.label}>
                    {sub.type === 'textarea' ? (
                      <Textarea
                        value={item[sub.key] ?? ''}
                        onChange={(e) =>
                          onChange(
                            items.map((it, idx) =>
                              idx === i ? { ...it, [sub.key]: e.target.value } : it,
                            ),
                          )
                        }
                      />
                    ) : (
                      <Input
                        value={item[sub.key] ?? ''}
                        onChange={(e) =>
                          onChange(
                            items.map((it, idx) =>
                              idx === i ? { ...it, [sub.key]: e.target.value } : it,
                            ),
                          )
                        }
                      />
                    )}
                  </Field>
                ))}
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <p className="text-xs text-muted-foreground/70">None yet — click Add.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <Field label={field.label}>
      {field.type === 'textarea' ? (
        <Textarea
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <Input
          type={field.type === 'image' ? 'url' : 'text'}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.type === 'image' ? 'https://…' : ''}
        />
      )}
    </Field>
  );
}
