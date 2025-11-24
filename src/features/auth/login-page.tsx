import { LoginForm } from "@/features/auth/login-form"

export default function LoginPage() {
  return (
      <div className="bg-muted flex min-h-svh items-center justify-center p-6 md:p-10">
          <LoginForm className="w-full max-w-sm md:max-w-4xl" />
      </div>

  )
}
