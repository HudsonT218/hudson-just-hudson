import { useCallback, useEffect, useRef, useState } from 'react';
import type { Draft, SectionSelection, SiteModel, ThemeId } from '@/lib/configurator-types';
import { getDraft, upsertDraft } from '@/lib/configurator-db';

export interface DraftState {
  id: string | null;
  name: string;
  model: SiteModel | null;
  theme: ThemeId | null;
  sections: SectionSelection[];
  content: Record<string, Record<string, unknown>>;
  currentStep: number;
  scrapedUrl: string | null;
  scrapedContent: Record<string, unknown> | null;
}

export const EMPTY_DRAFT: DraftState = {
  id: null,
  name: 'Untitled Draft',
  model: null,
  theme: null,
  sections: [],
  content: {},
  currentStep: 1,
  scrapedUrl: null,
  scrapedContent: null,
};

interface UseDraftOptions {
  userId: string | null;
  draftId?: string;
  debounceMs?: number;
}

export function useDraft({ userId, draftId, debounceMs = 2000 }: UseDraftOptions) {
  const [state, setState] = useState<DraftState>(EMPTY_DRAFT);
  const [hydrating, setHydrating] = useState<boolean>(Boolean(draftId));
  const [saving, setSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didHydrate = useRef(false);
  const dirtyRef = useRef(false);

  // Hydrate from existing draft if draftId in URL
  useEffect(() => {
    let cancelled = false;
    if (!draftId) {
      didHydrate.current = true;
      setHydrating(false);
      return;
    }
    setHydrating(true);
    getDraft(draftId).then((d) => {
      if (cancelled) return;
      if (d) {
        setState({
          id: d.id,
          name: d.name,
          model: d.model,
          theme: d.theme,
          sections: d.sections,
          content: d.content,
          currentStep: d.currentStep,
          scrapedUrl: d.scrapedUrl,
          scrapedContent: d.scrapedContent,
        });
      }
      didHydrate.current = true;
      setHydrating(false);
    });
    return () => {
      cancelled = true;
    };
  }, [draftId]);

  // Auto-save (debounced)
  useEffect(() => {
    if (!userId) return;
    if (!didHydrate.current) return;
    if (!dirtyRef.current) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setSaving(true);
      const saved = await upsertDraft({
        id: state.id ?? undefined,
        userId,
        name: state.name,
        model: state.model ?? undefined,
        theme: state.theme ?? undefined,
        sections: state.sections,
        content: state.content,
        currentStep: state.currentStep,
        scrapedUrl: state.scrapedUrl,
        scrapedContent: state.scrapedContent,
      });
      setSaving(false);
      if (saved) {
        setState((prev) => (prev.id ? prev : { ...prev, id: saved.id }));
        setLastSavedAt(saved.updatedAt);
        dirtyRef.current = false;
      }
    }, debounceMs);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [state, userId, debounceMs]);

  const update = useCallback(<K extends keyof DraftState>(key: K, value: DraftState[K]) => {
    dirtyRef.current = true;
    setState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const merge = useCallback((patch: Partial<DraftState>) => {
    dirtyRef.current = true;
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  const reset = useCallback(() => {
    dirtyRef.current = true;
    setState(EMPTY_DRAFT);
  }, []);

  /** Force-save immediately (e.g. before checkout). */
  const flush = useCallback(async (): Promise<Draft | null> => {
    if (!userId) return null;
    setSaving(true);
    const saved = await upsertDraft({
      id: state.id ?? undefined,
      userId,
      name: state.name,
      model: state.model ?? undefined,
      theme: state.theme ?? undefined,
      sections: state.sections,
      content: state.content,
      currentStep: state.currentStep,
      scrapedUrl: state.scrapedUrl,
      scrapedContent: state.scrapedContent,
    });
    setSaving(false);
    if (saved) {
      setLastSavedAt(saved.updatedAt);
      dirtyRef.current = false;
    }
    return saved;
  }, [state, userId]);

  return {
    draft: state,
    hydrating,
    saving,
    lastSavedAt,
    update,
    merge,
    reset,
    flush,
  };
}
