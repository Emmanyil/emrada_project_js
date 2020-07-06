const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "emrada.server@gmail.com",
    pass: "Emrada2228125",
  },
  from: "Emrada <emrada.server@gmail.com>",
});

const mailer = (message) => {
  transporter.sendMail(message, (err, info) => {
    if (err) return console.log(err);
    console.log("Info", info);
  });
};

module.exports = mailer;
