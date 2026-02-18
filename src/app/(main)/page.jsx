import Hero from "@/components/home/HomePage/Hero";
import MasonrySection from "@/components/home/masonrySection/masonrySection";
import MentorCTA from "@/components/home/mentorCTA/mentorCTA";
import MentorSliderOne from "@/components/home/mentorSliderOne/mentorSliderOne";
import MentorSliderTwo from "@/components/home/mentorSliderTwo/mentorSliderTwo";
import OnDemandSkillsPromo from "@/components/home/OnDemandSkillsPromo";
import PopularProducts from "@/components/home/popularProducts/popularProducts";
import SkillCTAOne from "@/components/home/skillCTAOne/skillCTAOne";
import SkillCTATwo from "@/components/home/skillCTATwo/skillCTATwo";
import Stats from "@/components/home/stats/stats";
import Studybit from "@/components/home/studybit/studybit";
import VideoSection from "@/components/home/videoSection/videoSection";
import WhySekhai from "@/components/home/whySekhai/whySekhai";

// ==============================
// ✅ SEO Metadata
// ==============================
export const metadata = {
  title: "Shekhai || Online Learning in Bangladesh",
  description:
    "Join Shekhai to access online courses, tutorials, and educational content. Learn anytime, anywhere in Bangladesh.",
  metadataBase: new URL("https://shekhai.ngengroup.org/"),
  openGraph: {
    title: "Shekhai || Online Learning in Bangladesh",
    description:
      "Explore online courses and tutorials at Shekhai. Learn new skills and grow your knowledge.",
    url: "https://shekhai.ngengroup.org/",
    siteName: "Shekhai",
    type: "website",
    images: [
      {
        url: "/opengraph-image.jpg",
        alt: "Shekhai || Online Learning in Bangladesh",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shekhai || Learn Online in Bangladesh",
    description:
      "Access online courses and tutorials on Shekhai. Learn new skills with ease!",
    images: ["/opengraph-image.jpg"],
  },
};

// ==============================
// ✅ Optimized Data Fetching
// ==============================
async function getHomepageData() {
  try {
    const res = await fetch(
      "https://shekhai-server.onrender.com/api/v1/homepage",
      {
        next: { revalidate: 300 }, // 🔥 Cache for 5 minutes
      }
    );

    if (!res.ok) {
      throw new Error("Failed to fetch homepage data");
    }

    return res.json();
  } catch (error) {
    console.error("Homepage Fetch Error:", error);
    return null;
  }
}

// ==============================
// ✅ Homepage Component
// ==============================
export default async function Home() {
  const homepageData = await getHomepageData();

  const data = homepageData?.data || {};

  return (
    <>
      <Hero data={data.hero || {}} />
      <MasonrySection data={data.featured_categories || {}} />
      <OnDemandSkillsPromo data={data.start_learning || {}} />
      <MentorSliderOne data={data.cooking_section || {}} />
      <SkillCTAOne data={data.agriculture_section || {}} />
      <MentorSliderTwo data={data.experts_section || {}} />
      <SkillCTATwo data={data.hobby_section || {}} />
      <Studybit data={data.project_section || {}} />
      <PopularProducts data={data.popular_products || {}} />
      <MentorCTA data={data.share_skill_cta || {}} />
      <VideoSection />
      <WhySekhai data={data.why_choose_us || {}} />
      <Stats data={data.statistics || {}} />
    </>
  );
}
