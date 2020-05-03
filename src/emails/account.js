const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email,name)=>{
    sgMail.send({
      to:email,
      from :'cbshrestha24@gmail.com',
      subject:"Thank you for joining",
      text:`Welcome to the app, ${name}. let me know how you get along with the app`
    })
}

const sendCancelationEmail = (email,name)=>{
    sgMail.send({
        to:email,
        from :'cbshrestha24@gmail.com',
        subject:'sorry to see you GO',
        text:`sorry to see you go, ${name}. can you please tell us why you are living?`
    })
}


module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
}
