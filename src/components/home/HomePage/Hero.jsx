"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AnimatedInput from "@/components/shared/AnimatedInput/AnimatedInput";

export default function Hero({ data = {} }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const title = data.title || "Get Your Study Done";
  const subtitle =
    data.subtitle ||
    "Browse through Thousands of StudyBit. Choose one you trust. Pay as you go.";

  const searchPlaceholder =
    data.search_placeholder || "I want to learn Cooking";

  // Animated sequence
  const sequenceItems = [
    searchPlaceholder,
    1800,
    "I want to learn Mathematics",
    1200,
    "I want to learn Programming",
    1500,
  ];

  // Handle search submit
  const handleSearch = () => {
    if (!query.trim()) return;

    // Example: redirect to search page
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <section className="body-font relative isolate min-h-[24rem] overflow-hidden bg-title-two bg-scroll bg-repeat-x text-gray-600 after:absolute after:inset-0 after:-z-[1] after:bg-[url('/hero-mesh.png')] after:opacity-25 after:content-['']">
      <div className="container mx-auto flex flex-col items-center justify-center px-5 py-24">
        <div className="w-full text-center lg:w-2/3">
          <h1 className="mb-4 text-3xl font-medium text-title-light text-shadow-[2px_2px_4px_rgba(0,_0,_0,_0.7)] md:text-[3.5rem]">
            {title}
          </h1>

          <p className="text-sm leading-relaxed text-white ">
            {subtitle}
          </p>

          {/* 🔥 Animated Search Input */}
          <AnimatedInput
            className="mt-8"
            state={query}
            setState={setQuery}
            onSubmit={handleSearch}
            sequence={sequenceItems}
          />
        </div>
      </div>
    </section>
  );
}
