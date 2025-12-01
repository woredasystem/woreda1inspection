"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { HiQrCode } from "react-icons/hi2";
import Link from "next/link";

interface HeroSectionProps {
  logoPath: string;
  woredaName: string;
  title: string;
  subtitle: string;
  description: string;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export function HeroSection({
  logoPath,
  woredaName,
  title,
  subtitle,
  description,
}: HeroSectionProps) {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-gradient-to-br from-white via-slate-50/50 to-white p-10 shadow-[0_30px_90px_rgba(15,23,42,0.1)] backdrop-blur"
      variants={{ hidden: {}, visible: {} }}
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-gradient-to-br from-blue-200/30 via-purple-200/20 to-pink-200/30 blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, -40, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
          className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-gradient-to-br from-emerald-200/30 via-teal-200/20 to-cyan-200/30 blur-3xl"
        />
      </div>

      <div className="relative z-10">
        <motion.div
          variants={fadeInUp}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex items-center gap-4"
        >
          <div className="w-14 rounded-full border border-slate-200 bg-slate-50/80 p-2 backdrop-blur-sm">
            <Image
              src={logoPath}
              alt={`${woredaName} logo`}
              width={56}
              height={56}
              className="h-auto w-full object-contain"
              priority
            />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
              {woredaName}
            </p>
            <p className="text-lg font-semibold text-slate-800">{subtitle}</p>
          </div>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="mt-8 space-y-5 text-slate-800"
        >
          <h1 className="text-5xl font-semibold leading-tight tracking-tight text-slate-900 md:text-6xl">
            {title}
          </h1>
          <p className="max-w-3xl text-lg leading-relaxed text-slate-600">
            {description}
          </p>
        </motion.div>
      </div>

      {/* Animated gradient bottom border */}
      <motion.div
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 via-pink-500 to-blue-500 bg-[length:200%_100%]"
      />
    </motion.section>
  );
}


