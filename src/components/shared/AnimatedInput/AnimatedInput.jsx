"use client";

import { useState } from "react";
import { TypeAnimation } from "react-type-animation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function AnimatedInput({
  className,
  state,
  sequence,
  setState,
  onSubmit,
}) {
  const [hasFocused, setHasFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "relative mx-auto mt-11 flex h-14 justify-center rounded-full bg-white md:w-[32.125rem]",
        className
      )}
    >
      <Input
        type="text"
        aria-label="Search"
        className="absolute inset-0 z-10 h-14 rounded-full pr-[7.35rem] pl-5 text-text-dark md:w-[32.125rem] md:pr-[10rem] md:pl-[37px]"
        value={state}
        onFocus={() => setHasFocused(true)}
        onBlur={() => setHasFocused(false)}
        onChange={(e) => setState(e.target.value)}
      />

      <Button
        type="submit"
        className="absolute right-0 top-0 z-20 h-14 w-[6.5rem] rounded-r-full bg-title-light text-sm text-button hover:bg-title-light/90 md:w-[9.625rem]"
      >
        Search Now
      </Button>

      {!hasFocused && !state && (
        <div className="pointer-events-none absolute left-5 top-1/2 z-0 -translate-y-1/2 text-text-dark md:left-[37px]">
          <TypeAnimation
            sequence={sequence}
            cursor
            repeat={Infinity}
            wrapper="span"
            speed={50}
          />
        </div>
      )}
    </form>
  );
}
