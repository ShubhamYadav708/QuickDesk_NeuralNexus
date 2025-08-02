async function createTicket(subject, description, category) {
  const session = JSON.parse(localStorage.getItem('quickdesk_session'));

  const res = await fetch('http://localhost:5000/api/tickets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: session.token
    },
    body: JSON.stringify({
      subject,
      description,
      category
    })
  });

  const data = await res.json();
  if (res.ok) {
    alert('Ticket created successfully');
  } else {
    alert(data.msg || 'Server error');
  }
}
