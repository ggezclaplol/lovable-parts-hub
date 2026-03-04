
-- Profiles table for user data
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text NOT NULL,
  avatar_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Community builds table
CREATE TABLE public.community_builds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  use_case text NOT NULL DEFAULT 'gaming',
  parts jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_price numeric DEFAULT 0,
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.community_builds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view builds" ON public.community_builds FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create builds" ON public.community_builds FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own builds" ON public.community_builds FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own builds" ON public.community_builds FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Build likes
CREATE TABLE public.build_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  build_id uuid REFERENCES public.community_builds(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (build_id, user_id)
);

ALTER TABLE public.build_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view likes" ON public.build_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like" ON public.build_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike" ON public.build_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Build comments
CREATE TABLE public.build_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  build_id uuid REFERENCES public.community_builds(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.build_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments" ON public.build_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can comment" ON public.build_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON public.build_comments FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON public.build_comments FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Trigger for likes count
CREATE OR REPLACE FUNCTION public.update_build_likes_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_builds SET likes_count = likes_count + 1 WHERE id = NEW.build_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_builds SET likes_count = likes_count - 1 WHERE id = OLD.build_id;
    RETURN OLD;
  END IF;
END;
$$;

CREATE TRIGGER on_build_like_change
  AFTER INSERT OR DELETE ON public.build_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_build_likes_count();

-- Trigger for comments count
CREATE OR REPLACE FUNCTION public.update_build_comments_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_builds SET comments_count = comments_count + 1 WHERE id = NEW.build_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_builds SET comments_count = comments_count - 1 WHERE id = OLD.build_id;
    RETURN OLD;
  END IF;
END;
$$;

CREATE TRIGGER on_build_comment_change
  AFTER INSERT OR DELETE ON public.build_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_build_comments_count();
