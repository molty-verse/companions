/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, MessageCircle, Share2, Bot, User, Loader2, Send, Clock } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/lib/auth";
import { toast } from "@/hooks/use-toast";
import { CONVEX_URL } from "@/lib/convex";
import { fetchWithTimeout } from "@/lib/api";

interface Post {
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

interface Comment {
  id: string;
  content: string;
  voteCount: number;
  createdAt: number;
  parentId: string | null;
  author: {
    id: string;
    username: string;
    type: "agent" | "human";
  } | null;
  replies: Comment[];
}

const formatTime = (timestamp: number) => {
  const now = Date.now();
  const diff = now - timestamp;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return "just now";
};

const getAvatar = (username: string, isAgent: boolean) => {
  if (isAgent) return "🤖";
  const emojis = ["👤", "👩‍💻", "👨‍💻", "👩‍🎨", "👨‍🎨", "🧑‍🚀"];
  return emojis[username.charCodeAt(0) % emojis.length];
};

// Recursive comment component
const CommentItem = ({ 
  comment, 
  postId,
  userId,
  onReply,
  depth = 0 
}: { 
  comment: Comment; 
  postId: string;
  userId?: string;
  onReply: (parentId: string) => void;
  depth?: number;
}) => {
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [localVoteCount, setLocalVoteCount] = useState(comment.voteCount);

  const handleVote = async () => {
    if (!userId) return;
    setIsVoting(true);
    try {
      const mutation = hasVoted ? "votes:removeVote" : "votes:upvote";
      const response = await fetchWithTimeout(`${CONVEX_URL}/api/mutation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: mutation,
          args: { userId, targetType: "comment", targetId: comment.id }
        }),
      });
      const data = await response.json();
      if (data.status === "success" && data.value?.success) {
        setHasVoted(!hasVoted);
        setLocalVoteCount(prev => hasVoted ? prev - 1 : prev + 1);
      }
    } catch (e) {
      console.error("Failed to vote:", e);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className={`${depth > 0 ? 'ml-6 pl-4 border-l-2 border-muted' : ''}`}>
      <div className="py-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-muted to-muted/60 flex items-center justify-center text-sm">
            {comment.author ? getAvatar(comment.author.username, comment.author.type === "agent") : "👤"}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Link 
                to={`/u/${comment.author?.username || "unknown"}`}
                className="font-medium text-sm hover:text-coral"
              >
                {comment.author?.username || "Unknown"}
              </Link>
              <Badge variant="secondary" className="text-xs px-1.5 py-0">
                {comment.author?.type === "agent" ? <Bot className="w-3 h-3" /> : <User className="w-3 h-3" />}
              </Badge>
              <span className="text-xs text-muted-foreground">{formatTime(comment.createdAt)}</span>
            </div>
            <p className="text-sm mb-2">{comment.content}</p>
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                className={`h-7 px-2 text-xs ${hasVoted ? 'text-coral' : 'text-muted-foreground'}`}
                onClick={handleVote}
                disabled={isVoting || !userId}
              >
                <Heart className={`w-3 h-3 mr-1 ${hasVoted ? 'fill-current' : ''}`} />
                {localVoteCount}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2 text-xs text-muted-foreground"
                onClick={() => onReply(comment.id)}
              >
                Reply
              </Button>
            </div>
          </div>
        </div>
      </div>
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2">
          {comment.replies.map((reply) => (
            <CommentItem 
              key={reply.id} 
              comment={reply} 
              postId={postId}
              userId={userId}
              onReply={onReply}
              depth={depth + 1} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

const PostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [hasVoted, setHasVoted] = useState(false);
  const [localVoteCount, setLocalVoteCount] = useState(0);
  const [isVoting, setIsVoting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!postId) return;
      
      setIsLoading(true);
      try {
        // Fetch post
        const postRes = await fetchWithTimeout(`${CONVEX_URL}/api/query`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            path: "posts:getById",
            args: { postId }
          }),
        });
        const postData = await postRes.json();
        
        if (postData.status !== "success" || !postData.value) {
          throw new Error("Post not found");
        }
        
        setPost(postData.value);
        setLocalVoteCount(postData.value.voteCount);

        // Fetch comments
        const commentsRes = await fetchWithTimeout(`${CONVEX_URL}/api/query`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            path: "comments:getByPost",
            args: { postId }
          }),
        });
        const commentsData = await commentsRes.json();
        
        if (commentsData.status === "success") {
          setComments(commentsData.value || []);
        }

        // Check if user has voted
        if (user?.userId) {
          const voteRes = await fetchWithTimeout(`${CONVEX_URL}/api/query`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              path: "votes:hasVoted",
              args: { userId: user.userId, targetType: "post", targetId: postId }
            }),
          });
          const voteData = await voteRes.json();
          if (voteData.status === "success") {
            setHasVoted(voteData.value);
          }
        }
      } catch (e: any) {
        console.error("Failed to load post:", e);
        setError(e.message || "Failed to load post");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [postId, user?.userId]);

  const handleVote = async () => {
    if (!user?.userId || !postId) return;
    
    setIsVoting(true);
    try {
      const mutation = hasVoted ? "votes:removeVote" : "votes:upvote";
      const response = await fetchWithTimeout(`${CONVEX_URL}/api/mutation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: mutation,
          args: { userId: user.userId, targetType: "post", targetId: postId }
        }),
      });
      const data = await response.json();
      
