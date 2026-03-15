import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, BookOpen, Minus, Plus, Sun, Moon, Type, X, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useArchiveItem, useArchiveItems } from "@/hooks/use-supabase-data";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { SEOHead } from "@/components/SEOHead";
import { useReadingMode, ReadingTheme } from "@/hooks/use-reading-mode";

const themeStyles: Record<ReadingTheme, { bg: string; text: string; muted: string; border: string }> = {
  light: { bg: "bg-background", text: "text-foreground", muted: "text-muted-foreground", border: "border-border" },
  sepia: { bg: "bg-[hsl(36,40%,95%)]", text: "text-[hsl(30,20%,15%)]", muted: "text-[hsl(30,15%,40%)]", border: "border-[hsl(36,30%,85%)]" },
  dark: { bg: "bg-[hsl(220,15%,10%)]", text: "text-[hsl(220,10%,85%)]", muted: "text-[hsl(220,10%,55%)]", border: "border-[hsl(220,15%,20%)]" },
};

const themeIcons: Record<ReadingTheme, { label: string; icon: React.ReactNode }> = {
  light: { label: "Light", icon: <Sun className="h-3.5 w-3.5" /> },
  sepia: { label: "Sepia", icon: <Type className="h-3.5 w-3.5" /> },
  dark: { label: "Dark", icon: <Moon className="h-3.5 w-3.5" /> },
};

