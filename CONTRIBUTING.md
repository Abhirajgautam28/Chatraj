# Contributing to ChatRaj

Thank you for your interest in contributing to **ChatRaj**!  
We welcome contributions from everyone—whether you're fixing a typo, adding a feature, or proposing a major architectural change.

This document outlines the process to help you make the biggest impact and ensure a smooth collaboration.

---

## Table of Contents

- [Contributing to ChatRaj](#contributing-to-chatraj)
  - [Table of Contents](#table-of-contents)
  - [Code of Conduct](#code-of-conduct)
  - [How to Contribute](#how-to-contribute)
    - [Reporting Bugs](#reporting-bugs)
    - [Suggesting Enhancements](#suggesting-enhancements)
    - [Pull Requests](#pull-requests)
  - [Development Guidelines](#development-guidelines)
    - [Project Structure](#project-structure)
    - [Coding Standards](#coding-standards)
    - [Commit Messages](#commit-messages)
    - [Branching Model](#branching-model)
    - [Testing](#testing)
    - [Documentation](#documentation)
  - [Security Policy](#security-policy)
  - [Community and Support](#community-and-support)
  - [License](#license)

---

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md) to foster a welcoming and respectful community.

---

## How to Contribute

### Reporting Bugs

- **Search first:** Check [open issues](https://github.com/Abhirajgautam28/Chatraj/issues) to avoid duplicates.
- **Create a new issue:** If your bug is not listed, [open a new issue](https://github.com/Abhirajgautam28/Chatraj/issues/new).
- **Include details:** Describe the problem, steps to reproduce, expected and actual behavior, and environment (OS, browser, Node version, etc.).
- **Screenshots/logs:** Attach screenshots or logs if possible.

### Suggesting Enhancements

- **Search first:** Look for existing feature requests.
- **Open an issue:** [Submit a feature request](https://github.com/Abhirajgautam28/Chatraj/issues/new?template=feature_request.md).
- **Describe clearly:** Explain the motivation, use case, and potential implementation ideas.

### Pull Requests

1. **Fork the repository** and create your branch from `main` or the appropriate development branch.
2. **Write clear, focused commits** ([see below](#commit-messages)).
3. **Test your changes** locally.
4. **Update documentation** if needed.
5. **Open a Pull Request** with a clear description of your changes and reference any related issues.
6. **Participate in the review:** Address feedback and make necessary changes.

**Note:** All contributions must pass CI checks and code review before merging.

---

## Development Guidelines

### Project Structure

See [`PROJECT_EXPLANATION.md`](PROJECT_EXPLANATION.md) and [`README.md`](README.md) for a detailed overview.

- **Backend:** `Backend/` (Express, MongoDB, Socket.io)
- **Frontend:** `frontend/` (React, Vite, Tailwind CSS)
- **Docs:** Markdown files in the root directory

### Coding Standards

- **JavaScript/JSX:** Follow [Airbnb JavaScript Style Guide](https://airbnb.io/javascript/).
- **React:** Use functional components and hooks.
- **Type safety:** Use PropTypes or TypeScript (if enabled).
- **Formatting:** Use [Prettier](https://prettier.io/) and [ESLint](https://eslint.org/) (run `npm run lint` and `npm run format`).
- **Accessibility:** Ensure UI changes meet accessibility standards.

### Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(scope): short description

[optional body]

[optional footer(s)]
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`

**Examples:**
- `feat(chat): add emoji reactions`
- `fix(editor): resolve code area overflow on mobile`
- `docs(readme): update usage guide`

### Branching Model

- **main:** Production-ready code.
- **chatraj-v2:** Major version development.
- **feature/*:** New features.
- **bugfix/*:** Bug fixes.
- **release/*:** Release preparation.
- **hotfix/*:** Urgent production fixes.

See [`GITWORKFLOW.md`](GITWORKFLOW.md) for details.

### Testing

- **Backend:** Add/modify tests in `Backend/tests/` (Jest or Mocha).
- **Frontend:** Add/modify tests in `frontend/src/__tests__/` (Jest + React Testing Library).
- **Run all tests** before submitting:  
  ```bash
  npm test
  ```

### Documentation

- Update relevant Markdown files for new features or changes.
- Add code comments for complex logic.
- Document public APIs and components.

---

## Security Policy

If you discover a security vulnerability, please report it privately via [abhirajgautam28@gmail.com](mailto:abhirajgautam28@gmail.com) or open a private issue.  
Do **not** disclose security issues publicly until they are resolved.  
See [`SECURITY.md`](SECURITY.md) for details.

---

## Community and Support

- **Discussions:** Use [GitHub Discussions](https://github.com/Abhirajgautam28/Chatraj/discussions) for questions, ideas, and feedback.
- **Issues:** Use [GitHub Issues](https://github.com/Abhirajgautam28/Chatraj/issues) for bugs and feature requests.
- **Contact:** [abhirajgautam28@gmail.com](mailto:abhirajgautam28@gmail.com)

---

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).

---

_Thank you for helping make ChatRaj better!_
