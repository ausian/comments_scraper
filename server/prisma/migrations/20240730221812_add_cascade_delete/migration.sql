-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

-- Step 1: Create a new table with the new structure
CREATE TABLE "new_Data" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sourceId" INTEGER NOT NULL,
    "webUrlId" INTEGER,
    "author" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "text" TEXT NOT NULL,
    CONSTRAINT "Data_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Data_webUrlId_fkey" FOREIGN KEY ("webUrlId") REFERENCES "WebURL" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Step 2: Copy data from the old table to the new table with a default value for webUrlId
INSERT INTO "new_Data" ("id", "sourceId", "author", "date", "text", "webUrlId")
SELECT "id", "sourceId", "author", "date", "text", 1 -- Здесь можно указать id существующего webUrl
FROM "Data";

-- Step 3: Drop the old table
DROP TABLE "Data";

-- Step 4: Rename the new table to the old table's name
ALTER TABLE "new_Data" RENAME TO "Data";

-- Step 5: Enable foreign keys
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
