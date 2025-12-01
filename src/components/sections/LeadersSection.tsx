"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { LeaderCategory, LeaderProfile } from "@/types";

interface LeaderSectionProps {
  principal: LeaderProfile & { speech: string };
  categories: LeaderCategory[];
}

const cardHover = { scale: 1.01 };

export function LeadersSection({ principal, categories }: LeaderSectionProps) {
  return (
    <section className="space-y-10 rounded-[32px] border border-slate-200 bg-white/70 p-8 shadow-[0_30px_90px_rgba(15,23,42,0.08)]">
      {/* Principal Leader Section - Photo Left, Speech Right */}
      <div className="rounded-3xl border border-slate-100 bg-gradient-to-br from-slate-50/80 to-white p-8">
        <div className="grid gap-8 lg:grid-cols-[300px,1fr]">
          <div className="flex flex-col items-center gap-4">
            <div className="relative h-64 w-64 overflow-hidden rounded-[32px] border-4 border-slate-200 bg-gradient-to-br from-slate-200 via-white to-slate-200 shadow-lg">
              <Image
                src={principal.photo}
                alt={`${principal.name} portrait`}
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold text-slate-900">
                {principal.name}
              </p>
              <p className="mt-1 text-base text-slate-500">{principal.title}</p>
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <p className="mb-4 text-sm uppercase tracking-[0.4em] text-slate-400">
              Message from the Administrator
            </p>
            <blockquote className="text-xl leading-relaxed text-slate-700 italic">
              "{principal.speech}"
            </blockquote>
          </div>
        </div>
      </div>

      {/* Leaders Grid */}
      <div className="space-y-8">
        {categories.map((category) => (
          <div key={category.id} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-slate-900">
                {category.title}
              </h3>
              <span className="text-xs font-medium uppercase tracking-[0.3em] text-slate-400">
                {category.leaders.length} leaders
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {category.leaders.map((leader) => (
                <motion.article
                  key={leader.name}
                  whileHover={cardHover}
                  className="flex flex-col items-center gap-4 rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50/70 to-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.08)] transition"
                >
                  <div className="relative h-32 w-32 overflow-hidden rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-slate-200 via-white to-slate-200 shadow-md">
                    <Image
                      src={leader.photo}
                      fill
                      alt={leader.name}
                      className="object-cover"
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-slate-900">
                      {leader.name}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {leader.title}
                    </p>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}


