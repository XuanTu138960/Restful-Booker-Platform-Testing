/**
 * Restful-Booker-Platform Mock Server
 * Simulates the Spring Boot microservices backend and React SPA for the Restful-Booker Platform.
 * Supports:
 * - Authentication (/auth/login, /auth/validate, /auth/logout)
 * - Room Management (/room/)
 * - Booking Engine (/booking/, /booking/summary)
 * - Customer Messages (/message/)
 * - Hotel Branding & Reports (/branding/, /report/)
 * - High-speed in-memory database for JMeter load testing and Selenium UI automation
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const crypto = require('crypto');

const PORT = process.env.PORT || 3003;
const PUBLIC_DIR = path.join(__dirname, 'public');

// In-Memory Database
const state = {
  tokens: new Set(['booking_token_admin_test_123']),
  rooms: [
    {
      roomid: 1,
      roomName: '101 - Deluxe Ocean View',
      type: 'Single',
      accessible: true,
      image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&auto=format&fit=crop&q=80',
      description: 'Phòng đơn cao cấp nhìn ra biển, thiết kế tối giản, phong cách Booking.com chuẩn 4 sao.',
      features: ['WiFi', 'TV', 'Air Conditioning', 'Safe', 'Breakfast'],
      roomPrice: 120
    },
    {
      roomid: 2,
      roomName: '102 - Executive Suite',
      type: 'Suite',
      accessible: true,
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&auto=format&fit=crop&q=80',
      description: 'Phòng Suite thương gia rộng rãi, giường King size, bàn làm việc riêng và ban công thoáng đãng.',
      features: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Bathtub', 'Safe', 'Breakfast'],
      roomPrice: 250
    },
    {
      roomid: 3,
      roomName: '201 - Superior Double Room',
      type: 'Double',
      accessible: false,
      image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&auto=format&fit=crop&q=80',
      description: 'Phòng đôi tiêu chuẩn gia đình, ấm cúng và đầy đủ tiện nghi sinh hoạt hiện đại.',
      features: ['WiFi', 'TV', 'Air Conditioning', 'Safe'],
      roomPrice: 160
    },
    {
      roomid: 4,
      roomName: '202 - Presidential Penthouse',
      type: 'Suite',
      accessible: true,
      image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&auto=format&fit=crop&q=80',
      description: 'Căn hộ Penthouse đẳng cấp hoàng gia, tầm nhìn toàn cảnh 360 độ, dịch vụ phục vụ 24/7.',
      features: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Bathtub', 'Balcony', 'Safe', 'Breakfast'],
      roomPrice: 450
    }
  ],
  bookings: [
    {
      bookingid: 1,
      roomid: 1,
      firstname: 'Nguyen',
      lastname: 'Xuan Tu',
      depositpaid: true,
      bookingdates: {
        checkin: '2026-11-20',
        checkout: '2026-11-25'
      },
      email: '23010538@st.phenikaa-uni.edu.vn',
      phone: '0987654321',
      totalprice: 600
    }
  ],
  messages: [
    {
      id: 1,
      name: 'Nguyen Xuan Tu',
      email: '23010538@st.phenikaa-uni.edu.vn',
      phone: '0987654321',
      subject: 'Yeu cau dich vu don san bay',
      description: 'Toi muon hoi ve dich vu xe dua don tu san bay Noi Bai ve khach san vao ngay 20/11.',
      read: false
    }
  ],
  branding: {
    name: 'Restful-Booker Hotel & Resort (Booking.com Simulation)',
    mapUrl: 'https://maps.google.com',
    logoUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=100&auto=format&fit=crop&q=80',
    description: 'Hệ thống đặt phòng khách sạn trực tuyến chuẩn Restful-Booker Platform tích hợp mô phỏng nghiệp vụ Booking.com.',
    contact: {
      name: 'Shady Meadows B&B / Phenikaa Uni QA Team',
      address: 'Yen Nghia, Ha Dong, Ha Noi',
      phone: '024 1234 5678',
      email: 'contact@restful-booker.hotel.vn'
    }
  }
};

let nextRoomId = 5;
let nextBookingId = 2;
let nextMessageId = 2;

// Utility functions
function parseCookies(req) {
  const list = {};
  const rc = req.headers.cookie;
  if (rc) {
    rc.split(';').forEach(cookie => {
      const parts = cookie.split('=');
      list[parts.shift().trim()] = decodeURI(parts.join('='));
    });
  }
  return list;
}

function isAuthenticated(req) {
  const cookies = parseCookies(req);
  const authHeader = req.headers['authorization'] || req.headers['token'];
  // Check if explicit invalid token header or unauthenticated request
  if (req.headers['x-test-unauthorized'] === 'true') {
    return false;
  }
  const token = authHeader || cookies.token;
  return Boolean(token && token.trim().length > 0 && state.tokens.has(token));
}

function sendJson(res, statusCode, data, headers = {}) {
  const body = JSON.stringify(data);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization, token',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    ...headers
  });
  res.end(body);
}

function sendText(res, statusCode, text, headers = {}) {
  res.writeHead(statusCode, {
    'Content-Type': 'text/plain',
    'Access-Control-Allow-Origin': '*',
    ...headers
  });
  res.end(text);
}

function serveStatic(req, res, pathname) {
  let safePath = pathname === '/' ? '/index.html' : pathname;
  let filePath = path.join(PUBLIC_DIR, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon'
    };

    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
}

// Request Handler
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // CORS Preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization, token',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    });
    res.end();
    return;
  }

  // Read Body Helper
  let bodyBuffer = '';
  req.on('data', chunk => {
    bodyBuffer += chunk;
  });

  req.on('end', () => {
    let body = {};
    if (bodyBuffer) {
      try {
        body = JSON.parse(bodyBuffer);
      } catch (e) {
        body = {};
      }
    }

    // ==========================================
    // 1. AUTH SERVICE (/auth/*)
    // ==========================================
    if (pathname === '/auth/login' && method === 'POST') {
      const { username, password } = body;
      if (username === 'admin' && password === 'password') {
        const token = 'token_' + crypto.randomBytes(8).toString('hex');
        state.tokens.add(token);
        return sendJson(res, 200, { token }, {
          'Set-Cookie': `token=${token}; Path=/; HttpOnly; SameSite=Lax`
        });
      } else {
        return sendJson(res, 403, { error: 'Bad credentials', message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
      }
    }

    if (pathname === '/auth/validate' && method === 'POST') {
      const token = body.token || parseCookies(req).token || req.headers['token'];
      if (token && state.tokens.has(token)) {
        return sendJson(res, 200, { token });
      } else {
        return sendJson(res, 403, { error: 'Invalid token' });
      }
    }

    if (pathname === '/auth/logout' && method === 'POST') {
      const token = parseCookies(req).token || req.headers['token'];
      if (token) state.tokens.delete(token);
      return sendJson(res, 200, { message: 'Logged out successfully' }, {
        'Set-Cookie': 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT'
      });
    }

    // ==========================================
    // 2. BRANDING SERVICE (/branding/*)
    // ==========================================
    if (pathname === '/branding/' || pathname === '/branding') {
      if (method === 'GET') {
        return sendJson(res, 200, state.branding);
      }
      if (method === 'PUT') {
        if (!isAuthenticated(req)) return sendJson(res, 403, { error: 'Unauthorized' });
        state.branding = { ...state.branding, ...body };
        return sendJson(res, 200, state.branding);
      }
    }

    // ==========================================
    // 3. ROOM SERVICE (/room/*)
    // ==========================================
    if (pathname === '/room/' || pathname === '/room') {
      if (method === 'GET') {
        return sendJson(res, 200, { rooms: state.rooms });
      }
      if (method === 'POST') {
        if (!isAuthenticated(req)) {
          return sendJson(res, 403, { error: 'Unauthorized: Admin authentication required' });
        }
        if (!body.roomName || !body.type || !body.roomPrice) {
          return sendJson(res, 400, { error: 'Missing required room fields' });
        }
        const newRoom = {
          roomid: nextRoomId++,
          roomName: body.roomName,
          type: body.type,
          accessible: Boolean(body.accessible),
          image: body.image || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&auto=format&fit=crop&q=80',
          description: body.description || 'Phòng tiêu chuẩn khách sạn cao cấp.',
          features: body.features || ['WiFi', 'TV', 'Air Conditioning'],
          roomPrice: Number(body.roomPrice) || 100
        };
        state.rooms.push(newRoom);
        return sendJson(res, 201, newRoom);
      }
    }

    // Single room operations /room/{id}
    const roomMatch = pathname.match(/^\/room\/(\d+)$/);
    if (roomMatch) {
      const roomId = parseInt(roomMatch[1], 10);
      const roomIndex = state.rooms.findIndex(r => r.roomid === roomId);

      if (method === 'GET') {
        if (roomIndex === -1) return sendJson(res, 404, { error: 'Room not found' });
        return sendJson(res, 200, state.rooms[roomIndex]);
      }
      if (method === 'PUT') {
        if (!isAuthenticated(req)) return sendJson(res, 403, { error: 'Unauthorized' });
        if (roomIndex === -1) return sendJson(res, 404, { error: 'Room not found' });
        state.rooms[roomIndex] = { ...state.rooms[roomIndex], ...body };
        return sendJson(res, 200, state.rooms[roomIndex]);
      }
      if (method === 'DELETE') {
        if (!isAuthenticated(req)) return sendJson(res, 403, { error: 'Unauthorized' });
        if (roomIndex === -1) return sendJson(res, 404, { error: 'Room not found' });
        state.rooms.splice(roomIndex, 1);
        return sendJson(res, 202, { message: 'Room deleted successfully' });
      }
    }

    // ==========================================
    // 4. BOOKING SERVICE (/booking/*)
    // ==========================================
    if (pathname === '/booking/summary') {
      const summaries = state.bookings.map(b => ({
        roomid: b.roomid,
        bookingdates: b.bookingdates
      }));
      return sendJson(res, 200, { bookings: summaries });
    }

    if (pathname === '/booking/' || pathname === '/booking') {
      if (method === 'GET') {
        return sendJson(res, 200, { bookings: state.bookings });
      }
      if (method === 'POST') {
        const { roomid, firstname, lastname, depositpaid, bookingdates, email, phone } = body;

        // Validation
        const errors = [];
        if (!firstname || firstname.trim().length < 3) errors.push('Họ tên đệm (firstname) tối thiểu 3 ký tự');
        if (!lastname || lastname.trim().length < 3) errors.push('Tên (lastname) tối thiểu 3 ký tự');
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Email không đúng định dạng');
        if (!phone || phone.trim().length < 10) errors.push('Số điện thoại tối thiểu 10 chữ số');
        if (!bookingdates || !bookingdates.checkin || !bookingdates.checkout) errors.push('Vui lòng chọn ngày nhận và trả phòng');
        if (bookingdates && bookingdates.checkin >= bookingdates.checkout) errors.push('Ngày trả phòng phải sau ngày nhận phòng');

        if (errors.length > 0) {
          return sendJson(res, 400, { error: 'Validation failed', errors });
        }

        // Room existence check
        const targetRoom = state.rooms.find(r => r.roomid === Number(roomid));
        if (!targetRoom) {
          return sendJson(res, 404, { error: 'Phòng không tồn tại' });
        }

        // Conflict check
        const conflict = state.bookings.find(b =>
          b.roomid === Number(roomid) &&
          !(bookingdates.checkout <= b.bookingdates.checkin || bookingdates.checkin >= b.bookingdates.checkout)
        );
        if (conflict) {
          return sendJson(res, 409, { error: 'Phòng đã được đặt trong khoảng thời gian này, vui lòng chọn ngày khác' });
        }

        const nights = Math.max(1, Math.round((new Date(bookingdates.checkout) - new Date(bookingdates.checkin)) / (1000 * 60 * 60 * 24)));
        const totalprice = nights * targetRoom.roomPrice;

        const newBooking = {
          bookingid: nextBookingId++,
          roomid: Number(roomid),
          firstname: firstname.trim(),
          lastname: lastname.trim(),
          depositpaid: depositpaid !== undefined ? Boolean(depositpaid) : true,
          bookingdates: {
            checkin: bookingdates.checkin,
            checkout: bookingdates.checkout
          },
          email: email.trim(),
          phone: phone.trim(),
          totalprice
        };

        state.bookings.push(newBooking);
        return sendJson(res, 201, {
          bookingid: newBooking.bookingid,
          booking: newBooking
        });
      }
    }

    const bookingMatch = pathname.match(/^\/booking\/(\d+)$/);
    if (bookingMatch) {
      const bId = parseInt(bookingMatch[1], 10);
      const bIndex = state.bookings.findIndex(b => b.bookingid === bId);

      if (method === 'GET') {
        if (bIndex === -1) return sendJson(res, 404, { error: 'Booking not found' });
        return sendJson(res, 200, state.bookings[bIndex]);
      }
      if (method === 'DELETE') {
        if (!isAuthenticated(req)) return sendJson(res, 403, { error: 'Unauthorized' });
        if (bIndex === -1) return sendJson(res, 404, { error: 'Booking not found' });
        state.bookings.splice(bIndex, 1);
        return sendJson(res, 200, { message: 'Booking cancelled successfully' });
      }
    }

    // ==========================================
    // 5. MESSAGE SERVICE (/message/*)
    // ==========================================
    if (pathname === '/message/' || pathname === '/message') {
      if (method === 'GET') {
        if (!isAuthenticated(req)) return sendJson(res, 403, { error: 'Unauthorized' });
        return sendJson(res, 200, { messages: state.messages });
      }
      if (method === 'POST') {
        const { name, email, phone, subject, description } = body;
        const errors = [];
        if (!name || name.trim().length < 3) errors.push('Tên người gửi tối thiểu 3 ký tự');
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Email không hợp lệ');
        if (!phone || phone.trim().length < 10) errors.push('Số điện thoại tối thiểu 10 chữ số');
        if (!subject || subject.trim().length < 5) errors.push('Tiêu đề tối thiểu 5 ký tự');
        if (!description || description.trim().length < 10) errors.push('Nội dung tin nhắn tối thiểu 10 ký tự');

        if (errors.length > 0) {
          return sendJson(res, 400, { error: 'Validation failed', errors });
        }

        const msg = {
          id: nextMessageId++,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          subject: subject.trim(),
          description: description.trim(),
          read: false,
          created_at: new Date().toISOString()
        };
        state.messages.push(msg);
        return sendJson(res, 201, msg);
      }
    }

    const msgMatch = pathname.match(/^\/message\/(\d+)$/);
    if (msgMatch) {
      const msgId = parseInt(msgMatch[1], 10);
      const msgIndex = state.messages.findIndex(m => m.id === msgId);

      if (method === 'GET') {
        if (!isAuthenticated(req)) return sendJson(res, 403, { error: 'Unauthorized' });
        if (msgIndex === -1) return sendJson(res, 404, { error: 'Message not found' });
        return sendJson(res, 200, state.messages[msgIndex]);
      }
      if (method === 'DELETE') {
        if (!isAuthenticated(req)) return sendJson(res, 403, { error: 'Unauthorized' });
        if (msgIndex === -1) return sendJson(res, 404, { error: 'Message not found' });
        state.messages.splice(msgIndex, 1);
        return sendJson(res, 200, { message: 'Message deleted successfully' });
      }
    }

    // ==========================================
    // 6. REPORT SERVICE (/report/*)
    // ==========================================
    if (pathname === '/report/' || pathname === '/report') {
      const reportData = {
        totalRooms: state.rooms.length,
        totalBookings: state.bookings.length,
        totalRevenue: state.bookings.reduce((sum, b) => sum + (b.totalprice || 0), 0),
        unreadMessages: state.messages.filter(m => !m.read).length
      };
      return sendJson(res, 200, reportData);
    }

    // Reset Endpoint for Automated Tests (Test teardown)
    if (pathname === '/api/reset' && method === 'POST') {
      state.tokens = new Set(['booking_token_admin_test_123']);
      return sendJson(res, 200, { message: 'Database reset to default test state' });
    }

    // Fallback: Static Files
    serveStatic(req, res, pathname);
  });
});

server.listen(PORT, () => {
  console.log(`[Restful-Booker-Platform] Server running at http://localhost:${PORT}`);
  console.log(`- API Base: http://localhost:${PORT}/`);
  console.log(`- Frontend: http://localhost:${PORT}/index.html`);
});
