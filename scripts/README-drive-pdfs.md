# Listar y leer PDFs desde una carpeta de Google Drive (Service Account)

## Configuración previa

1. **Google Cloud Console**
   - Crea un proyecto (o usa uno existente).
   - Activa la API **Google Drive API**.
   - En *IAM y administración* → *Cuentas de servicio*, crea una cuenta de servicio y descarga el JSON de la clave.

2. **Google Drive**
   - Crea o elige la carpeta que quieres leer.
   - Comparte la carpeta con el **email de la Service Account** (ej. `nombre@proyecto.iam.gserviceaccount.com`) con permiso *Lector*.

3. **Coloca el JSON** en la raíz del proyecto como `service-account-drive.json`, o define la variable de entorno:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS=/ruta/al/archivo.json
   ```

## Node.js

```bash
cd /ruta/elearningPD
npm install googleapis pdf-parse
node scripts/drive-list-pdfs.js <FOLDER_ID>
```

`FOLDER_ID` es el ID de la carpeta en Drive (está en la URL: `https://drive.google.com/drive/folders/FOLDER_ID`).

## Python

```bash
pip install google-api-python-client google-auth pypdf
python scripts/drive_list_pdfs.py <FOLDER_ID>
```

## Uso como módulo

**Node.js**
```js
const { listPdfsInFolder, listAndReadPdfsInFolder } = require("./scripts/drive-list-pdfs");
const items = await listAndReadPdfsInFolder("1abc...");
// items = [ { id, name, text }, ... ]
```

**Python**
```py
from scripts.drive_list_pdfs import list_and_read_pdfs_in_folder
items = list_and_read_pdfs_in_folder("1abc...")
# items = [ {"id": ..., "name": ..., "text": ...}, ... ]
```
