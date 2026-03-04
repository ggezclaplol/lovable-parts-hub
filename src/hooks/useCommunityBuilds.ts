import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface CommunityBuild {
  id: string;
  user_id: string;
  title: string;
  description: string;
  use_case: string;
  parts: BuildPart[];
  total_price: number;
  likes_count: number;
  comments_count: number;
  created_at: string;
  image_url: string | null;
  profile: { username: string; avatar_url: string | null } | null;
  user_has_liked: boolean;
}

export interface BuildPart {
  name: string;
  category: string;
  price: number;
  product_id?: string;
  listing_id?: string;
  seller_name?: string;
}

export interface BuildComment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile: { username: string; avatar_url: string | null } | null;
}

export const USE_CASES = [
  { value: 'gaming', label: 'Gaming', color: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
  { value: 'editing', label: 'Video Editing', color: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  { value: 'streaming', label: 'Streaming', color: 'bg-red-500/15 text-red-400 border-red-500/30' },
  { value: 'workstation', label: 'Workstation', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  { value: 'budget', label: 'Budget', color: 'bg-green-500/15 text-green-400 border-green-500/30' },
  { value: 'rendering', label: '3D Rendering', color: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' },
  { value: 'office', label: 'Office', color: 'bg-slate-500/15 text-slate-400 border-slate-500/30' },
  { value: 'other', label: 'Other', color: 'bg-muted text-muted-foreground border-border' },
];

export function useCommunityBuilds(useCaseFilter?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['community-builds', useCaseFilter, user?.id],
    queryFn: async (): Promise<CommunityBuild[]> => {
      let query = supabase
        .from('community_builds')
        .select(`
          id,
          user_id,
          title,
          description,
          use_case,
          parts,
          total_price,
          likes_count,
          comments_count,
          created_at,
          image_url,
          profiles!community_builds_user_id_profiles_fkey (username, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (useCaseFilter && useCaseFilter !== 'all') {
        query = query.eq('use_case', useCaseFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Check which builds the current user has liked
      let likedBuildIds: string[] = [];
      if (user) {
        const { data: likes } = await supabase
          .from('build_likes')
          .select('build_id')
          .eq('user_id', user.id);
        likedBuildIds = (likes || []).map((l) => l.build_id);
      }

      return (data || []).map((b: any) => ({
        id: b.id,
        user_id: b.user_id,
        title: b.title,
        description: b.description,
        use_case: b.use_case,
        parts: (b.parts as BuildPart[]) || [],
        total_price: Number(b.total_price) || 0,
        likes_count: b.likes_count || 0,
        comments_count: b.comments_count || 0,
        created_at: b.created_at,
        image_url: b.image_url,
        profile: b.profiles,
        user_has_liked: likedBuildIds.includes(b.id),
      }));
    },
  });
}

export function useBuildComments(buildId: string) {
  return useQuery({
    queryKey: ['build-comments', buildId],
    queryFn: async (): Promise<BuildComment[]> => {
      const { data, error } = await supabase
        .from('build_comments')
        .select(`
          id,
          user_id,
          content,
          created_at,
          profiles!build_comments_user_id_profiles_fkey (username, avatar_url)
        `)
        .eq('build_id', buildId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return (data || []).map((c: any) => ({
        id: c.id,
        user_id: c.user_id,
        content: c.content,
        created_at: c.created_at,
        profile: c.profiles,
      }));
    },
    enabled: !!buildId,
  });
}

export function useCreateBuild() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (build: {
      title: string;
      description: string;
      use_case: string;
      parts: BuildPart[];
      total_price: number;
      image?: File;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let image_url: string | null = null;

      if (build.image) {
        const fileExt = build.image.name.split('.').pop();
        const filePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('build-images')
          .upload(filePath, build.image);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage
          .from('build-images')
          .getPublicUrl(filePath);
        image_url = urlData.publicUrl;
      }

      const { data, error } = await supabase
        .from('community_builds')
        .insert({
          user_id: user.id,
          title: build.title,
          description: build.description,
          use_case: build.use_case,
          parts: build.parts as any,
          total_price: build.total_price,
          image_url,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-builds'] });
      toast.success('Build shared successfully!');
    },
    onError: () => {
      toast.error('Failed to share build');
    },
  });
}

export function useUpdateBuild() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (build: {
      id: string;
      title: string;
      description: string;
      use_case: string;
      parts: BuildPart[];
      total_price: number;
      image?: File;
      existing_image_url?: string | null;
      remove_image?: boolean;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let image_url: string | null | undefined = undefined;

      if (build.remove_image) {
        image_url = null;
      } else if (build.image) {
        const fileExt = build.image.name.split('.').pop();
        const filePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('build-images')
          .upload(filePath, build.image);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage
          .from('build-images')
          .getPublicUrl(filePath);
        image_url = urlData.publicUrl;
      }

      const updateData: any = {
        title: build.title,
        description: build.description,
        use_case: build.use_case,
        parts: build.parts as any,
        total_price: build.total_price,
      };
      if (image_url !== undefined) {
        updateData.image_url = image_url;
      }

      const { data, error } = await supabase
        .from('community_builds')
        .update(updateData)
        .eq('id', build.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-builds'] });
      toast.success('Build updated successfully!');
    },
    onError: () => {
      toast.error('Failed to update build');
    },
  });
}

export function useDeleteBuild() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (buildId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('community_builds')
        .delete()
        .eq('id', buildId)
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-builds'] });
      toast.success('Build deleted');
    },
    onError: () => {
      toast.error('Failed to delete build');
    },
  });
}

export function useToggleLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ buildId, isLiked }: { buildId: string; isLiked: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (isLiked) {
        const { error } = await supabase
          .from('build_likes')
          .delete()
          .eq('build_id', buildId)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('build_likes')
          .insert({ build_id: buildId, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-builds'] });
    },
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ buildId, content }: { buildId: string; content: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('build_comments')
        .insert({ build_id: buildId, user_id: user.id, content });
      if (error) throw error;
    },
    onSuccess: (_, { buildId }) => {
      queryClient.invalidateQueries({ queryKey: ['build-comments', buildId] });
      queryClient.invalidateQueries({ queryKey: ['community-builds'] });
    },
    onError: () => {
      toast.error('Failed to post comment');
    },
  });
}
