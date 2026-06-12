package sistema.ejercito.mil.pe.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record MsgResp(@JsonProperty(value = "message") String message){

}
