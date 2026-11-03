import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges
} from '@angular/core';

import {
  Subject,
  firstValueFrom,
  takeUntil
} from 'rxjs';

import Swal from 'sweetalert2';

import {
  IntegridadService
} from '../../../../services/integridad.service';

import {
  ExpedienteService
} from '../../../../services/expediente.service';

import {
  UsersService,
  Nucleo,
  Brigada,
  Unidad
} from '../../../../services/users.service';

@Component({
  selector: 'app-editar-integridad',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editar-integridad.component.html',
  styleUrl: './editar-integridad.component.css'
})
export class EditarIntegridadComponent
  implements OnChanges, OnDestroy {

  @Input() denuncia: any = null;

  @Output() cerrar = new EventEmitter<void>();
  @Output() actualizado = new EventEmitter<any>();

  cargando = false;
  guardando = false;
  confirmando = false;
  error = '';

  mostrarDatosPersona = true;

  idExpediente: number | null = null;
  cinv = '';

  nombres = '';
  apellidos = '';
  ruc = '';
  dni = '';
  telefono = '';
  domicilio = '';
  correo = '';

  nroDocumento = '';
  fechaRegistro = '';
  fechaActoCorrupcion = '';

  tipoDocumento: string | null = null;
  motivoDenuncia: string | null = null;
  medidaProteccion: string | null = null;
  identificacion: string | null = null;
  sexo: string | null = null;

  detalle = '';
  detalleOtros = '';
  observacionActual = '';

  nucleos: Nucleo[] = [];
  brigadas: Brigada[] = [];
  unidades: Unidad[] = [];
  brigadasIg: Brigada[] = [];

  idNucleo: string | null = null;
  idBrigada: string | null = null;
  idUnidad: string | null = null;

  idNucleoIg: number | null = null;
  idIg: string | null = null;
  nivelDestino: number | null = null;

  cargandoUbicacion = false;
  errorUbicacion = '';

  archivosActuales: any[] = [];
  archivosNuevos: File[] = [];

  cargandoArchivos = false;
  errorArchivos = '';
  eliminandoArchivo: number | null = null;

  readonly maxArchivos = 5;
  readonly maxTamanoArchivo = 10 * 1024 * 1024;

  urlsTemporales: string[] = [];

  private versionCaso = 0;
  private versionUbicacion = 0;

  private readonly destroy$ = new Subject<void>();
  private readonly cambioDenuncia$ = new Subject<void>();

  private readonly brigadasNivel4: Record<string, string[]> = {
    '41': [
      '0804', '0990', '0809', '0808',
      '0806', '0810', '0812', '0816'
    ],
    '42': ['0991', '0824', '0828', '0838'],
    '43': [
      '0845', '0846', '0844', '0850',
      '0842', '0848', '0993', '0992', '0878'
    ],
    '44': ['0880', '0882', '1001', '0875'],
    '45': ['0865', '0864'],
    '21': ['0734']
  };

  constructor(
    private integridadService: IntegridadService,
    private expedienteService: ExpedienteService,
    private usersService: UsersService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['denuncia']) {
      this.cambioDenuncia$.next();
      this.limpiarEstado();

      if (this.denuncia?.idExpediente) {
        this.cargarDetalle();
      } else {
        this.error = 'No se pudo identificar la denuncia.';
      }
    }
  }

  ngOnDestroy(): void {
    ++this.versionCaso;
    ++this.versionUbicacion;

    this.destroy$.next();
    this.destroy$.complete();

    this.cambioDenuncia$.next();
    this.cambioDenuncia$.complete();

    this.liberarUrls();
  }

  get esIdentificado(): boolean {
    return this.identificacion === 'DENUNCIANTE';
  }

  get totalArchivos(): number {
    return this.archivosActuales.length +
      this.archivosNuevos.length;
  }

  private limpiarEstado(): void {
    ++this.versionCaso;
    ++this.versionUbicacion;

    this.error = '';
    this.cargando = false;
    this.guardando = false;
    this.confirmando = false;
    this.mostrarDatosPersona = true;

    this.idExpediente = null;
    this.cinv = '';

    this.nombres = '';
    this.apellidos = '';
    this.ruc = '';
    this.dni = '';
    this.telefono = '';
    this.domicilio = '';
    this.correo = '';

    this.nroDocumento = '';
    this.fechaRegistro = '';
    this.fechaActoCorrupcion = '';

    this.tipoDocumento = null;
    this.motivoDenuncia = null;
    this.medidaProteccion = null;
    this.identificacion = null;
    this.sexo = null;

    this.detalle = '';
    this.detalleOtros = '';
    this.observacionActual = '';

    this.nucleos = [];
    this.brigadas = [];
    this.unidades = [];
    this.brigadasIg = [];

    this.idNucleo = null;
    this.idBrigada = null;
    this.idUnidad = null;
    this.idNucleoIg = null;
    this.idIg = null;
    this.nivelDestino = null;

    this.cargandoUbicacion = false;
    this.errorUbicacion = '';

    this.archivosActuales = [];
    this.archivosNuevos = [];
    this.cargandoArchivos = false;
    this.errorArchivos = '';
    this.eliminandoArchivo = null;

    this.liberarUrls();
  }

  cargarDetalle(): void {
    const id = Number(this.denuncia?.idExpediente);

    if (!Number.isInteger(id) || id <= 0) {
      this.error = 'No se pudo identificar la denuncia.';
      return;
    }

    this.cargando = true;
    this.error = '';

    this.integridadService
      .obtenerDetalle(id)
      .pipe(
        takeUntil(this.cambioDenuncia$),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (data: any) => {
          this.cargando = false;

          if (!data) {
            this.error = 'No se recibió la información de la denuncia.';
            return;
          }

          const persona = data.datosPersona || {};

          this.idExpediente = Number(data.idExpediente || id);
          this.cinv = data.cinv || '';

          this.nombres = persona.nombres ?? '';
          this.apellidos = persona.apellidos ?? '';
          this.ruc = persona.ruc ?? '';
          this.domicilio = persona.domicilio ?? '';

          this.dni = persona.dni ?? data.dni ?? '';
          this.correo = persona.correo ?? data.correo ?? '';
          this.telefono = persona.telefono ?? data.telefono ?? '';

          this.nroDocumento = data.nroDocumento ?? '';

          this.fechaRegistro =
            String(data.fechaRegistro ?? '').slice(0, 10);

          this.fechaActoCorrupcion =
            String(data.fechaActoCorrupcion ?? '').slice(0, 10);

          this.tipoDocumento = data.tipoDocumento || null;
          this.motivoDenuncia = data.motivoDenuncia || null;
          this.medidaProteccion = data.medidaProteccion || null;
          this.identificacion = data.identificacion || null;
          this.sexo = data.sexo || null;

          this.detalle = data.detalle || '';
          this.detalleOtros = data.detalleOtros || '';
          this.observacionActual = data.observacionActual || '';

          this.idNucleo = data.idNucleo == null
            ? null : String(data.idNucleo);

          this.idBrigada = data.idBrigada == null
            ? null : String(data.idBrigada);

          this.idUnidad = data.idUnidad == null
            ? null : String(data.idUnidad);

          this.idNucleoIg = data.idNucleoIg == null
            ? null : Number(data.idNucleoIg);

          this.idIg = data.idIg == null
            ? null : String(data.idIg);

          this.nivelDestino =
            [3, 4].includes(Number(data.nivelDestino))
              ? Number(data.nivelDestino)
              : null;

          void this.cargarUbicacion();
          this.cargarArchivos();
        },
        error: (err: any) => {
          this.cargando = false;
          this.error = this.obtenerMensajeError(
            err,
            'No se pudo cargar la denuncia.'
          );
        }
      });
  }

  async cargarUbicacion(): Promise<void> {
    const version = ++this.versionUbicacion;

    const idNucleo = this.idNucleo;
    const idBrigada = this.idBrigada;
    const idNucleoIg = this.idNucleoIg;

    this.cargandoUbicacion = true;
    this.errorUbicacion = '';

    try {
      const [nucleos, brigadas, unidades, brigadasIg] =
        await Promise.all([
          firstValueFrom(this.usersService.getNucleos()),
          idNucleo
            ? firstValueFrom(
                this.usersService.getBrigadas(idNucleo)
              )
            : Promise.resolve([] as Brigada[]),
          idNucleo && idBrigada
            ? firstValueFrom(
                this.usersService.getUnidades(
                  idNucleo,
                  idBrigada
                )
              )
            : Promise.resolve([] as Unidad[]),
          idNucleoIg !== null
            ? firstValueFrom(
                this.usersService.getBrigadas(
                  String(idNucleoIg)
                )
              )
            : Promise.resolve([] as Brigada[])
        ]);

      if (version !== this.versionUbicacion) {
        return;
      }

      this.nucleos = nucleos || [];
      this.brigadas = brigadas || [];
      this.unidades = unidades || [];
      this.brigadasIg = brigadasIg || [];
    } catch {
      if (version === this.versionUbicacion) {
        this.errorUbicacion =
          'No se pudo cargar la ubicación. Vuelva a consultar.';
        this.mostrarAdvertencia(this.errorUbicacion);
      }
    } finally {
      if (version === this.versionUbicacion) {
        this.cargandoUbicacion = false;
      }
    }
  }

  cambiarNucleo(): void {
    this.idBrigada = null;
    this.idUnidad = null;
    this.idNucleoIg = null;
    this.idIg = null;
    this.nivelDestino = null;

    this.brigadas = [];
    this.unidades = [];
    this.brigadasIg = [];

    void this.cargarUbicacion();
  }

  cambiarBrigada(): void {
    this.idUnidad = null;
    this.idNucleoIg = null;
    this.idIg = null;

    this.unidades = [];
    this.brigadasIg = [];

    this.actualizarDestinoAutomatico();

    void this.cargarUbicacion();
  }

  cambiarUnidad(): void {
    const unidad = this.unidades.find(
      item => String(item.idUnidad) === String(this.idUnidad)
    );

    this.idNucleoIg = unidad
      ? Number(unidad.idNucleo)
      : null;

    this.idIg = unidad
      ? String(unidad.idBrigada)
      : null;

    this.brigadasIg = [];

    this.actualizarDestinoAutomatico();

    void this.cargarUbicacion();
  }

  private actualizarDestinoAutomatico(): void {
    const nucleo = String(this.idNucleo ?? '').trim();
    const brigada = String(this.idBrigada ?? '').trim();
    const unidad = String(this.idUnidad ?? '').trim();

    if (!nucleo || !brigada) {
      this.nivelDestino = null;
      return;
    }

    const correspondeNivel4 =
      this.brigadasNivel4[nucleo]?.includes(brigada) ?? false;

    const esHmc =
      nucleo === '32' &&
      brigada === '0798' &&
      ['M10200', 'M10201'].includes(unidad);

    this.nivelDestino = correspondeNivel4 || esHmc ? 4 : 3;
  }

  obtenerNombreNucleoIg(): string {
    const nucleo = this.nucleos.find(
      item => Number(item.idNucleo) === this.idNucleoIg
    );

    const unidad = this.unidades.find(
      item => String(item.idUnidad) === String(this.idUnidad)
    );

    if (!nucleo) {
      return 'Seleccione una unidad primero';
    }

    return unidad?.guarnicion
      ? `${nucleo.nombre} - ${unidad.guarnicion}`
      : nucleo.nombre;
  }

  cargarArchivos(): void {
    if (!this.idExpediente) {
      return;
    }

    this.cargandoArchivos = true;
    this.errorArchivos = '';

    this.expedienteService
      .listarArchivosExpediente(this.idExpediente)
      .pipe(
        takeUntil(this.cambioDenuncia$),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (data: any[]) => {
          this.archivosActuales = Array.isArray(data)
            ? data : [];

          this.cargandoArchivos = false;
        },
        error: (err: any) => {
          this.cargandoArchivos = false;

          this.errorArchivos = this.obtenerMensajeError(
            err,
            'No se pudieron cargar los adjuntos.'
          );

          this.mostrarAdvertencia(this.errorArchivos);
        }
      });
  }

  esZip(archivo: any): boolean {
    return String(
      archivo?.nombreArchivo ||
      archivo?.nombreGuardado ||
      archivo?.name ||
      ''
    ).toLowerCase().endsWith('.zip');
  }

  obtenerTipoArchivo(archivo: any): string {
    return this.esZip(archivo) ? 'ZIP' : 'PDF';
  }

  verPdf(archivo: any): void {
    const idArchivo = Number(archivo?.idArchivo);

    if (!Number.isInteger(idArchivo) || idArchivo <= 0) {
      return;
    }

    this.expedienteService
      .verArchivo(idArchivo)
      .pipe(
        takeUntil(this.cambioDenuncia$),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (blob: Blob) => {
          const url = URL.createObjectURL(blob);
          this.urlsTemporales.push(url);

          if (this.esZip(archivo)) {
            const enlace = document.createElement('a');

            enlace.href = url;
            enlace.download =
              archivo.nombreArchivo || 'adjunto.zip';

            document.body.appendChild(enlace);
            enlace.click();
            enlace.remove();
          } else {
            window.open(url, '_blank', 'noopener');
          }
        },
        error: (err: any) => {
          this.mostrarError(
            this.obtenerMensajeError(
              err,
              'No se pudo abrir o descargar el archivo.'
            )
          );
        }
      });
  }

  async eliminarPdf(archivo: any): Promise<void> {
    if (
      this.guardando ||
      this.confirmando ||
      this.cargandoArchivos ||
      this.eliminandoArchivo !== null
    ) {
      return;
    }

    const idArchivo = Number(archivo?.idArchivo);

    if (!Number.isInteger(idArchivo) || idArchivo <= 0) {
      return;
    }

    const version = this.versionCaso;
    this.confirmando = true;

    const resultado = await Swal.fire({
      icon: 'warning',
      title: '¿Eliminar archivo?',
      text: `Se quitará "${archivo.nombreArchivo || 'el adjunto'}" del expediente.`,
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#b42318'
    });

    if (version !== this.versionCaso) {
      return;
    }

    this.confirmando = false;

    if (!resultado.isConfirmed) {
      return;
    }

    this.eliminandoArchivo = idArchivo;

    this.expedienteService
      .eliminarArchivoExpediente(idArchivo)
      .pipe(
        takeUntil(this.cambioDenuncia$),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => {
          this.eliminandoArchivo = null;

          this.archivosActuales =
            this.archivosActuales.filter(
              item => Number(item.idArchivo) !== idArchivo
            );

          void Swal.fire({
            icon: 'success',
            title: 'Archivo eliminado',
            timer: 1300,
            showConfirmButton: false
          });
        },
        error: (err: any) => {
          this.eliminandoArchivo = null;

          this.mostrarError(
            this.obtenerMensajeError(
              err,
              'No se pudo eliminar el archivo.'
            )
          );
        }
      });
  }

  seleccionarArchivos(event: Event): void {
    const input = event.target as HTMLInputElement;
    const seleccionados = Array.from(input.files || []);

    input.value = '';

    if (
      this.guardando ||
      this.confirmando ||
      this.cargandoArchivos ||
      this.errorArchivos ||
      this.eliminandoArchivo !== null
    ) {
      return;
    }

    const nuevos: File[] = [];

    for (const archivo of seleccionados) {
      const nombre = archivo.name.toLowerCase();

      if (!nombre.endsWith('.pdf') && !nombre.endsWith('.zip')) {
        this.mostrarAdvertencia(
          'Solo se permiten archivos PDF o ZIP.'
        );
        return;
      }

      if (archivo.size === 0 || archivo.size > this.maxTamanoArchivo) {
        this.mostrarAdvertencia(
          `"${archivo.name}" debe tener contenido y no superar los 10 MB.`
        );
        return;
      }

      const repetidoNuevo = [
        ...this.archivosNuevos,
        ...nuevos
      ].some(
        existente =>
          existente.name === archivo.name &&
          existente.size === archivo.size
      );

      const repetidoActual = this.archivosActuales.some(
        existente =>
          String(existente.nombreArchivo || '')
            .toLowerCase() === nombre
      );

      if (!repetidoNuevo && !repetidoActual) {
        nuevos.push(archivo);
      }
    }

    if (this.totalArchivos + nuevos.length > this.maxArchivos) {
      this.mostrarAdvertencia(
        'Solo se permiten 5 archivos en total, entre PDF y ZIP.'
      );
      return;
    }

    this.archivosNuevos = [
      ...this.archivosNuevos,
      ...nuevos
    ];
  }

  quitarArchivoNuevo(index: number): void {
    if (this.guardando || this.confirmando) {
      return;
    }

    this.archivosNuevos = this.archivosNuevos.filter(
      (_, posicion) => posicion !== index
    );
  }

  obtenerTamanoArchivo(bytes: number): string {
    if (!bytes) return '0 KB';
    if (bytes < 1024) return `${bytes} B`;

    return bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  private validarPersona(): string {
    if (
      this.identificacion !== 'DENUNCIANTE' &&
      this.identificacion !== 'ANONIMA'
    ) {
      return 'Seleccione la identificación del denunciante.';
    }

    if (
      this.esIdentificado &&
      (
        !this.nombres.trim() ||
        !this.apellidos.trim() ||
        !this.sexo ||
        !this.dni.trim() ||
        !this.telefono.trim() ||
        !this.domicilio.trim() ||
        !this.correo.trim()
      )
    ) {
      return 'Complete todos los datos personales. El RUC es opcional.';
    }

    if (
      this.sexo &&
      !['MASCULINO', 'FEMENINO', 'NO_DECLARA'].includes(this.sexo)
    ) {
      return 'Seleccione una opción válida de sexo.';
    }

    if (this.dni.trim() && !/^\d{8}$/.test(this.dni.trim())) {
      return 'El DNI debe contener 8 dígitos.';
    }

    if (this.ruc.trim() && !/^\d{11}$/.test(this.ruc.trim())) {
      return 'El RUC debe contener 11 dígitos.';
    }

    if (
      this.correo.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.correo.trim())
    ) {
      return 'Ingrese un correo electrónico válido.';
    }

    if (
      this.nombres.trim().length > 100 ||
      this.apellidos.trim().length > 150 ||
      this.telefono.trim().length > 25 ||
      this.domicilio.trim().length > 250 ||
      this.correo.trim().length > 150
    ) {
      return 'Revise la longitud de los datos personales.';
    }

    return '';
  }

  async guardarCambios(): Promise<void> {
    if (
      !this.idExpediente ||
      this.cargando ||
      this.guardando ||
      this.confirmando ||
      this.cargandoArchivos ||
      this.cargandoUbicacion ||
      this.eliminandoArchivo !== null
    ) {
      return;
    }

    const errorCarga =
      this.error || this.errorUbicacion || this.errorArchivos;

    if (errorCarga) {
      this.mostrarAdvertencia(errorCarga);
      return;
    }

    const errorPersona = this.validarPersona();

    if (errorPersona) {
      this.mostrarDatosPersona = true;
      this.mostrarAdvertencia(errorPersona);
      return;
    }

    if (!this.fechaRegistro || !this.fechaActoCorrupcion) {
      this.mostrarAdvertencia(
        'Seleccione la fecha de registro y la fecha del acto de corrupción.'
      );
      return;
    }

    if (!this.motivoDenuncia) {
      this.mostrarAdvertencia(
        'Seleccione el motivo de la denuncia.'
      );
      return;
    }

    const unidad = this.unidades.find(
      item => String(item.idUnidad) === String(this.idUnidad)
    );

    const igValida = this.brigadasIg.some(
      item => String(item.idBrigada) === String(this.idIg)
    );

    if (
      !this.idNucleo ||
      !this.idBrigada ||
      !unidad ||
      String(unidad.idNucleo) !== String(this.idNucleo) ||
      String(unidad.idBrigada) !== String(this.idBrigada) ||
      this.idNucleoIg === null ||
      !igValida ||
      ![3, 4].includes(Number(this.nivelDestino))
    ) {
      this.mostrarAdvertencia(
        'Complete una ubicación válida, IG y destino.'
      );
      return;
    }

    if (
      this.nroDocumento.trim().length > 100 ||
      this.detalle.trim().length > 3000 ||
      this.detalleOtros.trim().length > 3000 ||
      this.observacionActual.length > 2000
    ) {
      this.mostrarAdvertencia(
        'Revise la longitud del código, los detalles y la observación.'
      );
      return;
    }

    const datos = {
      nroDocumento: this.nroDocumento.trim(),
      fechaRegistro: `${this.fechaRegistro}T00:00:00`,
      tipoDocumento: this.tipoDocumento,

      dni: this.dni.trim() || null,
      correo: this.correo.trim() || null,
      telefono: this.telefono.trim() || null,

      datosPersona: {
        nombres: this.nombres.trim() || null,
        apellidos: this.apellidos.trim() || null,
        ruc: this.ruc.trim() || null,
        dni: this.dni.trim() || null,
        telefono: this.telefono.trim() || null,
        domicilio: this.domicilio.trim() || null,
        correo: this.correo.trim() || null
      },

      fechaActoCorrupcion: this.fechaActoCorrupcion,
      motivoDenuncia: this.motivoDenuncia,
      medidaProteccion: this.medidaProteccion,
      identificacion: this.identificacion,
      sexo: this.sexo || null,
      detalle: this.detalle.trim(),
      detalleOtros: this.detalleOtros.trim(),

      idNucleo: this.idNucleo,
      idBrigada: this.idBrigada,
      idUnidad: this.idUnidad,
      idNucleoIg: this.idNucleoIg,
      idIg: this.idIg,
      nivelDestino: this.nivelDestino,

      observacionActual: this.observacionActual
    };

    const version = this.versionCaso;
    this.confirmando = true;

    const resultado = await Swal.fire({
      icon: 'question',
      title: '¿Guardar cambios?',
      text:
        `Se actualizará la denuncia ${this.cinv}.` +
        (
          this.archivosNuevos.length
            ? ` Se agregarán ${this.archivosNuevos.length} archivo(s).`
            : ''
        ),
      showCancelButton: true,
      confirmButtonText: 'Sí, guardar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#315f27'
    });

    if (version !== this.versionCaso) {
      return;
    }

    this.confirmando = false;

    if (resultado.isConfirmed) {
      this.actualizar(datos);
    }
  }

  private actualizar(datos: any): void {
    if (!this.idExpediente || this.guardando) {
      return;
    }

    this.guardando = true;

    this.integridadService
      .actualizarDenuncia(this.idExpediente, datos)
      .pipe(
        takeUntil(this.cambioDenuncia$),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (respuesta: any) => {
          if (this.archivosNuevos.length) {
            this.guardarArchivosNuevos(respuesta);
          } else {
            this.finalizarActualizacion(respuesta);
          }
        },
        error: (err: any) => {
          this.guardando = false;

          this.mostrarError(
            this.obtenerMensajeError(
              err,
              'No se pudo actualizar la denuncia.'
            )
          );
        }
      });
  }

  private guardarArchivosNuevos(respuesta: any): void {
    if (!this.idExpediente) {
      this.guardando = false;
      return;
    }

    this.expedienteService
      .agregarArchivosExpediente(
        this.idExpediente,
        this.cinv,
        [...this.archivosNuevos]
      )
      .pipe(
        takeUntil(this.cambioDenuncia$),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => {
          this.archivosNuevos = [];
          this.finalizarActualizacion(respuesta);
        },
        error: (err: any) => {
          this.guardando = false;

          void Swal.fire({
            icon: 'warning',
            title: 'Datos actualizados',
            text:
              'Los datos se guardaron, pero falló la carga de adjuntos. ' +
              this.obtenerMensajeError(
                err,
                'Revise los archivos antes de volver a guardar.'
              )
          });

          this.cargarArchivos();
        }
      });
  }

  private finalizarActualizacion(respuesta: any): void {
    this.guardando = false;

    void Swal.fire({
      icon: 'success',
      title: 'Actualizado',
      text: 'La denuncia fue actualizada correctamente.',
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#315f27'
    });

    this.actualizado.emit(respuesta);
  }

  salir(): void {
    if (
      this.guardando ||
      this.confirmando ||
      this.eliminandoArchivo !== null
    ) {
      return;
    }

    ++this.versionCaso;
    ++this.versionUbicacion;

    this.cambioDenuncia$.next();
    this.liberarUrls();
    this.cerrar.emit();
  }

  private liberarUrls(): void {
    for (const url of this.urlsTemporales) {
      URL.revokeObjectURL(url);
    }

    this.urlsTemporales = [];
  }

  private obtenerMensajeError(
    error: any,
    alternativo: string
  ): string {
    const cuerpo = error?.error;

    if (typeof cuerpo?.message === 'string') {
      return cuerpo.message;
    }

    if (typeof cuerpo?.mensaje === 'string') {
      return cuerpo.mensaje;
    }

    if (typeof cuerpo === 'string' && cuerpo.trim()) {
      return cuerpo;
    }

    return alternativo;
  }

  private mostrarAdvertencia(mensaje: string): void {
    void Swal.fire({
      icon: 'warning',
      title: 'Revise los datos',
      text: mensaje,
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#315f27'
    });
  }

  private mostrarError(mensaje: string): void {
    void Swal.fire({
      icon: 'error',
      title: 'Error',
      text: mensaje,
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#315f27'
    });
  }
}