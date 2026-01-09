"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser, SignOutButton } from "@clerk/nextjs";
import Link from "next/link";
import { RecommendationForm } from "@/components/RecommendationForm";
import { RecommendationCard } from "@/components/RecommendationCard";
import { GenreFilter } from "@/components/GenreFilter";
import { Id } from "../../convex/_generated/dataModel";

export default function RecommendationsPage() {
  const { user } = useUser();
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [filterMode, setFilterMode] = useState<"AND" | "OR">("OR");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRecommendation, setEditingRecommendation] = useState<{
    _id: Id<"recommendations">;
    title: string;
    genres: string[];
    link?: string;
    blurb?: string;
    posterUrl?: string;
    tmdbId?: number;
  } | null>(null);

  // Get current user data from Convex
  const currentUser = useQuery(api.users.getCurrentUser);

  // Get all recommendations with optional filtering
  const recommendations = useQuery(
    api.recommendations.listAll,
    selectedGenres.length > 0
      ? { genres: selectedGenres, filterMode }
      : {}
  );

  const handleFilterChange = (genres: string[], mode: "AND" | "OR") => {
    setSelectedGenres(genres);
    setFilterMode(mode);
  };

  const handleEditRecommendation = (rec: typeof recommendations extends Array<infer T> ? T : never) => {
    setEditingRecommendation({
      _id: rec._id,
      title: rec.title,
      genres: rec.genres,
      link: rec.link,
      blurb: rec.blurb,
      posterUrl: rec.posterUrl,
      tmdbId: rec.tmdbId,
    });
    setShowAddForm(true);
  };

  const handleFormSuccess = () => {
    setShowAddForm(false);
    setEditingRecommendation(null);
  };

  const handleFormCancel = () => {
    setShowAddForm(false);
    setEditingRecommendation(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/" className="hover:opacity-80 transition-opacity">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                  HypeShelf
                </h1>
              </Link>
              {currentUser && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{user?.fullName || user?.emailAddresses[0]?.emailAddress}</span>
                  {currentUser.role === "admin" && (
                    <span className="ml-2 rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-800">
                      Admin
                    </span>
                  )}
                </div>
              )}
            </div>
            <SignOutButton>
              <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                Sign Out
              </button>
            </SignOutButton>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Add Button */}
              {!showAddForm && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                >
                  + Add Recommendation
                </button>
              )}

              {/* Genre Filter */}
              <GenreFilter onFilterChange={handleFilterChange} />

              {/* Admin Panel Link (if admin) */}
              {currentUser?.role === "admin" && (
                <Link
                  href="/admin"
                  className="block w-full rounded-lg border border-purple-300 bg-purple-50 px-4 py-3 text-center text-sm font-semibold text-purple-700 hover:bg-purple-100 transition-colors"
                >
                  Admin Panel
                </Link>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Add/Edit Form */}
            {showAddForm && (
              <div className="mb-8 rounded-lg border bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-semibold text-gray-900">
                  {editingRecommendation ? "Edit Recommendation" : "Add New Recommendation"}
                </h2>
                <RecommendationForm
                  onSuccess={handleFormSuccess}
                  onCancel={handleFormCancel}
                  editingRecommendation={editingRecommendation || undefined}
                />
              </div>
            )}

            {/* Recommendations Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-900">
                  {selectedGenres.length > 0
                    ? `Filtered Recommendations (${recommendations?.length || 0})`
                    : "All Recommendations"}
                </h2>
              </div>

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
                    <RecommendationCard
                      key={rec._id}
                      recommendation={rec}
                      currentUserId={user?.id || null}
                      currentUserRole={currentUser?.role || null}
                      onEdit={() => handleEditRecommendation(rec)}
                    />
                  ))}
                </div>
              )}

              {/* Empty State */}
              {recommendations && recommendations.length === 0 && (
                <div className="text-center py-12 rounded-lg border bg-white">
                  <div className="text-6xl mb-4">🎬</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {selectedGenres.length > 0
                      ? "No movies match these filters"
                      : "No recommendations found"}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {selectedGenres.length > 0
                      ? "Try different genres or clear your filters"
                      : "Be the first to add a recommendation!"}
                  </p>
                  {!showAddForm && selectedGenres.length === 0 && (
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                    >
                      Add First Recommendation
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
