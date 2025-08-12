import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_email(to_email, subject, body):
    from_email = "sjlchoudhari@gmail.com"         # Replace with your sender email
    password = "vcig ddpk lqoi uaay"  # Use App Password if using Gmail SMTP

    try:
        msg = MIMEMultipart()
        msg['From'] = from_email
        msg['To'] = to_email
        msg['Subject'] = subject

        msg.attach(MIMEText(body, 'plain'))

        # SMTP Setup (for Gmail, use smtp.gmail.com and App Passwords)
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(from_email, password)
        server.send_message(msg)
        server.quit()

        print(f"Email sent successfully to {to_email}")

    except Exception as e:
        print(f"Failed to send email: {e}")
