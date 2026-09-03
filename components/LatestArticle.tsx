/**
 * Latest Article Card Component
 *
 * Renders a blog post card for the "Latest" section.
 * Supports two visual variants:
 * 1. Small Card: Horizontal layout with image on the left.
 * 2. Regular Card: Vertical layout with image on top.
 */

import Link from "next/link";
import Image from "next/image";
import type { Article } from "@/lib/constants";

interface LatestArticleProps {
  article: Article;
  isSmallCard?: boolean; // Toggles between the horizontal and vertical layout
}

const LatestArticleCard: React.FC<LatestArticleProps> = ({
  article,
  isSmallCard = false,
}) => {
  const { title, excerpt, imageUrl, categoryColor, author, date, readTime } =
    article;

  const href = article.slug ? `/blog/${article.slug}` : "#";

  /**
   * Variant 1: Small (Horizontal) Card
   */
  if (isSmallCard) {
    return (
      <Link
        href={href}
        className="latest-article-card flex flex-1 min-h-32.5 bg-white dark:bg-slate-900 rounded-xl shadow-lg hover:shadow-xl dark:shadow-slate-950/20 hover:scale-105 transition duration-300 cursor-pointer overflow-hidden transform border border-transparent dark:border-slate-800/60"
      >
        {/* Left: Image Container */}
        <div className="w-1/3 relative">
          <Image
            src={imageUrl}
            alt={title}
            className="object-cover"
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>

        {/* Right: Content Container */}
        <div className="p-4 flex flex-col justify-center w-2/3">
          <span
            className={`inline-block text-xs font-semibold px-2 py-0.5 rounded text-white ${categoryColor} mb-2 self-start`}
          >
            {article.category}
          </span>
          <h3 className="font-bold text-gray-900 dark:text-gray-100 line-clamp-2 text-md">
            {title}
          </h3>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-2">
            <span>{author}</span>
            <span>&bull;</span>
            <span>{readTime}</span>
          </div>
        </div>
      </Link>
    );
  } else

  /**
   * Variant 2: Regular (Vertical) Card
   */
    return (
      <Link
        href={href}
        className="latest-article-card block bg-white dark:bg-slate-900 rounded-xl shadow-lg hover:shadow-xl dark:shadow-slate-950/20 hover:scale-105 transition duration-300 cursor-pointer overflow-hidden transform border border-transparent dark:border-slate-800/60"
      >
        {/* Top: Image Container */}
        <div className="w-full h-48 relative">
          <Image
            src={imageUrl}
            alt={title}
            className="object-cover"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        {/* Bottom: Content Container */}
        <div className="p-5">
          <span
            className={`inline-block text-xs font-semibold px-3 py-1 rounded-md text-white ${categoryColor} mb-3`}
          >
            {article.category}
          </span>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
            {title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm line-clamp-2">
            {excerpt}
          </p>

          {/* Meta info: Author, Date, Read Time */}
          <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-450">
            <div>
              <span>{author}</span>
              <span className="mx-1">&bull;</span>
              <span>{date}</span>
            </div>
            <span>{readTime}</span>
          </div>
        </div>
      </Link>
    );
};

export default LatestArticleCard;
