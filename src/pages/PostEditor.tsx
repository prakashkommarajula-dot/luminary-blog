import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Save, 
  Send, 
  Eye, 
  Image as ImageIcon, 
  Type, 
  Hash, 
  Settings, 
  Bold,
  Italic,
  List,
  Link as LinkIcon,
  Code,
  Heading1,
  Heading2,
  Quote,
  CheckCircle2,
  Clock as ClockIcon,
  Loader2,
  ArrowLeft,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc } from 'firebase/firestore';

export const PostEditor: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!id);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const readingTime = Math.ceil(wordCount / 200);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      try {
        const postDoc = await getDoc(doc(db, 'posts', id));
        if (postDoc.exists()) {
          const data = postDoc.data();
          if (data.authorId !== auth.currentUser?.uid) {
            toast.error('You are not authorized to edit this post');
            navigate('/');
            return;
          }
          setTitle(data.title || '');
          setContent(data.content || '');
          setExcerpt(data.excerpt || '');
          setCategory(data.category || '');
          setTags(data.tags || []);
          setCoverImage(data.coverImage || '');
        } else {
          toast.error('Post not found');
          navigate('/write');
        }
      } catch (error: any) {
        toast.error('Failed to fetch post');
      } finally {
        setFetching(false);
      }
    };

    fetchPost();
  }, [id, navigate]);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const insertMarkdown = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('content-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const selection = text.substring(start, end);
    const after = text.substring(end);

    const newContent = before + prefix + selection + suffix + after;
    setContent(newContent);
    setIsDirty(true);
    
    // Reset focus and selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  const handleSave = async (status: 'draft' | 'published') => {
    if (!title || !content) {
      toast.error('Title and content are required');
      return;
    }

    setLoading(true);
    try {
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      
      const postData: any = {
        title,
        content,
        excerpt,
        category,
        tags,
        coverImage,
        status,
        slug,
        updatedAt: serverTimestamp(),
      };

      if (status === 'published') {
        // Only set publishedAt if it's not already set (e.g. publishing a draft)
        // For simplicity, we'll set it if it's currently a draft or a new post
        postData.publishedAt = serverTimestamp();
      }

      if (id) {
        await updateDoc(doc(db, 'posts', id), postData);
        toast.success(status === 'published' ? 'Post updated and published!' : 'Draft updated!');
      } else {
        postData.authorId = auth.currentUser?.uid;
        postData.authorName = auth.currentUser?.displayName;
        postData.authorPhoto = auth.currentUser?.photoURL;
        postData.createdAt = serverTimestamp();
        postData.likesCount = 0;
        postData.commentsCount = 0;
        postData.views = 0;
        postData.featured = false;
        postData.trending = false;
        postData.editorPick = false;
        postData.readingTime = readingTime;
        
        await addDoc(collection(db, 'posts'), postData);
        toast.success(status === 'published' ? 'Post published!' : 'Draft saved!');
      }
      setIsDirty(false);
      setLastSaved(new Date());
      navigate('/my-blogs');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save post');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 max-w-6xl space-y-8">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <div className="flex items-center gap-3">
          {lastSaved && (
            <span className="text-xs text-muted-foreground flex items-center gap-1 mr-2">
              <CheckCircle2 className="w-3 h-3 text-green-500" /> 
              Saved at {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <Button variant="outline" onClick={() => handleSave('draft')} disabled={loading} className="rounded-xl glass">
            <Save className="w-4 h-4 mr-2" /> Save Draft
          </Button>
          <Button onClick={() => handleSave('published')} disabled={loading} className="rounded-xl">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
            Publish Post
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-xl glass overflow-hidden">
            <div className="bg-muted/50 border-b border-border p-2 flex items-center gap-1 flex-wrap">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => insertMarkdown('**', '**')} title="Bold"><Bold className="w-4 h-4" /></Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => insertMarkdown('_', '_')} title="Italic"><Italic className="w-4 h-4" /></Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => insertMarkdown('## ', '')} title="Heading 2"><Heading1 className="w-4 h-4" /></Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => insertMarkdown('### ', '')} title="Heading 3"><Heading2 className="w-4 h-4" /></Button>
              <Separator orientation="vertical" className="h-4 mx-1" />
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => insertMarkdown('> ', '')} title="Quote"><Quote className="w-4 h-4" /></Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => insertMarkdown('`', '`')} title="Code"><Code className="w-4 h-4" /></Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => insertMarkdown('[', '](url)')} title="Link"><LinkIcon className="w-4 h-4" /></Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => insertMarkdown('- ', '')} title="List"><List className="w-4 h-4" /></Button>
              <div className="ml-auto flex items-center gap-4 px-2 text-xs text-muted-foreground font-medium">
                <span className="flex items-center gap-1"><Type className="w-3 h-3" /> {wordCount} words</span>
                <span className="flex items-center gap-1"><ClockIcon className="w-3 h-3" /> {readingTime} min read</span>
              </div>
            </div>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2">
                <Input 
                  id="title" 
                  placeholder="Enter a catchy title..." 
                  className="text-3xl md:text-4xl font-display font-bold h-auto py-4 bg-transparent border-none focus-visible:ring-0 px-0 placeholder:opacity-50"
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); setIsDirty(true); }}
                />
              </div>

              <Tabs defaultValue="edit" className="w-full">
                <div className="flex items-center justify-between mb-4">
                  <TabsList className="glass">
                    <TabsTrigger value="edit" className="gap-2"><Type className="w-4 h-4" /> Write</TabsTrigger>
                    <TabsTrigger value="preview" className="gap-2"><Eye className="w-4 h-4" /> Preview</TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="edit">
                  <Textarea 
                    id="content-textarea"
                    placeholder="Start writing your story in Markdown..." 
                    className="min-h-[500px] text-lg leading-relaxed bg-transparent border-none focus-visible:ring-0 p-0 resize-none"
                    value={content}
                    onChange={(e) => { setContent(e.target.value); setIsDirty(true); }}
                  />
                </TabsContent>
                <TabsContent value="preview" className="min-h-[500px] prose prose-lg dark:prose-invert max-w-none pt-4">
                  {content ? <ReactMarkdown>{content}</ReactMarkdown> : <p className="text-muted-foreground italic">Nothing to preview yet...</p>}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-xl glass">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Cover Image URL</Label>
                <Input 
                  placeholder="https://example.com/image.jpg" 
                  className="bg-background/50 rounded-xl"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                />
                {coverImage && (
                  <div className="mt-2 aspect-video rounded-lg overflow-hidden border border-border">
                    <img src={coverImage} alt="Cover preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Excerpt</Label>
                <Textarea 
                  placeholder="Brief summary of your post..." 
                  className="bg-background/50 rounded-xl h-24 resize-none"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Input 
                  placeholder="e.g. Technology" 
                  className="bg-background/50 rounded-xl"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Hash className="w-4 h-4" /> Tags</Label>
                <Input 
                  placeholder="Press Enter to add tags" 
                  className="bg-background/50 rounded-xl"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                />
                <div className="flex flex-wrap gap-2 pt-2">
                  {tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="gap-1 pl-3 pr-2 py-1 rounded-full">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="hover:text-red-500 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl glass">
            <CardContent className="p-6 space-y-4">
              <h4 className="font-bold flex items-center gap-2"><Settings className="w-4 h-4" /> Publishing Settings</h4>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Allow comments</span>
                <div className="w-10 h-5 bg-primary rounded-full relative">
                  <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Show in trending</span>
                <div className="w-10 h-5 bg-primary rounded-full relative">
                  <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
