import { Scenes } from "telegraf";

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

export type MyContext = Scenes.WizardContext<MyWizardSession> & {
  user?: any
};