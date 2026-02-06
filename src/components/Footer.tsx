import { motion } from "framer-motion";
import { Twitter, MessageCircle, Github, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const Footer = () => {
  const [email, setEmail] = useState("");

  return (
    <footer className="py-20 border-t border-border/50 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-t from-muted/30 to-transparent pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-5 gap-12 mb-16">
          {/* Brand & Newsletter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2"
          >
            <a href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-coral to-coral/80 flex items-center justify-center shadow-warm">
                <span className="text-white font-display font-bold text-sm">M</span>
              </div>
              <span className="font-display font-bold text-xl text-foreground">MoltyVerse</span>
            </a>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Build autonomous AI companions that deploy anywhere. The future of AI is personal, and it starts here.
            </p>

            {/* Newsletter signup */}
            <div className="flex gap-2 max-w-sm">
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-card border border-border/60 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral/50 transition-all"
              />
              <Button size="sm" className="px-4 shadow-warm">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Social links */}
            <div className="flex gap-3 mt-6">
              {[
                { icon: Twitter, href: "https://twitter.com/MoltyVerse", label: "Twitter" },
                { icon: MessageCircle, href: "https://discord.gg/moltyverse", label: "Discord" },
                { icon: Github, href: "https://github.com/molty-verse", label: "GitHub" },
              ].map((social, i) => (
                <a 
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-10 h-10 rounded-xl bg-card border border-border/60 flex items-center justify-center hover:bg-muted hover:border-border transition-all duration-200"
                >
                  <social.icon className="w-4 h-4 text-muted-foreground" />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Links columns */}
          {[
            {
              title: "Product",
              links: [
                { name: "Features", href: "/#features" },
                { name: "Pricing", href: "/#pricing" },
                { name: "Explore", href: "/explore" },
                { name: "Create Molty", href: "/create-molty" },
              ],
            },
            {
              title: "Resources",
              links: [
                { name: "Documentation", href: "https://docs.moltyverse.com", external: true },
                { name: "Community", href: "https://discord.gg/moltyverse", external: true },
                { name: "GitHub", href: "https://github.com/molty-verse", external: true },
                { name: "Support", href: "mailto:support@moltyverse.com", external: true },
              ],
            },
            {
              title: "Company",
              links: [
                { name: "About", href: "/about" },
                { name: "Terms", href: "/terms" },
                { name: "Privacy", href: "/privacy" },
              ],
            },
          ].map((column, index) => (
            <motion.div
              key={column.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
            >
              <h4 className="font-display font-semibold text-foreground mb-4">{column.title}</h4>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.name}>
                    <a 
                      href={link.href}
                      {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <p>© 2026 MoltyVerse. All rights reserved.</p>
          </div>
          
          {/* Status indicator */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border/50">
            <div className="w-2 h-2 rounded-full bg-coral animate-pulse" />
            <span className="text-sm text-muted-foreground">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;