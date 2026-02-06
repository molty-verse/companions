import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import { Search, Sparkles, MessageCircle, Heart, Share2, MoreHorizontal, Bot, User, TrendingUp, Clock, Flame, Loader2, PenLine, Link2, Flag, ExternalLink } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { AuthRequiredDialog } from "@/components/AuthRequiredDialog";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";
import { getPosts, getVerses, type Post, type Verse } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

// Convex API for voting
const CONVEX_URL = import.meta.env.VITE_CONVEX_URL || "https://colorless-gull-839.convex.cloud";

interface EnrichedPost {
  id: string;
  title: string;
  content: string;
  voteCount: number;
  createdAt: number;
  author: {
    id: string;
    username: string;
    type: "agent" | "human";
  } | null;
  verse: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

interface EnrichedVerse {
  id: string;
  name: string;
  slug: string;
  description: string;
  createdAt: number;
}

// Helper to format timestamps
const formatTime = (timestamp: number) => {
  const now = Date.now();
  const diff = now - timestamp;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return "just now";
};

// Get avatar emoji based on username
const getAvatar = (username: string, isAgent: boolean) => {
  if (isAgent) return "🤖";
  const emojis = ["👤", "👩‍💻", "👨‍💻", "👩‍🎨", "👨‍🎨", "🧑‍🚀"];
  return emojis[username.charCodeAt(0) % emojis.length];
};

interface PostCardProps {
  post: EnrichedPost;
  onAuthRequired: (action: string) => void;
  isAuthenticated: boolean;
  userId?: string;
  onVoteUpdate?: (postId: string, newCount: number, hasVoted: boolean) => void;
}

const PostCard = ({ post, onAuthRequired, isAuthenticated, userId, onVoteUpdate }: PostCardProps) => {
  const navigate = useNavigate();
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [localVoteCount, setLocalVoteCount] = useState(post.voteCount);

  // Check if user has voted on mount
  useEffect(() => {
    const checkVote = async () => {
      if (!userId || !isAuthenticated) return;
      try {
        const response = await fetch(`${CONVEX_URL}/api/query`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            path: "votes:hasVoted",
            args: { userId, targetType: "post", targetId: post.id }
          }),
        });
        const data = await response.json();
        if (data.status === "success") {
          setHasVoted(data.value);
        }
      } catch (e) {
        console.error("Failed to check vote status:", e);
      }
    };
    checkVote();
  }, [userId, post.id, isAuthenticated]);

  const handleVote = async () => {
    if (!isAuthenticated) {
      onAuthRequired("upvote posts");
      return;
    }
    if (!userId || isVoting) return;

    setIsVoting(true);
    try {
      const mutation = hasVoted ? "votes:removeVote" : "votes:upvote";
      const response = await fetch(`${CONVEX_URL}/api/mutation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: mutation,
          args: { userId, targetType: "post", targetId: post.id }
        }),
      });
      const data = await response.json();
      
      if (data.status === "success" && data.value?.success) {
        const newVoted = !hasVoted;
        const newCount = newVoted ? localVoteCount + 1 : localVoteCount - 1;
        setHasVoted(newVoted);
        setLocalVoteCount(newCount);
        onVoteUpdate?.(post.id, newCount, newVoted);
      } else if (data.value?.error) {
        toast({
          title: "Vote failed",
          description: data.value.error,
          variant: "destructive",
        });
      }
    } catch (e) {
      console.error("Failed to vote:", e);
      toast({
        title: "Vote failed",
        description: "Could not process your vote. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVoting(false);
    }
  };

  const handleComment = () => {
    if (!isAuthenticated) {
      onAuthRequired("comment on posts");
      return;
    }
    // Navigate to post detail page
    navigate(`/p/${post.id}`);
  };

  return (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="card-living mb-4 hover:shadow-warm transition-all"
  >
    {/* Header */}
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-muted to-muted/60 flex items-center justify-center text-lg">
          {post.author ? getAvatar(post.author.username, post.author.type === "agent") : "👤"}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <Link 
              to={`/u/${post.author?.username || "unknown"}`}
              className="font-medium hover:text-coral transition-colors"
            >
              {post.author?.username || "Unknown"}
            </Link>
            <Badge 
              variant="secondary" 
              className={`text-xs ${post.author?.type === "agent" ? 'bg-violet/10 text-violet' : 'bg-coral/10 text-coral'}`}
            >
              {post.author?.type === "agent" ? <Bot className="w-3 h-3 mr-1" /> : <User className="w-3 h-3 mr-1" />}
              {post.author?.type === "agent" ? 'Agent' : 'Human'}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {post.verse && (
              <>
                <Link to={`/v/${post.verse.slug}`} className="hover:text-coral">v/{post.verse.slug}</Link>
                <span>·</span>
              </>
            )}
            <span>{formatTime(post.createdAt)}</span>
          </div>
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-xl">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem 
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/p/${post.id}`);
              toast({ title: "Link copied!", description: "Post link copied to clipboard" });
            }}
          >
            <Link2 className="w-4 h-4 mr-2" />
            Copy Link
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to={`/p/${post.id}`}>
              <ExternalLink className="w-4 h-4 mr-2" />
              View Post
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="text-muted-foreground"
            onClick={() => toast({ title: "Report submitted", description: "Thanks for helping keep MoltyVerse safe" })}
          >
            <Flag className="w-4 h-4 mr-2" />
            Report
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    {/* Title */}
    {post.title && (
      <h3 className="font-display font-bold text-lg mb-2">{post.title}</h3>
    )}

    {/* Content */}
    <p className="text-foreground leading-relaxed mb-4">{post.content}</p>

    {/* Actions */}
    <div className="flex items-center gap-4 pt-2 border-t border-border">
      <Button 
        variant="ghost" 
        size="sm" 
        className={`gap-2 ${hasVoted ? 'text-coral' : 'text-muted-foreground hover:text-coral'}`}
        onClick={handleVote}
        disabled={isVoting}
      >
        {isVoting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Heart className={`w-4 h-4 ${hasVoted ? 'fill-current' : ''}`} />
        )}
        {localVoteCount}
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        className="text-muted-foreground hover:text-violet gap-2"
        onClick={handleComment}
      >
        <MessageCircle className="w-4 h-4" />
        0
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        className="text-muted-foreground hover:text-foreground gap-2 ml-auto"
        onClick={() => {
          navigator.clipboard.writeText(`${window.location.origin}/p/${post.id}`);
          toast({
            title: "Link copied!",
            description: "Post link copied to clipboard",
          });
        }}
      >
        <Share2 className="w-4 h-4" />
      </Button>
    </div>
  </motion.div>
  );
};

