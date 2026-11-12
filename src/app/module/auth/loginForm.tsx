"use client"

import AppField from "@/components/shared/form/Appfield"
import AppSubmitButton from "@/components/shared/form/AppSubmitButton"
import { Button } from "@/components/ui/button"
import { useForm } from "@tanstack/react-form"
import { Eye, EyeOff } from "lucide-react"
import { FcGoogle } from "react-icons/fc"
import { useState } from "react"

export type LoginFormValues = {
  email: string
  password: string
}

type LoginActionResult = {
  success: boolean
  message: string
}

type LoginFormProps = {
  onSubmit?: (
    values: LoginFormValues
  ) => void | LoginActionResult | Promise<void | LoginActionResult>
  onGoogleLogin?: () => void | Promise<void>
}

const LoginForm = ({ onSubmit, onGoogleLogin }: LoginFormProps) => {
  const [showPassword, setShowPassword] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    } satisfies LoginFormValues,
    onSubmit: async ({ value }) => {
      setSubmitError(null)
      const result = await onSubmit?.(value)
      if (result && !result.success) {
        setSubmitError(result.message)
      }
    },
  })

  return (
    <form
      className="space-y-4"
      noValidate
      onSubmit={async (event) => {
        event.preventDefault()
        event.stopPropagation()
        if (!onSubmit) return
        await form.handleSubmit()
      }}
    >
      {submitError && (
        <p className="text-sm text-destructive" role="alert">
          {submitError}
        </p>
      )}
      <form.Field
        name="email"
        validators={{
          onBlur: ({ value }) => {
            if (!value.trim()) return "Email is required"
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
              ? undefined
              : "Enter a valid email address"
          },
        }}
      >
        {(field) => (
          <AppField
            field={field}
            label="Email"
            placeholder="you@example.com"
            type="email"
          />
        )}
      </form.Field>

      <form.Field
        name="password"
        validators={{
          onBlur: ({ value }) =>
            value ? undefined : "Password is required",
        }}
      >
        {(field) => (
          <AppField
            field={field}
            label="Password"
            placeholder="Enter your password"
            type={showPassword ? "text" : "password"}
            append={
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((shown) => !shown)}
                className="text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="size-4" aria-hidden="true" />
                ) : (
                  <Eye className="size-4" aria-hidden="true" />
                )}
              </button>
            }
          />
        )}
      </form.Field>

      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isPending) => (
          <>
            <AppSubmitButton isPending={isPending} disabled={!onSubmit}>
              Sign in
            </AppSubmitButton>
            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <p className="relative mx-auto w-fit bg-card px-2 text-sm text-muted-foreground">
                or
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={!onGoogleLogin || isPending}
              onClick={() => onGoogleLogin?.()}
            >
              <FcGoogle aria-hidden="true" />
              Continue with Google
            </Button>
          </>
        )}
      </form.Subscribe>
    </form>
  )
}

export { LoginForm }
export default LoginForm