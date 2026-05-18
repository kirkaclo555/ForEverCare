import { useState, useEffect } from 'react';

export interface Appointment {
  id: string;
  owner: string;
  contact: string;
  pet: string;
  species: string;
  breed: string;
  date: string;
  time: string;
  type: string;
  purpose: string;
  status: string;
  sessionCode?: string;
  referenceNumber?: string;
  amountPaid?: number;
  receiptImage?: string;
}

const generateSessionCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'FC-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const DEFAULT_TIME_SLOTS = [
  "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"
];

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [timeSlotsData, setTimeSlotsData] = useState<Record<string, { time: string, enabled: boolean }[]>>({});

  const fetchAppointments = async () => {
    try {
      const res = await fetch('/api/appointments');
      const data = await res.json();
      if (data && Array.isArray(data)) {
        setAppointments(data);
      }
    } catch (err) {
      console.error('Failed to fetch appointments from API:', err);
    }
  };

  useEffect(() => {
    fetchAppointments();

    const savedSlots = localStorage.getItem('furever_time_slots');
    if (savedSlots) {
      try {
        setTimeSlotsData(JSON.parse(savedSlots));
      } catch (e) {
        setTimeSlotsData({});
      }
    }

    // Fetch timeslots from API to get the latest synced data
    fetch('/api/timeslots')
      .then(res => res.json())
      .then(data => {
        if (data && typeof data === 'object' && !data.error) {
          setTimeSlotsData(data);
          localStorage.setItem('furever_time_slots', JSON.stringify(data));
        }
      })
      .catch(err => console.error('Failed to fetch timeslots from API:', err));
    
    const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'furever_time_slots') {
            const savedSlots = localStorage.getItem('furever_time_slots');
            if (savedSlots) setTimeSlotsData(JSON.parse(savedSlots));
        }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const saveTimeSlotsData = (newData: Record<string, { time: string, enabled: boolean }[]>) => {
    setTimeSlotsData(newData);
    localStorage.setItem('furever_time_slots', JSON.stringify(newData));

    // Sync to centralized API
    fetch('/api/timeslots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newData)
    }).catch(err => console.error('Failed to sync timeslots to API:', err));
  };

  const toggleTimeSlot = (dateKey: string, timeIndex: number) => {
    const currentSlots = timeSlotsData[dateKey] || DEFAULT_TIME_SLOTS.map(t => ({ time: t, enabled: true }));
    const newSlots = currentSlots.map((slot, idx) => 
      idx === timeIndex ? { ...slot, enabled: !slot.enabled } : slot
    );
    saveTimeSlotsData({ ...timeSlotsData, [dateKey]: newSlots });
  };

  const initTimeSlotsForDate = (dateKey: string) => {
    if (!timeSlotsData[dateKey]) {
      saveTimeSlotsData({
        ...timeSlotsData,
        [dateKey]: DEFAULT_TIME_SLOTS.map(time => ({ time, enabled: true }))
      });
    }
  };

  const addAppointment = async (appointmentData: any) => {
    const sessionCode = appointmentData.type === 'telemedicine' ? generateSessionCode() : undefined;
    const payload = { ...appointmentData, sessionCode };
    
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success && data.appointment) {
        setAppointments(prev => [data.appointment, ...prev]);
        return data.appointment;
      }
    } catch (err) {
      console.error('Failed to add appointment:', err);
    }
    return null;
  };

  const updateAppointmentStatus = async (id: string, newStatus: string) => {
    let sessionCode;
    const targetApp = appointments.find(app => app.id === id);
    if (targetApp && newStatus === 'confirmed' && targetApp.type === 'telemedicine' && !targetApp.sessionCode) {
      sessionCode = generateSessionCode();
    }

    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, sessionCode })
      });
      const data = await res.json();
      if (data.success && data.appointment) {
        setAppointments(prev => prev.map(app => app.id === id ? data.appointment : app));
        return data.appointment;
      }
    } catch (err) {
      console.error('Failed to update appointment status:', err);
    }
    return null;
  };

  const updateAppointmentDetails = async (id: string, updates: Partial<Appointment>) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (data.success && data.appointment) {
        setAppointments(prev => prev.map(app => app.id === id ? data.appointment : app));
        return data.appointment;
      }
    } catch (err) {
      console.error('Failed to update appointment details:', err);
    }
    return null;
  };

  const deleteAppointment = async (id: string) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setAppointments(prev => prev.filter(app => app.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete appointment:', err);
    }
  };

  const getAvailableTimeSlots = (date: string) => {
    const bookedSlots = appointments.filter(app => app.date === date && app.status.toLowerCase() !== 'cancelled').map(app => app.time);
    const daySlots = timeSlotsData[date] || DEFAULT_TIME_SLOTS.map(time => ({ time, enabled: true }));
    return daySlots.map(slot => ({
      time: slot.time,
      enabled: slot.enabled,
      available: slot.enabled && !bookedSlots.includes(slot.time)
    }));
  };

  return {
    appointments,
    addAppointment,
    updateAppointmentStatus,
    updateAppointmentDetails,
    deleteAppointment,
    getAvailableTimeSlots,
    timeSlotsData,
    toggleTimeSlot,
    initTimeSlotsForDate
  };
}
