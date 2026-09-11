import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

async function prepareApp() {
  if (typeof Worker !== 'undefined') {
    const { worker } = await import('./mocks/browser');
    await worker.start({
      onUnhandledRequest: 'bypass',
      serviceWorker: {
        // Resolve against <base href> so MSW works under /pc-forge/ on GitHub Pages
        url: new URL('mockServiceWorker.js', document.baseURI).toString(),
      },
    });
  }
}

prepareApp()
  .then(() => bootstrapApplication(App, appConfig))
  .catch((err) => console.error(err));
