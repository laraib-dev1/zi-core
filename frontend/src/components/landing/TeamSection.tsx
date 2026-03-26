import React from "react";
import Container12 from "@/components/layout/Container12";
import SectionHeader from "@/components/ui/SectionHeader";
import TeamCard, { TeamCardSocialLink } from "@/components/landing/TeamCard";
import { cn } from "@/lib/utils";

export interface TeamMember {
  imageSrc: string;
  imageAlt?: string;
  name: string;
  title?: string;
  description?: string;
  socialLinks?: TeamCardSocialLink[] | Record<string, string>;
}

export interface TeamSectionProps {
  title?: string;
  subtitle?: string;
  /** Team members; 4 cards in 12 cols (3 cols each on large) */
  members?: TeamMember[];
  className?: string;
}

const DEFAULT_MEMBERS: TeamMember[] = [
  {
    imageSrc: "https://placehold.co/400x500?text=Sarah+Chen",
    name: "Sarah Chen",
    title: "Chief Executive Officer",
    description: "Praesentium nihil ut laudantium cumque. Ut et consequatur ab ut totam architecto. Expedita sunt eum.",
    socialLinks: { twitter: "#", facebook: "#", linkedin: "#", instagram: "#" },
  },
  {
    imageSrc: "https://placehold.co/400x500?text=David+Lee",
    name: "David Lee",
    title: "Product Manager",
    description: "Praesentium nihil ut laudantium cumque. Ut et consequatur ab ut totam architecto. Expedita sunt eum.",
    socialLinks: { twitter: "#", facebook: "#", linkedin: "#", instagram: "#" },
  },
  {
    imageSrc: "https://placehold.co/400x500?text=Laura+Rodriguez",
    name: "Laura Rodriguez",
    title: "Marketing Director",
    description: "Praesentium nihil ut laudantium cumque. Ut et consequatur ab ut totam architecto. Expedita sunt eum.",
    socialLinks: { twitter: "#", facebook: "#", linkedin: "#", instagram: "#" },
  },
  {
    imageSrc: "https://placehold.co/400x500?text=Michael+Brown",
    name: "Michael Brown",
    title: "Lead Engineer",
    description: "Praesentium nihil ut laudantium cumque. Ut et consequatur ab ut totam architecto. Expedita sunt eum.",
    socialLinks: { twitter: "#", facebook: "#", linkedin: "#", instagram: "#" },
  },
];

export default function TeamSection({
  title = "Team",
  subtitle = "Our Hardworking Team",
  members = DEFAULT_MEMBERS,
  className,
}: TeamSectionProps) {
  return (
    <section className={cn("w-full py-10 sm:py-12 md:py-14", className)}>
      <Container12 grid gap="gap-2 sm:gap-3 md:gap-4">
        {/* Heading: 12 cols, centered */}
        <div className="col-span-12 flex justify-center">
          <SectionHeader
            showBatch={false}
            showHeading={true}
            heading={title}
            showCutDivider={false}
            cutDividerVariant="withSides"
            showMiniInfo={!!subtitle}
            miniInfo={subtitle}
            showDividerLine={true}
            align="left"
            variant="light"
          />
        </div>

        {/* Team cards: 4 cards, 3 cols each on lg */}
        {members.map((member) => (
          <div
            key={member.name}
            className="col-span-6 lg:col-span-3"
          >
            <TeamCard
              imageSrc={member.imageSrc}
              imageAlt={member.imageAlt}
              name={member.name}
              title={member.title}
              description={member.description}
              socialLinks={member.socialLinks}
            />
          </div>
        ))}
      </Container12>
    </section>
  );
}
