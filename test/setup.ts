import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock environment variables
process.env.NEXT_PUBLIC_CONVEX_URL = "https://test.convex.cloud";
process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_test_mock";
process.env.CLERK_SECRET_KEY = "sk_test_mock";
process.env.NEXT_PUBLIC_TMDB_API_KEY = "mock_tmdb_key";

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Clerk
vi.mock("@clerk/nextjs", () => ({
  useAuth: () => ({
    isSignedIn: true,
    userId: "user_test123",
  }),
  useUser: () => ({
    user: {
      id: "user_test123",
      emailAddresses: [{ emailAddress: "test@example.com" }],
      fullName: "Test User",
    },
  }),
  SignInButton: vi.fn(({ children }) => children),
  SignOutButton: vi.fn(({ children }) => children),
  ClerkProvider: vi.fn(({ children }) => children),
}));

// Mock Convex
vi.mock("convex/react", () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  ConvexReactClient: vi.fn(),
}));

vi.mock("convex/react-clerk", () => ({
  ConvexProviderWithClerk: vi.fn(({ children }) => children),
}));
