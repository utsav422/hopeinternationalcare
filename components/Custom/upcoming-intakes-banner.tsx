'use client';

import { CalendarDays, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getUpcomingIntakes } from '@/server-actions/public/get-upcoming-intakes';

interface Intake {
  intakeId: string;
  courseTitle: string | null; // Fixed: courseTitle can be null
  startDate: string;
  capacity: number;
  totalRegistered: number;
}

export function UpcomingIntakesBanner() {
  const [intakes, setIntakes] = useState<Intake[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIntakes = async () => {
      setLoading(true);
      const result = await getUpcomingIntakes();
      if (result?.error) {
        toast.error(result.error);
      } else if (result?.data) {
        setIntakes(result.data);
      }
      setLoading(false);
    };
    fetchIntakes();
  }, []);

  if (loading) {
    return (
      <div className="w-full rounded-lg bg-gray-100 p-4 text-center text-gray-600 shadow-md dark:bg-gray-800 dark:text-gray-300">
        Loading upcoming intakes...
      </div>
    );
  }

  if (intakes.length === 0) {
    return null; // Don't show banner if no upcoming intakes
  }

  return (
    <Card className="w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-lg dark:from-teal-700 dark:to-blue-800">
      <CardHeader>
        <CardTitle className="font-bold text-2xl text-white">
          Upcoming Intakes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap justify-center gap-4">
          {intakes.map((intake) => (
            <div
              className="flex flex-grow flex-col justify-between rounded-lg bg-white/30 p-4 shadow-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-md sm:flex-row sm:items-center dark:bg-white/10 dark:hover:bg-white/20"
              key={intake.intakeId}
            >
              <div className="mb-2 sm:mb-0">
                <p className="font-semibold text-lg text-white">
                  {intake.courseTitle}
                </p>
                <p className="flex items-center gap-1 text-gray-100 text-sm">
                  <CalendarDays className="h-4 w-4" />
                  {new Date(intake.startDate).toLocaleDateString()}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="flex items-center gap-1 text-gray-100 text-sm">
                  <Users className="h-4 w-4" />
                  Seats: {intake.totalRegistered}/{intake.capacity}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
