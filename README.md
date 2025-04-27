Akshay Bookings — Hotel Room Reservation System

Live Demo: https://akshaybookings.vercel.app

🎉 Project Overview

Akshay Bookings is a dynamic hotel room reservation system built with React and Node.js/Express. It allows guests to easily book up to 5 rooms at a time, visualizes occupancy, and optimally assigns rooms to minimize travel time between selected rooms. The app also supports random occupancy generation and a full reset, all with a clean, responsive UI.


✨ Key Features

Optimal Room Assignment: Prioritizes same-floor bookings; falls back to cross-floor groups that minimize combined horizontal and vertical travel time.

Interactive Visualization: Displays floors and rooms in a grid; color codes available, booked, and newly assigned rooms.


User Controls:

Enter number of rooms to book (1–5)

Book: Finds and marks best rooms

Randomize: Generates random occupied rooms for testing

Reset: Clears all bookings

Responsive Design: Works seamlessly on desktop and mobile.


🚀 Technology Stack

Frontend: React, Vite, Axios, Tailwind CSS

Backend: Node.js, Express, CORS

Hosting: Render (API) & Vercel (UI)

Version Control: GitHub


🏗️ Installation & Local Setup

Clone the repository:

git clone https://github.com/akshayUniverse/Hotal_Registration.git
cd Hotal_Registration

Backend:

cd server
npm install
node index.js  # API runs on http://localhost:4000

Frontend:

cd client
npm install
npm run dev    # UI runs on http://localhost:5173


📦 Deployment

Backend: Hosted on Render — https://hotel-booking-backend-3e0x.onrender.com

Frontend: Hosted on Vercel — https://akshaybookings.vercel.app


🔗 API Endpoints

GET /api/rooms: Fetch the current room inventory.

POST /api/book: Book optimal rooms. Payload: { k: number }.

POST /api/random: Generate random room occupancy.

POST /api/reset: Reset all bookings.


🎨 Screenshots

https://docs.google.com/document/d/1eOndS5oAPeblrpo452GAx1VwSbEmVUuInefQnsIp5mQ/edit?usp=sharing


📄 License & Contact

Built by Akshay Karada (MCA ’25). Feel free to reach out:

Email: akshaykarada72.o@gmail.com

LinkedIn: https://linkedin.com/in/akshaykarada

GitHub: https://github.com/akshayUniverse

