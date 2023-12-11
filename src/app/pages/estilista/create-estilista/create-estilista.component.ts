import { Estilista } from './../../../interfaces/estilista.interfaces';

import { EstilistaService } from 'src/app/services/estilista.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-create-estilista',
  templateUrl: './create-estilista.component.html',
  styleUrls: ['./create-estilista.component.css']
})
export class CreateEstilistaComponent implements OnInit {

  constructor(
    private servicioEstilista: EstilistaService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router) {

  }
  id!: string;
  sExiste: boolean = false;
  myForm: FormGroup = this.fb.group({

    telefono: ['', [Validators.required,  Validators.pattern(/^\d{7,10}$/)]],
    nombre: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]+$/), Validators.maxLength(20)]],
    apellido: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]+$/)]],
    email: ['', [Validators.required, Validators.email, this.validarExtensionCom]],
    contrasena: ['', Validators.required],

  });

  get correo() {
    return this.myForm.get('nombre');
  }

  validarExtensionCom(control:any) {
    const email = control.value;
    if (email && !email.endsWith('.com') && !email.endsWith('.co')) {
      return { sinExtensionCom: true };
    }
    return null;
  }
  ngOnInit(): void {
    this.id = this.route.snapshot.params['id']
    if (this.id) {
      this.sExiste = true
      this.servicioEstilista.getOneEstilista(this.id).subscribe((res: Estilista) => {
        this.myForm.patchValue({
          nombre: res.nombre,
          apellido: res.apellido,
          email: res.email,
          telefono: res.telefono
        })
      })
    }
  }


  onSave(estilista: Estilista) {
    const contrasena = this.myForm.get('contrasena')?.value;
    if (!this.myForm.valid) {
      Swal.fire('Error', 'Complete el formulario correctamente', 'error');
      return;
    } else if (contrasena.length < 6) {
      Swal.fire('Error', 'La contraseña debe tener al menos 6 caracteres', 'error');
      return;
    }else if (this.sExiste) {
      this.servicioEstilista.actualizarEstilista(this.id, estilista).subscribe((res: Estilista) => {
        Swal.fire({
          icon: 'success',
          iconColor: '#745af2',
          title: '¡Actualizado!',
          text: 'La información se ha actualizado exitosamente.',
        });
        this.router.navigateByUrl("/dashboard/estilista/list")
      })
    }
    if (this.myForm.invalid) {

    }else{
      this.servicioEstilista.createEstilista(estilista).subscribe((res: Estilista) => {
        Swal.fire({
          icon: 'success',
          iconColor: '#745af2',
          title: '¡Guardado!',
          text: 'La información se ha guardado exitosamente.',
        });

        this.router.navigateByUrl("/dashboard/estilista/list")
      },
      )

    }
  }
}
