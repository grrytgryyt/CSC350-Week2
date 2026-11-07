/**
 * Student: Jacob Katzen
 * Assignment: CSC 350 — Week 2 Assignment: JSON and Bootstrap
 * Date: November 7, 2026
 * Purpose: Read the embedded JSON object and display favorite singers in a
 *          Bootstrap table. Provide an optional instant-search feature.
 * Input: Valid JSON in the #singers-json script element; optional search text.
 * Output: One table row per matching singer and updated on-screen counts.
 */

// Encapsulate all functions and variables to avoid polluting the global scope.
(() => {
  "use strict";

  /**
   * Parse and validate the JSON object embedded in index.html.
   * @returns {Array<Object>} Array of singer records.
   * @throws {Error} If the data is missing, invalid, or incorrectly formatted.
   */
  function readSingersFromJSON() {
    const jsonElement = document.getElementById("singers-json");

    if (!jsonElement) {
      throw new Error("The singer JSON element is missing.");
    }

    const parsedData = JSON.parse(jsonElement.textContent);

    if (!parsedData || !Array.isArray(parsedData.singers)) {
      throw new Error("The JSON must contain a singers array.");
    }

    // Accept only complete records so the table never displays undefined.
    const completeSingers = parsedData.singers.filter((singer) =>
      typeof singer.name === "string" &&
      typeof singer.hometown === "string" &&
      typeof singer.genre === "string" &&
      Array.isArray(singer.songs) &&
      singer.songs.every((song) => typeof song === "string")
    );

    return completeSingers;
  }

  /**
   * Create a table cell containing plain text, preventing HTML injection.
   * @param {string} content - Text to display.
   * @param {string} className - Optional CSS class names.
   * @returns {HTMLTableCellElement} Newly created cell.
   */
  function makeTextCell(content, className = "") {
    const cell = document.createElement("td");
    cell.textContent = content;
    cell.className = className;
    return cell;
  }

  /**
   * Make a single singer row with five columns.
   * @param {Object} singer - Validated JSON singer record.
   * @param {number} index - Zero-based position within the displayed results.
   * @returns {HTMLTableRowElement} A complete Bootstrap table row.
   */
  function createSingerRow(singer, index) {
    const row = document.createElement("tr");

    row.appendChild(makeTextCell(String(index + 1).padStart(2, "0"), "row-number"));
    row.appendChild(makeTextCell(singer.name, "artist-name"));
    row.appendChild(makeTextCell(singer.hometown, "hometown-cell"));
    row.appendChild(makeTextCell(singer.genre, "genre-cell"));

    const songsCell = document.createElement("td");
    songsCell.className = "songs-cell";

    // Loop through every song from the JSON object and display it as a tag.
    singer.songs.forEach((song) => {
      const tag = document.createElement("span");
      tag.className = "song-tag badge rounded-pill";
      tag.textContent = song;
      songsCell.appendChild(tag);
    });

    row.appendChild(songsCell);
    return row;
  }

  /**
   * Render only matching singers, plus a helpful message if none match.
   * @param {Array<Object>} singers - All available singers.
   * @param {string} searchText - Current search input, possibly empty.
   * @returns {void} Updates the table and visible counts.
   */
  function renderSingers(singers, searchText) {
    const tbody = document.getElementById("singers-body");
    const countBadge = document.getElementById("artist-count");
    const status = document.getElementById("table-status");

    const query = searchText.trim().toLocaleLowerCase();
    const matchingSingers = singers.filter((singer) => {
      const searchableText = [
        singer.name,
        singer.hometown,
        singer.genre,
        ...singer.songs
      ].join(" ").toLocaleLowerCase();

      return searchableText.includes(query);
    });

    // Replace old rows all at once to keep rendering efficient and readable.
    const fragment = document.createDocumentFragment();

    matchingSingers.forEach((singer, index) => {
      fragment.appendChild(createSingerRow(singer, index));
    });

    if (matchingSingers.length === 0) {
      const row = document.createElement("tr");
      const cell = makeTextCell("No artists found. Try another name or track.", "no-results");
      cell.colSpan = 5;
      row.appendChild(cell);
      fragment.appendChild(row);
    }

    tbody.replaceChildren(fragment);
    countBadge.textContent = `${String(matchingSingers.length).padStart(2, "0")} ARTISTS`;
    status.textContent = query
      ? `Showing ${matchingSingers.length} of ${singers.length} artists`
      : `${singers.length} favorite artists · ${singers.reduce((sum, singer) => sum + singer.songs.length, 0)} standout tracks`;
  }

  /**
   * Set up data and event listeners when the document finishes loading.
   * @returns {void} Populates the table or displays a clear error message.
   */
  function initializePage() {
    const tbody = document.getElementById("singers-body");
    const searchField = document.getElementById("artist-search");
    const resetButton = document.getElementById("reset-search");
    const status = document.getElementById("table-status");

    try {
      const singers = readSingersFromJSON();
      document.getElementById("hero-count").textContent = String(singers.length).padStart(2, "0");
      renderSingers(singers, "");

      // Event listener: filter by artist, genre, hometown, or song as the user types.
      searchField.addEventListener("input", () => renderSingers(singers, searchField.value));

      // Event listener: return to the complete unfiltered JSON collection.
      resetButton.addEventListener("click", () => {
        searchField.value = "";
        renderSingers(singers, "");
        searchField.focus();
      });
    } catch (error) {
      console.error("Unable to display favorite singers:", error);
      const row = document.createElement("tr");
      const cell = makeTextCell("There was a problem reading the singer data.", "no-results");
      cell.colSpan = 5;
      row.appendChild(cell);
      tbody.replaceChildren(row);
      status.textContent = "Check the JSON data in index.html and reload the page.";
    }
  }

  document.addEventListener("DOMContentLoaded", initializePage);
})();
