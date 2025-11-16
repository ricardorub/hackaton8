import os
import requests
import re
from bs4 import BeautifulSoup
from datetime import datetime
from app import create_app
from extensions import db
from models import Candidatos
from sqlalchemy.exc import IntegrityError

#instalar dependencias: venv38/Scripts/activate && pip install -r requirements.txt
#Ejecución: python scraperCandidatos_util.py


# --- Configuración ---
SOURCE_GOBERNADORES = "gobernadores.html" 
SOURCE_ALCALDES = "alcaldes.html"
# ---------------------

def parse_candidatos_html(file_path, tipo_candidato):
    """
    Analiza el archivo HTML guardado (respuesta de admin-ajax.php)
    y extrae la información de la cuadrícula de candidatos.
    """
    print(f"Iniciando análisis de {file_path} ({tipo_candidato})...")
    
    if not os.path.exists(file_path):
        print(f"Error: No se encuentra el archivo '{file_path}'.")
        print("Por favor, guarda la respuesta HTML de la petición XHR en este archivo.")
        return []

    with open(file_path, 'r', encoding='utf-8') as f:
        html_content = f.read()

    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Selector principal para cada "tarjeta" de candidato
    items = soup.select('div.vc_grid-item') 
    
    if not items:
        print("Error: No se pudo encontrar ningún 'div.vc_grid-item'.")
        return []

    candidatos_data = []
    
    for item in items:
        candidato = {}
        
        # 1. Obtener Nombre del Candidato
        name_tag = item.select_one('div.vc_gitem-post-data-source-post_title h4')
        if name_tag:
            candidato['nombre_candidato'] = name_tag.get_text(strip=True)

        # 2. Obtener URL del Perfil
        link_tag = item.select_one('a.vc_gitem-link')
        if link_tag:
            candidato['perfil_url'] = link_tag.get('href', None)

        # 3. Obtener URL de la Imagen
        img_tag = item.select_one('img.vc_gitem-zone-img')
        if img_tag:
            candidato['imagen_url'] = img_tag.get('src', None)
        
        if not candidato.get('imagen_url'):
            style_div = item.select_one('div.vc_gitem-zone-a[style*="background-image"]')
            if style_div:
                style_attr = style_div.get('style', '')
                match = re.search(r"url\('([^']+)'\)", style_attr)
                if match:
                    candidato['imagen_url'] = match.group(1)

        # 4. Asignar el tipo (Gobernador / Alcalde)
        candidato['tipo_candidato'] = tipo_candidato

        if 'nombre_candidato' in candidato:
            candidatos_data.append(candidato)
        else:
            print("Advertencia: Se omitió un item por no tener nombre.")

    print(f"Se encontraron {len(candidatos_data)} candidatos válidos en {file_path}.")
    return candidatos_data

def download_image(url):
    """Descarga la imagen y devuelve los datos binarios (BLOB)."""
    if not url:
        return None
    # Algunos servidores rechazan peticiones sin User-Agent o Referer.
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
        'Referer': 'https://eleccionesperu.pe/'
    }
    try:
        response = requests.get(url, headers=headers, timeout=10, stream=True)
        response.raise_for_status()
        return response.content
    except requests.RequestException as e:
        print(f"Error al descargar imagen {url}: {e}")
        return None

def populate_database(app):
    """
    Usa el contexto de la app Flask para conectarse a la BD,
    borrar datos antiguos e insertar los nuevos.
    """
    with app.app_context():
        # Parsear ambos archivos
        gobernadores_list = parse_candidatos_html(SOURCE_GOBERNADORES, "Gobernador")
        alcaldes_list = parse_candidatos_html(SOURCE_ALCALDES, "Alcalde")

        candidatos_list = gobernadores_list + alcaldes_list

        if not candidatos_list:
            print("No hay datos para poblar. Terminando.")
            return

        # Deduplicar por 'perfil_url' antes de insertar (evita IntegrityError por UNIQUE)
        seen_urls = set()
        unique_candidates = []
        dup_count = 0
        for c in candidatos_list:
            url = c.get('perfil_url')
            if url and url in seen_urls:
                dup_count += 1
                continue
            if url:
                seen_urls.add(url)
            unique_candidates.append(c)
        if dup_count:
            print(f"Omitidos {dup_count} candidatos duplicados por 'perfil_url' en la entrada.")

        try:
            # Usamos el __tablename__ para la operación de borrado
            table_name = Candidatos.__tablename__
            print(f"Limpiando tabla '{table_name}'...")
            
            num_deleted = db.session.query(Candidatos).delete()
            print(f"Se eliminaron {num_deleted} registros antiguos.")
            
            print(f"Insertando {len(unique_candidates)} candidatos nuevos en la BD...")

            for data in unique_candidates:
                imagen_blob = download_image(data.get('imagen_url'))

                nuevo_candidato = Candidatos(
                    nombre_completo=data.get('nombre_candidato'),
                    tipo_candidatura=data.get('tipo_candidato'),
                    perfil_url=data.get('perfil_url'),
                    imagen_blob=imagen_blob
                )
                try:
                    db.session.add(nuevo_candidato)
                    # Ejecutar flush por registro para capturar errores de UNIQUE inmediatamente
                    db.session.flush()
                except IntegrityError:
                    db.session.rollback()
                    print(f"Omitido candidato duplicado en BD: {data.get('perfil_url')}")
                    continue

            # Commit final después de filtrar/omitir duplicados
            db.session.commit()
            print("¡Base de datos de candidatos poblada exitosamente!")
            
        except Exception as e:
            db.session.rollback()
            print(f"Error al poblar la base de datos: {e}")

if __name__ == "__main__":
    print("Creando contexto de la aplicación Flask...")
    app = create_app()
    populate_database(app)