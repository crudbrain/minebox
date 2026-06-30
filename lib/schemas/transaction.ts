import { z } from "zod";

const transactionBaseSchema = z.object({
  date: z.string().datetime().or(z.date()),
  amount: z.number().positive("Le montant doit être positif"),
  goldQuantity: z.string().optional(),
  title: z.string().optional(),
  message: z.string().default(""),
  type: z.enum(["DEPOSIT", "WITHDRAWAL", "TRANSFER"]),
  accountId: z.string().min(1, "Compte requis"),
  fromAccountId: z.string().optional(),
  toAccountId: z.string().optional(),
});

export const transactionCreateSchema = transactionBaseSchema.refine(
  (data) => {
    if (data.type === "TRANSFER") {
      return !!data.fromAccountId && !!data.toAccountId && data.fromAccountId !== data.toAccountId;
    }
    return true;
  },
  { message: "fromAccountId et toAccountId sont requis et doivent être différents pour un TRANSFER" }
);

export const transactionUpdateSchema = z.object({
  date: z.string().datetime().or(z.date()).optional(),
  amount: z.number().positive("Le montant doit être positif").optional(),
  goldQuantity: z.string().optional(),
  title: z.string().optional(),
  message: z.string().optional(),
});

export type TransactionCreateInput = z.infer<typeof transactionCreateSchema>;
export type TransactionUpdateInput = z.infer<typeof transactionUpdateSchema>;
