import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, CalendarDays } from "lucide-react";
import { AdminImageUpload } from "@/components/admin/AdminImageUpload";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

type EventRow = {
  id: string; name: string; region: string; country: string; category: string;
  description: string; venue: string | null; image: string;
  date_start: string; date_end: string | null; recurring: boolean;
};

const categories = [
  { value: "cultural", label: "Cultural" },
  { value: "music", label: "Music" },
  { value: "art", label: "Art" },
  { value: "food", label: "Food" },
  { value: "fashion", label: "Fashion" },
  { value: "adventure", label: "Adventure" },
];

const emptyItem: Partial<EventRow> = {
  name: "", region: "", country: "Ghana", category: "cultural",
  description: "", venue: "", image: "", date_start: "", date_end: "", recurring: false,
};

export default function AdminEvents() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [editItem, setEditItem] = useState<Partial<EventRow> | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin-events"],
    queryFn: async () => {
      const { data, error } = await supabase.from("events").select("*").order("date_start");
      if (error) throw error;
      return data as EventRow[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (item: Partial<EventRow>) => {
      const payload = { ...item, date_end: item.date_end || null };
      if (item.id && items.some((e) => e.id === item.id)) {
        const { error } = await supabase.from("events").update(payload).eq("id", item.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("events").insert([payload as any]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({ title: "Saved", description: "Event saved." });
      qc.invalidateQueries({ queryKey: ["admin-events"] });
      setEditItem(null);
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Deleted" });
      qc.invalidateQueries({ queryKey: ["admin-events"] });
      setDeleteId(null);
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const openEdit = (item?: EventRow) => {
    setEditItem(item ? { ...item } : { ...emptyItem, id: `ev-${Date.now()}` });
  };

  return (
    <AdminLayout title="Manage Events" description="Add, edit, or remove events and happenings">
      <div className="flex justify-end mb-6">
        <Button onClick={() => openEdit()}><Plus className="h-4 w-4 mr-2" /> Add Event</Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">{[1, 2, 3].map(i => (
          <div key={i} className="bg-card rounded-xl border border-border p-6 animate-pulse">
            <div className="h-5 bg-muted rounded w-1/3 mb-3" /><div className="h-4 bg-muted rounded w-1/2" />
          </div>
        ))}</div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border border-border">
          <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No events yet</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {items.map((ev) => (
            <motion.div key={ev.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl border border-border p-4 flex gap-4">
              <div className="w-20 h-14 rounded-lg overflow-hidden shrink-0 bg-muted">
                {ev.image && <img src={ev.image} alt={ev.name} className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-display font-semibold text-sm">{ev.name}</h3>
                  <Badge variant="secondary" className="text-[10px] capitalize">{ev.category}</Badge>
                  {ev.recurring && <Badge variant="outline" className="text-[10px]">Annual</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">{ev.date_start} · {ev.region}, {ev.country}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="outline" size="icon" onClick={() => openEdit(ev)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="outline" size="icon" onClick={() => setDeleteId(ev.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editItem && items.some(e => e.id === editItem.id) ? "Edit" : "Add"} Event</DialogTitle>
          </DialogHeader>
          {editItem && (
            <div className="space-y-4">
              <div><Label>Name</Label><Input value={editItem.name || ""} onChange={e => setEditItem({ ...editItem, name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Region</Label><Input value={editItem.region || ""} onChange={e => setEditItem({ ...editItem, region: e.target.value })} /></div>
                <div><Label>Country</Label><Input value={editItem.country || ""} onChange={e => setEditItem({ ...editItem, country: e.target.value })} /></div>
              </div>
              <div><Label>Category</Label>
                <Select value={editItem.category || "cultural"} onValueChange={v => setEditItem({ ...editItem, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{categories.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Start Date</Label><Input type="date" value={editItem.date_start || ""} onChange={e => setEditItem({ ...editItem, date_start: e.target.value })} /></div>
                <div><Label>End Date (optional)</Label><Input type="date" value={editItem.date_end || ""} onChange={e => setEditItem({ ...editItem, date_end: e.target.value })} /></div>
              </div>
              <div><Label>Venue</Label><Input value={editItem.venue || ""} onChange={e => setEditItem({ ...editItem, venue: e.target.value })} /></div>
              <div><Label>Description</Label><Textarea value={editItem.description || ""} onChange={e => setEditItem({ ...editItem, description: e.target.value })} rows={3} /></div>
              <div><Label>Image</Label>
                <AdminImageUpload value={editItem.image || ""} onChange={url => setEditItem({ ...editItem, image: url })} folder="events" />
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={editItem.recurring ?? false} onCheckedChange={v => setEditItem({ ...editItem, recurring: v })} />
                <Label>Recurring (Annual)</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditItem(null)}>Cancel</Button>
            <Button onClick={() => editItem && saveMutation.mutate(editItem)} disabled={saveMutation.isPending}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Event?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && deleteMutation.mutate(deleteId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
