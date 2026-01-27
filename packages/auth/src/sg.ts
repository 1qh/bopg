import sg from '@sendgrid/mail'

import { env } from '../env'

sg.setApiKey(env.AUTH_SENDGRID_KEY)

export default sg
