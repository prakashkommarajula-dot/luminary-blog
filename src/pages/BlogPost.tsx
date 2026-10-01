import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'motion/react';
import { 
  Heart, 
  MessageCircle, 
  Bookmark, 
  Share2, 
  Clock, 
  Calendar, 
  User, 
  ArrowLeft,
  ChevronRight,
  Twitter,
  Linkedin,
  Link as LinkIcon,
  MoreHorizontal,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, orderBy, onSnapshot, where, limit, getDocs, documentId } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '@/lib/firebase-utils';

interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  authorId: string;
  authorName: string;
  authorPhoto: string;
  publishedAt: any;
  readingTime: number;
  category: string;
  coverImage: string;
  likesCount: number;
  commentsCount: number;
  tags: string[];
  relatedPostIds?: string[];
}

interface Author {
  uid: string;
  displayName: string;
  photoURL: string;
  bio: string;
  followersCount: number;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
}

interface Comment {
  id: string;
  userName: string;
  userPhoto: string;
  content: string;
  createdAt: any;
  likesCount: number;
  parentId?: string | null;
  replies?: Comment[];
}

export const BlogPost: React.FC = () => {
  const { id } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [author, setAuthor] = useState<Author | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [nextPost, setNextPost] = useState<Post | null>(null);
  const [prevPost, setPrevPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const extractHeadings = (markdown: string) => {
    const headingRegex = /^(#{2,3})\s+(.+)$/gm;
    const headings = [];
    let match;
    while ((match = headingRegex.exec(markdown)) !== null) {
      headings.push({
        level: match[1].length,
        text: match[2],
        id: match[2].toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-')
      });
    }
    return headings;
  };

  useEffect(() => {
    if (!id) return;

    const fetchPost = async () => {
      try {
        const postDoc = await getDoc(doc(db, 'posts', id));
        if (postDoc.exists()) {
          const postData = { id: postDoc.id, ...postDoc.data() } as Post;
          setPost(postData);

          // Fetch author
          const authorDoc = await getDoc(doc(db, 'users', postData.authorId));
          if (authorDoc.exists()) {
            setAuthor({ uid: authorDoc.id, ...authorDoc.data() } as Author);
          }

          // Fetch related posts
          if (postData.relatedPostIds && postData.relatedPostIds.length > 0) {
            const relatedQuery = query(
              collection(db, 'posts'),
              where(documentId(), 'in', postData.relatedPostIds.slice(0, 3))
            );
            const relatedSnap = await getDocs(relatedQuery);
            setRelatedPosts(relatedSnap.docs.map(d => ({ id: d.id, ...d.data() } as Post)));
          } else {
            const fallbackQuery = query(
              collection(db, 'posts'),
              where('category', '==', postData.category),
              where('status', '==', 'published'),
              limit(4)
            );
            const fallbackSnap = await getDocs(fallbackQuery);
            setRelatedPosts(fallbackSnap.docs
              .map(d => ({ id: d.id, ...d.data() } as Post))
              .filter(p => p.id !== id)
              .slice(0, 3)
            );
          }

          // Fetch next/prev posts
          const nextQuery = query(
            collection(db, 'posts'),
            where('status', '==', 'published'),
            where('publishedAt', '>', postData.publishedAt),
            orderBy('publishedAt', 'asc'),
            limit(1)
          );
          const nextSnap = await getDocs(nextQuery);
          if (!nextSnap.empty) setNextPost({ id: nextSnap.docs[0].id, ...nextSnap.docs[0].data() } as Post);

          const prevQuery = query(
            collection(db, 'posts'),
            where('status', '==', 'published'),
            where('publishedAt', '<', postData.publishedAt),
            orderBy('publishedAt', 'desc'),
            limit(1)
          );
          const prevSnap = await getDocs(prevQuery);
          if (!prevSnap.empty) setPrevPost({ id: prevSnap.docs[0].id, ...prevSnap.docs[0].data() } as Post);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `posts/${id}`);
      }
    };

    const commentsQuery = query(
      collection(db, 'posts', id, 'comments'),
      orderBy('createdAt', 'desc')
    );

    const unsubComments = onSnapshot(commentsQuery, (snapshot) => {
      const fetchedComments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment));
      setComments(fetchedComments);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `posts/${id}/comments`);
    });

    fetchPost();
    return () => unsubComments();
  }, [id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-3xl font-bold">Post not found</h2>
        <Button asChild><Link to="/blog">Back to Blog</Link></Button>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1.5 bg-primary z-[60] origin-left"
        style={{ scaleX }}
      />

      <div className="container mx-auto px-4 max-w-4xl space-y-12">
        {/* Back Button */}
        <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to all stories
        </Link>

        {/* Header */}
        <div className="space-y-8">
          <div className="space-y-4">
            <Badge variant="secondary" className="px-4 py-1 rounded-full">{post.category}</Badge>
            <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight leading-tight">
              {post.title}
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed italic">
              "{post.excerpt}"
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-6 py-6 border-y border-border">
              <Link to={`/profile/${post.authorId}`} className="flex items-center gap-4 group">
                <Avatar className="h-12 w-12 border-2 border-primary/10 group-hover:border-primary transition-colors">
                  <AvatarImage src={post.authorPhoto} />
                  <AvatarFallback>{post.authorName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <span className="font-bold group-hover:text-primary transition-colors">{post.authorName}</span>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(post.publishedAt)}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readingTime} min read</span>
                  </div>
                </div>
              </Link>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-500">
                <Twitter className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600">
                <Linkedin className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full" onClick={handleShare}>
                <LinkIcon className="w-5 h-5" />
              </Button>
              <Separator orientation="vertical" className="h-8 mx-2" />
              <Button variant="ghost" size="icon" className="rounded-full">
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Cover Image */}
        <div className="relative aspect-[21/9] rounded-[2rem] overflow-hidden shadow-2xl">
          <img 
            src={post.coverImage} 
            alt={post.title} 
            className="object-cover w-full h-full"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Table of Contents (Desktop) */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-32 space-y-6">
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Table of Contents</h4>
                <nav className="flex flex-col gap-2">
                  {extractHeadings(post.content).map((heading) => (
                    <a
                      key={heading.id}
                      href={`#${heading.id}`}
                      className={`text-sm hover:text-primary transition-colors ${heading.level === 3 ? 'pl-4' : ''}`}
                    >
                      {heading.text}
                    </a>
                  ))}
                </nav>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <article className="flex-1 prose prose-lg dark:prose-invert prose-headings:font-display prose-headings:font-bold prose-a:text-primary prose-img:rounded-3xl max-w-none">
            <ReactMarkdown
              components={{
                h2: ({ node, ...props }) => <h2 id={props.children?.toString().toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-')} {...props} />,
                h3: ({ node, ...props }) => <h3 id={props.children?.toString().toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-')} {...props} />,
              }}
            >
              {post.content}
            </ReactMarkdown>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-12">
              {post.tags?.map(tag => (
                <Badge key={tag} variant="outline" className="rounded-full">#{tag}</Badge>
              ))}
            </div>

            {/* Author Bio Card */}
            {author && (
              <div className="mt-16 p-8 rounded-3xl bg-muted/30 border border-border flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                <Link to={`/profile/${author.uid}`}>
                  <Avatar className="h-24 w-24 border-4 border-background shadow-xl hover:scale-105 transition-transform">
                    <AvatarImage src={author.photoURL} />
                    <AvatarFallback>{author.displayName.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex-1 space-y-4">
                  <div className="space-y-1">
                    <Link to={`/profile/${author.uid}`} className="hover:text-primary transition-colors">
                      <h3 className="text-2xl font-bold">{author.displayName}</h3>
                    </Link>
                    <p className="text-muted-foreground leading-relaxed">{author.bio}</p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                    <Button variant="outline" size="sm" className="rounded-full px-6">Follow Author</Button>
                    <div className="flex items-center gap-2">
                      {author.socialLinks?.twitter && (
                        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" asChild>
                          <a href={author.socialLinks.twitter} target="_blank" rel="noreferrer"><Twitter className="w-4 h-4" /></a>
                        </Button>
                      )}
                      {author.socialLinks?.linkedin && (
                        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" asChild>
                          <a href={author.socialLinks.linkedin} target="_blank" rel="noreferrer"><Linkedin className="w-4 h-4" /></a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Next/Prev Navigation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 pt-12 border-t border-border">
              {prevPost ? (
                <Link to={`/blog/${prevPost.id}`} className="group p-6 rounded-2xl border border-border hover:border-primary/50 transition-colors space-y-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                    <ArrowLeft className="w-3 h-3" /> Previous Article
                  </span>
                  <h4 className="font-bold group-hover:text-primary transition-colors line-clamp-1">{prevPost.title}</h4>
                </Link>
              ) : <div />}
              {nextPost ? (
                <Link to={`/blog/${nextPost.id}`} className="group p-6 rounded-2xl border border-border hover:border-primary/50 transition-colors space-y-2 text-right">
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1 justify-end">
                    Next Article <ChevronRight className="w-3 h-3" />
                  </span>
                  <h4 className="font-bold group-hover:text-primary transition-colors line-clamp-1">{nextPost.title}</h4>
                </Link>
              ) : <div />}
            </div>
          </article>

          {/* Sidebar Actions */}
          <aside className="lg:w-20 flex lg:flex-col items-center justify-center lg:justify-start gap-4 sticky bottom-8 lg:top-32 h-fit bg-background/80 backdrop-blur-xl lg:bg-transparent p-4 rounded-full lg:p-0 shadow-xl lg:shadow-none border border-border lg:border-none z-40">
            <div className="flex lg:flex-col items-center gap-4">
              <div className="flex flex-col items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`rounded-full h-12 w-12 transition-all ${isLiked ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : 'hover:bg-muted'}`}
                  onClick={() => setIsLiked(!isLiked)}
                >
                  <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
                </Button>
                <span className="text-xs font-medium text-muted-foreground">{post.likesCount + (isLiked ? 1 : 0)}</span>
              </div>

              <div className="flex flex-col items-center gap-1">
                <Button variant="ghost" size="icon" className="rounded-full h-12 w-12 hover:bg-muted">
                  <MessageCircle className="w-6 h-6" />
                </Button>
                <span className="text-xs font-medium text-muted-foreground">{comments.length}</span>
              </div>

              <div className="flex flex-col items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`rounded-full h-12 w-12 transition-all ${isBookmarked ? 'text-primary bg-primary/10' : 'hover:bg-muted'}`}
                  onClick={() => setIsBookmarked(!isBookmarked)}
                >
                  <Bookmark className={`w-6 h-6 ${isBookmarked ? 'fill-current' : ''}`} />
                </Button>
                <span className="text-xs font-medium text-muted-foreground">Save</span>
              </div>

              <Separator className="hidden lg:block w-8 mx-auto my-2" />

              <Button variant="ghost" size="icon" className="rounded-full h-12 w-12 hover:bg-muted" onClick={handleShare}>
                <Share2 className="w-6 h-6" />
              </Button>
            </div>
          </aside>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="space-y-8 pt-12 border-t border-border">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-display font-bold">Related Stories</h3>
              <Button variant="ghost" asChild>
                <Link to="/blog" className="gap-2">View all <ChevronRight className="w-4 h-4" /></Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map(p => (
                <Link key={p.id} to={`/blog/${p.id}`} className="group space-y-3">
                  <div className="aspect-video rounded-xl overflow-hidden">
                    <img 
                      src={p.coverImage} 
                      alt={p.title} 
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <h4 className="font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                    {p.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{p.authorName}</span>
                    <span>•</span>
                    <span>{p.readingTime} min read</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Comments Section */}
        <section className="space-y-8 pt-12 border-t border-border">
          <h3 className="text-2xl font-display font-bold">Comments ({comments.length})</h3>
          <div className="space-y-6">
            {comments.map(comment => (
              <div key={comment.id} className="flex gap-4 p-6 rounded-2xl bg-muted/30 border border-border">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={comment.userPhoto} />
                  <AvatarFallback>{comment.userName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">{comment.userName}</span>
                    <span className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</span>
                  </div>
                  <p className="text-sm leading-relaxed">{comment.content}</p>
                  <div className="flex items-center gap-4 pt-2">
                    <button className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                      <Heart className="w-3 h-3" /> {comment.likesCount}
                    </button>
                    <button className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors">Reply</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
