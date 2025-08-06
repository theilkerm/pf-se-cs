import nodemailer from 'nodemailer';

interface EmailOptions {
    email: string;
    subject: string;
    message: string;
}

const sendEmail = async (options: EmailOptions) => {
    // 1) Create a transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    // 2) Define the email options
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: options.email,
        subject: options.subject,
        text: options.message,
        // html: can be added for styled emails
    };

    // 3) Actually send the email
    await transporter.sendMail(mailOptions);
};

export default sendEmail;