"use client";

import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import Link from "next/link";
import { SignInButton, useAuth } from "@clerk/nextjs";

export default function HomePage() {
  const { isSignedIn } = useAuth();
  const recommendations = useQuery(api.recommendations.listPublic);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                HypeShelf
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Collect and share the stuff you're hyped about.
              </p>
            </div>
            {isSignedIn ? (
              <Link
                href="/recommendations"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                View All Recommendations
              </Link>
            ) : (
              <SignInButton mode="modal">
                <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
                  Sign in to add yours
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-2xl font-semibold text-gray-900">
          Latest Recommendations
        </h2>

        {/* Loading State */}
        {recommendations === undefined && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-lg border bg-white p-6 shadow-sm"
              >
                <div className="mb-4 h-48 bg-gray-200 rounded"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        )}

        {/* Recommendations Grid */}
        {recommendations && recommendations.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((rec) => (
              <div
                key={rec._id}
                className="group relative overflow-hidden rounded-lg border bg-white shadow-sm transition-all hover:shadow-md"
              >
                {/* Staff Pick Badge */}
                {rec.isStaffPick && (
                  <div className="absolute top-2 right-2 z-10">
                    <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800 border border-yellow-200">
                      ⭐ Staff Pick
                    </span>
                  </div>
                )}

                {/* Poster Image */}
                {rec.posterUrl ? (
                  <img
                    src={rec.posterUrl}
                    alt={rec.title}
                    className="h-64 w-full object-cover"
                  />
                ) : (
                  <div className="h-64 w-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <span className="text-4xl">🎬</span>
                  </div>
                )}

                {/* Content */}
                <div className="p-4">
                  <h3 className="mb-2 text-lg font-semibold text-gray-900 line-clamp-2">
                    {rec.title}
                  </h3>

                  {/* Genres */}
                  <div className="mb-3 flex flex-wrap gap-1">
                    {rec.genres.map((genre) => (
                      <span
                        key={genre}
                        className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>

                  {/* Blurb */}
                  {rec.blurb && (
                    <p className="mb-3 text-sm text-gray-600 line-clamp-3">
                      {rec.blurb}
                    </p>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <span className="text-xs text-gray-500">
                      Recommended by {rec.user.name}
                    </span>
                    {rec.link && (
                      <a
                        href={rec.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {recommendations && recommendations.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📽️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No recommendations yet
            </h3>
            <p className="text-gray-600 mb-6">
              Be the first to share your favorite movie!
            </p>
            {!isSignedIn && (
              <SignInButton mode="modal">
                <button className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
                  Sign in to add the first one
                </button>
              </SignInButton>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
