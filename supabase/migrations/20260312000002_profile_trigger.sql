-- =============================================================================
-- FlowWidgets — Profile auto-creation trigger
-- Migration: 20260312000002_profile_trigger.sql
--
-- Creates a profiles row automatically whenever a new auth.users row is
-- inserted. This covers all sign-up methods (email/password, OAuth, etc.)
-- without requiring the server action to do it manually.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
