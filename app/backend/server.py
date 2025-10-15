from fastapi import FastAPI, HTTPException, Depends, status, UploadFile, File, Body
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta, date
from jose import JWTError, jwt
from passlib.context import CryptContext
from pymongo import MongoClient
import os
from dotenv import load_dotenv
import uuid
import base64
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import random
import boto3
from botocore.exceptions import ClientError
import io

load_dotenv()

# Configuration
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017/")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-this")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

# SMTP Configuration
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL", "noreply@priacc.com")

# AWS S3 Configuration
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID", "")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY", "")
AWS_S3_BUCKET_NAME = os.getenv("AWS_S3_BUCKET_NAME", "priacc-attendance-photos")
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")

# Initialize FastAPI
app = FastAPI(title="Priacc Innovations Attendance Portal")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database
client = MongoClient(MONGO_URL)
db = client["priacc_attendance"]

# Collections
users_collection = db["users"]
attendance_collection = db["attendance"]
leaves_collection = db["leaves"]
holidays_collection = db["holidays"]
otp_collection = db["otp_tokens"]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# Initialize S3 client (if credentials are provided)
s3_client = None
if AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY:
    try:
        s3_client = boto3.client(
            's3',
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
            region_name=AWS_REGION
        )
    except Exception as e:
        print(f"Failed to initialize S3 client: {e}")

# Domains
DOMAINS = ["SAP", "DevOps", "Java", "Python", "Data Science", "Testing", "PowerBI"]

# ==================== Models ====================

class UserBase(BaseModel):
    email: EmailStr
    employee_id: str
    full_name: str
    role: str = "employee"  # employee or hr_admin
    domain: Optional[str] = None
    date_of_birth: Optional[str] = None
    joining_date: Optional[str] = None
    address: Optional[str] = None
    hierarchy_level: Optional[str] = None
    manager: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    domain: Optional[str] = None
    date_of_birth: Optional[str] = None
    address: Optional[str] = None
    hierarchy_level: Optional[str] = None
    manager: Optional[str] = None

class UserResponse(UserBase):
    id: str
    created_at: str
    is_active: bool

class PasswordChange(BaseModel):
    old_password: str
    new_password: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str

class AttendanceCheckIn(BaseModel):
    photo_base64: str

class AttendanceCheckOut(BaseModel):
    photo_base64: str

class AttendanceResponse(BaseModel):
    id: str
    employee_id: str
    employee_name: str
    check_in_time: str
    check_out_time: Optional[str] = None
    check_in_photo_url: str
    check_out_photo_url: Optional[str] = None
    date: str
    total_hours: Optional[float] = None

class LeaveRequest(BaseModel):
    leave_type: str  # sick, casual, earned, wfh, maternity, paternity, emergency
    start_date: str
    end_date: str
    reason: str

class LeaveResponse(BaseModel):
    id: str
    employee_id: str
    employee_name: str
    leave_type: str
    start_date: str
    end_date: str
    reason: str
    status: str  # pending, approved, rejected
    applied_on: str
    days_count: int

class HolidayCreate(BaseModel):
    name: str
    date: str
    description: Optional[str] = None

class HolidayResponse(BaseModel):
    id: str
    name: str
    date: str
    description: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

# ==================== Helper Functions ====================

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = users_collection.find_one({"email": email})
    if user is None:
        raise credentials_exception
    return user

async def get_current_hr_admin(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "hr_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to perform this action"
        )
    return current_user

def upload_to_s3(image_base64: str, file_name: str) -> str:
    """Upload image to S3 and return URL. Falls back to base64 storage if S3 not configured."""
    if not s3_client:
        # If S3 not configured, return base64 (for testing)
        return f"data:image/jpeg;base64,{image_base64}"
    
    try:
        # Decode base64 image
        image_data = base64.b64decode(image_base64)
        
        # Upload to S3
        s3_client.put_object(
            Bucket=AWS_S3_BUCKET_NAME,
            Key=file_name,
            Body=image_data,
            ContentType='image/jpeg'
        )
        
        # Generate URL
        url = f"https://{AWS_S3_BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/{file_name}"
        return url
    except Exception as e:
        print(f"S3 upload error: {e}")
        # Fallback to base64
        return f"data:image/jpeg;base64,{image_base64}"

