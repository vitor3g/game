import { Core } from "./core/Core";

async function bootstrap() {
  const app = new Core();
  await app.initialize()
}

bootstrap();