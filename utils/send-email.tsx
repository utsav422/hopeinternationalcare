export async function sendEmail(data: FormData) {
    const apiEndpoint = `${process.env.NEXT_PUBLIC_SITE_URL}/api/email`;

    try {
        const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(Object.fromEntries(data)),
        });

        const result = await response.json();

        if (response.ok) {
            alert(result.message || 'Email sent successfully!');
            return { success: true, data: result };
        } else {
            alert(result.error || 'Failed to send email');
            return { success: false, error: result.error };
        }
    } catch (error) {
        console.error('Error sending email:', error);
        alert('Failed to send email. Please try again.');
        return { success: false, error: 'Network error' };
    }
}
