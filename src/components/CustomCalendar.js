import React, { useState, useEffect } from 'react';
import '../App.css';

const CustomCalendar = ({ onDateSelect, minDate, maxDate, onClose }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  // Get month and year display
  const monthYear = currentMonth.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

  // Get days in current month view
  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // First day of month
    const firstDay = new Date(year, month, 1);
    const firstDayOfWeek = firstDay.getDay();
    
    // Last day of month
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Previous month days to fill
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    
    const days = [];
    
    // Previous month days (greyed out)
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        isCurrentMonth: false,
        isToday: false,
        isDisabled: true,
        date: new Date(year, month - 1, prevMonthLastDay - i)
      });
    }
    
    // Current month days
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = date.toDateString() === today.toDateString();
      const isDisabled = date < minDate || date > maxDate;
      
      days.push({
        day,
        isCurrentMonth: true,
        isToday,
        isDisabled,
        date
      });
    }
    
    // Next month days to fill grid
    const remainingDays = 42 - days.length; // 6 rows × 7 days
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        isToday: false,
        isDisabled: true,
        date: new Date(year, month + 1, day)
      });
    }
    
    return days;
  };

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  // Handle date selection
  const handleDateClick = (dayObj) => {
    if (!dayObj.isDisabled && dayObj.isCurrentMonth) {
      setSelectedDate(dayObj.date);
      onDateSelect(dayObj.date.toISOString().split('T')[0]);
    }
  };

  // Week day headers
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div className="custom-calendar-overlay" onClick={onClose}>
      <div className="custom-calendar-container" onClick={(e) => e.stopPropagation()}>
        {/* Month/Year Header */}
        <div className="calendar-header">
          <div className="calendar-month-year">{monthYear}</div>
          <div className="calendar-nav-buttons">
            <button 
              className="calendar-nav-btn" 
              onClick={goToPreviousMonth}
              aria-label="Previous month"
            >
              ▲
            </button>
            <button 
              className="calendar-nav-btn" 
              onClick={goToNextMonth}
              aria-label="Next month"
            >
              ▼
            </button>
          </div>
        </div>

        {/* Week Day Headers */}
        <div className="calendar-weekdays">
          {weekDays.map((day) => (
            <div key={day} className="calendar-weekday">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="calendar-grid">
          {getDaysInMonth().map((dayObj, index) => (
            <button
              key={index}
              className={`calendar-day ${
                dayObj.isCurrentMonth ? 'current-month' : 'other-month'
              } ${dayObj.isToday ? 'today' : ''} ${
                dayObj.isDisabled ? 'disabled' : ''
              } ${
                selectedDate && 
                dayObj.date.toDateString() === selectedDate.toDateString() 
                  ? 'selected' 
                  : ''
              }`}
              onClick={() => handleDateClick(dayObj)}
              disabled={dayObj.isDisabled}
            >
              {dayObj.day}
            </button>
          ))}
        </div>

        {/* Close Button */}
        <button className="calendar-close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default CustomCalendar;
