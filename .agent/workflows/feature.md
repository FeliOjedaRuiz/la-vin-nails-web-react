---
description: Inicia una nueva feature en una rama aislada de Git para probar en Preview (Vercel/Fly) sin afectar producción.
---

# Workflow: Desarrollo en Rama Aislada (/feature)

Este workflow garantiza que cualquier mejora, experimento o tarea grande se desarrolle fuera de la rama principal (`main`), permitiendo generar vistas previas (Previews) al subirlo a GitHub y evitando totalmente despliegues directos a producción.

1. **Definición de la Rama**:
   - Si el usuario no especificó un nombre para la rama al llamar al comando, pídele una breve descripción para generar un nombre semántico (ej: `feat/nuevo-login`, `fix/ui-calendario`, `refactor/estado-citas`).

2. **Creación y Cambio de Rama**:
   - Comprueba el estado actual del repositorio: `git status`
   - Si está limpio (o los cambios están relacionados con la feature), crea y cambia a la nueva rama:
     `git checkout -b <nombre-de-la-rama>`

3. **Implementación de la Feature**:
   - Procede a desarrollar la mejora solicitada por el usuario.
   - *Tip:* Si la feature es muy grande y estás usando un modelo pesado (Opus/Pro), puedes aplicar automáticamente la lógica del workflow `/tarea` para planificar y recomendar delegar la escritura a un modelo rápido.

4. **Commit y Push (Activación de Preview)**:
   - Una vez la mejora esté implementada y probada localmente (o si el usuario te pide subirla para ver el Preview):
   - Haz commit de los cambios: `git add .` seguido de `git commit -m "feat: [descripción]"`
   - Sube la rama al repositorio remoto: `git push -u origin <nombre-de-la-rama>`
   - **Aviso al usuario:** Infórmale que al subir la rama, su plataforma (ej. Vercel) debería generar un enlace de Preview automáticamente.

5. **Aislamiento Estricto (REGLA DE ORO)**:
   - **NUNCA** hagas merge de vuelta a la rama principal (`main`) desde la terminal.
   - **NUNCA** ejecutes workflows de despliegue a producción como `/deploy` o comandos como `fly deploy`.
   - Recuerda al usuario que el paso a producción debe hacerse mediante la creación de un Pull Request (PR) en GitHub, una vez validada la versión en el entorno de Preview.
