import { Scenes } from "telegraf";
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
    await ctx.reply("Gen (Male / Female)?")
    return ctx.wizard.next()
  },
  async (ctx) => {
    const sex = ctx.message?.['text']
    if(sex !== "Male" || sex !== "Female") {
      await ctx.reply("Genuri disponibile: 'Male'/'Female'")
    }
    ctx.scene.session.sex = sex
    await ctx.reply("Interesat (Male / Female)")
    return ctx.wizard.next()
  },
  async (ctx) => {
    const interest = ctx.message?.['text']
    if(interest !== "Male" || interest !== "Female") {
      await ctx.reply("Genuri disponibile: 'Male'/'Female'")
    }
    ctx.scene.session.interest = interest
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