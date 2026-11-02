import { Role } from "@/types";

export type ApplicationStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "revision_required"
  | "recommended"
  | "approved"
  | "rejected";

export type MemberStatus =
  | "active"
  | "under_review"
  | "suspended"
  | "inactive";

export interface VerificationChecklist {
  identityVerified: boolean;
  biodataVerified: boolean;
  commitmentVerified: boolean;
  adArtVerified: boolean;
}

export interface ApplicationActivityLog {
  id: string;
  timestamp: string;
  actorRole: Role;
  actorName: string;
  fromStatus: ApplicationStatus | "new";
  toStatus: ApplicationStatus;
  action: string;
  notes?: string;
}

export interface MembershipApplication {
  id: string;
  trackingCode: string;
  demoId: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  occupation: string;
  simpananPokokConfirmed: boolean;
  simpananWajibConfirmed: boolean;
  adArtAgreed: boolean;
  status: ApplicationStatus;
  submissionDate: string;
  checklist: VerificationChecklist;
  staffNotes?: string;
  revisionReason?: string;
  managerNotes?: string;
  rejectionReason?: string;
  approvedMemberNumber?: string;
  assignedMemberId?: string;
  history: ApplicationActivityLog[];
}

export interface Member {
  id: string;
  memberNumber: string;
  demoId: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  occupation: string;
  status: MemberStatus;
  joinDate: string;
  approvedBy: string;
  applicationId: string;
  simpananPokokNominal: number;
  simpananWajibBulanan: number;
  saldoPokok: number;
  saldoWajib: number;
  saldoSukarela: number;
}
