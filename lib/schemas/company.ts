import { z } from "zod";

export const companyCreateSchema = z.object({
  name: z.string().min(1, "Nom requis"),
  shortName: z.string().optional(),
  description: z.string().optional(),
  logo: z.string().optional(),
  icon: z.string().optional(),
  currency: z.enum(["USD", "CDF"]),
  country: z.string().optional(),
  province: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  webSiteUrl: z.string().optional(),
  motto: z.string().optional(),
  phone1: z.string().optional(),
  phone2: z.string().optional(),
  email: z.string().email().optional(),
  status: z.enum(["ENABLED", "DISABLED"]).default("ENABLED"),
});

export const companyUpdateSchema = companyCreateSchema.partial().extend({
  code: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  currency: z.enum(["USD", "CDF"]).optional(),
});

export type CompanyCreateInput = z.infer<typeof companyCreateSchema>;
export type CompanyUpdateInput = z.infer<typeof companyUpdateSchema>;
