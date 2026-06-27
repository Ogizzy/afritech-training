
const APP = {
  adminPassword: 'admin123',
  whatsapp: '2348020779363',
  whatsappGroup: 'https://chat.whatsapp.com/Fl7YooMkrDF9KQvqZBZuZH?s=cl&p=a&ilr=1',
  flutterwavePublicKey: 'FLWPUBK_TEST-xxxxxxxxxxxxxxxxxxxxx-X',
  amount: 150000
};

function openWhatsApp(){ window.open(APP.whatsappGroup, '_blank'); }
function openGroup(){ window.open(APP.whatsappGroup, '_blank'); }

function getCandidates(){ return JSON.parse(localStorage.getItem('afdicCandidates') || '[]'); }
function saveCandidates(data){ localStorage.setItem('afdicCandidates', JSON.stringify(data)); }
function getMessages(){ return JSON.parse(localStorage.getItem('afdicMessages') || '[]'); }
function saveMessages(data){ localStorage.setItem('afdicMessages', JSON.stringify(data)); }

function nextTracking(){
  const year = new Date().getFullYear();
  const count = Number(localStorage.getItem('afdicSeq') || 0) + 1;
  localStorage.setItem('afdicSeq', count);
  return `AFDIC-${year}-${String(count).padStart(6, '0')}`;
}

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

const regForm = document.getElementById('regForm');
if(regForm){
  regForm.addEventListener('submit', e => {
    e.preventDefault();

    const candidates = getCandidates();
    const email = document.getElementById('email').value.trim().toLowerCase();
    const phone = document.getElementById('phone').value.trim().replace(/\s+/g, '');

    if(candidates.some(c => String(c.email).toLowerCase() === email)){
      alert('This email address has already been used for registration.');
      return;
    }

    if(candidates.some(c => String(c.phone).replace(/\s+/g, '') === phone)){
      alert('This phone number has already been used for registration.');
      return;
    }

    const c = {
      trackingNo: nextTracking(),
      fullName: fullName.value.trim(),
      email,
      phone,
      gender: gender.value,
      country: country.value,
      state: state.value,
      education: education.value,
      skill: skill.value,
      laptop: laptop.value,
      internet: internet.value,
      reason: reason.value.trim(),
      status: 'Pending',
      paymentStatus: 'Not Paid',
      date: new Date().toLocaleString()
    };

    candidates.push(c);
    saveCandidates(candidates);

    if(document.getElementById('successMessage')){
      document.getElementById('successMessage').innerHTML =
        `<div class="alert alert-success">Registration submitted successfully. Your tracking number is <b>${c.trackingNo}</b>.</div><p>${emailText(c).replace(/\n/g, '<br>')}</p>`;
      new bootstrap.Modal(document.getElementById('successModal')).show();
    } else {
      alert('Registration submitted successfully. Tracking Number: ' + c.trackingNo);
    }

    console.log('AUTO EMAIL MESSAGE:', emailText(c));
    e.target.reset();
  });
}

const contactForm = document.getElementById('contactForm');
if(contactForm){
  contactForm.addEventListener('submit', e => {
    e.preventDefault();

    const msg = {
      id: Date.now(),
      name: contactName.value.trim(),
      email: contactEmail.value.trim(),
      subject: contactSubject.value.trim(),
      message: contactMessage.value.trim(),
      status: 'Unread',
      date: new Date().toLocaleString()
    };

    const messages = getMessages();
    messages.unshift(msg);
    saveMessages(messages);

    alert('Message sent successfully. Admin can view it on the dashboard.');
    e.target.reset();
  });
}

function loginAdmin(){
  const pass = document.getElementById('adminPass');
  if(pass && pass.value === APP.adminPassword){
    document.getElementById('loginBox')?.classList.add('d-none');
    document.getElementById('dash')?.classList.remove('d-none');
    renderCandidates();
    renderMessages();
    pass.value = '';
  } else {
    alert('Incorrect password');
  }
}

function logoutAdmin(){
  document.getElementById('dash')?.classList.add('d-none');
  document.getElementById('loginBox')?.classList.remove('d-none');
}

