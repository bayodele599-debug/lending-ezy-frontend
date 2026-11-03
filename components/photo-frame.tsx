"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import useStableReducedMotion from "../lib/use-stable-reduced-motion";

type Props = {
  src: string;
  alt: string;
  credit: string;
  creditHref: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

export default function PhotoFrame({
  src, alt, className = "", sizes = "(max-width: 900px) 100vw, 50vw", priority = false
}: Props) {
  const reducedMotion = useStableReducedMotion();
  // Image credits and licence references are maintained in README.md.
  // The image is intentionally free of visual labels and clickable overlays.
  return (
    <motion.figure
      className={"editorial-photo " + className}
      initial={reducedMotion ? false : { opacity: 1, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: reducedMotion ? 0 : 0.7, ease: "easeOut" }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        unoptimized
        priority={priority}
        sizes={sizes}
      />
    </motion.figure>
  );
}
