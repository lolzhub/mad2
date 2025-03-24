from flask import Blueprint, request, jsonify, render_template, redirect, url_for
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    jwt_required,
    get_jwt_identity,
)
from .models import *
import json

import os


api = Blueprint("api", __name__)

@api.route("/")
def auth():
    return jsonify(msg="hello from routes"), 200


# Create a new customer (POST)
@api.route("/c_register", methods=["POST"])
def customer_register():
    data = request.get_json()
    print(data)

    # Validate required fields
    if (
        not data.get("email")
        or not data.get("password")
        or not data.get("full_name")
        or not data.get("address")
        or not data.get("pincode")
    ):
        return jsonify({"msg": "Missing required fields", "status": "failure"}), 400

    # Check if the email already exists
    existing_customer = Customer.query.filter_by(email=data["email"]).first()
    if existing_customer:
        return jsonify({"msg": "Email already exists", "status": "failure"}), 400

    hashed_password = bcrypt.generate_password_hash(data["password"]).decode("utf-8")

    # Create new customer object
    new_customer = Customer(
        email=data["email"],
        password=hashed_password,
        full_name=data["full_name"],
        address=data["address"],
        pincode=data["pincode"],
    )

    # Add the customer to the session and commit to the database
    db.session.add(new_customer)
    db.session.commit()

    return (
        jsonify({"msg": "Customer registered successfully", "status": "success"}),
        201,
    )

# Login for Customer (POST)
@api.route("/c_login", methods=["POST"])
def customer_login():
    data = request.get_json()
    print(data)

    # Validate required fields
    if not data.get("email") or not data.get("password"):
        return jsonify({"msg": "Missing email or password", "status": "failure"}), 400

    # Get customer by email
    customer = Customer.query.filter_by(email=data["email"]).first()
    print(customer)

    # Check if customer exists and password matches
    if not customer or not bcrypt.check_password_hash(customer.password, data["password"]):
        return jsonify({"msg": "Invalid email or password", "status": "failure"}), 401

    # Create JWT token
    access_token = create_access_token(identity={"email": customer.email, "role": "customer"})

    return jsonify(
        {"msg": "Login successful", "access_token": access_token, "status": "success"}
    ), 200


UPLOAD_FOLDER = 'uploads'  # Specify the folder where files will be saved
ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'txt'}  # Allowed file extensions

# Ensure the upload folder exists
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Function to check file extension
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@api.route("/p_register", methods=["POST"])
def add_professional():
    # Check if the request contains the file
    if 'document' not in request.files:
        return jsonify({"msg": "No document part", "status": "failure"}), 400
    
    file = request.files['document']

    if file.filename == '':
        return jsonify({"msg": "No selected file", "status": "failure"}), 400

    # Check if the file has an allowed extension
    if file and allowed_file(file.filename):
        # Secure the filename to avoid directory traversal attacks
        filename = secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        
        # Save the file to the uploads directory
        file.save(filepath)

        # Get data from request (assuming form data, not JSON, due to file upload)
        data = request.form.to_dict()
        data['document'] = filepath  # Store the path of the uploaded file
        
    else:
        return jsonify({"msg": "Invalid file type. Allowed types: pdf, doc, docx, txt", "status": "failure"}), 400

    # Check if the email already exists
    existing_professional = Professional.query.filter_by(email=data["email"]).first()
    if existing_professional:
        return jsonify({"msg": "Email already exists", "status": "failure"}), 400

    # Check if all required fields are provided
    required_fields = [
        "email",
        "password",
        "full_name",
        "service_name",
        "experience",
        "address",
        "pincode",
    ]
    if not all(field in data for field in required_fields):
        return jsonify({"msg": "Missing required fields", "status": "failure"}), 400

    # Hash the password using Flask-Bcrypt
    hashed_password = bcrypt.generate_password_hash(data["password"]).decode("utf-8")

    # Create a new professional object
    new_professional = Professional(
        email=data["email"],
        password=hashed_password,  # Save the hashed password
        full_name=data["full_name"],
        service_name=data["service_name"],
        cost=0.0,
        experience=int(data["experience"]),
        document=data["document"],  # Store the file path or filename
        address=data["address"],
        pincode=data["pincode"],
        rating=data.get("rating", 0.0),
        is_blocked=data.get("is_blocked", True),
    )

    # Add the new professional to the database
    db.session.add(new_professional)
    db.session.commit()

    return jsonify({
        "msg": "Professional registered successfully",
        "status": "success",
        "professional": {
            "id": new_professional.id,
            "email": new_professional.email,
            "full_name": new_professional.full_name,
            "service_name": new_professional.service_name,
        },
    }), 201


# Login for Customer (POST)
@api.route("/p_login", methods=["POST"])
def professional_login():
    data = request.get_json()
    print(data)

    # Validate required fields
    if not data.get("email") or not data.get("password"):
        return jsonify({"msg": "Missing email or password", "status": "failure"}), 400

    # Get customer by email
    professional = Professional.query.filter_by(email=data["email"]).first()
    print(professional)

    # Check if customer exists and password matches
    if not professional or not bcrypt.check_password_hash(professional.password, data["password"]):
        return jsonify({"msg": "Invalid email or password", "status": "failure"}), 401

    # Create JWT token
    access_token = create_access_token(identity={"email": professional.email, "role": "professional"})

    return jsonify(
        {"msg": "Login successful", "access_token": access_token, "status": "success"}
    ), 200
