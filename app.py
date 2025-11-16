from flask import Flask
from config import Config
from extensions import db
import models as models
from flask_migrate import Migrate
from flask_cors import CORS

# Importar Blueprints
from main.routes import main
from mapa.routes import mapa

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    #instalas cors pip install flask-cors
    # Habilitar CORS
    CORS(app, resources={r"/*": {"origins": "*"}})

    # Inicializar base de datos
    db.init_app(app)

    migrate = Migrate(app, db)
    # Ejecutar esto: pip install Flask-Migrate
    # Habilitar el venv38 y luego:
    # flask db init
    # flask db migrate -m "Agregada tabla CandidatoRegional y corregido timestamp"
    #flask db upgrade

    # Registrar Blueprints
    app.register_blueprint(main)
    app.register_blueprint(mapa, url_prefix="/mapa")

    # Crear tablas si no existen
    with app.app_context():
        db.create_all()

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
