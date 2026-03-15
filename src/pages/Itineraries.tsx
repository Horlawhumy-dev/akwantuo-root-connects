import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapIcon, Plus, Trash2, Calendar, GripVertical, Pencil, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function Itineraries() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data: itineraries = [], isLoading } = useQuery({
    queryKey: ["itineraries", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("itineraries")
        .select("*, itinerary_items(count)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const createItinerary = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Must be logged in");
      const { data, error } = await supabase.from("itineraries").insert({
        user_id: user.id,
        title,
        description,
        start_date: startDate || null,
        end_date: endDate || null,
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["itineraries"] });
      setDialogOpen(false);
      setTitle(""); setDescription(""); setStartDate(""); setEndDate("");
      navigate(`/itineraries/${data.id}`);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const deleteItinerary = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("itineraries").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itineraries"] });
      toast({ title: "Deleted", description: "Itinerary removed." });
    },
  });

  if (authLoading) return <div className="min-h-[60vh] flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  if (!user) { navigate("/login"); return null; }

  return (
    <div>
      <section className="relative py-16 bg-charcoal adinkra-bg-dark">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              <MapIcon className="h-3 w-3 mr-1" /> Trip Planner
            </Badge>
            <h1 className="font-display text-3xl font-bold text-charcoal-foreground">My Itineraries</h1>
            <p className="text-charcoal-foreground/60 mt-1">Plan your West African journey day by day</p>
          </motion.div>
        </div>
      </section>

      <section className="py-8 adinkra-bg">
        <div className="container mx-auto px-4">
          <div className="flex justify-end mb-6">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" /> New Itinerary</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Itinerary</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Title</Label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="My Ghana Trip 2026" />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A quick overview of the trip..." rows={2} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Start Date</Label>
                      <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    </div>
                    <div>
                      <Label>End Date</Label>
                      <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    </div>
                  </div>
                  <Button onClick={() => createItinerary.mutate()} disabled={!title || createItinerary.isPending} className="w-full">
                    {createItinerary.isPending ? "Creating..." : "Create"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-card rounded-xl border border-border p-6 animate-pulse">
                  <div className="h-5 bg-muted rounded w-1/3 mb-3" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : itineraries.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-xl border border-border">
              <MapIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="font-display text-xl font-semibold mb-2">No Itineraries Yet</h2>
              <p className="text-muted-foreground mb-4">Create your first trip plan to get started.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {itineraries.map((itin: any) => (
                <motion.div key={itin.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow group relative">
                    <button
                      onClick={() => deleteItinerary.mutate(itin.id)}
                      className="absolute top-3 right-3 h-7 w-7 rounded-full bg-destructive/10 text-destructive flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Delete itinerary"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <Link to={`/itineraries/${itin.id}`}>
                      <h3 className="font-display font-semibold mb-1 group-hover:text-primary transition-colors">{itin.title}</h3>
                      {itin.description && <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{itin.description}</p>}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {itin.start_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(itin.start_date), "MMM d")}
                            {itin.end_date && ` – ${format(new Date(itin.end_date), "MMM d")}`}
                          </span>
                        )}
                        <span>{itin.itinerary_items?.[0]?.count ?? 0} items</span>
                      </div>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
