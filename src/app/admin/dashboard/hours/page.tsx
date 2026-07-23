"use client";

import { useState } from "react";
import { Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";
import { useSiteContent, type HoursEntry } from "@/lib/site-content";

export default function HoursPage() {
  const { content, refresh } = useSiteContent();
  const [hours, setHours] = useState<HoursEntry[]>(content.hours);
  const [address, setAddress] = useState(content.address);
  const [parking, setParking] = useState(content.parking);
  const [reservations, setReservations] = useState(content.reservations);
  const [saving, setSaving] = useState(false);

  function addHour() {
    setHours([...hours, { label: "", time: "" }]);
  }

  function updateHour(i: number, field: keyof HoursEntry, value: string) {
    const updated = [...hours];
    updated[i] = { ...updated[i], [field]: value };
    setHours(updated);
  }

  function removeHour(i: number) {
    setHours(hours.filter((_, idx) => idx !== i));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ ...content, hours, address, parking, reservations }),
      });
      if (res.ok) {
        toast.success("Saved successfully");
        refresh();
      } else {
        toast.error("Failed to save");
      }
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl">Hours & Visit</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage business hours and location info</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Hours */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl">Hours</h2>
          <button onClick={addHour} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <Plus className="h-4 w-4" /> Add Row
          </button>
        </div>
        <div className="space-y-3">
          {hours.map((h, i) => (
            <div key={i} className="flex items-center gap-3">
              <input
                placeholder="Day (e.g. Sun — Wed)"
                value={h.label}
                onChange={(e) => updateHour(i, "label", e.target.value)}
                className="flex-1 border border-border bg-transparent px-3 py-2 text-sm rounded-none focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <input
                placeholder="Time (e.g. 6:00 AM — 1:00 AM)"
                value={h.time}
                onChange={(e) => updateHour(i, "time", e.target.value)}
                className="flex-1 border border-border bg-transparent px-3 py-2 text-sm rounded-none focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <button onClick={() => removeHour(i)} className="text-destructive/60 hover:text-destructive p-2">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Visit Info */}
      <section className="space-y-6">
        <h2 className="font-display text-xl">Visit Information</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Address</label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border border-border bg-transparent px-3 py-2 text-sm rounded-none focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Parking</label>
            <input
              value={parking}
              onChange={(e) => setParking(e.target.value)}
              className="w-full border border-border bg-transparent px-3 py-2 text-sm rounded-none focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Reservations</label>
            <input
              value={reservations}
              onChange={(e) => setReservations(e.target.value)}
              className="w-full border border-border bg-transparent px-3 py-2 text-sm rounded-none focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
