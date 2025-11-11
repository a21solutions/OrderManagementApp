import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LogoutComponent implements OnInit {
  constructor(private auth: AuthService, private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Optionally capture returnUrl to send user back post-login
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';
    this.auth.logout().subscribe({
      next: async () => {
        await this.router.navigate(['/login'], { queryParams: { returnUrl } });
      },
      error: async () => {
        // Even if logout fails, navigate to login to recover
        await this.router.navigate(['/login'], { queryParams: { returnUrl } });
      }
    });
  }
}
