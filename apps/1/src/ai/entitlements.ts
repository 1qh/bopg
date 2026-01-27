interface Entitlements {
  maxMessagesPerDay: number
}
type UserType = 'guest' | 'regular'

export default {
  guest: {
    maxMessagesPerDay: 20
  },
  regular: {
    maxMessagesPerDay: 50
  }
} satisfies Record<UserType, Entitlements>
