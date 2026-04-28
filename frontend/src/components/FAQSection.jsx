import React from 'react';
import PropTypes from 'prop-types';

const FAQSection = ({ faqs, isDarkMode }) => {
  return (
    <section className="relative z-10 py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className={`mb-12 text-3xl font-bold text-center ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          {faqs.map((faq, i) => (
            <details
              key={i}
              className={`p-6 rounded-2xl shadow-sm transition-all border ${
                isDarkMode
                  ? 'bg-gray-900/70 border-gray-800 text-gray-300'
                  : 'bg-white/90 border-gray-100 text-gray-600'
              }`}
            >
              <summary className={`mb-2 text-lg font-semibold cursor-pointer focus:outline-none ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`}>
                {faq.q}
              </summary>
              <p className="leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
};

FAQSection.propTypes = {
  faqs: PropTypes.arrayOf(PropTypes.shape({
    q: PropTypes.string.isRequired,
    a: PropTypes.string.isRequired
  })).isRequired,
  isDarkMode: PropTypes.bool.isRequired
};

export default FAQSection;
