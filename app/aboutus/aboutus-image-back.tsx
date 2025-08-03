import Image from 'next/image';

interface AboutusImageBackgroundCardProps {
  image: string;
}

export function AboutusImageBackgroundCard({
  image,
}: AboutusImageBackgroundCardProps) {
  return (
    <Image
      alt="About us background"
      className="h-200 w-200 border-4 border-white object-cover shadow-lg"
      height={200}
      src={image}
      style={{
        marginTop: '15px',
        borderRadius: '10px',
        borderWidth: '10px',
        borderColor: 'white',
      }}
      width={200}
    />
  );
}

export default AboutusImageBackgroundCard;
