const nodeMailer = require("nodemailer");

const tp = nodeMailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
  secure: true,
  port: 465,
});

async function sendEmail(to, subject, body) {
  await tp.sendMail({
    from: "abulamartins@gmail.com",
    to,
    subject,
    html: body,
  });
}

module.exports = {
  sendEmail,
};
