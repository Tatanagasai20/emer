import React, { useState, useEffect } from 'react';
import { 
  Home, Camera, Calendar, FileText, User, LogOut, Clock, 
  CheckCircle, XCircle, AlertCircle, ChevronDown, Eye 
} from 'lucide-react';
import Webcam from 'react-webcam';
import { attendanceAPI, leaveAPI, holidayAPI, authAPI } from '../api';

const LOGO_URL = 'https://customer-assets.emergentagent.com/job_64ea9c06-2fba-4fbc-94f8-49d919fc1e30/artifacts/vzx54xiv_Screenshot%202025-10-15%20at%2010.28.55%E2%80%AFAM.png';

function EmployeeDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('home');
  const [todayAttendance, setTodayAttendance] = useState(null);

  useEffect(() => {
    fetchTodayAttendance();
  }, []);

  const fetchTodayAttendance = async () => {
    try {
      const response = await attendanceAPI.getToday();
      setTodayAttendance(response.data);
    } catch (error) {
      console.error('Failed to fetch today attendance:', error);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeTab user={user} todayAttendance={todayAttendance} fetchTodayAttendance={fetchTodayAttendance} />;
      case 'attendance':
        return <AttendanceTab user={user} todayAttendance={todayAttendance} fetchTodayAttendance={fetchTodayAttendance} />;
      case 'leaves':
        return <LeavesTab user={user} />;
      case 'holidays':
        return <HolidaysTab />;
      case 'profile':
        return <ProfileTab user={user} />;
      default:
        return <HomeTab user={user} todayAttendance={todayAttendance} fetchTodayAttendance={fetchTodayAttendance} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={LOGO_URL} alt="Priacc Innovations" className="h-12" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Employee Portal</h1>
              <p className="text-sm text-gray-600">Welcome, {user.full_name}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            data-testid="logout-button"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </header>

      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <NavItem icon={Home} label="Home" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
            <NavItem icon={Camera} label="Attendance" active={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')} />
            <NavItem icon={Calendar} label="Leaves" active={activeTab === 'leaves'} onClick={() => setActiveTab('leaves')} />
            <NavItem icon={FileText} label="Holidays" active={activeTab === 'holidays'} onClick={() => setActiveTab('holidays')} />
            <NavItem icon={User} label="Profile" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
    </div>
  );
}

function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
        active
          ? 'border-primary-600 text-primary-600'
          : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
      }`}
      data-testid={`nav-${label.toLowerCase()}`}
    >
      <Icon className="w-5 h-5" />
      {label}
    </button>
  );
}

function HomeTab({ user, todayAttendance }) {
  const isCheckedIn = todayAttendance?.status === 'checked_in' && todayAttendance?.attendance?.check_in_time;
  const isCheckedOut = todayAttendance?.attendance?.check_out_time;

  return (
    <div className="space-y-6" data-testid="home-tab">
      <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
      
      <div className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-xl shadow-lg p-8 text-white">
        <h3 className="text-2xl font-bold mb-4">Today Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-primary-100 text-sm">Check-In</p>
            <p className="text-2xl font-bold" data-testid="home-checkin-status">
              {isCheckedIn ? new Date(todayAttendance.attendance.check_in_time).toLocaleTimeString() : 'Not checked in'}
            </p>
          </div>
          <div>
            <p className="text-primary-100 text-sm">Check-Out</p>
            <p className="text-2xl font-bold" data-testid="home-checkout-status">
              {isCheckedOut ? new Date(todayAttendance.attendance.check_out_time).toLocaleTimeString() : 'Not checked out'}
            </p>
          </div>
          <div>
            <p className="text-primary-100 text-sm">Total Hours</p>
            <p className="text-2xl font-bold" data-testid="home-total-hours">
              {todayAttendance?.attendance?.total_hours ? `${todayAttendance.attendance.total_hours}h` : '-'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee Info</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Employee ID:</span>
            <span className="font-medium" data-testid="employee-id">{user.employee_id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Email:</span>
            <span className="font-medium" data-testid="employee-email">{user.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Domain:</span>
            <span className="font-medium" data-testid="employee-domain">{user.domain || 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function AttendanceTab({ user, todayAttendance, fetchTodayAttendance }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Attendance</h2>
      <CheckInView todayAttendance={todayAttendance} fetchTodayAttendance={fetchTodayAttendance} />
    </div>
  );
}

function CheckInView({ todayAttendance, fetchTodayAttendance }) {
  const webcamRef = React.useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isAlreadyCheckedIn = todayAttendance?.status === 'checked_in';

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
  };

  const handleCheckIn = async () => {
    if (!capturedImage) {
      setError('Please capture your photo first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const base64Data = capturedImage.split(',')[1];
      await attendanceAPI.checkIn({ photo_base64: base64Data });
      setSuccess('Checked in successfully!');
      setCapturedImage(null);
      setTimeout(() => fetchTodayAttendance(), 1500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to check in');
    } finally {
      setLoading(false);
    }
  };

  if (isAlreadyCheckedIn) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-green-900">Already Checked In</h3>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-6 space-y-6">
      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">{error}</div>}
      {success && <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">{success}</div>}

      <div className="space-y-4">
        {!capturedImage ? (
          <div className="webcam-container">
            <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" className="w-full rounded-lg" />
          </div>
        ) : (
          <img src={capturedImage} alt="Captured" className="w-full rounded-lg" />
        )}

        <div className="flex gap-4">
          {!capturedImage ? (
            <button onClick={capture} className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-medium">
              Capture Photo
            </button>
          ) : (
            <>
              <button onClick={() => setCapturedImage(null)} className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg">
                Retake
              </button>
              <button onClick={handleCheckIn} disabled={loading} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg disabled:opacity-50">
                {loading ? 'Checking in...' : 'Confirm Check In'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function LeavesTab() {
  return <div className="bg-white rounded-xl shadow p-6"><h3 className="text-xl font-semibold">Leaves Management</h3></div>;
}

function HolidaysTab() {
  return <div className="bg-white rounded-xl shadow p-6"><h3 className="text-xl font-semibold">Company Holidays</h3></div>;
}

function ProfileTab({ user }) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
          <p className="text-gray-900 font-medium">{user.full_name}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Employee ID</label>
          <p className="text-gray-900 font-medium">{user.employee_id}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
          <p className="text-gray-900 font-medium">{user.email}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Domain</label>
          <p className="text-gray-900 font-medium">{user.domain || 'N/A'}</p>
        </div>
      </div>
    </div>
  );
}

export default EmployeeDashboard;
