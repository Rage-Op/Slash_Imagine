// create a register form schema using zod
import * as z from "zod";
import isDate from "validator/lib/isDate";
import isEmail from "validator/lib/isEmail";
import isMobilePhone from "validator/lib/isMobilePhone";
export const signupSchema = z
  .object({
    firstName: z
      .string()
      .min(2, { message: "First name must be at least 2 characters long" })
      .max(20, { message: "First name must not exceed 50 characters" }),
    lastName: z
      .string()
      .min(2, { message: "Last name must be at least 2 characters long" })
      .max(20, { message: "Last name must not exceed 50 characters" }),
    userName: z
      .string()
      .min(6, { message: "Username must be at least 6 characters long" })
      .max(20, { message: "Username must not exceed 20 characters" })
      .regex(/^[a-zA-Z0-9_]+$/, {
        message: "Username must contain only letters, numbers, and underscores",
      }),
    dob: z.date({
      required_error: "Date of birth is required",
      invalid_type_error: "Invalid date format for date of birth",
    }),
    email: z
      .string()
      .min(10, { message: "Email must be at least 10 characters long" })
      .refine((value) => isEmail(value), { message: "Invalid email format" }),
    contactNumber: z.string().refine((value) => isMobilePhone(value, "any"), {
      message: "Invalid contact number",
    }),
    country: z
      .string()
      .max(100, { message: "Country must not exceed 100 characters" })
      .optional(),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" })
      .max(100, { message: "Password must not exceed 100 characters" })
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        {
          message:
            "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
        }
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
