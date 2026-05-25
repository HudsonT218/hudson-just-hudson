// site_settings — singleton-row data access.
// The auto-generated Database type in src/integrations/supabase/types.ts won't
// include this table until the migration has been applied and Lovable
// regenerates that file. Until then, the client is cast to `any` and the
// SiteSettings shape below is the canonical TypeScript contract.
import { supabase as sharedClient } from "@/integrations/supabase/client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabase = sharedClient as any;

export interface SiteSettings {
  id: "singleton";
  free_projects_total: number;
  free_projects_remaining: number;
  campaign_open: boolean;
  updated_at: string;
}

export type SiteSettingsPatch = Partial<
  Pick<SiteSettings, "free_projects_total" | "free_projects_remaining" | "campaign_open">
>;

export async function getSiteSettings(): Promise<SiteSettings> {
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", "singleton")
    .single();
  if (error) throw error;
  return data as SiteSettings;
}

export async function updateSiteSettings(patch: SiteSettingsPatch): Promise<SiteSettings> {
  const { data, error } = await supabase
    .from("site_settings")
    .update(patch)
    .eq("id", "singleton")
    .select("*")
    .single();
  if (error) throw error;
  return data as SiteSettings;
}
