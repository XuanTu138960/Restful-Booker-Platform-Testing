/**
 * Restful-Booker Platform Client App
 * Connects frontend UI to Restful-Booker REST API services
 */

let allRooms = [];
let currentAdminToken = localStorage.getItem('rbp_admin_token') || null;

document.addEventListener('DOMContentLoaded', () => {
  initDatePickers();
  loadRooms();
  setupEventListeners();
  checkAdminSession();
});

function initDatePickers() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const checkinInput = document.getElementById('booking-checkin');
  const checkoutInput = document.getElementById('booking-checkout');

  if (checkinInput && checkoutInput) {
    const todayStr = today.toISOString().split('T')[0];
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    checkinInput.min = todayStr;
    checkoutInput.min = tomorrowStr;
    checkinInput.value = todayStr;
    checkoutInput.value = tomorrowStr;
  }
}

// 1. Load Rooms from /room/
async function loadRooms() {
  const loadingEl = document.getElementById('rooms-loading');
  const gridEl = document.getElementById('rooms-grid');

  try {
    const res = await fetch('/room/');
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    allRooms = data.rooms || [];
    renderRooms(allRooms);
  } catch (err) {
    gridEl.innerHTML = `<div class="alert-box alert-danger">Không thể tải danh sách phòng: ${err.message}</div>`;
  } finally {
    if (loadingEl) loadingEl.style.display = 'none';
  }
}

function renderRooms(rooms) {
  const gridEl = document.getElementById('rooms-grid');
  if (!rooms || rooms.length === 0) {
    gridEl.innerHTML = `<p class="text-muted" style="grid-column: 1/-1; text-align: center;">Không có phòng nào phù hợp với bộ lọc.</p>`;
    return;
  }

  gridEl.innerHTML = rooms.map(room => `
    <div class="room-card" data-roomid="${room.roomid}">
      <div class="room-image-wrap">
        <img src="${room.image}" alt="${room.roomName}" class="room-image" onerror="this.src='https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&auto=format&fit=crop&q=80'">
        <div class="room-price-badge">$${room.roomPrice} / đêm</div>
      </div>
      <div class="room-body">
        <h3 class="room-title">${room.roomName}</h3>
        <div class="room-badges">
          <span class="badge badge-info">${room.type}</span>
          ${room.accessible ? `<span class="badge badge-accessible">Hỗ trợ tiếp cận</span>` : ''}
        </div>
        <p class="room-desc">${room.description || 'Phòng tiêu chuẩn khách sạn cao cấp đầy đủ tiện nghi.'}</p>
        <div class="room-features">
          ${(room.features || []).map(f => `<span class="feature-tag">✓ ${f}</span>`).join('')}
        </div>
        <button class="btn btn-primary btn-book-room" data-roomid="${room.roomid}">Đặt phòng ngay</button>
      </div>
    </div>
  `).join('');

  // Attach event to "Book this room" buttons
  document.querySelectorAll('.btn-book-room').forEach(btn => {
    btn.addEventListener('click', () => {
      const roomId = parseInt(btn.getAttribute('data-roomid'), 10);
      openBookingModal(roomId);
    });
  });
}

// 2. Booking Modal Logic
function openBookingModal(roomId) {
  const room = allRooms.find(r => r.roomid === roomId);
  if (!room) return;

  document.getElementById('booking-roomid').value = room.roomid;
  document.getElementById('modal-room-title').textContent = `Đặt phòng: ${room.roomName}`;
  document.getElementById('summary-room-type').textContent = room.type;
  document.getElementById('summary-room-price').textContent = `$${room.roomPrice} / đêm`;

  const alertBox = document.getElementById('booking-alert');
  alertBox.style.display = 'none';
  alertBox.className = 'alert-box';
  alertBox.textContent = '';

  document.getElementById('booking-modal').style.display = 'flex';
}

function closeBookingModal() {
  document.getElementById('booking-modal').style.display = 'none';
}

