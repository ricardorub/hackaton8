import uuid
from extensions import db
from sqlalchemy import String, Integer, Date, Enum, ForeignKey, Numeric, Text, DateTime
from sqlalchemy.dialects.mysql import CHAR, MEDIUMBLOB
from sqlalchemy.orm import relationship
from datetime import datetime, timezone 

# --- Modelos de Usuarios y Ubicación ---

class CentrosVotacion(db.Model):
    """
    Almacena los lugares físicos de votación (colegios, etc.).
    Usa UUID como clave primaria.
    """
    __tablename__ = 'CentrosVotacion'
    
    id_centro = db.Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    nombre = db.Column(db.String(255), nullable=False)
    direccion = db.Column(db.String(255), nullable=False)
    distrito = db.Column(db.String(100))
    latitud = db.Column(db.Numeric(10, 8), nullable=True)
    longitud = db.Column(db.Numeric(11, 8), nullable=True)
    
    # Relación: Un centro de votación tiene muchas mesas
    mesas = relationship('Mesas', back_populates='centro_votacion', lazy=True)

    def to_dict(self):
        return {
            'id_centro': self.id_centro,
            'nombre': self.nombre,
            'direccion': self.direccion,
            'distrito': self.distrito,
            'latitud': float(self.latitud) if self.latitud is not None else None,
            'longitud': float(self.longitud) if self.longitud is not None else None,
        }

    def __repr__(self):
        return f'<CentrosVotacion {self.nombre}>'

class Mesas(db.Model):
    """
    Almacena cada mesa de sufragio y su ubicación DENTRO del centro.
    Usa INT AUTO_INCREMENT como clave primaria (según solicitud).
    """
    __tablename__ = 'Mesas'
    
    id_mesa = db.Column(db.Integer, primary_key=True, autoincrement=True)
    numero_mesa = db.Column(db.String(10), nullable=False, unique=True)
    ubicacion_detalle = db.Column(db.String(255), nullable=True)
    
    # Clave Foránea: Enlace a CentrosVotacion usando CHAR(36)
    id_centro = db.Column(CHAR(36), ForeignKey('CentrosVotacion.id_centro'), nullable=False)
    
    # Relaciones
    centro_votacion = relationship('CentrosVotacion', back_populates='mesas')
    usuarios = relationship('Usuarios', back_populates='mesa', lazy=True)

    def __repr__(self):
        return f'<Mesas {self.numero_mesa}>'

class Usuarios(db.Model):
    """
    Almacena SOLO a los usuarios registrados en la app.
    Usa UUID como clave primaria.
    """
    __tablename__ = 'Usuarios'
    
    id_usuario = db.Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    dni = db.Column(db.String(8), nullable=False, unique=True, index=True)
    email = db.Column(db.String(255), unique=True, nullable=True)
    password_hash = db.Column(db.String(255), nullable=True)
    rol = db.Column(db.Enum('Elector', 'MiembroMesa'), nullable=False, default='Elector')
    
    # Clave Foránea: Enlace a Mesas usando Integer
    id_mesa = db.Column(db.Integer, ForeignKey('Mesas.id_mesa'), nullable=True)
    
    # Relación
    mesa = relationship('Mesas', back_populates='usuarios')

    def __repr__(self):
        return f'<Usuarios {self.dni}>'

# --- Modelo de Partidos Políticos ---

class PartidosPoliticos(db.Model):
    """
    Almacena las agrupaciones políticas.
    Optimizado para los datos del JNE y para almacenar el logo como BLOB.
    """
    __tablename__ = 'PartidosPoliticos'
    
    id_partido = db.Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    jne_id_simbolo = db.Column(db.Integer, nullable=True, comment='ID interno del JNE (ej: /GetSimbolo/4)')
    nombre_partido = db.Column(db.String(255), nullable=False, index=True)
    siglas = db.Column(db.String(50), nullable=True)
    fecha_inscripcion = db.Column(db.Date, nullable=True)
    
    # --- Campo BLOB para el logo (para la IA) ---
    logo_blob = db.Column(MEDIUMBLOB, nullable=True, comment='Datos binarios de la imagen del logo')
    
    # --- Campos de información de contacto (del HTML/scraper) ---
    direccion_legal = db.Column(db.String(255), nullable=True)
    telefonos = db.Column(db.String(100), nullable=True)
    sitio_web = db.Column(db.String(255), nullable=True)
    email_contacto = db.Column(db.String(255), nullable=True)
    
    # --- Campos de personeros (del HTML/scraper) ---
    personero_titular = db.Column(db.String(255), nullable=True)
    personero_alterno = db.Column(db.String(255), nullable=True)
    
    # --- Campo de ideología (se mantiene) ---
    ideologia = db.Column(
        db.Enum('Izquierda', 'CentroIzquierda', 'Centro', 'CentroDerecha', 'Derecha', 'Otro', 'Desconocido'),
        nullable=True,
        default='Desconocido'
    )

    def __repr__(self):
        return f'<PartidosPoliticos {self.siglas or self.nombre_partido}>'
    
# --- Modelo de Candidato ---

class Candidatos(db.Model):
    __tablename__ = 'candidatos'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre_completo = db.Column(db.String(255), nullable=False)
    
    # 'Gobernador' o 'Alcalde'
    tipo_candidatura = db.Column(db.String(11)) 
    
    # URL al perfil detallado en eleccionesperu.pe
    perfil_url = db.Column(db.String(500), unique=True) 
    
    # BLOB para almacenar la foto descargada
    imagen_blob = db.Column(MEDIUMBLOB, nullable=True)
    partido_politico_id = db.Column(
        CHAR(36), 
        db.ForeignKey('PartidosPoliticos.id_partido'),
        nullable=True
    )
    
    region = db.Column(db.String(50), nullable=True)
    biografia = db.Column(db.Text, nullable=True)
    
    fecha_creacion = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    
    partido_politico = relationship('PartidosPoliticos', backref=db.backref('candidatos', lazy=True))

    def __repr__(self):
        return f'<Candidato {self.nombre_completo}>'