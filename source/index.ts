import { DriftParadise } from "@/client/dp";
import { dynamicActivate } from "@helpers/locale/i18n";

async function bootstrap() {
  // Initialize i18n
  dynamicActivate("en");

  await DriftParadise.create();
}

bootstrap();
