import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Eye, 
  Clock, 
  MessageSquare, 
  Heart,
  Loader2,
  FileText,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  TrendingUp,
  Users
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const MOCK_STATS_DATA = [
  { name: 'Mon', views: 400, likes: 24 },
  { name: 'Tue', views: 300, likes: 13 },
  { name: 'Wed', views: 900, likes: 98 },
  { name: 'Thu', views: 1480, likes: 120 },
  { name: 'Fri', views: 1100, likes: 86 },
  { name: 'Sat', views: 2400, likes: 210 },
  { name: 'Sun', views: 1800, likes: 150 },
];
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { db, auth } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { toast } from 'sonner';

interface Post {
  id: string;
  title: string;
  excerpt: string;
  status: 'draft' | 'published';
  createdAt: any;
  publishedAt: any;
  views: number;
  likesCount: number;
  commentsCount: number;
  category: string;
  coverImage: string;
}

export const MyBlogs: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'posts'),
      where('authorId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Post));
      setPosts(fetchedPosts);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load your blogs');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (postId: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await deleteDoc(doc(db, 'posts', postId));
      toast.success('Post deleted successfully');
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const publishedPosts = filteredPosts.filter(p => p.status === 'published');
  const draftPosts = filteredPosts.filter(p => p.status === 'draft');

  const PostCard = ({ post }: { post: Post }) => (
    <Card className="group border-none shadow-md glass overflow-hidden hover:shadow-lg transition-all duration-300">
      <CardContent className="p-0 flex flex-col md:flex-row">
        <div className="w-full md:w-48 aspect-video md:aspect-square overflow-hidden">
          <img 
            src={post.coverImage || 'https://picsum.photos/seed/placeholder/400/400'} 
            alt={post.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="flex-1 p-6 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Badge variant={post.status === 'published' ? 'default' : 'secondary'} className="rounded-full">
                {post.status === 'published' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass">
                  <DropdownMenuItem onClick={() => navigate(`/edit/${post.id}`)} className="gap-2">
                    <Edit2 className="w-4 h-4" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(`/blog/${post.id}`)} className="gap-2">
                    <Eye className="w-4 h-4" /> View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDelete(post.id)} className="gap-2 text-red-500 focus:text-red-500">
                    <Trash2 className="w-4 h-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <h3 className="text-xl font-bold line-clamp-1 group-hover:text-primary transition-colors">
              {post.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {post.excerpt}
            </p>
          </div>
          
          <div className="flex items-center gap-6 pt-4 text-xs text-muted-foreground border-t border-border/50">
            <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {post.views || 0}</span>
            <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {post.likesCount || 0}</span>
            <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {post.commentsCount || 0}</span>
            <span className="ml-auto">{post.publishedAt ? new Date(post.publishedAt.toDate()).toLocaleDateString() : 'Not published'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 max-w-5xl space-y-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-display font-bold tracking-tight">My Blogs</h1>
          <p className="text-muted-foreground">Manage your stories, drafts, and published content.</p>
        </div>
        <Button size="lg" className="rounded-full px-8 h-12 group" asChild>
          <Link to="/write">
            <Plus className="mr-2 w-5 h-5 group-hover:rotate-90 transition-transform" /> Write New Story
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search your blogs..." 
            className="pl-10 h-12 rounded-xl glass"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="h-12 rounded-xl glass gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4" /> Filter
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full space-y-8">
        <TabsList className="glass p-1 h-12 rounded-xl">
          <TabsTrigger value="all" className="rounded-lg px-6">All ({posts.length})</TabsTrigger>
          <TabsTrigger value="published" className="rounded-lg px-6">Published ({publishedPosts.length})</TabsTrigger>
          <TabsTrigger value="drafts" className="rounded-lg px-6">Drafts ({draftPosts.length})</TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-lg px-6 gap-2">
            <BarChart3 className="w-4 h-4" /> Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading your stories...</p>
            </div>
          ) : filteredPosts.length > 0 ? (
            filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <PostCard post={post} />
              </motion.div>
            ))
          ) : (
            <div className="text-center py-20 glass rounded-[2rem] space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold">No stories found</h3>
              <p className="text-muted-foreground max-w-xs mx-auto">
                {searchQuery ? `No results for "${searchQuery}"` : "You haven't written any stories yet. Start your journey today!"}
              </p>
              {!searchQuery && (
                <Button variant="outline" className="rounded-full px-8" asChild>
                  <Link to="/write">Create your first post</Link>
                </Button>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="published" className="space-y-6">
          {publishedPosts.length > 0 ? (
            publishedPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <PostCard post={post} />
              </motion.div>
            ))
          ) : (
            <div className="text-center py-20 glass rounded-[2rem] space-y-4">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-bold">No published stories</h3>
              <p className="text-muted-foreground">Your published stories will appear here.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="drafts" className="space-y-6">
          {draftPosts.length > 0 ? (
            draftPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <PostCard post={post} />
              </motion.div>
            ))
          ) : (
            <div className="text-center py-20 glass rounded-[2rem] space-y-4">
              <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8 text-yellow-500" />
              </div>
              <h3 className="text-xl font-bold">No drafts</h3>
              <p className="text-muted-foreground">Unfinished stories are saved as drafts.</p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="analytics" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="glass border-none shadow-xl">
              <CardContent className="p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold">12.4k</h3>
                <p className="text-xs text-green-500 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +12% from last week
                </p>
              </CardContent>
            </Card>
            <Card className="glass border-none shadow-xl">
              <CardContent className="p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">Total Likes</p>
                  <div className="p-2 bg-red-500/10 rounded-lg">
                    <Heart className="w-4 h-4 text-red-500" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold">842</h3>
                <p className="text-xs text-green-500 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +5% from last week
                </p>
              </CardContent>
            </Card>
            <Card className="glass border-none shadow-xl">
              <CardContent className="p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">New Followers</p>
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Users className="w-4 h-4 text-purple-500" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold">128</h3>
                <p className="text-xs text-green-500 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +18% from last week
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="glass border-none shadow-xl">
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold">Growth Overview</h3>
                  <p className="text-sm text-muted-foreground">Your platform performance over the last 7 days</p>
                </div>
                <Button variant="outline" size="sm" className="rounded-xl">Last 7 Days</Button>
              </div>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={MOCK_STATS_DATA}>
                    <defs>
                      <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '12px',
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="views" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorViews)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
