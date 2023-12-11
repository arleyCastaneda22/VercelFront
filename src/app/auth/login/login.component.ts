import { Component, OnInit} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: [ './login.component.css'
  ]
})
export class LoginComponent implements OnInit {


  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
  ) {}


  myForm: FormGroup = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    contrasena: ['', Validators.required],
  });

  ngOnInit(): void {}

  loading: boolean = false;

  onSave(): void {
    if (!this.myForm.valid) {
      Swal.fire('Error', 'Complete el formulario', 'error');
      return;
    }

    const { email, contrasena } = this.myForm.value;
    this.loading = true;

    this.authService.login(email, contrasena).subscribe(
      (response: any) => {
        // console.log('Usuario logeado:', response);
        const token = response.token;
        localStorage.setItem('token', token);
        console.log('Token JWT:', token); // Agrega este log
        Swal.fire('Éxito', 'Inicio de sesión exitoso', 'success');
        this.router.navigate(['/dashboard']);
      },
      (error) => {
        if (error.status === 403) {
          Swal.fire('Error', 'El usuario no existe', 'error');
        } else if (error.status === 401) {
          Swal.fire('Error', 'Contraseña incorrecta', 'error');
        } else if (error.status === 400) {
          Swal.fire('Error', 'El usuario está inactivo', 'error');
        } else {
          Swal.fire('Error', 'Error en la autenticación', 'error');
        }
      }
    ).add(() => this.loading = false);
  }
}


