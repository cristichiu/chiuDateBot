import { Scenes, Markup } from "telegraf";
import { MyContext } from "../types/sceneSession";
import { prisma } from "../prisma"

export default new Scenes.WizardScene<MyContext>(
  "register",
  async (ctx) => {
    await ctx.reply("Care este numele tău?");
    return ctx.wizard.next();
  },
  async (ctx) => {
    ctx.scene.session.name = ctx.message?.['text']
    await ctx.reply("Care este vârsta ta?");
    return ctx.wizard.next();
  },
  async (ctx) => {
    const age = parseInt(ctx.message?.['text']);
    if (isNaN(age) || age < 0) {
      await ctx.reply("Te rog introdu un număr valid pentru vârstă.");
      return;
    }
    ctx.scene.session.age = age
    await ctx.reply(
      'Ce ești?',
      Markup.inlineKeyboard([
        Markup.button.callback('Masculin', 'Male'),
        Markup.button.callback('Feminin', 'Female'),
      ])
    )
    return ctx.wizard.next()
  },
  async (ctx) => {
    if(!ctx.callbackQuery) return
    if("data" in ctx.callbackQuery) {
      ctx.scene.session.sex = ctx.callbackQuery.data == "Male" ? "Male" : "Female"
    }
    await ctx.reply(
      'Ce te interesează să vezi?',
      Markup.inlineKeyboard([
        Markup.button.callback('Masculin', 'Male'),
        Markup.button.callback('Feminin', 'Female'),
      ])
    )
    return ctx.wizard.next()
  },
  async (ctx) => {
    if(!ctx.callbackQuery) return
    if("data" in ctx.callbackQuery) {
      ctx.scene.session.interest = ctx.callbackQuery.data == "Male" ? "Male" : "Female"
    }
    await ctx.reply("Descriere")
    return ctx.wizard.next()
  },
  async (ctx) => {
    const description = ctx.message?.['text']
    ctx.scene.session.description = description
    await ctx.reply("Raion")
    return ctx.wizard.next()
  },
  async (ctx) => {
    const district = ctx.message?.['text']
    ctx.scene.session.district = district
    await ctx.reply("Oraș")
    return ctx.wizard.next()
  },
  async (ctx) => {
    if(!ctx.from) return ctx.scene.leave()

    const town = ctx.message?.['text']
    ctx.scene.session.town = town

    const { age, country = "Moldova", description, district, interest, name, sex } = ctx.scene.session;

    if(!name) return ctx.scene.leave()

    await prisma.user.create({
      data: {
        name,
        telegramId: String(ctx.from.id),
        telegram: {
          create: {
            id: String(ctx.from.id),
            username: ctx.from.username
          }
        },
        details: {
          create: {
            age, country, description, district, interest, sex, town
          }
        }
      }
    })

    await ctx.reply("Mulțumesc! Datele au fost salvate.");
    return ctx.scene.leave();
  },
);