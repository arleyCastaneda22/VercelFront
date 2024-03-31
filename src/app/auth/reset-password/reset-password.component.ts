import { AuthService } from 'src/app/services/auth.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  id: string;
  token: string;
  constructor(private route: ActivatedRoute, 
    private auth: AuthService, 
    private fb: FormBuilder, 
    private router:Router) {


  }
  ngOnInit(): void {
    //Para obtener parametros de ruta
    this.route.params.subscribe(valor => {
      this.id = valor['id'];
      this.token = valor['token']
    })
  }


  myForm: FormGroup = this.fb.group({
    nueva: ['', [Validators.required, this.atLeastOneUppercase]],
    contrasena: ['', [Validators.required,this.atLeastOneUppercase]],
  }, { validators: this.validarContraseñas.bind(this), });

  // ... (resto del código)

  validarContraseñas(control: AbstractControl): ValidationErrors | null {
    const password1 = control.get('nueva')?.value;
    const password2 = control.get('contrasena')?.value;

    return password1 !== password2 ? { contrasenasNoCoinciden: true } : null;
  }

  atLeastOneUppercase(control: AbstractControl): { [key: string]: boolean } | null {
    const value: string = control.value || '';

    // Verificar si la cadena tiene al menos un carácter y si contiene al menos una letra mayúscula
    if (!/[A-Z]/.test(value) || !/[a-z]/.test(value) ) {
      return { noUppercase: true };
    }

      // Verificar la longitud de la contraseña
    if (value.length < 8 || value.length > 15) {
    return { invalidLength: true };
    }


    return null;
  }

  onSave(body: any) {
    this.auth.enviarNuevaContrasena(this.id, this.token, body).subscribe({
      next: (res) => {
        console.log(res);
        Swal.fire({
          icon: 'success',
          iconColor: '#4caf50',
          title: 'Contraseña actualizada',
          text: 'Tu contraseña se ha actualizado con éxito. Ahora puedes iniciar sesión con tu nueva contraseña.',
        });
        this.router.navigateByUrl('/login');
      },
    })
  }
}



