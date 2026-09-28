import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { getCurrentWeekDates } from '../utils/mealTimings';

export default function ManageMenu({ onNotify }) {
  const weekDays = getCurrentWeekDates();
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const mealTypes = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];

  const defaultTimings = {
    Breakfast: { start: '07:30 AM', end: '09:30 AM' },
    Lunch: { start: '12:30 PM', end: '02:30 PM' },
    Snacks: { start: '05:00 PM', end: '06:00 PM' },
    Dinner: { start: '07:30 PM', end: '09:30 PM' },
  };

  const mealIcons = {
    Breakfast: 'fa-mug-saucer',
    Lunch: 'fa-bowl-rice',
    Snacks: 'fa-cookie-bite',
    Dinner: 'fa-utensils',
  };

  // Get current weekday name as default (e.g. Wednesday)
  const getCurrentWeekday = () => {
    const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return daysOfWeek.includes(dayName) ? dayName : 'Sunday';
  };

  const [selectedDay, setSelectedDay] = useState(getCurrentWeekday());
  const initialDateObj = weekDays.find(w => w.day === getCurrentWeekday()) || weekDays[0];
  const [selectedDate, setSelectedDate] = useState(initialDateObj ? initialDateObj.date : '');
  const [selectedMeal, setSelectedMeal] = useState('Breakfast');
  const [allMenus, setAllMenus] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form inputs for the currently selected (Day, Meal)
  const [startTime, setStartTime] = useState(defaultTimings.Breakfast.start);
  const [endTime, setEndTime] = useState(defaultTimings.Breakfast.end);
  const [mealStatus, setMealStatus] = useState('Upcoming');

  // Staging items for new additions
  const [stagedItems, setStagedItems] = useState([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Veg');
  const [newItemCalories, setNewItemCalories] = useState('');

  // Editing state for an existing food item: { id, name, category, calories }
  const [editingItem, setEditingItem] = useState(null);

  // Quick inline add on right side card
  const [quickItemName, setQuickItemName] = useState('');
  const [quickCategory, setQuickCategory] = useState('Veg');
  const [quickCalories, setQuickCalories] = useState('');

  // Load all weekly menus from backend
  const fetchMenus = () => {
    setLoading(true);
    api.getMenus()
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : (res.data?.results || []);
        setAllMenus(data);
      })
      .catch(err => {
        console.error('Error loading menus:', err);
        if (onNotify) onNotify('Failed to load menu data from server.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const handleDaySelect = (day) => {
    setSelectedDay(day);
    const m = weekDays.find(w => w.day === day);
    if (m) setSelectedDate(m.date);
  };

  // Find the meal corresponding to (selectedDate or selectedDay, selectedMeal)
  const currentMeal = allMenus.find(
    m => (m.date === selectedDate || (!m.date && m.day_of_week?.toLowerCase() === selectedDay.toLowerCase())) &&
         m.meal_type?.toLowerCase() === selectedMeal.toLowerCase()
  );

  // When selectedDay, selectedDate or selectedMeal changes, load its timings/status or defaults
  useEffect(() => {
    if (currentMeal) {
      setStartTime(currentMeal.start_time || defaultTimings[selectedMeal]?.start || '07:30 AM');
      setEndTime(currentMeal.end_time || defaultTimings[selectedMeal]?.end || '09:30 AM');
      setMealStatus(currentMeal.status || 'Upcoming');
    } else {
      const defaults = defaultTimings[selectedMeal] || { start: '07:30 AM', end: '09:30 AM' };
      setStartTime(defaults.start);
      setEndTime(defaults.end);
      setMealStatus('Upcoming');
    }
    // Clear staged items and inputs when switching meals
    setStagedItems([]);
    setNewItemName('');
    setNewItemCalories('');
    setEditingItem(null);
    setQuickItemName('');
    setQuickCalories('');
  }, [selectedDay, selectedDate, selectedMeal, allMenus]);

  // Stage an item in the left-hand form
  const handleStageItem = (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    setStagedItems(prev => [
      ...prev,
      {
        name: newItemName.trim(),
        category: newItemCategory,
        calories: parseInt(newItemCalories) || 0
      }
    ]);
    setNewItemName('');
    setNewItemCalories('');
  };

  const handleRemoveStagedItem = (index) => {
    setStagedItems(prev => prev.filter((_, i) => i !== index));
  };

  // Submit form: creates or updates the meal for selectedDay + selectedDate + selectedMeal
  const handleSaveMeal = async (e) => {
    e.preventDefault();

    // Include any item currently typed into the input but not yet staged
    const finalStaged = [...stagedItems];
    if (newItemName.trim()) {
      finalStaged.push({
        name: newItemName.trim(),
        category: newItemCategory,
        calories: parseInt(newItemCalories) || 0
      });
    }

    try {
      if (currentMeal) {
        // Update existing meal header
        await api.updateMenu(currentMeal.id, {
          date: selectedDate,
          day_of_week: selectedDay,
          start_time: startTime,
          end_time: endTime,
          status: mealStatus,
        });

        // Add any newly staged items to this existing meal
        if (finalStaged.length > 0) {
          for (const item of finalStaged) {
            await api.createFoodItem({
              menu: currentMeal.id,
              name: item.name,
              category: item.category,
              calories: item.calories
            });
          }
        }

        if (onNotify) onNotify(`Updated ${selectedDay} (${selectedDate}) ${selectedMeal} in PostgreSQL database!`);
      } else {
        // Create new meal for this date + meal type
        await api.createMenu({
          date: selectedDate,
          day_of_week: selectedDay,
          meal_type: selectedMeal,
          start_time: startTime,
          end_time: endTime,
          status: mealStatus,
          items: finalStaged
        });

        if (onNotify) onNotify(`Successfully published ${selectedDay} (${selectedDate}) ${selectedMeal} with ${finalStaged.length} item(s)!`);
      }

      setStagedItems([]);
      setNewItemName('');
      setNewItemCalories('');
      fetchMenus();
    } catch (err) {
      console.error('Error saving meal:', err);
      if (onNotify) onNotify(err.response?.data?.error || 'Failed to save meal schedule.');
    }
  };

  // Quick add item directly from the right-side card
  const handleQuickAdd = async (e) => {
    e.preventDefault();
    if (!quickItemName.trim()) return;

    if (currentMeal) {
      // Meal already exists in DB -> post directly to /api/food-items/
      try {
        await api.createFoodItem({
          menu: currentMeal.id,
          name: quickItemName.trim(),
          category: quickCategory,
          calories: parseInt(quickCalories) || 0
        });
        if (onNotify) onNotify(`Added "${quickItemName}" to ${selectedDay} ${selectedMeal}.`);
        setQuickItemName('');
        setQuickCalories('');
        fetchMenus();
      } catch (err) {
        console.error('Error adding food item:', err);
        if (onNotify) onNotify('Failed to add food item.');
      }
    } else {
      // Meal not yet saved -> stage it so clicking Save Meal creates it with this dish
      setStagedItems(prev => [
        ...prev,
        {
          name: quickItemName.trim(),
          category: quickCategory,
          calories: parseInt(quickCalories) || 0
        }
      ]);
      setQuickItemName('');
      setQuickCalories('');
      if (onNotify) onNotify(`Item staged! Click "Save & Publish Meal" on the left to save to database.`);
    }
  };

  // Save edited food item
  const handleSaveItemEdit = async () => {
    if (!editingItem || !editingItem.name.trim()) return;

    try {
      await api.updateFoodItem(editingItem.id, {
        name: editingItem.name.trim(),
        category: editingItem.category,
        calories: parseInt(editingItem.calories) || 0
      });
      if (onNotify) onNotify(`Updated "${editingItem.name}".`);
      setEditingItem(null);
      fetchMenus();
    } catch (err) {
      console.error('Error updating item:', err);
      if (onNotify) onNotify('Failed to update food item.');
    }
  };

  // Delete food item
  const handleDeleteItem = async (itemId, itemName) => {
    if (!window.confirm(`Delete "${itemName}" from ${selectedDay} ${selectedMeal}?`)) return;

    try {
      await api.deleteFoodItem(itemId);
      if (onNotify) onNotify(`Deleted "${itemName}".`);
      fetchMenus();
    } catch (err) {
      console.error('Error deleting item:', err);
      if (onNotify) onNotify('Failed to delete food item.');
    }
  };

  // Delete meal
  const handleDeleteMeal = async () => {
    if (!currentMeal) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedDay} ${selectedMeal} and all its food items?`)) return;

    try {
      await api.deleteMenu(currentMeal.id);
      if (onNotify) onNotify(`Deleted ${selectedDay} ${selectedMeal} from database.`);
      fetchMenus();
    } catch (err) {
      console.error('Error deleting meal:', err);
      if (onNotify) onNotify('Failed to delete meal.');
    }
  };

  // Quick status update for current meal
  const handleStatusChange = async (newStatus) => {
    setMealStatus(newStatus);
    if (currentMeal) {
      try {
        await api.updateMenu(currentMeal.id, { status: newStatus });
        if (onNotify) onNotify(`Status set to "${newStatus}".`);
        fetchMenus();
      } catch (err) {
        console.error('Error updating status:', err);
      }
    }
  };

  // Clear all demo data
  const handleClearDemoData = async () => {
    if (!window.confirm('Clear all sample/demo menus from the database to start completely clean?')) return;

    try {
      const res = await api.clearDemoMenus();
      if (onNotify) onNotify(res.data?.message || 'Cleared demo menus.');
      fetchMenus();
    } catch (err) {
      console.error('Error clearing demo data:', err);
      if (onNotify) onNotify('Failed to clear demo data.');
    }
  };

  // Get items for the right-side card
  const displayItems = currentMeal ? (currentMeal.items || []) : stagedItems;

  // Filter all meals configured for the selected day/date (for day overview)
  const dayMeals = allMenus.filter(m => (m.date === selectedDate || (!m.date && m.day_of_week?.toLowerCase() === selectedDay.toLowerCase())));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Top Bar: Weekday Selector & Clear Demo Action */}
      <div className="card" style={{ padding: '1.25rem 1.5rem', background: '#ffffff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                SELECT DAY & CALENDAR DATE TO MANAGE:
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <select
                  className="form-control"
                  style={{ width: '230px', fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary)', borderColor: 'var(--primary)' }}
                  value={selectedDay}
                  onChange={(e) => handleDaySelect(e.target.value)}
                >
                  {weekDays.map(d => (
                    <option key={d.day} value={d.day}>
                      {d.day} — {d.date} {d.isToday ? '(Today)' : ''}
                    </option>
                  ))}
                </select>

                <input
                  type="date"
                  className="form-control"
                  style={{ width: '160px', fontSize: '0.9rem' }}
                  value={selectedDate}
                  onChange={(e) => {
                    const newDate = e.target.value;
                    setSelectedDate(newDate);
                    if (newDate) {
                      const d = new Date(newDate + 'T00:00:00');
                      const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
                      if (daysOfWeek.includes(dayName)) setSelectedDay(dayName);
                    }
                  }}
                  title="Specific Calendar Date"
                />

                <button
                  type="button"
                  className="btn btn-sm btn-outline"
                  onClick={() => handleDaySelect(getCurrentWeekday())}
                  title="Jump to current day of the week"
                >
                  Today ({getCurrentWeekday()})
                </button>
              </div>
            </div>

            <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: '1rem' }}>
              <span className="badge" style={{ background: 'var(--primary-soft)', color: 'var(--primary)', fontSize: '0.85rem' }}>
                <i className="fa-solid fa-calendar-check"></i> {dayMeals.length} of 4 Meals for {selectedDay} ({selectedDate})
              </span>
            </div>
          </div>

          <div>
            <button
              type="button"
              className="btn btn-sm"
              onClick={handleClearDemoData}
              style={{
                background: '#fff1f2',
                border: '1px solid #fecdd3',
                color: '#be123c',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
              title="Delete sample demo items to start with a fresh blank menu"
            >
              <i className="fa-solid fa-trash-can"></i>
              <span>Clear Sample Demo Menus</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-Column Interface: Left Form + Right Dynamic Meal Card */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 420px) 1fr', gap: '1.75rem', alignItems: 'start' }}>
        
        {/* Left Column: Form to Manage Meal & Food Items */}
        <div className="card" style={{ position: 'sticky', top: '5.5rem' }}>
          <div className="card-header">
            <div className="card-title">
              <i className="fa-solid fa-utensils" style={{ color: 'var(--primary)' }}></i>
              Manage {selectedDay} ({selectedDate}) Menu
            </div>
            {currentMeal && (
              <span className="badge" style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' }}>
                Editing Saved Meal
              </span>
            )}
          </div>

          <form onSubmit={handleSaveMeal}>
            {/* Day and Date Selection */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Day of Week</label>
                <select
                  className="form-control"
                  value={selectedDay}
                  onChange={(e) => handleDaySelect(e.target.value)}
                >
                  {daysOfWeek.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Calendar Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={selectedDate}
                  onChange={(e) => {
                    const newDate = e.target.value;
                    setSelectedDate(newDate);
                    if (newDate) {
                      const d = new Date(newDate + 'T00:00:00');
                      const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
                      if (daysOfWeek.includes(dayName)) setSelectedDay(dayName);
                    }
                  }}
                  required
                />
              </div>
            </div>

            {/* Meal Type Buttons (Requirement B) */}
            <div className="form-group">
              <label className="form-label">Meal Type</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.4rem' }}>
                {mealTypes.map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedMeal(type)}
                    style={{
                      padding: '0.55rem',
                      borderRadius: 'var(--radius-sm)',
                      border: selectedMeal === type ? '2px solid var(--primary)' : '1px solid var(--border)',
                      background: selectedMeal === type ? 'var(--primary-soft)' : '#ffffff',
                      color: selectedMeal === type ? 'var(--primary)' : 'var(--text-dark)',
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <i className={`fa-solid ${mealIcons[type]}`}></i>
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Timings (Requirement D) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Start Time</label>
                <input
                  type="text"
                  className="form-control"
                  value={startTime}
                  placeholder="07:30 AM"
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">End Time</label>
                <input
                  type="text"
                  className="form-control"
                  value={endTime}
                  placeholder="09:30 AM"
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Meal Status (Requirement F) */}
            <div className="form-group">
              <label className="form-label">Meal Status</label>
              <select
                className="form-control"
                value={mealStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                <option value="Upcoming">Upcoming / Scheduled</option>
                <option value="Serving Now">Serving Now (Live Dining)</option>
                <option value="Served">Served / Closed</option>
              </select>
            </div>

            <hr style={{ border: 'none', borderTop: '1px dashed var(--border)', margin: '1.25rem 0' }} />

            {/* Food Item Staging Inputs (Requirement B & E) */}
            <div>
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Food Items for this {selectedMeal}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                  Multiple items allowed
                </span>
              </label>

              {/* Staged Items List Preview */}
              {stagedItems.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.85rem' }}>
                  {stagedItems.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'var(--bg-subtle)',
                        padding: '0.4rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.85rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <i className="fa-solid fa-circle-dot" style={{ fontSize: '0.5rem', color: item.category === 'Non-Veg' ? '#ef4444' : '#10b981' }}></i>
                        <strong>{item.name}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({item.category}, {item.calories || 0} kcal)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveStagedItem(idx)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.2rem' }}
                        title="Remove"
                      >
                        <i className="fa-solid fa-xmark"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Single Item Input Box */}
              <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={`e.g. ${selectedMeal === 'Breakfast' ? 'Idly, Sambar, Tea' : 'Rice, Dal, Curd'}...`}
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <select
                    className="form-control"
                    style={{ fontSize: '0.85rem' }}
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                  >
                    <option value="Veg">Veg</option>
                    <option value="Non-Veg">Non-Veg</option>
                    <option value="Beverage">Beverage</option>
                    <option value="Dessert">Dessert</option>
                    <option value="Special">Special</option>
                  </select>

                  <input
                    type="number"
                    className="form-control"
                    style={{ fontSize: '0.85rem' }}
                    placeholder="Calories (opt)"
                    value={newItemCalories}
                    onChange={(e) => setNewItemCalories(e.target.value)}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleStageItem}
                  className="btn btn-sm btn-outline btn-block"
                  style={{ background: '#ffffff' }}
                >
                  <i className="fa-solid fa-plus"></i> Add Item
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg"
              style={{ marginTop: '1.5rem' }}
            >
              <i className="fa-solid fa-floppy-disk"></i> {currentMeal ? 'Update & Save Meal' : 'Save & Publish Meal'}
            </button>
          </form>
        </div>

        {/* Right Column: Dynamic Meal Card for Currently Selected (Day, Meal) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          
          {/* Main Active Meal Card (Requirement B, C, E, H) */}
          <div
            className="card"
            style={{
              border: mealStatus === 'Serving Now' ? '2px solid var(--primary)' : '1px solid var(--border)',
              boxShadow: mealStatus === 'Serving Now' ? 'var(--shadow-md)' : 'var(--shadow-sm)',
              transition: 'all 0.2s ease'
            }}
          >
            {/* Header: Dynamic Day, Meal Type, Timing & Status */}
            <div className="card-header" style={{ alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: 'var(--radius-md)',
                  background: mealStatus === 'Serving Now' ? 'var(--primary-soft)' : 'var(--bg-subtle)',
                  color: mealStatus === 'Serving Now' ? 'var(--primary)' : 'var(--text-dark)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.4rem'
                }}>
                  <i className={`fa-solid ${mealIcons[selectedMeal] || 'fa-utensils'}`}></i>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {selectedDay}
                    </span>
                    <h3 style={{ margin: 0, fontSize: '1.35rem' }}>{selectedMeal}</h3>
                    <span className={
                      mealStatus === 'Serving Now' ? 'badge badge-live' :
                      mealStatus === 'Served' ? 'status-badge status-resolved' :
                      'status-badge status-in-progress'
                    }>
                      {mealStatus}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    <i className="fa-regular fa-clock"></i> {startTime} – {endTime}
                  </div>
                </div>
              </div>

              {/* Status Switcher & Delete Meal Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <select
                  className="form-control"
                  style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem', width: 'auto' }}
                  value={mealStatus}
                  onChange={(e) => handleStatusChange(e.target.value)}
                >
                  <option value="Upcoming">Upcoming</option>
                  <option value="Serving Now">Serving Now</option>
                  <option value="Served">Served / Closed</option>
                </select>

                {currentMeal && (
                  <button
                    type="button"
                    className="btn btn-sm"
                    style={{ background: '#fff1f2', color: '#be123c', border: '1px solid #fecdd3' }}
                    onClick={handleDeleteMeal}
                    title="Delete meal and its food items"
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                )}
              </div>
            </div>

            {/* Food Items Included Section */}
            <div style={{ padding: '0.5rem 0.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                  FOOD ITEMS INCLUDED ({displayItems.length}):
                </label>
                {!currentMeal && (
                  <span style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: 600 }}>
                    <i className="fa-solid fa-circle-info"></i> Staged (Unsaved)
                  </span>
                )}
              </div>

              {displayItems.length === 0 ? (
                <div style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                  No food items added for {selectedDay} {selectedMeal} yet. Use the quick add row below or the form on the left.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  {displayItems.map((item, idx) => {
                    const isEditing = editingItem && editingItem.id === item.id;

                    if (isEditing) {
                      return (
                        <div
                          key={item.id || idx}
                          style={{
                            display: 'flex',
                            gap: '0.5rem',
                            alignItems: 'center',
                            padding: '0.5rem',
                            background: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            borderRadius: 'var(--radius-sm)'
                          }}
                        >
                          <input
                            type="text"
                            className="form-control"
                            style={{ fontSize: '0.85rem', flex: 2 }}
                            value={editingItem.name}
                            onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                          />
                          <select
                            className="form-control"
                            style={{ fontSize: '0.85rem', flex: 1 }}
                            value={editingItem.category}
                            onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                          >
                            <option value="Veg">Veg</option>
                            <option value="Non-Veg">Non-Veg</option>
                            <option value="Beverage">Beverage</option>
                            <option value="Dessert">Dessert</option>
                            <option value="Special">Special</option>
                          </select>
                          <input
                            type="number"
                            className="form-control"
                            style={{ fontSize: '0.85rem', width: '85px' }}
                            placeholder="kcal"
                            value={editingItem.calories}
                            onChange={(e) => setEditingItem({ ...editingItem, calories: e.target.value })}
                          />
                          <button type="button" className="btn btn-sm btn-primary" onClick={handleSaveItemEdit}>
                            Save
                          </button>
                          <button type="button" className="btn btn-sm btn-outline" onClick={() => setEditingItem(null)}>
                            Cancel
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={item.id || idx}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '0.55rem 0.85rem',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg-main)',
                          border: '1px solid var(--border)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <i className="fa-solid fa-circle" style={{
                            fontSize: '0.5rem',
                            color: item.category === 'Non-Veg' ? '#dc2626' :
                                   item.category === 'Beverage' ? '#0284c7' :
                                   item.category === 'Dessert' ? '#d97706' : '#15803d'
                          }}></i>
                          <span style={{ fontWeight: 600, fontSize: '0.925rem' }}>{item.name}</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          {item.calories > 0 && (
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                              {item.calories} kcal
                            </span>
                          )}
                          <span className={`badge ${
                            item.category === 'Non-Veg' ? 'badge-nonveg' :
                            item.category === 'Special' ? 'badge-special' : 'badge-veg'
                          }`}>
                            {item.category}
                          </span>

                          {item.id ? (
                            <>
                              <button
                                type="button"
                                onClick={() => setEditingItem({
                                  id: item.id,
                                  name: item.name,
                                  category: item.category,
                                  calories: item.calories
                                })}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.2rem', fontSize: '0.85rem' }}
                                title="Edit food item"
                              >
                                <i className="fa-solid fa-pen"></i>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteItem(item.id, item.name)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '0.2rem', fontSize: '0.85rem' }}
                                title="Delete food item"
                              >
                                <i className="fa-solid fa-trash-can"></i>
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleRemoveStagedItem(idx)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '0.2rem' }}
                              title="Remove from staged list"
                            >
                              <i className="fa-solid fa-xmark"></i>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Quick Inline Add Row for this meal (Requirement E & H) */}
              <form onSubmit={handleQuickAdd} style={{
                marginTop: '1rem',
                paddingTop: '0.85rem',
                borderTop: '1px dashed var(--border)',
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'center'
              }}>
                <input
                  type="text"
                  className="form-control"
                  style={{ fontSize: '0.85rem', flex: 2 }}
                  placeholder={`Add dish to ${selectedDay} ${selectedMeal} (e.g. Idly, Tea)...`}
                  value={quickItemName}
                  onChange={(e) => setQuickItemName(e.target.value)}
                />

                <select
                  className="form-control"
                  style={{ fontSize: '0.85rem', width: '110px' }}
                  value={quickCategory}
                  onChange={(e) => setQuickCategory(e.target.value)}
                >
                  <option value="Veg">Veg</option>
                  <option value="Non-Veg">Non-Veg</option>
                  <option value="Beverage">Beverage</option>
                  <option value="Dessert">Dessert</option>
                  <option value="Special">Special</option>
                </select>

                <input
                  type="number"
                  className="form-control"
                  style={{ fontSize: '0.85rem', width: '80px' }}
                  placeholder="kcal"
                  value={quickCalories}
                  onChange={(e) => setQuickCalories(e.target.value)}
                />

                <button
                  type="submit"
                  className="btn btn-sm btn-outline-primary"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  <i className="fa-solid fa-plus"></i> Add
                </button>
              </form>
            </div>
          </div>

          {/* Full Day Overview: Quick Cards for All 4 Meals of the Selected Day */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                <i className="fa-solid fa-table-cells-large" style={{ color: 'var(--primary)', marginRight: '0.4rem' }}></i>
                {selectedDay} Full Schedule Overview
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Click any meal to switch
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
              {mealTypes.map(type => {
                const meal = allMenus.find(
                  m => m.day_of_week?.toLowerCase() === selectedDay.toLowerCase() &&
                       m.meal_type?.toLowerCase() === type.toLowerCase()
                );
                const isSelected = selectedMeal === type;

                return (
                  <div
                    key={type}
                    onClick={() => setSelectedMeal(type)}
                    style={{
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                      background: isSelected ? 'var(--primary-soft)' : 'var(--bg-subtle)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <strong style={{ fontSize: '0.9rem', color: isSelected ? 'var(--primary)' : 'var(--text-dark)' }}>
                        <i className={`fa-solid ${mealIcons[type]}`} style={{ marginRight: '0.35rem' }}></i>
                        {type}
                      </strong>
                      {meal ? (
                        <span className={`badge ${meal.status === 'Serving Now' ? 'badge-live' : 'badge-veg'}`} style={{ fontSize: '0.7rem' }}>
                          {meal.status}
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Not set</span>
                      )}
                    </div>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {meal ? `${meal.start_time} - ${meal.end_time}` : `${defaultTimings[type].start} - ${defaultTimings[type].end}`}
                    </div>

                    <div style={{ fontSize: '0.75rem', marginTop: '0.35rem', fontWeight: 600, color: isSelected ? 'var(--primary)' : 'var(--text-body)' }}>
                      {meal ? `${meal.items?.length || 0} dishes configured` : '0 dishes'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
