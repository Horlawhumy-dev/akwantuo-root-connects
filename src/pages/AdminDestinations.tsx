import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Globe, Star } from "lucide-react";
import { AdminImageUpload } from "@/components/admin/AdminImageUpload";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

type Destination = {
  id: string;
  country: string;
  tagline: string;
  description: string;
  image: string;
  tier: number;
  landmarks: string[];
};

const emptyDestination: Partial<Destination> = {
  country: "",
  tagline: "",
  description: "",
  image: "",
  tier: 2,
  landmarks: [],
};

export default function AdminDestinations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editItem, setEditItem] = useState<Partial<Destination> | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [landmarksInput, setLandmarksInput] = useState("");

  const { data: destinations = [], isLoading } = useQuery({
    queryKey: ["admin-destinations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("destinations")
        .select("*")
        .order("tier", { ascending: true });
      if (error) throw error;
      return data as Destination[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (item: Partial<Destination>) => {
      const landmarks = landmarksInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const payload = { ...item, landmarks };

      if (item.id && destinations.some((d) => d.id === item.id)) {
        const { error } = await supabase
          .from("destinations")
          .update(payload)
          .eq("id", item.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("destinations").insert([payload as any]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({ title: "Saved", description: "Destination saved successfully." });
      queryClient.invalidateQueries({ queryKey: ["admin-destinations"] });
      setEditItem(null);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("destinations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Deleted", description: "Destination removed." });
      queryClient.invalidateQueries({ queryKey: ["admin-destinations"] });
      setDeleteId(null);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const openEdit = (item?: Destination) => {
    if (item) {
      setEditItem(item);
      setLandmarksInput(item.landmarks?.join(", ") || "");
    } else {
      setEditItem({ ...emptyDestination, id: crypto.randomUUID() });
      setLandmarksInput("");
    }
  };

  return (
    <AdminLayout title="Manage Destinations" description="Add, edit, or remove destination countries">
      <div className="flex justify-end mb-6">
        <Button onClick={() => openEdit()}>
          <Plus className="h-4 w-4 mr-2" /> Add Destination
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
      ) : destinations.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border border-border">
          <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No destinations yet</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {destinations.map((dest) => (
            <motion.div
              key={dest.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl border border-border p-4 flex gap-4"
            >
              <div className="w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                {dest.image && (
                  <img src={dest.image} alt={dest.country} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-display font-semibold">{dest.country}</h3>
                  <Badge variant="secondary" className="text-xs">
                    <Star className="h-3 w-3 mr-1" /> Tier {dest.tier}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1">{dest.tagline}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button variant="outline" size="icon" onClick={() => openEdit(dest)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => setDeleteId(dest.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editItem && destinations.some((d) => d.id === editItem.id) ? "Edit" : "Add"} Destination
            </DialogTitle>
          </DialogHeader>
          {editItem && (
            <div className="space-y-4">
              <div>
                <Label>Country</Label>
                <Input
                  value={editItem.country || ""}
                  onChange={(e) => setEditItem({ ...editItem, country: e.target.value })}
                />
              </div>
              <div>
                <Label>Tagline</Label>
                <Input
                  value={editItem.tagline || ""}
                  onChange={(e) => setEditItem({ ...editItem, tagline: e.target.value })}
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
                  folder="destinations"
                />
              </div>
              <div>
                <Label>Tier (1-3)</Label>
                <Input
                  type="number"
                  min={1}
                  max={3}
                  value={editItem.tier || 2}
                  onChange={(e) => setEditItem({ ...editItem, tier: parseInt(e.target.value) || 2 })}
                />
              </div>
              <div>
                <Label>Landmarks (comma-separated)</Label>
                <Input
                  value={landmarksInput}
                  onChange={(e) => setLandmarksInput(e.target.value)}
                  placeholder="Cape Coast Castle, Elmina, ..."
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditItem(null)}>
              Cancel
            </Button>
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
            <AlertDialogTitle>Delete Destination?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will also remove associated regions.
            </AlertDialogDescription>
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
