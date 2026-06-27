import { z } from "zod";

export const transactionCreateSchema = z.object({
  date: z.string().datetime().or(z.date()),
  amount: z.number().positive("Le montant doit être positif"),
  goldQuantity: z.string().optional(),
  title: z.string().optional(),
  message: z.string().default(""),
  type: z.enum(["DEPOSIT", "WITHDRAWAL", "TRANSFER"]),
  accountId: z.string().min(1, "Compte requis"),
});

export const transactionUpdateSchema = transactionCreateSchema.partial().extend({
  accountId: z.string().optional(),
});

export type TransactionCreateInput = z.infer<typeof transactionCreateSchema>;
export type TransactionUpdateInput = z.infer<typeof transactionUpdateSchema>;
