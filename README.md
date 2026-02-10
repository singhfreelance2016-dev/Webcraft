# My Freelance Website Business

A complete system for managing freelance web design projects, including client request forms and an admin dashboard.

## 🚀 Features

### Client Request Form
- Multi-step form for detailed project requirements
- Mobile-responsive design
- File upload capability
- Form validation and auto-save
- Formspree integration for email notifications
- Success message with confirmation

### Admin Dashboard
- Password-protected access
- View all client requests
- Filter and search functionality
- Update project status
- Add private notes
- Export data to CSV
- Visual statistics and charts
- Responsive design

## 🛠️ Setup Instructions

### 1. Prerequisites
- GitHub account
- Netlify account
- Formspree account
- Modern web browser

### 2. Formspree Setup
1. Go to [Formspree.io](https://formspree.io) and sign up for free
2. Create a new form
3. Copy your form endpoint URL (looks like: `https://formspree.io/f/your-form-id`)
4. Replace `YOUR_FORMSPREE_ID_HERE` in `index.html` line 47 with your actual form ID

### 3. Deploy to Netlify
1. Push this code to a GitHub repository
2. Go to [Netlify](https://netlify.com) and sign in
3. Click "New site from Git"
4. Select your repository
5. Deploy with default settings

### 4. Configure Dashboard Password
1. Open `auth.js`
2. Change the `DEFAULT_PASSWORD` on line 12 to your secure password
3. Default password for demo: `admin123`

## 📁 Project Structure
