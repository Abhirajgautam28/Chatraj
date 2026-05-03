import React from 'react';

export const SidebarSkeleton = () => (
  <div className="hidden md:flex flex-col w-64 p-4 border-r border-gray-200 dark:border-gray-800">
    <div className="h-8 mb-8 bg-gray-200 rounded dark:bg-gray-700 animate-pulse w-3/4"></div>
    <div className="space-y-4">
      <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 animate-pulse w-full"></div>
      <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 animate-pulse w-5/6"></div>
      <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 animate-pulse w-full"></div>
      <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 animate-pulse w-4/5"></div>
    </div>
  </div>
);

export const HeaderSkeleton = () => (
  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 h-16">
    <div className="h-6 bg-gray-200 rounded dark:bg-gray-700 animate-pulse w-1/4"></div>
    <div className="flex gap-4">
      <div className="w-8 h-8 bg-gray-200 rounded-full dark:bg-gray-700 animate-pulse"></div>
      <div className="w-8 h-8 bg-gray-200 rounded-full dark:bg-gray-700 animate-pulse"></div>
    </div>
  </div>
);

export const ContentSkeleton = () => (
  <div className="p-6 space-y-6">
    {/* Top Cards/Widgets */}
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div className="h-32 bg-gray-200 rounded-xl dark:bg-gray-700 animate-pulse"></div>
      <div className="h-32 bg-gray-200 rounded-xl dark:bg-gray-700 animate-pulse"></div>
      <div className="h-32 bg-gray-200 rounded-xl dark:bg-gray-700 animate-pulse"></div>
    </div>

    {/* Main Body Section */}
    <div className="space-y-4">
      <div className="h-8 bg-gray-200 rounded dark:bg-gray-700 animate-pulse w-1/3"></div>
      <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 animate-pulse w-full"></div>
      <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 animate-pulse w-11/12"></div>
      <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 animate-pulse w-full"></div>
      <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 animate-pulse w-4/5"></div>

      <div className="h-64 mt-6 bg-gray-200 rounded-xl dark:bg-gray-700 animate-pulse w-full"></div>
    </div>
  </div>
);

const LoadingScreen = () => {
  return (
    <div
      className="flex w-full min-h-screen bg-gray-50 dark:bg-gray-900"
      role="status"
      aria-busy="true"
    >
      <span className="sr-only">Loading ChatRaj...</span>

      <SidebarSkeleton />

      <div className="flex flex-col flex-1">
        <HeaderSkeleton />
        <ContentSkeleton />
      </div>
    </div>
  );
};

export default LoadingScreen;
