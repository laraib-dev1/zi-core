import React from "react";
import { spacing } from "@/utils/spacing";

interface TeamMember {
  name: string;
  role: string;
  image: string;
  description: string;
}

interface TeamSectionProps {
  title?: string;
  subtitle?: string;
  members?: TeamMember[];
}

const TeamSection: React.FC<TeamSectionProps> = ({
  title = "Team",
  subtitle = "Meet the talented individuals who make it all possible",
  members = [
    {
      name: "Marcus Wilson",
      role: "Chief Technology Officer",
      image: "/team-1.jpg",
      description: "Leading our technology initiatives with over 15 years of experience in software development and innovation.",
    },
    {
      name: "Sophia Reynolds",
      role: "Product Designer",
      image: "/team-2.jpg",
      description: "Creating beautiful and intuitive user experiences that delight our clients and their customers.",
    },
    {
      name: "Daniel Chen",
      role: "Marketing Specialist",
      image: "/team-3.jpg",
      description: "Driving growth and engagement through strategic marketing campaigns and brand development.",
    },
    {
      name: "Olivia Thompson",
      role: "Lead Developer",
      image: "/team-4.jpg",
      description: "Building robust and scalable solutions that power our clients' digital transformation.",
    },
  ],
}) => {
  return (
    <section className={spacing.section.gap}>
      <div className="max-w-[1232px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {title}
          </h2>
          <div className="w-16 h-1 mx-auto mb-4" style={{ backgroundColor: "var(--theme-primary, #8B5E3C)" }}></div>
          <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Team Members */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {members.map((member, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              {/* Member Image */}
              <div className="w-full aspect-square bg-gray-100 overflow-hidden">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/avatar.png";
                  }}
                />
              </div>
              
              {/* Member Info */}
              <div className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
                  {member.name}
                </h3>
                <p className="text-sm sm:text-base font-medium mb-3" style={{ color: "var(--theme-primary, #8B5E3C)" }}>
                  {member.role}
                </p>
                <p className="text-sm text-gray-600">
                  {member.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
