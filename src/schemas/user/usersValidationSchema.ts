import { z } from 'zod';

const inProgressZodSchema = z.object({
    status: z.enum(['wait_to_confirm', 'wait_to_complete', 'wait_to_verify', 'email_change', 'done']),
    code: z.string(),
});

export const userLoginZodSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8).max(16),
});

const twoFactorSecretZodSchema = z.object({
    secret: z.string().optional(),
    qrcode: z.string().optional(),
    active: z.boolean(),
});

const usersZodSchema = z.object({
    _id: z.string().length(24).optional(),
    inProgress: inProgressZodSchema,
    providerId: z.string().or(z.null()).optional(),
    email: z.string().email(),
    password: z.string().min(8).max(16),
    nickname: z.string().max(32).optional(),
    tag: z.string().length(5).optional(),
    picture: z.string().max(120).or(z.null()),
    twoFactorSecret: twoFactorSecretZodSchema,
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
});

export const emailUpdateZodSchema = z.object({
    email: z.string().email(),
});

export type User = z.infer<typeof usersZodSchema>;
export type UserLogin = z.infer<typeof userLoginZodSchema>;
export type UserTwoFactor = z.infer<typeof twoFactorSecretZodSchema>;

export default usersZodSchema;
