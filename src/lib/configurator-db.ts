// Configurator data access — reuses the main site's Supabase client.
import { supabase } from '@/integrations/supabase/client';
import type {
  Draft,
  Order,
  Profile,
  SiteSpec,
  Feedback,
  FeedbackItem,
} from './configurator-types';

export { supabase };

export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
);

// ============================================================================
// Profiles
// ============================================================================

export async function getCurrentProfile(): Promise<Profile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const [{ data }, { data: roles }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('user_roles').select('role').eq('user_id', user.id),
  ]);
  if (!data) return null;
  const isAdmin = (roles ?? []).some((r: { role: string }) => r.role === 'admin');
  return mapProfile(data as Record<string, unknown>, isAdmin);
}

function mapProfile(row: Record<string, unknown>, isAdmin = false): Profile {
  return {
    id: row.id as string,
    email: row.email as string,
    fullName: (row.full_name as string | null) ?? null,
    companyName: (row.company_name as string | null) ?? null,
    phone: (row.phone as string | null) ?? null,
    isAdmin,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

// ============================================================================
// Drafts
// ============================================================================

export async function getDrafts(userId: string): Promise<Draft[]> {
  const { data } = await supabase
    .from('drafts')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  return ((data ?? []) as Record<string, unknown>[]).map(mapDraft);
}

export async function getDraft(draftId: string): Promise<Draft | null> {
  const { data } = await supabase.from('drafts').select('*').eq('id', draftId).single();
  return data ? mapDraft(data as Record<string, unknown>) : null;
}

export async function upsertDraft(
  draft: Partial<Draft> & { userId: string },
): Promise<Draft | null> {
  const payload: Record<string, unknown> = {
    user_id: draft.userId,
    name: draft.name ?? 'Untitled Draft',
    model: draft.model ?? null,
    theme: draft.theme ?? null,
    sections: draft.sections ?? [],
    content: draft.content ?? {},
    current_step: draft.currentStep ?? 1,
    scraped_url: draft.scrapedUrl ?? null,
    scraped_content: draft.scrapedContent ?? null,
    updated_at: new Date().toISOString(),
  };
  if (draft.id) payload.id = draft.id;
  const { data } = await supabase.from('drafts').upsert(payload as never).select().single();
  return data ? mapDraft(data as Record<string, unknown>) : null;
}

export async function deleteDraft(draftId: string): Promise<void> {
  await supabase.from('drafts').delete().eq('id', draftId);
}

function mapDraft(row: Record<string, unknown>): Draft {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    name: (row.name as string) ?? 'Untitled Draft',
    model: (row.model as Draft['model']) ?? null,
    theme: (row.theme as Draft['theme']) ?? null,
    sections: (row.sections as Draft['sections']) ?? [],
    content: (row.content as Draft['content']) ?? {},
    currentStep: (row.current_step as number) ?? 1,
    scrapedUrl: (row.scraped_url as string | null) ?? null,
    scrapedContent: (row.scraped_content as Record<string, unknown> | null) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

// ============================================================================
// Orders
// ============================================================================

export async function getOrders(userId: string): Promise<Order[]> {
  const { data } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return ((data ?? []) as Record<string, unknown>[]).map(mapOrder);
}

export async function getAllOrders(): Promise<Order[]> {
  const { data } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
  return ((data ?? []) as Record<string, unknown>[]).map(mapOrder);
}

export async function getOrder(orderId: string): Promise<Order | null> {
  const { data } = await supabase.from('orders').select('*').eq('id', orderId).single();
  return data ? mapOrder(data as Record<string, unknown>) : null;
}

export async function createOrder(input: {
  userId: string;
  draftId: string | null;
  spec: SiteSpec;
  amountPaid: number;
  stripeCheckoutSessionId?: string;
  stripePaymentIntentId?: string;
  orderNumber: string;
}): Promise<Order | null> {
  const { data } = await supabase
    .from('orders')
    .insert([{
      user_id: input.userId,
      draft_id: input.draftId,
      order_number: input.orderNumber,
      status: 'paid',
      spec: input.spec as never,
      amount_paid: input.amountPaid,
      stripe_checkout_session_id: input.stripeCheckoutSessionId ?? null,
      stripe_payment_intent_id: input.stripePaymentIntentId ?? null,
    }])
    .select()
    .single();
  return data ? mapOrder(data as Record<string, unknown>) : null;
}

export async function updateOrderStatus(
  orderId: string,
  status: Order['status'],
  patch: Partial<Record<string, unknown>> = {},
): Promise<void> {
  await supabase
    .from('orders')
    .update({
      status,
      updated_at: new Date().toISOString(),
      ...patch,
    })
    .eq('id', orderId);
}

function mapOrder(row: Record<string, unknown>): Order {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    draftId: (row.draft_id as string | null) ?? null,
    orderNumber: row.order_number as string,
    status: row.status as Order['status'],
    spec: row.spec as SiteSpec,
    stripePaymentIntentId: (row.stripe_payment_intent_id as string | null) ?? null,
    stripeCheckoutSessionId: (row.stripe_checkout_session_id as string | null) ?? null,
    amountPaid: (row.amount_paid as number | null) ?? null,
    previewUrl: (row.preview_url as string | null) ?? null,
    buildStartedAt: (row.build_started_at as string | null) ?? null,
    buildCompletedAt: (row.build_completed_at as string | null) ?? null,
    reviewedBy: (row.reviewed_by as string | null) ?? null,
    reviewedAt: (row.reviewed_at as string | null) ?? null,
    reviewNotes: (row.review_notes as string | null) ?? null,
    iterationCount: (row.iteration_count as number) ?? 0,
    maxIterations: (row.max_iterations as number) ?? 5,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

// ============================================================================
// Feedback
// ============================================================================

export async function getFeedbackForOrder(orderId: string): Promise<Feedback[]> {
  const { data } = await supabase
    .from('feedback')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: false });
  return ((data ?? []) as Record<string, unknown>[]).map(mapFeedback);
}

export async function submitFeedback(input: {
  orderId: string;
  userId: string;
  iterationNumber: number;
  changes: FeedbackItem[];
}): Promise<Feedback | null> {
  const { data } = await supabase
    .from('feedback')
    .insert([{
      order_id: input.orderId,
      user_id: input.userId,
      iteration_number: input.iterationNumber,
      changes: input.changes as never,
      status: 'pending',
    }])
    .select()
    .single();
  return data ? mapFeedback(data as Record<string, unknown>) : null;
}

function mapFeedback(row: Record<string, unknown>): Feedback {
  return {
    id: row.id as string,
    orderId: row.order_id as string,
    userId: row.user_id as string,
    iterationNumber: row.iteration_number as number,
    changes: (row.changes as FeedbackItem[]) ?? [],
    status: row.status as Feedback['status'],
    createdAt: row.created_at as string,
  };
}

// ============================================================================
// Helpers (formerly in configurator/src/lib/utils.ts)
// ============================================================================

export function formatCurrency(cents: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

export function formatDate(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `ORD-${year}-${random}`;
}
