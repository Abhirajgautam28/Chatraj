import React from 'react';

export const NavbarSkeleton = () => (
  <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 backdrop-blur-md">
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-gray-300 rounded-full dark:bg-gray-700 animate-pulse"></div>
      <div className="w-24 h-6 bg-gray-300 rounded dark:bg-gray-700 animate-pulse"></div>
    </div>
    <div className="flex items-center gap-4">
      <div className="hidden w-20 h-10 bg-gray-300 rounded-full sm:block dark:bg-gray-700 animate-pulse"></div>
      <div className="hidden w-20 h-10 bg-gray-300 rounded-full sm:block dark:bg-gray-700 animate-pulse"></div>
      <div className="w-32 h-10 bg-gray-300 rounded-full dark:bg-gray-700 animate-pulse"></div>
      <div className="w-10 h-10 bg-gray-300 rounded-lg dark:bg-gray-700 animate-pulse"></div>
    </div>
  </nav>
);

export const HeroSkeleton = () => (
  <section className="relative flex flex-col items-center justify-center min-h-screen px-4 text-center">
    {/* Title Skeleton */}
    <div className="w-3/4 max-w-3xl h-12 mb-6 bg-gray-300 rounded dark:bg-gray-700 animate-pulse md:h-16"></div>

    {/* Subtitle Skeleton */}
    <div className="w-full max-w-2xl h-6 mb-3 bg-gray-300 rounded dark:bg-gray-700 animate-pulse"></div>
    <div className="w-5/6 max-w-xl h-6 mb-8 bg-gray-300 rounded dark:bg-gray-700 animate-pulse"></div>

    {/* Buttons Skeleton */}
    <div className="flex flex-wrap items-center justify-center gap-6">
      <div className="w-40 h-12 bg-gray-300 rounded-full dark:bg-gray-700 animate-pulse"></div>
      <div className="w-40 h-12 bg-gray-300 rounded-full dark:bg-gray-700 animate-pulse"></div>
    </div>

    {/* Code Card Skeleton */}
    <div className="w-full max-w-2xl h-48 mt-16 bg-gray-300 border border-gray-200 rounded-xl dark:bg-gray-800 dark:border-gray-700 animate-pulse backdrop-blur-md"></div>
  </section>
);

const LoadingScreen = () => {
  return (
    <div
      className="flex flex-col w-full min-h-screen bg-gray-50 dark:bg-gray-900"
      role="status"
      aria-busy="true"
    >
      <span className="sr-only">Loading ChatRaj...</span>

      <NavbarSkeleton />
      <HeroSkeleton />
    </div>
  );
};

export default LoadingScreen;
