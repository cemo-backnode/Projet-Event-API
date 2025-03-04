-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Event" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titre" TEXT NOT NULL,
    "description" TEXT,
    "date" DATETIME NOT NULL,
    "heureDebut" DATETIME NOT NULL,
    "heureFin" DATETIME NOT NULL,
    "lieu" TEXT NOT NULL,
    "prix" REAL NOT NULL,
    "capaciteMax" INTEGER NOT NULL,
    "payant" BOOLEAN NOT NULL DEFAULT false,
    "organisateurId" INTEGER NOT NULL,
    "typeEvenementId" INTEGER,
    CONSTRAINT "Event_organisateurId_fkey" FOREIGN KEY ("organisateurId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Event_typeEvenementId_fkey" FOREIGN KEY ("typeEvenementId") REFERENCES "EventType" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Event" ("capaciteMax", "date", "description", "heureDebut", "heureFin", "id", "lieu", "organisateurId", "payant", "prix", "titre", "typeEvenementId") SELECT "capaciteMax", "date", "description", "heureDebut", "heureFin", "id", "lieu", "organisateurId", "payant", "prix", "titre", "typeEvenementId" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
