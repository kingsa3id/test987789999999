import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const SIGNED_URL_TTL = 60 * 60 * 24 * 7; // 7 days

async function signImage(path: string | null | undefined): Promise<string | null> {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.storage
    .from("product-images")
    .createSignedUrl(path, SIGNED_URL_TTL);
  return data?.signedUrl ?? null;
}

/* ---------------- AUTH / ROLE ---------------- */

export const getMe = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: roles } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    return {
      userId: context.userId,
      email: (context.claims as { email?: string }).email ?? null,
      isAdmin: (roles ?? []).some((r) => r.role === "admin"),
    };
  });

// Bootstrap: if NO admin exists in the system, promote the current user.
export const claimAdminIfFirst = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count } = await supabaseAdmin
      .from("user_roles")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin");
    if ((count ?? 0) > 0) return { promoted: false };
    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: context.userId, role: "admin" });
    if (error) throw new Error(error.message);
    return { promoted: true };
  });

/* ---------------- PRODUCTS ---------------- */

const ProductInput = z.object({
  id: z.string().uuid().optional(),
  name_ar: z.string().min(1).max(200),
  name_fr: z.string().min(1).max(200),
  description_ar: z.string().max(2000).optional().default(""),
  description_fr: z.string().max(2000).optional().default(""),
  price: z.number().nullable().optional(),
  category: z.string().min(1).max(50),
  status: z.enum(["in_stock", "out_of_stock", "coming_soon", "sale", "new"]),
  featured: z.boolean().default(false),
  image_url: z.string().nullable().optional(),
  sort_order: z.number().int().default(0),
});

export const listProductsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("products")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const withUrls = await Promise.all(
      (data ?? []).map(async (p) => ({ ...p, image_signed_url: await signImage(p.image_url) })),
    );
    return withUrls;
  });

export const upsertProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ProductInput.parse(d))
  .handler(async ({ data, context }) => {
    const payload = { ...data };
    const { error, data: row } = data.id
      ? await context.supabase.from("products").update(payload).eq("id", data.id).select().single()
      : await context.supabase.from("products").insert(payload).select().single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: prod } = await context.supabase
      .from("products")
      .select("image_url")
      .eq("id", data.id)
      .single();
    const { error } = await context.supabase.from("products").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    if (prod?.image_url && !prod.image_url.startsWith("http")) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin.storage.from("product-images").remove([prod.image_url]);
    }
    return { ok: true };
  });

// Upload a base64 image. Returns the storage path stored in image_url.
export const uploadProductImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        filename: z.string().min(1).max(200),
        contentType: z.string().min(1).max(100),
        base64: z.string().min(1),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    // Verify admin
    const { data: roles } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin");
    if (!roles?.length) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const ext = (data.filename.split(".").pop() ?? "jpg").toLowerCase().slice(0, 5);
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const bytes = Uint8Array.from(atob(data.base64), (c) => c.charCodeAt(0));
    const { error } = await supabaseAdmin.storage
      .from("product-images")
      .upload(path, bytes, { contentType: data.contentType, upsert: false });
    if (error) throw new Error(error.message);
    const { data: signed } = await supabaseAdmin.storage
      .from("product-images")
      .createSignedUrl(path, SIGNED_URL_TTL);
    return { path, signedUrl: signed?.signedUrl ?? null };
  });

/* ---------------- SETTINGS ---------------- */

export const getSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("settings").select("*");
    if (error) throw new Error(error.message);
    const out: Record<string, Record<string, unknown>> = {};
    for (const row of data ?? []) out[row.key] = row.value as Record<string, unknown>;
    return out;
  });

export const upsertSetting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ key: z.string().min(1).max(50), value: z.record(z.string(), z.any()) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("settings")
      .upsert({ key: data.key, value: data.value }, { onConflict: "key" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
