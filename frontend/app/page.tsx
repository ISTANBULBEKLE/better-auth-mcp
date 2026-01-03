import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

import { SignOutButton } from "@/components/sign-out-button";

import { SongCard } from "@/components/song-card";

export default async function HomePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  // Simple fetch of songs
  const songs = await prisma.song.findMany();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-8">
      <header className="flex justify-between items-center mb-16">
        <div>
          <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Song Library
          </h1>
          <p className="text-gray-500 mt-2 font-medium">Welcome back, <span className="text-gray-900 dark:text-white font-bold">{session.user.name}</span></p>
        </div>
        <SignOutButton />
      </header>

      <main>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {songs.length === 0 ? (
            <div className="col-span-full text-center py-24 bg-white dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
              <p className="text-xl text-gray-400">Your library is empty. Add your favorite tracks!</p>
            </div>
          ) : (
            songs.map((song) => (
              <SongCard key={song.id} song={song} />
            ))
          )}
        </div>
      </main>
    </div>
  );
}
