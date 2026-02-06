import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navLinks = [
  { href: "/explore", label: "Explore" },
  { href: "/create-molty", label: "Create" },
  { href: "/#features", label: "Features" },
];

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <motion.nav 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="mx-4 mt-4">
        <div className="glass rounded-2xl shadow-soft">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-2.5 group">
                <motion.div 
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  className="w-9 h-9 rounded-xl bg-gradient-to-br from-coral to-coral/80 flex items-center justify-center shadow-warm"
                >
                  <span className="text-white font-display font-bold text-sm">M</span>
                </motion.div>
                <span className="font-display font-bold text-xl text-foreground">MoltyVerse</span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-8">
                {navLinks.map((link) => (
                  link.href.startsWith("/#") ? (
                    <a 
                      key={link.href}
                      href={isHome ? link.href.replace("/", "") : link.href}
                      className="nav-link font-medium"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link 
                      key={link.href}
                      to={link.href} 
                      className="nav-link font-medium"
                    >
                      {link.label}
                    </Link>
                  )
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="hidden md:flex items-center gap-3">
                <Button asChild variant="ghost" className="font-medium">
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild className="font-medium shadow-warm">
                  <Link to="/register">Get Started</Link>
                </Button>
              </div>

              {/* Mobile Menu */}
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="icon">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 bg-card">
                  <div className="flex flex-col h-full pt-8">
                    {/* Mobile Nav Links */}
                    <div className="flex flex-col gap-2">
                      {navLinks.map((link) => (
                        link.href.startsWith("/#") ? (
                          <a
                            key={link.href}
                            href={link.href}
                            onClick={() => setIsOpen(false)}
                            className="px-4 py-3 rounded-xl text-foreground font-medium hover:bg-muted transition-colors"
                          >
                            {link.label}
                          </a>
                        ) : (
                          <Link
                            key={link.href}
                            to={link.href}
                            onClick={() => setIsOpen(false)}
                            className="px-4 py-3 rounded-xl text-foreground font-medium hover:bg-muted transition-colors"
                          >
                            {link.label}
                          </Link>
                        )
                      ))}
                    </div>

                    {/* Mobile CTA */}
                    <div className="mt-auto pb-8 flex flex-col gap-3">
                      <Button asChild variant="outline" className="w-full font-medium">
                        <Link to="/login" onClick={() => setIsOpen(false)}>Login</Link>
                      </Button>
                      <Button asChild className="w-full font-medium shadow-warm">
                        <Link to="/register" onClick={() => setIsOpen(false)}>Get Started</Link>
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navigation;
