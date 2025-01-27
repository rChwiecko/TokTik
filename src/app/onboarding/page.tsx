"use client"

import * as React from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Gamepad2, Plane, Music2, Film, Dumbbell, Palette, ChefHat, Trophy } from "lucide-react"
import { completeOnboarding } from "./_actions"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

const genres = [
  { name: "Sports", icon: Trophy },
  { name: "Video Games", icon: Gamepad2 },
  { name: "Travel", icon: Plane },
  { name: "Music", icon: Music2 },
  { name: "Movies", icon: Film },
  { name: "Fitness", icon: Dumbbell },
  { name: "Art", icon: Palette },
  { name: "Cooking", icon: ChefHat },
]

export default function OnboardingComponent() {
  const { user } = useUser()
  const router = useRouter()
  const [selectedGenres, setSelectedGenres] = React.useState<string[]>([])

  const progress = (selectedGenres.length / 3) * 100 // Assuming we want users to select at least 3

  const handleGenreToggle = (genre: string) => {
    setSelectedGenres((prev) => (prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const formData = new FormData()
    formData.append("preferences", JSON.stringify(selectedGenres))
    await completeOnboarding(formData)
    await user?.reload()
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background px-4">
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full space-y-8 rounded-xl border bg-card p-8 shadow-lg"
        >
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold tracking-tight">Welcome!</h1>
            <p className="text-muted-foreground">Let's personalize your experience. What interests you?</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Select at least 3 interests</span>
                <span className="font-medium">{selectedGenres.length} selected</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {genres.map(({ name, icon: Icon }) => (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    key={name}
                    onClick={() => handleGenreToggle(name)}
                    className={cn(
                      "group flex flex-col items-center justify-center rounded-lg border border-border p-4 text-center transition-colors hover:bg-accent",
                      selectedGenres.includes(name) && "border-primary bg-primary/5 text-primary",
                    )}
                  >
                    <Icon
                      className={cn(
                        "mb-2 h-8 w-8",
                        selectedGenres.includes(name)
                          ? "text-primary"
                          : "text-muted-foreground group-hover:text-foreground",
                      )}
                    />
                    <span className="text-sm font-medium">{name}</span>
                  </motion.button>
                ))}
              </div>

              <button
                type="submit"
                disabled={selectedGenres.length < 3}
                className="w-full rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continue
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

