"use client";
import React from "react";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";

export default function ConfirmationDialog({ open, title, description, onCancel, onConfirm }: { open: boolean, title?: string, description?: string, onCancel: ()=>void, onConfirm: ()=>void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <motion.div initial={{ scale: 0.98, opacity:0 }} animate={{ scale: 1, opacity:1 }} className="z-[10000] bg-white dark:bg-zinc-900 rounded-lg p-4 max-w-md w-full shadow-lg">
        <h3 className="text-lg font-semibold">{title || "تأكيد"}</h3>
        <p className="text-sm text-zinc-500 mt-2">{description || "هل تريد المتابعة؟"}</p>
        <div className="mt-4 flex justify-end gap-2">
          <button className="px-3 py-2 rounded-lg bg-white/6" onClick={onCancel}>إلغاء</button>
          <Button onClick={onConfirm} className="bg-rose-600">نعم، تأكيد</Button>
        </div>
      </motion.div>
    </div>
  );
}
