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

const DEFAULT_APPOINTMENTS: Appointment[] = [];

export const DEFAULT_TIME_SLOTS = [
  "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"
];

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [timeSlotsData, setTimeSlotsData] = useState<Record<string, { time: string, enabled: boolean }[]>>({});

  useEffect(() => {
    const saved = localStorage.getItem('furever_appointments');
    if (saved) {
      try {
        setAppointments(JSON.parse(saved));
      } catch (e) {
        setAppointments(DEFAULT_APPOINTMENTS);
      }
    } else {
      setAppointments(DEFAULT_APPOINTMENTS);
      localStorage.setItem('furever_appointments', JSON.stringify(DEFAULT_APPOINTMENTS));
    }

    // Fetch from API to get the latest synced data
    fetch('/api/appointments')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data)) {
          setAppointments(data);
          localStorage.setItem('furever_appointments', JSON.stringify(data));
        }
      })
      .catch(err => console.error('Failed to fetch appointments from API:', err));

    const savedSlots = localStorage.getItem('furever_time_slots');
    if (savedSlots) {
      try {
        setTimeSlotsData(JSON.parse(savedSlots));
      } catch (e) {
        setTimeSlotsData({});
      }
    } else {
      setTimeSlotsData({});
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
        if (e.key === 'furever_appointments') {
            const saved = localStorage.getItem('furever_appointments');
            if (saved) setAppointments(JSON.parse(saved));
        }
        if (e.key === 'furever_time_slots') {
            const savedSlots = localStorage.getItem('furever_time_slots');
            if (savedSlots) setTimeSlotsData(JSON.parse(savedSlots));
        }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const saveAppointments = (newAppointments: Appointment[]) => {
    setAppointments(newAppointments);
    localStorage.setItem('furever_appointments', JSON.stringify(newAppointments));
    
    // Sync to centralized API
    fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAppointments)
    }).catch(err => console.error('Failed to sync to API:', err));
  };

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

  const addAppointment = (appointmentData: Omit<Appointment, 'id' | 'sessionCode'>) => {
    const newId = Date.now().toString();
    const sessionCode = appointmentData.type === 'telemedicine' ? generateSessionCode() : undefined;
    const newApp = { ...appointmentData, id: newId, sessionCode };
    saveAppointments([...appointments, newApp]);
    return newApp;
  };

  const updateAppointmentStatus = (id: string, newStatus: string) => {
    let updatedApp: Appointment | undefined;
    const newAppointments = appointments.map(app => {
      if (app.id === id) {
        let sessionCode = app.sessionCode;
        if (newStatus === 'confirmed' && app.type === 'telemedicine' && !sessionCode) {
          sessionCode = generateSessionCode();
        }
        updatedApp = { ...app, status: newStatus, sessionCode };
        return updatedApp;
      }
      return app;
    });
    saveAppointments(newAppointments);
    return updatedApp;
  };

  const updateAppointmentDetails = (id: string, updates: Partial<Appointment>) => {
    saveAppointments(appointments.map(app => app.id === id ? { ...app, ...updates } : app));
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
    getAvailableTimeSlots,
    timeSlotsData,
    toggleTimeSlot,
    initTimeSlotsForDate
  };
}
