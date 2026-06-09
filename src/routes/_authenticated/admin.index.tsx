import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listProductsAdmin } from "@/lib/admin.functions";
import { Card } from "@/components/ui/card";
import { Package, Star, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const fn = useServerFn(listProductsAdmin);
  const { data: products = [] } = useQuery({ queryKey: ["admin-products"], queryFn: () => fn() });
  const total = products.length;
  const featured = products.filter((p) => p.featured).length;
  const outOfStock = products.filter((p) => p.status === "out_of_stock").length;

  const stats = [
    { label: "Total Products", value: total, icon: Package },
    { label: "Featured", value: featured, icon: Star },
    { label: "Out of Stock", value: outOfStock, icon: AlertCircle },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Quick overview of your store</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">{s.label}</div>
                  <div className="mt-1 text-3xl font-bold">{s.value}</div>
                </div>
                <Icon className="h-8 w-8 text-muted-foreground" />
              </div>
            </Card>
          );
        })}
      </div>
      <Card className="p-5">
        <h2 className="font-semibold">Quick actions</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link to="/admin/products" className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">Manage products</Link>
          <Link to="/admin/settings" className="inline-flex h-9 items-center rounded-md border px-4 text-sm font-medium">Business settings</Link>
        </div>
      </Card>
    </div>
  );
}
