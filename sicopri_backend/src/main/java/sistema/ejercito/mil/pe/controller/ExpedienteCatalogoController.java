package sistema.ejercito.mil.pe.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import sistema.ejercito.mil.pe.repository.ITipoExpedienteRepo;
import sistema.ejercito.mil.pe.repository.ITipoDocumentoRepo;
import sistema.ejercito.mil.pe.repository.ITipificacionRepo;
import sistema.ejercito.mil.pe.repository.IEstadoExpedienteRepo;
import sistema.ejercito.mil.pe.repository.ISituacionRepo;

@RestController
@RequiredArgsConstructor
@RequestMapping("/expediente/catalogos")
public class ExpedienteCatalogoController {

    private final ITipoExpedienteRepo tipoExpedienteRepo;
    private final ITipoDocumentoRepo tipoDocumentoRepo;
    private final ITipificacionRepo tipificacionRepo;
    private final IEstadoExpedienteRepo estadoExpedienteRepo;
    private final ISituacionRepo situacionRepo;


    // ============================
    // SECCIÓN
    // ============================

    @GetMapping("/tipos-expediente")
    public ResponseEntity<?> listarTiposExpediente() {

        return ResponseEntity.ok(
                tipoExpedienteRepo.listarActivos()
        );
    }


    // ============================
    // TIPO DE DOCUMENTO
    // ============================

    @GetMapping("/tipos-documento")
    public ResponseEntity<?> listarTiposDocumento() {

        return ResponseEntity.ok(
                tipoDocumentoRepo.listarActivos()
        );
    }


    // ============================
    // TIPIFICACIÓN
    // ============================

    @GetMapping("/tipificaciones/{idTipoExpediente}")
    public ResponseEntity<?> listarTipificaciones(
            @PathVariable Long idTipoExpediente
    ) {

        System.out.println(
                "======================================="
        );

        System.out.println(
                "ID TIPO EXPEDIENTE RECIBIDO: "
                        + idTipoExpediente
        );

        var tipificaciones =
                tipificacionRepo.listarPorTipoExpediente(
                        idTipoExpediente
                );

        System.out.println(
                "TIPIFICACIONES ENCONTRADAS: "
                        + tipificaciones.size()
        );

        System.out.println(
                "======================================="
        );

        return ResponseEntity.ok(
                tipificaciones
        );
    }


    // ============================
    // ESTADOS INTERNOS
    // ============================

    @GetMapping("/estados")
    public ResponseEntity<?> listarEstados() {

        return ResponseEntity.ok(
                estadoExpedienteRepo.listarActivos()
        );
    }


    // ============================
    // SITUACIONES GENERALES
    // EN PROCESO / VENCIDO / CONCLUIDO
    // ============================

    @GetMapping("/situaciones")
    public ResponseEntity<?> listarSituaciones() {

        return ResponseEntity.ok(
                situacionRepo.listarActivos()
        );
    }

}