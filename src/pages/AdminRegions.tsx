import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, MapPin } from "lucide-react";
import { AdminImageUpload } from "@/components/admin/AdminImageUpload";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

type Region = {
  id: string;
  name: string;
  capital: string;
  description: string;
  image: string;
  destination_id: string;
  highlights: string[];
  hidden_gems: string[];
};

const emptyRegion: Partial<Region> = {
  name: "",
  capital: "",
  description: "",
  image: "",
  destination_id: "",
  highlights: [],
  hidden_gems: [],
};

export default function AdminRegions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editItem, setEditItem] = useState<Partial<Region> | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [highlightsInput, setHighlightsInput] = useState("");
  const [hiddenGemsInput, setHiddenGemsInput] = useState("");

  const { data: destinations = [] } = useQuery({
    queryKey: ["admin-destinations-list"],
    queryFn: async () => {
      const { data } = await supabase.from("destinations").select("id, country").order("country");
      return data || [];
    },
  });

  const { data: regions = [], isLoading } = useQuery({
    queryKey: ["admin-regions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("regions")
        .select("*, destinations(country)")
        .order("name");
      if (error) throw error;
      return data as (Region & { destinations: { country: string } })[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (item: Partial<Region>) => {
      const highlights = highlightsInput.split(",").map((s) => s.trim()).filter(Boolean);
      const hidden_gems = hiddenGemsInput.split(",").map((s) => s.trim()).filter(Boolean);
      const payload = { ...item, highlights, hidden_gems };

      if (item.id && regions.some((r) => r.id === item.id)) {
        const { error } = await supabase.from("regions").update(payload).eq("id", item.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("regions").insert([payload as any]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({ title: "Saved", description: "Region saved successfully." });
      queryClient.invalidateQueries({ queryKey: ["admin-regions"] });
      setEditItem(null);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("regions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Deleted", description: "Region removed." });
      queryClient.invalidateQueries({ queryKey: ["admin-regions"] });
      setDeleteId(null);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const openEdit = (item?: Region) => {
    if (item) {
      setEditItem(item);
      setHighlightsInput(item.highlights?.join(", ") || "");
      setHiddenGemsInput(item.hidden_gems?.join(", ") || "");
    } else {
      setEditItem({ ...emptyRegion, id: crypto.randomUUID() });
      setHighlightsInput("");
      setHiddenGemsInput("");
    }
  };

  return (
    <AdminLayout title="Manage Regions" description="Add, edit, or remove regions within destinations">
      <div className="flex justify-end mb-6">
        <Button onClick={() => openEdit()}>
          <Plus className="h-4 w-4 mr-2" /> Add Region
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-6 animate-pulse">
              <div className="h-5 bg-muted rounded w-1/3 mb-3" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : regions.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border border-border">
          <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No regions yet</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {regions.map((region) => (
            <motion.div
              key={region.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl border border-border p-4 flex gap-4"
            >
              <div className="w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                {region.image && (
                  <img src={region.image} alt={region.name} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-display font-semibold">{region.name}</h3>
                  <Badge variant="secondary" className="text-xs">{region.destinations?.country}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Capital: {region.capital}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button variant="outline" size="icon" onClick={() => openEdit(region)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => setDeleteId(region.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editItem && regions.some((r) => r.id === editItem.id) ? "Edit" : "Add"} Region
            </DialogTitle>
          </DialogHeader>
          {editItem && (
            <div className="space-y-4">
              <div>
                <Label>Destination</Label>
                <Select
                  value={editItem.destination_id || ""}
                  onValueChange={(v) => setEditItem({ ...editItem, destination_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination" />
                  </SelectTrigger>
                  <SelectContent>
                    {destinations.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Name</Label>
                <Input
                  value={editItem.name || ""}
                  onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Capital</Label>
                <Input
                  value={editItem.capital || ""}
                  onChange={(e) => setEditItem({ ...editItem, capital: e.target.value })}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={editItem.description || ""}
                  onChange={(e) => setEditItem({ ...editItem, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label>Image</Label>
                <AdminImageUpload
                  value={editItem.image || ""}
                  onChange={(url) => setEditItem({ ...editItem, image: url })}
                  folder="regions"
                />
              </div>
              <div>
                <Label>Highlights (comma-separated)</Label>
                <Input
                  value={highlightsInput}
                  onChange={(e) => setHighlightsInput(e.target.value)}
                />
              </div>
              <div>
                <Label>Hidden Gems (comma-separated)</Label>
                <Input
                  value={hiddenGemsInput}
                  onChange={(e) => setHiddenGemsInput(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditItem(null)}>Cancel</Button>
            <Button onClick={() => editItem && saveMutation.mutate(editItem)} disabled={saveMutation.isPending}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Region?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
