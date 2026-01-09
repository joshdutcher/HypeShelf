"use client";

import { useState } from "react";
import { getAllGenres } from "@/lib/genres";

interface GenreFilterProps {
  onFilterChange: (genres: string[], mode: "AND" | "OR") => void;
}

export function GenreFilter({ onFilterChange }: GenreFilterProps) {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [filterMode, setFilterMode] = useState<"AND" | "OR">("OR");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const availableGenres = getAllGenres();

  const toggleGenre = (genre: string) => {
    const newGenres = selectedGenres.includes(genre)
      ? selectedGenres.filter((g) => g !== genre)
      : [...selectedGenres, genre];

    setSelectedGenres(newGenres);
    onFilterChange(newGenres, filterMode);
  };

  const clearFilters = () => {
    setSelectedGenres([]);
    onFilterChange([], filterMode);
  };

  const handleModeChange = (mode: "AND" | "OR") => {
    setFilterMode(mode);
    onFilterChange(selectedGenres, mode);
  };

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Filter by Genre</h3>
        <div className="flex items-center gap-2">
          {selectedGenres.length > 0 && (
            <button
              onClick={clearFilters}
              className="text-xs text-gray-600 hover:text-gray-900 font-medium"
            >
              Clear all
            </button>
          )}
          {!showAdvanced && selectedGenres.length > 0 && (
            <button
              onClick={() => setShowAdvanced(true)}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Advanced →
            </button>
          )}
        </div>
      </div>

      {/* Basic Filter */}
      {!showAdvanced && (
        <div className="flex flex-wrap gap-2">
          {availableGenres.map((genre) => (
            <button
              key={genre}
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
      )}

      {/* Advanced Filter */}
      {showAdvanced && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Filter Mode:</span>
            <div className="flex gap-2">
              <button
                onClick={() => handleModeChange("OR")}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                  filterMode === "OR"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                ANY (OR)
              </button>
              <button
                onClick={() => handleModeChange("AND")}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                  filterMode === "AND"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                ALL (AND)
              </button>
            </div>
          </div>

          <div className="text-xs text-gray-600 bg-gray-50 rounded p-2">
            {filterMode === "OR"
              ? "Shows movies with ANY of the selected genres"
              : "Shows movies with ALL of the selected genres"}
          </div>

          <div className="flex flex-wrap gap-2">
            {availableGenres.map((genre) => (
              <button
                key={genre}
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

          <button
            onClick={() => setShowAdvanced(false)}
            className="text-xs text-gray-600 hover:text-gray-900 font-medium"
          >
            ← Back to basic filter
          </button>
        </div>
      )}

      {/* Selected Count */}
      {selectedGenres.length > 0 && (
        <div className="mt-3 pt-3 border-t">
          <p className="text-xs text-gray-600">
            {selectedGenres.length} genre{selectedGenres.length !== 1 ? "s" : ""}{" "}
            selected: {selectedGenres.join(", ")}
          </p>
        </div>
      )}
    </div>
  );
}
