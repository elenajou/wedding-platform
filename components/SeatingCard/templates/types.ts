export type SeatingMember = { id: number; name: string; tableName?: string | null } | string

export type SeatingTemplateProps = {
  guestName?: string | null
  groupName?: string
  tableName?: string
  allocatedSeats?: number
  groupMembers?: SeatingMember[]
  dict: {
    sectionLabel: string
    tableLabel: string
    tableTBC: string
    table: string
    membersLabel: string
    youBadge: string
    seatsTextSingular: string
    seatsTextPlural: string
    seatSingular: string
    seatPlural: string
  }
}
