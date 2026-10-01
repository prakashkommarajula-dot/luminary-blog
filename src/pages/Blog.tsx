import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, SlidersHorizontal, Grid, List as ListIcon, ChevronDown, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot, doc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '@/lib/firebase-utils';

interface Post {
  id: string;
  title: string;
  excerpt: string;
  authorName: string;
  publishedAt: any;
  readingTime: number;
  category: string;
  coverImage: string;
}

const CATEGORIES = ['All', 'Web Development', 'React / Next.js', 'JavaScript / TypeScript', 'Backend / APIs', 'DevOps / Cloud', 'UI/UX Design', 'AI / ML', 'Career / Interview Prep', 'Productivity', 'Startups / Tech Trends'];

export const Blog: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('Newest');

  useEffect(() => {
    const q = query(
      collection(db, 'posts'),
      where('status', '==', 'published'),
      orderBy('publishedAt', 'desc')
    );

    const unsubscribePosts = onSnapshot(q, (snapshot) => {
      const fetchedPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
      setPosts(fetchedPosts);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'posts');
    });

    const unsubscribeSuggestions = onSnapshot(doc(db, 'metadata', 'search'), (snapshot) => {
      if (snapshot.exists()) {
        setSuggestions(snapshot.data().suggestions || []);
      }
    });

    return () => {
      unsubscribePosts();
      unsubscribeSuggestions();
    };
  }, []);

  const filteredPosts = posts
    .filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'Newest') {
        const dateA = a.publishedAt?.toDate ? a.publishedAt.toDate() : new Date(a.publishedAt);
        const dateB = b.publishedAt?.toDate ? b.publishedAt.toDate() : new Date(b.publishedAt);
        return dateB.getTime() - dateA.getTime();
      }
      if (sortBy === 'Oldest') {
        const dateA = a.publishedAt?.toDate ? a.publishedAt.toDate() : new Date(a.publishedAt);
        const dateB = b.publishedAt?.toDate ? b.publishedAt.toDate() : new Date(b.publishedAt);
        return dateA.getTime() - dateB.getTime();
      }
      if (sortBy === 'Popular') {
        return (b as any).views - (a as any).views;
      }
      return 0;
    });

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="container mx-auto px-4 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight">Explore Stories</h1>
        <p className="text-lg text-muted-foreground">
          Discover insights, tutorials, and perspectives from the best minds in the industry.
        </p>
      </div>

      {/* Filters & Search */}
      <div className="glass rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-24 z-40 shadow-xl border border-white/10 dark:border-white/5">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search stories..." 
            className="pl-10 rounded-xl bg-background/50 border-none focus-visible:ring-primary/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          />
          {showSuggestions && suggestions.length > 0 && !searchQuery && (
            <div className="absolute top-full left-0 w-full mt-2 bg-background border border-border rounded-xl shadow-2xl z-50 overflow-hidden glass p-1">
              <div className="p-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-3">
                Popular Searches
              </div>
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  className="w-full text-left px-3 py-2 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors text-sm flex items-center gap-2"
                  onClick={() => setSearchQuery(suggestion)}
                >
                  <Search className="w-3 h-3 text-muted-foreground" />
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          {CATEGORIES.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'ghost'}
              size="sm"
              className="rounded-full whitespace-nowrap"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2 border-l border-border pl-4 ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="rounded-full gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                <span>{sortBy}</span>
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSortBy('Newest')}>Newest</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('Oldest')}>Oldest</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('Popular')}>Popular</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center bg-muted/50 rounded-full p-1">
            <Button 
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
              size="icon" 
              className="w-8 h-8 rounded-full"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button 
              variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
              size="icon" 
              className="w-8 h-8 rounded-full"
              onClick={() => setViewMode('list')}
            >
              <ListIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Posts Grid/List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="h-80 animate-pulse bg-muted" />
          ))}
        </div>
      ) : filteredPosts.length > 0 ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' : 'space-y-6'}>
          {filteredPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              layout
            >
              <Link to={`/blog/${post.id}`}>
                <Card className={`group overflow-hidden border-none shadow-lg glass transition-all duration-500 ${
                  viewMode === 'list' ? 'flex flex-col md:flex-row h-auto md:h-64' : 'h-full flex flex-col'
                }`}>
                  <div className={`relative overflow-hidden ${
                    viewMode === 'list' ? 'w-full md:w-80 h-48 md:h-full' : 'aspect-[16/10]'
                  }`}>
                    <img 
                      src={post.coverImage} 
                      alt={post.title} 
                      className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <Badge className="absolute top-4 left-4 glass bg-white/20 text-white border-white/20">
                      {post.category}
                    </Badge>
                  </div>
                  <CardContent className={`p-6 flex flex-col justify-between flex-1 ${viewMode === 'list' ? 'md:p-8' : ''}`}>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="font-medium text-primary">{post.authorName}</span>
                        <span>•</span>
                        <span>{formatDate(post.publishedAt)}</span>
                      </div>
                      <h3 className={`font-display font-bold leading-tight group-hover:text-primary/70 transition-colors ${
                        viewMode === 'list' ? 'text-2xl md:text-3xl' : 'text-xl'
                      }`}>
                        {post.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {post.excerpt}
                      </p>
                    </div>
                    <div className="pt-4 flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">{post.readingTime} min read</span>
                      <Button variant="ghost" size="sm" className="rounded-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        Read More
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 space-y-4">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-2xl font-bold">No stories found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filters to find what you're looking for.</p>
          <Button variant="outline" onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}>
            Clear all filters
          </Button>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2 pt-12">
        <Button variant="outline" size="sm" disabled>Previous</Button>
        <Button variant="default" size="sm" className="w-10">1</Button>
        <Button variant="outline" size="sm" className="w-10">2</Button>
        <Button variant="outline" size="sm" className="w-10">3</Button>
        <span className="px-2">...</span>
        <Button variant="outline" size="sm" className="w-10">12</Button>
        <Button variant="outline" size="sm">Next</Button>
      </div>
    </div>
  );
};
