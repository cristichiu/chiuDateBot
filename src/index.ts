import { Telegraf, Context, Scenes, session } from "telegraf";
import { message } from "telegraf/filters"
import { WizardScene, Stage, WizardContext } from "telegraf/scenes";

import { prisma } from "./prisma";

const registerUser = new WizardScene<any>(
  'register-wizard',
  async (ctx) => {
    await ctx.reply('Care este vârsta ta?')
    return ctx.wizard.next()
  },
  async (ctx) => {
    ctx.wizard.state.age = ctx.message.text
    await ctx.reply('Cum te numești?')
    return ctx.wizard.next()
  },
  async (ctx) => {
    ctx.wizard.state.name = ctx.message.text

    const user = {
      name: ctx.wizard.state.name,
      age: ctx.wizard.state.age,
    }

    // aici poți salva în DB, etc.
    await ctx.reply(`User creat: ${user.name}, ${user.age} ani`)
    return ctx.scene.leave()
  }
)

const bot = new Telegraf<Context>(process.env.BOT_TOKEN as string)

bot.start((ctx) => {

})

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))