import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  isSubmitting = false;
  hidePassword = true;
  errorMessage = '';
  form!: FormGroup;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router, private route: ActivatedRoute) {}

  get f() { return this.form.controls; }

  ngOnInit() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [true]
    });
  }

  async onSubmit() {
    this.errorMessage = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password, rememberMe } = this.form.value as { email: string; password: string; rememberMe: boolean };

    this.isSubmitting = true;
    try {
      const cred = await firstValueFrom(this.auth.login(email, password, rememberMe));
      const user = cred?.user;
      if (user?.uid) {
        const role = await this.auth.getUserRole(user.uid);
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        if (returnUrl) {
          await this.router.navigateByUrl(returnUrl);
          return;
        }
        if (role === 'superadmin') {
          await this.router.navigate(['/admin-dashboard']);
        } else if (role === 'admin') {
          await this.router.navigate(['/orders']);
        } else {
          await this.router.navigate(['/shop']);
        }
      } else {
        this.errorMessage = 'Login failed. Please try again.';
      }
    } catch (err: any) {
      this.errorMessage = err?.message || 'Login failed. Please try again.';
    } finally {
      this.isSubmitting = false;
    }
  }
}
