
-- Add account details columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN phone text,
  ADD COLUMN address text,
  ADD COLUMN city text,
  ADD COLUMN postal_code text,
  ADD COLUMN payment_method text,
  ADD COLUMN card_last_four text;
