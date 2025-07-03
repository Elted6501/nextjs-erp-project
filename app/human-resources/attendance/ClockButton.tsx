'use client';

import { useState, useEffect } from 'react';
import { createClient } from  '@/lib/supabase/server'; 

// Initialize Supabase client with environment variables

const supabase = await createClient();
// Props for the ClockButton component
type Props = {
  employeeId: string;
};

export default function ClockButton({ employeeId }: Props) {
  // State for loading indicator
  const [loading, setLoading] = useState(false);
  // State to track if the employee is currently checked in
  const [checkedIn, setCheckedIn] = useState(false);
  // State to temporarily hide the button after check out
  const [hideButton, setHideButton] = useState(false);

  // Effect to fetch today's attendance status for the employee
  useEffect(() => {
    const fetchAttendance = async () => {
      const now = new Date();
      // Get today's date in 'YYYY-MM-DD' format for the correct timezone
      const today = now.toLocaleDateString('sv-SE', { timeZone: 'America/Chihuahua' });

      // Temporary hide logic (after check out)
      const hideUntil = localStorage.getItem(`hideClockButton_${employeeId}_${today}`);
      if (hideUntil && Date.now() < Number(hideUntil)) {
        setHideButton(true);
        setTimeout(() => setHideButton(false), Number(hideUntil) - Date.now());
        return;
      } else if (hideUntil && Date.now() >= Number(hideUntil)) {
        localStorage.removeItem(`hideClockButton_${employeeId}_${today}`);
        setHideButton(false);
      } else {
        setHideButton(false);
      }

      // Query attendance to check if already checked in but not checked out today
      const { data } = await supabase
        .from('attendance')
        .select('clock_in, clock_out')
        .eq('employee_id', employeeId)
        .eq('date', today)
        .order('attendance_id', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data && data.clock_in && !data.clock_out) {
        setCheckedIn(true); // Show as "Check Out"
      } else {
        setCheckedIn(false); // Show as "Check In"
      }
    };
    fetchAttendance();
  }, [employeeId]);

  // Handler for check in/out button click
  const handleClock = async () => {
    setLoading(true);
    const now = new Date();
    // Format time for clock in/out
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'America/Chihuahua',
    };
    const localTime = now.toLocaleTimeString('en-GB', options);
    const today = now.toLocaleDateString('sv-SE', { timeZone: 'America/Chihuahua' });

    if (!checkedIn) {
      // Always create a new attendance record for check in
      const { error } = await supabase
        .from('attendance')
        .insert([
          {
            employee_id: employeeId,
            date: today,
            clock_in: localTime,
            status: 'Present',
          },
        ]);
      if (error) {
        alert('Error during check in');
        setLoading(false);
        return;
      }
      setCheckedIn(true);
    } else {
      // Find the latest attendance record without clock_out for this employee and date
      const { data: rows, error: fetchError } = await supabase
        .from('attendance')
        .select('attendance_id, date, clock_in, clock_out')
        .eq('employee_id', employeeId)
        .eq('date', today)
        .is('clock_out', null)
        .order('attendance_id', { ascending: false })
        .limit(1);

      console.log('Records found for check out:', rows);

      if (fetchError) {
        alert('Error searching for check out record');
        setLoading(false);
        return;
      }

      if (rows && rows.length > 0) {
        const { error: updateError } = await supabase
          .from('attendance')
          .update({ clock_out: localTime })
          .eq('attendance_id', rows[0].attendance_id);
        if (updateError) {
          alert('Error during check out');
          setLoading(false);
          return;
        }
      } else {
        alert('No record found for check out');
        setLoading(false);
        return;
      }
      setCheckedIn(false);
      // Hide the button for 10 seconds after check out
      const tenSeconds = 10 * 1000;
      localStorage.setItem(`hideClockButton_${employeeId}_${today}`, String(Date.now() + tenSeconds));
      setHideButton(true);
      setTimeout(() => setHideButton(false), tenSeconds);
    }
    setLoading(false);
  };

  // Hide the button if hideButton is true
  if (hideButton) return null;

  // Render the check in/out button
  return (
    <button
      onClick={handleClock}
      disabled={loading}
      className={`px-4 py-2 rounded font-semibold ${
        checkedIn ? 'bg-[#a01217]' : 'bg-[#006b3c]'
      } text-white ml-4 cursor-pointer`}
    >
      {loading
        ? 'Processing...'
        : checkedIn
        ? 'Check Out'
        : 'Check In'}
    </button>
  );
}