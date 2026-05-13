// Supabase Edge Function — Verify a reference token (PUBLIC, no auth).
// Never returns invited_email.

// deno-lint-ignore-file no-explicit-any
// @ts-nocheck — Deno runtime

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { token } = (await req.json()) as { token?: string };
    if (!token || typeof token !== 'string') return json({ valid: false, reason: 'invalid' });

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: row } = await admin
      .from('reference_requests')
      .select('id, status, expires_at')
      .eq('token', token)
      .maybeSingle();

    if (!row) return json({ valid: false, reason: 'invalid' });

    if (row.status === 'pending' && new Date(row.expires_at).getTime() < Date.now()) {
      await admin.from('reference_requests').update({ status: 'expired' }).eq('id', row.id);
      return json({ valid: false, reason: 'expired' });
    }

    if (row.status === 'submitted') return json({ valid: false, reason: 'already_submitted' });
    if (row.status === 'revoked') return json({ valid: false, reason: 'revoked' });
    if (row.status === 'expired') return json({ valid: false, reason: 'expired' });

    return json({ valid: true, expires_at: row.expires_at });
  } catch (e) {
    console.error('verify-reference-access error:', e);
    return json({ valid: false, reason: 'invalid' });
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