def send_email(to_email: str, subject: str, body: str):
    """Send email using SMTP. Returns True if successful."""
    if not SMTP_USER or not SMTP_PASSWORD:
        print(f"SMTP not configured. Would send email to {to_email}: {subject}")
        return False
    
    try:
        msg = MIMEMultipart()
        msg['From'] = SMTP_FROM_EMAIL
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'html'))
        
        server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"Email send error: {e}")
        return False

# ==================== Initialize Database ====================

def initialize_db():
    """Initialize database with default admin and domains."""
    # Create default HR admin if not exists
    if users_collection.count_documents({"email": "admin@priacc.com"}) == 0:
        admin_user = {
            "id": str(uuid.uuid4()),
            "email": "admin@priacc.com",
            "employee_id": "HR001",
            "full_name": "HR Administrator",
            "password": get_password_hash("Admin@123"),
            "role": "hr_admin",
            "domain": "HR",
            "date_of_birth": "1990-01-01",
            "joining_date": "2020-01-01",
            "address": "Priacc Innovations HQ",
            "hierarchy_level": "Administrator",
            "manager": None,
            "is_active": True,
            "created_at": datetime.now().isoformat()
        }
        users_collection.insert_one(admin_user)
        print("Default HR admin created: admin@priacc.com / Admin@123")
    
    # Create indexes
    users_collection.create_index("email", unique=True)
    users_collection.create_index("employee_id", unique=True)
    attendance_collection.create_index([("employee_id", 1), ("date", 1)])
    leaves_collection.create_index("employee_id")
    holidays_collection.create_index("date")

# Initialize on startup
@app.on_event("startup")
async def startup_event():
    initialize_db()

# ==================== Authentication APIs ====================

@app.post("/api/auth/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """Login with email/employee_id and password."""
    # Try to find user by email or employee_id
    user = users_collection.find_one({
        "$or": [
            {"email": form_data.username},
            {"employee_id": form_data.username}
        ]
    })
    
    if not user or not verify_password(form_data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive"
        )
    
    access_token = create_access_token(data={"sub": user["email"]})
    
    # Remove password from response
    user.pop("password", None)
    user.pop("_id", None)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@app.get("/api/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current user details."""
    current_user.pop("password", None)
    current_user.pop("_id", None)
    return current_user

@app.post("/api/auth/change-password")
async def change_password(
    password_data: PasswordChange,
    current_user: dict = Depends(get_current_user)
):
    """Change password for logged-in user."""
    if not verify_password(password_data.old_password, current_user["password"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect old password"
        )
    
    new_hashed_password = get_password_hash(password_data.new_password)
    users_collection.update_one(
        {"email": current_user["email"]},
        {"$set": {"password": new_hashed_password}}
    )
    
    return {"message": "Password changed successfully"}

@app.post("/api/auth/forgot-password")
async def forgot_password(request: ForgotPasswordRequest):
    """Send OTP to email for password reset."""
    user = users_collection.find_one({"email": request.email})
    if not user:
        # Don't reveal if email exists
        return {"message": "If email exists, OTP has been sent"}
    
    # Generate 6-digit OTP
    otp = str(random.randint(100000, 999999))
    
    # Store OTP with expiry (10 minutes)
    otp_data = {
        "email": request.email,
        "otp": otp,
        "created_at": datetime.now().isoformat(),
        "expires_at": (datetime.now() + timedelta(minutes=10)).isoformat()
    }
    otp_collection.delete_many({"email": request.email})  # Remove old OTPs
    otp_collection.insert_one(otp_data)
    
    # Send email
    subject = "Password Reset OTP - Priacc Innovations"
    body = f"""
    <html>
    <body>
        <h2>Password Reset Request</h2>
        <p>Your OTP for password reset is: <strong>{otp}</strong></p>
        <p>This OTP is valid for 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <br>
        <p>Regards,<br>Priacc Innovations Team</p>
    </body>
    </html>
    """
    
    send_email(request.email, subject, body)
    
    return {"message": "If email exists, OTP has been sent", "otp": otp}  # Remove otp in production

@app.post("/api/auth/reset-password")
async def reset_password(request: ResetPasswordRequest):
    """Reset password using OTP."""
    # Verify OTP
    otp_data = otp_collection.find_one({"email": request.email, "otp": request.otp})
    
    if not otp_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP"
        )
    
    # Check if OTP expired
    if datetime.now() > datetime.fromisoformat(otp_data["expires_at"]):
        otp_collection.delete_one({"_id": otp_data["_id"]})
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP expired"
        )
    
    # Update password
    new_hashed_password = get_password_hash(request.new_password)
    users_collection.update_one(
        {"email": request.email},
        {"$set": {"password": new_hashed_password}}
    )
    
    # Delete used OTP
    otp_collection.delete_one({"_id": otp_data["_id"]})
    
    return {"message": "Password reset successfully"}

