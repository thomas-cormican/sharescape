const nodemailer = require("nodemailer");

var transporter = nodemailer.createTransport({
  host: "smtp-mail.outlook.com", // hostname
  secureConnection: false, // TLS requires secureConnection to be false
  port: 587, // port for secure SMTP
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

module.exports.sendEmail = (receiver, subject, message) => {
  process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

  var mailOptions = {
    from: "twitter-clone-app@outlook.com",
    to: receiver,
    subject: subject,
    text: `${message}`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};
