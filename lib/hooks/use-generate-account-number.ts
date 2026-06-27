import { useQuery } from "@tanstack/react-query";
import { generateAccountNumber } from "@/lib/api/bank-accounts";

export function useGenerateAccountNumber(enabled: boolean = true) {
  return useQuery({
    queryKey: ["generate-account-number"],
    queryFn: generateAccountNumber,
    enabled,
  });
}
