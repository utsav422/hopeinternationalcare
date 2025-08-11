import type { Metadata } from 'next';
import { ContactUs } from './contactus';
import { ContactUsCard } from './contactus-card';
import { ContactUsForm } from './contactus-form';

export const metadata: Metadata = {
  title: 'Contact Us | Hope International',
  description:
    'Get in touch with Hope International. We are always available for your queries and feedbacks. Find our contact details and location here.',
  openGraph: {
    title: 'Contact Us | Hope International',
    description:
      'Get in touch with Hope International. We are always available for your queries and feedbacks. Find our contact details and location here.',
    url: 'https://hopeinternational.com.np/contactus',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function Campaign() {
  return (
    <>
      <ContactUs />
      <ContactUsCard />
      <ContactUsForm />
    </>
  );
}
