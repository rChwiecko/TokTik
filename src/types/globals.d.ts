export { };

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      onboardingComplete?: boolean;
      applicationName?: string;
      preferences?: string[];
      preferenceVector?: number[];
    };
    firstName?: string;
  }
}
