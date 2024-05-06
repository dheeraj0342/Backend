import ejs from "ejs";
import path from "path";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

export const sendMail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    service: process.env.SMTP_SERVICE,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });
  const { email, subject, template, data } = options;

  const templatePath = path.join(__dirname, '../mail',template);
  const html = await ejs.renderFile(templatePath, data);

  const mailOptions = {
    from: process.env.SMTP_EMAIL,
    to: email,
    subject,
    html,
  };

    await transporter.sendMail(mailOptions);
};

export default sendMail;
