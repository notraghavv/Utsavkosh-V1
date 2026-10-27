UTSAVKOSH V1 - FIX PACKAGE

What changed
- Booking form now requires an Event name and sends it to bookings.event_name.
- Booking references are generated automatically when left blank.
- Package Items now uses the existing required package_items.item_id field.
- Booking Items now requires a catalogue item and sends item_id plus the newer alias.
- Added English/Hindi toggle; choice is saved in this browser.
- Added a premium Utsavkosh SVG wordmark and matching favicon.
- Added responsive styling for the live workspace.
- Added optional popular item suggestions in Item Catalogue. Choosing one only pre-fills the form; it does not save until the user submits.

Apply
1. Keep your existing .env.local file; do not upload or share it.
2. In Supabase SQL Editor, run supabase-v1-fixes.sql once.
3. In the project folder, run: npm install
4. Run: npm run dev
5. Test: create a booking with an event name; create a package; then add a package item selecting a catalogue item.
6. Test the EN / हिंदी toggle and quick-add catalogue suggestions.

Notes
- No demo/sample records are inserted by these changes.
- The logo is an original vector wordmark at public/utsavkosh-logo.svg.
- Source syntax was checked. A complete build and live Supabase insert could not be run in this environment because dependency installation timed out; verify locally before deployment.
