const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');

const app = express();
const PORT = process.env.PORT ;
app.use(cors());
// MongoDB Connection
async function connectToMongoDB() {
    try {
        await mongoose.connect(
            process.env.MONGOURL,
            { useNewUrlParser: true, useUnifiedTopology: true }
        );
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('Unable to connect to MongoDB:', error);
    }
}
connectToMongoDB(); // Call the async function to connect to MongoDB

// Define a Schema and Model for storing form submissions
const ContactSchema = new mongoose.Schema({
    name: String,
    email: String,
    message: String,
    subject:String,
    date: { type: Date, default: Date.now },
});

const Contact = mongoose.model('Contact', ContactSchema);

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// Configure Nodemailer Transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'pallavihanwat000@gmail.com', // Replace with your Gmail address
        pass: 'ucje mlae hmxx qxgz', // Use your App Password
    },
});

// Route to handle form submission, send emails, and store data
app.post('/send-email', async (req, res) => {
    const { name, email, message,subject } = req.body;

    try {
        // Save the contact details to MongoDB
        const newContact = new Contact({ name, email, message });
        await newContact.save();

        // Automated Confirmation Email to the User
        const confirmationMailOptions = {
            from: 'pallavihanwat000@gmail.com', // Your Gmail address
            to: email, // User's email
            subject: 'Thank You for Contacting Us!',
            text: `Hi ${name},\nThank you for reaching out to us. We have received your message:\n"${message}"\nWe will get back to you shortly.\nBest regards,\nYour Company Name`,
        };

        // Notification Email to Admin (You)
        const notificationMailOptions = {
            from: email, // User's email
            to: 'pallavihanwat000@gmail.com', // Your Gmail address
            subject: subject,
            text: `You have received a new contact form submission:\n\nName: ${name}\nEmail: ${email}\nMessage: ${message}`,
        };

        // Send Automated Confirmation Email to the User
        await transporter.sendMail(confirmationMailOptions);

        // Send Notification Email to Admin (You)
        await transporter.sendMail(notificationMailOptions);

        res.status(200).send('Emails sent successfully');
    } catch (error) {
        console.error('Error sending emails:', error);
        res.status(500).send('Error sending emails');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
