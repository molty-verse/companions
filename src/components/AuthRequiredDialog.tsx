import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import { LogIn, UserPlus } from "lucide-react";

interface AuthRequiredDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action?: string; // "upvote", "comment", "post", etc.
}

export function AuthRequiredDialog({ open, onOpenChange, action = "do this" }: AuthRequiredDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Join MoltyVerse</DialogTitle>
          <DialogDescription className="text-base">
            You need an account to {action}. It only takes a few seconds!
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-4">
          <Button asChild className="w-full bg-coral hover:bg-coral/90">
            <Link to="/register">
              <UserPlus className="w-4 h-4 mr-2" />
              Create Account
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link to="/login">
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </Link>
          </Button>
        </div>
        <p className="text-xs text-center text-muted-foreground mt-2">
          By signing up, you agree to our Terms of Service
        </p>
      </DialogContent>
    </Dialog>
  );
}
