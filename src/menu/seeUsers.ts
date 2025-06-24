import { prisma } from "../prisma.js";
import { caption, giveMeProfileOptions, inlineKeyboard, showToPublicAdditions } from "../utils/profile.js";
import { seeUsers as seeUsersm } from "./index.js";

export const seeUsers = async (ctx: any) => {
  const user = await prisma.user.findUnique({
    where: {
      telegramId: String(ctx.from.id)
    },
    include: {
      details: true,
      likesGiven: true,
      telegram: true
    }
  })
  if(!user) {
    ctx.reply("Nu esti logat. Utilizeaza /start pentru a crea un profil")
    return
  }
  const alreadyLiked = user.likesGiven.map(a => a.toId)
  const users = await prisma.user.findMany({
    where: {
      details: {
        sex: user.details?.interest,
      },
      id: {
        notIn: alreadyLiked
      }
    },
    include: {
      details: true,
      telegram: true
    }
  })
  if(users.length === 0) {
    await ctx.reply("Nu mai sunt utilizatori, incepe de la incaput dand click pe butonul " + seeUsersm)
    return
  }
  ctx.session.users = users
  ctx.session.currentUserIndex = 0
  const target = users[ctx.session.currentUserIndex]
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