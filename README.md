# QuickDesk_NeuralNexus
This is a project we are building for odoo hackathon in round-1.

Our Frontend is added inside backend folder's public directory.

# QuickDesk - Helpdesk Ticketing System

QuickDesk is a simple helpdesk ticketing system where users can raise support tickets, and admins can manage them. It includes features like user registration, login, ticket creation, and admin ticket controls.

## Features

✅ User registration and login  
✅ JWT-based authentication  
✅ Role-based authorization (user/admin)  
✅ Create, view, update, delete tickets  
✅ Vote on tickets  
✅ Responsive and clean user interface  
✅ Built with Node.js, Express, MySQL, and vanilla JS/CSS  

## Project Structure

QuickDesk/
├── public/
│ ├── index.html
│ ├── signin.html
│ ├── signup.html
│ ├── dashboard.html
│ ├── style.css
│ └── script.js
├── routes/
│ ├── auth.js
│ └── ticket.js
├── models/
│ ├── UserModel.js
│ └── TicketModel.js
├── middleware/
│ └── verifyToken.js
├── db.js
├── server.js
├── .env
└── package.json
