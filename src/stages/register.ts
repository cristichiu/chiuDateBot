import { Scenes, Markup } from "telegraf";
import { MyContext } from "../types/sceneSession.js";
import { prisma } from "../prisma.js";
import { Message } from "telegraf/types";
import { caption, inlineKeyboard } from "../utils/profile.js";
import { seeUsers } from "../menu/index.js";

const quetions: string[] = [
  "❓ Care este numele tău?",
  "❓ Care este vârsta ta?",
  "📷 Trimite o poză cu tine",
  "❓ Ce ești (selectează din butoanele de mai sus)?",
  "❓ Ce te interesează să vezi?",
  "📝 Scrie o scurtă descriere despre tine:",
  "🏞️ Care este raionul tău?",
  "🏙️ Care este orașul tău?",
  "✅ Profil creat cu succes"
]
const delimitator: string = "_"

export default new Scenes.WizardScene<MyContext>(
  "register",

  // Nume
  async (ctx) => {
    const sent = await ctx.replyWithPhoto(
      "https://www.w3schools.com/howto/img_avatar.png",
      {
        caption: caption(ctx.scene.session),
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: inlineKeyboard(ctx.scene.session, [[{text: delimitator, callback_data: "message"}], [{text: quetions[0] as string, callback_data: "message"}]]),
        }
      }
    );
    ctx.scene.session.firstMessage = sent.message_id
    return ctx.wizard.next();
  },

  // Vârstă
  async (ctx) => {
    ctx.scene.session.name = (ctx.message as Message.TextMessage).text
    await ctx.deleteMessage()
    await ctx.telegram.editMessageCaption(
      ctx.chat!.id,
      ctx.scene.session.firstMessage,
      undefined,
      caption(ctx.scene.session),
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: inlineKeyboard(ctx.scene.session, [[{text: delimitator, callback_data: "message"}], [{text: quetions[1] as string, callback_data: "message"}]])
        }
      }
    );
    return ctx.wizard.next();
  },

  // Photo
  async (ctx) => {
    const age = parseInt((ctx.message as Message.TextMessage).text);
    await ctx.deleteMessage()
    if (isNaN(age) || age < 0) {
      await ctx.reply("❗ Te rog introdu un număr valid pentru vârstă.");
      return;
    }
    ctx.scene.session.age = age

    await ctx.telegram.editMessageCaption(
      ctx.chat!.id,
      ctx.scene.session.firstMessage,
      undefined,
      caption(ctx.scene.session),
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: inlineKeyboard(ctx.scene.session, [[{text: delimitator, callback_data: "message"}], [{text: quetions[2] as string, callback_data: "message"}]]),
        }
      }
    );
    return ctx.wizard.next()
  },

  // Gen
  async (ctx) => {
    if (!ctx.message || !('photo' in ctx.message)) {
      await ctx.reply("Te rog trimite o fotografie (nu text).");
      return;
    }

    const photoSizes = ctx.message.photo;
    await ctx.deleteMessage()
    const largestPhoto = photoSizes[photoSizes.length - 1];
    if(!largestPhoto) {
      await ctx.reply("Nu este valida fotografia.");
      return
    }
    const fileId = largestPhoto.file_id;

    ctx.scene.session.photo = fileId

    ctx.scene.session.firstMessage ? await ctx.telegram.deleteMessage(ctx.chat!.id, ctx.scene.session.firstMessage) : {}

    const sent = await ctx.replyWithPhoto(
      fileId,
      {
        caption: caption(ctx.scene.session),
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: inlineKeyboard(ctx.scene.session, [[{text: delimitator, callback_data: "message"}], [{text: quetions[3] as string, callback_data: "message"}], [{ text: "Bărbat", callback_data: "Male" }, { text: "Femeie", callback_data: "Female" }, ]])
        }
      }
    );
    ctx.scene.session.firstMessage = sent.message_id

    return ctx.wizard.next();
  },

  // Interes
  async (ctx) => {
    if (!ctx.callbackQuery || !("data" in ctx.callbackQuery)) return;
    ctx.scene.session.sex = ctx.callbackQuery.data === "Male" ? "Male" : "Female";
    await ctx.answerCbQuery();

    await ctx.telegram.editMessageCaption(
      ctx.chat!.id,
      ctx.scene.session.firstMessage,
      undefined,
      caption(ctx.scene.session),
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: inlineKeyboard(ctx.scene.session, [[{text: delimitator, callback_data: "message"}], [{text: quetions[4] as string, callback_data: "message"}], [{ text: "Bărbat", callback_data: "Male" }, { text: "Femeie", callback_data: "Female" }, ] ])
        }
      }
    );
    return ctx.wizard.next();
  },

  // Descriere
  async (ctx) => {
    if (!ctx.callbackQuery || !("data" in ctx.callbackQuery)) return;
    ctx.scene.session.interest = ctx.callbackQuery.data === "Male" ? "Male" : "Female";
    await ctx.answerCbQuery();

    await ctx.telegram.editMessageCaption(
      ctx.chat!.id,
      ctx.scene.session.firstMessage,
      undefined,
      caption(ctx.scene.session),
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: inlineKeyboard(ctx.scene.session, [[{text: delimitator, callback_data: "message"}], [{text: quetions[5] as string, callback_data: "message"}]])
        }
      }
    );
    return ctx.wizard.next();
  },

  // Raion
  async (ctx) => {
    ctx.scene.session.description = (ctx.message as Message.TextMessage).text
    await ctx.deleteMessage()

    await ctx.telegram.editMessageCaption(
      ctx.chat!.id,
      ctx.scene.session.firstMessage,
      undefined,
      caption(ctx.scene.session),
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: inlineKeyboard(ctx.scene.session, [[{text: delimitator, callback_data: "message"}], [{text: quetions[6] as string, callback_data: "message"}]])
        }
      }
    );
    return ctx.wizard.next();
  },

  // Oraș
  async (ctx) => {
    ctx.scene.session.district = (ctx.message as Message.TextMessage).text
    await ctx.deleteMessage()

    await ctx.telegram.editMessageCaption(
      ctx.chat!.id,
      ctx.scene.session.firstMessage,
      undefined,
      caption(ctx.scene.session),
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: inlineKeyboard(ctx.scene.session, [[{text: delimitator, callback_data: "message"}], [{text: quetions[7] as string, callback_data: "message"}]])
        }
      }
    );
    return ctx.wizard.next();
  },

  // Salvare
  async (ctx) => {
    if (!ctx.from) return ctx.scene.leave();

    ctx.scene.session.town = (ctx.message as Message.TextMessage).text
    await ctx.deleteMessage()

    const {
      age,
      country = "Moldova",
      description,
      district,
      interest,
      name,
      sex,
      town,
      photo
    } = ctx.scene.session;

    if (!name) return ctx.scene.leave();

    await prisma.user.create({
      data: {
        name,
        telegramId: String(ctx.from.id),
        mainFoto: photo,
        telegram: {
          create: {
            id: String(ctx.from.id),
            username: ctx.from.username,
          },
        },
        details: {
          create: {
            age,
            country,
            description,
            district,
            interest,
            sex,
            town,
          },
        },
      },
    });

    await ctx.telegram.editMessageCaption(
      ctx.chat!.id,
      ctx.scene.session.firstMessage,
      undefined,
      caption(ctx.scene.session),
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: inlineKeyboard(ctx.scene.session)
        }
      }
    );

    await ctx.reply(quetions[8] as string, {
      reply_markup: {
        keyboard: [
          ["Vezi profilul tau", "Editeaza profilul tau"],
          [seeUsers],
          ["Informatii despre utilizare"],
          ["Cumpara-mi o cafea"]
        ],
        one_time_keyboard: false,
        resize_keyboard: true
      }
    })

    return ctx.scene.leave();
  }
);
