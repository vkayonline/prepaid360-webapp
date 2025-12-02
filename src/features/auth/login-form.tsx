import { cn } from "@/commons/lib/utils"
import { Button } from "@/commons/components/ui/button"
import { Card, CardContent } from "@/commons/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/commons/components/ui/field"
import { Input } from "@/commons/components/ui/input"
import { Ripple } from "@/commons/components/ui/ripple.jsx"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useSessionStore } from "@/commons/store/session"
import { checkAuthOptions, login, getMe } from "@/commons/api"
import abcd_logo from "@/assets/abcd.png";

function EmailForm({
  onSubmit,
  setEmail,
}: {
  onSubmit: () => void
  setEmail: (email: string) => void
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
      className="p-6 md:p-8"
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Welcome</h1>
          <p className="text-muted-foreground text-balance">
            Sign in to continue
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            required
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field>
          <Button type="submit">Login</Button>
        </Field>
        <FieldDescription className="px-6 text-center">
          By clicking continue, you agree to our <br />
          <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
        </FieldDescription>
      </FieldGroup>
    </form>
  )
}

function PasswordForm({
  email,
  onSubmit,
}: {
  email: string
  onSubmit: (password: string) => void
}) {
  const [password, setPassword] = useState("")
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit(password)
      }}
      className="p-6 md:p-8"
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground text-balance">
            Enter your password
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            required
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        <Field>
          <Button type="submit">Login</Button>
        </Field>
      </FieldGroup>
    </form>
  )
}

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [step, setStep] = useState<"email" | "password">("email")
  const [email, setEmail] = useState("")
  const navigate = useNavigate()
  const setUser = useSessionStore((state) => state.setUser)
  const checkSession = useSessionStore((state) => state.checkSession)

  const handleEmailSubmit = async () => {
    try {
      const data = await checkAuthOptions(email);
      if (data["password-enabled"]) {
        setStep("password")
      } else if (data["sso-enabled"]) {
        alert("SSO login is enabled for your account. SSO flow is not implemented yet.")
      } else {
        alert("Login method not available.")
      }
    } catch (error: any) {
      console.error("Login error:", error)
      alert(error.message || "An unexpected error occurred. Please try again.")
    }
  }

  const handlePasswordSubmit = async (password: string) => {
    try {
      await login(email, password);
      await login(email, password);
      await checkSession();
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error)
      alert(error.message || "An unexpected error occurred. Please try again.")
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="p-0 md:grid md:grid-cols-2">
          {/* LEFT — IMAGE + RIPPLE (hidden on mobile) */}
          <div className="relative hidden h-[500px] w-full overflow-hidden md:block">
            <div className="absolute inset-0 z-10 flex items-center justify-center">
              <img
                src={abcd_logo}
                alt="Logo"
                className="h-20 w-20 object-contain"
              />
            </div>
            <Ripple />
          </div>

          {/* RIGHT — FORM */}
          <div className="flex flex-col justify-center p-6">
            {step === "email" ? (
              <EmailForm onSubmit={handleEmailSubmit} setEmail={setEmail} />
            ) : (
              <PasswordForm email={email} onSubmit={handlePasswordSubmit} />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