// 3. Setup All Event Listeners
function setupEventListeners() {
  // Search Filter
  document.getElementById('btn-search-rooms').addEventListener('click', () => {
    const typeFilter = document.getElementById('filter-type').value;
    const accessFilter = document.getElementById('filter-accessible').value;

    const filtered = allRooms.filter(r => {
      const matchType = typeFilter === 'ALL' || r.type === typeFilter;
      const matchAccess = accessFilter === 'ALL' || String(r.accessible) === accessFilter;
      return matchType && matchAccess;
    });
    renderRooms(filtered);
  });

  // Modal Close buttons
  document.getElementById('btn-close-modal').addEventListener('click', closeBookingModal);
  document.getElementById('btn-cancel-booking').addEventListener('click', closeBookingModal);

  // Booking Form Submit
  document.getElementById('booking-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const alertBox = document.getElementById('booking-alert');
    alertBox.style.display = 'none';

    const roomid = parseInt(document.getElementById('booking-roomid').value, 10);
    const checkin = document.getElementById('booking-checkin').value;
    const checkout = document.getElementById('booking-checkout').value;
    const firstname = document.getElementById('booking-firstname').value.trim();
    const lastname = document.getElementById('booking-lastname').value.trim();
    const email = document.getElementById('booking-email').value.trim();
    const phone = document.getElementById('booking-phone').value.trim();

    const payload = {
      roomid,
      firstname,
      lastname,
      depositpaid: true,
      bookingdates: { checkin, checkout },
      email,
      phone
    };

    try {
      const res = await fetch('/booking/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        const errorMsg = data.errors ? data.errors.join('<br>') : (data.error || 'Đặt phòng thất bại');
        alertBox.className = 'alert-box alert-danger';
        alertBox.innerHTML = errorMsg;
        alertBox.style.display = 'block';
      } else {
        alertBox.className = 'alert-box alert-success';
        alertBox.innerHTML = `<strong>Đặt phòng thành công!</strong> Mã đặt phòng của bạn là <strong>#${data.bookingid}</strong>. Tổng thanh toán: <strong>$${data.booking.totalprice}</strong>. Xác nhận đã được gửi tới ${email}.`;
        alertBox.style.display = 'block';

        setTimeout(() => {
          closeBookingModal();
          document.getElementById('booking-form').reset();
          initDatePickers();
        }, 3000);
      }
    } catch (err) {
      alertBox.className = 'alert-box alert-danger';
      alertBox.textContent = `Lỗi kết nối máy chủ: ${err.message}`;
      alertBox.style.display = 'block';
    }
  });

  // Contact Form Submit
  document.getElementById('contact-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const alertBox = document.getElementById('contact-alert');
    alertBox.style.display = 'none';

    const name = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const phone = document.getElementById('contact-phone').value.trim();
    const subject = document.getElementById('contact-subject').value.trim();
    const description = document.getElementById('contact-description').value.trim();

    try {
      const res = await fetch('/message/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, subject, description })
      });
      const data = await res.json();

      if (!res.ok) {
        const errorMsg = data.errors ? data.errors.join('<br>') : (data.error || 'Gửi liên hệ thất bại');
        alertBox.className = 'alert-box alert-danger';
        alertBox.innerHTML = errorMsg;
        alertBox.style.display = 'block';
      } else {
        alertBox.className = 'alert-box alert-success';
        alertBox.innerHTML = `<strong>Cảm ơn bạn!</strong> Tin nhắn đã được gửi thành công đến ban quản trị khách sạn. Chúng tôi sẽ phản hồi sớm nhất qua email ${email}.`;
        alertBox.style.display = 'block';
        document.getElementById('contact-form').reset();
      }
    } catch (err) {
      alertBox.className = 'alert-box alert-danger';
      alertBox.textContent = `Lỗi gửi tin nhắn: ${err.message}`;
      alertBox.style.display = 'block';
    }
  });

  // Admin Modal open/close
  document.getElementById('btn-open-admin').addEventListener('click', () => {
    document.getElementById('admin-modal').style.display = 'flex';
  });
  document.getElementById('btn-close-admin-modal').addEventListener('click', () => {
    document.getElementById('admin-modal').style.display = 'none';
  });

  // Admin Login Submit
  document.getElementById('admin-login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const alertBox = document.getElementById('admin-login-alert');
    alertBox.style.display = 'none';

    const username = document.getElementById('admin-username').value.trim();
    const password = document.getElementById('admin-password').value.trim();

    try {
      const res = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (!res.ok) {
        alertBox.className = 'alert-box alert-danger';
        alertBox.textContent = data.message || data.error || 'Sai tên đăng nhập hoặc mật khẩu';
        alertBox.style.display = 'block';
      } else {
        currentAdminToken = data.token;
        localStorage.setItem('rbp_admin_token', data.token);
        showAdminDashboard();
      }
    } catch (err) {
      alertBox.className = 'alert-box alert-danger';
      alertBox.textContent = `Lỗi xác thực: ${err.message}`;
      alertBox.style.display = 'block';
    }
  });

  // Admin Logout
  document.getElementById('btn-admin-logout').addEventListener('click', async () => {
    try {
      await fetch('/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': currentAdminToken, 'token': currentAdminToken }
      });
    } catch (e) {}
    currentAdminToken = null;
    localStorage.removeItem('rbp_admin_token');
    showAdminLogin();
  });

  // Admin Tabs
  document.getElementById('tab-btn-rooms').addEventListener('click', () => {
    document.getElementById('tab-btn-rooms').classList.add('active');
    document.getElementById('tab-btn-messages').classList.remove('active');
    document.getElementById('admin-tab-rooms-content').style.display = 'block';
    document.getElementById('admin-tab-messages-content').style.display = 'none';
  });

  document.getElementById('tab-btn-messages').addEventListener('click', () => {
    document.getElementById('tab-btn-messages').classList.add('active');
    document.getElementById('tab-btn-rooms').classList.remove('active');
    document.getElementById('admin-tab-rooms-content').style.display = 'none';
    document.getElementById('admin-tab-messages-content').style.display = 'block';
    loadAdminMessages();
  });

  // Admin Create Room Form
  document.getElementById('admin-create-room-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const alertBox = document.getElementById('admin-room-alert');
    alertBox.style.display = 'none';

    const roomName = document.getElementById('create-room-name').value.trim();
    const type = document.getElementById('create-room-type').value;
    const accessible = document.getElementById('create-room-accessible').value === 'true';
    const roomPrice = parseFloat(document.getElementById('create-room-price').value);
    const description = document.getElementById('create-room-desc').value.trim();

    try {
      const res = await fetch('/room/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': currentAdminToken,
          'token': currentAdminToken
        },
        body: JSON.stringify({
          roomName,
          type,
          accessible,
          roomPrice,
          description,
          features: ['WiFi', 'TV', 'Air Conditioning']
        })
      });

      if (!res.ok) {
        const data = await res.json();
        alertBox.className = 'alert-box alert-danger';
        alertBox.textContent = data.error || 'Không thể tạo phòng mới';
        alertBox.style.display = 'block';
      } else {
        alertBox.className = 'alert-box alert-success';
        alertBox.textContent = 'Đã thêm phòng mới thành công!';
        alertBox.style.display = 'block';
        document.getElementById('admin-create-room-form').reset();
        await loadRooms();
        loadAdminDashboardData();
      }
    } catch (err) {
      alertBox.className = 'alert-box alert-danger';
      alertBox.textContent = `Lỗi tạo phòng: ${err.message}`;
      alertBox.style.display = 'block';
    }
  });
}

