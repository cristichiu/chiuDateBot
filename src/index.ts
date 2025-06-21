import { Scenes, session } from "telegraf";

import { bot } from "./bot";
import { MyContext } from "./types/sceneSession";

import register from "./stages/register";
import test from "./stages/test";

import { prisma } from "./prisma";

const stage = new Scenes.Stage<MyContext>([register, test]);

bot.use(session())
bot.use(stage.middleware())

bot.use(async (ctx, next) => {
  if (!ctx.from) return next();

  const telegramId = String(ctx.from.id);

  const user = await prisma.user.findUnique({
    where: { telegramId },
  })

  // if (!user) ctx.scene.enter("register")
  ctx.user = user;

  return next();
});

function renderProfilePreview(session: any) {
  const {
    name = "⚪ Ex: Ana",
    age = "⚪ Ex: 25",
    sex = "⚪ Ex: Female",
    description = "⚪ Ex: Îmi place să călătoresc",
    country = "Moldova",
    district = "⚪ Ex: Rîșcani",
    town = "⚪ Ex: Chișinău",
  } = session as any;

  return `
👤 ${name}, ${age} ani, ${sex == "Male" ? "Bărbat" : "Femeie"}

📝 ${description}

🗺️ ${town}, ${district}
`.trim();
}

bot.start(async (ctx) => {
  if(ctx.user) {
    ctx.reply("Ai deja cont")
  }
})

bot.command("test", async (ctx) => {
  ctx.scene.enter("test")
})

bot.command("test2", async (ctx) => {
  const users = await prisma.user.findMany({
    include: {
      details: true,
      telegram: true
    }
  })
  const user = users[1]
  if(!user) return
  await ctx.replyWithPhoto(
    user.mainFoto,
    {
      caption: user.details?.description ?? "",
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            { text: `${user.name}, ${user.details?.age} ani, ${user.details?.sex == "Male" ? "Bărbat" : "Femeie"}`, callback_data: "message" }
          ],
          [
            { text: `${user.details?.town}, ${user.details?.district}`, callback_data: "message" }
          ],
          [
            { text: "❌", callback_data: "pass" },
            { text: "❤️", callback_data: "smash" },
          ]
        ]
      }
    }
  );
})

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))