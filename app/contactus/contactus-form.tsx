'use client';

import { useForm } from 'react-hook-form';
import { sendEmail } from '@/utils/send-email';

export type FormData = {
  name: string;
  phone: string;
  email: string;
  message: string;
};

export function ContactUsForm() {
  const { register, handleSubmit } = useForm<FormData>();

  function onSubmit(data: FormData) {
    sendEmail(data);
  }

  return (
    <section className="items-center bg-gray-100 p-10 py-18">
      <div className="relative mx-20 mt-10 min-h-[50vh] w-full bg-cover bg-grey-500 bg-no-repeat">
        <h1 className="mb-2 text-center font-bold text-3xl text-gray-800">
          Have Queries with us?
        </h1>
        <p className="mx-auto mb-16 w-full text-center font-normal text-gray-600 lg:w-10/12">
          Send us quick email so that we can get back to you as soon as
          possible.
        </p>
        <form className="mx-auto max-w-2xl" onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-5">
            <label
              className="mb-3 block font-medium text-base text-black"
              htmlFor="name"
            >
              Full Name
            </label>
            <input
              className="w-full rounded-md border border-gray-300 bg-white px-6 py-3 font-medium text-base text-gray-700 outline-none focus:border-teal-500 focus:shadow-md"
              id="name"
              placeholder="Full Name"
              type="text"
              {...register('name', { required: true })}
            />
          </div>
          <div className="mb-5">
            <label
              className="mb-3 block font-medium text-base text-black"
              htmlFor="email"
            >
              Email Address
            </label>
            <input
              className="w-full rounded-md border border-gray-300 bg-white px-6 py-3 font-medium text-base text-gray-700 outline-none focus:border-teal-500 focus:shadow-md"
              id="email"
              placeholder="example@domain.com"
              type="email"
              {...register('email', { required: true })}
            />
          </div>
          <div className="mb-5">
            <label
              className="mb-3 block font-medium text-base text-black"
              htmlFor="phone"
            >
              Mobile Number
            </label>
            <input
              className="w-full rounded-md border border-gray-300 bg-white px-6 py-3 font-medium text-base text-gray-700 outline-none focus:border-teal-500 focus:shadow-md"
              id="phone"
              placeholder="+977 9812344566"
              type="tel"
              {...register('phone', { required: true })}
            />
          </div>
          <div className="mb-5">
            <label
              className="mb-3 block font-medium text-base text-black"
              htmlFor="message"
            >
              Message
            </label>
            <textarea
              className="w-full resize-none rounded-md border border-gray-300 bg-white px-6 py-3 font-medium text-base text-gray-700 outline-none focus:border-teal-500 focus:shadow-md"
              id="message"
              placeholder="Type your message"
              rows={4}
              {...register('message', { required: true })}
            />
          </div>
          <div>
            <button
              className="rounded-md bg-teal-500 px-8 py-3 font-semibold text-base text-white outline-none transition-shadow duration-300 hover:bg-teal-600 hover:shadow-lg"
              type="submit"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default ContactUsForm;
