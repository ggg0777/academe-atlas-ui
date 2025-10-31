import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface EnrollmentData {
  course_name: string;
  course_code: string;
  professor: string;
  units: number;
  section: string;
  enrolled_at: string;
}

export default function Enrollment() {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState<EnrollmentData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      // Fetch enrollments with course info
      const { data: enrollmentData } = await supabase
        .from("enrollments")
        .select(`
          section,
          enrolled_at,
          courses (
            course_name,
            course_code,
            professor,
            units
          )
        `)
        .eq("student_id", session.user.id);

      if (enrollmentData) {
        const formattedData = enrollmentData.map((e: any) => ({
          course_name: e.courses.course_name,
          course_code: e.courses.course_code,
          professor: e.courses.professor,
          units: e.courses.units,
          section: e.section,
          enrolled_at: new Date(e.enrolled_at).toLocaleDateString(),
        }));
        setEnrollments(formattedData);
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
          📚 My Enrollments
        </h1>
        <p className="text-muted-foreground">View your enrolled courses</p>
      </div>

      {enrollments.length > 0 ? (
        <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Name</TableHead>
                <TableHead>Course Code</TableHead>
                <TableHead>Professor</TableHead>
                <TableHead>Units</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Enrolled Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrollments.map((enrollment, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{enrollment.course_name}</TableCell>
                  <TableCell>{enrollment.course_code}</TableCell>
                  <TableCell>{enrollment.professor}</TableCell>
                  <TableCell>{enrollment.units}</TableCell>
                  <TableCell>{enrollment.section}</TableCell>
                  <TableCell>{enrollment.enrolled_at}</TableCell>
                  <TableCell>
                    <Badge className="bg-status-success text-status-success-text">Active</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p>No enrollments found.</p>
        </div>
      )}
    </div>
  );
}
