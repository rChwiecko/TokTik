"use client";

import * as React from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { completeOnboarding } from "./_actions";

export default function OnboardingComponent() {
  const { user } = useUser();
  const router = useRouter();

  const genres = ["Sports", "Video Games", "Travel", "Music", "Movies", "Fitness", "Art", "Cooking"];
  const [selectedGenres, setSelectedGenres] = React.useState<string[]>([]);

  const handleGenreToggle = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("preferences", JSON.stringify(selectedGenres));

    await completeOnboarding(formData);
    await user?.reload();
    router.push("/dashboard");
  };

  return (
    <div className="px-8 py-12 sm:py-16 md:px-20">
      <div className="mx-auto bg-white overflow-hidden rounded-lg shadow-lg max-w-sm">
        <div className="p-8">
          <h3 className="text-xl font-semibold text-gray-900">Welcome!</h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 px-8 pb-8">
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                Preferences
              </label>
              <p className="text-xs text-gray-500">
                Select the genres you are interested in.
              </p>
              <div className="mt-2 space-y-2">
                {genres.map((genre) => (
                  <div key={genre} className="flex items-center">
                    <input
                      type="checkbox"
                      id={genre}
                      name="preferences"
                      value={genre}
                      checked={selectedGenres.includes(genre)}
                      onChange={() => handleGenreToggle(genre)}
                      className="h-4 w-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor={genre}
                      className="ml-2 text-sm font-medium text-gray-700"
                    >
                      {genre}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="px-8 py-4 bg-gray-50">
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
