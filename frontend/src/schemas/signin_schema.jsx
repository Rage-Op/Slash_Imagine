import * as z from "zod";

// Create a sign-in form schema using Zod
export const signinSchema = z.object({
  userName: z
    .string()
    .min(6, { message: "Username must be at least 6 characters long" })
    .max(20, { message: "Username must not exceed 20 characters" })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "Username must contain only letters, numbers, and underscores",
    }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .max(100, { message: "Password must not exceed 100 characters" }),
});
