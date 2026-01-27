from modal import App, Image

app = App('app-0', image=Image.debian_slim(python_version='3.14'))


@app.function()
def add(a: int, b: int) -> str:
  return f'The sum of {a} and {b} is {a + b}'
