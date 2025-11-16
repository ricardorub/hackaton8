from flask import Flask
from config import Config
from extensions import db
import models as models 

# Importar Blueprints
from main.routes import main
from mapa.routes import mapa

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Inicializar base de datos
    db.init_app(app)

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
