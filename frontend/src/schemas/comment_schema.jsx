import { z } from "zod";

// comment schema using zod
export const commentSchema = z.object({
  comment: z
    .string()
    .min(1, "Comment is required")
    .max(250, "Comment must be 250 characters or less"),
});
