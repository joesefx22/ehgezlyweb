"use client";

import { AnimatePresence, motion } from "framer-motion";
import { create } from "zustand";
import { Check, X, Info } from "lucide-react";
import clsx from "clsx";

type ToastType = "success" | "error" | "info";

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastStore {
  toasts: ToastMessage[];
  show: (message: string, type?: ToastType) => void;
  remove: (id: string) => void;
}

export const useToast = create<ToastStore>((set) => ({
  toasts: [],
  show: (message, type = "info") =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        { id: crypto.randomUUID(), message, type },
      ],
    })),

  remove: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));

export default function ToastContainer() {
  const { toasts, remove } = useToast();

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 40, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            className={clsx(
              "px-5 py-3 rounded-xl shadow-lg text-white flex items-center gap-3 border backdrop-blur-xl",
              toast.type === "success" &&
                "bg-green-600/90 border-green-400",
              toast.type === "error" &&
                "bg-red-600/90 border-red-400",
              toast.type === "info" &&
                "bg-blue-600/90 border-blue-400"
            )}
          >
            {toast.type === "success" && <Check size={20} />}
            {toast.type === "error" && <X size={20} />}
            {toast.type === "info" && <Info size={20} />}

            <p className="text-sm font-medium">{toast.message}</p>

            <button
              onClick={() => remove(toast.id)}
              className="ml-2 opacity-80 hover:opacity-100"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
