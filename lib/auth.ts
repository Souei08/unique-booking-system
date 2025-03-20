import { createClient } from "../supabase/server";

export const signUpWithEmail = async (email: string, password: string) => {
  const supabase = await createClient();

  return await supabase.auth.signUp({ email: email, password: password });
};

export const signInWithEmail = async (email: string, password: string) => {
  const supabase = await createClient();
  return await supabase.auth.signInWithPassword({ email, password });
};

export const signInWithGoogle = async () => {
  const supabase = await createClient();
  return await supabase.auth.signInWithOAuth({
    provider: "google",
  });
};

export const signOut = async () => {
  const supabase = await createClient();

  return await supabase.auth.signOut();
};
