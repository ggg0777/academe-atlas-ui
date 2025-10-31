import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import clubIllustration from "@/assets/club-illustration.png";

interface GradeData {
  exam_name: string;
  course_code: string;
  course_type: string;
  units: number;
  section: string;
  prelim: number | null;
  midterm: number | null;
  final: number | null;
  remarks: string | null;
}

interface Profile {
  full_name: string;
}

export default function GradeReport() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [grades, setGrades] = useState<GradeData[]>([]);
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

      // Fetch grades with course and enrollment info
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select(`
          id,
          section,
          course_id,
          courses (
            course_code,
            course_name,
            course_type,
            units
          )
        `)
        .eq("student_id", session.user.id);

      if (enrollments) {
        const enrichedGrades: GradeData[] = [];

        for (const enrollment of enrollments) {
          const { data: gradeData } = await supabase
            .from("grades")
            .select("prelim, midterm, final, remarks")
            .eq("enrollment_id", (enrollment as any).id)
            .maybeSingle();

          enrichedGrades.push({
            exam_name: (enrollment.courses as any).course_name,
            course_code: (enrollment.courses as any).course_code,
            course_type: (enrollment.courses as any).course_type,
            units: (enrollment.courses as any).units,
            section: enrollment.section,
            prelim: gradeData?.prelim || null,
            midterm: gradeData?.midterm || null,
            final: gradeData?.final || null,
            remarks: gradeData?.remarks || null,
          });
        }

        setGrades(enrichedGrades);
      }

      setLoading(false);
    };

    fetchData();
  }, [navigate]);

  const renderGrade = (grade: number | null) => {
    if (grade === null) {
      return <Badge variant="outline" className="bg-status-upcoming text-status-upcoming-text">Upcoming</Badge>;
    }
    return <Badge className="bg-status-success text-status-success-text">{grade.toFixed(1)}</Badge>;
  };

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">
          👋 Welcome, {profile?.full_name?.split(" ")[0] || "Student"}!
        </h1>
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

      {/* Grades Table */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <div className="w-6 h-6 bg-foreground rounded flex items-center justify-center">
            <span className="text-background text-xs">📊</span>
          </div>
          <h2 className="text-xl font-bold">Grade</h2>
        </div>

        {grades.length > 0 ? (
          <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exam Name</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Units</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Prelim</TableHead>
                  <TableHead>Midterm</TableHead>
                  <TableHead>Final</TableHead>
                  <TableHead>Remarks</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grades.map((grade, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{grade.exam_name}</TableCell>
                    <TableCell>{grade.course_code}</TableCell>
                    <TableCell>{grade.course_type}</TableCell>
                    <TableCell>{grade.units}</TableCell>
                    <TableCell>{grade.section}</TableCell>
                    <TableCell>{renderGrade(grade.prelim)}</TableCell>
                    <TableCell>{renderGrade(grade.midterm)}</TableCell>
                    <TableCell>{renderGrade(grade.final)}</TableCell>
                    <TableCell>{grade.remarks || "-"}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon">
                        ⋮
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>No grades available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
