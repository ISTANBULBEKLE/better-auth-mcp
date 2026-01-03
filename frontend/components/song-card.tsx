"use client";

export function SongCard({ song }: { song: any }) {
    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <h3 className="text-xl font-bold group-hover:text-indigo-600 transition-colors">{song.title}</h3>
            <p className="text-indigo-600 dark:text-indigo-400 font-medium">{song.artist}</p>
            <div className="mt-4 flex justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>{song.album || "Single"}</span>
                <span>{song.duration}</span>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-700">
                <span className="inline-block px-3 py-1 text-xs font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full">
                    {song.genre || "Unknown"}
                </span>
            </div>
        </div>
    );
}
