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
  src, alt, credit, creditHref, className = "", sizes = "(max-width: 900px) 100vw, 50vw", priority = false
}: Props) {
  const reducedMotion = useReducedMotion() === true;
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
      <figcaption>
        <a href={creditHref} target="_blank" rel="noopener noreferrer" aria-label={"Photo by " + credit + " on Unsplash (opens in new tab)"}>
          Photo: {credit} / Unsplash
        </a>
      </figcaption>
    </motion.figure>
  );
}
