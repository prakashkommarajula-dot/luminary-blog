import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  BarChart3, 
  Settings, 
  Plus, 
  Search, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Heart,
  MessageSquare
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '@/lib/firebase-utils';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const DATA = [
  { name: 'Mon', views: 4000, subs: 2400 },
  { name: 'Tue', views: 3000, subs: 1398 },
  { name: 'Wed', views: 2000, subs: 9800 },
  { name: 'Thu', views: 2780, subs: 3908 },
  { name: 'Fri', views: 1890, subs: 4800 },
  { name: 'Sat', views: 2390, subs: 3800 },
  { name: 'Sun', views: 3490, subs: 4300 },
];

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState([
    { title: 'Total Views', value: '...', change: '+0%', trend: 'up', icon: Eye },
    { title: 'Total Posts', value: '...', change: '+0%', trend: 'up', icon: FileText },
    { title: 'Total Likes', value: '...', change: '+0%', trend: 'up', icon: Heart },
    { title: 'Total Comments', value: '...', change: '+0%', trend: 'up', icon: MessageSquare },
  ]);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Check if user is admin in Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          const userData = userDoc.data();
          const isUserAdmin = userData?.role === 'admin' || user.email === 'prakashkommarajula@gmail.com';
          setIsAdmin(isUserAdmin);
          
          if (isUserAdmin) {
            fetchStats();
            const unsubRecent = startRecentPostsListener();
            return () => unsubRecent();
          } else {
            setLoading(false);
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
          setLoading(false);
        }
      } else {
        setIsAdmin(false);
        setLoading(false);
      }
    });

    const fetchStats = async () => {
      try {
        const postsSnap = await getDocs(collection(db, 'posts'));
        const usersSnap = await getDocs(collection(db, 'users'));
        
        const totalPosts = postsSnap.size;
        const totalUsers = usersSnap.size;
        
        let totalViews = 0;
        let totalLikes = 0;
        let totalComments = 0;
        const categories: Record<string, number> = {};
        
        postsSnap.docs.forEach(doc => {
          const data = doc.data();
          totalViews += (data.views || 0);
          totalLikes += (data.likesCount || 0);
          totalComments += (data.commentsCount || 0);
          if (data.category) {
            categories[data.category] = (categories[data.category] || 0) + 1;
          }
        });

        const catData = Object.entries(categories)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5);
        setCategoryData(catData);

        setStats([
          { title: 'Total Views', value: totalViews >= 1000 ? (totalViews / 1000).toFixed(1) + 'k' : totalViews.toString(), change: '+12.5%', trend: 'up', icon: Eye },
          { title: 'Total Posts', value: totalPosts.toString(), change: '+3', trend: 'up', icon: FileText },
          { title: 'Total Likes', value: totalLikes.toLocaleString(), change: '+8.2%', trend: 'up', icon: Heart },
          { title: 'Total Comments', value: totalComments.toLocaleString(), change: '+15.4%', trend: 'up', icon: MessageSquare },
        ]);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'stats');
      }
    };

    const startRecentPostsListener = () => {
      const recentPostsQuery = query(
        collection(db, 'posts'),
        orderBy('createdAt', 'desc'),
        limit(5)
      );

      return onSnapshot(recentPostsQuery, (snapshot) => {
        const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRecentPosts(posts);
        setLoading(false);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'posts');
      });
    };

    return () => unsubscribeAuth();
  }, []);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="container mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-3xl font-bold">Access Denied</h2>
        <p className="text-muted-foreground">You do not have permission to view this page.</p>
        <Button asChild><Link to="/">Go Home</Link></Button>
      </div>
    );
  }
  return (
    <div className="container mx-auto px-4 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-display font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, here's what's happening today.</p>
        </div>
        <Button className="rounded-xl gap-2 h-12 px-6" asChild>
          <Link to="/admin/posts/new"><Plus className="w-5 h-5" /> Create New Post</Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-none shadow-lg glass">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-primary/5 rounded-lg">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className={`flex items-center text-xs font-medium ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                    {stat.change}
                    {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3 ml-1" /> : <ArrowDownRight className="w-3 h-3 ml-1" />}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Analytics Chart */}
          <Card className="lg:col-span-2 border-none shadow-lg glass">
            <CardHeader>
              <CardTitle>Platform Growth</CardTitle>
              <CardDescription>Views and engagement over the last 7 days.</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px] pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={DATA}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', borderRadius: '12px' }}
                    itemStyle={{ color: 'var(--primary)' }}
                  />
                  <Area type="monotone" dataKey="views" stroke="var(--primary)" fillOpacity={1} fill="url(#colorViews)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Popular Categories */}
          <Card className="border-none shadow-lg glass">
            <CardHeader>
              <CardTitle>Popular Categories</CardTitle>
              <CardDescription>Distribution of posts by category.</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px] pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} width={100} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', borderRadius: '12px' }}
                  />
                  <Bar dataKey="value" fill="var(--primary)" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

      {/* Posts Table */}
      <Card className="border-none shadow-lg glass overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Manage Posts</CardTitle>
            <CardDescription>A list of all your blog posts and their current status.</CardDescription>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search posts..." className="pl-10 rounded-xl bg-background/50 border-none" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-y border-border bg-muted/30">
                  <th className="px-6 py-4 text-sm font-semibold">Post Title</th>
                  <th className="px-6 py-4 text-sm font-semibold">Status</th>
                  <th className="px-6 py-4 text-sm font-semibold">Views</th>
                  <th className="px-6 py-4 text-sm font-semibold">Date</th>
                  <th className="px-6 py-4 text-sm font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                    </td>
                  </tr>
                ) : recentPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium line-clamp-1">{post.title}</p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={post.status === 'published' ? 'default' : post.status === 'draft' ? 'secondary' : 'outline'}>
                        {post.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{post.views}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{formatDate(post.publishedAt)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-red-500 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
