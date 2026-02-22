"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import debounce from "lodash/debounce"; // Install: npm install lodash

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "./Header";
import ProjectCard from "../shared/ProjectCard/ProjectCard";

export default function Component() {
  const scrollAreaRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [allCourses, setAllCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showAllResults, setShowAllResults] = useState(false);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          "https://shekhai-server.onrender.com/api/v1/categories",
        );

        if (response.data.success && response.data.categories.length > 0) {
          setCategories(response.data.categories);
          const firstCategoryId = response.data.categories[0]._id;
          setSelectedCategory(firstCategoryId);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch all courses after categories are loaded
  useEffect(() => {
    if (categories.length > 0) {
      fetchAllCourses();
    }
  }, [categories]);

  // Fetch all courses from all categories
  const fetchAllCourses = async () => {
    try {
      setIsLoading(true);
      
      // Create an array of promises for each category
      const coursePromises = categories.map(async (category) => {
        try {
          const response = await axios.get(
            `https://shekhai-server.onrender.com/api/v1/categories/${category._id}/courses`,
          );
          
          if (response.data.success) {
            const courses = response.data.courses || [];
            // Add category info to each course
            return courses.map(course => ({
              ...course,
              categoryName: category.name,
              categoryId: category._id
            }));
          }
          return [];
        } catch (error) {
          console.error(`Error fetching courses for category ${category.name}:`, error);
          return [];
        }
      });

      // Wait for all promises to resolve
      const coursesByCategory = await Promise.all(coursePromises);
      
      // Flatten the array of course arrays
      const flattenedCourses = coursesByCategory.flat();
      
      console.log("Fetched courses:", flattenedCourses); // Debug log
      
      setAllCourses(flattenedCourses);
      setFilteredCourses(flattenedCourses);
    } catch (error) {
      console.error("Error fetching all courses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Search function - immediate filtering without debounce for better responsiveness
  const performSearch = useCallback((query) => {
    if (!allCourses.length) return;
    
    setIsSearching(true);
    
    if (!query.trim()) {
      setFilteredCourses(allCourses);
      setShowAllResults(false);
      setIsSearching(false);
      return;
    }

    const searchLower = query.toLowerCase().trim();
    
    // Filter courses across all categories - match if ANY character/word matches
    const filtered = allCourses.filter((course) => {
      // Check each field for matches
      const titleMatch = course.title?.toLowerCase().includes(searchLower);
      const descriptionMatch = course.description?.toLowerCase().includes(searchLower);
      const instructorMatch = course.instructor?.name?.toLowerCase().includes(searchLower);
      const categoryNameMatch = course.categoryName?.toLowerCase().includes(searchLower);
      
      // Check tags if they exist
      const tagsMatch = course.tags && Array.isArray(course.tags) && 
        course.tags.some(tag => tag?.toLowerCase().includes(searchLower));
      
      // Return true if ANY field matches
      return titleMatch || descriptionMatch || instructorMatch || categoryNameMatch || tagsMatch;
    });

    console.log(`Search query "${query}" found ${filtered.length} results`);
    setFilteredCourses(filtered);
    setShowAllResults(true);
    setIsSearching(false);
  }, [allCourses]);

  // Handle search input change - immediate filtering
  const handleSearchChange = (query) => {
    setSearchQuery(query);
    performSearch(query);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery("");
    setFilteredCourses(allCourses);
    setShowAllResults(false);
  };

  const checkScrollPosition = () => {
    const scrollArea = scrollAreaRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]",
    );
    if (scrollArea) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollArea;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScrollPosition();
    const scrollArea = scrollAreaRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]",
    );
    if (scrollArea) {
      scrollArea.addEventListener("scroll", checkScrollPosition);
      return () =>
        scrollArea.removeEventListener("scroll", checkScrollPosition);
    }
  }, [categories]);

  const scrollLeft = () => {
    const scrollArea = scrollAreaRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]",
    );
    if (scrollArea) {
      scrollArea.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    const scrollArea = scrollAreaRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]",
    );
    if (scrollArea) {
      scrollArea.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  // Get courses to display based on search state
  const getCoursesToDisplay = () => {
    if (showAllResults) {
      // When searching, show all filtered courses regardless of category
      return filteredCourses;
    } else {
      // When not searching, show only courses from selected category
      return filteredCourses.filter(course => course.categoryId === selectedCategory);
    }
  };

  if (isLoading && categories.length === 0) {
    return (
      <div className="flex h-64 w-full items-center justify-center px-6 md:mt-10">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (categories.length === 0 && !isLoading) {
    return (
      <div className="w-full px-6 py-20 text-center md:mt-10">
        <p className="text-muted-foreground">No categories found</p>
      </div>
    );
  }

  const coursesToDisplay = getCoursesToDisplay();
  
  // Debug logs
  console.log("Search query:", searchQuery);
  console.log("Filtered courses total:", filteredCourses.length);
  console.log("Courses to display:", coursesToDisplay.length);
  console.log("Show all results:", showAllResults);

  return (
    <>
      <Header 
        searchQuery={searchQuery} 
        onSearchChange={handleSearchChange} 
        onClearSearch={handleClearSearch}
        isSearching={isSearching}
        totalResults={filteredCourses.length}
      />
      
      {/* Only show tabs when not searching or when there are results in multiple categories */}
      {!showAllResults && (
        <Tabs
          defaultValue={categories[0]?._id}
          value={selectedCategory}
          onValueChange={setSelectedCategory}
          className="w-full px-6 md:mt-10"
        >
          <div className="relative">
            <ScrollArea ref={scrollAreaRef}>
              <TabsList className="-gap-1 mb-3 h-auto rounded-none bg-transparent px-0 py-1 text-foreground md:gap-2">
                {categories.map((category) => (
                  <TabsTrigger
                    value={category._id}
                    key={category._id}
                    className="relative cursor-pointer after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 hover:bg-accent hover:text-foreground data-[state=active]:border-b-0 data-[state=active]:bg-transparent data-[state=active]:text-base data-[state=active]:shadow-none data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent md:!text-card-title"
                  >
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </ScrollArea>

            {canScrollLeft && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-1/2 -left-5 size-6 -translate-y-1/2 border-0 bg-base p-0 text-white shadow-none backdrop-blur-sm md:-left-12 md:size-8"
                onClick={scrollLeft}
                aria-label="Scroll left"
              >
                <ChevronLeft size={20} />
              </Button>
            )}

            {canScrollRight && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-1/2 -right-5 size-6 -translate-y-1/2 border-0 bg-base p-0 text-white shadow-none backdrop-blur-sm md:-right-12 md:size-8"
                onClick={scrollRight}
                aria-label="Scroll right"
              >
                <ChevronRight size={16} />
              </Button>
            )}
          </div>

          {/* Tab Content for each category */}
          {categories.map((category) => (
            <TabsContent key={category._id} value={category._id} className="mt-4">
              <section className="grid grid-cols-1 gap-x-6 gap-y-10 px-3 md:grid-cols-2 md:px-0 lg:grid-cols-3">
                {/* Render courses for this category when not searching */}
                {!isLoading && coursesToDisplay
                  .filter(course => course.categoryId === category._id)
                  .map((course) => (
                    <ProjectCard
                      key={course._id}
                      course={course}
                      categoryName={category.name}
                    />
                  ))
                }
              </section>
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* Show all search results when searching */}
      {showAllResults && (
        <div className="w-full px-6 md:mt-10">
          {/* Search Results Header */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Search Results {searchQuery && `for "${searchQuery}"`}
            </h2>
            <Button 
              variant="outline" 
              onClick={handleClearSearch}
              className="text-sm"
            >
              Clear Search
            </Button>
          </div>

          {/* Results count */}
          <p className="mb-4 text-gray-600">
            Found {coursesToDisplay.length} course{coursesToDisplay.length !== 1 ? 's' : ''}
          </p>

          {/* Grid of all search results */}
          <section className="grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
            {/* Loading state */}
            {isLoading && (
              <div className="col-span-full flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            )}

            {/* Render all filtered courses */}
            {!isLoading && coursesToDisplay.length > 0 && 
              coursesToDisplay.map((course) => (
                <ProjectCard
                  key={course._id}
                  course={course}
                  categoryName={course.categoryName}
                  searchQuery={searchQuery}
                />
              ))
            }

            {/* No results message */}
            {!isLoading && coursesToDisplay.length === 0 && searchQuery && (
              <div className="col-span-full flex h-64 items-center justify-center">
                <p className="text-gray-500 text-lg">
                  No courses found matching "{searchQuery}"
                </p>
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}