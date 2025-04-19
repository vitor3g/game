import { monitor } from '@colyseus/monitor';
import { playground } from '@colyseus/playground';
import config from '@colyseus/tools';

export default config({
  initializeGameServer: () => {},

  initializeExpress: (app) => {
    app.get('/hello_world', (req, res) => {
      res.send("It's time to kick ass and chew bubblegum!");
    });

    if (process.env.NODE_ENV !== 'production') {
      app.use('/', playground());
    }

    app.use('/monitor', monitor());
  },

  beforeListen: () => {},
});
