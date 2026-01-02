import { supabaseAdmin } from './_supabase.js';
import fetch from 'node-fetch'; // Ensure fetch is available in Node environment

export default async function handler(req, res) {
  // CORS with credentials support
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

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

    // 0. VERIFY TOKEN WITH VK (Essential Security)
    // We verify that the access_token belongs to the user claiming it
    const vkVerifyUrl = `https://api.vk.com/method/users.get?access_token=${access_token}&v=5.131`;
    const vkResponse = await fetch(vkVerifyUrl);
    const vkData = await vkResponse.json();

    if (!vkData.response || !vkData.response[0] || String(vkData.response[0].id) !== String(vk_id)) {
      console.warn('VK Token Verification Failed:', vkData);
      return res.status(401).json({ error: 'Invalid VK Access Token' });
    }

    // 1. Check if user exists by VK ID in profiles
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id, email')
      .eq('vk_id', String(vk_id))
      .single();

    let userId = existingProfile?.id;
    // Fallback email if VK didn't provide one
    const emailToUse = email || `vk_${vk_id}@vk.placeholder.com`;

    if (!userId) {
      // 2. If not found by VK ID, check by email if we have a real email
      if (email && email.includes('@')) {
        // Search in Auth users (requires Admin privileges)
        const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
        const match = users.find(u => u.email === email);
        if (match) userId = match.id;
      }
    }

    if (!userId) {
      // 3. Create new user in Supabase Auth
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: emailToUse,
        email_confirm: true, // Auto-confirm
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

    // 4. Upsert Profile (Ensure profile exists and is linked to VK)
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

    // 5. Generate Magic Link for Session
    // We want the user to be logged in on the client.
    // Since we have the userId and email, we can generate a magic link.
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: emailToUse,
    });

    if (linkError) {
       console.error('Magic Link Gen Error:', linkError);
       // Fallback: Return success without session link
       return res.status(200).json({ success: true, userId, message: 'User synced (Session link generation failed)' });
    }

    return res.status(200).json({ 
      success: true,
      userId, 
      redirectUrl: linkData.properties.action_link 
    });

  } catch (error) {
    console.error('VK Auth Handler Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
