import { useCallback, useEffect, useMemo, useState } from "react"
import type { CSSProperties, FormEvent } from "react"
import {
  Activity, AlertCircle, ArrowDownToLine, Building2, CalendarDays, Check,
  ChevronDown, CircleDollarSign, ClipboardList, FileText, Gift, LayoutDashboard,
  LogOut, Menu, Package, Plus, RefreshCw, Search, Settings, Trash2, Users, Download,
  Wallet, X, Pencil, Boxes, MessageSquareText, Truck,
} from "lucide-react"
import { requireSupabase } from "./lib/supabase"
import type { RegisteredBusiness } from "./Onboarding"

type Field = { key: string; label: string; type?: "text" | "email" | "tel" | "number" | "date" | "datetime-local" | "textarea" | "select"; required?: boolean; options?: string[]; relation?: { table: string; label: string } }
type ModuleConfig = { table: string; title: string; singular: string; description: string; icon: typeof LayoutDashboard; fields: Field[]; columns: string[] }
const modules: ModuleConfig[] = [
  { table: "customers", title: "Customers", singular: "Customer", description: "Maintain real customer records and contact details.", icon: Users, fields: [
    {key:"name",label:"Full name",required:true},{key:"email",label:"Email",type:"email"},{key:"phone",label:"Phone",type:"tel"},{key:"address",label:"Address",type:"textarea"},{key:"city",label:"City"},{key:"notes",label:"Notes",type:"textarea"},{key:"status",label:"Status",type:"select",options:["Active","Inactive"]}], columns:["name","phone","email","city","status"] },
  { table: "enquiries", title: "Enquiries", singular: "Enquiry", description: "Track new opportunities and follow-up dates.", icon: MessageSquareText, fields: [
    {key:"customer_id",label:"Customer",type:"select",relation:{table:"customers",label:"name"}},{key:"customer_name",label:"Customer name"},{key:"phone",label:"Phone",type:"tel"},{key:"email",label:"Email",type:"email"},{key:"event_type",label:"Event type",type:"select",options:["Wedding","Reception","Engagement","Birthday","Corporate","Other"]},{key:"event_date",label:"Event date",type:"date"},{key:"venue",label:"Venue"},{key:"budget",label:"Budget (₹)",type:"number"},{key:"status",label:"Status",type:"select",options:["New","In Follow Up","Converted","Lost"]},{key:"source",label:"Source",type:"select",options:["Referral","Instagram","Website","Phone","Walk-in","Other"]},{key:"follow_up_date",label:"Follow-up date",type:"date"},{key:"notes",label:"Requirements / notes",type:"textarea"}], columns:["customer_name","event_type","event_date","budget","status","follow_up_date"] },
  { table: "bookings", title: "Bookings & Events", singular: "Booking", description: "Create and manage confirmed event work.", icon: CalendarDays, fields: [
    {key:"booking_number",label:"Booking reference"},{key:"customer_id",label:"Customer",type:"select",relation:{table:"customers",label:"name"},required:true},{key:"enquiry_id",label:"Converted enquiry",type:"select",relation:{table:"enquiries",label:"customer_name"}},{key:"package_id",label:"Package",type:"select",relation:{table:"packages",label:"name"}},{key:"event_name",label:"Event name",required:true},{key:"event_type",label:"Event type",type:"select",options:["Wedding","Reception","Engagement","Birthday","Corporate","Other"]},{key:"event_date",label:"Event date",type:"date",required:true},{key:"venue",label:"Venue"},{key:"status",label:"Status",type:"select",options:["Planning","Confirmed","Completed","Cancelled"]},{key:"guests",label:"Guest count",type:"number"},{key:"total_amount",label:"Total amount (₹)",type:"number"},{key:"paid_amount",label:"Amount received (₹)",type:"number"},{key:"notes",label:"Notes",type:"textarea"}], columns:["booking_number","event_name","event_date","venue","status","total_amount"] },
  { table: "inventory_items", title: "Item Catalogue", singular: "Catalogue item", description: "Manage your actual décor inventory, rates and costs.", icon: Gift, fields: [
    {key:"name",label:"Item / service name",required:true},{key:"sku",label:"Item code"},{key:"category",label:"Category",type:"select",options:["Floral Decoration","Stage Decoration","Lighting","Furniture","Mandap","Fabric & Draping","Sound","Other"]},{key:"unit",label:"Unit",type:"select",options:["Per Piece","Per Set","Per Day","Per Hour","Per Square Foot","Per Event","Per Kg","Other"]},{key:"quantity",label:"Available quantity",type:"number"},{key:"price",label:"Selling price (₹)",type:"number",required:true},{key:"cost",label:"Internal cost (₹)",type:"number"},{key:"status",label:"Status",type:"select",options:["Active","Inactive"]},{key:"description",label:"Description",type:"textarea"}], columns:["name","sku","category","quantity","price","status"] },
  { table: "packages", title: "Packages", singular: "Package", description: "Create reusable event packages with prices.", icon: Package, fields: [
    {key:"name",label:"Package name",required:true},{key:"code",label:"Package code"},{key:"event_type",label:"Event type",type:"select",options:["Wedding","Reception","Engagement","Birthday","Corporate","Other"]},{key:"price",label:"Package price (₹)",type:"number",required:true},{key:"status",label:"Status",type:"select",options:["Active","Inactive"]},{key:"customizable",label:"Customisable",type:"select",options:["true","false"]},{key:"description",label:"Description",type:"textarea"}], columns:["name","code","event_type","price","status"] },
  { table: "package_items", title: "Package Items", singular: "Package item", description: "Connect catalogue items and quantities to packages.", icon: Boxes, fields: [
    {key:"package_id",label:"Package",type:"select",relation:{table:"packages",label:"name"},required:true},{key:"item_id",label:"Catalogue item",type:"select",relation:{table:"inventory_items",label:"name"},required:true},{key:"quantity",label:"Quantity",type:"number",required:true},{key:"unit_price",label:"Unit price (₹)",type:"number",required:true}], columns:["package_id","item_id","quantity","unit_price"] },
  { table: "booking_items", title: "Booking Items", singular: "Booking item", description: "Record the items and services reserved for a booking.", icon: ClipboardList, fields: [
    {key:"booking_id",label:"Booking",type:"select",relation:{table:"bookings",label:"booking_number"},required:true},{key:"inventory_item_id",label:"Catalogue item",type:"select",relation:{table:"inventory_items",label:"name"},required:true},{key:"description",label:"Description",required:true},{key:"quantity",label:"Quantity",type:"number",required:true},{key:"unit_price",label:"Unit price (₹)",type:"number",required:true}], columns:["booking_id","description","quantity","unit_price"] },
  { table: "invoices", title: "Quotations & Invoices", singular: "Invoice", description: "Create and track invoices associated with bookings.", icon: FileText, fields: [
    {key:"booking_id",label:"Booking",type:"select",relation:{table:"bookings",label:"booking_number"},required:true},{key:"invoice_number",label:"Invoice number",required:true},{key:"status",label:"Status",type:"select",options:["Draft","Sent","Partially Paid","Paid","Overdue","Cancelled"]},{key:"issue_date",label:"Issue date",type:"date",required:true},{key:"due_date",label:"Due date",type:"date"},{key:"subtotal",label:"Subtotal (₹)",type:"number"},{key:"tax_amount",label:"Tax (₹)",type:"number"},{key:"total_amount",label:"Total (₹)",type:"number",required:true},{key:"paid_amount",label:"Paid amount (₹)",type:"number"},{key:"notes",label:"Notes / terms",type:"textarea"}], columns:["invoice_number","booking_id","issue_date","due_date","total_amount","status"] },
  { table: "invoice_items", title: "Invoice Line Items", singular: "Invoice line item", description: "Manage individual invoice descriptions, quantities and rates.", icon: FileText, fields: [
    {key:"invoice_id",label:"Invoice",type:"select",relation:{table:"invoices",label:"invoice_number"},required:true},{key:"description",label:"Description",required:true},{key:"quantity",label:"Quantity",type:"number",required:true},{key:"unit_price",label:"Unit price (₹)",type:"number",required:true},{key:"total",label:"Line total (₹)",type:"number",required:true}], columns:["invoice_id","description","quantity","unit_price","total"] },
  { table: "payments", title: "Payments & Expenses", singular: "Transaction", description: "Record received payments, refunds and business expenses.", icon: Wallet, fields: [
    {key:"booking_id",label:"Booking",type:"select",relation:{table:"bookings",label:"booking_number"}},{key:"invoice_id",label:"Invoice",type:"select",relation:{table:"invoices",label:"invoice_number"}},{key:"amount",label:"Amount (₹)",type:"number",required:true},{key:"payment_date",label:"Transaction date",type:"date",required:true},{key:"payment_method",label:"Method",type:"select",options:["Cash","UPI","Bank Transfer","Card","Cheque","Other"]},{key:"type",label:"Type",type:"select",options:["Customer Payment","Expense","Refund"]},{key:"status",label:"Status",type:"select",options:["Received","Paid","Refunded","Pending"]},{key:"reference",label:"Reference"},{key:"notes",label:"Notes",type:"textarea"}], columns:["payment_date","type","amount","payment_method","status","reference"] },
  { table: "vendors", title: "Vendors", singular: "Vendor", description: "Manage suppliers and service partners.", icon: Truck, fields: [
    {key:"name",label:"Vendor / company name",required:true},{key:"contact_person",label:"Contact person"},{key:"email",label:"Email",type:"email"},{key:"phone",label:"Phone",type:"tel"},{key:"address",label:"Address",type:"textarea"},{key:"category",label:"Category",type:"select",options:["Flowers","Furniture","Lighting","Fabric","Transport","Catering","Sound","Other"]},{key:"notes",label:"Notes",type:"textarea"}], columns:["name","contact_person","phone","email","category"] },
  { table: "tasks", title: "Tasks & Reminders", singular: "Task", description: "Assign and track operational work and deadlines.", icon: ClipboardList, fields: [
    {key:"booking_id",label:"Related booking",type:"select",relation:{table:"bookings",label:"booking_number"}},{key:"title",label:"Task title",required:true},{key:"description",label:"Description",type:"textarea"},{key:"status",label:"Status",type:"select",options:["Open","In Progress","Completed","Cancelled"]},{key:"priority",label:"Priority",type:"select",options:["Low","Normal","High","Urgent"]},{key:"due_date",label:"Due date",type:"date"},{key:"assigned_to",label:"Assigned to"}], columns:["title","status","priority","due_date","booking_id","assigned_to"] },
]
const moneyFields = new Set(["price","cost","budget","unit_price","total","total_amount","paid_amount","subtotal","tax_amount","amount"])

