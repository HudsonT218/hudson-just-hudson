import { useState } from "react";
import {
  Globe,
  Edit3,
  Sparkles,
  Plus,
  Trash2,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SECTION_TYPE_DEFINITIONS } from "@/lib/configurator-constants";
import type { SectionSelection, SectionType } from "@/lib/configurator-types";
import { cn } from "@/lib/utils";
import { SECTION_FORM_SCHEMA, type ContentField } from "./contentSchema";

interface StepContentIntakeProps {
  sections: SectionSelection[];
  content: Record<string, Record<string, unknown>>;
  scrapedUrl: string | null;
  onContentChange: (content: Record<string, Record<string, unknown>>) => void;
  onScrapedUrlChange: (url: string | null) => void;
}

type IntakeMode = "url" | "manual";

/**
 * Step 4, full-form layout. Left vertical section nav + form fields for the
 * selected section. Plain-English labels via SECTION_FORM_SCHEMA. AI Assist
 * tooltip placeholder on text fields.
 */
export function StepContentIntake({
  sections,
  content,
  scrapedUrl,
  onContentChange,
  onScrapedUrlChange,
}: StepContentIntakeProps) {
  const [mode, setMode] = useState<IntakeMode>(scrapedUrl ? "url" : "manual");
  const [selectedSection, setSelectedSection] = useState<SectionType | null>(
    sections[0]?.type ?? null,
  );
  const [scraping, setScraping] = useState(false);
  const [scrapeStatus, setScrapeStatus] = useState<string | null>(null);

  function updateSectionContent(type: string, key: string, value: unknown) {
    onContentChange({
      ...content,
      [type]: { ...(content[type] ?? {}), [key]: value },
    });
  }

  async function startScrape() {
    if (!scrapedUrl) return;
    setScraping(true);
    setScrapeStatus(null);
    setTimeout(() => {
      setScraping(false);
      setScrapeStatus(
        "Saved. Content will be extracted from this URL when your site is built.",
      );
    }, 600);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Mode tabs */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-foreground">Add your content</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Either point us at an existing site to extract from, or fill in your content directly.
        </p>
      </div>

      <div className="flex gap-1 rounded-md border border-border bg-card/40 p-1 mb-6 w-full max-w-md">
        <ModeTab active={mode === "url"} onClick={() => setMode("url")} icon={<Globe className="h-4 w-4" />}>
          I have a website
        </ModeTab>
        <ModeTab
          active={mode === "manual"}
          onClick={() => setMode("manual")}
          icon={<Edit3 className="h-4 w-4" />}
        >
          Enter manually
        </ModeTab>
      </div>

      {mode === "url" ? (
        <div className="rounded-lg border border-border bg-card/40 backdrop-blur-sm p-5 max-w-md">
          <div className="space-y-1.5">
            <Label htmlFor="scrape-url">Existing site URL</Label>
            <Input
              id="scrape-url"
              type="url"
              placeholder="https://your-existing-site.com"
              value={scrapedUrl ?? ""}
              onChange={(e) => onScrapedUrlChange(e.target.value || null)}
            />
            <p className="text-xs text-muted-foreground">
              We&apos;ll extract headlines, copy, and images, then map them to your selected sections.
              You can review everything before approving the build.
            </p>
          </div>
          <Button
            type="button"
            className="mt-3 w-full"
            onClick={startScrape}
            disabled={!scrapedUrl || scraping}
          >
            {scraping ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
            Save URL for extraction
          </Button>
          {scrapeStatus && <p className="text-xs text-emerald-500 mt-3">{scrapeStatus}</p>}
        </div>
      ) : sections.length === 0 ? (
        <p className="text-sm text-muted-foreground">Add sections in step 3 first.</p>
      ) : (
        <TooltipProvider>
          <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-6">
            {/* Section nav */}
            <nav className="lg:sticky lg:top-[50px] lg:self-start" aria-label="Sections">
              <ul className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
                {sections.map((section) => {
                  const def = SECTION_TYPE_DEFINITIONS.find((d) => d.id === section.type);
                  const active = selectedSection === section.type;
                  return (
                    <li key={section.type} className="shrink-0">
                      <button
                        type="button"
                        onClick={() => setSelectedSection(section.type)}
                        className={cn(
                          "w-full text-left px-3 py-2 text-sm rounded-md transition-colors lg:border-l-2",
                          active
                            ? "lg:border-blue-400 text-foreground bg-blue-400/5 lg:bg-transparent"
                            : "lg:border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/40",
                        )}
                      >
                        {def?.name ?? section.type}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Form */}
            <div className="min-w-0">
              {selectedSection ? (
                <SectionForm
                  type={selectedSection}
                  values={content[selectedSection] ?? {}}
                  onChange={(key, value) => updateSectionContent(selectedSection, key, value)}
                />
              ) : (
                <p className="text-sm text-muted-foreground">Select a section on the left to edit its content.</p>
              )}
            </div>
          </div>
        </TooltipProvider>
      )}
    </div>
  );
}

function ModeTab({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-1 inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {icon}
      {children}
    </button>
  );
}

interface SectionFormProps {
  type: SectionType;
  values: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
}

function SectionForm({ type, values, onChange }: SectionFormProps) {
  const def = SECTION_TYPE_DEFINITIONS.find((d) => d.id === type);
  const schema = SECTION_FORM_SCHEMA[type] ?? [];

  return (
    <div>
      <h3 className="text-base font-semibold text-foreground mb-1">{def?.name}</h3>
      <p className="text-xs text-muted-foreground mb-5">{def?.description}</p>
      <div className="space-y-5 max-w-2xl">
        {schema.map((field) => (
          <FieldRenderer
            key={field.key}
            field={field}
            value={values[field.key]}
            onChange={(v) => onChange(field.key, v)}
          />
        ))}
        {schema.length === 0 && (
          <p className="text-xs text-muted-foreground">No editable fields for this section yet.</p>
        )}
      </div>
    </div>
  );
}

interface FieldRendererProps {
  field: ContentField;
  value: unknown;
  onChange: (v: unknown) => void;
}

function FieldRenderer({ field, value, onChange }: FieldRendererProps) {
  if (field.type === "array") {
    const items: Record<string, string | boolean>[] = Array.isArray(value)
      ? (value as Record<string, string | boolean>[])
      : [];
    return (
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>{field.label}</Label>
          <Button
            size="sm"
            variant="outline"
            type="button"
            onClick={() => onChange([...items, { ...field.defaultItem }])}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            {field.addLabel}
          </Button>
        </div>
        {field.helper && <p className="text-xs text-muted-foreground mb-3">{field.helper}</p>}
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="rounded-md border border-border p-3 bg-card/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">#{i + 1}</span>
                <button
                  type="button"
                  onClick={() => onChange(items.filter((_, idx) => idx !== i))}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label="Remove"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-3">
                {field.itemFields.map((sub) => (
                  <ScalarField
                    key={sub.key}
                    field={sub}
                    value={item[sub.key]}
                    onChange={(v) =>
                      onChange(
                        items.map((it, idx) =>
                          idx === i ? { ...it, [sub.key]: v as string | boolean } : it,
                        ),
                      )
                    }
                  />
                ))}
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <p className="text-xs text-muted-foreground">None yet, click {field.addLabel.toLowerCase()}.</p>
          )}
        </div>
      </div>
    );
  }

  return <ScalarField field={field} value={value} onChange={onChange} />;
}

function ScalarField({
  field,
  value,
  onChange,
}: {
  field: Exclude<ContentField, { type: "array" }>;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const id = `f-${field.key}-${Math.random().toString(36).slice(2, 8)}`;

  if (field.type === "boolean") {
    return (
      <div className="flex items-center justify-between gap-3">
        <div>
          <Label htmlFor={id} className="text-sm">
            {field.label}
          </Label>
          {field.helper && (
            <p className="text-xs text-muted-foreground mt-0.5">{field.helper}</p>
          )}
        </div>
        <Switch id={id} checked={Boolean(value)} onCheckedChange={(c) => onChange(c)} />
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-sm">
          {field.label}
        </Label>
        {field.ai && <AIAssistButton />}
      </div>
      {field.type === "textarea" ? (
        <Textarea
          id={id}
          rows={field.rows ?? 3}
          placeholder={field.placeholder}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <Input
          id={id}
          type={field.type === "url" || field.type === "image" ? "url" : "text"}
          placeholder={field.placeholder}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {field.helper && <p className="text-xs text-muted-foreground">{field.helper}</p>}
    </div>
  );
}

function AIAssistButton() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
        >
          <Sparkles className="h-3 w-3" />
          AI Assist
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">AI copywriting coming soon</TooltipContent>
    </Tooltip>
  );
}
