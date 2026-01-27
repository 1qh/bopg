import { ModalClient } from 'modal'

const { functions } = new ModalClient(),
  fn = await functions.fromName('app-0', 'add'),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  res = await fn.remote([1, 2])

console.log(res)
