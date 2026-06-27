import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPartners,
  getPartner,
  createPartner,
  updatePartner,
  deletePartner,
} from "@/lib/api/partners";

export function usePartners(params: {
  page: number;
  pageSize: number;
  search?: string;
  code?: string;
}) {
  return useQuery({
    queryKey: ["partners", params],
    queryFn: () => getPartners(params),
  });
}

export function usePartner(id: string) {
  return useQuery({
    queryKey: ["partner", id],
    queryFn: () => getPartner(id),
    enabled: !!id,
  });
}

export function useCreatePartner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPartner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners"] });
    },
  });
}

export function useUpdatePartner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updatePartner(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["partners"] });
      queryClient.invalidateQueries({ queryKey: ["partner", variables.id] });
    },
  });
}

export function useDeletePartner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePartner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners"] });
    },
  });
}
