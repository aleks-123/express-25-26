const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_ADDRESS,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  transporter.verify((err, succ) => {
    if (err) {
      console.log(err.message);
    } else {
      console.log("success sending the message");
    }
  });

  const mailOptions = {
    from: "Semos Academy <semos@academy.mk>",
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
    //   options.htmlMessage ||
    //   `
    // <h3>Hello from the mail</h3>
    // `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
