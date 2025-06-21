import { Scenes, session } from "telegraf";

import { bot } from "./bot";
import { MyContext } from "./types/sceneSession";

import register from "./stages/register";

const stage = new Scenes.Stage<MyContext>([register]);

bot.use(session())
bot.use(stage.middleware())

bot.start((ctx) => {
  ctx.scene.enter("register")
})

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))