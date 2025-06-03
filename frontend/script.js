document.getElementById("submitBtn").addEventListener("click", async () => {
  const input = document.getElementById("moodInput").value.trim();
  const results = document.getElementById("results");
  results.innerHTML = "";

  if (!input) {
    results.innerHTML = `<p class="text-red-400">Please enter a mood or artist name.</p>`;
    return;
  }

  results.innerHTML = `<p>Loading...</p>`;

  try {
    const res = await fetch("http://localhost:3000/api/recommendations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moodOrArtist: input }),
    });

    const data = await res.json();
    if (!data.playlist || data.playlist.length === 0) {
      results.innerHTML = `<p class="text-yellow-400">No songs found.</p>`;
      return;
    }

    results.innerHTML = data.playlist
  .map(
    (song) => `
      <div class="bg-blue-800 p-4 rounded-lg shadow-md hover:bg-blue-700 transition">
        <p class="text-lg font-semibold text-cyan-200">${song.title}</p>
        <p class="text-sm text-gray-300 mb-2">by ${song.artist}</p>
        <a href="${song.link}" target="_blank" class="text-cyan-400 underline hover:text-cyan-300">🎵 Listen on Last.fm</a>
      </div>
    `
  )
  .join("");

  } catch (err) {
    results.innerHTML = `<p class="text-red-500">Something went wrong.</p>`;
  }
});