# ==================== Employee Management APIs (HR Admin) ====================

@app.post("/api/employees", response_model=UserResponse)
async def create_employee(
    employee: UserCreate,
    current_user: dict = Depends(get_current_hr_admin)
):
    """Create new employee (HR Admin only)."""
    # Check if email or employee_id already exists
    if users_collection.find_one({"$or": [{"email": employee.email}, {"employee_id": employee.employee_id}]}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email or Employee ID already exists"
        )
    
    employee_data = employee.dict()
    employee_data["id"] = str(uuid.uuid4())
    employee_data["password"] = get_password_hash(employee.password)
    employee_data["is_active"] = True
    employee_data["created_at"] = datetime.now().isoformat()
    
    users_collection.insert_one(employee_data)
    
    # Send welcome email
    subject = "Welcome to Priacc Innovations"
    body = f"""
    <html>
    <body>
        <h2>Welcome {employee.full_name}!</h2>
        <p>Your account has been created successfully.</p>
        <p><strong>Employee ID:</strong> {employee.employee_id}</p>
        <p><strong>Email:</strong> {employee.email}</p>
        <p><strong>Temporary Password:</strong> {employee.password}</p>
        <p>Please change your password after first login.</p>
        <br>
        <p>Regards,<br>Priacc Innovations HR Team</p>
    </body>
    </html>
    """
    send_email(employee.email, subject, body)
    
    employee_data.pop("password")
    employee_data.pop("_id")
    return employee_data

@app.get("/api/employees", response_model=List[UserResponse])
async def get_all_employees(
    domain: Optional[str] = None,
    current_user: dict = Depends(get_current_hr_admin)
):
    """Get all employees (HR Admin only)."""
    query = {}
    if domain:
        query["domain"] = domain
    
    employees = list(users_collection.find(query))
    for emp in employees:
        emp.pop("password", None)
        emp.pop("_id", None)
    
    return employees

