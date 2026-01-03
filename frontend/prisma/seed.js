const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
    const songs = [
        { title: "Bohemian Rhapsody", artist: "Queen", album: "A Night at the Opera", duration: "5:55", genre: "Rock" },
        { title: "Imagine", artist: "John Lennon", album: "Imagine", duration: "3:03", genre: "Soft Rock" },
        { title: "Billie Jean", artist: "Michael Jackson", album: "Thriller", duration: "4:54", genre: "Pop" },
        { title: "Like a Rolling Stone", artist: "Bob Dylan", album: "Highway 61 Revisited", duration: "6:13", genre: "Rock" },
        { title: "Smells Like Teen Spirit", artist: "Nirvana", album: "Nevermind", duration: "5:01", genre: "Grunge" },
    ];

    for (const song of songs) {
        await prisma.song.upsert({
            where: { id: song.title }, // This is a bit hacky but works for seed
            update: {},
            create: {
                ...song,
                id: undefined, // Let cuid generate it
            },
        });
    }

    console.log("Seeded songs successfully");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
