from flask import Flask, request, jsonify, render_template, redirect, url_for, Blueprint
from application.configs import Config
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    jwt_required,
    get_jwt_identity,
)
from application.models import *
from flask_cors import CORS
from flask_migrate import Migrate


app = Flask(__name__)
app.config.from_object(Config)
CORS(app)
db.init_app(app)
jwt = JWTManager(app)
migrate = Migrate(app, db)


def registered_blueprints(app):
    from application.routes import api

    app.register_blueprint(api, url_prefix="/api")


registered_blueprints(app)


@app.route("/")
def hello_world():
    # say_hi = {"message": "Hello, World!", "status": "success"}
    # return jsonify(say_hi)
    return render_template("index.html")

def create_db():
    with app.app_context():
        db.create_all()
        # create_dummy_db()
        existing_admin = Admin.query.filter_by(username="adee").first()
        if not existing_admin:
            admin = Admin(
                username="adee",
                password=bcrypt.generate_password_hash("123").decode("utf-8"),
                role="admin",
            )
            dummy_professional = Professional(
                email="john.p1@app.com",
                password=bcrypt.generate_password_hash("123").decode("utf-8"),
                full_name="John Doe",
                service_desc="Best Plumbing Service",
                service_name="Plumbing",
                time_req="1 Hr",
                cost=50.0,
                experience=5,
                document="https://example.com/certificates/john_doe.pdf",
                address="123 Main Street, Springfield",
                pincode="123456",
                rating=4.5,
                is_blocked=False,
            )
            dummy_cust = Customer(
                email="u1@app.com",
                password=bcrypt.generate_password_hash("123").decode("utf-8"),
                full_name="John Doe1",
                address="123 Main Street, Springfield",
                pincode="123456"
            )
            db.session.add(dummy_professional)
            db.session.add(dummy_cust)
            # db.session.commit()

            db.session.add(admin)
            db.session.commit()


if __name__ == "__main__":
    create_db()
    app.run(port=5000, debug=True)
