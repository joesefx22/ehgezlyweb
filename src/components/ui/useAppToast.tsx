"use client";
import { useToast as useShadToast } from "@/components/ui/toast"; // adapt if your toast hook path is different

export default function useAppToast() {
  const toast = useShadToast();
  return {
    show: (message: string, type: "success"|"error"|"info" = "info") => {
      if (type === "success") toast.show(message, "success");
      else if (type === "error") toast.show(message, "error");
      else toast.show(message, "info");
    }
  };
}
