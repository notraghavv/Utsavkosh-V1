UTSAVKOSH — BRAND, INVOICE PDF, STARTER ITEMS AND PACKAGES

Changes in this update
- Browser tab title is now Utsavkosh and the existing Utsavkosh favicon is linked.
- Sidebar brand/business name hierarchy is bolder and easier to scan.
- Invoice rows now have a Download PDF action. The generated PDF includes business details,
  invoice status/dates, customer and event information, invoice lines when present, totals,
  paid amount and balance due.
- Item Catalogue has an explicit “Add 20 starter décor items” action. It inserts only item
  names that do not already exist for this business. Prices are suggested starter rates, not
  market-verified prices; review them before quoting customers.
- Packages has an explicit “Add 5 starter packages” action. It inserts only missing package
  names and links package lines to catalogue items that already exist. Add the starter catalogue
  first for the fullest package contents.
- No sample records are inserted automatically on app load; the user chooses to add them.

Apply
1. Keep a backup of your current project.
2. Replace src/LiveWorkspace.tsx and index.html with these versions (or use the full project ZIP).
3. Keep your own .env.local unchanged; it is not included in the ZIP.
4. Run npm install, then npm run dev.
5. Open Item Catalogue and click “Add 20 starter décor items”. Check suggested rates and adjust.
6. Open Packages and click “Add 5 starter packages”. Review package prices and included items.
7. Open Quotations & Invoices and click the download icon in an invoice row.

PDF notes
- The invoice PDF is generated in the browser and downloads directly, without an added package.
- To keep it portable without a PDF library, the PDF uses a standard built-in font and printable
  ASCII text. Non-ASCII characters (including some Hindi/rupee glyphs) are omitted in the PDF text;
  amounts are therefore written as INR. Review the exported invoice before sending it to a customer.
- A PDF can only show line items recorded in invoice_items. The app does not automatically create
  invoice line items from booking items unless you add them through the invoice line items module.
