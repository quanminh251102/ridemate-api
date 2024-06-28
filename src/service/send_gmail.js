const nodemailer = require("nodemailer");
const Mailgen = require('mailgen');
const EMAIL = process.env.EMAIL;
const PASSWORD = process.env.PASSWORD;

const send_gmail = async () => {
  try {
    console.log('send gmail');
    //const { userEmail } = req.body;
    let userEmail = "skill1sp2@gmail.com"

    let config = {
      service: 'gmail',
      auth: {
        user: EMAIL,
        pass: PASSWORD
      }
    }

    let transporter = nodemailer.createTransport(config);

    let MailGenerator = new Mailgen({
      theme: "default",
      product: {
        name: "Together we go",
        link: 'https://mailgen.js/'
      }
    })

    let response = {
      body: {
        name: "Nguyễn Hoàng Kiệt",
        intro: "Here is code to reset password",
        // table: {
        //   data: [
        //     {
        //       item: "Nodemailer Stack Book",
        //       description: "A Backend application",
        //       price: "$10.99",
        //     }
        //   ]
        // },
        // outro: "Looking forward to do more business"
      }
    }

    let mail = MailGenerator.generate(response)

    let message = {
      from: EMAIL,
      to: userEmail,
      subject: "Reset Password",
      html: mail
    }

    transporter.sendMail(message);

  } catch (error) {
    console.log(error);
  }

};

module.exports = {
  send_gmail,
};