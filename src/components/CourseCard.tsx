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
    <div className={`${colorClass} rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-black/5`}>
      <div className="mb-4">
        <h3 className="font-bold text-xl mb-1">{courseName}</h3>
        <p className="text-sm opacity-70 font-medium">{courseCode}</p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3 text-sm">
          <div className="p-1.5 rounded-lg bg-white/40">
            <User className="h-4 w-4" />
          </div>
          <span className="font-medium">{professor}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="p-1.5 rounded-lg bg-white/40">
            <Calendar className="h-4 w-4" />
          </div>
          <span>{schedule}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="p-1.5 rounded-lg bg-white/40">
            <Clock className="h-4 w-4" />
          </div>
          <span>{timeSlot}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="p-1.5 rounded-lg bg-white/40">
            <MapPin className="h-4 w-4" />
          </div>
          <span>{location}</span>
        </div>
      </div>
    </div>
  );
}
