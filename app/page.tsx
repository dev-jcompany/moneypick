import Hero from '@/components/Hero';
import CategoryCards from '@/components/CategoryCards';
import PostsSection from '@/components/PostsSection';
import CalculatorCards from '@/components/CalculatorCards';
import RecommendedPosts from '@/components/RecommendedPosts';
import BottomSection from '@/components/BottomSection';

export default function HomePage() {
  return (
    <>
      <Hero />
      <CategoryCards />
      <PostsSection />
      <CalculatorCards />
      <RecommendedPosts />
      <BottomSection />
    </>
  );
}
