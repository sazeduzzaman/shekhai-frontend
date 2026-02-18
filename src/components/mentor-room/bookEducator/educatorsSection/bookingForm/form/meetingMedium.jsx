"use client";

import { BsChatRightText } from "react-icons/bs";
import { IoVideocamSharp } from "react-icons/io5";
import { MdHeadsetMic } from "react-icons/md";
import { useState } from "react";

export default function MeetingMedium({ onMethodChange, selectedMethod }) {
  const methods = [
    { id: "video", label: "Video Call", icon: IoVideocamSharp },
    { id: "chat", label: "Chat", icon: BsChatRightText },
    { id: "voice", label: "Voice Call", icon: MdHeadsetMic },
  ];

  return (
    <section>
      <Label className="mb-3 block font-semibold text-[#1E293B]">
        Meeting Medium
      </Label>
      <div className="flex items-center justify-between px-7">
        {methods.map((method) => {
          const Icon = method.icon;
          const isSelected = selectedMethod === method.id;
          
          return (
            <div
              key={method.id}
              onClick={() => onMethodChange(method.id)}
              className={`flex cursor-pointer flex-col items-center gap-y-2 transition-all ${
                isSelected ? "scale-110" : "opacity-70 hover:opacity-100"
              }`}
            >
              <span
                className={`inline-block rounded-full p-3 ${
                  isSelected
                    ? "border-3 border-base bg-base/10"
                    : "border-3 border-transparent"
                }`}
              >
                <Icon className={`text-2xl ${isSelected ? "text-base" : "text-gray-600"}`} />
              </span>
              <span className={`font-medium ${isSelected ? "text-base" : "text-gray-600"}`}>
                {method.label}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// Add this import at the top
import { Label } from "@/components/ui/label";