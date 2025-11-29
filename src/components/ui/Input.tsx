// src/components/ui/Input.tsx
"use client";
import React from "react";
import clsx from "clsx";

export default function Input(props: any) {
  return <input {...props} className={clsx("input-lux w-full", props.className)} />;
}
