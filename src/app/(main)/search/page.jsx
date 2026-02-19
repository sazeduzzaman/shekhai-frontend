import { Suspense } from "react";
import { Search, Star, Clock, Users, BookOpen, Award, Globe, BarChart } from "lucide-react";
import Link from "next/link";

// ==============================
// Fetch Search Results
// ==============================
async function getSearchResults(query) {
    if (!query) return null;

    try {
        const res = await fetch(
            "https://shekhai-server.onrender.com/api/v1/courses",
            { next: { revalidate: 1 } }
        );

        if (!res.ok) {
            console.error("API error:", res.status);
            return null;
        }

        const data = await res.json();
        
        // Determine the correct data structure
        let coursesArray = [];
        
        if (Array.isArray(data)) {
            coursesArray = data;
        } else if (data?.data && Array.isArray(data.data)) {
            coursesArray = data.data;
        } else if (data?.courses && Array.isArray(data.courses)) {
            coursesArray = data.courses;
        } else if (data?.results && Array.isArray(data.results)) {
            coursesArray = data.results;
        } else {
            console.error("Unexpected API response structure:", data);
            return { data: [] };
        }

        // 🔥 Filter on server side
        const filtered = coursesArray.filter((item) =>
            item.title?.toLowerCase().includes(query.toLowerCase()) ||
            item.shortDescription?.toLowerCase().includes(query.toLowerCase()) ||
            item.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        );

        return { data: filtered };
    } catch (error) {
        console.error("Search error:", error);
        return null;
    }
}

