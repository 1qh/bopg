
```ts
c.user                   // Current user doc
c.create('messages', {}) // Auto userId + updatedAt → Id
c.get(id)                // Get owned doc (throws if not yours) → Doc
c.patch(id, {})          // Verify + patch + updatedAt → Doc (updated)
c.patch(id, doc => ({})) // Same, but with access to current doc
c.delete(id)             // Verify + delete → Doc (deleted)
c.my('messages')         // Query your docs
c.db                     // Escape hatch
```

Before → After

```ts
// BEFORE: 10 lines
const userId = await getAuthUserId(c)
if (userId === null) throw new Error('Not signed in')
const message = await c.db.query('message')
  .filter(q => q.and(
    q.eq(q.field('_id'), messageId),
    q.eq(q.field('userId'), userId)
  )).first()
if (!message) throw new Error('Not found')
await c.db.patch(messageId, { body, updatedAt: Date.now() })

// AFTER: 1 line
c.patch(messageId, { body })
```

patch() patterns

```ts
// Simple: just pass data
c.patch(id, { body })

// Sync callback: access current doc
c.patch(id, msg => {
  if (msg.body.length > 100) throw new Error('Too long')
  return { body }
})

// Async callback: do async work
c.patch(id, async msg => {
  const user = await c.db.get(msg.mentionedUserId)
  return { body: `@${user.name} ${msg.body}` }
})
```

Type Safety

```ts
c.patch(id, { body })       // ✅
c.patch(id, { userId: x })  // ❌ auto-managed
c.create('users', {})       // ❌ users table not owned
```
