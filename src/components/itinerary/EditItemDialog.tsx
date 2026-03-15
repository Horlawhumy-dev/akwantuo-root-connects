import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EditItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: { id: string; title: string; item_type: string; day_number: number; notes: string | null } | null;
  onSave: (id: string, data: { title: string; item_type: string; day_number: number; notes: string }) => void;
  isPending: boolean;
}

export function EditItemDialog({ open, onOpenChange, item, onSave, isPending }: EditItemDialogProps) {
  const [title, setTitle] = useState("");
  const [itemType, setItemType] = useState("custom");
  const [dayNumber, setDayNumber] = useState("1");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open && item) {
      setTitle(item.title);
      setItemType(item.item_type);
      setDayNumber(String(item.day_number));
      setNotes(item.notes || "");
    }
  }, [open, item]);

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Edit Item</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
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
              <Input type="number" min="1" value={dayNumber} onChange={(e) => setDayNumber(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>
          <Button
            onClick={() => onSave(item.id, { title, item_type: itemType, day_number: parseInt(dayNumber), notes })}
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
