import { fetchModels } from '~/action'

import Chat from './chat'

const Page = async () => <Chat models={await fetchModels()} />

export default Page
