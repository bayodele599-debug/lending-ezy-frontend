"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import useStableReducedMotion from "../lib/use-stable-reduced-motion";

type Props = { children: ReactNode; className?: string; delay?: number };

export default function Reveal({ children, className, delay = 0 }: Props) {
  const reducedMotion = useStableReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reducedMotion ? false : { opacity: 1, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: reducedMotion ? 0 : 0.62, delay: reducedMotion ? 0 : delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
