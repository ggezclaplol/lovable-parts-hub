
-- Add FK from community_builds to profiles for PostgREST join
ALTER TABLE public.community_builds
  ADD CONSTRAINT community_builds_user_id_profiles_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add FK from build_comments to profiles for PostgREST join
ALTER TABLE public.build_comments
  ADD CONSTRAINT build_comments_user_id_profiles_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