@app.get("/api/employees/{employee_id}", response_model=UserResponse)
async def get_employee(
    employee_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get employee details."""
    # HR can view anyone, employees can only view themselves
    if current_user["role"] != "hr_admin" and current_user["employee_id"] != employee_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    employee = users_collection.find_one({"employee_id": employee_id})
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )
    
    employee.pop("password", None)
    employee.pop("_id", None)
    return employee

@app.put("/api/employees/{employee_id}")
async def update_employee(
    employee_id: str,
    employee_update: UserUpdate,
    current_user: dict = Depends(get_current_hr_admin)
):
    """Update employee details (HR Admin only)."""
    update_data = {k: v for k, v in employee_update.dict().items() if v is not None}
    
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No data to update"
        )
    
    result = users_collection.update_one(
        {"employee_id": employee_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )
    
    return {"message": "Employee updated successfully"}

@app.delete("/api/employees/{employee_id}")
async def delete_employee(
    employee_id: str,
    current_user: dict = Depends(get_current_hr_admin)
):
    """Delete employee (HR Admin only)."""
    result = users_collection.update_one(
        {"employee_id": employee_id},
        {"$set": {"is_active": False}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )
    
    return {"message": "Employee deactivated successfully"}

@app.get("/api/domains")
async def get_domains(current_user: dict = Depends(get_current_user)):
    """Get list of domains."""
    return {"domains": DOMAINS}

# ==================== Attendance APIs ====================

@app.post("/api/attendance/check-in")
async def check_in(
    check_in_data: AttendanceCheckIn,
    current_user: dict = Depends(get_current_user)
):
    """Check in with photo."""
    today = date.today().isoformat()
    
    # Check if already checked in today
    existing = attendance_collection.find_one({
        "employee_id": current_user["employee_id"],
        "date": today
    })
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already checked in today"
        )
    
    # Upload photo to S3
    file_name = f"checkin/{current_user['employee_id']}/{today}_{uuid.uuid4()}.jpg"
    photo_url = upload_to_s3(check_in_data.photo_base64, file_name)
    
    # Create attendance record
    attendance_data = {
        "id": str(uuid.uuid4()),
        "employee_id": current_user["employee_id"],
        "employee_name": current_user["full_name"],
        "check_in_time": datetime.now().isoformat(),
        "check_out_time": None,
        "check_in_photo_url": photo_url,
        "check_out_photo_url": None,
        "date": today,
        "total_hours": None
    }
    
    attendance_collection.insert_one(attendance_data)
    attendance_data.pop("_id")
    
    return {"message": "Checked in successfully", "attendance": attendance_data}

@app.post("/api/attendance/check-out")
async def check_out(
    check_out_data: AttendanceCheckOut,
    current_user: dict = Depends(get_current_user)
):
    """Check out with photo."""
    today = date.today().isoformat()
    
    # Find today's attendance
    attendance = attendance_collection.find_one({
        "employee_id": current_user["employee_id"],
        "date": today
    })
    
    if not attendance:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No check-in found for today"
        )
    
    if attendance.get("check_out_time"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already checked out today"
        )
    
    # Upload photo to S3
    file_name = f"checkout/{current_user['employee_id']}/{today}_{uuid.uuid4()}.jpg"
    photo_url = upload_to_s3(check_out_data.photo_base64, file_name)
    
    # Calculate total hours
    check_in_time = datetime.fromisoformat(attendance["check_in_time"])
    check_out_time = datetime.now()
    total_hours = (check_out_time - check_in_time).total_seconds() / 3600
    
    # Update attendance
    attendance_collection.update_one(
        {"id": attendance["id"]},
        {"$set": {
            "check_out_time": check_out_time.isoformat(),
            "check_out_photo_url": photo_url,
            "total_hours": round(total_hours, 2)
        }}
    )
    
    return {"message": "Checked out successfully", "total_hours": round(total_hours, 2)}

@app.get("/api/attendance/my-history")
async def get_my_attendance_history(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get attendance history for logged-in employee."""
    query = {"employee_id": current_user["employee_id"]}
    
    if start_date and end_date:
        query["date"] = {"$gte": start_date, "$lte": end_date}
    
    attendance_records = list(attendance_collection.find(query).sort("date", -1))
    for record in attendance_records:
        record.pop("_id", None)
    
    return {"attendance": attendance_records}

@app.get("/api/attendance/today")
async def get_today_attendance(current_user: dict = Depends(get_current_user)):
    """Get today's attendance status."""
    today = date.today().isoformat()
    
    attendance = attendance_collection.find_one({
        "employee_id": current_user["employee_id"],
        "date": today
    })
    
    if attendance:
        attendance.pop("_id", None)
        return {"status": "checked_in", "attendance": attendance}
    
    return {"status": "not_checked_in", "attendance": None}

@app.get("/api/attendance/reports")
async def get_attendance_reports(
    start_date: str,
    end_date: str,
    domain: Optional[str] = None,
    employee_id: Optional[str] = None,
    current_user: dict = Depends(get_current_hr_admin)
):
    """Get attendance reports (HR Admin only)."""
    query = {
        "date": {"$gte": start_date, "$lte": end_date}
    }
    
    if domain:
        # Get employees in domain
        employees = list(users_collection.find({"domain": domain}, {"employee_id": 1}))
        employee_ids = [emp["employee_id"] for emp in employees]
        query["employee_id"] = {"$in": employee_ids}
    
    if employee_id:
        query["employee_id"] = employee_id
    
    attendance_records = list(attendance_collection.find(query).sort("date", -1))
    for record in attendance_records:
        record.pop("_id", None)
    
    return {"attendance": attendance_records, "count": len(attendance_records)}

# ==================== Leave Management APIs ====================

@app.post("/api/leaves/apply")
async def apply_leave(
    leave_request: LeaveRequest,
    current_user: dict = Depends(get_current_user)
):
    """Apply for leave."""
    # Calculate days
    start = datetime.strptime(leave_request.start_date, "%Y-%m-%d")
    end = datetime.strptime(leave_request.end_date, "%Y-%m-%d")
    days_count = (end - start).days + 1
    
    if days_count <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date range"
        )
    
    leave_data = {
        "id": str(uuid.uuid4()),
        "employee_id": current_user["employee_id"],
        "employee_name": current_user["full_name"],
        "leave_type": leave_request.leave_type,
        "start_date": leave_request.start_date,
        "end_date": leave_request.end_date,
        "reason": leave_request.reason,
        "status": "pending",
        "applied_on": datetime.now().isoformat(),
        "days_count": days_count
    }
    
    leaves_collection.insert_one(leave_data)
    leave_data.pop("_id")
    
    return {"message": "Leave applied successfully", "leave": leave_data}

