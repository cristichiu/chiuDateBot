-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "telegramId" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TelegramUser" (
    "id" TEXT NOT NULL,
    "username" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "TelegramUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DetailsUser" (
    "description" TEXT,
    "country" TEXT,
    "district" TEXT,
    "town" TEXT,
    "age" INTEGER,
    "sex" TEXT NOT NULL DEFAULT 'None',
    "interest" TEXT NOT NULL DEFAULT 'None',
    "userId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "LiekUser" (
    "fromId" TEXT NOT NULL,
    "toId" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_telegramId_key" ON "User"("telegramId");

-- CreateIndex
CREATE UNIQUE INDEX "TelegramUser_userId_key" ON "TelegramUser"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DetailsUser_userId_key" ON "DetailsUser"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LiekUser_fromId_toId_key" ON "LiekUser"("fromId", "toId");

-- AddForeignKey
ALTER TABLE "TelegramUser" ADD CONSTRAINT "TelegramUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailsUser" ADD CONSTRAINT "DetailsUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiekUser" ADD CONSTRAINT "LiekUser_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiekUser" ADD CONSTRAINT "LiekUser_toId_fkey" FOREIGN KEY ("toId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
