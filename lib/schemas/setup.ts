import { z } from "zod";
import { companyCreateSchema } from "./company";

export const setupSchema = z.object({
  company: companyCreateSchema,
  admin: z.object({
    name: z.string().min(1, "Nom requis"),
    email: z.string().email("Email invalide"),
    password: z.string().min(6, "Mot de passe minimum 6 caractères"),
    confirmPassword: z.string().min(1, "Confirmation requise"),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  }),
});

export type SetupInput = z.infer<typeof setupSchema>;
