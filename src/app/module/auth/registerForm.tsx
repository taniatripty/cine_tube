"use client"

import AppSubmitButton from "@/components/shared/form/AppSubmitButton"
import AppField from "@/components/shared/form/Appfield"
import { Button } from "@/components/ui/button"
import { useForm } from "@tanstack/react-form"
import { Eye, EyeOff } from "lucide-react"
import { FcGoogle } from "react-icons/fc"
import { useState } from "react"

export type RegisterFormValues = {
  name: string
  email: string
  password: string
  confirmPassword: string
}

type RegisterFormProps = {
  onSubmit?: (values: RegisterFormValues) => void | Promise<void>
  onGoogleLogin?: () => void | Promise<void>
}

const RegisterForm = ({ onSubmit, onGoogleLogin }: RegisterFormProps) => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    } satisfies RegisterFormValues,
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
        name="name"
        validators={{
          onBlur: ({ value }) =>
            value.trim() ? undefined : "Name is required",
        }}
      >
        {(field) => (
          <AppField
            field={field}
            label="Name"
            placeholder="Your name"
            type="text"
          />
        )}
      </form.Field>

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
            value.length >= 8
              ? undefined
              : "Password must be at least 8 characters",
        }}
      >
        {(field) => (
          <AppField
            field={field}
            label="Password"
            placeholder="At least 8 characters"
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

      <form.Field
        name="confirmPassword"
        validators={{
          onChangeListenTo: ["password"],
          onBlur: ({ value, fieldApi }) =>
            value === fieldApi.form.getFieldValue("password")
              ? undefined
              : "Passwords do not match",
        }}
      >
        {(field) => (
          <AppField
            field={field}
            label="Confirm password"
            placeholder="Re-enter your password"
            type={showConfirmPassword ? "text" : "password"}
            append={
              <button
                type="button"
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
                aria-pressed={showConfirmPassword}
                onClick={() => setShowConfirmPassword((shown) => !shown)}
                className="text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? (
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
              Create account
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

export { RegisterForm }
export default RegisterForm