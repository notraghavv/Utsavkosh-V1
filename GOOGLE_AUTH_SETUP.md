GOOGLE AUTHENTICATION SETUP FOR UTSAVKOSH

The app code now calls Supabase signInWithOAuth({ provider: "google" }). To complete the flow, configure the provider once:

1. In Supabase Dashboard, open Authentication > Sign In / Providers > Google and enable Google.
2. Create or select a Google Cloud project at https://console.cloud.google.com/.
3. Configure the OAuth consent screen with the app name and developer contact information.
4. Create an OAuth Client ID of type Web application.
5. In Google Cloud's Authorized redirect URIs, add the exact Callback URL shown in the Supabase Google provider settings. It normally resembles:
   https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
6. Copy the Google Client ID and Client Secret into the Supabase Google provider settings and save.
7. In Supabase Authentication > URL Configuration, set Site URL to your local app URL while testing, for example:
   http://localhost:8443
8. Add these Redirect URLs to the allowed list:
   http://localhost:8443
   http://localhost:8443/**
   Add your real deployed website URL later before deployment.
9. Restart the local dev server and test Continue with Google.

Important: The Google Client Secret belongs only in Supabase provider settings, never in .env.local or frontend code. The app's VITE_SUPABASE_ANON_KEY must be a publishable/anon key, never a service_role/secret key.
