import { Component, inject } from '@angular/core';
import { JsonPipe, NgTemplateOutlet } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { AuthType } from '../../models/common.model';

@Component({
  selector: 'app-login-dialog',
  standalone: true,
  imports: [
    JsonPipe,
    NgTemplateOutlet,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatSelectModule,
    MatMenuModule,
    MatIconModule
  ],
  templateUrl: './login-dialog.component.html',
  styleUrls: ['./login-dialog.component.scss'],
})
export class LoginDialogComponent {
  public readonly dialogRef = inject<
    MatDialogRef<LoginDialogComponent>
  >(MatDialogRef<LoginDialogComponent>);
  public readonly data = inject<any>(MAT_DIALOG_DATA);
  mode: AuthType;
  authType: AuthType = 'api';
  region: 'eu' | 'us' | 'custom' = 'eu';
  authenticated = {
    status: false,
    type: 'api',
    key: '',
    token: '',
    expiry: '',
    name: '',
    email: '',
    region: '',
    baseAppUrl: '',
    baseApiUrl: '',
  };
  authForm: any;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService
  ) {
    this.authForm = this.formBuilder.group({
      baseAppUrl: ['https://app.luzmo.com'],
      baseApiUrl: ['https://api.luzmo.com'],
      email: [''],
      password: [''],
      key: [''],
      token: [''],
      totp: [''],
      busy: [false],
      errorMsg: [''],
    });
    this.authForm.get('baseAppUrl').disable();
    this.authForm.get('baseApiUrl').disable();
  }

  cancel2FA(): void {
    this.mode = 'login';
    this.authForm.get('password').setValue('');
  }

  switchType(type: AuthType): void {
    this.authType = type;
    this.authenticated.type = type;

    if (type === 'api') {
      this.authForm.get('email').setValue('');
      this.authForm.get('password').setValue('');
      this.authForm.get('totp').setValue('');
    } else {
      this.authForm.get('key').setValue('');
      this.authForm.get('token').setValue('');
    }

    if (type === 'login') {
      this.authForm.get('totp').setValue('');
    }
  }

  switchRegion(value: 'eu' | 'us' | 'custom'): void {
    this.region = value;
    this.authenticated.region = value;

    if (['eu', 'us'].includes(value)) {
      this.authForm
        .get('baseAppUrl')
        .setValue(`https://app.${value === 'us' ? 'us.' : ''}luzmo.com`);
      this.authForm
        .get('baseApiUrl')
        .setValue(`https://api.${value === 'us' ? 'us.' : ''}luzmo.com`);
      this.authForm.get('baseAppUrl').disable();
      this.authForm.get('baseApiUrl').disable();
    } else {
      this.authForm.get('baseAppUrl').setValue('');
      this.authForm.get('baseApiUrl').setValue('');
      this.authForm.get('baseAppUrl').enable();
      this.authForm.get('baseApiUrl').enable();
    }
  }

  attemptAuthentication(): void {
    this.authForm.get('busy').setValue(true);
    this.authForm.get('errorMsg').setValue('');

    const email = this.authForm.get('email').value;
    const password = this.authForm.get('password').value;
    const baseAppUrl = this.authForm.get('baseAppUrl').value;
    const baseApiUrl = this.authForm.get('baseApiUrl').value;
    const baseUrl = this.authType === 'api' ? baseApiUrl : baseAppUrl;
    const key = this.authForm.get('key').value;
    const token = this.authForm.get('token').value;
    const totp = this.authForm.get('totp').value;

    this.userService
      .authenticate({
        type: this.authType,
        email,
        password,
        twoFAtoken: totp,
        baseUrl,
        key,
        token,
      })
      .subscribe((data) => {
        this.authForm.get('busy').setValue(false);

        if (data?.response?.user?.twoFactorAuthentication) {
          this.mode = '2FA';
        } else if (data?.rows?.[0]) {
          this.authenticated.status = true;
          this.authenticated.name = data.rows[0].name;
          this.authenticated.email = data.rows[0].name;
          this.dialogRef.close();
        } else {
          this.authenticated.status = false;
          this.authForm.get('errorMsg').setValue('Could not authenticate');

          if (data?.errorMsg) {
            this.authForm
              .get('errorMsg')
              .setValue(`Could not authenticate: ${data.errorMsg}`);
          }
        }
      });
  }

  ok() {
    this.dialogRef.close();
  }

  cancel() {
    this.dialogRef.close();
  }
}
