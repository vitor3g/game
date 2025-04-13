import { i18n } from "@lingui/core";
import { messages as en } from "../../locales/en/messages";
import { messages as pt_BR } from "../../locales/pt/messages";

export async function dynamicActivate(locale: string) {

  let mod: any;
  switch (locale) {
    case "pt_BR": {
      mod = pt_BR;
      break;
    }
    default: {
      mod = en;
      break;
    }
  }

  i18n.load(locale, mod);

  i18n.activate(locale);
}
