import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Trash2, Calendar as CalIcon, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { EditItineraryDialog } from "@/components/itinerary/EditItineraryDialog";
import { EditItemDialog } from "@/components/itinerary/EditItemDialog";

const typeLabels: Record<string, string> = {
  stay: "Stay",
  event: "Event",
  destination: "Destination",
  custom: "Custom",
};

const typeColors: Record<string, string> = {
  stay: "bg-primary/10 text-primary",
  event: "bg-kente-green/10 text-kente-green",
  destination: "bg-secondary/10 text-secondary",
  custom: "bg-muted text-muted-foreground",
};

export default function ItineraryDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editItemDialogOpen, setEditItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [itemTitle, setItemTitle] = useState("");
  const [itemType, setItemType] = useState("custom");
  const [itemDay, setItemDay] = useState("1");
  const [itemNotes, setItemNotes] = useState("");

  const { data: itinerary } = useQuery({
    queryKey: ["itinerary", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("itineraries")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: items = [] } = useQuery({
    queryKey: ["itinerary-items", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("itinerary_items")
        .select("*")
        .eq("itinerary_id", id!)
        .order("day_number")
        .order("sort_order");
      if (error) throw error;
      return data || [];
    },
    enabled: !!id,
  });

  const addItem = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("itinerary_items").insert({
        itinerary_id: id!,
        title: itemTitle,
        item_type: itemType,
        day_number: parseInt(itemDay),
        notes: itemNotes || "",
        sort_order: items.filter((i: any) => i.day_number === parseInt(itemDay)).length,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itinerary-items", id] });
      setDialogOpen(false);
      setItemTitle(""); setItemNotes(""); setItemDay("1"); setItemType("custom");
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const updateItinerary = useMutation({
    mutationFn: async (data: { title: string; description: string; start_date: string | null; end_date: string | null }) => {
      const { error } = await supabase.from("itineraries").update(data).eq("id", id!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itinerary", id] });
      setEditDialogOpen(false);
      toast({ title: "Updated", description: "Itinerary details saved." });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const updateItem = useMutation({
    mutationFn: async ({ itemId, data }: { itemId: string; data: { title: string; item_type: string; day_number: number; notes: string } }) => {
      const { error } = await supabase.from("itinerary_items").update(data).eq("id", itemId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itinerary-items", id] });
      setEditItemDialogOpen(false);
      setEditingItem(null);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const deleteItem = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase.from("itinerary_items").delete().eq("id", itemId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["itinerary-items", id] }),
  });

  // Group items by day
  const days = items.reduce((acc: Record<number, any[]>, item: any) => {
    if (!acc[item.day_number]) acc[item.day_number] = [];
    acc[item.day_number].push(item);
    return acc;
  }, {});

  const sortedDays = Object.keys(days).map(Number).sort((a, b) => a - b);

  if (!itinerary) return <div className="min-h-[60vh] flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;

  return (
    <div>
      <section className="relative py-16 bg-charcoal adinkra-bg-dark">
        <div className="container mx-auto px-4 relative z-10">
          <Button variant="ghost" size="sm" className="text-charcoal-foreground/60 mb-4" asChild>
            <Link to="/itineraries"><ArrowLeft className="h-4 w-4 mr-1" /> Back to Itineraries</Link>
          </Button>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold text-charcoal-foreground">{itinerary.title}</h1>
              {itinerary.description && <p className="text-charcoal-foreground/60 mt-1">{itinerary.description}</p>}
            </div>
            <Button variant="ghost" size="icon" className="text-charcoal-foreground/60 hover:text-charcoal-foreground" onClick={() => setEditDialogOpen(true)}>
              <Pencil className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      <section className="py-8 adinkra-bg">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="flex justify-end mb-6">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" /> Add Item</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add to Itinerary</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Title</Label>
                    <Input value={itemTitle} onChange={(e) => setItemTitle(e.target.value)} placeholder="Visit Cape Coast Castle" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Type</Label>
                      <Select value={itemType} onValueChange={setItemType}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="stay">Stay</SelectItem>
                          <SelectItem value="event">Event</SelectItem>
                          <SelectItem value="destination">Destination</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Day #</Label>
                      <Input type="number" min="1" value={itemDay} onChange={(e) => setItemDay(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <Label>Notes</Label>
                    <Textarea value={itemNotes} onChange={(e) => setItemNotes(e.target.value)} rows={2} placeholder="Any details..." />
                  </div>
                  <Button onClick={() => addItem.mutate()} disabled={!itemTitle || addItem.isPending} className="w-full">
                    {addItem.isPending ? "Adding..." : "Add"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {sortedDays.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-xl border border-border">
              <CalIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No items yet. Add your first activity!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {sortedDays.map((dayNum) => (
                <div key={dayNum}>
                  <h3 className="font-display font-semibold text-sm text-muted-foreground mb-3">Day {dayNum}</h3>
                  <div className="space-y-2">
                    {days[dayNum].map((item: any) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-card rounded-xl border border-border p-4 flex items-start gap-3 group"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={`text-[10px] border-0 ${typeColors[item.item_type]}`}>
                              {typeLabels[item.item_type]}
                            </Badge>
                            <span className="font-medium text-sm">{item.title}</span>
                          </div>
                          {item.notes && <p className="text-xs text-muted-foreground">{item.notes}</p>}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button
                            onClick={() => { setEditingItem(item); setEditItemDialogOpen(true); }}
                            className="h-7 w-7 rounded-full bg-muted text-muted-foreground flex items-center justify-center hover:bg-accent"
                            aria-label="Edit item"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => deleteItem.mutate(item.id)}
                            className="h-7 w-7 rounded-full bg-destructive/10 text-destructive flex items-center justify-center"
                            aria-label="Remove item"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <EditItineraryDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        itinerary={itinerary}
        onSave={(data) => updateItinerary.mutate(data)}
        isPending={updateItinerary.isPending}
      />

      <EditItemDialog
        open={editItemDialogOpen}
        onOpenChange={setEditItemDialogOpen}
        item={editingItem}
        onSave={(itemId, data) => updateItem.mutate({ itemId, data })}
        isPending={updateItem.isPending}
      />
    </div>
  );
}
