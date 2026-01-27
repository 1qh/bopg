/* eslint-disable no-await-in-loop, max-statements */
import type { PyodideAPI } from 'pyodide'

import { Copy, Logs, MessageCircle, Play, Redo, Undo } from 'lucide-react'
import { toast } from 'sonner'

import type { ConsoleOutput, ConsoleOutputContent } from '~/components/console'

import CodeEditor from '~/components/code-editor'
import { Console } from '~/components/console'
import { Artifact } from '~/components/create-artifact'
import { randomId } from '~/utils'

const OUTPUT_HANDLERS = {
    basic: `
    # Basic output capture setup
  `,
    matplotlib: `
    import io
    import base64
    from matplotlib import pyplot as plt

    # Clear any existing plots
    plt.clf()
    plt.close('all')

    # Switch to agg backend
    plt.switch_backend('agg')

    def setup_matplotlib_output():
        def custom_show():
            if plt.gcf().get_size_inches().prod() * plt.gcf().dpi ** 2 > 25_000_000:
                print("Warning: Plot size too large, reducing quality")
                plt.gcf().set_dpi(100)

            png_buf = io.BytesIO()
            plt.savefig(png_buf, format='png')
            png_buf.seek(0)
            png_base64 = base64.b64encode(png_buf.read()).decode('utf-8')
            print(f'data:image/png;base64,{png_base64}')
            png_buf.close()

            plt.clf()
            plt.close('all')

        plt.show = custom_show
  `
  },
  detectRequiredHandlers = (code: string): (keyof typeof OUTPUT_HANDLERS)[] => {
    const handlers = ['basic'] as (keyof typeof OUTPUT_HANDLERS)[]
    if (code.includes('matplotlib') || code.includes('plt.')) handlers.push('matplotlib')
    return handlers
  }

interface Metadata {
  outputs: ConsoleOutput[]
}

export default new Artifact<'code', Metadata>({
  actions: [
    {
      description: 'Execute python',
      icon: <Play />,
      onClick: async ({ content, setMetadata }) => {
        const runId = randomId(),
          outputContent: ConsoleOutputContent[] = []
        setMetadata(p => ({
          ...p,
          outputs: [
            ...p.outputs,
            {
              contents: [],
              id: runId,
              status: 'in_progress'
            }
          ]
        }))
        try {
          // @ts-expect-error - x
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          const py = (await globalThis.loadPyodide()) as PyodideAPI
          py.setStdout({
            batched: (output: string) => {
              outputContent.push({
                type: output.startsWith('data:image/png;base64') ? 'image' : 'text',
                value: output
              })
            }
          })
          await py.loadPackagesFromImports(content, {
            messageCallback: (message: string) =>
              setMetadata(p => ({
                ...p,
                outputs: [
                  ...p.outputs.filter(o => o.id !== runId),
                  {
                    contents: [{ type: 'text', value: message }],
                    id: runId,
                    status: 'loading_packages'
                  }
                ]
              }))
          })
          for (const handler of detectRequiredHandlers(content))
            if (OUTPUT_HANDLERS[handler]) {
              // biome-ignore lint/performance/noAwaitInLoops: x
              await py.runPythonAsync(OUTPUT_HANDLERS[handler])
              if (handler === 'matplotlib') await py.runPythonAsync('setup_matplotlib_output()')
            }
          await py.runPythonAsync(content)
          setMetadata(p => ({
            ...p,
            outputs: [
              ...p.outputs.filter(o => o.id !== runId),
              { contents: outputContent, id: runId, status: 'completed' }
            ]
          }))
        } catch (error) {
          setMetadata(p => ({
            ...p,
            outputs: [
              ...p.outputs.filter(o => o.id !== runId),
              {
                contents: [{ type: 'text', value: (error as Error).message }],
                id: runId,
                status: 'failed'
              }
            ]
          }))
        }
      }
    },
    {
      description: 'Previous version',
      icon: <Undo />,
      isDisabled: ({ currentVersionIndex }) => currentVersionIndex === 0,
      onClick: ({ handleVersionChange }) => handleVersionChange('prev')
    },
    {
      description: 'Next version',
      icon: <Redo />,
      isDisabled: ({ isCurrentVersion }) => isCurrentVersion,
      onClick: ({ handleVersionChange }) => handleVersionChange('next')
    },
    {
      description: 'Copy code to clipboard',
      icon: <Copy />,
      onClick: ({ content }) => {
        navigator.clipboard.writeText(content)
        toast.success('Copied to clipboard!')
      }
    }
  ],
  content: ({ metadata, setMetadata, ...props }) => (
    <>
      <CodeEditor {...props} />
      {metadata?.outputs ? (
        <Console
          consoleOutputs={metadata.outputs}
          setConsoleOutputs={() =>
            setMetadata({
              ...metadata,
              outputs: []
            })
          }
        />
      ) : null}
    </>
  ),
  description: 'Useful for code generation; Code execution is only available for python code.',
  initialize: ({ setMetadata }) => setMetadata({ outputs: [] }),
  kind: 'code',
  onStreamPart: ({ setArtifact, streamPart }) => {
    if (streamPart.type === 'data-codeDelta')
      setArtifact(a => ({
        ...a,
        content: streamPart.data,
        isVisible: a.status === 'streaming' && a.content.length > 300 && a.content.length < 310 ? true : a.isVisible,
        status: 'streaming'
      }))
  },
  toolbar: [
    {
      description: 'Add comments',
      icon: <MessageCircle />,
      onClick: ({ sendMessage }) => {
        sendMessage({
          parts: [
            {
              text: 'Add comments to the code snippet for understanding',
              type: 'text'
            }
          ],
          role: 'user'
        })
      }
    },
    {
      description: 'Add logs',
      icon: <Logs />,
      onClick: ({ sendMessage }) => {
        sendMessage({
          parts: [
            {
              text: 'Add logs to the code snippet for debugging',
              type: 'text'
            }
          ],
          role: 'user'
        })
      }
    }
  ]
})
