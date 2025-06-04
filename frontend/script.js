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
    const res = await fetch("https://moodbeat.onrender.com/api/recommendations", {
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
      <div class="song-card">
        <p class="song-title">${song.title}</p>
        <p class="song-artist">by ${song.artist}</p>
        <a href="${song.link}" target="_blank" class="underline text-cyan-400">🎧 Listen</a>
      </div>
    `
  )
  .join("");


  } catch (err) {
    results.innerHTML = `<p class="text-red-500">Something went wrong.</p>`;
  }
});
