import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Archive } from "lucide-react";
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

type ArchiveItem = {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  region: string;
  country: string;
  image: string;
};

const emptyItem: Partial<ArchiveItem> = {
  title: "",
  summary: "",
  content: "",
  category: "",
  region: "",
  country: "",
  image: "",
};

export default function AdminArchive() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editItem, setEditItem] = useState<Partial<ArchiveItem> | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin-archive"],
    queryFn: async () => {
      const { data, error } = await supabase.from("archive_items").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as ArchiveItem[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (item: Partial<ArchiveItem>) => {
      if (item.id && items.some((i) => i.id === item.id)) {
        const { error } = await supabase.from("archive_items").update(item).eq("id", item.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("archive_items").insert([item as any]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({ title: "Saved", description: "Archive item saved successfully." });
      queryClient.invalidateQueries({ queryKey: ["admin-archive"] });
      setEditItem(null);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("archive_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Deleted", description: "Archive item removed." });
      queryClient.invalidateQueries({ queryKey: ["admin-archive"] });
      setDeleteId(null);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const openEdit = (item?: ArchiveItem) => {
    if (item) {
      setEditItem(item);
    } else {
      setEditItem({ ...emptyItem, id: crypto.randomUUID() });
    }
  };

  return (
    <AdminLayout title="Manage Archive" description="Add, edit, or remove heritage archive items">
      <div className="flex justify-end mb-6">
        <Button onClick={() => openEdit()}>
          <Plus className="h-4 w-4 mr-2" /> Add Archive Item
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
      ) : items.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border border-border">
          <Archive className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No archive items yet</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl border border-border p-4 flex gap-4"
            >
              <div className="w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                {item.image && (
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-display font-semibold truncate">{item.title}</h3>
                  <Badge variant="secondary" className="text-xs">{item.category}</Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1">{item.summary}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button variant="outline" size="icon" onClick={() => openEdit(item)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => setDeleteId(item.id)}>
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
              {editItem && items.some((i) => i.id === editItem.id) ? "Edit" : "Add"} Archive Item
            </DialogTitle>
          </DialogHeader>
          {editItem && (
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={editItem.title || ""}
                  onChange={(e) => setEditItem({ ...editItem, title: e.target.value })}
                />
              </div>
              <div>
                <Label>Category</Label>
                <Input
                  value={editItem.category || ""}
                  onChange={(e) => setEditItem({ ...editItem, category: e.target.value })}
                  placeholder="e.g. History, Traditions, Art"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Country</Label>
                  <Input
                    value={editItem.country || ""}
                    onChange={(e) => setEditItem({ ...editItem, country: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Region</Label>
                  <Input
                    value={editItem.region || ""}
                    onChange={(e) => setEditItem({ ...editItem, region: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Summary</Label>
                <Textarea
                  value={editItem.summary || ""}
                  onChange={(e) => setEditItem({ ...editItem, summary: e.target.value })}
                  rows={2}
                />
              </div>
              <div>
                <Label>Full Content</Label>
                <Textarea
                  value={editItem.content || ""}
                  onChange={(e) => setEditItem({ ...editItem, content: e.target.value })}
                  rows={5}
                />
              </div>
              <div>
                <Label>Image</Label>
                <AdminImageUpload
                  value={editItem.image || ""}
                  onChange={(url) => setEditItem({ ...editItem, image: url })}
                  folder="archive"
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
            <AlertDialogTitle>Delete Archive Item?</AlertDialogTitle>
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
