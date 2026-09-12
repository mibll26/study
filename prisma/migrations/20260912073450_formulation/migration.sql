-- AlterTable
ALTER TABLE "ContactRequest" ADD COLUMN "formulationSlug" TEXT;

-- AlterTable
ALTER TABLE "Ingredient" ADD COLUMN "intakeBasis" TEXT;
ALTER TABLE "Ingredient" ADD COLUMN "intakeMax" REAL;
ALTER TABLE "Ingredient" ADD COLUMN "intakeMin" REAL;
ALTER TABLE "Ingredient" ADD COLUMN "intakeUnit" TEXT;

-- CreateTable
CREATE TABLE "Formulation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dosageForm" TEXT NOT NULL,
    "targetMarkets" TEXT NOT NULL DEFAULT '[]',
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "FormulationItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "formulationId" INTEGER NOT NULL,
    "ingredientId" INTEGER NOT NULL,
    "amount" REAL NOT NULL,
    "unit" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "FormulationItem_formulationId_fkey" FOREIGN KEY ("formulationId") REFERENCES "Formulation" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FormulationItem_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Formulation_slug_key" ON "Formulation"("slug");
