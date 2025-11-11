'use client';

export function AboutUs() {
    return (
        <div className="relative min-h-[50vh] w-full bg-[url('/image/dot-pattern.png')] bg-auto bg-gray-900 bg-left bg-no-repeat dark:bg-gray-800">
            <div className="absolute inset-0 h-full w-full bg-teal-600/90 dark:bg-teal-700/80" />
            <section className="mx-auto flex w-full max-w-4xl animate-fade-down flex-col items-center px-3 py-20 duration-500 sm:py-24 md:py-32">
                <div className="container relative z-10 mx-auto my-auto grid place-items-center text-center">
                    <h1 className="mt-20 mb-4 w-full animate-fade-down text-center font-bold text-4xl text-white duration-500 sm:text-5xl lg:w-10/12">
                        About Us
                    </h1>

                    <p className="mt-5 mb-10 w-full max-w-lg animate-fade-down text-center font-normal text-lg text-white duration-500 sm:text-xl lg:w-10/12">
                        At Hope International, we are driven by a passion for
                        enhancing the quality of life for elderly individuals
                        and empowering caregivers to make a meaningful
                        difference in their lives.
                    </p>
                </div>
            </section>
        </div>
    );
}
