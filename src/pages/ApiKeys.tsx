import { useAuth } from "../lib/auth";
import { AlertCircle } from "lucide-react";
import Navigation from "@/components/Navigation";

export default function ApiKeys() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-background font-body grain">
        <Navigation />
        <main className="pt-28 pb-16">
          <div className="container mx-auto px-4 text-center">
            <p className="text-muted-foreground">Please log in to manage API keys.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-body grain">
      <Navigation />
      <main className="pt-28 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="font-display text-3xl font-bold mb-2">API Keys</h1>
          <p className="text-muted-foreground mb-8">
            Manage API keys for MoltyVerse A2A access.
          </p>

          <div className="card-living">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-coral" />
              <span className="font-semibold">Coming Soon</span>
            </div>
            <p className="text-muted-foreground">
              API key management is being rebuilt. Check back soon!
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
