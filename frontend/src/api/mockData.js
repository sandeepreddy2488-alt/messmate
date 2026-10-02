// Rich initial mock database data for offline and production cloud hosting
export const INITIAL_TODAY_MENUS = [
  {
    id: 36,
    date: new Date().toISOString().split('T')[0],
    day_of_week: 'Friday',
    meal_type: 'Breakfast',
    start_time: '07:30 AM',
    end_time: '09:30 AM',
    status: 'Served',
    is_special: false,
    special_title: '',
    assigned_chef: 2,
    assigned_chef_name: 'SATTIBABU',
    items: [
      { id: 245, menu: 36, name: 'Vada + Sambar + Chutney', category: 'Veg', calories: 320, protein_g: 8, is_chef_special: false },
      { id: 246, menu: 36, name: 'Filter Coffee & Tea', category: 'Beverage', calories: 75, protein_g: 2, is_chef_special: false }
    ]
  },
  {
    id: 41,
    date: new Date().toISOString().split('T')[0],
    day_of_week: 'Friday',
    meal_type: 'Lunch',
    start_time: '12:30 PM',
    end_time: '02:00 PM',
    status: 'Served',
    is_special: false,
    special_title: '',
    assigned_chef: 2,
    assigned_chef_name: 'SATTIBABU',
    items: [
      { id: 167, menu: 41, name: 'Steamed Basmati Rice', category: 'Veg', calories: 210, protein_g: 4, is_chef_special: false },
      { id: 168, menu: 41, name: 'South Indian Sambar', category: 'Veg', calories: 130, protein_g: 5, is_chef_special: false },
      { id: 169, menu: 41, name: 'Crispy Cabbage Fry', category: 'Veg', calories: 95, protein_g: 3, is_chef_special: false },
      { id: 170, menu: 41, name: 'Tadka Dal Curry', category: 'Veg', calories: 140, protein_g: 7, is_chef_special: false },
      { id: 171, menu: 41, name: 'Mango Pickle & Papad', category: 'Veg', calories: 35, protein_g: 1, is_chef_special: false },
      { id: 172, menu: 41, name: 'Fresh Chilled Curd', category: 'Veg', calories: 60, protein_g: 3, is_chef_special: false }
    ]
  },
  {
    id: 48,
    date: new Date().toISOString().split('T')[0],
    day_of_week: 'Friday',
    meal_type: 'Snacks',
    start_time: '05:00 PM',
    end_time: '06:00 PM',
    status: 'Served',
    is_special: false,
    special_title: '',
    assigned_chef: 3,
    assigned_chef_name: 'BUTTER MILK BABBLU',
    items: [
      { id: 195, menu: 48, name: 'Hot Mirchi Bajji', category: 'Veg', calories: 240, protein_g: 4, is_chef_special: true },
      { id: 196, menu: 48, name: 'Ginger Masala Chai', category: 'Beverage', calories: 70, protein_g: 2, is_chef_special: false }
    ]
  },
  {
    id: 55,
    date: new Date().toISOString().split('T')[0],
    day_of_week: 'Friday',
    meal_type: 'Dinner',
    start_time: '07:30 PM',
    end_time: '09:30 PM',
    status: 'Serving Now',
    is_special: true,
    special_title: 'Friday Special Feast',
    assigned_chef: 2,
    assigned_chef_name: 'SATTIBABU',
    items: [
      { id: 221, menu: 55, name: 'Fresh Soft Chapati (2 pcs)', category: 'Veg', calories: 160, protein_g: 5, is_chef_special: false },
      { id: 222, menu: 55, name: 'Andhra Chicken Curry (or Paneer Butter Masala)', category: 'Non-Veg', calories: 310, protein_g: 24, is_chef_special: true },
      { id: 223, menu: 55, name: 'Jeera Rice & Plain Rice', category: 'Veg', calories: 210, protein_g: 4, is_chef_special: false },
      { id: 224, menu: 55, name: 'Mixed Veg Dal', category: 'Veg', calories: 130, protein_g: 6, is_chef_special: false },
      { id: 225, menu: 55, name: 'Fresh Curd & Sweet Gulab Jamun', category: 'Veg', calories: 140, protein_g: 3, is_chef_special: false }
    ]
  }
];

