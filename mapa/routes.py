from flask import Blueprint, render_template, request, jsonify
from models import CentrosVotacion, Mesas
from extensions import db

mapa = Blueprint("mapa", __name__)

@mapa.route("/")
def mapa_index():
    return render_template("mapa.html")


# API para filtrar centros
@mapa.route("/api/centros")
def api_centros():
    distrito = request.args.get("distrito")
    dni = request.args.get("dni")
    nombre = request.args.get("nombre")

    query = CentrosVotacion.query

    if distrito:
        query = query.filter_by(distrito=distrito)

    if nombre:
        query = query.filter(CentrosVotacion.nombre.like(f"%{nombre}%"))

    if dni:
        # Filtrado por dni no implementado: la estructura actual de modelos
        # no incluye 'dni_responsable' en 'Mesas'. Omite este filtro.
        pass

    centros = query.all()

    result = [
        {
            "id": c.id_centro,
            "nombre": c.nombre,
            "distrito": c.distrito,
            "lat": float(c.latitud) if c.latitud is not None else None,
            "lng": float(c.longitud) if c.longitud is not None else None
        }
        for c in centros
    ]

    return jsonify(result)
