export const getThemeClasses = (uiTheme, isDarkMode) => {
  // Base classes that change according to the chosen UI theme
  const themes = {
    default: {
      background: isDarkMode ? 'bg-[#000000]' : 'bg-[#fafafa]',
      container: isDarkMode
        ? 'bg-gray-900/40 border-white/10 shadow-xl backdrop-blur-md'
        : 'bg-white/40 border-white/40 shadow-xl backdrop-blur-md',
      textMain: isDarkMode ? 'text-white font-sans' : 'text-gray-800 font-sans',
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
      background: isDarkMode ? 'bg-[#000000]' : 'bg-[#fafafa]',
      container: isDarkMode
        ? 'bg-black/20 border border-white/10 shadow-[0_8px_32px_0_rgba(255,255,255,0.05)] backdrop-blur-xl rounded-2xl'
        : 'bg-white/20 border border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] backdrop-blur-xl rounded-2xl',
      textMain: isDarkMode ? 'text-gray-50 font-light tracking-wide' : 'text-gray-900 font-light tracking-wide',
      textMuted: isDarkMode ? 'text-gray-300' : 'text-gray-700',
      border: isDarkMode ? 'border-white/10' : 'border-black/5',
      input: isDarkMode
        ? 'bg-black/30 text-white border-white/20 focus:border-white/40 placeholder-gray-400 backdrop-blur-sm'
        : 'bg-white/40 text-gray-900 border-white/50 focus:border-white/80 placeholder-gray-600 backdrop-blur-sm',
      buttonPrimary: isDarkMode
        ? 'bg-blue-600/80 hover:bg-blue-500/90 text-white shadow-[0_8px_32px_0_rgba(59,130,246,0.3)] backdrop-blur-md border border-blue-400/30 hover:-translate-y-1 transition-transform'
        : 'bg-blue-500/80 hover:bg-blue-600/90 text-white shadow-[0_8px_32px_0_rgba(59,130,246,0.3)] backdrop-blur-md border border-white/50 hover:-translate-y-1 transition-transform',
      buttonSecondary: isDarkMode
        ? 'bg-black/30 text-white hover:bg-black/50 border-white/10 backdrop-blur-sm'
        : 'bg-white/40 text-gray-900 hover:bg-white/60 border-white/40 backdrop-blur-sm'
    },
    claymorphism: {
      background: isDarkMode ? 'bg-[#000000]' : 'bg-[#fafafa]',
      container: isDarkMode
        ? 'bg-gray-800 shadow-[inset_4px_4px_8px_rgba(255,255,255,0.05),_8px_8px_16px_rgba(0,0,0,0.5)] border-transparent rounded-[32px]'
        : 'bg-gray-100 shadow-[inset_4px_4px_8px_rgba(255,255,255,0.8),_8px_8px_16px_rgba(0,0,0,0.1)] border-transparent rounded-[32px]',
      textMain: isDarkMode ? 'text-gray-100 font-bold' : 'text-gray-800 font-bold',
      textMuted: isDarkMode ? 'text-gray-400' : 'text-gray-600',
      border: 'border-transparent',
      input: isDarkMode
        ? 'bg-gray-900 text-white border-transparent shadow-[inset_4px_4px_8px_rgba(0,0,0,0.4),_inset_-4px_-4px_8px_rgba(255,255,255,0.05)] focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded-2xl transition-all'
        : 'bg-gray-200 text-gray-900 border-transparent shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),_inset_-4px_-4px_8px_rgba(255,255,255,0.8)] focus:outline-none focus:ring-2 focus:ring-blue-400/50 rounded-2xl transition-all',
      buttonPrimary: isDarkMode
        ? 'bg-blue-600 text-white shadow-[inset_2px_2px_4px_rgba(255,255,255,0.3),_4px_4px_8px_rgba(0,0,0,0.4)] hover:shadow-[inset_2px_2px_4px_rgba(255,255,255,0.3),_2px_2px_4px_rgba(0,0,0,0.4)] hover:translate-y-[2px] transition-all rounded-2xl border-none'
        : 'bg-blue-500 text-white shadow-[inset_2px_2px_4px_rgba(255,255,255,0.4),_4px_4px_8px_rgba(0,0,0,0.15)] hover:shadow-[inset_2px_2px_4px_rgba(255,255,255,0.4),_2px_2px_4px_rgba(0,0,0,0.15)] hover:translate-y-[2px] transition-all rounded-2xl border-none',
      buttonSecondary: isDarkMode
        ? 'bg-gray-800 text-white shadow-[inset_2px_2px_4px_rgba(255,255,255,0.05),_4px_4px_8px_rgba(0,0,0,0.3)] hover:shadow-[inset_2px_2px_4px_rgba(255,255,255,0.05),_2px_2px_4px_rgba(0,0,0,0.3)] hover:translate-y-[2px] transition-all rounded-2xl border-none'
        : 'bg-gray-100 text-gray-800 shadow-[inset_2px_2px_4px_rgba(255,255,255,0.8),_4px_4px_8px_rgba(0,0,0,0.1)] hover:shadow-[inset_2px_2px_4px_rgba(255,255,255,0.8),_2px_2px_4px_rgba(0,0,0,0.1)] hover:translate-y-[2px] transition-all rounded-2xl border-none'
    },
    liquidglass: {
      background: isDarkMode ? 'bg-[#000000]' : 'bg-[#fafafa]',
      container: isDarkMode
        ? 'bg-gradient-to-br from-gray-900/60 to-gray-800/40 border-t border-l border-white/10 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] backdrop-blur-lg rounded-full'
        : 'bg-gradient-to-br from-white/70 to-white/30 border-t border-l border-white/60 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] backdrop-blur-lg rounded-full',
      textMain: isDarkMode ? 'text-blue-50 font-serif' : 'text-blue-950 font-serif',
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
      background: isDarkMode ? 'bg-[#000000]' : 'bg-[#fafafa]',
      container: isDarkMode
        ? 'bg-[#000000] border-2 border-[#ffffff] shadow-[8px_8px_0px_0px_#ffffff] rounded-none hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[12px_12px_0px_0px_#ffffff] transition-all'
        : 'bg-[#ffffff] border-2 border-[#000000] shadow-[8px_8px_0px_0px_#000000] rounded-none hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[12px_12px_0px_0px_#000000] transition-all',
      textMain: isDarkMode ? 'text-[#f4f4f5] font-mono tracking-tighter uppercase' : 'text-[#09090b] font-mono tracking-tighter uppercase',
      textMuted: isDarkMode ? 'text-[#a1a1aa]' : 'text-[#71717a]',
      border: isDarkMode ? 'border-[#27272a]' : 'border-[#e4e4e7]',
      input: isDarkMode
        ? 'bg-[#09090b] text-[#f4f4f5] border border-[#27272a] focus:border-[#f4f4f5] rounded-full placeholder-[#71717a] focus:outline-none focus:ring-1 focus:ring-[#f4f4f5] transition-all'
        : 'bg-white text-[#09090b] border border-[#e4e4e7] focus:border-[#09090b] rounded-full placeholder-[#a1a1aa] focus:outline-none focus:ring-1 focus:ring-[#09090b] transition-all',
      buttonPrimary: isDarkMode
        ? 'bg-[#ffffff] text-[#000000] border-2 border-[#ffffff] rounded-none font-bold hover:bg-[#cccccc] transition-colors'
        : 'bg-[#000000] text-[#ffffff] border-2 border-[#000000] rounded-none font-bold hover:bg-[#333333] transition-colors',
      buttonSecondary: isDarkMode
        ? 'bg-transparent text-[#f4f4f5] hover:bg-[#27272a] border border-[#27272a] rounded-full font-medium transition-colors'
        : 'bg-transparent text-[#09090b] hover:bg-[#f4f4f5] border border-[#e4e4e7] rounded-full font-medium transition-colors'
    },
    materialui: {
      background: isDarkMode ? 'bg-[#000000]' : 'bg-[#fafafa]',
      container: isDarkMode
        ? 'bg-[#1e1e1e] border border-transparent shadow-md rounded-2xl'
        : 'bg-[#ffffff] border border-transparent shadow-md rounded-2xl',
      textMain: isDarkMode ? 'text-[#e3e3e3] font-sans font-medium' : 'text-[#1f1f1f] font-sans font-medium',
      textMuted: isDarkMode ? 'text-[#c4c7c5]' : 'text-[#444746]',
      border: 'border-transparent',
      input: isDarkMode
        ? 'bg-transparent text-white border border-[#444746] focus:border-[#a8c7fa] focus:border-2 rounded-md placeholder-[#c4c7c5] focus:outline-none transition-all'
        : 'bg-transparent text-black border border-[#747775] focus:border-[#0b57d0] focus:border-2 rounded-md placeholder-[#444746] focus:outline-none transition-all',
      buttonPrimary: isDarkMode
        ? 'bg-[#a8c7fa] text-[#062e6f] hover:bg-[#b9d2fa] border-transparent rounded-full font-medium transition-all shadow-sm active:shadow-inner'
        : 'bg-[#0b57d0] text-white hover:bg-[#1b62d4] border-transparent rounded-full font-medium transition-all shadow-sm active:shadow-inner',
      buttonSecondary: isDarkMode
        ? 'bg-transparent text-[#a8c7fa] hover:bg-[#a8c7fa]/10 border border-[#444746] rounded-full font-medium transition-colors'
        : 'bg-transparent text-[#0b57d0] hover:bg-[#0b57d0]/10 border border-[#747775] rounded-full font-medium transition-colors'
    }
  };

  return themes[uiTheme] || themes.default;
};
