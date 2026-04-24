const fs = require('fs');

const file = 'frontend/src/index.css';
let content = fs.readFileSync(file, 'utf8');

// The user wants the theme switch animation to look like a liquid splash/fill that covers the whole screen.
const liquidTransitionCss = `
/* Liquid Swipe View Transition specifically for Home Screen */
.theme-transition-liquid::view-transition-group(root) {
  animation-duration: var(--theme-transition-duration);
}

.theme-transition-liquid::view-transition-old(root) {
  animation: liquid-splash-exit var(--theme-transition-duration) cubic-bezier(0.4, 0, 0.2, 1) forwards;
  z-index: 1;
}

.theme-transition-liquid::view-transition-new(root) {
  animation: liquid-splash-enter var(--theme-transition-duration) cubic-bezier(0.4, 0, 0.2, 1) forwards;
  z-index: 2;
}

@keyframes liquid-splash-exit {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@keyframes liquid-splash-enter {
  0% {
    clip-path: circle(0% at 50% 50%);
  }
  50% {
    clip-path: circle(50% at 50% 50%);
  }
  100% {
    clip-path: circle(150% at 50% 50%);
  }
}
`;

// Replace the existing liquid transition
content = content.replace(/\/\* Liquid Swipe View Transition specifically for Home Screen \*\/(.|\n)*?(?=\/\* Fallback for browsers that do not support View Transitions \*\/)/, liquidTransitionCss);

fs.writeFileSync(file, content);
console.log('index.css updated with liquid splash animation.');
