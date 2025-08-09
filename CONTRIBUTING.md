# Contributing to n8n Chat Widget

First off, thank you for considering contributing to n8n Chat Widget! It's people like you that make this tool better for everyone.

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct (see CODE_OF_CONDUCT.md).

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed and what you expected**
- **Include screenshots if relevant**
- **Include your environment details** (browser, OS, n8n version)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a step-by-step description of the suggested enhancement**
- **Provide specific examples to demonstrate the steps**
- **Describe the current behavior and expected behavior**
- **Explain why this enhancement would be useful**

### Pull Requests

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. Ensure the test suite passes (`npm test` if available)
4. Make sure your code follows the existing code style
5. Issue that pull request!

## Development Setup

1. Fork and clone the repository
```bash
git clone https://github.com/YOUR-USERNAME/n8n-chat-widget.git
cd n8n-chat-widget
```

2. Install dependencies
```bash
npm install
```

3. Make your changes in the `src/` directory

4. Build the widget
```bash
npm run build
```

5. Test your changes
- Open `demo.html` in a browser
- Configure it with your n8n webhook for testing

## Code Style

- Use 2 spaces for indentation
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions focused and small
- Follow existing patterns in the codebase

## Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

Examples:
- `Fix streaming response handling for long messages`
- `Add support for custom error messages`
- `Update dependencies to latest versions`

## Project Structure

```
src/
├── chat-widget-config.js    # Configuration and defaults
├── chat-widget-streaming.js # Main widget logic
└── chat-widget.css          # Styles

dist/                        # Built files (generated)
```

## Testing Checklist

Before submitting a PR, please test:

- [ ] Widget loads correctly
- [ ] Streaming responses work
- [ ] Non-streaming responses work
- [ ] Session persistence works
- [ ] Mobile responsive design
- [ ] Cross-browser compatibility
- [ ] Iframe embedding works
- [ ] All configuration options work

## Questions?

Feel free to open an issue with your question or reach out to the maintainers.

Thank you for contributing! 🎉