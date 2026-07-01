import { z } from "zod";

export const partnerCreateSchema = z.object({
  code: z.string().min(1, "Code requis"),
});

export const partnerUpdateSchema = partnerCreateSchema.partial().extend({
  code: z.string().optional(),
});

export type PartnerCreateInput = z.infer<typeof partnerCreateSchema>;
export type PartnerUpdateInput = z.infer<typeof partnerUpdateSchema>;
