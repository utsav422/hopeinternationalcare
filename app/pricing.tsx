'use client';
import { CheckIcon } from '@heroicons/react/24/outline';

const PRICING_OPTIONS = [
  '25 Classes',
  '200 Learning hours',
  'Expert-led instruction',
  'Certificate of completion',
];

export default function Pricing() {
  return (
    <div className="grid min-h-screen place-items-center bg-gray-100">
      <section className="container mx-auto px-10">
        {/* Header Section */}
        <div className="grid place-items-center pb-20 text-center">
          <h2 className="font-bold text-4xl text-gray-900">
            Best no-tricks pricing
          </h2>
          <p className="mx-auto mt-2 text-gray-500 lg:w-5/12">
            If you are not satisfied, contact us within the first 30 days and we
            will send you a full refund.
          </p>
        </div>

        {/* Pricing Card */}
        <div className="rounded-lg bg-white px-6 py-8 shadow-lg">
          <div>
            <h3 className="mb-6 font-bold text-3xl text-gray-900">
              React Course Membership
            </h3>
            <div className="grid grid-cols-1 items-center gap-20 lg:grid-cols-2">
              {/* Left Column: Features */}
              <div>
                <p className="mt-2 mb-10 w-full font-normal text-gray-500">
                  Our Course Package offers full access to the React Course,
                  including all course materials, assignments, and projects.
                </p>
                <div className="flex flex-wrap items-center gap-x-20 gap-y-6">
                  <h6 className="font-semibold text-gray-900 text-lg">
                    What is included
                  </h6>
                  <hr className="w-72 bg-gray-500" />
                </div>

                <div className="mt-8 grid grid-cols-2 justify-between gap-x-12 gap-y-2">
                  {PRICING_OPTIONS.map((option, key) => (
                    <div className="flex items-center gap-4" key={key + option}>
                      <CheckIcon
                        className="h-4 w-4 text-gray-900"
                        strokeWidth={3}
                      />
                      <p className="font-normal text-gray-500">{option}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Pricing Details */}
              <div className="grid place-items-center lg:justify-end">
                <h6 className="font-semibold text-gray-900 text-lg">
                  Pay once, own it forever
                </h6>
                <h1 className="font-bold text-5xl text-gray-900">$399</h1>
                <button
                  className="my-3 rounded-full bg-gray-800 px-6 py-3 font-bold text-white transition-colors duration-300 hover:bg-gray-900"
                  type="button"
                >
                  GET ACCESS
                </button>
                <p className="text-gray-500 text-sm">
                  Get a free sample (20MB)
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