function renderCandidates(){
  const rows = document.getElementById('candidateRows');
  if(!rows) return;

  const q = (document.getElementById('searchBox')?.value || '').toLowerCase();
  const fs = document.getElementById('filterStatus')?.value || '';
  const all = getCandidates();

  const data = all.filter(c =>
    (!fs || c.status === fs || c.paymentStatus === fs) &&
    Object.values(c).join(' ').toLowerCase().includes(q)
  );

  rows.innerHTML = data.map(c => {
    const i = all.findIndex(x => x.trackingNo === c.trackingNo);
    const label = c.paymentStatus === 'Paid' ? 'Paid' : c.status;
    const payBtn = c.status === 'Approved' ? `<button class="btn btn-sm btn-primary" onclick="makePayment(${i})">Pay</button>` : '';
    return `<tr>
      <td><b>${c.trackingNo}</b></td>
      <td>${c.fullName}</td>
      <td>${c.email}</td>
      <td>${c.phone}</td>
      <td>${c.gender}</td>
      <td>${c.country}</td>
      <td>${c.state}</td>
      <td>${c.education}</td>
      <td>${c.skill}</td>
      <td>${c.laptop}</td>
      <td>${c.internet}</td>
      <td>${c.reason}</td>
      <td><span class="status ${label}">${label}</span></td>
      <td>${c.date}</td>
      <td class="admin-actions">
        <button class="btn btn-sm btn-success" onclick="setStatus(${i},'Approved')">Approve</button>
        <button class="btn btn-sm btn-danger" onclick="setStatus(${i},'Rejected')">Reject</button>
        ${payBtn}
        <button class="btn btn-sm btn-outline-danger" onclick="deleteCandidate(${i})">Delete</button>
      </td>
    </tr>`;
  }).join('') || `<tr><td colspan="15" class="text-center py-4">No registered candidate found</td></tr>`;

  const total = document.getElementById('statTotal');
  const approved = document.getElementById('statApproved');
  const rejected = document.getElementById('statRejected');
  const paid = document.getElementById('statPaid');
  if(total) total.textContent = all.length;
  if(approved) approved.textContent = all.filter(c => c.status === 'Approved').length;
  if(rejected) rejected.textContent = all.filter(c => c.status === 'Rejected').length;
  if(paid) paid.textContent = all.filter(c => c.paymentStatus === 'Paid').length;
}

function setStatus(i, status){
  const data = getCandidates();
  if(data[i]){
    data[i].status = status;
    saveCandidates(data);
    renderCandidates();
  }
}

function deleteCandidate(i){
  if(confirm('Delete this candidate?')){
    const data = getCandidates();
    data.splice(i, 1);
    saveCandidates(data);
    renderCandidates();
  }
}

function clearAll(){
  if(confirm('Clear all candidate data?')){
    localStorage.removeItem('afdicCandidates');
    renderCandidates();
  }
}

function renderMessages(){
  const rows = document.getElementById('messageRows');
  if(!rows) return;

  const messages = getMessages();

  rows.innerHTML = messages.map((msg, i) => `
    <tr>
      <td><span class="status ${msg.status}">${msg.status}</span></td>
      <td>${msg.name}</td>
      <td>${msg.email}</td>
      <td>${msg.subject}</td>
      <td>${msg.message}</td>
      <td>${msg.date}</td>
      <td>
        <button class="btn btn-sm btn-success" onclick="markMessageRead(${i})">Mark Read</button>
        <button class="btn btn-sm btn-outline-danger" onclick="deleteMessage(${i})">Delete</button>
      </td>
    </tr>
  `).join('') || `<tr><td colspan="7" class="text-center py-4">No contact message found</td></tr>`;

  const statMessages = document.getElementById('statMessages');
  if(statMessages) statMessages.textContent = messages.length;
}

function markMessageRead(i){
  const messages = getMessages();
  if(messages[i]){
    messages[i].status = 'Read';
    saveMessages(messages);
    renderMessages();
  }
}

function deleteMessage(i){
  if(confirm('Delete this message?')){
    const messages = getMessages();
    messages.splice(i, 1);
    saveMessages(messages);
    renderMessages();
  }
}

function clearMessages(){
  if(confirm('Clear all messages?')){
    localStorage.removeItem('afdicMessages');
    renderMessages();
  }
}

function exportExcel(){
  const data = getCandidates();
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Candidates');
  XLSX.writeFile(wb, 'AFDIC_AI_Training_Candidates.xlsx');
}

function makePayment(i){
  const data = getCandidates();
  const c = data[i];

  if(!c || c.status !== 'Approved'){
    alert('Candidate must be approved after orientation before payment.');
    return;
  }

  if(!window.FlutterwaveCheckout){
    alert('Flutterwave script not loaded. Check internet connection.');
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
    callback: function(response){
      if(response.status === 'successful' || response.status === 'completed'){
        data[i].paymentStatus = 'Paid';
        data[i].paymentRef = response.transaction_id || response.tx_ref;
        saveCandidates(data);
        renderCandidates();
        alert('Payment successful and candidate marked as paid.');
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.feature-card,.benefit-tile,.cardx,.contact-box,.contact-info-card,.contact-form-card,.stat').forEach(el => el.classList.add('reveal'));
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('show');
        observer.unobserve(entry.target);
      }
    });
  }, {threshold:.12});
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
});