// ==============================
// Course Card Component
// ==============================
function CourseCard({ course }) {
    const {
        _id,
        title,
        shortDescription,
        longDescription,
        thumbnails,
        bannerImage,
        instructor,
        price,
        rating = 0,
        totalRatings = 0,
        level,
        language,
        totalDuration = 0,
        totalLessons = 0,
        totalQuizzes = 0,
        totalProjects = 0,
        whatYoullLearn,
        tags = [],
        enrollmentDeadline,
        accessType,
        certificateIncluded,
        published,
        enrolledStudents = 0,
        category = []
    } = course;

    // Format duration (minutes to hours)
    const formatDuration = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h${mins > 0 ? ` ${mins}m` : ''}`;
    };

    // Get thumbnail or banner image
    const thumbnailUrl = thumbnails?.[0]?.url || 
                        thumbnails?.[0]?.data || 
                        bannerImage?.data || 
                        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80";

    // Format price
    const formattedPrice = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);

    // Get level color
    const getLevelColor = (level) => {
        switch(level?.toLowerCase()) {
            case 'beginner':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'intermediate':
                return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'advanced':
                return 'bg-red-100 text-red-700 border-red-200';
            default:
                return 'bg-blue-100 text-blue-700 border-blue-200';
        }
    };

    // Render stars for rating
    const renderStars = () => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
            } else if (i === fullStars && hasHalfStar) {
                stars.push(
                    <div key={i} className="relative">
                        <Star className="h-4 w-4 text-gray-300" />
                        <Star className="absolute left-0 top-0 h-4 w-4 fill-yellow-400 text-yellow-400" style={{ clipPath: 'inset(0 50% 0 0)' }} />
                    </div>
                );
            } else {
                stars.push(<Star key={i} className="h-4 w-4 text-gray-300" />);
            }
        }
        return stars;
    };

    return (
        <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            {/* Image Container */}
            <div className="relative h-52 overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50">
                <img
                    src={thumbnailUrl}
                    alt={title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    // onError={(e) => {
                    //     e.target.src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80";
                    // }}
                />
                
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Badges */}
                <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                    {level && (
                        <span className={`rounded-full border px-3 py-1 text-xs font-medium shadow-sm backdrop-blur-sm ${getLevelColor(level)}`}>
                            {level}
                        </span>
                    )}
                    {certificateIncluded && (
                        <span className="rounded-full border border-purple-200 bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700 shadow-sm backdrop-blur-sm">
                            <Award className="mr-1 inline-block h-3 w-3" />
                            Certificate
                        </span>
                    )}
                </div>

                {/* Price Tag */}
                <div className="absolute right-4 top-4 rounded-xl bg-white/95 px-4 py-2 font-bold text-gray-900 shadow-lg backdrop-blur-sm">
                    {formattedPrice}
                </div>

                {/* Quick Stats Overlay on Hover */}
                <div className="absolute bottom-0 left-0 right-0 translate-y-full transform bg-gradient-to-t from-black/80 to-transparent p-4 text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <div className="flex items-center justify-around text-xs">
                        {totalLessons > 0 && (
                            <div className="flex items-center gap-1">
                                <BookOpen className="h-3 w-3" />
                                <span>{totalLessons} lessons</span>
                            </div>
                        )}
                        {totalDuration > 0 && (
                            <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{formatDuration(totalDuration)}</span>
                            </div>
                        )}
                        {enrolledStudents > 0 && (
                            <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                <span>{enrolledStudents}+</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Container */}
            <div className="flex flex-1 flex-col p-5">
                {/* Category & Language */}
                <div className="mb-3 flex items-center gap-2 text-xs">
                    {category.length > 0 && (
                        <span className="rounded-full bg-blue-50 px-2 py-1 text-blue-600">
                            {category[0]?.name || category[0]}
                        </span>
                    )}
                    {language && (
                        <span className="flex items-center gap-1 text-gray-500">
                            <Globe className="h-3 w-3" />
                            {language}
                        </span>
                    )}
                </div>

                {/* Title */}
                <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {title}
                </h3>

                {/* Instructor */}
                {instructor && (
                    <p className="mb-3 text-sm text-gray-600">
                        by <span className="font-medium text-gray-900">{instructor.name}</span>
                    </p>
                )}

                {/* Description */}
                <p className="mb-4 line-clamp-2 text-sm text-gray-600">
                    {shortDescription || longDescription?.slice(0, 120)}...
                </p>

                {/* Rating */}
                {rating > 0 && (
                    <div className="mb-4 flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                            {renderStars()}
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                            {rating.toFixed(1)}
                        </span>
                        {totalRatings > 0 && (
                            <span className="text-xs text-gray-500">
                                ({totalRatings} reviews)
                            </span>
                        )}
                    </div>
                )}

                {/* Key Learning Points */}
                {whatYoullLearn && whatYoullLearn.length > 0 && (
                    <div className="mb-4 space-y-2">
                        <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                            What you'll learn:
                        </p>
                        <ul className="space-y-1">
                            {whatYoullLearn.slice(0, 2).map((point, index) => (
                                <li key={index} className="flex items-start gap-2 text-xs text-gray-600">
                                    <span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-blue-500" />
                                    <span className="line-clamp-1">{point}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Tags */}
                {tags.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-1">
                        {tags.slice(0, 3).map((tag, index) => (
                            <span
                                key={index}
                                className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                            >
                                {tag}
                            </span>
                        ))}
                        {tags.length > 3 && (
                            <span className="text-xs text-gray-400">+{tags.length - 3}</span>
                        )}
                    </div>
                )}

                {/* Footer Stats */}
                <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4">
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                        {totalProjects > 0 && (
                            <span className="flex items-center gap-1">
                                <span className="font-medium text-gray-700">{totalProjects}</span> projects
                            </span>
                        )}
                        {totalQuizzes > 0 && (
                            <span className="flex items-center gap-1">
                                <span className="font-medium text-gray-700">{totalQuizzes}</span> quizzes
                            </span>
                        )}
                    </div>

                    {/* Enrollment Deadline */}
                    {enrollmentDeadline && new Date(enrollmentDeadline) > new Date() && (
                        <span className="text-xs font-medium text-orange-600">
                            Enroll by {new Date(enrollmentDeadline).toLocaleDateString()}
                        </span>
                    )}
                    <Link href={`/courses/${_id}`} className="cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 shadow-sm transition-all hover:border-gray-400 hover:bg-gray-50 hover:shadow">
                        View Details
                    </Link>
                </div>
            </div>

            {/* Hover Border Effect */}
            <div className="absolute inset-0 rounded-2xl border-2 border-transparent transition-all duration-300 group-hover:border-blue-500/20 pointer-events-none" />
        </div>
    );
}

// ==============================
// Search Content Component
// ==============================
async function SearchContent({ query }) {
    const result = await getSearchResults(query);
    if (!query) {
        return (
            <div className="flex min-h-[400px] items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-12">
                <div className="text-center">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
                        <Search className="h-10 w-10 text-blue-600" />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold text-gray-900">Start your search</h3>
                    <p className="text-gray-500">Enter a keyword above to find your perfect course</p>
                </div>
            </div>
        );
    }

    if (!result?.data || !Array.isArray(result.data) || result.data.length === 0) {
        return (
            <div className="flex min-h-[400px] items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-12">
                <div className="text-center">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                        <Search className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold text-gray-900">No results found</h3>
                    <p className="text-gray-500">
                        No courses match <span className="font-semibold text-blue-600">"{query}"</span>
                    </p>
                    <p className="mt-2 text-sm text-gray-400">
                        Try different keywords or browse our categories
                    </p>
                </div>
            </div>
        );
    }

   

    return (
        <div className="space-y-8">
            {/* Results Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
                <div>
                    <p className="text-lg text-gray-700">
                        Found <span className="text-2xl font-bold text-blue-600">{result.data.length}</span> courses
                        {query && (
                            <> for <span className="font-semibold text-gray-900">"{query}"</span></>
                        )}
                    </p>
                    {result.data.length > 0 && (
                        <p className="mt-1 text-sm text-gray-500">
                            Showing {Math.min(result.data.length, 12)} of {result.data.length} results
                        </p>
                    )}
                </div>
                
                {/* Sort Dropdown */}
                <select className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option>Most Relevant</option>
                    <option>Highest Rated</option>
                    <option>Newest First</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                </select>
            </div>

            {/* Course Cards Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {result.data.map((item) => (
                    <CourseCard key={item._id || item.id} course={item} />
                ))}
            </div>

            {/* Show More Button (if more than 12 results) */}
            {result.data.length > 12 && (
                <div className="mt-8 text-center">
                    <button className="rounded-lg border border-gray-300 bg-white px-8 py-3 font-medium text-gray-700 shadow-sm transition-all hover:border-gray-400 hover:bg-gray-50 hover:shadow">
                        Load More Courses
                    </button>
                </div>
            )}
        </div>
    );
}

// ==============================
// ✅ MAIN PAGE
// ==============================
export default async function SearchPage({ searchParams }) {
    const params = await searchParams;
    const query = params?.q || "";
    
    console.log("Search query:", query);

    return (
        <section className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-4 py-12 md:px-6 md:py-16">
            <div className="mx-auto max-w-7xl">
                {/* Page Header */}
                <div className="mb-8 text-center md:mb-12">
                    <h1 className="mb-3 text-3xl font-bold text-gray-900 md:text-4xl">
                        {query ? (
                            <>
                                Search Results for{" "}
                                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                    "{query}"
                                </span>
                            </>
                        ) : (
                            "Search Courses"
                        )}
                    </h1>
                    <p className="text-gray-600">
                        {query 
                            ? "Discover the perfect course for your learning journey" 
                            : "Find the perfect course to advance your skills"}
                    </p>
                </div>

                {/* Search Results with Suspense */}
                <Suspense 
                    fallback={
                        <div className="flex min-h-[400px] items-center justify-center">
                            <div className="text-center">
                                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                                <p className="text-gray-600">Loading results...</p>
                            </div>
                        </div>
                    }
                >
                    <SearchContent query={query} />
                </Suspense>
            </div>
        </section>
    );
}