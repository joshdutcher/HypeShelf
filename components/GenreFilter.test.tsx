import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { GenreFilter } from "./GenreFilter";

describe("GenreFilter", () => {
  const mockOnFilterChange = vi.fn();

  beforeEach(() => {
    mockOnFilterChange.mockClear();
  });

  it("should render genre filter heading", () => {
    render(<GenreFilter onFilterChange={mockOnFilterChange} />);
    expect(screen.getByText("Filter by Genre")).toBeInTheDocument();
  });

  it("should render all genre buttons", () => {
    render(<GenreFilter onFilterChange={mockOnFilterChange} />);

    // Check for some expected genres
    expect(screen.getByText("Action")).toBeInTheDocument();
    expect(screen.getByText("Comedy")).toBeInTheDocument();
    expect(screen.getByText("Drama")).toBeInTheDocument();
    expect(screen.getByText("Horror")).toBeInTheDocument();
  });

  it("should call onFilterChange when genre is selected", () => {
    render(<GenreFilter onFilterChange={mockOnFilterChange} />);

    const actionButton = screen.getByText("Action");
    fireEvent.click(actionButton);

    expect(mockOnFilterChange).toHaveBeenCalledWith(["Action"], "OR");
  });

  it("should toggle genre selection", () => {
    render(<GenreFilter onFilterChange={mockOnFilterChange} />);

    const actionButton = screen.getByText("Action");

    // Select
    fireEvent.click(actionButton);
    expect(mockOnFilterChange).toHaveBeenCalledWith(["Action"], "OR");

    // Deselect
    fireEvent.click(actionButton);
    expect(mockOnFilterChange).toHaveBeenCalledWith([], "OR");
  });

  it("should allow selecting multiple genres", () => {
    render(<GenreFilter onFilterChange={mockOnFilterChange} />);

    fireEvent.click(screen.getByText("Action"));
    fireEvent.click(screen.getByText("Comedy"));

    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.arrayContaining(["Action", "Comedy"]),
      "OR"
    );
  });

  it("should show 'Clear all' button when genres are selected", () => {
    render(<GenreFilter onFilterChange={mockOnFilterChange} />);

    // Initially no clear button
    expect(screen.queryByText("Clear all")).not.toBeInTheDocument();

    // Select a genre
    fireEvent.click(screen.getByText("Action"));

    // Clear button should appear
    expect(screen.getByText("Clear all")).toBeInTheDocument();
  });

  it("should clear all selections when 'Clear all' is clicked", () => {
    render(<GenreFilter onFilterChange={mockOnFilterChange} />);

    // Select genres
    fireEvent.click(screen.getByText("Action"));
    fireEvent.click(screen.getByText("Comedy"));

    // Click clear
    fireEvent.click(screen.getByText("Clear all"));

    expect(mockOnFilterChange).toHaveBeenCalledWith([], "OR");
  });

  it("should show advanced filter button when genres are selected", () => {
    render(<GenreFilter onFilterChange={mockOnFilterChange} />);

    fireEvent.click(screen.getByText("Action"));

    expect(screen.getByText("Advanced →")).toBeInTheDocument();
  });

  it("should switch to advanced mode when clicking Advanced button", () => {
    render(<GenreFilter onFilterChange={mockOnFilterChange} />);

    fireEvent.click(screen.getByText("Action"));
    fireEvent.click(screen.getByText("Advanced →"));

    // Should show filter mode options
    expect(screen.getByText("ANY (OR)")).toBeInTheDocument();
    expect(screen.getByText("ALL (AND)")).toBeInTheDocument();
  });

  it("should change filter mode in advanced view", () => {
    render(<GenreFilter onFilterChange={mockOnFilterChange} />);

    // Select a genre
    fireEvent.click(screen.getByText("Action"));

    // Go to advanced
    fireEvent.click(screen.getByText("Advanced →"));

    // Change to AND mode
    fireEvent.click(screen.getByText("ALL (AND)"));

    expect(mockOnFilterChange).toHaveBeenCalledWith(["Action"], "AND");
  });

  it("should show selected count", () => {
    render(<GenreFilter onFilterChange={mockOnFilterChange} />);

    fireEvent.click(screen.getByText("Action"));
    fireEvent.click(screen.getByText("Comedy"));

    expect(screen.getByText(/2 genres selected/)).toBeInTheDocument();
  });

  it("should return to basic filter from advanced", () => {
    render(<GenreFilter onFilterChange={mockOnFilterChange} />);

    fireEvent.click(screen.getByText("Action"));
    fireEvent.click(screen.getByText("Advanced →"));

    // Should see back button
    const backButton = screen.getByText("← Back to basic filter");
    fireEvent.click(backButton);

    // Should be back to basic mode
    expect(screen.queryByText("Filter Mode:")).not.toBeInTheDocument();
  });

  it("should apply correct CSS classes to selected genres", () => {
    render(<GenreFilter onFilterChange={mockOnFilterChange} />);

    const actionButton = screen.getByText("Action");

    // Before selection
    expect(actionButton).toHaveClass("bg-gray-100");

    // After selection
    fireEvent.click(actionButton);
    expect(actionButton).toHaveClass("bg-blue-600");
  });
});
