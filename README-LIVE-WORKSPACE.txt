UTSAVKOSH LIVE WORKSPACE - APPLY INSTRUCTIONS

WHAT THIS VERSION CHANGES
- Removes the Explore Demo route from the authentication flow.
- Restores the signed-in Supabase session and selects the latest business owned by the signed-in user's UID.
- Uses the business contact email only as contact information; business ownership is based on businesses.owner_id.
- Connects Google sign-in buttons to Supabase OAuth (Google provider setup is still required in Supabase/Google Cloud).
- Replaces the demo dashboard with live Supabase-backed screens for Customers, Enquiries, Bookings, Item Catalogue, Packages, Package Items, Booking Items, Invoices, Invoice Line Items, Payments/Expenses, Vendors, Tasks, Reports, Notifications, and Business Settings.
- Records can be created, edited, deleted, searched, refreshed, and exported as CSV. Data is scoped to the selected business_id.

APPLY TO YOUR EXISTING PROJECT
1. Keep your existing project folder as a backup.
2. Copy these files into the same paths in your project, replacing existing files:
   src/App.tsx
   src/Onboarding.tsx
   src/LiveWorkspace.tsx (new file)
3. Open supabase-live-workspace-setup.sql in Supabase SQL Editor and run the full script once.
4. Keep your existing .env.local. It must contain:
   VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
   Do not paste a service_role or secret key into a Vite app.
5. In the VS Code terminal, run:
   npm install
   npm run dev
6. Sign in with your existing account. If the account already owns businesses, the newest business opens. If it owns none, register a business.

GOOGLE SIGN-IN
Read GOOGLE_AUTH_SETUP.md. The code is wired to Supabase OAuth, but Google Cloud OAuth credentials and the Supabase Google provider must be configured before it can complete sign-in.

DATABASE / SECURITY NOTE
The SQL script adds missing columns with IF NOT EXISTS, preserves existing rows, grants the authenticated app role access, and creates owner-scoped policies for operational tables. It intentionally leaves RLS disabled on public.businesses because that was the current project setup requested for local testing. Do not deploy publicly with businesses RLS disabled; before public deployment, replace that setting with an owner-scoped policy and test every RLS policy.

TEST CHECKLIST
- Sign in with email/password and verify an existing business opens.
- Add a customer, refresh the page, and confirm the record remains.
- Add an item catalogue entry, edit it, and delete it.
- Add an enquiry, booking, package, invoice, payment, vendor, and task.
- Confirm dashboard counts and reports change based on saved records.
- Sign out and sign in again; the newest business owned by that account should load.
- Test Google sign-in only after following GOOGLE_AUTH_SETUP.md.

The source was TypeScript-checked in the preparation environment. A production Vite build could not be run there because the uploaded node_modules archive lacked the platform-specific Rolldown native binding; run npm install in your Windows project folder before testing.

V1 compatibility and UI improvements: see README-V1-FIXES.txt and run supabase-v1-fixes.sql once.
