from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from datetime import datetime


db = SQLAlchemy()
bcrypt = Bcrypt()

class Admin(db.Model):
    __tablename__ = 'admins'

    # id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), primary_key=True)
    password = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(16), nullable=False)

    def __repr__(self):
        return f'<Admin {self.username}, Role: {self.role}>'
    
    
class Customer(db.Model):
    __tablename__ = 'customers'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    full_name = db.Column(db.String(150), nullable=False)
    address = db.Column(db.String(255), nullable=False)
    pincode = db.Column(db.String(20), nullable=False)
    is_blocked = db.Column(db.Boolean, default=True, nullable=False)
    
    service_requests = db.relationship('ServiceRequest', backref='customer', lazy=True)

    def __repr__(self):
        return f"<Customer {self.full_name}>"
    
class Professional(db.Model):
    __tablename__ = 'professionals'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    service_name = db.Column(db.String(100), nullable=False)
    service_desc = db.Column(db.String(250), nullable=False)
    time_req = db.Column(db.String(50), nullable=False)
    cost = db.Column(db.Float, nullable=False)  # Price of the service
    experience = db.Column(db.Integer, nullable=False)  
    document = db.Column(db.String(255), nullable=True)  # URL for the document
    address = db.Column(db.String(255), nullable=False)
    pincode = db.Column(db.String(10), nullable=False)
    rating = db.Column(db.Float, default=0.0, nullable=True)
    is_blocked = db.Column(db.Boolean, default=True, nullable=False)
    # Backreference to service requests
    service_requests = db.relationship('ServiceRequest', backref='professional', lazy=True)

    def __repr__(self):
        return f"<Professional('{self.id}', '{self.service_name}'>"

class Service(db.Model):
    __tablename__ = 'services'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)  # Name of the service
    price = db.Column(db.Float, nullable=False)  # Price of the service
    time_required = db.Column(db.String(50), nullable=False)  # Time required for the service (e.g., "2 hours")
    description = db.Column(db.Text, nullable=True)  # Description of the service
    rating = db.Column(db.Float, default=0.0, nullable=True)
    cat = db.Column(db.String(50))
    
    professional_id = db.Column(db.Integer, db.ForeignKey('professionals.id'), nullable=True)  # Optional assignment

    # Backreference to service requests
    service_requests = db.relationship('ServiceRequest', backref='service', lazy=True)

    def __repr__(self):
        return f"Service('{self.name}', Price: {self.price})"
    
class ServiceRequest(db.Model):
    __tablename__ = 'service_requests'

    id = db.Column(db.Integer, primary_key=True)
    service_id = db.Column(db.Integer, db.ForeignKey('services.id'), nullable=False)  # Foreign key to Services
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=False)  # Foreign key to Customer
    professional_id = db.Column(db.Integer, db.ForeignKey('professionals.id'), nullable=True)  # Optional assignment
    date_of_request = db.Column(db.DateTime, default=datetime.utcnow)  # When the request was created
    date_of_completion = db.Column(db.DateTime, nullable=True)  # When the service was completed
    service_status = db.Column(db.String(20), nullable=False)  # e.g., requested/assigned/closed
    remarks = db.Column(db.Text, nullable=True)  # Additional remarks or comments
    location = db.Column(db.String(255), nullable=True)  # Location where the service is needed
    preferred_date = db.Column(db.DateTime, nullable=True)  # Preferred date for the service
    urgency_level = db.Column(db.String(20), nullable=True)  # e.g., low/medium/high
    created_at = db.Column(db.DateTime, default=datetime.utcnow)  # Timestamp of request creation
    updated_at = db.Column(db.DateTime, onupdate=datetime.utcnow)  # Timestamp of last update
    rating = db.Column(db.Float,default=0.0, nullable=True)
    cost = db.Column(db.Float, nullable=False)  # Price of the service

    def __repr__(self):
        return f'<ServiceRequest {self.id} - Status: {self.service_status} - service_id {self.service_id} - customer_id {self.customer_id} - professional_id {self.professional_id}>'