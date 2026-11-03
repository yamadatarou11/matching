let client = null;
let clientInitialized = false;

function readConfig() {
  try {
    return JSON.parse(localStorage.getItem("townSupabaseConfig") || "null");
  } catch {
    return null;
  }
}

export function getClient() {
  if (clientInitialized) return client;
  clientInitialized = true;

  const config = readConfig();
  const createClient = window.supabase?.createClient;
  if (!config?.url || !config?.anonKey || typeof createClient !== "function") {
    client = null;
    return client;
  }

  client = createClient(config.url, config.anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false
    }
  });
  return client;
}

export async function getSession() {
  try {
    const supabase = getClient();
    if (!supabase) return null;
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.warn("Supabase session read failed:", error.message);
      return null;
    }
    return data?.session || null;
  } catch (error) {
    console.warn("Supabase session read failed:", error);
    return null;
  }
}

export async function getMyUserId() {
  const session = await getSession();
  return session?.user?.id || null;
}

export async function getMyProfile() {
  try {
    const supabase = getClient();
    const userId = await getMyUserId();
    if (!supabase || !userId) return null;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.warn("Supabase profile read failed:", error.message);
      return null;
    }
    return data || null;
  } catch (error) {
    console.warn("Supabase profile read failed:", error);
    return null;
  }
}
