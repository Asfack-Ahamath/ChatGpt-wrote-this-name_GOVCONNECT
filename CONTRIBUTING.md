# Contributing to GOVCONNECT

First off, thank you for considering contributing to GOVCONNECT! It's people like you that make GOVCONNECT such a great tool for Sri Lankan citizens.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* **Use a clear and descriptive title**
* **Describe the exact steps to reproduce the problem**
* **Provide specific examples to demonstrate the steps**
* **Describe the behavior you observed after following the steps**
* **Explain which behavior you expected to see instead and why**
* **Include screenshots and animated GIFs if possible**

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* **Use a clear and descriptive title**
* **Provide a step-by-step description of the suggested enhancement**
* **Provide specific examples to demonstrate the steps**
* **Describe the current behavior and explain the behavior you expected to see instead**
* **Explain why this enhancement would be useful**

### Pull Requests

* Fill in the required template
* Do not include issue numbers in the PR title
* Include screenshots and animated GIFs in your pull request whenever possible
* Follow our coding style guidelines
* Include thoughtfully-worded, well-structured tests
* Document new code
* End all files with a newline

## Styleguides

### Git Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line
* Consider starting the commit message with an applicable emoji:
    * 🎨 `:art:` when improving the format/structure of the code
    * 🐎 `:racehorse:` when improving performance
    * 🚱 `:non-potable_water:` when plugging memory leaks
    * 📝 `:memo:` when writing docs
    * 🐛 `:bug:` when fixing a bug
    * 🔥 `:fire:` when removing code or files
    * 💚 `:green_heart:` when fixing the CI build
    * ✅ `:white_check_mark:` when adding tests
    * 🔒 `:lock:` when dealing with security
    * ⬆️ `:arrow_up:` when upgrading dependencies
    * ⬇️ `:arrow_down:` when downgrading dependencies

### JavaScript/TypeScript Styleguide

* Use TypeScript for all new code
* Use const for all declarations where possible
* Use template literals instead of string concatenation
* Use async/await instead of Promise chains
* Use optional chaining and nullish coalescing where appropriate
* Follow the Airbnb JavaScript Style Guide

### React/JSX Styleguide

* Use functional components with hooks
* Use TypeScript for component props
* Use CSS modules or Tailwind CSS for styling
* Follow component naming conventions:
  * Use PascalCase for component names
  * Use camelCase for instance names
* Organize imports in the following order:
  1. React and React-related imports
  2. Third-party libraries
  3. Components
  4. Styles
  5. Types/Interfaces
  6. Utils/Helpers

### CSS/Tailwind Styleguide

* Follow mobile-first approach
* Use Tailwind's utility classes when possible
* Maintain consistent spacing using Tailwind's spacing scale
* Use semantic class names when custom CSS is needed
* Follow BEM naming convention for custom CSS classes

## Project Structure

```
govconnect/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/        # Custom hooks
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   ├── types/        # TypeScript types
│   │   └── utils/        # Utility functions
│   └── public/           # Static files
├── server/                # Backend Node.js application
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Express middleware
│   ├── models/         # Mongoose models
│   ├── routes/         # Express routes
│   ├── services/       # Business logic
│   └── utils/          # Utility functions
└── docs/                 # Documentation
```

## Development Process

1. Fork the repository
2. Create a new branch for your feature/fix
3. Implement your changes
4. Write/update tests
5. Update documentation
6. Submit a pull request

### Branch Naming Convention

* Feature branches: `feature/description`
* Bug fix branches: `fix/description`
* Documentation branches: `docs/description`
* Style branches: `style/description`
* Release branches: `release/version`

### Testing

* Write unit tests for all new code
* Update existing tests when modifying code
* Ensure all tests pass before submitting PR
* Include integration tests where necessary
* Follow test naming convention: `describe('ComponentName', () => { it('should do something', () => {}) })`

### Documentation

* Update README.md if necessary
* Document all new features
* Include JSDoc comments for all functions
* Update API documentation
* Include examples where appropriate

## Getting Help

* Join our Discord server
* Check the documentation
* Ask in GitHub issues
* Email the maintainers

## Recognition

Contributors will be recognized in:
* The project's README
* Our contributors page
* Release notes

Thank you for contributing to GOVCONNECT! 🙏