// UI labels are intentionally friendly; the database stores canonical status keys.
// Keep this mapping centralized so every module writes the expected value consistently.
const statusValue = (table: string, value: unknown): string => {
  const label = String(value ?? "").trim()
  const key = label.toLowerCase().replace(/[ -]+/g, "_")
  const perTable: Record<string, Record<string, string>> = {
    customers: { active: "active", inactive: "inactive" },
    enquiries: {
      new: "new", in_follow_up: "in_follow_up", follow_up: "in_follow_up",
      converted: "converted", lost: "lost",
    },
    bookings: {
      planning: "pending", pending: "pending", confirmed: "confirmed", completed: "completed",
      cancelled: "cancelled",
    },
    inventory_items: { active: "active", inactive: "inactive" },
    packages: { active: "active", inactive: "inactive" },
    invoices: {
      draft: "draft", sent: "sent", "partially_paid": "partial",
      partial: "partial", paid: "paid", overdue: "overdue", cancelled: "cancelled",
    },
    payments: {
      received: "received", paid: "paid", refunded: "refunded", pending: "pending",
    },
    tasks: {
      open: "open", in_progress: "in_progress", completed: "completed",
      cancelled: "cancelled",
    },
  }
  return perTable[table]?.[key] ?? key
}
const normalizedStatus = (value: unknown) => String(value ?? "").trim().toLowerCase().replace(/[ -]+/g, "_")

