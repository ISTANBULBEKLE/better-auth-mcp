import sqlite3
import os
from mcp.server.fastmcp import FastMCP

# Create an MCP server
mcp = FastMCP("Song Manager")

# Database path relative to the root (shared with frontend)
# mcp_server/server.py -> mcp_server/.. (backend) -> mcp_server/../.. (root)
DB_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "prisma", "dev.db")
DB_PATH = os.path.abspath(DB_PATH)


@mcp.tool()
def list_songs():
    """List all songs in the library."""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT title, artist, album, genre FROM song")
        songs = cursor.fetchall()
        conn.close()
        
        if not songs:
            return "No songs found in the library."
            
        result = "🎵 Current Song Library:\n"
        for song in songs:
            result += f"- {song[0]} by {song[1]} [{song[3]}]\n"
        return result
    except Exception as e:
        return f"Error reading database: {e}"

@mcp.tool()
def add_song(title: str, artist: str, genre: str = "Unknown"):
    """Add a new song to the library.
    
    Args:
        title: Title of the song
        artist: Artist name
        genre: Music genre
    """
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        # Better-Auth/Prisma might use cuid or similar. We'll use a simple id for demo if needed, 
        # but better to check the table schema for id requirement.
        # Song table usually has: id (String), title, artist, album, duration, genre, createdAt, updatedAt
        
        import uuid
        song_id = str(uuid.uuid4())
        
        cursor.execute(
            "INSERT INTO song (id, title, artist, genre, createdAt, updatedAt) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
            (song_id, title, artist, genre)
        )
        conn.commit()
        conn.close()
        return f"Successfully added '{title}' by {artist} to the library!"
    except Exception as e:
        return f"Error writing to database: {e}"

if __name__ == "__main__":
    mcp.run()
