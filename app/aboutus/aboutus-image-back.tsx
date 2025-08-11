import Image from 'next/image';

interface AboutusImageBackgroundCardProps {
  image: string;
}

export function AboutusImageBackgroundCard({
  image,
}: AboutusImageBackgroundCardProps) {
  return (
    <div className="relative mt-4 overflow-hidden rounded-xl border-8 border-white shadow-lg dark:border-gray-800">
      <Image
        alt="About us background"
        className="h-auto w-full object-cover transition-transform duration-300 ease-in-out hover:scale-105"
        height={400}
        layout="responsive"
        src={image}
        width={600}
      />
    </div>
  );
}

export default AboutusImageBackgroundCard;
