import { Scenes } from "telegraf";
import { User } from "../generated/prisma/client.js";

type ISex = "None" | "Male" | "Female"
type ICountry = "Moldova"

export interface MyWizardSession extends Scenes.WizardSessionData {
  // available in scene context under ctx.scene.session.*
  name?: string
  age?: number
  sex?: ISex
  interest?: ISex
  description?: string
  country?: ICountry
  district?: string
  town?: string
  firstMessage?: number
  photo?: string
}
interface MySession extends Scenes.WizardSession {
  // will be available globally under `ctx.session.*
  users?: User[];
  currentUserIndex?: number
  originalMessageId?: number
}

export type MyContext = Scenes.WizardContext<MyWizardSession> & {
  user?: any
  session: MySession
};