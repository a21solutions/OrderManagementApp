import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateLoader } from '@ngx-translate/core';
import { Observable } from 'rxjs';

@Injectable()
export class CustomTranslateLoader implements TranslateLoader {
  constructor(private http: HttpClient) {}

  getTranslation(lang: string): Observable<any> {
    // Use relative path to be resilient to baseHref; assets are served from /assets by angular.json assets config
    return this.http.get(`assets/i18n/${lang}.json`);
  }
}
