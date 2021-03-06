export interface InstanceColumn {
  id: 'id' | 'ipAddress' | 'currentUsers' | 'locationId' | 'channelId' | 'podName' | 'action'
  label: string
  minWidth?: number
  align?: 'right'
}

export const instanceColumns: InstanceColumn[] = [
  { id: 'id', label: 'Instance ID', minWidth: 65 },
  { id: 'ipAddress', label: 'IP Address', minWidth: 65 },
  { id: 'currentUsers', label: 'Current Users', minWidth: 65 },
  {
    id: 'locationId',
    label: 'Location',
    minWidth: 65,
    align: 'right'
  },
  {
    id: 'channelId',
    label: 'Channel',
    minWidth: 65,
    align: 'right'
  },
  {
    id: 'podName',
    label: 'Pod Name',
    minWidth: 200,
    align: 'right'
  },
  {
    id: 'action',
    label: 'Action',
    minWidth: 65,
    align: 'right'
  }
]

export interface InstanceData {
  id: string
  ipAddress: string
  currentUsers: Number
  locationId: string
  channelId: string
  podName: string
  action: any
}
