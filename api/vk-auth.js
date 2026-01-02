import { supabaseAdmin } from './_supabase.js';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { vk_id, first_name, last_name, email, photo, access_token } = req.body;

    if (!vk_id || !access_token) {
      return res.status(400).json({ error: 'Missing VK data' });
    }

    // 1. Check if user exists by VK ID in profiles
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id, email')
      .eq('vk_id', String(vk_id))
      .single();

    let userId = existingProfile?.id;
    let emailToUse = email || `vk_${vk_id}@vk.placeholder.com`;

    if (!userId) {
      // 2. If not, check by email if provided
      if (email) {
        const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
        const match = existingUser.users.find(u => u.email === email);
        if (match) userId = match.id;
      }
    }

    if (!userId) {
      // 3. Create new user
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: emailToUse,
        email_confirm: true,
        user_metadata: {
          full_name: `${first_name} ${last_name}`.trim(),
          avatar_url: photo,
          vk_id: String(vk_id),
          provider: 'vk'
        },
        password: `vk_${vk_id}_${Math.random().toString(36)}` // Random secure password
      });

      if (createError) throw createError;
      userId = newUser.user.id;
    }

    // 4. Update profile with VK ID
    await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        vk_id: String(vk_id),
        email: emailToUse,
        name: `${first_name} ${last_name}`.trim(),
        avatar_url: photo,
        updated_at: new Date().toISOString()
      });

    // 5. Generate Session (Passwordless sign-in magic link or similar)
    // Since we can't easily mint a JWT without internal secret access,
    // we will return the user info and success.
    // The client SDK can't "setSession" without access_token and refresh_token.
    
    // Workaround: We can't log them in fully purely server-side for the client without password.
    // We will return a success flag. The client might need to fallback to standard auth
    // or we use magic link.
    
    return res.status(200).json({ 
      success: true,
      userId, 
      message: 'User synced. Please login with standard VK OAuth for session.' 
    });

  } catch (error) {
    console.error('VK Auth Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
