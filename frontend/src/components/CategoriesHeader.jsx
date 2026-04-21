import React, { memo } from 'react';
import PropTypes from 'prop-types';
import Dropdown from './Dropdown';

const CategoriesHeader = ({
  search,
  setSearch,
  view,
  setView,
  tileSize,
  setTileSize,
  themeMode,
  setThemeMode,
  openDropdown,
  setOpenDropdown,
  handleLogout
}) => {
  return (
    <nav className="sticky top-0 z-40 h-20 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 px-6 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4 shrink-0">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
          <i className="ri-command-line text-white text-xl"></i>
        </div>
        <h1 className="text-xl font-bold tracking-tight hidden md:block dark:text-white">Categories</h1>
      </div>

      <div className="flex-1 max-w-xl relative hidden sm:block">
        <input
          type="text"
          placeholder="Search categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-gray-100 dark:bg-gray-900 border border-transparent dark:border-gray-800 rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-800 transition-all dark:text-white"
        />
        <i className="ri-search-2-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl"></i>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Dropdown
          label="View"
          icon="ri-layout-grid-line"
          value={view}
          onChange={setView}
          isOpen={openDropdown === 'view'}
          onToggle={() => setOpenDropdown(openDropdown === 'view' ? null : 'view')}
          options={[
            { key: 'grid', label: 'Grid', icon: 'ri-grid-fill' },
            { key: 'list', label: 'List', icon: 'ri-list-check' },
            { key: 'compact', label: 'Compact', icon: 'ri-layout-column-line' },
            { key: 'detailed', label: 'Detailed', icon: 'ri-layout-masonry-line' }
          ]}
        />

        <Dropdown
          label="Size"
          icon="ri-aspect-ratio-line"
          value={tileSize}
          onChange={setTileSize}
          isOpen={openDropdown === 'tileSize'}
          onToggle={() => setOpenDropdown(openDropdown === 'tileSize' ? null : 'tileSize')}
          options={[
            { key: 'sm', label: 'Small', icon: 'ri-font-size' },
            { key: 'md', label: 'Medium', icon: 'ri-font-size-2' },
            { key: 'lg', label: 'Large', icon: 'ri-text' }
          ]}
        />

        <Dropdown
          label="Theme"
          icon="ri-palette-line"
          value={themeMode}
          onChange={setThemeMode}
          isOpen={openDropdown === 'theme'}
          onToggle={() => setOpenDropdown(openDropdown === 'theme' ? null : 'theme')}
          options={[
            { key: 'system', label: 'System', icon: 'ri-computer-line' },
            { key: 'light', label: 'Light', icon: 'ri-sun-line' },
            { key: 'dark', label: 'Dark', icon: 'ri-moon-line' }
          ]}
        />

        <button
          onClick={handleLogout}
          className="ml-2 px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl hover:opacity-90 transition-all shadow-lg text-sm"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

CategoriesHeader.propTypes = {
  search: PropTypes.string.isRequired,
  setSearch: PropTypes.func.isRequired,
  view: PropTypes.string.isRequired,
  setView: PropTypes.func.isRequired,
  tileSize: PropTypes.string.isRequired,
  setTileSize: PropTypes.func.isRequired,
  themeMode: PropTypes.string.isRequired,
  setThemeMode: PropTypes.func.isRequired,
  openDropdown: PropTypes.string,
  setOpenDropdown: PropTypes.func.isRequired,
  handleLogout: PropTypes.func.isRequired,
};

export default memo(CategoriesHeader);
