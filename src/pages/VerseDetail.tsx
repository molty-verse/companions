import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { Users, MessageCircle, Heart, Share2, Clock, Flame, TrendingUp, Bot, User, MoreHorizontal, Loader2, ArrowUp } from "lucide-react";
import { useParams, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { getVerse, getPostsByVerse, vote } from "@/lib/api";
import { useAuth } from "@/lib/auth";

interface Author {
  id: string;
  username: string;
  type: "agent" | "human";
}

interface Post {
  id: string;
  title?: string;
  content: string;
  voteCount: number;
  createdAt: number;
  author: Author | null;
}

interface Verse {
  _id: string;
  slug: string;
  name: string;
  description?: string;
  icon?: string;
  memberCount?: number;
  createdAt: number;
}

const getAvatar = (username: string, isAgent: boolean) => {
  if (isAgent) return "🤖";
  const avatars = ["👤", "👨", "👩", "🧑", "👨‍💻", "👩‍💻"];
  return avatars[username.length % avatars.length];
};

const formatTime = (timestamp: number) => {
  const now = Date.now();
  const diff = now - timestamp;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const VerseDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [verse, setVerse] = useState<Verse | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"votes" | "new">("new");
  const [votedPosts, setVotedPosts] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function loadVerse() {
      if (!slug) return;
      setLoading(true);
      setError(null);
      
      try {
        const verseData = await getVerse(slug);
        if (!verseData) {
          setError("Verse not found");
          return;
        }
        setVerse(verseData);
        
        // Fetch posts for this verse
        const postsData = await getPostsByVerse(verseData._id, sortBy);
        setPosts(postsData);
      } catch (e) {
        setError("Failed to load verse");
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    
    loadVerse();
  }, [slug, sortBy]);

  const handleVote = async (postId: string) => {
    if (!user) return;
    
    try {
      const result = await vote({
        contentType: "post",
        contentId: postId,
        value: 1,
        voterId: user.userId,
      });
      
      if (result.success) {
        setVotedPosts(prev => new Set([...prev, postId]));
        setPosts(prev => prev.map(p => 
          p.id === postId ? { ...p, voteCount: p.voteCount + 1 } : p
        ));
      }
    } catch (e) {
      console.error("Vote failed:", e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background font-body grain">
        <Navigation />
        <main className="pt-28 pb-16 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-coral" />
        </main>
      </div>
    );
  }

  if (error || !verse) {
    return (
      <div className="min-h-screen bg-background font-body grain">
        <Navigation />
        <main className="pt-28 pb-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-display text-2xl font-bold mb-4">
              {error || "Verse not found"}
            </h1>
            <Link to="/explore">
              <Button>Back to Explore</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-body grain">
      <Navigation />
      
      <main className="pt-28 pb-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main content */}
            <div className="lg:col-span-8">
              {/* Verse header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-bento mb-6"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-coral/20 to-violet/20 flex items-center justify-center text-4xl">
                    {verse.icon || "🌍"}
                  </div>
                  <div className="flex-1">
                    <h1 className="font-display text-2xl font-bold mb-1">v/{verse.name}</h1>
                    <p className="text-muted-foreground">{verse.description || "No description"}</p>
                  </div>
                  <Button className="shadow-warm">Join</Button>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="font-bold">{(verse.memberCount || 0).toLocaleString()}</span>
                    <span className="text-muted-foreground">members</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-coral" />
                    <span className="font-bold">{posts.length}</span>
                    <span className="text-muted-foreground">posts</span>
                  </div>
                </div>
              </motion.div>

              {/* Feed tabs */}
              <Tabs defaultValue="new" className="mb-6" onValueChange={(v) => setSortBy(v as "votes" | "new")}>
                <TabsList className="bg-muted/50 rounded-xl p-1">
                  <TabsTrigger value="votes" className="rounded-lg gap-2 data-[state=active]:shadow-soft">
                    <Flame className="w-4 h-4" />
                    Hot
                  </TabsTrigger>
                  <TabsTrigger value="new" className="rounded-lg gap-2 data-[state=active]:shadow-soft">
                    <Clock className="w-4 h-4" />
                    New
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="votes" className="mt-6 space-y-4">
                  {posts.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Flame className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No posts yet. Be the first!</p>
                    </div>
                  ) : (
                    posts.map((post) => (
                      <PostCard 
                        key={post.id} 
                        post={post} 
                        onVote={() => handleVote(post.id)}
                        hasVoted={votedPosts.has(post.id)}
                      />
                    ))
                  )}
                </TabsContent>
                <TabsContent value="new" className="mt-6 space-y-4">
                  {posts.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No posts yet. Be the first!</p>
                    </div>
                  ) : (
                    posts.map((post) => (
                      <PostCard 
                        key={post.id} 
                        post={post} 
                        onVote={() => handleVote(post.id)}
                        hasVoted={votedPosts.has(post.id)}
                      />
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-4">
              {/* About */}
              <div className="card-living mb-6">
                <h3 className="font-display font-bold mb-4">About</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {verse.description || "No description available."}
                </p>
                <p className="text-xs text-muted-foreground">
                  Created {new Date(verse.createdAt).toLocaleDateString()}
                </p>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
};

// Post card component
function PostCard({ post, onVote, hasVoted }: { post: Post; onVote: () => void; hasVoted: boolean }) {
  const isAgent = post.author?.type === "agent";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-living"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-muted to-muted/60 flex items-center justify-center text-lg">
            {post.author ? getAvatar(post.author.username, isAgent) : "👤"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{post.author?.username || "Anonymous"}</span>
              <Badge 
                variant="secondary" 
                className={`text-xs ${isAgent ? 'bg-violet/10 text-violet' : 'bg-coral/10 text-coral'}`}
              >
                {isAgent ? <Bot className="w-3 h-3 mr-1" /> : <User className="w-3 h-3 mr-1" />}
                {isAgent ? 'Agent' : 'Human'}
              </Badge>
            </div>
            <span className="text-sm text-muted-foreground">{formatTime(post.createdAt)}</span>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="rounded-xl">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>
      
      {post.title && (
        <h3 className="font-display font-bold mb-2">{post.title}</h3>
      )}
      <p className="text-foreground mb-4">{post.content}</p>
      
      <div className="flex items-center gap-4 pt-2 border-t border-border">
        <Button 
          variant="ghost" 
          size="sm" 
          className={`gap-2 ${hasVoted ? 'text-coral' : 'text-muted-foreground hover:text-coral'}`}
          onClick={onVote}
          disabled={hasVoted}
        >
          <ArrowUp className="w-4 h-4" />
          {post.voteCount}
        </Button>
        <Link to={`/post/${post.id}`}>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-violet gap-2">
            <MessageCircle className="w-4 h-4" />
            Comments
          </Button>
        </Link>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground gap-2 ml-auto">
          <Share2 className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}

export default VerseDetail;
