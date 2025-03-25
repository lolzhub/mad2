from flask import Blueprint, request, jsonify, render_template, redirect, url_for
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    jwt_required,
    get_jwt_identity,
)
from .models import *
import json
from datetime import datetime
import os
from werkzeug.utils import secure_filename


api = Blueprint("api", __name__)

@api.route("/")

def auth():
    return render_template("index.html")

###########################################################
#                          AUTH                           #
###########################################################

@api.route("/admin", methods=["POST"])
def login():
    data = request.get_json()

    # Validate required fields
    if not data.get("username") or not data.get("password"):
        return (
            jsonify({"msg": "Missing username or password", "status": "failure"}),
            400,
        )

    # Get the admin from the database by username
    admin = Admin.query.filter_by(username=data["username"]).first()

    if not admin:
        return (
            jsonify({"msg": "Invalid username or password", "status": "failure"}),
            401,
        )

    # Check if the password is correct using bcrypt
    if not bcrypt.check_password_hash(admin.password, data["password"]):
        return (
            jsonify({"msg": "Invalid username or password", "status": "failure"}),
            401,
        )

    # Generate a JWT token for the logged-in admin
    # identity = f"{admin.username}-{admin.role}"
    access_token = create_access_token(identity={"username": admin.username, "role": "admin"})

    # access_token = create_access_token(identity=identity)

    return (
        jsonify(
            {
                "msg": "success",
                "access_token": access_token,  # Include the access token in the response
            }
        ),
        200,
    )


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
    # access_token = create_access_token(identity={"email": customer.email, "role": "customer"})
    # import json

    access_token = create_access_token(identity={"id": customer.id,"email": customer.email, "role": "customer"})


    return jsonify(
        {"msg": "Login successful", "access_token": access_token,"id":customer.id, "status": "success"}
    ), 200

