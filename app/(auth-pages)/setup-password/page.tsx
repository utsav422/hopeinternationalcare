import SetupPasswordForm from './_components/setup-passowrd-form';

export default function SetupPassword(_props: {
  searchParams: Promise<{ [key: string]: string }>;
}) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-teal-50 to-indigo-100 p-4">
      <SetupPasswordForm />
    </div>
  );
}
