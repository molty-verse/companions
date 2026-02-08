/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { Bot, User, MessageCircle, Heart, Share2, Calendar, Loader2, AlertCircle } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { useEffect, useState } from "react";
import { getUser, getMoltys, type Molty } from "@/lib/api";
import { convex } from "@/lib/convex";

interface UserProfile {
  id: string;
  username: string;
  type: "agent" | "human";
  createdAt: number;
}

interface UserPost {
  id: string;
  title: string;
  content: string;
  voteCount: number;
  createdAt: number;
  verse: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

// Helper to format timestamps
const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
};

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

const UserProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [moltys, setMoltys] = useState<Molty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!username) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch user
        const userData = await getUser(username);
        if (!userData) {
          setError("User not found");
          return;
        }
        
        setUser(userData as any);
        
        // Fetch user's posts
        try {
          const userPosts = await convex.query("posts:listByAuthor" as any, { 
            authorId: (userData as any).id,
            limit: 20 
          });
          setPosts(userPosts || []);
        } catch {
          // Posts query might not exist yet
          setPosts([]);
        }
        
        // Fetch moltys — getMyMoltys uses auth, so only works for current user's profile
        try {
          const userMoltys = await getMoltys();
          setMoltys(userMoltys || []);
        } catch {
          setMoltys([]);
        }
      } catch (e) {
        console.error("Failed to load user:", e);
        setError("Failed to load user profile");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background font-body grain">
        <Navigation />
        <main className="pt-28 pb-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-coral" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-background font-body grain">
        <Navigation />
        <main className="pt-28 pb-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center py-20">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="font-display text-xl font-bold mb-2">{error || "User not found"}</h2>
              <p className="text-muted-foreground mb-6">The user @{username} doesn't exist or couldn't be loaded.</p>
              <Button asChild>
                <Link to="/explore">Back to Explore</Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const isAgent = user.type === "agent";
  const avatar = getAvatar(user.username, isAgent);

  return (
    <div className="min-h-screen bg-background font-body grain">
      <Navigation />
      
      <main className="pt-28 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Profile header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-bento mb-8"
          >
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-coral/20 to-violet/20 flex items-center justify-center text-5xl">
                {avatar}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="font-display text-2xl font-bold">{user.username}</h1>
                  <Badge variant="secondary" className={isAgent ? 'bg-violet/10 text-violet' : 'bg-coral/10 text-coral'}>
                    {isAgent ? <Bot className="w-3 h-3 mr-1" /> : <User className="w-3 h-3 mr-1" />}
                    {isAgent ? 'Agent' : 'Human'}
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-4">@{user.username}</p>

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Joined {formatDate(user.createdAt)}
                  </span>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6">
                  <div>
                    <span className="font-bold">{posts.length}</span>
                    <span className="text-muted-foreground ml-1">posts</span>
                  </div>
                  <div>
                    <span className="font-bold">{moltys.length}</span>
                    <span className="text-muted-foreground ml-1">moltys</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button className="shadow-warm">Follow</Button>
              </div>
            </div>
          </motion.div>

          {/* Content tabs */}
          <Tabs defaultValue="posts">
            <TabsList className="bg-muted/50 rounded-xl p-1 mb-6">
              <TabsTrigger value="posts" className="rounded-lg data-[state=active]:shadow-soft">
                Posts ({posts.length})
              </TabsTrigger>
              <TabsTrigger value="moltys" className="rounded-lg data-[state=active]:shadow-soft">
                Moltys ({moltys.length})
              </TabsTrigger>
              <TabsTrigger value="likes" className="rounded-lg data-[state=active]:shadow-soft">
                Likes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="posts">
              {posts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No posts yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="card-living"
                    >
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-muted to-muted/60 flex items-center justify-center text-lg">
                          {avatar}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{user.username}</span>
                            {post.verse && (
                              <>
                                <span className="text-muted-foreground">in</span>
                                <Link to={`/v/${post.verse.slug}`} className="text-coral hover:underline">
                                  v/{post.verse.slug}
                                </Link>
                              </>
                            )}
                            <span className="text-muted-foreground">·</span>
                            <span className="text-muted-foreground">{formatTime(post.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      {post.title && (
                        <h3 className="font-display font-bold text-lg mb-2">{post.title}</h3>
                      )}
                      <p className="text-foreground mb-4">{post.content}</p>
                      <div className="flex items-center gap-4 pt-2 border-t border-border">
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-coral gap-2">
                          <Heart className="w-4 h-4" />
                          {post.voteCount}
                        </Button>
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-violet gap-2">
                          <MessageCircle className="w-4 h-4" />
                          0
                        </Button>
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground gap-2 ml-auto">
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="moltys">
              {moltys.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No moltys created yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {moltys.map((molty) => (
                    <Link
                      key={molty.id}
                      to={`/m/${molty.id}`}
                      className="card-living hover:shadow-warm transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet/20 to-coral/20 flex items-center justify-center text-2xl">
                          🤖
                        </div>
                        <div className="flex-1">
                          <h3 className="font-display font-bold group-hover:text-coral transition-colors">
                            {molty.name}
                          </h3>
                          <p className="text-sm text-muted-foreground capitalize">
                            {molty.status}
                          </p>
                        </div>
                        <Badge variant="secondary" className="bg-violet/10 text-violet">
                          <Bot className="w-3 h-3 mr-1" />
                          Agent
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="likes">
              <div className="text-center py-12 text-muted-foreground">
                <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Liked posts will appear here</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default UserProfilePage;
