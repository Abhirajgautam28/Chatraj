// register-css-mock.js
// This file registers a require hook to mock all CSS imports as empty objects for Vitest/Node
if (typeof require !== 'undefined' && require.extensions) {
  require.extensions['.css'] = function () { return {}; };
}
