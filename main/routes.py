import base64
from flask import Blueprint, render_template, jsonify
from models import PartidosPoliticos 

main = Blueprint('main', __name__)

@main.route('/')
def index():
    """Ruta principal (web)."""
    # Esta ruta sigue sirviendo tu aplicación web si la tienes
    return render_template('index.html')

# --- INICIO: API PARA LA APP MÓVIL ---

@main.route('/api/partidos')
def get_partidos():
    """
    Endpoint de API para obtener todos los partidos políticos
    y servirlos a la app de React Native.
    """
    try:
        # Consultar la base de datos usando el modelo PartidosPoliticos
        partidos = PartidosPoliticos.query.all()
        
        lista_partidos_json = []
        for partido in partidos:
            
            # Codificar el logo BLOB a base64 para enviarlo como string en el JSON
            # La app móvil puede decodificar esto para mostrar la imagen.
            logo_base64 = None
            if partido.logo_blob:
                # 'utf-8' es el encoding del string base64, no de la imagen
                logo_base64 = base64.b64encode(partido.logo_blob).decode('utf-8')

            lista_partidos_json.append({
                'id_partido': partido.id_partido,
                'jne_id_simbolo': partido.jne_id_simbolo,
                'nombre_partido': partido.nombre_partido,
                'siglas': partido.siglas,
                'fecha_inscripcion': partido.fecha_inscripcion.isoformat() if partido.fecha_inscripcion else None,
                
                # Devuelve el logo como un string base64
                'logo_base64': logo_base64, 
                
                'direccion_legal': partido.direccion_legal,
                'telefonos': partido.telefonos,
                'sitio_web': partido.sitio_web,
                'email_contacto': partido.email_contacto,
                'personero_titular': partido.personero_titular,
                'personero_alterno': partido.personero_alterno,
                'ideologia': partido.ideologia
            })
            
        # Devolver la lista de partidos como una respuesta JSON
        return jsonify(lista_partidos_json)

    except Exception as e:
        print(f"Error en /api/partidos: {e}")
        # Devolver un error 500 en formato JSON si algo falla
        return jsonify({"error": str(e)}), 500

# --- FIN: API PARA LA APP MÓVIL ---

@main.route('/mapa')
def mapa():
    """Ruta de mapa (web)."""
    # Esta ruta también es parte de tu app web
    return render_template('mapa.html')

# ... (puedes añadir tus otras rutas web aquí si es necesario)

@main.route('/parte1')
def parte1():
    return render_template('parte1.html')

@main.route('/parte3')
def parte3():
    return render_template('parte3.html')

@main.route('/parte4')
def parte4():
    return render_template('parte4.html')

@main.route('/candidatos')
def candidatos_view():
    return render_template('candidatos.html')
