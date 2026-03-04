
-- Drop and recreate with proper URL construction
CREATE OR REPLACE FUNCTION public.notify_order_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  payload jsonb;
  supabase_url text := 'https://udgbpksijibkyydqpcio.supabase.co';
  anon_key text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkZ2Jwa3Npamlia3l5ZHFwY2lvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2NjYzMzYsImV4cCI6MjA4NTI0MjMzNn0.wvAfI_9cLtyPcHdUTgJnn-4UVtAAdgOvm6eRGWn_2kc';
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    payload := jsonb_build_object(
      'orderId', NEW.id,
      'newStatus', NEW.status
    );
    
    PERFORM net.http_post(
      url := supabase_url || '/functions/v1/send-order-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || anon_key
      ),
      body := payload
    );
  END IF;
  
  RETURN NEW;
END;
$$;
