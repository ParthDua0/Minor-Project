const nodeMailer=require('nodemailer')
const dotenv=require('dotenv')
dotenv.config()

module.exports = async({email , subject , message}) =>{
    if (!email || typeof email !== 'string' || !email.trim()) {
        throw new Error('Email recipient is required')
    }

    const transport = nodeMailer.createTransport({
        host:process.env.SMTP_HOST,
        service:process.env.SMTP_SERVICE,
        port:process.env.SMTP_PORT,
        auth:{
            user:process.env.SMTP_MAIL,
            pass:process.env.SMTP_PASSWORD,
        }
    })

    const option ={
        from:process.env.SMTP_MAIL,
        to:email.trim(),
        subject,
        html:message
    }
    await transport.sendMail(option)
}
 
