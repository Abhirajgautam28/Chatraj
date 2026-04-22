export const formatMessageTime = (timestamp) => {
  const date = new Date(timestamp);
  const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateString = date.toLocaleDateString([], {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  return `${dateString} ${timeString}`;
};

export const languages = {
  'en-US': {
    name: 'English (US)',
    translations: {
      settings: 'Settings',
      darkMode: 'Dark Mode',
      themeColors: 'Theme Colors',
      chatBubbles: 'Chat Bubbles',
      newChat: 'New Chat',
      sendMessage: 'Send Message',
      thinking: 'Thinking...',
      welcomeMessage: 'How can I help you today?',
      welcomeSubtext: 'Ask me anything about programming, development, or tech in general.',
      disclaimer: 'ChatRaj can make mistakes. Please recheck important information manually.'
    }
  },
  'hi-IN': {
    name: 'हिंदी (Hindi)',
    translations: {
      settings: 'सेटिंग्स',
      darkMode: 'डार्क मोड',
      themeColors: 'थीम रंग',
      chatBubbles: 'चैट बबल्स',
      newChat: 'नई चैट',
      sendMessage: 'संदेश भेजें',
      thinking: 'सोच रहा हूं...',
      welcomeMessage: 'मैं आपकी कैसे मदद कर सकता हूं?',
      welcomeSubtext: 'प्रोग्रामिंग, डेवलपमेंट या टेक से जुड़ा कोई भी सवाल पूछें।',
      disclaimer: 'ChatRaj से गलतियां हो सकती हैं। कृपया महत्वपूर्ण जानकारी की पुनः जांच करें।'
    }
  },
  'es-ES': {
    name: 'Español (Spanish)',
    translations: {
      settings: 'Ajustes',
      darkMode: 'Modo Oscuro',
      themeColors: 'Colores del Tema',
      chatBubbles: 'Burbujas de Chat',
      newChat: 'Nuevo Chat',
      sendMessage: 'Enviar Mensaje',
      thinking: 'Pensando...',
      welcomeMessage: '¿Cómo puedo ayudarte hoy?',
      welcomeSubtext: 'Pregúntame cualquier cosa sobre programación, desarrollo o tecnología.',
      disclaimer: 'ChatRaj puede cometer errores. Por favor, verifica la información importante.'
    }
  },
  'fr-FR': {
    name: 'Français (French)',
    translations: {
      settings: 'Paramètres',
      darkMode: 'Mode Sombre',
      themeColors: 'Couleurs du Thème',
      chatBubbles: 'Bulles de Chat',
      newChat: 'Nouvelle Discussion',
      sendMessage: 'Envoyer',
      thinking: 'Réflexion...',
      welcomeMessage: 'Comment puis-je vous aider aujourd\'hui?',
      welcomeSubtext: 'Posez-moi vos questions sur la programmation, le développement ou la technologie.',
      disclaimer: 'ChatRaj peut faire des erreurs. Veuillez revérifier les informations importantes.'
    }
  },
  'de-DE': {
    name: 'Deutsch (German)',
    translations: {
      settings: 'Einstellungen',
      darkMode: 'Dunkelmodus',
      themeColors: 'Designfarben',
      chatBubbles: 'Chatblasen',
      newChat: 'Neuer Chat',
      sendMessage: 'Nachricht senden',
      thinking: 'Denke nach...',
      welcomeMessage: 'Wie kann ich Ihnen heute helfen?',
      welcomeSubtext: 'Fragen Sie mich alles über Programmierung, Entwicklung oder Technologie.',
      disclaimer: 'ChatRaj kann Fehler machen. Bitte überprüfen Sie wichtige Informationen.'
    }
  },
  'ja-JP': {
    name: '日本語 (Japanese)',
    translations: {
      settings: '設定',
      darkMode: 'ダークモード',
      themeColors: 'テーマカラー',
      chatBubbles: 'チャットバブル',
      newChat: '新規チャット',
      sendMessage: '送信',
      thinking: '考え中...',
      welcomeMessage: '本日はどのようにお手伝いできますか？',
      welcomeSubtext: 'プログラミング、開発、技術に関する質問をお気軽にどうぞ。',
      disclaimer: 'ChatRajは間違える可能性があります。重要な情報は必ず確認してください。'
    }
  }
};
