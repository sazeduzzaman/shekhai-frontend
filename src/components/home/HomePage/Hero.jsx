"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AnimatedInput from "@/components/shared/AnimatedInput/AnimatedInput";

export default function Hero() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [homeData, setHomeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch homepage data
  useEffect(() => {
    const fetchHomePageData = async () => {
      try {
        const response = await fetch('https://shekhai-server.onrender.com/api/v1/homepage');

        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const data = await response.json();
        setHomeData(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomePageData();
  }, []);

  console.log(homeData?.data?.hero, "homeData");
  const data = homeData?.data?.hero || {};

  // Default values while loading or if data is not available
  const title = data.title || "Get Your Study Done";
  const subtitle = data.subtitle ||
    "Browse through Thousands of StudyBit. Choose one you trust. Pay as you go.";
  const searchPlaceholder = data.search_placeholder || "I want to learn Cooking";
  const backgroundImage = data.background_image || null;

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
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  // Show loading state
  if (loading) {
    return (
      <section className="body-font relative isolate min-h-[24rem] overflow-hidden bg-title-two bg-scroll bg-repeat-x text-gray-600 after:absolute after:inset-0 after:-z-[1] after:bg-[url('/hero-mesh.png')] after:opacity-25 after:content-['']">
        <div className="container mx-auto flex flex-col items-center justify-center px-5 py-24">
          <div className="w-full text-center lg:w-2/3">
            <div className="animate-pulse">
              <div className="h-12 bg-gray-300 rounded mb-4 mx-auto max-w-md"></div>
              <div className="h-6 bg-gray-300 rounded mb-8 mx-auto max-w-lg"></div>
              <div className="h-12 bg-gray-300 rounded mx-auto max-w-md"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Show error state
  if (error) {
    return (
      <section className="body-font relative isolate min-h-[24rem] overflow-hidden bg-title-two bg-scroll bg-repeat-x text-gray-600 after:absolute after:inset-0 after:-z-[1] after:bg-[url('/hero-mesh.png')] after:opacity-25 after:content-['']">
        <div className="container mx-auto flex flex-col items-center justify-center px-5 py-24">
          <div className="w-full text-center lg:w-2/3">
            <h1 className="mb-4 text-3xl font-medium text-title-light text-shadow-[2px_2px_4px_rgba(0,_0,_0,_0.7)] md:text-[3.5rem]">
              Get Your Study Done
            </h1>
            <p className="text-sm leading-relaxed text-white">
              Browse through Thousands of StudyBit. Choose one you trust. Pay as you go.
            </p>
            <AnimatedInput
              className="mt-8"
              state={query}
              setState={setQuery}
              onSubmit={handleSearch}
              sequence={["I want to learn Cooking", 1800, "I want to learn Mathematics", 1200, "I want to learn Programming", 1500]}
            />
          </div>
        </div>
      </section>
    );
  }

  // Background style with image
  const backgroundStyle = backgroundImage
    ? {
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }
    : {};

  return (
    <section
      className="body-font relative isolate min-h-[24rem] overflow-hidden text-gray-600 after:absolute after:inset-0 after:-z-[1] after:bg-black after:opacity-50 after:content-['']"
      style={backgroundStyle}
    >
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black opacity-40 -z-[1]"></div>

      <div className="container relative z-10 mx-auto flex flex-col items-center justify-center px-5 py-24">
        <div className="w-full text-center lg:w-2/3">
          <h1 className="mb-4 text-3xl font-medium text-white text-shadow-[2px_2px_4px_rgba(0,_0,_0,_0.7)] md:text-[3.5rem]">
            {title}
          </h1>

          <p className="text-sm leading-relaxed text-white text-shadow">
            {subtitle}
          </p>

          {/* Animated Search Input */}
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