import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 space-y-8">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 15 }}
        className="relative"
      >
        <h1 className="text-[12rem] md:text-[16rem] font-display font-black text-primary/5 leading-none">404</h1>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="p-6 bg-background rounded-full shadow-2xl border border-border">
            <Search className="w-12 h-12 text-primary" />
          </div>
        </div>
      </motion.div>

      <div className="space-y-4 max-w-md">
        <h2 className="text-3xl font-bold tracking-tight">Lost in the Luminary?</h2>
        <p className="text-muted-foreground text-lg">
          The page you're looking for seems to have vanished into the digital void. Don't worry, even the best explorers get lost sometimes.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild size="lg" className="rounded-full px-8 gap-2">
          <Link to="/"><Home className="w-4 h-4" /> Go Home</Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="rounded-full px-8 gap-2">
          <Link to="/blog"><ArrowLeft className="w-4 h-4" /> Back to Blog</Link>
        </Button>
      </div>
    </div>
  );
};
