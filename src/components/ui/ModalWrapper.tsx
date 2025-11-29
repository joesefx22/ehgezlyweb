// src/components/ui/ModalWrapper.tsx
"use client";
import React, { PropsWithChildren, useEffect } from "react";
import { motion } from "framer-motion";

export default function ModalWrapper({ children, onClose }: PropsWithChildren<{ onClose: () => void }>) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="z-[9999] w-full max-w-2xl mx-auto p-4">
        {children}
      </motion.div>
    </div>
  );
}
