import base64
from flask import Blueprint, render_template, jsonify, request
from models import PartidosPoliticos, CentrosVotacion, Candidatos
from extensions import db

main = Blueprint('main', __name__)

@main.route('/')
def index():
    """Ruta principal (web)."""
    centros_query = CentrosVotacion.query.all()
    centros = [
        {
            "id_centro": c.id_centro,
            "nombre": c.nombre,
            "distrito": c.distrito,
            "latitud": float(c.latitud) if c.latitud is not None else None,
            "longitud": float(c.longitud) if c.longitud is not None else None,
            "ubicacion_detalle": c.mesas[0].ubicacion_detalle if c.mesas else None
        }
        for c in centros_query
    ]
    return render_template('index.html', centros=centros)

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

@main.route('/api/candidatos')
def api_candidatos():
    """
    Endpoint de API para obtener los candidatos con filtros.
    """
    try:
        # Obtener parámetros de consulta
        region = request.args.get('region', None)
        cargo = request.args.get('cargo', None)

        # Construir la consulta inicial
        query = db.session.query(Candidatos).join(PartidosPoliticos, Candidatos.partido_politico_id == PartidosPoliticos.id_partido)

        # Aplicar filtros si se proporcionan
        if region:
            query = query.filter(Candidatos.region.ilike(f'%{region}%'))
        if cargo:
            query = query.filter(Candidatos.tipo_candidatura.ilike(f'%{cargo}%'))

        # Ejecutar la consulta
        candidatos = query.all()

        # Serializar los resultados
        lista_candidatos = []
        for candidato in candidatos:
            # Codificar la imagen del candidato a base64
            imagen_base64 = None
            if candidato.imagen_blob:
                imagen_base64 = base64.b64encode(candidato.imagen_blob).decode('utf-8')

            # Codificar el logo del partido a base64
            logo_base64 = None
            if candidato.partido_politico and candidato.partido_politico.logo_blob:
                logo_base64 = base64.b64encode(candidato.partido_politico.logo_blob).decode('utf-8')

            lista_candidatos.append({
                'id': candidato.id,
                'nombre_completo': candidato.nombre_completo,
                'tipo_candidatura': candidato.tipo_candidatura,
                'perfil_url': candidato.perfil_url,
                'region': candidato.region,
                'biografia': candidato.biografia,
                'imagen_base64': imagen_base64,
                'partido': {
                    'nombre': candidato.partido_politico.nombre_partido,
                    'siglas': candidato.partido_politico.siglas,
                    'logo_base64': logo_base64,
                    'direccion_legal': candidato.partido_politico.direccion_legal,
                    'personero_titular': candidato.partido_politico.personero_titular
                }
            })

        return jsonify(lista_candidatos)

    except Exception as e:
        print(f"Error en /api/candidatos: {e}")
        return jsonify({"error": str(e)}), 500
