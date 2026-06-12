package sistema.ejercito.mil.pe;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;

@SpringBootApplication
  public class SistemaBackendApplication extends SpringBootServletInitializer { //--

   private static Class<SistemaBackendApplication> apiApplication = SistemaBackendApplication.class;  //--
    public static void main(String[] args) {SpringApplication.run(SistemaBackendApplication.class, args);}  //ambos
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

  //-
   @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder builder){ return builder.sources(apiApplication); }
}

