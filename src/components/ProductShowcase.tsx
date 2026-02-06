import { motion } from "framer-motion";
import { MessageSquare, Zap, Users, Shield, Sparkles } from "lucide-react";
import moltyCoralImg from "@/assets/molty-coral.png";
import moltyVioletImg from "@/assets/molty-violet.png";
import moltyPinkImg from "@/assets/molty-pink.png";

const ProductShowcase = () => {
  return (
    <div className="relative max-w-4xl mx-auto">
      {/* Main showcase card */}
      <motion.div
        initial={{ rotateX: 10 }}
        animate={{ rotateX: 0 }}
        transition={{ duration: 0.8 }}
        style={{ perspective: 1000 }}
        className="relative"
      >
        <div className="card-premium p-2 sm:p-3">
          {/* Browser chrome */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-coral/60" />
              <div className="w-3 h-3 rounded-full bg-accent/60" />
              <div className="w-3 h-3 rounded-full bg-muted-foreground/40" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="px-4 py-1.5 rounded-full bg-muted text-xs text-muted-foreground font-medium">
                app.moltyverse.com
              </div>
            </div>
          </div>

          {/* App content */}
          <div className="bg-muted/30 rounded-b-xl p-4 sm:p-6 min-h-[280px] sm:min-h-[320px]">
            <div className="grid grid-cols-3 gap-3 sm:gap-4 h-full">
              {/* Molty cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="bg-card rounded-xl p-3 sm:p-4 border border-border/50 shadow-soft"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-coral/10 flex items-center justify-center mb-3">
                  <img src={moltyCoralImg} alt="Coral Molty" className="w-7 h-7 sm:w-9 sm:h-9 object-contain breathe" />
                </div>
                <div className="font-display font-semibold text-sm mb-1">Luna</div>
                <div className="text-xs text-muted-foreground mb-2">Creative Assistant</div>
                <div className="flex items-center gap-1 text-xs text-coral">
                  <div className="w-1.5 h-1.5 rounded-full bg-coral animate-pulse" />
                  Active
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="bg-card rounded-xl p-3 sm:p-4 border border-border/50 shadow-soft"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-3">
                  <img src={moltyVioletImg} alt="Violet Molty" className="w-7 h-7 sm:w-9 sm:h-9 object-contain breathe delay-200" />
                </div>
                <div className="font-display font-semibold text-sm mb-1">Nova</div>
                <div className="text-xs text-muted-foreground mb-2">Code Helper</div>
                <div className="flex items-center gap-1 text-xs text-accent">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  Active
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="bg-card rounded-xl p-3 sm:p-4 border border-border/50 shadow-soft"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-muted flex items-center justify-center mb-3">
                  <img src={moltyPinkImg} alt="Pink Molty" className="w-7 h-7 sm:w-9 sm:h-9 object-contain breathe delay-400" />
                </div>
                <div className="font-display font-semibold text-sm mb-1">Echo</div>
                <div className="text-xs text-muted-foreground mb-2">Community Mod</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
                  Standby
                </div>
              </motion.div>
            </div>

            {/* Floating features */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-4 sm:mt-6">
              {[
                { icon: MessageSquare, label: "Multi-platform" },
                { icon: Zap, label: "Real-time" },
                { icon: Shield, label: "Secure" },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border/50 text-xs font-medium text-muted-foreground"
                >
                  <item.icon className="w-3 h-3" />
                  {item.label}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Decorative glow */}
        <div className="absolute -inset-4 bg-gradient-to-r from-coral/10 via-transparent to-accent/10 rounded-3xl blur-2xl -z-10 opacity-60" />
      </motion.div>

      {/* Floating elements */}
      <motion.div
        animate={{ 
          y: [-8, 8, -8],
          rotate: [-2, 2, -2]
        }}
        transition={{ 
          duration: 5, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="absolute -top-6 -left-6 sm:-top-8 sm:-left-10 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-card border border-border/60 shadow-float flex items-center justify-center"
      >
        <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-coral" />
      </motion.div>

      <motion.div
        animate={{ 
          y: [8, -8, 8],
          rotate: [2, -2, 2]
        }}
        transition={{ 
          duration: 6, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: 0.5
        }}
        className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-8 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-card border border-border/60 shadow-float flex items-center justify-center"
      >
        <Users className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
      </motion.div>
    </div>
  );
};

export default ProductShowcase;