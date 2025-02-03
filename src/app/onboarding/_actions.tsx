"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import getEmbedding from "../../utils/embedding";

export const completeOnboarding = async (formData: FormData) => {
  const client = await clerkClient();
  const { userId } = await auth();

  if (!userId) {
    return { message: "No Logged In User" };
  }

  try {
    const preferences = JSON.parse(
      (formData.get("preferences") as string) || "[]"
    );

    // Validate `preferences` before using it
    if (!Array.isArray(preferences) || preferences.length === 0) {
      throw new Error("Preferences must be a non-empty array.");
    }

    // Generate embeddings
    const preferenceVector = await getEmbedding(preferences.join(" ")); // Ensure valid string input
    console.log("Generated Embedding Vector:", preferenceVector);

    // Validate embedding before sending to Clerk
    if (!Array.isArray(preferenceVector) || preferenceVector.some(isNaN)) {
      throw new Error("Generated embedding is invalid.");
    }

    // Update user metadata
    await client.users.updateUser(userId, {
      publicMetadata: {
        onboardingComplete: true,
        applicationName: formData.get("applicationName"),
        applicationType: formData.get("applicationType"),
        preferences: preferences,
        preferenceVector: 0, // Must be JSON serializable
      },
    });
    console.log("Updated User Metadata Type", type(preferenceVector));
    return { message: "User metadata Updated" };
  } catch (e) {
    console.error("❌ Error Updating User Metadata:", e);
    return { message: "Error Updating User Metadata" };
  }
};

function type(variable: any): string {
  return Object.prototype.toString.call(variable).slice(8, -1);
}
