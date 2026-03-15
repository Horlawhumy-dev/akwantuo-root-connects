import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, AlertTriangle, ShieldCheck, ShieldAlert, Shield } from "lucide-react";
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

type SafetyZone = {
  id: string;
  name: string;
  level: string;
  region: string;
  country: string;
  description: string;
};

const emptyItem: Partial<SafetyZone> = {
  name: "",
  level: "safe",
  region: "",
  country: "",
  description: "",
};

const levelColors: Record<string, string> = {
  safe: "bg-green-100 text-green-800 border-green-200",
  caution: "bg-yellow-100 text-yellow-800 border-yellow-200",
  avoid: "bg-red-100 text-red-800 border-red-200",
};

const levelIcons: Record<string, React.ElementType> = {
  safe: ShieldCheck,
  caution: Shield,
  avoid: ShieldAlert,
};

export default function AdminSafety() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editItem, setEditItem] = useState<Partial<SafetyZone> | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: zones = [], isLoading } = useQuery({
    queryKey: ["admin-safety-zones"],
    queryFn: async () => {
      const { data, error } = await supabase.from("safety_zones").select("*").order("country");
      if (error) throw error;
      return data as SafetyZone[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (item: Partial<SafetyZone>) => {
      if (item.id && zones.some((z) => z.id === item.id)) {
        const { error } = await supabase.from("safety_zones").update(item).eq("id", item.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("safety_zones").insert([item as any]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({ title: "Saved", description: "Safety zone saved successfully." });
      queryClient.invalidateQueries({ queryKey: ["admin-safety-zones"] });
      setEditItem(null);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("safety_zones").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Deleted", description: "Safety zone removed." });
      queryClient.invalidateQueries({ queryKey: ["admin-safety-zones"] });
      setDeleteId(null);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const openEdit = (item?: SafetyZone) => {
    if (item) {
      setEditItem(item);
    } else {
      setEditItem({ ...emptyItem, id: crypto.randomUUID() });
    }
  };

  return (
    <AdminLayout title="Manage Safety Zones" description="Add, edit, or remove travel safety advisories">
      <div className="flex justify-end mb-6">
        <Button onClick={() => openEdit()}>
          <Plus className="h-4 w-4 mr-2" /> Add Safety Zone
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
      ) : zones.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border border-border">
          <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No safety zones yet</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {zones.map((zone) => {
            const LevelIcon = levelIcons[zone.level] || Shield;
            return (
              <motion.div
                key={zone.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-xl border border-border p-4 flex gap-4"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-muted flex-shrink-0">
                  <LevelIcon className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-display font-semibold">{zone.name}</h3>
                    <Badge className={`${levelColors[zone.level]} border text-xs capitalize`}>
                      {zone.level}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{zone.region}, {zone.country}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button variant="outline" size="icon" onClick={() => openEdit(zone)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => setDeleteId(zone.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editItem && zones.some((z) => z.id === editItem.id) ? "Edit" : "Add"} Safety Zone
            </DialogTitle>
          </DialogHeader>
          {editItem && (
            <div className="space-y-4">
              <div>
                <Label>Zone Name</Label>
                <Input
                  value={editItem.name || ""}
                  onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Safety Level</Label>
                <Select
                  value={editItem.level || "safe"}
                  onValueChange={(v) => setEditItem({ ...editItem, level: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="safe">Safe</SelectItem>
                    <SelectItem value="caution">Caution</SelectItem>
                    <SelectItem value="avoid">Avoid</SelectItem>
                  </SelectContent>
                </Select>
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
                <Label>Description</Label>
                <Textarea
                  value={editItem.description || ""}
                  onChange={(e) => setEditItem({ ...editItem, description: e.target.value })}
                  rows={3}
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
            <AlertDialogTitle>Delete Safety Zone?</AlertDialogTitle>
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
