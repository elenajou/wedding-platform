export type GroupMember = { id: number; name: string; tableName?: string | null }

export type RSVPTemplateProps = {
  groupId?: number | null
  guestName?: string | null
  groupName?: string
  tableName?: string
  allocatedSeats?: number
  groupMembers?: (GroupMember | string)[]
  dict: {
    sectionLabel: string
    deadline: string
    nameLabel: string
    namePlaceholder: string
    attendanceLabel: string
    accepts: string
    declines: string
    guestCountLabel: string
    messageLabel: string
    messagePlaceholder: string
    errorName: string
    errorAttendance: string
    errorGeneric: string
    sending: string
    sendReply: string
    successYes: string
    successNo: string
    successSub: string
    rsvpDeadline: string
  }
}
