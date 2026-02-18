import { Suspense } from "react";

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
            // If API returns array directly
            coursesArray = data;
        } else if (data?.data && Array.isArray(data.data)) {
            // If API returns { data: [...] }
            coursesArray = data.data;
        } else if (data?.courses && Array.isArray(data.courses)) {
            // If API returns { courses: [...] }
            coursesArray = data.courses;
        } else if (data?.results && Array.isArray(data.results)) {
            // If API returns { results: [...] }
            coursesArray = data.results;
        } else {
            console.error("Unexpected API response structure:", data);
            return { data: [] };
        }

        // 🔥 Filter on server side
        const filtered = coursesArray.filter((item) =>
            item.title?.toLowerCase().includes(query.toLowerCase())
        );

        return { data: filtered };
    } catch (error) {
        console.error("Search error:", error);
        return null;
    }
}

// ==============================
// Search Content
// ==============================
async function SearchContent({ query }) {
    const result = await getSearchResults(query);

    if (!query) {
        return <div className="text-center">Please enter a keyword.</div>;
    }

    // Safely check if we have results
    if (!result?.data || !Array.isArray(result.data) || result.data.length === 0) {
        return (
            <div className="text-center">
                No results found for <strong>"{query}"</strong>
            </div>
        );
    }

    return (
        <div className="grid gap-6 md:grid-cols-3">
            {result.data.map((item) => (
                <div key={item._id || item.id} className="rounded-xl border p-4 shadow-sm">
                    <h2 className="font-semibold">{item.title}</h2>
                    <p className="mt-2 text-sm text-gray-500">
                        {item.description?.slice(0, 100)}...
                    </p>
                </div>
            ))}
        </div>
    );
}

// ==============================
// ✅ MAIN PAGE
// ==============================
export default async function SearchPage({ searchParams }) {
    // 🔥 unwrap Promise
    const params = await searchParams;
    const query = params?.q || "";

    return (
        <section className="min-h-screen px-6 py-16">
            <div className="mx-auto max-w-6xl">
                <h1 className="mb-8 text-3xl font-bold">
                    Search Results for <span className="text-title-light">"{query}"</span>
                </h1>

                <Suspense fallback={<div>Loading results...</div>}>
                    <SearchContent query={query} />
                </Suspense>
            </div>
        </section>
    );
}