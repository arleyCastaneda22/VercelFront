
import { ChangeDetectorRef } from '@angular/core';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { Citas } from 'src/app/interfaces/cita.interfaces';
import { CitaService } from 'src/app/services/cita.service';
import { Estilista } from 'src/app/interfaces/estilista.interfaces';
import { EstilistaService } from 'src/app/services/estilista.service';
import { DatePipe } from '@angular/common'; // libreria de fechas
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup } from '@angular/forms';
import { id } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-calendario',
  templateUrl: './calendario.component.html',
  styleUrls: ['./calendario.component.css']
})
export class CalendarioComponent implements OnInit {


  cita: Citas[] = [];
  search: string = '';
  id: string;
  estilistas: Estilista[] = [];
  estilistaSeleccionado: string = '';
  fechaInicial: string;
  fechaFinal: string;


  // Agrega estas líneas para usar el MatTableDataSource, MatPaginator y MatSort
  dataSource = new MatTableDataSource<Citas>();
  displayedColumns: string[] = ['nombre', 'apellido', 'nombre_servicio', 'nombre_estilista', 'fechaCita', 'horaCita', 'estado', 'cambiar', 'acciones'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  subcripcion!: Subscription;

  constructor(private citaService: CitaService,
    private cdr: ChangeDetectorRef,
    private estilistaService: EstilistaService,
    private fb: FormBuilder
  ) { }

  myForm: FormGroup = this.fb.group({
    estado: ['']
  })
  ngOnInit(): void {
    this.cargarEstilistas();
    this.cargarCitas();



    this.citaService.getCita().subscribe(data => {
      this.cita = data
      
      this.dataSource.data = data.filter(cita=>cita.estado!=='finalizada');
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });

    // Método para refrescar
    this.subcripcion = this.citaService.refresh.subscribe(() => {
      this.citaService.getCita().subscribe(data => {
        this.cita = data;
        this.dataSource.data = data.filter(cita => cita.estado !== 'finalizada');;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      });
    });
  };

getEstadoStyle(estado: string): { class: string, label: string } {
  switch (estado) {
    case 'confirmada':
      return { class: 'btn-primary', label: 'Confirmada' };
    case 'finalizada':
      return { class: 'btn-warning', label: 'Finalizada' };
    case 'cancelada':
      return { class: 'btn-danger', label: 'Cancelada' };
    case 'pendiente':
      return { class: 'btn-info', label: 'Pendiente' };
    default:
      return { class: '', label: '' };
  }
}

getEstadoOptions(currentEstado: string): { value: string, label: string, disabled: boolean }[] {
  const allEstados = ['confirmada', 'finalizada', 'cancelada', 'pendiente'];
  const availableEstados = allEstados.filter(estado => estado !== currentEstado);

  return availableEstados.map(estado => {
    return {
      value: estado,
      label: estado.charAt(0).toUpperCase() + estado.slice(1),
      disabled: false
    };
  });
}

  onEstilistaChange(): void {

    // Llama a la función para cargar citas
    this.cargarCitas();
  }

  aplicarFiltroFecha(): void {
    // Asegurarse de que ambas fechas estén presentes antes de aplicar el filtro
    if (this.fechaInicial && this.fechaFinal) {
      const fechaInicial = new Date(this.fechaInicial);
      const fechaFinal = new Date(this.fechaFinal);

      // Filtra las citas basadas en el rango de fechas
      const citasFiltradas = this.cita.filter(cita => {
        const fechaCita = new Date(cita.fechaCita);
        return fechaCita >= fechaInicial && fechaCita <= fechaFinal;
      });

      // Actualiza el origen de datos con las citas filtradas
      this.dataSource.data = citasFiltradas;

      // Si estás utilizando paginación, puedes volver a la primera página
      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }
    } else {
      // Si falta alguna fecha, muestra un mensaje de advertencia o manejo adecuado
     
    }
  }

  cargarCitas(): void {

    if (this.estilistaSeleccionado) {
      // Obtener citas para el estilista seleccionado
      // Puedes ajustar esto según tu API
      this.citaService.getCitaPorEstilista(this.estilistaSeleccionado).subscribe(
        (data) => {
          this.cita = data;
          this.dataSource.data = data.filter(cita => cita.estado !== 'finalizada');
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        
        },
        (error) => {
         
        }
      );
    } else {
      // Obtener todas las citas
      this.citaService.getCita().subscribe(
        (data) => {
          this.cita = data;
          this.dataSource.data = data.filter(cita => cita.estado !== 'finalizada');
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        },
        (error) => {
          
        }
      );
    }
  }

  cargarEstilistas(): void {
    this.estilistaService.getEstilistas().subscribe(
      (res) => {
        this.estilistas = res.filter(estilista => estilista.estado == true);
      },
      (error) => {
       
      }
    );
  }

  // Método para cambiar el estilista seleccionado
  cambiarEstilistaSeleccionado(estilista: Estilista): void {
    this.citaService.getCitaPorEstilista(this.estilistaSeleccionado).subscribe((res) => {
      this.cita = res
    })
    this.cargarCitas();
  }



  actualizarEstado(id: string) {
    const nuevoEstado = this.myForm.get('estado')?.value;

    this.citaService.actualizarEstado(id, nuevoEstado).subscribe({
      next: (res) => {
        this.myForm.get('estado')?.setValue('');
        this.myForm.markAsPristine();

        if (nuevoEstado === 'finalizada') {
          Swal.fire({
            icon: 'success',
            iconColor: '#4caf50',
            title: '¡Información!',
            text: 'La cita pasó a un estado de venta. Por favor, revisar la tabla de venta.',
          });
        }

        // Actualiza la lista de citas después de cambiar el estado
        this.cargarCitas();
      }
    });
  }

  aplicarFiltro(valor: string): void {
    this.search = valor.trim().toLowerCase();
    this.dataSource.filter = this.search;
  }

  // Método para eliminar
  eliminarCita(id: string) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¡No podrás revertir esto!',
      icon: 'warning',
      iconColor: '#745af2',
      showCancelButton: true,
      confirmButtonColor: '#745af2',
      cancelButtonColor: '#745af2',
      confirmButtonText: 'Sí, eliminarlo'
    }).then(result => {
      if (result.isConfirmed) {
        this.citaService.EliminarCita(id).subscribe(res => {
      
        });
      }
    });
  }


}
