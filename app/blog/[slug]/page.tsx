/**
 * Single Blog Post Page (Server Component)
 * 
 * Fetches and displays a single blog post by its slug from the NestJS PostgreSQL backend.
 */

import { notFound } from 'next/navigation';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { BACKEND_URL, CATEGORY_COLORS } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let post: any = null;
  try {
    const res = await fetch(`${BACKEND_URL}/posts/${encodeURIComponent(slug)}`, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
      },
    });
    if (res.ok) {
      post = await res.json();
    } else {
      console.error(`Post not found or failed to fetch for slug "${slug}": ${res.status}`);
    }
  } catch (error) {
    console.error(`Error fetching post for slug "${slug}":`, error);
  }

  if (!post) {
    notFound(); 
  }

  const authorName = post.author?.name || post.author || 'Admin User';
  const authorImage = post.author?.image || post.authorImage;
  const displayDate = post.date || (post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown Date');
  const categoryColor = post.categoryColor || CATEGORY_COLORS[post.category] || 'bg-indigo-600';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100 antialiased flex flex-col transition-colors duration-300">
      <Header />
      
      <main className="grow max-w-[90%] mx-auto px-4 sm:px-2 lg:px-20 py-10 w-full mt-10">
        <article className="max-w-4xl mx-auto bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800/60 rounded-2xl shadow-xl overflow-hidden">
          {post.imageUrl ? (
            <div className="w-full h-64 sm:h-96 relative">
              <Image 
                src={post.imageUrl} 
                alt={post.title}
                className="object-cover"
                fill
                priority
                sizes="100vw"
              />
            </div>
          ) : null}
          
          <div className="p-8 sm:p-12">
            <div className="mb-4">
               <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full text-white ${categoryColor}`}>
                 {post.category}
               </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 dark:text-gray-100 mb-6">{post.title}</h1>
            
            <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mb-10 pb-6 border-b border-gray-100 dark:border-slate-800">
              {authorImage && (
                <div className="relative w-8 h-8 mr-3 rounded-full overflow-hidden border border-gray-200 dark:border-slate-700 shrink-0">
                  <Image src={authorImage} alt={authorName} fill className="object-cover" sizes="32px" />
                </div>
              )}
              <span className="font-semibold text-amber-700 dark:text-amber-500 mr-2">{authorName}</span>
              <span>&bull;</span>
              <span className="mx-2">{displayDate}</span>
              <span>&bull;</span>
              <span className="mx-2">{post.readTime || '5-min read'}</span>
            </div>
            
            <div className="prose-content max-w-none">
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
