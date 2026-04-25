export const getThemeClasses = (uiTheme, isDarkMode) => {
  // Base classes that change according to the chosen UI theme
  const themes = {
    default: {
      container: isDarkMode
        ? 'bg-gray-900/40 border-white/10 shadow-xl backdrop-blur-md'
        : 'bg-white/40 border-white/40 shadow-xl backdrop-blur-md',
      textMain: isDarkMode ? 'text-white' : 'text-gray-800',
      textMuted: isDarkMode ? 'text-gray-300' : 'text-gray-600',
      border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
      input: isDarkMode
        ? 'bg-gray-800/50 text-white border-gray-700 focus:border-blue-500 placeholder-gray-400'
        : 'bg-white/50 text-gray-900 border-gray-300 focus:border-blue-500 placeholder-gray-500',
      buttonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg',
      buttonSecondary: isDarkMode
        ? 'bg-gray-800 text-white hover:bg-gray-700 border-gray-600'
        : 'bg-white text-gray-800 hover:bg-gray-50 border-gray-300'
    },
    glassmorphism: {
      container: isDarkMode
        ? 'bg-black/20 border-white/10 shadow-[0_8px_32px_0_rgba(255,255,255,0.05)] backdrop-blur-xl'
        : 'bg-white/20 border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] backdrop-blur-xl',
      textMain: isDarkMode ? 'text-gray-50' : 'text-gray-900',
      textMuted: isDarkMode ? 'text-gray-300' : 'text-gray-700',
      border: isDarkMode ? 'border-white/10' : 'border-black/5',
      input: isDarkMode
        ? 'bg-black/30 text-white border-white/20 focus:border-white/40 placeholder-gray-400 backdrop-blur-sm'
        : 'bg-white/40 text-gray-900 border-white/50 focus:border-white/80 placeholder-gray-600 backdrop-blur-sm',
      buttonPrimary: isDarkMode
        ? 'bg-blue-600/80 hover:bg-blue-500/90 text-white shadow-[0_8px_32px_0_rgba(59,130,246,0.3)] backdrop-blur-md border border-blue-400/30'
        : 'bg-blue-500/80 hover:bg-blue-600/90 text-white shadow-[0_8px_32px_0_rgba(59,130,246,0.3)] backdrop-blur-md border border-white/50',
      buttonSecondary: isDarkMode
        ? 'bg-black/30 text-white hover:bg-black/50 border-white/10 backdrop-blur-sm'
        : 'bg-white/40 text-gray-900 hover:bg-white/60 border-white/40 backdrop-blur-sm'
    },
    claymorphism: {
      container: isDarkMode
        ? 'bg-gray-800 shadow-[inset_4px_4px_8px_rgba(255,255,255,0.05),_8px_8px_16px_rgba(0,0,0,0.5)] border-transparent rounded-[32px]'
        : 'bg-gray-100 shadow-[inset_4px_4px_8px_rgba(255,255,255,0.8),_8px_8px_16px_rgba(0,0,0,0.1)] border-transparent rounded-[32px]',
      textMain: isDarkMode ? 'text-gray-100' : 'text-gray-800',
      textMuted: isDarkMode ? 'text-gray-400' : 'text-gray-600',
      border: 'border-transparent',
      input: isDarkMode
        ? 'bg-gray-900 text-white border-transparent shadow-[inset_4px_4px_8px_rgba(0,0,0,0.4),_inset_-4px_-4px_8px_rgba(255,255,255,0.05)] focus:ring-2 focus:ring-blue-500/50 rounded-2xl'
        : 'bg-gray-200 text-gray-900 border-transparent shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),_inset_-4px_-4px_8px_rgba(255,255,255,0.8)] focus:ring-2 focus:ring-blue-400/50 rounded-2xl',
      buttonPrimary: isDarkMode
        ? 'bg-blue-600 text-white shadow-[inset_2px_2px_4px_rgba(255,255,255,0.3),_4px_4px_8px_rgba(0,0,0,0.4)] hover:shadow-[inset_2px_2px_4px_rgba(255,255,255,0.3),_2px_2px_4px_rgba(0,0,0,0.4)] hover:translate-y-[2px] transition-all rounded-2xl border-none'
        : 'bg-blue-500 text-white shadow-[inset_2px_2px_4px_rgba(255,255,255,0.4),_4px_4px_8px_rgba(0,0,0,0.15)] hover:shadow-[inset_2px_2px_4px_rgba(255,255,255,0.4),_2px_2px_4px_rgba(0,0,0,0.15)] hover:translate-y-[2px] transition-all rounded-2xl border-none',
      buttonSecondary: isDarkMode
        ? 'bg-gray-800 text-white shadow-[inset_2px_2px_4px_rgba(255,255,255,0.05),_4px_4px_8px_rgba(0,0,0,0.3)] hover:shadow-[inset_2px_2px_4px_rgba(255,255,255,0.05),_2px_2px_4px_rgba(0,0,0,0.3)] hover:translate-y-[2px] transition-all rounded-2xl border-none'
        : 'bg-gray-100 text-gray-800 shadow-[inset_2px_2px_4px_rgba(255,255,255,0.8),_4px_4px_8px_rgba(0,0,0,0.1)] hover:shadow-[inset_2px_2px_4px_rgba(255,255,255,0.8),_2px_2px_4px_rgba(0,0,0,0.1)] hover:translate-y-[2px] transition-all rounded-2xl border-none'
    },
    liquidglass: {
      container: isDarkMode
        ? 'bg-gradient-to-br from-gray-900/60 to-gray-800/40 border-t border-l border-white/10 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] backdrop-blur-lg rounded-[40px]'
        : 'bg-gradient-to-br from-white/70 to-white/30 border-t border-l border-white/60 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] backdrop-blur-lg rounded-[40px]',
      textMain: isDarkMode ? 'text-blue-50' : 'text-blue-950',
      textMuted: isDarkMode ? 'text-blue-200/70' : 'text-blue-800/70',
      border: isDarkMode ? 'border-white/10' : 'border-white/50',
      input: isDarkMode
        ? 'bg-black/20 text-white border-t border-l border-white/10 focus:border-blue-400/50 shadow-inner rounded-3xl backdrop-blur-md'
        : 'bg-white/40 text-gray-900 border-t border-l border-white/80 focus:border-blue-400/50 shadow-inner rounded-3xl backdrop-blur-md',
      buttonPrimary: isDarkMode
        ? 'bg-gradient-to-br from-blue-500/80 to-blue-600/80 text-white border-t border-l border-white/20 shadow-[0_10px_20px_-5px_rgba(59,130,246,0.4)] hover:shadow-[0_15px_25px_-5px_rgba(59,130,246,0.5)] rounded-full backdrop-blur-md'
        : 'bg-gradient-to-br from-blue-400/90 to-blue-500/90 text-white border-t border-l border-white/50 shadow-[0_10px_20px_-5px_rgba(59,130,246,0.4)] hover:shadow-[0_15px_25px_-5px_rgba(59,130,246,0.5)] rounded-full backdrop-blur-md',
      buttonSecondary: isDarkMode
        ? 'bg-gradient-to-br from-gray-800/60 to-gray-900/60 text-white border-t border-l border-white/10 shadow-[0_10px_20px_-5px_rgba(0,0,0,0.3)] hover:shadow-[0_15px_25px_-5px_rgba(0,0,0,0.4)] rounded-full backdrop-blur-md'
        : 'bg-gradient-to-br from-white/80 to-white/40 text-gray-800 border-t border-l border-white/80 shadow-[0_10px_20px_-5px_rgba(0,0,0,0.05)] hover:shadow-[0_15px_25px_-5px_rgba(0,0,0,0.1)] rounded-full backdrop-blur-md'
    },
    minimalist: {
      container: isDarkMode
        ? 'bg-[#121212] border border-[#2A2A2A] shadow-sm rounded-lg'
        : 'bg-white border border-gray-200 shadow-sm rounded-lg',
      textMain: isDarkMode ? 'text-gray-100' : 'text-gray-900',
      textMuted: isDarkMode ? 'text-gray-500' : 'text-gray-500',
      border: isDarkMode ? 'border-[#2A2A2A]' : 'border-gray-200',
      input: isDarkMode
        ? 'bg-[#1A1A1A] text-gray-100 border-[#333] focus:border-blue-500 rounded-md placeholder-gray-600'
        : 'bg-gray-50 text-gray-900 border-gray-300 focus:border-black rounded-md placeholder-gray-400',
      buttonPrimary: isDarkMode
        ? 'bg-white text-black hover:bg-gray-200 border border-transparent rounded-md font-medium'
        : 'bg-black text-white hover:bg-gray-800 border border-transparent rounded-md font-medium',
      buttonSecondary: isDarkMode
        ? 'bg-transparent text-gray-300 hover:text-white border border-[#333] hover:border-gray-500 rounded-md'
        : 'bg-transparent text-gray-600 hover:text-black border border-gray-300 hover:border-gray-500 rounded-md'
    }
  };

  return themes[uiTheme] || themes.default;
};
