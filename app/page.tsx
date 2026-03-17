import Navbar from "@/components/Navbar"
import HeroSection from "@/components/HeroSection"
import TrendingSection from "@/components/TrendingSection"
import TopRatedSection from "@/components/TopRatedSection"
import UpcomingMoviesSection from "@/components/UpcomingMoviesSection"
import PopularMoviesSection from "@/components/PopularMoviesSection"
import ActionMoviesSection from "@/components/ActionMoviesSection"
import GenreFilter from "@/components/GenreFilter"
import Footer from "@/components/Footer"

export default function Home() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <TrendingSection />
      <TopRatedSection />
      <UpcomingMoviesSection />
      <PopularMoviesSection />
      <ActionMoviesSection />
      <GenreFilter />
      <Footer />
    </main>
  )
}