@app.get("/api/leaves/my-leaves")
async def get_my_leaves(current_user: dict = Depends(get_current_user)):
    """Get leave history for logged-in employee."""
    leaves = list(leaves_collection.find({"employee_id": current_user["employee_id"]}).sort("applied_on", -1))
    for leave in leaves:
        leave.pop("_id", None)
    
    return {"leaves": leaves}

@app.get("/api/leaves/all")
async def get_all_leaves(
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_hr_admin)
):
    """Get all leave requests (HR Admin only)."""
    query = {}
    if status:
        query["status"] = status
    
    leaves = list(leaves_collection.find(query).sort("applied_on", -1))
    for leave in leaves:
        leave.pop("_id", None)
    
    return {"leaves": leaves}

@app.put("/api/leaves/{leave_id}/status")
async def update_leave_status(
    leave_id: str,
    status: str,
    current_user: dict = Depends(get_current_hr_admin)
):
    """Update leave status (HR Admin only)."""
    if status not in ["approved", "rejected"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid status"
        )
    
    leave = leaves_collection.find_one({"id": leave_id})
    if not leave:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Leave request not found"
        )
    
    leaves_collection.update_one(
        {"id": leave_id},
        {"$set": {"status": status}}
    )
    
    # Send notification email
    employee = users_collection.find_one({"employee_id": leave["employee_id"]})
    if employee:
        subject = f"Leave Request {status.capitalize()}"
        body = f"""
        <html>
        <body>
            <h2>Leave Request {status.capitalize()}</h2>
            <p>Your leave request from {leave['start_date']} to {leave['end_date']} has been {status}.</p>
            <p><strong>Leave Type:</strong> {leave['leave_type']}</p>
            <p><strong>Days:</strong> {leave['days_count']}</p>
            <br>
            <p>Regards,<br>Priacc Innovations HR Team</p>
        </body>
        </html>
        """
        send_email(employee["email"], subject, body)
    
    return {"message": f"Leave {status} successfully"}

# ==================== Holiday Management APIs ====================

@app.post("/api/holidays")
async def create_holiday(
    holiday: HolidayCreate,
    current_user: dict = Depends(get_current_hr_admin)
):
    """Create holiday (HR Admin only)."""
    holiday_data = holiday.dict()
    holiday_data["id"] = str(uuid.uuid4())
    
    holidays_collection.insert_one(holiday_data)
    holiday_data.pop("_id")
    
    return {"message": "Holiday created successfully", "holiday": holiday_data}

