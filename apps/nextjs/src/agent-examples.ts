import type { FlowEdge, FlowNode } from '~/flowui/workflow'

interface FlowData {
  edges: FlowEdge[]
  id: string
  nodes: FlowNode[]
}

const AGENT_EXAMPLES: FlowData[] = [
  {
    edges: [
      {
        data: {},
        id: 'article-to-summarize',
        source: 'articleInput',
        sourceHandle: 'result',
        target: 'summarizeLLM',
        targetHandle: 'prompt',
        type: 'status'
      },
      {
        data: {},
        id: 'summarySystemPrompt-to-summarize',
        source: 'summarySystemPrompt',
        sourceHandle: 'result',
        target: 'summarizeLLM',
        targetHandle: 'system',
        type: 'status'
      },
      {
        data: {},
        id: 'xy-edge__articleInputresult-93I9QA0fcq6Mqb_EP6wYxEFNnxyTEq05gZOjmUXDpL',
        source: 'articleInput',
        sourceHandle: 'result',
        target: '93I9QA0fcq6Mqb_EP6wYx',
        targetHandle: 'EFNnxyTEq05gZOjmUXDpL',
        type: 'status'
      },
      {
        data: {},
        id: 'xy-edge__summarizeLLMresult-93I9QA0fcq6Mqb_EP6wYxxaN2VhJWhv5Gi8VfZy31v',
        source: 'summarizeLLM',
        sourceHandle: 'result',
        target: '93I9QA0fcq6Mqb_EP6wYx',
        targetHandle: 'xaN2VhJWhv5Gi8VfZy31v',
        type: 'status'
      },
      {
        data: {},
        id: 'xy-edge__validationSystemPromptresult-validateLLMsystem',
        source: 'validationSystemPrompt',
        sourceHandle: 'result',
        target: 'validateLLM',
        targetHandle: 'system',
        type: 'status'
      },
      {
        data: {},
        id: 'xy-edge__93I9QA0fcq6Mqb_EP6wYxresult-validateLLMprompt',
        source: '93I9QA0fcq6Mqb_EP6wYx',
        sourceHandle: 'result',
        target: 'validateLLM',
        targetHandle: 'prompt',
        type: 'status'
      },
      {
        data: {},
        id: 'xy-edge__validateLLM77ew80gSbzRhvwhf3fnpa-Nr22stf-aM3K9KZ7fHREZprompt',
        source: 'validateLLM',
        sourceHandle: '77ew80gSbzRhvwhf3fnpa',
        target: 'Nr22stf-aM3K9KZ7fHREZ',
        targetHandle: 'prompt',
        type: 'status'
      },
      {
        data: {},
        id: 'xy-edge__97RH-yQMOC0ANhS2vFhcOresult-Nr22stf-aM3K9KZ7fHREZsystem',
        source: '97RH-yQMOC0ANhS2vFhcO',
        sourceHandle: 'result',
        target: 'Nr22stf-aM3K9KZ7fHREZ',
        targetHandle: 'system',
        type: 'status'
      },
      {
        data: {},
        id: 'xy-edge__Nr22stf-aM3K9KZ7fHREZresult-PqH1msuO-XKcAzeKmY72Yinput',
        source: 'Nr22stf-aM3K9KZ7fHREZ',
        sourceHandle: 'result',
        target: 'PqH1msuO-XKcAzeKmY72Y',
        targetHandle: 'input',
        type: 'status'
      },
      {
        data: {},
        id: 'xy-edge__validateLLMIKir5iiq4F3eurd1ApK---lo9ImZY7ZBHw2xTEhj2X_input',
        source: 'validateLLM',
        sourceHandle: 'IKir5iiq4F3eurd1ApK--',
        target: 'lo9ImZY7ZBHw2xTEhj2X_',
        targetHandle: 'input',
        type: 'status'
      }
    ],
    id: 'news-summarization',
    nodes: [
      {
        data: {
          config: {
            value:
              'AI Agents and Digital Identity Verification\n\nIn a surprising move, Sam Altman\'s World, formerly known as Worldcoin, is exploring linking AI agents to digital identities. This initiative could significantly alter how AI agents operate online by providing a "proof of human" verification, ensuring that these agents act on behalf of verified individuals. This development comes as platforms increasingly integrate with OpenAI\'s agents, suggesting a future where AI interactions online could be more secure and personalized'
          }
        },
        height: 477,
        id: 'articleInput',
        position: {
          x: -492,
          y: -146
        },
        type: 'text-input',
        width: 300
      },
      {
        data: {
          config: {
            value: 'You take in as input a news article and summarize it into a very short paragraph.\n'
          }
        },
        height: 200,
        id: 'summarySystemPrompt',
        position: {
          x: -489,
          y: -376
        },
        type: 'text-input',
        width: 302
      },
      {
        data: {
          config: {
            model: 'llama-3.1-8b-instant'
          },
          dynamicHandles: {
            tools: []
          }
        },
        id: 'summarizeLLM',
        position: {
          x: -162,
          y: -158
        },
        type: 'generate-text'
      },
      {
        data: {
          config: {
            value:
              "You will receive an original article and a summarized version of the article. Your task is to compare the summarized version to the original to see if it contains all the main information, and if it's clear and well-written.\nIf the summary is not valid, you should return the failResponse tool. If the summary is valid, you should return the summary as the validResponse tool. You should ALWAYS! return the summary to either the valid or fail response"
          }
        },
        height: 348,
        id: 'validationSystemPrompt',
        position: {
          x: 752,
          y: -241
        },
        type: 'text-input',
        width: 329
      },
      {
        data: {
          config: {
            model: 'llama-3.3-70b-versatile'
          },
          dynamicHandles: {
            tools: [
              {
                description: 'Use this if the summary is not valid',
                id: 'IKir5iiq4F3eurd1ApK--',
                name: 'failResponse'
              },
              {
                description: 'Use this if the article summary is valid',
                id: '77ew80gSbzRhvwhf3fnpa',
                name: 'validResponse'
              }
            ]
          }
        },
        id: 'validateLLM',
        position: {
          x: 1108,
          y: -243
        },
        type: 'generate-text'
      },
      {
        data: {
          config: {
            template:
              '<original-article>\n  {{original-article}}\n<original-article>\n<summarized-article>\n  {{summarized-article}}\n<summarized-article>'
          },
          dynamicHandles: {
            'template-tags': [
              {
                id: 'xaN2VhJWhv5Gi8VfZy31v',
                name: 'summarized-article'
              },
              {
                id: 'EFNnxyTEq05gZOjmUXDpL',
                name: 'original-article'
              }
            ]
          }
        },
        id: '93I9QA0fcq6Mqb_EP6wYx',
        position: {
          x: 227,
          y: -279
        },
        type: 'prompt-crafter'
      },
      {
        data: {
          config: {
            model: 'llama-3.1-8b-instant'
          },
          dynamicHandles: {
            tools: []
          }
        },
        id: 'Nr22stf-aM3K9KZ7fHREZ',
        position: {
          x: 2015,
          y: 151
        },
        type: 'generate-text'
      },
      {
        data: {
          config: {
            value: 'You will receive a summary of an article and you are to generate a post for:\n\n- Instagram\n- Twitter'
          }
        },
        height: 219,
        id: '97RH-yQMOC0ANhS2vFhcO',
        position: {
          x: 1655,
          y: 164
        },
        type: 'text-input',
        width: 334
      },
      {
        data: {},
        height: 636,
        id: 'PqH1msuO-XKcAzeKmY72Y',
        position: {
          x: 2423,
          y: -362
        },
        type: 'visualize-text',
        width: 375
      },
      {
        data: {},
        height: 262,
        id: 'lo9ImZY7ZBHw2xTEhj2X_',
        position: {
          x: 1660,
          y: -501
        },
        type: 'visualize-text',
        width: 313
      }
    ]
  },
  {
    edges: [
      {
        data: {},
        id: 'xy-edge__validationSystemPromptresult-validateLLMsystem',
        source: 'validationSystemPrompt',
        sourceHandle: 'result',
        target: 'validateLLM',
        targetHandle: 'system',
        type: 'status'
      },
      {
        data: {},
        id: 'xy-edge__validateLLM77ew80gSbzRhvwhf3fnpa-Nr22stf-aM3K9KZ7fHREZprompt',
        source: 'validateLLM',
        sourceHandle: '77ew80gSbzRhvwhf3fnpa',
        target: 'Nr22stf-aM3K9KZ7fHREZ',
        targetHandle: 'prompt',
        type: 'status'
      },
      {
        data: {},
        id: 'xy-edge__97RH-yQMOC0ANhS2vFhcOresult-Nr22stf-aM3K9KZ7fHREZsystem',
        source: '97RH-yQMOC0ANhS2vFhcO',
        sourceHandle: 'result',
        target: 'Nr22stf-aM3K9KZ7fHREZ',
        targetHandle: 'system',
        type: 'status'
      },
      {
        data: {},
        id: 'xy-edge__validateLLMIKir5iiq4F3eurd1ApK---lo9ImZY7ZBHw2xTEhj2X_input',
        source: 'validateLLM',
        sourceHandle: 'IKir5iiq4F3eurd1ApK--',
        target: 'lo9ImZY7ZBHw2xTEhj2X_',
        targetHandle: 'input',
        type: 'status'
      },
      {
        data: {},
        id: 'xy-edge__validateLLM77ew80gSbzRhvwhf3fnpa-eYRTRKwrUcn_fmuMKuUElinput',
        source: 'validateLLM',
        sourceHandle: '77ew80gSbzRhvwhf3fnpa',
        target: 'eYRTRKwrUcn_fmuMKuUEl',
        targetHandle: 'input',
        type: 'status'
      },
      {
        data: {},
        id: 'xy-edge__validateLLMIKir5iiq4F3eurd1ApK---ZnL2SgGAMwaZSLNH-bOX3prompt',
        source: 'validateLLM',
        sourceHandle: 'IKir5iiq4F3eurd1ApK--',
        target: 'ZnL2SgGAMwaZSLNH-bOX3',
        targetHandle: 'prompt',
        type: 'status'
      },
      {
        data: {},
        id: 'xy-edge__3nEzzfbTIDDXw3WSEq4FRresult-ZnL2SgGAMwaZSLNH-bOX3system',
        source: '3nEzzfbTIDDXw3WSEq4FR',
        sourceHandle: 'result',
        target: 'ZnL2SgGAMwaZSLNH-bOX3',
        targetHandle: 'system',
        type: 'status'
      },
      {
        data: {},
        id: 'xy-edge__validateLLMKb5hnlAPXL-4YM7FyfvLX-lu-X2l3QTJj8RBk4fDwGLprompt',
        source: 'validateLLM',
        sourceHandle: 'Kb5hnlAPXL-4YM7FyfvLX',
        target: 'lu-X2l3QTJj8RBk4fDwGL',
        targetHandle: 'prompt',
        type: 'status'
      },
      {
        data: {},
        id: 'xy-edge___4RcYkPOEDKn-hmGOAvy9result-lu-X2l3QTJj8RBk4fDwGLsystem',
        source: '_4RcYkPOEDKn-hmGOAvy9',
        sourceHandle: 'result',
        target: 'lu-X2l3QTJj8RBk4fDwGL',
        targetHandle: 'system',
        type: 'status'
      },
      {
        data: {},
        id: 'xy-edge__validateLLMKb5hnlAPXL-4YM7FyfvLX-gPDWeyLIVbkoWEffGe9Xhinput',
        source: 'validateLLM',
        sourceHandle: 'Kb5hnlAPXL-4YM7FyfvLX',
        target: 'gPDWeyLIVbkoWEffGe9Xh',
        targetHandle: 'input',
        type: 'status'
      },
      {
        data: {},
        id: 'xy-edge__ZnL2SgGAMwaZSLNH-bOX3result-kaTYJV52ljshMg0uClQl1input',
        source: 'ZnL2SgGAMwaZSLNH-bOX3',
        sourceHandle: 'result',
        target: 'kaTYJV52ljshMg0uClQl1',
        targetHandle: 'input',
        type: 'status'
      },
      {
        data: {},
        id: 'xy-edge__Nr22stf-aM3K9KZ7fHREZresult-s5NSuCUuEByh_BTCSSMDUinput',
        source: 'Nr22stf-aM3K9KZ7fHREZ',
        sourceHandle: 'result',
        target: 's5NSuCUuEByh_BTCSSMDU',
        targetHandle: 'input',
        type: 'status'
      },
      {
        data: {},
        id: 'xy-edge__lu-X2l3QTJj8RBk4fDwGLresult-9cLCaECGGL5t21iQ3TDc9input',
        source: 'lu-X2l3QTJj8RBk4fDwGL',
        sourceHandle: 'result',
        target: '9cLCaECGGL5t21iQ3TDc9',
        targetHandle: 'input',
        type: 'status'
      },
      {
        data: {},
        id: 'xy-edge__VGFbBVUjlwdQ2cGhrCv72result-validateLLMprompt',
        source: 'VGFbBVUjlwdQ2cGhrCv72',
        sourceHandle: 'result',
        target: 'validateLLM',
        targetHandle: 'prompt',
        type: 'status'
      }
    ],
    id: 'content-creator',
    nodes: [
      {
        data: {
          config: {
            value:
              'You will receive a request by the user and your task is to route it to the appropiate expert.\n\nYou will ALWAYS route the ORIGINAL request to one assistant only\n\nRoute the original request without modifying any of its text\n\n- Use the blog-expert if the task is about writing blogs, or related\n\n- Use the short-form-expert if the task is about creating short form content for social media\n\n- Use the seo-web-expert if the task if about SEO optimization'
          }
        },
        height: 340,
        id: 'validationSystemPrompt',
        position: {
          x: -630,
          y: -272
        },
        type: 'text-input',
        width: 382
      },
      {
        data: {
          config: {
            model: 'llama-3.3-70b-versatile'
          },
          dynamicHandles: {
            tools: [
              {
                description: 'Route the input here if the request is about creating blog content',
                id: 'IKir5iiq4F3eurd1ApK--',
                name: 'blog-expert'
              },
              {
                description: 'Route the input here if the request is about creating short form content',
                id: '77ew80gSbzRhvwhf3fnpa',
                name: 'short-form-expert'
              },
              {
                description: 'Route the input here if the request is to optimize content for SEO',
                id: 'Kb5hnlAPXL-4YM7FyfvLX',
                name: 'seo-web-expert'
              }
            ]
          }
        },
        id: 'validateLLM',
        position: {
          x: -216,
          y: -90
        },
        type: 'generate-text'
      },
      {
        data: {
          config: {
            model: 'llama-3.1-8b-instant'
          },
          dynamicHandles: {
            tools: []
          }
        },
        id: 'Nr22stf-aM3K9KZ7fHREZ',
        position: {
          x: 1131,
          y: -8
        },
        type: 'generate-text'
      },
      {
        data: {
          config: {
            value:
              'You are an expert in creating short form content. Your task is to generate creative and well structured short content posts for instagram, twitter and others'
          }
        },
        height: 270,
        id: '97RH-yQMOC0ANhS2vFhcO',
        position: {
          x: 755,
          y: -21
        },
        type: 'text-input',
        width: 334
      },
      {
        data: {},
        height: 291,
        id: 'lo9ImZY7ZBHw2xTEhj2X_',
        position: {
          x: 184,
          y: -363
        },
        type: 'visualize-text',
        width: 361
      },
      {
        data: {},
        height: 300,
        id: 'eYRTRKwrUcn_fmuMKuUEl',
        position: {
          x: 186,
          y: -10
        },
        type: 'visualize-text',
        width: 350
      },
      {
        data: {
          config: {
            model: 'llama-3.1-8b-instant'
          },
          dynamicHandles: {
            tools: []
          }
        },
        id: 'ZnL2SgGAMwaZSLNH-bOX3',
        position: {
          x: 1137,
          y: -360
        },
        type: 'generate-text'
      },
      {
        data: {
          config: {
            value:
              'You are an expert in writing blogs. Your task is to generate creative and well structured blogs, using appropiate sections and subsections'
          }
        },
        height: 300,
        id: '3nEzzfbTIDDXw3WSEq4FR',
        position: {
          x: 754,
          y: -390
        },
        type: 'text-input',
        width: 326
      },
      {
        data: {
          config: {
            model: 'llama-3.1-8b-instant'
          },
          dynamicHandles: {
            tools: []
          }
        },
        id: 'lu-X2l3QTJj8RBk4fDwGL',
        position: {
          x: 1118,
          y: 355
        },
        type: 'generate-text'
      },
      {
        data: {
          config: {
            value:
              'You are an expert in Search Engine Optimization SEO. Your task is to analyze content and provide suggestions on what keywords could be better in order to improve SEO'
          }
        },
        height: 300,
        id: '_4RcYkPOEDKn-hmGOAvy9',
        position: {
          x: 752,
          y: 333
        },
        type: 'text-input',
        width: 332
      },
      {
        data: {},
        height: 300,
        id: 'gPDWeyLIVbkoWEffGe9Xh',
        position: {
          x: 184,
          y: 335
        },
        type: 'visualize-text',
        width: 350
      },
      {
        data: {},
        height: 300,
        id: 'kaTYJV52ljshMg0uClQl1',
        position: {
          x: 1534,
          y: -403
        },
        type: 'visualize-text',
        width: 350
      },
      {
        data: {},
        height: 300,
        id: 's5NSuCUuEByh_BTCSSMDU',
        position: {
          x: 1531,
          y: -41
        },
        type: 'visualize-text',
        width: 350
      },
      {
        data: {},
        height: 300,
        id: '9cLCaECGGL5t21iQ3TDc9',
        position: {
          x: 1532,
          y: 309
        },
        type: 'visualize-text',
        width: 350
      },
      {
        data: {
          config: {
            value: 'I want to create a twitter post for launching my new website simple-ai.dev'
          }
        },
        height: 300,
        id: 'VGFbBVUjlwdQ2cGhrCv72',
        position: {
          x: -621,
          y: 147
        },
        type: 'text-input',
        width: 350
      }
    ]
  },
  {
    edges: [
      {
        data: {},
        id: 'xy-edge___4RcYkPOEDKn-hmGOAvy9result-lu-X2l3QTJj8RBk4fDwGLsystem',
        source: '_4RcYkPOEDKn-hmGOAvy9',
        sourceHandle: 'result',
        target: 'lu-X2l3QTJj8RBk4fDwGL',
        targetHandle: 'system',
        type: 'status'
      },
      {
        data: {},
        id: 'xy-edge__ZnL2SgGAMwaZSLNH-bOX3result-kaTYJV52ljshMg0uClQl1input',
        source: 'ZnL2SgGAMwaZSLNH-bOX3',
        sourceHandle: 'result',
        target: 'kaTYJV52ljshMg0uClQl1',
        targetHandle: 'input',
        type: 'status'
      },
      {
        data: {},
        id: 'xy-edge__Nr22stf-aM3K9KZ7fHREZresult-s5NSuCUuEByh_BTCSSMDUinput',
        source: 'Nr22stf-aM3K9KZ7fHREZ',
        sourceHandle: 'result',
        target: 's5NSuCUuEByh_BTCSSMDU',
        targetHandle: 'input',
        type: 'status'
      },
      {
        data: {},
        id: 'xy-edge__lu-X2l3QTJj8RBk4fDwGLresult-9cLCaECGGL5t21iQ3TDc9input',
        source: 'lu-X2l3QTJj8RBk4fDwGL',
        sourceHandle: 'result',
        target: '9cLCaECGGL5t21iQ3TDc9',
        targetHandle: 'input',
        type: 'status'
      },
      {
        data: {},
        id: 'xy-edge__VGFbBVUjlwdQ2cGhrCv72result-validateLLMprompt',
        selected: false,
        source: 'VGFbBVUjlwdQ2cGhrCv72',
        sourceHandle: 'result',
        target: 'validateLLM',
        targetHandle: 'prompt',
        type: 'status'
      },
      {
        data: {},
        id: 'xy-edge__mcXEqjj4TY8HBof7E6pdlresult-ZnL2SgGAMwaZSLNH-bOX3system',
        source: 'mcXEqjj4TY8HBof7E6pdl',
        sourceHandle: 'result',
        target: 'ZnL2SgGAMwaZSLNH-bOX3',
        targetHandle: 'system',
        type: 'status'
      },
      {
        data: {},
        id: 'xy-edge__FpL4edqHCqaXqhGrD2xEJresult-validateLLMsystem',
        source: 'FpL4edqHCqaXqhGrD2xEJ',
        sourceHandle: 'result',
        target: 'validateLLM',
        targetHandle: 'system',
        type: 'status'
      },
      {
        data: {},
        id: 'xy-edge__eVfOwR2k_3HG4sBFeFZcgresult-Nr22stf-aM3K9KZ7fHREZsystem',
        source: 'eVfOwR2k_3HG4sBFeFZcg',
        sourceHandle: 'result',
        target: 'Nr22stf-aM3K9KZ7fHREZ',
        targetHandle: 'system',
        type: 'status'
      },
      {
        data: {},
        id: 'xy-edge__validateLLMresult-eYRTRKwrUcn_fmuMKuUElinput',
        source: 'validateLLM',
        sourceHandle: 'result',
        target: 'eYRTRKwrUcn_fmuMKuUEl',
        targetHandle: 'input',
        type: 'status'
      },
      {
        data: {},
        id: 'xy-edge__VGFbBVUjlwdQ2cGhrCv72result-ZnL2SgGAMwaZSLNH-bOX3prompt',
        source: 'VGFbBVUjlwdQ2cGhrCv72',
        sourceHandle: 'result',
        target: 'ZnL2SgGAMwaZSLNH-bOX3',
        targetHandle: 'prompt',
        type: 'status'
      },
      {
        data: {},
        id: 'xy-edge__VGFbBVUjlwdQ2cGhrCv72result-Nr22stf-aM3K9KZ7fHREZprompt',
        source: 'VGFbBVUjlwdQ2cGhrCv72',
        sourceHandle: 'result',
        target: 'Nr22stf-aM3K9KZ7fHREZ',
        targetHandle: 'prompt',
        type: 'status'
      },
      {
        data: {},
        id: 'xy-edge__validateLLMresult-7-uZXwIU-n7fEMCoLZsMtGDFxwCjnyoesYWdUKZtGq',
        source: 'validateLLM',
        sourceHandle: 'result',
        target: '7-uZXwIU-n7fEMCoLZsMt',
        targetHandle: 'GDFxwCjnyoesYWdUKZtGq',
        type: 'status'
      },
      {
        data: {},
        id: 'xy-edge__ZnL2SgGAMwaZSLNH-bOX3result-7-uZXwIU-n7fEMCoLZsMtllV7g536-dmly98vvpFak',
        source: 'ZnL2SgGAMwaZSLNH-bOX3',
        sourceHandle: 'result',
        target: '7-uZXwIU-n7fEMCoLZsMt',
        targetHandle: 'llV7g536-dmly98vvpFak',
        type: 'status'
      },
      {
        data: {},
        id: 'xy-edge__Nr22stf-aM3K9KZ7fHREZresult-7-uZXwIU-n7fEMCoLZsMtZla3PfCwXBMnW32gB_MiF',
        source: 'Nr22stf-aM3K9KZ7fHREZ',
        sourceHandle: 'result',
        target: '7-uZXwIU-n7fEMCoLZsMt',
        targetHandle: 'Zla3PfCwXBMnW32gB_MiF',
        type: 'status'
      },
      {
        data: {},
        id: 'xy-edge__7-uZXwIU-n7fEMCoLZsMtresult-lu-X2l3QTJj8RBk4fDwGLprompt',
        source: '7-uZXwIU-n7fEMCoLZsMt',
        sourceHandle: 'result',
        target: 'lu-X2l3QTJj8RBk4fDwGL',
        targetHandle: 'prompt',
        type: 'status'
      }
    ],
    id: 'exam-generator',
    nodes: [
      {
        data: {
          config: {
            model: 'llama-3.1-8b-instant'
          },
          dynamicHandles: {
            tools: []
          }
        },
        id: 'validateLLM',
        position: {
          x: 251,
          y: -157
        },
        type: 'generate-text'
      },
      {
        data: {
          config: {
            model: 'llama-3.1-8b-instant'
          },
          dynamicHandles: {
            tools: []
          }
        },
        id: 'Nr22stf-aM3K9KZ7fHREZ',
        position: {
          x: 245,
          y: 489
        },
        type: 'generate-text'
      },
      {
        data: {},
        height: 300,
        id: 'eYRTRKwrUcn_fmuMKuUEl',
        position: {
          x: 648,
          y: -252
        },
        type: 'visualize-text',
        width: 379
      },
      {
        data: {
          config: {
            model: 'llama-3.1-8b-instant'
          },
          dynamicHandles: {
            tools: []
          }
        },
        id: 'ZnL2SgGAMwaZSLNH-bOX3',
        position: {
          x: 241,
          y: 158
        },
        type: 'generate-text'
      },
      {
        data: {
          config: {
            model: 'llama-3.1-8b-instant'
          },
          dynamicHandles: {
            tools: []
          }
        },
        id: 'lu-X2l3QTJj8RBk4fDwGL',
        position: {
          x: 1687,
          y: 418
        },
        type: 'generate-text'
      },
      {
        data: {
          config: {
            value:
              '<assistant_info>\n    You are an expert in combining and organizing educational content.  \n    Your task is to combine the outputs from three different agents to create a cohesive exam paper.  \n\n    You will receive:  \n    - A set of multiple-choice questions.  \n    - A set of open-answer questions.  \n    - A set of essay prompts.  \n\n    Your task is to:  \n    - Compile these into a single, well-structured exam paper.  \n    - Organize the paper with the following structure:  \n      1. Multiple-choice questions.  \n      2. Short-answer questions.  \n      3. Essay prompts.  \n    - Ensure the content flows logically, using clear section headers.  \n\n    Output should:  \n    - Be formatted for readability.  \n    - Include proper numbering for each question.  \n</assistant_info>\n'
          }
        },
        height: 417,
        id: '_4RcYkPOEDKn-hmGOAvy9',
        position: {
          x: 1250,
          y: -224
        },
        type: 'text-input',
        width: 350
      },
      {
        data: {},
        height: 300,
        id: 'kaTYJV52ljshMg0uClQl1',
        position: {
          x: 649,
          y: 107
        },
        type: 'visualize-text',
        width: 377
      },
      {
        data: {},
        height: 300,
        id: 's5NSuCUuEByh_BTCSSMDU',
        position: {
          x: 646,
          y: 456
        },
        type: 'visualize-text',
        width: 377
      },
      {
        data: {},
        height: 614,
        id: '9cLCaECGGL5t21iQ3TDc9',
        position: {
          x: 1695,
          y: -234
        },
        type: 'visualize-text',
        width: 518
      },
      {
        data: {
          config: {
            value: 'I want to create a exam on React Flow programming'
          }
        },
        height: 300,
        id: 'VGFbBVUjlwdQ2cGhrCv72',
        position: {
          x: -722,
          y: 62
        },
        type: 'text-input',
        width: 350
      },
      {
        data: {
          config: {
            value:
              "<assistant_info>\n    You are an expert in creating multiple-choice questions for educational purposes. \n    Your task is to create multiple-choice questions on the given topic. Each question should:\n    - Be clear and concise.\n    - Include a single correct answer and three plausible distractors (incorrect answers).\n    - Test the student's understanding of key concepts from the topic.\n\n    The output should:\n    - Contain the question, four answer options, and the correct answer.\n    - Ensure distractors are not obviously incorrect but based on common misconceptions or related ideas.\n   - ALWAYS Only output 2 questions\n</assistant_info>\n<examples>\n    Example 1:  \n    Question: What is the primary cause of climate change?  \n    Options:  \n    A. Solar flares  \n    B. Volcanic eruptions  \n    C. Greenhouse gas emissions  \n    D. Changes in Earth's orbit  \n    Correct Answer: C  \n\n    Example 2:  \n    Question: Which of the following gases is considered a greenhouse gas?  \n    Options:  \n    A. Oxygen  \n    B. Nitrogen  \n    C. Carbon dioxide  \n    D. Argon  \n    Correct Answer: C  \n</examples>\n\n"
          }
        },
        height: 300,
        id: 'FpL4edqHCqaXqhGrD2xEJ',
        position: {
          x: -157,
          y: -200
        },
        type: 'text-input',
        width: 350
      },
      {
        data: {
          config: {
            value:
              "<assistant_info>\n    You are an expert in creating short-answer questions for educational purposes.  \n    Your task is to create short-answer questions that:  \n    - Require students to demonstrate understanding of the topic in 1-3 sentences.  \n    - Are open-ended but specific enough to test key concepts.  \n\n    The output should:  \n    - Include the question as a standalone sentence or prompt.  \n    - Provide a sample ideal answer for reference.  \n  - ALWAYS Only output 2 questions\n</assistant_info>\n<example>\n    Example 1:  \n    Question: Explain how greenhouse gases contribute to global warming.  \n    Sample Answer: Greenhouse gases trap heat in the Earth's atmosphere, preventing it from escaping into space. This leads to an increase in global temperatures over time.  \n\n    Example 2:  \n    Question: What is the significance of the Paris Agreement in addressing climate change?  \n    Sample Answer: The Paris Agreement is a global treaty that aims to limit global warming to below 2 degrees Celsius compared to pre-industrial levels by reducing greenhouse gas emissions.  \n</example>\n"
          }
        },
        height: 300,
        id: 'mcXEqjj4TY8HBof7E6pdl',
        position: {
          x: -159,
          y: 122
        },
        type: 'text-input',
        width: 350
      },
      {
        data: {
          config: {
            value:
              '<assistant_info>\n   You are an expert in creating essay prompts for educational purposes.  \n    Your task is to create essay prompts that:  \n    - Encourage critical thinking and analysis of the topic.  \n    - Allow students to explore different perspectives or arguments.  \n    - Require detailed explanations or evidence-based reasoning.  \n\n    The output should:  \n    - Include a clearly worded essay question or statement.  \n    - Optionally provide guidance on how to approach the essay.  \n  - ALWAYS Only output 1 essay prompt\n</assistant_info>\n<example>\n    Example 1:  \n    Prompt: Discuss the social, economic, and environmental impacts of climate change. How can governments and individuals work together to address these challenges?  \n    Guidance: In your essay, provide examples of specific impacts, such as rising sea levels or economic costs. Discuss at least one solution involving government policies and one involving individual actions.  \n\n    Example 2:  \n    Prompt: Analyze the role of renewable energy in mitigating climate change. What are the challenges and benefits of transitioning to renewable energy sources?  \n    Guidance: Consider different types of renewable energy, such as solar and wind, and evaluate their feasibility in various regions. Address both technological and economic factors.  \n</example>\n\n'
          }
        },
        height: 300,
        id: 'eVfOwR2k_3HG4sBFeFZcg',
        position: {
          x: -160,
          y: 461
        },
        type: 'text-input',
        width: 350
      },
      {
        data: {
          config: {
            template:
              '<multiple-choice-content>\n  {{multiple-choice-content}}\n</multiple-choice-content>\n  {{open-answer-questions-content}}\n<open-questions-content>\n</open-questions-content>\n<essay-content>\n  {{essay-content}}\n</essay-content>'
          },
          dynamicHandles: {
            'template-tags': [
              {
                id: 'GDFxwCjnyoesYWdUKZtGq',
                name: 'multiple-choice-content'
              },
              {
                id: 'llV7g536-dmly98vvpFak',
                name: 'open-answer-questions-content'
              },
              {
                id: 'Zla3PfCwXBMnW32gB_MiF',
                name: 'essay-content'
              }
            ]
          }
        },
        id: '7-uZXwIU-n7fEMCoLZsMt',
        position: {
          x: 1251,
          y: 232
        },
        type: 'prompt-crafter'
      }
    ]
  },
  {
    edges: [
      {
        data: {},
        id: 'xy-edge__validationSystemPromptresult-validateLLMsystem',
        source: 'validationSystemPrompt',
        sourceHandle: 'result',
        target: 'validateLLM',
        targetHandle: 'system',
        type: 'status'
      },
      {
        data: {},
        id: 'xy-edge__validateLLM77ew80gSbzRhvwhf3fnpa-Nr22stf-aM3K9KZ7fHREZprompt',
        source: 'validateLLM',
        sourceHandle: '77ew80gSbzRhvwhf3fnpa',
        target: 'Nr22stf-aM3K9KZ7fHREZ',
        targetHandle: 'prompt',
        type: 'status'
      },
      {
        data: {},
        id: 'xy-edge__97RH-yQMOC0ANhS2vFhcOresult-Nr22stf-aM3K9KZ7fHREZsystem',
        source: '97RH-yQMOC0ANhS2vFhcO',
        sourceHandle: 'result',
        target: 'Nr22stf-aM3K9KZ7fHREZ',
        targetHandle: 'system',
        type: 'status'
      },
      {
        data: {},
        id: 'xy-edge__validateLLMIKir5iiq4F3eurd1ApK---lo9ImZY7ZBHw2xTEhj2X_input',
        source: 'validateLLM',
        sourceHandle: 'IKir5iiq4F3eurd1ApK--',
        target: 'lo9ImZY7ZBHw2xTEhj2X_',
        targetHandle: 'input',
        type: 'status'
      },
      {
        data: {},
        id: 'xy-edge__validateLLM77ew80gSbzRhvwhf3fnpa-eYRTRKwrUcn_fmuMKuUElinput',
        source: 'validateLLM',
        sourceHandle: '77ew80gSbzRhvwhf3fnpa',
        target: 'eYRTRKwrUcn_fmuMKuUEl',
        targetHandle: 'input',
        type: 'status'
      },
      {
        data: {},
        id: 'xy-edge__validateLLMIKir5iiq4F3eurd1ApK---ZnL2SgGAMwaZSLNH-bOX3prompt',
        source: 'validateLLM',
        sourceHandle: 'IKir5iiq4F3eurd1ApK--',
        target: 'ZnL2SgGAMwaZSLNH-bOX3',
        targetHandle: 'prompt',
        type: 'status'
      },
      {
        data: {},
        id: 'xy-edge__3nEzzfbTIDDXw3WSEq4FRresult-ZnL2SgGAMwaZSLNH-bOX3system',
        source: '3nEzzfbTIDDXw3WSEq4FR',
        sourceHandle: 'result',
        target: 'ZnL2SgGAMwaZSLNH-bOX3',
        targetHandle: 'system',
        type: 'status'
      },
      {
        data: {},
        id: 'xy-edge__validateLLMKb5hnlAPXL-4YM7FyfvLX-lu-X2l3QTJj8RBk4fDwGLprompt',
        source: 'validateLLM',
        sourceHandle: 'Kb5hnlAPXL-4YM7FyfvLX',
        target: 'lu-X2l3QTJj8RBk4fDwGL',
        targetHandle: 'prompt',
        type: 'status'
      },
      {
        data: {},
        id: 'xy-edge___4RcYkPOEDKn-hmGOAvy9result-lu-X2l3QTJj8RBk4fDwGLsystem',
        source: '_4RcYkPOEDKn-hmGOAvy9',
        sourceHandle: 'result',
        target: 'lu-X2l3QTJj8RBk4fDwGL',
        targetHandle: 'system',
        type: 'status'
      },
      {
        data: {},
        id: 'xy-edge__validateLLMKb5hnlAPXL-4YM7FyfvLX-gPDWeyLIVbkoWEffGe9Xhinput',
        source: 'validateLLM',
        sourceHandle: 'Kb5hnlAPXL-4YM7FyfvLX',
        target: 'gPDWeyLIVbkoWEffGe9Xh',
        targetHandle: 'input',
        type: 'status'
      },
      {
        data: {},
        id: 'xy-edge__ZnL2SgGAMwaZSLNH-bOX3result-kaTYJV52ljshMg0uClQl1input',
        source: 'ZnL2SgGAMwaZSLNH-bOX3',
        sourceHandle: 'result',
        target: 'kaTYJV52ljshMg0uClQl1',
        targetHandle: 'input',
        type: 'status'
      },
      {
        data: {},
        id: 'xy-edge__Nr22stf-aM3K9KZ7fHREZresult-s5NSuCUuEByh_BTCSSMDUinput',
        source: 'Nr22stf-aM3K9KZ7fHREZ',
        sourceHandle: 'result',
        target: 's5NSuCUuEByh_BTCSSMDU',
        targetHandle: 'input',
        type: 'status'
      },
      {
        data: {},
        id: 'xy-edge__lu-X2l3QTJj8RBk4fDwGLresult-9cLCaECGGL5t21iQ3TDc9input',
        source: 'lu-X2l3QTJj8RBk4fDwGL',
        sourceHandle: 'result',
        target: '9cLCaECGGL5t21iQ3TDc9',
        targetHandle: 'input',
        type: 'status'
      },
      {
        data: {},
        id: 'xy-edge__VGFbBVUjlwdQ2cGhrCv72result-validateLLMprompt',
        source: 'VGFbBVUjlwdQ2cGhrCv72',
        sourceHandle: 'result',
        target: 'validateLLM',
        targetHandle: 'prompt',
        type: 'status'
      },
      {
        data: {},
        id: 'xy-edge__ZnL2SgGAMwaZSLNH-bOX3result-KPXhL1_uJAvT8pFOSkIcXFs0_XlZ_oyUIPr_rOyuJL',
        source: 'ZnL2SgGAMwaZSLNH-bOX3',
        sourceHandle: 'result',
        target: 'KPXhL1_uJAvT8pFOSkIcX',
        targetHandle: 'Fs0_XlZ_oyUIPr_rOyuJL',
        type: 'status'
      },
      {
        data: {},
        id: 'xy-edge__Nr22stf-aM3K9KZ7fHREZresult-KPXhL1_uJAvT8pFOSkIcXHo3D6D5JaZ8EIFotqC967',
        source: 'Nr22stf-aM3K9KZ7fHREZ',
        sourceHandle: 'result',
        target: 'KPXhL1_uJAvT8pFOSkIcX',
        targetHandle: 'Ho3D6D5JaZ8EIFotqC967',
        type: 'status'
      },
      {
        data: {},
        id: 'xy-edge__lu-X2l3QTJj8RBk4fDwGLresult-KPXhL1_uJAvT8pFOSkIcXLIDezYIoJrc7EerA0qp1q',
        source: 'lu-X2l3QTJj8RBk4fDwGL',
        sourceHandle: 'result',
        target: 'KPXhL1_uJAvT8pFOSkIcX',
        targetHandle: 'LIDezYIoJrc7EerA0qp1q',
        type: 'status'
      },
      {
        data: {},
        id: 'xy-edge__KPXhL1_uJAvT8pFOSkIcXresult-_75nHwdQuwAI4AThjvSGVprompt',
        source: 'KPXhL1_uJAvT8pFOSkIcX',
        sourceHandle: 'result',
        target: '_75nHwdQuwAI4AThjvSGV',
        targetHandle: 'prompt',
        type: 'status'
      },
      {
        data: {},
        id: 'xy-edge__kFmGxICZCpNbhbEvp6wMaresult-_75nHwdQuwAI4AThjvSGVsystem',
        source: 'kFmGxICZCpNbhbEvp6wMa',
        sourceHandle: 'result',
        target: '_75nHwdQuwAI4AThjvSGV',
        targetHandle: 'system',
        type: 'status'
      },
      {
        data: {},
        id: 'xy-edge___75nHwdQuwAI4AThjvSGVresult-GWo1bZd32Vul-hukJ64Ruinput',
        source: '_75nHwdQuwAI4AThjvSGV',
        sourceHandle: 'result',
        target: 'GWo1bZd32Vul-hukJ64Ru',
        targetHandle: 'input',
        type: 'status'
      }
    ],
    id: 'tasks-orchestrator',
    nodes: [
      {
        data: {
          config: {
            value:
              '<assistant_info>\n    You are a Product Manager. Your task is to delegate tasks clearly and effectively to your development team. Your team consists of:\n    - A Front-end Developer, specializing in client-side interfaces.\n    - A Back-end Developer, focusing on server-side logic.\n    - A Database Developer, responsible for data management and structure.\n\nWhen assigning tasks:\n- You can delegate to one, two, or all three developers at once.\n- Assign only one task per developer at a time to ensure clarity and focus.\n\nYour goal is to make each task description as clear as possible so that each developer understands exactly what is expected without ambiguity.\n</assistant_info>\n\n<example>\n    Example 1:  \n    Task for Front-end Developer: "Implement a new user modal for the configuration settings page."  \n\nExample 2:  \nTask for Back-end Developer: "Create an API endpoint to validate user inputs for configuration settings."  \n\nExample 3:  \nTask for Database Developer: "Modify the schema to support versioning of user configurations."  \n</example>'
          }
        },
        height: 340,
        id: 'validationSystemPrompt',
        position: {
          x: -739,
          y: -297
        },
        type: 'text-input',
        width: 382
      },
      {
        data: {
          config: {
            model: 'llama-3.3-70b-versatile'
          },
          dynamicHandles: {
            tools: [
              {
                description: 'Assign a task to this developer if we need to do something regarding frontend client side',
                id: 'IKir5iiq4F3eurd1ApK--',
                name: 'front-end-developer-expert'
              },
              {
                description: 'Assign a task to this developer if we need to do something regarding backend servers',
                id: '77ew80gSbzRhvwhf3fnpa',
                name: 'backend-developer-expert'
              },
              {
                description: 'Assign a task to this developer if we need to do something regarding database',
                id: 'Kb5hnlAPXL-4YM7FyfvLX',
                name: 'database-developer-expert'
              }
            ]
          }
        },
        id: 'validateLLM',
        position: {
          x: -321,
          y: -100
        },
        type: 'generate-text'
      },
      {
        data: {
          config: {
            model: 'llama-3.1-8b-instant'
          },
          dynamicHandles: {
            tools: []
          }
        },
        id: 'Nr22stf-aM3K9KZ7fHREZ',
        position: {
          x: 1019,
          y: -10
        },
        type: 'generate-text'
      },
      {
        data: {
          config: {
            value:
              '<assistant_info>\n    You are a Back-end Developer. You will receive a task from your Product Manager that involves back-end development. Your task will include:\n    - Designing and implementing server-side logic.\n    - Creating APIs or handling server requests.\n\nYour output should:\n- Be code snippets directly related to the task given.\n- Use server-side languages like Python, Node.js, Java, etc., as appropriate.\n</assistant_info>'
          }
        },
        height: 294,
        id: '97RH-yQMOC0ANhS2vFhcO',
        position: {
          x: 629,
          y: -38
        },
        type: 'text-input',
        width: 334
      },
      {
        data: {},
        height: 291,
        id: 'lo9ImZY7ZBHw2xTEhj2X_',
        position: {
          x: 67,
          y: -378
        },
        type: 'visualize-text',
        width: 361
      },
      {
        data: {},
        height: 300,
        id: 'eYRTRKwrUcn_fmuMKuUEl',
        position: {
          x: 77,
          y: -24
        },
        type: 'visualize-text',
        width: 350
      },
      {
        data: {
          config: {
            model: 'llama-3.1-8b-instant'
          },
          dynamicHandles: {
            tools: []
          }
        },
        id: 'ZnL2SgGAMwaZSLNH-bOX3',
        position: {
          x: 1010,
          y: -360
        },
        type: 'generate-text'
      },
      {
        data: {
          config: {
            value:
              '<assistant_info>\n    You are a Front-end Developer. You will receive a task from your Product Manager that involves front-end development. Your task will include:\n    - Creating or modifying user interfaces.\n    - Ensuring seamless interaction with back-end services.\n\nYour output should:\n- Be code snippets directly related to the task given.\n- Utilize HTML, CSS, and JavaScript/TypeScript as necessary.\n</assistant_info>'
          }
        },
        height: 300,
        id: '3nEzzfbTIDDXw3WSEq4FR',
        position: {
          x: 626,
          y: -394
        },
        type: 'text-input',
        width: 326
      },
      {
        data: {
          config: {
            model: 'llama-3.1-8b-instant'
          },
          dynamicHandles: {
            tools: []
          }
        },
        id: 'lu-X2l3QTJj8RBk4fDwGL',
        position: {
          x: 1029,
          y: 343
        },
        type: 'generate-text'
      },
      {
        data: {
          config: {
            value:
              '<assistant_info>\n    You are a Database Developer. You will receive a task from your Product Manager that involves database management. Your task will include:\n    - Designing or modifying database schemas.\n    - Writing queries to manipulate or retrieve data.\n\nYour output should:\n- Be SQL or relevant database query snippets directly related to the task given.\n</assistant_info>\n'
          }
        },
        height: 300,
        id: '_4RcYkPOEDKn-hmGOAvy9',
        position: {
          x: 631,
          y: 319
        },
        type: 'text-input',
        width: 350
      },
      {
        data: {},
        height: 300,
        id: 'gPDWeyLIVbkoWEffGe9Xh',
        position: {
          x: 72,
          y: 325
        },
        type: 'visualize-text',
        width: 350
      },
      {
        data: {},
        height: 300,
        id: 'kaTYJV52ljshMg0uClQl1',
        position: {
          x: 1426,
          y: -398
        },
        type: 'visualize-text',
        width: 350
      },
      {
        data: {},
        height: 300,
        id: 's5NSuCUuEByh_BTCSSMDU',
        position: {
          x: 1427,
          y: -44
        },
        type: 'visualize-text',
        width: 350
      },
      {
        data: {},
        height: 300,
        id: '9cLCaECGGL5t21iQ3TDc9',
        position: {
          x: 1423,
          y: 323
        },
        type: 'visualize-text',
        width: 350
      },
      {
        data: {
          config: {
            value:
              "We're adding a feature to let users save their favorite products. The Front-end needs to update the product list UI, the Back-end must handle the logic for saving favorites, and the Database needs to store these preferences."
          }
        },
        height: 300,
        id: 'VGFbBVUjlwdQ2cGhrCv72',
        position: {
          x: -707,
          y: 129
        },
        type: 'text-input',
        width: 350
      },
      {
        data: {
          config: {
            model: 'llama-3.1-8b-instant'
          },
          dynamicHandles: {
            tools: []
          }
        },
        id: '_75nHwdQuwAI4AThjvSGV',
        position: {
          x: 2395,
          y: 402
        },
        type: 'generate-text'
      },
      {
        data: {
          config: {
            template:
              'Here is the output from the developers\n<frontend>\n  {{frontend-result}}\n</frontend>\n<backend>\n  {{backend-result}}\n</backend>\n<database>\n  {{database-result}}\n</database>'
          },
          dynamicHandles: {
            'template-tags': [
              {
                id: 'Fs0_XlZ_oyUIPr_rOyuJL',
                name: 'frontend-result'
              },
              {
                id: 'Ho3D6D5JaZ8EIFotqC967',
                name: 'backend-result'
              },
              {
                id: 'LIDezYIoJrc7EerA0qp1q',
                name: 'database-result'
              }
            ]
          }
        },
        id: 'KPXhL1_uJAvT8pFOSkIcX',
        position: {
          x: 1988,
          y: -151
        },
        type: 'prompt-crafter'
      },
      {
        data: {
          config: {
            value:
              '<assistant_info>\n    You are a Senior Developer. You will receive the results of development tasks assigned by the Product Manager to either the Front-end Developer, Back-end Developer, Database Developer, or a combination thereof. You might receive:\n    - One task result from just one developer.\n    - Two task results from any two developers.\n    - Three task results from all developers.\n\nYour task is to:\n- Review the code snippets or database changes from each developer.\n- Integrate these into a cohesive codebase or system.\n\nYour output should:\n- Demonstrate how these different pieces fit together, enhancing or completing the functionality as per the initial task descriptions.\n</assistant_info>'
          }
        },
        height: 300,
        id: 'kFmGxICZCpNbhbEvp6wMa',
        position: {
          x: 1990,
          y: 306
        },
        type: 'text-input',
        width: 350
      },
      {
        data: {},
        height: 740,
        id: 'GWo1bZd32Vul-hukJ64Ru',
        position: {
          x: 2393,
          y: -364
        },
        type: 'visualize-text',
        width: 542
      }
    ]
  }
]
export type { FlowData }
export { AGENT_EXAMPLES }
