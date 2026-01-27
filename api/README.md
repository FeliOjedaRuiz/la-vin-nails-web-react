# Uso: bin/delete_photos.js

Breve: script para borrar imágenes en Cloudinary y sus registros en MongoDB.

Precauciones:
- Asegúrate de tener copia de seguridad de la DB antes de ejecutar opciones destructivas.
- Las operaciones con `--yes` son irreversibles sobre la base de datos.

Variables de entorno requeridas (archivo `api/.env`):

- `MONGODB_URI`
- `CLOUDINARY_NAME`
- `CLOUDINARY_KEY`
- `CLOUDINARY_SECRET`

Opciones y ejemplos:

- Dry-run (lista sin borrar):

```bash
node bin/delete_photos.js --dry-run
```

- Ejecutar borrado (DB + Cloudinary por cada registro):

```bash
node bin/delete_photos.js --yes
```

- Sólo Cloudinary (borra por prefijo/carpeta, útil si ya eliminaste registros DB):

```bash
node bin/delete_photos.js --only-cloudinary --yes
```

Comportamiento:
- El script extrae `public_id` desde `photoUrl` y llama a `cloudinary.uploader.destroy(publicId)` por cada registro.
- El modo `--only-cloudinary` usa `delete_resources_by_prefix` y ahora pagina automáticamente hasta completar, intentando también `delete_folder` al final.

Resumen de la ejecución realizada desde este repositorio:

- Dry-run inicial (con `.env`): listó ~978 fotos.
- Ejecución con `--yes`: se borraron 978 registros en la base de datos (operación destructiva).
- Ejecución `--only-cloudinary --yes`: se eliminaron por lotes ~56 recursos y la carpeta `la-vin-nails-web/uñas-clientas` fue eliminada (script pagina automáticamente si es necesario).

Si necesitas que vuelva a ejecutar alguna operación (por ejemplo, repetir sólo Cloudinary), indícamelo y lo hago.

Notas:
- Cloudinary puede limitar peticiones; el script añade pequeñas pausas y paginación para evitar rate limits.
- No vuelvas a ejecutar la opción que elimina registros en la DB a menos que quieras repetir la acción (ya se borraron los registros).
