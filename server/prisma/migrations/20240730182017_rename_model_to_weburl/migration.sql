/*
  Warnings:

  - You are about to drop the `URL` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "URL";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "WebURL" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sourceId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    CONSTRAINT "WebURL_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Data" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sourceId" INTEGER NOT NULL,
    "urlId" INTEGER NOT NULL,
    "author" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "text" TEXT NOT NULL,
    CONSTRAINT "Data_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Data_urlId_fkey" FOREIGN KEY ("urlId") REFERENCES "WebURL" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Data" ("author", "date", "id", "sourceId", "text", "urlId") SELECT "author", "date", "id", "sourceId", "text", "urlId" FROM "Data";
DROP TABLE "Data";
ALTER TABLE "new_Data" RENAME TO "Data";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
