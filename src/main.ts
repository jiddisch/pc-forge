import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { environment } from './environments/environment';

async function prepareApp() {
  if (environment.useMsw && typeof Worker !== 'undefined') {
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
