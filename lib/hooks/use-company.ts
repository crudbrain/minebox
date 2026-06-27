import { useQuery } from "@tanstack/react-query";
import { getCompany } from "@/lib/api/company";

export function useCompany() {
  return useQuery({
    queryKey: ["company"],
    queryFn: getCompany,
    retry: false,
  });
}
