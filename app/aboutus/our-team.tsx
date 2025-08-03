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
    <section className="py-8">
      <div className="container mx-auto grid animate-fade grid-cols-1 place-items-center gap-10 duration-500 lg:grid-cols-3">
        <div className="col-span-3 lg:py-20">
          <h2 className="mb-4 animate-fade text-center font-bold text-4xl text-black duration-500">
            Our Team
          </h2>
          <p className="mb-4 animate-fade px-3 text-center font-normal text-gray-700 text-lg duration-500 lg:px-0">
            Meet our highly experienced and dedicated team who are always there
            for your career guidance and support.
          </p>

          <div className="col-span-2 mt-20 grid animate-fade grid-cols-1 justify-center gap-x-10 duration-500 sm:grid-cols-3">
            {Users.map(({ image, username, description }, _: number) => (
              <div className="flex flex-col items-center px-10" key={username}>
                <div className="relative h-48 w-48 transform overflow-hidden rounded-full border-4 border-teal-500 transition-transform hover:scale-105">
                  <Image
                    alt={`${username} profile`}
                    className="h-full w-full object-cover"
                    height={192}
                    src={image}
                    width={192}
                  />
                </div>
                <h3 className="mt-4 mb-2 animate-fade text-center font-bold text-gray-900 text-lg duration-500">
                  {username}
                </h3>
                <p className="animate-fade text-center font-normal text-gray-600 text-lg duration-500">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default OurTeams;
