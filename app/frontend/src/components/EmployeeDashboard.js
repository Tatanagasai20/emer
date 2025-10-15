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
            <NavItem icon={Clock} label="Attendance" active={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')} />
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
      <AttendanceHistoryView user={user} />
    </div>
  );
}

function AttendanceHistoryView({ user }) {
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendanceHistory();
  }, []);

  const fetchAttendanceHistory = async () => {
    try {
      const response = await attendanceAPI.getMyHistory();
      setAttendanceHistory(response.data.attendance || []);
    } catch (error) {
      console.error('Failed to fetch attendance history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-blue-600 mr-2" />
            <p className="text-blue-800 text-sm">
              Check-in and check-out are managed by HR. You can view your attendance history below.
            </p>
          </div>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance History</h3>
      
      {attendanceHistory.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No attendance records found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Hours</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendanceHistory.map((record) => (
                <tr key={record.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(record.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.check_in_time ? new Date(record.check_in_time).toLocaleTimeString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.check_out_time ? new Date(record.check_out_time).toLocaleTimeString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.total_hours ? `${record.total_hours}h` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function LeavesTab() {
  const [activeLeaveTab, setActiveLeaveTab] = useState('apply');
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    leave_type: 'sick',
    start_date: '',
    end_date: '',
    reason: ''
  });

  useEffect(() => {
    if (activeLeaveTab === 'history') {
      fetchMyLeaves();
    }
  }, [activeLeaveTab]);

  const fetchMyLeaves = async () => {
    setLoading(true);
    try {
      const response = await leaveAPI.getMyLeaves();
      setLeaves(response.data.leaves || []);
    } catch (error) {
      console.error('Failed to fetch leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await leaveAPI.apply(formData);
      alert('Leave application submitted successfully!');
      setFormData({ leave_type: 'sick', start_date: '', end_date: '', reason: '' });
      if (activeLeaveTab === 'history') {
        fetchMyLeaves();
      }
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to apply for leave');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Leave Management</h2>
      
      <div className="bg-white rounded-xl shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveLeaveTab('apply')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeLeaveTab === 'apply'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Apply Leave
            </button>
            <button
              onClick={() => setActiveLeaveTab('history')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeLeaveTab === 'history'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Leave History
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeLeaveTab === 'apply' ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Leave Type</label>
                <select
                  value={formData.leave_type}
                  onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="sick">Sick Leave</option>
                  <option value="casual">Casual Leave</option>
                  <option value="earned">Earned Leave</option>
                  <option value="maternity">Maternity Leave</option>
                  <option value="paternity">Paternity Leave</option>
                  <option value="emergency">Emergency Leave</option>
                  <option value="wfh">Work From Home</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Please provide a reason for your leave request..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-medium disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Leave Application'}
              </button>
            </form>
          ) : (
            <div>
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
              ) : leaves.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No leave applications found.</p>
              ) : (
                <div className="space-y-4">
                  {leaves.map((leave) => (
                    <div key={leave.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900 capitalize">
                            {leave.leave_type.replace('_', ' ')} Leave
                          </h4>
                          <p className="text-sm text-gray-600">
                            {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(leave.status)}`}>
                          {leave.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{leave.reason}</p>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{leave.days_count} day(s)</span>
                        <span>Applied on {new Date(leave.applied_on).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function HolidaysTab() {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchHolidays();
  }, [selectedYear]);

  const fetchHolidays = async () => {
    try {
      const response = await holidayAPI.getAll(selectedYear);
      setHolidays(response.data.holidays || []);
    } catch (error) {
      console.error('Failed to fetch holidays:', error);
    } finally {
      setLoading(false);
    }
  };

  const isUpcoming = (date) => {
    const holidayDate = new Date(date);
    const today = new Date();
    return holidayDate >= today;
  };

  const upcomingHolidays = holidays.filter(holiday => isUpcoming(holiday.date));
  const pastHolidays = holidays.filter(holiday => !isUpcoming(holiday.date));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Company Holidays</h2>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          {[2023, 2024, 2025, 2026].map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-green-600" />
              Upcoming Holidays
            </h3>
            {upcomingHolidays.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No upcoming holidays.</p>
            ) : (
              <div className="space-y-3">
                {upcomingHolidays.map((holiday) => (
                  <div key={holiday.id} className="border-l-4 border-green-500 pl-4 py-2">
                    <h4 className="font-medium text-gray-900">{holiday.name}</h4>
                    <p className="text-sm text-gray-600">{new Date(holiday.date).toLocaleDateString()}</p>
                    {holiday.description && (
                      <p className="text-sm text-gray-500 mt-1">{holiday.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-gray-600" />
              Past Holidays
            </h3>
            {pastHolidays.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No past holidays.</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {pastHolidays.map((holiday) => (
                  <div key={holiday.id} className="border-l-4 border-gray-300 pl-4 py-2">
                    <h4 className="font-medium text-gray-700">{holiday.name}</h4>
                    <p className="text-sm text-gray-500">{new Date(holiday.date).toLocaleDateString()}</p>
                    {holiday.description && (
                      <p className="text-sm text-gray-400 mt-1">{holiday.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
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
