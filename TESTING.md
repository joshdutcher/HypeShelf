# Testing Guide

This document explains the testing strategy and how to run tests for HypeShelf.

## Test Stack

- **Unit/Integration Tests**: Vitest + React Testing Library
- **E2E Tests**: Playwright
- **Coverage Target**: 80%+

---

## Running Tests

### Unit & Integration Tests

```bash
# Run all tests
npm run test

# Watch mode (re-run on file changes)
npm run test:watch

# Generate coverage report
npm run test:coverage

# Open interactive UI
npm run test:ui
```

### E2E Tests

```bash
# Run E2E tests
npm run test:e2e

# Run with UI mode (interactive)
npm run test:e2e:ui

# Run specific test file
npx playwright test e2e/homepage.spec.ts
```

### Run All Tests

```bash
npm run test:all
```

### Type Checking

```bash
npm run type-check
```

---

## Test Structure

```
hypeshelf/
├── lib/
│   ├── genres.test.ts          # Genre utilities tests
│   ├── tmdb.test.ts            # TMDb API tests
│   └── validation.test.ts      # Validation logic tests
├── components/
│   └── GenreFilter.test.tsx    # Genre filter component tests
├── e2e/
│   ├── homepage.spec.ts        # Public homepage E2E tests
│   └── recommendations.spec.ts # Authenticated flows (skipped - requires auth setup)
└── test/
    └── setup.ts                # Test configuration & mocks
```

---

## Test Coverage

### What's Tested

**✅ Unit Tests**
- Genre utilities (`lib/genres.test.ts`)
- TMDb API integration (`lib/tmdb.test.ts`)
- Validation rules (`lib/validation.test.ts`)

**✅ Component Tests**
- GenreFilter component (`components/GenreFilter.test.tsx`)
  - Genre selection/deselection
  - Multiple selection
  - Clear functionality
  - Basic → Advanced mode switching
  - AND/OR logic
  - CSS class application

**✅ E2E Tests (Public)**
- Homepage rendering (`e2e/homepage.spec.ts`)
  - Branding display
  - Recommendation cards
  - Staff Pick badges
  - Empty states
  - Responsive layout
  - Navigation

**⏸️ E2E Tests (Authenticated) - Skipped**
- Tests in `e2e/recommendations.spec.ts` are skipped because they require Clerk authentication setup
- See "Setting Up Authenticated E2E Tests" below for instructions

### Coverage Report

After running `npm run test:coverage`, open `coverage/index.html` in your browser to see detailed coverage metrics.

---

## Writing New Tests

### Unit Test Example

```typescript
// lib/utils.test.ts
import { describe, it, expect } from "vitest";
import { myFunction } from "./utils";

describe("myFunction", () => {
  it("should do something", () => {
    expect(myFunction("input")).toBe("output");
  });
});
```

### Component Test Example

```typescript
// components/MyComponent.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MyComponent } from "./MyComponent";

describe("MyComponent", () => {
  it("should render", () => {
    render(<MyComponent />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("should handle click", () => {
    render(<MyComponent />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("Clicked")).toBeInTheDocument();
  });
});
```

### E2E Test Example

```typescript
// e2e/myflow.spec.ts
import { test, expect } from "@playwright/test";

test("should do something", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading")).toBeVisible();
});
```

---

## Setting Up Authenticated E2E Tests

The tests in `e2e/recommendations.spec.ts` are currently skipped because they require authentication. To enable them:

### Option 1: Use Clerk Test Mode

1. Set up a test Clerk application
2. Create test users (admin@example.com, user@example.com)
3. Add credentials to `.env.test`:

```bash
TEST_USER_EMAIL=user@example.com
TEST_USER_PASSWORD=test_password_123
TEST_ADMIN_EMAIL=admin@example.com
TEST_ADMIN_PASSWORD=admin_password_123
```

4. Create an auth helper in `e2e/auth.setup.ts`:

```typescript
import { test as setup } from "@playwright/test";

setup("authenticate", async ({ page }) => {
  await page.goto("/sign-in");
  await page.fill('input[name="identifier"]', process.env.TEST_USER_EMAIL!);
  await page.fill('input[name="password"]', process.env.TEST_USER_PASSWORD!);
  await page.click('button[type="submit"]');
  await page.waitForURL("/recommendations");

  // Save authentication state
  await page.context().storageState({ path: "e2e/.auth/user.json" });
});
```

5. Update `playwright.config.ts` to use the auth state
6. Remove `.skip` from tests in `e2e/recommendations.spec.ts`

### Option 2: Mock Authentication

For faster tests without real Clerk integration, mock the authentication:

1. Use Playwright's route mocking
2. Intercept Clerk API calls
3. Return mock user data

---

## Continuous Integration

Tests run automatically on every push via GitHub Actions (see `.github/workflows/test.yml`).

**CI Pipeline:**
1. Install dependencies
2. Run linting (`npm run lint`)
3. Run type checking (`npm run type-check`)
4. Run unit tests (`npm run test`)
5. Run E2E tests (`npm run test:e2e`)
6. Generate coverage report
7. Upload artifacts

---

## Debugging Tests

### Vitest

```bash
# Run a specific test file
npm run test lib/genres.test.ts

# Run tests matching a pattern
npm run test --grep "should validate"

# Debug with UI
npm run test:ui
```

### Playwright

```bash
# Run in headed mode (see browser)
npx playwright test --headed

# Run in debug mode
npx playwright test --debug

# View test report
npx playwright show-report
```

---

## Test Maintenance

### When to Update Tests

- **Adding new features**: Write tests first (TDD) or immediately after
- **Bug fixes**: Add regression test to prevent recurrence
- **Refactoring**: Ensure tests still pass and update if needed

### Test Naming Convention

- Use descriptive names: `should do X when Y`
- Group related tests with `describe` blocks
- One assertion per test when possible

### Mocking Guidelines

- Mock external dependencies (APIs, databases)
- Don't mock the code you're testing
- Use `vi.fn()` for function mocks
- Use `vi.mock()` for module mocks

---

## Common Issues

### Tests fail with "Cannot find module"
- Run `npm install`
- Check import paths are correct
- Verify `tsconfig.json` path aliases match `vitest.config.ts`

### E2E tests timeout
- Increase timeout in `playwright.config.ts`
- Check if Next.js dev server is running
- Verify port 3000 is not in use

### Coverage not generated
- Install `@vitest/coverage-v8`: `npm i -D @vitest/coverage-v8`
- Run `npm run test:coverage`
- Check `coverage/` directory

---

## Test Philosophy

**Unit Tests**: Test individual functions in isolation
- Fast execution
- Easy to debug
- High coverage

**Component Tests**: Test React components
- Verify rendering
- Test user interactions
- Check conditional logic

**E2E Tests**: Test complete user workflows
- Slower but comprehensive
- Tests real browser behavior
- Catches integration issues

**Aim for the Testing Pyramid:**
- 70% Unit Tests
- 20% Component Tests
- 10% E2E Tests

---

## Resources

- [Vitest Documentation](https://vitest.dev)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
