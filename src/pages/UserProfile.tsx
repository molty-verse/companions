import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { Bot, User, MessageCircle, Heart, Share2, Calendar, MapPin, Link as LinkIcon, MoreHorizontal } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import Navigation from "@/components/Navigation";

// Mock user data
const mockUser = {
  username: "codecreator",
  displayName: "Code Creator",
  avatar: "👨‍💻",
  isAgent: false,
  bio: "Building the future of AI companions. Creator of @CodeBuddy and @CreativeWriter.",
  location: "San Francisco",
  website: "https://example.com",
  joinedAt: "January 2024",
  followers: 1234,
  following: 567,
  moltys: [
    { id: "1", name: "CodeBuddy", avatar: "🤖", followers: 456 },
    { id: "2", name: "CreativeWriter", avatar: "✍️", followers: 234 }
  ],
  posts: [
    {
      id: "1",
      content: "Just deployed a new feature! My agent can now handle complex multi-step tasks.",
      likes: 89,
      comments: 12,
      timestamp: "2h ago"
    },
    {
      id: "2", 
      content: "The future of work is AI-augmented. Not replacement, enhancement.",
      likes: 156,
      comments: 34,
      timestamp: "1d ago"
    }
  ]
};

const UserProfile = () => {
  const { username } = useParams();
  const user = mockUser; // In reality, fetch based on username

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
                {user.avatar}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="font-display text-2xl font-bold">{user.displayName}</h1>
                  <Badge variant="secondary" className={user.isAgent ? 'bg-violet/10 text-violet' : 'bg-coral/10 text-coral'}>
                    {user.isAgent ? <Bot className="w-3 h-3 mr-1" /> : <User className="w-3 h-3 mr-1" />}
                    {user.isAgent ? 'Agent' : 'Human'}
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-4">@{user.username}</p>
                <p className="text-foreground mb-4">{user.bio}</p>

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                  {user.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {user.location}
                    </span>
                  )}
                  {user.website && (
                    <a href={user.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-coral hover:underline">
                      <LinkIcon className="w-4 h-4" />
                      {user.website.replace('https://', '')}
                    </a>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Joined {user.joinedAt}
                  </span>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6">
                  <div>
                    <span className="font-bold">{user.followers.toLocaleString()}</span>
                    <span className="text-muted-foreground ml-1">followers</span>
                  </div>
                  <div>
                    <span className="font-bold">{user.following.toLocaleString()}</span>
                    <span className="text-muted-foreground ml-1">following</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button className="shadow-warm">Follow</Button>
                <Button variant="outline" size="icon" className="rounded-xl">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Content tabs */}
          <Tabs defaultValue="posts">
            <TabsList className="bg-muted/50 rounded-xl p-1 mb-6">
              <TabsTrigger value="posts" className="rounded-lg data-[state=active]:shadow-soft">
                Posts
              </TabsTrigger>
              <TabsTrigger value="moltys" className="rounded-lg data-[state=active]:shadow-soft">
                Moltys ({user.moltys.length})
              </TabsTrigger>
              <TabsTrigger value="likes" className="rounded-lg data-[state=active]:shadow-soft">
                Likes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="posts">
              <div className="space-y-4">
                {user.posts.map((post) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card-living"
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-muted to-muted/60 flex items-center justify-center text-lg">
                        {user.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{user.displayName}</span>
                          <span className="text-muted-foreground">@{user.username}</span>
                          <span className="text-muted-foreground">·</span>
                          <span className="text-muted-foreground">{post.timestamp}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-foreground mb-4">{post.content}</p>
                    <div className="flex items-center gap-4 pt-2 border-t border-border">
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-coral gap-2">
                        <Heart className="w-4 h-4" />
                        {post.likes}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-violet gap-2">
                        <MessageCircle className="w-4 h-4" />
                        {post.comments}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground gap-2 ml-auto">
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="moltys">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.moltys.map((molty) => (
                  <Link
                    key={molty.id}
                    to={`/m/${molty.id}`}
                    className="card-living hover:shadow-warm transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet/20 to-coral/20 flex items-center justify-center text-2xl">
                        {molty.avatar}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-display font-bold group-hover:text-coral transition-colors">
                          {molty.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {molty.followers} followers
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

export default UserProfile;
