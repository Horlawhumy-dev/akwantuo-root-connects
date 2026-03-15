import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Bus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

type TransportHub = {
  id: string; name: string; region: string; country: string; type: string;
  address: string | null; phone: string | null; description: string;
};

const hubTypes = [
  { value: "airport", label: "Airport" },
  { value: "bus_station", label: "Bus Station" },
  { value: "port", label: "Port" },
  { value: "ride_hailing", label: "Ride Hailing" },
];

const emptyItem: Partial<TransportHub> = {
  name: "", region: "", country: "Ghana", type: "bus_station",
  address: "", phone: "", description: "",
};

export default function AdminTransport() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [editItem, setEditItem] = useState<Partial<TransportHub> | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin-transport"],
    queryFn: async () => {
      const { data, error } = await supabase.from("transport_hubs").select("*").order("name");
      if (error) throw error;
      return data as TransportHub[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (item: Partial<TransportHub>) => {
      if (item.id && items.some((h) => h.id === item.id)) {
        const { error } = await supabase.from("transport_hubs").update(item).eq("id", item.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("transport_hubs").insert([item as any]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({ title: "Saved", description: "Transport hub saved." });
      qc.invalidateQueries({ queryKey: ["admin-transport"] });
      setEditItem(null);
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("transport_hubs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Deleted" });
      qc.invalidateQueries({ queryKey: ["admin-transport"] });
      setDeleteId(null);
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const openEdit = (item?: TransportHub) => {
    setEditItem(item ? { ...item } : { ...emptyItem, id: `t-${Date.now()}` });
  };

  return (
    <AdminLayout title="Manage Transport" description="Add, edit, or remove transport hubs">
      <div className="flex justify-end mb-6">
        <Button onClick={() => openEdit()}><Plus className="h-4 w-4 mr-2" /> Add Hub</Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">{[1, 2, 3].map(i => (
          <div key={i} className="bg-card rounded-xl border border-border p-6 animate-pulse">
            <div className="h-5 bg-muted rounded w-1/3 mb-3" /><div className="h-4 bg-muted rounded w-1/2" />
          </div>
        ))}</div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border border-border">
          <Bus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No transport hubs yet</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {items.map((h) => (
            <motion.div key={h.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl border border-border p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-display font-semibold text-sm">{h.name}</h3>
                  <Badge variant="secondary" className="text-[10px] capitalize">{h.type.replace("_", " ")}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{h.region}, {h.country}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="outline" size="icon" onClick={() => openEdit(h)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="outline" size="icon" onClick={() => setDeleteId(h.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editItem && items.some(h => h.id === editItem.id) ? "Edit" : "Add"} Transport Hub</DialogTitle>
          </DialogHeader>
          {editItem && (
            <div className="space-y-4">
              <div><Label>Name</Label><Input value={editItem.name || ""} onChange={e => setEditItem({ ...editItem, name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Region</Label><Input value={editItem.region || ""} onChange={e => setEditItem({ ...editItem, region: e.target.value })} /></div>
                <div><Label>Country</Label><Input value={editItem.country || ""} onChange={e => setEditItem({ ...editItem, country: e.target.value })} /></div>
              </div>
              <div><Label>Type</Label>
                <Select value={editItem.type || "bus_station"} onValueChange={v => setEditItem({ ...editItem, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{hubTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Address</Label><Input value={editItem.address || ""} onChange={e => setEditItem({ ...editItem, address: e.target.value })} /></div>
              <div><Label>Phone</Label><Input value={editItem.phone || ""} onChange={e => setEditItem({ ...editItem, phone: e.target.value })} /></div>
              <div><Label>Description</Label><Textarea value={editItem.description || ""} onChange={e => setEditItem({ ...editItem, description: e.target.value })} rows={3} /></div>
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
          <AlertDialogHeader><AlertDialogTitle>Delete Transport Hub?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && deleteMutation.mutate(deleteId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
