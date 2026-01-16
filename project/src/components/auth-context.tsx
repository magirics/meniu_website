"use client"

import "@/lib/auth"
import { getCurrentUser, fetchAuthSession } from "aws-amplify/auth"
import { useRouter } from "next/navigation"
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react"

type AuthUser = {
  id: string
  email?: string
  groups: string[]
}

type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  authenticated: boolean
  refresh: () => Promise<void>
}

const context = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  async function loadUser() {
    setLoading(true)

    try {
      const user = await getCurrentUser()
      const session = await fetchAuthSession()

      const groups =
        (session.tokens?.idToken?.payload["cognito:groups"] as string[]) ?? []

      setUser({
        id: user.userId || "Diego",
        email: user.signInDetails?.loginId || "diego.undefined@gmail.com",
        groups,
      })
    } catch (e) {
      console.error(e)
      // router.push("/sign-in")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUser()
  }, [])

  if (loading || !user) return null

  return (
    <context.Provider
      value={{
        user,
        loading,
        authenticated: !!user,
        refresh: loadUser,
      }}
    >
      {children}
    </context.Provider>
  )
}

export function useAuth() {
  const auth = useContext(context)
  if (!auth) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return auth
}
