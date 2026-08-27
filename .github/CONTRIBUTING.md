# Contributing to PrepArsenal

Thank you for your interest in contributing to **PrepArsenal**! We welcome contributions to improve the exam preparation engine, PYQ parser, UI components, and documentation.

## How to Contribute

1. **Fork & Clone**
   ```bash
   git clone https://github.com/itzzdev09/PrepArsenal.git
   cd PrepArsenal
   ```

2. **Branching Strategy**
   - Create a feature or chore branch from `main`:
     ```bash
     git checkout -b feature/your-feature-name
     ```

3. **Development Guidelines**
   - Run type checks and linter:
     ```bash
     npm run lint
     npx tsc --noEmit
     ```
   - Test PYQ parser scripts locally before modifying schemas:
     ```bash
     python scripts/pyq_parser.py
     ```

4. **Pull Requests**
   - Open a clear PR against `main`.
   - Ensure all CI tests pass.
   - Describe changes and reference any related issues.

## Discussions & Support
Feel free to ask questions or share ideas in [GitHub Discussions](https://github.com/itzzdev09/PrepArsenal/discussions).
