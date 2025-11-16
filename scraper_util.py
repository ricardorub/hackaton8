import os
import requests
import re
from bs4 import BeautifulSoup
from datetime import datetime
from app import create_app  # Importa el factory de tu app Flask
from extensions import db
from models import PartidosPoliticos

# --- Configuración ---
# URL base para completar las URLs relativas de los logos
BASE_JNE_URL = "https://sroppublico.jne.gob.pe"
# Archivo HTML guardado manualmente (Respuesta del POST que capturaste)
SOURCE_HTML_FILE = "partidos_data.html" 
# ---------------------

def parse_partidos_html(file_path):
    """
    Analiza el archivo HTML guardado y extrae la información
    de la tabla de partidos políticos.
    """
    print(f"Iniciando análisis de {file_path}...")
    
    if not os.path.exists(file_path):
        print(f"Error: No se encuentra el archivo '{file_path}'.")
        print("Por favor, guarda la respuesta HTML de la solicitud POST del JNE en este archivo.")
        return []

    with open(file_path, 'r', encoding='utf-8') as f:
        html_content = f.read()

    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Encontrar la tabla por su ID
    table = soup.find('table', id='tblOrganizacionPolitica')
    if not table:
        print("Error: No se pudo encontrar la tabla con id='tblOrganizacionPolitica'.")
        return []

    partidos_data = []
    
    # Iterar sobre las filas (tr) del cuerpo de la tabla (tbody)
    for row in table.tbody.find_all('tr'):
        partido = {}
        # Las columnas son: N°, Organización Política, Información
        cols = row.find_all('td')
        
        if len(cols) != 3:
            print("Advertencia: Se encontró una fila con formato inesperado. Omitiendo.")
            continue

        # --- Columna 1: Organización Política (cols[1]) ---
        col_org = cols[1]
        
        # Logo URL y JNE ID
        img_tag = col_org.find('img')
        if img_tag and img_tag.get('src'):
            partido['logo_url'] = BASE_JNE_URL + img_tag['src']
            # Extraer JNE ID del logo (ej: /Consulta/Simbolo/GetSimbolo/4)
            match = re.search(r'/GetSimbolo/(\d+)', img_tag['src'])
            if match:
                partido['jne_id_simbolo'] = int(match.group(1))

        # Nombre del Partido
        nombre_tag = col_org.find('span', title=True)
        if nombre_tag:
            partido['nombre_partido'] = nombre_tag.text.strip()
            
        # Fecha Inscripción
        # Buscamos el span que contenga el texto 'Fecha de Inscripción:'
        fecha_tag = col_org.find('span', string=re.compile(r'Fecha de Inscripción:'))
        if fecha_tag:
            fecha_str = fecha_tag.text.replace('Fecha de Inscripción:', '').strip()
            try:
                # Convertir formato DD/MM/AAAA a un objeto Date de Python
                partido['fecha_inscripcion'] = datetime.strptime(fecha_str, '%d/%m/%Y').date()
            except ValueError:
                print(f"Advertencia: No se pudo procesar la fecha '{fecha_str}'")
                partido['fecha_inscripcion'] = None

        # --- Columna 2: Información (cols[2]) ---
        col_info = cols[2]
        
        # Dirección (glyphicon-map-marker)
        dir_div = col_info.find('span', title='Dirección')
        if dir_div and dir_div.find_next('div'):
            partido['direccion_legal'] = dir_div.find_next('div').text.strip()

        # Teléfonos (glyphicon-phone-alt)
        tel_div = col_info.find('span', title='Teléfonos')
        if tel_div and tel_div.find_next('div'):
            partido['telefonos'] = tel_div.find_next('div').text.strip()

        # Web (glyphicon-globe)
        web_div = col_info.find('span', title='Página web')
        if web_div and web_div.find_next('div'):
            partido['sitio_web'] = web_div.find_next('div').text.strip()

        # Email (glyphicon-envelope)
        email_div = col_info.find('span', title='Correo electrónico')
        if email_div and email_div.find_next('div'):
            partido['email_contacto'] = email_div.find_next('div').text.strip()

        # Personeros (glyphicon-user)
        for dt in col_info.find_all('dt'):
            if 'Titular' in dt.text:
                partido['personero_titular'] = dt.find_next_sibling('dd').text.strip()
            elif 'Alterno' in dt.text:
                partido['personero_alterno'] = dt.find_next_sibling('dd').text.strip()

        if 'nombre_partido' in partido:
            partidos_data.append(partido)
        else:
            print("Advertencia: Se omitió una fila por no tener nombre de partido.")

    print(f"Se encontraron {len(partidos_data)} partidos válidos en el HTML.")
    return partidos_data

def download_logo(url):
    """Descarga la imagen del logo y devuelve los datos binarios (BLOB)."""
    if not url:
        return None
    try:
        # Usamos stream=True para manejo eficiente
        response = requests.get(url, timeout=10, stream=True)
        response.raise_for_status() # Lanza error si la descarga falla
        
        # Retornamos el contenido binario
        return response.content
    except requests.RequestException as e:
        print(f"Error al descargar logo {url}: {e}")
        return None

def populate_database(app):
    """
    Usa el contexto de la app Flask para conectarse a la BD,
    borrar datos antiguos e insertar los nuevos.
    """
    # app.app_context() asegura que estemos dentro de la aplicación Flask
    # para que 'db' (SQLAlchemy) sepa a qué BD conectarse.
    with app.app_context():
        partidos_list = parse_partidos_html(SOURCE_HTML_FILE)
        
        if not partidos_list:
            print("No hay datos para poblar. Terminando.")
            return

        try:
            print("Limpiando tabla 'PartidosPoliticos'...")
            # Borra todos los registros existentes para evitar duplicados
            num_deleted = db.session.query(PartidosPoliticos).delete()
            print(f"Se eliminaron {num_deleted} registros antiguos.")
            
            print(f"Insertando {len(partidos_list)} partidos nuevos en la BD...")
            for data in partidos_list:
                # Descargar el logo y obtener los bytes (BLOB)
                logo_blob = download_logo(data.get('logo_url'))
                
                # Crear la nueva instancia del modelo
                nuevo_partido = PartidosPoliticos(
                    jne_id_simbolo=data.get('jne_id_simbolo'),
                    nombre_partido=data.get('nombre_partido'),
                    fecha_inscripcion=data.get('fecha_inscripcion'),
                    logo_blob=logo_blob, # Guardamos los datos binarios
                    direccion_legal=data.get('direccion_legal'),
                    telefonos=data.get('telefonos'),
                    sitio_web=data.get('sitio_web'),
                    email_contacto=data.get('email_contacto'),
                    personero_titular=data.get('personero_titular'),
                    personero_alterno=data.get('personero_alterno')
                    # 'siglas' e 'ideologia' se dejan por defecto (NULL o 'Desconocido')
                )
                db.session.add(nuevo_partido)
            
            # Confirmar la transacción
            db.session.commit()
            print("¡Base de datos poblada exitosamente!")
            
        except Exception as e:
            # Si algo falla, revertir la transacción
            db.session.rollback()
            print(f"Error al poblar la base de datos: {e}")

if __name__ == "__main__":
    # Creamos una instancia de la app Flask para tener el contexto
    # de la base de datos (SQLAlchemy) según tu factory pattern en app.py
    print("Creando contexto de la aplicación Flask...")
    app = create_app()
    populate_database(app)