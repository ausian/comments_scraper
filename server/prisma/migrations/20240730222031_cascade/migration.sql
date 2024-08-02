/*
  Warnings:

  - Made the column `webUrlId` on table `Data` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Data" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sourceId" INTEGER NOT NULL,
    "webUrlId" INTEGER NOT NULL,
    "author" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "text" TEXT NOT NULL,
    CONSTRAINT "Data_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Data_webUrlId_fkey" FOREIGN KEY ("webUrlId") REFERENCES "WebURL" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Data" ("author", "date", "id", "sourceId", "text", "webUrlId") SELECT "author", "date", "id", "sourceId", "text", "webUrlId" FROM "Data";
DROP TABLE "Data";
ALTER TABLE "new_Data" RENAME TO "Data";
CREATE TABLE "new_WebURL" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sourceId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    CONSTRAINT "WebURL_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_WebURL" ("id", "sourceId", "url") SELECT "id", "sourceId", "url" FROM "WebURL";
DROP TABLE "WebURL";
ALTER TABLE "new_WebURL" RENAME TO "WebURL";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
