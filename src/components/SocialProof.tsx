import { motion } from "framer-motion";

const logos = [
  { name: "Veritas Labs", text: "VERITAS" },
  { name: "Echo", text: "ECHO" },
  { name: "Quantum", text: "QUANTUM" },
  { name: "Flux", text: "FLUX" },
  { name: "Nexus AI", text: "NEXUS" },
];

const SocialProof = () => {
  return (
    <section className="py-16 border-y border-border/50">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <p className="text-muted-foreground font-medium">
            Trusted by innovators at
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-8 md:gap-16"
        >
          {logos.map((logo, index) => (
            <motion.div
              key={logo.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                <span className="font-display font-bold text-xs text-foreground">{logo.text[0]}</span>
              </div>
              <span className="font-display font-semibold text-foreground/70 tracking-wide">
                {logo.text}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default SocialProof;
