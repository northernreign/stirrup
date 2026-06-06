const SUPABASE_URL = 'https://mfinlbqfowymmklhkuhb.supabase.co';
const SUPABASE_KEY = 'sb_publishable_PcwbX1YoncwnrHobFmpAIA_L39K4XfK';

let supabase;

function initSupabase() {
  if (!supabase) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  }
  return supabase;
}

async function signUp(email, password, name, barnName) {
  const client = initSupabase();
  const { data, error } = await client.auth.signUp({ email, password });
  if (error) throw error;
  if (data.user) {
    await client.from('trainers').insert({
      id: data.user.id,
      name: name,
      barn_name: barnName
    });
  }
  return data;
}

async function signIn(email, password) {
  const client = initSupabase();
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

async function signOut() {
  const client = initSupabase();
  await client.auth.signOut();
  window.location.href = 'index.html';
}

async function getUser() {
  const client = initSupabase();
  const { data: { user } } = await client.auth.getUser();
  return user;
}

async function getTrainer() {
  const client = initSupabase();
  const user = await getUser();
  if (!user) return null;
  const { data } = await client.from('trainers').select('*').eq('id', user.id).single();
  return data;
}

async function getRiders() {
  const client = initSupabase();
  const user = await getUser();
  if (!user) return [];
  const { data } = await client.from('riders').select('*').eq('trainer_id', user.id).order('created_at', { ascending: false });
  return data || [];
}

async function addRider(rider) {
  const client = initSupabase();
  const user = await getUser();
  if (!user) throw new Error('Not logged in');
  const { data, error } = await client.from('riders').insert({ ...rider, trainer_id: user.id }).select().single();
  if (error) throw error;
  return data;
}

async function getBookings() {
  const client = initSupabase();
  const user = await getUser();
  if (!user) return [];
  const { data } = await client.from('bookings').select('*').eq('trainer_id', user.id).order('created_at', { ascending: false });
  return data || [];
}

async function addBooking(booking) {
  const client = initSupabase();
  const user = await getUser();
  if (!user) throw new Error('Not logged in');
  const { data, error } = await client.from('bookings').insert({ ...booking, trainer_id: user.id }).select().single();
  if (error) throw error;
  return data;
}

async function updateTrainer(updates) {
  const client = initSupabase();
  const user = await getUser();
  if (!user) throw new Error('Not logged in');
  const { error } = await client.from('trainers').update(updates).eq('id', user.id);
  if (error) throw error;
}