export default function ArchiveDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: item, isLoading } = useArchiveItem(id);
  const { data: allItems } = useArchiveItems();
  const reading = useReadingMode();

  const relatedStories = useMemo(() => {
    if (!item || !allItems) return [];
    return allItems
      .filter((i) => i.country === item.country && i.id !== item.id)
      .slice(0, 3);
  }, [item, allItems]);

  if (isLoading) return <LoadingSpinner message="Loading article..." />;

  if (!item) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold mb-2">Item not found</h2>
          <Button asChild variant="outline"><Link to="/archive">Back to Archive</Link></Button>
        </div>
      </div>
    );
  }

  const ts = themeStyles[reading.theme];
  const paragraphs = item.content.split("\n\n").filter(Boolean);

  // Detect section headers (ALL CAPS lines or lines ending with colon)
  const renderParagraph = (para: string, i: number) => {
    const trimmed = para.trim();
    const isHeader = /^[A-Z\s:&—–-]{5,}$/.test(trimmed) || /^(ABOUT|KEY|LEGACY|ON |THE )/.test(trimmed);
    
    if (isHeader) {
      return (
        <h3
          key={i}
          className="font-display font-bold mt-8 mb-3"
          style={{ fontSize: reading.fontSize + 2 }}
        >
          {trimmed}
        </h3>
      );
    }

    // Check for proverb format (quoted lines with attribution)
    if (trimmed.startsWith('"') && trimmed.includes('—')) {
      return (
        <blockquote
          key={i}
          className={`border-l-4 border-primary/40 pl-4 italic my-4 ${ts.muted}`}
          style={{ fontSize: reading.fontSize }}
        >
          {trimmed}
        </blockquote>
      );
    }

    // Check for "Meaning:" lines
    if (trimmed.startsWith('Meaning:')) {
      return (
        <p key={i} className={`${ts.muted} ml-5 mb-4`} style={{ fontSize: reading.fontSize - 2 }}>
          <em>{trimmed}</em>
        </p>
      );
    }

    return (
      <p key={i} className={`${ts.muted} leading-relaxed mb-5`} style={{ fontSize: reading.fontSize }}>
        {trimmed}
      </p>
    );
  };

  return (
    <div className={reading.isReading ? `min-h-screen ${ts.bg} transition-colors duration-300` : ""}>
      <SEOHead
        title={item.title}
        description={item.summary}
        image={item.image}
        url={`https://akwantu-roots-connect.lovable.app/archive/${item.id}`}
      />

      {/* Reading mode progress bar */}
      <AnimatePresence>
        {reading.isReading && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-0 left-0 right-0 z-50 ${ts.bg} ${ts.border} border-b`}
          >
            <Progress value={reading.progress} className="h-1 rounded-none" />
            <div className="container mx-auto px-4 py-2 flex items-center justify-between">
              <button onClick={reading.exitReading} className={`flex items-center gap-2 text-sm ${ts.muted} hover:${ts.text} transition-colors`}>
                <X className="h-4 w-4" /> Exit Reading
              </button>
              <div className="flex items-center gap-3">
                {/* Font size controls */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => reading.setFontSize(reading.fontSize - 2)}
                    className={`h-7 w-7 rounded-md flex items-center justify-center ${ts.border} border ${ts.muted} hover:${ts.text}`}
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className={`text-xs ${ts.muted} w-8 text-center`}>{reading.fontSize}</span>
                  <button
                    onClick={() => reading.setFontSize(reading.fontSize + 2)}
                    className={`h-7 w-7 rounded-md flex items-center justify-center ${ts.border} border ${ts.muted} hover:${ts.text}`}
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                {/* Theme controls */}
                <div className="flex items-center gap-1">
                  {(Object.keys(themeIcons) as ReadingTheme[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => reading.setTheme(t)}
                      className={`h-7 px-2 rounded-md flex items-center gap-1 text-xs transition-colors ${
                        reading.theme === t
                          ? "bg-primary text-primary-foreground"
                          : `${ts.border} border ${ts.muted}`
                      }`}
                    >
                      {themeIcons[t].icon}
                    </button>
                  ))}
                </div>
                <span className={`text-[10px] ${ts.muted}`}>{Math.round(reading.progress)}%</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero - hidden in reading mode */}
      {!reading.isReading && (
        <section
          className="relative py-28 bg-cover bg-center"
          style={{ backgroundImage: `url(${item.image})` }}
        >
          <div className="absolute inset-0 bg-charcoal/75" />
          <div className="container mx-auto px-4 relative z-10">
            <Button variant="ghost" size="sm" asChild className="text-charcoal-foreground/60 mb-4 hover:text-charcoal-foreground">
              <Link to="/archive"><ArrowLeft className="h-4 w-4 mr-1" /> Archive</Link>
            </Button>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Badge className="mb-3 bg-primary/20 text-primary border-0">{item.category}</Badge>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-charcoal-foreground mb-3 max-w-3xl">{item.title}</h1>
              <p className="text-charcoal-foreground/60 text-sm mb-5">{item.region}, {item.country}</p>
              <Button
                size="sm"
                onClick={reading.enterReading}
                className="bg-primary/20 text-primary-foreground border border-primary/30 hover:bg-primary/30"
              >
                <BookOpen className="h-4 w-4 mr-2" /> Enter Reading Mode
              </Button>
            </motion.div>
          </div>
        </section>
      )}

      {/* Content */}
      <section className={`py-16 ${reading.isReading ? `pt-24 ${ts.bg}` : "adinkra-bg"}`}>
        <div className="container mx-auto px-4">
          <div ref={reading.contentRef} className="max-w-3xl mx-auto">
            {/* Reading mode title */}
            {reading.isReading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-10">
                <Badge className="mb-3 bg-primary/10 text-primary border-0 text-xs">{item.category}</Badge>
                <h1 className={`font-display text-3xl sm:text-4xl font-bold ${ts.text} mb-2`}>{item.title}</h1>
                <p className={`text-sm ${ts.muted}`}>{item.region}, {item.country}</p>
              </motion.div>
            )}

            {/* Image in reading mode */}
            {reading.isReading && (
              <div className="rounded-xl overflow-hidden mb-8">
                <img src={item.image} alt={item.title} className="w-full h-64 object-cover" loading="lazy" />
              </div>
            )}

            {/* Summary */}
            <p
              className={`font-medium mb-8 leading-relaxed border-l-4 border-primary pl-6 ${reading.isReading ? ts.text : "text-foreground/80 text-lg"}`}
              style={reading.isReading ? { fontSize: reading.fontSize + 1 } : undefined}
            >
              {item.summary}
            </p>

            {/* Main content */}
            <div>{paragraphs.map((para, i) => renderParagraph(para, i))}</div>

            {/* Book purchase note */}
            {item.category === "Literature" && (
              <div className={`mt-10 rounded-xl p-6 border ${reading.isReading ? `${ts.border} ${ts.bg}` : "border-primary/20 bg-primary/5"}`}>
                <p className={`text-sm ${reading.isReading ? ts.muted : "text-muted-foreground"}`}>
                  📚 This is a summary of a copyrighted work. Support African authors by purchasing the full book from your local bookshop or African-owned online stores.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Related Stories */}
      {!reading.isReading && relatedStories.length > 0 && (
        <section className="py-12 border-t border-border adinkra-bg">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-xl font-bold mb-6">
              More from {item.country}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedStories.map((story, i) => (
                <motion.div
                  key={story.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={`/archive/${story.id}`}
                    className="group block rounded-2xl overflow-hidden border border-border bg-card card-hover"
                  >
                    <div className="h-40 overflow-hidden relative">
                      <div
                        className="h-full w-full bg-cover bg-center group-hover:scale-105 transition-transform duration-700"
                        style={{ backgroundImage: `url(${story.image})` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 via-transparent to-transparent" />
                    </div>
                    <div className="p-4">
                      <Badge className="mb-1.5 border-0 text-[10px] rounded-full bg-primary/10 text-primary">
                        {story.category}
                      </Badge>
                      <h3 className="font-display font-semibold text-sm mb-1 group-hover:text-primary transition-colors line-clamp-2">
                        {story.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 inline mr-1" />{story.region}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
