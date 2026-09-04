"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";
import { useSiteContent, type MenuItem } from "@/lib/site-content";

export default function MenuPage() {
  const { content, refresh } = useSiteContent();
  const [coffeeItems, setCoffeeItems] = useState<MenuItem[]>(content.coffeeItems);
  const [dessertItems, setDessertItems] = useState<MenuItem[]>(content.dessertItems);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setCoffeeItems(content.coffeeItems);
    setDessertItems(content.dessertItems);
  }, [content.coffeeItems, content.dessertItems]);

  function addCoffee() {
    setCoffeeItems([...coffeeItems, { name: "", note: "", price: "", body: "" }]);
  }

  function addDessert() {
    setDessertItems([...dessertItems, { name: "", note: "", price: "", body: "" }]);
  }

  function updateCoffee(i: number, field: keyof MenuItem, value: string) {
    const updated = [...coffeeItems];
    updated[i] = { ...updated[i], [field]: value };
    setCoffeeItems(updated);
  }

  function updateDessert(i: number, field: keyof MenuItem, value: string) {
    const updated = [...dessertItems];
    updated[i] = { ...updated[i], [field]: value };
    setDessertItems(updated);
  }

  function removeCoffee(i: number) {
    setCoffeeItems(coffeeItems.filter((_, idx) => idx !== i));
  }

  function removeDessert(i: number) {
    setDessertItems(dessertItems.filter((_, idx) => idx !== i));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ ...content, coffeeItems, dessertItems }),
      });
      if (res.ok) {
        toast.success("Menu saved successfully");
        refresh();
      } else {
        toast.error("Failed to save menu");
      }
    } catch {
      toast.error("Failed to save menu");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl">Menu</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage coffee and dessert items</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Coffee Section */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl">Coffee</h2>
          <button onClick={addCoffee} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <Plus className="h-4 w-4" /> Add Item
          </button>
        </div>
        <div className="space-y-4">
          {coffeeItems.map((item, i) => (
            <div key={i} className="border border-border p-4 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="grid grid-cols-2 gap-3 flex-1">
                  <input
                    placeholder="Name"
                    value={item.name}
                    onChange={(e) => updateCoffee(i, "name", e.target.value)}
                    className="border border-border bg-transparent px-3 py-2 text-sm rounded-none focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <input
                    placeholder="Note"
                    value={item.note}
                    onChange={(e) => updateCoffee(i, "note", e.target.value)}
                    className="border border-border bg-transparent px-3 py-2 text-sm rounded-none focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <input
                    placeholder="Price (e.g. SAR 22)"
                    value={item.price || ""}
                    onChange={(e) => updateCoffee(i, "price", e.target.value)}
                    className="border border-border bg-transparent px-3 py-2 text-sm rounded-none focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <input
                    placeholder="Description"
                    value={item.body}
                    onChange={(e) => updateCoffee(i, "body", e.target.value)}
                    className="border border-border bg-transparent px-3 py-2 text-sm rounded-none focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <button onClick={() => removeCoffee(i)} className="text-destructive/60 hover:text-destructive p-2">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          {coffeeItems.length === 0 && (
            <p className="text-sm text-muted-foreground py-4 text-center">No coffee items. Click "Add Item" to create one.</p>
          )}
        </div>
      </section>

      {/* Desserts Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl">Desserts</h2>
          <button onClick={addDessert} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <Plus className="h-4 w-4" /> Add Item
          </button>
        </div>
        <div className="space-y-4">
          {dessertItems.map((item, i) => (
            <div key={i} className="border border-border p-4 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="grid grid-cols-2 gap-3 flex-1">
                  <input
                    placeholder="Name"
                    value={item.name}
                    onChange={(e) => updateDessert(i, "name", e.target.value)}
                    className="border border-border bg-transparent px-3 py-2 text-sm rounded-none focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <input
                    placeholder="Note"
                    value={item.note}
                    onChange={(e) => updateDessert(i, "note", e.target.value)}
                    className="border border-border bg-transparent px-3 py-2 text-sm rounded-none focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <input
                    placeholder="Price (e.g. SAR 25)"
                    value={item.price || ""}
                    onChange={(e) => updateDessert(i, "price", e.target.value)}
                    className="border border-border bg-transparent px-3 py-2 text-sm rounded-none focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <input
                    placeholder="Description"
                    value={item.body}
                    onChange={(e) => updateDessert(i, "body", e.target.value)}
                    className="col-span-2 border border-border bg-transparent px-3 py-2 text-sm rounded-none focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <button onClick={() => removeDessert(i)} className="text-destructive/60 hover:text-destructive p-2">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          {dessertItems.length === 0 && (
            <p className="text-sm text-muted-foreground py-4 text-center">No dessert items. Click "Add Item" to create one.</p>
          )}
        </div>
      </section>
    </div>
  );
}
