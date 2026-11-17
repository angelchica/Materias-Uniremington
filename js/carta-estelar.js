
(() => {
    'use strict';

    const quietud = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const crearAnillo = (radio, marcas, largo, opacidad) => {
        let lineas = '';
        for (let i = 0; i < marcas; i++) {
            const angulo = (i / marcas) * Math.PI * 2;
            const l = i % 5 === 0 ? largo * 2 : largo;
            const x1 = 500 + Math.cos(angulo) * radio;
            const y1 = 500 + Math.sin(angulo) * radio;
            const x2 = 500 + Math.cos(angulo) * (radio - l);
            const y2 = 500 + Math.sin(angulo) * (radio - l);
            lineas += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`;
        }
        return `<g stroke="rgba(230,193,122,${opacidad})" fill="none" stroke-width="1"><circle cx="500" cy="500" r="${radio}"/>${lineas}</g>`;
    };

    const astrolabio = document.querySelector('[data-astrolabio]');
    if (astrolabio) {
        astrolabio.innerHTML =
            `<svg viewBox="0 0 1000 1000">${crearAnillo(480, 120, 6, 0.16)}${crearAnillo(380, 72, 5, 0.12)}` +
            '<circle cx="500" cy="500" r="260" stroke="rgba(241,234,217,.07)" fill="none" stroke-dasharray="2 8"/></svg>' +
            `<svg viewBox="0 0 1000 1000" class="contrario">${crearAnillo(430, 36, 10, 0.1)}` +
            '<circle cx="930" cy="500" r="5" fill="rgba(230,193,122,.7)"/></svg>';
    }

    const reloj = document.querySelector('[data-reloj]');
    if (reloj) {
        const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
        const dosDigitos = (n) => String(n).padStart(2, '0');
        const actualizarReloj = () => {
            const ahora = new Date();
            const dia = dosDigitos(ahora.getDate());
            const mes = meses[ahora.getMonth()];
            const anio = ahora.getFullYear();
            const horas24 = ahora.getHours();
            const periodo = horas24 >= 12 ? 'PM' : 'AM';
            const horas12 = dosDigitos(horas24 % 12 || 12);
            const minutos = dosDigitos(ahora.getMinutes());
            const segundos = dosDigitos(ahora.getSeconds());
            reloj.textContent = `${dia} ${mes} ${anio} · ${horas12}:${minutos}:${segundos} ${periodo}`;
        };
        actualizarReloj();
        setInterval(actualizarReloj, 1000);
    }

    const enlaceActual = document.querySelector('.navbar [aria-current="page"]');
    if (enlaceActual) {
        const menu = enlaceActual.parentElement;
        menu.scrollLeft = enlaceActual.offsetLeft - (menu.clientWidth - enlaceActual.offsetWidth) / 2;
    }

    const DURACION_SALIDA = 280;
    const esNavegacionInterna = (ev, enlace) => {
        if (ev.defaultPrevented || ev.button !== 0) return false;
        if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return false;
        if (enlace.target && enlace.target !== '_self') return false;
        if (enlace.hasAttribute('download')) return false;
        const destino = new URL(enlace.href, window.location.href);
        if (destino.origin !== window.location.origin) return false;
        return destino.pathname !== window.location.pathname;
    };

    if (!quietud) {
        document.addEventListener('click', (ev) => {
            const enlace = ev.target.closest('a[href]');
            if (!enlace || !esNavegacionInterna(ev, enlace)) return;
            ev.preventDefault();
            document.body.classList.add('saliendo');
            window.setTimeout(() => { window.location.href = enlace.href; }, DURACION_SALIDA);
        });

        window.addEventListener('pageshow', () => document.body.classList.remove('saliendo'));
    }

    const lienzo = document.getElementById('constelacion');
    const ctx = lienzo && lienzo.getContext ? lienzo.getContext('2d') : null;
    if (!ctx) return;

    const DISTANCIA = 130;
    const DISTANCIA_CURSOR = 190;
    const MAX_PUNTOS = 140;
    const FUERA = { x: -9999, y: -9999 };

    let ancho = 0;
    let alto = 0;
    let puntos = [];
    let polvo = [];
    let cursor = FUERA;

    const preparar = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        ancho = window.innerWidth;
        alto = window.innerHeight;
        lienzo.width = ancho * dpr;
        lienzo.height = alto * dpr;
        lienzo.style.width = `${ancho}px`;
        lienzo.style.height = `${alto}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const cantidad = Math.min(MAX_PUNTOS, Math.round((ancho * alto) / 11000));
        puntos = Array.from({ length: cantidad }, () => ({
            x: Math.random() * ancho,
            y: Math.random() * alto,
            vx: (Math.random() - 0.5) * 0.18,
            vy: (Math.random() - 0.5) * 0.18,
            r: Math.random() * 1.2 + 0.4,
            fase: Math.random() * Math.PI * 2
        }));
        polvo = Array.from({ length: Math.round((ancho * alto) / 3500) }, () => ({
            x: Math.random() * ancho,
            y: Math.random() * alto,
            a: Math.random() * 0.5
        }));
    };

    const moverPuntos = () => {
        for (const p of puntos) {
            p.x += p.vx;
            p.y += p.vy;
            p.fase += 0.02;
            if (p.x < 0 || p.x > ancho) p.vx *= -1;
            if (p.y < 0 || p.y > alto) p.vy *= -1;
        }
    };

    const dibujarLinea = (a, b, color) => {
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
    };

    const dibujar = () => {
        ctx.clearRect(0, 0, ancho, alto);

        for (const s of polvo) {
            ctx.fillStyle = `rgba(241,234,217,${s.a})`;
            ctx.fillRect(s.x, s.y, 1, 1);
        }

        ctx.lineWidth = 0.6;
        for (let i = 0; i < puntos.length; i++) {
            const a = puntos[i];
            for (let j = i + 1; j < puntos.length; j++) {
                const b = puntos[j];
                const d = Math.hypot(a.x - b.x, a.y - b.y);
                if (d < DISTANCIA) dibujarLinea(a, b, `rgba(241,234,217,${(1 - d / DISTANCIA) * 0.14})`);
            }

            const dc = Math.hypot(a.x - cursor.x, a.y - cursor.y);
            const cerca = dc < DISTANCIA_CURSOR;
            if (cerca) dibujarLinea(a, cursor, `rgba(230,193,122,${(1 - dc / DISTANCIA_CURSOR) * 0.55})`);

            const brillo = 0.5 + 0.5 * Math.sin(a.fase);
            ctx.fillStyle = cerca ? '#e6c17a' : `rgba(241,234,217,${0.4 + brillo * 0.5})`;
            ctx.beginPath();
            ctx.arc(a.x, a.y, a.r + (cerca ? 0.8 : 0), 0, Math.PI * 2);
            ctx.fill();
        }
    };

    const animar = () => {
        moverPuntos();
        dibujar();
        window.requestAnimationFrame(animar);
    };

    preparar();
    window.addEventListener('resize', () => {
        preparar();
        if (quietud) dibujar();
    });

    if (quietud) {
        dibujar();
        return;
    }

    window.addEventListener('pointermove', (ev) => {
        cursor = { x: ev.clientX, y: ev.clientY };
    });
    document.addEventListener('pointerleave', () => {
        cursor = FUERA;
    });
    window.requestAnimationFrame(animar);
})();
