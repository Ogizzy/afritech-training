
const APP = {
  whatsapp: '2348020779363',
  whatsappGroup: 'https://chat.whatsapp.com/Fl7YooMkrDF9KQvqZBZuZH?s=cl&p=a&ilr=1',
  flutterwavePublicKey: 'FLWPUBK_TEST-xxxxxxxxxxxxxxxxxxxxx-X',
  amount: 150000
};

let candidatesData = [];
let messagesData = [];

function openWhatsApp(){ window.open(APP.whatsappGroup, '_blank'); }
function openGroup(){ window.open(APP.whatsappGroup, '_blank'); }

function emailText(c){
  return `Dear ${c.fullName},

Thank you for registering for the Afri-Tech Online AI Training with Coding.

Your registration has been received successfully.

Tracking Number: ${c.trackingNo}

Before making payment, you are required to join our official WhatsApp Orientation Group for proper guidance, orientation, and payment instructions.

Training Fee: ₦150,000
Training Period: 1st – 30th August 2026

Join WhatsApp Orientation Group:
${APP.whatsappGroup}

Thank you.
Afri-Tech Team`;
}

async function api(endpoint, options = {}) {
  const res = await fetch('backend/' + endpoint, {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  return res.json();
}

const hasSwal = typeof Swal !== 'undefined';
const Toast = hasSwal ? Swal.mixin({
  toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, timerProgressBar: true
}) : null;

function toast(opts) {
  if (Toast) Toast.fire(opts);
  else alert(opts.title || '');
}

async function swalConfirm(opts) {
  if (hasSwal) return Swal.fire(opts);
  return { isConfirmed: confirm(opts.text || 'Are you sure?') };
}

function esc(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function showReason(id) {
  const c = candidatesData.find(x => x.id === id);
  if (!c) return;
  document.getElementById('reasonModalBody').textContent = c.reason;
  new bootstrap.Modal(document.getElementById('reasonModal')).show();
}

function showMessage(id) {
  const msg = messagesData.find(x => x.id === id);
  if (!msg) return;
  document.getElementById('messageModalTitle').textContent = 'Message: ' + msg.subject;
  document.getElementById('messageModalBody').textContent = msg.message;
  new bootstrap.Modal(document.getElementById('messageModal')).show();
}

const regForm = document.getElementById('regForm');
if (regForm) {
  regForm.addEventListener('submit', async e => {
    e.preventDefault();

    const payload = {
      fullName: document.getElementById('fullName').value.trim(),
      email: document.getElementById('email').value.trim().toLowerCase(),
      phone: document.getElementById('phone').value.trim().replace(/\s+/g, ''),
      gender: document.getElementById('gender').value,
      country: document.getElementById('country').value,
      state: document.getElementById('state').value,
      education: document.getElementById('education').value,
      skill: document.getElementById('skill').value,
      laptop: document.getElementById('laptop').value,
      internet: document.getElementById('internet').value,
      reason: document.getElementById('reason').value.trim()
    };

    const res = await api('register.php', { method: 'POST', body: payload });

    if (res.success) {
      const c = { ...payload, trackingNo: res.trackingNo };
      if (document.getElementById('successMessage')) {
        document.getElementById('successMessage').innerHTML =
          `<div class="alert alert-success">Registration submitted successfully. Your tracking number is <b>${c.trackingNo}</b>.</div><p>${emailText(c).replace(/\n/g, '<br>')}</p>`;
        new bootstrap.Modal(document.getElementById('successModal')).show();
      } else {
        alert('Registration submitted successfully. Tracking Number: ' + c.trackingNo);
      }
      regForm.reset();
    } else {
      alert(res.message || 'Registration failed');
    }
  });
}

const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async e => {
    e.preventDefault();

    const payload = {
      name: document.getElementById('contactName').value.trim(),
      email: document.getElementById('contactEmail').value.trim(),
      subject: document.getElementById('contactSubject').value.trim(),
      message: document.getElementById('contactMessage').value.trim()
    };

    const res = await api('contact.php', { method: 'POST', body: payload });

    if (res.success) {
      alert('Message sent successfully.');
      contactForm.reset();
    } else {
      alert(res.message || 'Failed to send message');
    }
  });
}

async function loginAdmin() {
  const pass = document.getElementById('adminPass');
  if (!pass) return;

  const res = await api('admin.php?action=login', { method: 'POST', body: { password: pass.value } });

  if (res.success) {
    document.getElementById('loginBox')?.classList.add('d-none');
    document.getElementById('dash')?.classList.remove('d-none');
    pass.value = '';
    await Promise.all([renderCandidates(), renderMessages()]);
  } else {
    toast({ icon: 'error', title: 'Incorrect password' });
  }
}

async function logoutAdmin() {
  await api('admin.php?action=logout', { method: 'POST' });
  document.getElementById('dash')?.classList.add('d-none');
  document.getElementById('loginBox')?.classList.remove('d-none');
}

async function renderCandidates() {
  const rows = document.getElementById('candidateRows');
  if (!rows) return;

  const res = await api('admin.php?action=get_candidates');
  if (!res.success) return;
  candidatesData = res.data;

  const q = (document.getElementById('searchBox')?.value || '').toLowerCase();
  const fs = document.getElementById('filterStatus')?.value || '';

  const data = candidatesData.filter(c =>
    (!fs || c.status === fs || c.paymentStatus === fs) &&
    Object.values(c).join(' ').toLowerCase().includes(q)
  );

  rows.innerHTML = data.map(c => {
    const label = c.paymentStatus === 'Paid' ? 'Paid' : c.status;
    const isApproved = c.status === 'Approved';
    const approveBtn = !isApproved ? `<button class="btn btn-sm btn-success" onclick="setStatus(${c.id},'Approved')">Approve</button>` : '';
    const payBtn = isApproved ? `<button class="btn btn-sm btn-primary" onclick="makePayment(${c.id})">Pay</button>` : '';
    const longReason = c.reason.length > 10;
    const shortReason = longReason ? esc(c.reason.substring(0, 10)) + '...' : esc(c.reason);
    const reasonLink = longReason ? ` <a href="javascript:void(0)" onclick="showReason(${c.id})" class="text-decoration-none fw-bold">Read more</a>` : '';
    return `<tr>
      <td><b>${esc(c.trackingNo)}</b></td>
      <td>${esc(c.fullName)}</td>
      <td>${esc(c.email)}</td>
      <td>${esc(c.phone)}</td>
      <td>${esc(c.gender)}</td>
      <td>${esc(c.country)}</td>
      <td>${esc(c.state)}</td>
      <td>${esc(c.education)}</td>
      <td>${esc(c.skill)}</td>
      <td>${esc(c.laptop)}</td>
      <td>${esc(c.internet)}</td>
      <td>${shortReason}${reasonLink}</td>
      <td><span class="status ${label}">${esc(label)}</span></td>
      <td>${esc(c.date)}</td>
      <td class="admin-actions">
        ${approveBtn}
        <button class="btn btn-sm btn-danger" onclick="setStatus(${c.id},'Rejected')">Reject</button>
        ${payBtn}
        <button class="btn btn-sm btn-outline-danger" onclick="deleteCandidate(${c.id})">Delete</button>
      </td>
    </tr>`;
  }).join('') || `<tr><td colspan="15" class="text-center py-4">No registered candidate found</td></tr>`;

  updateStats();
}

async function updateStats() {
  const total = document.getElementById('statTotal');
  const approved = document.getElementById('statApproved');
  const rejected = document.getElementById('statRejected');
  const paid = document.getElementById('statPaid');
  if (total) total.textContent = candidatesData.length;
  if (approved) approved.textContent = candidatesData.filter(c => c.status === 'Approved').length;
  if (rejected) rejected.textContent = candidatesData.filter(c => c.status === 'Rejected').length;
  if (paid) paid.textContent = candidatesData.filter(c => c.paymentStatus === 'Paid').length;
}

async function setStatus(id, status) {
  const label = status === 'Approved' ? 'approve' : 'reject';
  const icon = status === 'Approved' ? 'question' : 'warning';
  const color = status === 'Approved' ? '#28a745' : '#dc3545';
  const result = await swalConfirm({
    title: `Are you sure?`,
    text: `You are about to ${label} this candidate.`,
    icon, showCancelButton: true, confirmButtonColor: color, confirmButtonText: `Yes, ${label}!`
  });
  if (!result.isConfirmed) return;
  const res = await api('admin.php?action=update_status', { method: 'POST', body: { id, status } });
  if (res.success) {
    await renderCandidates();
    toast({ icon: 'success', title: `Candidate ${label}d` });
  }
}

async function deleteCandidate(id) {
  const result = await swalConfirm({
    title: 'Delete candidate?',
    text: 'This action cannot be undone.',
    icon: 'error', showCancelButton: true, confirmButtonColor: '#dc3545', confirmButtonText: 'Yes, delete!'
  });
  if (!result.isConfirmed) return;
  const res = await api('admin.php?action=delete_candidate', { method: 'POST', body: { id } });
  if (res.success) {
    await renderCandidates();
    toast({ icon: 'success', title: 'Candidate deleted' });
  }
}

async function clearAll() {
  const result = await swalConfirm({
    title: 'Clear all candidates?',
    text: 'This will permanently delete all candidate records.',
    icon: 'warning', showCancelButton: true, confirmButtonColor: '#dc3545', confirmButtonText: 'Yes, clear all!'
  });
  if (!result.isConfirmed) return;
  const res = await api('admin.php?action=clear_candidates', { method: 'POST' });
  if (res.success) {
    await renderCandidates();
    toast({ icon: 'success', title: 'All candidates cleared' });
  }
}

async function renderMessages() {
  const rows = document.getElementById('messageRows');
  if (!rows) return;

  const res = await api('admin.php?action=get_messages');
  if (!res.success) return;
  messagesData = res.data;

  rows.innerHTML = messagesData.map(msg => {
    const longMsg = msg.message.length > 10;
    const shortMsg = longMsg ? esc(msg.message.substring(0, 10)) + '...' : esc(msg.message);
    const msgLink = longMsg ? ` <a href="javascript:void(0)" onclick="showMessage(${msg.id})" class="text-decoration-none fw-bold">Read more</a>` : '';
    return `<tr>
      <td><span class="status ${esc(msg.status)}">${esc(msg.status)}</span></td>
      <td>${esc(msg.name)}</td>
      <td>${esc(msg.email)}</td>
      <td>${esc(msg.subject)}</td>
      <td>${shortMsg}${msgLink}</td>
      <td>${esc(msg.date)}</td>
      <td>
        <button class="btn btn-sm btn-success" onclick="markMessageRead(${msg.id})">Mark Read</button>
        <button class="btn btn-sm btn-outline-danger" onclick="deleteMessage(${msg.id})">Delete</button>
      </td>
    </tr>`;
  }).join('') || `<tr><td colspan="7" class="text-center py-4">No contact message found</td></tr>`;
}

async function markMessageRead(id) {
  const res = await api('admin.php?action=mark_read', { method: 'POST', body: { id } });
  if (res.success) {
    await renderMessages();
    toast({ icon: 'success', title: 'Message marked as read' });
  }
}

async function deleteMessage(id) {
  const result = await swalConfirm({
    title: 'Delete message?',
    text: 'This action cannot be undone.',
    icon: 'error', showCancelButton: true, confirmButtonColor: '#dc3545', confirmButtonText: 'Yes, delete!'
  });
  if (!result.isConfirmed) return;
  const res = await api('admin.php?action=delete_message', { method: 'POST', body: { id } });
  if (res.success) {
    await renderMessages();
    toast({ icon: 'success', title: 'Message deleted' });
  }
}

async function clearMessages() {
  const result = await swalConfirm({
    title: 'Clear all messages?',
    text: 'This will permanently delete all contact messages.',
    icon: 'warning', showCancelButton: true, confirmButtonColor: '#dc3545', confirmButtonText: 'Yes, clear all!'
  });
  if (!result.isConfirmed) return;
  const res = await api('admin.php?action=clear_messages', { method: 'POST' });
  if (res.success) {
    await renderMessages();
    toast({ icon: 'success', title: 'All messages cleared' });
  }
}

function exportExcel() {
  const data = candidatesData;
  if (!data.length) { toast({ icon: 'warning', title: 'No data to export' }); return; }
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Candidates');
  XLSX.writeFile(wb, 'AFDIC_AI_Training_Candidates.xlsx');
}

function exportPDF() {
  const data = candidatesData;
  if (!data.length) { toast({ icon: 'warning', title: 'No data to export' }); return; }
  if (typeof jspdf === 'undefined' && typeof window.jspdf === 'undefined') {
    alert('PDF library not loaded');
    return;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text('AFDIC AI Training - Candidates', 14, 15);
  doc.autoTable({
    startY: 22,
    head: [['Tracking No', 'Name', 'Email', 'Phone', 'Status', 'Payment']],
    body: data.map(c => [c.trackingNo, c.fullName, c.email, c.phone, c.status, c.paymentStatus]),
    styles: { fontSize: 8 }
  });
  doc.save('AFDIC_AI_Training_Candidates.pdf');
}

async function makePayment(id) {
  const c = candidatesData.find(x => x.id === id);
  if (!c || c.status !== 'Approved') {
    toast({ icon: 'warning', title: 'Candidate must be approved before payment.' });
    return;
  }

  if (!window.FlutterwaveCheckout) {
    toast({ icon: 'error', title: 'Flutterwave script not loaded.' });
    return;
  }

  FlutterwaveCheckout({
    public_key: APP.flutterwavePublicKey,
    tx_ref: c.trackingNo + '-' + Date.now(),
    amount: APP.amount,
    currency: 'NGN',
    payment_options: 'card,banktransfer,ussd',
    customer: { email: c.email, phone_number: c.phone, name: c.fullName },
    customizations: { title: 'Afri-Tech AI Training', description: 'AI Training Payment', logo: 'assets/images/logo.jpg' },
    callback: async function(response){
      if (response.status === 'successful' || response.status === 'completed') {
        await api('admin.php?action=update_payment', {
          method: 'POST',
          body: { id, paymentStatus: 'Paid', paymentRef: response.transaction_id || response.tx_ref }
        });
        await renderCandidates();
        toast({ icon: 'success', title: 'Payment successful!' });
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.feature-card,.benefit-tile,.cardx,.contact-box,.contact-info-card,.contact-form-card,.stat').forEach(el => el.classList.add('reveal'));
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        observer.unobserve(entry.target);
      }
    });
  }, {threshold:.12});
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
});
