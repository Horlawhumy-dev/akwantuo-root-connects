import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface EditItineraryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itinerary: { title: string; description: string | null; start_date: string | null; end_date: string | null };
  onSave: (data: { title: string; description: string; start_date: string | null; end_date: string | null }) => void;
  isPending: boolean;
}

export function EditItineraryDialog({ open, onOpenChange, itinerary, onSave, isPending }: EditItineraryDialogProps) {
  const [title, setTitle] = useState(itinerary.title);
  const [description, setDescription] = useState(itinerary.description || "");
  const [startDate, setStartDate] = useState(itinerary.start_date || "");
  const [endDate, setEndDate] = useState(itinerary.end_date || "");

  useEffect(() => {
    if (open) {
      setTitle(itinerary.title);
      setDescription(itinerary.description || "");
      setStartDate(itinerary.start_date || "");
      setEndDate(itinerary.end_date || "");
    }
  }, [open, itinerary]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Edit Itinerary</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
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
          <Button
            onClick={() => onSave({ title, description, start_date: startDate || null, end_date: endDate || null })}
            disabled={!title || isPending}
            className="w-full"
          >
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
