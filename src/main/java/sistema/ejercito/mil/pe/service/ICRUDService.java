package sistema.ejercito.mil.pe.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ICRUDService<T, ID>{

    T save(T t);
    T update(T t);
    List<T> findAll();
    T findById(ID id);
    void delete(ID id);

    public T registrar(T obj);

    public T modificar(T obj);

    public List<T> listar();

    public void eliminar(ID id);

    public Page<T> listarPage(Pageable pageable);

    public T buscarPorID(ID id);

}