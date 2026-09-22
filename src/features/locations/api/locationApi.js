import { supabase, supabaseConfigError } from "../../../lib/supabaseClient";

const locationTable = import.meta.env.VITE_SUPABASE_TABLE || "locations";
const locationSelect = "id,created_at,name,postal_code,address,model_url,image_url,latitude,longitude";

function assertSupabaseConfigured() {
  if (supabaseConfigError || !supabase) {
    throw new Error(supabaseConfigError || "Supabase clientを初期化できませんでした。");
  }
}

function normalizeLocation(row) {
  const modelUrl = row.model_url || null;
  const imageUrl = row.image_url || null;

  return {
    id: String(row.id),
    createdAt: row.created_at,
    name: row.name || "名称未設定の地点",
    postalCode: row.postal_code || "",
    address: row.address || "住所未設定",
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    modelUrl,
    imageUrl,
    kind: modelUrl ? "home" : "destination",
    description: modelUrl ? "Scaniverseで撮影した3Dスキャン" : "Supabaseから取得した地点情報",
  };
}

function validateLocation(location) {
  return Number.isFinite(location.latitude)
    && Number.isFinite(location.longitude)
    && Boolean(location.name);
}

export async function fetchLocations() {
  assertSupabaseConfigured();
  const { data, error } = await supabase
    .from(locationTable)
    .select(locationSelect)
    .order("id", { ascending: true });

  if (error) throw new Error(`Supabaseから地点を取得できませんでした: ${error.message}`);
  return (data || []).map(normalizeLocation).filter(validateLocation);
}

export async function fetchLocationById(id) {
  assertSupabaseConfigured();
  const { data, error } = await supabase
    .from(locationTable)
    .select(locationSelect)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Supabaseから地点を取得できませんでした: ${error.message}`);
  if (!data) return null;

  const location = normalizeLocation(data);
  return validateLocation(location) ? location : null;
}
