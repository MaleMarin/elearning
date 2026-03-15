#!/usr/bin/env python3
"""
Lista y lee el contenido (texto) de archivos PDF en una carpeta de Google Drive
usando una Service Account.

Uso:
  python scripts/drive_list_pdfs.py <FOLDER_ID>

Requisitos:
  pip install google-api-python-client google-auth pypdf
  Crear Service Account en Google Cloud, descargar JSON.
  Compartir la carpeta de Drive con el email de la Service Account.
"""

import os
import sys
from pathlib import Path

from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
from pypdf import PdfReader
import io


# Ruta al JSON de la Service Account (o env GOOGLE_APPLICATION_CREDENTIALS)
SCRIPT_DIR = Path(__file__).resolve().parent
DEFAULT_CREDENTIALS = SCRIPT_DIR.parent / "service-account-drive.json"
CREDENTIALS_PATH = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS", str(DEFAULT_CREDENTIALS))

SCOPES = ["https://www.googleapis.com/auth/drive.readonly"]


def get_drive_service():
    """Obtiene el cliente de Drive autenticado con Service Account."""
    creds = service_account.Credentials.from_service_account_file(
        CREDENTIALS_PATH, scopes=SCOPES
    )
    return build("drive", "v3", credentials=creds)


def list_pdfs_in_folder(service, folder_id: str) -> list[dict]:
    """Lista todos los PDF en una carpeta de Drive."""
    results = (
        service.files()
        .list(
            q=f"'{folder_id}' in parents and mimeType = 'application/pdf' and trashed = false",
            fields="files(id, name)",
            orderBy="name",
        )
        .execute()
    )
    return results.get("files", [])


def download_file(service, file_id: str) -> bytes:
    """Descarga el contenido binario de un archivo de Drive."""
    request = service.files().get_media(fileId=file_id)
    buffer = io.BytesIO()
    downloader = MediaIoBaseDownload(buffer, request)
    done = False
    while not done:
        _, done = downloader.next_chunk()
    buffer.seek(0)
    return buffer.read()


def extract_text_from_pdf(data: bytes) -> str:
    """Extrae texto de un PDF a partir de bytes."""
    try:
        reader = PdfReader(io.BytesIO(data))
        text_parts = []
        for page in reader.pages:
            text_parts.append(page.extract_text() or "")
        return "\n".join(text_parts).strip()
    except Exception as e:
        return f"[Error al extraer texto: {e}]"


def list_and_read_pdfs_in_folder(folder_id: str) -> list[dict]:
    """
    Lista PDFs en la carpeta y lee el contenido de cada uno.
    Retorna lista de { "id", "name", "text" }.
    """
    service = get_drive_service()
    files = list_pdfs_in_folder(service, folder_id)
    results = []

    for f in files:
        file_id = f["id"]
        name = f["name"]
        raw = download_file(service, file_id)
        text = extract_text_from_pdf(raw)
        results.append({"id": file_id, "name": name, "text": text})

    return results


def main():
    if len(sys.argv) < 2:
        print("Uso: python scripts/drive_list_pdfs.py <FOLDER_ID>", file=sys.stderr)
        sys.exit(1)

    folder_id = sys.argv[1]

    try:
        items = list_and_read_pdfs_in_folder(folder_id)
        print(f"Encontrados {len(items)} PDF(s):\n")
        for item in items:
            print(f"--- {item['name']} ({item['id']}) ---")
            preview = item["text"][:500] + ("..." if len(item["text"]) > 500 else "")
            print(preview)
            print()
    except Exception as e:
        print(e, file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
