import { z } from "zod";

export const bankAccountCreateSchema = z.object({
  accountNumber: z.string().optional(),
  balance: z.number().default(0),
  avatar: z.string().optional(),
  firstName: z.string().min(1, "Prénom requis"),
  lastName: z.string().min(1, "Nom requis"),
  surname: z.string().optional(),
  gender: z.enum(["M", "F"]),
  phone: z.string().min(1, "Téléphone requis"),
  otherPhone: z.string().optional(),
  blocked: z.boolean().default(false),
  country: z.string().optional(),
  province: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
});

export const bankAccountUpdateSchema = bankAccountCreateSchema.partial().extend({
  accountNumber: z.string().optional(),
});

export type BankAccountCreateInput = z.infer<typeof bankAccountCreateSchema>;
export type BankAccountUpdateInput = z.infer<typeof bankAccountUpdateSchema>;
