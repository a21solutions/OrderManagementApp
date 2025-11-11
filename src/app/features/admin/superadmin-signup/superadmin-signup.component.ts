import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService, UserRole } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-superadmin-signup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './superadmin-signup.component.html',
  styleUrls: ['./superadmin-signup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SuperadminSignupComponent {
  isSubmitting = false;
  errorMessage = '';
  form!: FormGroup;

  constructor(private fb: FormBuilder, private auth: AuthService, private notify: NotificationService) {
    this.buildForm();
  }

  get f() { return this.form.controls; }

  private passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
    const p = group.get('password')?.value;
    const c = group.get('confirmPassword')?.value;
    return p && c && p !== c ? { passwordsMismatch: true } : null;
  }

  private buildForm() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      role: ['admin', [Validators.required]]
    }, { validators: this.passwordsMatchValidator });
  }

  async onSubmit() {
    this.errorMessage = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
  const { email, password, role } = this.form.value as { email: string; password: string; role: 'admin'|'user' };
    this.isSubmitting = true;
    try {
  await this.auth.signup(email, password, role).toPromise();
      this.notify.showSuccess('User created successfully');
      this.form.reset({ role: 'admin' });
    } catch (err: any) {
      this.errorMessage = err?.message || 'Failed to create user';
      this.notify.showError(this.errorMessage);
    } finally {
      this.isSubmitting = false;
    }
  }
}
