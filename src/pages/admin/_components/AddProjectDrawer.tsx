import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createProject, listLeads } from "@/lib/lead-os-db";
import {
  PROJECT_TYPES,
  PROJECT_TYPE_LABEL,
  type Lead,
  type ProjectType,
} from "@/lib/lead-os-types";

const DEFAULT_RATE_BY_TYPE: Record<ProjectType, number> = {
  web: 75,
  software: 75,
  automation: 75,
  ai: 100,
};

export const AddProjectDrawer = ({
  open,
  onOpenChange,
  presetLeadId,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  presetLeadId?: string;
  onCreated: (projectId: string) => void;
}) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [projectType, setProjectType] = useState<ProjectType>("web");
  const [hourlyRate, setHourlyRate] = useState("75");
  const [rateTouched, setRateTouched] = useState(false);
  const [estimatedHours, setEstimatedHours] = useState("");
  const [leadId, setLeadId] = useState<string>(presetLeadId ?? "none");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (presetLeadId) {
      setLeadId(presetLeadId);
      return;
    }
    listLeads().then(setLeads).catch(() => setLeads([]));
  }, [open, presetLeadId]);

  const handleProjectTypeChange = (t: ProjectType) => {
    setProjectType(t);
    if (!rateTouched) setHourlyRate(String(DEFAULT_RATE_BY_TYPE[t]));
  };

  const handleRateChange = (v: string) => {
    setHourlyRate(v);
    setRateTouched(true);
  };

  const reset = () => {
    setName("");
    setDescription("");
    setProjectType("web");
    setHourlyRate("75");
    setRateTouched(false);
    setEstimatedHours("");
    setLeadId(presetLeadId ?? "none");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    const rate = Number(hourlyRate);
    if (!Number.isFinite(rate) || rate <= 0) {
      setError("Hourly rate must be a positive number.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const project = await createProject({
        name: name.trim(),
        description: description.trim() || null,
        project_type: projectType,
        status: "discovery",
        hourly_rate: rate,
        estimated_hours: estimatedHours.trim() ? Number(estimatedHours) : null,
        notes: null,
        start_date: null,
        target_date: null,
        lead_id: leadId === "none" ? null : leadId,
      });
      reset();
      onCreated(project.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>New Project</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div>
            <Label htmlFor="proj-name">Project name *</Label>
            <Input
              id="proj-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div>
            <Label htmlFor="proj-desc">Description</Label>
            <Textarea
              id="proj-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="proj-type">Type</Label>
              <Select
                value={projectType}
                onValueChange={(v) => handleProjectTypeChange(v as ProjectType)}
              >
                <SelectTrigger id="proj-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {PROJECT_TYPE_LABEL[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="proj-rate">Hourly rate</Label>
              <Input
                id="proj-rate"
                type="number"
                inputMode="decimal"
                value={hourlyRate}
                onChange={(e) => handleRateChange(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="proj-hours">Estimated hours</Label>
            <Input
              id="proj-hours"
              type="number"
              inputMode="decimal"
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(e.target.value)}
            />
          </div>

          {!presetLeadId && (
            <div>
              <Label htmlFor="proj-lead">Lead (optional)</Label>
              <Select value={leadId} onValueChange={setLeadId}>
                <SelectTrigger id="proj-lead">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— none —</SelectItem>
                  {leads.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.name}
                      {l.company ? ` · ${l.company}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {error ? <p className="text-sm text-red-400">{error}</p> : null}

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving…" : "Create Project"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};
