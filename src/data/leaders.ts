import portrait from "@/assets/leaders/leader-portrait.svg";
import educationLead from "@/assets/leaders/leader-education.svg";
import healthLead from "@/assets/leaders/leader-health.svg";
import { LeaderCategory, LeaderProfile } from "@/types";

const principal: LeaderProfile & { speech: string } = {
  name: "Alemu Tesfaye",
  title: "Woreda 9 Administrator",
  photo: portrait,
  speech:
    "We advance every citizen’s wellbeing through measured plans, diligent service, and transparent communication.",
};

const categories: LeaderCategory[] = [
  {
    id: "education",
    title: "Education & Youth",
    leaders: [
      {
        name: "Selamawit Teklu",
        title: "Education Chief",
        photo: educationLead,
      },
      {
        name: "Mulat Yirga",
        title: "Youth Programs Director",
        photo: educationLead,
      },
    ],
  },
  {
    id: "health",
    title: "Health & Community Services",
    leaders: [
      {
        name: "Teshome Alemu",
        title: "Health Director",
        photo: healthLead,
      },
      {
        name: "Eden Gebremedhin",
        title: "Social Services Coordinator",
        photo: healthLead,
      },
    ],
  },
  {
    id: "planning",
    title: "Planning & Infrastructure",
    leaders: [
      {
        name: "Mihret Hailemariam",
        title: "Planning Officer",
        photo: portrait,
      },
      {
        name: "Dereje Solomon",
        title: "Infrastructure Liaison",
        photo: portrait,
      },
    ],
  },
];

export const woredaLeadership = {
  principal,
  categories,
};


