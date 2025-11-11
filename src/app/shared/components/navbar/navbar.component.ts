import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../core/services/language.service';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    TranslateModule,
    RouterModule
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  user$: Observable<any | null>;

  constructor(public languageService: LanguageService, private auth: AuthService, private router: Router) {
    this.user$ = this.auth.getCurrentUser();
  }

  toggleLanguage(): void {
    this.languageService.toggleLanguage();
  }

  getCurrentLanguageLabel(): string {
    return this.languageService.getCurrentLanguage() === 'en' ? 'English' : 'मराठी';
  }

  goToLogin(): void {
    const returnUrl = this.router.url;
    this.router.navigate(['/login'], { queryParams: { returnUrl } });
  }
}
