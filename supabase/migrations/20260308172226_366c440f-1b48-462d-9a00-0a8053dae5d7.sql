
-- Create packing checklist table to persist user's packing progress
CREATE TABLE public.packing_checklists (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  checked_items jsonb NOT NULL DEFAULT '{}'::jsonb,
  reminder_enabled boolean NOT NULL DEFAULT false,
  trip_date date,
  last_reminder_sent_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.packing_checklists ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own checklist"
  ON public.packing_checklists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own checklist"
  ON public.packing_checklists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own checklist"
  ON public.packing_checklists FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own checklist"
  ON public.packing_checklists FOR DELETE
  USING (auth.uid() = user_id);

-- Timestamp trigger
CREATE TRIGGER update_packing_checklists_updated_at
  BEFORE UPDATE ON public.packing_checklists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Allow the reminder edge function to read checklists (service role handles this)
