import Image from 'next/image';

interface AboutusImageBackgroundCardProps {
  image: string;
}

export function AboutusImageBackgroundCard({
  image,
}: AboutusImageBackgroundCardProps) {
  return (
    <div className="relative mt-4 overflow-hidden rounded-xl border-8 border-white shadow-lg dark:border-gray-700">
      <Image
        alt="About us background"
        className="h-auto w-full object-cover"
        height={400} // Increased height for better visual impact
        src={image}
        width={600} // Increased width for better visual impact
        layout="responsive" // Make image responsive
      />
    </div>
  );
}

export default AboutusImageBackgroundCard;