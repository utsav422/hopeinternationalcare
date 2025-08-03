'use client';

export function ContactUs() {
  return (
    <div className="relative min-h-screen/2 w-full bg-[url('/image/dot-pattern.png')] bg-auto bg-grey-100 bg-left bg-no-repeat">
      <div className="absolute inset-0 h-full w-full bg-teal-700 opacity-90" />
      <section className="mx-auto flex w-full max-w-4xl animate-fade-down flex-col items-center px-3 py-10 duration-500">
        <div className="container relative z-10 mx-auto my-auto grid place-items-center text-center">
          <h1 className="mt-20 mb-0 w-full animate-fade-down text-center font-bold text-3xl text-white duration-500 lg:w-10/12">
            Contact Us
          </h1>

          <h2 className="mt-5 mr-10 mb-10 w-1/2 max-w-lg animate-fade-down text-center font-normal text-white text-xl duration-500 lg:w-10/10">
            We are always available for your queries and feedbacks, please feel
            free to contact us from given details.
          </h2>
        </div>
      </section>
    </div>
  );
}
