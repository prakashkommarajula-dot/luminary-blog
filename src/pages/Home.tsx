import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, TrendingUp, Clock, User, ChevronRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { collection, query, where, orderBy, limit, onSnapshot, doc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '@/lib/firebase-utils';

interface Post {
  id: string;
  title: string;
  excerpt: string;
  authorName: string;
  authorPhoto: string;
  publishedAt: any;
  readingTime: number;
  category: string;
  coverImage: string;
  views: number;
  likesCount: number;
  commentsCount: number;
}

interface Author {
  uid: string;
  displayName: string;
  photoURL: string;
  bio: string;
  followersCount: number;
}

export const Home: React.FC = () => {
  const [featuredPosts, setFeaturedPosts] = useState<Post[]>([]);
  const [latestPosts, setLatestPosts] = useState<Post[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);
  const [mostDiscussed, setMostDiscussed] = useState<Post[]>([]);
  const [featuredAuthors, setFeaturedAuthors] = useState<Author[]>([]);
  const [editorPicks, setEditorPicks] = useState<Post[]>([]);
  const [stats, setStats] = useState({ totalPosts: 1240, totalAuthors: 156, totalViews: 248500 });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const featuredQuery = query(
      collection(db, 'posts'),
      where('status', '==', 'published'),
      where('featured', '==', true),
      orderBy('publishedAt', 'desc'),
      limit(2)
    );

    const editorPicksQuery = query(
      collection(db, 'posts'),
      where('status', '==', 'published'),
      where('editorPick', '==', true),
      orderBy('publishedAt', 'desc'),
      limit(3)
    );

    const latestQuery = query(
      collection(db, 'posts'),
      where('status', '==', 'published'),
      orderBy('publishedAt', 'desc'),
      limit(3)
    );

    const trendingQuery = query(
      collection(db, 'posts'),
      where('status', '==', 'published'),
      where('trending', '==', true),
      limit(4)
    );

    const discussedQuery = query(
      collection(db, 'posts'),
      where('status', '==', 'published'),
      orderBy('commentsCount', 'desc'),
      limit(4)
    );

    const authorsQuery = query(
      collection(db, 'users'),
      where('role', '==', 'author'),
      orderBy('followersCount', 'desc'),
      limit(4)
    );

    const unsubFeatured = onSnapshot(featuredQuery, (snapshot) => {
      const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
      setFeaturedPosts(posts);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'posts');
    });

    const unsubEditorPicks = onSnapshot(editorPicksQuery, (snapshot) => {
      const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
      setEditorPicks(posts);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'posts');
    });

    const unsubLatest = onSnapshot(latestQuery, (snapshot) => {
      const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
      setLatestPosts(posts);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'posts');
    });

    const unsubTrending = onSnapshot(trendingQuery, (snapshot) => {
      const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
      setTrendingPosts(posts);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'posts');
    });

    const unsubDiscussed = onSnapshot(discussedQuery, (snapshot) => {
      const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
      setMostDiscussed(posts);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'posts');
    });

    const unsubAuthors = onSnapshot(authorsQuery, (snapshot) => {
      const authors = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as Author));
      setFeaturedAuthors(authors);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    });

    const unsubStats = onSnapshot(doc(db, 'metadata', 'stats'), (snapshot) => {
      if (snapshot.exists()) {
        setStats(snapshot.data() as any);
      }
    });

    return () => {
      unsubFeatured();
      unsubEditorPicks();
      unsubLatest();
      unsubTrending();
      unsubDiscussed();
      unsubAuthors();
      unsubStats();
    };
  }, []);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  return (
    <div className="space-y-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-24">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30 dark:opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] animate-pulse delay-700"></div>
        </div>
        
        <div className="container mx-auto px-4 text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="secondary" className="px-4 py-1.5 rounded-full text-sm font-medium mb-6 glass">
              ✨ The future of blogging is here
            </Badge>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-8xl font-display font-bold tracking-tight leading-[1.1]"
          >
            Where ideas <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-primary/60">
              come to light.
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground leading-relaxed"
          >
            Luminary is the premium space for thinkers, writers, and creators. Join our growing community and explore {stats.totalPosts.toLocaleString()} stories from around the globe.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="flex flex-wrap items-center justify-center gap-8 pt-4"
          >
            <div className="text-center">
              <p className="text-3xl font-bold">{stats.totalPosts >= 1000 ? (stats.totalPosts / 1000).toFixed(0) + 'k+' : stats.totalPosts}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Stories</p>
            </div>
            <div className="w-px h-8 bg-border hidden sm:block"></div>
            <div className="text-center">
              <p className="text-3xl font-bold">{stats.totalAuthors}+</p>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Authors</p>
            </div>
            <div className="w-px h-8 bg-border hidden sm:block"></div>
            <div className="text-center">
              <p className="text-3xl font-bold">{stats.totalViews >= 1000000 ? (stats.totalViews / 1000000).toFixed(1) + 'M+' : (stats.totalViews / 1000).toFixed(0) + 'k+'}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Views</p>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Button size="lg" className="rounded-full px-8 h-14 text-lg group" asChild>
              <Link to={user ? "/write" : "/login?redirect=/write"}>
                Start Writing <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-8 h-14 text-lg glass" asChild>
              <Link to="/blog">Explore Stories</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Trending Section */}
      <section className="container mx-auto px-4">
        <div className="flex items-center gap-2 mb-8">
          <TrendingUp className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-display font-bold">Trending This Week</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse bg-muted rounded-xl" />
            ))
          ) : (
            trendingPosts.map((post, index) => (
              <Link key={post.id} to={`/blog/${post.id}`} className="group flex gap-4 items-start">
                <span className="text-4xl font-display font-bold text-muted/30 group-hover:text-primary/20 transition-colors">
                  0{index + 1}
                </span>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <img src={post.authorPhoto} className="w-4 h-4 rounded-full" referrerPolicy="no-referrer" />
                    <span>{post.authorName}</span>
                  </div>
                  <h4 className="font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h4>
                  <span className="text-xs text-muted-foreground">{formatDate(post.publishedAt)}</span>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Editor's Picks */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-1">
            <h2 className="text-2xl font-display font-bold">Editor's Picks</h2>
            <p className="text-sm text-muted-foreground">Quality content curated by our team.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-64 animate-pulse bg-muted rounded-2xl" />
            ))
          ) : (
            editorPicks.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={`/blog/${post.id}`}>
                  <Card className="group border-none shadow-lg glass overflow-hidden h-full">
                    <div className="aspect-video overflow-hidden">
                      <img 
                        src={post.coverImage} 
                        alt={post.title} 
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <CardContent className="p-6 space-y-3">
                      <Badge variant="outline" className="rounded-full text-[10px] uppercase tracking-wider">{post.category}</Badge>
                      <h4 className="font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h4>
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                        <span>{post.authorName}</span>
                        <span>{post.readingTime} min read</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))
          )}
        </div>
      </section>

      {/* Featured Posts */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-12">
          <div className="space-y-1">
            <h2 className="text-3xl font-display font-bold">Featured Stories</h2>
            <p className="text-muted-foreground">Hand-picked excellence from our community.</p>
          </div>
          <Button variant="ghost" className="group" asChild>
            <Link to="/blog">View all <ChevronRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" /></Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {loading ? (
            Array.from({ length: 2 }).map((_, i) => (
              <Card key={i} className="h-[400px] animate-pulse bg-muted" />
            ))
          ) : (
            featuredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={`/blog/${post.id}`}>
                  <Card className="group overflow-hidden border-none shadow-2xl glass hover:shadow-primary/5 transition-all duration-500">
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <img 
                        src={post.coverImage} 
                        alt={post.title} 
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <Badge className="absolute top-4 left-4 glass bg-white/20 text-white border-white/20">
                        {post.category}
                      </Badge>
                    </div>
                    <CardContent className="p-8 space-y-4">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><User className="w-4 h-4" /> {post.authorName}</span>
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {post.readingTime} min read</span>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-display font-bold group-hover:text-primary/80 transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-muted-foreground line-clamp-2 leading-relaxed">
                        {post.excerpt}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))
          )}
        </div>
      </section>

      {/* Latest Posts & Sidebar */}
      <section className="bg-muted/30 py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-8 space-y-12">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-3xl font-display font-bold">Latest Updates</h2>
                  <p className="text-muted-foreground">Fresh perspectives from around the globe.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="h-[400px] animate-pulse bg-muted" />
                  ))
                ) : (
                  latestPosts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link to={`/blog/${post.id}`}>
                        <Card className="group h-full flex flex-col border-none shadow-lg glass hover:-translate-y-2 transition-all duration-500">
                          <div className="relative aspect-[4/3] overflow-hidden rounded-t-xl">
                            <img 
                              src={post.coverImage} 
                              alt={post.title} 
                              className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <CardContent className="p-6 flex-1 flex flex-col space-y-4">
                            <Badge variant="secondary" className="w-fit">{post.category}</Badge>
                            <h3 className="text-xl font-bold leading-tight group-hover:text-primary/70 transition-colors">
                              {post.title}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
                              {post.excerpt}
                            </p>
                            <div className="pt-4 flex items-center justify-between border-t border-border/50 text-xs text-muted-foreground">
                              <span>{post.authorName}</span>
                              <span>{formatDate(post.publishedAt)}</span>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  ))
                )}
              </div>
              
              <div className="text-center">
                <Button variant="outline" size="lg" className="rounded-full px-12 glass" asChild>
                  <Link to="/blog">Load More Stories</Link>
                </Button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-12">
              {/* Featured Authors */}
              <div className="space-y-6">
                <h3 className="text-xl font-display font-bold">Featured Authors</h3>
                <div className="space-y-4">
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-16 animate-pulse bg-muted rounded-xl" />
                    ))
                  ) : (
                    featuredAuthors.map(author => (
                      <div key={author.uid} className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <img src={author.photoURL} className="w-10 h-10 rounded-full object-cover" referrerPolicy="no-referrer" />
                          <div>
                            <h4 className="font-bold text-sm group-hover:text-primary transition-colors">{author.displayName}</h4>
                            <p className="text-xs text-muted-foreground line-clamp-1">{author.followersCount.toLocaleString()} followers</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="rounded-full h-8 text-xs">Follow</Button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Most Discussed */}
              <div className="space-y-6">
                <h3 className="text-xl font-display font-bold">Most Discussed</h3>
                <div className="space-y-6">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-20 animate-pulse bg-muted rounded-xl" />
                    ))
                  ) : (
                    mostDiscussed.map(post => (
                      <Link key={post.id} to={`/blog/${post.id}`} className="group block space-y-2">
                        <h4 className="font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                          {post.title}
                        </h4>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{post.commentsCount} comments</span>
                          <span>{post.readingTime} min read</span>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>

              {/* Popular Tags */}
              <div className="space-y-6">
                <h3 className="text-xl font-display font-bold">Popular Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {['React', 'Next.js', 'AI', 'TypeScript', 'WebDev', 'Design', 'Cloud', 'Career'].map(tag => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="container mx-auto px-4 pb-24">
        <div className="relative rounded-[2.5rem] overflow-hidden bg-primary p-12 md:p-24 text-primary-foreground text-center space-y-8">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4 relative z-10"
          >
            <h2 className="text-4xl md:text-6xl font-display font-bold">Join the Luminary Circle</h2>
            <p className="max-w-xl mx-auto text-primary-foreground/80 text-lg">
              Get a weekly digest of the best stories, exclusive interviews, and creative inspiration delivered straight to your inbox.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto relative z-10"
          >
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="w-full h-14 px-6 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-md"
            />
            <Button size="lg" className="h-14 px-8 rounded-full bg-white text-primary hover:bg-white/90 w-full sm:w-auto">
              Subscribe
            </Button>
          </motion.div>
          
          <p className="text-xs text-primary-foreground/60 relative z-10">
            By subscribing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </section>
    </div>
  );
};
