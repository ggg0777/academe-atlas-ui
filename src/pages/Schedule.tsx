import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";

interface CourseSchedule {
  course_name: string;
  course_code: string;
  professor: string;
  schedule: string;
  time_slot: string;
  location: string;
}

interface Profile {
  full_name: string;
}

export default function Schedule() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [schedule, setSchedule] = useState<CourseSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", session.user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      }

      // Fetch enrolled courses for schedule
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select(`
          courses (
            course_name,
            course_code,
            professor,
            schedule,
            time_slot,
            location
          )
        `)
        .eq("student_id", session.user.id);

      if (enrollments) {
        const scheduleData = enrollments.map((e: any) => e.courses);
        setSchedule(scheduleData);
      }

      setLoading(false);
    };

    fetchData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">
          📅 Class Schedule
        </h1>
        <p className="text-muted-foreground">View your weekly class schedule</p>
      </div>

      {schedule.length > 0 ? (
        <div className="grid gap-4">
          {schedule.map((course, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{course.course_name}</h3>
                    <p className="text-sm text-muted-foreground">{course.course_code}</p>
                    <p className="mt-2">👨‍🏫 {course.professor}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{course.schedule}</p>
                    <p className="text-sm text-muted-foreground">{course.time_slot}</p>
                    <p className="text-sm text-muted-foreground mt-2">📍 {course.location}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p>No scheduled classes yet.</p>
        </div>
      )}
    </div>
  );
}
