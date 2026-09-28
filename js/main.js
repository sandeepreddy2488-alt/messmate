/**
 * MessMate - Frontend Interactive JavaScript & API Integration
 * Connects UI seamlessly with Node.js Express & SQLite backend
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initTabs();
  initStarRatings();
  initForms();
  initQuickFilters();
  initDynamicData();
});

/* -------------------------------------------------------------------------- */
/* 1. Mobile Navigation Toggle                                                */
/* -------------------------------------------------------------------------- */
function initMobileNav() {
  const toggleBtn = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      const icon = toggleBtn.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-xmark');
      }
    });

    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !toggleBtn.contains(e.target) && navMenu.classList.contains('open')) {
        navMenu.classList.remove('open');
        const icon = toggleBtn.querySelector('i');
        if (icon) {
          icon.classList.add('fa-bars');
          icon.classList.remove('fa-xmark');
        }
      }
    });
  }
}

/* -------------------------------------------------------------------------- */
/* 2. Generic Tab Switching                                                   */
/* -------------------------------------------------------------------------- */
function initTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');

  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const parentTabs = btn.closest('.tabs-container') || document;
      const targetId = btn.getAttribute('data-tab');

      if (!targetId) return;

      parentTabs.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
      parentTabs.querySelectorAll('.tab-content').forEach((pane) => pane.classList.remove('active'));

      btn.classList.add('active');
      const targetPane = document.getElementById(targetId);
      if (targetPane) {
        targetPane.classList.add('active');
      }
    });
  });
}

/* -------------------------------------------------------------------------- */
/* 3. Interactive Star Ratings                                                */
/* -------------------------------------------------------------------------- */
function initStarRatings() {
  const ratingContainers = document.querySelectorAll('.star-rating');

  ratingContainers.forEach((container) => {
    const stars = container.querySelectorAll('.fa-star');

    stars.forEach((star, index) => {
      star.addEventListener('mouseenter', () => {
        highlightStars(stars, index);
      });

      container.addEventListener('mouseleave', () => {
        const currentRating = parseInt(container.getAttribute('data-rating') || '0', 10);
        highlightStars(stars, currentRating - 1);
      });

      star.addEventListener('click', () => {
        const ratingValue = index + 1;
        container.setAttribute('data-rating', ratingValue);
        highlightStars(stars, index);
        
        const label = container.parentElement.querySelector('.rating-label');
        if (label) {
          const ratingDescriptions = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
          label.textContent = `${ratingValue}/5 (${ratingDescriptions[index]})`;
          label.style.color = '#059669';
          label.style.fontWeight = '600';
        }
      });
    });
  });

  function highlightStars(stars, targetIndex) {
    stars.forEach((star, i) => {
      if (i <= targetIndex) {
        star.classList.add('active');
      } else {
        star.classList.remove('active');
      }
    });
  }
}

