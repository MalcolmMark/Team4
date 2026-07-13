import type { DemoUser, RoleAssignment } from '../auth/types'

export const BOU_INSTITUTION_ID = 'bou'
export const MTN_INSTITUTION_ID = 'mtn-momo-ug'
export const AIRTEL_INSTITUTION_ID = 'airtel-money-ug'
export const STANBIC_INSTITUTION_ID = 'stanbic-ug'
export const CENTENARY_INSTITUTION_ID = 'centenary-ug'
export const DEMO_PASSWORD = 'FraudLinkDemo2026!'

const assignedAt = '2026-07-12T09:00:00.000Z'
const assignment = (id: string, userId: string, institutionId: string, accessSide: RoleAssignment['accessSide'], role: RoleAssignment['role']): RoleAssignment => ({
  id, userId, institutionId, accessSide, role, status: 'ACTIVE', assignedBy: 'user-malcolm', assignedAt,
})

export const DEMO_USERS: DemoUser[] = [
  {
    id: 'user-malcolm', fullName: 'Malcolm Mark Okabo', email: 'malcolm.okabo@bou.demo.ug', initials: 'MO', status: 'ACTIVE', mfaEnabled: true,
    roleAssignments: [
      assignment('role-malcolm-admin', 'user-malcolm', BOU_INSTITUTION_ID, 'BANK_OF_UGANDA', 'BOU_ADMINISTRATOR'),
      assignment('role-malcolm-oversight', 'user-malcolm', BOU_INSTITUTION_ID, 'BANK_OF_UGANDA', 'BOU_OVERSIGHT_OFFICER'),
    ],
  },
  { id: 'user-daniella', fullName: 'Daniella Mukisa', email: 'daniella.mukisa@mtn.demo.ug', initials: 'DM', status: 'ACTIVE', mfaEnabled: true, roleAssignments: [assignment('role-daniella-analyst', 'user-daniella', MTN_INSTITUTION_ID, 'SERVICE_PROVIDER', 'FRAUD_ANALYST'), assignment('role-daniella-airtel-analyst', 'user-daniella', AIRTEL_INSTITUTION_ID, 'SERVICE_PROVIDER', 'FRAUD_ANALYST')] },
  { id: 'user-esther', fullName: 'Esther Nampiina', email: 'esther.nampiina@mtn.demo.ug', initials: 'EN', status: 'ACTIVE', mfaEnabled: true, roleAssignments: [assignment('role-esther-admin', 'user-esther', MTN_INSTITUTION_ID, 'SERVICE_PROVIDER', 'INSTITUTION_ADMIN'), assignment('role-esther-stanbic-admin', 'user-esther', STANBIC_INSTITUTION_ID, 'SERVICE_PROVIDER', 'INSTITUTION_ADMIN')] },
  { id: 'user-kevin', fullName: 'Kevin Mugabi', email: 'kevin.mugabi@mtn.demo.ug', initials: 'KM', status: 'ACTIVE', mfaEnabled: true, roleAssignments: [assignment('role-kevin-supervisor', 'user-kevin', MTN_INSTITUTION_ID, 'SERVICE_PROVIDER', 'FRAUD_SUPERVISOR'), assignment('role-kevin-airtel-supervisor', 'user-kevin', AIRTEL_INSTITUTION_ID, 'SERVICE_PROVIDER', 'FRAUD_SUPERVISOR')] },
  { id: 'user-gideon', fullName: 'Gideon Maku', email: 'gideon.maku@mtn.demo.ug', initials: 'GM', status: 'ACTIVE', mfaEnabled: true, roleAssignments: [assignment('role-gideon-compliance', 'user-gideon', MTN_INSTITUTION_ID, 'SERVICE_PROVIDER', 'COMPLIANCE_AUDITOR'), assignment('role-gideon-centenary-compliance', 'user-gideon', CENTENARY_INSTITUTION_ID, 'SERVICE_PROVIDER', 'COMPLIANCE_AUDITOR')] },
]

export const DEMO_INSTITUTIONS = [
  { id: BOU_INSTITUTION_ID, name: 'Bank of Uganda', code: 'BOU', accessSide: 'BANK_OF_UGANDA' as const, status: 'ACTIVE' },
  { id: MTN_INSTITUTION_ID, name: 'MTN Mobile Money Uganda Limited', code: 'MTN_MOMO_UG', accessSide: 'SERVICE_PROVIDER' as const, status: 'ACTIVE' },
  { id: AIRTEL_INSTITUTION_ID, name: 'Airtel Mobile Commerce Uganda Limited', code: 'AIRTEL_MONEY_UG', accessSide: 'SERVICE_PROVIDER' as const, status: 'ACTIVE' },
  { id: STANBIC_INSTITUTION_ID, name: 'Stanbic Bank Uganda Limited', code: 'STANBIC_UG', accessSide: 'SERVICE_PROVIDER' as const, status: 'ACTIVE' },
  { id: CENTENARY_INSTITUTION_ID, name: 'Centenary Rural Development Bank Limited', code: 'CENTENARY_UG', accessSide: 'SERVICE_PROVIDER' as const, status: 'ACTIVE' },
]
