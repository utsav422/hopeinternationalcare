'use client';

import { HomeIcon, InboxIcon } from '@heroicons/react/24/outline';
import { PhoneIcon } from '@heroicons/react/24/solid';
import FeatureCard from '@/components/Custom/feature-card';

export function ContactUsCard() {
  const CONTACTTYPE = [
    {
      icon: PhoneIcon,
      title: 'Phone number',
      description: 'Tel: +977-980-10813999',
    },
    {
      icon: InboxIcon,
      title: 'Email Us',
      description: 'info@hopeinternationalcare.org',
    },
    {
      icon: HomeIcon,
      title: 'Visit Office',
      description:
        'Durga Bhawan, Rudramati Marga, Anamnagar, Kathmandu, Nepal (behind Occidental Public School)',
    },
  ];

  return (
    <div className="relative mt-20 mb-10 min-h-[50vh] w-full bg-cover bg-no-repeat">
      <div className="absolute inset-0 h-full w-full" />
      <section className="mx-auto flex w-full max-w-4xl flex-col items-center px-4 py-4">
        <div className="container relative z-10 mx-auto my-auto grid animate-fade-down place-items-center text-center duration-500">
          <div>
            <div className="col-span-2 grid grid-cols-1 gap-10 px-2 sm:grid-cols-3">
              {CONTACTTYPE.map(({ icon, title, description }, _: number) => (
                <div
                  className="animate-fade cursor-pointer rounded-lg bg-white p-2 shadow-md duration-500 hover:bg-teal-100"
                  key={title}
                >
                  <FeatureCard icon={icon} key={title} title={title}>
                    {description}
                  </FeatureCard>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
