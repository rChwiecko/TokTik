"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";

export const completeOnboarding = async (formData: FormData) => {
    const client = await clerkClient();
    const { userId } = await auth();

    if (!userId) {
        return { message: "No Logged In User" };
    }

    try {
        const preferences = JSON.parse(formData.get("preferences") as string || "[]");

        await client.users.updateUser(userId, {
            publicMetadata: {
                onboardingComplete: true,
                applicationName: formData.get("applicationName"),
                applicationType: formData.get("applicationType"),
                preferences: preferences, // Add preferences to metadata
            }
        });
        return { message: "User metadata Updated" };
    } catch (e) {
        console.log("error", e);
        return { message: "Error Updating User Metadata" };
    }
};