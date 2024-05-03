import z from "zod";

export const signupInput = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().optional()
})

export const signinInput = z.object({
    email: z.string().email(),
    password: z.string().min(6),
})

export const createBlogInput = z.object({
    title: z.string(),
    content: z.string()
})

export const updateBlogInput = z.object({
    title: z.string(),
    content: z.string(),
    id: z.string()
})


export type signupType = z.infer<typeof signupInput>
export type signinType = z.infer<typeof signinInput>
export type createBlogType = z.infer<typeof createBlogInput>
export type updateBlogType = z.infer<typeof updateBlogInput>