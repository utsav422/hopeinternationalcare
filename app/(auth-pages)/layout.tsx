import { createClient } from '@/utils/supabase/server';
import '../globals.css';
const _LINKS = [
  {
    title: 'Company',
    items: [
      { name: 'About Us', url: '/aboutus', icon: '' },
      { name: 'Our Courses', url: '/courses', icon: '' },
      { name: 'Contact Us', url: 'contactus', icon: '' },
      { name: 'Gallery', url: 'gallery', icon: '' },
    ],
  },
  {
    title: 'Social Connect',
    items: [
      { name: 'Facebook', url: '#', icon: 'fa-facebook' },
      { name: 'Instagram', url: '#', icon: 'fa-instagram' },
      { name: 'Twitter', url: '#', icon: 'fa-twitter' },
    ],
  },
];
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user: _ },
  } = await supabase.auth.getUser();
  const _CURRENT_YEAR = new Date().getFullYear();

  return <>{children}</>;
}
