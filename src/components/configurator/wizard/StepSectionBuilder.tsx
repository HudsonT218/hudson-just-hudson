import { useMemo, useState } from 'react';
import { GripVertical, Trash2, ChevronDown, ChevronUp, Plus, Check } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SECTION_TYPE_DEFINITIONS } from '@/lib/configurator-constants';
import type { SectionSelection, SectionType } from '@/lib/configurator-types';
import { Button } from '@/components/configurator/ui/loading-button';
import { cn } from '@/lib/utils';

interface StepSectionBuilderProps {
  sections: SectionSelection[];
  onChange: (sections: SectionSelection[]) => void;
}

export function StepSectionBuilder({ sections, onChange }: StepSectionBuilderProps) {
  const [openType, setOpenType] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const usedTypes = useMemo(() => new Set(sections.map((s) => s.type)), [sections]);
  const addable = SECTION_TYPE_DEFINITIONS.filter((s) => !usedTypes.has(s.id));

  function setVariant(idx: number, variant: string) {
    const next = sections.map((s, i) => (i === idx ? { ...s, variant } : s));
    onChange(next);
  }

  function removeSection(idx: number) {
    const next = sections.filter((_, i) => i !== idx).map((s, i) => ({ ...s, order: i }));
    onChange(next);
  }

  function addSection(type: SectionType) {
    const def = SECTION_TYPE_DEFINITIONS.find((d) => d.id === type)!;
    onChange([
      ...sections,
      { type, variant: def.defaultVariant, order: sections.length },
    ]);
    setShowAdd(false);
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
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground">Build your sections</h2>
        <p className="text-muted-foreground mt-1">
          Drag to reorder, click a section to swap its variant, or remove sections you don&apos;t need.
        </p>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sections.map((s) => s.type)} strategy={verticalListSortingStrategy}>
          <ul className="space-y-3">
            {sections.map((section, idx) => {
              const def = SECTION_TYPE_DEFINITIONS.find((d) => d.id === section.type)!;
              const isOpen = openType === section.type;
              return (
                <SortableSection
                  key={section.type}
                  id={section.type}
                  section={section}
                  defName={def.name}
                  defDescription={def.description}
                  variants={def.variants}
                  required={def.required}
                  isOpen={isOpen}
                  onToggle={() => setOpenType(isOpen ? null : section.type)}
                  onPickVariant={(v) => setVariant(idx, v)}
                  onRemove={() => removeSection(idx)}
                />
              );
            })}
          </ul>
        </SortableContext>
      </DndContext>

      <div className="mt-6">
        {showAdd ? (
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="text-sm font-medium text-foreground mb-2">Add a section</div>
            {addable.length === 0 ? (
              <p className="text-sm text-muted-foreground/70">All section types are already in your site.</p>
            ) : (
              <ul className="space-y-1">
                {addable.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => addSection(s.id)}
                      className="w-full text-left rounded-md px-3 py-2 hover:bg-accent text-sm"
                    >
                      <div className="font-medium text-foreground">{s.name}</div>
                      <div className="text-xs text-muted-foreground/70">{s.description}</div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-3 flex justify-end">
              <Button size="sm" variant="outline" onClick={() => setShowAdd(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="outline" onClick={() => setShowAdd(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add section
          </Button>
        )}
      </div>
    </div>
  );
}

interface SortableSectionProps {
  id: string;
  section: SectionSelection;
  defName: string;
  defDescription: string;
  variants: string[];
  required: boolean;
  isOpen: boolean;
  onToggle: () => void;
  onPickVariant: (variant: string) => void;
  onRemove: () => void;
}

function SortableSection({
  id,
  section,
  defName,
  defDescription,
  variants,
  required,
  isOpen,
  onToggle,
  onPickVariant,
  onRemove,
}: SortableSectionProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'rounded-lg border bg-card',
        isDragging ? 'border-primary shadow-lg' : 'border-border',
      )}
    >
      <div className="flex items-center gap-2 p-3">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="text-muted-foreground/70 hover:text-foreground cursor-grab active:cursor-grabbing"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-5 w-5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">{defName}</span>
            {required && <span className="text-xs text-muted-foreground/70">(required)</span>}
          </div>
          <div className="text-xs text-muted-foreground/70 truncate">
            Variant: <span className="font-medium text-muted-foreground">{section.variant}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="p-1.5 text-muted-foreground/70 hover:text-foreground"
          aria-label={isOpen ? 'Hide variants' : 'Show variants'}
        >
          {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>
        {!required && (
          <button
            type="button"
            onClick={onRemove}
            className="p-1.5 text-muted-foreground/70 hover:text-destructive"
            aria-label="Remove section"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="px-3 pb-3 pt-1 border-t border-border">
          <p className="text-xs text-muted-foreground/70 mb-3 mt-2">{defDescription}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {variants.map((v) => {
              const active = v === section.variant;
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => onPickVariant(v)}
                  className={cn(
                    'rounded-md border px-3 py-2 text-xs text-left transition-colors',
                    active
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background hover:bg-accent text-muted-foreground',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">{v.replace(`${section.type}-`, '')}</span>
                    {active && <Check className="h-3.5 w-3.5 ml-1 shrink-0" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </li>
  );
}
