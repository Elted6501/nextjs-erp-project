'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Props = {
  employeeId: string;
};

export default function ClockButton({ employeeId }: Props) {
  const [loading, setLoading] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  const [hideButton, setHideButton] = useState(false);

  useEffect(() => {
    const fetchAttendance = async () => {
      const now = new Date();
      const today = now.toLocaleDateString('sv-SE', { timeZone: 'America/Chihuahua' });

      // --- BLOQUEO TEMPORAL DE 3 MINUTOS ---
      const hideUntil = localStorage.getItem(`hideClockButton_${employeeId}_${today}`);
      if (hideUntil && Date.now() < Number(hideUntil)) {
        setHideButton(true);
        setTimeout(() => setHideButton(false), Number(hideUntil) - Date.now());
        return;
      } else if (hideUntil && Date.now() >= Number(hideUntil)) {
        // Si ya pasó el tiempo, limpia el bloqueo
        localStorage.removeItem(`hideClockButton_${employeeId}_${today}`);
        setHideButton(false);
      } else {
        setHideButton(false);
      }

      // --- PARA USAR employee_schedule_start DESCOMENTA ESTE BLOQUE ---
      /*
      // Obtén el horario de inicio del empleado
      const { data: empData } = await supabase
        .from('employees')
        .select('employee_schedule_start')
        .eq('employee_id', employeeId)
        .single();

      if (empData && empData.employee_schedule_start) {
        const scheduleStart = new Date(`${today}T${empData.employee_schedule_start}`);
        if (now < scheduleStart) {
          setHideButton(true);
          return;
        }
      }
      */
      // ---------------------------------------------------------------

      const { data } = await supabase
        .from('attendance')
        .select('clock_in, clock_out')
        .eq('employee_id', employeeId)
        .eq('date', today)
        .single();

      if (data && data.clock_in && !data.clock_out) {
        setCheckedIn(true);
      } else {
        setCheckedIn(false);
      }
    };
    fetchAttendance();
  }, [employeeId]);

  const handleClock = async () => {
    setLoading(true);
    const now = new Date();
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
      // Siempre crea un nuevo registro
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
        alert('Error al hacer check in');
        setLoading(false);
        return;
      }
      setCheckedIn(true);
    } else {
      // Busca el último registro sin clock_out para este empleado y fecha
      const { data: rows, error: fetchError } = await supabase
        .from('attendance')
        .select('attendance_id, date, clock_in, clock_out')
        .eq('employee_id', employeeId)
        .eq('date', today)
        .is('clock_out', null)
        .order('attendance_id', { ascending: false })
        .limit(1);

      console.log('Registros encontrados para check out:', rows);

      if (fetchError) {
        alert('Error al buscar registro para check out');
        setLoading(false);
        return;
      }

      if (rows && rows.length > 0) {
        const { error: updateError } = await supabase
          .from('attendance')
          .update({ clock_out: localTime })
          .eq('attendance_id', rows[0].attendance_id);
        if (updateError) {
          alert('Error al hacer check out');
          setLoading(false);
          return;
        }
      } else {
        alert('No se encontró registro para check out');
        setLoading(false);
        return;
      }
      setCheckedIn(false);
      // ...bloqueo de 10 segundos...
      const tenSeconds = 10 * 1000;
      localStorage.setItem(`hideClockButton_${employeeId}_${today}`, String(Date.now() + tenSeconds));
      setHideButton(true);
      setTimeout(() => setHideButton(false), tenSeconds);
    }
    setLoading(false);
  };

  if (hideButton) return null;

  return (
    <button
      onClick={handleClock}
      disabled={loading}
      className={`px-4 py-2 rounded font-semibold ${
        checkedIn ? 'bg-red-600' : 'bg-green-600'
      } text-white ml-4`}
    >
      {loading
        ? 'Procesando...'
        : checkedIn
        ? 'Check Out'
        : 'Check In'}
    </button>
  );
}