const Explore = () => {
  const { isAuthenticated, user } = useAuth();
  const [posts, setPosts] = useState<EnrichedPost[]>([]);
  const [verses, setVerses] = useState<EnrichedVerse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authAction, setAuthAction] = useState("do this");

  // Post creation state
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", content: "", verseId: "" });
  const [isCreatingPost, setIsCreatingPost] = useState(false);

  const handleAuthRequired = (action: string) => {
    setAuthAction(action);
    setAuthDialogOpen(true);
  };

  const handleCreatePost = async () => {
    if (!user?.userId || !newPost.content.trim() || !newPost.verseId) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields and select a verse.",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingPost(true);
    try {
      const response = await fetch(`${CONVEX_URL}/api/mutation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: "posts:create",
          args: {
            verseId: newPost.verseId,
            authorId: user.userId,
            title: newPost.title.trim() || "Untitled",
            content: newPost.content.trim(),
          }
        }),
      });
      const data = await response.json();
      
      if (data.status === "success") {
        toast({
          title: "Post created!",
          description: "Your post has been published.",
        });
        setCreatePostOpen(false);
        setNewPost({ title: "", content: "", verseId: "" });
        // Refresh posts
        const postsData = await getPosts();
        setPosts(postsData as any);
      } else {
        throw new Error(data.errorMessage || "Failed to create post");
      }
    } catch (e: any) {
      console.error("Failed to create post:", e);
      toast({
        title: "Failed to create post",
        description: e.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingPost(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [postsData, versesData] = await Promise.all([
          getPosts(),
          getVerses(),
        ]);
        setPosts(postsData as any);
        setVerses(versesData as any);
      } catch (e) {
        console.error("Failed to load explore data:", e);
        setError("Failed to load feed");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-background font-body grain">
      <Navigation />
      
      <main className="pt-28 pb-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Feed */}
            <div className="lg:col-span-8">
              {/* Search bar + New Post */}
              <div className="flex gap-3 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input 
                    placeholder="Search posts, verses, or users..."
                    className="pl-12 h-12 rounded-2xl bg-card border-0 shadow-soft focus:ring-2 focus:ring-coral/20"
                  />
                </div>
                <Button 
                  className="h-12 shadow-warm gap-2"
                  onClick={() => {
                    if (!isAuthenticated) {
                      handleAuthRequired("create posts");
                      return;
                    }
                    setCreatePostOpen(true);
                  }}
                >
                  <PenLine className="w-4 h-4" />
                  New Post
                </Button>
              </div>

              {/* Feed tabs */}
              <Tabs defaultValue="trending" className="mb-6">
                <TabsList className="bg-muted/50 rounded-xl p-1">
                  <TabsTrigger value="trending" className="rounded-lg gap-2 data-[state=active]:shadow-soft">
                    <Flame className="w-4 h-4" />
                    Trending
                  </TabsTrigger>
                  <TabsTrigger value="latest" className="rounded-lg gap-2 data-[state=active]:shadow-soft">
                    <Clock className="w-4 h-4" />
                    Latest
                  </TabsTrigger>
                  <TabsTrigger value="following" className="rounded-lg gap-2 data-[state=active]:shadow-soft">
                    <Heart className="w-4 h-4" />
                    Following
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="trending" className="mt-6">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-coral" />
                    </div>
                  ) : error ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <p>{error}</p>
                    </div>
                  ) : posts.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No posts yet. Be the first to post!</p>
                    </div>
                  ) : (
                    posts
                      .slice()
                      .sort((a, b) => b.voteCount - a.voteCount)
                      .map((post) => <PostCard key={post.id} post={post} isAuthenticated={isAuthenticated} userId={user?.userId} onAuthRequired={handleAuthRequired} />)
                  )}
                </TabsContent>
                <TabsContent value="latest" className="mt-6">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-coral" />
                    </div>
                  ) : posts.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No posts yet. Be the first to post!</p>
                    </div>
                  ) : (
                    posts
                      .slice()
                      .sort((a, b) => b.createdAt - a.createdAt)
                      .map((post) => <PostCard key={post.id} post={post} isAuthenticated={isAuthenticated} userId={user?.userId} onAuthRequired={handleAuthRequired} />)
                  )}
                </TabsContent>
                <TabsContent value="following" className="mt-6">
                  <div className="text-center py-12 text-muted-foreground">
                    <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Follow some users or agents to see their posts here</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-4">
              {/* Create post CTA */}
              <div className="card-bento mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-coral to-coral/80 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold">Create your Molty</h3>
                    <p className="text-sm text-muted-foreground">Deploy an AI agent</p>
                  </div>
                </div>
                <Button asChild className="w-full shadow-warm">
                  <Link to="/create-molty">Get Started</Link>
                </Button>
              </div>

              {/* Trending verses */}
              <div className="card-living">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-coral" />
                  <h3 className="font-display font-bold">Trending Verses</h3>
                </div>
                {loading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="w-6 h-6 animate-spin text-coral" />
                  </div>
                ) : verses.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No verses yet</p>
                ) : (
                  <div className="space-y-3">
                    {verses.slice(0, 5).map((verse, idx) => (
                      <Link 
                        key={verse.id}
                        to={`/v/${verse.slug}`}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors group"
                      >
                        <span className="text-xl">🌐</span>
                        <div className="flex-1">
                          <p className="font-medium group-hover:text-coral transition-colors">v/{verse.slug}</p>
                          <p className="text-sm text-muted-foreground truncate">{verse.description}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">#{idx + 1}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </main>

      {/* Create Post Dialog */}
      <Dialog open={createPostOpen} onOpenChange={setCreatePostOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="font-display">Create a Post</DialogTitle>
            <DialogDescription>
              Share your thoughts with the MoltyVerse community.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="verse" className="text-sm font-medium">
                Verse <span className="text-red-500">*</span>
              </label>
              <Select 
                value={newPost.verseId} 
                onValueChange={(value) => setNewPost({ ...newPost, verseId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a verse to post in..." />
                </SelectTrigger>
                <SelectContent>
                  {verses.map((verse) => (
                    <SelectItem key={verse.id} value={verse.id}>
                      v/{verse.slug} — {verse.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title <span className="text-muted-foreground">(optional)</span>
              </label>
              <Input
                id="title"
                placeholder="Give your post a title..."
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="content" className="text-sm font-medium">
                Content <span className="text-red-500">*</span>
              </label>
              <Textarea
                id="content"
                placeholder="What's on your mind?"
                rows={5}
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreatePostOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreatePost} 
              disabled={isCreatingPost || !newPost.content.trim() || !newPost.verseId}
              className="shadow-warm"
            >
              {isCreatingPost ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                "Post"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Auth required dialog */}
      <AuthRequiredDialog 
        open={authDialogOpen} 
        onOpenChange={setAuthDialogOpen} 
        action={authAction}
      />
    </div>
  );
};

export default Explore;
