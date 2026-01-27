import { auth } from '~/auth/server'

const { handler } = auth

export { handler as GET, handler as POST }
