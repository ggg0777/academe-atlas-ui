import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CourseCard } from "@/components/CourseCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import clubIllustration from "@/assets/club-illustration.png";

interface Profile {
  full_name: string;
  student_id: string;
  user_role: string;
}

interface Course {
  id: string;
  course_code: string;
  course_name: string;
  professor: string;
  schedule: string;
  time_slot: string;
  location: string;
}

interface Enrollment {
  course_id: string;
  section: string;
}

const colorSchemes = ["purple", "yellow", "blue", "green", "mint", "pink", "magenta", "lavender"];

export default function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<(Course & { section: string })[]>([]);
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
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      }

      // Fetch enrolled courses
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select("course_id, section")
        .eq("student_id", session.user.id);

      if (enrollments && enrollments.length > 0) {
        const courseIds = enrollments.map((e: Enrollment) => e.course_id);
        const { data: coursesData } = await supabase
          .from("courses")
          .select("*")
          .in("id", courseIds);

        if (coursesData) {
          const coursesWithSections = coursesData.map((course: Course) => {
            const enrollment = enrollments.find((e: Enrollment) => e.course_id === course.id);
            return { ...course, section: enrollment?.section || "" };
          });
          setEnrolledCourses(coursesWithSections);
        }
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
      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-1">
            👋 Welcome, {profile?.full_name?.split(" ")[0] || "Student"}!
          </h1>
        </div>
        <div className="text-right text-sm text-muted-foreground">
          <p>Student ID: {profile?.student_id}</p>
          <p>User Role: {profile?.user_role}</p>
        </div>
      </div>

      {/* Club Promotion Banner */}
      <div className="bg-card rounded-xl shadow-sm p-8 mb-8 flex items-center justify-between border">
        <div className="flex-1 pr-8">
          <h2 className="text-2xl font-bold mb-3">Get Involved – Join a Club Today!</h2>
          <p className="text-muted-foreground mb-4 max-w-2xl">
            Explore your interests and meet like-minded students by joining one of our many clubs. Whether you're into
            sports, arts, or academics, there's a club for you. Find your community!
          </p>
          <Button>
            Learn More <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <div className="flex-shrink-0">
          <img src={clubIllustration} alt="Join a club" className="w-80 h-auto" />
        </div>
      </div>

      {/* Enrolled Courses */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <div className="w-6 h-6 bg-foreground rounded flex items-center justify-center">
            <span className="text-background text-xs">📚</span>
          </div>
          <h2 className="text-xl font-bold">Enrolled Courses</h2>
        </div>

        {enrolledCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {enrolledCourses.map((course, index) => (
              <CourseCard
                key={course.id}
                courseName={course.course_name}
                courseCode={course.course_code}
                professor={course.professor}
                schedule={course.schedule}
                timeSlot={course.time_slot}
                location={course.location}
                colorScheme={colorSchemes[index % colorSchemes.length]}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>No enrolled courses yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
