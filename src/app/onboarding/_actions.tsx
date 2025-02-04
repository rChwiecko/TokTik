"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import getEmbedding from "../../utils/embedding"; // Ensure this function exists
import { prisma } from "@/lib/prisma"; // Import Prisma Client

export const completeOnboarding = async (formData: FormData) => {
  const client = await clerkClient();
  const { userId } = await auth();

  if (!userId) {
    return { message: "No Logged In User" };
  }

  try {
    console.log("Updating User Metadata HEYYYYY");
    const preferences = JSON.parse(
      (formData.get("preferences") as string) || "[]"
    );
    console.log("Preferences: ", preferences);
    // Validate `preferences`
    if (!Array.isArray(preferences) || preferences.length === 0) {
      throw new Error("Preferences must be a non-empty array.");
    }

    // ✅ Generate embedding vector
    const embeddingArray = await getEmbedding(preferences.join(" "));

    // Validate embedding before storing in Prisma
    if (!Array.isArray(embeddingArray) || embeddingArray.some(isNaN)) {
      throw new Error("Generated embedding is invalid.");
    }
    const prismaPayload = {
      where: { userId },
      update: { embedding: JSON.stringify(embeddingArray) },
      create: {
        userId,
        preferences: JSON.stringify(preferences),
        embedding: JSON.stringify(embeddingArray),
      },
    };
    // ✅ Store only the embedding in Prisma
    try {
      console.log("🔄 Attempting to store embedding in Prisma...");

      // Ensure all values are formatted correctly
      const prismaUserId = String(userId);
      const preferencesString = JSON.stringify(preferences);
      const embeddingString = JSON.stringify(embeddingArray);

      console.log("🆔 ID: ", prismaUserId);
      console.log("🎨 Preferences: ", typeof preferencesString);
      console.log("🧠 Embedding: ", typeof embeddingString);

      await prisma.userPreference.upsert({
        where: { userId: prismaUserId },
        update: {
          preferences: preferencesString,
          embedding: embeddingString
        },
        create: {
          userId: prismaUserId,
          preferences: preferencesString,
          embedding: embeddingString,
        },
      });

      console.log("✅ Stored Embedding in DB Successfully");
    } catch (prismaError) {
      console.error("❌ Prisma upsert failed:", prismaError);
    }

    console.log("Stored Embedding in DB Successfully");

    // ✅ Ensure Clerk metadata payload is valid
    const applicationName = formData.get("applicationName") || "Unknown";
    const applicationType = formData.get("applicationType") || "Unknown";
    const updatePayload = {
      onboardingComplete: true,
      applicationName,
      applicationType,
      preferences,
    };
    console.log("test: ", updatePayload);
    await client.users.updateUser(userId, {
      publicMetadata: updatePayload,
    });

    console.log("Updated User Metadata Successfully");

    return { message: "User metadata Updated" };
  } catch (e) {
    console.error("❌ Error Updating User Metadata:", e);
    return { message: "Error Updating User Metadata" };
  }
};
