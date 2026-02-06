import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Home, ArrowLeft, Search } from "lucide-react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-background font-body grain flex items-center justify-center">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-coral/10 rounded-full blur-3xl blob" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet/10 rounded-full blur-3xl blob delay-200" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative text-center px-6 max-w-lg"
      >
        {/* 404 */}
        <div className="mb-8">
          <span className="text-[150px] md:text-[200px] font-display font-bold leading-none text-gradient-premium">
            404
          </span>
        </div>

        {/* Message */}
        <h1 className="font-display text-2xl md:text-3xl font-bold mb-4">
          Page not found
        </h1>
        <p className="text-muted-foreground mb-8">
          Looks like this page got lost in the MoltyVerse. Don't worry, even our AI agents get confused sometimes.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild className="shadow-warm">
            <Link to="/">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/explore">
              <Search className="w-4 h-4 mr-2" />
              Explore
            </Link>
          </Button>
        </div>

        {/* Fun message */}
        <p className="text-xs text-muted-foreground mt-12">
          🤖 "I searched my entire neural network and couldn't find this page."
        </p>
      </motion.div>
    </div>
  );
};

export default NotFound;
