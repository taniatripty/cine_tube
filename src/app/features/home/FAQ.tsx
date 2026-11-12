import Link from "next/link"
import { ArrowRight, CircleHelp } from "lucide-react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"

const faqItems = [
  {
    question: "What is CineTube?",
    answer:
      "CineTube helps you discover movies and shows, explore featured titles, and keep track of what you want to watch.",
  },
  {
    question: "How do I create an account?",
    answer:
      "Choose Create account and register with your name, email, and password. You can also continue with Google.",
  },
  {
    question: "Do I need to verify my email?",
    answer:
      "If email verification is required for your account, check your inbox for a verification link after registering.",
  },
  {
    question: "Can I sign in with Google?",
    answer:
      "Yes. Choose Continue with Google on the sign-in or registration form, then follow the prompts to authorize your account.",
  },
  {
    question: "How can I save a title for later?",
    answer:
      "Use the Add to list option on a title to keep it in your personal list.",
  },
]

export default function FAQ() {
  return (
    <section
      aria-labelledby="faq-heading"
      className="relative isolate w-full overflow-hidden border-y border-border/60 bg-muted/20 px-4 py-20 sm:px-6 lg:py-28"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -right-36 -top-40 size-120 rounded-full bg-red-600/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-36 size-104 rounded-full bg-red-600/5 blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:gap-16">
        <div className="lg:pt-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-600/20 bg-red-600/10 px-3 py-1.5 text-sm font-medium text-red-600">
            <CircleHelp className="size-4" aria-hidden="true" />
            Help center
          </div>
          <h2
            id="faq-heading"
            className="mt-6 max-w-lg text-4xl font-bold tracking-tight sm:text-5xl"
          >
            The details,
            <span className="block text-red-600">made simple.</span>
          </h2>
          <p className="mt-5 max-w-md text-base leading-7 text-muted-foreground">
            Find quick answers about discovering titles, creating an account,
            and getting started with CineTube.
          </p>

          <div className="mt-9 rounded-2xl border border-border/70 bg-card/80 p-5 shadow-lg shadow-black/5 backdrop-blur-sm sm:p-6">
            <p className="font-semibold">Ready to explore?</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Create an account to make the most of your CineTube experience.
            </p>
            <Button
              className="mt-5"
              nativeButton={false}
              render={<Link href="/register" />}
            >
              Create an account
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </div>

        <Accordion className="rounded-3xl border border-border/70 bg-card/80 p-3 shadow-xl shadow-black/5 backdrop-blur-sm sm:p-5">
          {faqItems.map((item, index) => (
            <AccordionItem
              key={item.question}
              value={`faq-${index + 1}`}
              className="border-border/70"
            >
              <AccordionTrigger className="gap-4 rounded-xl px-3 py-5 text-left text-base font-semibold hover:bg-muted/50 hover:no-underline sm:px-4">
                <span className="flex items-center gap-4">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-border bg-background text-xs font-semibold text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{item.question}</span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-5 pl-13 pr-10 text-sm leading-7 text-muted-foreground">
                <p>{item.answer}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}