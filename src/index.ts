import 'dotenv/config';

import { Scenes, session } from "telegraf";

import { bot } from "./bot.js";
import { MyContext } from "./types/sceneSession.js";

import register from "./stages/register.js";
import { seeUsers } from "./menu/index.js";
import { seeUsers as seeusersF } from "./menu/seeUsers.js";
import { prisma } from "./prisma.js";
import { caption, giveMeProfileOptions, inlineKeyboard, showToPublicAdditions } from "./utils/profile.js";

const stage = new Scenes.Stage<MyContext>([register]);

bot.use(session())
bot.use(stage.middleware())

bot.start(async (ctx) => {
  const user = await prisma.user.findUnique({
    where: {
      telegramId: String(ctx.from.id)
    }
  })
  if(!user) {
    ctx.scene.enter("register")
  } else {
    ctx.reply("Ai deja cont, /delete pentru a sterge")
  }
})

async function skip(ctx: any) {
  ctx.session.originalMessageId ? ctx.telegram.deleteMessage(ctx.chat!.id, ctx.session.originalMessageId) : {}
  const target = ctx.session.users[++ctx.session.currentUserIndex]
  if(!target) {
    ctx.reply("Nu mai sunt utilizatori, incepe de la incaput dand click pe butonul " + seeUsers)
    return
  }
  const options = giveMeProfileOptions(target)
  const sent = await ctx.replyWithPhoto(
    "https://www.w3schools.com/howto/img_avatar.png",
    {
      caption: caption(options),
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: inlineKeyboard(options, showToPublicAdditions()),
      }
    }
  );
  ctx.session.originalMessageId = sent.message_id
}

bot.hears(seeUsers, seeusersF)

bot.action("smash", async (ctx) => {
  const user = await prisma.user.findUnique({
    where: {
      telegramId: String(ctx.from.id)
    },
    include: {
      telegram: true
    }
  })
  ctx.session.currentUserIndex = ctx.session.currentUserIndex ?? 0
  if(!ctx.session.users || !ctx.session.users[ctx.session.currentUserIndex]) {
    await ctx.reply("Ceva nu a mers cum trebuie. Incepe de la inceput dand click pe butonul " + seeUsers)
    return
  }
  const target = ctx.session.users[ctx.session.currentUserIndex]
  if(!target || !user) {
    await ctx.reply("Ceva nu a mers cum trebuie. Incepe de la inceput dand click pe butonul " + seeUsers)
    return
  }
  await prisma.liekUser.create({
    data: {
      fromId: user.id,
      toId: target.id
    }
  })
  const otherOneLiked = await prisma.liekUser.findUnique({
    where: {
      fromId_toId: {
        fromId: target.id,
        toId: user.id
      }
    },
    include: {
      to: {
        include: {
          telegram: true
        }
      }
    }
  })
  if(otherOneLiked) {
    await ctx.reply(`Am gasit un match, scrie un salut aici @${otherOneLiked.to.telegram?.username}`)
    ctx.telegram.sendMessage(target.telegramId, `Cineva te-a apreciat, scrie un salut aici @${user.telegram?.username}`)
  } else {
    await skip(ctx)
  }
})

bot.command("delete", async (ctx) => {
  await prisma.user.delete({
    where: {
      telegramId: String(ctx.from.id)
    }
  })
  await ctx.reply("Am sters contul tau cu succes. Pentru a face altu /test")
})

bot.action("pass", (ctx) => skip(ctx))

console.log("Bot online.")
await bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))