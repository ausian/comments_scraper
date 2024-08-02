-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Data" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sourceId" INTEGER NOT NULL,
    "urlId" INTEGER NOT NULL,
    "author" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "text" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "Data_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Data_urlId_fkey" FOREIGN KEY ("urlId") REFERENCES "URL" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Data" ("author", "date", "id", "sourceId", "urlId") SELECT "author", "date", "id", "sourceId", "urlId" FROM "Data";
DROP TABLE "Data";
ALTER TABLE "new_Data" RENAME TO "Data";
CREATE TABLE "new_Source" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "text" TEXT NOT NULL DEFAULT ''
);
INSERT INTO "new_Source" ("id", "name") SELECT "id", "name" FROM "Source";
DROP TABLE "Source";
ALTER TABLE "new_Source" RENAME TO "Source";
CREATE TABLE "new_URL" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sourceId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "text" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "URL_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_URL" ("id", "sourceId", "url") SELECT "id", "sourceId", "url" FROM "URL";
DROP TABLE "URL";
ALTER TABLE "new_URL" RENAME TO "URL";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
