package sistema.ejercito.mil.pe.service.impl;

import sistema.ejercito.mil.pe.repository.IGenericRepo;
import sistema.ejercito.mil.pe.service.ICRUDService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public abstract class ICRUDServiceImpl<T, ID> implements ICRUDService<T, ID> {

    protected abstract IGenericRepo<T, ID> getRepo();

    @Override
    public T save(T t) {
        return getRepo().save(t);
    }

    @Override
    public T update(T t) {
        return getRepo().save(t);
    }

    @Override
    public List<T> findAll() {
        return getRepo().findAll();
    }

    @Override
    public T findById(ID id) {
        return getRepo().findById(id).orElse(null);
    }

    @Override
    public void delete(ID id) {
        getRepo().deleteById(id);
     }


    @Override
    public T registrar(T obj) {
        return getRepo().save(obj);
    }

    @Override
    public T modificar(T obj) {
        return getRepo().save(obj);
    }

    @Override
    public List<T> listar() {
        return getRepo().findAll();
    }

    @Override
    public void eliminar(ID id) {
        getRepo().deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<T> listarPage(Pageable pageable) {
        Page<T> paginas = getRepo().findAll(pageable);
        return paginas;
    }

    @Override
    public T buscarPorID(ID id) {
        return getRepo().findById(id).orElse(null);

    }

}
