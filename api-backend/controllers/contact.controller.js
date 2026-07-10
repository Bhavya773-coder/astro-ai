const { sendTemplatedEmail } = require('../email/emailService');

const submitContactForm = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required'
      });
    }

    // Send email to info@astroai4u.com
    await sendTemplatedEmail({
      to: 'info@astroai4u.com',
      subject: `New Contact Form Submission from ${name}`,
      text: `
        Name: ${name}
        Email: ${email}
        
        Message:
        ${message}
      `,
      replyTo: email
    });

    res.json({
      success: true,
      message: 'Your cosmic message has been sent. Our astronomers will be in touch shortly.'
    });
  } catch (error) {
    console.error('[ContactController] Error submitting contact form:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send your message. Please try again later.'
    });
  }
};

module.exports = { submitContactForm };
