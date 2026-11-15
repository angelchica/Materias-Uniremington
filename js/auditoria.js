/* ===================================================
   INTERACCIONES DEL CONTENIDO DE LAS MATERIAS
   Lo usan Auditoría de Sistemas y Líneas de Énfasis 3.
   1. Aparición al hacer scroll       5. Glosario con filtros
   2. Cifras que cuentan              6. Casos para revelar
   3. Pestañas accesibles             7. Cuestionario de control
   4. Tarjetas que se voltean
=================================================== */
(() => {
    'use strict';

    const raiz = document.documentElement;
    raiz.classList.add('con-js');

    const quietud = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const DURACION_CONTEO = 1400;

    /* ---------- 2. Cifras que cuentan ---------- */
    function contar(elemento) {
        const meta = Number(elemento.dataset.contador) || 0;
        if (quietud) {
            elemento.textContent = String(meta);
            return;
        }
        const inicio = performance.now();
        const paso = (ahora) => {
            const avance = Math.min((ahora - inicio) / DURACION_CONTEO, 1);
            const suave = 1 - Math.pow(1 - avance, 3);
            elemento.textContent = String(Math.round(meta * suave));
            if (avance < 1) requestAnimationFrame(paso);
        };
        elemento.textContent = '0';
        requestAnimationFrame(paso);
    }

    /* ---------- 1. Aparición al hacer scroll ---------- */
    function activarVisibles() {
        const elementos = document.querySelectorAll('.aparecer, [data-contador]');
        const mostrar = (el) => {
            el.classList.add('visible');
            if (el.dataset.contador) contar(el);
        };

        if (!('IntersectionObserver' in window)) {
            elementos.forEach(mostrar);
            return;
        }

        const observador = new IntersectionObserver((entradas) => {
            entradas.forEach((entrada) => {
                if (!entrada.isIntersecting) return;
                mostrar(entrada.target);
                observador.unobserve(entrada.target);
            });
        }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });

        elementos.forEach((el) => observador.observe(el));
    }

    /* ---------- 3. Pestañas accesibles ---------- */
    function activarPestanas(grupo) {
        const pestanas = [...grupo.querySelectorAll('[role="tab"]')];

        const seleccionar = (elegida, enfocar) => {
            pestanas.forEach((pestana) => {
                const activa = pestana === elegida;
                pestana.setAttribute('aria-selected', String(activa));
                pestana.tabIndex = activa ? 0 : -1;
                document.getElementById(pestana.getAttribute('aria-controls')).hidden = !activa;
            });
            if (enfocar) elegida.focus();
        };

        pestanas.forEach((pestana, indice) => {
            pestana.addEventListener('click', () => seleccionar(pestana, false));
            pestana.addEventListener('keydown', (ev) => {
                const mover = { ArrowRight: 1, ArrowLeft: -1 }[ev.key];
                if (ev.key === 'Home' || ev.key === 'End') {
                    ev.preventDefault();
                    seleccionar(ev.key === 'Home' ? pestanas[0] : pestanas[pestanas.length - 1], true);
                    return;
                }
                if (!mover) return;
                ev.preventDefault();
                seleccionar(pestanas[(indice + mover + pestanas.length) % pestanas.length], true);
            });
        });

        seleccionar(pestanas.find((p) => p.getAttribute('aria-selected') === 'true') || pestanas[0], false);
    }

    /* ---------- 4. Tarjetas que se voltean ---------- */
    function activarVolteos() {
        document.querySelectorAll('.volteo').forEach((tarjeta) => {
            tarjeta.addEventListener('click', () => {
                const volteada = tarjeta.getAttribute('aria-pressed') === 'true';
                tarjeta.setAttribute('aria-pressed', String(!volteada));
            });
        });
    }

    /* ---------- 5. Glosario con filtros ---------- */
    function activarGlosario(contenedor) {
        const botones = [...contenedor.querySelectorAll('[data-filtro]')];
        const terminos = [...contenedor.querySelectorAll('[data-categoria]')];
        const conteo = contenedor.querySelector('[data-conteo]');

        const filtrar = (categoria) => {
            let visibles = 0;
            terminos.forEach((termino) => {
                const mostrar = categoria === 'todos' || termino.dataset.categoria === categoria;
                termino.hidden = !mostrar;
                if (mostrar) visibles += 1;
            });
            botones.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filtro === categoria)));
            if (conteo) conteo.textContent = `${visibles} de ${terminos.length} términos`;
        };

        botones.forEach((b) => b.addEventListener('click', () => filtrar(b.dataset.filtro)));
        filtrar('todos');
    }

    /* ---------- 6. Casos para revelar ---------- */
    function activarRevelar() {
        document.querySelectorAll('[data-revelar]').forEach((boton) => {
            const objetivo = document.getElementById(boton.getAttribute('aria-controls'));
            const textoCerrado = boton.textContent;
            boton.addEventListener('click', () => {
                const abrir = objetivo.hidden;
                objetivo.hidden = !abrir;
                boton.setAttribute('aria-expanded', String(abrir));
                boton.textContent = abrir ? 'Ocultar análisis' : textoCerrado;
                boton.closest('.caso')?.classList.toggle('resuelto', abrir);
            });
        });
    }

    /* ---------- 7. Cuestionario de control ---------- */
    /* Veredictos por tipo de cuestionario: data-cuestionario="" (control
       interno, Auditoría) o data-cuestionario="equipo" (Líneas de Énfasis 3) */
    const VEREDICTOS = {
        control: [
            { minimo: 0.8, texto: 'Control sólido', ayuda: 'La mayoría de controles existen. El auditor aún debe pedir evidencia de que funcionan.' },
            { minimo: 0.5, texto: 'Control parcial', ayuda: 'Hay controles, pero con vacíos que deben documentarse como hallazgos.' },
            { minimo: 0, texto: 'Control débil', ayuda: 'Faltan controles clave: es prioritario definir acciones de mejora.' },
        ],
        equipo: [
            { minimo: 0.8, texto: 'Equipo bien protegido', ayuda: 'Cumple casi todo el plan. Revísalo cada mes para que siga así.' },
            { minimo: 0.5, texto: 'Protección parcial', ayuda: 'Hay medidas pendientes. Empieza por las primeras: son las de mayor prioridad.' },
            { minimo: 0, texto: 'Equipo expuesto', ayuda: 'Faltan medidas básicas: actualizar y activar la protección contra malware es lo primero.' },
        ],
    };

    function activarCuestionario(formulario) {
        const niveles = VEREDICTOS[formulario.dataset.cuestionario] || VEREDICTOS.control;
        const total = formulario.querySelectorAll('.pregunta').length;
        const cifra = formulario.querySelector('[data-cifra]');
        const medidor = formulario.querySelector('[data-medidor]');
        const avance = formulario.querySelector('[data-avance]');
        const veredicto = formulario.querySelector('[data-veredicto]');
        const ayuda = formulario.querySelector('[data-ayuda]');
        const textoInicial = { veredicto: veredicto.textContent, ayuda: ayuda.textContent };

        const calcular = () => {
            const respuestas = [...formulario.querySelectorAll('input:checked')].map((i) => i.value);
            const si = respuestas.filter((r) => r === 'si').length;
            const evaluables = respuestas.filter((r) => r !== 'na').length;
            const proporcion = evaluables ? si / evaluables : 0;

            avance.textContent = `${respuestas.length} de ${total} respondidas`;
            medidor.style.setProperty('--valor', String(proporcion));

            if (!respuestas.length) {
                cifra.textContent = '—';
                veredicto.textContent = textoInicial.veredicto;
                ayuda.textContent = textoInicial.ayuda;
                return;
            }
            const nivel = niveles.find((v) => proporcion >= v.minimo);
            cifra.textContent = evaluables ? `${Math.round(proporcion * 100)}%` : '—';
            veredicto.textContent = evaluables ? nivel.texto : 'Sin preguntas aplicables';
            ayuda.textContent = evaluables ? nivel.ayuda : 'Todas las respuestas son N/A.';
        };

        formulario.addEventListener('change', calcular);
        formulario.addEventListener('reset', () => setTimeout(calcular, 0));
        formulario.addEventListener('submit', (ev) => ev.preventDefault());
        calcular();
    }

    /* ---------- Inicio ---------- */
    activarVisibles();
    document.querySelectorAll('[data-pestanas]').forEach(activarPestanas);
    activarVolteos();
    document.querySelectorAll('[data-glosario]').forEach(activarGlosario);
    activarRevelar();
    document.querySelectorAll('[data-cuestionario]').forEach(activarCuestionario);
})();
