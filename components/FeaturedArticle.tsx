/**
 * Featured Article Card Component
 *
 * Displays a large, high-impact card for featured blog posts.
 * Utilizes GSAP for entrance animations and interactive hover effects.
 */

"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import Link from "next/link";
import Image from "next/image";

import type { Article } from "@/lib/constants";

interface FeaturedArticleProps {
  article: Article;
  index: number; // Used for staggered entrance animation delay
}

const FeaturedArticleCard: React.FC<FeaturedArticleProps> = ({
  article,
  index,
}) => {
  const { title, excerpt, imageUrl, categoryColor } = article;
  const cardRef = useRef<HTMLAnchorElement | null>(null);

  /**
   * Animation Logic (GSAP)
   */
  useGSAP(
    () => {
      const ctx = gsap.context(() => {
        const cardElement = cardRef.current;
        if (!cardElement) return;

        // Initial staggered entrance animation
        gsap.from(cardElement, {
          y: 50,
          opacity: 0,
          duration: 0.8,
          delay: 0.6 + index * 0.15, // Delay increases with index for "flowing" effect
          ease: "back.out(1.2)",
        });

        // Interactive hover animation: card scales up and lifts slightly
        cardElement.addEventListener("mouseenter", () => {
          gsap.to(cardElement, {
            scale: 1.03,
            y: -5,
            duration: 0.3,
            ease: "power1.out",
          });
        });

        // Reset animation when hover ends
        cardElement.addEventListener("mouseleave", () => {
          gsap.to(cardElement, {
            scale: 1,
            y: 0,
            duration: 0.3,
            ease: "power1.out",
          });
        });
      });

      // Cleanup animations on unmount
      return () => ctx.revert();
    },
    { scope: cardRef, dependencies: [index] },
  );

  return (
    <Link
      href={article.slug ? `/blog/${article.slug}` : "#"}
      className="relative block h-90 w-full rounded-2xl overflow-hidden shadow-xl group"
      ref={cardRef}
    >
      {/* Background Image with fallback handling */}
      <Image
        src={imageUrl}
        alt={title}
        className="w-full h-full object-cover transition duration-300"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.onerror = null;
          target.src =
            "https://placehold.co/400x250/374151/ffffff?text=Image+Error";
        }}
        width={335}
        height={200}
      />

      {/* Overlay Content (Title, Category, Excerpt) */}
      <div className="absolute inset-0 bg-linear-to-t from-gray-900/80 to-transparent p-6 flex flex-col justify-end">
        {/* Category Badge */}
        <span
          className={`inline-block text-xs font-semibold px-3 py-1 rounded-full text-white mb-2 text-center ${categoryColor}`}
        >
          {article.category}
        </span>

        <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
          {title}
        </h3>
        <p className="text-sm text-gray-300 line-clamp-2">{excerpt}</p>

        {/* Call to Action */}
        <span className="mt-4 inline-block text-center w-32 px-4 py-2 bg-white text-gray-800 text-sm font-semibold rounded-full hover:bg-gray-200 transition duration-150 cursor-pointer">
          READ MORE
        </span>
      </div>
    </Link>
  );
};

export default FeaturedArticleCard;
