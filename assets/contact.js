document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;

            // --- Open User's Email Client --- 
            const mailtoSubject = `Website Contact Form: Message from ${name}`;
            const mailtoBody = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;

            // This creates a mailto link and simulates a click to open the email client
            const mailtoLink = `mailto:MJHArtist65@gmail.com?subject=${encodeURIComponent(mailtoSubject)}&body=${encodeURIComponent(mailtoBody)}`;
            
            window.location.href = mailtoLink;

            // Provide feedback to the user
            if (formStatus) {
                formStatus.textContent = "Your email client should now be open. Thank you!";
                formStatus.style.color = "#ffe066";
            }
            
            // Clear the form after a short delay
            setTimeout(() => {
                contactForm.reset();
            }, 2000);
        });
    }
});