@app.get("/api/holidays")
async def get_holidays(
    year: Optional[int] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get holidays."""
    query = {}
    if year:
        query["date"] = {"$regex": f"^{year}"}
    
    holidays = list(holidays_collection.find(query).sort("date", 1))
    for holiday in holidays:
        holiday.pop("_id", None)
    
    return {"holidays": holidays}

@app.delete("/api/holidays/{holiday_id}")
async def delete_holiday(
    holiday_id: str,
    current_user: dict = Depends(get_current_hr_admin)
):
    """Delete holiday (HR Admin only)."""
    result = holidays_collection.delete_one({"id": holiday_id})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Holiday not found"
        )
    
    return {"message": "Holiday deleted successfully"}

# ==================== HR Attendance Management APIs ====================

@app.post("/api/hr/attendance/mark")
async def hr_mark_attendance(
    employee_id: str,
    action: str,  # check_in or check_out
    current_user: dict = Depends(get_current_hr_admin)
):
    """Mark attendance for employee (HR Admin only)."""
    if action not in ["check_in", "check_out"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid action. Must be 'check_in' or 'check_out'"
        )
    
    # Verify employee exists
    employee = users_collection.find_one({"employee_id": employee_id})
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )
    
    today = date.today().isoformat()
    
    if action == "check_in":
        # Check if already checked in today
        existing = attendance_collection.find_one({
            "employee_id": employee_id,
            "date": today
        })
        
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Employee already checked in today"
            )
        
        # Create attendance record
        attendance_data = {
            "id": str(uuid.uuid4()),
            "employee_id": employee_id,
            "employee_name": employee["full_name"],
            "check_in_time": datetime.now().isoformat(),
            "check_out_time": None,
            "check_in_photo_url": "hr_marked",
            "check_out_photo_url": None,
            "date": today,
            "total_hours": None
        }
        
        attendance_collection.insert_one(attendance_data)
        return {"message": f"Check-in marked for {employee['full_name']}", "attendance": attendance_data}
    
    else:  # check_out
        # Find today's attendance
        attendance = attendance_collection.find_one({
            "employee_id": employee_id,
            "date": today
        })
        
        if not attendance:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No check-in found for today"
            )
        
        if attendance.get("check_out_time"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Employee already checked out today"
            )
        
        # Calculate total hours
        check_in_time = datetime.fromisoformat(attendance["check_in_time"])
        check_out_time = datetime.now()
        total_hours = (check_out_time - check_in_time).total_seconds() / 3600
        
        # Update attendance
        attendance_collection.update_one(
            {"id": attendance["id"]},
            {"$set": {
                "check_out_time": check_out_time.isoformat(),
                "check_out_photo_url": "hr_marked",
                "total_hours": round(total_hours, 2)
            }}
        )
        
        return {"message": f"Check-out marked for {employee['full_name']}", "total_hours": round(total_hours, 2)}

@app.get("/api/hr/attendance/employee-status")
async def get_employee_attendance_status(
    current_user: dict = Depends(get_current_hr_admin)
):
    """Get attendance status for all employees today (HR Admin only)."""
    today = date.today().isoformat()
    
    # Get all active employees
    employees = list(users_collection.find({"role": "employee", "is_active": True}))
    
    # Get today's attendance
    attendance_records = list(attendance_collection.find({"date": today}))
    attendance_map = {record["employee_id"]: record for record in attendance_records}
    
    employee_status = []
    for emp in employees:
        attendance = attendance_map.get(emp["employee_id"])
        status = {
            "employee_id": emp["employee_id"],
            "employee_name": emp["full_name"],
            "domain": emp.get("domain"),
            "is_present": bool(attendance),
            "check_in_time": attendance.get("check_in_time") if attendance else None,
            "check_out_time": attendance.get("check_out_time") if attendance else None,
            "total_hours": attendance.get("total_hours") if attendance else None
        }
        employee_status.append(status)
    
    return {"date": today, "employees": employee_status}

# ==================== Dashboard Stats APIs ====================

@app.get("/api/dashboard/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_hr_admin)):
    """Get dashboard statistics (HR Admin only)."""
    total_employees = users_collection.count_documents({"role": "employee", "is_active": True})
    
    today = date.today().isoformat()
    present_today = attendance_collection.count_documents({"date": today})
    
    pending_leaves = leaves_collection.count_documents({"status": "pending"})
    
    # Get domain-wise count
    domain_counts = {}
    for domain in DOMAINS:
        count = users_collection.count_documents({"domain": domain, "is_active": True})
        domain_counts[domain] = count
    
    return {
        "total_employees": total_employees,
        "present_today": present_today,
        "absent_today": total_employees - present_today,
        "pending_leaves": pending_leaves,
        "domain_counts": domain_counts
    }

# ==================== Health Check ====================

@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "Priacc Attendance Portal"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
