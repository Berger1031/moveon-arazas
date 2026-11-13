// Supabase connection, read from build-time environment variables (see .env.example).
// Only the project URL and the public "anon" key belong here – never the service_role key.
// With both left empty the app runs in local mode and keeps its data in this browser only.
export const SUPABASE = {
  url: import.meta.env.VITE_SUPABASE_URL || "",
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
  // Bare usernames on the login form are completed to "<name>@<loginDomain>".
  loginDomain: import.meta.env.VITE_LOGIN_DOMAIN || "moveonkoltoztetes.hu",
};
