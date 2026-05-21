import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { FeedbackItem, Order } from '@/lib/configurator-types';
import { Button } from '@/components/configurator/ui/loading-button';
import { Input, Textarea, Field } from '@/components/configurator/ui/form-helpers';
import { SECTION_TYPE_DEFINITIONS } from '@/lib/configurator-constants';
import { submitFeedback, updateOrderStatus, supabase } from '@/lib/configurator-db';

interface FeedbackFormProps {
  order: Order;
  userId: string;
  onSubmitted: () => void;
}

export function FeedbackForm({ order, userId, onSubmitted }: FeedbackFormProps) {
  const remaining = order.maxIterations - order.iterationCount;
  const [items, setItems] = useState<FeedbackItem[]>([
    { section: order.spec.sections[0]?.type ?? '', description: '', priority: 'medium' },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (remaining <= 0) {
    return (
      <div className="rounded-md bg-muted/50 border border-border p-4 text-sm text-muted-foreground">
        You&apos;ve used all 5 included revision rounds. Need more changes?{' '}
        <a href="mailto:hudson@hudsonturansky.com" className="text-primary hover:underline">
          Contact us
        </a>
        .
      </div>
    );
  }

  function updateItem(idx: number, patch: Partial<FeedbackItem>) {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }

  function addItem() {
    setItems((prev) => [
      ...prev,
      { section: order.spec.sections[0]?.type ?? '', description: '', priority: 'medium' },
    ]);
  }

  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const valid = items.every((it) => it.description.trim().length > 0 && it.section);
    if (!valid) {
      setError('Each change needs a section and a description.');
      setSubmitting(false);
      return;
    }
    const result = await submitFeedback({
      orderId: order.id,
      userId,
      iterationNumber: order.iterationCount + 1,
      changes: items,
    });
    if (!result) {
      setError('Could not submit feedback. Try again or contact us.');
      setSubmitting(false);
      return;
    }
    await updateOrderStatus(order.id, 'revision_requested', {
      iteration_count: order.iterationCount + 1,
    });

    // Best-effort admin notification, don't block the success path on it.
    try {
      const { data: profileRow } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', userId)
        .single();
      const clientName = (profileRow?.full_name as string | null) ?? (profileRow?.email as string | null) ?? 'A client';
      await supabase.functions.invoke('notify-feedback', {
        body: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          clientName,
          iterationNumber: order.iterationCount + 1,
          maxIterations: order.maxIterations,
          changeCount: items.length,
        },
      });
    } catch (e) {
      // Notification is best-effort; admin can also poll the dashboard.
      console.warn('[feedback] notify-feedback failed:', e);
    }

    setSubmitting(false);
    onSubmitted();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Revision <strong>{order.iterationCount + 1}</strong> of {order.maxIterations}
      </div>
      {items.map((item, idx) => (
        <div key={idx} className="rounded-md border border-border p-4 space-y-3 bg-muted">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground/70">Change #{idx + 1}</span>
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="text-muted-foreground/70 hover:text-destructive"
                aria-label="Remove"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
          <Field label="Section" htmlFor={`section-${idx}`}>
            <select
              id={`section-${idx}`}
              value={item.section}
              onChange={(e) => updateItem(idx, { section: e.target.value })}
              className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus-visible:ring-ring"
            >
              {order.spec.sections.map((s) => {
                const def = SECTION_TYPE_DEFINITIONS.find((d) => d.id === s.type);
                return (
                  <option key={s.type} value={s.type}>
                    {def?.name ?? s.type}
                  </option>
                );
              })}
            </select>
          </Field>
          <Field label="What would you like changed?" htmlFor={`desc-${idx}`}>
            <Textarea
              id={`desc-${idx}`}
              value={item.description}
              onChange={(e) => updateItem(idx, { description: e.target.value })}
              placeholder="Be specific, copy changes, color tweaks, layout adjustments…"
            />
          </Field>
          <Field label="Priority" htmlFor={`prio-${idx}`}>
            <select
              id={`prio-${idx}`}
              value={item.priority}
              onChange={(e) =>
                updateItem(idx, { priority: e.target.value as FeedbackItem['priority'] })
              }
              className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus-visible:ring-ring"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </Field>
        </div>
      ))}

      <Button type="button" variant="outline" onClick={addItem}>
        <Plus className="h-4 w-4 mr-1" /> Add another change
      </Button>

      {error && (
        <p className="text-sm text-destructive rounded-md bg-destructive/10 px-3 py-2">{error}</p>
      )}

      <Button type="submit" loading={submitting} className="w-full">
        Submit feedback
      </Button>
    </form>
  );
}
