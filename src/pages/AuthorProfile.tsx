import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Twitter, 
  Linkedin, 
  Github, 
  Globe, 
  MapPin, 
  Calendar, 
  Users, 
  BookOpen, 
  ChevronRight,
  Loader2,
  Share2,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { db, auth } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '@/lib/firebase-utils';
import { toast } from 'sonner';

interface Author {
  uid: string;
  displayName: string;
  photoURL: string;
  bio: string;
  location: string;
  createdAt: any;
  followersCount: number;
  followingCount: number;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
}

interface Post {
  id: string;
  title: string;
  excerpt: string;
  coverImage: string;
  category: string;
  publishedAt: any;
  readingTime: number;
  likesCount: number;
}

export const AuthorProfile: React.FC = () => {
  const { id } = useParams();
  const [author, setAuthor] = useState<Author | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchAuthorData = async () => {
      try {
        const authorDoc = await getDoc(doc(db, 'users', id));
        if (authorDoc.exists()) {
          setAuthor({ uid: authorDoc.id, ...authorDoc.data() } as Author);
          
          // Fetch author's posts
          const postsQuery = query(
            collection(db, 'posts'),
            where('authorId', '==', id),
            where('status', '==', 'published'),
            orderBy('publishedAt', 'desc'),
            limit(10)
          );
          const postsSnap = await getDocs(postsQuery);
          setPosts(postsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Post)));
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `users/${id}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAuthorData();
  }, [id]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Profile link copied!');
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!author) {
    return (
      <div className="container mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-3xl font-bold">Author not found</h2>
        <Button asChild><Link to="/authors">Back to Authors</Link></Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 max-w-5xl space-y-12 py-12">
      {/* Profile Header */}
      <div className="relative">
        <div className="h-48 md:h-64 w-full rounded-[2.5rem] bg-gradient-to-br from-primary/20 via-primary/5 to-background border border-primary/10 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        </div>
        
        <div className="px-8 -mt-20 flex flex-col md:flex-row gap-8 items-end md:items-center justify-between relative z-10">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-end">
            <Avatar className="h-40 w-40 border-8 border-background shadow-2xl">
              <AvatarImage src={author.photoURL} />
              <AvatarFallback>{author.displayName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="space-y-2 text-center md:text-left pb-2">
              <h1 className="text-3xl md:text-5xl font-display font-bold tracking-tight">{author.displayName}</h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {author.location}</span>
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Joined {formatDate(author.createdAt)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 pb-2">
            <Button 
              className="rounded-full px-8 h-12 text-base font-bold shadow-lg shadow-primary/20"
              onClick={() => setIsFollowing(!isFollowing)}
              variant={isFollowing ? "outline" : "default"}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </Button>
            <Button variant="outline" size="icon" className="rounded-full h-12 w-12" onClick={handleShare}>
              <Share2 className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full h-12 w-12">
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Sidebar Info */}
        <div className="space-y-8">
          <Card className="glass border-none shadow-xl">
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2">
                <h3 className="font-bold text-lg">About</h3>
                <p className="text-muted-foreground leading-relaxed">{author.bio}</p>
              </div>
              
              <div className="flex items-center justify-between py-4 border-y border-border/50">
                <div className="text-center space-y-1">
                  <p className="text-2xl font-bold">{author.followersCount.toLocaleString()}</p>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Followers</p>
                </div>
                <div className="w-px h-8 bg-border/50"></div>
                <div className="text-center space-y-1">
                  <p className="text-2xl font-bold">{author.followingCount.toLocaleString()}</p>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Following</p>
                </div>
                <div className="w-px h-8 bg-border/50"></div>
                <div className="text-center space-y-1">
                  <p className="text-2xl font-bold">{posts.length}</p>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Stories</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Connect</h4>
                <div className="flex flex-col gap-3">
                  {author.socialLinks?.twitter && (
                    <a href={author.socialLinks.twitter} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm hover:text-primary transition-colors">
                      <Twitter className="w-4 h-4" /> Twitter
                    </a>
                  )}
                  {author.socialLinks?.linkedin && (
                    <a href={author.socialLinks.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm hover:text-primary transition-colors">
                      <Linkedin className="w-4 h-4" /> LinkedIn
                    </a>
                  )}
                  {author.socialLinks?.github && (
                    <a href={author.socialLinks.github} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm hover:text-primary transition-colors">
                      <Github className="w-4 h-4" /> GitHub
                    </a>
                  )}
                  {author.socialLinks?.website && (
                    <a href={author.socialLinks.website} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm hover:text-primary transition-colors">
                      <Globe className="w-4 h-4" /> Website
                    </a>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <Tabs defaultValue="stories" className="w-full space-y-8">
            <TabsList className="bg-transparent border-b border-border w-full justify-start rounded-none h-auto p-0 gap-8">
              <TabsTrigger 
                value="stories" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-4 text-base font-bold"
              >
                Stories
              </TabsTrigger>
              <TabsTrigger 
                value="about" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-4 text-base font-bold"
              >
                About
              </TabsTrigger>
            </TabsList>

            <TabsContent value="stories" className="space-y-8">
              {posts.length > 0 ? (
                posts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link to={`/blog/${post.id}`} className="group block">
                      <Card className="glass border-none shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden">
                        <div className="flex flex-col md:flex-row">
                          <div className="md:w-1/3 aspect-video md:aspect-auto relative overflow-hidden">
                            <img 
                              src={post.coverImage} 
                              alt={post.title} 
                              className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute top-4 left-4">
                              <Badge className="bg-background/80 backdrop-blur-md text-foreground border-none rounded-full px-4">{post.category}</Badge>
                            </div>
                          </div>
                          <CardContent className="p-8 flex-1 space-y-4">
                            <div className="space-y-2">
                              <h3 className="text-2xl font-bold group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                                {post.title}
                              </h3>
                              <p className="text-muted-foreground line-clamp-2 leading-relaxed">
                                {post.excerpt}
                              </p>
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-border/50">
                              <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(post.publishedAt)}</span>
                                <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {post.readingTime} min read</span>
                              </div>
                              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                            </div>
                          </CardContent>
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-24 space-y-4 glass rounded-[2.5rem]">
                  <div className="p-4 bg-muted rounded-full w-fit mx-auto">
                    <BookOpen className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-bold">No stories yet</h3>
                  <p className="text-muted-foreground">This author hasn't published any stories yet.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="about" className="space-y-8">
              <Card className="glass border-none shadow-xl">
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold">Biography</h3>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {author.bio}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-border/50">
                    <div className="space-y-2">
                      <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Interests</h4>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="rounded-full">Web Development</Badge>
                        <Badge variant="secondary" className="rounded-full">UI/UX Design</Badge>
                        <Badge variant="secondary" className="rounded-full">TypeScript</Badge>
                        <Badge variant="secondary" className="rounded-full">React</Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Stats</h4>
                      <div className="space-y-1 text-sm">
                        <p className="flex justify-between">
                          <span className="text-muted-foreground">Total Views</span>
                          <span className="font-bold">45.2k</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-muted-foreground">Total Likes</span>
                          <span className="font-bold">2.4k</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-muted-foreground">Average Reading Time</span>
                          <span className="font-bold">6 min</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
