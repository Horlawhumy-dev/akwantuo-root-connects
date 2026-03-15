import { useState, useRef, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Sparkles, MapPin, Calendar, Wallet, Users, Loader2, Copy, Check, RotateCcw, Save, Plus, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { SEOHead } from "@/components/SEOHead";

const INTERESTS = [
  "History & Heritage", "Food & Cuisine", "Music & Nightlife", "Art & Crafts",
  "Nature & Wildlife", "Spirituality & Ancestry", "Markets & Shopping",
  "Festivals & Events", "Photography", "Adventure & Hiking",
];

const COUNTRIES = [
  { id: "ghana", name: "Ghana" },
  { id: "nigeria", name: "Nigeria" },
  { id: "senegal", name: "Senegal" },
  { id: "togo", name: "Togo" },
  { id: "benin", name: "Benin" },
  { id: "cote-divoire", name: "Côte d'Ivoire" },
  { id: "mali", name: "Mali" },
];

const BUDGETS = ["Budget", "Mid-range", "Luxury"];

interface ParsedDay {
  dayNumber: number;
  title: string;
  content: string;
}

function parseDays(markdown: string): { days: ParsedDay[]; preamble: string; postamble: string } {
  const dayRegex = /^##\s+(Day\s+(\d+)[^\n]*)/gim;
  const matches = [...markdown.matchAll(dayRegex)];

  if (matches.length === 0) return { days: [], preamble: markdown, postamble: "" };

  const preamble = markdown.slice(0, matches[0].index).trim();
  const days: ParsedDay[] = [];

  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index! + matches[i][0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index! : undefined;
    const content = markdown.slice(start, end).trim();
    // Check if the remaining content contains the next day header or postamble sections
    days.push({
      dayNumber: parseInt(matches[i][2]),
      title: matches[i][1],
      content,
    });
  }

  // Extract postamble (content after last day that starts with ## but isn't a Day header)
  const lastDayContent = days[days.length - 1].content;
  const postambleMatch = lastDayContent.match(/\n(##\s+(?!Day\s+\d)[^\n]*[\s\S]*)$/i);
  let postamble = "";
  if (postambleMatch) {
    postamble = postambleMatch[1].trim();
    days[days.length - 1].content = lastDayContent.slice(0, postambleMatch.index).trim();
  }

  return { days, preamble, postamble };
}

export default function AiTripPlanner() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  const [country, setCountry] = useState(searchParams.get("country") || "Ghana");
  const [duration, setDuration] = useState(searchParams.get("duration") || "7");
  const [budget, setBudget] = useState(searchParams.get("budget") || "Mid-range");
  const [travelers, setTravelers] = useState(searchParams.get("travelers") || "1");
  const [selectedInterests, setSelectedInterests] = useState<string[]>(["History & Heritage", "Food & Cuisine"]);
  const [itinerary, setItinerary] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedDays, setSavedDays] = useState<Set<number>>(new Set());
  const [savingDay, setSavingDay] = useState<number | null>(null);
  const [pickItineraryOpen, setPickItineraryOpen] = useState(false);
  const [pendingDay, setPendingDay] = useState<ParsedDay | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const parsed = useMemo(() => parseDays(itinerary), [itinerary]);

  const { data: userItineraries = [] } = useQuery({
    queryKey: ["itineraries", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("itineraries")
        .select("id, title")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const generateItinerary = useCallback(async () => {
    if (selectedInterests.length === 0) {
      toast({ title: "Select at least one interest", variant: "destructive" });
      return;
    }
    setItinerary("");
    setIsStreaming(true);
    setSavedDays(new Set());

    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-trip-planner`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            interests: selectedInterests.join(", "),
            duration: parseInt(duration),
            budget,
            country,
            travelers: parseInt(travelers),
            region: searchParams.get("region") || undefined,
          }),
        }
      );

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Failed to generate itinerary" }));
        throw new Error(err.error || `Error ${resp.status}`);
      }

      if (!resp.body) throw new Error("No response stream");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIdx: number;
        while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIdx);
          buffer = buffer.slice(newlineIdx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              accumulated += content;
              setItinerary(accumulated);
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setIsStreaming(false);
    }
  }, [selectedInterests, duration, budget, country, travelers, toast]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(itinerary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied to clipboard!" });
  };

  const saveDayToItinerary = async (itineraryId: string, day: ParsedDay) => {
    setSavingDay(day.dayNumber);
    try {
      const { error } = await supabase.from("itinerary_items").insert({
        itinerary_id: itineraryId,
        title: day.title,
        item_type: "ai_generated",
        day_number: day.dayNumber,
        notes: day.content,
        sort_order: day.dayNumber,
      });
      if (error) throw error;
      setSavedDays(prev => new Set(prev).add(day.dayNumber));
      queryClient.invalidateQueries({ queryKey: ["itineraries"] });
      toast({ title: "Day saved!", description: `${day.title} added to your itinerary.` });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setSavingDay(null);
    }
  };

  const createAndSaveDay = async (day: ParsedDay) => {
    setSavingDay(day.dayNumber);
    try {
      if (!user) throw new Error("Please log in");
      const { data, error } = await supabase.from("itineraries").insert({
        user_id: user.id,
        title: `AI Trip: ${duration} days in ${country}`,
        description: `${budget} trip focused on ${selectedInterests.slice(0, 3).join(", ")}. Generated by AI.`,
        country,
      }).select().single();
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["itineraries"] });
      await saveDayToItinerary(data.id, day);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
      setSavingDay(null);
    }
  };

  const handleSaveDay = (day: ParsedDay) => {
    if (!user) {
      toast({ title: "Please log in", description: "You need to be logged in to save days.", variant: "destructive" });
      return;
    }
    if (userItineraries.length === 0) {
      createAndSaveDay(day);
    } else {
      setPendingDay(day);
      setPickItineraryOpen(true);
    }
  };

  const saveAllDays = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Please log in");
      const { data: itin, error } = await supabase.from("itineraries").insert({
        user_id: user.id,
        title: `AI Trip: ${duration} days in ${country}`,
        description: `${budget} trip focused on ${selectedInterests.slice(0, 3).join(", ")}. Generated by AI.`,
        country,
      }).select().single();
      if (error) throw error;

      const items = parsed.days.map(day => ({
        itinerary_id: itin.id,
        title: day.title,
        item_type: "ai_generated" as const,
        day_number: day.dayNumber,
        notes: day.content,
        sort_order: day.dayNumber,
      }));
      const { error: itemsErr } = await supabase.from("itinerary_items").insert(items);
      if (itemsErr) throw itemsErr;
      return itin;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["itineraries"] });
      setSavedDays(new Set(parsed.days.map(d => d.dayNumber)));
      toast({ title: "All days saved!", description: "Full itinerary saved to your trip planner." });
      navigate(`/itineraries/${data.id}`);
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const proseClasses = "prose prose-sm max-w-none dark:prose-invert prose-headings:font-display prose-h3:text-foreground/80 prose-strong:text-foreground prose-li:text-muted-foreground prose-p:text-muted-foreground";

  return (
    <div>
      <SEOHead title="AI Trip Planner | Akwantuo" description="Get a personalized West African itinerary powered by AI based on your interests, budget and duration." />
      
      <section className="relative py-16 bg-charcoal adinkra-bg-dark">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              <Sparkles className="h-3 w-3 mr-1" /> AI-Powered
            </Badge>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-charcoal-foreground">
              Trip Planner
            </h1>
            <p className="text-charcoal-foreground/60 mt-2 max-w-xl">
              Tell us your interests, budget, and how long you're staying — our AI builds a day-by-day itinerary tailored to your heritage journey.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-8 adinkra-bg">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-[380px_1fr] gap-8">
            {/* Form */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="bg-card border border-border rounded-xl p-6 space-y-5">
                <div>
                  <Label className="flex items-center gap-2 mb-2"><MapPin className="h-4 w-4 text-primary" /> Destination</Label>
                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="flex items-center gap-2 mb-2"><Calendar className="h-4 w-4 text-primary" /> Days</Label>
                    <Input type="number" min={1} max={30} value={duration} onChange={e => setDuration(e.target.value)} />
                  </div>
                  <div>
                    <Label className="flex items-center gap-2 mb-2"><Users className="h-4 w-4 text-primary" /> Travelers</Label>
                    <Input type="number" min={1} max={20} value={travelers} onChange={e => setTravelers(e.target.value)} />
                  </div>
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-2"><Wallet className="h-4 w-4 text-primary" /> Budget</Label>
                  <Select value={budget} onValueChange={setBudget}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {BUDGETS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-2 block">Interests</Label>
                  <div className="flex flex-wrap gap-2">
                    {INTERESTS.map(interest => (
                      <button
                        key={interest}
                        onClick={() => toggleInterest(interest)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                          selectedInterests.includes(interest)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted/50 text-muted-foreground border-border hover:border-primary/50"
                        }`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>

                <Button onClick={generateItinerary} disabled={isStreaming} className="w-full" size="lg">
                  {isStreaming ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</> : <><Sparkles className="h-4 w-4 mr-2" /> Generate Itinerary</>}
                </Button>
              </div>
            </motion.div>

            {/* Result */}
            <div ref={contentRef}>
              {!itinerary && !isStreaming ? (
                <div className="bg-card border border-border rounded-xl flex items-center justify-center min-h-[400px] text-center p-8">
                  <div>
                    <Sparkles className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                    <h3 className="font-display text-lg font-semibold text-muted-foreground mb-2">Your itinerary will appear here</h3>
                    <p className="text-sm text-muted-foreground/60">Fill in your preferences and hit Generate</p>
                  </div>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  {/* Top actions */}
                  {itinerary && !isStreaming && (
                    <div className="flex gap-2 flex-wrap">
                      <Button variant="outline" size="sm" onClick={copyToClipboard}>
                        {copied ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                        {copied ? "Copied" : "Copy"}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => { setItinerary(""); generateItinerary(); }}>
                        <RotateCcw className="h-3.5 w-3.5 mr-1" /> Regenerate
                      </Button>
                      {user && parsed.days.length > 0 && (
                        <Button size="sm" onClick={() => saveAllDays.mutate()} disabled={saveAllDays.isPending}>
                          <Save className="h-3.5 w-3.5 mr-1" /> Save All Days
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Preamble */}
                  {parsed.preamble && (
                    <div className={`bg-card border border-border rounded-xl p-6 ${proseClasses}`}>
                      <ReactMarkdown>{parsed.preamble}</ReactMarkdown>
                    </div>
                  )}

                  {/* Day cards */}
                  {parsed.days.length > 0 ? (
                    parsed.days.map(day => (
                      <div key={day.dayNumber} className="bg-card border border-border rounded-xl overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-muted/30">
                          <h2 className="font-display font-semibold text-primary">{day.title}</h2>
                          {!isStreaming && user && (
                            savedDays.has(day.dayNumber) ? (
                              <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                                <CheckCircle2 className="h-3.5 w-3.5" /> Saved
                              </span>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSaveDay(day)}
                                disabled={savingDay === day.dayNumber}
                                className="text-xs h-7"
                              >
                                {savingDay === day.dayNumber ? (
                                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                ) : (
                                  <Plus className="h-3 w-3 mr-1" />
                                )}
                                Save Day
                              </Button>
                            )
                          )}
                        </div>
                        <div className={`px-6 py-4 ${proseClasses}`}>
                          <ReactMarkdown>{day.content}</ReactMarkdown>
                        </div>
                      </div>
                    ))
                  ) : (
                    /* Fallback: no days parsed yet (still streaming or non-day format) */
                    <div className={`bg-card border border-border rounded-xl p-6 md:p-8 ${proseClasses}`}>
                      <ReactMarkdown>{itinerary}</ReactMarkdown>
                    </div>
                  )}

                  {/* Postamble (Pro Tips etc.) */}
                  {parsed.postamble && (
                    <div className={`bg-card border border-border rounded-xl p-6 ${proseClasses}`}>
                      <ReactMarkdown>{parsed.postamble}</ReactMarkdown>
                    </div>
                  )}

                  {/* Streaming indicator */}
                  {isStreaming && <span className="inline-block w-2 h-5 bg-primary animate-pulse rounded-sm ml-1" />}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Pick itinerary dialog */}
      <Dialog open={pickItineraryOpen} onOpenChange={setPickItineraryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save to which itinerary?</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {userItineraries.map(itin => (
              <button
                key={itin.id}
                onClick={async () => {
                  setPickItineraryOpen(false);
                  if (pendingDay) await saveDayToItinerary(itin.id, pendingDay);
                  setPendingDay(null);
                }}
                className="w-full text-left px-4 py-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <span className="font-medium text-sm">{itin.title}</span>
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            onClick={async () => {
              setPickItineraryOpen(false);
              if (pendingDay) await createAndSaveDay(pendingDay);
              setPendingDay(null);
            }}
          >
            <Plus className="h-4 w-4 mr-2" /> Create New Itinerary
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
