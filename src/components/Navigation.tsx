import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Menu, User, LogOut, LayoutDashboard, Settings, Bot } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth";

const navLinks = [
  { href: "/explore", label: "Explore" },
  { href: "/create-molty", label: "Create" },
  { href: "/#features", label: "Features" },
];

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const isHome = location.pathname === "/";

  // Handle anchor links without full page reload
  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const anchor = href.replace("/#", "#");
    
    if (isHome) {
      // Already on home, just scroll
      const element = document.querySelector(anchor);
      element?.scrollIntoView({ behavior: "smooth" });
    } else {
      // Navigate to home then scroll (React Router handles this)
      navigate("/" + anchor);
    }
  };

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
                      href={link.href}
                      onClick={(e) => handleAnchorClick(e, link.href)}
                      className="nav-link font-medium cursor-pointer"
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
                {isAuthenticated ? (
                  <>
                    <Button asChild variant="ghost" className="font-medium">
                      <Link to="/dashboard">
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Dashboard
                      </Link>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="font-medium gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-coral to-violet flex items-center justify-center text-white text-xs">
                            {user?.username?.charAt(0).toUpperCase() || "U"}
                          </div>
                          {user?.username || "User"}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem asChild>
                          <Link to={`/u/${user?.username}`} className="cursor-pointer">
                            <User className="w-4 h-4 mr-2" />
                            Profile
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/dashboard" className="cursor-pointer">
                            <Bot className="w-4 h-4 mr-2" />
                            My Moltys
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/settings" className="cursor-pointer">
                            <Settings className="w-4 h-4 mr-2" />
                            Settings
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-500">
                          <LogOut className="w-4 h-4 mr-2" />
                          Logout
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                ) : (
                  <>
                    <Button asChild variant="ghost" className="font-medium">
                      <Link to="/login">Login</Link>
                    </Button>
                    <Button asChild className="font-medium shadow-warm">
                      <Link to="/register">Get Started</Link>
                    </Button>
                  </>
                )}
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
                            onClick={(e) => { handleAnchorClick(e, link.href); setIsOpen(false); }}
                            className="px-4 py-3 rounded-xl text-foreground font-medium hover:bg-muted transition-colors cursor-pointer"
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
                      {isAuthenticated ? (
                        <>
                          <Link
                            to="/dashboard"
                            onClick={() => setIsOpen(false)}
                            className="px-4 py-3 rounded-xl text-foreground font-medium hover:bg-muted transition-colors flex items-center gap-2"
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            Dashboard
                          </Link>
                          <Link
                            to={`/u/${user?.username}`}
                            onClick={() => setIsOpen(false)}
                            className="px-4 py-3 rounded-xl text-foreground font-medium hover:bg-muted transition-colors flex items-center gap-2"
                          >
                            <User className="w-4 h-4" />
                            Profile
                          </Link>
                          <Link
                            to="/settings"
                            onClick={() => setIsOpen(false)}
                            className="px-4 py-3 rounded-xl text-foreground font-medium hover:bg-muted transition-colors flex items-center gap-2"
                          >
                            <Settings className="w-4 h-4" />
                            Settings
                          </Link>
                          <Button 
                            variant="outline" 
                            className="w-full font-medium text-red-500" 
                            onClick={() => { logout(); setIsOpen(false); }}
                          >
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button asChild variant="outline" className="w-full font-medium">
                            <Link to="/login" onClick={() => setIsOpen(false)}>Login</Link>
                          </Button>
                          <Button asChild className="w-full font-medium shadow-warm">
                            <Link to="/register" onClick={() => setIsOpen(false)}>Get Started</Link>
                          </Button>
                        </>
                      )}
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
