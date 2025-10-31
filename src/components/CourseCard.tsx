import { User, Calendar, Clock, MapPin } from "lucide-react";

interface CourseCardProps {
  courseName: string;
  courseCode: string;
  professor: string;
  schedule: string;
  timeSlot: string;
  location: string;
  colorScheme: string;
}

const colorClasses = {
  purple: "bg-course-purple text-course-purple-dark",
  yellow: "bg-course-yellow text-course-yellow-dark",
  blue: "bg-course-blue text-course-blue-dark",
  green: "bg-course-green text-course-green-dark",
  mint: "bg-course-mint text-course-mint-dark",
  pink: "bg-course-pink text-course-pink-dark",
  magenta: "bg-course-magenta text-course-magenta-dark",
  lavender: "bg-course-lavender text-course-lavender-dark",
};

export function CourseCard({
  courseName,
  courseCode,
  professor,
  schedule,
  timeSlot,
  location,
  colorScheme,
}: CourseCardProps) {
  const colorClass = colorClasses[colorScheme as keyof typeof colorClasses] || colorClasses.blue;

  return (
    <div className={`${colorClass} rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow`}>
      <h3 className="font-semibold text-lg mb-1">{courseName}</h3>
      <p className="text-sm opacity-80 mb-4">{courseCode}</p>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4" />
          <span>{professor}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4" />
          <span>{schedule}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4" />
          <span>{timeSlot}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4" />
          <span>{location}</span>
        </div>
      </div>
    </div>
  );
}
