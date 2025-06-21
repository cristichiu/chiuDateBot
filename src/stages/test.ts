import { Scenes, Markup } from "telegraf";
import { MyContext } from "../types/sceneSession";
import { prisma } from "../prisma";

// Tip funcțional pentru profil
function renderProfilePreview(session: Scenes.WizardSessionData) {
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

export default new Scenes.WizardScene<MyContext>(
  "test",

  // Nume
  async (ctx) => {
    const sent = await ctx.replyWithPhoto(
      "https://www.w3schools.com/howto/img_avatar.png",
      {
        caption: `${renderProfilePreview(ctx.scene.session)}\n\n\n\n❓ *Care este numele tău?*`,
        parse_mode: "Markdown",
      }
    );
    ctx.scene.session.firstMessage = sent.message_id
    return ctx.wizard.next();
  },

  // Vârstă
  async (ctx) => {
    ctx.scene.session.name = ctx.message?.["text"];
    await ctx.deleteMessage()
    await ctx.telegram.editMessageCaption(
      ctx.chat!.id,
      ctx.scene.session.firstMessage,
      undefined,
      `${renderProfilePreview(ctx.scene.session)}\n\n\n\n❓ *Care este vârsta ta?*`,
      {
        parse_mode: "Markdown"
      }
    );
    return ctx.wizard.next();
  },

  // Photo
  async (ctx) => {
    const age = parseInt(ctx.message?.["text"]);
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
      `${renderProfilePreview(ctx.scene.session)}\n\n\n\n📷 *Trimite o poză cu tine*`,
      {
        parse_mode: "Markdown",
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
    const fileId = largestPhoto.file_id;

    ctx.scene.session.photo = fileId

    ctx.scene.session.firstMessage ? await ctx.telegram.deleteMessage(ctx.chat!.id, ctx.scene.session.firstMessage) : {}

    const sent = await ctx.replyWithPhoto(
      fileId,
      {
        caption: `${renderProfilePreview(ctx.scene.session)}\n\n\n❓ *Ce ești?*`,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              { text: "Bărbat", callback_data: "Male" },
              { text: "Femeie", callback_data: "Female" },
              { text: "Cartof", callback_data: "Potato" }
            ]
          ]
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
      `${renderProfilePreview(ctx.scene.session)}\n\n\n\n❓ *Ce te interesează să vezi?*`,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              { text: "Bărbat", callback_data: "Male" },
              { text: "Femeie", callback_data: "Female" },
              { text: "Cartof", callback_data: "Potato" }
            ]
          ]
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
      `${renderProfilePreview(ctx.scene.session)}\n\n\n\n📝 *Scrie o scurtă descriere despre tine:*`,
      {
        parse_mode: "Markdown",
      }
    );
    return ctx.wizard.next();
  },

  // Raion
  async (ctx) => {
    ctx.scene.session.description = ctx.message?.["text"];
    await ctx.deleteMessage()

    await ctx.telegram.editMessageCaption(
      ctx.chat!.id,
      ctx.scene.session.firstMessage,
      undefined,
      `${renderProfilePreview(ctx.scene.session)}\n\n\n\n🏞️ *Care este raionul tău?*`,
      {
        parse_mode: "Markdown",
      }
    );
    return ctx.wizard.next();
  },

  // Oraș
  async (ctx) => {
    ctx.scene.session.district = ctx.message?.["text"];
    await ctx.deleteMessage()

    await ctx.telegram.editMessageCaption(
      ctx.chat!.id,
      ctx.scene.session.firstMessage,
      undefined,
      `${renderProfilePreview(ctx.scene.session)}\n\n\n\n🏙️ *Care este orașul tău?*`,
      {
        parse_mode: "Markdown",
      }
    );
    return ctx.wizard.next();
  },

  // Salvare
  async (ctx) => {
    if (!ctx.from) return ctx.scene.leave();

    ctx.scene.session.town = ctx.message?.["text"];
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
      `${renderProfilePreview(ctx.scene.session)}`,
      {
        parse_mode: "Markdown",
      }
    );

    return ctx.scene.leave();
  }
);
