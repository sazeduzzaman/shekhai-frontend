"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, addDays } from "date-fns";
import { useState, useEffect } from "react";
import { BsChatRightText } from "react-icons/bs";
import { IoVideocamSharp } from "react-icons/io5";
import { MdHeadsetMic } from "react-icons/md";
import { IoIosArrowForward } from "react-icons/io";
import { CalendarIcon, Clock } from "lucide-react";
import toast from "react-hot-toast";

export default function Form({ instructors }) {
  console.log(instructors);

  const [data, setData] = useState({
    instructor: "",
    instructorId: "",
    method: "video",
    date: null,
    formattedDate: "",
    fromTime: "",
    toTime: "",
  });

  const [currentDate, setCurrentDate] = useState(null);
  const [isTimePopoverOpen, setIsTimePopoverOpen] = useState({
    from: false,
    to: false
  });

  useEffect(() => {
    const now = new Date();
    setCurrentDate(now);
  }, []);

  // Handle instructor selection
  const handleInstructorChange = (value) => {
    const selectedInstructor = instructors?.find(inst => inst.name === value);
    setData({
      ...data,
      instructor: value,
      instructorId: selectedInstructor?._id || ""
    });
  };

  // Handle meeting medium change
  const handleMethodChange = (method) => {
    setData({ ...data, method });
  };

  // Handle date selection from quick options
  const handleQuickDateSelect = (date) => {
    setData({
      ...data,
      date,
      formattedDate: format(date, "dd EEEEEE")
    });
  };

  // Handle date selection from calendar
  const handleCalendarDateSelect = (selectedDate) => {
    setData({
      ...data,
      date: selectedDate,
      formattedDate: format(selectedDate, "dd MMMM yyyy")
    });
  };

  // Handle time selection
  const handleTimeSelect = (type, time) => {
    if (type === 'from') {
      setData({ ...data, fromTime: time });
      setIsTimePopoverOpen({ ...isTimePopoverOpen, from: false });
    } else {
      setData({ ...data, toTime: time });
      setIsTimePopoverOpen({ ...isTimePopoverOpen, to: false });
    }
  };

  // Generate time slots from 9 AM to 9 PM
  const generateTimeSlots = (minTime = null) => {
    const slots = [];
    for (let hour = 9; hour <= 21; hour++) {
      for (let minute of ["00", "30"]) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute}`;
        if (minTime && timeString <= minTime) continue;
        slots.push(timeString);
      }
    }
    return slots;
  };

  // Generate next 3 days for quick selection
  const generateQuickDates = () => {
    if (!currentDate) return [];
    return Array.from({ length: 3 }).map((_, index) => {
      const date = addDays(currentDate, index);
      return {
        date,
        day: format(date, "dd"),
        weekday: format(date, "EEEEEE"),
      };
    });
  };

  // Handle form submission
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate form
    if (!data.instructor) {
      toast.error("Please select an instructor");
      return;
    }
    if (!data.date) {
      toast.error("Please select a date");
      return;
    }
    if (!data.fromTime || !data.toTime) {
      toast.error("Please select time range");
      return;
    }

    // Log the complete form data
    console.log("========== FORM SUBMISSION DATA ==========");
    console.log("Booking Details:");
    console.log("- Instructor:", data.instructor);
    console.log("- Instructor ID:", data.instructorId);
    console.log("- Meeting Method:", data.method);
    console.log("- Date:", data.formattedDate || format(data.date, "dd EEEEEE"));
    console.log("- Time Range:", `${data.fromTime} - ${data.toTime}`);
    console.log("\nComplete Data Object:");
    console.log(JSON.stringify(data, null, 2));
    console.log("==========================================");

    // Show success toast
    toast.success("Session booked successfully!", {
      duration: 5000,
      position: "top-center",
      icon: "🎉",
      style: {
        background: "#10b981",
        color: "#fff",
        fontWeight: "bold",
      },
    });

    // Here you would typically send this data to your API
    // await fetch('/api/bookings', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data)
    // });
  };

  const methods = [
    { id: "video", label: "Video Call", icon: IoVideocamSharp },
    { id: "chat", label: "Chat", icon: BsChatRightText },
    { id: "voice", label: "Voice Call", icon: MdHeadsetMic },
  ];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-y-12 py-5 md:mt-12">
      {/* ========== INSTRUCTOR SELECTION ========== */}
      <div>
        <Label className="font-semibold text-[#1E293B]">Instructor</Label>
        <Select onValueChange={handleInstructorChange} value={data.instructor}>
          <SelectTrigger className="mt-3 w-full rounded border-none bg-[#F1F5F9] shadow-none">
            <SelectValue placeholder="Select an instructor" />
          </SelectTrigger>
          <SelectContent className="shadow-none">
            {instructors && instructors.length > 0 ? (
              instructors.map((instructor) => (
                <SelectItem key={instructor._id} value={instructor.name}>
                  {instructor.name}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="no-instructors" disabled>
                No instructors available
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* ========== MEETING MEDIUM ========== */}
      <div>
        <Label className="mb-3 block font-semibold text-[#1E293B]">
          Meeting Medium
        </Label>
        <div className="flex items-center justify-between px-7">
          {methods.map((method) => {
            const Icon = method.icon;
            const isSelected = data.method === method.id;

            return (
              <div
                key={method.id}
                onClick={() => handleMethodChange(method.id)}
                className={`flex cursor-pointer flex-col items-center gap-y-2 transition-all ${isSelected ? "scale-110" : "opacity-70 hover:opacity-100"
                  }`}
              >
                <span
                  className={`inline-block rounded-full p-3 ${isSelected
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
      </div>

      {/* ========== MEETING DATE ========== */}
      <div>
        <Label className="font-semibold text-[#1E293B]">Date</Label>

        <div className="mt-[1.375rem] flex items-center justify-between">
          {/* Quick date options - next 3 days */}
          {currentDate &&
            generateQuickDates().map((dateObj, index) => (
              <div
                key={index}
                onClick={() => handleQuickDateSelect(dateObj.date)}
                className={`flex cursor-pointer flex-col items-center rounded-lg px-6 py-3 transition-all ${data.date === dateObj.date
                  ? "bg-[#234A96] text-white"
                  : "bg-[#F1F5F9] text-gray-700 hover:bg-gray-200"
                  }`}
              >
                <span className="text-lg font-medium">{dateObj.day}</span>
                <span className="text-sm">{dateObj.weekday}</span>
              </div>
            ))}

          {/* Other date picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 border-none bg-[#F1F5F9] px-6 py-6 hover:bg-gray-200"
              >
                <CalendarIcon className="h-5 w-5" />
                <span>Other</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={data.date}
                onSelect={handleCalendarDateSelect}
                initialFocus
                disabled={(date) => date < new Date()}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Show selected date */}
        {data.formattedDate && (
          <p className="mt-2 text-sm text-[#234A96]">
            Selected: {data.formattedDate}
          </p>
        )}
      </div>

      {/* ========== MEETING TIME ========== */}
      <div>
        <Label className="font-semibold text-[#1E293B]">Select Time</Label>

        <div className="mt-4 flex h-[5.5rem] w-full items-center justify-between bg-[#F1F5F9] px-8">
          {/* From Time Picker */}
          <Popover
            open={isTimePopoverOpen.from}
            onOpenChange={(open) => setIsTimePopoverOpen({ ...isTimePopoverOpen, from: open })}
          >
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-200"
              >
                <Clock className="h-4 w-4" />
                <span>{data.fromTime || "From"}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="h-64 w-48 overflow-y-auto p-0">
              <div className="grid gap-1 p-2">
                {generateTimeSlots().map((time) => (
                  <Button
                    key={time}
                    variant="ghost"
                    className="justify-start"
                    onClick={() => handleTimeSelect('from', time)}
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <IoIosArrowForward className="text-2xl" />

          {/* To Time Picker */}
          <Popover
            open={isTimePopoverOpen.to}
            onOpenChange={(open) => setIsTimePopoverOpen({ ...isTimePopoverOpen, to: open })}
          >
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-200"
              >
                <Clock className="h-4 w-4" />
                <span>{data.toTime || "To"}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="h-64 w-48 overflow-y-auto p-0">
              <div className="grid gap-1 p-2">
                {generateTimeSlots(data.fromTime).map((time) => (
                  <Button
                    key={time}
                    variant="ghost"
                    className="justify-start"
                    onClick={() => handleTimeSelect('to', time)}
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Show selected time range */}
        {data.fromTime && data.toTime && (
          <p className="mt-2 text-sm text-[#234A96]">
            Selected: {data.fromTime} - {data.toTime}
          </p>
        )}
      </div>

      {/* ========== BOOK NOW BUTTON ========== */}
      <Button
        type="submit"
        className="w-full rounded bg-[#234A96] py-6 text-lg font-semibold hover:bg-[#1a3a7a]"
      >
        Book Now
      </Button>

      {/* ========== SUMMARY SECTION (Optional) ========== */}
      {(data.instructor || data.method || data.date || data.fromTime) && (
        <div className="mt-4 rounded-lg bg-blue-50 p-4">
          <h3 className="mb-2 font-semibold text-[#234A96]">Booking Summary:</h3>
          <ul className="space-y-1 text-sm text-gray-600">
            {data.instructor && <li>👤 Instructor: {data.instructor}</li>}
            <li>📞 Method: {data.method}</li>
            {data.formattedDate && <li>📅 Date: {data.formattedDate}</li>}
            {data.fromTime && data.toTime && (
              <li>⏰ Time: {data.fromTime} - {data.toTime}</li>
            )}
          </ul>
        </div>
      )}
    </form>
  );
}