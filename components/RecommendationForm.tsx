"use client";

import { useState, FormEvent } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { getAllGenres } from "@/lib/genres";
import { Id } from "../convex/_generated/dataModel";
import { MovieAutocomplete } from "./MovieAutocomplete";

interface RecommendationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  editingRecommendation?: {
    _id: Id<"recommendations">;
    title: string;
    genres: string[];
    link?: string;
    blurb?: string;
    posterUrl?: string;
    tmdbId?: number;
  };
}

export function RecommendationForm({
  onSuccess,
  onCancel,
  editingRecommendation,
}: RecommendationFormProps) {
  const [title, setTitle] = useState(editingRecommendation?.title || "");
  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    editingRecommendation?.genres || []
  );
  const [link, setLink] = useState(editingRecommendation?.link || "");
  const [blurb, setBlurb] = useState(editingRecommendation?.blurb || "");
  const [posterUrl, setPosterUrl] = useState(
    editingRecommendation?.posterUrl || ""
  );
  const [tmdbId, setTmdbId] = useState<number | undefined>(
    editingRecommendation?.tmdbId
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createRecommendation = useMutation(api.recommendations.create);
  const updateRecommendation = useMutation(api.recommendations.update);

  const availableGenres = getAllGenres();
  const isEditing = !!editingRecommendation;

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre)
        ? prev.filter((g) => g !== genre)
        : [...prev, genre]
    );
  };

  const handleMovieSelect = (movie: {
    title: string;
    genres: string[];
    posterUrl: string | null;
    blurb: string;
    link: string | null;
    tmdbId: number;
  }) => {
    setTitle(movie.title);
    setSelectedGenres(movie.genres.length > 0 ? movie.genres : selectedGenres);
    setPosterUrl(movie.posterUrl || "");
    setBlurb(movie.blurb);
    setLink(movie.link || "");
    setTmdbId(movie.tmdbId);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Validation
      if (!title.trim()) {
        throw new Error("Title is required");
      }
      if (title.length > 100) {
        throw new Error("Title must be 100 characters or less");
      }
      if (selectedGenres.length === 0) {
        throw new Error("At least one genre is required");
      }
      if (blurb && blurb.length > 500) {
        throw new Error("Blurb must be 500 characters or less");
      }
      if (link && link.length > 2000) {
        throw new Error("Link must be 2000 characters or less");
      }
      if (link) {
        try {
          new URL(link);
        } catch {
          throw new Error("Link must be a valid URL");
        }
      }

      // Submit
      if (isEditing) {
        await updateRecommendation({
          id: editingRecommendation._id,
          title: title.trim(),
          genres: selectedGenres,
          link: link.trim() || undefined,
          blurb: blurb.trim() || undefined,
          posterUrl: posterUrl.trim() || undefined,
          tmdbId: tmdbId,
        });
      } else {
        await createRecommendation({
          title: title.trim(),
          genres: selectedGenres,
          link: link.trim() || undefined,
          blurb: blurb.trim() || undefined,
          posterUrl: posterUrl.trim() || undefined,
          tmdbId: tmdbId,
        });
      }

      // Reset form on success
      setTitle("");
      setSelectedGenres([]);
      setLink("");
      setBlurb("");
      setPosterUrl("");
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save recommendation");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 border border-red-200">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Title */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-900 mb-1"
        >
          Title <span className="text-red-500">*</span>
        </label>
        <MovieAutocomplete
          value={title}
          onChange={setTitle}
          onMovieSelect={handleMovieSelect}
        />
      </div>

      {/* Genres */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Genres <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {availableGenres.map((genre) => (
            <button
              key={genre}
              type="button"
              onClick={() => toggleGenre(genre)}
              className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                selectedGenres.includes(genre)
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
        <p className="mt-1 text-xs text-gray-500">
          {selectedGenres.length > 0
            ? `Selected: ${selectedGenres.join(", ")}`
            : "Select at least one genre"}
        </p>
      </div>

      {/* Link */}
      <div>
        <label
          htmlFor="link"
          className="block text-sm font-medium text-gray-900"
        >
          Link (optional)
        </label>
        <input
          type="url"
          id="link"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="https://www.imdb.com/title/..."
          maxLength={2000}
        />
      </div>

      {/* Poster URL */}
      <div>
        <label
          htmlFor="posterUrl"
          className="block text-sm font-medium text-gray-900"
        >
          Poster Image URL (optional)
        </label>
        <input
          type="url"
          id="posterUrl"
          value={posterUrl}
          onChange={(e) => setPosterUrl(e.target.value)}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="https://image.tmdb.org/..."
        />
        {posterUrl && (
          <div className="mt-2">
            <img
              src={posterUrl}
              alt="Poster preview"
              className="h-32 w-auto rounded border"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        )}
      </div>

      {/* Blurb */}
      <div>
        <label
          htmlFor="blurb"
          className="block text-sm font-medium text-gray-900"
        >
          Description (optional)
        </label>
        <textarea
          id="blurb"
          value={blurb}
          onChange={(e) => setBlurb(e.target.value)}
          rows={4}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Write a short description..."
          maxLength={500}
        />
        <p className="mt-1 text-xs text-gray-500">{blurb.length}/500 characters</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting
            ? isEditing
              ? "Updating..."
              : "Adding..."
            : isEditing
            ? "Update Recommendation"
            : "Add Recommendation"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
