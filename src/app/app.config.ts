import { ApplicationConfig } from '@angular/core';
import { HttpClientModule, provideHttpClient, withFetch } from '@angular/common/http';
import { provideClientHydration } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { provideRouter } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(withFetch()),
    importProvidersFrom(HttpClientModule, FormsModule, ReactiveFormsModule),
    provideAnimations()
  ],
};
