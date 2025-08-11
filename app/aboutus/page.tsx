import type { Metadata } from 'next';
import { AboutUs } from './aboutus';
import { AboutUsDetails } from './aboutus-details';
import OurGoals from './our-goals';
import OurTeams from './our-team';
export const metadata: Metadata = {
  title: 'About Us | Hope International',
  description:
    'Learn more about Hope International, our mission, vision, and our dedicated team. We are committed to providing the best caregiver training and elderly care services in Nepal.',
  openGraph: {
    title: 'About Us | Hope International',
    description:
      'Learn more about Hope International, our mission, vision, and our dedicated team. We are committed to providing the best caregiver training and elderly care services in Nepal.',
    url: 'https://hopeinternational.com.np/aboutus',
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
      <AboutUs />
      <AboutUsDetails />
      <OurGoals />
      <OurTeams />
    </>
  );
}
