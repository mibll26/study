-- CreateTable
CREATE TABLE "Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "keyword" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT,
    "maker" TEXT,
    "category" TEXT,
    "ingredient" TEXT,
    "functionality" TEXT,
    "mfdsReportNo" TEXT,
    "mfdsCompany" TEXT,
    "mfdsReportDate" TEXT,
    "intakeMethod" TEXT,
    "naverProductId" TEXT,
    "lowestPrice" INTEGER,
    "highestPrice" INTEGER,
    "mallName" TEXT,
    "mallCount" INTEGER,
    "searchTotal" INTEGER,
    "productUrl" TEXT,
    "imageUrl" TEXT,
    "reviewCount" INTEGER,
    "rating" REAL,
    "score" REAL,
    "scoreDetail" TEXT,
    "isCandidate" BOOLEAN NOT NULL DEFAULT false,
    "memo" TEXT,
    "source" TEXT NOT NULL,
    "collectedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ScoreWeight" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "weight" INTEGER NOT NULL DEFAULT 10,
    "direction" TEXT NOT NULL DEFAULT 'asc',
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "IngredientTrend" (
    "ingredient" TEXT NOT NULL PRIMARY KEY,
    "level" INTEGER NOT NULL DEFAULT 3,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Setting" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "CollectJob" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "keyword" TEXT NOT NULL,
    "sources" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "mfdsCount" INTEGER NOT NULL DEFAULT 0,
    "naverCount" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" DATETIME
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_mfdsReportNo_key" ON "Product"("mfdsReportNo");

-- CreateIndex
CREATE UNIQUE INDEX "Product_naverProductId_key" ON "Product"("naverProductId");

-- CreateIndex
CREATE INDEX "Product_keyword_idx" ON "Product"("keyword");

-- CreateIndex
CREATE INDEX "Product_score_idx" ON "Product"("score");

-- CreateIndex
CREATE INDEX "Product_isCandidate_idx" ON "Product"("isCandidate");
