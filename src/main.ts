import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .then(appRef => {
    setTimeout(() => {
      appRef.tick();
    }, 0);
  })
  .catch((err) => console.error(err));
