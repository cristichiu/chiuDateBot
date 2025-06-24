import { MyWizardSession } from "../types/sceneSession.js";

export function caption(details: any, more?: string) {
  const {
    description = "⚪ Ex: Îmi place să călătoresc",
  } = details as MyWizardSession
  return `
${description}
${more ?? ""}
`.trim();
}

export function inlineKeyboard(details: any, more?: { text: string, callback_data: string }[][]) {
  const {
    name = "⚪ Ex: Ana",
    age = "⚪ Ex: 25",
    sex = "⚪ Ex: Female",
    district = "⚪ Ex: Rîșcani",
    town = "⚪ Ex: Chișinău",
  } = details as MyWizardSession
  return [
    [
      { text: `${name}, ${age} ani, ${sex == "Male" ? "Bărbat" : "Femeie"}`, callback_data: "message" }
    ],
    [
      { text: `${town}, ${district}`, callback_data: "message" }
    ],
    ...(more ?? [])
  ]
} 

export function showToPublicAdditions() {
  return [
    [
      { text: "❌", callback_data: "pass" },
      { text: "❤️", callback_data: "smash" },
    ]
  ]
}

export function giveMeProfileOptions(target: any) {
  return {
    age: target?.details?.age ?? 0,
    country: target?.details?.country == "Moldova" ? "Moldova" : "Moldova",
    description: target?.details?.description ?? "",
    name: target?.name,
    photo: target?.mainFoto,
    district: target?.details?.district ?? "",
    sex: target?.details?.sex == "Male" ? "Male" : "Female",
    town: target?.details?.town ?? "",
    interest: target?.details?.interest == "Male" ? "Male" : "Female",
  }
}