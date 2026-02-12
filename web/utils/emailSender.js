const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.sendEmailWithAttachment = async ({
  to,
  subject,
  text,
  attachmentPath,
  attachmentName
}) => {
  await transporter.sendMail({
    from: `"EduAI" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    attachments: [
      {
        filename: attachmentName,
        path: attachmentPath
      }
    ]
  });
};
