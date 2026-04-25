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
        ? 'bg-black/20 border border-white/10 shadow-[0_8px_32px_0_rgba(255,255,255,0.05)] backdrop-blur-xl rounded-2xl'
        : 'bg-white/20 border border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] backdrop-blur-xl rounded-2xl',
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
        ? 'bg-[#000000] border border-[#333333] shadow-none rounded-none'
        : 'bg-[#ffffff] border border-[#e5e5e5] shadow-none rounded-none',
      textMain: isDarkMode ? 'text-white font-light tracking-wide' : 'text-black font-light tracking-wide',
      textMuted: isDarkMode ? 'text-gray-400 font-light' : 'text-gray-500 font-light',
      border: isDarkMode ? 'border-[#333333]' : 'border-[#e5e5e5]',
      input: isDarkMode
        ? 'bg-[#0a0a0a] text-white border-b border-[#333333] focus:border-white rounded-none placeholder-gray-600 focus:outline-none transition-all px-0'
        : 'bg-[#fafafa] text-black border-b border-[#e5e5e5] focus:border-black rounded-none placeholder-gray-400 focus:outline-none transition-all px-0',
      buttonPrimary: isDarkMode
        ? 'bg-white text-black hover:bg-[#e5e5e5] border border-transparent rounded-none font-medium tracking-widest uppercase text-sm'
        : 'bg-black text-white hover:bg-[#1a1a1a] border border-transparent rounded-none font-medium tracking-widest uppercase text-sm',
      buttonSecondary: isDarkMode
        ? 'bg-transparent text-white hover:bg-[#111111] border border-[#333333] hover:border-white rounded-none font-medium tracking-widest uppercase text-sm transition-all'
        : 'bg-transparent text-black hover:bg-[#fafafa] border border-[#e5e5e5] hover:border-black rounded-none font-medium tracking-widest uppercase text-sm transition-all'
    },
    neumorphism: {
      container: isDarkMode
        ? 'bg-[#1a1a2e] border-transparent shadow-[8px_8px_16px_#121220,-8px_-8px_16px_#22223c] rounded-2xl'
        : 'bg-[#e0e5ec] border-transparent shadow-[9px_9px_16px_rgb(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.5)] rounded-2xl',
      textMain: isDarkMode ? 'text-[#e2e2e2]' : 'text-[#4d4d4d]',
      textMuted: isDarkMode ? 'text-[#8c8c8c]' : 'text-[#797979]',
      border: 'border-transparent',
      input: isDarkMode
        ? 'bg-[#1a1a2e] text-[#e2e2e2] border-transparent shadow-[inset_6px_6px_12px_#121220,inset_-6px_-6px_12px_#22223c] focus:outline-none focus:ring-1 focus:ring-[#22223c] rounded-xl transition-all'
        : 'bg-[#e0e5ec] text-[#4d4d4d] border-transparent shadow-[inset_6px_6px_10px_0_rgba(163,177,198,0.6),inset_-6px_-6px_10px_0_rgba(255,255,255,0.5)] focus:outline-none focus:ring-1 focus:ring-white rounded-xl transition-all',
      buttonPrimary: isDarkMode
        ? 'bg-[#1a1a2e] text-[#4a90e2] shadow-[6px_6px_12px_#121220,-6px_-6px_12px_#22223c] hover:shadow-[inset_6px_6px_12px_#121220,inset_-6px_-6px_12px_#22223c] border-transparent rounded-xl font-semibold transition-all'
        : 'bg-[#e0e5ec] text-[#4a90e2] shadow-[6px_6px_10px_0_rgba(163,177,198,0.6),-6px_-6px_10px_0_rgba(255,255,255,0.5)] hover:shadow-[inset_6px_6px_10px_0_rgba(163,177,198,0.6),inset_-6px_-6px_10px_0_rgba(255,255,255,0.5)] border-transparent rounded-xl font-semibold transition-all',
      buttonSecondary: isDarkMode
        ? 'bg-[#1a1a2e] text-[#e2e2e2] shadow-[6px_6px_12px_#121220,-6px_-6px_12px_#22223c] hover:shadow-[inset_6px_6px_12px_#121220,inset_-6px_-6px_12px_#22223c] border-transparent rounded-xl transition-all'
        : 'bg-[#e0e5ec] text-[#4d4d4d] shadow-[6px_6px_10px_0_rgba(163,177,198,0.6),-6px_-6px_10px_0_rgba(255,255,255,0.5)] hover:shadow-[inset_6px_6px_10px_0_rgba(163,177,198,0.6),inset_-6px_-6px_10px_0_rgba(255,255,255,0.5)] border-transparent rounded-xl transition-all'
    }
  };

  return themes[uiTheme] || themes.default;
};
