/**
 * New Post Page (Client Component)
 * 
 * Provides a form for authenticated users to create and publish new blog posts.
 * Includes a rich-text editor (Tiptap), image upload, and category selection.
 */

'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { createPost } from '@/app/actions/post';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TiptapEditor from '@/components/TiptapEditor';

export default function NewPostPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  
  // Local state for UI feedback and form data
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [contentHtml, setContentHtml] = useState(''); // Stores HTML from Tiptap editor

  /**
   * Authentication Guard
   * 
   * Redirects unauthenticated users to the home page once session loading completes.
   */
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/');
    }
  }, [isPending, session, router]);

  // Show loading spinner while session is being verified
  if (isPending || !session?.user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-700"></div>
      </div>
    );
  }

  /**
   * handleSubmit
   * 
   * Validates form data and calls the createPost server action.
   * Handles UI loading states and error reporting.
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Strip HTML tags to get plain text for length validation
    const plainText = contentHtml.replace(/<[^>]+>/g, '').trim();

    // Basic validation for content length
    if (plainText.length < 30) {
      setError('Content must be at least 30 characters long.');
      setLoading(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;

    // Basic validation for title
    if (!title.trim()) {
      setError('Title is a required field.');
      setLoading(false);
      return;
    }

    // Inject the Tiptap HTML output as the 'content' field in FormData
    formData.set('content', contentHtml);

    try {
      // Execute server action to save the post to the backend
      const response = await createPost(formData);

      if (response?.error) {
        setError(response.error);
        setLoading(false);
      } else if (response?.success) {
        // Redirect to home on success
        router.push('/');
      }
    } catch (err: unknown) {
      console.error("Action error:", err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred while communicating with the server.';
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 antialiased flex flex-col transition-colors duration-300">
      <Header />
      
      <main className="grow max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full mt-10">
        <div className="bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800/60 rounded-2xl shadow-lg p-8 sm:p-10">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-8 pb-4 border-b border-gray-100 dark:border-slate-800">Create a New Post</h1>
          
          {/* Error Message Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title Input */}
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Post Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-700 focus:border-amber-700 transition duration-150 text-black dark:text-white bg-white dark:bg-slate-950"
                placeholder="Enter a captivating title"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category Selection */}
              <div>
                <label htmlFor="category" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-700 focus:border-amber-700 transition duration-150 bg-white dark:bg-slate-950 text-gray-500 dark:text-gray-400"
                >
                  <option value="TECHNOLOGY">Technology</option>
                  <option value="TRAVEL">Travel</option>
                  <option value="FOODS">Foods</option>
                  <option value="LIFESTYLE">Lifestyle</option>
                  <option value="FINANCE">Finance</option>
                  <option value="GAMING">Gaming</option>
                </select>
              </div>

              {/* Image Upload Input */}
              <div>
                <label htmlFor="image" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Upload Image *
                </label>
                <input
                  type="file"
                  id="image"
                  name="image"
                  accept="image/png, image/jpeg, image/jpg, image/svg+xml"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-700 focus:border-amber-700 transition duration-150 text-black dark:text-white file:cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 dark:file:bg-slate-800 file:text-amber-700 dark:file:text-amber-500 hover:file:bg-amber-100 dark:hover:file:bg-slate-705"
                />
              </div>
            </div>

            {/* Short Excerpt Input */}
            <div>
              <label htmlFor="excerpt" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Short Excerpt *
              </label>
              <textarea
                id="excerpt"
                name="excerpt"
                rows={2}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-700 focus:border-amber-700 transition duration-150 resize-y text-black dark:text-white bg-white dark:bg-slate-950"
                placeholder="Brief summary of your post..."
              />
            </div>

            {/* Rich Text Editor (Tiptap) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Content * <span className="text-gray-400 font-normal text-xs">(min. 30 characters)</span>
              </label>
              <TiptapEditor onChange={setContentHtml} />
            </div>

            {/* Form Actions */}
            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className={`flex items-center justify-center py-3 px-8 rounded-full text-white font-semibold shadow-md transition duration-200 cursor-pointer ${
                  loading 
                    ? 'bg-amber-500 cursor-not-allowed' 
                    : 'bg-amber-700 hover:bg-amber-800 hover:shadow-lg'
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Publishing...
                  </>
                ) : (
                  'Publish Post'
                )}
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
