/*
  Warnings:

  - You are about to drop the column `text` on the `URL` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_URL" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sourceId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    CONSTRAINT "URL_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_URL" ("id", "sourceId", "url") SELECT "id", "sourceId", "url" FROM "URL";
DROP TABLE "URL";
ALTER TABLE "new_URL" RENAME TO "URL";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
