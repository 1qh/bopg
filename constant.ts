import type { IconNames } from '@svgr-iconkit/flag-icons'
import type { Node } from '@xyflow/react'

import { type } from 'arktype'

type SupportLang = typeof langSchema.infer

export const VISIBILITIES = ['private', 'public'] as const,
  langs = ['english', 'filipino', 'indonesian', 'japanese', 'malay', 'thai', 'vietnamese'] as const,
  langSchema = type.enumerated(...langs),
  lang2flag: Record<typeof langSchema.infer, IconNames> = {
    english: 'gb',
    filipino: 'ph',
    indonesian: 'id',
    japanese: 'jp',
    malay: 'my',
    thai: 'th',
    vietnamese: 'vn'
  } as const,
  transferToOperatorInstruction: Record<SupportLang, string> = {
    english:
      'This tool is used to transfer the current call to an operator for additional support. Use this tool when the user requests to speak with a support representative, needs to resolve complex issues, or when the automated system cannot meet the user’s requirements. The result is that the call will be connected to an available operator.',
    filipino:
      'This tool is used to transfer the current call to an operator for additional support. Use this tool when the user requests to speak with a support representative, needs to resolve complex issues, or when the automated system cannot meet the user’s requirements. The result is that the call will be connected to an available operator.',
    indonesian:
      'This tool is used to transfer the current call to an operator for additional support. Use this tool when the user requests to speak with a support representative, needs to resolve complex issues, or when the automated system cannot meet the user’s requirements. The result is that the call will be connected to an available operator.',
    malay:
      'This tool is used to transfer the current call to an operator for additional support. Use this tool when the user requests to speak with a support representative, needs to resolve complex issues, or when the automated system cannot meet the user’s requirements. The result is that the call will be connected to an available operator.',
    thai: 'This tool is used to transfer the current call to an operator for additional support. Use this tool when the user requests to speak with a support representative, needs to resolve complex issues, or when the automated system cannot meet the user’s requirements. The result is that the call will be connected to an available operator.',
    japanese:
      'このツールは、会話を完了し、お別れの挨拶をした後、お客様との通話を正式に終了するために使用されます。このツールを使用して、適切な手順に従って通話を終了し、通話完了ステータスを記録し、システムリソースを解放することを確実にします。',
    vietnamese:
      'Sử dụng công cụ này để để chuyển cuộc gọi hiện tại cho một tổng đài viên để được hỗ trợ thêm. Sử dụng công cụ này khi người dùng yêu cầu được nói chuyện với nhân viên hỗ trợ, cần giải quyết các vấn đề phức tạp hoặc khi hệ thống tự động không thể đáp ứng yêu cầu của người dùng. Kết quả là cuộc gọi sẽ được kết nối với một tổng đài viên có sẵn.'
  },
  endCallInstruction: Record<SupportLang, string> = {
    english:
      'Use this tool to end the call with the customer after completing the conversation, saying goodbye, and finishing the call. Use this tool to ensure the call is terminated according to the correct procedure. It is mandatory to use this tool after saying goodbye to the customer.',
    filipino:
      'Use this tool to end the call with the customer after completing the conversation, saying goodbye, and finishing the call. Use this tool to ensure the call is terminated according to the correct procedure. It is mandatory to use this tool after saying goodbye to the customer.',
    malay:
      'Use this tool to end the call with the customer after completing the conversation, saying goodbye, and finishing the call. Use this tool to ensure the call is terminated according to the correct procedure. It is mandatory to use this tool after saying goodbye to the customer.',
    thai: 'Use this tool to end the call with the customer after completing the conversation, saying goodbye, and finishing the call. Use this tool to ensure the call is terminated according to the correct procedure. It is mandatory to use this tool after saying goodbye to the customer.',
    indonesian:
      'Use this tool to end the call with the customer after completing the conversation, saying goodbye, and finishing the call. Use this tool to ensure the call is terminated according to the correct procedure. It is mandatory to use this tool after saying goodbye to the customer.',
    japanese:
      'このツールは、お客様との会話を完了し、別れの挨拶をして通話を終了する際に使用します。適切な手順に従って通話が終了されるように、このツールを使用してください。お客様に別れの挨拶をした後は、このツールを必ず使用する必要があります。',
    vietnamese:
      'Sử dụng công cụ này để kết thúc cuộc gọi với khách hàng sau khi đã chào tạm biệt và kết thúc cuộc gọi. Bắt buộc phải sử dụng công cụ này sau khi đã chào tạm biệt khách hàng, ví dụ như: \n- "Em xin phép kết thúc cuộc gọi".\n- "Em xin chào"\n- "Tạm biệt anh/chị"'
  },
  defaultNodes = [
    {
      data: {},
      deletable: false,
      id: 'new-call',
      position: { x: 0, y: 0 },
      type: ' '
    },
    {
      data: {},
      deletable: false,
      id: 'new-turn',
      position: { x: 0, y: 150 },
      type: ' '
    },
    {
      data: {},
      deletable: false,
      id: 'end-call',
      position: { x: 0, y: 300 },
      type: ' '
    }
  ] as Node[],
  kvSchema = type({
    key: 'string > 0',
    value: 'string > 0'
  }),
  phoneSchema = type({
    name: 'string > 0',
    phone: 'string.digits > 0'
  }),
  flowVariableSchema = type({
    masking: 'boolean',
    name: 'string > 0',
    sensitive: 'boolean',
    value: 'string > 0'
  }),
  transferSettingSchema = type({
    enable: 'boolean',
    instruction: 'string'
  }),
  knowledgeRetrievalSettingSchema = type({
    description: 'string',
    enable: 'boolean',
    ke: 'string'
  }),
  dataTypes = ['string', 'number', 'boolean'] as const,
  argSchema = type({
    dataType: type.enumerated(...dataTypes),
    name: 'string > 0'
  }),
  argMapSchema = type({
    description: 'string',
    name: 'string > 0',
    variable: 'string > 0'
  }),
  customToolSchema = type({
    inputArgMaps: argMapSchema.array(),
    inputArgs: argSchema.array(),
    instruction: 'string > 0',
    name: 'string > 0',
    outputArgMaps: argMapSchema.array(),
    outputArgs: argSchema.array(),
    python: 'string < 20000'
  }),
  dynamicVariableSchema = type({
    description: 'string',
    name: 'string > 0',
    value: 'string > 0'
  }),
  llmSettingsSchema = type({
    llm: 'string?',
    systemPrompt: 'string',
    temperature: '0 <= number <= 1'
  }),
  conversationSummarySchema = type({
    '...': llmSettingsSchema,
    enable: 'boolean',
    maxTokens: 'number >= 0'
  }),
  dataCollectionLlmItemSchema = type({
    '...': argSchema,
    instruction: 'string > 0'
  }),
  dataCollectionVariableItemSchema = type({
    '...': argSchema,
    variable: 'string?'
  }),
  interruptionMethods = ['immediate', 'end-of-sentence'] as const,
  interruptionSchema = type({
    enable: 'boolean',
    method: type.enumerated(...interruptionMethods),
    phrases: 'string[]',
    silence: 'number >= 0',
    llm: 'string?',
    systemPrompt: 'string'
  }),
  vietnameseDictionarySchema = type({
    isRegex: 'boolean',
    phrase: 'string > 0',
    pronunciation: 'string > 0'
  })

export type { SupportLang }
