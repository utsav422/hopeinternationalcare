import CarouselFeatures from './carousel-features';
import Hero from './hero';
import OurCoursesOverview from './our-courses-overview';
import OurServices from './our-services';
import WhyChooseUs from './why-choose-us';

export default function Home() {
  return (
    <>
      <Hero />
      <OurServices />
      <OurCoursesOverview />
      <WhyChooseUs />
      {/* <FeatureCourseCard/> */}
      <CarouselFeatures />
      {/* <main className="flex-1 flex flex-col gap-6 px-4">
                <h2 className="font-medium text-xl mb-4">Next steps</h2>
                {hasEnvVars ? <SignUpUserSteps /> : <ConnectSupabaseSteps />}
            </main> */}
    </>
  );
}
