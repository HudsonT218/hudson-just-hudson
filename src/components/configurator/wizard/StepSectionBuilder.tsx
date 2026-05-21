import { useState } from "react";
import {
  ChevronDown,
  Plus,
  X,
  GripHorizontal,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SECTION_TYPE_DEFINITIONS } from "@/lib/configurator-constants";
import type { SectionSelection, SectionType } from "@/lib/configurator-types";
import { cn } from "@/lib/utils";

interface StepSectionBuilderProps {
  sections: SectionSelection[];
  onChange: (sections: SectionSelection[]) => void;
}

/**
 * Step 3 panel, horizontal chips with variant popovers.
 * Used inside the WizardShell's expanded panel ("panel" mode).
 */
export function StepSectionBuilder({ sections, onChange }: StepSectionBuilderProps) {
  const [addOpen, setAddOpen] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const usedTypes = new Set(sections.map((s) => s.type));
  const addable = SECTION_TYPE_DEFINITIONS.filter((s) => !usedTypes.has(s.id));

  function setVariant(idx: number, variant: string) {
    onChange(sections.map((s, i) => (i === idx ? { ...s, variant } : s)));
  }

  function removeSection(idx: number) {
    onChange(sections.filter((_, i) => i !== idx).map((s, i) => ({ ...s, order: i })));
  }

  function addSection(type: SectionType) {
    const def = SECTION_TYPE_DEFINITIONS.find((d) => d.id === type)!;
    onChange([...sections, { type, variant: def.defaultVariant, order: sections.length }]);
    setAddOpen(false);
  }

  function moveSection(idx: number, direction: -1 | 1) {
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= sections.length) return;
    const moved = arrayMove(sections, idx, newIdx).map((s, i) => ({ ...s, order: i }));
    onChange(moved);
  }

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = sections.findIndex((s) => s.type === active.id);
    const newIndex = sections.findIndex((s) => s.type === over.id);
    const moved = arrayMove(sections, oldIndex, newIndex).map((s, i) => ({ ...s, order: i }));
    onChange(moved);
  }

  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            Sections:{" "}
            <span className="text-muted-foreground font-normal">
              click ▾ to swap a variant, drag to reorder
            </span>
          </h2>
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sections.map((s) => s.type)} strategy={horizontalListSortingStrategy}>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {sections.map((section, idx) => {
              const def = SECTION_TYPE_DEFINITIONS.find((d) => d.id === section.type)!;
              return (
                <SectionChip
                  key={section.type}
                  id={section.type}
                  label={def.name}
                  variant={section.variant}
                  variants={def.variants}
                  required={def.required}
                  isFirst={idx === 0}
                  isLast={idx === sections.length - 1}
                  onPickVariant={(v) => setVariant(idx, v)}
                  onRemove={() => removeSection(idx)}
                  onMoveLeft={() => moveSection(idx, -1)}
                  onMoveRight={() => moveSection(idx, 1)}
                />
              );
            })}

            {/* Add section chip */}
            {addable.length > 0 && (
              <Popover open={addOpen} onOpenChange={setAddOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="shrink-0 inline-flex items-center gap-1 h-8 px-3 rounded-full border border-dashed border-white/15 text-xs text-muted-foreground hover:text-foreground hover:border-white/30 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add section
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-1" align="start">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground/70 px-2 py-1.5">
                    Available
                  </div>
                  <ul className="max-h-72 overflow-auto">
                    {addable.map((s) => (
                      <li key={s.id}>
                        <button
                          type="button"
                          onClick={() => addSection(s.id)}
                          className="w-full text-left rounded-md px-2 py-1.5 hover:bg-accent text-sm"
                        >
                          <div className="font-medium text-foreground">{s.name}</div>
                          <div className="text-xs text-muted-foreground/80 line-clamp-1">{s.description}</div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

interface SectionChipProps {
  id: string;
  label: string;
  variant: string;
  variants: string[];
  required: boolean;
  isFirst: boolean;
  isLast: boolean;
  onPickVariant: (variant: string) => void;
  onRemove: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
}

function SectionChip({
  id,
  label,
  variant,
  variants,
  required,
  isFirst,
  isLast,
  onPickVariant,
  onRemove,
  onMoveLeft,
  onMoveRight,
}: SectionChipProps) {
  const [open, setOpen] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "shrink-0 group inline-flex items-center gap-1 h-8 pl-1 pr-1 rounded-full border bg-card/40 text-xs",
        isDragging ? "border-blue-400 shadow-lg" : "border-white/10",
      )}
    >
      {/* Drag handle */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="hidden md:inline-flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <GripHorizontal className="h-3.5 w-3.5" />
      </button>

      {/* Mobile move arrows (no drag) */}
      <button
        type="button"
        onClick={onMoveLeft}
        disabled={isFirst}
        className="md:hidden h-6 w-6 inline-flex items-center justify-center text-muted-foreground disabled:opacity-30"
        aria-label="Move left"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </button>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center gap-1 px-2 py-1 rounded-full hover:bg-white/5 transition-colors"
          >
            <span className="text-foreground font-medium">{label}</span>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-1" side="top" align="center" sideOffset={8}>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground/70 px-2 py-1.5">
            Choose a variant
          </div>
          <ul>
            {variants.map((v) => {
              const active = v === variant;
              return (
                <li key={v}>
                  <button
                    type="button"
                    onClick={() => {
                      onPickVariant(v);
                      setOpen(false);
                    }}
                    className={cn(
                      "w-full inline-flex items-center justify-between text-left rounded-md px-2 py-1.5 text-sm transition-colors",
                      active ? "bg-blue-400/15 text-foreground" : "hover:bg-accent text-muted-foreground",
                    )}
                  >
                    <span className="font-mono text-[11px]">
                      {v.replace(/^[a-z-]+-/, "")}
                    </span>
                    {active && <Check className="h-3.5 w-3.5 text-blue-400" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </PopoverContent>
      </Popover>

      {/* Mobile move-right */}
      <button
        type="button"
        onClick={onMoveRight}
        disabled={isLast}
        className="md:hidden h-6 w-6 inline-flex items-center justify-center text-muted-foreground disabled:opacity-30"
        aria-label="Move right"
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </button>

      {!required && (
        <button
          type="button"
          onClick={onRemove}
          className="h-6 w-6 inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-destructive opacity-60 group-hover:opacity-100 transition-opacity"
          aria-label={`Remove ${label}`}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
