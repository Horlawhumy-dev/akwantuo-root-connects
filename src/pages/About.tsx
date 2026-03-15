import { motion } from "framer-motion";
import { AdinkraIcon } from "@/components/ui/AdinkraIcon";
import { SEOHead } from "@/components/SEOHead";

export default function About() {
  return (
    <div>
      <SEOHead
        title="About Akwantuo"
        description="Akwantuo means 'journey' in Twi. We help travelers navigate the real challenges of visiting West Africa — from payments to transport to staying connected."
        url="https://akwantu-roots-connect.lovable.app/about"
      />
      {/* Hero */}
      <section className="relative py-24 bg-charcoal adinkra-bg-dark">
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <AdinkraIcon name="sankofa" size={48} className="text-primary mx-auto mb-6" />
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-charcoal-foreground mb-4">
              About <span className="text-gradient-kente">Akwantuo</span>
            </h1>
            <p className="text-charcoal-foreground/60 max-w-2xl mx-auto text-lg">
              "Akwantuo" means "journey" in Twi. We exist to solve the real
              frustrations travelers face in West Africa — fragmented payments,
              unreliable transport, and confusing logistics — so every visit is
              smooth, safe, and unforgettable.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 adinkra-bg">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="font-display text-3xl font-bold mb-6">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Akwantuo is more than a travel platform. Whether you're visiting for
                the first time, reconnecting with your heritage, or exploring on business,
                we take the guesswork out of West African travel. Curated stays, verified
                safety information, and a living cultural archive — all in one place.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We believe great travel starts when the logistics disappear. That's why
                we handle the hard parts — payments, transport, connectivity — so you
                can focus on the experience. And for those tracing their roots, the
                essence of Sankofa — "Go back and get it" — runs through everything we do.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-card rounded-xl border border-border p-8"
            >
              <div className="space-y-6">
                {[
                  { icon: "sankofa" as const, title: "Sankofa", meaning: "Go back and get it — learn from the past to build the future." },
                  { icon: "gye-nyame" as const, title: "Gye Nyame", meaning: "Except God — the omnipotence and supremacy of God." },
                  { icon: "dwennimmen" as const, title: "Dwennimmen", meaning: "Ram's horns — humility together with strength." },
                  { icon: "adinkrahene" as const, title: "Adinkrahene", meaning: "Chief of Adinkra — greatness and leadership." },
                ].map((symbol) => (
                  <div key={symbol.title} className="flex items-start gap-4">
                    <AdinkraIcon name={symbol.icon} size={32} className="text-primary shrink-0 mt-1" />
                    <div>
                      <h4 className="font-display font-semibold">{symbol.title}</h4>
                      <p className="text-sm text-muted-foreground">{symbol.meaning}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "Authenticity", desc: "Every experience, stay, and story on Akwantuo is rooted in genuine cultural connection — not tourist performance." },
              { title: "Community", desc: "We empower local communities as hosts, guides, and storytellers. Tourism should uplift, not extract." },
              { title: "Safety", desc: "Our safety concierge and real-time advisories ensure every traveller explores with confidence." },
              { title: "Preservation", desc: "Through the Sankofa Archive, we document and preserve cultural knowledge for future generations." },
              { title: "Accessibility", desc: "We believe travel to West Africa should be accessible to all — regardless of budget, ability, or background." },
              { title: "Connection", desc: "We connect travelers from everywhere to the people, culture, and rhythms of West Africa — whether you're coming home or discovering it for the first time." },
            ].map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-lg border border-border bg-background"
              >
                <h3 className="font-display text-lg font-semibold mb-2 text-primary">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
