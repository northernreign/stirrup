const SUPABASE_URL = 'https://mfinlbqfowymmklhkuhb.supabase.co';
const SUPABASE_KEY = 'sb_publishable_PcwbX1YoncwnrHobFmpAIA_L39K4XfK';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// AUTH
async function signUp(email, password, name, barnName) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  if (data.user) {
    await supabase.from('trainers').insert({
      id: data.user.id,
      name: name,
      barn_name: barnName
    });
  }
  return data;
}

async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

async function signOut() {
  await supabase.auth.signOut();
  window.location.href = 'index.html';
}

async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

async function getTrainer() {
  const user = await getUser();
  if (!user) return null;
  const { data } = await supabase.from('trainers').select('*').eq('id', user.id).single();
  return data;
}

// RIDERS
async function getRiders() {
  const user = await getUser();
  if (!user) return [];
  const { data } = await supabase.from('riders').select('*').eq('trainer_id', user.id).order('created_at', { ascending: false });
  return data || [];
}

async function addRider(rider) {
  const user = await getUser();
  if (!user) throw new Error('Not logged in');
  const { data, error } = await supabase.from('riders').insert({ ...rider, trainer_id: user.id }).select().single();
  if (error) throw error;
  return data;
}

// BOOKINGS
async function getBookings() {
  const user = await getUser();
  if (!user) return [];
  const { data } = await supabase.from('bookings').select('*').eq('trainer_id', user.id).order('created_at', { ascending: false });
  return data || [];
}

async function addBooking(booking) {
  const user = await getUser();
  if (!user) throw new Error('Not logged in');
  const { data, error } = await supabase.from('bookings').insert({ ...booking, trainer_id: user.id }).select().single();
  if (error) throw error;
  // Increment bookings_this_month
  await supabase.rpc('increment_bookings', { trainer_id: user.id });
  return data;
}

// TRAINER PROFILE
async function updateTrainer(updates) {
  const user = await getUser();
  if (!user) throw new Error('Not logged in');
  const { error } = await supabase.from('trainers').update(updates).eq('id', user.id);
  if (error) throw error;
}
