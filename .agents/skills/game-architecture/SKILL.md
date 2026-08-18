---
name: game-architecture
description: Directives and best practices for modular game architecture, token efficiency, and clean TypeScript/Phaser 3 patterns in Taverna dos Templários.
---

# Game Architecture & Token Efficiency Directives

When working on `taverna-dos-templarios`, follow these strict architecture guidelines to maintain high code quality, extreme precision, and minimal token consumption:

## 1. Modular File Structure
- Keep individual TypeScript files under ~300 lines of code.
- Extract complex UI panels into standalone component classes under `src/ui/modals/` or `src/ui/components/`.
- Decouple business logic into dedicated system singletons in `src/systems/`.

## 2. Token-Efficient Inspection & Editing
- NEVER view full 2000+ line files when modifying a single feature. Use `grep_search` to pinpoint exact method locations and `view_file` with precise `StartLine` and `EndLine` parameters.
- Use `replace_file_content` targeting small, contiguous code blocks.

## 3. Strict UI & Visual Theme Guidelines
- Always consume tokens from `src/config/theme.config.ts` for colors, rarity borders, fonts, and panel dimensions.
- Guarantee that HUD components (Hotbar, Minimap, Currency, Shortcuts) do not overlap regardless of screen scale.

## 4. Verification & Autonomous Deployment
- Always run `node node_modules/vite/bin/vite.js build` to verify clean compilation.
- Commit clean changes to `git` (`origin/master`).
- Automatically deploy to Firebase Hosting (`npx firebase-tools deploy --only hosting:taverna-dos-templarios`).
