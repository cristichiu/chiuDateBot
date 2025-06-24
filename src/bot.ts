import { Telegraf } from "telegraf"
import { MyContext } from "./types/sceneSession.js"

export const bot = new Telegraf<MyContext>(process.env.BOT_TOKEN as string)