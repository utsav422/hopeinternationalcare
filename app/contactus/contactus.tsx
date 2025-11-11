'use client';

export function ContactUs() {
    return (
        <div className="relative min-h-[50vh] w-full bg-[url('/image/dot-pattern.png')] bg-auto bg-gray-100 bg-left bg-no-repeat dark:bg-gray-900">
            <div className="absolute inset-0 h-full w-full bg-teal-700/90 dark:bg-teal-800/80" />
            <section className="mx-auto flex w-full max-w-4xl animate-fade-down flex-col items-center px-3 py-20 duration-500 sm:py-24 md:py-32">
                <div className="container relative z-10 mx-auto my-auto grid place-items-center text-center">
                    <h1 className="mt-20 mb-4 w-full animate-fade-down text-center font-bold text-4xl text-white duration-500 sm:text-5xl lg:w-10/12">
                        Contact Us
                    </h1>

                    <h2 className="mt-5 mb-10 w-full max-w-lg animate-fade-down text-center font-normal text-white text-xl duration-500 sm:text-2xl lg:w-10/12">
                        We are always available for your queries and feedbacks,
                        please feel free to contact us from given details.
                    </h2>
                </div>
            </section>
        </div>
    );
}