// 4. Admin Session & Data Management
async function checkAdminSession() {
  if (!currentAdminToken) {
    showAdminLogin();
    return;
  }

  try {
    const res = await fetch('/auth/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'token': currentAdminToken },
      body: JSON.stringify({ token: currentAdminToken })
    });
    if (res.ok) {
      showAdminDashboard();
    } else {
      localStorage.removeItem('rbp_admin_token');
      currentAdminToken = null;
      showAdminLogin();
    }
  } catch (e) {
    showAdminLogin();
  }
}

function showAdminLogin() {
  document.getElementById('admin-login-view').style.display = 'block';
  document.getElementById('admin-dashboard-view').style.display = 'none';
}

function showAdminDashboard() {
  document.getElementById('admin-login-view').style.display = 'none';
  document.getElementById('admin-dashboard-view').style.display = 'block';
  loadAdminDashboardData();
}

async function loadAdminDashboardData() {
  // 1. Report stats
  try {
    const res = await fetch('/report/');
    if (res.ok) {
      const stats = await res.json();
      document.getElementById('stat-rooms').textContent = stats.totalRooms || 0;
      document.getElementById('stat-bookings').textContent = stats.totalBookings || 0;
      document.getElementById('stat-messages').textContent = stats.unreadMessages || 0;
    }
  } catch (e) {}

  // 2. Admin rooms table
  const tbody = document.getElementById('admin-rooms-tbody');
  tbody.innerHTML = allRooms.map(room => `
    <tr>
      <td>${room.roomid}</td>
      <td><strong>${room.roomName}</strong></td>
      <td><span class="badge badge-info">${room.type}</span></td>
      <td>$${room.roomPrice}</td>
      <td>${room.accessible ? '✓ Có' : '✗ Không'}</td>
      <td>
        <button class="btn-delete btn-delete-room" data-roomid="${room.roomid}">Xóa</button>
      </td>
    </tr>
  `).join('');

  document.querySelectorAll('.btn-delete-room').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-roomid');
      if (confirm(`Bạn có chắc chắn muốn xóa phòng #${id}?`)) {
        try {
          const res = await fetch(`/room/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': currentAdminToken, 'token': currentAdminToken }
          });
          if (res.ok) {
            await loadRooms();
            loadAdminDashboardData();
          } else {
            alert('Không thể xóa phòng');
          }
        } catch (e) {
          alert('Lỗi: ' + e.message);
        }
      }
    });
  });
}

async function loadAdminMessages() {
  const container = document.getElementById('admin-messages-list');
  try {
    const res = await fetch('/message/', {
      headers: { 'Authorization': currentAdminToken, 'token': currentAdminToken }
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    const messages = data.messages || [];

    if (messages.length === 0) {
      container.innerHTML = '<p class="text-muted">Không có tin nhắn nào từ khách hàng.</p>';
      return;
    }

    container.innerHTML = messages.map(msg => `
      <div class="message-item" data-msgid="${msg.id}">
        <div class="message-content">
          <h5>${msg.subject}</h5>
          <div class="message-meta">
            Người gửi: <strong>${msg.name}</strong> (${msg.email}) | SĐT: ${msg.phone}
          </div>
          <p>${msg.description}</p>
        </div>
        <button class="btn-delete btn-delete-msg" data-msgid="${msg.id}">Xóa</button>
      </div>
    `).join('');

    document.querySelectorAll('.btn-delete-msg').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-msgid');
        try {
          const res = await fetch(`/message/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': currentAdminToken, 'token': currentAdminToken }
          });
          if (res.ok) {
            loadAdminMessages();
            loadAdminDashboardData();
          }
        } catch (e) {}
      });
    });
  } catch (err) {
    container.innerHTML = `<div class="alert-box alert-danger">Lỗi tải tin nhắn: ${err.message}</div>`;
  }
}
