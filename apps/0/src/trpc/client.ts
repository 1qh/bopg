import { defaultShouldDehydrateQuery, QueryClient } from '@tanstack/react-query'
import { deserialize, serialize } from 'superjson'

const client = () =>
  new QueryClient({
    defaultOptions: {
      dehydrate: {
        serializeData: serialize,
        shouldDehydrateQuery: q => defaultShouldDehydrateQuery(q) || q.state.status === 'pending',
        shouldRedactErrors: () => false
      },
      hydrate: { deserializeData: deserialize },
      queries: { staleTime: 30 * 1000 }
    }
  })

export default client