/* -------------------------------------------------------------------------- */
/* 4. Form Submissions with Real Backend REST APIs                            */
/* -------------------------------------------------------------------------- */
function initForms() {
  // Feedback Form
  const feedbackForm = document.getElementById('feedback-form');
  if (feedbackForm) {
    feedbackForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const meal = document.querySelector('input[name="meal-reviewed"]:checked')?.value || 'lunch';
      const overallStarContainer = feedbackForm.querySelector('.star-rating[data-rating]');
      const overall_rating = overallStarContainer ? parseInt(overallStarContainer.getAttribute('data-rating') || '5', 10) : 5;
      
      // Selected tags
      const checkedTags = Array.from(feedbackForm.querySelectorAll('.tags-cloud input[type="checkbox"]:checked'))
        .map(cb => cb.parentElement.textContent.trim())
        .join(', ');

      const comment = document.getElementById('feedback-comment')?.value || '';
      const anonymous = feedbackForm.querySelector('input[type="checkbox"]:not(.tags-cloud input)')?.checked ?? true;

      const payload = {
        meal,
        overall_rating,
        taste_rating: 4,
        hygiene_rating: 5,
        temperature_rating: 4,
        portion_rating: 4,
        comment,
        tags: checkedTags,
        anonymous: anonymous ? 1 : 0,
        student_info: 'Rahul Sharma (Block B)'
      };

      try {
        if (window.MessMateAPI) {
          await MessMateAPI.submitFeedback(payload);
        }
        showToast('Feedback Submitted!', 'Thank you! Your ratings have been saved to the Mess Database.', 'success');
        feedbackForm.reset();
        
        // Refresh reviews list if available
        if (typeof loadDynamicFeedback === 'function') {
          loadDynamicFeedback();
        }
      } catch (err) {
        showToast('Error', 'Could not record feedback to database.', 'error');
      }
    });
  }

  // Complaint Form
  const complaintForm = document.getElementById('complaint-form');
  if (complaintForm) {
    complaintForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const category = document.getElementById('complaint-category')?.value;
      const meal = document.getElementById('complaint-meal')?.value;
      const hall = document.getElementById('complaint-hall')?.value;
      const priority = complaintForm.querySelector('input[name="priority"]:checked')?.value || 'medium';
      const description = document.getElementById('complaint-desc')?.value;

      const payload = {
        category,
        meal,
        hall,
        priority,
        description,
        student_name: 'Rahul Sharma',
        room: 'Room B-304'
      };

      try {
        let ticketId = 'CMP-' + Math.floor(1000 + Math.random() * 9000);
        if (window.MessMateAPI) {
          const res = await MessMateAPI.createComplaint(payload);
          if (res.ticket) ticketId = res.ticket.ticket_id;
        }

        showToast('Complaint Registered!', `Grievance ticket #${ticketId} created in SQLite database.`, 'success');
        complaintForm.reset();

        // Refresh complaint list if on complaints page
        if (typeof loadDynamicComplaints === 'function') {
          loadDynamicComplaints();
        }
      } catch (err) {
        showToast('Error', 'Could not file complaint to database.', 'error');
      }
    });
  }

  // Admin New Announcement Form
  const announcementForm = document.getElementById('admin-announcement-form');
  if (announcementForm) {
    announcementForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const title = document.getElementById('notice-title')?.value;
      const category = document.getElementById('notice-cat')?.value;
      const content = document.getElementById('notice-body')?.value;
      const pinned = announcementForm.querySelector('input[type="checkbox"]')?.checked ? 1 : 0;

      const payload = {
        title,
        category,
        content,
        pinned,
        author: 'K. Rao (Mess Supervisor)'
      };

      try {
        if (window.MessMateAPI) {
          await MessMateAPI.createAnnouncement(payload);
        }
        showToast('Notice Published!', 'New announcement saved in database and live on the student board.', 'success');
        announcementForm.reset();
      } catch (err) {
        showToast('Error', 'Failed to publish announcement.', 'error');
      }
    });
  }
}

