const Dots = () => (
  <div className='flex size-8 flex-col items-center justify-center gap-0 rounded-lg transition-all duration-300 *:size-0 *:rounded-full *:bg-muted-foreground *:transition-all *:duration-500 group-hover:gap-1 group-hover:shadow-sm group-hover:backdrop-blur-xl group-hover:*:size-1'>
    <p />
    <p className='delay-150' />
    <p className='delay-300' />
  </div>
)

export default Dots
