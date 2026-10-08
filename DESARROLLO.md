# Entornos: desarrollo y producción

| | Producción | Desarrollo |
|---|---|---|
| Web | https://dcg64-ua.github.io/app-test-preguntas/ | https://dcg64-ua.github.io/app-test-preguntas-dev/ |
| Repositorio | `dcg64-ua/app-test-preguntas` | `dcg64-ua/app-test-preguntas-dev` |
| Rama local | `main` (remoto `origin`) | `dev` (remoto `dev`, rama `main`) |
| Datos en el navegador | claves `quiz.*` | claves `quizdev.*` |
| Preguntas | su propio `preguntas.json` | su propio `preguntas.json` (de ejemplo) |

- La app detecta el entorno por la URL (`…-dev/`, o `localhost`) y en desarrollo muestra la etiqueta **🧪 DESARROLLO**.
- Progreso, ajustes, tema y token de GitHub están separados: probar en desarrollo no toca nada de producción.
- Cada entorno tiene su caché del service worker y solo borra la suya.
- El editor conectado a GitHub guarda en el repositorio del entorno en el que estás
  (el token tiene que dar acceso a ese repositorio).

## Funciones por entorno

El código es el mismo en los dos entornos. En `index.html`, `PROD_FEATURES` lista las funciones aprobadas
para producción (en desarrollo están todas activas). Valores posibles:
`flash` (flashcards y fichas), `articulos`, `audio`, `vf`, `recall`, `notas` (trucos y notas), `confusion`.
Para probar en local como producción: `http://localhost:8765/?env=prod`.

## Flujo de trabajo

1. Las funciones nuevas se hacen en la rama `dev` y se suben a desarrollo:
   ```
   git checkout dev
   git pull dev main          # trae los cambios hechos desde la app de desarrollo
   git push dev dev:main
   ```
2. Cuando están probadas, se pasan a producción **sin tocar su `preguntas.json`**:
   ```
   git checkout main
   git pull --rebase origin main
   git checkout dev -- . ':!preguntas.json'
   git commit -m "Pasar a producción: …"
   git push origin main
   ```
