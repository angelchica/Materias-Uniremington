# Materias vistas con Mahecha — Portal Académico

Sitio web académico estático desarrollado en **HTML5** y **CSS3** para organizar y presentar los contenidos de las asignaturas **Líneas de Énfasis 3** y **Auditoría de Sistemas**.

## 📂 Estructura del Proyecto

```text
├── index.html                        # Hoja inicial principal ("Materias vistas con Mahecha")
├── css/
│   ├── carta-estelar.css             # Base del diseño "Carta estelar" (fondo, encabezado, pie)
│   ├── portada.css                   # Exclusivo de la hoja inicial
│   ├── estilos.css                   # Secciones de ambas materias (menú, hero, tarjetas, panel)
│   ├── auditoria.css                 # Extras de Auditoría (cuadrícula de 4 módulos, etiquetas)
│   ├── auditoria-contenido.css       # Resúmenes: cifras, ruta, acordeones, pestañas y pasos (ambas materias)
│   ├── auditoria-casos.css           # Tarjetas que se voltean, glosario, casos y cuestionario (ambas materias)
│   └── linea-contenido.css           # Ajustes de Líneas de Énfasis 3 (columnas, resúmenes extendidos)
├── js/
│   ├── carta-estelar.js              # Constelaciones, astrolabio, reloj y transiciones entre páginas
│   └── auditoria.js                  # Interacciones de ambas materias (pestañas, filtros, cuestionario…)
├── auditorias/                       # Documentos originales de Auditoría usados para los resúmenes
├── linea de enfasis/                 # Documentos originales de Líneas de Énfasis 3 usados para los resúmenes
├── linea-enfasis-3/                  # Conjunto de páginas de Líneas de Énfasis 3
│   ├── index.html                    # Inicio de la materia
│   ├── temas.html                    # Unidades temáticas
│   ├── conceptos.html                # Conceptos fundamentales
│   ├── casos-practicos.html          # Casos prácticos
│   └── proyecto.html                 # Proyecto / Video tutorial
└── auditoria-sistemas/               # Conjunto de páginas de Auditoría de Sistemas
    ├── index.html                    # Inicio de la materia
    ├── temas.html                    # Unidades temáticas
    ├── conceptos.html                # Conceptos fundamentales
    ├── casos-practicos.html          # Casos prácticos
    └── proyecto.html                 # Proyecto / Video tutorial
```

## 🚀 Cómo publicar en GitHub Pages

1. Sube todos los archivos y carpetas de este proyecto a tu repositorio en [GitHub](https://github.com/).
2. En tu repositorio de GitHub, ve a **Settings** → **Pages**.
3. En **Build and deployment** → **Branch**, selecciona `main` (o `master`) y la carpeta `/ (root)`, luego haz clic en **Save**.
4. Tu página quedará publicada automáticamente tomando `index.html` como página principal.
