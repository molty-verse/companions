import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import moltyCoralImg from "@/assets/molty-coral.png";
import moltyVioletImg from "@/assets/molty-violet.png";
import moltyPinkImg from "@/assets/molty-pink.png";
import moltyTealImg from "@/assets/molty-teal.png";

const testimonials = [
  {
    quote: "My Molty remembers everything about my Discord community. It feels like having a real assistant who actually gets us. The personality customization is next-level.",
    name: "Alex Chen",
    role: "Community Manager at Vercel",
    avatar: moltyCoralImg,
    rating: 5,
  },
  {
    quote: "Finally, an AI that deploys to Telegram without the hassle. Set up in 5 minutes, running 24/7. Our customer response time dropped by 80%.",
    name: "Maria Santos",
    role: "Founder at Synthwave",
    avatar: moltyVioletImg,
    rating: 5,
  },
  {
    quote: "The personality customization is insane. My Molty has actual character—not just generic AI responses. It's become a real part of our team culture.",
    name: "Jordan Lee",
    role: "Developer Relations at Linear",
    avatar: moltyPinkImg,
    rating: 5,
  },
  {
    quote: "I built a customer support Molty for my startup in one afternoon. It handles 80% of inquiries now. The ROI is unbelievable.",
    name: "Sam Williams",
    role: "CEO at Quantum Labs",
    avatar: moltyTealImg,
    rating: 5,
  },
];

const Testimonials = () => {
  return (
    <section id="testimonials" className="py-32 relative">
      <div className="container mx-auto px-6">
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/80 border border-border/50 mb-6"
          >
            <Star className="w-4 h-4 text-coral fill-coral" />
            <span className="text-sm font-medium text-muted-foreground">Testimonials</span>
          </motion.div>

          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold mb-6 tracking-tight-headline">
            Loved by Thousands of
            <br />
            <span className="text-gradient-coral">AI Builders</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Join the community of creators building the future of AI companions.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              className="card-premium p-8 group"
            >
              {/* Quote icon */}
              <Quote className="w-10 h-10 text-coral/20 mb-4" />

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-coral fill-coral" />
                ))}
              </div>

              {/* Quote text */}
              <p className="text-foreground text-lg leading-relaxed mb-8">
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="w-10 h-10 object-contain breathe"
                  />
                </div>
                <div>
                  <div className="font-display font-semibold text-foreground">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-20 p-8 rounded-3xl bg-card border border-border/50 max-w-4xl mx-auto"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "4.9/5", label: "Average Rating" },
              { value: "10K+", label: "Active Users" },
              { value: "99.9%", label: "Uptime" },
              { value: "24/7", label: "Support" },
            ].map((stat, i) => (
              <div key={stat.label}>
                <div className="font-display text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;