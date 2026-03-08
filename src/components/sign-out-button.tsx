"use client"

import { signOut } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { SignOut } from "@phosphor-icons/react"

export function SignOutButton() {
  const router = useRouter()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={async () => {
        await signOut()
        router.push("/")
      }}
    >
      <SignOut className="size-4" />
      Sair
    </Button>
  )
}