const starterItems = [
  {name:"Shamiana / Tent canopy",category:"Fabric & Draping",unit:"Per Event",price:18000,cost:12000,quantity:1,description:"Main shelter over the venue"},
  {name:"Plastic / folding chairs",category:"Furniture",unit:"Per Piece",price:25,cost:15,quantity:200,description:"Guest seating"},
  {name:"Banquet chairs with covers & sashes",category:"Furniture",unit:"Per Piece",price:90,cost:55,quantity:100,description:"Formal dining seating"},
  {name:"Round tables",category:"Furniture",unit:"Per Piece",price:350,cost:220,quantity:25,description:"Dining and buffet setup"},
  {name:"Carpet rolls",category:"Fabric & Draping",unit:"Per Event",price:2500,cost:1600,quantity:10,description:"Floor covering for seating and aisles"},
  {name:"Interlocking floor tiles",category:"Other",unit:"Per Square Foot",price:18,cost:12,quantity:1000,description:"Sturdy event flooring"},
  {name:"Stage platform / Mandap",category:"Mandap",unit:"Per Event",price:18000,cost:12000,quantity:1,description:"Ceremony stage for couple"},
  {name:"VIP Maharaja sofa set",category:"Furniture",unit:"Per Set",price:6500,cost:4200,quantity:4,description:"Couple and VIP seating"},
  {name:"Fairy lights / LED curtain lights",category:"Lighting",unit:"Per Set",price:1200,cost:700,quantity:20,description:"Ambient lighting and backdrop"},
  {name:"Chandeliers / focus lights",category:"Lighting",unit:"Per Piece",price:1800,cost:1100,quantity:10,description:"Decorative and spot lighting"},
  {name:"Diesel generator (DG set)",category:"Other",unit:"Per Event",price:8500,cost:6000,quantity:2,description:"Power backup for event equipment"},
  {name:"Fans / air coolers",category:"Other",unit:"Per Piece",price:700,cost:450,quantity:20,description:"Guest cooling"},
  {name:"Curtains / satin drapes",category:"Fabric & Draping",unit:"Per Set",price:4500,cost:2800,quantity:15,description:"Ceiling and wall draping"},
  {name:"Backdrop / entry gate",category:"Stage Decoration",unit:"Per Event",price:9000,cost:6000,quantity:2,description:"Decorated entrance and photo area"},
  {name:"Crockery & cutlery set",category:"Other",unit:"Per Set",price:35,cost:22,quantity:300,description:"Plates, glasses and cutlery"},
  {name:"Mattresses",category:"Furniture",unit:"Per Piece",price:180,cost:110,quantity:60,description:"Floor seating for guests"},
  {name:"Bhatti / kitchen burners",category:"Other",unit:"Per Piece",price:900,cost:600,quantity:5,description:"Cooking support for caterers"},
  {name:"Portable toilets",category:"Other",unit:"Per Event",price:4500,cost:3200,quantity:3,description:"Temporary restroom facilities"},
  {name:"Tent poles, ropes & pegs",category:"Fabric & Draping",unit:"Per Set",price:2200,cost:1400,quantity:10,description:"Tent structural support"},
  {name:"Floral arrangements / garlands",category:"Floral Decoration",unit:"Per Set",price:3500,cost:2100,quantity:20,description:"Mandap, entrance and stage flowers"},
]
const popularItems = starterItems.slice(0, 6)
const starterPackages = [
  {name:"Intimate Celebration",code:"PKG-INTIMATE",event_type:"Engagement",price:35000,description:"Essential setup for a smaller family celebration",items:["Plastic / folding chairs","Round tables","Fairy lights / LED curtain lights","Floral arrangements / garlands"]},
  {name:"Classic Wedding",code:"PKG-CLASSIC",event_type:"Wedding",price:85000,description:"Traditional wedding setup with stage, seating and décor",items:["Shamiana / Tent canopy","Plastic / folding chairs","Round tables","Stage platform / Mandap","Fairy lights / LED curtain lights","Floral arrangements / garlands"]},
  {name:"Royal Wedding",code:"PKG-ROYAL",event_type:"Wedding",price:165000,description:"Premium mandap, VIP seating, lighting and entrance décor",items:["Shamiana / Tent canopy","Banquet chairs with covers & sashes","Round tables","Stage platform / Mandap","VIP Maharaja sofa set","Chandeliers / focus lights","Backdrop / entry gate","Floral arrangements / garlands"]},
  {name:"Reception Elegance",code:"PKG-RECEPTION",event_type:"Reception",price:110000,description:"Elegant reception stage, guest seating and ambient lighting",items:["Shamiana / Tent canopy","Banquet chairs with covers & sashes","Round tables","VIP Maharaja sofa set","Fairy lights / LED curtain lights","Backdrop / entry gate"]},
  {name:"Outdoor Event Essentials",code:"PKG-OUTDOOR",event_type:"Other",price:65000,description:"Outdoor shelter, flooring, power backup and practical guest facilities",items:["Shamiana / Tent canopy","Carpet rolls","Interlocking floor tiles","Diesel generator (DG set)","Fans / air coolers","Portable toilets"]},
]
function makeInvoicePdf(lines: string[], filename: string) {
  const clean = (value: unknown) => String(value ?? "").normalize("NFKD").replace(/[^\x20-\x7E]/g, "").replace(/[\\()]/g, "\\$&")
  const wrapped = lines.flatMap(line => {
    const text = String(line || "")
    if (text.length <= 86) return [text]
    const parts: string[] = []
    for (let i = 0; i < text.length; i += 86) parts.push(text.slice(i, i + 86))
    return parts
  }).slice(0, 44)
  const textOps = ["BT", "/F1 19 Tf", "50 790 Td", `(${clean(wrapped[0] || "UTSAVKOSH INVOICE")}) Tj`, "/F1 10 Tf"]
  for (const line of wrapped.slice(1)) textOps.push("0 -16 Td", `(${clean(line)}) Tj`)
  textOps.push("ET")
  const stream = textOps.join("\n")
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
  ]
  let pdf = "%PDF-1.4\n"
  const offsets = [0]
  objects.forEach((object, index) => { offsets.push(pdf.length); pdf += `${index + 1} 0 obj\n${object}\nendobj\n` })
  const xref = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  for (let i = 1; i < offsets.length; i++) pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`
  const url = URL.createObjectURL(new Blob([pdf], { type: "application/pdf" }))
  const anchor = document.createElement("a")
  anchor.href = url; anchor.download = filename; document.body.appendChild(anchor); anchor.click(); anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1500)
}

const titleFor = (config: ModuleConfig, row: Record<string, any>) => {
  const preferred = ["name","title","customer_name","invoice_number","booking_number","description"]
  for (const key of preferred) if (row[key]) return String(row[key])
  return config.fields.map(f => row[f.key]).find(Boolean)?.toString() || `${config.singular} record`
}
const formatValue = (key: string, value: any, labels: Record<string, string>) => {
  if (value === null || value === undefined || value === "") return "—"
  if (labels[String(value)]) return labels[String(value)]
  if (moneyFields.has(key) && !Number.isNaN(Number(value))) return `₹${Number(value).toLocaleString("en-IN")}`
  if (typeof value === "boolean") return value ? "Yes" : "No"
  return String(value)
}

export default function LiveWorkspace({ business, onSignOut }: { business: RegisteredBusiness; onSignOut: () => void }) {
  const [activeTable, setActiveTable] = useState("dashboard")
  const [records, setRecords] = useState<Record<string, Record<string, any>[]>>({})
  const [relations, setRelations] = useState<Record<string, Record<string, any>[]>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [search, setSearch] = useState("")
  const [editing, setEditing] = useState<Record<string, any> | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<Record<string, any>>({})
  const [saving, setSaving] = useState(false)
  const [businessSettings, setBusinessSettings] = useState<Record<string, any> | null>(null)
  const [language, setLanguage] = useState<"en" | "hi">(() => (localStorage.getItem("utsavkosh-language") === "hi" ? "hi" : "en"))
  const config = modules.find(m => m.table === activeTable)
  const businessId = (business as RegisteredBusiness & { id?: string }).id
  const translations: Record<string, string> = language === "hi" ? {
    "Dashboard":"डैशबोर्ड", "Customers":"ग्राहक", "Enquiries":"पूछताछ", "Bookings & Events":"बुकिंग और कार्यक्रम", "Item Catalogue":"आइटम कैटलॉग", "Packages":"पैकेज", "Package Items":"पैकेज आइटम", "Booking Items":"बुकिंग आइटम", "Quotations & Invoices":"कोटेशन और बिल", "Invoice Line Items":"बिल विवरण", "Payments & Expenses":"भुगतान और खर्च", "Vendors":"विक्रेता", "Tasks & Reminders":"कार्य और रिमाइंडर", "Reports":"रिपोर्ट", "Notifications":"सूचनाएँ", "Business Settings":"व्यवसाय सेटिंग्स", "Refresh data":"डेटा रीफ़्रेश करें", "Sign out":"लॉग आउट", "Welcome back. Manage":"वापसी पर स्वागत है। प्रबंधन करें", "Get started with your real data":"अपने वास्तविक डेटा से शुरू करें", "Everything below is loaded from your Supabase business records. New accounts start empty.":"नीचे का डेटा आपके Supabase रिकॉर्ड से आता है। नए खाते खाली शुरू होते हैं।", "Recent records":"हाल के रिकॉर्ड", "Business reports":"व्यवसाय रिपोर्ट", "Business reminders":"व्यवसाय रिमाइंडर", "Business profile and preferences":"व्यवसाय प्रोफ़ाइल और प्राथमिकताएँ", "Save business settings":"व्यवसाय सेटिंग्स सहेजें", "Search":"खोजें", "Reload":"रीलोड", "Export CSV":"CSV निर्यात", "Add":"जोड़ें", "Create record":"रिकॉर्ड बनाएँ", "Save changes":"बदलाव सहेजें", "Cancel":"रद्द करें", "Edit":"संपादित करें", "No":"नहीं", "Yes":"हाँ", "English":"अंग्रेज़ी", "Hindi":"हिंदी", "Quick add":"त्वरित जोड़ें", "No bookings yet":"अभी कोई बुकिंग नहीं", "No customers yet":"अभी कोई ग्राहक नहीं", "Business workspace":"व्यवसाय कार्यक्षेत्र", "Live Supabase workspace":"लाइव Supabase कार्यक्षेत्र", "No demo records":"कोई डेमो रिकॉर्ड नहीं", "Customer":"ग्राहक", "Enquiry":"पूछताछ", "Booking":"बुकिंग", "Catalogue item":"कैटलॉग आइटम", "Package":"पैकेज", "Package item":"पैकेज आइटम", "Booking item":"बुकिंग आइटम", "Invoice":"बिल", "Invoice line item":"बिल आइटम", "Transaction":"लेन-देन", "Vendor":"विक्रेता", "Task":"कार्य", "Full name":"पूरा नाम", "Email":"ईमेल", "Phone":"फ़ोन", "Address":"पता", "City":"शहर", "Notes":"नोट्स", "Status":"स्थिति", "Customer name":"ग्राहक का नाम", "Event name":"कार्यक्रम का नाम", "Event type":"कार्यक्रम का प्रकार", "Event date":"कार्यक्रम की तारीख", "Venue":"स्थान", "Budget (₹)":"बजट (₹)", "Source":"स्रोत", "Follow-up date":"फ़ॉलो-अप तारीख", "Requirements / notes":"आवश्यकताएँ / नोट्स", "Booking reference":"बुकिंग संदर्भ", "Converted enquiry":"बदली गई पूछताछ", "Guest count":"मेहमानों की संख्या", "Total amount (₹)":"कुल राशि (₹)", "Amount received (₹)":"प्राप्त राशि (₹)", "Item / service name":"आइटम / सेवा का नाम", "Item code":"आइटम कोड", "Category":"श्रेणी", "Unit":"इकाई", "Available quantity":"उपलब्ध मात्रा", "Selling price (₹)":"बिक्री मूल्य (₹)", "Internal cost (₹)":"आंतरिक लागत (₹)", "Description":"विवरण", "Package name":"पैकेज का नाम", "Package code":"पैकेज कोड", "Package price (₹)":"पैकेज मूल्य (₹)", "Customisable":"अनुकूलन योग्य", "Select…":"चुनें…", "Quantity":"मात्रा", "Unit price (₹)":"प्रति इकाई मूल्य (₹)", "Popular quick-add items":"अक्सर उपयोग होने वाले आइटम", "Add 20 starter décor items":"20 शुरुआती सजावट आइटम जोड़ें", "Add 5 starter packages":"5 शुरुआती पैकेज जोड़ें", "Choose a suggestion to prefill the form; nothing is saved until you confirm.":"सुझाव चुनें और फ़ॉर्म भरें; पुष्टि करने तक कुछ भी सेव नहीं होगा।", "Floral arrangement":"फूलों की सजावट", "LED par lights":"LED लाइट", "Stage sofa":"स्टेज सोफ़ा", "Mandap setup":"मंडप सेटअप", "Fairy lights":"फेयरी लाइट", "Floral backdrop":"फूलों का बैकड्रॉप", "Open enquiries":"खुली पूछताछ", "Catalogue items":"कैटलॉग आइटम", "Payments recorded":"दर्ज भुगतान", "Invoice balance":"बिल बकाया", "from one place.":"एक ही जगह से।", "Maintain real customer records and contact details.":"ग्राहकों के वास्तविक रिकॉर्ड और संपर्क विवरण रखें।", "Track new opportunities and follow-up dates.":"नई पूछताछ और फ़ॉलो-अप तारीखों को ट्रैक करें।", "Create and manage confirmed event work.":"पुष्ट कार्यक्रमों की बुकिंग बनाएँ और प्रबंधित करें।", "Manage your actual décor inventory, rates and costs.":"सजावट की इन्वेंटरी, दरें और लागत प्रबंधित करें।", "Create reusable event packages with prices.":"कीमतों के साथ दोबारा उपयोग होने वाले पैकेज बनाएँ।", "Connect catalogue items and quantities to packages.":"कैटलॉग आइटम और मात्रा को पैकेज से जोड़ें।", "Record the items and services reserved for a booking.":"बुकिंग के लिए आरक्षित आइटम और सेवाएँ दर्ज करें।", "Create and track invoices associated with bookings.":"बुकिंग से जुड़े बिल बनाएँ और ट्रैक करें।", "Manage individual invoice descriptions, quantities and rates.":"बिल के विवरण, मात्रा और दरें प्रबंधित करें।", "Record received payments, refunds and business expenses.":"प्राप्त भुगतान, रिफंड और व्यावसायिक खर्च दर्ज करें।", "Manage suppliers and service partners.":"आपूर्तिकर्ता और सेवा भागीदार प्रबंधित करें।", "Assign and track operational work and deadlines.":"कार्य और समय-सीमा निर्धारित करें और ट्रैक करें।", "Item code":"आइटम कोड", "Quotation prefix":"कोटेशन प्रीफ़िक्स", "Invoice prefix":"बिल प्रीफ़िक्स", "Business name":"व्यवसाय का नाम", "Business contact email":"व्यवसाय संपर्क ईमेल", "Business phone":"व्यवसाय फ़ोन", "Business type":"व्यवसाय का प्रकार", "PIN / postal code":"पिन कोड", "Country":"देश", "Currency":"मुद्रा", "Time zone":"समय क्षेत्र", "Date format":"तारीख़ का प्रारूप", "Business logo URL":"व्यवसाय लोगो URL"
  } : {}
  const tr = (text: string) => translations[text] || text
  const changeLanguage = (next: "en" | "hi") => { setLanguage(next); localStorage.setItem("utsavkosh-language", next) }

  const loadTable = useCallback(async (table: string) => {
    if (!businessId) throw new Error("This business record has no ID. Sign out and sign in again to reload it.")
    const client = requireSupabase()
    const { data, error: queryError } = await client.from(table).select("*").eq("business_id", businessId).order("created_at", { ascending: false }).limit(500)
    if (queryError) throw queryError
    setRecords(prev => ({ ...prev, [table]: (data || []) as Record<string, any>[] }))
    return (data || []) as Record<string, any>[]
  }, [businessId])

  const refresh = useCallback(async () => {
    setLoading(true); setError("")
    try {
      if (!businessId) throw new Error("The selected business ID is missing. Please sign out and sign in again.")
      const client = requireSupabase()
      const results = await Promise.all(modules.map(async m => {
        const { data, error: queryError } = await client.from(m.table).select("*").eq("business_id", businessId).order("created_at", { ascending: false }).limit(500)
        if (queryError) throw new Error(`${m.title}: ${queryError.message}`)
        return [m.table, (data || []) as Record<string, any>[]] as const
      }))
      setRecords(Object.fromEntries(results))
      const b = await client.from("businesses").select("*").eq("id", businessId).maybeSingle()
      if (b.error) throw b.error
      setBusinessSettings(b.data as Record<string, any> | null)
      const rels: Record<string, Record<string, any>[]> = {}
      for (const table of ["customers","enquiries","bookings","packages","inventory_items","invoices"]) rels[table] = (Object.fromEntries(results)[table] || [])
      setRelations(rels)
    } catch (e) { setError(e instanceof Error ? e.message : "Could not load business records.") }
    finally { setLoading(false) }
  }, [businessId])

  useEffect(() => { void refresh() }, [refresh])
  useEffect(() => { if (notice) { const t = window.setTimeout(() => setNotice(""), 3200); return () => window.clearTimeout(t) } }, [notice])

  const openCreate = () => { setEditing(null); setForm({}); setShowForm(true); setError("") }
  const openEdit = (row: Record<string, any>) => { setEditing(row); setForm(Object.fromEntries((config?.fields || []).map(f => [f.key, row[f.key] == null ? "" : String(row[f.key])] ))); setShowForm(true); setError("") }
  const saveRecord = async (event: FormEvent) => {
    event.preventDefault(); if (!config) return
    setSaving(true); setError("")
    try {
      const client = requireSupabase()
      const payload: Record<string, any> = { business_id: businessId }
      for (const field of config.fields) {
        const raw = form[field.key]
        if (raw === undefined || raw === "") { if (editing) payload[field.key] = null; continue }
        if (field.type === "number" || moneyFields.has(field.key)) payload[field.key] = Number(raw)
        else if (field.key === "customizable") payload[field.key] = raw === "true"
        else if (field.key === "status") payload[field.key] = statusValue(config.table, raw)
        else payload[field.key] = raw
      }
      // Keep the UI readable while writing the exact legacy columns required by the existing database.
      if (config.table === "bookings") {
        payload.event_name = String(form.event_name || form.event_type || "Event").trim()
        if (!payload.booking_number) payload.booking_number = `BK-${new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14)}`
        if (form.event_type) payload.event_type = form.event_type
      }
      if (config.table === "package_items") {
        const selectedItemId = form.item_id || form.inventory_item_id
        if (!selectedItemId) throw new Error("Choose a catalogue item before saving this package item.")
        payload.item_id = selectedItemId // existing schema's NOT NULL column
        payload.inventory_item_id = selectedItemId // newer workspace alias
      }
      if (config.table === "booking_items") {
        const selectedItemId = form.inventory_item_id || form.item_id
        if (selectedItemId) { payload.item_id = selectedItemId; payload.inventory_item_id = selectedItemId }
      }
      let result
      if (editing?.id) result = await client.from(config.table).update(payload).eq("id", editing.id).eq("business_id", businessId).select("*").single()
      else result = await client.from(config.table).insert(payload).select("*").single()
      if (result.error) throw new Error(result.error.message)
      setRecords(prev => ({ ...prev, [config.table]: editing?.id ? (prev[config.table] || []).map(row => row.id === editing.id ? result.data : row) : [result.data, ...(prev[config.table] || [])] }))
      setShowForm(false); setEditing(null); setNotice(`${config.singular} ${editing ? "updated" : "created"} and saved to Supabase.`)
      // Refresh relation options and computed totals after saving.
      void refresh()
    } catch (e) { setError(e instanceof Error ? e.message : "Could not save this record.") }
    finally { setSaving(false) }
  }
  const addStarterCatalogue = async () => {
    if (!businessId) return
    setSaving(true); setError("")
    try {
      const client = requireSupabase()
      const existingNames = new Set((records.inventory_items || []).map(row => String(row.name || "").trim().toLowerCase()))
      const missing = starterItems.filter(item => !existingNames.has(item.name.toLowerCase()))
      if (!missing.length) { setNotice("Starter catalogue is already added."); return }
      const payload = missing.map(item => ({ ...item, business_id: businessId, status: "active" }))
      const { error: insertError } = await client.from("inventory_items").insert(payload)
      if (insertError) throw insertError
      setNotice(`${missing.length} starter catalogue items added. Prices are suggested starting rates; edit them for your business.`)
      await refresh()
    } catch (e) { setError(e instanceof Error ? e.message : "Could not add starter catalogue items.") }
    finally { setSaving(false) }
  }

  const addStarterPackages = async () => {
    if (!businessId) return
    setSaving(true); setError("")
    try {
      const client = requireSupabase()
      const existingNames = new Set((records.packages || []).map(row => String(row.name || "").trim().toLowerCase()))
      const missing = starterPackages.filter(pkg => !existingNames.has(pkg.name.toLowerCase()))
      if (!missing.length) { setNotice("Starter packages are already added."); return }
      const packagePayload = missing.map(({items: _items, ...pkg}) => ({ ...pkg, business_id: businessId, status: "active", customizable: true }))
      const { data: created, error: packageError } = await client.from("packages").insert(packagePayload).select("*")
      if (packageError) throw packageError
      const catalogue = records.inventory_items || []
      const lines = (created || []).flatMap(pkg => {
        const definition = starterPackages.find(p => p.name === pkg.name)
        return (definition?.items || []).flatMap(itemName => {
          const item = catalogue.find(row => String(row.name).toLowerCase() === itemName.toLowerCase())
          return item ? [{ business_id: businessId, package_id: pkg.id, item_id: item.id, inventory_item_id: item.id, quantity: 1, unit_price: Number(item.price || 0) }] : []
        })
      })
      if (lines.length) {
        const { error: lineError } = await client.from("package_items").insert(lines)
        if (lineError) throw new Error(`Packages were created, but package item links could not be added: ${lineError.message}`)
      }
      setNotice(`${created?.length || 0} starter packages added${lines.length ? ` with ${lines.length} catalogue item links` : ". Add the starter catalogue first, then edit package contents"}. Package prices are suggestions; review before quoting customers.`)
      await refresh()
    } catch (e) { setError(e instanceof Error ? e.message : "Could not add starter packages.") }
    finally { setSaving(false) }
  }

  const downloadInvoice = (invoice: Record<string, any>) => {
    const booking = (records.bookings || []).find(row => row.id === invoice.booking_id)
    const customer = (records.customers || []).find(row => row.id === booking?.customer_id)
    const lines = (records.invoice_items || []).filter(row => row.invoice_id === invoice.id)
    const currency = (value: unknown) => `INR ${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
    const businessName = businessSettings?.name || business.name || "Utsavkosh Business"
    const content = [
      `${businessName} - INVOICE`,
      "Celebrations, beautifully managed",
      "",
      `Invoice number: ${invoice.invoice_number || "Invoice"}`,
      `Status: ${invoice.status || "Draft"}`,
      `Issue date: ${invoice.issue_date || "-"}`,
      `Due date: ${invoice.due_date || "-"}`,
      "",
      `Bill to: ${customer?.name || "Customer not specified"}`,
      `Customer email: ${customer?.email || "-"}`,
      `Customer phone: ${customer?.phone || "-"}`,
      `Event: ${booking?.event_name || booking?.event_type || "-"}`,
      `Event date: ${booking?.event_date || "-"}`,
      `Venue: ${booking?.venue || "-"}`,
      "",
      "ITEMS / DESCRIPTION",
      ...(lines.length ? lines.map((line, i) => `${i + 1}. ${line.description || "Item"} | Qty ${line.quantity || 1} | Rate ${currency(line.unit_price)} | Total ${currency(line.total ?? Number(line.quantity || 1) * Number(line.unit_price || 0))}`) : ["Line item details were not added to this invoice."]),
      "",
      `Subtotal: ${currency(invoice.subtotal)}`,
      `Tax: ${currency(invoice.tax_amount)}`,
      `Total: ${currency(invoice.total_amount)}`,
      `Paid: ${currency(invoice.paid_amount)}`,
      `Balance due: ${currency(Math.max(0, Number(invoice.total_amount || 0) - Number(invoice.paid_amount || 0)))}`,
      "",
      `Notes / terms: ${invoice.notes || "Thank you for choosing us."}`,
      `Business contact: ${businessSettings?.email || "-"} | ${businessSettings?.phone || "-"}`,
      `Address: ${businessSettings?.address || "-"}`,
      "",
      "This document was generated by Utsavkosh. Please verify details before sending to the customer."
    ]
    const slug = String(invoice.invoice_number || "invoice").replace(/[^a-z0-9-_]/gi, "-")
    makeInvoicePdf(content, `${slug}.pdf`)
  }

  const deleteRecord = async (row: Record<string, any>) => {
    if (!config || !row.id || !window.confirm(`Delete ${titleFor(config, row)}? This cannot be undone.`)) return
    setError("")
    try {
      const { error: deleteError } = await requireSupabase().from(config.table).delete().eq("id", row.id).eq("business_id", businessId)
      if (deleteError) throw deleteError
      setRecords(prev => ({ ...prev, [config.table]: (prev[config.table] || []).filter(item => item.id !== row.id) }))
      setNotice(`${config.singular} deleted.`)
    } catch (e) { setError(e instanceof Error ? e.message : "Could not delete record.") }
  }
  const visibleRows = useMemo(() => {
    const rows = records[activeTable] || []
    if (!search.trim() || !config) return rows
    const q = search.toLowerCase()
    return rows.filter(row => config.fields.some(f => String(row[f.key] ?? "").toLowerCase().includes(q)))
  }, [records, activeTable, search, config])
  const nav = [
    { key:"dashboard", label:"Dashboard", icon:LayoutDashboard },
    { key:"customers", label:"Customers", icon:Users },
    { key:"enquiries", label:"Enquiries", icon:MessageSquareText },
    { key:"bookings", label:"Bookings & Events", icon:CalendarDays },
    { key:"inventory_items", label:"Item Catalogue", icon:Gift },
    { key:"packages", label:"Packages", icon:Package },
    { key:"package_items", label:"Package Items", icon:Boxes },
    { key:"booking_items", label:"Booking Items", icon:ClipboardList },
    { key:"invoices", label:"Quotations & Invoices", icon:FileText },
    { key:"invoice_items", label:"Invoice Line Items", icon:FileText },
    { key:"payments", label:"Payments & Expenses", icon:Wallet },
    { key:"vendors", label:"Vendors", icon:Truck },
    { key:"tasks", label:"Tasks & Reminders", icon:ClipboardList },
    { key:"reports", label:"Reports", icon:Activity },
    { key:"notifications", label:"Notifications", icon:AlertCircle },
    { key:"settings", label:"Business Settings", icon:Settings },
  ]
  const totals = modules.map(m => ({ ...m, count: (records[m.table] || []).length }))
  const cashReceived = (records.payments || []).filter(r => !["Expense","Refund"].includes(r.type)).reduce((s,r) => s + Number(r.amount || 0),0)
  const outstanding = (records.invoices || []).reduce((s,r) => s + Math.max(0,Number(r.total_amount || 0)-Number(r.paid_amount || 0)),0)
  const setPage = (key: string) => { setActiveTable(key); setSearch(""); setShowForm(false); setError("") }
  const displayLabel = (table: string, id: unknown) => {
    const row = (records[table] || []).find(r => String(r.id) === String(id))
    if (!row) return id ? String(id).slice(0,8) : "—"
    return titleFor(modules.find(m => m.table === table) || modules[0], row)
  }
  const displayCell = (key: string, value: any) => {
    const relation = config?.fields.find(f => f.key === key)?.relation
    if (relation) return displayLabel(relation.table, value)
    return formatValue(key, value, {})
  }
  const updateBusiness = async (event: FormEvent) => {
    event.preventDefault(); if (!businessId || !businessSettings) return
    setSaving(true); setError("")
    const keys = ["name","email","phone","address","logo_url","business_type","description","city","state","postal_code","country","currency","timezone","date_format","quotation_prefix","invoice_prefix"]
    const patch: Record<string, any> = {}
    for (const k of keys) { const el = document.getElementById(`biz-${k}`) as HTMLInputElement | HTMLTextAreaElement | null; if (el) patch[k] = el.value || null }
    try {
      const { data, error: updateError } = await requireSupabase().from("businesses").update(patch).eq("id", businessId).select("*").single()
      if (updateError) throw updateError
      setBusinessSettings(data); setNotice("Business settings saved to Supabase.")
    } catch(e) { setError(e instanceof Error ? e.message : "Could not save business settings.") }
    finally { setSaving(false) }
  }

  const count = (table: string) => (records[table] || []).length
  return <div className="app-shell live-app-shell" style={{minHeight:"100vh",display:"flex",background:"#f7f3ee",color:"#30252a"}}>
    <aside style={{width:250,flexShrink:0,background:"#681b3b",color:"#fff",padding:"24px 14px",display:"flex",flexDirection:"column",gap:8}}>
      <div style={{padding:"6px 14px 24px",borderBottom:"1px solid #ffffff2a",marginBottom:8}}><img src="/utsavkosh-logo.svg" alt="Utsavkosh" style={{display:"block",width:190,maxWidth:"100%",height:68,objectFit:"contain",objectPosition:"left center",marginBottom:10}}/><div style={{fontSize:10,textTransform:"uppercase",letterSpacing:1.7,fontWeight:800,color:"#f0d38d",marginBottom:7}}>{tr("Business workspace")}</div><div style={{fontSize:14,fontWeight:750,lineHeight:1.45,color:"#fff",overflowWrap:"anywhere"}}>{business.name}</div></div>
      <nav style={{display:"grid",gap:4,overflowY:"auto"}}>{nav.map(item => { const Icon=item.icon; return <button key={item.key} onClick={()=>setPage(item.key)} style={{border:0,borderRadius:9,padding:"11px 12px",display:"flex",gap:12,alignItems:"center",textAlign:"left",color:"white",background:activeTable===item.key?"#873451":"transparent",cursor:"pointer",fontSize:13}}><Icon size={17}/>{tr(item.label)}</button> })}</nav>
      <div style={{marginTop:"auto",padding:"16px 12px 0",borderTop:"1px solid #ffffff2a",fontSize:12,color:"#eadde2"}}>{tr("Live Supabase workspace")}<br/><span style={{opacity:.75}}>{tr("No demo records")}</span><button onClick={onSignOut} style={{display:"flex",alignItems:"center",gap:8,marginTop:16,border:0,color:"white",background:"transparent",cursor:"pointer"}}><LogOut size={15}/> {tr("Sign out")}</button></div>
    </aside>
    <main style={{minWidth:0,flex:1,padding:"28px clamp(16px,3vw,42px)",overflowX:"hidden"}}>
      <header style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:16,flexWrap:"wrap",marginBottom:28}}><div><div style={{fontSize:11,letterSpacing:2,color:"#b38a44",fontWeight:700}}>UTSAVKOSH WORKSPACE</div><h1 style={{fontFamily:"Georgia,serif",fontWeight:500,fontSize:32,margin:"8px 0"}}>{tr(nav.find(n=>n.key===activeTable)?.label || "Dashboard")}</h1><p style={{margin:0,color:"#776a70",fontSize:14}}>{activeTable==="dashboard"?`${language==="hi"?"वापसी पर स्वागत है। प्रबंधन करें":"Welcome back. Manage"} ${business.name} ${language==="hi"?"एक ही जगह से":"from one place."}`:tr(config?.description || "Update your business details.")}</p></div><div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}><div aria-label="Language" style={{display:"inline-flex",padding:3,border:"1px solid #e0d1d3",borderRadius:10,background:"#fffdfb"}}><button type="button" onClick={()=>changeLanguage("en")} aria-pressed={language==="en"} style={{...langButton,background:language==="en"?"#681b3b":"transparent",color:language==="en"?"white":"#681b3b"}}>EN</button><button type="button" onClick={()=>changeLanguage("hi")} aria-pressed={language==="hi"} style={{...langButton,background:language==="hi"?"#681b3b":"transparent",color:language==="hi"?"white":"#681b3b"}}>हिंदी</button></div><button onClick={()=>void refresh()} style={secondaryButton}><RefreshCw size={15}/> {tr("Refresh data")}</button><button onClick={onSignOut} style={secondaryButton}><LogOut size={15}/> {tr("Sign out")}</button></div></header>
      {error && <div role="alert" style={errorBox}><AlertCircle size={17}/><span>{error}</span><button onClick={()=>setError("")} style={{marginLeft:"auto",border:0,background:"transparent",cursor:"pointer"}}><X size={15}/></button></div>}
      {notice && <div role="status" style={successBox}><Check size={16}/>{notice}</div>}
      {loading && <div style={{padding:30,textAlign:"center",color:"#776a70"}}>Loading your saved business data…</div>}
      {!loading && activeTable==="dashboard" && <>
        <section style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:14,marginBottom:22}}>{[
          {label:"Customers",value:count("customers"),icon:Users},{label:"Open enquiries",value:(records.enquiries||[]).filter(r=>!['converted','lost'].includes(normalizedStatus(r.status))).length,icon:MessageSquareText},{label:"Bookings",value:count("bookings"),icon:CalendarDays},{label:"Catalogue items",value:count("inventory_items"),icon:Gift},{label:"Payments recorded",value:`₹${cashReceived.toLocaleString("en-IN")}`,icon:CircleDollarSign},{label:"Invoice balance",value:`₹${outstanding.toLocaleString("en-IN")}`,icon:Wallet},
        ].map(card=>{const Icon=card.icon;return <article key={card.label} style={statCard}><span style={{display:"inline-flex",padding:9,borderRadius:9,background:"#f4e7eb",color:"#681b3b"}}><Icon size={19}/></span><div style={{fontSize:12,color:"#776a70",marginTop:14}}>{card.label}</div><strong style={{display:"block",fontSize:25,fontWeight:600,marginTop:5}}>{card.value}</strong></article>})}</section>
        <section style={{...panel,marginBottom:20}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}><div><h2 style={panelTitle}>{tr("Get started with your real data")}</h2><p style={muted}>{tr("Everything below is loaded from your Supabase business records. New accounts start empty.")}</p></div></div><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:10,marginTop:18}}>{modules.filter(m=>["customers","inventory_items","enquiries","bookings","packages","vendors"].includes(m.table)).map(m=>{const Icon=m.icon;return <button key={m.table} onClick={()=>setPage(m.table)} style={quickAction}><Icon size={20}/><span><strong>{tr(m.title)}</strong><small>{(records[m.table]||[]).length} saved records</small></span><Plus size={16}/></button>})}</div></section>
        <section style={panel}><h2 style={panelTitle}>{tr("Recent records")}</h2>{modules.slice(0,5).map(m=><div key={m.table} style={{padding:"12px 0",borderBottom:"1px solid #eee4e5",display:"flex",justifyContent:"space-between",alignItems:"center",gap:10}}><span>{tr(m.title)}</span><strong>{count(m.table)}</strong><button onClick={()=>setPage(m.table)} style={linkButton}>Open</button></div>)}</section>
      </>}
      {!loading && activeTable==="reports" && <section style={panel}><h2 style={panelTitle}>{tr("Business reports")}</h2><p style={muted}>Calculated from records saved in your Supabase workspace. No sample figures are used.</p><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:12,marginTop:18}}>{[
        ["Total customers",count("customers")], ["Total enquiries",count("enquiries")], ["Total bookings",count("bookings")], ["Inventory items",count("inventory_items")], ["Packages",count("packages")], ["Vendors",count("vendors")], ["Recorded payments",`₹${cashReceived.toLocaleString("en-IN")}`], ["Outstanding invoices",`₹${outstanding.toLocaleString("en-IN")}`],
      ].map(([label,value])=><article key={String(label)} style={{border:"1px solid #eadfdc",borderRadius:10,padding:16}}><small style={{color:"#776a70"}}>{label}</small><strong style={{display:"block",fontSize:23,marginTop:8}}>{value}</strong></article>)}</div><div style={{marginTop:20}}><h3 style={{fontFamily:"Georgia,serif",fontWeight:500}}>Invoice balances</h3>{(records.invoices||[]).length===0?<p style={muted}>No invoices have been recorded yet.</p>:(records.invoices||[]).map(row=><div key={row.id} style={{display:"flex",justifyContent:"space-between",gap:12,padding:"11px 0",borderBottom:"1px solid #eee4e5"}}><span>{row.invoice_number || "Invoice"}</span><span>{formatValue("total_amount",row.total_amount,{})}</span><strong>{formatValue("paid_amount",row.paid_amount,{})} paid</strong></div>)}</div></section>}
      {!loading && activeTable==="notifications" && <section style={panel}><h2 style={panelTitle}>{tr("Business reminders")}</h2><p style={muted}>Reminders are derived from your saved enquiries, bookings, invoices and tasks.</p>{(()=>{const today=new Date().toISOString().slice(0,10);const alerts=[...(records.tasks||[]).filter(r=>normalizedStatus(r.status)!=="completed"&&r.due_date&&r.due_date<=today).map(r=>({id:`task-${r.id}`,title:r.title||"Task due",detail:`Task is ${r.due_date<today?"overdue":"due today"}`,date:r.due_date})),...(records.invoices||[]).filter(r=>!['paid','cancelled'].includes(normalizedStatus(r.status))&&r.due_date&&r.due_date<today).map(r=>({id:`invoice-${r.id}`,title:`Invoice ${r.invoice_number||""} overdue`,detail:`Outstanding ${formatValue("total_amount",Math.max(0,Number(r.total_amount||0)-Number(r.paid_amount||0)),{})}`,date:r.due_date})),...(records.enquiries||[]).filter(r=>normalizedStatus(r.status)!=="converted"&&normalizedStatus(r.status)!=="lost"&&r.follow_up_date&&r.follow_up_date<=today).map(r=>({id:`enquiry-${r.id}`,title:`Follow up: ${r.customer_name||"Customer enquiry"}`,detail:`Follow-up date ${r.follow_up_date}`,date:r.follow_up_date}))].sort((a,b)=>String(a.date).localeCompare(String(b.date)));return alerts.length?alerts.map(a=><article key={a.id} style={{display:"flex",gap:12,padding:"14px 0",borderBottom:"1px solid #eee4e5"}}><span style={{color:"#9c6a19"}}><AlertCircle size={19}/></span><span><strong>{a.title}</strong><small style={{display:"block",color:"#776a70",marginTop:4}}>{a.detail}</small></span><time style={{marginLeft:"auto",fontSize:12,color:"#776a70"}}>{a.date}</time></article>):<div style={{padding:"36px 12px",textAlign:"center"}}><Check size={26} color="#287a48"/><h3 style={{fontFamily:"Georgia,serif",fontWeight:500}}>You're all caught up</h3><p style={muted}>No overdue tasks, invoice due dates, or follow-ups were found in your saved records.</p></div>})()}</section>}
      {!loading && activeTable==="settings" && businessSettings && <section style={panel}><h2 style={panelTitle}>{tr("Business profile and preferences")}</h2><p style={muted}>These values are saved to your Supabase businesses row.</p><form onSubmit={updateBusiness} style={formGrid}>{[["name","Business name"],["email","Business contact email"],["phone","Business phone"],["business_type","Business type"],["city","City"],["state","State"],["postal_code","PIN / postal code"],["country","Country"],["currency","Currency"],["timezone","Time zone"],["date_format","Date format"],["quotation_prefix","Quotation prefix"],["invoice_prefix","Invoice prefix"],["logo_url","Business logo URL"]].map(([key,label])=><label key={key} style={fieldStyle}><span>{label}</span><input id={`biz-${key}`} defaultValue={businessSettings[key] ?? ""} style={inputStyle}/></label>)}<label style={{...fieldStyle,gridColumn:"1 / -1"}}><span>Description</span><textarea id="biz-description" defaultValue={businessSettings.description ?? ""} rows={3} style={inputStyle}/></label><label style={{...fieldStyle,gridColumn:"1 / -1"}}><span>Address</span><textarea id="biz-address" defaultValue={businessSettings.address ?? ""} rows={2} style={inputStyle}/></label><div style={{gridColumn:"1 / -1"}}><button className="primary-button" type="submit" disabled={saving}>{saving?"Saving…":tr("Save business settings")}</button></div></form></section>}
      {!loading && config && <section style={panel}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:14,flexWrap:"wrap",marginBottom:18}}>
          <div><h2 style={panelTitle}>{tr(config.title)}</h2><p style={muted}>{visibleRows.length} saved record{visibleRows.length===1?"":"s"} · synced with Supabase</p></div>
          <button className="primary-button" onClick={openCreate}><Plus size={16}/> {tr("Add")} {tr(config.singular)}</button>
        </div>
        {activeTable === "inventory_items" && (
          <div style={{...panel,background:"#fbf6ef",padding:14,marginBottom:16,boxShadow:"none"}}>
            <strong style={{display:"block",fontSize:13,marginBottom:10}}>{tr("Popular quick-add items")}</strong>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {popularItems.map((preset) => (
                <button key={preset.name} type="button" style={secondaryButton} onClick={() => {
                  setEditing(null)
                  setForm({name:preset.name,category:preset.category,unit:preset.unit,price:preset.price,quantity:"1",cost:"0",status:"Active"})
                  setShowForm(true)
                  setError("")
                }}><Plus size={13}/>{tr(preset.name)}</button>
              ))}
            </div>
            <small style={{display:"block",marginTop:8,color:"#776a70"}}>{tr("Choose a suggestion to prefill the form; nothing is saved until you confirm.")}</small>
          </div>
        )}
        {activeTable === "inventory_items" && <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:16}}><button type="button" className="primary-button" disabled={saving} onClick={()=>void addStarterCatalogue()}><Plus size={15}/>{saving?"Adding…":"Add 20 starter décor items"}</button><span style={{alignSelf:"center",fontSize:12,color:"#776a70"}}>Suggested sample rates — review and edit before using in a quote.</span></div>}
        {activeTable === "packages" && <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:16}}><button type="button" className="primary-button" disabled={saving} onClick={()=>void addStarterPackages()}><Plus size={15}/>{saving?"Adding…":"Add 5 starter packages"}</button><span style={{alignSelf:"center",fontSize:12,color:"#776a70"}}>Suggested package prices and contents; customize before quoting.</span></div>}
        <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:16,flexWrap:"wrap"}}><div style={{...searchStyle,flex:1,minWidth:220}}><Search size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder={`${tr("Search")} ${tr(config.title).toLowerCase()}…`} style={{border:0,outline:0,flex:1,background:"transparent",minWidth:100}}/></div><button onClick={()=>void loadTable(config.table).catch(e=>setError(e.message))} style={secondaryButton}><RefreshCw size={14}/> {tr("Reload")}</button><button onClick={()=>{const csv=[config.columns.join(","),...visibleRows.map(r=>config.columns.map(k=>JSON.stringify(r[k]??"")).join(","))].join("\n");const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8;"}));a.download=`${config.table}.csv`;a.click();URL.revokeObjectURL(a.href)}} style={secondaryButton}><ArrowDownToLine size={14}/> {tr("Export CSV")}</button></div>
        {visibleRows.length===0 ? <div style={{padding:"46px 20px",textAlign:"center",border:"1px dashed #ddcdd2",borderRadius:12}}><div style={{display:"inline-flex",padding:12,borderRadius:12,background:"#f4e7eb",color:"#681b3b"}}><config.icon size={24}/></div><h3 style={{fontFamily:"Georgia,serif",fontWeight:500}}>No {config.title.toLowerCase()} yet</h3><p style={muted}>Add your first {config.singular.toLowerCase()}. It will be stored in Supabase, not in this browser.</p><button className="primary-button" onClick={openCreate}><Plus size={15}/> Add {config.singular}</button></div> : <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}><thead><tr>{config.columns.map(k=><th key={k} style={thStyle}>{config.fields.find(f=>f.key===k)?.label || k.replace(/_/g," ")}</th>)}<th style={thStyle}>Actions</th></tr></thead><tbody>{visibleRows.map(row=><tr key={row.id}>{config.columns.map(k=><td key={k} style={tdStyle}>{displayCell(k,row[k])}</td>)}<td style={{...tdStyle,whiteSpace:"nowrap"}}><button aria-label="Edit record" onClick={()=>openEdit(row)} style={iconButton}><Pencil size={15}/></button>{activeTable === "invoices" && <button aria-label="Download invoice PDF" title="Download invoice PDF" onClick={()=>downloadInvoice(row)} style={iconButton}><Download size={15}/></button>}<button aria-label="Delete record" onClick={()=>void deleteRecord(row)} style={{...iconButton,color:"#a72e3b"}}><Trash2 size={15}/></button></td></tr>)}</tbody></table></div>}
      </section>}
      {showForm && config && <div role="dialog" aria-modal="true" aria-label={`${editing?"Edit":"Add"} ${config.singular}`} style={modalScrim}><form onSubmit={saveRecord} style={modalPanel}><header style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,borderBottom:"1px solid #eee4e5",paddingBottom:14,marginBottom:18}}><div><h2 style={{...panelTitle,margin:0}}>{tr(editing?"Edit":"Add")} {tr(config.singular)}</h2><p style={{...muted,margin:"5px 0 0"}}>Changes save directly to your Supabase database.</p></div><button type="button" onClick={()=>setShowForm(false)} style={iconButton}><X size={18}/></button></header><div style={formGrid}>{config.fields.map(field=>{const opts=field.relation?(relations[field.relation.table]||[]).map(row=>({value:String(row.id),label:String(row[field.relation!.label]||row.name||row.title||row.id)})):[];return <label key={field.key} style={{...fieldStyle,gridColumn:field.type==="textarea"?"1 / -1":undefined}}><span>{tr(field.label)}{field.required?" *":""}</span>{field.relation || field.type==="select" ? <select required={field.required} value={form[field.key]??""} onChange={e=>setForm(p=>({...p,[field.key]:e.target.value}))} style={inputStyle}><option value="">Select…</option>{field.relation?opts.map(o=><option key={o.value} value={o.value}>{o.label}</option>):field.options?.map(o=><option key={o} value={o}>{o}</option>)}</select>:field.type==="textarea"?<textarea required={field.required} rows={3} value={form[field.key]??""} onChange={e=>setForm(p=>({...p,[field.key]:e.target.value}))} style={inputStyle}/>:<input required={field.required} type={field.type||"text"} min={field.type==="number"?0:undefined} step={field.type==="number"?"any":undefined} value={form[field.key]??""} onChange={e=>setForm(p=>({...p,[field.key]:e.target.value}))} style={inputStyle}/>}</label>})}</div>{error&&<div role="alert" style={{...errorBox,marginTop:14}}><AlertCircle size={16}/>{error}</div>}<footer style={{display:"flex",justifyContent:"flex-end",gap:10,marginTop:20,paddingTop:16,borderTop:"1px solid #eee4e5"}}><button type="button" style={secondaryButton} onClick={()=>setShowForm(false)}>{tr("Cancel")}</button><button type="submit" className="primary-button" disabled={saving}>{saving?"Saving…":editing?tr("Save changes"):tr("Create record")}</button></footer></form></div>}
    </main>
  </div>
}

