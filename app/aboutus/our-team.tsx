'use client';

import Image from 'next/image';

const Users = [
  {
    image: '/image/ourteam1.png',
    username: 'Aasha Bhattarai ',
    description: '(CEO/ Founder)',
  },
  {
    image: '/image/team2.jpeg',
    username: 'Monika Bhatta',
    description: '(Trainer)',
  },
  {
    image: '/image/ourteam3.jpeg',
    username: 'Deepika Pokharel',
    description: '(Councellor)',
  },
];

export function OurTeams() {
  return (
    <section className="py-16 md:py-24 dark:bg-gray-900">
      <div className="container mx-auto animate-fade-up text-center duration-500">
        <h2 className="mb-4 font-bold text-4xl text-gray-900 dark:text-white">
          Our Team
        </h2>
        <p className="mb-12 px-3 font-normal text-gray-700 text-lg lg:px-0 dark:text-gray-300">
          Meet our highly experienced and dedicated team who are always there
          for your career guidance and support.
        </p>

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {Users.map(({ image, username, description }) => (
            <div
              className="flex transform flex-col items-center rounded-lg bg-white p-6 shadow-lg transition-transform duration-300 hover:scale-105 dark:bg-gray-800"
              key={username}
            >
              <div className="relative h-48 w-48 overflow-hidden rounded-full border-4 border-teal-500">
                <Image
                  alt={`${username} profile`}
                  className="h-full w-full object-cover"
                  height={192}
                  src={image}
                  width={192}
                />
              </div>
              <h3 className="mt-4 mb-2 font-bold text-gray-900 text-lg dark:text-white">
                {username}
              </h3>
              <p className="font-normal text-gray-600 text-lg dark:text-gray-400">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default OurTeams;
