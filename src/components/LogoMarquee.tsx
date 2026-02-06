import { motion } from "framer-motion";

const logos = [
  { name: "Anthropic", text: "ANTHROPIC" },
  { name: "OpenAI", text: "OPENAI" },
  { name: "Vercel", text: "VERCEL" },
  { name: "Linear", text: "LINEAR" },
  { name: "Notion", text: "NOTION" },
  { name: "Figma", text: "FIGMA" },
  { name: "Stripe", text: "STRIPE" },
  { name: "Discord", text: "DISCORD" },
];

const LogoMarquee = () => {
  return (
    <section className="py-16 overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-sm text-muted-foreground mb-10"
        >
          Trusted by teams at innovative companies worldwide
        </motion.p>
      </div>

      {/* Marquee container */}
      <div className="relative">
        {/* Gradient masks */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />

        {/* Scrolling logos */}
        <div className="flex overflow-hidden">
          <motion.div
            className="flex gap-16 items-center"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              x: {
                duration: 30,
                repeat: Infinity,
                ease: "linear",
              },
            }}
          >
            {/* Double the logos for seamless loop */}
            {[...logos, ...logos].map((logo, index) => (
              <div
                key={`${logo.name}-${index}`}
                className="flex items-center gap-3 flex-shrink-0 group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-muted/80 flex items-center justify-center transition-all duration-300 group-hover:bg-muted group-hover:scale-105">
                  <span className="font-display font-bold text-base text-foreground/70 group-hover:text-foreground transition-colors">
                    {logo.text[0]}
                  </span>
                </div>
                <span className="font-display font-semibold text-foreground/50 tracking-wide text-sm group-hover:text-foreground/70 transition-colors whitespace-nowrap">
                  {logo.text}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LogoMarquee;