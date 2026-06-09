import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { getSettings, upsertSetting } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: SettingsPage,
});

type Biz = {
  name?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  city?: string;
  maps_url?: string;
};
type Hero = { title_ar?: string; title_fr?: string; desc_ar?: string; desc_fr?: string };

function SettingsPage() {
  const qc = useQueryClient();
  const get = useServerFn(getSettings);
  const set = useServerFn(upsertSetting);
  const { data } = useQuery({ queryKey: ["settings"], queryFn: () => get() });

  const [biz, setBiz] = useState<Biz>({});
  const [hero, setHero] = useState<Hero>({});
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    if (data) {
      setBiz((data.business ?? {}) as Biz);
      setHero((data.hero ?? {}) as Hero);
    }
  }, [data]);

  const mut = useMutation({
    mutationFn: async () => {
      await set({ data: { key: "business", value: biz } });
      await set({ data: { key: "hero", value: hero } });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings"] });
      setSaved("Saved");
      setTimeout(() => setSaved(null), 2000);
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Business Settings</h1>
        <p className="text-sm text-muted-foreground">Edit business info and hero content. Both languages.</p>
      </div>

      <Card className="p-5 space-y-4">
        <h2 className="font-semibold">Contact</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <F label="Business name"><Input value={biz.name ?? ""} onChange={(e) => setBiz({ ...biz, name: e.target.value })} /></F>
          <F label="Phone"><Input value={biz.phone ?? ""} onChange={(e) => setBiz({ ...biz, phone: e.target.value })} /></F>
          <F label="WhatsApp"><Input value={biz.whatsapp ?? ""} onChange={(e) => setBiz({ ...biz, whatsapp: e.target.value })} /></F>
          <F label="Email"><Input type="email" value={biz.email ?? ""} onChange={(e) => setBiz({ ...biz, email: e.target.value })} /></F>
          <F label="Address"><Input value={biz.address ?? ""} onChange={(e) => setBiz({ ...biz, address: e.target.value })} /></F>
          <F label="City"><Input value={biz.city ?? ""} onChange={(e) => setBiz({ ...biz, city: e.target.value })} /></F>
          <div className="sm:col-span-2">
            <F label="Google Maps URL"><Input value={biz.maps_url ?? ""} onChange={(e) => setBiz({ ...biz, maps_url: e.target.value })} placeholder="https://maps.google.com/..." /></F>
          </div>
        </div>
      </Card>

      <Card className="p-5 space-y-4">
        <h2 className="font-semibold">Hero section</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <F label="Title (Arabic)" dir="rtl"><Input dir="rtl" value={hero.title_ar ?? ""} onChange={(e) => setHero({ ...hero, title_ar: e.target.value })} /></F>
          <F label="Title (French)"><Input value={hero.title_fr ?? ""} onChange={(e) => setHero({ ...hero, title_fr: e.target.value })} /></F>
          <F label="Description (Arabic)" dir="rtl"><Textarea rows={3} dir="rtl" value={hero.desc_ar ?? ""} onChange={(e) => setHero({ ...hero, desc_ar: e.target.value })} /></F>
          <F label="Description (French)"><Textarea rows={3} value={hero.desc_fr ?? ""} onChange={(e) => setHero({ ...hero, desc_fr: e.target.value })} /></F>
        </div>
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={() => mut.mutate()} disabled={mut.isPending}>
          {mut.isPending ? "Saving…" : "Save all"}
        </Button>
        {saved && <span className="text-sm text-green-600">{saved}</span>}
        {mut.error && <span className="text-sm text-destructive">{(mut.error as Error).message}</span>}
      </div>
    </div>
  );
}

function F({ label, dir, children }: { label: string; dir?: "rtl" | "ltr"; children: React.ReactNode }) {
  return (
    <div className="space-y-1" dir={dir}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