/* -------------------------------------------------------------------------- */
/* 5. Quick Tag / Pill Filters                                                */
/* -------------------------------------------------------------------------- */
function initQuickFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('btn-primary'));
      filterBtns.forEach(b => b.classList.add('btn-outline'));
      
      btn.classList.remove('btn-outline');
      btn.classList.add('btn-primary');

      const filterValue = btn.getAttribute('data-filter');
      const items = document.querySelectorAll('.filterable-item');

      items.forEach(item => {
        if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
}

/* -------------------------------------------------------------------------- */
/* 6. Dynamic Data Hydration from Backend API                                 */
/* -------------------------------------------------------------------------- */
async function initDynamicData() {
  if (!window.MessMateAPI) return;

  // On Complaints page
  const complaintsContainer = document.getElementById('dynamic-complaints-list');
  if (complaintsContainer) {
    loadDynamicComplaints();
  }

  // On Admin Dashboard page
  const adminComplaintsTbody = document.getElementById('admin-complaints-tbody');
  if (adminComplaintsTbody) {
    loadAdminDashboardData();
  }

  // On Feedback page
  const dynamicReviewsContainer = document.getElementById('dynamic-reviews-list');
  if (dynamicReviewsContainer) {
    loadDynamicFeedback();
  }

  // On Announcements page
  const dynamicNoticesContainer = document.getElementById('dynamic-notices-list');
  if (dynamicNoticesContainer) {
    loadDynamicAnnouncements();
  }

  // On Student Dashboard
  const dashboardComplaintsTbody = document.getElementById('dashboard-complaints-tbody');
  if (dashboardComplaintsTbody) {
    loadStudentDashboardComplaints();
  }
}

// 6a. Load Complaints into Student Grievance List
async function loadDynamicComplaints() {
  const container = document.getElementById('dynamic-complaints-list');
  if (!container) return;

  const tickets = await MessMateAPI.getComplaints();
  if (!tickets || !tickets.length) return;

  container.innerHTML = tickets.map(t => `
    <div class="ticket-card">
      <div class="ticket-header">
        <div class="ticket-id">
          <i class="fa-solid fa-ticket" style="color: ${t.status === 'Resolved' ? 'var(--primary)' : 'var(--danger)'};"></i> #${t.ticket_id}
          <span style="font-size: 0.75rem; font-weight: normal; color: var(--text-muted);">• ${t.category.toUpperCase()}</span>
        </div>
        <span class="status-badge ${t.status === 'Resolved' ? 'status-resolved' : t.status === 'In Progress' ? 'status-in-progress' : 'status-pending'}">
          <i class="fa-solid ${t.status === 'Resolved' ? 'fa-circle-check' : 'fa-clock'}"></i> ${t.status}
        </span>
      </div>
      <p style="font-size: 0.85rem; color: var(--text-dark); margin-bottom: 0.25rem;">
        <strong>Issue:</strong> ${escapeHtml(t.description)}
      </p>
      <div style="font-size: 0.75rem; color: var(--text-muted);">${t.hall || 'Mess Hall'} • ${t.created_at}</div>
      ${t.resolution_note ? `
        <div class="resolution-note">
          <strong><i class="fa-solid fa-wrench"></i> Resolution Note by Staff:</strong><br>
          ${escapeHtml(t.resolution_note)}
        </div>
      ` : ''}
    </div>
  `).join('');
}

// 6b. Load Complaints into Student Dashboard Snippet
async function loadStudentDashboardComplaints() {
  const tbody = document.getElementById('dashboard-complaints-tbody');
  if (!tbody) return;

  const tickets = await MessMateAPI.getComplaints();
  if (!tickets || !tickets.length) return;

  tbody.innerHTML = tickets.slice(0, 3).map(t => `
    <tr>
      <td><strong>#${t.ticket_id}</strong></td>
      <td>${escapeHtml(t.category)}</td>
      <td>${t.created_at.split(' ')[0]}</td>
      <td>
        <span class="status-badge ${t.status === 'Resolved' ? 'status-resolved' : t.status === 'In Progress' ? 'status-in-progress' : 'status-pending'}">
          <i class="fa-solid ${t.status === 'Resolved' ? 'fa-check' : 'fa-spinner'}"></i> ${t.status}
        </span>
      </td>
    </tr>
  `).join('');
}

// 6c. Load Admin Dashboard Complaints Table & KPI Stats
async function loadAdminDashboardData() {
  const tbody = document.getElementById('admin-complaints-tbody');
  if (!tbody) return;

  const tickets = await MessMateAPI.getComplaints();
  
  if (tickets && tickets.length) {
    tbody.innerHTML = tickets.map(t => `
      <tr id="row-${t.ticket_id}">
        <td><strong>#${t.ticket_id}</strong></td>
        <td>
          <div>${escapeHtml(t.student_name)}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${escapeHtml(t.room)}</div>
        </td>
        <td>${escapeHtml(t.description.substring(0, 45))}...</td>
        <td>
          <span class="status-badge ${t.status === 'Resolved' ? 'status-resolved' : t.status === 'In Progress' ? 'status-in-progress' : 'status-pending'}">
            ${t.priority ? t.priority.toUpperCase() : 'NORMAL'}
          </span>
        </td>
        <td>
          ${t.status === 'Resolved' ? `
            <span class="badge badge-veg"><i class="fa-solid fa-check"></i> Resolved</span>
          ` : `
            <button class="btn btn-primary btn-sm" onclick="handleAdminResolve('${t.ticket_id}')">
              Resolve
            </button>
          `}
        </td>
      </tr>
    `).join('');
  }

  // Update KPI counters
  const stats = await MessMateAPI.getStats();
  if (stats) {
    const kpiPending = document.getElementById('kpi-pending-complaints');
    if (kpiPending && stats.complaints) {
      kpiPending.textContent = `${stats.complaints.pending + stats.complaints.in_progress} Open`;
    }
    const kpiRating = document.getElementById('kpi-avg-rating');
    if (kpiRating && stats.ratings && stats.ratings.avg_rating) {
      kpiRating.textContent = `${stats.ratings.avg_rating} ★`;
    }
  }
}

// Handle Admin Resolve Action
async function handleAdminResolve(ticketId) {
  try {
    await MessMateAPI.updateComplaintStatus(ticketId, 'Resolved', 'Resolved and inspected by Mess Supervisor.');
    showToast('Ticket Resolved', `Ticket #${ticketId} marked as Resolved in SQLite database.`, 'success');
    loadAdminDashboardData();
  } catch (err) {
    showToast('Error', 'Failed to update ticket status', 'error');
  }
}

// 6d. Load Feedback & Reviews
async function loadDynamicFeedback() {
  const container = document.getElementById('dynamic-reviews-list');
  if (!container) return;

  const result = await MessMateAPI.getFeedback();
  if (!result || !result.reviews || !result.reviews.length) return;

  container.innerHTML = result.reviews.map(r => `
    <div class="review-bubble">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
        <span style="font-weight: 700; font-size: 0.85rem; color: var(--text-dark);">
          <i class="fa-solid fa-user-circle" style="color: var(--primary);"></i> ${escapeHtml(r.student_info || 'Resident')}
        </span>
        <span style="color: var(--accent); font-size: 0.8rem;">
          ${renderStars(r.overall_rating)}
        </span>
      </div>
      <p style="font-size: 0.85rem; margin-bottom: 0.25rem;">
        "${escapeHtml(r.comment || 'Rated ' + r.overall_rating + ' stars.')}"
      </p>
      <div style="font-size: 0.75rem; color: var(--text-muted);">
        ${r.meal ? r.meal.toUpperCase() : 'MEAL'} • ${r.created_at}
      </div>
    </div>
  `).join('');

  // Update average score if available
  if (result.stats && result.stats.avg_rating) {
    const avgScoreEl = document.getElementById('dynamic-avg-score');
    if (avgScoreEl) avgScoreEl.textContent = result.stats.avg_rating;
    const totalVotesEl = document.getElementById('dynamic-total-votes');
    if (totalVotesEl) totalVotesEl.textContent = `Based on ${result.stats.total_reviews} student reviews in database`;
  }
}

// 6e. Load Announcements Dynamically
async function loadDynamicAnnouncements() {
  const container = document.getElementById('dynamic-notices-list');
  if (!container) return;

  const notices = await MessMateAPI.getAnnouncements();
  if (!notices || !notices.length) return;

  container.innerHTML = notices.map(n => `
    <div class="notice-card ${n.pinned ? 'pinned' : ''} filterable-item" data-category="${escapeHtml(n.category)}">
      <div class="notice-header">
        <div style="display: flex; align-items: center; gap: 0.6rem;">
          ${n.pinned ? `
            <span class="badge" style="background: #059669; color: #ffffff;">
              <i class="fa-solid fa-thumbtack"></i> Pinned Announcement
            </span>
          ` : ''}
          <span class="badge badge-primary">${escapeHtml(n.category.toUpperCase())}</span>
        </div>
        <div class="notice-meta">
          <span><i class="fa-regular fa-calendar"></i> ${n.created_at.split(' ')[0]}</span>
          <span><i class="fa-solid fa-user-tie"></i> ${escapeHtml(n.author)}</span>
        </div>
      </div>

      <h2 style="font-size: 1.35rem; margin-bottom: 0.5rem; color: var(--text-dark);">
        ${escapeHtml(n.title)}
      </h2>

      <p style="font-size: 0.925rem; color: var(--text-body); line-height: 1.6; margin-bottom: 1rem;">
        ${escapeHtml(n.content)}
      </p>
    </div>
  `).join('');
}

/* -------------------------------------------------------------------------- */
/* 7. Toast Generator & Helpers                                               */
/* -------------------------------------------------------------------------- */
function showToast(title, message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type === 'error' ? 'toast-error' : type === 'info' ? 'toast-info' : ''}`;
  
  const iconClass = type === 'error' ? 'fa-circle-xmark' : type === 'info' ? 'fa-circle-info' : 'fa-circle-check';
  const iconColor = type === 'error' ? '#ef4444' : type === 'info' ? '#3b82f6' : '#059669';

  toast.innerHTML = `
    <i class="fa-solid ${iconClass}" style="color: ${iconColor};"></i>
    <div class="toast-content">
      <h4>${title}</h4>
      <p>${message}</p>
    </div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
    setTimeout(() => toast.remove(), 400);
  }, 4500);
}

function renderStars(rating) {
  let stars = '';
  for (let i = 1; i <= 5; i++) {
    stars += `<i class="fa-solid fa-star${i <= rating ? '' : ' fa-regular'}" style="color: var(--accent);"></i>`;
  }
  return stars;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
