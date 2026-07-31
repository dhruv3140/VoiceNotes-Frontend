import React from "react";
function SearchBar({
  searchQuery,
  setSearchQuery,
  handleSearch,
  clearSearch,
  fetchNotes,
  loading,
}) {
  return (
    <div className="card">
      <h2>Search Notes</h2>

      <textarea
        rows="3"
        placeholder="Search by meaning or use #tag"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <div className="button-row">
        <button onClick={() => handleSearch(searchQuery)} disabled={loading}>
          Search
        </button>

        <button onClick={clearSearch} disabled={loading}>
          Clear
        </button>

        <button onClick={fetchNotes} disabled={loading}>
          Refresh
        </button>
      </div>
    </div>
  );
}

export default SearchBar;