const langButton: CSSProperties = {border:0,borderRadius:7,padding:"7px 10px",fontSize:12,fontWeight:700,cursor:"pointer",minWidth:40}
const panel: CSSProperties = {background:"#fffdfb",border:"1px solid #eadfdc",borderRadius:16,padding:22,boxShadow:"0 8px 24px #44223308"}
const panelTitle: CSSProperties = {fontFamily:"Georgia,serif",fontWeight:500,fontSize:22,margin:"0 0 8px"}
const muted: CSSProperties = {color:"#776a70",fontSize:13,margin:"0 0 4px"}
const statCard: CSSProperties = {background:"#fffdfb",border:"1px solid #eadfdc",borderRadius:14,padding:18}
const quickAction: CSSProperties = {display:"flex",alignItems:"center",gap:10,textAlign:"left",border:"1px solid #eadfdc",borderRadius:10,padding:13,background:"#fff",color:"#681b3b",cursor:"pointer"}
const secondaryButton: CSSProperties = {display:"inline-flex",alignItems:"center",justifyContent:"center",gap:8,border:"1px solid #e0d1d3",borderRadius:9,padding:"10px 12px",background:"#fffdfb",color:"#681b3b",cursor:"pointer",fontSize:13}
const linkButton: CSSProperties = {border:0,background:"transparent",color:"#681b3b",cursor:"pointer",fontWeight:600}
const thStyle: CSSProperties = {textAlign:"left",padding:"12px 10px",background:"#faf6f3",color:"#7d6c72",fontWeight:600,whiteSpace:"nowrap",borderBottom:"1px solid #eadfdc"}
const tdStyle: CSSProperties = {padding:"13px 10px",borderBottom:"1px solid #f0e8e6",verticalAlign:"top",maxWidth:280,overflowWrap:"anywhere"}
const fieldStyle: CSSProperties = {display:"flex",flexDirection:"column",gap:6,fontSize:13,color:"#584950",minWidth:0}
const inputStyle: CSSProperties = {width:"100%",boxSizing:"border-box",border:"1px solid #ddced2",borderRadius:8,padding:"10px 11px",background:"#fff",font:"inherit",color:"#30252a"}
const formGrid: CSSProperties = {display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:14}
const searchStyle: CSSProperties = {display:"flex",alignItems:"center",gap:9,border:"1px solid #e0d1d3",borderRadius:9,padding:"9px 11px",background:"white",color:"#806d75"}
const iconButton: CSSProperties = {border:"1px solid #eadfdc",background:"#fffdfb",borderRadius:7,padding:7,cursor:"pointer",color:"#681b3b",marginRight:5}
const errorBox: CSSProperties = {display:"flex",alignItems:"flex-start",gap:9,padding:12,border:"1px solid #efc5c5",borderRadius:9,background:"#fff0f0",color:"#9b2833",fontSize:13,marginBottom:16}
const successBox: CSSProperties = {display:"flex",alignItems:"center",gap:9,padding:12,border:"1px solid #c7e5d1",borderRadius:9,background:"#effaf2",color:"#206b3b",fontSize:13,marginBottom:16}
const modalScrim: CSSProperties = {position:"fixed",inset:0,zIndex:1000,background:"#21101888",display:"grid",placeItems:"center",padding:18}
const modalPanel: CSSProperties = {width:"min(760px,100%)",maxHeight:"92vh",overflowY:"auto",background:"#fffdfb",borderRadius:16,padding:24,boxShadow:"0 25px 80px #16071144"}
