import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
  deleteProduct,
  listProductsAdmin,
  upsertProduct,
  uploadProductImage,
} from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, Plus, Trash2, Upload, Star } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/products")({
  component: ProductsPage,
});

const CATEGORIES = [
  "washing",
  "fridge",
  "freezer",
  "oven",
  "ac",
  "dishwasher",
  "kitchen",
  "small",
  "other",
];
const STATUSES = ["in_stock", "out_of_stock", "coming_soon", "sale", "new"] as const;

type ProductRow = {
  id: string;
  name_ar: string;
  name_fr: string;
  description_ar: string | null;
  description_fr: string | null;
  price: number | null;
  category: string;
  status: string;
  featured: boolean;
  image_url: string | null;
  image_signed_url: string | null;
  sort_order: number;
};

const blank = {
  name_ar: "",
  name_fr: "",
  description_ar: "",
  description_fr: "",
  price: "" as number | "" | null,
  category: "other",
  status: "in_stock" as (typeof STATUSES)[number],
  featured: false,
  image_url: null as string | null,
  image_signed_url: null as string | null,
  sort_order: 0,
};

function ProductsPage() {
  const qc = useQueryClient();
  const list = useServerFn(listProductsAdmin);
  const save = useServerFn(upsertProduct);
  const del = useServerFn(deleteProduct);
  const upload = useServerFn(uploadProductImage);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => list() as Promise<ProductRow[]>,
  });

  const [editing, setEditing] = useState<(typeof blank & { id?: string }) | null>(null);
  const [uploading, setUploading] = useState(false);

  const saveMut = useMutation({
    mutationFn: async (data: typeof blank & { id?: string }) => {
      return save({
        data: {
          id: data.id,
          name_ar: data.name_ar,
          name_fr: data.name_fr,
          description_ar: data.description_ar,
          description_fr: data.description_fr,
          price: data.price === "" || data.price == null ? null : Number(data.price),
          category: data.category,
          status: data.status,
          featured: data.featured,
          image_url: data.image_url,
          sort_order: Number(data.sort_order) || 0,
        },
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      setEditing(null);
    },
  });

  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-products"] }),
  });

  async function handleFile(file: File) {
    setUploading(true);
    try {
      // Auto-compress: downscale large images client-side, JPEG quality 0.82
      const compressed = await compressImage(file, 1280, 0.82);
      const buf = await compressed.arrayBuffer();
      const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
      const res = await upload({
        data: { filename: file.name, contentType: compressed.type, base64: b64 },
      });
      setEditing((cur) =>
        cur ? { ...cur, image_url: res.path, image_signed_url: res.signedUrl } : cur,
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm text-muted-foreground">Manage your catalog (Arabic + French)</p>
        </div>
        <Button onClick={() => setEditing({ ...blank })}>
          <Plus className="h-4 w-4" /> Add product
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : products.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          No products yet. Click "Add product" to create your first one.
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <Card key={p.id} className="overflow-hidden p-0">
              <div className="aspect-square bg-muted relative">
                {p.image_signed_url ? (
                  <img src={p.image_signed_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full grid place-items-center text-muted-foreground text-sm">
                    No image
                  </div>
                )}
                {p.featured && (
                  <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded bg-amber-500 px-2 py-0.5 text-xs text-white">
                    <Star className="h-3 w-3" /> Featured
                  </span>
                )}
              </div>
              <div className="p-3 space-y-1">
                <div className="font-semibold truncate">{p.name_fr}</div>
                <div className="text-xs text-muted-foreground truncate" dir="rtl">{p.name_ar}</div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-sm font-bold">
                    {p.price ? `${p.price.toLocaleString("fr-FR")} DA` : "—"}
                  </span>
                  <span className="text-[10px] uppercase tracking-wide rounded bg-muted px-1.5 py-0.5">
                    {p.status}
                  </span>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() =>
                      setEditing({
                        id: p.id,
                        name_ar: p.name_ar,
                        name_fr: p.name_fr,
                        description_ar: p.description_ar ?? "",
                        description_fr: p.description_fr ?? "",
                        price: p.price ?? "",
                        category: p.category,
                        status: p.status as (typeof STATUSES)[number],
                        featured: p.featured,
                        image_url: p.image_url,
                        image_signed_url: p.image_signed_url,
                        sort_order: p.sort_order,
                      })
                    }
                  >
                    <Pencil className="h-3 w-3" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      if (confirm(`Delete "${p.name_fr}"?`)) delMut.mutate(p.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit product" : "New product"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Image</Label>
                <div className="flex items-center gap-3">
                  <div className="h-20 w-20 rounded bg-muted overflow-hidden">
                    {editing.image_signed_url && (
                      <img src={editing.image_signed_url} className="h-full w-full object-cover" alt="" />
                    )}
                  </div>
                  <label className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer hover:bg-accent">
                    <Upload className="h-4 w-4" />
                    {uploading ? "Uploading…" : "Upload image"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleFile(f);
                      }}
                    />
                  </label>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Name (Arabic)" dir="rtl">
                  <Input
                    value={editing.name_ar}
                    onChange={(e) => setEditing({ ...editing, name_ar: e.target.value })}
                    dir="rtl"
                  />
                </Field>
                <Field label="Name (French)">
                  <Input
                    value={editing.name_fr}
                    onChange={(e) => setEditing({ ...editing, name_fr: e.target.value })}
                  />
                </Field>
                <Field label="Description (Arabic)" dir="rtl">
                  <Textarea
                    rows={3}
                    value={editing.description_ar}
                    onChange={(e) => setEditing({ ...editing, description_ar: e.target.value })}
                    dir="rtl"
                  />
                </Field>
                <Field label="Description (French)">
                  <Textarea
                    rows={3}
                    value={editing.description_fr}
                    onChange={(e) => setEditing({ ...editing, description_fr: e.target.value })}
                  />
                </Field>
                <Field label="Price (DA)">
                  <Input
                    type="number"
                    value={editing.price ?? ""}
                    onChange={(e) =>
                      setEditing({ ...editing, price: e.target.value === "" ? "" : Number(e.target.value) })
                    }
                  />
                </Field>
                <Field label="Sort order">
                  <Input
                    type="number"
                    value={editing.sort_order}
                    onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })}
                  />
                </Field>
                <Field label="Category">
                  <Select
                    value={editing.category}
                    onValueChange={(v) => setEditing({ ...editing, category: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Status">
                  <Select
                    value={editing.status}
                    onValueChange={(v) => setEditing({ ...editing, status: v as (typeof STATUSES)[number] })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editing.featured}
                  onChange={(e) => setEditing({ ...editing, featured: e.target.checked })}
                />
                Featured product (show on homepage highlights)
              </label>
              {saveMut.error && (
                <p className="text-sm text-destructive">{(saveMut.error as Error).message}</p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button
              onClick={() => editing && saveMut.mutate(editing)}
              disabled={saveMut.isPending || !editing?.name_ar || !editing?.name_fr}
            >
              {saveMut.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, dir, children }: { label: string; dir?: "rtl" | "ltr"; children: React.ReactNode }) {
  return (
    <div className="space-y-1" dir={dir}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

async function compressImage(file: File, maxDim: number, quality: number): Promise<Blob> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, w, h);
  return await new Promise<Blob>((resolve) =>
    canvas.toBlob((b) => resolve(b ?? file), "image/jpeg", quality),
  ).then((b) => b || file);
}
