import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BuildDetailDialog } from '@/components/community/BuildDetailDialog';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import {
  useCommunityBuilds,
  useCreateBuild,
  useUpdateBuild,
  useDeleteBuild,
  useToggleLike,
  useBuildComments,
  useAddComment,
  USE_CASES,
  type BuildPart,
  type CommunityBuild,
} from '@/hooks/useCommunityBuilds';
import {
  Heart,
  MessageCircle,
  Plus,
  Trash2,
  Send,
  User,
  Cpu,
  Loader2,
  Sparkles,
  Filter,
  ImagePlus,
  X,
  Pencil,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

function BuildCard({ build, onEdit, onViewDetail }: { build: CommunityBuild; onEdit?: (build: CommunityBuild) => void; onViewDetail?: (build: CommunityBuild) => void }) {
  const { isAuthenticated, user } = useAuth();
  const toggleLike = useToggleLike();
  const deleteBuild = useDeleteBuild();
  const [showComments, setShowComments] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const useCaseInfo = USE_CASES.find((u) => u.value === build.use_case) || USE_CASES[USE_CASES.length - 1];
  const isOwner = user?.id === build.user_id;

  return (
    <div className="bento-card overflow-hidden flex flex-col animate-fade-in cursor-pointer hover:border-primary/30 transition-colors" onClick={() => onViewDetail?.(build)}>
      {/* Build Image */}
      {build.image_url && (
        <div className="w-full h-48 overflow-hidden">
          <img
            src={build.image_url}
            alt={build.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}
      <div className="p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 rounded-full bg-primary/10 shrink-0">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{build.profile?.username || 'Anonymous'}</p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(build.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border shrink-0 ${useCaseInfo.color}`}>
          {useCaseInfo.label}
        </span>
      </div>

      {/* Content */}
      <div>
        <h3 className="font-display font-bold text-lg mb-1">{build.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{build.description}</p>
      </div>

      {/* Parts */}
      {build.parts.length > 0 && (
        <div className="space-y-1.5">
          {(expanded ? build.parts : build.parts.slice(0, 3)).map((part, i) => (
            <div key={i} className="flex items-center justify-between text-sm px-3 py-1.5 rounded-lg bg-secondary/50">
              <span className="truncate">
                <span className="text-muted-foreground mr-2">{part.category}</span>
                {part.name}
              </span>
              <span className="font-mono text-xs text-primary shrink-0 ml-2">
                ₨{part.price.toLocaleString()}
              </span>
            </div>
          ))}
          {build.parts.length > 3 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-primary hover:underline pl-3 cursor-pointer"
            >
              {expanded ? 'Show less' : `+${build.parts.length - 3} more parts`}
            </button>
          )}
        </div>
      )}

      {/* Total */}
      {build.total_price > 0 && (
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="font-display font-bold gradient-text">₨{build.total_price.toLocaleString()}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={() => {
            if (!isAuthenticated) return;
            toggleLike.mutate({ buildId: build.id, isLiked: build.user_has_liked });
          }}
          className={`flex items-center gap-1.5 text-sm transition-colors ${
            build.user_has_liked ? 'text-red-400' : 'text-muted-foreground hover:text-red-400'
          } ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <Heart className={`h-4 w-4 ${build.user_has_liked ? 'fill-current' : ''}`} />
          {build.likes_count}
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <MessageCircle className="h-4 w-4" />
          {build.comments_count}
        </button>
        {isOwner && onEdit && (
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => onEdit(build)}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </button>
            {confirmDelete ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => deleteBuild.mutate(build.id)}
                  className="text-xs px-2 py-1 rounded bg-destructive/15 text-destructive hover:bg-destructive/25 transition-colors"
                  disabled={deleteBuild.isPending}
                >
                  {deleteBuild.isPending ? 'Deleting...' : 'Confirm'}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="text-xs px-2 py-1 rounded text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Comments Section */}
      {showComments && <CommentsSection buildId={build.id} />}
      </div>
    </div>
  );
}

function CommentsSection({ buildId }: { buildId: string }) {
  const { isAuthenticated } = useAuth();
  const { data: comments, isLoading } = useBuildComments(buildId);
  const addComment = useAddComment();
  const [newComment, setNewComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    addComment.mutate({ buildId, content: newComment.trim() });
    setNewComment('');
  };

  return (
    <div className="border-t border-border/50 pt-3 space-y-3">
      {isLoading ? (
        <div className="flex justify-center py-2">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {comments?.map((comment) => (
            <div key={comment.id} className="flex gap-2">
              <div className="p-1.5 rounded-full bg-secondary shrink-0 h-fit">
                <User className="h-3 w-3 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">{comment.profile?.username || 'User'}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{comment.content}</p>
              </div>
            </div>
          ))}
          {comments?.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-1">No comments yet</p>
          )}
        </>
      )}

      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="text-sm h-9"
            maxLength={500}
          />
          <Button type="submit" size="sm" variant="ghost" disabled={!newComment.trim() || addComment.isPending}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      ) : (
        <p className="text-xs text-muted-foreground text-center">
          <Link to="/login" className="text-primary hover:underline">Sign in</Link> to comment
        </p>
      )}
    </div>
  );
}

function BuildFormDialog({
  open,
  onOpenChange,
  editBuild,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editBuild?: CommunityBuild | null;
}) {
  const isEdit = !!editBuild;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [useCase, setUseCase] = useState('gaming');
  const [parts, setParts] = useState<BuildPart[]>([{ name: '', category: 'CPU', price: 0 }]);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const createBuild = useCreateBuild();
  const updateBuild = useUpdateBuild();

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setUseCase('gaming');
    setParts([{ name: '', category: 'CPU', price: 0 }]);
    setImage(null);
    setImagePreview(null);
    setRemoveExistingImage(false);
  };

  // Populate form when editing
  useEffect(() => {
    if (editBuild && open) {
      setTitle(editBuild.title);
      setDescription(editBuild.description);
      setUseCase(editBuild.use_case);
      setParts(editBuild.parts.length > 0 ? [...editBuild.parts] : [{ name: '', category: 'CPU', price: 0 }]);
      setImagePreview(editBuild.image_url || null);
      setImage(null);
      setRemoveExistingImage(false);
    } else if (!open) {
      resetForm();
    }
  }, [editBuild, open]);

  const addPart = () => setParts([...parts, { name: '', category: 'GPU', price: 0 }]);
  const removePart = (index: number) => setParts(parts.filter((_, i) => i !== index));
  const updatePart = (index: number, field: keyof BuildPart, value: string | number) => {
    const updated = [...parts];
    (updated[index] as any)[field] = value;
    setParts(updated);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return;
      setImage(file);
      setRemoveExistingImage(false);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImage(null);
    if (imagePreview && !editBuild?.image_url) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    if (editBuild?.image_url) setRemoveExistingImage(true);
  };


  const totalPrice = parts.reduce((sum, p) => sum + (Number(p.price) || 0), 0);
  const isPending = createBuild.isPending || updateBuild.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validParts = parts.filter((p) => p.name.trim());

    if (isEdit && editBuild) {
      updateBuild.mutate(
        {
          id: editBuild.id,
          title,
          description,
          use_case: useCase,
          parts: validParts,
          total_price: totalPrice,
          image: image || undefined,
          existing_image_url: editBuild.image_url,
          remove_image: removeExistingImage,
        },
        {
          onSuccess: () => {
            onOpenChange(false);
            resetForm();
          },
        }
      );
    } else {
      createBuild.mutate(
        {
          title,
          description,
          use_case: useCase,
          parts: validParts,
          total_price: totalPrice,
          image: image || undefined,
        },
        {
          onSuccess: () => {
            onOpenChange(false);
            resetForm();
          },
        }
      );
    }
  };

  const categories = ['CPU', 'GPU', 'RAM', 'Motherboard', 'Storage', 'PSU', 'Case', 'Cooling', 'Other'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {isEdit ? 'Edit Your Build' : 'Share Your PC Build'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Build Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Budget Gaming Beast"
                required
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label>Use Case</Label>
              <Select value={useCase} onValueChange={setUseCase}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {USE_CASES.map((uc) => (
                    <SelectItem key={uc.value} value={uc.value}>{uc.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us about your build — what it's for, your experience, benchmarks, etc."
              required
              maxLength={2000}
              rows={3}
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Build Photo (optional)</Label>
            {imagePreview ? (
              <div className="relative rounded-lg overflow-hidden border border-border">
                <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1 rounded-full bg-background/80 hover:bg-background transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-32 rounded-lg border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors bg-secondary/30">
                <ImagePlus className="h-6 w-6 text-muted-foreground mb-1" />
                <span className="text-sm text-muted-foreground">Click to upload (max 5MB)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Parts List</Label>
              <Button type="button" variant="outline" size="sm" onClick={addPart} className="gap-1">
                <Plus className="h-3 w-3" /> Add Part
              </Button>
            </div>
            {parts.map((part, i) => (
              <div key={i} className="flex gap-2 items-start">
                <Select
                  value={part.category}
                  onValueChange={(v) => updatePart(i, 'category', v)}
                >
                  <SelectTrigger className="w-[130px] shrink-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={part.name}
                  onChange={(e) => updatePart(i, 'name', e.target.value)}
                  placeholder="Component name"
                  className="flex-1"
                  maxLength={100}
                />
                <Input
                  type="number"
                  value={part.price || ''}
                  onChange={(e) => updatePart(i, 'price', Number(e.target.value))}
                  placeholder="Price"
                  className="w-24 shrink-0"
                  min={0}
                />
                {parts.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => removePart(i)} className="shrink-0">
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                )}
              </div>
            ))}
            {totalPrice > 0 && (
              <p className="text-sm text-right font-mono">
                Total: <span className="text-primary font-bold">₨{totalPrice.toLocaleString()}</span>
              </p>
            )}
          </div>

          <Button type="submit" variant="glow" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> {isEdit ? 'Updating...' : 'Sharing...'}
              </>
            ) : (
              isEdit ? 'Update Build' : 'Share Build'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function CommunityBuilds() {
  const [useCaseFilter, setUseCaseFilter] = useState('all');
  const { data: builds, isLoading } = useCommunityBuilds(useCaseFilter);
  const { isAuthenticated } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBuild, setEditingBuild] = useState<CommunityBuild | null>(null);
  const [detailBuild, setDetailBuild] = useState<CommunityBuild | null>(null);

  const handleEdit = (build: CommunityBuild) => {
    setEditingBuild(build);
    setDialogOpen(true);
  };

  const handleDialogChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) setEditingBuild(null);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 lg:py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 neon-border text-primary text-xs font-mono uppercase tracking-wider mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              Community
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold">
              Community <span className="gradient-text">Builds</span>
            </h1>
            <p className="text-muted-foreground mt-1">Browse and share PC builds with the community</p>
          </div>
          {isAuthenticated ? (
            <>
              <Button variant="glow" className="gap-2" onClick={() => { setEditingBuild(null); setDialogOpen(true); }}>
                <Plus className="h-4 w-4" />
                Share Your Build
              </Button>
              <BuildFormDialog open={dialogOpen} onOpenChange={handleDialogChange} editBuild={editingBuild} />
            </>
          ) : (
            <Link to="/login">
              <Button variant="glow" className="gap-2">
                <Plus className="h-4 w-4" />
                Sign in to Share
              </Button>
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          <button
            onClick={() => setUseCaseFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors shrink-0 ${
              useCaseFilter === 'all'
                ? 'bg-primary/15 text-primary border-primary/30'
                : 'bg-secondary/50 text-muted-foreground border-border hover:text-foreground'
            }`}
          >
            All
          </button>
          {USE_CASES.map((uc) => (
            <button
              key={uc.value}
              onClick={() => setUseCaseFilter(uc.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors shrink-0 ${
                useCaseFilter === uc.value ? uc.color : 'bg-secondary/50 text-muted-foreground border-border hover:text-foreground'
              }`}
            >
              {uc.label}
            </button>
          ))}
        </div>

        {/* Builds Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bento-card p-6 space-y-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-secondary" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3 bg-secondary rounded w-1/3" />
                    <div className="h-2 bg-secondary rounded w-1/4" />
                  </div>
                </div>
                <div className="h-5 bg-secondary rounded w-3/4" />
                <div className="h-3 bg-secondary rounded w-full" />
                <div className="space-y-1.5">
                  <div className="h-8 bg-secondary rounded" />
                  <div className="h-8 bg-secondary rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : builds?.length === 0 ? (
          <div className="bento-card p-12 text-center">
            <Cpu className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display font-semibold text-lg mb-1">No builds yet</h3>
            <p className="text-sm text-muted-foreground">Be the first to share your build!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {builds?.map((build) => (
              <BuildCard key={build.id} build={build} onEdit={handleEdit} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
