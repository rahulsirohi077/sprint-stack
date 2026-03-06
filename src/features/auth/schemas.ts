import z from "zod";

export const loginSchema = z.object({
    email: z.email().trim(),
    password: z.string().min(1, "Required"),
})

export const signUpSchema = z.object({
    name: z.string().trim().min(1,"Required"),
    email: z.email().trim(),
    password: z.string().min(8, "minimum of 8 characters required"),
})