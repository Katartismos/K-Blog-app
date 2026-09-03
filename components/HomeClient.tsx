/**
 * Home Client Component
 * 
 * The client-side controller for the home page. Manages:
 * - Filtering of articles by category
 * - Grid layout logic for "Latest Articles" (asymmetric layout)
 * - GSAP animations for the main content sections
 * - Integration of Header, Footer, Sidebar, and Article Cards
 */

'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import FeaturedArticleCard from '@/components/FeaturedArticle'
import LatestArticleCard from '@/components/LatestArticle'
import Sidebar from '@/components/Sidebar'
import type { Article } from '@/lib/constants'

interface HomeClientProps {
  featuredArticles: Article[];
  latestArticles: Article[];
  hasMore?: boolean; // Indicates if there are more posts beyond the displayed ones
  topics?: { name: string; count: number }[]; // Category counts for the sidebar
}

const HomeClient: React.FC<HomeClientProps> = ({ featuredArticles, latestArticles, hasMore = false, topics }) => {
  const mainRef = useRef<HTMLDivElement | null>(null);
  
  // State for the currently active category filter
  const [selectedTag, setSelectedTag] = useState<string>('All');

  /**
   * Filter Logic
   * 
   * Filters the 'latestArticles' array based on the selected category from the sidebar.
   */
  const filteredArticles = selectedTag === 'All' 
    ? latestArticles 
    : latestArticles.filter(article => (article.category || 'TECHNOLOGY').toUpperCase() === selectedTag.toUpperCase());

  /**
   * Layout Mapping Types and Resolution
   * 
   * Dynamically assigns up to 6 articles to a 4-box (2x2) grid layout:
   * - 1 card: Box 1 (restricted regular card)
   * - 2 cards: Box 1, Box 2 (both regular cards)
   * - 3 cards: Box 1, Box 2, Box 3 (all regular cards)
   * - 4 cards: Box 1, Box 2, Box 3, Box 4 (all regular cards)
   * - 5 cards: Box 1 (regular), Box 2 (2 small cards), Box 3 (regular), Box 4 (regular)
   * - 6 cards: Box 1 (regular), Box 2 (2 small cards), Box 3 (2 small cards), Box 4 (regular)
   * Any articles beyond 6 are accessed via "Load More".
   */
  type BoxContent = 
    | { type: 'single'; article: Article }
    | { type: 'pair'; articles: [Article, Article] }
    | null;

  interface GridLayout {
    box1: BoxContent;
    box2: BoxContent;
    box3: BoxContent;
    box4: BoxContent;
  }

  const getGridLayout = (articles: Article[]): GridLayout => {
    // Strictly cap at a maximum of 6 articles
    const posts = articles.slice(0, 6);
    const count = posts.length;

    if (count === 0) {
      return { box1: null, box2: null, box3: null, box4: null };
    }
    if (count === 1) {
      return {
        box1: { type: 'single', article: posts[0] },
        box2: null,
        box3: null,
        box4: null,
      };
    }
    if (count === 2) {
      return {
        box1: { type: 'single', article: posts[0] },
        box2: { type: 'single', article: posts[1] },
        box3: null,
        box4: null,
      };
    }
    if (count === 3) {
      return {
        box1: { type: 'single', article: posts[0] },
        box2: { type: 'single', article: posts[1] },
        box3: { type: 'single', article: posts[2] },
        box4: null,
      };
    }
    if (count === 4) {
      return {
        box1: { type: 'single', article: posts[0] },
        box2: { type: 'single', article: posts[1] },
        box3: { type: 'single', article: posts[2] },
        box4: { type: 'single', article: posts[3] },
      };
    }
    if (count === 5) {
      return {
        box1: { type: 'single', article: posts[0] },
        box2: { type: 'pair', articles: [posts[1], posts[2]] },
        box3: { type: 'single', article: posts[3] },
        box4: { type: 'single', article: posts[4] },
      };
    }
    // count >= 6
    return {
      box1: { type: 'single', article: posts[0] },
      box2: { type: 'pair', articles: [posts[1], posts[2]] },
      box3: { type: 'pair', articles: [posts[3], posts[4]] },
      box4: { type: 'single', article: posts[5] },
    };
  };

  const grid = getGridLayout(filteredArticles);

  const renderBox = (box: BoxContent) => {
    if (!box) return null;
    if (box.type === 'single') {
      return (
        <LatestArticleCard 
          key={box.article._id || box.article.slug || 'single'} 
          article={box.article} 
          isSmallCard={false} 
        />
      );
    }
    return (
      <div className="flex flex-col gap-8 h-full">
        {box.articles.map((article, idx) => (
          <LatestArticleCard 
            key={article._id || article.slug || idx} 
            article={article} 
            isSmallCard={true} 
          />
        ))}
      </div>
    );
  };

  /**
   * GSAP Animations
   */
  useGSAP(() => {
    // Reveal section titles
    gsap.fromTo(".latest-articles-title", 
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, delay: 1.0, ease: "power2.out", clearProps: "all" }
    );

    gsap.fromTo(".whats-new-title", 
      { x: -20, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.6, delay: 1.2, ease: "power1.out", clearProps: "all" }
    );

    // Staggered reveal for individual article cards
    gsap.fromTo(".latest-article-card", 
      { y: 30, opacity: 0 },
      { 
        y: 0, 
        opacity: 1, 
        duration: 0.6, 
        stagger: 0.08, 
        delay: 1.3, 
        ease: "power2.out", 
        onComplete: () => { 
          // Clear transform props to prevent issues with hover animations defined elsewhere
          gsap.set(".latest-article-card", { clearProps: "transform" }); 
        } 
      }
    );

  }, { scope: mainRef });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100 antialiased transition-colors duration-300">
      <Header />

      <main className="max-w-[90%] mx-auto px-4 sm:px-2 lg:px-20 py-10" ref={mainRef}>
          
        {/* Featured Section: Displays the top 3 articles */}
        <section className="mb-16">
          <h2 className="sr-only">Featured Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredArticles.map((article, idx) => (
              <FeaturedArticleCard key={article._id || idx} article={article} index={idx} />
            ))}
          </div>
          
          <div className="mt-12">
            <h3 className="latest-articles-title text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">EXPLORE OUR LATEST ARTICLES</h3>
            <a href="#" className="latest-articles-title text-amber-700 dark:text-amber-500 hover:text-amber-900 dark:hover:text-amber-400 text-sm font-medium">Join Our Community.</a>
          </div>
        </section>

        {/* What's New Section: Main content grid with sidebar */}
        <section>
          <h3 className="whats-new-title text-2xl font-bold text-gray-800 dark:text-gray-100 mb-8 pb-2 border-b-2 border-amber-700 dark:border-amber-600 inline-block">
            {selectedTag === 'All' ? "WHAT'S NEW" : selectedTag.toUpperCase()}
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
              
            {/* Articles Column */}
            <div className="lg:col-span-2 grid gap-8 h-fit">
              {filteredArticles.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">No articles found in this category.</p>
                </div>
              ) : (
                <>
                  {/* Row 1: Box 1 and Box 2 */}
                  {(grid.box1 || grid.box2) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      {renderBox(grid.box1)}
                      {renderBox(grid.box2)}
                    </div>
                  )}

                  {/* Row 2: Box 3 and Box 4 */}
                  {(grid.box3 || grid.box4) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      {renderBox(grid.box3)}
                      {renderBox(grid.box4)}
                    </div>
                  )}
                </>
              )}

              {/* Load More Trigger */}
              {(selectedTag === 'All' ? hasMore : (topics?.find(t => t.name.toUpperCase() === selectedTag.toUpperCase())?.count || 0) > 6) && (
                <div className="text-center pt-8">
                  <Link href="/others" className="inline-block latest-articles-title px-6 py-2 border border-gray-300 dark:border-slate-800 text-gray-600 dark:text-gray-300 font-semibold rounded-full hover:bg-gray-100 dark:hover:bg-slate-900 transition cursor-pointer">
                    Load More
                  </Link>
                </div>
              )}
            </div>

            {/* Sidebar Column */}
            <div className="lg:col-span-1">
              <Sidebar topics={topics} selectedTag={selectedTag} onSelectTag={setSelectedTag} />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HomeClient;
