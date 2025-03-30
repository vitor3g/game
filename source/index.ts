import { DriftZone } from "@/client/dz";
import { dynamicActivate } from "@helpers/locale/i18n";

async function bootstrap() {
  // Initialize i18n
  dynamicActivate("en");

  await DriftZone.create();
}

bootstrap();
