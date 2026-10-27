import { useCallback, useEffect, useState } from "react"
import { AlertCircle, LoaderCircle } from "lucide-react"
import { AuthExperience, registeredBusinessFromRow } from "./Onboarding"
import type { RegisteredBusiness } from "./Onboarding"
import LiveWorkspace from "./LiveWorkspace"
import { requireSupabase } from "./lib/supabase"

/**
 * Production path for Utsavkosh. There is intentionally no demo workspace:
 * every signed-in user either opens a business owned by their Supabase user ID
 * or completes the real business registration flow.
 */
export default function App() {
  const [checking, setChecking] = useState(true)
  const [business, setBusiness] = useState<RegisteredBusiness | null>(null)
  const [authEntry, setAuthEntry] = useState<"login" | "welcome">("login")
  const [startupError, setStartupError] = useState("")
  const [authRevision, setAuthRevision] = useState(0)

  const loadCurrentBusiness = useCallback(async () => {
    setStartupError("")
    const client = requireSupabase()
    const { data: sessionData, error: sessionError } = await client.auth.getSession()
    if (sessionError) throw sessionError
    const user = sessionData.session?.user
    if (!user) {
      setBusiness(null)
      setAuthEntry("login")
      return
    }
    const { data, error } = await client
      .from("businesses")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
    if (error) throw new Error(`Signed in, but the business lookup failed: ${error.message}`)
    if (data) {
      setBusiness(registeredBusinessFromRow(data as Record<string, unknown>))
    } else {
      setBusiness(null)
      setAuthEntry("welcome")
    }
  }, [])

  useEffect(() => {
    let mounted = true
    const start = async () => {
      try {
        await loadCurrentBusiness()
      } catch (error) {
        if (mounted) setStartupError(error instanceof Error ? error.message : "Could not restore your Utsavkosh session.")
      } finally {
        if (mounted) setChecking(false)
      }
    }
    void start()
    let subscription: { unsubscribe: () => void } | undefined
    try {
      const client = requireSupabase()
      const result = client.auth.onAuthStateChange((_event, session) => {
        if (!mounted) return
        if (!session) {
          setBusiness(null)
          setAuthEntry("login")
          setChecking(false)
        } else {
          // Let the auth callback finish before making follow-up Supabase calls.
          window.setTimeout(() => {
            if (mounted) setAuthRevision(value => value + 1)
          }, 0)
        }
      })
      subscription = result.data.subscription
    } catch (error) {
      if (mounted) setStartupError(error instanceof Error ? error.message : "Supabase configuration is missing.")
    }
    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [loadCurrentBusiness])

  useEffect(() => {
    if (authRevision === 0) return
    let mounted = true
    void loadCurrentBusiness().catch(error => {
      if (mounted) setStartupError(error instanceof Error ? error.message : "Could not load your business.")
    })
    return () => { mounted = false }
  }, [authRevision, loadCurrentBusiness])

  const onBusinessCreated = (savedBusiness: RegisteredBusiness) => {
    setBusiness(savedBusiness)
    setStartupError("")
  }

  const signOut = async () => {
    try {
      await requireSupabase().auth.signOut()
    } finally {
      setBusiness(null)
      setAuthEntry("login")
      setStartupError("")
    }
  }

  if (checking) return <main className="auth-page" style={{display:"grid",placeItems:"center",minHeight:"100vh",gap:12}}><LoaderCircle size={24} className="spin"/><p>Loading your saved Utsavkosh workspace…</p></main>

  if (business) return <LiveWorkspace business={business} onSignOut={() => { void signOut() }} />

  return <>
    {startupError && <div role="alert" style={{position:"fixed",zIndex:2000,top:12,left:"50%",transform:"translateX(-50%)",width:"min(680px,calc(100% - 24px))",padding:14,background:"#fff0f0",border:"1px solid #e8bcbc",borderRadius:10,color:"#8c202b",display:"flex",gap:10,alignItems:"flex-start",fontSize:13}}><AlertCircle size={18}/><span>{startupError}</span><button onClick={()=>{setStartupError("");setChecking(true);void loadCurrentBusiness().catch(e=>setStartupError(e instanceof Error?e.message:"Could not reload workspace.")).finally(()=>setChecking(false))}} style={{marginLeft:"auto"}}>Retry</button></div>}
    <AuthExperience key={`${authEntry}-${authRevision}`} initialScreen={authEntry} onBusinessCreated={onBusinessCreated} />
  </>
}
