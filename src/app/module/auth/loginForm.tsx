"use client"

import AppField from "@/components/shared/form/Appfield"
import AppSubmitButton from "@/components/shared/form/AppSubmitButton"
import { useForm } from "@tanstack/react-form"
import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"

export type LoginFormValues = {
  email: string
  password: string
}

type LoginFormProps = {
  onSubmit?: (values: LoginFormValues) => void | Promise<void>
}

const LoginForm = ({ onSubmit }: LoginFormProps) => {
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    } satisfies LoginFormValues,
    onSubmit: async ({ value }) => {
      await onSubmit?.(value)
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
          <AppSubmitButton isPending={isPending} disabled={!onSubmit}>
            Sign in
          </AppSubmitButton>
        )}
      </form.Subscribe>
    </form>
  )
}

export { LoginForm }
export default LoginForm