import { z } from "zod";

export const transferCreateSchema = z.object({
  date: z.iso.datetime().or(z.date()),
  type: z.enum(["MONEY_TRANSFER", "GOLD_TRANSFER"]),
  amount: z.number().positive("Le montant doit être positif"),
  goldQuantity: z.string().optional(),
  sender: z.string().default(""),
  message: z.string().default(""),
  partnerId: z.string().min(1, "Partenaire requis"),
});

export const transferUpdateSchema = z.object({
  date: z.iso.datetime().or(z.date()).optional(),
  amount: z.number().positive("Le montant doit être positif").optional(),
  goldQuantity: z.string().optional(),
  sender: z.string().default(""),
  message: z.string().optional(),
});

export type TransferCreateInput = z.infer<typeof transferCreateSchema>;
export type TransferUpdateInput = z.infer<typeof transferUpdateSchema>;
