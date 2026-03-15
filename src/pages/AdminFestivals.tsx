import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Calendar } from "lucide-react";
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

type Festival = {
  id: string;
  name: string;
  month: string;
  region: string;
  country: string;
  description: string;
  image: string;
  highlights: string[];
};

const emptyFestival: Partial<Festival> = {
  name: "",
  month: "",
  region: "",
  country: "",
  description: "",
  image: "",
  highlights: [],
};

export default function AdminFestivals() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editItem, setEditItem] = useState<Partial<Festival> | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [highlightsInput, setHighlightsInput] = useState("");

  const { data: festivals = [], isLoading } = useQuery({
    queryKey: ["admin-festivals"],
    queryFn: async () => {
      const { data, error } = await supabase.from("festivals").select("*").order("month");
      if (error) throw error;
      return data as Festival[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (item: Partial<Festival>) => {
      const highlights = highlightsInput.split(",").map((s) => s.trim()).filter(Boolean);
      const payload = { ...item, highlights };

      if (item.id && festivals.some((f) => f.id === item.id)) {
        const { error } = await supabase.from("festivals").update(payload).eq("id", item.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("festivals").insert([payload as any]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({ title: "Saved", description: "Festival saved successfully." });
      queryClient.invalidateQueries({ queryKey: ["admin-festivals"] });
      setEditItem(null);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("festivals").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Deleted", description: "Festival removed." });
      queryClient.invalidateQueries({ queryKey: ["admin-festivals"] });
      setDeleteId(null);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const openEdit = (item?: Festival) => {
    if (item) {
      setEditItem(item);
      setHighlightsInput(item.highlights?.join(", ") || "");
    } else {
      setEditItem({ ...emptyFestival, id: crypto.randomUUID() });
      setHighlightsInput("");
    }
  };

  return (
    <AdminLayout title="Manage Festivals" description="Add, edit, or remove cultural festivals">
      <div className="flex justify-end mb-6">
        <Button onClick={() => openEdit()}>
          <Plus className="h-4 w-4 mr-2" /> Add Festival
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
      ) : festivals.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border border-border">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No festivals yet</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {festivals.map((fest) => (
            <motion.div
              key={fest.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl border border-border p-4 flex gap-4"
            >
              <div className="w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                {fest.image && (
                  <img src={fest.image} alt={fest.name} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-display font-semibold">{fest.name}</h3>
                  <Badge variant="secondary" className="text-xs">{fest.month}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{fest.region}, {fest.country}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button variant="outline" size="icon" onClick={() => openEdit(fest)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => setDeleteId(fest.id)}>
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
              {editItem && festivals.some((f) => f.id === editItem.id) ? "Edit" : "Add"} Festival
            </DialogTitle>
          </DialogHeader>
          {editItem && (
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={editItem.name || ""}
                  onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Month</Label>
                  <Input
                    value={editItem.month || ""}
                    onChange={(e) => setEditItem({ ...editItem, month: e.target.value })}
                    placeholder="e.g. August"
                  />
                </div>
                <div>
                  <Label>Country</Label>
                  <Input
                    value={editItem.country || ""}
                    onChange={(e) => setEditItem({ ...editItem, country: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Region</Label>
                <Input
                  value={editItem.region || ""}
                  onChange={(e) => setEditItem({ ...editItem, region: e.target.value })}
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
                  folder="festivals"
                />
              </div>
              <div>
                <Label>Highlights (comma-separated)</Label>
                <Input
                  value={highlightsInput}
                  onChange={(e) => setHighlightsInput(e.target.value)}
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
            <AlertDialogTitle>Delete Festival?</AlertDialogTitle>
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
