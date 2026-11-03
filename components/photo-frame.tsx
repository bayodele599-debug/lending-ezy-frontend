"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

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
  const reducedMotion = useReducedMotion() === true;
  // Image credits and licence references are maintained in README.md.
  // The image is intentionally free of visual labels and clickable overlays.
  return (
    <motion.figure
      className={"editorial-photo " + className}
      initial={reducedMotion ? false : { opacity: 0, y: 20 }}
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
