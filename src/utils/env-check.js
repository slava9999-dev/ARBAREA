export const checkEnv = () => {
  const requiredKeys = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
  ];

  const missingKeys = requiredKeys.filter(
    (key) => !import.meta.env[key]
  );

  if (missingKeys.length > 0) {
    console.warn(
      '%c⚠️ Critical Environment Variables Missing:',
      'background: #f59e0b; color: black; padding: 4px; border-radius: 4px; font-weight: bold;',
      missingKeys.join(', ')
    );
    console.warn(
      'Some features (Auth, Database) will not work correctly. Please check your .env file.'
    );
  } else {
    console.log(
      '%c✅ Environment Validated (Supabase)',
      'background: #10b981; color: white; padding: 2px 6px; border-radius: 4px;'
    );
  }
};
