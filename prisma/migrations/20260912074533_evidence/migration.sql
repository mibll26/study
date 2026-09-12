-- CreateTable
CREATE TABLE "IngredientEvidence" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ingredientId" INTEGER NOT NULL,
    "goal" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "mechanism" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "refLabel" TEXT,
    "refUrl" TEXT,
    CONSTRAINT "IngredientEvidence_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IngredientInteraction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "aId" INTEGER NOT NULL,
    "bId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "refUrl" TEXT,
    CONSTRAINT "IngredientInteraction_aId_fkey" FOREIGN KEY ("aId") REFERENCES "Ingredient" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "IngredientInteraction_bId_fkey" FOREIGN KEY ("bId") REFERENCES "Ingredient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "IngredientEvidence_goal_idx" ON "IngredientEvidence"("goal");

-- CreateIndex
CREATE UNIQUE INDEX "IngredientEvidence_ingredientId_goal_key" ON "IngredientEvidence"("ingredientId", "goal");

-- CreateIndex
CREATE UNIQUE INDEX "IngredientInteraction_aId_bId_key" ON "IngredientInteraction"("aId", "bId");
