import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.LASTFM_API_KEY;

if (!API_KEY) {
  throw new Error("❌ Missing LASTFM_API_KEY in .env");
}

app.use(cors());
app.use(express.json());

app.post("/api/recommendations", async (req, res) => {
  const { moodOrArtist } = req.body;

  if (!moodOrArtist) {
    return res.status(400).json({ error: "Input (mood or artist) is required." });
  }

  try {
    console.log("🎯 Searching for:", moodOrArtist);

    let tracks: any[] = [];

    // 1. Try to get tracks by mood (tag)
    const tagRes = await fetch(
      `http://ws.audioscrobbler.com/2.0/?method=tag.gettoptracks&tag=${encodeURIComponent(
        moodOrArtist.toLowerCase()
      )}&api_key=${API_KEY}&format=json&limit=10`
    );
    const tagData = await tagRes.json();
    tracks = tagData.tracks?.track || [];

    // 2. If no mood results, try artist search
    if (!tracks.length) {
      const response = await fetch(
        `http://ws.audioscrobbler.com/2.0/?method=artist.search&artist=${encodeURIComponent(
          moodOrArtist
        )}&api_key=${API_KEY}&format=json`
      );
      const data = await response.json();
      const artists = data.results?.artistmatches?.artist?.slice(0, 3) || [];

      if (!artists.length) {
        return res.json({ playlist: [] });
      }

      const results = await Promise.all(
        artists.map(async (artist: any) => {
          const topTracksRes = await fetch(
            `http://ws.audioscrobbler.com/2.0/?method=artist.gettoptracks&artist=${encodeURIComponent(
              artist.name
            )}&api_key=${API_KEY}&format=json&limit=3`
          );
          const topTracks = await topTracksRes.json();
          return topTracks.toptracks?.track || [];
        })
      );

      tracks = results.flat();
    }

    // 3. Format the response
    const playlist = tracks.map((track: any) => ({
      title: track.name,
      artist: track.artist.name || track.artist,
      link: track.url,
    }));

    if (!playlist.length) {
      return res.json({ playlist: [] });
    }

    res.json({ moodOrArtist, playlist });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: "Failed to generate playlist." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