export const INITIAL_CHEFS = [
  {
    id: 1,
    name: 'GOPI',
    role: 'Head Chef',
    experience: '8 Years',
    speciality: 'South Indian Meals',
    working_days: 'Sunday Only',
    description: 'Master culinary expert with over 8 years of experience overseeing central hostel mess operations, specializing in wholesome South Indian breakfasts, traditional thalis, and aromatic sambar varieties.',
    photo: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&auto=format&fit=crop&q=80',
    is_active: true,
    avg_rating: 5.0,
    total_ratings: 9
  },
  {
    id: 2,
    name: 'SATTIBABU',
    role: 'Assistant Chef',
    experience: '5 Years',
    speciality: 'Biryani & Non-Veg',
    working_days: 'Monday - Saturday',
    description: 'Specializes in Hyderabadi dum biryani, flavorful non-veg curries, gravies, and large-scale dining preparations with balanced spices and hygienic standards.',
    photo: 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=400&auto=format&fit=crop&q=80',
    is_active: true,
    avg_rating: 4.5,
    total_ratings: 12
  },
  {
    id: 3,
    name: 'BUTTER MILK BABBLU',
    role: 'Assistant Chef',
    experience: '4 Years',
    speciality: 'Tiffins & Snacks',
    working_days: 'Monday - Saturday',
    description: 'Tiffin master known for fluffy idlis, crisp dosas, and evening hostel snacks like samosas, pakoras, and fresh chutneys for 1,000+ residents daily.',
    photo: 'https://images.unsplash.com/photo-1607631568010-a87245c0daf8?w=400&auto=format&fit=crop&q=80',
    is_active: true,
    avg_rating: 4.2,
    total_ratings: 7
  }
];

export const INITIAL_COMPLAINTS = [
  {
    id: 4,
    ticket_id: 'CMP-6431',
    student_name: 'SANDEEP',
    room: 'B-304 (Block B)',
    category: 'quality',
    meal: 'Lunch',
    hall: 'Central Mess Hall 2 (Block B)',
    priority: 'medium',
    description: 'Chapati was hard during lunch service. Please ensure hot case is used.',
    status: 'Pending',
    resolution_note: '',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: 3,
    ticket_id: 'CMP-5088',
    student_name: 'Ananya Patel',
    room: 'Room C-112',
    category: 'hygiene',
    meal: 'Lunch',
    hall: 'Central Mess Hall 1 (Block A)',
    priority: 'urgent',
    description: 'Large curry spill on dining table 14 was left unattended for 20 minutes attracting houseflies.',
    status: 'Resolved',
    resolution_note: 'Inspected and marked resolved by Mess Supervisor. Table cleaned and sanitized.',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 2,
    ticket_id: 'CMP-5014',
    student_name: 'Rahul Sharma',
    room: 'Room B-304',
    category: 'quality',
    meal: 'Dinner',
    hall: 'Central Mess Hall 2 (Block B)',
    priority: 'medium',
    description: 'Chapati container was empty at 8:40 PM during dinner, and subsequent rotis brought out were cold.',
    status: 'Resolved',
    resolution_note: 'Chef was instructed to prepare fresh batches in sync with dining flow.',
    created_at: new Date(Date.now() - 3600000 * 48).toISOString()
  },
  {
    id: 1,
    ticket_id: 'CMP-4921',
    student_name: 'Rahul Sharma',
    room: 'Room B-304',
    category: 'water',
    meal: 'Lunch',
    hall: 'Central Mess Hall 2 (Block B)',
    priority: 'urgent',
    description: 'The RO purifier tap on the second floor of Central Mess Hall 2 had muddy sediment and weak flow.',
    status: 'Resolved',
    resolution_note: 'Pre-filter candle and sediment cartridge replaced. TDS tested at 85 ppm (optimal).',
    created_at: new Date(Date.now() - 3600000 * 72).toISOString()
  }
];

export const INITIAL_FEEDBACK = [
  {
    id: 1,
    student_name: 'Rahul Sharma',
    meal_type: 'Dinner',
    date: new Date().toISOString().split('T')[0],
    rating_taste: 4,
    rating_hygiene: 5,
    rating_temperature: 4,
    rating_portion: 5,
    overall_rating: 4.5,
    comments: 'Chicken curry and fresh chapatis were very delicious tonight! Great job by Chef Sattibabu.',
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    student_name: 'Pooja Reddy',
    meal_type: 'Breakfast',
    date: new Date().toISOString().split('T')[0],
    rating_taste: 5,
    rating_hygiene: 4,
    rating_temperature: 5,
    rating_portion: 4,
    overall_rating: 4.5,
    comments: 'Hot vadas with fresh coconut chutney were crispy and top tier quality!',
    created_at: new Date().toISOString()
  }
];

export const INITIAL_STATS = {
  complaints: {
    total: 4,
    pending: 1,
    in_progress: 0,
    resolved: 3
  },
  chef_complaints: {
    total: 16,
    pending: 4,
    accepted: 3,
    resolved: 6,
    rejected: 3
  },
  ratings: {
    total_feedback: 18,
    avg_rating: 4.4
  },
  meals_served_today: 842,
  total_capacity: 1050
};