@api.route("/dashboard/<int:id>", methods=["GET", "POST"])
def customer_dashboard(id):
    customer = Customer.query.filter_by(id=id).first()
    print(customer)

    return jsonify(
        {"msg": "Login successful","id":customer.id, "customer":customer.full_name, "status": "success"}
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
    # access_token = create_access_token(identity={"email": professional.email, "role": "professional"})
    access_token = create_access_token(identity={"id": professional.id,"email": professional.email, "role": "professional"})

    return jsonify(
        {"msg": "Login successful", "access_token": access_token, "status": "success"}
    ), 200

###########################################################
#                          Services                       #
###########################################################


@api.route("/add_serv", methods=["POST"])
@jwt_required()
def create_service():
    data = request.get_json()
    print(data)

    # Check if the required fields are provided
    if not data.get("name") or not data.get("price") or not data.get("time_required"):
        return jsonify({"msg": "Missing required fields", "status": "failure"}), 400

    # Create a new service object
    new_service = Service(
        name=data["name"],
        price=data["price"],
        time_required=data["time_required"],
        description=data.get("description"),
        rating=data.get("rating", 0.0),
        cat=data.get("cat")
    )

    # Add the new service to the database
    db.session.add(new_service)
    db.session.commit()

    return (
        jsonify(
            {
                "msg": "Service created successfully",
                "status": "success",
                "service": {
                    "id": new_service.id,
                    "name": new_service.name,
                    "price": new_service.price,
                    "time_required": new_service.time_required,
                    "description": new_service.description,
                    "rating": new_service.rating,
                },
            }
        ),
        201,
    )


@api.route("/all_servs", methods=["GET"])
@jwt_required()
def get_all_services():
    services = Service.query.all()

    if not services:
        return jsonify({"msg": "No services found", "status": "failure"}), 404

    # Convert to list of dictionaries
    service_list = [
        {
            "id": service.id,
            "name": service.name,
            "price": service.price,
            "time_required": service.time_required,
            "description": service.description,
            "rating": service.rating,
        }
        for service in services
    ]

    return (
        jsonify(
            {
                "msg": "Services fetched successfully",
                "status": "success",
                "services": service_list,
            }
        ),
        200,
    )

    


@api.route("/all_servs_by_cat/<name>", methods=["GET"])
@jwt_required()
def get_all_services_by_cat(name):
    services = Service.query.filter_by(cat=name).all()

    if not services:
        return jsonify({"msg": "No services found", "status": "failure"}), 404

    # Convert to list of dictionaries
    service_list = [
        {
            "id": service.id,
            "name": service.name,
            "price": service.price,
            "time_required": service.time_required,
            "description": service.description,
            "rating": service.rating,
        }
        for service in services
    ]

    return (
        jsonify(
            {
                "msg": "Services fetched successfully",
                "status": "success",
                "services": service_list,
            }
        ),
        200,
    )

@api.route("/serv/<int:id>", methods=["GET"])
@jwt_required()
def get_service(id):
    service = Service.query.get(id)

    if not service:
        return jsonify({"msg": "Service not found", "status": "failure"}), 404

    return (
        jsonify(
            {
                "msg": "Service fetched successfully",
                "status": "success",
                "service": {
                    "id": service.id,
                    "name": service.name,
                    "price": service.price,
                    "time_required": service.time_required,
                    "description": service.description,
                    "rating": service.rating,
                },
            }
        ),
        200,
    )


@api.route("/serv/<int:id>", methods=["PUT"])
@jwt_required()
def update_service(id):
    service = Service.query.get(id)

    if not service:
        return jsonify({"msg": "Service not found", "status": "failure"}), 404

    data = request.get_json()  # Get data from the request body

    # Update the fields
    service.name = data.get("name", service.name)
    service.price = data.get("price", service.price)
    service.time_required = data.get("time_required", service.time_required)
    service.description = data.get("description", service.description)
    service.rating = data.get("rating", service.rating)
    service.cat = data.get("cat", service.cat)

    # Commit changes to the database
    db.session.commit()

    return (
        jsonify(
            {
                "msg": "Service updated successfully",
                "status": "success",
                "service": {
                    "id": service.id,
                    "name": service.name,
                    "price": service.price,
                    "time_required": service.time_required,
                    "description": service.description,
                    "rating": service.rating,
                },
            }
        ),
        200,
    )


@api.route("/serv/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_service(id):
    service = Service.query.get(id)

    if not service:
        return jsonify({"msg": "Service not found", "status": "failure"}), 404

    db.session.delete(service)
    db.session.commit()

    return jsonify({"msg": "Service deleted successfully", "status": "success"}), 200


###########################################################
#                          SRs                            #
###########################################################


@api.route("/add_req", methods=["POST"])
@jwt_required()
def create_service_request():
    data = request.get_json()

    # Validate required fields
    required_fields = ["service_id", "customer_id", "cost"]
    for field in required_fields:
        if field not in data:
            return jsonify({"msg": f"Missing {field}", "status": "failure"}), 400

    # Convert preferred_date string to datetime object
    if data.get("preferred_date"):
        try:
            preferred_date = datetime.strptime(data["preferred_date"], "%Y-%m-%dT%H:%M:%S")
        except ValueError:
            return jsonify({"msg": "Invalid preferred_date format, should be 'YYYY-MM-DDTHH:MM:SS'", "status": "failure"}), 400
    else:
        preferred_date = None

    # Create new ServiceRequest object
    new_request = ServiceRequest(
        service_id=data["service_id"],
        customer_id=data["customer_id"],
        professional_id=data.get("professional_id"),
        remarks=data.get("remarks"),
        location=data.get("location"),
        preferred_date=preferred_date,
        urgency_level=data.get("urgency_level"),
        cost=data["cost"],
        service_status="requested",  # Default status for new request
    )

    # Add and commit to the database
    try:
        db.session.add(new_request)
        db.session.commit()
        return jsonify({"msg": "Service request created successfully", "status": "success", "service_request": new_request.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Error creating service request", "status": "failure", "error": str(e)}), 500


# 2. Get Service Requests for Logged-in User (GET)
@api.route("/all_reqs", methods=["GET"])
@jwt_required()
def get_user_service_requests():
    # Get user identity from JWT
    user_identity = get_jwt_identity()
    # user_identity_dict = eval(user_identity)
    print("user identity--->",user_identity, type(user_identity))
    # print(type(user_identity))
    user_email = user_identity["email"]
    user_id = user_identity["id"]
    user_role = user_identity["role"]

    if user_role == "customer":
        service_requests = ServiceRequest.query.filter_by(customer_id=user_id).all()
    elif user_role == "professional":
        service_requests = ServiceRequest.query.filter_by(professional_id=user_id).all()
    elif user_role=="admin":
        service_requests = Service.query.all()
    else:
        return jsonify({"msg": "Invalid user role", "status": "error"}), 403

    service_requests_list = [
        {
            "id": req.id,
            "service_id": req.service.name,
            "customer_id": req.customer_id,
            "professional_id": req.professional.full_name,
            "date_of_request": req.date_of_request,
            "date_of_completion": req.date_of_completion,
            "service_status": req.service_status,
            "remarks": req.remarks,
            "location": req.location,
            "preferred_date": req.preferred_date,
            "urgency_level": req.urgency_level,
            "created_at": req.created_at,
            "updated_at": req.updated_at,
            "rating": req.rating,
            "cost": req.cost,
        }
        for req in service_requests
    ]

    return jsonify({"msg": "Service requests retrieved successfully", "status": "success", "service_requests": service_requests_list}), 200


# 3. Get Service Request by ID (GET)
@api.route("/req/<int:id>", methods=["GET"])
@jwt_required()
def get_service_request_by_id(id):
    # Fetch the service request by ID
    service_request = ServiceRequest.query.get(id)

    if not service_request:
        return jsonify({"msg": "Service request not found", "status": "failure"}), 404

    return jsonify({
        "msg": "Service request retrieved successfully",
        "status": "success",
        "service_request": {
            "id": service_request.id,
            "service_id": service_request.service.name,
            "service_desc": service_request.service.description,
            "customer_id": service_request.customer_id,
            "professional_id": service_request.professional_id,
            "date_of_request": service_request.date_of_request,
            "date_of_completion": service_request.date_of_completion,
            "service_status": service_request.service_status,
            "remarks": service_request.remarks,
            "location": service_request.location,
            "preferred_date": service_request.preferred_date,
            "urgency_level": service_request.urgency_level,
            "created_at": service_request.created_at,
            "updated_at": service_request.updated_at,
            "rating": service_request.rating,
            "cost": service_request.cost,
        }
    }), 200

@api.route("/req/<int:id>", methods=["PUT"])
@jwt_required()
def update_service_request(id):
    # Fetch the service request by ID
    service_request = ServiceRequest.query.get(id)

    if not service_request:
        return jsonify({"msg": "Service request not found", "status": "failure"}), 404

    # Get data from the request body
    data = request.get_json()

    # Update the service request with the new data if provided
    if data.get("service_status"):
        service_request.service_status = data["service_status"]
    if data.get("remarks"):
        service_request.remarks = data["remarks"]
    if data.get("location"):
        service_request.location = data["location"]
    
    # Ensure 'preferred_date' is a valid datetime object
    if data.get("preferred_date"):
        try:
            service_request.preferred_date = datetime.strptime(data["preferred_date"], "%Y-%m-%dT%H:%M:%S")
        except ValueError:
            return jsonify({"msg": "Invalid preferred_date format. Use 'YYYY-MM-DDTHH:MM:SS'.", "status": "failure"}), 400
    
    if data.get("urgency_level"):
        service_request.urgency_level = data["urgency_level"]
    if data.get("professional_id"):
        service_request.professional_id = data["professional_id"]
    if data.get("rating") is not None:
        service_request.rating = data["rating"]
    
    # Ensure 'date_of_completion' is a valid datetime object
    if data.get("date_of_completion"):
        try:
            service_request.date_of_completion = datetime.strptime(data["date_of_completion"], "%Y-%m-%dT%H:%M:%S")
        except ValueError:
            return jsonify({"msg": "Invalid date_of_completion format. Use 'YYYY-MM-DDTHH:MM:SS'.", "status": "failure"}), 400
    
    if data.get("cost"):
        service_request.cost = data["cost"]

    # Commit the changes to the database
    db.session.commit()

    return jsonify({"msg": "Service request updated successfully", "status": "success"}), 200


# 5. Delete Service Request (DELETE)
@api.route("/req/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_service_request(id):
    # Fetch the service request by ID
    service_request = ServiceRequest.query.get(id)

    if not service_request:
        return jsonify({"msg": "Service request not found", "status": "failure"}), 404

    # Delete the service request
    db.session.delete(service_request)
    db.session.commit()

    return jsonify({"msg": "Service request deleted successfully", "status": "success"}), 200
