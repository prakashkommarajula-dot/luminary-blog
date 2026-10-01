import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { User, MessageSquare, BookOpen, Star, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '@/lib/firebase-utils';

interface Author {
  uid: string;
  displayName: string;
  bio: string;
  photoURL: string;
  followersCount: number;
  role: string;
}

export const Authors: React.FC = () => {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'users'),
      where('role', '==', 'author')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedAuthors = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as Author));
      setAuthors(fetchedAuthors);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    });

    return () => unsubscribe();
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };
  return (
    <div className="container mx-auto px-4 py-12 space-y-12">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight">Meet our Authors</h1>
        <p className="text-muted-foreground text-lg">
          The brilliant minds behind the stories that inspire and inform our global community.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="h-80 animate-pulse bg-muted" />
          ))
        ) : (
          authors.map((author, index) => (
            <motion.div
              key={author.uid}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="group h-full flex flex-col items-center text-center p-8 glass hover:-translate-y-2 transition-all duration-500">
                <Avatar className="w-24 h-24 mb-6 ring-4 ring-primary/5 group-hover:ring-primary/20 transition-all">
                  <AvatarImage src={author.photoURL} alt={author.displayName} />
                  <AvatarFallback>{author.displayName.charAt(0)}</AvatarFallback>
                </Avatar>
                
                <CardContent className="p-0 space-y-4 flex-1 flex flex-col">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold">{author.displayName}</h3>
                    <p className="text-sm text-primary font-medium">{author.role}</p>
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
                    {author.bio}
                  </p>
  
                  <div className="grid grid-cols-2 gap-4 py-4 border-y border-border/50">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Fans</p>
                      <p className="font-bold">{formatNumber(author.followersCount)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Rank</p>
                      <p className="font-bold flex items-center justify-center gap-0.5">4.9 <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /></p>
                    </div>
                  </div>
  
                  <Button variant="outline" className="w-full rounded-full mt-4 transition-colors [@media(hover:hover)]:group-hover:bg-primary [@media(hover:hover)]:group-hover:text-primary-foreground" asChild>
                    <Link to={`/profile/${author.uid}`}>View Profile</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
