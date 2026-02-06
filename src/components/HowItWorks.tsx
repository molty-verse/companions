import { motion, useInView } from "framer-motion";
import { UserCircle, Settings2, Rocket, Check } from "lucide-react";
import { useRef } from "react";

const steps = [
  {
    icon: UserCircle,
    step: "01",
    title: "Design Your Molty",
    description: "Choose personality traits, set knowledge domains, and define how your AI companion communicates. Make it truly yours.",
    details: ["Personality customization", "Knowledge training", "Voice & tone settings"],
  },
  {
    icon: Settings2,
    step: "02",
    title: "Choose Platforms",
    description: "Select where your Molty lives—Discord, Telegram, WhatsApp, web, or deploy to all of them simultaneously.",
    details: ["One-click integrations", "Cross-platform sync", "Custom webhooks"],
  },
  {
    icon: Rocket,
    step: "03",
    title: "Go Live & Connect",
    description: "Deploy with one click. Watch your Molty come alive and start building real, meaningful connections.",
    details: ["Instant deployment", "Real-time analytics", "24/7 availability"],
  },
];

const HowItWorks = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section id="how-it-works" className="py-32 relative overflow-hidden">
      {/* Subtle background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-transparent to-muted/30" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border/50 mb-6 shadow-soft"
          >
            <Rocket className="w-4 h-4 text-coral" />
            <span className="text-sm font-medium text-muted-foreground">How It Works</span>
          </motion.div>

          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold mb-6 tracking-tight-headline">
            From Idea to Live Agent
            <br />
            <span className="text-gradient-violet">In Minutes</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            No technical skills required. Create your first Molty today.
          </p>
        </motion.div>

        {/* Steps Timeline */}
        <div ref={containerRef} className="relative max-w-5xl mx-auto">
          {/* Animated progress line - desktop */}
          <div className="hidden lg:block absolute left-0 right-0 top-[72px] h-px bg-border">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : {}}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-coral via-accent to-coral origin-left"
            />
          </div>

          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="relative"
              >
                {/* Step number badge */}
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.2 + 0.3, type: "spring" }}
                  className="relative z-10 w-16 h-16 lg:w-20 lg:h-20 mx-auto mb-8 rounded-full bg-card border-2 border-border flex items-center justify-center shadow-float"
                >
                  <step.icon className="w-7 h-7 lg:w-8 lg:h-8 text-coral" />
                  <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-coral text-white text-xs font-bold flex items-center justify-center shadow-warm">
                    {step.step}
                  </div>
                </motion.div>

                {/* Content card */}
                <div className="text-center lg:text-left">
                  <h3 className="font-display font-bold text-xl lg:text-2xl mb-4">{step.title}</h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">{step.description}</p>

                  {/* Feature list */}
                  <ul className="space-y-2">
                    {step.details.map((detail, i) => (
                      <motion.li
                        key={detail}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.2 + 0.5 + i * 0.1 }}
                        className="flex items-center gap-2 text-sm text-muted-foreground justify-center lg:justify-start"
                      >
                        <Check className="w-4 h-4 text-coral flex-shrink-0" />
                        {detail}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;