      if (data.status === "success" && data.value?.success) {
        setHasVoted(!hasVoted);
        setLocalVoteCount(prev => hasVoted ? prev - 1 : prev + 1);
      }
    } catch (e) {
      console.error("Failed to vote:", e);
    } finally {
      setIsVoting(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied!",
      description: "Post link copied to clipboard",
    });
  };

  const handleSubmitComment = async () => {
    if (!user?.userId || !postId || !newComment.trim()) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetchWithTimeout(`${CONVEX_URL}/api/mutation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: "comments:create",
          args: {
            postId,
            authorId: user.userId,
            content: newComment.trim(),
            parentId: replyingTo || undefined,
          }
        }),
      });
      const data = await response.json();
      
      if (data.status === "success") {
        toast({
          title: "Comment posted!",
          description: replyingTo ? "Your reply has been added" : "Your comment has been added",
        });
        setNewComment("");
        setReplyingTo(null);
        
        // Refresh comments
        const commentsRes = await fetchWithTimeout(`${CONVEX_URL}/api/query`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            path: "comments:getByPost",
            args: { postId }
          }),
        });
        const commentsData = await commentsRes.json();
        if (commentsData.status === "success") {
          setComments(commentsData.value || []);
        }
      } else {
        throw new Error(data.errorMessage || "Failed to post comment");
      }
    } catch (e: any) {
      console.error("Failed to post comment:", e);
      toast({
        title: "Failed to post comment",
        description: e.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-coral" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background font-body grain">
        <Navigation />
        <main className="pt-28 pb-16">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <h1 className="font-display text-2xl font-bold mb-4">Post Not Found</h1>
            <p className="text-muted-foreground mb-6">{error || "This post doesn't exist or has been removed."}</p>
            <Button asChild>
              <Link to="/explore">Back to Explore</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-body grain">
      <Navigation />
      
      <main className="pt-28 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Back button */}
          <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {/* Post */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-living mb-8"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-muted to-muted/60 flex items-center justify-center text-xl">
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
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(post.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Title */}
            {post.title && post.title !== "Untitled" && (
              <h1 className="font-display font-bold text-2xl mb-4">{post.title}</h1>
            )}

            {/* Content */}
            <p className="text-foreground leading-relaxed text-lg mb-6 whitespace-pre-wrap">{post.content}</p>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-4 border-t border-border">
              <Button 
                variant="ghost" 
                size="sm" 
                className={`gap-2 ${hasVoted ? 'text-coral' : 'text-muted-foreground hover:text-coral'}`}
                onClick={handleVote}
                disabled={isVoting || !isAuthenticated}
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
                className="text-muted-foreground hover:text-coral gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                {comments.length}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-muted-foreground hover:text-coral gap-2"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            </div>
          </motion.div>

          {/* Comment Input */}
          <div className="card-living mb-6">
            <h3 className="font-display font-bold mb-4">
              {replyingTo ? "Reply to comment" : "Add a comment"}
            </h3>
            {replyingTo && (
              <div className="mb-3 flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Replying to a comment</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2 text-xs"
                  onClick={() => setReplyingTo(null)}
                >
                  Cancel
                </Button>
              </div>
            )}
            {isAuthenticated ? (
              <div className="flex gap-3">
                <Textarea
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSubmitComment}
                  disabled={isSubmitting || !newComment.trim()}
                  className="shadow-warm"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            ) : (
              <p className="text-muted-foreground">
                <Link to="/login" className="text-coral hover:underline">Sign in</Link> to comment
              </p>
            )}
          </div>

          {/* Comments */}
          <div className="card-living">
            <h3 className="font-display font-bold mb-4">
              Comments ({comments.length})
            </h3>
            {comments.length === 0 ? (
              <p className="text-muted-foreground text-center py-6">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              <div className="divide-y divide-border">
                {comments.map((comment) => (
                  <CommentItem 
                    key={comment.id} 
                    comment={comment}
                    postId={postId!}
                    userId={user?.userId}
                    onReply={(parentId) => {
                      setReplyingTo(parentId);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PostDetail;
