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
    <div className="p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-10 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            👋 Welcome back, {profile?.full_name?.split(" ")[0] || "Student"}!
          </h1>
          <p className="text-muted-foreground text-lg">Here's what's happening with your courses today.</p>
        </div>
        <div className="text-right text-sm bg-card rounded-xl p-4 shadow-sm border">
          <p className="font-semibold text-foreground mb-1">Student ID: {profile?.student_id}</p>
          <p className="text-muted-foreground capitalize">{profile?.user_role}</p>
        </div>
      </div>

      {/* Club Promotion Banner */}
      <div className="bg-gradient-to-br from-primary/5 via-accent/50 to-secondary rounded-2xl shadow-sm p-10 mb-10 flex items-center justify-between border border-primary/10 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-50"></div>
        <div className="flex-1 pr-8 relative z-10">
          <h2 className="text-3xl font-bold mb-3 text-foreground">Get Involved – Join a Club Today!</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl leading-relaxed">
            Explore your interests and meet like-minded students by joining one of our many clubs. Whether you're into
            sports, arts, or academics, there's a club for you. Find your community!
          </p>
          <Button size="lg" className="shadow-md hover:shadow-lg transition-all">
            Learn More <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <div className="flex-shrink-0 relative z-10">
          <img src={clubIllustration} alt="Join a club" className="w-80 h-auto drop-shadow-xl" />
        </div>
      </div>

      {/* Enrolled Courses */}
      <div>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md">
            <span className="text-primary-foreground text-lg">📚</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold">Enrolled Courses</h2>
            <p className="text-sm text-muted-foreground">You're taking {enrolledCourses.length} courses this semester</p>
          </div>
        </div>

        {enrolledCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
          <div className="text-center py-20 bg-card rounded-2xl border shadow-sm">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-muted-foreground text-lg">No enrolled courses yet.</p>
            <p className="text-sm text-muted-foreground mt-2">Start your academic journey by enrolling in courses!</p>
          </div>
        )}
      </div>
    </div>
  );
}
